import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute, AdminRoute, TeacherRoute, StaffRoute, StudentRoute, ManagerRoute, EducationManagerRoute } from './components/routing/ProtectedRoute';
import EducationManagerLayout from './components/layouts/EducationManagerLayout';
import AdminLayout from './components/layouts/AdminLayout';
import EduManagerDashboard from './pages/EducationManager/EduManagerDashboard';
import Analytics from './pages/Admin/Analytics';
import EduAnalytics from './pages/EducationManager/EduAnalytics';
import EduCourseManagement from './pages/EducationManager/EduCourseManagement';
import EduCourseForm from './pages/EducationManager/EduCourseForm';
import EduTestManagement from './pages/EducationManager/EduTestManagement';
import EduTestEditor from './pages/EducationManager/EduTestEditor';
import EduTeacherManagement from './pages/EducationManager/EduTeacherManagement';
import EduStudentManagement from './pages/EducationManager/EduStudentManagement';
import StudentLayout from './components/layouts/StudentLayout';
import StaffLayout from './components/layouts/StaffLayout';
import TeacherLayout from './components/layouts/TeacherLayout';
import CourseList from './pages/Courses/CourseList';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Homepage from './pages/HomePage/HomePage.jsx';
import Dashboard from './pages/Dashboard/Dashboard.jsx';
import Curriculum from './pages/Curriculum.jsx';
import ExamPrep from './pages/ExamPrep.jsx';
import CourseDetail from './pages/CourseDetail.jsx';
import FreeTestList from './pages/Guest/FreeTestList.jsx';
import FAQ from './pages/FAQ.jsx';
import SearchPage from './pages/SearchPage.jsx';
import TestRunner from './pages/Test/TestRunner.jsx';
import TestResult from './pages/Test/TestResult.jsx';
import Forum from './pages/Shared/Forum.jsx';
import QuestionBank from './pages/Teacher/QuestionBank.jsx';
import GradingQueue from './pages/Teacher/GradingQueue.jsx';
import TeacherSessions from './pages/Teacher/TeacherSessions.jsx';
import SessionApproval from './pages/Manager/SessionApproval.jsx';
import QuestionApproval from './pages/Manager/QuestionApproval.jsx';
import ExamApproval from './pages/Manager/ExamApproval.jsx';
import StudentManagement from './pages/Staff/StudentManagement.jsx';
import StudentDetail from './pages/Staff/StudentDetail.jsx';
import EditStudent from './pages/Staff/EditStudent.jsx';
import CreateManualStudent from './pages/Staff/CreateManualStudent.jsx';
import CreateOCRStudent from './pages/Staff/CreateOCRStudent.jsx';
import ClassManagement from './pages/Staff/ClassManagement.jsx';
import ClassDetail from './pages/Staff/ClassDetail.jsx';
import RoleManagement from './pages/Staff/RoleManagement.jsx';
import CreateQuiz from './pages/Teacher/CreateQuiz.jsx';
import TeacherReports from './pages/Teacher/TeacherReports.jsx';
import TeacherDashboard from './pages/Teacher/TeacherDashboard.jsx';
import TeacherMyCourses from './pages/Teacher/MyCourses.jsx';
import ExamManagement from './pages/Teacher/ExamManagement.jsx';
import ExamEditor from './pages/Teacher/ExamEditor.jsx';
import ExamDetail from './pages/Teacher/ExamDetail.jsx';
import ExamAttempts from './pages/Teacher/ExamAttempts.jsx';
import ClassExamManagement from './pages/Teacher/ClassExamManagement.jsx';
import QBApproval from './pages/Manager/QBApproval.jsx';
import StaffDashboard from './pages/Staff/StaffDashboard.jsx';
import StaffRegistrationManagement from './pages/Staff/RegistrationManagement.jsx';
import StaffReports from './pages/Staff/StaffReports.jsx';
import MailManagement from './pages/Staff/MailManagement.jsx';
import ManagerDashboard from './pages/Manager/ManagerDashboard.jsx';
import SystemSettings from './pages/Admin/SystemSettings.jsx';
import UserManagement from './pages/Admin/UserManagement.jsx';
import CourseManagement from './pages/Admin/CourseManagement.jsx';
import RegistrationManagement from './pages/Admin/RegistrationManagement.jsx';
import AdminDashboard from './pages/Admin/AdminDashboard.jsx';
import TeachersManagement from './pages/Admin/TeachersManagement.jsx';
import ApprovalsManagement from './pages/Admin/ApprovalsManagement.jsx';
import ReportsManagement from './pages/Admin/ReportsManagement.jsx';
import AdminStatistics from './pages/Admin/AdminStatistics.jsx';
import AdminGrowth from './pages/Admin/AdminGrowth.jsx';
import AIChatbot from './components/AIChatbot.jsx';
import ExamIntro from './pages/Exam/ExamIntro.jsx';
import ExamTaking from './pages/Exam/ExamTaking.jsx';
import ExamResult from './pages/Exam/ExamResult.jsx';
import QuestionImport from './pages/Teacher/QuestionImport.jsx';
import GradingDetail from './pages/Teacher/GradingDetail.jsx';
import TagManagement from './pages/Teacher/TagManagement.jsx';
import StudentExamList from './pages/Student/StudentExamList.jsx';
import ExamHistory from './pages/Student/ExamHistory.jsx';
import StudentDashboard from './pages/Student/StudentDashboard.jsx';
import StudentExams from './pages/Student/StudentExams.jsx';
import StudentMail from './pages/Student/StudentMail.jsx';
import StudentCourseDetail from './pages/Student/StudentCourseDetail.jsx';
import StudentClassDetail from './pages/Student/StudentClassDetail.jsx';
import MySchedule from './pages/Student/MySchedule.jsx';
import MyCourses from './pages/Student/MyCourses.jsx';
import MyClasses from './pages/Student/MyClasses.jsx';
import TestLibrary from './pages/Student/TestLibrary.jsx';
import Profile from './pages/Profile.jsx';
import './App.css';

import ChatbotWidget from './components/ChatbotWidget';
import GuestKoreanChatbot from './components/AI/GuestKoreanChatbot';

/**
 * Unauthorized Page Component
 * Hiển thị khi người dùng không có quyền truy cập
 */
const UnauthorizedPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Không có quyền truy cập</h1>
        <p className="text-gray-600 mb-6">Bạn không có quyền truy cập trang này. Vui lòng liên hệ quản trị viên nếu bạn nghĩ đây là lỗi.</p>
        <button
          onClick={() => window.history.back()}
          className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 transition-colors"
        >
          Quay lại
        </button>
      </div>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/" element={<Homepage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Public Course & Test Routes */}
          <Route path="/courses" element={<CourseList />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
          <Route path="/free-tests" element={<FreeTestList />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/curriculum" element={<Curriculum />} />
          <Route path="/prep" element={<ExamPrep />} />

          {/* Protected Routes - Require Authentication */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          {/* Test runner is PUBLIC - guests can take free tests without login */}
          <Route path="/test-runner/:testId" element={<TestRunner />} />
          <Route path="/test-result/:testId" element={<TestResult />} />

          {/* Exam Routes - Student with StudentLayout */}
          <Route path="/exam" element={
            <StudentRoute>
              <StudentLayout />
            </StudentRoute>
          }>
            <Route path=":examId/intro" element={<ExamIntro />} />
            <Route path=":examId/taking/:attemptId" element={<ExamTaking />} />
            <Route path="result/:attemptId" element={<ExamResult />} />
          </Route>

          {/* Student Routes - Student Only with Nested Layout */}
          <Route path="/student" element={
            <StudentRoute>
              <StudentLayout />
            </StudentRoute>
          }>
            <Route index element={<StudentDashboard />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="my-courses" element={<MyCourses />} />
            <Route path="my-classes" element={<MyClasses />} />
            <Route path="courses/:courseId" element={<StudentCourseDetail />} />
            <Route path="class/:classId" element={<StudentClassDetail />} />
            <Route path="exams" element={<StudentExams />} />
            <Route path="results" element={<TestResult />} />
            <Route path="attempts/history" element={<ExamHistory />} />
            <Route path="mail" element={<StudentMail />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* Student Exam List by Course */}
          <Route path="/courses/:courseId/exams" element={
            <StudentRoute>
              <StudentLayout>
                <StudentExamList />
              </StudentLayout>
            </StudentRoute>
          } />

          {/* Legacy Routes - Redirect to new Student routes */}
          <Route path="/learner-dashboard" element={<Navigate to="/student/dashboard" replace />} />
          <Route path="/writing-submission" element={<Navigate to="/student/mail" replace />} />

          {/* Forum - All authenticated users */}
          <Route path="/forum" element={
            <ProtectedRoute>
              <Forum />
            </ProtectedRoute>
          } />

          {/* Teacher Routes - Teacher Only */}
          <Route path="/teacher" element={
            <TeacherRoute>
              <TeacherLayout />
            </TeacherRoute>
          }>
            <Route index element={<TeacherDashboard />} />
            <Route path="dashboard" element={<TeacherDashboard />} />
            <Route path="my-courses" element={<TeacherMyCourses />} />
            <Route path="question-bank" element={<QuestionBank />} />
            <Route path="grading-queue" element={<GradingQueue />} />
            <Route path="create-quiz" element={<CreateQuiz />} />
            <Route path="reports" element={<TeacherReports />} />
            <Route path="question-import" element={<QuestionImport />} />
            <Route path="grading/:attemptId" element={<GradingDetail />} />
            <Route path="exam-management" element={<ExamManagement />} />
            <Route path="exam-management/create" element={<ExamEditor />} />
            <Route path="exam-detail/:id" element={<ExamDetail />} />
            <Route path="exam-editor/:id" element={<ExamEditor />} />
            <Route path="exam-attempts/:id" element={<ExamAttempts />} />
            <Route path="class-exams" element={<ClassExamManagement />} />
            <Route path="class-exams/:classId" element={<ClassExamManagement />} />
            <Route path="sessions" element={<TeacherSessions />} />
            <Route path="tag-management" element={<TagManagement />} />
          </Route>

          {/* Legacy Teacher Routes (for backwards compatibility) */}
          <Route path="/teacher-dashboard" element={<Navigate to="/teacher/dashboard" replace />} />
          <Route path="/question-bank" element={<Navigate to="/teacher/question-bank" replace />} />
          <Route path="/grading-queue" element={<Navigate to="/teacher/grading-queue" replace />} />
          <Route path="/teacher-reports" element={<Navigate to="/teacher/reports" replace />} />
          <Route path="/teacher-sessions" element={<Navigate to="/teacher/sessions" replace />} />
          <Route path="/exam-management" element={<Navigate to="/teacher/exam-management" replace />} />

          {/* Staff Routes - Staff Only */}
          <Route path="/staff" element={
            <StaffRoute>
              <StaffLayout>
                <StaffDashboard />
              </StaffLayout>
            </StaffRoute>
          } />
          <Route path="/student-management" element={
            <StaffRoute>
              <StaffLayout>
                <StudentManagement />
              </StaffLayout>
            </StaffRoute>
          } />
          <Route path="/student-management/create-manual" element={
            <StaffRoute>
              <StaffLayout>
                <CreateManualStudent />
              </StaffLayout>
            </StaffRoute>
          } />
          <Route path="/student-management/create-ocr" element={
            <StaffRoute>
              <StaffLayout>
                <CreateOCRStudent />
              </StaffLayout>
            </StaffRoute>
          } />
          <Route path="/student-management/:id" element={
            <StaffRoute>
              <StaffLayout>
                <StudentDetail />
              </StaffLayout>
            </StaffRoute>
          } />
          <Route path="/student-management/:id/edit" element={
            <StaffRoute>
              <StaffLayout>
                <EditStudent />
              </StaffLayout>
            </StaffRoute>
          } />
          <Route path="/class-management" element={
            <StaffRoute>
              <StaffLayout>
                <ClassManagement />
              </StaffLayout>
            </StaffRoute>
          } />
          <Route path="/classes/:id" element={
            <StaffRoute>
              <StaffLayout>
                <ClassDetail />
              </StaffLayout>
            </StaffRoute>
          } />
          <Route path="/staff/mail" element={
            <StaffRoute>
              <StaffLayout>
                <MailManagement />
              </StaffLayout>
            </StaffRoute>
          } />
          <Route path="/registrations" element={
            <StaffRoute>
              <StaffLayout>
                <StaffRegistrationManagement />
              </StaffLayout>
            </StaffRoute>
          } />
          <Route path="/reports" element={
            <StaffRoute>
              <StaffLayout>
                <StaffReports />
              </StaffLayout>
            </StaffRoute>
          } />
          <Route path="/role-management" element={
            <StaffRoute>
              <StaffLayout>
                <RoleManagement />
              </StaffLayout>
            </StaffRoute>
          } />

          {/* Education Manager Routes */}
          <Route path="/edu-manager" element={
            <EducationManagerRoute>
              <EducationManagerLayout />
            </EducationManagerRoute>
          }>
            <Route index element={<EduManagerDashboard />} />
            <Route path="analytics" element={<EduAnalytics />} />
            <Route path="courses" element={<EduCourseManagement />} />
            <Route path="courses/create" element={<EduCourseForm />} />
            <Route path="courses/edit/:id" element={<EduCourseForm />} />
            <Route path="tests" element={<EduTestManagement />} />
            <Route path="classes" element={<ClassManagement />} />
            <Route path="classes/:id" element={<ClassDetail />} />
            <Route path="tests/create" element={<EduTestEditor />} />
            <Route path="tests/edit/:id" element={<EduTestEditor />} />
            {/* BUG-34, EM-BUG-02, EM-BUG-15, EM-BUG-18 FIX: Added missing routes */}
            <Route path="teachers" element={<EduTeacherManagement />} />
            <Route path="students" element={<EduStudentManagement />} />
            {/* Approval Routes */}
            <Route path="qb-approval" element={<QuestionApproval />} />
            <Route path="exam-approval" element={<ExamApproval />} />
            <Route path="test-approval" element={<EduTestManagement />} />
          </Route>

          {/* Manager Routes - Manager Only */}
          <Route path="/manager" element={
            <ManagerRoute>
              <ManagerDashboard />
            </ManagerRoute>
          } />
          <Route path="/session-approval" element={
            <ManagerRoute>
              <SessionApproval />
            </ManagerRoute>
          } />
          <Route path="/qb-approval" element={
            <ManagerRoute>
              <QBApproval />
            </ManagerRoute>
          } />

          {/* Admin Routes - Admin Only with Nested Layout */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="teachers" element={<TeachersManagement />} />
            <Route path="students" element={<StudentManagement />} />
            <Route path="approvals" element={<ApprovalsManagement />} />
            <Route path="reports" element={<ReportsManagement />} />
            <Route path="statistics" element={<AdminStatistics />} />
            <Route path="courses" element={<CourseManagement />} />
            <Route path="growth" element={<AdminGrowth />} />
            <Route path="settings" element={<SystemSettings />} />
          </Route>

          {/* Legacy Admin Routes (for backwards compatibility) */}
          <Route path="/system-settings" element={<Navigate to="/admin/settings" replace />} />
          <Route path="/user-management" element={<Navigate to="/admin/users" replace />} />
          <Route path="/course-management" element={<Navigate to="/admin/courses" replace />} />
          <Route path="/registration-management" element={<Navigate to="/admin/users" replace />} />

          {/* Profile Route - All authenticated users */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />

          {/* Catch all - Redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Global Widgets */}
        <ChatbotWidget />
        <GuestKoreanChatbot />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

