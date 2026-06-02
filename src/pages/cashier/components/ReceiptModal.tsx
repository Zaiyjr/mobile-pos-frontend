import React from "react";
import { CheckCircle, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface ReceiptModalProps {
  receipt: any | null;
  setReceipt: (receipt: any | null) => void;
}

export default function ReceiptModal({ receipt, setReceipt }: ReceiptModalProps) {
  if (!receipt) return null;

  const currentUser = JSON.parse(localStorage.getItem("user") || "null");

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
    >
      <motion.div 
        initial={{ scale: 0.95, y: 15 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 15 }}
        className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-slate-100 overflow-hidden flex flex-col p-6"
      >
        
        {/* Header Receipt Card */}
        <div className="flex flex-col items-center text-center gap-2 border-b border-dashed pb-4 border-slate-200">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full h-12 w-12 flex items-center justify-center shadow-inner">
            <CheckCircle className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-black text-slate-950 tracking-wider">MOBILE POS</h2>
          <p className="text-[10px] text-slate-400">ໃບບິນຮັບເງິນຊົ່ວຄາວ (POS Receipt)</p>
          <div className="text-[10px] text-slate-500 flex flex-col gap-0.5 mt-2">
            <span>ບິນເລກທີ: #{receipt.order?.id || "N/A"}</span>
            <span>ວັນທີ: {new Date(receipt.order?.createdAt || Date.now()).toLocaleString("la-LA")}</span>
            <span>ພະນັກງານຂາຍ: {currentUser?.name || "Cashier"}</span>
            {receipt.customerPhone && (
              <span>ເບີໂທລູກຄ້າ: {receipt.customerPhone}</span>
            )}
          </div>
        </div>

        {/* Receipt Table Items */}
        <div className="flex flex-col gap-3 py-4 border-b border-dashed border-slate-200 max-h-48 overflow-y-auto scrollbar-none">
          {receipt.items?.map((item: any, i: number) => (
            <div key={i} className="flex flex-col gap-0.5 text-xs text-slate-700">
              <div className="flex justify-between items-start font-bold">
                <span>{item.name} x{item.quantity}</span>
                <span>{(item.price * item.quantity).toLocaleString()} ₭</span>
              </div>
              {item.imei && (
                <span className="text-[9px] text-slate-400 font-mono">IMEI: {item.imei}</span>
              )}
            </div>
          ))}
        </div>

        {/* Receipt Total */}
        <div className="flex flex-col gap-1.5 py-4">
          <div className="flex justify-between items-center text-xs text-slate-500 font-bold">
            <span>ຍອດລວມ:</span>
            <span>{receipt.total?.toLocaleString()} ₭</span>
          </div>
          <div className="flex justify-between items-center text-sm font-black text-slate-950">
            <span>ຍອດຊຳລະສຸດທິ:</span>
            <span>{receipt.total?.toLocaleString()} ₭</span>
          </div>
        </div>

        {/* Dotted divider / Thank you message */}
        <div className="text-center text-[10px] text-slate-400 font-bold border-t border-dashed pt-4 border-slate-200">
          *** ຂໍຂອບໃຈທີ່ໃຊ້ບໍລິການ ***
        </div>

        {/* Call to Actions */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          <Button 
            variant="outline" 
            onClick={() => window.print()}
            className="rounded-xl border-slate-200 text-slate-700 font-bold gap-2 text-xs h-10 hover:bg-slate-50"
          >
            <Printer className="h-3.5 w-3.5" /> ພິມໃບບິນ
          </Button>
          <Button 
            onClick={() => setReceipt(null)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs h-10 shadow-md"
          >
            ເລີ່ມບິນໃໝ່
          </Button>
        </div>

      </motion.div>
    </motion.div>
  );
}
