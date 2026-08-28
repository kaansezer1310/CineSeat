import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import PageHeader from "../../components/ui/PageHeader.jsx";
import DataTable from "../../components/ui/DataTable.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import QueryState from "../../components/ui/QueryState.jsx";
import ConfirmDialog from "../../components/ui/ConfirmDialog.jsx";
import FormDialog from "../../components/ui/FormDialog.jsx";
import FormField from "../../components/ui/FormField.jsx";
import SeatGridEditor from "../../components/admin/SeatGridEditor.jsx";
import useAdminResource from "../../hooks/useAdminResource.js";
import useToast from "../../hooks/useToast.js";
import { cinemaResource } from "../../services/locationService.js";
import {
  hallResource,
  hallTechService,
  technologyResource,
} from "../../services/venueService.js";

/** Salonun teknolojileri: ata / kaldır. Güncelleme yok, eşleme ikili. */
function HallTechnologies({ hallId }) {
  const queryClient = useQueryClient();
  const { showError } = useToast();

  const queryKey = ["admin", "halltechs", hallId];

  const { data: assigned = [] } = useQuery({
    queryKey,
    queryFn: () => hallTechService.listByHall(hallId),
    enabled: Boolean(hallId),
    staleTime: 60 * 1000,
  });

  const { data: technologies = [] } = useQuery({
    queryKey: ["admin", "technologies"],
    queryFn: () => technologyResource.list(),
    staleTime: 5 * 60 * 1000,
  });

  const toggleMutation = useMutation({
    mutationFn: ({ technologyId, existing }) =>
      existing
        ? hallTechService.remove(existing.id)
        : hallTechService.assign(hallId, technologyId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
    onError: (error) => showError(error.message || "İşlem tamamlanamadı."),
  });

  return (
    <div className="hall-tech-panel">
      <h4 className="hall-tech-title">Teknolojiler</h4>

      <div className="hall-tech-chips">
        {technologies.map((technology) => {
          const existing = assigned.find(
            (item) => item.technologyId === technology.id
          );

          return (
            <button
              key={technology.id}
              type="button"
              className={
                existing ? "tech-chip tech-chip-on" : "tech-chip"
              }
              aria-pressed={Boolean(existing)}
              disabled={toggleMutation.isPending}
              onClick={() =>
                toggleMutation.mutate({
                  technologyId: technology.id,
                  existing,
                })
              }
            >
              {technology.name}
            </button>
          );
        })}

        {technologies.length === 0 && (
          <p className="admin-empty-text">
            Tanımlı teknoloji yok. Aşağıdan ekleyebilirsiniz.
          </p>
        )}
      </div>
    </div>
  );
}

function AdminHallsPage() {
  const [selectedCinemaId, setSelectedCinemaId] = useState("");
  const [selectedHall, setSelectedHall] = useState(null);

  const { data: cinemas = [] } = useQuery({
    queryKey: ["admin", "cinemas"],
    queryFn: () => cinemaResource.list(),
    staleTime: 5 * 60 * 1000,
  });

  const halls = useAdminResource({
    resource: hallResource,
    queryKey: ["admin", "halls", selectedCinemaId],
    listParams: { cinemaId: selectedCinemaId },
    enabled: Boolean(selectedCinemaId),
    labels: { singular: "Salon", archived: "arşivlendi" },
  });

  const technologies = useAdminResource({
    resource: technologyResource,
    queryKey: ["admin", "technologies"],
    labels: { singular: "Teknoloji", archived: "arşivlendi" },
  });

  return (
    <div className="admin-crud-page">
      <PageHeader
        title="Salonlar ve Koltuklar"
        description="Seans açabilmek için salonun koltuk planı tanımlı olmalıdır."
        actions={
          selectedCinemaId ? (
            <button
              type="button"
              className="admin-btn admin-btn-primary"
              onClick={halls.startCreate}
            >
              + Salon Ekle
            </button>
          ) : null
        }
      />

      <div className="admin-filter-bar">
        <label htmlFor="hall-cinema-filter">Sinema</label>
        <select
          id="hall-cinema-filter"
          value={selectedCinemaId}
          onChange={(event) => {
            setSelectedCinemaId(event.target.value);
            // Sinema değişince önceki salonun planı ekranda kalmamalı.
            setSelectedHall(null);
          }}
        >
          <option value="">Seçiniz…</option>
          {cinemas.map((cinema) => (
            <option key={cinema.id} value={cinema.id}>
              {cinema.name}
            </option>
          ))}
        </select>
      </div>

      {!selectedCinemaId ? (
        <EmptyState
          title="Önce bir sinema seçin"
          description="Salonlar seçilen sinemaya göre listelenir."
        />
      ) : (
        <QueryState
          isLoading={halls.isLoading}
          error={halls.error}
          loadingText="Salonlar yükleniyor…"
          onRetry={halls.refetch}
        >
          <DataTable
            caption="Salonlar"
            columns={[
              {
                key: "name",
                header: "Salon",
                sortable: true,
                render: (hall) => (
                  <button
                    type="button"
                    className={
                      selectedHall?.id === hall.id
                        ? "admin-link-button admin-link-button-active"
                        : "admin-link-button"
                    }
                    onClick={() =>
                      setSelectedHall(
                        selectedHall?.id === hall.id ? null : hall
                      )
                    }
                    aria-pressed={selectedHall?.id === hall.id}
                  >
                    {hall.name}
                  </button>
                ),
              },
              {
                key: "actions",
                header: "İşlemler",
                render: (hall) => (
                  <div className="admin-table-actions">
                    <button
                      type="button"
                      className="admin-btn admin-btn-edit"
                      onClick={() => halls.startEdit(hall)}
                    >
                      Düzenle
                    </button>
                    <button
                      type="button"
                      className="admin-btn admin-btn-delete"
                      onClick={() => halls.requestArchive(hall)}
                    >
                      Arşivle
                    </button>
                  </div>
                ),
              },
            ]}
            rows={halls.items}
            initialSort={{ key: "name", direction: "asc" }}
            emptyState={
              <EmptyState
                title="Bu sinemada salon yok"
                description="Seans açabilmek için en az bir salon gerekir."
              />
            }
          />
        </QueryState>
      )}

      {selectedHall && (
        <section className="admin-hall-detail">
          <h3 className="admin-split-title">
            {selectedHall.name} — koltuk planı
          </h3>

          <HallTechnologies hallId={selectedHall.id} />

          <SeatGridEditor
            hallId={selectedHall.id}
            hallName={selectedHall.name}
          />
        </section>
      )}

      <section className="admin-hall-detail">
        <div className="admin-split-header">
          <h3 className="admin-split-title">Teknoloji tanımları</h3>

          <button
            type="button"
            className="admin-btn admin-btn-primary"
            onClick={technologies.startCreate}
          >
            + Teknoloji Ekle
          </button>
        </div>

        <QueryState
          isLoading={technologies.isLoading}
          error={technologies.error}
          loadingText="Teknolojiler yükleniyor…"
          onRetry={technologies.refetch}
        >
          <DataTable
            caption="Teknolojiler"
            columns={[
              { key: "name", header: "Teknoloji", sortable: true },
              {
                key: "actions",
                header: "İşlemler",
                render: (technology) => (
                  <div className="admin-table-actions">
                    <button
                      type="button"
                      className="admin-btn admin-btn-edit"
                      onClick={() => technologies.startEdit(technology)}
                    >
                      Düzenle
                    </button>
                    <button
                      type="button"
                      className="admin-btn admin-btn-delete"
                      onClick={() => technologies.requestArchive(technology)}
                    >
                      Arşivle
                    </button>
                  </div>
                ),
              },
            ]}
            rows={technologies.items}
            initialSort={{ key: "name", direction: "asc" }}
            emptyState={
              <EmptyState
                title="Tanımlı teknoloji yok"
                description="IMAX, 3D gibi salon özelliklerini buradan tanımlayın."
              />
            }
          />
        </QueryState>
      </section>

      <HallFormDialog
        resource={halls}
        cinemaId={selectedCinemaId}
        cinemaName={
          cinemas.find((c) => String(c.id) === String(selectedCinemaId))?.name
        }
      />

      <TechnologyFormDialog resource={technologies} />

      <ConfirmDialog
        isOpen={halls.pendingArchive !== null}
        title="Salonu arşivle"
        description={
          halls.pendingArchive
            ? `"${halls.pendingArchive.name}" arşivlenecek. Koltukları ve seansları da erişilemez olur.`
            : ""
        }
        confirmLabel="Arşivle"
        variant="danger"
        isPending={halls.isArchiving}
        onConfirm={halls.confirmArchive}
        onCancel={halls.cancelArchive}
      />

      <ConfirmDialog
        isOpen={technologies.pendingArchive !== null}
        title="Teknolojiyi arşivle"
        description={
          technologies.pendingArchive
            ? `"${technologies.pendingArchive.name}" arşivlenecek.`
            : ""
        }
        confirmLabel="Arşivle"
        variant="danger"
        isPending={technologies.isArchiving}
        onConfirm={technologies.confirmArchive}
        onCancel={technologies.cancelArchive}
      />
    </div>
  );
}

function HallFormDialog({ resource, cinemaId, cinemaName }) {
  const [name, setName] = useState("");
  const [previousEditing, setPreviousEditing] = useState(null);

  if (resource.editing !== previousEditing) {
    setPreviousEditing(resource.editing);
    setName(resource.editing?.name ?? "");
  }

  return (
    <FormDialog
      isOpen={resource.editing !== null}
      title={resource.editing?.id ? "Salonu düzenle" : "Yeni salon"}
      description={cinemaName ? `${cinemaName} sinemasına eklenecek.` : undefined}
      isPending={resource.isSaving}
      error={resource.formError}
      onSubmit={() => resource.save({ name, cinemaId })}
      onCancel={resource.cancelEdit}
    >
      <FormField label="Salon adı" required>
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

function TechnologyFormDialog({ resource }) {
  const [name, setName] = useState("");
  const [previousEditing, setPreviousEditing] = useState(null);

  if (resource.editing !== previousEditing) {
    setPreviousEditing(resource.editing);
    setName(resource.editing?.name ?? "");
  }

  return (
    <FormDialog
      isOpen={resource.editing !== null}
      title={resource.editing?.id ? "Teknolojiyi düzenle" : "Yeni teknoloji"}
      isPending={resource.isSaving}
      error={resource.formError}
      onSubmit={() => resource.save({ name })}
      onCancel={resource.cancelEdit}
    >
      <FormField label="Teknoloji adı" required hint="IMAX, 3D, Dolby Atmos…">
        {(fieldProps) => (
          <input
            {...fieldProps}
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            maxLength={60}
          />
        )}
      </FormField>
    </FormDialog>
  );
}

export default AdminHallsPage;
