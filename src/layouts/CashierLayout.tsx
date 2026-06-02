import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  ShoppingCart,
  LogOut,
  History,
  User,
  Clock,
  Zap,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CashierLayout() {
  const { logout } = useAuth();
  const location = useLocation();
  const userJson = localStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("lo-LA", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const menuItems = [
    { path: "/pos", icon: ShoppingCart, label: "ໜ້າຂາຍ (POS)" },
    ...(user?.role?.name === "ADMIN" 
      ? [{ path: "/pos/history", icon: History, label: "ປະຫວັດການຂາຍ" }] 
      : []
    ),
  ];

  return (
    <div className="flex flex-col h-screen w-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 text-slate-800 font-sans overflow-hidden">
      {/* 🌐 Top Header */}
      <header className="h-20 bg-white/90 backdrop-blur-lg border-b border-slate-200/60 shadow-lg px-8 flex items-center justify-between shrink-0 sticky top-0 z-50">
        {/* Left Side: Brand */}
        <Link to="/pos" className="flex items-center gap-3 group">
          <div className="h-11 w-11 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-all duration-300 group-hover:scale-105">
            <ShoppingCart className="h-6 w-6 text-white" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="font-black text-lg tracking-widest bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              POS-PO
            </span>
            <span className="text-xs text-slate-500 font-medium">
              ລະບົບຂາຍໜ້າຮ້ານ
            </span>
          </div>
        </Link>

        {/* Center: Navigation */}
        <nav className="flex items-center gap-1 bg-slate-100/50 p-1 rounded-xl border border-slate-200/50 backdrop-blur-sm">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link key={item.path} to={item.path} className="relative">
                <Button
                  variant="ghost"
                  className={`gap-2 h-10 px-4 rounded-lg transition-all duration-200 font-semibold text-sm ${
                    active
                      ? "bg-white text-blue-600 shadow-sm border border-blue-200/50"
                      : "text-slate-600 hover:text-slate-700 hover:bg-white/50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                  {active && (
                    <ChevronRight className="h-3 w-3 ml-1 opacity-60" />
                  )}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Right Side: Profile & Time */}
        <div className="flex items-center gap-6">
          {/* Live Clock */}
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-slate-100 to-blue-50 rounded-lg border border-slate-200/50">
            <Clock className="h-4 w-4 text-slate-500 flex-shrink-0" />
            <span className="font-mono text-sm font-semibold text-slate-700 min-w-max">
              {formatTime(currentTime)}
            </span>
          </div>

          {/* Divider */}
          <div className="h-6 w-px bg-slate-200/50"></div>

          {/* User Profile */}
          <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200/50 hover:border-blue-300/50 transition-colors">
            <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0">
              {user?.name?.charAt(0).toUpperCase() || "C"}
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <p className="text-sm font-bold text-slate-700 truncate">
                {user?.name || "ພະນັກງານຂາຍ"}
              </p>
              <p className="text-xs text-slate-500 font-medium">
                {user?.role?.name || "CASHIER"}
              </p>
            </div>
          </div>

          {/* Logout Button */}
          <Button
            variant="ghost"
            size="icon"
            className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg h-10 w-10 transition-all duration-200"
            onClick={logout}
            title="ອອກຈາກລະບົບ"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* 💡 Main Content Area */}
      <main className="flex-1 overflow-hidden flex flex-col">
        <Outlet />
      </main>

      {/* Footer Status Bar */}
      <footer className="h-10 bg-white/50 border-t border-slate-200/50 px-8 flex items-center justify-between text-xs text-slate-600 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Zap className="h-3 w-3 text-emerald-500" />
          <span className="font-semibold">System Status: Active</span>
        </div>
        <span className="text-slate-500">
          ລະບົບຈັດການການຂາຍ POS-PO ພັດທະນາໂດຍ Zaiy JR
        </span>
      </footer>
    </div>
  );
}