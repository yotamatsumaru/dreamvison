import { notFound } from 'next/navigation'
import WatchClient from './WatchClient'

interface PageProps {
  params: { slug: string }
  searchParams: { token?: string }
}

export default async function WatchPage({ params, searchParams }: PageProps) {
  if (!searchParams.token) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto card text-center">
          <div className="text-6xl mb-6">🔒</div>
          <h1 className="text-3xl font-bold mb-4">アクセストークンが必要です</h1>
          <p className="text-gray-600 mb-6">
            この視聴ページにアクセスするには、有効なアクセストークンが必要です。
            <br />
            チケットを購入後、購入完了メールに記載されたリンクからアクセスしてください。
          </p>
          <a href="/events" className="btn btn-primary">
            イベント一覧に戻る
          </a>
        </div>
      </div>
    )
  }

  return <WatchClient slug={params.slug} token={searchParams.token} />
}
