import Swal from 'sweetalert2';

/**
 * Login Handler Utility
 * 
 * Xử lý đăng nhập form submission sử dụng Fetch API
 * Tích hợp với backend logic hiện tại và hiển thị SweetAlert2 popups
 * 
 * @param {string} username - Tên đăng nhập hoặc email
 * @param {string} password - Mật khẩu
 * @param {Function} setLoading - Function để set loading state
 * @param {Function} onSuccess - Callback khi đăng nhập thành công
 * @param {Function} onError - Callback khi có lỗi (tùy chọn)
 * @returns {Promise<Object>} Kết quả đăng nhập
 */
export const handleLoginSubmit = async (
  username,
  password,
  setLoading,
  onSuccess,
  onError = null
) => {
  // Validate input
  if (!username || !password) {
    await Swal.fire({
      icon: 'error',
      title: 'Lỗi',
      text: 'Vui lòng nhập tên đăng nhập và mật khẩu',
      confirmButtonColor: '#dc2626',
      confirmButtonText: 'OK'
    });
    return { success: false, error: 'Missing credentials' };
  }

  // Set loading state
  setLoading(true);

  try {
    // Get API base URL from environment variables
    const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';
    const loginUrl = `${baseURL}/auth/login`;

    // Prepare request body
    const requestBody = {
      username: username.trim(),
      password: password
    };

    // Make fetch request
    const response = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody),
      credentials: 'include' // Include cookies for session management
    });

    // Parse JSON response
    const data = await response.json();

    // Handle different response scenarios
    if (!response.ok) {
      // Handle specific error messages from backend
      const errorMessage = data.message || data.error || 'Đăng nhập thất bại';

      // Check for "Username not found" error
      if (errorMessage === 'Username not found' || 
          errorMessage.toLowerCase().includes('username not found') ||
          errorMessage.toLowerCase().includes('tài khoản không tồn tại')) {
        await Swal.fire({
          icon: 'error',
          title: 'Tài khoản không tồn tại',
          text: 'Tên đăng nhập không tìm thấy trong hệ thống. Vui lòng kiểm tra lại.',
          confirmButtonColor: '#dc2626',
          confirmButtonText: 'OK'
        });

        if (onError) onError(errorMessage);
        return { success: false, error: errorMessage };
      }

      // Check for "Incorrect password" error
      if (errorMessage === 'Incorrect password' || 
          errorMessage.toLowerCase().includes('incorrect password') ||
          errorMessage.toLowerCase().includes('mật khẩu không đúng') ||
          errorMessage.toLowerCase().includes('sai mật khẩu')) {
        await Swal.fire({
          icon: 'error',
          title: 'Mật khẩu không hợp lệ',
          text: 'Mật khẩu bạn nhập không đúng. Vui lòng kiểm tra lại.',
          confirmButtonColor: '#dc2626',
          confirmButtonText: 'OK'
        });

        if (onError) onError(errorMessage);
        return { success: false, error: errorMessage };
      }

      // Handle other errors
      await Swal.fire({
        icon: 'error',
        title: 'Đăng nhập thất bại',
        text: errorMessage,
        confirmButtonColor: '#dc2626',
        confirmButtonText: 'OK'
      });

      if (onError) onError(errorMessage);
      return { success: false, error: errorMessage };
    }

    // Login successful - handle success response
    const token = data.token || data.accessToken;
    const refreshToken = data.refreshToken;
    const userInfo = data.userInfo || data.user || {};
    const userRole = data.role || userInfo.role || userInfo.roles?.[0];

    // Store token in localStorage
    if (token) {
      localStorage.setItem('token', token);
      const expiresIn = data.expiresIn || 3600; // Default 1 hour
      const expiryTime = Date.now() + expiresIn * 1000;
      localStorage.setItem('tokenExpiry', expiryTime.toString());
    }

    // Store refresh token if available
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }

    // Store user info
    if (userInfo) {
      localStorage.setItem('user', JSON.stringify({
        id: data.id || userInfo.id,
        username: data.username || userInfo.username,
        fullName: data.fullName || userInfo.fullName || userInfo.name,
        email: data.email || userInfo.email,
        role: userRole,
        avatar: data.avatar || userInfo.avatar,
        phone: data.phone || userInfo.phone,
        permissions: data.permissions || userInfo.permissions || [],
        ...userInfo
      }));
    }

    // Show success popup
    await Swal.fire({
      icon: 'success',
      title: 'Đăng nhập thành công!',
      text: 'Chào mừng bạn quay trở lại.',
      timer: 2000,
      timerProgressBar: true,
      showConfirmButton: false,
      didClose: () => {
        // Determine redirect path based on role
        const roleRoutes = {
          'ADMIN': '/admin',
          'MANAGER': '/manager',
          'TEACHER': '/teacher-dashboard',
          'STAFF': '/staff',
          'STUDENT': '/learner-dashboard',
          'LEARNER': '/learner-dashboard'
        };

        const redirectPath = roleRoutes[userRole] || '/dashboard';

        // Call success callback with user data
        if (onSuccess) {
          onSuccess({
            ...data,
            userInfo: {
              id: data.id || userInfo.id,
              username: data.username || userInfo.username,
              fullName: data.fullName || userInfo.fullName || userInfo.name,
              email: data.email || userInfo.email,
              role: userRole,
              avatar: data.avatar || userInfo.avatar,
              phone: data.phone || userInfo.phone,
              permissions: data.permissions || userInfo.permissions || [],
              ...userInfo
            },
            role: userRole
          });
        }

        // Redirect to dashboard
        window.location.href = redirectPath;
      }
    });

    return {
      success: true,
      ...data,
      userInfo: {
        id: data.id || userInfo.id,
        username: data.username || userInfo.username,
        fullName: data.fullName || userInfo.fullName || userInfo.name,
        email: data.email || userInfo.email,
        role: userRole,
        avatar: data.avatar || userInfo.avatar,
        phone: data.phone || userInfo.phone,
        permissions: data.permissions || userInfo.permissions || [],
        ...userInfo
      },
      role: userRole
    };

  } catch (error) {
    console.error('Login error:', error);

    // Handle network errors
    let errorMessage = 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.';

    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      errorMessage = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng của bạn.';
    } else if (error.message) {
      errorMessage = error.message;
    }

    // Show error popup
    await Swal.fire({
      icon: 'error',
      title: 'Lỗi kết nối',
      text: errorMessage,
      confirmButtonColor: '#dc2626',
      confirmButtonText: 'OK'
    });

    if (onError) onError(errorMessage);
    return { success: false, error: errorMessage };

  } finally {
    // Always clear loading state
    setLoading(false);
  }
};

/**
 * Logout Handler Utility
 * 
 * Xử lý đăng xuất và xóa dữ liệu local
 * 
 * @param {Function} setLoading - Function để set loading state (tùy chọn)
 * @returns {Promise<void>}
 */
export const handleLogout = async (setLoading = null) => {
  if (setLoading) setLoading(true);

  try {
    // Call logout API if available
    const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';
    const logoutUrl = `${baseURL}/auth/logout`;

    await fetch(logoutUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      credentials: 'include'
    });

  } catch (error) {
    console.error('Logout error:', error);
    // Continue with local cleanup even if API call fails
  } finally {
    // Always clear local data
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tokenExpiry');
    localStorage.removeItem('user');

    if (setLoading) setLoading(false);

    // Redirect to login page
    window.location.href = '/login';
  }
};

/**
 * Validate login form input
 * 
 * @param {string} username - Tên đăng nhập
 * @param {string} password - Mật khẩu
 * @returns {Object} Validation result with errors object
 */
export const validateLoginForm = (username, password) => {
  const errors = {};

  // Validate username
  if (!username || !username.trim()) {
    errors.username = 'Tên đăng nhập là bắt buộc';
  } else if (username.length < 3) {
    errors.username = 'Tên đăng nhập phải có ít nhất 3 ký tự';
  } else if (!/^[a-zA-Z0-9_@.-]+$/.test(username)) {
    errors.username = 'Tên đăng nhập chỉ được chứa chữ cái, số và các ký tự đặc biệt: _@.-';
  }

  // Validate password
  if (!password) {
    errors.password = 'Mật khẩu là bắt buộc';
  } else if (password.length < 6) {
    errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export default {
  handleLoginSubmit,
  handleLogout,
  validateLoginForm
};
