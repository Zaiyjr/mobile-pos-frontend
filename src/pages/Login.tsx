import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Lock, User, ShieldAlert, Eye, EyeOff, Loader2, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // 💡 ເພີ່ມ state ເປີດ-ປິດລະຫັດ
  const { login, loading, error } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(username, password);
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 font-sans p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm bg-white p-8 rounded-3xl shadow-2xl shadow-blue-100 border border-slate-100 flex flex-col gap-8"
      >
        <div className="text-center flex flex-col gap-2">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-lg shadow-blue-200">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-blue-950 tracking-wide">MOBILE POS</h1>
          <p className="text-xs text-slate-400 font-medium">ເຂົ້າສູ່ລະບົບຈັດການຮ້ານຄ້າ</p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold flex items-center gap-2 border border-red-100"
          >
            <ShieldAlert className="h-4 w-4 shrink-0" /> {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="relative">
            <User className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="ຊື່ຜູ້ໃຊ້"
              className="pl-10 h-12 bg-slate-50 border-slate-200 focus:border-blue-500 rounded-xl"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
            <Input
              type={showPassword ? "text" : "password"} // 💡 ປ່ຽນ type ຕາມ state
              placeholder="ລະຫັດຜ່ານ"
              className="pl-10 pr-10 h-12 bg-slate-50 border-slate-200 focus:border-blue-500 rounded-xl"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <Button 
            type="submit" 
            disabled={loading} 
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 font-bold rounded-xl shadow-lg shadow-blue-200 mt-2 transition-all active:scale-95"
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" /> ກຳລັງກວດສອບ...</>
            ) : "ເຂົ້າສູ່ລະບົບ"}
          </Button>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-medium">ຫຼື</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <Button 
            type="button" 
            onClick={() => login("admin", "admin123", "staff")}
            disabled={loading} 
            className="w-full h-12 bg-white border-2 border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-blue-400 hover:text-blue-600 font-bold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <UserCheck className="h-5 w-5" />
            ເຂົ້າສູ່ລະບົບສຳລັບທົດລອງ (Demo)
          </Button>
        </form>
        
        <p className="text-center text-[10px] text-slate-300 font-bold uppercase tracking-widest">
          Version 1.0.0
        </p>
      </motion.div>
    </div>
  );
}