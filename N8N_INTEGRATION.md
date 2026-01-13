# Tích hợp N8N AI Agent vào Chatbot

## Tổng kết thay đổi

### ✅ Đã hoàn thành:

#### 1. **Environment Variables** ([.env](.env))
- Thêm `N8N_WEBHOOK_URL` với webhook endpoint của bạn
- URL: `https://n8naiagent-bkanbfhxeghzcwfs.southeastasia-01.azurewebsites.net/webhook/87f86dab-0d46-4236-8522-a36b63eb21b6`

#### 2. **Chat API Route** ([app/api/chat/route.ts](app/api/chat/route.ts))
- Thêm function `callN8NAgent()` để gọi N8N webhook
- Gửi request với body: `{ text: userMessage, sessionId: conversationId }`
- Parse response JSON và lấy field `output` (markdown content)
- Fallback sang mock response nếu N8N fails
- Error handling và logging chi tiết

#### 3. **Markdown Rendering** ([components/chatbot/ChatPane.tsx](components/chatbot/ChatPane.tsx))
- Cài đặt `react-markdown` và `remark-gfm`
- Cài đặt `@tailwindcss/typography` plugin
- Render assistant messages dưới dạng markdown với styling
- User messages vẫn giữ plain text với `whitespace-pre-wrap`

#### 4. **CSS Configuration** ([app/globals.css](app/globals.css))
- Import Tailwind Typography plugin
- Hỗ trợ prose classes cho markdown styling

## 📋 Request/Response Format

### Request to N8N:
```json
{
  "text": "Câu hỏi của user",
  "sessionId": "uuid-conversation-id"
}
```

### Response from N8N:
```json
{
  "output": "**Markdown content**\n\n- Item 1\n- Item 2"
}
```

## 🎨 Markdown Styling

Assistant messages được render với:
- **Bold**, *italic*, ~~strikethrough~~
- Headers (H1-H6)
- Lists (ordered & unordered)
- Links (auto open in new tab)
- Code blocks (inline & block)
- Tables (via `remark-gfm`)
- Task lists
- Blockquotes

Example:
```markdown
**Nhà Trần** (1225-1400) là một triều đại quan trọng:

1. Thành lập năm 1225
2. Chiến thắng quân Mông Cổ 3 lần
3. Phát triển mạnh về văn hóa

> "Đầu tôi có thể rơi, nhưng nước không thể mất" - Trần Hưng Đạo
```

## 🔧 Cách hoạt động

1. **User gửi message** → Lưu vào database
2. **Call N8N API** với `text` và `sessionId` (conversationId)
3. **N8N xử lý** bằng AI agent của bạn (có thể là RAG, GPT, etc.)
4. **Nhận response** với markdown output
5. **Lưu assistant message** vào database
6. **Render markdown** trong UI với styling đẹp

## ⚙️ Configuration

### Environment Variables

```env
# Required - N8N Webhook
N8N_WEBHOOK_URL=https://n8naiagent-bkanbfhxeghzcwfs.southeastasia-01.azurewebsites.net/webhook/87f86dab-0d46-4236-8522-a36b63eb21b6

# Optional - Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Restart Server

Sau khi update `.env`:
```bash
# Stop server (Ctrl+C)
npm run dev
```

## 🧪 Testing

### Test N8N Integration:

1. **Start dev server**: `npm run dev`
2. **Login** vào app
3. **Navigate** to `/chat`
4. **Create new conversation**
5. **Send message**: "Giới thiệu về nhà Trần"
6. **Verify**:
   - Message được gửi
   - Thinking indicator hiện
   - Response từ N8N được render dưới dạng markdown
   - Markdown được style đẹp (bold, lists, etc.)

### Test Fallback:

Để test fallback khi N8N fails:
1. Tạm thời comment `N8N_WEBHOOK_URL` trong `.env`
2. Restart server
3. Send message
4. Should see mock response instead

## 🐛 Troubleshooting

### Issue: "N8N webhook URL not configured"

**Solution**: 
- Check `.env` có `N8N_WEBHOOK_URL`
- Restart dev server

### Issue: "N8N API returned status 500"

**Possible causes**:
- N8N workflow chưa active
- N8N webhook URL không đúng
- N8N workflow có lỗi

**Solution**:
1. Kiểm tra N8N workflow status
2. Test webhook trực tiếp bằng Postman/curl:
```bash
curl -X POST https://n8naiagent-bkanbfhxeghzcwfs.southeastasia-01.azurewebsites.net/webhook/87f86dab-0d46-4236-8522-a36b63eb21b6 \
  -H "Content-Type: application/json" \
  -d '{"text": "test", "sessionId": "test-123"}'
```
3. Check N8N logs

### Issue: Markdown không render đẹp

**Solution**:
- Verify `@tailwindcss/typography` installed
- Check `@plugin "@tailwindcss/typography"` in `globals.css`
- Hard refresh browser (Ctrl+F5)

### Issue: "Invalid N8N response format"

**Cause**: N8N response không có field `output`

**Solution**:
- Check N8N workflow output format
- Đảm bảo response là: `{ "output": "markdown content" }`
- Check console logs để xem actual response

## 📊 Monitoring

### Check N8N Calls:

In server terminal, you'll see logs:
```
N8N API error response: ...
Error calling N8N agent: ...
```

### Check Database:

Messages được lưu vào database:
1. Vào Supabase Dashboard
2. Table Editor → `messages`
3. Filter by `conversation_id`
4. Check `content` field có markdown

## 🚀 Next Steps

### Tối ưu hóa N8N Integration:

1. **Add streaming** cho real-time response:
   - Sử dụng Server-Sent Events (SSE)
   - Update UI khi nhận từng chunk

2. **Add retry logic**:
   - Retry 3 lần nếu N8N fails
   - Exponential backoff

3. **Add timeout**:
   - Set timeout 30s cho N8N call
   - Hiển thị warning nếu quá lâu

4. **Caching**:
   - Cache responses cho common questions
   - Giảm calls tới N8N

5. **Analytics**:
   - Track N8N response time
   - Monitor error rate
   - Log user satisfaction

### Improve Markdown Rendering:

1. **Add syntax highlighting** cho code blocks:
   ```bash
   npm install react-syntax-highlighter
   ```

2. **Add copy button** cho code blocks

3. **Add LaTeX support** cho math equations:
   ```bash
   npm install remark-math rehype-katex
   ```

4. **Custom components**:
   - Images với lightbox
   - Videos với custom player
   - Interactive charts

## 📝 Example Conversations

### Example 1: Simple Question
**User**: "Nhà Trần thành lập năm nào?"
**AI Response** (markdown):
```markdown
Nhà Trần được thành lập vào năm **1225**, do **Trần Thủ Độ** hỗ trợ **Trần Cảnh** lên ngôi hoàng đế.
```

### Example 2: Detailed Answer
**User**: "Giới thiệu về chiến thắng Bạch Đằng"
**AI Response** (markdown):
```markdown
## Chiến thắng Bạch Đằng

Chiến thắng Bạch Đằng là một trong những chiến công vĩ đại nhất trong lịch sử Việt Nam:

### Ba lần chiến thắng:
1. **938** - Ngô Quyền đánh quân Nam Hán
2. **981** - Lê Hoàn đánh quân Tống
3. **1288** - Trần Hưng Đạo đánh quân Nguyên-Mông

### Chiến thuật:
- Đóng cọc sông Bạch Đằng khi thủy triều xuống
- Dụ địch vào sông khi thủy triều lên
- Chặn đường rút lui và tiêu diệt

> "Kẻ thù là biển lớn, ta là bờ vững"
```

## 🎯 Benefits

✅ **Real AI Integration**: Sử dụng N8N workflow với AI thật
✅ **Rich Content**: Markdown hỗ trợ format phong phú
✅ **Scalable**: Dễ thay đổi AI backend bằng cách update N8N workflow
✅ **Maintainable**: Tách biệt AI logic khỏi frontend code
✅ **Flexible**: N8N có thể kết nối nhiều AI providers (OpenAI, Claude, Gemini, etc.)
✅ **Session Management**: `sessionId` giúp duy trì context giữa các messages

## 🔐 Security Notes

- ⚠️ N8N webhook URL exposed trong `.env` (server-side only)
- ✅ Chat API validates user ownership trước khi gọi N8N
- ✅ RLS policies đảm bảo users chỉ access own data
- ✅ Service role key không expose ra client

## 📚 Related Files

- [.env](.env) - Environment configuration
- [app/api/chat/route.ts](app/api/chat/route.ts) - N8N integration
- [components/chatbot/ChatPane.tsx](components/chatbot/ChatPane.tsx) - Markdown rendering
- [app/globals.css](app/globals.css) - Typography plugin
- [lib/chatbotService.ts](lib/chatbotService.ts) - Database operations

## ✨ Kết quả

Bây giờ chatbot của bạn đã:
- ✅ Kết nối với N8N AI agent thực
- ✅ Gửi câu hỏi với conversation context (sessionId)
- ✅ Nhận và render markdown responses đẹp
- ✅ Fallback sang mock nếu N8N fails
- ✅ Lưu tất cả messages vào database
- ✅ Hỗ trợ đầy đủ markdown features (bold, lists, code, etc.)

🎉 **Chatbot sẵn sàng sử dụng với AI thật!**
