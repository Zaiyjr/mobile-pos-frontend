import React, { useState, useEffect } from "react";
import API from "@/api/axiosInstance";
import { Users, UserCheck, UserX, Search, UserPlus, X, Trash2, ShieldAlert, KeyRound, Edit2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export default function UserManagements() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  // ➕ State ສໍາລັບ Modal ເພີ່ມຜູ້ໃຊ້ໃໝ່
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", phone: "", password: "", role: "USER" });

  // 🛠️ State ສໍາລັບ Modal ສ້າງ Role ໃໝ່
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [availableRoles, setAvailableRoles] = useState<string[]>(["USER", "STAFF", "ADMIN"]);

  // 📝 State ສໍາລັບ Modal ແກ້ໄຂຂໍ້ມູນຜູ້ໃຊ້
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>({ id: "", name: "", email: "", phone: "", role: "" });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await API.get("/users");
      setUsers(res.data?.data || res.data || []);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔄 ຟັງຊັນຊ່ວຍດຶງຊື່ Role ອອກມາໃຫ້ຖືກຕ້ອງ (ແກ້ໄຂບັນຫາບົດບາດສະແດງຜົນຜິດພາດ)
  const getUserRoleName = (user: any) => {
    if (typeof user.role === "object" && user.role !== null) {
      return user.role.name || "USER";
    }
    return user.role || "USER";
  };

  // ➕ ຟັງຊັນສ້າງຜູ້ໃຊ້ໃໝ່
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await API.post("/users", newUser);
      const createdUser = res.data?.data || res.data;
      setUsers(prev => [createdUser, ...prev]);
      setNewUser({ name: "", email: "", phone: "", password: "", role: "USER" });
      setIsModalOpen(false);
    } catch (err) {
      console.error("Failed to create user", err);
      alert("ເກີດຂໍ́ຜິດພາດໃນການເພີ່ມຜູ້ໃຊ້");
    }
  };

  // 📝 ຟັງຊັນເປີດ Modal ແກ້ໄຂ ແລະ ໂຫຼດຂໍ້ມູນເກົ່າໃສ່ Form
  const openEditModal = (user: any) => {
    setEditingUser({
      id: user.id,
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      role: getUserRoleName(user) // ດຶງຄ່າໃຫ້ຖືກຟໍແມັດ
    });
    setIsEditModalOpen(true);
  };

  // 💾 ຟັງຊັນບັນທຶກການແກ້ໄຂຂໍ້ມູນຜູ້ໃຊ້
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await API.put(`/users/${editingUser.id}`, {
        name: editingUser.name,
        email: editingUser.email,
        phone: editingUser.phone,
        role: editingUser.role
      });

      // ອັບເດດຂໍ້ມູນໃນ UI ທັນທີ
      setUsers(prev => prev.map(u => 
        u.id === editingUser.id 
          ? { 
              ...u, 
              name: editingUser.name, 
              email: editingUser.email, 
              phone: editingUser.phone,
              // ຮັກສາໂຄງສ້າງ Role ຂອງ Backend ໄວ້
              role: typeof u.role === "object" ? { ...u.role, name: editingUser.role } : editingUser.role
            } 
          : u
      ));

      setIsEditModalOpen(false);
      alert("ແກ້ໄຂຂໍ້ມູນຜູ້ໃຊ້ສຳເລັດ");
    } catch (err) {
      console.error("Failed to update user", err);
      alert("ບໍ່ສາມາດອັບເດດຂໍ້ມູນໄດ້");
    }
  };

  // 🛠️ ຟັງຊັນສ້າງ Role ໃໝ່
  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;
    const roleUpper = newRoleName.trim().toUpperCase();
    if (availableRoles.includes(roleUpper)) {
      alert("ບົດບາດນີ້ມີຢູ່ໃນລະບົບແລ້ວ!");
      return;
    }
    setAvailableRoles(prev => [...prev, roleUpper]);
    setNewRoleName("");
    setIsRoleModalOpen(false);
    alert(`ສ້າງບົດບາດ ${roleUpper} ສຳເລັດ!`);
  };

  // 🔄 ຟັງຊັນປ່ຽນ Role ຈາກໜ້າຕາຕະລາງໂດຍກົງ
  const handleChangeRole = async (userId: string, newRole: string) => {
    try {
      await API.put(`/users/${userId}/role`, { role: newRole });
      setUsers(prev => prev.map(u => {
        if (u.id === userId) {
          return {
            ...u,
            role: typeof u.role === "object" ? { ...u.role, name: newRole } : newRole
          };
        }
        return u;
      }));
    } catch (err) {
      console.error("Failed to update user role", err);
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await API.put(`/users/${userId}/status`, { isActive: !currentStatus });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isActive: !currentStatus } : u));
    } catch (err) {
      console.error("Failed to update user status", err);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (window.confirm(`ທ່ານແນ່ໃຈແລ້ວບໍທີ່ຈະລົບບັນຊີຂອງ "${userName}" ?`)) {
      try {
        await API.delete(`/users/${userId}`);
        setUsers(prev => prev.filter(u => u.id !== userId));
      } catch (err) {
        console.error("Failed to delete user", err);
      }
    }
  };

  const filteredUsers = users.filter(user => {
    const searchLower = searchQuery.toLowerCase();
    return (
      user.name?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.phone?.includes(searchLower)
    );
  });

  return (
    <div className="p-8 flex flex-col gap-8 bg-slate-50 min-h-screen relative">
      
      {/* 📊 Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Users className="h-8 w-8 text-blue-600" />
            ຈັດການຜູ້ໃຊ້ & ບົດບາດ
          </h1>
          <p className="text-sm text-slate-500 mt-1">ຄວບຄຸມບັນຊີຜູ້ໃຊ້, ຕັ້ງຄ່າສິດທິການເຂົ້າເຖິງ ແລະ ຈັດການບົດບາດໃນລະບົບ</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          <div className="relative w-full sm:w-60">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="ຄົ້ນຫາຊື່, ອີເມວ, ເບີໂທ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm font-medium bg-white outline-none focus:border-blue-500 shadow-sm"
            />
          </div>

          <Button 
            onClick={() => setIsRoleModalOpen(true)}
            variant="outline"
            className="w-full sm:w-auto text-purple-600 border-purple-200 hover:bg-purple-50 font-bold rounded-xl px-4 py-2 flex items-center justify-center gap-2"
          >
            <KeyRound className="h-4 w-4" />
            ສ້າງ Role ໃໝ່
          </Button>
          
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-4 py-2 flex items-center justify-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            <span className="whitespace-nowrap">ເພີ່ມຜູ້ໃຊ້ໃໝ່</span>
          </Button>
        </div>
      </div>

      {/* 📈 Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl"><Users className="h-7 w-7" /></div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">ຜູ້ໃຊ້ທັງໝົດ</p>
            <h3 className="text-2xl font-black text-slate-800 mt-0.5">{users.length} ຄົນ</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
          <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl"><KeyRound className="h-7 w-7" /></div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">ບົດບາດທັງໝົດ (Roles)</p>
            <h3 className="text-2xl font-black text-slate-800 mt-0.5">{availableRoles.length} ບົດບາດ</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
          <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl"><UserX className="h-7 w-7" /></div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">ຖືກລະງັບ (Blocked)</p>
            <h3 className="text-2xl font-black text-slate-800 mt-0.5">{users.filter(u => u.isActive === false).length} ຄົນ</h3>
          </div>
        </div>
      </div>

      {/* 📋 Table Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="overflow-hidden rounded-xl border border-slate-100">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-bold text-slate-700">ຂໍ້ມູນຜູ້ໃຊ້</TableHead>
                <TableHead className="font-bold text-slate-700">ເບີໂທລະສັບ</TableHead>
                <TableHead className="font-bold text-slate-700 text-center">ບົດບາດ (Role)</TableHead>
                <TableHead className="font-bold text-slate-700 text-center">ສະຖານະ</TableHead>
                <TableHead className="font-bold text-slate-700 text-right">ຈັດການຂໍ້ມູນ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-slate-400 animate-pulse font-bold">ກຳລັງໂຫຼດຂໍ້ມູນ...</TableCell>
                </TableRow>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => {
                  const userRole = getUserRoleName(user);
                  return (
                    <TableRow key={user.id} className="hover:bg-slate-50/80 transition-colors">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800">{user.name || "ບໍ່ມີຊື່"}</span>
                          <span className="text-xs text-slate-400 font-medium">{user.email || "No Email"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-slate-600">{user.phone || "-"}</TableCell>
                      
                      {/* 💡 ປ່ຽນຄ່າ value ໃຫ້ໃຊ້ຟັງຊັນກວດສອບ Object ເຮັດໃຫ້ Admin ສະແດງຜົນຖືກຕ້ອງ */}
                      <TableCell className="text-center">
                        <select
                          value={userRole}
                          onChange={(e) => handleChangeRole(user.id, e.target.value)}
                          className={`text-xs font-bold px-2.5 py-1 rounded-xl border outline-none bg-slate-50 cursor-pointer ${
                            userRole === "ADMIN" ? "text-purple-600 border-purple-200 bg-purple-50" : userRole === "STAFF" ? "text-blue-600 border-blue-200 bg-blue-50" : "text-slate-600 border-slate-200"
                          }`}
                        >
                          {availableRoles.map(role => (
                            <option key={role} value={role}>{role}</option>
                          ))}
                        </select>
                      </TableCell>

                      <TableCell className="text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${user.isActive !== false ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-rose-50 text-rose-600 border border-rose-200"}`}>
                          {user.isActive !== false ? "ປົກກະຕິ" : "ຖືກບລັອກ"}
                        </span>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex justify-end items-center gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            className={`h-8 px-2.5 rounded-lg text-xs font-bold ${user.isActive !== false ? "text-rose-600 hover:bg-rose-50 border-rose-200" : "text-emerald-600 hover:bg-emerald-50 border-emerald-200"}`}
                            onClick={() => handleToggleStatus(user.id, user.isActive !== false)}
                          >
                            {user.isActive !== false ? "ບລັອກ" : "ປົດບລັອກ"}
                          </Button>

                          {/* 💡 ປຸ່ມແກ້ໄຂຂໍ້ມູນ (Edit Button) */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                            onClick={() => openEditModal(user)}
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                            onClick={() => handleDeleteUser(user.id, user.name)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-slate-400 font-medium">ບໍ່ພົບຂໍ້ມູນຜູ້ໃຊ້</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* 📑 1. Modal Form Add User (ຄືເກົ່າ) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-black text-slate-800 text-lg flex items-center gap-2"><UserPlus className="h-5 w-5 text-blue-600" /> ເພີ່ມບັນຊີຜູ້ໃຊ້ໃໝ່</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-200"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleCreateUser} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">ຊື່ຜູ້ໃຊ້ *</label>
                <input type="text" required placeholder="ກະລຸນາກອກຊື່ ແລະ ນາມສະກຸນ" value={newUser.name} onChange={(e) => setNewUser({...newUser, name: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50/50 outline-none focus:border-blue-500 focus:bg-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">ອີເມວ *</label>
                <input type="email" required placeholder="example@gmail.com" value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50/50 outline-none focus:border-blue-500 focus:bg-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">ເບີໂທລະສັບ</label>
                <input type="text" placeholder="020 XXXXXXXX" value={newUser.phone} onChange={(e) => setNewUser({...newUser, phone: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50/50 outline-none focus:border-blue-500 focus:bg-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">ລະຫັດຜ່ານ *</label>
                <input type="password" required placeholder="ກຳນົດລະຫັດຜ່ານ 6 ຕົວຂຶ້ນໄປ" value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50/50 outline-none focus:border-blue-500 focus:bg-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">ກຳນົດບົດບາດ (Role) *</label>
                <select value={newUser.role} onChange={(e) => setNewUser({...newUser, role: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-bold bg-slate-50/50 outline-none focus:border-blue-500 cursor-pointer">
                  {availableRoles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-slate-100">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="rounded-xl text-xs font-bold text-slate-500">ຍົກເລີກ</Button>
                <Button type="submit" className="bg-blue-600 text-white font-bold rounded-xl text-xs px-4 py-2">ບັນທຶກຂໍ້ມູນ</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 📝 2. 💡 ເພີ່ມ Modal Form ສັນລະສັບການແກ້ໄຂຂໍ້ມູນ (Edit User Modal) */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                <Edit2 className="h-5 w-5 text-blue-600" /> ແກ້ໄຂຂໍ້ມູນຜູ້ໃຊ້
              </h3>
              <button onClick={() => setIsEditModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-200"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleUpdateUser} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">ຊື່ຜູ້ໃຊ້ງານ *</label>
                <input type="text" required value={editingUser.name} onChange={(e) => setEditingUser({...editingUser, name: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50/50 outline-none focus:border-blue-500 focus:bg-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">ອີເມວ *</label>
                <input type="email" required value={editingUser.email} onChange={(e) => setEditingUser({...editingUser, email: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50/50 outline-none focus:border-blue-500 focus:bg-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">ເບີໂທລະສັບ</label>
                <input type="text" value={editingUser.phone} onChange={(e) => setEditingUser({...editingUser, phone: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50/50 outline-none focus:border-blue-500 focus:bg-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">ບົດບາດ (Role) *</label>
                <select value={editingUser.role} onChange={(e) => setEditingUser({...editingUser, role: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-bold bg-slate-50/50 outline-none focus:border-blue-500 cursor-pointer">
                  {availableRoles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-slate-100">
                <Button type="button" variant="ghost" onClick={() => setIsEditModalOpen(false)} className="rounded-xl text-xs font-bold text-slate-500">ຍົກເລີກ</Button>
                <Button type="submit" className="bg-blue-600 text-white font-bold rounded-xl text-xs px-4 py-2">ບັນທຶກການແກ້ໄຂ</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 📑 3. Modal Form Create Role (ຄືເກົ່າ) */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-black text-slate-800 text-base flex items-center gap-2"><ShieldAlert className="h-5 w-5 text-purple-600" /> ສ້າງບົດບາດ (Role) ໃໝ່</h3>
              <button onClick={() => setIsRoleModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-200"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleCreateRole} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">ຊື່ບົດບາດ (Role Name) *</label>
                <input type="text" required placeholder="ເຊັ່ນ: ACCOUNT, MANAGER" value={newRoleName} onChange={(e) => setNewRoleName(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-bold uppercase bg-slate-50/50 outline-none focus:border-purple-500 focus:bg-white" />
              </div>
              <div className="flex items-center justify-end gap-2 mt-2 pt-4 border-t border-slate-100">
                <Button type="button" variant="ghost" onClick={() => setIsRoleModalOpen(false)} className="rounded-xl text-xs font-bold text-slate-500">ຍົກເລີກ</Button>
                <Button type="submit" className="bg-purple-600 text-white font-bold rounded-xl text-xs px-4 py-2">ຢືນຢັນສ້າງ Role</Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}