import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";

afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe("ProtectedRoute", () => {
  it("redirects guests to login", () => {
    render(<MemoryRouter initialEntries={["/private"]}><Routes>
      <Route path="/private" element={<ProtectedRoute><p>Private</p></ProtectedRoute>} />
      <Route path="/login" element={<p>Login form</p>} />
    </Routes></MemoryRouter>);

    expect(screen.getByText("Login form")).toBeInTheDocument();
    expect(screen.queryByText("Private")).not.toBeInTheDocument();
  });

  it("redirects a signed-in cashier away from admin routes", () => {
    localStorage.setItem("token", "token");
    localStorage.setItem("user", JSON.stringify({ id: "cashier-1", role: { name: "CASHIER" } }));
    render(<MemoryRouter initialEntries={["/admin"]}><Routes>
      <Route path="/admin" element={<ProtectedRoute allowedRole="ADMIN"><p>Admin</p></ProtectedRoute>} />
      <Route path="/pos" element={<p>POS</p>} />
    </Routes></MemoryRouter>);

    expect(screen.getByText("POS")).toBeInTheDocument();
  });
});
