import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import CampaignsPage from "./CampaignsPage.jsx";

const getActiveCampaigns = vi.fn();

vi.mock("../services/campaignService.js", () => ({
  default: {
    getActiveCampaigns: (...args) => getActiveCampaigns(...args),
  },
  formatCampaignValue: (campaign) =>
    campaign.type === "Percentage"
      ? `%${campaign.value}`
      : `${campaign.value.toFixed(2)} TL`,
}));

function renderCampaigns() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <CampaignsPage />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("CampaignsPage", () => {
  beforeEach(() => {
    getActiveCampaigns.mockReset();
  });

  it("kampanyaları başlık ve indirim rozetiyle listeler", async () => {
    getActiveCampaigns.mockResolvedValue([
      {
        id: 1,
        name: "Salı Günü İndirimi",
        type: "Percentage",
        value: 20,
        minCartTotal: 0,
        membersOnly: false,
        isActive: true,
      },
      {
        id: 2,
        name: "Üyelere Özel",
        type: "FixedAmount",
        value: 50,
        minCartTotal: 300,
        membersOnly: true,
        isActive: true,
      },
    ]);

    renderCampaigns();

    expect(
      await screen.findByRole("heading", { name: "Salı Günü İndirimi" })
    ).toBeInTheDocument();
    expect(screen.getByText("%20")).toBeInTheDocument();
    expect(screen.getByText("Tüm sepetlerde geçerli")).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: "Üyelere Özel" })
    ).toBeInTheDocument();
    expect(screen.getByText("50.00 TL")).toBeInTheDocument();
    expect(
      screen.getByText("300.00 TL ve üzeri sepetlerde geçerli")
    ).toBeInTheDocument();
    expect(screen.getByText("Yalnızca üyelere özel")).toBeInTheDocument();
  });

  it("kampanya yokken boş durumu ve filmlere yönlendiren eylemi gösterir", async () => {
    getActiveCampaigns.mockResolvedValue([]);

    renderCampaigns();

    expect(
      await screen.findByText("Şu anda aktif kampanya bulunmuyor.")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Filmlere göz at" })
    ).toHaveAttribute("href", "/movies");
  });

  it("istek başarısız olursa hata panelini gösterir", async () => {
    getActiveCampaigns.mockRejectedValue(new Error("Sunucuya ulaşılamadı"));

    renderCampaigns();

    await waitFor(() => {
      expect(screen.getByText("Kampanyalar alınamadı")).toBeInTheDocument();
    });
    expect(screen.getByText("Sunucuya ulaşılamadı")).toBeInTheDocument();
  });
});
