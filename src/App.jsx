import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import StudentManagement from './pages/Staff/StudentManagement.jsx';
import ClassManagement from './pages/Staff/ClassManagement.jsx';
import RoleManagement from './pages/Staff/RoleManagement.jsx';
import CreateQuiz from './pages/Teacher/CreateQuiz.jsx';
import TeacherReports from './pages/Teacher/TeacherReports.jsx';
import TeacherDashboard from './pages/Teacher/TeacherDashboard.jsx';
import QBApproval from './pages/Manager/QBApproval.jsx';
import SystemSettings from './pages/Admin/SystemSettings.jsx';
import UserManagement from './pages/Admin/UserManagement.jsx';
import AIChatbot from './components/AIChatbot.jsx';
import './App.css';

function App() {

  return (
    <BrowserRouter>

      <Routes>
        <Route path="/login" element={<Login />} />
        {/* Unauthorized */}
        <Route
          path="/unauthorized"
          element={
            <div className="page-container error-page">
              <h1>⛔ Unauthorized</h1>
              <p>You don't have permission to access this page.</p>
            </div>
          }
        />
        {/* Homepage - Public */}
        <Route path="/" element={<Homepage />} />

        {/* New Routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/curriculum" element={<Curriculum />} />
        <Route path="/prep" element={<ExamPrep />} />
        <Route path="/courses/:id" element={<CourseDetail />} />
        <Route path="/free-tests" element={<FreeTestList />} />
        <Route path="/test-runner/:testId" element={<TestRunner />} />
        <Route path="/test-result/:testId" element={<TestResult />} />

        {/* Learner Routes */}
        <Route path="/learner-dashboard" element={<LearnerDashboard />} />
        <Route path="/test-library" element={<TestLibrary />} />
        <Route path="/my-schedule" element={<MySchedule />} />
        <Route path="/writing-submission" element={<WritingSubmission />} />
        <Route path="/forum" element={<Forum />} />

        {/* Teacher Routes */}
        <Route path="/question-bank" element={<QuestionBank />} />
        <Route path="/grading-queue" element={<GradingQueue />} />

        {/* Staff Routes */}
        <Route path="/student-management" element={<StudentManagement />} />
        <Route path="/class-management" element={<ClassManagement />} />
        <Route path="/role-management" element={<RoleManagement />} />

        {/* Teacher Routes - Continued */}
        <Route path="/create-quiz" element={<CreateQuiz />} />
        <Route path="/teacher-reports" element={<TeacherReports />} />
        <Route path="/teacher-dashboard" element={<TeacherDashboard />} />

        {/* Manager Routes */}
        <Route path="/qb-approval" element={<QBApproval />} />

        {/* Admin Routes */}
        <Route path="/system-settings" element={<SystemSettings />} />
        <Route path="/user-management" element={<UserManagement />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
