import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ToastProvider from "../../context/ToastProvider.jsx";
import { campaignAdmin } from "../../services/campaignService.js";
import AdminCampaignsPage from "./AdminCampaignsPage.jsx";

vi.mock("../../services/campaignService.js", async () => {
  const actual = await vi.importActual("../../services/campaignService.js");

  return {
    ...actual,
    campaignAdmin: {
      list: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
    },
  };
});

const CAMPAIGNS = [
  {
    id: 1,
    name: "Üyelere Özel %10",
    type: "Percentage",
    value: 10,
    minCartTotal: 0,
    membersOnly: true,
    isActive: true,
  },
  {
    id: 2,
    name: "500 TL Üzeri 75 TL",
    type: "FixedAmount",
    value: 75,
    minCartTotal: 500,
    membersOnly: false,
    isActive: false,
  },
];

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ToastProvider>
          <AdminCampaignsPage />
        </ToastProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("AdminCampaignsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    campaignAdmin.list.mockResolvedValue(CAMPAIGNS);
    campaignAdmin.create.mockResolvedValue(3);
    campaignAdmin.remove.mockResolvedValue(null);
  });

  it("aktif ve pasif kampanyaları birlikte listeler", async () => {
    // Müşteri tarafı yalnızca aktifleri görür; yönetim ikisini de görmeli.
    renderPage();

    expect(await screen.findByText("Üyelere Özel %10")).toBeInTheDocument();
    expect(screen.getByText("500 TL Üzeri 75 TL")).toBeInTheDocument();
    expect(screen.getByText("Aktif")).toBeInTheDocument();
    expect(screen.getByText("Pasif")).toBeInTheDocument();
  });

  it("indirimi tipine göre biçimlendirir", async () => {
    renderPage();

    await screen.findByText("Üyelere Özel %10");

    expect(screen.getByText("%10")).toBeInTheDocument();
    expect(screen.getByText("75.00 TL")).toBeInTheDocument();
  });

  it("alt sınırı olmayan kampanyada tire gösterir", async () => {
    renderPage();

    await screen.findByText("Üyelere Özel %10");

    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("tip değişince alan etiketi ve ipucu değişir", async () => {
    renderPage();

    await screen.findByText("Üyelere Özel %10");
    fireEvent.click(screen.getByRole("button", { name: "+ Kampanya Ekle" }));

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByLabelText(/Yüzde/)).toBeInTheDocument();

    fireEvent.change(within(dialog).getByLabelText(/İndirim tipi/), {
      target: { value: "FixedAmount" },
    });

    expect(within(dialog).getByLabelText(/Tutar/)).toBeInTheDocument();
  });

  it("yeni kampanyayı doğru komutla oluşturur", async () => {
    renderPage();

    await screen.findByText("Üyelere Özel %10");
    fireEvent.click(screen.getByRole("button", { name: "+ Kampanya Ekle" }));

    const dialog = await screen.findByRole("dialog");
    fireEvent.change(within(dialog).getByLabelText(/Kampanya adı/), {
      target: { value: "Öğrenci Günü" },
    });
    fireEvent.change(within(dialog).getByLabelText(/Yüzde/), {
      target: { value: "25" },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Kaydet" }));

    await waitFor(() => {
      expect(campaignAdmin.create).toHaveBeenCalledWith({
        name: "Öğrenci Günü",
        type: "Percentage",
        value: "25",
        minCartTotal: "0",
        membersOnly: false,
        isActive: true,
      });
    });
  });

  it("arşivlemeden önce onay ister", async () => {
    renderPage();

    await screen.findByText("Üyelere Özel %10");

    const rows = screen.getAllByRole("row");
    const targetRow = rows.find((row) =>
      within(row).queryByText("Üyelere Özel %10")
    );

    fireEvent.click(within(targetRow).getByRole("button", { name: "Arşivle" }));

    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveTextContent("Geçmiş rezervasyonlardaki indirim değişmez");
    expect(campaignAdmin.remove).not.toHaveBeenCalled();

    fireEvent.click(dialog.querySelector(".admin-btn-delete"));

    await waitFor(() => {
      expect(campaignAdmin.remove).toHaveBeenCalledWith(1);
    });
  });
});
