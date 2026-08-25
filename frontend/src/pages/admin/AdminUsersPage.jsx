import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import PageHeader from "../../components/ui/PageHeader.jsx";
import DataTable from "../../components/ui/DataTable.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import QueryState from "../../components/ui/QueryState.jsx";
import ConfirmDialog from "../../components/ui/ConfirmDialog.jsx";
import useAuth from "../../hooks/useAuth.js";
import useToast from "../../hooks/useToast.js";
import userService from "../../services/userService.js";

const dateFormatter = new Intl.DateTimeFormat("tr-TR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

/**
 * Kullanıcı ve rol yönetimi.
 *
 * Rol değişimi bir yetki yükseltmesi olduğu için onay diyaloğundan geçiyor ve
 * kullanıcının kendi satırında hiç sunulmuyor — backend de reddediyor, ama
 * arayüzde de teklif etmemek daha dürüst.
 */
function AdminUsersPage() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const { showSuccess, showError } = useToast();

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [pendingRoleChange, setPendingRoleChange] = useState(null);

  const { data: roles = [] } = useQuery({
    queryKey: ["admin", "roles"],
    queryFn: userService.listRoles,
    staleTime: 5 * 60 * 1000,
  });

  const queryKey = ["admin", "users", search, roleFilter];

  const { data, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: () => userService.list({ search, roleId: roleFilter }),
    staleTime: 30 * 1000,
  });

  const users = data?.items ?? [];

  const changeRoleMutation = useMutation({
    mutationFn: ({ userId, roleId }) => userService.changeRole(userId, roleId),
    onSuccess: () => {
      showSuccess("Kullanıcının rolü güncellendi.");
      setPendingRoleChange(null);
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (mutationError) => {
      showError(mutationError.message || "Rol değiştirilemedi.");
      setPendingRoleChange(null);
    },
  });

  return (
    <div className="admin-crud-page">
      <PageHeader
        title="Kullanıcılar"
        description="Rol değişimi kullanıcının yetkilerini doğrudan etkiler; değişiklik bir sonraki girişinde geçerli olur."
      />

      <div className="admin-filter-bar">
        <label htmlFor="user-search">Ara</label>
        <input
          id="user-search"
          type="search"
          value={search}
          placeholder="Ad, kullanıcı adı veya e-posta"
          onChange={(event) => setSearch(event.target.value)}
        />

        <label htmlFor="user-role-filter">Rol</label>
        <select
          id="user-role-filter"
          value={roleFilter}
          onChange={(event) => setRoleFilter(event.target.value)}
        >
          <option value="">Tümü</option>
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>
      </div>

      <QueryState
        isLoading={isLoading}
        error={error}
        loadingText="Kullanıcılar yükleniyor…"
        onRetry={refetch}
      >
        <DataTable
          caption="Kullanıcılar"
          columns={[
            { key: "username", header: "Kullanıcı adı", sortable: true },
            { key: "name", header: "Ad Soyad", sortable: true },
            { key: "email", header: "E-posta", sortable: true },
            {
              key: "memberSince",
              header: "Üyelik",
              sortable: true,
              render: (item) =>
                dateFormatter.format(new Date(item.memberSince)),
            },
            {
              key: "reservationCount",
              header: "Rezervasyon",
              align: "right",
              sortable: true,
            },
            {
              key: "roleName",
              header: "Rol",
              sortable: true,
              render: (item) => {
                const isSelf = currentUser?.id === item.id;

                if (isSelf) {
                  return (
                    <span className="status-badge status-badge-on">
                      {item.roleName} (siz)
                    </span>
                  );
                }

                return (
                  <select
                    className="admin-inline-select"
                    value={item.roleId}
                    aria-label={`${item.username} kullanıcısının rolü`}
                    onChange={(event) =>
                      setPendingRoleChange({
                        user: item,
                        roleId: Number(event.target.value),
                        roleName: roles.find(
                          (role) => role.id === Number(event.target.value)
                        )?.name,
                      })
                    }
                  >
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                );
              },
            },
          ]}
          rows={users}
          initialSort={{ key: "username", direction: "asc" }}
          emptyState={
            <EmptyState
              title="Kullanıcı bulunamadı"
              description="Arama ölçütlerini gevşetip tekrar deneyin."
            />
          }
        />
      </QueryState>

      <ConfirmDialog
        isOpen={pendingRoleChange !== null}
        title="Rolü değiştir"
        description={
          pendingRoleChange
            ? `${pendingRoleChange.user.username} kullanıcısının rolü "${pendingRoleChange.user.roleName}" yerine "${pendingRoleChange.roleName}" olacak. Yetkileri buna göre değişir.`
            : ""
        }
        confirmLabel="Rolü Değiştir"
        variant="danger"
        isPending={changeRoleMutation.isPending}
        onConfirm={() =>
          changeRoleMutation.mutate({
            userId: pendingRoleChange.user.id,
            roleId: pendingRoleChange.roleId,
          })
        }
        onCancel={() => setPendingRoleChange(null)}
      />
    </div>
  );
}

export default AdminUsersPage;
