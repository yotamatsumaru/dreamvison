import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import prisma from '@/lib/prisma'

// POST /api/auth/signup - 新規ユーザー登録
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password } = body

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'すべてのフィールドを入力してください' },
        { status: 400 }
      )
    }

    // パスワード長チェック
    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'パスワードは8文字以上である必要があります' },
        { status: 400 }
      )
    }

    // メールアドレス重複チェック
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'このメールアドレスは既に登録されています' },
        { status: 409 }
      )
    }

    // パスワードハッシュ化
    const hashedPassword = await bcrypt.hash(password, 10)

    // ユーザー作成
    const user = await prisma.user.create({
      data: {
        name,
        email,
        role: 'USER',
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    })
  } catch (error) {
    console.error('User registration error:', error)
    return NextResponse.json(
      { success: false, error: '新規登録に失敗しました' },
      { status: 500 }
    )
  }
}
