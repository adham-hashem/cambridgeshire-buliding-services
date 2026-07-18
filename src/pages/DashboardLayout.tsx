import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  BarChart3,
  BookOpen,
  FileText,
  LogOut,
  Mail,
  Menu,
  MessageSquare,
  Settings,
  Star,
  Home,
  Users,
  X,
} from 'lucide-react';

export function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { icon: BarChart3, label: 'Dashboard', path: '/dashboard' },
    { icon: FileText, label: 'Quote Requests', path: '/dashboard/quotes' },
    { icon: Home, label: 'Projects', path: '/dashboard/projects' },
    { icon: Settings, label: 'Services', path: '/dashboard/services' },
    { icon: BookOpen, label: 'Journal', path: '/dashboard/journal' },
  ];

  const isCurrentPath = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-[#f7f8fa] relative">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 bg-white transform transition-all duration-300 z-50 ${
          sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'
        } md:relative md:translate-x-0 md:w-64 flex flex-col border-r border-charcoal-200 overflow-hidden`}
      >
        {/* Logo Section */}
        <div className="px-6 py-5 border-b border-charcoal-200">
          <div className="animate-fade-in">
            <img
              src="/logo-transparent.png"
              alt="Cambridgeshire Building Services"
              className="h-12 w-auto"
            />
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {menuItems.map((item, index) => {
            const isActive = isCurrentPath(item.path);
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
                style={{ animationDelay: `${index * 40}ms` }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 animate-slide-up ${
                  isActive
                    ? 'bg-navy-800 text-white'
                    : 'text-charcoal-500 hover:bg-cream-100 hover:text-navy-800'
                }`}
              >
                <item.icon size={18} className="flex-shrink-0" />
                <span className="font-medium text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-charcoal-200 p-3 space-y-0.5">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-500 hover:bg-red-50 transition-all"
          >
            <LogOut size={18} />
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-white border-b border-charcoal-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 hover:bg-cream-100 rounded-lg transition-all"
            >
              {sidebarOpen ? (
                <X size={24} className="text-charcoal-700" />
              ) : (
                <Menu size={24} className="text-charcoal-700" />
              )}
            </button>
            <h1 className="text-lg font-semibold text-navy-800 font-display">
              Cambridgeshire Building Services
            </h1>
            <div className="w-8 h-8 rounded-full bg-navy-800 text-white flex items-center justify-center text-sm font-medium">
              A
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6 md:p-8 animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-navy-900/30 md:hidden z-40 animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
