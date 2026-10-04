import React, { useState, useEffect, useMemo, useCallback } from "react";
import { catalogService } from "@/features/catalog/application/catalogService";
import type { ProductRecord } from "@/features/catalog/model/catalogTypes";
import { ordersService } from "@/features/orders/application/ordersService";
import type { OrderRecord } from "@/features/orders/api/ordersApi";
import { getApiErrorMessage } from "@/shared/api/client";
import { Package, AlertTriangle, BadgeDollarSign, TrendingUp, ShoppingCart, Clock, BarChart as BarChartIcon } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockCount: 0,
    totalStockValue: 0
  });

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [orders, products] = await Promise.all([
        ordersService.list(),
        catalogService.listProductRecords(),
      ]);

      setOrders(orders);
      
      const lowStockCount = products.filter((product: ProductRecord) => (product.variants?.[0]?.stockQuantity ?? 0) < 5).length;
      const totalStockValue = products.reduce((sum, product) => {
        const variant = product.variants?.[0];
        return sum + Number(variant?.price || 0) * (variant?.stockQuantity || 0);
      }, 0);
      
      setStats({
        totalProducts: products.length,
        lowStockCount,
        totalStockValue
      });

    } catch (cause: unknown) {
      setError(getApiErrorMessage(cause, "Failed to load dashboard data"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // The request is asynchronous and owns its loading/result updates.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchDashboardData();
  }, [fetchDashboardData]);

  // 💡 ຄຳນວນຂໍ້ມູນຍອດຂາຍ ແລະ ກຣາຟລາຍວັນ
  const { salesSummary, ordersCount, chartData } = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    
    // ຍອດຂາຍມື້ນີ້
    const todayOrders = orders.filter(o => o.createdAt.startsWith(todayStr));
    const salesSummary = todayOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
    const ordersCount = todayOrders.length;

    // ກຣາຟຍ້ອນຫຼັງ 7 ວັນ
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    const chartData = last7Days.map(date => {
      const dayOrders = orders.filter(o => o.createdAt.startsWith(date));
      const total = dayOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
      const month = date.slice(5, 7);
      const day = date.slice(8, 10);
      return {
        label: `${day}/${month}`,
        total
      };
    });

    return { salesSummary, ordersCount, chartData };
  }, [orders]);

  if (loading) {
    return <div className="p-8 flex items-center justify-center min-h-screen text-slate-400 font-bold animate-pulse">ກຳລັງໂຫຼດຂໍ້ມູນພາບລວມ...</div>;
  }

  return (
    <div className="p-8 flex flex-col gap-8 bg-slate-50 min-h-screen">
      
      {/* 📊 Header Section */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <TrendingUp className="h-8 w-8 text-blue-600" />
          ພາບລວມລະບົບ (Dashboard)
        </h1>
        <p className="text-sm text-slate-500 mt-1">ສະຫຼຸບຍອດຂາຍ, ສະຖິຕິການສັ່ງຊື້ ແລະ ສະຖານະຄັງສິນຄ້າ</p>
      </div>
      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {/* 📈 Stats Panels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl"><BadgeDollarSign className="h-6 w-6" /></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">ຍອດຂາຍມື້ນີ້</p>
            <h3 className="text-2xl font-black text-slate-800 mt-0.5">{salesSummary.toLocaleString()} ₭</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl"><ShoppingCart className="h-6 w-6" /></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">ຈຳນວນໃບບິນມື້ນີ້</p>
            <h3 className="text-2xl font-black text-slate-800 mt-0.5">{ordersCount} ບິນ</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
          <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl"><Package className="h-6 w-6" /></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">ມູນຄ່າສະຕັອກລວມ</p>
            <h3 className="text-2xl font-black text-slate-800 mt-0.5">{stats.totalStockValue.toLocaleString()} ₭</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
          <div className="p-4 bg-red-50 text-red-500 rounded-2xl"><AlertTriangle className="h-6 w-6" /></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">ສິນຄ້າໃກ້ໝົດ</p>
            <h3 className="text-2xl font-black text-red-500 mt-0.5">{stats.lowStockCount} ລາຍການ</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 📊 Chart Section */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <BarChartIcon className="h-5 w-5 text-blue-500" />
            ຍອດຂາຍ 7 ມື້ຫຼ້າສຸດ
          </h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
                {/* 💡 ປັບປຸງ YAxis Formatter ໃຫ້ສະແດງ 0 ປົກກະຕິ ຖ້າບໍ່ມີຍອດຂາຍ */}
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
                <Bar dataKey="total" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 📋 Recent Orders Section */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-emerald-500" />
            ລາຍການຂາຍຫຼ້າສຸດ
          </h2>
          <div className="flex flex-col gap-4">
            {orders.slice(0, 5).map(order => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-sm text-slate-700">ບິນ #{order.id}</span>
                  <span className="text-xs text-slate-400">
                    {new Date(order.createdAt).toLocaleDateString('lo-LA')} {new Date(order.createdAt).toLocaleTimeString('lo-LA', {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="font-black text-emerald-600 text-sm">+{Number(order.totalAmount).toLocaleString()} ₭</span>
                  <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                    {order.employee?.name || "ພະນັກງານ"}
                  </span>
                </div>
              </div>
            ))}
            {orders.length === 0 && (
              <div className="text-center text-sm text-slate-400 py-4">ຍັງບໍ່ມີລາຍການຂາຍ</div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
