import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import Sidebar from './components/Sidebar.jsx';

// Pages
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import TeacherDashboard from './pages/teacher/Dashboard.jsx';
import TeacherClasses from './pages/teacher/Classes.jsx';
import TeacherClassDetail from './pages/teacher/ClassDetail.jsx';
import TeacherQuizzes from './pages/teacher/Quizzes.jsx';
import QuizGenerate from './pages/teacher/QuizGenerate.jsx';
import TeacherAssignments from './pages/teacher/Assignments.jsx';
import TeacherGroups from './pages/teacher/Groups.jsx';
import TeacherAnalytics from './pages/teacher/Analytics.jsx';
import TeacherAIAssistant from './pages/teacher/AIAssistant.jsx';
import StudentDashboard from './pages/student/Dashboard.jsx';
import StudentQuizzes from './pages/student/Quizzes.jsx';
import TakeQuiz from './pages/student/TakeQuiz.jsx';
import StudentResults from './pages/student/Results.jsx';
import StudentVideos from './pages/student/Videos.jsx';
import StudentAITutor from './pages/student/AITutor.jsx';
import StudentAnalytics from './pages/student/Analytics.jsx';
import AdminDashboard from './pages/admin/Dashboard.jsx';
import AdminUsers from './pages/admin/Users.jsx';
import AdminLogs from './pages/admin/Logs.jsx';
import StudentAssignments from './pages/student/Assignments.jsx';

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to={`/${user.role}/dashboard`} />;
  return <div className="flex min-h-screen"><Sidebar /><main className="flex-1 p-6 lg:p-8 ml-16 lg:ml-64 transition-all overflow-y-auto">{children}</main></div>;
}

function LoadingScreen() {
  return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/teacher/dashboard" element={<ProtectedRoute roles={['teacher']}><TeacherDashboard /></ProtectedRoute>} />
      <Route path="/teacher/classes" element={<ProtectedRoute roles={['teacher']}><TeacherClasses /></ProtectedRoute>} />
      <Route path="/teacher/classes/:id" element={<ProtectedRoute roles={['teacher']}><TeacherClassDetail /></ProtectedRoute>} />
      <Route path="/teacher/quizzes" element={<ProtectedRoute roles={['teacher']}><TeacherQuizzes /></ProtectedRoute>} />
      <Route path="/teacher/quizzes/generate" element={<ProtectedRoute roles={['teacher']}><QuizGenerate /></ProtectedRoute>} />
      <Route path="/teacher/assignments" element={<ProtectedRoute roles={['teacher']}><TeacherAssignments /></ProtectedRoute>} />
      <Route path="/teacher/groups" element={<ProtectedRoute roles={['teacher']}><TeacherGroups /></ProtectedRoute>} />
      <Route path="/teacher/analytics" element={<ProtectedRoute roles={['teacher']}><TeacherAnalytics /></ProtectedRoute>} />
      <Route path="/teacher/ai-assistant" element={<ProtectedRoute roles={['teacher']}><TeacherAIAssistant /></ProtectedRoute>} />
      <Route path="/student/dashboard" element={<ProtectedRoute roles={['student']}><StudentDashboard /></ProtectedRoute>} />
      <Route path="/student/quizzes" element={<ProtectedRoute roles={['student']}><StudentQuizzes /></ProtectedRoute>} />
      <Route path="/student/quizzes/:id" element={<ProtectedRoute roles={['student']}><TakeQuiz /></ProtectedRoute>} />
      <Route path="/student/results" element={<ProtectedRoute roles={['student']}><StudentResults /></ProtectedRoute>} />
      <Route path="/student/videos" element={<ProtectedRoute roles={['student']}><StudentVideos /></ProtectedRoute>} />
      <Route path="/student/ai-tutor" element={<ProtectedRoute roles={['student']}><StudentAITutor /></ProtectedRoute>} />
      <Route path="/student/analytics" element={<ProtectedRoute roles={['student']}><StudentAnalytics /></ProtectedRoute>} />
      <Route path="/student/assignments" element={<ProtectedRoute roles={['student']}><StudentAssignments /></ProtectedRoute>} />
      <Route path="/admin/dashboard" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><AdminUsers /></ProtectedRoute>} />
      <Route path="/admin/logs" element={<ProtectedRoute roles={['admin']}><AdminLogs /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
