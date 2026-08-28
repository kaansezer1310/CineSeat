import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import PageHeader from "../components/ui/PageHeader.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import StatusPanel from "../components/ui/StatusPanel.jsx";
import campaignService, {
  formatCampaignValue,
} from "../services/campaignService.js";

import "./campaigns.css";

/**
 * Faz 4 — /campaigns (spec §7).
 *
 * Header ve Footer bu rotaya bağlanıyordu ama sayfa yoktu; Faz 1 bunu
 * bilinçli olarak sonraki faza bırakmıştı. Sayfa yeni backend ucu
 * gerektirmiyor: landing'in kampanya bölümüyle aynı `/campaigns/active`
 * verisini tüketir (spec §11), yalnızca tamamını listeler.
 */
function CampaignsPage() {
  const {
    data: campaigns = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["campaigns", "active"],
    queryFn: campaignService.getActiveCampaigns,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="campaigns-page">
      <PageHeader
        title="Kampanyalar"
        description="Sepetine uygulanabilecek güncel indirimlerin tamamı."
      />

      {isLoading && (
        <StatusPanel variant="loading" title="Kampanyalar yükleniyor…" />
      )}

      {error && (
        <StatusPanel
          variant="error"
          title="Kampanyalar alınamadı"
          description={error.message}
        />
      )}

      {!isLoading && !error && campaigns.length === 0 && (
        <EmptyState
          icon="🎟️"
          title="Şu anda aktif kampanya bulunmuyor."
          description="Yeni kampanyalar eklendiğinde burada listelenecek."
          action={
            <Link to="/movies" className="btn btn--primary btn--sm">
              Filmlere göz at
            </Link>
          }
        />
      )}

      {campaigns.length > 0 && (
        <ul className="campaigns-list">
          {campaigns.map((campaign) => (
            <li key={campaign.id}>
              <article className="campaigns-card card">
                <div className="campaigns-card-top">
                  <span className="badge badge--accent">
                    {formatCampaignValue(campaign)}
                  </span>

                  {campaign.membersOnly && (
                    <span className="badge badge--neutral">
                      Yalnızca üyelere özel
                    </span>
                  )}
                </div>

                <h2 className="campaigns-card-title">{campaign.name}</h2>

                <p className="campaigns-card-condition">
                  {campaign.minCartTotal > 0
                    ? `${campaign.minCartTotal.toFixed(2)} TL ve üzeri sepetlerde geçerli`
                    : "Tüm sepetlerde geçerli"}
                </p>
              </article>
            </li>
          ))}
        </ul>
      )}

      <p className="campaigns-note">
        Kampanyalar sepetinde otomatik olarak uygulanır; ayrıca bir kod
        girmene gerek yoktur. Bir rezervasyona yalnızca tek kampanya
        uygulanabilir — sana en çok indirimi sağlayan kampanya seçilir.
      </p>
    </div>
  );
}

export default CampaignsPage;
