import axios from 'axios';

/**
 * AxiosClient - Cấu hình Axios cho API requests
 * 
 * Các tính năng:
 * - Tự động thêm token vào headers
 * - Xử lý lỗi chi tiết với thông báo thân thiện
 * - Tự động refresh token khi hết hạn
 * - Request/response logging (trong development)
 * - Timeout handling
 * - Retry logic cho các lỗi nhất định
 */

// Constants
const TOKEN_KEY = 'token';
const REFRESH_TOKEN_KEY = 'refreshToken';

// Tạo axios instance
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 giây timeout
});

// Biến để theo dõi việc refresh token
let isRefreshing = false;
let refreshSubscribers = [];

/**
 * Thêm subscriber vào hàng đợi refresh token
 */
const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

/**
 * Thực hiện các callbacks sau khi refresh token thành công
 */
const onRefreshed = (token) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

/**
 * Xóa tất cả subscribers khi refresh token thất bại
 */
const onRefreshFailed = () => {
  refreshSubscribers = [];
};

/**
 * Lấy token từ localStorage
 */
const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Lấy refresh token từ localStorage
 */
const getRefreshToken = () => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

/**
 * Xóa token khỏi localStorage
 */
const clearTokens = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

/**
 * Tạo error object chi tiết từ error response
 */
const createError = (error) => {
  const errorObj = {
    message: 'Đã xảy ra lỗi không xác định',
    status: null,
    code: null,
    details: null,
    isNetworkError: false,
    isTimeout: false,
    isServerError: false,
    isClientError: false,
    isAuthError: false
  };

  // Lỗi từ response
  if (error.response) {
    const { status, data, headers } = error.response;
    errorObj.status = status;
    errorObj.code = data?.code || `HTTP_${status}`;
    errorObj.details = data;
    
    // Phân loại lỗi theo status code
    if (status >= 500) {
      errorObj.isServerError = true;
      errorObj.message = data?.message || 'Lỗi máy chủ. Vui lòng thử lại sau.';
    } else if (status === 401) {
      errorObj.isAuthError = true;
      errorObj.message = data?.message || 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
    } else if (status === 403) {
      errorObj.isAuthError = true;
      errorObj.message = data?.message || 'Bạn không có quyền thực hiện hành động này.';
    } else if (status === 404) {
      errorObj.isClientError = true;
      errorObj.message = data?.message || 'Không tìm thấy tài nguyên yêu cầu.';
    } else if (status === 429) {
      errorObj.isClientError = true;
      errorObj.message = data?.message || 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau.';
    } else if (status >= 400) {
      errorObj.isClientError = true;
      errorObj.message = data?.message || 'Yêu cầu không hợp lệ. Vui lòng kiểm tra lại.';
    }
  }
  // Lỗi không có response (network error, timeout, etc.)
  else if (error.request) {
    errorObj.isNetworkError = true;
    
    if (error.code === 'ECONNABORTED') {
      errorObj.isTimeout = true;
      errorObj.message = 'Yêu cầu quá thời gian. Vui lòng kiểm tra kết nối mạng và thử lại.';
    } else {
      errorObj.message = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng của bạn.';
    }
  }
  // Lỗi khác
  else {
    errorObj.message = error.message || 'Đã xảy ra lỗi không xác định.';
  }

  return errorObj;
};

/**
 * Request Interceptor - Thêm token và logging
 */
axiosClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    
    // Thêm token vào header nếu có
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Thêm timestamp để theo dõi request
    config.metadata = { startTime: Date.now() };
    
    // Logging trong development
    if (import.meta.env.DEV) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
        headers: config.headers,
        data: config.data,
        params: config.params
      });
    }
    
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor - Xử lý response và errors
 */
axiosClient.interceptors.response.use(
  (response) => {
    // Logging trong development
    if (import.meta.env.DEV) {
      const duration = Date.now() - response.config.metadata?.startTime;
      console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        duration: `${duration}ms`,
        data: response.data
      });
    }
    
    // Trả về data trực tiếp
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;
    const errorObj = createError(error);
    
    // Logging trong development
    if (import.meta.env.DEV) {
      console.error('[API Error]', errorObj);
    }
    
    // Xử lý lỗi 401 - Token hết hạn hoặc không hợp lệ
    if (errorObj.status === 401 && !originalRequest._retry) {
      // Nếu là request refresh token thất bại
      if (originalRequest.url === '/auth/refresh-token') {
        onRefreshFailed();
        clearTokens();
        // Redirect về trang đăng nhập
        if (typeof window !== 'undefined') {
          window.location.href = '/login?reason=SESSION_EXPIRED';
        }
        return Promise.reject(errorObj);
      }
      
      // Nếu đang refresh token, thêm request vào hàng đợi
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(axiosClient(originalRequest));
          });
        }).catch((err) => {
          reject(err);
        });
      }
      
      // Bắt đầu refresh token
      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        const refreshToken = getRefreshToken();
        
        if (!refreshToken) {
          throw new Error('Không có refresh token');
        }
        
        // Gọi API refresh token
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL || '/api'}/auth/refresh-token`,
          { refreshToken }
        );
        
        const newToken = response.data?.token || response.data?.accessToken;
        const newRefreshToken = response.data?.refreshToken || refreshToken;
        
        // Lưu token mới
        localStorage.setItem(TOKEN_KEY, newToken);
        if (newRefreshToken) {
          localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
        }
        
        // Thông báo các subscribers
        onRefreshed(newToken);
        isRefreshing = false;
        
        // Thử lại request gốc với token mới
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosClient(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        onRefreshFailed();
        clearTokens();
        
        // Redirect về trang đăng nhập
        if (typeof window !== 'undefined') {
          window.location.href = '/login?reason=SESSION_EXPIRED';
        }
        
        return Promise.reject(createError(refreshError));
      }
    }
    
    // Xử lý lỗi 403 - Không có quyền truy cập
    if (errorObj.status === 403) {
      // Có thể redirect về trang unauthorized
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/unauthorized')) {
        window.location.href = '/unauthorized';
      }
    }
    
    // Xử lý lỗi 429 - Quá nhiều request
    if (errorObj.status === 429) {
      const retryAfter = error.response?.headers?.['retry-after'];
      if (retryAfter) {
        errorObj.message = `Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau ${retryAfter} giây.`;
      }
    }
    
    // Xử lý lỗi 500 - Lỗi server
    if (errorObj.status >= 500) {
      // Có thể hiển thị thông báo lỗi server
      console.error('Server Error:', errorObj);
    }
    
    // Trả về error object chi tiết
    return Promise.reject(errorObj);
  }
);

/**
 * Helper methods cho common API patterns
 */
axiosClient.getPaginated = async (url, params = {}) => {
  return axiosClient.get(url, { params });
};

axiosClient.postFormData = async (url, data) => {
  return axiosClient.post(url, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

axiosClient.putFormData = async (url, data) => {
  return axiosClient.put(url, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

/**
 * Cancel token cho việc hủy request
 */
const CancelToken = axios.CancelToken;
const source = CancelToken.source();

axiosClient.cancel = () => {
  source.cancel('Request cancelled by user');
};

axiosClient.isCancel = axios.isCancel;

export default axiosClient;
export { CancelToken, source };
