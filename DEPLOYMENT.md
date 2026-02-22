# デプロイメントガイド

## 📋 デプロイ前の準備

### 1. PostgreSQL データベースの準備

#### オプション A: Supabase（推奨）

1. [Supabase](https://supabase.com/) でアカウント作成
2. 新しいプロジェクトを作成
3. Settings → Database で接続文字列を取得
4. `.env` に `DATABASE_URL` を設定

```bash
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

#### オプション B: AWS RDS

1. AWS RDS で PostgreSQL インスタンスを作成
2. セキュリティグループで接続を許可
3. 接続文字列を `.env` に設定

### 2. Stripe の設定

1. [Stripe Dashboard](https://dashboard.stripe.com/) にログイン
2. Developers → API keys から以下を取得:
   - Publishable key
   - Secret key
3. Developers → Webhooks でエンドポイントを追加:
   - URL: `https://your-domain.com/api/stripe/webhook`
   - イベント: `checkout.session.completed`, `charge.refunded`
4. Webhook 署名シークレットを取得

### 3. AWS の設定

#### MediaLive & MediaPackage の設定

1. AWS Console で MediaLive チャンネルを作成
2. MediaPackage でエンドポイントを作成
3. CloudFront ディストリビューションを作成
4. IAM ユーザーで適切な権限を設定

#### CloudFront 署名付きURL用のキーペア作成

```bash
# プライベートキー生成
openssl genrsa -out private_key.pem 2048

# 公開キー生成
openssl rsa -pubout -in private_key.pem -out public_key.pem
```

5. AWS Console → CloudFront → Key pairs でキーペアを登録
6. Key Pair ID を取得

---

## 🚀 Vercel へのデプロイ

### 1. Vercel CLI のインストール

```bash
npm i -g vercel
```

### 2. プロジェクトの初期化

```bash
cd /home/user/webapp/nextjs-streaming-platform
vercel login
vercel
```

### 3. 環境変数の設定

Vercel Dashboard → Settings → Environment Variables で以下を設定:

#### Database
```
DATABASE_URL=postgresql://...
```

#### NextAuth.js
```
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-nextauth-secret-key-here
```

#### Stripe
```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

#### AWS
```
AWS_REGION=ap-northeast-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
```

#### CloudFront
```
CLOUDFRONT_DOMAIN=your-domain.cloudfront.net
CLOUDFRONT_KEY_PAIR_ID=your-key-pair-id
CLOUDFRONT_PRIVATE_KEY=-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----
```

#### JWT
```
JWT_SECRET=your-jwt-secret-for-access-tokens
```

### 4. データベースマイグレーション

```bash
# Prisma マイグレーション
npx prisma migrate deploy

# シードデータ投入（本番環境では不要）
npm run prisma:seed
```

### 5. 本番デプロイ

```bash
vercel --prod
```

---

## 🔧 AWS インフラ構築

### MediaLive チャンネル作成

```bash
# AWS CLI を使用
aws medialive create-input \
  --name "streaming-platform-input" \
  --type RTMP_PUSH \
  --input-security-group "sg-xxxxx"

aws medialive create-channel \
  --name "streaming-platform-channel" \
  --channel-class SINGLE_PIPELINE \
  --input-attachments file://input-attachments.json \
  --destinations file://destinations.json \
  --encoder-settings file://encoder-settings.json
```

### MediaPackage チャンネル作成

```bash
aws mediapackage create-channel \
  --id streaming-platform \
  --description "Streaming Platform Channel"

aws mediapackage create-origin-endpoint \
  --id streaming-platform-hls \
  --channel-id streaming-platform \
  --hls-package file://hls-package.json
```

### CloudFront ディストリビューション作成

```bash
aws cloudfront create-distribution \
  --distribution-config file://distribution-config.json
```

---

## 🎥 OBS 配信設定

### 1. OBS Studio の設定

1. OBS Studio をダウンロード・インストール
2. Settings → Stream で以下を設定:
   - Service: Custom
   - Server: `rtmp://[MediaLive-Input-URL]/live`
   - Stream Key: `[Your-Stream-Key]`

### 2. 配信設定の推奨値

- **Encoder**: x264
- **Bitrate**: 2500-5000 Kbps
- **Keyframe Interval**: 2 seconds
- **Resolution**: 1920x1080 (1080p)
- **FPS**: 30 or 60

### 3. 配信開始

1. OBS で「配信開始」をクリック
2. 管理画面でイベントステータスを `LIVE` に変更
3. ユーザーが視聴ページでライブ配信を視聴可能に

---

## 📊 モニタリング

### Vercel Analytics

- Vercel Dashboard → Analytics でアクセス状況を確認

### AWS CloudWatch

- MediaLive/MediaPackage のメトリクスを監視
- アラームを設定して異常を検知

### Stripe Dashboard

- 決済状況・売上をリアルタイムで確認

---

## 🔒 セキュリティ設定

### 1. HTTPS の強制

Vercel では自動的に HTTPS が有効になります。

### 2. CORS 設定

`next.config.js` で適切な CORS ヘッダーを設定:

```javascript
async headers() {
  return [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Access-Control-Allow-Origin', value: 'https://your-domain.com' },
        { key: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS' },
      ],
    },
  ]
}
```

### 3. Rate Limiting

API Routes に rate limiting を実装:

```typescript
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
})
```

---

## 🧪 デプロイ後のテスト

### 1. 動作確認チェックリスト

- [ ] トップページが正常に表示される
- [ ] イベント一覧が取得できる
- [ ] ユーザー登録・ログインができる
- [ ] Stripe決済が正常に動作する
- [ ] 購入完了後にアクセストークンが発行される
- [ ] 視聴ページで動画が再生される
- [ ] CloudFront署名付きURLが生成される

### 2. Stripe Webhook のテスト

```bash
# Stripe CLI でローカルテスト
stripe listen --forward-to https://your-domain.com/api/stripe/webhook

# テストイベント送信
stripe trigger checkout.session.completed
```

---

## 📝 トラブルシューティング

### データベース接続エラー

```bash
# 接続文字列を確認
echo $DATABASE_URL

# Prisma クライアント再生成
npx prisma generate
```

### ビルドエラー

```bash
# 依存関係を再インストール
rm -rf node_modules package-lock.json
npm install

# ビルド確認
npm run build
```

### CloudFront 署名エラー

- プライベートキーが正しく環境変数に設定されているか確認
- Key Pair ID が正しいか確認
- キーペアが CloudFront に登録されているか確認

---

## 🔄 継続的デプロイ

### GitHub との連携

1. GitHub にリポジトリを作成
2. Vercel Dashboard で GitHub リポジトリと連携
3. `main` ブランチへのプッシュで自動デプロイ

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-username/streaming-platform.git
git push -u origin main
```

---

## 📈 スケーリング

### 1. データベースのスケーリング

- Supabase: Pro プランにアップグレード
- AWS RDS: インスタンスタイプを拡張

### 2. AWS 配信のスケーリング

- MediaLive: STANDARD クラスに変更
- CloudFront: キャッシュ設定を最適化

### 3. Vercel のスケーリング

- Pro/Enterprise プランにアップグレード
- Edge Functions を活用

---

**最終更新**: 2026-02-22
