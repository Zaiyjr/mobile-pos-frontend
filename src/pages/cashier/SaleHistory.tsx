import React, { useState, useEffect, useMemo } from "react";
import { 
  History, Search, Printer, Trash2, Calendar, 
  Coins, FileText, CheckCircle, XCircle, ArrowLeft, RefreshCw 
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import API from "@/api/axiosInstance";
import ReceiptModal from "./components/ReceiptModal";

interface OrderItem {
  id: number;
  quantity: number;
  priceAtTime: number;
  variant: {
    sku: string;
    product: {
      name: string;
    };
  };
  soldItems?: {
    stockItem: {
      imei: string;
    };
  }[];
}

interface Order {
  id: number;
  createdAt: string;
  totalAmount: number;
  status: "PAID" | "CANCELLED";
  employee?: {
    name: string;
  };
  customer?: {
    name: string;
    phone: string;
  } | null;
  items: OrderItem[];
}

export default function SaleHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [statsPeriod, setStatsPeriod] = useState<"DAILY" | "WEEKLY" | "MONTHLY" | "ALL">("ALL");
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  // Fetch all orders
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await API.get("/orders");
      if (res.data?.success) {
        setOrders(res.data.data);
      }
    } catch (err) {
      console.error("ດຶງປະຫວັດການຂາຍບໍ່ສຳເລັດ:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Check if a date string falls inside the given period
  const isInPeriod = (dateStr: string, period: "DAILY" | "WEEKLY" | "MONTHLY" | "ALL") => {
    const oDate = new Date(dateStr);
    const today = new Date();
    
    if (period === "DAILY") {
      return oDate.toDateString() === today.toDateString();
    }
    
    if (period === "WEEKLY") {
      // Within last 7 days
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(today.getDate() - 7);
      return oDate >= oneWeekAgo;
    }
    
    if (period === "MONTHLY") {
      // Same calendar month and year
      return oDate.getMonth() === today.getMonth() && oDate.getFullYear() === today.getFullYear();
    }
    
    return true;
  };

  // Filter orders by search, status, and stats period
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesStatus = statusFilter === "ALL" || o.status === statusFilter;
      const matchesSearch = 
        o.id.toString().includes(searchQuery) ||
        (o.customer?.phone || "").includes(searchQuery) ||
        (o.customer?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (o.employee?.name || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPeriod = isInPeriod(o.createdAt, statsPeriod);
      return matchesStatus && matchesSearch && matchesPeriod;
    });
  }, [orders, searchQuery, statusFilter, statsPeriod]);

  // Calculate high-fidelity stats cards dynamically from the filtered orders
  const stats = useMemo(() => {
    const activeOrders = filteredOrders.filter(o => o.status === "PAID");
    const totalSales = activeOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
    const totalItems = activeOrders.reduce((sum, o) => {
      return sum + o.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
    }, 0);
    return {
      totalSales,
      orderCount: activeOrders.length,
      itemsCount: totalItems,
    };
  }, [filteredOrders]);

  // Open receipt for a historical order
  const handleViewReceipt = async (orderId: number) => {
    try {
      const res = await API.get(`/orders/${orderId}`);
      if (res.data?.success) {
        const fullOrder = res.data.data;
        
        // Map order details to receipt format
        const receiptData = {
          order: {
            id: fullOrder.id,
            createdAt: fullOrder.createdAt,
          },
          items: fullOrder.items.map((item: any) => ({
            name: item.variant.product.name,
            quantity: item.quantity,
            price: Number(item.priceAtTime),
            imei: item.soldItems?.map((si: any) => si.stockItem.imei).join(", ") || ""
          })),
          total: Number(fullOrder.totalAmount),
          customerPhone: fullOrder.customer?.phone || "ລູກຄ້າທົ່ວໄປ"
        };
        
        setSelectedReceipt(receiptData);
      }
    } catch (err) {
      console.error("ດຶງຂໍ້ມູນໃບບິນບໍ່ສຳເລັດ:", err);
      alert("ບໍ່ສາມາດດຶງຂໍ້ມູນໃບບິນໄດ້");
    }
  };

  // Void / Cancel order
  const handleCancelOrder = async (orderId: number) => {
    if (!window.confirm(`ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການຍົກເລີກບິນຂາຍ #${orderId}? การยกเลิกจะไม่สามารถกู้คืนได้!`)) {
      return;
    }
    setCancellingId(orderId);
    try {
      const res = await API.post(`/orders/cancel/${orderId}`);
      if (res.data?.success) {
        alert("ຍົກເລີກບິນຂາຍສຳເລັດແລ້ວ! ສະຕັອກສິນຄ້າຖືກຄືນລະບົບຮຽບຮ້ອຍ");
        fetchOrders();
      }
    } catch (err: any) {
      console.error("ຍົກເລີກບິນຂາຍບໍ່ສຳເລັດ:", err);
      alert(err.response?.data?.message || "ເກີດຂໍ້ຜິດພາດໃນການຍົກເລີກບິນ");
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 p-6 overflow-y-auto flex flex-col gap-6"
    >
      
      {/* 📊 Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-200/60 gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <span className="p-2.5 bg-blue-600 rounded-2xl text-white shadow-md shadow-blue-100 flex items-center justify-center">
              <History className="h-5 w-5" />
            </span>
            ປະຫວັດການຂາຍໜ້າຮ້ານ (Sales History)
          </h1>
          <p className="text-xs text-slate-400 mt-1">ກວດສອບ, ພິມໃບບິນຍ້ອນຫຼັງ ແລະ ຍົກເລີກບິນຂາຍ</p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={fetchOrders} 
            variant="outline" 
            className="rounded-xl h-11 border-slate-200 gap-2 font-bold text-xs"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            ໂຫຼດໃໝ່
          </Button>
          <Link to="/pos">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 px-5 font-bold text-xs gap-1.5 shadow-md shadow-blue-100">
              <ArrowLeft className="h-4 w-4" />
              ກັບໄປໜ້າຂາຍ
            </Button>
          </Link>
        </div>
      </div>

      {/* 📅 Period Select Switch (Daily, Weekly, Monthly, All) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/80 p-3 rounded-2xl border border-slate-200/50 backdrop-blur-sm shrink-0 gap-3">
        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-2">
          ຊ່ວງເວລາລາຍງານສະຖິຕິ & ລາຍການບິນ
        </span>
        <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
          {[
            { id: "DAILY", label: "📅 ລາຍວັນ" },
            { id: "WEEKLY", label: "🗓️ ລາຍອາທິດ" },
            { id: "MONTHLY", label: "📊 ລາຍເດືອນ" },
            { id: "ALL", label: "🌍 ທັງໝົດ" }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setStatsPeriod(item.id as any)}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg font-bold text-xs transition-all whitespace-nowrap ${
                statsPeriod === item.id
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* 📈 Stats overview row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 shrink-0">
        
        <Card className="border border-slate-200/60 shadow-sm rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 opacity-10 text-white pointer-events-none">
            <Coins className="h-32 w-32" />
          </div>
          <CardContent className="p-6">
            <span className="text-[10px] font-black text-blue-100 uppercase tracking-wider block">
              ຍອດຂາຍ {statsPeriod === "DAILY" ? "ລາຍວັນ" : statsPeriod === "WEEKLY" ? "ລາຍອາທິດ" : statsPeriod === "MONTHLY" ? "ລາຍເດືອນ" : "ທັງໝົດ"} (PAID)
            </span>
            <h2 className="text-3xl font-black tracking-tight mt-1.5">{stats.totalSales.toLocaleString()} ₭</h2>
            <p className="text-[10px] text-blue-100/90 mt-2 font-semibold">
              {statsPeriod === "DAILY" ? "ລວມຍອດຂາຍສະເພາະມື້ນີ້" : statsPeriod === "WEEKLY" ? "ລວມຍອດຂາຍໃນ 7 ວັນຫຼ້າສຸດ" : statsPeriod === "MONTHLY" ? "ລວມຍອດຂາຍໃນເດືອນນີ້" : "ລວມຍອດຂາຍທັງໝົດໃນລະບົບ"}
            </p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/60 shadow-sm rounded-2xl bg-white relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 opacity-5 text-slate-900 pointer-events-none">
            <FileText className="h-32 w-32" />
          </div>
          <CardContent className="p-6">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">ຈຳນວນບິນຂາຍ</span>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight mt-1.5">{stats.orderCount} ບິນ</h2>
            <p className="text-[10px] text-slate-400 mt-2 font-semibold">ບໍ່ລວມບິນທີ່ຖືກຍົກເລີກ</p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/60 shadow-sm rounded-2xl bg-white relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 opacity-5 text-slate-900 pointer-events-none">
            <History className="h-32 w-32" />
          </div>
          <CardContent className="p-6">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">ສິນຄ້າທີ່ຂາຍອອກ</span>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight mt-1.5">{stats.itemsCount} ເຄື່ອງ</h2>
            <p className="text-[10px] text-slate-400 mt-2 font-semibold">ຈຳນວນເຄື່ອງ/ອຸປະກອນທັງໝົດ</p>
          </CardContent>
        </Card>

      </div>

      {/* 🔍 Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-200/60 justify-between items-center shrink-0">
        
        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="ຄົ້ນຫາ ເລກບິນ, ເບີໂທລູກຄ້າ, ພະນັກງານ..."
            className="pl-10 h-10 border-slate-200 rounded-xl focus:border-blue-500 shadow-sm font-semibold text-slate-700"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Dropdowns / Buttons */}
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-0.5">
          {["ALL", "PAID", "CANCELLED"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-xl font-bold text-xs transition-all whitespace-nowrap border ${
                statusFilter === status
                  ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                  : "bg-white text-slate-500 hover:bg-slate-100 border-slate-200"
              }`}
            >
              {status === "ALL" ? "ທັງໝົດ" : status === "PAID" ? "🟢 PAID" : "🔴 CANCELLED"}
            </button>
          ))}
        </div>

      </div>

      {/* 🧾 Orders List Table Grid */}
      <div className="flex-1 bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col min-h-[300px]">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider">
                <th className="py-4 px-6">ເລກບິນ</th>
                <th className="py-4 px-6">ວັນທີ & ເວລາ</th>
                <th className="py-4 px-6">ລູກຄ້າ</th>
                <th className="py-4 px-6">ພະນັກງານຂາຍ</th>
                <th className="py-4 px-6 text-right">ຍອດລວມ</th>
                <th className="py-4 px-6 text-center">...</th>
                <th className="py-4 px-6 text-center">ຈັດການ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-slate-700 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400 font-bold">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto text-blue-500 mb-2" />
                    ກຳລັງໂຫຼດປະຫວັດການຂາຍ...
                  </td>
                </tr>
              ) : filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/40 transition-colors">
                    
                    {/* Order Number */}
                    <td className="py-4 px-6 font-mono font-black text-slate-900">
                      #{order.id}
                    </td>

                    {/* Date and Time */}
                    <td className="py-4 px-6 font-medium text-xs text-slate-500">
                      {new Date(order.createdAt).toLocaleString("la-LA", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </td>

                    {/* Customer */}
                    <td className="py-4 px-6">
                      {order.customer ? (
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-slate-800 text-xs">{order.customer.name}</span>
                          <span className="text-[10px] text-slate-400 font-bold">{order.customer.phone}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 font-bold">ລູກຄ້າທົ່ວໄປ</span>
                      )}
                    </td>

                    {/* Cashier Name */}
                    <td className="py-4 px-6 font-bold text-xs text-slate-700">
                      {order.employee?.name || "N/A"}
                    </td>

                    {/* Total Amount */}
                    <td className="py-4 px-6 text-right font-black text-slate-900 tracking-tight">
                      {Number(order.totalAmount).toLocaleString()} ₭
                    </td>

                    {/* Status badge */}
                    <td className="py-4 px-6 text-center">
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${
                        order.status === "PAID" 
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                          : "bg-red-50 text-red-600 border border-red-100"
                      }`}>
                        {order.status === "PAID" ? "ຊຳລະແລ້ວ" : "ຍົກເລີກບິນ"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button 
                          onClick={() => handleViewReceipt(order.id)}
                          variant="outline" 
                          className="h-8 rounded-lg text-slate-700 font-extrabold text-[11px] border-slate-200 hover:bg-slate-50 gap-1"
                        >
                          <Printer className="h-3 w-3" /> ເບິ່ງບິນ
                        </Button>
                        
                        {order.status === "PAID" && (
                          <Button 
                            onClick={() => handleCancelOrder(order.id)}
                            disabled={cancellingId === order.id}
                            className="h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 font-extrabold text-[11px] border-none shadow-none"
                          >
                            <Trash2 className="h-3 w-3" />
                            {cancellingId === order.id ? "ກຳລັງຍົກເລີກ..." : "ຍົກເລີກ"}
                          </Button>
                        )}
                      </div>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400 font-bold">
                    ບໍ່ມີລາຍການປະຫວັດການຂາຍທີ່ກົງກັບເງື່ອນໄຂ
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🧾 Interactive printable receipt overlay modal */}
      <AnimatePresence>
        {selectedReceipt && (
          <ReceiptModal
            receipt={selectedReceipt}
            setReceipt={setSelectedReceipt}
          />
        )}
      </AnimatePresence>

    </motion.div>
  );
}
