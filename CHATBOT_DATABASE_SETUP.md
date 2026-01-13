# Chatbot Database Setup

## Database Schema

Database được thiết kế để hỗ trợ đầy đủ các tính năng trong `AIAssistantUI` component:

### Tables

#### 1. **profiles**
Lưu thông tin người dùng
- `user_id` (UUID, PK): ID người dùng từ auth.users
- `full_name` (TEXT): Tên đầy đủ
- `avatar_url` (TEXT): URL avatar
- `created_at`, `updated_at` (TIMESTAMP)

#### 2. **folders**
Thư mục tổ chức cuộc hội thoại
- `id` (UUID, PK): ID thư mục
- `user_id` (UUID, FK): ID người dùng
- `name` (TEXT): Tên thư mục (unique per user)
- `created_at`, `updated_at` (TIMESTAMP)

#### 3. **conversations**
Cuộc hội thoại chatbot
- `id` (UUID, PK): ID cuộc hội thoại
- `user_id` (UUID, FK): ID người dùng
- `folder_id` (UUID, FK, nullable): Thư mục chứa
- `title` (TEXT): Tiêu đề (auto-generated từ tin nhắn đầu)
- `preview` (TEXT): Preview nội dung
- `pinned` (BOOLEAN): Ghim lên đầu
- `message_count` (INTEGER): Số lượng tin nhắn (auto-updated)
- `created_at`, `updated_at` (TIMESTAMP)

#### 4. **messages**
Tin nhắn trong cuộc hội thoại
- `id` (UUID, PK): ID tin nhắn
- `conversation_id` (UUID, FK): ID cuộc hội thoại
- `role` (TEXT): 'user' | 'assistant' | 'system'
- `content` (TEXT): Nội dung tin nhắn
- `created_at` (TIMESTAMP): Thời gian tạo
- `edited_at` (TIMESTAMP, nullable): Thời gian chỉnh sửa

#### 5. **templates**
Mẫu tin nhắn
- `id` (UUID, PK): ID template
- `user_id` (UUID, FK): ID người dùng
- `name` (TEXT): Tên template (unique per user)
- `content` (TEXT): Nội dung đầy đủ
- `snippet` (TEXT): Đoạn preview ngắn
- `created_at`, `updated_at` (TIMESTAMP)

### Features

#### Row Level Security (RLS)
Tất cả các bảng đều có RLS policies để đảm bảo:
- User chỉ có thể xem/sửa dữ liệu của mình
- Tự động filter theo `auth.uid()`

#### Auto-update Triggers
1. **`update_conversation_stats_trigger`**
   - Tự động cập nhật `message_count` khi thêm/xóa message
   - Tự động cập nhật `preview` từ message mới nhất
   - Cập nhật `updated_at` timestamp

2. **`auto_title_conversation_trigger`**
   - Tự động đặt title từ tin nhắn user đầu tiên
   - Chỉ áp dụng nếu title còn là "New Chat"

3. **`update_updated_at` triggers**
   - Tự động cập nhật `updated_at` cho profiles, folders, conversations, templates

#### Indexes
Tối ưu performance cho các query phổ biến:
- User lookups
- Folder filtering
- Conversation sorting (by updated_at, pinned)
- Message ordering (by created_at)

## Setup Instructions

### 1. Apply Migration to Supabase

**Option A: Using Supabase Dashboard (Recommended)**

1. Mở [Supabase Dashboard](https://supabase.com/dashboard)
2. Chọn project của bạn
3. Vào **SQL Editor**
4. Copy toàn bộ nội dung file `supabase-migration.sql`
5. Paste vào SQL Editor
6. Click **Run** để thực thi

**Option B: Using Supabase CLI**

```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref acqdgxrfnarqulygciuq

# Run migration
supabase db push
```

### 2. Verify Tables Created

Trong Supabase Dashboard, vào **Table Editor** và kiểm tra các bảng:
- ✅ profiles
- ✅ folders
- ✅ conversations
- ✅ messages
- ✅ templates

### 3. Update Service Role Key

Cập nhật file `.env` với Service Role Key:

```env
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key
```

Lấy key từ: **Supabase Dashboard** → **Settings** → **API** → **service_role key**

### 4. Test Database Operations

Tạo file test để verify:

```typescript
import { getSupabaseClient } from "./lib/supabaseClient"
import { createConversation, createMessage } from "./lib/chatbotService"

async function testDatabase() {
  const supabase = getSupabaseClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    console.error("No user logged in")
    return
  }
  
  // Create a test conversation
  const conversation = await createConversation(user.id, {
    title: "Test Conversation"
  })
  
  console.log("Created conversation:", conversation)
  
  // Add a test message
  if (conversation) {
    const message = await createMessage(
      conversation.id,
      "user",
      "Hello, chatbot!"
    )
    console.log("Created message:", message)
  }
}
```

## Integration with AIAssistantUI

Để tích hợp với component hiện tại:

### 1. Replace Mock Data

Thay thế `INITIAL_CONVERSATIONS`, `INITIAL_TEMPLATES`, `INITIAL_FOLDERS` bằng dữ liệu từ database:

```typescript
// In AIAssistantUI.tsx
useEffect(() => {
  if (!currentUser) return
  
  // Load data from database
  const loadData = async () => {
    const [conversations, folders, templates] = await Promise.all([
      getConversations(currentUser.id),
      getFolders(currentUser.id),
      getTemplates(currentUser.id)
    ])
    
    setConversations(conversations)
    setFolders(folders)
    setTemplates(templates)
  }
  
  loadData()
}, [currentUser])
```

### 2. Update CRUD Operations

Thay thế local state updates bằng database operations:

```typescript
// Create conversation
async function createNewChat() {
  if (!currentUser) return
  
  const conversation = await createConversation(currentUser.id)
  if (conversation) {
    setConversations(prev => [conversation, ...prev])
    setSelectedId(conversation.id)
  }
}

// Send message
async function sendMessage(convId: string, content: string) {
  // Create user message
  await createMessage(convId, "user", content)
  
  // TODO: Call AI API and create assistant message
  const aiResponse = await callAIAPI(content)
  await createMessage(convId, "assistant", aiResponse)
  
  // Reload conversation
  const updated = await getConversationWithMessages(convId)
  if (updated) {
    setConversations(prev => 
      prev.map(c => c.id === convId ? updated : c)
    )
  }
}
```

### 3. Real-time Subscriptions (Optional)

Thêm real-time updates:

```typescript
useEffect(() => {
  if (!currentUser) return
  
  const supabase = getSupabaseClient()
  
  // Subscribe to conversation changes
  const subscription = supabase
    .channel('conversations')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'conversations',
        filter: `user_id=eq.${currentUser.id}`
      },
      (payload) => {
        console.log('Conversation changed:', payload)
        // Update local state
      }
    )
    .subscribe()
  
  return () => {
    subscription.unsubscribe()
  }
}, [currentUser])
```

## API Integration

Để tích hợp với AI (OpenAI, Claude, etc):

### Create AI API Route

```typescript
// app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server"
import { createMessage } from "@/lib/chatbotService"

export async function POST(request: NextRequest) {
  const { conversationId, message } = await request.json()
  
  // Save user message
  await createMessage(conversationId, "user", message)
  
  // Call AI API (example with OpenAI)
  const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: [{ role: "user", content: message }]
    })
  })
  
  const data = await aiResponse.json()
  const assistantMessage = data.choices[0].message.content
  
  // Save assistant message
  const savedMessage = await createMessage(
    conversationId,
    "assistant",
    assistantMessage
  )
  
  return NextResponse.json({ message: savedMessage })
}
```

## Troubleshooting

### Issue: RLS policies blocking access
**Solution**: Đảm bảo user đã đăng nhập và `auth.uid()` trả về đúng user ID

### Issue: Triggers không chạy
**Solution**: Kiểm tra function đã được tạo đúng và trigger được attach

### Issue: Slow queries
**Solution**: Kiểm tra indexes đã được tạo, sử dụng `EXPLAIN ANALYZE`

## Next Steps

1. ✅ Apply migration to Supabase
2. ✅ Update `.env` with service role key
3. ✅ Test database operations
4. 🔄 Integrate with AIAssistantUI component
5. 🔄 Add AI API integration
6. 🔄 Add real-time subscriptions
7. 🔄 Deploy to production
