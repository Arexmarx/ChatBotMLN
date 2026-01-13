# Hướng dẫn chạy Chatbot với Database thực

## Bước 1: Apply Migration vào Supabase

### Option A: Sử dụng Supabase Dashboard (Khuyến nghị)

1. Truy cập [Supabase Dashboard](https://supabase.com/dashboard)
2. Chọn project của bạn: `acqdgxrfnarqulygciuq`
3. Vào **SQL Editor** (biểu tượng cơ sở dữ liệu bên trái)
4. Mở file `supabase-migration.sql` trong workspace
5. Copy toàn bộ nội dung
6. Paste vào SQL Editor
7. Click **Run** hoặc nhấn `Ctrl+Enter`
8. Kiểm tra kết quả - nên thấy "Success. No rows returned"

### Option B: Sử dụng Supabase CLI

```bash
# Install Supabase CLI (nếu chưa cài)
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref acqdgxrfnarqulygciuq

# Apply migration
supabase db push
```

## Bước 2: Cập nhật Environment Variables

Mở file `.env` và đảm bảo có đủ các biến sau:

```env
NEXT_PUBLIC_SUPABASE_URL=https://acqdgxrfnarqulygciuq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Cloudinary (optional, for avatar uploads)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dkzn3xjwt
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=ml_default
```

### Lấy Service Role Key:

1. Vào [Supabase Dashboard](https://supabase.com/dashboard)
2. Chọn project
3. **Settings** → **API**
4. Tìm **service_role** key trong phần "Project API keys"
5. Click **Reveal** và copy key
6. Paste vào `.env` file

⚠️ **QUAN TRỌNG**: Service role key có quyền admin, KHÔNG BAO GIỜ commit vào Git!

## Bước 3: Verify Tables đã được tạo

Trong Supabase Dashboard:

1. Vào **Table Editor** (biểu tượng bảng bên trái)
2. Kiểm tra các bảng sau đã được tạo:
   - ✅ `profiles`
   - ✅ `folders`
   - ✅ `conversations`
   - ✅ `messages`
   - ✅ `templates`

3. Click vào từng bảng để xem cấu trúc

## Bước 4: Test chức năng

### 4.1. Restart Development Server

```bash
# Stop server (Ctrl+C)
# Start lại
npm run dev
```

### 4.2. Login

1. Mở http://localhost:3000
2. Click **Đăng nhập**
3. Đăng nhập bằng Google OAuth
4. Sau khi login thành công, profile sẽ tự động được tạo trong database

### 4.3. Test Chatbot

1. Vào `/chat` hoặc click vào chatbot UI
2. **Tạo conversation mới**:
   - Click "New Chat"
   - Conversation sẽ được lưu vào database
   
3. **Gửi message**:
   - Nhập tin nhắn và gửi
   - Message sẽ được lưu vào database
   - Bot sẽ trả lời (mock response)
   
4. **Tạo folder**:
   - Click "Create folder" trong sidebar
   - Nhập tên folder
   - Folder sẽ được lưu vào database
   
5. **Pin conversation**:
   - Click icon pin trên conversation
   - Status sẽ được cập nhật trong database
   
6. **Edit message**:
   - Click edit trên message
   - Thay đổi nội dung
   - Message sẽ được cập nhật trong database với `edited_at` timestamp

## Bước 5: Verify Database Changes

Sau khi test, kiểm tra dữ liệu trong Supabase:

1. Vào **Table Editor**
2. Mở bảng `conversations` - nên thấy conversation vừa tạo
3. Mở bảng `messages` - nên thấy messages của bạn
4. Check `message_count` trong `conversations` - nên tự động tăng
5. Check `preview` trong `conversations` - nên là đoạn đầu của message cuối

## Các tính năng đã hoạt động

✅ **Authentication**: Login với Google OAuth
✅ **Profiles**: Auto-create khi login lần đầu
✅ **Conversations**: CRUD operations
✅ **Messages**: Gửi/nhận/chỉnh sửa messages
✅ **Folders**: Tạo/xóa/đổi tên folders
✅ **Templates**: Quản lý message templates
✅ **Pin**: Pin/unpin conversations
✅ **Auto-updates**: Message count, preview, title tự động cập nhật
✅ **RLS**: Row Level Security đảm bảo users chỉ thấy data của mình

## Troubleshooting

### Issue: "Failed to create conversation"

**Nguyên nhân**: Service role key chưa được cập nhật
**Giải pháp**: 
1. Kiểm tra file `.env` có `SUPABASE_SERVICE_ROLE_KEY`
2. Restart dev server sau khi update `.env`

### Issue: "Unauthorized" error

**Nguyên nhân**: User chưa login hoặc session expired
**Giải pháp**: Logout và login lại

### Issue: Messages không hiển thị

**Nguyên nhân**: Conversation messages chưa được load
**Giải pháp**: Click vào conversation để trigger load messages

### Issue: RLS policy blocking access

**Nguyên nhân**: Database policies chưa được apply đúng
**Giải pháp**: 
1. Re-run migration SQL
2. Kiểm tra trong Supabase Authentication -> Users có user của bạn
3. Check `auth.uid()` returns correct user ID

### Issue: Slow queries

**Giải pháp**:
1. Verify indexes đã được tạo (check trong Database -> Indexes)
2. Use pagination cho messages (implement lazy loading)
3. Cache conversations list trong React Query hoặc SWR

## Tích hợp AI thật (Optional)

Hiện tại bot đang dùng mock responses. Để tích hợp AI thật:

### Option 1: OpenAI

1. Đăng ký tài khoản tại https://platform.openai.com
2. Tạo API key
3. Thêm vào `.env`:
   ```env
   OPENAI_API_KEY=sk-...your-key...
   ```
4. Uncomment code trong `app/api/chat/route.ts`
5. Replace `generateMockResponse()` bằng `callOpenAI()`

### Option 2: Google Gemini

1. Đăng ký tại https://ai.google.dev
2. Lấy API key
3. Install SDK: `npm install @google/generative-ai`
4. Implement trong `app/api/chat/route.ts`

### Option 3: Anthropic Claude

1. Đăng ký tại https://console.anthropic.com
2. Lấy API key
3. Install SDK: `npm install @anthropic-ai/sdk`
4. Implement trong `app/api/chat/route.ts`

## Next Steps

- [ ] Implement real AI integration
- [ ] Add real-time subscriptions (Supabase Realtime)
- [ ] Add message streaming for better UX
- [ ] Implement conversation search
- [ ] Add export conversation feature
- [ ] Add conversation sharing
- [ ] Implement rate limiting
- [ ] Add analytics/usage tracking

## Database Maintenance

### Backup

```bash
# Backup database
supabase db dump -f backup-$(date +%Y%m%d).sql

# Restore
supabase db reset
supabase db push backup-20260113.sql
```

### Clean old conversations

```sql
-- Delete conversations older than 6 months with no messages
DELETE FROM conversations
WHERE message_count = 0
  AND updated_at < NOW() - INTERVAL '6 months';
```

## Support

Nếu gặp vấn đề:
1. Check browser console (F12) cho errors
2. Check server logs trong terminal
3. Check Supabase logs trong Dashboard -> Logs
4. Verify RLS policies trong Table Editor -> Policies
