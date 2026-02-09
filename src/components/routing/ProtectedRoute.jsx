import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { PageLoading, ErrorAlert } from '../ui';

/**
 * ProtectedRoute Component
 * Bảo vệ route theo trạng thái xác thực và quyền hạn
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Component con được render khi có quyền truy cập
 * @param {string|string[]} props.allowedRoles - Các role được phép truy cập
 * @param {string[]} props.requiredPermissions - Các quyền cần thiết
 * @param {boolean} props.redirectToLogin - Có redirect về trang đăng nhập khi chưa xác thực
 * @param {string} props.fallbackPath - Path redirect khi không có quyền (mặc định: /unauthorized)
 */
export const ProtectedRoute = ({
  children,
  allowedRoles = null,
  requiredPermissions = null,
  redirectToLogin = true,
  fallbackPath = '/unauthorized'
}) => {
  const { user, isAuthenticated, isLoading, hasRole, hasPermission, authError } = useAuth();
  const location = useLocation();

  // Lưu lại đường dẫn hiện tại để redirect sau khi đăng nhập
  const from = location.state?.from?.pathname || location.pathname;

  // Hiển thị loading khi đang kiểm tra xác thực
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <PageLoading message="Đang kiểm tra xác thực..." />
      </div>
    );
  }

  // Nếu có lỗi xác thực, hiển thị thông báo lỗi
  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="max-w-md w-full">
          <ErrorAlert
            title="Lỗi xác thực"
            message={authError}
            dismissible={false}
          />
        </div>
      </div>
    );
  }

  // Chưa đăng nhập - redirect về trang đăng nhập
  if (!isAuthenticated) {
    if (redirectToLogin) {
      return (
        <Navigate
          to="/login"
          state={{ from: { pathname: from } }}
          replace
        />
      );
    }
    return null;
  }

  // Kiểm tra role
  if (allowedRoles && !hasRole(allowedRoles)) {
    return (
      <Navigate
        to={fallbackPath}
        state={{
          error: 'INSUFFICIENT_ROLE',
          message: `Bạn không có quyền truy cập trang này. Vai trò yêu cầu: ${Array.isArray(allowedRoles) ? allowedRoles.join(', ') : allowedRoles}`
        }}
        replace
      />
    );
  }

  // Kiểm tra quyền
  if (requiredPermissions && requiredPermissions.length > 0) {
    const hasAllPermissions = requiredPermissions.every(permission => hasPermission(permission));
    if (!hasAllPermissions) {
      return (
        <Navigate
          to={fallbackPath}
          state={{
            error: 'INSUFFICIENT_PERMISSION',
            message: 'Bạn không có đủ quyền để thực hiện hành động này.'
          }}
          replace
        />
      );
    }
  }

  // Đã xác thực và có đủ quyền - render component con
  return children;
};

/**
 * RoleRoute Component
 * Bảo vệ route theo role cụ thể
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Component con
 * @param {string|string[]} props.roles - Role được phép truy cập
 */
export const RoleRoute = ({ children, roles }) => {
  return (
    <ProtectedRoute allowedRoles={roles}>
      {children}
    </ProtectedRoute>
  );
};

/**
 * PermissionRoute Component
 * Bảo vệ route theo quyền cụ thể
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Component con
 * @param {string[]} props.permissions - Quyền cần thiết
 */
export const PermissionRoute = ({ children, permissions }) => {
  return (
    <ProtectedRoute requiredPermissions={permissions}>
      {children}
    </ProtectedRoute>
  );
};

/**
 * AdminRoute Component
 * Bảo vệ route chỉ dành cho Admin
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Component con
 */
export const AdminRoute = ({ children }) => {
  return (
    <ProtectedRoute allowedRoles="ADMIN">
      {children}
    </ProtectedRoute>
  );
};

/**
 * TeacherRoute Component
 * Bảo vệ route chỉ dành cho Teacher
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Component con
 */
export const TeacherRoute = ({ children }) => {
  return (
    <ProtectedRoute allowedRoles="TEACHER">
      {children}
    </ProtectedRoute>
  );
};

/**
 * StaffRoute Component
 * Bảo vệ route chỉ dành cho Staff
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Component con
 */
export const StaffRoute = ({ children }) => {
  return (
    <ProtectedRoute allowedRoles="STAFF">
      {children}
    </ProtectedRoute>
  );
};

/**
 * StudentRoute Component
 * Bảo vệ route chỉ dành cho Student
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Component con
 */
export const StudentRoute = ({ children }) => {
  return (
    <ProtectedRoute allowedRoles={['STUDENT', 'LEARNER']}>
      {children}
    </ProtectedRoute>
  );
};

/**
 * ManagerRoute Component
 * Bảo vệ route chỉ dành cho Manager
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Component con
 */
export const ManagerRoute = ({ children }) => {
  return (
    <ProtectedRoute allowedRoles="MANAGER">
      {children}
    </ProtectedRoute>
  );
};

export default ProtectedRoute;
