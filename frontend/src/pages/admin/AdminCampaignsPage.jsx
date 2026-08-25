import { useState } from "react";

import PageHeader from "../../components/ui/PageHeader.jsx";
import DataTable from "../../components/ui/DataTable.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import QueryState from "../../components/ui/QueryState.jsx";
import ConfirmDialog from "../../components/ui/ConfirmDialog.jsx";
import FormDialog from "../../components/ui/FormDialog.jsx";
import FormField from "../../components/ui/FormField.jsx";
import useAdminResource from "../../hooks/useAdminResource.js";
import {
  CAMPAIGN_TYPES,
  campaignAdmin,
  formatCampaignValue,
  getCampaignTypeLabel,
} from "../../services/campaignService.js";

const EMPTY_FORM = {
  name: "",
  type: "Percentage",
  value: "",
  minCartTotal: "0",
  membersOnly: false,
  isActive: true,
};

function AdminCampaignsPage() {
  const campaigns = useAdminResource({
    resource: campaignAdmin,
    queryKey: ["admin", "campaigns"],
    labels: { singular: "Kampanya", archived: "arşivlendi" },
    // Sepet ve ödeme ekranı aktif kampanyaları ayrı anahtarla tutuyor.
    invalidates: [["activeCampaigns"]],
  });

  return (
    <div className="admin-crud-page">
      <PageHeader
        title="Kampanyalar"
        description="İndirim tutarı sunucuda hesaplanır; rezervasyon başına yalnızca bir kampanya uygulanır."
        actions={
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            onClick={campaigns.startCreate}
          >
            + Kampanya Ekle
          </button>
        }
      />

      <QueryState
        isLoading={campaigns.isLoading}
        error={campaigns.error}
        loadingText="Kampanyalar yükleniyor…"
        onRetry={campaigns.refetch}
      >
        <DataTable
          caption="Kampanyalar"
          columns={[
            { key: "name", header: "Kampanya", sortable: true },
            {
              key: "type",
              header: "Tip",
              render: (campaign) => getCampaignTypeLabel(campaign.type),
            },
            {
              key: "value",
              header: "İndirim",
              align: "right",
              sortable: true,
              render: formatCampaignValue,
            },
            {
              key: "minCartTotal",
              header: "Alt sınır",
              align: "right",
              sortable: true,
              render: (campaign) =>
                campaign.minCartTotal > 0
                  ? `${campaign.minCartTotal.toFixed(2)} TL`
                  : "—",
            },
            {
              key: "membersOnly",
              header: "Kimler",
              render: (campaign) =>
                campaign.membersOnly ? "Yalnızca üyeler" : "Herkes",
            },
            {
              key: "isActive",
              header: "Durum",
              render: (campaign) => (
                <span
                  className={
                    campaign.isActive
                      ? "status-badge status-badge-on"
                      : "status-badge"
                  }
                >
                  {campaign.isActive ? "Aktif" : "Pasif"}
                </span>
              ),
            },
            {
              key: "actions",
              header: "İşlemler",
              render: (campaign) => (
                <div className="admin-table-actions">
                  <button
                    type="button"
                    className="admin-btn admin-btn-edit"
                    onClick={() => campaigns.startEdit(campaign)}
                  >
                    Düzenle
                  </button>
                  <button
                    type="button"
                    className="admin-btn admin-btn-delete"
                    onClick={() => campaigns.requestArchive(campaign)}
                  >
                    Arşivle
                  </button>
                </div>
              ),
            },
          ]}
          rows={campaigns.items}
          initialSort={{ key: "name", direction: "asc" }}
          emptyState={
            <EmptyState
              title="Tanımlı kampanya yok"
              description="Yüzde ya da sabit tutarlı indirimleri buradan tanımlayın."
            />
          }
        />
      </QueryState>

      <CampaignFormDialog resource={campaigns} />

      <ConfirmDialog
        isOpen={campaigns.pendingArchive !== null}
        title="Kampanyayı arşivle"
        description={
          campaigns.pendingArchive
            ? `"${campaigns.pendingArchive.name}" arşivlenecek. Geçmiş rezervasyonlardaki indirim değişmez.`
            : ""
        }
        confirmLabel="Arşivle"
        variant="danger"
        isPending={campaigns.isArchiving}
        onConfirm={campaigns.confirmArchive}
        onCancel={campaigns.cancelArchive}
      />
    </div>
  );
}

function CampaignFormDialog({ resource }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [previousEditing, setPreviousEditing] = useState(null);

  if (resource.editing !== previousEditing) {
    setPreviousEditing(resource.editing);

    const editing = resource.editing;
    setForm(
      editing?.id
        ? {
            name: editing.name,
            type: editing.type,
            value: String(editing.value),
            minCartTotal: String(editing.minCartTotal),
            membersOnly: editing.membersOnly,
            isActive: editing.isActive,
          }
        : EMPTY_FORM
    );
  }

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  const isPercentage = form.type === "Percentage";

  return (
    <FormDialog
      isOpen={resource.editing !== null}
      title={resource.editing?.id ? "Kampanyayı düzenle" : "Yeni kampanya"}
      isPending={resource.isSaving}
      error={resource.formError}
      onSubmit={() => resource.save(form)}
      onCancel={resource.cancelEdit}
    >
      <FormField label="Kampanya adı" required>
        {(fieldProps) => (
          <input
            {...fieldProps}
            type="text"
            value={form.name}
            onChange={(event) => update("name", event.target.value)}
            required
            maxLength={120}
          />
        )}
      </FormField>

      <div className="admin-form-row">
        <FormField label="İndirim tipi" required>
          {(fieldProps) => (
            <select
              {...fieldProps}
              value={form.type}
              onChange={(event) => update("type", event.target.value)}
              required
            >
              {CAMPAIGN_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          )}
        </FormField>

        <FormField
          label={isPercentage ? "Yüzde" : "Tutar (TL)"}
          required
          hint={
            isPercentage
              ? "1–100 arası."
              : "İndirim hiçbir zaman ara toplamı aşmaz."
          }
        >
          {(fieldProps) => (
            <input
              {...fieldProps}
              type="number"
              min="1"
              max={isPercentage ? "100" : undefined}
              step={isPercentage ? "1" : "0.01"}
              value={form.value}
              onChange={(event) => update("value", event.target.value)}
              required
            />
          )}
        </FormField>
      </div>

      <FormField
        label="Asgari sepet tutarı (TL)"
        hint="0 yazılırsa alt sınır aranmaz."
      >
        {(fieldProps) => (
          <input
            {...fieldProps}
            type="number"
            min="0"
            step="0.01"
            value={form.minCartTotal}
            onChange={(event) => update("minCartTotal", event.target.value)}
          />
        )}
      </FormField>

      <div className="form-group">
        <label className="admin-checkbox">
          <input
            type="checkbox"
            checked={form.membersOnly}
            onChange={(event) => update("membersOnly", event.target.checked)}
          />
          Yalnızca üyelere uygulansın
        </label>

        <label className="admin-checkbox">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(event) => update("isActive", event.target.checked)}
          />
          Kampanya aktif
        </label>
      </div>
    </FormDialog>
  );
}

export default AdminCampaignsPage;
