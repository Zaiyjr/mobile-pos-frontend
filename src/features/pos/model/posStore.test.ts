import { afterEach, describe, expect, it } from "vitest";
import { usePosStore } from "./posStore";

afterEach(() => usePosStore.setState({ cart: [], search: "", customerPhone: "", loading: false, error: null, receipt: null }));

describe("POS cart state", () => {
  it("increments quantity when the same product is selected again", () => {
    const product = { id: "variant-1", variantId: "variant-1", name: "iPhone", price: 100, stock: 3, category: "Mobile" };
    usePosStore.getState().addToCart(product);
    usePosStore.getState().addToCart(product);

    expect(usePosStore.getState().cart).toHaveLength(1);
    expect(usePosStore.getState().cart[0]?.quantity).toBe(2);
  });

  it("removes the selected product from the cart", () => {
    const product = { id: "variant-1", name: "iPhone", price: 100, stock: 3, category: "Mobile" };
    usePosStore.getState().addToCart(product);
    usePosStore.getState().removeFromCart("variant-1");
    expect(usePosStore.getState().cart).toEqual([]);
  });
});
