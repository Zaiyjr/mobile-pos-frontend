import React from "react";
import { X, CheckCircle2, QrCode, ArrowRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalPrice: number;
  onConfirm: () => void;
  loading: boolean;
}

export default function PaymentModal({
  isOpen,
  onClose,
  totalPrice,
  onConfirm,
  loading,
}: PaymentModalProps) {
  if (!isOpen) return null;

  // // Real-world exchange rate (1 USD = 22,000 LAK approx)
  // const exchangeRate = 22000;
  // const priceInLak = totalPrice * exchangeRate;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, y: 15 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 15 }}
        className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-black text-slate-800 flex items-center gap-2 text-sm tracking-wide">
            <QrCode className="h-5 w-5 text-blue-600" />
            ຊຳລະເງິນຜ່ານ QR Code (BCEL OnePay)
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col items-center gap-6">
          
          {/* Price display */}
          <div className="w-full bg-blue-50/50 border border-blue-100/50 p-4 rounded-2xl flex flex-col items-center text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ຍອດຊຳລະທັງໝົດ</span>
            <span className="text-3xl font-black text-blue-600 mt-1">{totalPrice.toLocaleString()} ₭</span>
            {/* <div className="flex items-center gap-2 mt-1.5 text-xs font-semibold text-slate-500">
              <span>≈ {priceInLak.toLocaleString()} LAK</span>
              <span className="text-[10px] text-slate-400 bg-slate-200/50 px-1.5 py-0.5 rounded">ອັດຕາ 22,000</span>
            </div> */}
          </div>

          {/* Premium Mockup BCEL OnePay Frame */}
          <div className="w-60 bg-gradient-to-b from-red-600 via-blue-600 to-blue-700 p-3.5 rounded-3xl shadow-xl flex flex-col items-center gap-3.5 border border-red-500/20">
            {/* OnePay Header */}
            <div className="flex justify-between items-center w-full px-1 text-white">
              <span className="text-[11px] font-black tracking-widest italic">OnePay</span>
              <span className="text-[8px] font-bold bg-white/20 px-2 py-0.5 rounded-full">BCEL</span>
            </div>

            {/* QR Scanner Screen */}
            <div className="bg-white p-4 rounded-2xl w-full flex flex-col items-center shadow-inner relative group overflow-hidden">
              <img 
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTiPzmq2Mg0rRaaiUb5iH6qYqrLT6sGgxhJOA&s" 
                alt="Payment QR" 
                className="w-40 h-40 object-contain"
              />
              <span className="text-[8px] font-bold text-slate-400 mt-2 tracking-wider">MOBILE POS MERCHANT QR</span>
            </div>

            {/* OnePay Footer info */}
            <div className="text-center text-white">
              <p className="text-[9px] font-black tracking-wide">ສະແກນເພື່ອຊຳລະເງິນ</p>
              <p className="text-[7px] text-white/70 font-semibold mt-0.5">ສາມາດສະແກນໄດ້ດ້ວຍທຸກແອັບທະນາຄານ</p>
            </div>
          </div>

          <div className="text-center text-xs text-slate-400 font-medium px-4">
            ກະລຸນາໃຫ້ລູກຄ້າສະແກນ QR ແລະ ກວດສອບຍອດເງິນໃຫ້ຖືກຕ້ອງ ຫຼັງຈາກນັ້ນກົດ **"ຢືນຢັນການຊຳລະ"** ເພື່ອພິມໃບບິນ.
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
          <Button 
            variant="outline" 
            onClick={onClose} 
            className="flex-1 rounded-2xl h-12 border-slate-200 text-slate-700 font-bold"
          >
            ຍົກເລີກ
          </Button>
          <Button 
            onClick={onConfirm} 
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-12 font-black shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="h-4.5 w-4.5" />
                ຢືນຢັນການຊຳລະ
              </>
            )}
          </Button>
        </div>

      </motion.div>
    </motion.div>
  );
}
