import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import PageHeader from "../../components/ui/PageHeader.jsx";
import DataTable from "../../components/ui/DataTable.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import QueryState from "../../components/ui/QueryState.jsx";
import ConfirmDialog from "../../components/ui/ConfirmDialog.jsx";
import FormDialog from "../../components/ui/FormDialog.jsx";
import FormField from "../../components/ui/FormField.jsx";
import useAdminResource from "../../hooks/useAdminResource.js";
import {
  cinemaResource,
  cityResource,
  districtResource,
} from "../../services/locationService.js";

const EMPTY_FORM = {
  name: "",
  address: "",
  latitude: "",
  longitude: "",
  cityId: "",
  districtId: "",
};

function AdminCinemasPage() {
  const cinemas = useAdminResource({
    resource: cinemaResource,
    queryKey: ["admin", "cinemas"],
    labels: { singular: "Sinema", archived: "arşivlendi" },
    // Sinema listesi müşteri tarafında da kullanılıyor.
    invalidates: [["cinemas"]],
  });

  const { data: cities = [] } = useQuery({
    queryKey: ["admin", "cities"],
    queryFn: () => cityResource.list(),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="admin-crud-page">
      <PageHeader
        title="Sinemalar"
        description="Salonlar sinemaya bağlıdır; seans açabilmek için önce sinema ve salon gerekir."
        actions={
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            onClick={cinemas.startCreate}
          >
            + Sinema Ekle
          </button>
        }
      />

      <QueryState
        isLoading={cinemas.isLoading}
        error={cinemas.error}
        loadingText="Sinemalar yükleniyor…"
        onRetry={cinemas.refetch}
      >
        <DataTable
          caption="Sinemalar"
          columns={[
            { key: "name", header: "Sinema", sortable: true },
            { key: "address", header: "Adres" },
            {
              key: "coordinates",
              header: "Konum",
              render: (cinema) =>
                `${cinema.latitude.toFixed(4)}, ${cinema.longitude.toFixed(4)}`,
            },
            {
              key: "actions",
              header: "İşlemler",
              render: (cinema) => (
                <div className="admin-table-actions">
                  <button
                    type="button"
                    className="admin-btn admin-btn-edit"
                    onClick={() => cinemas.startEdit(cinema)}
                  >
                    Düzenle
                  </button>
                  <button
                    type="button"
                    className="admin-btn admin-btn-delete"
                    onClick={() => cinemas.requestArchive(cinema)}
                  >
                    Arşivle
                  </button>
                </div>
              ),
            },
          ]}
          rows={cinemas.items}
          initialSort={{ key: "name", direction: "asc" }}
          emptyState={
            <EmptyState
              title="Henüz sinema yok"
              description="Salon ve seans açabilmek için önce bir sinema ekleyin."
            />
          }
        />
      </QueryState>

      <CinemaFormDialog resource={cinemas} cities={cities} />

      <ConfirmDialog
        isOpen={cinemas.pendingArchive !== null}
        title="Sinemayı arşivle"
        description={
          cinemas.pendingArchive
            ? `"${cinemas.pendingArchive.name}" arşivlenecek. Salonları ve seansları da erişilemez olur.`
            : ""
        }
        confirmLabel="Arşivle"
        variant="danger"
        isPending={cinemas.isArchiving}
        onConfirm={cinemas.confirmArchive}
        onCancel={cinemas.cancelArchive}
      />
    </div>
  );
}

/**
 * Sinema formu. Backend yalnızca `districtId` istiyor ama kullanıcıya
 * doğrudan düz bir ilçe listesi sunmak anlamsız — aynı adlı ilçeler farklı
 * şehirlerde olabilir. Bu yüzden önce şehir, sonra o şehrin ilçesi seçiliyor.
 */
function CinemaFormDialog({ resource, cities }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [previousEditing, setPreviousEditing] = useState(null);

  const { data: districts = [] } = useQuery({
    queryKey: ["admin", "districts", form.cityId],
    queryFn: () => districtResource.list({ cityId: form.cityId }),
    enabled: Boolean(form.cityId),
    staleTime: 60 * 1000,
  });

  if (resource.editing !== previousEditing) {
    setPreviousEditing(resource.editing);

    const editing = resource.editing;
    setForm(
      editing?.id
        ? {
            name: editing.name,
            address: editing.address,
            latitude: String(editing.latitude),
            longitude: String(editing.longitude),
            // Düzenlemede şehir bilinmiyor (DTO yalnızca districtId taşıyor);
            // kullanıcı isterse şehri yeniden seçip ilçeyi değiştirebilir.
            cityId: "",
            districtId: String(editing.districtId),
          }
        : EMPTY_FORM
    );
  }

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <FormDialog
      isOpen={resource.editing !== null}
      title={resource.editing?.id ? "Sinemayı düzenle" : "Yeni sinema"}
      isPending={resource.isSaving}
      error={resource.formError}
      onSubmit={() => resource.save(form)}
      onCancel={resource.cancelEdit}
    >
      <FormField label="Sinema adı" required>
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

      <FormField label="Adres" required>
        {(fieldProps) => (
          <textarea
            {...fieldProps}
            rows="2"
            value={form.address}
            onChange={(event) => update("address", event.target.value)}
            required
            maxLength={250}
          />
        )}
      </FormField>

      <FormField
        label="Şehir"
        hint="İlçe listesini daraltmak için önce şehir seçin."
      >
        {(fieldProps) => (
          <select
            {...fieldProps}
            value={form.cityId}
            onChange={(event) => {
              update("cityId", event.target.value);
              // Şehir değişince eski ilçe geçersiz kalır.
              update("districtId", "");
            }}
          >
            <option value="">Seçiniz…</option>
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>
        )}
      </FormField>

      <FormField label="İlçe" required>
        {(fieldProps) => (
          <select
            {...fieldProps}
            value={form.districtId}
            onChange={(event) => update("districtId", event.target.value)}
            required
            disabled={!form.cityId && !form.districtId}
          >
            <option value="">Seçiniz…</option>
            {districts.map((district) => (
              <option key={district.id} value={district.id}>
                {district.name}
              </option>
            ))}
          </select>
        )}
      </FormField>

      <div className="admin-form-row">
        <FormField label="Enlem" required>
          {(fieldProps) => (
            <input
              {...fieldProps}
              type="number"
              step="0.0001"
              value={form.latitude}
              onChange={(event) => update("latitude", event.target.value)}
              required
            />
          )}
        </FormField>

        <FormField label="Boylam" required>
          {(fieldProps) => (
            <input
              {...fieldProps}
              type="number"
              step="0.0001"
              value={form.longitude}
              onChange={(event) => update("longitude", event.target.value)}
              required
            />
          )}
        </FormField>
      </div>
    </FormDialog>
  );
}

export default AdminCinemasPage;
