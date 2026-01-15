import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const audioFile = formData.get("audio") as File
    
    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 })
    }

    // Convert File to Buffer
    const bytes = await audioFile.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to AssemblyAI
    const uploadResponse = await fetch("https://api.assemblyai.com/v2/upload", {
      method: "POST",
      headers: {
        "authorization": process.env.ASSEMBLYAI_API_KEY || "717e90b754174530b82e118c35ebc445",
        "content-type": "application/octet-stream",
      },
      body: buffer,
    })

    if (!uploadResponse.ok) {
      throw new Error("Failed to upload audio")
    }

    const uploadData = await uploadResponse.json()
    const audioUrl = uploadData.upload_url

    // Request transcription
    const transcriptResponse = await fetch("https://api.assemblyai.com/v2/transcript", {
      method: "POST",
      headers: {
        "authorization": process.env.ASSEMBLYAI_API_KEY || "717e90b754174530b82e118c35ebc445",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        audio_url: audioUrl,
        speech_model: "best",
        language_code: "vi", // Vietnamese
      }),
    })

    if (!transcriptResponse.ok) {
      throw new Error("Failed to request transcription")
    }

    const transcriptData = await transcriptResponse.json()
    const transcriptId = transcriptData.id

    // Poll for completion
    let transcript: { status: string; text?: string; error?: string } | null = null
    let attempts = 0
    const maxAttempts = 60 // 60 seconds timeout

    while (attempts < maxAttempts) {
      const pollingResponse = await fetch(
        `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
        {
          headers: {
            "authorization": process.env.ASSEMBLYAI_API_KEY || "717e90b754174530b82e118c35ebc445",
          },
        }
      )

      transcript = await pollingResponse.json()

      if (transcript && transcript.status === "completed") {
        return NextResponse.json({ text: transcript.text })
      } else if (transcript && transcript.status === "error") {
        throw new Error(transcript.error || "Transcription failed")
      }

      // Wait 1 second before next poll
      await new Promise((resolve) => setTimeout(resolve, 1000))
      attempts++
    }

    return NextResponse.json({ error: "Transcription timeout" }, { status: 408 })
  } catch (error) {
    console.error("Transcription error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Transcription failed" },
      { status: 500 }
    )
  }
}
