import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code  = searchParams.get('code')
  const state = searchParams.get('state')
  const token = req.headers.get('authorization')

  const response = await fetch(
    `${process.env.API_URL}/api/v1/fb/oauth/callback?code=${code}&state=${state}`,
    {
      headers: {
        Authorization: token ?? '',
      },
    }
  )

  const data = await response.json()
  return NextResponse.json(data, { status: response.status })
}