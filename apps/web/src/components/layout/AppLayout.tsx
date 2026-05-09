import React, { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { LayoutDashboard, Menu, User, Activity, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PatientSelector } from "./PatientSelector";

export const AppLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Insights", path: "/insights", icon: Activity },
    { name: "Profile", path: "/profile", icon: User },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* Sidebar */}
      <AnimatePresence initial={false}>
        {isSidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="h-full border-r border-slate-100 bg-white flex flex-col shadow-sm z-20 overflow-hidden shrink-0"
          >
            <div className="p-6 flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-blue-500 flex items-center justify-center shadow-sm">
                <Activity className="text-white w-5 h-5" />
              </div>
              <span className="font-semibold text-lg tracking-tight whitespace-nowrap">CareLink</span>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname.includes(item.path);
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-2xl transition-all duration-200 ${
                      isActive
                        ? "bg-slate-100 text-slate-900 font-medium"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <Icon className="w-5 h-5 shrink-0" strokeWidth={isActive ? 2.5 : 2} />
                    <span className="whitespace-nowrap">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-16 flex items-center justify-between px-6 shrink-0 bg-slate-50/80 backdrop-blur-md sticky top-0 z-10 border-b border-transparent">
          <button
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="p-2 -ml-2 rounded-xl text-slate-500 hover:bg-slate-200/50 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex items-center">
            <PatientSelector />
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};
