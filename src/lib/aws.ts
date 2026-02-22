import { MediaLiveClient, DescribeChannelCommand, CreateChannelCommand } from '@aws-sdk/client-medialive'
import { MediaPackageClient, DescribeChannelCommand as DescribePackageChannelCommand } from '@aws-sdk/client-mediapackage'
import { getSignedUrl } from '@aws-sdk/cloudfront-signer'

// AWS MediaLive クライアント
export const mediaLiveClient = new MediaLiveClient({
  region: process.env.AWS_REGION || 'ap-northeast-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
})

// AWS MediaPackage クライアント
export const mediaPackageClient = new MediaPackageClient({
  region: process.env.AWS_REGION || 'ap-northeast-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
})

// CloudFront署名付きURL生成
export function generateSignedUrl(url: string, expiresIn: number = 3600): string {
  if (!process.env.CLOUDFRONT_PRIVATE_KEY || !process.env.CLOUDFRONT_KEY_PAIR_ID) {
    throw new Error('CloudFront credentials are not configured')
  }

  const dateLessThan = new Date(Date.now() + expiresIn * 1000).toISOString()

  return getSignedUrl({
    url,
    keyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID,
    privateKey: process.env.CLOUDFRONT_PRIVATE_KEY,
    dateLessThan,
  })
}

// CloudFront署名付きCookie生成
export function generateSignedCookies(
  url: string,
  expiresIn: number = 3600
): {
  'CloudFront-Policy': string
  'CloudFront-Signature': string
  'CloudFront-Key-Pair-Id': string
} {
  if (!process.env.CLOUDFRONT_PRIVATE_KEY || !process.env.CLOUDFRONT_KEY_PAIR_ID) {
    throw new Error('CloudFront credentials are not configured')
  }

  const policy = JSON.stringify({
    Statement: [
      {
        Resource: url,
        Condition: {
          DateLessThan: {
            'AWS:EpochTime': Math.floor(Date.now() / 1000) + expiresIn,
          },
        },
      },
    ],
  })

  const signature = getSignedUrl({
    url,
    keyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID,
    privateKey: process.env.CLOUDFRONT_PRIVATE_KEY,
    dateLessThan: new Date(Date.now() + expiresIn * 1000).toISOString(),
  })

  return {
    'CloudFront-Policy': Buffer.from(policy).toString('base64'),
    'CloudFront-Signature': signature.split('Signature=')[1]?.split('&')[0] || '',
    'CloudFront-Key-Pair-Id': process.env.CLOUDFRONT_KEY_PAIR_ID,
  }
}

// MediaLive チャンネル情報取得
export async function getMediaLiveChannel(channelId: string) {
  const command = new DescribeChannelCommand({ ChannelId: channelId })
  return await mediaLiveClient.send(command)
}

// MediaPackage チャンネル情報取得
export async function getMediaPackageChannel(channelId: string) {
  const command = new DescribePackageChannelCommand({ Id: channelId })
  return await mediaPackageClient.send(command)
}
