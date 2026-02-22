# AWS ライブ配信統合ガイド

このガイドでは、Next.jsアプリケーションとAWS MediaLive/MediaPackage/CloudFrontを統合し、OBSからのライブ配信を実現する手順を説明します。

## 📐 アーキテクチャ概要

```
OBS Studio
    ↓ RTMP
AWS MediaLive (エンコーディング)
    ↓ HLS
AWS MediaPackage (パッケージング・DRM)
    ↓ HLS
CloudFront (CDN配信・署名付きURL)
    ↓ HTTPS
Next.js アプリケーション (視聴者)
```

---

## 🔧 AWS MediaLive セットアップ

### 1. Input Security Group の作成

```bash
aws medialive create-input-security-group \
  --whitelist-rules Cidr=0.0.0.0/0 \
  --region ap-northeast-1
```

### 2. Input の作成（RTMP Push）

```bash
aws medialive create-input \
  --name "streaming-platform-rtmp-input" \
  --type RTMP_PUSH \
  --input-security-group "sg-xxxxxxxx" \
  --destinations '[{"StreamName":"live/stream1"}]' \
  --region ap-northeast-1
```

レスポンスから `InputId` と RTMP URL を記録します:
```json
{
  "Input": {
    "Id": "1234567",
    "Destinations": [
      {
        "Url": "rtmp://a.b.c.d:1935/live"
      }
    ]
  }
}
```

### 3. Channel の作成

#### encoder-settings.json
```json
{
  "VideoDescriptions": [
    {
      "Name": "video_1080p",
      "CodecSettings": {
        "H264Settings": {
          "Bitrate": 5000000,
          "FramerateControl": "SPECIFIED",
          "FramerateNumerator": 30,
          "FramerateDenominator": 1,
          "GopSize": 2,
          "GopSizeUnits": "SECONDS"
        }
      },
      "Height": 1080,
      "Width": 1920
    }
  ],
  "AudioDescriptions": [
    {
      "Name": "audio_aac",
      "CodecSettings": {
        "AacSettings": {
          "Bitrate": 128000,
          "SampleRate": 48000
        }
      }
    }
  ],
  "OutputGroups": [
    {
      "Name": "HLS",
      "OutputGroupSettings": {
        "HlsGroupSettings": {
          "Destination": {
            "DestinationRefId": "mediapackage_destination"
          },
          "SegmentLength": 6,
          "ManifestDurationFormat": "INTEGER"
        }
      },
      "Outputs": [
        {
          "OutputName": "1080p",
          "VideoDescriptionName": "video_1080p",
          "AudioDescriptionNames": ["audio_aac"],
          "OutputSettings": {
            "HlsOutputSettings": {
              "NameModifier": "_1080p",
              "HlsSettings": {
                "StandardHlsSettings": {
                  "M3u8Settings": {
                    "PcrControl": "PCR_EVERY_PES_PACKET"
                  }
                }
              }
            }
          }
        }
      ]
    }
  ]
}
```

#### チャンネル作成コマンド
```bash
aws medialive create-channel \
  --name "streaming-platform-channel" \
  --channel-class SINGLE_PIPELINE \
  --role-arn "arn:aws:iam::ACCOUNT_ID:role/MediaLiveAccessRole" \
  --input-attachments '[{"InputId":"1234567","InputAttachmentName":"rtmp-input"}]' \
  --destinations '[{"Id":"mediapackage_destination","MediaPackageSettings":[{"ChannelId":"streaming-platform"}]}]' \
  --encoder-settings file://encoder-settings.json \
  --region ap-northeast-1
```

### 4. チャンネルの起動

```bash
aws medialive start-channel \
  --channel-id 1234567 \
  --region ap-northeast-1
```

---

## 📦 AWS MediaPackage セットアップ

### 1. チャンネルの作成

```bash
aws mediapackage create-channel \
  --id streaming-platform \
  --description "Streaming Platform Live Channel" \
  --region ap-northeast-1
```

レスポンスから `IngestEndpoints` を記録します。

### 2. HLS エンドポイントの作成

```bash
aws mediapackage create-origin-endpoint \
  --id streaming-platform-hls \
  --channel-id streaming-platform \
  --manifest-name index \
  --time-delay-seconds 10 \
  --hls-package '{
    "IncludeIframeOnlyStream": false,
    "PlaylistType": "EVENT",
    "PlaylistWindowSeconds": 60,
    "ProgramDateTimeIntervalSeconds": 0,
    "SegmentDurationSeconds": 6,
    "UseAudioRenditionGroup": false
  }' \
  --region ap-northeast-1
```

レスポンスから `Url` を記録:
```
https://xxx.mediapackage.ap-northeast-1.amazonaws.com/out/v1/yyy/index.m3u8
```

---

## 🌐 CloudFront セットアップ

### 1. CloudFront ディストリビューション作成

#### distribution-config.json
```json
{
  "CallerReference": "streaming-platform-2024",
  "Comment": "Streaming Platform CDN",
  "Enabled": true,
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "mediapackage-origin",
        "DomainName": "xxx.mediapackage.ap-northeast-1.amazonaws.com",
        "CustomOriginConfig": {
          "HTTPPort": 80,
          "HTTPSPort": 443,
          "OriginProtocolPolicy": "https-only",
          "OriginSslProtocols": {
            "Quantity": 3,
            "Items": ["TLSv1", "TLSv1.1", "TLSv1.2"]
          }
        }
      }
    ]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "mediapackage-origin",
    "ViewerProtocolPolicy": "redirect-to-https",
    "AllowedMethods": {
      "Quantity": 2,
      "Items": ["GET", "HEAD"]
    },
    "ForwardedValues": {
      "QueryString": false,
      "Cookies": {
        "Forward": "none"
      }
    },
    "TrustedSigners": {
      "Enabled": true,
      "Quantity": 1,
      "Items": ["self"]
    },
    "MinTTL": 0,
    "DefaultTTL": 86400,
    "MaxTTL": 31536000
  },
  "PriceClass": "PriceClass_All",
  "ViewerCertificate": {
    "CloudFrontDefaultCertificate": true
  }
}
```

```bash
aws cloudfront create-distribution \
  --distribution-config file://distribution-config.json
```

### 2. CloudFront キーペアの作成

```bash
# プライベートキー生成
openssl genrsa -out cloudfront_private_key.pem 2048

# 公開キー生成
openssl rsa -pubout -in cloudfront_private_key.pem -out cloudfront_public_key.pem
```

AWS Console → CloudFront → Key management → Public keys でキーを登録し、Key Pair ID を取得します。

### 3. 環境変数に設定

```bash
# .env に追加
CLOUDFRONT_DOMAIN="d1234567890.cloudfront.net"
CLOUDFRONT_KEY_PAIR_ID="APKAXXXXXXXXXXXXXXXX"
CLOUDFRONT_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA...
-----END RSA PRIVATE KEY-----"
```

---

## 🎥 OBS Studio 設定

### 1. OBS のダウンロード

https://obsproject.com/ から最新版をダウンロード

### 2. 配信設定

1. OBS を起動
2. **Settings** → **Stream** を開く
3. 以下を設定:
   - **Service**: Custom
   - **Server**: `rtmp://[MediaLive-Input-URL]:1935/live`
   - **Stream Key**: `stream1`

### 3. 出力設定

**Settings** → **Output**:
- **Output Mode**: Advanced
- **Encoder**: x264
- **Rate Control**: CBR
- **Bitrate**: 5000 Kbps
- **Keyframe Interval**: 2 seconds

**Settings** → **Video**:
- **Base Resolution**: 1920x1080
- **Output Resolution**: 1920x1080
- **FPS**: 30

### 4. 配信開始

1. **Start Streaming** をクリック
2. MediaLive チャンネルが RUNNING 状態であることを確認
3. 数秒後に CloudFront 経由でストリームが視聴可能に

---

## 🔗 Next.js アプリケーションとの統合

### 1. イベントに配信URLを設定

```typescript
// データベース更新
await prisma.event.update({
  where: { id: eventId },
  data: {
    streamUrl: 'https://xxx.mediapackage.ap-northeast-1.amazonaws.com/out/v1/yyy/index.m3u8',
    cloudfrontUrl: 'https://d1234567890.cloudfront.net/out/v1/yyy/index.m3u8',
    mediaLiveId: '1234567',
    mediaPackageId: 'streaming-platform',
  },
})
```

### 2. 署名付きURL生成

アプリケーションの `/api/watch/stream-url` エンドポイントが自動的に署名付きURLを生成します:

```typescript
import { generateSignedUrl } from '@/lib/aws'

const signedUrl = generateSignedUrl(
  event.cloudfrontUrl,
  24 * 60 * 60 // 24時間有効
)
```

### 3. Video.js で再生

```typescript
<VideoPlayer
  src={signedUrl}
  poster={event.imageUrl}
/>
```

---

## 🧪 テスト

### 1. ローカルテスト

```bash
# FFmpeg で RTMP プッシュ
ffmpeg -re -i test.mp4 -c:v libx264 -c:a aac -f flv \
  rtmp://[MediaLive-Input-URL]:1935/live/stream1
```

### 2. ブラウザテスト

1. イベント詳細ページでチケットを購入
2. 購入完了後、視聴ページにアクセス
3. Video.js プレイヤーでストリームが再生されることを確認

### 3. CloudWatch でモニタリング

```bash
aws cloudwatch get-metric-statistics \
  --namespace AWS/MediaLive \
  --metric-name ActiveOutputs \
  --dimensions Name=ChannelId,Value=1234567 \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-01T01:00:00Z \
  --period 300 \
  --statistics Average
```

---

## 🔒 DRM 保護（オプション）

### MediaPackage SPEKE 統合

```bash
aws mediapackage create-origin-endpoint \
  --id streaming-platform-hls-drm \
  --channel-id streaming-platform \
  --hls-package '{
    "Encryption": {
      "SpekeKeyProvider": {
        "ResourceId": "streaming-platform",
        "RoleArn": "arn:aws:iam::ACCOUNT_ID:role/MediaPackageRole",
        "SystemIds": ["94CE86FB-07FF-4F43-ADB8-93D2FA968CA2"],
        "Url": "https://speke-server.example.com/v1/speke"
      }
    }
  }'
```

---

## 💰 コスト最適化

### MediaLive
- **SINGLE_PIPELINE**: 低コスト、冗長性なし
- **STANDARD**: 高コスト、自動フェイルオーバー

### MediaPackage
- **Just-in-Time パッケージング**: 視聴されたときのみ課金
- **Live-to-VOD**: アーカイブ配信時のコスト削減

### CloudFront
- **Price Class**: 必要な地域のみ選択
- **キャッシュ設定**: TTL を適切に設定

---

## 📝 トラブルシューティング

### OBS から接続できない
- MediaLive Input の状態を確認
- Security Group で RTMP ポート（1935）が開いているか確認

### ストリームが再生されない
- MediaLive チャンネルが RUNNING か確認
- MediaPackage エンドポイントが正常か確認
- CloudFront 署名付きURL が正しいか確認

### 遅延が大きい
- MediaPackage の `TimeDelaySeconds` を調整
- HLS セグメント長を短縮（6秒 → 2秒）

---

**最終更新**: 2026-02-22
