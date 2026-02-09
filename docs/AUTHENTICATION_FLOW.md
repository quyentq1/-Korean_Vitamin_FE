# Luồng Xác Thực (Authentication Flow)

## Tổng quan

Tài liệu này mô tả luồng xác thực toàn diện đã được triển khai cho ứng dụng web Korean Vitamin. Luồng xác thực bao gồm các tính năng nâng cao về bảo mật, xử lý lỗi và quản lý session.

## Kiến trúc

### Các thành phần chính

1. **AuthContext** (`src/contexts/AuthContext.jsx`)
   - Quản lý trạng thái xác thực toàn ứng dụng
   - Cung cấp các phương thức login/logout
   - Tự động refresh token khi hết hạn
   - Quản lý session timeout
   - Hỗ trợ role-based access control

2. **ProtectedRoute** (`src/components/routing/ProtectedRoute.jsx`)
   - Bảo vệ các route theo trạng thái xác thực
   - Hỗ trợ role-based routing
   - Redirect tự động khi chưa đăng nhập hoặc không có quyền

3. **authService** (`src/services/authService.js`)
   - Gọi các API xác thực
   - Quản lý token và refresh token
   - Hỗ trợ các tính năng: quên mật khẩu, đổi mật khẩu, 2FA

4. **axiosClient** (`src/api/axiosClient.js`)
   - Tự động thêm token vào headers
   - Xử lý lỗi chi tiết với thông báo thân thiện
   - Tự động refresh token khi hết hạn
   - Request/response logging (development)

5. **Login Page** (`src/pages/Login.jsx`)
   - Giao diện đăng nhập hiện đại
   - Validation form chi tiết
   - Error handling với thông báo thân thiện
   - Role-based redirect sau khi đăng nhập

## Luồng xác thực

### 1. Đăng nhập (Login)

```
User nhập thông tin
    ↓
Validation form (client-side)
    ↓
Gọi API /auth/login
    ↓
API trả về token và thông tin user
    ↓
Lưu token vào localStorage
    ↓
Lưu thông tin user vào AuthContext
    ↓
Redirect theo role hoặc trang trước đó
```

### 2. Xử lý lỗi đăng nhập

Luồng xử lý lỗi chi tiết:

```
API trả về lỗi
    ↓
axiosClient interceptors xử lý lỗi
    ↓
Tạo error object chi tiết
    ↓
Phân loại lỗi (network, timeout, server, client, auth)
    ↓
Trả về thông báo lỗi thân thiện
    ↓
Hiển thị trên UI
```

### 3. Refresh Token

```
Token hết hạn (401)
    ↓
Kiểm tra nếu đang refresh
    ↓
Nếu không: Gọi API /auth/refresh-token
    ↓
Lưu token mới
    ↓
Thử lại request gốc
    ↓
Nếu thất bại: Logout và redirect
```

### 4. Session Timeout

```
User hoạt động
    ↓
Cập nhật lastActivity
    ↓
Kiểm tra mỗi phút
    ↓
Nếu > 30 phút không hoạt động
    ↓
Logout tự động
    ↓
Redirect về trang login
```

## Role-Based Access Control

### Các role được hỗ trợ

| Role | Mô tả | Route mặc định |
|------|-------|---------------|
| ADMIN | Quản trị viên | /admin |
| MANAGER | Quản lý | /manager |
| TEACHER | Giáo viên | /teacher-dashboard |
| STAFF | Nhân viên | /staff |
| STUDENT/LEARNER | Học viên | /learner-dashboard |

### Sử dụng ProtectedRoute

```jsx
import { ProtectedRoute, AdminRoute, TeacherRoute } from './components/routing/ProtectedRoute';

// Route yêu cầu đăng nhập
<Route path="/dashboard" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />

// Route chỉ cho Admin
<Route path="/admin" element={
  <AdminRoute>
    <AdminDashboard />
  </AdminRoute>
} />

// Route chỉ cho Teacher
<Route path="/teacher" element={
  <TeacherRoute>
    <TeacherDashboard />
  </TeacherRoute>
} />
```

### Sử dụng AuthContext trong Component

```jsx
import { useAuth } from '../contexts/AuthContext';

const MyComponent = () => {
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    login, 
    logout, 
    hasRole, 
    hasPermission 
  } = useAuth();

  // Kiểm tra role
  if (hasRole('ADMIN')) {
    // Hiển thị nội dung admin
  }

  // Kiểm tra quyền
  if (hasPermission('manage_users')) {
    // Hiển thị nút quản lý user
  }

  // Login
  const handleLogin = async () => {
    const result = await login(username, password, rememberMe);
    if (result.success) {
      // Login thành công
    }
  };

  // Logout
  const handleLogout = () => {
    logout({ reason: 'USER_LOGOUT' });
  };

  return <div>...</div>;
};
```

## Error Handling

### Các loại lỗi được xử lý

1. **Network Error**
   - Không thể kết nối đến server
   - Timeout request
   - Thông báo: "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng của bạn."

2. **Authentication Error (401)**
   - Token hết hạn hoặc không hợp lệ
   - Tự động refresh token hoặc redirect về login
   - Thông báo: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."

3. **Authorization Error (403)**
   - Không có quyền truy cập
   - Redirect về trang unauthorized
   - Thông báo: "Bạn không có quyền thực hiện hành động này."

4. **Server Error (5xx)**
   - Lỗi server
   - Thông báo: "Lỗi máy chủ. Vui lòng thử lại sau."

5. **Rate Limiting (429)**
   - Quá nhiều request
   - Thông báo: "Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau."

### Xử lý lỗi trong component

```jsx
const handleSubmit = async () => {
  try {
    const result = await login(username, password);
    if (result.success) {
      // Xử lý thành công
    } else {
      // Hiển thị lỗi từ result.error
      setError(result.error);
    }
  } catch (error) {
    // Xử lý lỗi từ API
    if (error.isNetworkError) {
      setError('Lỗi kết nối mạng');
    } else if (error.isAuthError) {
      setError('Lỗi xác thực');
    } else {
      setError(error.message || 'Đã xảy ra lỗi');
    }
  }
};
```

## Bảo mật

### Các tính năng bảo mật

1. **Token Storage**
   - Token được lưu trong localStorage (có thể chuyển sang httpOnly cookie)
   - Refresh token được lưu riêng biệt
   - Token expiry time được lưu để kiểm tra

2. **Token Management**
   - Tự động thêm token vào headers của mọi request
   - Tự động refresh token khi hết hạn
   - Xóa token khi logout hoặc session hết hạn

3. **Session Management**
   - Session timeout sau 30 phút không hoạt động
   - Cảnh báo trước 5 phút khi session sắp hết hạn
   - Tự động logout khi session hết hạn

4. **Role-Based Access**
   - Kiểm tra role trước khi truy cập route
   - Kiểm tra quyền trước khi thực hiện action
   - Admin có mọi quyền

### Các API endpoints

| Endpoint | Method | Mô tả | Auth |
|----------|--------|-------|------|
| /auth/login | POST | Đăng nhập | Public |
| /auth/register | POST | Đăng ký | Public |
| /auth/logout | POST | Đăng xuất | Private |
| /auth/refresh-token | POST | Refresh token | Public |
| /auth/forgot-password | POST | Quên mật khẩu | Public |
| /auth/reset-password | POST | Đặt lại mật khẩu | Public |
| /auth/change-password | POST | Đổi mật khẩu | Private |
| /auth/verify-email | POST | Xác thực email | Public |
| /auth/resend-verification | POST | Gửi lại email xác thực | Public |
| /auth/2fa/setup | POST | Thiết lập 2FA | Private |
| /auth/2fa/verify | POST | Xác thực 2FA | Private |
| /auth/2fa/disable | POST | Vô hiệu hóa 2FA | Private |

## Cấu hình Environment Variables

```env
# .env.development
VITE_API_BASE_URL=http://localhost:3000/api

# .env.production
VITE_API_BASE_URL=https://api.koreanvitamin.com/api
```

## Testing

### Test case cho Login

```jsx
// Test đăng nhập thành công
test('Login thành công với thông tin đúng', async () => {
  const result = await login('testuser', 'password123');
  expect(result.success).toBe(true);
  expect(result.user).toBeDefined();
});

// Test đăng nhập thất bại với thông tin sai
test('Login thất bại với thông tin sai', async () => {
  const result = await login('wronguser', 'wrongpassword');
  expect(result.success).toBe(false);
  expect(result.error).toBeDefined();
});

// Test role-based redirect
test('Redirect đúng theo role', async () => {
  await login('admin', 'password');
  expect(navigate).toHaveBeenCalledWith('/admin');
});
```

## Troubleshooting

### Vấn đề thường gặp

1. **Token không được lưu**
   - Kiểm tra localStorage có được bật không
   - Kiểm tra API response có chứa token không

2. **Refresh token không hoạt động**
   - Kiểm tra refresh token được lưu đúng không
   - Kiểm tra endpoint /auth/refresh-token có hoạt động không

3. **Session timeout quá nhanh**
   - Kiểm tra cấu hình SESSION_TIMEOUT trong AuthContext
   - Kiểm tra updateLastActivity được gọi đúng không

4. **Redirect không hoạt động**
   - Kiểm tra getDefaultRoute trả về đúng path không
   - Kiểm tra role của user được lưu đúng không

## Tài liệu tham khảo

- [React Context API](https://react.dev/reference/react/useContext)
- [React Router](https://reactrouter.com/)
- [Axios Interceptors](https://axios-http.com/docs/interceptors)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

## Changelog

### Version 1.0.0 (2025-02-07)
- Khởi tạo luồng xác thực toàn diện
- Tạo AuthContext với session management
- Tạo ProtectedRoute với role-based access
- Cải thiện authService với các API nâng cao
- Cải thiện axiosClient với error handling chi tiết
- Cập nhật Login page với validation và error handling
- Cập nhật App.jsx với protected routes
