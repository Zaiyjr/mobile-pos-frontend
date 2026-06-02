import React, { useState, useMemo } from "react";
import { usePOS, type Product } from "@/hooks/usePOS";
import { 
  Plus, Edit3, Trash2, Package, AlertTriangle, 
  BadgeDollarSign, Layers, Info, Search 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import ProductDialogs from "./components/ProductDialogs";

export default function Products() {
  const { 
    products, categories, brands, 
    createProduct, updateProduct, deleteProduct, loading 
  } = usePOS();
  
  // Controlled Dialog State
  const [openDialog, setOpenDialog] = useState<"add" | "edit" | "delete" | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // ເປີດ Modal ເພີ່ມສິນຄ້າ
  const openAddModal = () => {
    setSelectedProduct(null);
    setOpenDialog("add");
  };

  // ເປີດ Modal ແກ້ໄຂສິນຄ້າ
  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    setOpenDialog("edit");
  };

  // ເປີດ Modal ຢືນຢັນການລຶບ
  const openDeleteModal = (product: Product) => {
    setSelectedProduct(product);
    setOpenDialog("delete");
  };

  // ⚡ Optimization: ຄຳນວນສະຖິຕິຫຼັກ
  const metrics = useMemo(() => {
    const totalProducts = products.length;
    const lowStockCount = products.filter(p => p.stock < 5).length;
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
    const totalCategories = categories.length;
    return { totalProducts, lowStockCount, totalValue, totalCategories };
  }, [products, categories]);

  // ຄົ້ນຫາສິນຄ້າ
  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  return (
    <div className="p-8 flex flex-col gap-8 bg-slate-50 min-h-screen">
      
      {/* 📊 Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Package className="h-8 w-8 text-blue-600" />
            ຄັງຈັດການສິນຄ້າ (Product Catalog)
          </h1>
          <p className="text-sm text-slate-500 mt-1">ເພີ່ມ, ແກ້ໄຂ, ແລະ ຈັດການສິນຄ້າຫຼັກພ້ອມສະຕັອກໃນລະບົບ</p>
        </div>
        <Button 
          onClick={openAddModal}
          className="bg-blue-600 hover:bg-blue-700 font-bold gap-2 rounded-xl py-6 px-5 text-sm shadow-md shadow-blue-200"
        >
          <Plus className="h-5 w-5" /> ເພີ່ມສິນຄ້າໃໝ່
        </Button>
      </div>

      {/* 📈 Stats Panels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl"><Package className="h-6 w-6" /></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">ສິນຄ້າທັງໝົດ</p>
            <h3 className="text-2xl font-black text-slate-800 mt-0.5">{metrics.totalProducts} ລາຍການ</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
          <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl"><AlertTriangle className="h-6 w-6" /></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">ໃກ້ໝົດສະຕັອກ (&lt; 5)</p>
            <h3 className="text-2xl font-black text-slate-800 mt-0.5">
              {metrics.lowStockCount > 0 ? (
                <span className="text-red-500 font-black">{metrics.lowStockCount} ລາຍການ</span>
              ) : (
                <span className="text-emerald-600 font-bold">ບໍ່ມີ</span>
              )}
            </h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl"><BadgeDollarSign className="h-6 w-6" /></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">ມູນຄ່າໃນຄັງ</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-0.5">{metrics.totalValue.toLocaleString()} ₭</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
          <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl"><Layers className="h-6 w-6" /></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">ໝວດໝູ່ສິນຄ້າ</p>
            <h3 className="text-2xl font-black text-slate-800 mt-0.5">{metrics.totalCategories} ໝວດໝູ່</h3>
          </div>
        </div>
      </div>

      {/* 🔍 Search Input */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
          <Input 
            type="text" 
            placeholder="ຄົ້ນຫາຊື່ສິນຄ້າ..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 border-slate-200 rounded-xl"
          />
        </div>
        <div className="text-xs text-slate-400 font-bold">ພົບເຫັນ {filteredProducts.length} ລາຍການ</div>
      </div>

      {/* 📋 Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading && products.length === 0 ? (
          <div className="p-12 text-center text-slate-400 animate-pulse font-bold">ກຳລັງໂຫຼດຂໍ້ມູນຄັງສິນຄ້າ...</div>
        ) : (
          <Table>
            <TableHeader className="bg-slate-50/70 border-b">
              <TableRow>
                <TableHead className="font-bold text-slate-700 w-16">ຮູບພາບ</TableHead>
                <TableHead className="font-bold text-slate-700"><b>ຊື່ສິນຄ້າ</b></TableHead>
                <TableHead className="font-bold text-slate-700"><b>ໝວດໝູ່</b></TableHead>
                <TableHead className="font-bold text-slate-700 text-right"><b>ລາຄາ</b></TableHead>
                <TableHead className="font-bold text-slate-700 text-center"><b>ຈຳນວນໃນຄັງ</b></TableHead>
                <TableHead className="font-bold text-slate-700 text-center"><b>ຈັດການ</b></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <TableRow key={product.id} className="hover:bg-slate-50/30 transition-colors">
                    <TableCell>
                      <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl overflow-hidden flex items-center justify-center p-1 shrink-0 shadow-sm">
                        <img 
                          src={product.imageUrl || "https://placehold.co/100x100?text=No+Image"} 
                          alt={product.name} 
                          className="max-w-full max-h-full object-contain rounded-lg transition-transform hover:scale-110"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <h4 className="font-bold text-slate-800">{product.name}</h4>
                        <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{product.description || "ບໍ່ມີຄຳອະທິບາຍ"}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="px-2.5 py-1 text-xs font-bold bg-blue-50 text-blue-600 rounded-full">
                        {typeof product.category === 'object' ? (product.category as any)?.name : product.category || "ທົ່ວໄປ"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-black text-blue-600 text-base">
                      {product.price.toLocaleString()} ₭
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                        product.stock >= 10 ? "bg-emerald-50 text-emerald-600" : product.stock > 0 ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"
                      }`}>
                        {product.stock} ເຄື່ອງ
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-1.5">
                        <Button variant="outline" size="icon" onClick={() => openEditModal(product)} className="h-9 w-9 text-blue-600 rounded-lg"><Edit3 className="h-4 w-4" /></Button>
                        <Button variant="outline" size="icon" onClick={() => openDeleteModal(product)} className="h-9 w-9 text-red-500 rounded-lg"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-slate-400">
                    <div className="flex flex-col items-center gap-2 justify-center">
                      <Info className="h-8 w-8 text-slate-300" /><span>ບໍ່ມີຂໍ້ມູນສິນຄ້າ</span>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* 🚀 Encapsulated Product Modals */}
      <ProductDialogs
        openDialog={openDialog}
        setOpenDialog={setOpenDialog}
        selectedProduct={selectedProduct}
        categories={categories}
        brands={brands}
        loading={loading}
        createProduct={createProduct}
        updateProduct={updateProduct}
        deleteProduct={deleteProduct}
      />

    </div>
  );
}
