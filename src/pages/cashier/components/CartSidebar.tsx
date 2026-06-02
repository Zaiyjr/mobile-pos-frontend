import React from "react";
import { Trash2, Phone, CreditCard, RefreshCw, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import type { CartItem } from "@/stores/usePosStore";

interface CartSidebarProps {
  cart: CartItem[];
  customerPhone: string;
  setCustomerPhone: (s: string) => void;
  removeFromCart: (id: number) => void;
  updateIMEI: (id: number, s: string) => void;
  clearCart: () => void;
  checkout: (onSuccess?: () => void) => void;
  loading: boolean;
  totalPrice: number;
  fetchProducts: () => void;
}

export default function CartSidebar({
  cart,
  customerPhone,
  setCustomerPhone,
  removeFromCart,
  updateIMEI,
  clearCart,
  checkout,
  loading,
  totalPrice,
  fetchProducts,
}: CartSidebarProps) {
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");

  return (
    <div className="w-[380px] bg-gradient-to-b from-blue-50/70 via-white to-blue-50/50 text-slate-800 p-6 flex flex-col justify-between shadow-2xl border-l border-blue-100/80 shrink-0">
      
      {/* Top Section */}
      <div className="flex flex-col gap-4 overflow-y-auto flex-1 pr-1 scrollbar-none">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-blue-100/50 pb-4 shrink-0">
          <div>
            <h2 className="text-lg font-black tracking-tight text-slate-900 flex items-center gap-2">
              ລາຍການກຳລັງຂາຍ
              <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            </h2>
            <p className="text-[10px] text-slate-400 mt-0.5">Cashier: {currentUser?.name || "ພະນັກງານ"}</p>
          </div>
          {cart.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-red-500 hover:bg-red-50 hover:text-red-600 font-bold text-xs" 
              onClick={clearCart}
            >
              ລຶບທັງໝົດ
            </Button>
          )}
        </div>

        {/* Cart items */}
        <div className="flex flex-col gap-3.5 mt-2">
          <AnimatePresence mode="popLayout">
            {cart.map((item) => (
              <motion.div 
                key={item.id} 
                layout 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }}
                className="p-3.5 bg-white/95 rounded-xl border border-blue-100/70 flex flex-col gap-3 hover:border-blue-200/80 transition-colors shadow-sm"
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1">
                    <h4 className="font-bold text-xs text-slate-800 line-clamp-1">{item.name}</h4>
                    <p className="text-[10px] text-blue-600 font-bold mt-1">
                      {item.price.toLocaleString()} ₭ x {item.quantity}
                    </p>
                  </div>
                  <button 
                    className="text-slate-400 hover:text-red-500 transition-colors p-1" 
                    onClick={() => removeFromCart(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                
                <Input
                  placeholder="ສະແກນ ຫຼື ໃສ່ເລກ IMEI/SN..."
                  className="h-8 text-[11px] bg-slate-50/50 border-blue-100 text-slate-800 placeholder:text-slate-400 focus:border-blue-500 rounded-lg focus:ring-0"
                  value={item.imei || ""}
                  onChange={(e) => updateIMEI(item.id, e.target.value)}
                />
              </motion.div>
            ))}
          </AnimatePresence>

          {cart.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-400/80 gap-3 mt-12">
              <ShoppingCart className="h-12 w-12 text-blue-200 animate-pulse" />
              <span className="font-bold text-xs text-slate-400">ຕະກ້າວ່າງເປົ່າ</span>
            </div>
          )}
        </div>

      </div>

      {/* Footer Section */}
      <div className="border-t border-blue-100/50 pt-4 flex flex-col gap-4 mt-4 shrink-0">
        
        <div className="relative">
          <Phone className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <Input
            placeholder="ເບີໂທລູກຄ້າ (ສະສົມຄະແນນ)"
            className="pl-10 h-10 bg-white border-blue-100 text-slate-800 placeholder:text-slate-400 focus:border-blue-500 rounded-xl focus:ring-0 text-xs shadow-sm"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
          />
        </div>

        <div className="flex justify-between items-center border-t border-blue-100/30 pt-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">ຍອດຊຳລະສຸດທິ:</span>
          <span className="text-2xl font-black text-blue-600">{totalPrice.toLocaleString()} ₭</span>
        </div>

        <Button 
          onClick={() => checkout(fetchProducts)} 
          disabled={loading || cart.length === 0} 
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400 text-white py-6 text-sm font-black rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" /> ກຳລັງບັນທຶກ...
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4" /> ພິມບິນ
            </>
          )}
        </Button>

      </div>

    </div>
  );
}
