import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, User } from 'lucide-react';

export const AppLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Minimalist Sidebar */}
      <aside 
        className="w-20 md:w-64 border-r border-slate-200 bg-white flex flex-col pt-8"
        aria-label="Sidebar Navigation"
      >
        <div className="px-4 md:px-8 mb-12 hidden md:block">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">CareLink</h1>
        </div>
        
        <nav className="flex flex-col gap-2 px-3 md:px-6" aria-label="Main Navigation">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-4 px-3 py-3 rounded-2xl transition-colors ${
                isActive 
                  ? 'bg-slate-100 text-slate-900 font-medium' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
            aria-label="Dashboard"
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="hidden md:inline">Dashboard</span>
          </NavLink>
          
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex items-center gap-4 px-3 py-3 rounded-2xl transition-colors ${
                isActive 
                  ? 'bg-slate-100 text-slate-900 font-medium' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
            aria-label="Profile"
          >
            <User className="w-5 h-5" />
            <span className="hidden md:inline">Profile</span>
          </NavLink>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto bg-slate-50">
        <div className="max-w-7xl mx-auto w-full p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
