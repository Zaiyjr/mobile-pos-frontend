import React, { useState, useEffect } from "react";
import { Plus, Edit3, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter 
} from "@/components/ui/dialog";
import type { Product } from "@/hooks/usePOS";

interface Category {
  id: number;
  name: string;
}

interface Brand {
  id: number;
  name: string;
}

interface ProductDialogsProps {
  openDialog: "add" | "edit" | "delete" | null;
  setOpenDialog: (open: "add" | "edit" | "delete" | null) => void;
  selectedProduct: Product | null;
  categories: Category[];
  brands: Brand[];
  loading: boolean;
  createProduct: (data: {
    name: string;
    description: string;
    categoryId: number;
    brandId: number;
    price: number;
    stock: number;
    imageUrl: string;
  }) => Promise<boolean>;
  updateProduct: (id: number, data: { name: string; description: string; categoryId: number; brandId: number; price: number; stock: number; imageUrl: string }) => Promise<boolean>;
  deleteProduct: (id: number) => Promise<boolean>;
}

export default function ProductDialogs({
  openDialog,
  setOpenDialog,
  selectedProduct,
  categories,
  brands,
  loading,
  createProduct,
  updateProduct,
  deleteProduct,
}: ProductDialogsProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    categoryId: "",
    brandId: "",
    price: "",
    stock: "",
    imageUrl: "",
  });

  // Sync form data with selected product when editing
  useEffect(() => {
    if (openDialog === "edit" && selectedProduct) {
      setFormData({
        name: selectedProduct.name,
        description: selectedProduct.description || "",
        categoryId: selectedProduct.categoryId?.toString() || "",
        brandId: selectedProduct.brandId?.toString() || "",
        price: selectedProduct.price.toString(),
        stock: selectedProduct.stock.toString(),
        imageUrl: selectedProduct.imageUrl || "",
      });
    } else if (openDialog === "add") {
      setFormData({
        name: "",
        description: "",
        categoryId: categories[0]?.id?.toString() || "",
        brandId: brands[0]?.id?.toString() || "",
        price: "",
        stock: "",
        imageUrl: "",
      });
    }
  }, [openDialog, selectedProduct, categories, brands]);

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      categoryId: categories[0]?.id?.toString() || "",
      brandId: brands[0]?.id?.toString() || "",
      price: "",
      stock: "",
      imageUrl: "",
    });
    setOpenDialog(null);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await createProduct({
      name: formData.name,
      description: formData.description,
      categoryId: Number(formData.categoryId),
      brandId: Number(formData.brandId),
      price: Number(formData.price),
      stock: Number(formData.stock),
      imageUrl: formData.imageUrl,
    });
    if (success) {
      resetForm();
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    const success = await updateProduct(selectedProduct.id, {
      name: formData.name,
      description: formData.description,
      categoryId: Number(formData.categoryId),
      brandId: Number(formData.brandId),
      price: Number(formData.price),
      stock: Number(formData.stock),
      imageUrl: formData.imageUrl,
    });
    if (success) {
      resetForm();
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProduct) return;
    const success = await deleteProduct(selectedProduct.id);
    if (success) {
      resetForm();
    }
  };

  return (
    <>
      {/* ==================================================================== */}
      {/* ➕ Shadcn Dialog: ເພີ່ມສິນຄ້າໃໝ່ (Add Product) */}
      {/* ==================================================================== */}
      <Dialog open={openDialog === "add"} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent className="max-w-xl bg-white rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-slate-800 flex items-center gap-2 border-b pb-3">
              <Plus className="text-blue-600 h-5 w-5" /> ເພີ່ມສິນຄ້າໃໝ່ໃນລະບົບ
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleAddSubmit} className="flex flex-col gap-4 py-2 overflow-y-auto max-h-[70vh] pr-1">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase">ຊື່ສິນຄ້າ *</label>
              <Input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="ເຊັ່ນ: iPhone 15 Pro Max" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase">ຄຳອະທິບາຍ</label>
              <textarea 
                className="flex min-h-[70px] w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:border-blue-500" 
                value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="ລາຍລະອຽດ ຫຼື ສີ/ຄວາມຈຸ..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase">ໝວດໝູ່ *</label>
                <select 
                  required value={formData.categoryId} onChange={(e) => setFormData({...formData, categoryId: e.target.value})} 
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
                >
                  <option value="" disabled>--- ເລືອກໝວດໝູ່ ---</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase">ຍີ່ຫໍ້ *</label>
                <select 
                  required value={formData.brandId} onChange={(e) => setFormData({...formData, brandId: e.target.value})} 
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
                >
                  <option value="" disabled>--- ເລືອກຍີ່ຫໍ້ ---</option>
                  {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase">ລາຄາຂາຍ ກີບ *</label>
                <Input type="number" required min="0" step="any" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} placeholder="100000" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase">ຈຳນວນສະຕັອກເລີ່ມຕົ້ນ *</label>
                <Input type="number" required min="0" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} placeholder="10" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase">ລິ້ງຮູບພາບ (Image URL)</label>
              <Input value={formData.imageUrl} onChange={(e) => setFormData({...formData, imageUrl: e.target.value})} placeholder="https://images.unsplash.com/..." />
            </div>

            <DialogFooter className="border-t pt-4 mt-2">
              <Button type="button" variant="outline" onClick={resetForm} className="rounded-xl">ຍົກເລີກ</Button>
              <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold px-6">
                {loading ? "ກຳລັງບັນທຶກ..." : "ເພີ່ມສິນຄ້າ"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ==================================================================== */}
      {/* ✏️ Shadcn Dialog: ແກ້ໄຂສິນຄ້າ (Edit Product) */}
      {/* ==================================================================== */}
      <Dialog open={openDialog === "edit"} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent className="max-w-xl bg-white rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-slate-800 flex items-center gap-2 border-b pb-3">
              <Edit3 className="text-blue-600 h-5 w-5" /> ແກ້ໄຂຂໍ້ມູນສິນຄ້າ
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleEditSubmit} className="flex flex-col gap-4 py-2 overflow-y-auto max-h-[70vh] pr-1">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase">ຊື່ສິນຄ້າ *</label>
              <Input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase">ຄຳອະທິບາຍ</label>
              <textarea 
                className="flex min-h-[70px] w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:border-blue-500" 
                value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase">ໝວດໝູ່ *</label>
                <select 
                  required value={formData.categoryId} onChange={(e) => setFormData({...formData, categoryId: e.target.value})} 
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
                >
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase">ຍີ່ຫໍ້ *</label>
                <select 
                  required value={formData.brandId} onChange={(e) => setFormData({...formData, brandId: e.target.value})} 
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
                >
                  {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase">ລາຄາ (USD) *</label>
                <Input type="number" required min="0" step="any" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase">ຈຳນວນສະຕັອກ *</label>
                <Input type="number" required min="0" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase">ລິ້ງຮູບພາບ (Image URL)</label>
              <Input value={formData.imageUrl} onChange={(e) => setFormData({...formData, imageUrl: e.target.value})} />
            </div>

            <DialogFooter className="border-t pt-4 mt-2">
              <Button type="button" variant="outline" onClick={resetForm} className="rounded-xl">ຍົກເລີກ</Button>
              <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold px-6">
                {loading ? "ກຳລັງບັນທຶກ..." : "ບັນທຶກການແກ້ໄຂ"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ==================================================================== */}
      {/* 🗑️ Shadcn Dialog: ຢືນຢັນການລຶບ (Delete Confirmation) */}
      {/* ==================================================================== */}
      <Dialog open={openDialog === "delete"} onOpenChange={(open) => !open && setOpenDialog(null)}>
        <DialogContent className="max-w-md bg-white rounded-2xl p-6">
          <div className="flex gap-4">
            <div className="p-3 bg-red-50 text-red-600 rounded-2xl shrink-0 h-12 w-12 flex items-center justify-center">
              <Trash2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800">ຢືນຢັນການລຶບສິນຄ້າ?</h3>
              <p className="text-sm text-slate-500 mt-1">
                ເຈົ້າແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບສິນຄ້າ <span className="font-bold text-slate-800">"{selectedProduct?.name}"</span>? 
                ການກະທຳນີ້ຈະປ່ຽນສະຖານະສິນຄ້າເປັນລຶບຖິ້ມ (Soft Delete).
              </p>
            </div>
          </div>
          <DialogFooter className="mt-6 gap-2 border-t pt-4">
            <Button variant="outline" onClick={() => setOpenDialog(null)} className="rounded-xl">ຍົກເລີກ</Button>
            <Button onClick={handleDeleteConfirm} disabled={loading} className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl px-5">
              {loading ? "ກຳລັງລຶບ..." : "ຢືນຢັນການລຶບ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
