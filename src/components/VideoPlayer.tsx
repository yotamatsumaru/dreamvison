'use client'

import { useEffect, useRef, useState } from 'react'
import videojs from 'video.js'
import 'video.js/dist/video-js.css'

interface VideoPlayerProps {
  src: string
  poster?: string
  onReady?: () => void
}

export default function VideoPlayer({ src, poster, onReady }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() {
    if (!videoRef.current) return

    // Video.js初期化
    const player = videojs(videoRef.current, {
      controls: true,
      responsive: true,
      fluid: true,
      autoplay: false,
      preload: 'auto',
      poster: poster || undefined,
      html5: {
        vhs: {
          overrideNative: true,
        },
        nativeVideoTracks: false,
        nativeAudioTracks: false,
        nativeTextTracks: false,
      },
      sources: [
        {
          src,
          type: 'application/x-mpegURL',
        },
      ],
    })

    playerRef.current = player

    player.on('ready', () => {
      console.log('Player is ready')
      onReady?.()
    })

    player.on('error', (e: any) => {
      console.error('Player error:', e)
      const error = player.error()
      if (error) {
        setError(`動画の読み込みに失敗しました: ${error.message}`)
      }
    })

    player.on('loadedmetadata', () => {
      console.log('Metadata loaded')
    })

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose()
        playerRef.current = null
      }
    }
  }, [src, poster, onReady])

  return (
    <div className="w-full">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <div data-vjs-player>
        <video
          ref={videoRef}
          className="video-js vjs-big-play-centered"
          playsInline
        />
      </div>
    </div>
  )
}
