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
  cityResource,
  districtResource,
} from "../../services/locationService.js";

/**
 * Şehir ve ilçe yönetimi tek ekranda: ilçe her zaman bir şehre bağlı olduğu
 * için ikisini ayrı sayfalara bölmek gereksiz gidip gelme yaratırdı. Soldan
 * şehir seçiliyor, sağda o şehrin ilçeleri listeleniyor.
 */
function NameFormDialog({ resource, title, label, extraValues = {}, description }) {
  const [name, setName] = useState("");
  const [previousEditing, setPreviousEditing] = useState(null);

  // Diyalog açıldığında/kayıt değiştiğinde formu doldur. Effect yerine render
  // sırasında karşılaştırma: fazladan bir render turu olmaz.
  if (resource.editing !== previousEditing) {
    setPreviousEditing(resource.editing);
    setName(resource.editing?.name ?? "");
  }

  return (
    <FormDialog
      isOpen={resource.editing !== null}
      title={resource.editing?.id ? `${title} düzenle` : `Yeni ${title.toLowerCase()}`}
      description={description}
      isPending={resource.isSaving}
      error={resource.formError}
      onSubmit={() => resource.save({ name, ...extraValues })}
      onCancel={resource.cancelEdit}
    >
      <FormField label={label} required>
        {(fieldProps) => (
          <input
            {...fieldProps}
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            maxLength={80}
          />
        )}
      </FormField>
    </FormDialog>
  );
}

function archiveActions(resource, item) {
  return (
    <div className="admin-table-actions">
      <button
        type="button"
        className="admin-btn admin-btn-edit"
        onClick={() => resource.startEdit(item)}
      >
        Düzenle
      </button>
      <button
        type="button"
        className="admin-btn admin-btn-delete"
        onClick={() => resource.requestArchive(item)}
      >
        Arşivle
      </button>
    </div>
  );
}

function AdminCitiesPage() {
  const [selectedCityId, setSelectedCityId] = useState(null);

  const cities = useAdminResource({
    resource: cityResource,
    queryKey: ["admin", "cities"],
    labels: { singular: "Şehir", archived: "arşivlendi" },
  });

  const districts = useAdminResource({
    resource: districtResource,
    queryKey: ["admin", "districts", selectedCityId],
    listParams: { cityId: selectedCityId },
    enabled: selectedCityId !== null,
    labels: { singular: "İlçe", archived: "arşivlendi" },
  });

  const selectedCity = cities.items.find((city) => city.id === selectedCityId);

  return (
    <div className="admin-crud-page">
      <PageHeader
        title="Şehir ve İlçeler"
        description="Sinema kayıtları ilçeye bağlıdır; önce şehir ve ilçe tanımlanmalıdır."
        actions={
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            onClick={cities.startCreate}
          >
            + Şehir Ekle
          </button>
        }
      />

      <div className="admin-split">
        <section className="admin-split-pane">
          <h2 className="admin-split-title">Şehirler</h2>

          <QueryState
            isLoading={cities.isLoading}
            error={cities.error}
            loadingText="Şehirler yükleniyor…"
            onRetry={cities.refetch}
          >
            <DataTable
              caption="Şehirler"
              columns={[
                {
                  key: "name",
                  header: "Şehir",
                  sortable: true,
                  render: (city) => (
                    <button
                      type="button"
                      className={
                        city.id === selectedCityId
                          ? "admin-link-button admin-link-button-active"
                          : "admin-link-button"
                      }
                      onClick={() => setSelectedCityId(city.id)}
                      aria-pressed={city.id === selectedCityId}
                    >
                      {city.name}
                    </button>
                  ),
                },
                {
                  key: "actions",
                  header: "İşlemler",
                  render: (city) => archiveActions(cities, city),
                },
              ]}
              rows={cities.items}
              initialSort={{ key: "name", direction: "asc" }}
              emptyState={
                <EmptyState
                  title="Henüz şehir yok"
                  description="İlk şehri ekleyerek başlayın."
                />
              }
            />
          </QueryState>
        </section>

        <section className="admin-split-pane">
          <div className="admin-split-header">
            <h2 className="admin-split-title">
              {selectedCity ? `${selectedCity.name} ilçeleri` : "İlçeler"}
            </h2>

            {selectedCityId !== null && (
              <button
                type="button"
                className="admin-btn admin-btn-primary"
                onClick={districts.startCreate}
              >
                + İlçe Ekle
              </button>
            )}
          </div>

          {selectedCityId === null ? (
            <EmptyState
              title="Soldan bir şehir seçin"
              description="İlçeler seçilen şehre göre listelenir."
            />
          ) : (
            <QueryState
              isLoading={districts.isLoading}
              error={districts.error}
              loadingText="İlçeler yükleniyor…"
              onRetry={districts.refetch}
            >
              <DataTable
                caption="İlçeler"
                columns={[
                  { key: "name", header: "İlçe", sortable: true },
                  {
                    key: "actions",
                    header: "İşlemler",
                    render: (district) => archiveActions(districts, district),
                  },
                ]}
                rows={districts.items}
                initialSort={{ key: "name", direction: "asc" }}
                emptyState={
                  <EmptyState
                    title="Bu şehirde ilçe yok"
                    description="Sinema ekleyebilmek için en az bir ilçe gerekir."
                  />
                }
              />
            </QueryState>
          )}
        </section>
      </div>

      <NameFormDialog resource={cities} title="Şehir" label="Şehir adı" />

      <NameFormDialog
        resource={districts}
        title="İlçe"
        label="İlçe adı"
        extraValues={{ cityId: selectedCityId }}
        description={
          selectedCity ? `${selectedCity.name} şehrine eklenecek.` : undefined
        }
      />

      <ConfirmDialog
        isOpen={cities.pendingArchive !== null}
        title="Şehri arşivle"
        description={
          cities.pendingArchive
            ? `"${cities.pendingArchive.name}" arşivlenecek. Kayıt silinmez.`
            : ""
        }
        confirmLabel="Arşivle"
        variant="danger"
        isPending={cities.isArchiving}
        onConfirm={cities.confirmArchive}
        onCancel={cities.cancelArchive}
      />

      <ConfirmDialog
        isOpen={districts.pendingArchive !== null}
        title="İlçeyi arşivle"
        description={
          districts.pendingArchive
            ? `"${districts.pendingArchive.name}" arşivlenecek. Kayıt silinmez.`
            : ""
        }
        confirmLabel="Arşivle"
        variant="danger"
        isPending={districts.isArchiving}
        onConfirm={districts.confirmArchive}
        onCancel={districts.cancelArchive}
      />
    </div>
  );
}

export default AdminCitiesPage;
