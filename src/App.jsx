import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute, AdminRoute, TeacherRoute, StaffRoute, StudentRoute, ManagerRoute } from './components/routing/ProtectedRoute';
import CourseList from './pages/Courses/CourseList';
import Login from './pages/Login';
import Homepage from './pages/HomePage/HomePage.jsx';
import Dashboard from './pages/Dashboard/Dashboard.jsx';
import Curriculum from './pages/Curriculum.jsx';
import ExamPrep from './pages/ExamPrep.jsx';
import CourseDetail from './pages/CourseDetail.jsx';
import FreeTestList from './pages/Guest/FreeTestList.jsx';
import TestRunner from './pages/Test/TestRunner.jsx';
import TestResult from './pages/Test/TestResult.jsx';
import LearnerDashboard from './pages/Learner/LearnerDashboard.jsx';
import TestLibrary from './pages/Learner/TestLibrary.jsx';
import MySchedule from './pages/Learner/MySchedule.jsx';
import WritingSubmission from './pages/Learner/WritingSubmission.jsx';
import Forum from './pages/Shared/Forum.jsx';
import QuestionBank from './pages/Teacher/QuestionBank.jsx';
import GradingQueue from './pages/Teacher/GradingQueue.jsx';
import StudentManagement from './pages/Admin/StudentManagement.jsx';
import ClassManagement from './pages/Staff/ClassManagement.jsx';
import RoleManagement from './pages/Staff/RoleManagement.jsx';
import CreateQuiz from './pages/Teacher/CreateQuiz.jsx';
import CreateQuestion from './pages/Teacher/CreateQuestion.jsx';
import TeacherReports from './pages/Teacher/TeacherReports.jsx';
import TeacherDashboard from './pages/Teacher/TeacherDashboard.jsx';
import ExamManagement from './pages/Teacher/ExamManagement.jsx';
import ExamEditor from './pages/Teacher/ExamEditor.jsx';
import ExamAttempts from './pages/Teacher/ExamAttempts.jsx';
import QBApproval from './pages/Manager/QBApproval.jsx';
import StaffDashboard from './pages/Staff/StaffDashboard.jsx';
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
          <Route path="/" element={<Homepage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Public Course & Test Routes */}
          <Route path="/courses" element={<CourseList />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
          <Route path="/free-tests" element={<FreeTestList />} />
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

          {/* Forum - All authenticated users */}
          <Route path="/forum" element={
            <ProtectedRoute>
              <Forum />
            </ProtectedRoute>
          } />

          {/* Teacher Routes - Teacher Only */}
          <Route path="/teacher-dashboard" element={
            <TeacherRoute>
              <TeacherDashboard />
            </TeacherRoute>
          } />
          <Route path="/question-bank" element={
            <TeacherRoute>
              <QuestionBank />
            </TeacherRoute>
          } />
          <Route path="/teacher/questions/create" element={
            <TeacherRoute>
              <CreateQuestion />
            </TeacherRoute>
          } />
          <Route path="/grading-queue" element={
            <TeacherRoute>
              <GradingQueue />
            </TeacherRoute>
          } />
          <Route path="/create-quiz" element={
            <TeacherRoute>
              <CreateQuiz />
            </TeacherRoute>
          } />
          <Route path="/teacher-reports" element={
            <TeacherRoute>
              <TeacherReports />
            </TeacherRoute>
          } />
          <Route path="/question-import" element={
            <TeacherRoute>
              <QuestionImport />
            </TeacherRoute>
          } />
          <Route path="/grading/:attemptId" element={
            <TeacherRoute>
              <GradingDetail />
            </TeacherRoute>
          } />
          <Route path="/exam-management" element={
            <TeacherRoute>
              <ExamManagement />
            </TeacherRoute>
          } />
          <Route path="/exam-editor/:id" element={
            <TeacherRoute>
              <ExamEditor />
            </TeacherRoute>
          } />
          <Route path="/exam-attempts/:id" element={
            <TeacherRoute>
              <ExamAttempts />
            </TeacherRoute>
          } />
          <Route path="/teacher/questions/import" element={
            <TeacherRoute>
              <Navigate to="/question-import" replace />
            </TeacherRoute>
          } />

          {/* Staff Routes - Staff Only */}
          <Route path="/staff" element={
            <StaffRoute>
              <StaffDashboard />
            </StaffRoute>
          } />
          <Route path="/student-management" element={
            <StaffRoute>
              <StudentManagement />
            </StaffRoute>
          } />
          <Route path="/class-management" element={
            <StaffRoute>
              <ClassManagement />
            </StaffRoute>
          } />
          <Route path="/role-management" element={
            <StaffRoute>
              <RoleManagement />
            </StaffRoute>
          } />

          {/* Manager Routes - Manager Only */}
          <Route path="/manager" element={
            <ManagerRoute>
              <ManagerDashboard />
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
              <div className="page-container">
                <h1>Profile Page</h1>
                <p>Coming soon...</p>
              </div>
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

