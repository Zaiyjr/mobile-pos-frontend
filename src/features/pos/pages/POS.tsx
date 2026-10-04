import React, { useEffect, useMemo, useState } from "react";
import { useCatalogStore } from "@/features/catalog/model/catalogStore";
import { usePosStore } from "@/features/pos/model/posStore";
import ProductCatalog from "./components/ProductCatalog";
import CartSidebar from "./components/CartSidebar";
import ReceiptModal from "./components/ReceiptModal";
import PaymentModal from "./components/PaymentModal";
import { AnimatePresence } from "framer-motion";

export default function POS() {
  const { products, error: catalogError, fetchProducts } = useCatalogStore();
  
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
    error: checkoutError,
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
      {(catalogError || checkoutError) && <div role="alert" className="absolute left-1/2 top-3 z-40 -translate-x-1/2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{catalogError || checkoutError}</div>}
      
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
