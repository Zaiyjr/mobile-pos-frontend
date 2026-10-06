import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./features/auth/pages/Login";
import POS from "./features/pos/pages/POS";
import SaleHistory from "./features/pos/pages/SaleHistory";
import Dashboard from "./features/admin/pages/Dashboard";
import Products from "./features/admin/pages/Products";
import CategoriesAndBrands from "./features/admin/pages/CategoriesAndBrands";
import Reports from "./features/admin/pages/Reports";
import { ProtectedRoute } from "@/features/auth/ui/ProtectedRoute";

// Import Layouts ເຂົ້າມາ
import AdminLayout from "./layouts/AdminLayout";
import CashierLayout from "./layouts/CashierLayout";
import UserManagements from "./features/admin/pages/ີ້UserMangement";

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
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
          <Route path="reports" element={<Reports />} />
          <Route path="users" element={<UserManagements />} />

        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
