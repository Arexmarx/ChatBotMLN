# 🔐 Google OAuth & User Profile Flow

## 📋 Tổng quan

Hệ thống authentication sử dụng Supabase OAuth + custom database để lưu trữ profile người dùng độc lập, không bị ghi đè khi đăng nhập lại.

---

## 🔄 Quy trình đăng nhập

### 1️⃣ **User Click "Đăng nhập Google"**
- File: `app/auth/page.tsx` → `handleGoogleLogin()`
- Gọi: `signInWithGoogle()` từ `app/api/authApi.ts`
- Redirect đến Google OAuth

### 2️⃣ **Google xác thực thành công**
- Google redirect về: `/authenticated?code=xxx`
- File: `app/authenticated/page.tsx`

### 3️⃣ **Xử lý OAuth callback**
```typescript
// 1. Exchange code cho session
await supabase.auth.exchangeCodeForSession(code)

// 2. Lấy thông tin user từ Google
const { data } = await supabase.auth.getUser()

// 3. Sync user với backend database
const syncedUser = await syncUserProfile(
  user.id,
  user.email,
  metadata.full_name,
  metadata.picture  // Avatar từ Google
)
```

### 4️⃣ **Backend API xử lý sync**
- File: `app/api/users/sync/route.ts`
- Logic:
  ```typescript
  // Tìm user trong bảng profiles
  const existingProfile = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .single()
  
  if (existingProfile) {
    // ✅ Đã tồn tại: Trả về profile hiện tại
    return existingProfile
  } else {
    // 🆕 Lần đầu: Tạo profile mới từ Google metadata
    const newProfile = await supabase
      .from("profiles")
      .insert({
        user_id: userId,
        full_name: fullName,
        avatar_url: avatarUrl  // Lưu avatar từ Google
      })
    return newProfile
  }
  ```

### 5️⃣ **AuthContext load profile**
- File: `context/AuthContext.tsx`
- Tự động load profile từ database khi user đăng nhập
- Expose `profile` cho toàn app

---

## 📸 Upload & Update Avatar

### 1️⃣ **User upload ảnh mới**
- File: `components/layout/EditProfileModal.tsx`
- Click "Thay đổi ảnh" → chọn file

### 2️⃣ **Upload lên Cloudinary**
```typescript
const uploadedAvatarUrl = await uploadImageToCloudinary(avatarFile)
// Trả về: https://res.cloudinary.com/.../avatar.jpg
```

### 3️⃣ **Cập nhật database**
```typescript
await upsertUserProfile(userId, fullName, uploadedAvatarUrl)
```

### 4️⃣ **Reload để hiển thị**
- `window.location.reload()` → AuthContext tự động load profile mới

---

## 🗄️ Cấu trúc Database

### Bảng: `profiles`
```sql
CREATE TABLE profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT,
  avatar_url TEXT,         -- URL của ảnh (Cloudinary hoặc Google)
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Row Level Security (RLS)
- ✅ User chỉ xem/sửa profile của chính mình
- ✅ Tự động insert profile khi đăng nhập lần đầu

---

## 🎯 Ưu điểm

### ✅ Avatar persistent
- Không bị mất khi đăng xuất/đăng nhập lại
- Không phụ thuộc vào OAuth provider metadata

### ✅ Dữ liệu độc lập
- Profile lưu trong database riêng
- Google chỉ dùng để xác thực, không ghi đè dữ liệu

### ✅ Upload tùy chỉnh
- User có thể thay avatar bất cứ lúc nào
- Ảnh lưu trên Cloudinary (CDN nhanh)

---

## 🔧 Các API Endpoints

### POST `/api/users/sync`
**Mục đích:** Sync user sau OAuth login

**Request:**
```json
{
  "userId": "uuid",
  "email": "user@gmail.com",
  "fullName": "Nguyen Van A",
  "avatarUrl": "https://lh3.googleusercontent.com/..."
}
```

**Response:**
```json
{
  "user": {
    "userId": "uuid",
    "email": "user@gmail.com",
    "fullName": "Nguyen Van A",
    "avatarUrl": "https://...",
    "isNewUser": false  // true nếu lần đầu đăng nhập
  }
}
```

---

## 🧩 Components sử dụng Profile

### 1. **Header** (`components/layout/Header.tsx`)
```typescript
const { user, profile } = useAuth()

// Hiển thị avatar
const avatarUrl = profile?.avatar_url || user?.user_metadata?.picture

// Hiển thị tên
const fullName = profile?.full_name || user?.email?.split('@')[0]
```

### 2. **Sidebar** (`components/chatbot/Sidebar.tsx`)
- Tương tự Header
- Ưu tiên `profile` từ database

### 3. **EditProfileModal** (`components/layout/EditProfileModal.tsx`)
- Upload ảnh lên Cloudinary
- Cập nhật profile trong database

---

## 📦 Dependencies

### Frontend
- `@supabase/supabase-js` - Auth & Database
- `framer-motion` - Animations
- `lucide-react` - Icons

### Backend
- Supabase PostgreSQL
- Cloudinary (Image CDN)

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=xxx
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=xxx
```

---

## 🚀 Deployment Checklist

- [ ] Chạy SQL migration trong Supabase (tạo bảng `profiles`)
- [ ] Cấu hình Google OAuth trong Supabase Dashboard
- [ ] Tạo Cloudinary upload preset (Unsigned mode)
- [ ] Set environment variables
- [ ] Test flow: Login → Upload avatar → Logout → Login lại

---

## 🐛 Troubleshooting

### Avatar bị mất sau khi đăng nhập lại
- ✅ Đã fix: Profile lưu trong database, không dùng user_metadata

### Upload ảnh lỗi "Upload preset must be whitelisted"
- Kiểm tra Cloudinary preset có **Signing mode = Unsigned**

### API `/api/users/sync` trả về 500
- Kiểm tra bảng `profiles` đã được tạo chưa
- Kiểm tra RLS policies trong Supabase

---

## 📚 File Structure

```
app/
├── api/
│   ├── authApi.ts              # Supabase auth helpers
│   └── users/
│       └── sync/
│           └── route.ts        # Sync user API endpoint
├── auth/
│   └── page.tsx                # Login page
└── authenticated/
    └── page.tsx                # OAuth callback handler

components/
└── layout/
    ├── Header.tsx              # Header with profile display
    └── EditProfileModal.tsx    # Avatar upload & update

context/
└── AuthContext.tsx             # Global auth state

lib/
├── supabaseClient.ts           # Supabase client
├── cloudinary.ts               # Cloudinary upload
├── profileService.ts           # Profile CRUD operations
└── userService.ts              # User sync service
```

---

**🎉 Flow hoàn chỉnh và avatar sẽ persistent!**
