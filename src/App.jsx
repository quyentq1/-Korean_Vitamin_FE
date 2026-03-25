import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute, AdminRoute, TeacherRoute, StaffRoute, StudentRoute, ManagerRoute, EducationManagerRoute } from './components/routing/ProtectedRoute';
import EducationManagerLayout from './components/layouts/EducationManagerLayout';
import EduManagerDashboard from './pages/EducationManager/EduManagerDashboard';
import EduAnalytics from './pages/EducationManager/EduAnalytics';
import EduCourseManagement from './pages/EducationManager/EduCourseManagement';
import EduCourseForm from './pages/EducationManager/EduCourseForm';
import EduTestManagement from './pages/EducationManager/EduTestManagement';
import EduTestEditor from './pages/EducationManager/EduTestEditor';
import EduTeacherManagement from './pages/EducationManager/EduTeacherManagement';
import EduStudentManagement from './pages/EducationManager/EduStudentManagement';
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
import LearnerDashboard from './pages/Learner/LearnerDashboard.jsx';
import TestLibrary from './pages/Learner/TestLibrary.jsx';
import MySchedule from './pages/Learner/MySchedule.jsx';
import WritingSubmission from './pages/Learner/WritingSubmission.jsx';
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
import CreateQuestion from './pages/Teacher/CreateQuestion.jsx';
import TeacherReports from './pages/Teacher/TeacherReports.jsx';
import TeacherDashboard from './pages/Teacher/TeacherDashboard.jsx';
import MyCourses from './pages/Teacher/MyCourses.jsx';
import ExamManagement from './pages/Teacher/ExamManagement.jsx';
import ExamEditor from './pages/Teacher/ExamEditor.jsx';
import ExamDetail from './pages/Teacher/ExamDetail.jsx';
import ExamAttempts from './pages/Teacher/ExamAttempts.jsx';
import QBApproval from './pages/Manager/QBApproval.jsx';
import StaffDashboard from './pages/Staff/StaffDashboard.jsx';
import StaffRegistrationManagement from './pages/Staff/RegistrationManagement.jsx';
import StaffReports from './pages/Staff/StaffReports.jsx';
import ManagerDashboard from './pages/Manager/ManagerDashboard.jsx';
import SystemSettings from './pages/Admin/SystemSettings.jsx';
import UserManagement from './pages/Admin/UserManagement.jsx';
import CourseManagement from './pages/Admin/CourseManagement.jsx';
import RegistrationManagement from './pages/Admin/RegistrationManagement.jsx';
import AdminDashboard from './pages/Admin/AdminDashboard.jsx';
import AIChatbot from './components/AIChatbot.jsx';
import ExamIntro from './pages/Exam/ExamIntro.jsx';
import ExamTaking from './pages/Exam/ExamTaking.jsx';
import QuestionImport from './pages/Teacher/QuestionImport.jsx';
import GradingDetail from './pages/Teacher/GradingDetail.jsx';
import TagManagement from './pages/Teacher/TagManagement.jsx';
import StudentExamList from './pages/Student/StudentExamList.jsx';
import Profile from './pages/Profile.jsx';
import './App.css';

import ChatbotWidget from './components/ChatbotWidget';

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

          {/* Exam Routes - Protected */}
          <Route path="/exam/:examId/intro" element={
            <ProtectedRoute>
              <ExamIntro />
            </ProtectedRoute>
          } />
          <Route path="/exam/:examId/taking/:attemptId" element={
            <ProtectedRoute>
              <ExamTaking />
            </ProtectedRoute>
          } />

          {/* Learner Routes - Student/Learner Only */}
          <Route path="/learner-dashboard" element={
            <StudentRoute>
              <LearnerDashboard />
            </StudentRoute>
          } />
          <Route path="/test-library" element={
            <StudentRoute>
              <TestLibrary />
            </StudentRoute>
          } />
          <Route path="/my-schedule" element={
            <StudentRoute>
              <MySchedule />
            </StudentRoute>
          } />
          <Route path="/writing-submission" element={
            <StudentRoute>
              <WritingSubmission />
            </StudentRoute>
          } />
          <Route path="/courses/:courseId/exams" element={
            <StudentRoute>
              <StudentExamList />
            </StudentRoute>
          } />

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
            <Route path="my-courses" element={<MyCourses />} />
            <Route path="question-bank" element={<QuestionBank />} />
            <Route path="questions/create" element={<CreateQuestion />} />
            <Route path="questions/edit/:id" element={<CreateQuestion />} />
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

          {/* Admin Routes - Admin Only */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />
          <Route path="/system-settings" element={
            <AdminRoute>
              <SystemSettings />
            </AdminRoute>
          } />
          <Route path="/user-management" element={
            <AdminRoute>
              <UserManagement />
            </AdminRoute>
          } />
          <Route path="/course-management" element={
            <AdminRoute>
              <CourseManagement />
            </AdminRoute>
          } />
          <Route path="/registration-management" element={
            <AdminRoute>
              <RegistrationManagement />
            </AdminRoute>
          } />

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
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

