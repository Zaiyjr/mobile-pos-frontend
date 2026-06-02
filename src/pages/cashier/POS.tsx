import React, { useEffect, useMemo, useState } from "react";
import { useProductStore } from "@/stores/useProductStore";
import { usePosStore } from "@/stores/usePosStore";
import ProductCatalog from "./components/ProductCatalog";
import CartSidebar from "./components/CartSidebar";
import ReceiptModal from "./components/ReceiptModal";
import PaymentModal from "./components/PaymentModal";
import { AnimatePresence } from "framer-motion";

export default function POS() {
  const { products, fetchProducts } = useProductStore();
  
  const { 
    cart, 
    search, 
    setSearch, 
    customerPhone, 
    setCustomerPhone, 
    addToCart, 
    removeFromCart, 
    updateIMEI, 
    clearCart, 
    checkout, 
    loading, 
    receipt, 
    setReceipt 
  } = usePosStore();

  const [paymentOpen, setPaymentOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Memoize total price of cart items
  const totalPrice = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  const handleConfirmPayment = async () => {
    await checkout(fetchProducts);
    setPaymentOpen(false);
  };

  return (
    <div className="flex h-screen w-screen bg-slate-50 text-slate-800 font-sans overflow-hidden">
      
      {/* 📱 Left Side: Dynamic Product Catalog component */}
      <ProductCatalog
        products={products}
        search={search}
        setSearch={setSearch}
        addToCart={addToCart}
      />

      {/* 🛒 Right Side: Premium Cart Sidebar component */}
      <CartSidebar
        cart={cart}
        customerPhone={customerPhone}
        setCustomerPhone={setCustomerPhone}
        removeFromCart={removeFromCart}
        updateIMEI={updateIMEI}
        clearCart={clearCart}
        checkout={() => setPaymentOpen(true)}
        loading={loading}
        totalPrice={totalPrice}
        fetchProducts={fetchProducts}
      />

      {/* 💳 BCEL OnePay QR Code Payment Modal */}
      <AnimatePresence>
        {paymentOpen && (
          <PaymentModal
            isOpen={paymentOpen}
            onClose={() => setPaymentOpen(false)}
            totalPrice={totalPrice}
            onConfirm={handleConfirmPayment}
            loading={loading}
          />
        )}
      </AnimatePresence>

      {/* 🧾 Interactive printable receipt overlay modal */}
      <AnimatePresence>
        {receipt && (
          <ReceiptModal
            receipt={receipt}
            setReceipt={setReceipt}
          />
        )}
      </AnimatePresence>

    </div>
  );
}