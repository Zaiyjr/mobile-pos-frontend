import { posApi, type CheckoutItem } from "../api/posApi";
import type { CartItem, ReceiptData } from "../model/posTypes";

export async function checkoutSale(cart: CartItem[], customerPhone: string): Promise<ReceiptData> {
  if (cart.length === 0) throw new Error("ກະລຸນາເລືອກສິນຄ້າກ່ອນ");

  let customerId: string | number | undefined;
  if (customerPhone) {
    try {
      customerId = (await posApi.findCustomerByPhone(customerPhone)).id;
    } catch {
      try {
        customerId = (await posApi.createCustomer({
          name: `ລູກຄ້າສະມາຊິກ (${customerPhone})`,
          phone: customerPhone,
        })).id;
      } catch {
        // Preserve the current checkout behavior when customer enrollment is unavailable.
      }
    }
  }

  const items: CheckoutItem[] = await Promise.all(cart.map(async (item) => {
    let stockItemIds: Array<string | number> = [];
    if (item.imei) {
      try {
        const stock = await posApi.findStockBySerial(item.imei);
        stockItemIds = [stock.id];
      } catch {
        // A missing IMEI continues as a regular variant sale, matching the current flow.
      }
    }
    return {
      variantId: item.variantId ?? item.id,
      quantity: item.quantity,
      priceAtTime: item.price,
      stockItemIds,
    };
  }));

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const order = await posApi.checkout({ customerId, totalAmount: total, items });
  return { order: order as ReceiptData["order"], items: [...cart], total, customerPhone: customerPhone || "ລູກຄ້າທົ່ວໄປ" };
}
