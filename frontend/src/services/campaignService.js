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

/**
 * Sepetteki HER KALEM icin ayri ayri kampanya secer ve indirimi hesaplar.
 *
 * NEDEN KALEM BAZINDA: backend sepet diye bir sey bilmiyor; her seans icin
 * ayri bir rezervasyon olusuyor ve kampanya kosullari (ozellikle
 * MinCartTotal) O REZERVASYONUN ara toplamina gore dogrulaniyor.
 *
 * Onceden secim sepetin tamamina gore yapiliyordu. Sonuc: 250 + 250 TL'lik
 * iki seans iceren bir sepette "500 TL uzeri" kampanyasi uygulanabilir
 * gorunuyor, ancak backend her rezervasyonu 250 TL olarak degerlendirip
 * ConflictException firlatiyordu — indirim uygulanmamakla kalmiyor, odeme
 * tumden reddediliyordu.
 *
 * @returns {{ lines: Array<{ item, campaign, subtotal, discount }>, discountTotal: number }}
 */
export function planCampaignsPerItem(campaigns, items, user, calcItemSubtotal) {
  const lines = (items ?? []).map((item) => {
    const subtotal = calcItemSubtotal(item);
    const campaign = pickBestCampaign(campaigns, subtotal, user);

    return {
      item,
      campaign,
      subtotal,
      discount: calculateDiscount(campaign, subtotal),
    };
  });

  return {
    lines,
    discountTotal: lines.reduce((sum, line) => sum + line.discount, 0),
  };
}

// --- Yönetim tarafı -------------------------------------------------------
// Müşteri tarafı yalnızca aktif kampanyaları görür (`/campaigns/active`);
// yönetim pasifleri de görmek zorunda, o yüzden ayrı uç.

export const CAMPAIGN_TYPES = [
  { value: "Percentage", label: "Yüzde indirim", suffix: "%" },
  { value: "FixedAmount", label: "Sabit tutar", suffix: "TL" },
];

export function getCampaignTypeLabel(value) {
  return CAMPAIGN_TYPES.find((type) => type.value === value)?.label ?? value;
}

/** İndirimin okunabilir hâli: "%10" ya da "75,00 TL". */
export function formatCampaignValue(campaign) {
  return campaign.type === "Percentage"
    ? `%${campaign.value}`
    : `${campaign.value.toFixed(2)} TL`;
}

function toCommand(values) {
  return {
    name: values.name.trim(),
    type: values.type,
    value: Number(values.value),
    minCartTotal: Number(values.minCartTotal) || 0,
    membersOnly: Boolean(values.membersOnly),
    isActive: Boolean(values.isActive),
  };
}

export const campaignAdmin = {
  async list() {
    const dtos = await apiClient.get("/campaigns");
    return (dtos?.items ?? dtos ?? []).map(mapCampaignDto);
  },

  async create(values) {
    return apiClient.post("/campaigns", toCommand(values));
  },

  async update(id, values) {
    return apiClient.put(`/campaigns/${id}`, {
      id: Number(id),
      ...toCommand(values),
    });
  },

  async remove(id) {
    return apiClient.del(`/campaigns/${id}`);
  },
};

const campaignService = {
  getActiveCampaigns,
  isCampaignApplicable,
  calculateDiscount,
  pickBestCampaign,
  planCampaignsPerItem,
};

export default campaignService;
