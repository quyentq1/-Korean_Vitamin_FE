import axiosClient from '../api/axiosClient';

/**
 * AuthService - Quản lý các API liên quan đến xác thực
 * 
 * Các tính năng:
 * - Đăng nhập/Đăng ký/Đăng xuất
 * - Quản lý token và session
 * - Refresh token tự động
 * - Quên mật khẩu/Đặt lại mật khẩu
 * - Xác thực 2FA (Two-Factor Authentication)
 * - Xác thực email
 */

// Constants
const TOKEN_KEY = 'token';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'user';
const TOKEN_EXPIRY_KEY = 'tokenExpiry';

/**
 * Lưu trữ token và thông tin liên quan
 */
const tokenStorage = {
  setToken: (token, expiresIn) => {
    localStorage.setItem(TOKEN_KEY, token);
    if (expiresIn) {
      const expiryTime = Date.now() + expiresIn * 1000;
      localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
    }
  },
  
  getToken: () => {
    return localStorage.getItem(TOKEN_KEY);
  },
  
  setRefreshToken: (refreshToken) => {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },
  
  getRefreshToken: () => {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },
  
  clearTokens: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
  },
  
  isTokenExpired: () => {
    const expiryTime = localStorage.getItem(TOKEN_EXPIRY_KEY);
    if (!expiryTime) return false;
    return Date.now() > parseInt(expiryTime);
  }
};

/**
 * Chuẩn hóa dữ liệu người dùng từ API response
 */
const normalizeUserData = (response) => {
  const userInfo = response.userInfo || response.user || {};
  return {
    id: response.id || userInfo.id,
    username: response.username || userInfo.username,
    fullName: response.fullName || userInfo.fullName || userInfo.name,
    email: response.email || userInfo.email,
    role: response.role || response.roles?.[0] || userInfo.role || userInfo.roles?.[0],
    avatar: response.avatar || userInfo.avatar,
    phone: response.phone || userInfo.phone,
    permissions: response.permissions || userInfo.permissions || [],
    createdAt: response.createdAt || userInfo.createdAt,
    updatedAt: response.updatedAt || userInfo.updatedAt,
    ...userInfo
  };
};

export const authService = {
  /**
   * Đăng nhập người dùng
   * @param {string} username - Tên đăng nhập hoặc email
   * @param {string} password - Mật khẩu
   * @returns {Promise<Object>} Dữ liệu phản hồi từ API
   */
  login: async (username, password) => {
    try {
      const response = await axiosClient.post('/auth/login', { username, password });
      
      // Lưu token
      if (response.token || response.accessToken) {
        const token = response.token || response.accessToken;
        const refreshToken = response.refreshToken;
        const expiresIn = response.expiresIn || 3600; // Mặc định 1 giờ
        
        tokenStorage.setToken(token, expiresIn);
        if (refreshToken) {
          tokenStorage.setRefreshToken(refreshToken);
        }
        
        // Lưu thông tin người dùng
        const userData = normalizeUserData(response);
        localStorage.setItem(USER_KEY, JSON.stringify(userData));
      }
      
      return {
        success: true,
        ...response,
        userInfo: normalizeUserData(response)
      };
    } catch (error) {
      throw error;
    }
  },

  /**
   * Đăng ký tài khoản mới
   * @param {Object} userData - Thông tin đăng ký
   * @returns {Promise<Object>} Dữ liệu phản hồi từ API
   */
  register: async (userData) => {
    try {
      const response = await axiosClient.post('/auth/register', userData);
      return {
        success: true,
        ...response
      };
    } catch (error) {
      throw error;
    }
  },

  /**
   * Đăng xuất
   * Gọi API logout (nếu có) và xóa dữ liệu local
   */
  logout: async () => {
    try {
      // Gọi API logout để vô hiệu hóa token trên server
      await axiosClient.post('/auth/logout');
    } catch (error) {
      console.error('Lỗi khi gọi logout API:', error);
    } finally {
      // Luôn xóa dữ liệu local bất kể API thành công hay thất bại
      tokenStorage.clearTokens();
      localStorage.removeItem(USER_KEY);
    }
  },

  /**
   * Lấy thông tin người dùng hiện tại
   * @returns {Object|null} Thông tin người dùng hoặc null
   */
  getCurrentUser: () => {
    try {
      const userStr = localStorage.getItem(USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Lỗi khi lấy thông tin người dùng:', error);
      return null;
    }
  },

  /**
   * Refresh token khi sắp hết hạn
   * @returns {Promise<Object>} Dữ liệu phản hồi từ API
   */
  refreshToken: async () => {
    try {
      const refreshToken = tokenStorage.getRefreshToken();
      if (!refreshToken) {
        throw new Error('Không có refresh token');
      }
      
      const response = await axiosClient.post('/auth/refresh-token', { refreshToken });
      
      // Cập nhật token mới
      if (response.token || response.accessToken) {
        const token = response.token || response.accessToken;
        const newRefreshToken = response.refreshToken || refreshToken;
        const expiresIn = response.expiresIn || 3600;
        
        tokenStorage.setToken(token, expiresIn);
        tokenStorage.setRefreshToken(newRefreshToken);
      }
      
      return {
        success: true,
        ...response
      };
    } catch (error) {
      // Nếu refresh token thất bại, xóa tất cả token
      tokenStorage.clearTokens();
      localStorage.removeItem(USER_KEY);
      throw error;
    }
  },

  /**
   * Quên mật khẩu - Gửi email đặt lại mật khẩu
   * @param {string} email - Email của người dùng
   * @returns {Promise<Object>} Dữ liệu phản hồi từ API
   */
  forgotPassword: async (email) => {
    try {
      const response = await axiosClient.post('/auth/forgot-password', { email });
      return {
        success: true,
        ...response
      };
    } catch (error) {
      throw error;
    }
  },

  /**
   * Đặt lại mật khẩu với token
   * @param {string} token - Token đặt lại mật khẩu
   * @param {string} newPassword - Mật khẩu mới
   * @returns {Promise<Object>} Dữ liệu phản hồi từ API
   */
  resetPassword: async (token, newPassword) => {
    try {
      const response = await axiosClient.post('/auth/reset-password', { token, newPassword });
      return {
        success: true,
        ...response
      };
    } catch (error) {
      throw error;
    }
  },

  /**
   * Thay đổi mật khẩu khi đã đăng nhập
   * @param {string} currentPassword - Mật khẩu hiện tại
   * @param {string} newPassword - Mật khẩu mới
   * @returns {Promise<Object>} Dữ liệu phản hồi từ API
   */
  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await axiosClient.post('/auth/change-password', {
        currentPassword,
        newPassword
      });
      return {
        success: true,
        ...response
      };
    } catch (error) {
      throw error;
    }
  },

  /**
   * Xác thực email với token
   * @param {string} token - Token xác thực email
   * @returns {Promise<Object>} Dữ liệu phản hồi từ API
   */
  verifyEmail: async (token) => {
    try {
      const response = await axiosClient.post('/auth/verify-email', { token });
      return {
        success: true,
        ...response
      };
    } catch (error) {
      throw error;
    }
  },

  /**
   * Gửi lại email xác thực
   * @param {string} email - Email của người dùng
   * @returns {Promise<Object>} Dữ liệu phản hồi từ API
   */
  resendVerificationEmail: async (email) => {
    try {
      const response = await axiosClient.post('/auth/resend-verification', { email });
      return {
        success: true,
        ...response
      };
    } catch (error) {
      throw error;
    }
  },

  /**
   * Thiết lập 2FA (Two-Factor Authentication)
   * @returns {Promise<Object>} Dữ liệu phản hồi từ API (bao gồm QR code)
   */
  setupTwoFactor: async () => {
    try {
      const response = await axiosClient.post('/auth/2fa/setup');
      return {
        success: true,
        ...response
      };
    } catch (error) {
      throw error;
    }
  },

  /**
   * Xác thực 2FA
   * @param {string} code - Mã 6 chữ số từ authenticator app
   * @returns {Promise<Object>} Dữ liệu phản hồi từ API
   */
  verifyTwoFactor: async (code) => {
    try {
      const response = await axiosClient.post('/auth/2fa/verify', { code });
      return {
        success: true,
        ...response
      };
    } catch (error) {
      throw error;
    }
  },

  /**
   * Vô hiệu hóa 2FA
   * @param {string} code - Mã 6 chữ số để xác nhận
   * @returns {Promise<Object>} Dữ liệu phản hồi từ API
   */
  disableTwoFactor: async (code) => {
    try {
      const response = await axiosClient.post('/auth/2fa/disable', { code });
      return {
        success: true,
        ...response
      };
    } catch (error) {
      throw error;
    }
  },

  /**
   * Kiểm tra trạng thái đăng nhập
   * @returns {boolean} Người dùng đã đăng nhập chưa
   */
  isAuthenticated: () => {
    const token = tokenStorage.getToken();
    return !!token && !tokenStorage.isTokenExpired();
  },

  /**
   * Lấy token hiện tại
   * @returns {string|null} Token hoặc null
   */
  getToken: () => {
    return tokenStorage.getToken();
  },

  /**
   * Kiểm tra token có sắp hết hạn không
   * @param {number} thresholdMinutes - Ngưỡng thời gian (phút) trước khi hết hạn
   * @returns {boolean} Token có sắp hết hạn không
   */
  isTokenExpiringSoon: (thresholdMinutes = 5) => {
    const expiryTime = localStorage.getItem(TOKEN_EXPIRY_KEY);
    if (!expiryTime) return false;
    
    const expiryDate = parseInt(expiryTime);
    const thresholdMs = thresholdMinutes * 60 * 1000;
    return Date.now() > (expiryDate - thresholdMs);
  },

  /**
   * Cập nhật thông tin người dùng trong localStorage
   * @param {Object} userData - Dữ liệu người dùng mới
   */
  updateCurrentUser: (userData) => {
    try {
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        const updatedUser = { ...currentUser, ...userData };
        localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật thông tin người dùng:', error);
    }
  }
};

export default authService;
