import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: NextRequest) {
  try {
    const { conversationId, message, userId } = await request.json()

    if (!conversationId || !message || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Use service role key for server-side operations
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase configuration")
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Verify conversation ownership
    const { data: conversation, error: convError } = await supabase
      .from("conversations")
      .select("user_id")
      .eq("id", conversationId)
      .single()

    if (convError || !conversation || conversation.user_id !== userId) {
      console.error("Conversation verification error:", convError)
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    // Save user message to database
    const { data: userMessage, error: userMsgError } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        role: "user",
        content: message,
      })
      .select()
      .single()

    if (userMsgError || !userMessage) {
      console.error("Error saving user message:", userMsgError)
      return NextResponse.json(
        { error: "Failed to save user message" },
        { status: 500 }
      )
    }

    // Call N8N AI Agent
    let aiResponse: string
    try {
      aiResponse = await callN8NAgent(message, conversationId)
    } catch (error) {
      console.error("N8N API error:", error)
      // Fallback to mock response if N8N fails
      aiResponse = generateMockResponse(message)
    }

    // Save assistant message to database
    const { data: assistantMessage, error: assistantMsgError } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        role: "assistant",
        content: aiResponse,
      })
      .select()
      .single()

    if (assistantMsgError || !assistantMessage) {
      console.error("Error saving assistant message:", assistantMsgError)
      return NextResponse.json(
        { error: "Failed to save assistant message" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      userMessage: {
        id: userMessage.id,
        role: userMessage.role,
        content: userMessage.content,
        createdAt: userMessage.created_at,
      },
      assistantMessage: {
        id: assistantMessage.id,
        role: assistantMessage.role,
        content: assistantMessage.content,
        createdAt: assistantMessage.created_at,
      },
    })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json(
      { 
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

/**
 * Call N8N AI Agent webhook
 */
async function callN8NAgent(text: string, sessionId: string): Promise<string> {
  const webhookUrl = process.env.N8N_WEBHOOK_URL

  if (!webhookUrl) {
    console.warn("N8N_WEBHOOK_URL not configured, using mock response")
    throw new Error("N8N webhook URL not configured")
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        sessionId,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("N8N API error response:", errorText)
      throw new Error(`N8N API returned status ${response.status}`)
    }

    const data = await response.json()
    
    // N8N returns { output: "markdown content" }
    if (!data.output) {
      console.error("N8N response missing 'output' field:", data)
      throw new Error("Invalid N8N response format")
    }

    return data.output
  } catch (error) {
    console.error("Error calling N8N agent:", error)
    throw error
  }
}

function generateMockResponse(userMessage: string): string {
  // Simple mock AI response generator
  const lowerMessage = userMessage.toLowerCase()
  
  if (lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
    return "Hello! How can I help you today with Vietnamese history?"
  }
  
  if (lowerMessage.includes("help")) {
    return "I'm here to help you learn about Vietnamese history. You can ask me about historical events, figures, dynasties, wars, and cultural developments throughout Vietnam's long history."
  }
  
  if (lowerMessage.includes("lý") || lowerMessage.includes("ly")) {
    return "Nhà Lý (1009-1225) là một triều đại quan trọng trong lịch sử Việt Nam. Được khai sáng bởi Lý Công Uẩn (Lý Thái Tổ), triều đại này đã thiết lập thủ đô tại Thăng Long (Hà Nội ngày nay) và phát triển mạnh mẽ về văn hóa, kinh tế và quân sự."
  }
  
  if (lowerMessage.includes("trần") || lowerMessage.includes("tran")) {
    return "Nhà Trần (1225-1400) nối tiếp Nhà Lý và nổi tiếng với chiến thắng chống quân Nguyên-Mông xâm lược ba lần (1258, 1285, 1287-1288). Trần Hưng Đạo là vị tướng tài ba nhất của triều đại này."
  }
  
  if (lowerMessage.includes("hồ chí minh") || lowerMessage.includes("ho chi minh")) {
    return "Hồ Chí Minh (1890-1969) là lãnh tụ cách mạng Việt Nam, người sáng lập Đảng Cộng sản Việt Nam và là Chủ tịch nước Việt Nam Dân chủ Cộng hòa. Người đã lãnh đạo nhân dân Việt Nam trong cuộc kháng chiến chống thực dân Pháp và đế quốc Mỹ."
  }
  
  // Default response
  return `Tôi đã nhận được câu hỏi của bạn về "${userMessage}". Đây là một chủ đề thú vị trong lịch sử Việt Nam. Để có câu trả lời chính xác hơn, bạn có thể cung cấp thêm chi tiết hoặc hỏi về một giai đoạn/sự kiện cụ thể trong lịch sử Việt Nam.`
}

/* 
  TODO: Integrate with real AI API

  Example with OpenAI:
  
  async function callOpenAI(conversationId: string, message: string) {
    const conversation = await getConversationWithMessages(conversationId)
    
    const messages = conversation?.messages.map(msg => ({
      role: msg.role,
      content: msg.content
    })) || []
    
    messages.push({ role: "user", content: message })
    
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert on Vietnamese history. Answer questions in Vietnamese when appropriate."
          },
          ...messages
        ]
      })
    })
    
    const data = await response.json()
    return data.choices[0].message.content
  }
*/
