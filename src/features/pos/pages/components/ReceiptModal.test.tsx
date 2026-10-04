import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import ReceiptModal from "./ReceiptModal";
import type { ReceiptData } from "@/features/pos/model/posTypes";

afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe("ReceiptModal", () => {
  it("shows sale identity, line items, and total", () => {
    const receipt: ReceiptData = {
      order: { id: "sale-1", createdAt: "2026-10-04T09:00:00.000Z" },
      items: [{ name: "iPhone", quantity: 1, price: 1200, imei: "IMEI-1" }],
      total: 1200,
      customerPhone: "02012345678",
    };

    render(<ReceiptModal receipt={receipt} setReceipt={vi.fn()} />);
    expect(screen.getByText("ບິນເລກທີ: #sale-1")).toBeInTheDocument();
    expect(screen.getByText("iPhone x1")).toBeInTheDocument();
    expect(screen.getByText("IMEI: IMEI-1")).toBeInTheDocument();
    expect(screen.getAllByText("1,200 ₭")).toHaveLength(3);
  });
});
