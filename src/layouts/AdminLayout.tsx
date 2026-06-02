import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  ShieldCheck,
  Package,
  Layers,
  LogOut,
  BarChart3,
  ChevronDown,
  Menu,
  X,
  ShoppingCart,
  Clock,
  LayoutDashboard,
  Settings,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminLayout() {
  const { logout } = useAuth();
  const location = useLocation();
  const userJson = localStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const isActive = (path: string) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(path);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("lo-LA", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("lo-LA", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const menuItems = [
    { path: "/admin", icon: LayoutDashboard, label: "ພາບລວມລະບົບ" },
    { path: "/admin/products", icon: Package, label: "ຈັດການສິນຄ້າ" },
    { path: "/admin/categories", icon: Layers, label: "ໝວດໝູ່ & ຍີ່ຫໍ້" },
    { path: "/admin/reports", icon: BarChart3, label: "ລາຍງານຍອດຂາຍ" },
    { path: "/admin/users", icon: User, label: "ຜູ້ໃຊ້ງານ" },
   
  ];

  return (
    <div className="flex h-screen w-screen bg-slate-100 text-slate-800 font-sans overflow-hidden">
      {/* ==================================================================== */}
      {/* 🎨 Premium Dark Slate Sidebar Panel */}
      {/* ==================================================================== */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white p-5 flex flex-col justify-between shadow-2xl shrink-0 transition-all duration-300 ease-in-out border-r border-slate-800/80 z-30`}
      >
        {/* Top Section */}
        <div className="flex flex-col gap-6">
          {/* Logo / Header */}
          <div className="flex items-center gap-3 border-b border-slate-800/60 pb-5 group">
            <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-all duration-300">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            {sidebarOpen && (
              <div className="flex flex-col gap-0.5">
                <h2 className="font-black text-sm tracking-wider bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  MOBILE POS
                </h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  ADMIN PORTAL
                </p>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link key={item.path} to={item.path} className="relative group">
                  <Button
                    variant="ghost"
                    className={`w-full ${
                      sidebarOpen ? "justify-start" : "justify-center"
                    } gap-3 rounded-xl transition-all duration-200 relative overflow-hidden py-5 px-3.5 ${
                      active
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 hover:text-white"
                        : "text-slate-400 hover:bg-slate-900/60 hover:text-white"
                    }`}
                  >
                    <Icon className="h-4.5 w-4.5 flex-shrink-0" />
                    {sidebarOpen && (
                      <span className="font-semibold text-xs tracking-wide">
                        {item.label}
                      </span>
                    )}
                  </Button>
                  {!sidebarOpen && (
                    <div className="absolute left-20 top-1.5 bg-slate-950 text-white px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none shadow-xl border border-slate-800">
                      {item.label}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Short divider */}
          <div className="h-px bg-slate-800/50"></div>

          {/* Quick Switch to POS Screen */}
          <Link to="/pos" className="relative group">
            <Button
              variant="ghost"
              className={`w-full ${
                sidebarOpen ? "justify-start" : "justify-center"
              } gap-3 rounded-xl py-5 px-3.5 bg-emerald-950/20 hover:bg-emerald-900/30 text-emerald-400 border border-emerald-900/20 hover:text-emerald-300 transition-all duration-200`}
            >
              <ShoppingCart className="h-4.5 w-4.5 flex-shrink-0" />
              {sidebarOpen && (
                <span className="font-semibold text-xs tracking-wide">
                  ໄປໜ້າຈໍຂາຍ (POS)
                </span>
              )}
            </Button>
            {!sidebarOpen && (
              <div className="absolute left-20 top-1.5 bg-emerald-950 text-emerald-300 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none shadow-xl border border-emerald-900">
                ໄປໜ້າຈໍຂາຍ (POS)
              </div>
            )}
          </Link>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col gap-4 border-t border-slate-800/60 pt-5">
          {/* Live Date / Time Widget */}
          {sidebarOpen && (
            <div className="flex flex-col gap-1 px-3 py-2.5 bg-slate-950/60 rounded-xl border border-slate-900 text-left">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Clock className="h-3.5 w-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  ເວລາລະບົບ
                </span>
              </div>
              <span className="font-mono text-sm font-semibold text-white mt-1">
                {formatTime(currentTime)}
              </span>
              <span className="text-[9px] text-slate-500 font-semibold truncate">
                {formatDate(currentTime)}
              </span>
            </div>
          )}

          {/* Logout Button */}
          <Button
            variant="ghost"
            className={`w-full ${
              sidebarOpen ? "justify-start" : "justify-center"
            } gap-3 text-red-400 hover:bg-red-950/30 hover:text-red-300 rounded-xl py-5 transition-all duration-200`}
            onClick={logout}
          >
            <LogOut className="h-4.5 w-4.5 flex-shrink-0" />
            {sidebarOpen && (
              <span className="font-bold text-xs tracking-wide">ອອກຈາກລະບົບ</span>
            )}
          </Button>
        </div>
      </aside>

      {/* ==================================================================== */}
      {/* 📈 Main Content Area */}
      {/* ==================================================================== */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Top Header Navbar */}
        <header className="h-20 bg-white/95 backdrop-blur-lg border-b border-slate-200 px-8 flex items-center justify-between shrink-0 sticky top-0 z-20">
          {/* Left Side: Toggle Sidebar Button */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-slate-600 hover:bg-slate-100 rounded-xl h-10 w-10 border border-slate-200/50"
            >
              {sidebarOpen ? (
                <X className="h-4.5 w-4.5" />
              ) : (
                <Menu className="h-4.5 w-4.5" />
              )}
            </Button>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                Dashboard Overview
              </span>
              <span className="text-sm font-semibold text-slate-700">
                ສະບາຍດີ, {user?.name || "ຜູ້ດູແລລະບົບ"}
              </span>
            </div>
          </div>

          {/* Right Side: Admin User Profile Widget */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-slate-100 to-blue-50 rounded-xl border border-slate-200 hover:border-slate-300/80 transition-all">
              <div className="h-8.5 w-8.5 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-md">
                {user?.name?.charAt(0).toUpperCase() || "A"}
              </div>
              <div className="flex flex-col gap-0.5 min-w-0">
                <p className="text-sm font-black text-slate-700 truncate">
                  {user?.name || "ຜູ້ຈັດການ"}
                </p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  {user?.role?.name || "ADMIN"}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Routed Views Content (Remove double padding by rendering directly) */}
        <main className="flex-1 overflow-y-auto bg-slate-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}