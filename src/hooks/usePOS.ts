import { useState, useEffect } from "react";
import API from "@/api/axiosInstance";

export interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  category: string;
  description?: string;
  categoryId?: number;
  brandId?: number;
  imageUrl?: string;
  variantId?: number;
}

export interface CartItem extends Product {
  quantity: number;
  imei?: string;
}

export const usePOS = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [brands, setBrands] = useState<{ id: number; name: string }[]>([]);
  const [receipt, setReceipt] = useState<any | null>(null);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchBrands();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await API.get("/products");
      const rawProducts = res.data.data || [];

      const mapped = rawProducts.map((p: any) => {
        const primaryVariant = p.variants?.[0];
        const primaryImage = p.images?.[0];
        return {
          id: p.id,
          name: p.name,
          description: p.description || "",
          price: primaryVariant ? Number(primaryVariant.price) : 0,
          stock: primaryVariant ? primaryVariant.stockQuantity : 0,
          category: p.category?.name || "ທົ່ວໄປ",
          categoryId: p.categoryId,
          brandId: p.brandId,
          imageUrl: primaryImage?.imageUrl || "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=600",
          variantId: primaryVariant?.id
        };
      });

      setProducts(mapped);
    } catch (err) {
      setProducts([
        { id: 1, name: "iPhone 15 Pro Max", price: 1200, stock: 10, category: "Mobile", categoryId: 1, brandId: 1, description: "Apple flagship phone", imageUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=600", variantId: 101 },
        { id: 2, name: "Samsung S24 Ultra", price: 1100, stock: 8, category: "Mobile", categoryId: 1, brandId: 2, description: "Samsung flagship phone", imageUrl: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=600", variantId: 102 },
        { id: 3, name: "iPad Pro M4", price: 999, stock: 5, category: "Tablet", categoryId: 2, brandId: 1, description: "Latest Apple iPad Pro", imageUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=600", variantId: 103 },
      ]);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await API.get("/categories");
      setCategories(res.data.data || []);
    } catch (err) {
      setCategories([
        { id: 1, name: "Mobile" },
        { id: 2, name: "Tablet" }
      ]);
    }
  };

  const fetchBrands = async () => {
    try {
      const res = await API.get("/brands");
      setBrands(res.data.data || []);
    } catch (err) {
      setBrands([
        { id: 1, name: "Apple" },
        { id: 2, name: "Samsung" }
      ]);
    }
  };

  const createProduct = async (data: {
    name: string;
    description: string;
    categoryId: number;
    brandId: number;
    price: number;
    stock: number;
    imageUrl: string;
  }) => {
    setLoading(true);
    try {
      const payload = {
        name: data.name,
        description: data.description,
        categoryId: Number(data.categoryId),
        brandId: Number(data.brandId),
        images: {
          create: [
            {
              imageUrl: data.imageUrl || "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=600",
              isMain: true
            }
          ]
        },
        variants: {
          create: [
            {
              color: "Standard",
              sku: `SKU-${Date.now()}`,
              price: Number(data.price),
              stockQuantity: Number(data.stock)
            }
          ]
        }
      };
      await API.post("/products", payload);
      await fetchProducts();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async (id: number, data: { name: string; description: string }) => {
    setLoading(true);
    try {
      await API.put(`/products/${id}`, data);
      await fetchProducts();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: number) => {
    setLoading(true);
    try {
      await API.delete(`/products/${id}`);
      await fetchProducts();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const exist = prev.find((item) => item.id === product.id);
      if (exist) {
        return prev.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: number) => setCart((prev) => prev.filter((item) => item.id !== id));

  const updateIMEI = (id: number, imei: string) => {
    setCart((prev) => prev.map((item) => item.id === id ? { ...item, imei } : item));
  };

  const clearCart = () => setCart([]);

  const checkout = async () => {
    if (cart.length === 0) {
      alert("ກະລຸນາເລືອກສິນຄ້າກ່ອນ");
      return;
    }
    setLoading(true);
    try {
      // 1. ຫາ ID ຂອງລູກຄ້າ ຖ້າມີການກອກເບີໂທ
      let customerId: number | undefined;
      if (customerPhone) {
        try {
          const customerRes = await API.get(`/customers/phone/${customerPhone}`);
          if (customerRes.data?.data) {
            customerId = customerRes.data.data.id;
          }
        } catch (err) {
          // ຖ້າບໍ່ມີເບີນີ້, ລົງທະບຽນລູກຄ້າໃໝ່ໃຫ້ເລີຍ!
          try {
            const newCustRes = await API.post("/customers", {
              name: `ລູກຄ້າສະມາຊິກ (${customerPhone})`,
              phone: customerPhone
            });
            customerId = newCustRes.data?.data?.id;
          } catch (e) {
            console.error("ສ້າງລູກຄ້າບໍ່ສຳເລັດ:", e);
          }
        }
      }

      // 2. ວົນ Loop ເພື່ອແປງຂໍ້ມູນ IMEI ໃຫ້ກາຍເປັນ ID ຂອງ StockItem (ຖ້າກອກ)
      const orderItems = [];
      for (const item of cart) {
        let stockItemIds: number[] = [];
        if (item.imei) {
          try {
            const stockCheck = await API.get(`/stocks/check/${item.imei}`);
            if (stockCheck.data?.data) {
              stockItemIds.push(stockCheck.data.data.id);
            }
          } catch (err) {
            console.warn(`ບໍ່ພົບເລກ IMEI: ${item.imei} ໃນຄັງ, ຈະຂາຍເປັນສິນຄ້າທົ່ວໄປ`);
          }
        }

        orderItems.push({
          variantId: item.variantId || item.id, // Fallback to id if variantId is missing
          quantity: item.quantity,
          priceAtTime: item.price,
          stockItemIds: stockItemIds
        });
      }

      // 3. ຍິງ API ປິດບິນ Checkout
      const checkoutPayload = {
        customerId,
        totalAmount: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
        items: orderItems
      };

      const res = await API.post("/orders", checkoutPayload);

      if (res.data?.success) {
        // ເກັບຂໍ້ມູນໃບບິນເພື່ອສະແດງຜົນ Receipt Modal
        setReceipt({
          order: res.data.data,
          items: cart,
          total: checkoutPayload.totalAmount,
          customerPhone: customerPhone || "ລູກຄ້າທົ່ວໄປ"
        });
        clearCart();
        setCustomerPhone("");
        fetchProducts(); // Refresh stocks list
      } else {
        alert("ປິດບິນຂາຍບໍ່ສຳເລັດ");
      }
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "ເກີດຂໍ້ຜິດພາດໃນການປິດບິນຂາຍ");
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return {
    products: filteredProducts,
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
    totalPrice,
    loading,
    categories,
    brands,
    createProduct,
    updateProduct,
    deleteProduct,
    fetchProducts,
    receipt,
    setReceipt
  };
};