import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import useToast from "./useToast.js";

/**
 * Bir yönetim kaynağının tüm durumunu tek yerde toplar: liste sorgusu,
 * ekleme/güncelleme/arşivleme mutasyonları, form diyaloğu ve onay diyaloğu.
 *
 * Yedi admin ekranı aynı akışı paylaşıyor; bu kanca olmadan her ekranda
 * ~120 satır aynı kod tekrarlanırdı.
 *
 * @param resource      createAdminResource() çıktısı
 * @param queryKey      react-query anahtarı
 * @param listParams    liste sorgusuna geçirilecek parametreler
 * @param enabled       sorgu çalışsın mı (ör. üst seçim yapılmadan çalışmasın)
 * @param labels        { singular, archived } — bildirim metinleri için
 * @param getName       kaydın görünen adı (bildirim ve onay metninde)
 * @param invalidates   bu kaynak değişince tazelenecek diğer query anahtarları
 */
function useAdminResource({
  resource,
  queryKey,
  listParams = {},
  enabled = true,
  labels,
  getName = (item) => item?.name ?? "",
  invalidates = [],
}) {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  // null → kapalı, {} → yeni kayıt, {id,...} → düzenleme
  const [editing, setEditing] = useState(null);
  const [pendingArchive, setPendingArchive] = useState(null);
  const [formError, setFormError] = useState("");

  const query = useQuery({
    queryKey,
    queryFn: () => resource.list(listParams),
    enabled,
    staleTime: 30 * 1000,
  });

  function refresh() {
    queryClient.invalidateQueries({ queryKey });
    invalidates.forEach((key) =>
      queryClient.invalidateQueries({ queryKey: key })
    );
  }

  const saveMutation = useMutation({
    mutationFn: (values) =>
      editing?.id
        ? resource.update(editing.id, values)
        : resource.create(values),
    onSuccess: () => {
      showSuccess(
        editing?.id
          ? `${labels.singular} güncellendi.`
          : `${labels.singular} eklendi.`
      );
      setEditing(null);
      setFormError("");
      refresh();
    },
    onError: (error) => {
      // Hata form diyaloğunun içinde gösterilir: diyalog kapanmaz, kullanıcı
      // doldurduğu alanları kaybetmez.
      setFormError(error.message || "İşlem tamamlanamadı.");
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (item) => resource.remove(item.id),
    onSuccess: (_result, item) => {
      showSuccess(`"${getName(item)}" ${labels.archived}.`);
      setPendingArchive(null);
      refresh();
    },
    onError: (error) => {
      showError(error.message || "İşlem tamamlanamadı.");
      setPendingArchive(null);
    },
  });

  return {
    items: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,

    editing,
    formError,
    startCreate: () => {
      setFormError("");
      setEditing({});
    },
    startEdit: (item) => {
      setFormError("");
      setEditing(item);
    },
    cancelEdit: () => {
      setFormError("");
      setEditing(null);
    },
    save: (values) => saveMutation.mutate(values),
    isSaving: saveMutation.isPending,

    pendingArchive,
    requestArchive: setPendingArchive,
    cancelArchive: () => setPendingArchive(null),
    confirmArchive: () => archiveMutation.mutate(pendingArchive),
    isArchiving: archiveMutation.isPending,
  };
}

export default useAdminResource;
