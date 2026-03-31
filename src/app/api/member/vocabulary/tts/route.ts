import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'

const AZURE_SPEECH_KEY = process.env.AZURE_SPEECH_KEY || ''
const AZURE_SPEECH_REGION = process.env.AZURE_SPEECH_REGION || ''
const AZURE_SPEECH_VOICE = process.env.AZURE_SPEECH_VOICE || 'en-US-JennyNeural'

const escapeXml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!AZURE_SPEECH_KEY || !AZURE_SPEECH_REGION) {
      return NextResponse.json({ error: 'Azure Speech is not configured' }, { status: 503 })
    }

    const body = await request.json()
    const text = String(body?.text || '').trim()

    if (!text) {
      return NextResponse.json({ error: 'text is required' }, { status: 400 })
    }

    if (text.length > 120) {
      return NextResponse.json({ error: 'text is too long' }, { status: 400 })
    }

    const ssml = `
      <speak version="1.0" xml:lang="en-US">
        <voice name="${AZURE_SPEECH_VOICE}">${escapeXml(text)}</voice>
      </speak>
    `.trim()

    const azureResponse = await fetch(`https://${AZURE_SPEECH_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': AZURE_SPEECH_KEY,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-24khz-96kbitrate-mono-mp3',
        'User-Agent': 'englishmore-web'
      },
      body: ssml
    })

    if (!azureResponse.ok) {
      const azureErrorText = await azureResponse.text().catch(() => '')
      console.error('Azure TTS failed:', azureResponse.status, azureErrorText)
      return NextResponse.json({ error: 'Failed to synthesize speech' }, { status: 502 })
    }

    const audioBuffer = await azureResponse.arrayBuffer()

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-store'
      }
    })
  } catch (error) {
    console.error('Error generating vocabulary speech:', error)
    return NextResponse.json({ error: 'Failed to generate speech audio' }, { status: 500 })
  }
}
