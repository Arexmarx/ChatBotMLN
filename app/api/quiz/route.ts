import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

type QuizResponse = {
  id: number
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { text } = body

    if (!text || !text.trim()) {
      return NextResponse.json({ error: "Prompt không được để trống" }, { status: 400 })
    }

    const n8nWebhookUrl =
      "https://n8naiagent-bkanbfhxeghzcwfs.southeastasia-01.azurewebsites.net/webhook/7eec822e-4138-4ca9-b2a8-3795ff66508e"

    const response = await fetch(n8nWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: text.trim() }),
    })

    if (!response.ok) {
      console.error("N8N Quiz API error:", response.status, response.statusText)
      return NextResponse.json({ error: "Không thể tạo quiz" }, { status: response.status })
    }

    const quizzes: QuizResponse[] = await response.json()

    return NextResponse.json({
      success: true,
      quizzes,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Quiz API error:", error)
    return NextResponse.json({ error: "Lỗi khi tạo quiz" }, { status: 500 })
  }
}
