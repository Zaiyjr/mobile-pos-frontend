import React, { useState, useMemo } from "react";
import { ShoppingCart, Search, Smartphone, Layers } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import type { Product } from "@/stores/useProductStore";

interface ProductCatalogProps {
  products: Product[];
  search: string;
  setSearch: (s: string) => void;
  addToCart: (p: Product) => void;
}

export default function ProductCatalog({
  products,
  search,
  setSearch,
  addToCart,
}: ProductCatalogProps) {
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  // Memoize categories list
  const categoriesList = useMemo(() => {
    return ["ALL", ...Array.from(new Set(products.map((p) => p.category)))];
  }, [products]);

  // Filter products by selected category and search
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = selectedCategory === "ALL" || p.category === selectedCategory;
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, search]);

  return (
    <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-6">
      
      {/* 📊 Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }} 
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-5 rounded-2xl shadow-sm border border-slate-200/60 gap-4 shrink-0"
      >
      
        
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="ຄົ້ນຫາສິນຄ້າ..."
            className="pl-10 h-11  border-gray-300 rounded-xl focus:border-blue-500 shadow-sm font-semibold text-slate-700"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </motion.div>

      {/* Categories Filter horizontal scroll */}
      <div className="flex gap-2 overflow-x-auto pb-1 shrink-0 scrollbar-thin">
        {categoriesList.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap ${
              selectedCategory === cat 
                ? "bg-blue-600 text-white shadow-md shadow-blue-200" 
                : "bg-white text-slate-500 hover:bg-slate-100 border border-slate-200/60"
            }`}
          >
            {cat === "ALL" ? "ທັງໝົດ" : cat}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product) => (
              <motion.div 
                layout 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.95 }} 
                key={product.id}
                className="h-full"
              >
                <Card 
                  onClick={() => product.stock > 0 && addToCart(product)}
                  className={`group cursor-pointer hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 border border-slate-200/60 rounded-[28px] overflow-hidden h-full flex flex-col justify-between ${
                    product.stock === 0 ? "opacity-60 cursor-not-allowed" : "hover:border-blue-300/60"
                  }`}
                >
                  
                  {/* Premium Canvas-like Image Container (Exactly like Apple Store) */}
                  <div className="h-48 bg-gradient-to-b from-slate-50/80 to-white relative overflow-hidden flex items-center justify-center p-4 shrink-0 border-b border-slate-100">
                    
                    {/* Centered Device Mock with physical drop shadow */}
                    <img 
                      src={product.imageUrl || "https://placehold.co/300x200?text=No+Image"} 
                      alt={product.name} 
                      className="max-h-full max-w-full object-contain rounded-xl drop-shadow-[0_12px_24px_rgba(0,0,0,0.08)] group-hover:scale-110 transition-transform duration-500" 
                    />

                    {/* Glassmorphic Category Badge (Top Left) */}
                    <div className="absolute top-3.5 left-3.5 bg-white/90 backdrop-blur-md text-slate-800 text-[9px] px-2.5 py-1 rounded-full font-black shadow-sm flex items-center gap-1 border border-white/20">
                      <Layers className="h-3 w-3 text-blue-500" />
                      {product.category}
                    </div>

                    {/* Stock Status Badge Overlay (Top Right) */}
                    <div className="absolute top-3.5 right-3.5">
                      <span className={`text-[9px] font-black px-2.5 py-1 rounded-full shadow-sm border ${
                        product.stock === 0 
                          ? "bg-red-500 text-white border-red-500" 
                          : product.stock < 5 
                          ? "bg-amber-500 text-white border-amber-500 animate-pulse" 
                          : "bg-emerald-500 text-white border-emerald-500"
                      }`}>
                        {product.stock === 0 ? "ສິນຄ້າໝົດ" : `ສະຕັອກ: ${product.stock}`}
                      </span>
                    </div>

                  </div>

                  {/* Content Info Section */}
                  <CardContent className="p-5 bg-white flex flex-col justify-between flex-1 gap-3">
                    <div>
                      {/* Sub-label */}
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                        {product.category} DEVICE
                      </span>
                      
                      {/* Premium bold Title */}
                      <h3 className="font-extrabold text-sm text-slate-800 line-clamp-1 mt-1 group-hover:text-blue-600 transition-colors">
                        {product.name}
                      </h3>

                      {/* Brief description */}
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                        {product.description || "ບໍ່ມີຄຳອະທິບາຍສິນຄ້າ"}
                      </p>
                    </div>

                    {/* Dynamic Price Display */}
                    <div className="flex justify-between items-center border-t border-slate-50 pt-3.5 mt-1">
                      <span className="text-blue-600 font-black text-lg tracking-tight">
                        {product.price.toLocaleString()} ₭
                      </span>
                      
                      <div className="h-7 w-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        ＋
                      </div>
                    </div>
                  </CardContent>

                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="flex-1 bg-white rounded-2xl border border-slate-200/60 flex flex-col items-center justify-center p-12 text-slate-400 gap-2 shadow-sm">
          <Smartphone className="h-10 w-10 text-slate-200 animate-bounce" />
          <span className="font-bold text-slate-400 text-sm">ບໍ່ມີຂໍ້ມູນສິນຄ້າໃນໝວດໝູ່ນີ້</span>
        </div>
      )}

    </div>
  );
}
