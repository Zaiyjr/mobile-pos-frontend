import React, { useState, useEffect, useMemo } from "react";
import API from "@/api/axiosInstance";
import { BarChart3, CalendarDays, ShoppingBag, DollarSign, Calendar, Search } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

type FilterType = "month" | "year" | "custom";

type ReportOrderItem = {
  quantity: number;
  priceAtTime?: number | string | null;
  variantId?: number | string;
  variant?: {
    product?: {
      name?: string;
    };
  };
};

type ReportOrder = {
  createdAt: string;
  totalAmount: number | string;
  items?: ReportOrderItem[];
};

type ChartDataPoint = {
  label: string;
  total: number;
};

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<ReportOrder[]>([]);
  const [filter, setFilter] = useState<FilterType>("month");

  // 💡 ຕັ້ງຄ່າເວລາປັດຈຸບັນ (ປີປັດຈຸບັນແມ່ນ 2026)
  const now = new Date();
  const currentYearStr = now.getFullYear().toString();
  const currentMonthStr = String(now.getMonth() + 1).padStart(2, '0');

  // States ສໍາລັບການເລືອກ ວັນທີ/ເດືອນ/ປີ ໃນອະດີດ
  const [selectedMonth, setSelectedMonth] = useState(`${currentYearStr}-${currentMonthStr}`); // YYYY-MM
  const [selectedYear, setSelectedYear] = useState(currentYearStr); // YYYY
  const [startDate, setStartDate] = useState(`${currentYearStr}-${currentMonthStr}-01`); // ວັນທີເລີ່ມຕົ້ນ
  const [endDate, setEndDate] = useState(now.toISOString().split("T")[0]); // ວັນທີສິ້ນສຸດ

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await API.get("/orders");
      setOrders(res.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch orders for reports", err);
    } finally {
      setLoading(false);
    }
  };

  // 💡 1. Generate ລາຍຊື່ປີໃຫ້ເລືອກແບບ Dynamic (ຖອຍຫຼັງຈາກປີປັດຈຸບັນໄປ 5 ປີ ຫຼື ຫຼາຍກວ່າ)
  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear(); // 2026
    const startYear = 2020; // ປີເລີ່ມຕົ້ນທີ່ຕ້ອງການໃຫ້ລະບົບຮອງຮັບ
    const years = [];
    for (let y = currentYear; y >= startYear; y--) {
      years.push(y);
    }
    return years;
  }, []);

  // 💡 2. ຄຳນວນຂໍ້ມູນ ແລະ ຈັດກຸ່ມກຣາຟໃຫ້ສວຍງາມ
  const filteredData = useMemo(() => {
    let filteredOrders: ReportOrder[] = [];
    let chartData: ChartDataPoint[] = [];
    const laosMonths = ["ມັງກອນ", "ກຸມພາ", "ມີນາ", "ເມສາ", "ພຶດສະພາ", "ມິຖຸນາ", "ກໍລະກົດ", "ສິງຫາ", "ກັນຍາ", "ຕຸລາ", "ພະຈິກ", "ທັນວາ"];

    if (filter === "month") {
      // --------------------------------------------------
      // ໂໝດລາຍເດືອນ: ເບິ່ງລາຍວັນ ຂອງເດືອນທີ່ເລືອກ
      // --------------------------------------------------
      filteredOrders = orders.filter(o => o.createdAt.startsWith(selectedMonth));

      const [year, month] = selectedMonth.split("-");
      const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();
      
      chartData = Array.from({ length: daysInMonth }, (_, i) => {
        const dayNum = i + 1;
        const dateStr = `${selectedMonth}-${String(dayNum).padStart(2, '0')}`;
        const dayOrders = filteredOrders.filter(o => o.createdAt.startsWith(dateStr));
        return {
          label: `${dayNum}`,
          total: dayOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0)
        };
      });

    } else if (filter === "year") {
      // --------------------------------------------------
      // ໂໝດລາຍປີ: ສະແດງ 12 ເດືອນ ຂອງປີທີ່ເລືອກ (ຮອງຮັບທຸກປີ)
      // --------------------------------------------------
      filteredOrders = orders.filter(o => o.createdAt.startsWith(selectedYear));

      chartData = laosMonths.map((monthName, idx) => {
        const monthPrefix = `${selectedYear}-${String(idx + 1).padStart(2, '0')}`;
        const monthOrders = filteredOrders.filter(o => o.createdAt.startsWith(monthPrefix));
        return {
          label: monthName.substring(0, 3), // ສະແດງຊື່ເດືອນແບບຫຍໍ້
          total: monthOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0)
        };
      });

    } else if (filter === "custom") {
      // --------------------------------------------------
      // ໂໝດກຳນົດເອງ: ເລືອກຊ່ວງວັນທີໃນອະດີດ (ບໍ່ສະແດງກຣາຟ ເນັ້ນສະຫຼຸບຍອດ & ຕາຕະລາງ)
      // --------------------------------------------------
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // ໃຫ້ກວມເອົາຈົນຮອດທ້າຍວັນ

      filteredOrders = orders.filter(o => {
        const orderDate = new Date(o.createdAt);
        return orderDate >= start && orderDate <= end;
      });
      chartData = []; // ໂໝດນີ້ຈະບໍ່ເນັ້ນກຣາຟ ເພື່ອຄວາມສະອາດຂອງໜ້າຈໍ
    }

    const totalSales = filteredOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
    const totalOrders = filteredOrders.length;

    // ຄຳນວນສິນຄ້າທີ່ຂາຍໄດ້ທັງໝົດໃນຊ່ວງເວລານັ້ນ
    const itemMap = new Map<string, { quantity: number; revenue: number }>();
    filteredOrders.forEach(o => {
      o.items?.forEach((item) => {
        const name = item.variant?.product?.name || `ສິນຄ້າ (Variant ID: ${item.variantId})`;
        const current = itemMap.get(name) || { quantity: 0, revenue: 0 };
        itemMap.set(name, {
          quantity: current.quantity + item.quantity,
          revenue: current.revenue + (Number(item.priceAtTime || 0) * item.quantity)
        });
      });
    });

    const soldItemsList = Array.from(itemMap.entries()).map(([name, data]) => ({
      name,
      ...data
    })).sort((a, b) => b.quantity - a.quantity);

    return { totalSales, totalOrders, soldItemsList, chartData };
  }, [orders, filter, selectedMonth, selectedYear, startDate, endDate]);

  if (loading) {
    return <div className="p-8 flex items-center justify-center min-h-screen text-slate-400 font-bold animate-pulse">ກຳລັງໂຫຼດລາຍງານ...</div>;
  }

  return (
    <div className="p-8 flex flex-col gap-8 bg-slate-50 min-h-screen">
      
      {/* 📊 Header Section & Filters */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            ລາຍງານຍອດຂາຍ (Sales Reports)
          </h1>
          <p className="text-sm text-slate-500 mt-1">ກວດສອບສະຖິຕິ, ຍອດຂາຍ ແລະ ປະຫວັດການຂາຍສິນຄ້າໃນລະບົບ</p>
        </div>

        {/* 🔄 ຕົວເລືອກ Filter ທີ່ອັດແໜ້ນໄປດ້ວຍຟັງຊັນ */}
        <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-200">
          
          {/* ປຸ່ມເລືອກໂໝດຫຼັກ */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <Button 
              variant={filter === "month" ? "default" : "ghost"} 
              className={`rounded-lg h-9 text-xs px-3 font-bold ${filter === "month" ? "bg-blue-600 text-white shadow-sm" : "text-slate-600"}`}
              onClick={() => setFilter("month")}
            >
              <CalendarDays className="h-3.5 w-3.5 mr-1" /> ລາຍເດືອນ
            </Button>
            <Button 
              variant={filter === "year" ? "default" : "ghost"} 
              className={`rounded-lg h-9 text-xs px-3 font-bold ${filter === "year" ? "bg-blue-600 text-white shadow-sm" : "text-slate-600"}`}
              onClick={() => setFilter("year")}
            >
              <Calendar className="h-3.5 w-3.5 mr-1" /> ລາຍປີ
            </Button>
            <Button 
              variant={filter === "custom" ? "default" : "ghost"} 
              className={`rounded-lg h-9 text-xs px-3 font-bold ${filter === "custom" ? "bg-blue-600 text-white shadow-sm" : "text-slate-600"}`}
              onClick={() => setFilter("custom")}
            >
              <Search className="h-3.5 w-3.5 mr-1" /> ເລືອກຊ່ວງເວລາເອງ
            </Button>
          </div>

          {/* 📅 ສ່ວນສະແດງ Input ຕາມໂໝດທີ່ເລືອກ */}
          <div className="flex items-center gap-2">
            {filter === "month" && (
              <input 
                type="month" 
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="border border-slate-200 rounded-xl px-3 py-1.5 text-sm font-bold bg-slate-50 text-slate-700 outline-none focus:border-blue-500 transition-all"
              />
            )}

            {filter === "year" && (
              <select 
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="border border-slate-200 rounded-xl px-4 py-1.5 text-sm font-bold bg-slate-50 text-slate-700 outline-none focus:border-blue-500 transition-all"
              >
                {yearOptions.map(y => (
                  <option key={y} value={y}>ປີ {y}</option>
                ))}
              </select>
            )}

            {filter === "custom" && (
              <div className="flex items-center gap-1.5 text-slate-500 font-bold text-xs">
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border border-slate-200 rounded-xl px-2 py-1.5 font-bold bg-slate-50 text-slate-700 outline-none focus:border-blue-500"
                />
                <span>ຫາ</span>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="border border-slate-200 rounded-xl px-2 py-1.5 font-bold bg-slate-50 text-slate-700 outline-none focus:border-blue-500"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 📈 Stats Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl"><DollarSign className="h-8 w-8" /></div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">ຍອດຂາຍລວມທີ່ຄົ້ນຫາ</p>
            <h3 className="text-3xl font-black text-slate-800 mt-1">{filteredData.totalSales.toLocaleString()} ₭</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl"><ShoppingBag className="h-8 w-8" /></div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">ຈຳນວນໃບບິນທັງໝົດ</p>
            <h3 className="text-3xl font-black text-slate-800 mt-1">{filteredData.totalOrders} ບິນ</h3>
          </div>
        </div>
      </div>

      {/* 📊 ກຣາຟສະແດງຜົນ (ຈະຊ່ອນອັດຕະໂນມັດເມື່ອເລືອກ Custom Date Range) */}
      {filter !== "custom" && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-blue-500" />
            ກຣາຟສະແດງຍອດຂາຍ ({filter === "month" ? `ລາຍວັນ ປະຈຳເດືອນ ${selectedMonth}` : `ລາຍເດືອນ ປະຈຳປີ ${selectedYear}`})
          </h2>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredData.chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{fill: '#94a3b8', fontSize: filter === 'month' ? 10 : 12}} />
                
                {/* 💡 ແກ້ໄຂຕົວເລກ 0k ໃຫ້ເປັນ 0 ₭ ທີ່ນີ້ */}
                <YAxis 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 12}} 
                  tickFormatter={(value) => {
                    if (value === 0) return "0 ₭";
                    return value >= 1000000 ? `${(value/1000000).toFixed(1)}M` : `${(value/1000).toFixed(0)}k`;
                  }} 
                />
                
                <Tooltip 
                  cursor={{fill: '#f8fafc'}} 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                  formatter={(value) => [`${Number(value).toLocaleString()} ₭`, "ຍອດຂາຍ"]}
                />
                <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={filter === "month" ? 12 : 45} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 📋 ຕາຕະລາງສະຫຼຸບປະຫວັດສິນຄ້າທີ່ຂາຍໄດ້ */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-emerald-500" />
          ປະຫວັດສິນຄ້າທີ່ຂາຍໄດ້ ({filteredData.soldItemsList.length} ລາຍການ)
        </h2>
        <div className="overflow-hidden rounded-xl border border-slate-100">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-bold text-slate-700">ຊື່ສິນຄ້າ</TableHead>
                <TableHead className="text-center font-bold text-slate-700">ຈຳນວນທີ່ຂາຍໄດ້</TableHead>
                <TableHead className="text-right font-bold text-slate-700">ມູນຄ່າລວມ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.soldItemsList.length > 0 ? (
                filteredData.soldItemsList.map((item, idx) => (
                  <TableRow key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <TableCell className="font-medium text-slate-800">{item.name}</TableCell>
                    <TableCell className="text-center">
                      <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-bold text-xs">
                        {item.quantity.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-black text-emerald-600">
                      {item.revenue.toLocaleString()} ₭
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-12 text-slate-400 font-medium">
                    ບໍ່ມີລາຍການຂາຍໃນຊ່ວງເວລານີ້
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

    </div>
  );
}
