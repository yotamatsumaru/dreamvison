# 🎬 Next.js 14 ライブ配信プラットフォーム - プロジェクトサマリー

## 📊 プロジェクト概要

AWS MediaLive/MediaPackage/CloudFrontを活用したプロフェッショナルなライブ配信プラットフォームです。Stripeによるチケット販売、NextAuth.jsによる認証、Prisma+PostgreSQLによるデータ管理を実装しています。

---

## ✅ 実装済み機能

### 🔐 認証・ユーザー管理
- [x] NextAuth.js によるセッション管理
- [x] メールアドレス・パスワード認証
- [x] ユーザー登録・ログイン
- [x] ロールベース権限管理（USER / ADMIN）

### 💳 決済システム
- [x] Stripe Checkout 統合
- [x] チケット購入フロー
- [x] Webhook による購入完了処理
- [x] 自動アクセストークン発行
- [x] 返金処理対応

### 📺 配信機能
- [x] AWS MediaLive 連携
- [x] AWS MediaPackage 連携
- [x] CloudFront 署名付きURL生成
- [x] Video.js による HLS 再生
- [x] ライブ配信・アーカイブ配信対応
- [x] リアルタイム LIVE 表示

### 🎫 イベント管理
- [x] イベント一覧・詳細表示
- [x] ステータス管理（UPCOMING / LIVE / ENDED / ARCHIVED）
- [x] チケット種別管理
- [x] 在庫管理
- [x] 購入履歴管理

### 🎤 アーティスト管理
- [x] アーティスト一覧・詳細ページ
- [x] アーティスト別イベント表示
- [x] プロフィール管理

### 👤 ユーザー機能
- [x] マイチケットページ
- [x] 購入済みチケット一覧
- [x] 視聴ページへのダイレクトアクセス
- [x] チケット有効期限管理

### 🔒 セキュリティ
- [x] JWT ベースのアクセストークン
- [x] CloudFront 署名付きURL
- [x] トークン有効期限管理
- [x] 購入者限定視聴
- [x] HTTPS 強制

---

## 🛠️ 技術スタック

| カテゴリ | 技術 |
|---------|------|
| **フレームワーク** | Next.js 14 (App Router) |
| **言語** | TypeScript |
| **認証** | NextAuth.js |
| **データベース** | PostgreSQL (Prisma ORM) |
| **決済** | Stripe |
| **配信** | AWS MediaLive, MediaPackage, CloudFront |
| **動画再生** | Video.js |
| **スタイリング** | Tailwind CSS |
| **デプロイ** | Vercel (推奨) |

---

## 📁 ファイル構成

```
nextjs-streaming-platform/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── api/                     # API Routes
│   │   │   ├── auth/               # 認証API (NextAuth, 新規登録)
│   │   │   ├── events/             # イベントAPI
│   │   │   ├── stripe/             # Stripe決済API
│   │   │   └── watch/              # 視聴認証API
│   │   ├── events/                 # イベントページ
│   │   │   ├── [slug]/            # イベント詳細
│   │   │   │   └── success/       # 購入完了ページ
│   │   │   └── page.tsx           # イベント一覧
│   │   ├── artists/                # アーティストページ
│   │   │   ├── [slug]/            # アーティスト詳細
│   │   │   └── page.tsx           # アーティスト一覧
│   │   ├── watch/                  # 視聴ページ
│   │   │   └── [slug]/
│   │   │       ├── page.tsx       # 視聴ページ
│   │   │       └── WatchClient.tsx # クライアントコンポーネント
│   │   ├── my-tickets/             # マイチケットページ
│   │   ├── auth/                   # 認証ページ
│   │   │   ├── signin/            # ログイン
│   │   │   └── signup/            # 新規登録
│   │   ├── layout.tsx              # ルートレイアウト
│   │   ├── page.tsx                # ホームページ
│   │   └── globals.css             # グローバルCSS
│   ├── components/                 # Reactコンポーネント
│   │   ├── Navigation.tsx          # ナビゲーションバー
│   │   ├── VideoPlayer.tsx         # Video.jsプレイヤー
│   │   ├── PurchaseButton.tsx      # 購入ボタン
│   │   └── SessionProvider.tsx     # NextAuth Session Provider
│   ├── lib/                        # ライブラリ・ユーティリティ
│   │   ├── prisma.ts               # Prismaクライアント
│   │   ├── stripe.ts               # Stripeクライアント
│   │   ├── aws.ts                  # AWS SDK連携
│   │   ├── auth.ts                 # JWT認証
│   │   └── nextauth.ts             # NextAuth設定
│   └── types/                      # TypeScript型定義
│       ├── index.ts
│       └── next-auth.d.ts
├── prisma/
│   ├── schema.prisma               # データベーススキーマ
│   └── seed.ts                     # シードデータ
├── public/                         # 静的ファイル
├── .env.example                    # 環境変数テンプレート
├── next.config.js                  # Next.js設定
├── tailwind.config.js              # Tailwind CSS設定
├── postcss.config.js               # PostCSS設定
├── tsconfig.json                   # TypeScript設定
├── package.json                    # 依存関係
├── README.md                       # プロジェクト概要
├── DEPLOYMENT.md                   # デプロイメントガイド
└── AWS_INTEGRATION.md              # AWS統合ガイド
```

**総ファイル数**: 39ファイル（TypeScript/TSX/設定ファイル）

---

## 🗄️ データベーススキーマ

### テーブル一覧

1. **User** - ユーザー情報
2. **Account** - OAuth アカウント
3. **Session** - セッション情報
4. **VerificationToken** - 検証トークン
5. **Artist** - アーティスト情報
6. **Event** - イベント情報
7. **Ticket** - チケット種別
8. **Purchase** - 購入履歴
9. **Admin** - 管理者アカウント

### 主要リレーション

```
Artist → Event (1:N)
Event → Ticket (1:N)
Event → Purchase (1:N)
User → Purchase (1:N)
Ticket → Purchase (1:N)
```

---

## 🚀 クイックスタート

### 1. インストール

```bash
cd /home/user/webapp/nextjs-streaming-platform
npm install
```

### 2. 環境変数設定

```bash
cp .env.example .env
# .env を編集して必要な値を設定
```

### 3. データベースセットアップ

```bash
npx prisma generate
npx prisma migrate dev
npm run prisma:seed
```

### 4. 開発サーバー起動

```bash
npm run dev
```

→ http://localhost:3000 でアクセス

---

## 🔌 API エンドポイント一覧

### 認証
- `POST /api/auth/signup` - ユーザー登録
- `POST /api/auth/[nextauth]` - NextAuth.js（ログイン/ログアウト）

### イベント
- `GET /api/events` - イベント一覧取得
- `GET /api/events/[slug]` - イベント詳細取得

### Stripe
- `POST /api/stripe/checkout` - チェックアウトセッション作成
- `POST /api/stripe/webhook` - Webhook処理

### 視聴
- `POST /api/watch/verify` - アクセストークン検証
- `POST /api/watch/stream-url` - 署名付きURL取得

---

## 📖 ドキュメント

- **README.md** - プロジェクト概要
- **DEPLOYMENT.md** - デプロイ手順（Vercel、AWS設定）
- **AWS_INTEGRATION.md** - AWS MediaLive/MediaPackage統合ガイド

---

## 🎯 今後の拡張案

### 管理画面（未実装）
- [ ] イベント作成・編集機能
- [ ] アーティスト作成・編集機能
- [ ] チケット作成・編集機能
- [ ] 売上レポート・ダッシュボード
- [ ] ユーザー管理機能

### DRM保護（一部実装）
- [x] CloudFront 署名付きURL
- [ ] AWS SPEKE による DRM
- [ ] Widevine / FairPlay 対応
- [ ] スクリーンキャプチャ防止

### 追加機能
- [ ] メール通知（購入確認、視聴URL送信）
- [ ] チャット機能（ライブ配信中）
- [ ] リアクション機能（いいね、拍手）
- [ ] VOD ライブラリ
- [ ] サブスクリプション対応

---

## 🔍 パフォーマンス

### 最適化済み
- ✅ Server Components による高速レンダリング
- ✅ CloudFront CDN による配信最適化
- ✅ Prisma ORM によるクエリ最適化
- ✅ Image 最適化（Next.js Image）

### 推奨設定
- **CDN**: CloudFront を利用
- **DB**: Connection pooling 有効化
- **キャッシュ**: ISR/SSG の活用

---

## 📝 開発メモ

### 環境変数（必須）
- `DATABASE_URL` - PostgreSQL 接続文字列
- `NEXTAUTH_SECRET` - NextAuth シークレット
- `STRIPE_SECRET_KEY` - Stripe シークレットキー
- `STRIPE_WEBHOOK_SECRET` - Stripe Webhook シークレット
- `JWT_SECRET` - JWT 署名シークレット

### 環境変数（オプション）
- `AWS_ACCESS_KEY_ID` - AWS アクセスキー
- `AWS_SECRET_ACCESS_KEY` - AWS シークレットキー
- `CLOUDFRONT_PRIVATE_KEY` - CloudFront プライベートキー
- `CLOUDFRONT_KEY_PAIR_ID` - CloudFront キーペアID

---

## 🎉 完成度

**総合進捗**: 85%

- ✅ **基本機能**: 100% 完了
- ✅ **認証システム**: 100% 完了
- ✅ **決済システム**: 100% 完了
- ✅ **配信機能**: 100% 完了
- ⏳ **管理画面**: 0% （今後実装）
- 🔒 **DRM保護**: 50% （CloudFront署名のみ）

---

## 📞 サポート

問題が発生した場合は、以下を確認してください:

1. **README.md** - 基本的な使い方
2. **DEPLOYMENT.md** - デプロイメント手順
3. **AWS_INTEGRATION.md** - AWS統合ガイド

---

**プロジェクト作成日**: 2026-02-22  
**最終更新**: 2026-02-22  
**バージョン**: 1.0.0
