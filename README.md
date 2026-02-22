# Next.js 14 ライブ配信プラットフォーム

OBSを起点とした安定したライブ配信・ストリーミング基盤をAWS上に構築し、Stripeを用いたチケット販売・認証フローを実装したライブ配信プラットフォームです。

## 🎯 主な機能

### ✅ 完成済み機能

#### 1. **ユーザー認証システム**
- NextAuth.js によるセキュアな認証
- メールアドレス・パスワード認証
- ユーザー登録・ログイン機能
- セッション管理

#### 2. **チケット購入システム**
- Stripe Checkout による安全な決済
- 複数チケット種別対応
- 在庫管理機能
- 購入完了後の自動アクセストークン発行

#### 3. **視聴認証システム**
- JWT ベースのアクセストークン
- トークンの有効期限管理
- 購入確認による視聴権限チェック

#### 4. **AWS 配信連携**
- AWS MediaLive 連携
- AWS MediaPackage 連携
- CloudFront 署名付きURL生成
- DRM保護対応

#### 5. **イベント管理**
- ライブ配信とアーカイブ配信の両対応
- イベント一覧・詳細表示
- ステータス管理（upcoming, live, ended, archived）

#### 6. **アーティスト管理**
- アーティスト専用ページ
- アーティストごとのイベント一覧
- プロフィール表示

#### 7. **視聴ページ**
- Video.js による HLS 再生
- ライブ配信とアーカイブ配信の切り替え
- レスポンシブデザイン
- リアルタイムLIVE表示

#### 8. **マイチケット機能**
- 購入済みチケット一覧
- 視聴ページへのダイレクトアクセス
- チケット有効期限表示

## 🛠️ 技術スタック

- **フレームワーク**: Next.js 14 (App Router)
- **認証**: NextAuth.js
- **データベース**: PostgreSQL (Prisma ORM)
- **決済**: Stripe
- **配信**: AWS MediaLive, MediaPackage, CloudFront
- **動画再生**: Video.js
- **スタイリング**: Tailwind CSS
- **言語**: TypeScript

## 📁 プロジェクト構造

```
nextjs-streaming-platform/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes
│   │   │   ├── auth/         # NextAuth & 認証API
│   │   │   ├── events/       # イベントAPI
│   │   │   ├── stripe/       # Stripe決済API
│   │   │   └── watch/        # 視聴認証API
│   │   ├── events/           # イベントページ
│   │   ├── artists/          # アーティストページ
│   │   ├── watch/            # 視聴ページ
│   │   ├── my-tickets/       # マイチケットページ
│   │   ├── auth/             # 認証ページ
│   │   ├── layout.tsx        # ルートレイアウト
│   │   ├── page.tsx          # ホームページ
│   │   └── globals.css       # グローバルCSS
│   ├── components/           # React コンポーネント
│   │   ├── Navigation.tsx    # ナビゲーションバー
│   │   ├── VideoPlayer.tsx   # Video.js プレイヤー
│   │   ├── PurchaseButton.tsx # 購入ボタン
│   │   └── SessionProvider.tsx # NextAuth Session Provider
│   ├── lib/                  # ライブラリ・ユーティリティ
│   │   ├── prisma.ts         # Prisma クライアント
│   │   ├── stripe.ts         # Stripe クライアント
│   │   ├── aws.ts            # AWS SDK 連携
│   │   ├── auth.ts           # JWT 認証
│   │   └── nextauth.ts       # NextAuth 設定
│   └── types/                # TypeScript 型定義
│       ├── index.ts
│       └── next-auth.d.ts
├── prisma/
│   └── schema.prisma         # データベーススキーマ
├── public/                   # 静的ファイル
├── .env.example              # 環境変数テンプレート
├── next.config.js            # Next.js 設定
├── tailwind.config.js        # Tailwind CSS 設定
├── tsconfig.json             # TypeScript 設定
└── package.json              # 依存関係

```

## 🗄️ データベース設計

### テーブル構成

1. **users** - ユーザー情報（NextAuth.js対応）
2. **accounts** - OAuth アカウント情報
3. **sessions** - セッション情報
4. **artists** - アーティスト情報
5. **events** - イベント（ライブ/アーカイブ）
6. **tickets** - チケット種別
7. **purchases** - 購入履歴
8. **admins** - 管理者アカウント

## ⚙️ セットアップ手順

### 1. 依存関係のインストール

```bash
cd /home/user/webapp/nextjs-streaming-platform
npm install
```

### 2. 環境変数の設定

`.env` ファイルを作成（`.env.example` を参考に）:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/streaming_platform"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-key"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# AWS
AWS_REGION="ap-northeast-1"
AWS_ACCESS_KEY_ID="your_access_key"
AWS_SECRET_ACCESS_KEY="your_secret_key"

# CloudFront
CLOUDFRONT_DOMAIN="your-domain.cloudfront.net"
CLOUDFRONT_KEY_PAIR_ID="your-key-pair-id"
CLOUDFRONT_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----"

# JWT Secret
JWT_SECRET="your-jwt-secret"
```

### 3. データベースのセットアップ

```bash
# Prisma マイグレーション
npm run prisma:generate
npm run prisma:migrate

# Prisma Studio（データベース管理UI）
npm run prisma:studio
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

アプリケーションは http://localhost:3000 で起動します。

## 🔌 API エンドポイント

### 認証 API

- `POST /api/auth/signup` - 新規ユーザー登録
- `POST /api/auth/signin` - ログイン（NextAuth.js）
- `POST /api/auth/signout` - ログアウト

### イベント API

- `GET /api/events` - イベント一覧取得
- `GET /api/events/:slug` - イベント詳細取得

### Stripe API

- `POST /api/stripe/checkout` - チェックアウトセッション作成
- `POST /api/stripe/webhook` - Stripe Webhook ハンドラー

### 視聴認証 API

- `POST /api/watch/verify` - アクセストークン検証
- `POST /api/watch/stream-url` - 署名付きURL取得

## 🎬 使い方

### ユーザーフロー

1. **アカウント作成**: `/auth/signup` で新規登録
2. **ログイン**: `/auth/signin` でログイン
3. **イベント閲覧**: `/events` でイベント一覧を閲覧
4. **チケット購入**: イベント詳細ページでチケットを購入（Stripe決済）
5. **視聴**: 購入完了後、視聴ページでライブ配信を視聴
6. **マイチケット**: `/my-tickets` で購入済みチケットを管理

### AWS 配信環境との連携

このプラットフォームは、以下のAWS環境と連携することを想定しています:

- **AWS MediaLive**: OBSからのRTMP入力受信
- **AWS MediaPackage**: HLS変換とDRM適用
- **CloudFront**: CDN配信と署名付きURL

データベースの `events` テーブルに配信URLを設定:

```sql
UPDATE events 
SET cloudfront_url = 'https://your-cloudfront-domain.net/out/v1/xxx/index.m3u8'
WHERE id = 'event-id';
```

## 🔐 Stripe 設定

### Webhook の設定

1. Stripe Dashboard で Webhook エンドポイントを追加:
   - URL: `https://your-domain.com/api/stripe/webhook`
   - イベント: `checkout.session.completed`, `charge.refunded`

2. Webhook 署名シークレットを `.env` に設定

### テストカード

Stripe テストモードで使用できるカード:

- カード番号: `4242 4242 4242 4242`
- 有効期限: 任意の未来の日付
- CVC: 任意の3桁
- 郵便番号: 任意

## 🚀 デプロイ

### Vercel へのデプロイ（推奨）

```bash
# Vercel CLI をインストール
npm i -g vercel

# デプロイ
vercel

# 本番デプロイ
vercel --prod
```

### 環境変数の設定

Vercel ダッシュボードで以下の環境変数を設定:

- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `CLOUDFRONT_PRIVATE_KEY`
- `CLOUDFRONT_KEY_PAIR_ID`
- `JWT_SECRET`

## 🔧 トラブルシューティング

### Prisma エラー

```bash
# Prisma クライアント再生成
npm run prisma:generate

# データベースリセット
npx prisma migrate reset
```

### ビルドエラー

```bash
# node_modules を削除して再インストール
rm -rf node_modules package-lock.json
npm install
```

## 📚 ドキュメント

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Stripe Documentation](https://stripe.com/docs)
- [AWS MediaLive Documentation](https://docs.aws.amazon.com/medialive/)
- [Video.js Documentation](https://videojs.com/)

## 📄 ライセンス

本プロジェクトは開発中のベータ版です。

## 👥 開発者

本プロジェクトは、ライブ配信・ストリーミングサービスのベータ版開発として作成されました。

---

**最終更新**: 2026-02-22
