import apiClient from "./apiClient.js";

/**
 * Kampanyalar artık backend'den geliyor. İndirimin BAĞLAYICI hesabı da
 * backend'de yapılır (rezervasyon oluşturulurken); buradaki hesap yalnızca
 * sepette ÖN İZLEME içindir — istemciden gelen tutar sunucuya gönderilmez,
 * yalnızca seçilen kampanyanın `id`'si gönderilir.
 */
function mapCampaignDto(dto) {
  return {
    id: dto.id,
    name: dto.name,
    type: dto.type,
    value: Number(dto.value) || 0,
    minCartTotal: Number(dto.minCartTotal) || 0,
    membersOnly: Boolean(dto.membersOnly),
    isActive: Boolean(dto.isActive),
  };
}

async function getActiveCampaigns() {
  const dtos = await apiClient.get("/campaigns/active");
  return (dtos ?? []).map(mapCampaignDto);
}

/** Bir kampanyanın bu sepete uygulanabilir olup olmadığı. */
export function isCampaignApplicable(campaign, subtotal, user) {
  if (!campaign?.isActive) {
    return false;
  }

  if (campaign.membersOnly && (!user || user.role === "guest")) {
    return false;
  }

  return subtotal >= campaign.minCartTotal;
}

/** Backend ile aynı kural: yüzde ya da sabit tutar, ara toplamı aşamaz. */
export function calculateDiscount(campaign, subtotal) {
  if (!campaign) {
    return 0;
  }

  const raw =
    campaign.type === "Percentage"
      ? (subtotal * campaign.value) / 100
      : campaign.value;

  return Math.min(Math.round(raw * 100) / 100, subtotal);
}

/**
 * Sepete en çok indirim sağlayan uygulanabilir kampanya.
 * Backend rezervasyon başına TEK kampanya kabul ediyor (CampaignId), bu
 * yüzden burada da kampanyalar üst üste binmez — en iyisi seçilir.
 */
export function pickBestCampaign(campaigns, subtotal, user) {
  const applicable = (campaigns ?? []).filter((campaign) =>
    isCampaignApplicable(campaign, subtotal, user)
  );

  if (applicable.length === 0) {
    return null;
  }

  return applicable.reduce((best, candidate) =>
    calculateDiscount(candidate, subtotal) >
    calculateDiscount(best, subtotal)
      ? candidate
      : best
  );
}

const campaignService = {
  getActiveCampaigns,
  isCampaignApplicable,
  calculateDiscount,
  pickBestCampaign,
};

export default campaignService;
