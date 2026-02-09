import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const AuthContext = createContext(null);


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  
  // State quản lý người dùng và xác thực
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  
  // State quản lý session
  const [sessionTimeout, setSessionTimeout] = useState(null);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [isSessionExpiring, setIsSessionExpiring] = useState(false);

  /**
   * Xóa dữ liệu xác thực
   */
  const clearAuthData = useCallback(() => {
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (sessionTimeout) {
      clearTimeout(sessionTimeout);
      setSessionTimeout(null);
    }
  }, [sessionTimeout]);

  /**
   * Khởi tạo trạng thái xác thực từ localStorage khi component mount
   */
  useEffect(() => {
    // Khởi tạo auth từ localStorage
    try {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (storedToken && storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
        setIsAuthenticated(true);
        setLastActivity(Date.now());
      }
    } catch (error) {
      console.error('Lỗi khi khởi tạo auth:', error);
      clearAuthData();
    } finally {
      setIsLoading(false);
    }
    
    // Thiết lập listener cho activity của người dùng
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    const handleActivity = () => {
      setLastActivity(Date.now());
      setIsSessionExpiring(false);
    };
    
    activityEvents.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    // Thiết lập kiểm tra session timeout
    const sessionCheckInterval = setInterval(() => {
      const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 phút
      const WARNING_THRESHOLD = 5 * 60 * 1000; // 5 phút trước khi hết hạn

      // Chỉ kiểm tra nếu user đã đăng nhập
      if (!isAuthenticated || !user) {
        return;
      }

      const timeSinceLastActivity = Date.now() - lastActivity;

      if (timeSinceLastActivity > SESSION_TIMEOUT) {
        // Session đã hết hạn - logout trực tiếp
        clearAuthData();
        navigate('/login', {
          state: {
            logoutReason: 'SESSION_EXPIRED',
            logoutMessage: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.'
          }
        });
      } else if (timeSinceLastActivity > (SESSION_TIMEOUT - WARNING_THRESHOLD)) {
        // Sắp hết hạn - hiển thị cảnh báo
        setIsSessionExpiring(true);
      }
    }, 60000); // Kiểm tra mỗi phút

    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      clearInterval(sessionCheckInterval);
    };
  }, [lastActivity, clearAuthData, navigate]);

  /**
   * Login - Xử lý đăng nhập người dùng
   * @param {string} username - Tên đăng nhập
   * @param {string} password - Mật khẩu
   * @param {boolean} rememberMe - Có ghi nhớ đăng nhập không
   * @returns {Promise<Object>} Dữ liệu người dùng sau khi đăng nhập
   */
  const login = useCallback(async (username, password, rememberMe = false) => {
    setIsLoading(true);
    setAuthError(null);
    
    try {
      const response = await authService.login(username, password);
      
      // Lưu token và thông tin người dùng
      const token = response.token || response.accessToken;
      const userData = {
        id: response.id || response.userInfo?.id,
        username: response.username || response.userInfo?.username,
        fullName: response.fullName || response.userInfo?.fullName,
        email: response.email || response.userInfo?.email,
        role: response.role || response.roles?.[0] || response.userInfo?.role,
        avatar: response.avatar || response.userInfo?.avatar,
        permissions: response.permissions || response.userInfo?.permissions || [],
        ...response.userInfo
      };

      // Lưu vào state
      setToken(token);
      setUser(userData);
      setIsAuthenticated(true);
      setLastActivity(Date.now());
      setIsSessionExpiring(false);

      // Lưu vào localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));

      // Nếu không chọn ghi nhớ, thiết lập timeout
      if (!rememberMe) {
        const timeoutId = setTimeout(() => {
          logout({ reason: 'SESSION_EXPIRED', message: 'Phiên làm việc đã hết hạn.' });
        }, 30 * 60 * 1000); // 30 phút
        setSessionTimeout(timeoutId);
      }

      return {
        success: true,
        user: userData,
        role: userData.role,
        message: 'Đăng nhập thành công!'
      };
    } catch (error) {
      const errorMessage = handleLoginError(error);
      setAuthError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Xử lý lỗi đăng nhập
   * @param {Error} error - Lỗi từ API
   * @returns {string} Thông báo lỗi thân thiện với người dùng
   */
  const handleLoginError = (error) => {
    // Lỗi từ API response
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 400:
          return data?.message || 'Dữ liệu đăng nhập không hợp lệ. Vui lòng kiểm tra lại.';
        case 401:
          return 'Tên đăng nhập hoặc mật khẩu không đúng.';
        case 403:
          return 'Tài khoản của bạn đã bị khóa hoặc không có quyền truy cập.';
        case 429:
          return 'Bạn đã đăng nhập quá nhiều lần. Vui lòng thử lại sau vài phút.';
        case 500:
          return 'Lỗi máy chủ. Vui lòng thử lại sau hoặc liên hệ hỗ trợ.';
        default:
          return data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
      }
    }

    // Lỗi mạng - không có response nhưng có request
    if (!error.response && error.request) {
      return 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng của bạn.';
    }

    // Lỗi khác
    return error.message || 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.';
  };

  /**
   * Logout - Xử lý đăng xuất
   * @param {Object} options - Tùy chọn đăng xuất
   * @param {string} options.reason - Lý do đăng xuất
   * @param {string} options.message - Thông báo đăng xuất
   */
  const logout = useCallback((options = {}) => {
    const { reason = 'USER_LOGOUT', message = null } = options;
    
    // Gọi API logout nếu cần
    try {
      authService.logout();
    } catch (error) {
      console.error('Lỗi khi gọi logout API:', error);
    }
    
    // Xóa dữ liệu xác thực
    clearAuthData();
    
    // Điều hướng về trang đăng nhập
    navigate('/login', { 
      state: { 
        logoutReason: reason,
        logoutMessage: message || 'Bạn đã đăng xuất thành công.'
      } 
    });
  }, [navigate, clearAuthData]);

  /**
   * Refresh token - Làm mới token khi cần
   * @returns {Promise<boolean>} Kết quả refresh
   */
  const refreshToken = useCallback(async () => {
    try {
      const response = await authService.refreshToken();
      if (response.token) {
        setToken(response.token);
        localStorage.setItem('token', response.token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Lỗi khi refresh token:', error);
      logout({ reason: 'REFRESH_FAILED', message: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.' });
      return false;
    }
  }, [logout]);

  /**
   * Kiểm tra quyền của người dùng
   * @param {string|string[]} requiredRoles - Vai trò cần thiết
   * @returns {boolean} Người dùng có quyền không
   */
  const hasRole = useCallback((requiredRoles) => {
    if (!user || !user.role) return false;
    
    if (Array.isArray(requiredRoles)) {
      return requiredRoles.includes(user.role);
    }
    return user.role === requiredRoles;
  }, [user]);

  /**
   * Kiểm tra quyền cụ thể
   * @param {string} permission - Quyền cần kiểm tra
   * @returns {boolean} Người dùng có quyền không
   */
  const hasPermission = useCallback((permission) => {
    if (!user || !user.permissions) return false;
    
    // Admin có mọi quyền
    if (user.role === 'ADMIN') return true;
    
    return user.permissions.includes(permission);
  }, [user]);

  /**
   * Cập nhật thông tin người dùng
   * @param {Object} userData - Dữ liệu người dùng mới
   */
  const updateUser = useCallback((userData) => {
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  }, [user]);

  /**
   * Cập nhật hoạt động gần nhất của người dùng
   */
  const updateLastActivity = useCallback(() => {
    setLastActivity(Date.now());
    setIsSessionExpiring(false);
  }, []);

  /**
   * Lấy route mặc định dựa trên role
   * @returns {string} Route mặc định
   */
  const getDefaultRoute = useCallback(() => {
    if (!user || !user.role) return '/';

    const roleRoutes = {
      'ADMIN': '/admin',
      'MANAGER': '/manager',
      'TEACHER': '/teacher-dashboard',
      'STAFF': '/staff',
      'STUDENT': '/learner-dashboard',
      'LEARNER': '/learner-dashboard'
    };

    return roleRoutes[user.role] || '/';
  }, [user]);

  // Context value
  const value = {
    // State
    user,
    token,
    isAuthenticated,
    isLoading,
    authError,
    isSessionExpiring,
    lastActivity,
    
    // Methods
    login,
    logout,
    refreshToken,
    hasRole,
    hasPermission,
    updateUser,
    getDefaultRoute,
    clearAuthError: () => setAuthError(null),
    updateLastActivity
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
