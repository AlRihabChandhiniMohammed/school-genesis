import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { LayoutDashboard, Users, FileQuestion, BookOpen, LogOut, GraduationCap, Youtube, Brain, BarChart3, ChevronLeft, ChevronRight, Shield, TrendingUp } from 'lucide-react';
import { useState } from 'react';

const teacherLinks = [
  { to: '/teacher/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/teacher/classes', icon: Users, label: 'Classes' },
  { to: '/teacher/quizzes', icon: FileQuestion, label: 'Quizzes' },
  { to: '/teacher/quizzes/generate', icon: Brain, label: 'AI Generate' },
  { to: '/teacher/assignments', icon: BookOpen, label: 'Assignments' },
  { to: '/teacher/groups', icon: Users, label: 'Groups' },
  { to: '/teacher/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/teacher/ai-assistant', icon: Brain, label: 'AI Assistant' },
];

const adminLinks = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/logs', icon: TrendingUp, label: 'Logs' },
];

const studentLinks = [
  { to: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/student/quizzes', icon: FileQuestion, label: 'Quizzes' },
  { to: '/student/assignments', icon: BookOpen, label: 'Assignments' },
  { to: '/student/results', icon: BarChart3, label: 'Results' },
  { to: '/student/videos', icon: Youtube, label: 'Videos' },
  { to: '/student/ai-tutor', icon: Brain, label: 'AI Tutor' },
  { to: '/student/analytics', icon: BarChart3, label: 'Analytics' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const roleLinks = { teacher: teacherLinks, student: studentLinks, admin: adminLinks };
  const links = roleLinks[user?.role] || studentLinks;

  const handleLogout = async () => { await logout(); navigate('/login'); };

  return (
    <aside className={`fixed left-0 top-0 h-screen ${collapsed ? 'w-16' : 'w-64'} bg-white dark:bg-bg-dark border-r border-border dark:border-white/10 transition-all duration-300 z-50 flex flex-col`}>
      <div className="flex items-center gap-3 h-16 px-4 border-b border-border dark:border-white/10">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0">
          <GraduationCap className="w-4 h-4 text-white" />
        </div>
        {!collapsed && <span className="font-bold text-lg">School Genesis</span>}
      </div>

      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {links.map(l => (
          <NavLink key={l.to} to={l.to} end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-0' : ''}`}>
            <l.icon className="w-5 h-5 shrink-0" />
            {!collapsed && <span>{l.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="p-2 border-t border-border dark:border-white/10">
        <button onClick={() => setCollapsed(!collapsed)} className="sidebar-link w-full justify-center">
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <><ChevronLeft className="w-5 h-5" /><span>Collapse</span></>}
        </button>
        <button onClick={handleLogout} className={`sidebar-link w-full text-danger ${collapsed ? 'justify-center' : ''}`}>
          <LogOut className="w-5 h-5" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
