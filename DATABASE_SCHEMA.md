# Chatbot Database Schema

## Entity Relationship Diagram

```
┌─────────────────────┐
│   auth.users        │
│  (Supabase Auth)    │
└──────────┬──────────┘
           │
           │ 1:1
           ▼
┌─────────────────────┐
│     profiles        │
├─────────────────────┤
│ • user_id (PK, FK)  │
│ • full_name         │
│ • avatar_url        │
│ • created_at        │
│ • updated_at        │
└──────────┬──────────┘
           │
           │ owns (1:N)
           ├──────────────────────────────────┬─────────────────────┐
           ▼                                  ▼                     ▼
┌─────────────────────┐            ┌─────────────────────┐  ┌─────────────────────┐
│      folders        │            │   conversations     │  │     templates       │
├─────────────────────┤            ├─────────────────────┤  ├─────────────────────┤
│ • id (PK)           │◄───┐       │ • id (PK)           │  │ • id (PK)           │
│ • user_id (FK)      │    │       │ • user_id (FK)      │  │ • user_id (FK)      │
│ • name (unique)     │    │       │ • folder_id (FK)    │  │ • name (unique)     │
│ • created_at        │    │       │ • title             │  │ • content           │
│ • updated_at        │    │       │ • preview           │  │ • snippet           │
└─────────────────────┘    │       │ • pinned            │  │ • created_at        │
                           │       │ • message_count     │  │ • updated_at        │
                      N:1  │       │ • created_at        │  └─────────────────────┘
                           └───────┤ • updated_at        │
                                   └──────────┬──────────┘
                                              │
                                              │ contains (1:N)
                                              ▼
                                   ┌─────────────────────┐
                                   │      messages       │
                                   ├─────────────────────┤
                                   │ • id (PK)           │
                                   │ • conversation_id   │
                                   │   (FK)              │
                                   │ • role              │
                                   │   (user/assistant)  │
                                   │ • content           │
                                   │ • created_at        │
                                   │ • edited_at         │
                                   └─────────────────────┘
```

## Relationships

### 1. auth.users → profiles (1:1)
- Mỗi user có 1 profile
- Profile tự động tạo khi user đăng nhập lần đầu
- Cascade delete: Xóa user → xóa profile

### 2. profiles → folders (1:N)
- User có thể tạo nhiều folders
- Mỗi folder thuộc về 1 user
- Cascade delete: Xóa user → xóa tất cả folders

### 3. profiles → conversations (1:N)
- User có thể có nhiều conversations
- Mỗi conversation thuộc về 1 user
- Cascade delete: Xóa user → xóa tất cả conversations

### 4. folders → conversations (1:N, optional)
- Folder có thể chứa nhiều conversations
- Conversation có thể không thuộc folder nào (NULL)
- Set NULL on delete: Xóa folder → conversations.folder_id = NULL

### 5. conversations → messages (1:N)
- Conversation chứa nhiều messages
- Mỗi message thuộc về 1 conversation
- Cascade delete: Xóa conversation → xóa tất cả messages

### 6. profiles → templates (1:N)
- User có thể tạo nhiều templates
- Mỗi template thuộc về 1 user
- Cascade delete: Xóa user → xóa tất cả templates

## Data Flow

### Tạo Conversation Mới
```
1. User clicks "New Chat"
2. Insert into conversations (user_id, title="New Chat")
3. User gửi message đầu tiên
4. Insert into messages (conversation_id, role="user", content)
5. Trigger: auto_title_conversation → Update conversation.title
6. Trigger: update_conversation_stats → Update message_count, preview
```

### Gửi Message
```
1. User nhập tin nhắn
2. Insert into messages (conversation_id, role="user", content)
3. Trigger: update_conversation_stats → Update conversation stats
4. Call AI API
5. Insert into messages (conversation_id, role="assistant", content)
6. Trigger: update_conversation_stats → Update lại stats
7. Update conversation.updated_at → Đẩy lên đầu list
```

### Chỉnh sửa Message
```
1. User clicks edit
2. Update messages SET content=?, edited_at=NOW()
3. Trigger: update_conversation_stats → Update preview
```

### Xóa Message
```
1. User deletes message
2. Delete from messages WHERE id=?
3. Trigger: update_conversation_stats → Decrement message_count
4. Trigger: update_conversation_stats → Update preview to last message
```

## Query Patterns

### Get Recent Conversations
```sql
SELECT * FROM conversations
WHERE user_id = $1
ORDER BY updated_at DESC
LIMIT 10;
```

### Get Pinned Conversations
```sql
SELECT * FROM conversations
WHERE user_id = $1 AND pinned = TRUE
ORDER BY updated_at DESC;
```

### Get Conversations by Folder
```sql
SELECT c.*, f.name as folder_name
FROM conversations c
LEFT JOIN folders f ON c.folder_id = f.id
WHERE c.user_id = $1 AND f.name = $2
ORDER BY c.updated_at DESC;
```

### Get Conversation with Messages
```sql
SELECT 
  c.*,
  json_agg(
    json_build_object(
      'id', m.id,
      'role', m.role,
      'content', m.content,
      'created_at', m.created_at,
      'edited_at', m.edited_at
    ) ORDER BY m.created_at
  ) as messages
FROM conversations c
LEFT JOIN messages m ON m.conversation_id = c.id
WHERE c.id = $1
GROUP BY c.id;
```

### Search Conversations
```sql
SELECT * FROM conversations
WHERE user_id = $1
  AND (
    title ILIKE '%' || $2 || '%'
    OR preview ILIKE '%' || $2 || '%'
  )
ORDER BY updated_at DESC;
```

## Performance Considerations

### Indexes Created
```sql
-- User lookups
CREATE INDEX conversations_user_id_idx ON conversations(user_id);
CREATE INDEX messages_conversation_id_idx ON messages(conversation_id);
CREATE INDEX folders_user_id_idx ON folders(user_id);
CREATE INDEX templates_user_id_idx ON templates(user_id);

-- Sorting & filtering
CREATE INDEX conversations_updated_at_idx ON conversations(updated_at DESC);
CREATE INDEX conversations_pinned_idx ON conversations(pinned) WHERE pinned = TRUE;
CREATE INDEX messages_created_at_idx ON messages(created_at);
```

### Query Optimization Tips

1. **Always filter by user_id first** - Sử dụng RLS policies
2. **Use LIMIT** - Không load toàn bộ conversations
3. **Pagination** - Implement cursor-based pagination cho messages
4. **Lazy load messages** - Chỉ load messages khi user mở conversation
5. **Cache frequently accessed data** - Sử dụng React Query hoặc SWR

## Security

### Row Level Security (RLS)

All tables have RLS enabled with policies:

```sql
-- Example: conversations table
CREATE POLICY "Users can manage own conversations"
  ON conversations
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

This ensures:
- ✅ Users can only see their own data
- ✅ Users cannot modify other users' data
- ✅ SQL injection attacks are mitigated
- ✅ API keys alone cannot access user data

### Best Practices

1. **Always use service role key for server-side operations**
2. **Never expose service role key to client**
3. **Validate user ownership before operations**
4. **Use prepared statements to prevent SQL injection**
5. **Audit sensitive operations (deletes, updates)**

## Scalability

### Current Limits (Supabase Free Tier)
- 500 MB database storage
- 1 GB file storage
- 2 GB bandwidth

### Growth Considerations

**When you reach ~1000 conversations per user:**
- Consider archiving old conversations
- Implement soft deletes
- Add pagination to all lists

**When you reach ~10,000 messages per conversation:**
- Split messages into chunks
- Lazy load older messages
- Consider message compression

**When you reach ~100,000 total users:**
- Upgrade to paid Supabase plan
- Consider database read replicas
- Implement caching layer (Redis)
- Use CDN for static assets

## Backup & Recovery

### Automatic Backups (Supabase)
- Daily backups (retained 7 days)
- Point-in-time recovery available on paid plans

### Manual Backup
```bash
# Export all data
supabase db dump -f backup.sql

# Restore from backup
supabase db reset
psql -h <your-db-host> -U postgres -d postgres -f backup.sql
```

## Migration Strategy

### Adding New Features

**Example: Add conversation tags**

1. Create migration file:
```sql
-- Add tags table
CREATE TABLE conversation_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE conversation_tags ENABLE ROW LEVEL SECURITY;

-- Add policy
CREATE POLICY "Users can manage tags in own conversations"
  ON conversation_tags
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = conversation_tags.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );
```

2. Update TypeScript types
3. Add service functions
4. Update UI components
