import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import POS from "./pages/cashier/POS";
import SaleHistory from "./pages/cashier/SaleHistory";
import Dashboard from "./pages/admin/Dashboard";
import Products from "./pages/admin/Products";
import CategoriesAndBrands from "./pages/admin/CategoriesAndBrands";
import Reports from "./pages/admin/Reports";

// Import Layouts ເຂົ້າມາ
import AdminLayout from "./layouts/AdminLayout";
import CashierLayout from "./layouts/CashierLayout";
import UserManagement from "./pages/admin/ີ້UserMangement";
import UserManagements from "./pages/admin/ີ້UserMangement";

const ProtectedRoute = ({ children, allowedRole }: { children: React.ReactNode, allowedRole?: string }) => {
  const token = localStorage.getItem("token");
  const userJson = localStorage.getItem("user");
  
  if (!token || !userJson) return <Navigate to="/auth" replace />;

  const user = JSON.parse(userJson);
  if (allowedRole && user.role?.name !== allowedRole) {
    return <Navigate to={user.role?.name === "ADMIN" ? "/admin" : user.role?.name === "USER" ? "/shop" : "/pos"} replace />;
  }
  return <>{children}</>;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        <Route 
          path="/pos" 
          element={
            <ProtectedRoute>
              <CashierLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<POS />} />
          <Route path="history" element={<ProtectedRoute allowedRole="ADMIN"><SaleHistory /></ProtectedRoute>} />
        </Route>

        <Route 
          path="/admin" 
          element={
            <ProtectedRoute allowedRole="ADMIN">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="categories" element={<CategoriesAndBrands />} />
          <Route path="reports" element={<Reports />} />/
          <Route path="users" element={<UserManagements />} />

        </Route>

        <Route path="*" element={<Navigate to="/shop" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
