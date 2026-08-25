import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ToastProvider from "../../context/ToastProvider.jsx";
import {
  cityResource,
  districtResource,
} from "../../services/locationService.js";
import AdminCitiesPage from "./AdminCitiesPage.jsx";

vi.mock("../../services/locationService.js", () => ({
  cityResource: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
  districtResource: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}));

const CITIES = [
  { id: 1, name: "İstanbul" },
  { id: 2, name: "Ankara" },
];

const DISTRICTS = [{ id: 10, name: "Kadıköy", cityId: 1 }];

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ToastProvider>
          <AdminCitiesPage />
        </ToastProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("AdminCitiesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cityResource.list.mockResolvedValue(CITIES);
    districtResource.list.mockResolvedValue(DISTRICTS);
    cityResource.create.mockResolvedValue(1);
    cityResource.remove.mockResolvedValue(null);
  });

  it("şehirleri listeler", async () => {
    renderPage();

    expect(await screen.findByText("İstanbul")).toBeInTheDocument();
    expect(screen.getByText("Ankara")).toBeInTheDocument();
  });

  it("şehir seçilmeden ilçe sorgusu atmaz", async () => {
    renderPage();

    await screen.findByText("İstanbul");

    expect(districtResource.list).not.toHaveBeenCalled();
    expect(
      screen.getByText("Soldan bir şehir seçin")
    ).toBeInTheDocument();
  });

  it("şehir seçilince o şehrin ilçelerini getirir", async () => {
    renderPage();

    fireEvent.click(await screen.findByRole("button", { name: "İstanbul" }));

    await waitFor(() => {
      expect(districtResource.list).toHaveBeenCalledWith({ cityId: 1 });
    });

    expect(await screen.findByText("Kadıköy")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "İstanbul ilçeleri" })
    ).toBeInTheDocument();
  });

  it("yeni şehir ekler ve bildirim gösterir", async () => {
    renderPage();

    await screen.findByText("İstanbul");
    fireEvent.click(screen.getByRole("button", { name: "+ Şehir Ekle" }));

    const dialog = await screen.findByRole("dialog");
    fireEvent.change(within(dialog).getByLabelText(/Şehir adı/), {
      target: { value: "İzmir" },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Kaydet" }));

    await waitFor(() => {
      expect(cityResource.create).toHaveBeenCalledWith({ name: "İzmir" });
    });

    // `role="status"` DataTable'ın yükleniyor metninde de var; bildirimi
    // metniyle arıyoruz.
    expect(await screen.findByText("Şehir eklendi.")).toBeInTheDocument();
  });

  it("kaydetme hatasında diyalog açık kalır ve hata gösterilir", async () => {
    // Diyalog kapansaydı kullanıcı doldurduğu alanları kaybederdi.
    cityResource.create.mockRejectedValue(new Error("Bu şehir zaten var."));

    renderPage();

    await screen.findByText("İstanbul");
    fireEvent.click(screen.getByRole("button", { name: "+ Şehir Ekle" }));

    const dialog = await screen.findByRole("dialog");
    fireEvent.change(within(dialog).getByLabelText(/Şehir adı/), {
      target: { value: "İstanbul" },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Kaydet" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Bu şehir zaten var."
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("düzenlemede formu mevcut değerle doldurur", async () => {
    renderPage();

    await screen.findByText("İstanbul");

    const rows = screen.getAllByRole("row");
    const istanbulRow = rows.find((row) =>
      within(row).queryByRole("button", { name: "İstanbul" })
    );

    fireEvent.click(
      within(istanbulRow).getByRole("button", { name: "Düzenle" })
    );

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByLabelText(/Şehir adı/)).toHaveValue(
      "İstanbul"
    );
  });

  it("arşivlemeden önce onay ister", async () => {
    renderPage();

    await screen.findByText("İstanbul");

    const rows = screen.getAllByRole("row");
    const istanbulRow = rows.find((row) =>
      within(row).queryByRole("button", { name: "İstanbul" })
    );

    fireEvent.click(
      within(istanbulRow).getByRole("button", { name: "Arşivle" })
    );

    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveTextContent("Kayıt silinmez");
    expect(cityResource.remove).not.toHaveBeenCalled();

    fireEvent.click(dialog.querySelector(".admin-btn-delete"));

    await waitFor(() => {
      expect(cityResource.remove).toHaveBeenCalledWith(1);
    });
  });
});
