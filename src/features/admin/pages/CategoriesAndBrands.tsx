import React, { useState } from "react";
import { useCatalogStore } from "@/features/catalog/model/catalogStore";
import { catalogService } from "@/features/catalog/application/catalogService";
import type { EntityId } from "@/features/catalog/model/catalogTypes";
import { getApiErrorMessage } from "@/shared/api/client";
import { Layers, Bookmark, Plus, Edit3, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export default function CategoriesAndBrands() {
  const { categories, brands, error, fetchCategories, fetchBrands } = useCatalogStore();
  
  const localCats = categories;
  const localBrands = brands;

  React.useEffect(() => {
    void fetchCategories();
    void fetchBrands();
  }, [fetchCategories, fetchBrands]);

  const [openCatDialog, setOpenCatDialog] = useState(false);
  const [catForm, setCatForm] = useState<{ id: EntityId | 0; name: string }>({ id: 0, name: "" });

  const handleSaveCategory = async () => {
    if (!catForm.name) return;
    try {
      if (catForm.id === 0) {
        await catalogService.createCategory(catForm.name);
      } else {
        await catalogService.updateCategory(catForm.id, catForm.name);
      }
      await fetchCategories();
      setOpenCatDialog(false);
    } catch (err: unknown) {
      alert("ເກີດຂໍ້ຜິດພາດ: " + getApiErrorMessage(err));
    }
  };

  const handleDeleteCategory = async (id: EntityId) => {
    if (!confirm("ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບໝວດໝູ່ນີ້?")) return;
    try {
      await catalogService.deleteCategory(id);
      await fetchCategories();
    } catch {
      alert("ບໍ່ສາມາດລຶບໄດ້ ເພາະອາດມີສິນຄ້າໃຊ້ໝວດໝູ່ນີ້ຢູ່");
    }
  };

  return (
    <div className="p-8 flex flex-col gap-8 bg-slate-50 min-h-screen">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <Layers className="h-8 w-8 text-blue-600" />
          ຈັດການໝວດໝູ່ & ຍີ່ຫໍ້
        </h1>
        <p className="text-sm text-slate-500 mt-1">ເພີ່ມ, ແກ້ໄຂ ແລະ ລຶບໝວດໝູ່ສິນຄ້າ</p>
      </div>

      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 📂 Category Section */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
          <div className="flex justify-between items-center border-b pb-3">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Layers className="h-5 w-5 text-blue-600" /> ໝວດໝູ່ທັງໝົດ ({localCats.length})
            </h2>
            <Button size="sm" onClick={() => { setCatForm({ id: 0, name: "" }); setOpenCatDialog(true); }} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-1" /> ເພີ່ມໃໝ່
            </Button>
          </div>
          
          <div className="overflow-hidden rounded-xl border border-slate-100">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="w-16">ID</TableHead>
                  <TableHead>ຊື່ໝວດໝູ່</TableHead>
                  <TableHead className="text-right">ຈັດການ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {localCats.length > 0 ? (
                  localCats.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-mono text-slate-400">{c.id}</TableCell>
                      <TableCell className="font-bold text-slate-700">{c.name}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => { setCatForm(c); setOpenCatDialog(true); }} className="h-8 w-8 text-blue-600"><Edit3 className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteCategory(c.id)} className="h-8 w-8 text-red-500"><Trash2 className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-6 text-slate-400">
                      ບໍ່ມີຂໍ້ມູນໝວດໝູ່
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* 🏷️ Brand Section */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4 opacity-75">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 border-b pb-3">
            <Bookmark className="h-5 w-5 text-blue-600" /> ຍີ່ຫໍ້ທັງໝົດ ({localBrands.length})
          </h2>
          <div className="overflow-hidden rounded-xl border border-slate-100">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="w-16">ID</TableHead>
                  <TableHead>ຊື່ຍີ່ຫໍ້</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {localBrands.length > 0 ? (
                  localBrands.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="font-mono text-slate-400">{b.id}</TableCell>
                      <TableCell className="font-bold text-slate-700">{b.name}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center py-6 text-slate-400">
                      ບໍ່ມີຂໍ້ມູນຍີ່ຫໍ້
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <p className="text-xs text-slate-400 italic text-center">* ລະບົບຈັດການຍີ່ຫໍ້ກຳລັງຢູ່ໃນການພັດທະນາ</p>
        </div>
      </div>

      <Dialog open={openCatDialog} onOpenChange={setOpenCatDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{catForm.id === 0 ? "ເພີ່ມໝວດໝູ່ໃໝ່" : "ແກ້ໄຂໝວດໝູ່"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700">ຊື່ໝວດໝູ່</label>
              <Input
                value={catForm.name}
                onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                placeholder="ຕົວຢ່າງ: Smartphone"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenCatDialog(false)}>ຍົກເລີກ</Button>
            <Button onClick={handleSaveCategory} className="bg-blue-600 hover:bg-blue-700">ບັນທຶກ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
