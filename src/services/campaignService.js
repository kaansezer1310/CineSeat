const MOCK_CAMPAIGNS = [
  {
    id: "CAMP-MEMBER-10",
    name: "Üyelere Özel %10 İndirim",
    discountRate: 0.10,
  }
];

function getCampaignDiscount(subtotal, user) {
  if (!user || user.role === "guest") {
    return { discountAmount: 0, campaignsApplied: [] };
  }

  let discountAmount = 0;
  const campaignsApplied = [];

  let currentSubtotal = subtotal;

  for (const campaign of MOCK_CAMPAIGNS) {
    const amount = currentSubtotal * campaign.discountRate;
    discountAmount += amount;
    currentSubtotal -= amount;
    
    campaignsApplied.push({
      id: campaign.id,
      name: campaign.name,
      amount,
    });
  }

  return { discountAmount, campaignsApplied };
}

const campaignService = {
  getCampaignDiscount,
};

export default campaignService;
