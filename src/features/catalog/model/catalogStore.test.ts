import { afterEach, describe, expect, it, vi } from "vitest";
import { catalogService } from "../application/catalogService";
import { useCatalogStore } from "./catalogStore";

afterEach(() => {
  vi.restoreAllMocks();
  useCatalogStore.setState({ products: [], categories: [], brands: [], loading: false, error: null });
});

describe("catalog store", () => {
  it("exposes load failures without substituting fabricated products", async () => {
    vi.spyOn(catalogService, "listProducts").mockRejectedValue(new Error("API unavailable"));
    await useCatalogStore.getState().fetchProducts();

    expect(useCatalogStore.getState().products).toEqual([]);
    expect(useCatalogStore.getState().error).toBe("API unavailable");
    expect(useCatalogStore.getState().loading).toBe(false);
  });
});
