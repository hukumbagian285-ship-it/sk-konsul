import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Instansi, SkCategory, SkSubmission, SkVersion, SkComment, SkStatusHistory, SkTemplate, StatusSK, Role } from "@/lib/types";

export function useInstansi() {
  return useQuery({
    queryKey: ["instansi"],
    queryFn: async () => {
      const { data } = await supabase.from("instansi").select("*").order("nama_instansi");
      return (data ?? []) as Instansi[];
    },
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase.from("sk_categories").select("*").order("nama_kategori");
      return (data ?? []) as SkCategory[];
    },
  });
}

export function useSubmissions() {
  return useQuery({
    queryKey: ["submissions"],
    queryFn: async () => {
      const { data } = await supabase
        .from("sk_submissions")
        .select("*, instansi_nama:instansi(nama_instansi), kategori_nama:sk_categories(nama_kategori), pemohon_nama:profiles!sk_submissions_pemohon_id_fkey(nama_lengkap)")
        .order("created_at", { ascending: false });
      return (data ?? []) as SkSubmission[];
    },
  });
}

export function useSubmission(id: string | undefined) {
  return useQuery({
    queryKey: ["submission", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("sk_submissions")
        .select("*, instansi_nama:instansi(nama_instansi), kategori_nama:sk_categories(nama_kategori), pemohon_nama:profiles!sk_submissions_pemohon_id_fkey(nama_lengkap)")
        .eq("id", id)
        .single();
      return data as SkSubmission | null;
    },
    enabled: !!id,
  });
}

export function useVersions(submissionId: string | undefined) {
  return useQuery({
    queryKey: ["versions", submissionId],
    queryFn: async () => {
      const { data } = await supabase.from("sk_versions").select("*").eq("submission_id", submissionId).order("versi_ke", { ascending: false });
      return (data ?? []) as SkVersion[];
    },
    enabled: !!submissionId,
  });
}

export function useStatusHistory(submissionId: string | undefined) {
  return useQuery({
    queryKey: ["status_history", submissionId],
    queryFn: async () => {
      const { data } = await supabase.from("sk_status_history").select("*, diubah_oleh_nama:profiles(nama_lengkap)").eq("submission_id", submissionId).order("created_at", { ascending: false });
      return (data ?? []) as SkStatusHistory[];
    },
    enabled: !!submissionId,
  });
}

export function useComments(submissionId: string | undefined) {
  return useQuery({
    queryKey: ["comments", submissionId],
    queryFn: async () => {
      const { data } = await supabase
        .from("sk_comments")
        .select("*, user_nama:profiles(nama_lengkap)")
        .eq("submission_id", submissionId)
        .order("created_at", { ascending: true });
      return (data ?? []) as SkComment[];
    },
    enabled: !!submissionId,
  });
}

export function useTemplates() {
  return useQuery({
    queryKey: ["templates"],
    queryFn: async () => {
      const { data } = await supabase.from("sk_templates").select("*").order("created_at", { ascending: false });
      return (data ?? []) as SkTemplate[];
    },
  });
}

export function useCreateSubmission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { judul_sk: string; deskripsi: string | null; kategori_id: string; pemohon_id: string; instansi_id: string }) => {
      const { data, error } = await supabase.from("sk_submissions").insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["submissions"] });
    },
  });
}

export function useCreateVersion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { submission_id: string; drive_file_id: string; catatan_perubahan: string; diunggah_oleh: string }) => {
      const { data: maxVer } = await supabase.from("sk_versions").select("versi_ke").eq("submission_id", payload.submission_id).order("versi_ke", { ascending: false }).limit(1);
      const versi_ke = (maxVer?.[0]?.versi_ke ?? 0) + 1;
      const { data, error } = await supabase.from("sk_versions").insert({ ...payload, versi_ke }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["versions", data.submission_id] });
      qc.invalidateQueries({ queryKey: ["submission", data.submission_id] });
    },
  });
}

export function useCreateComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      submission_id: string;
      version_id: string;
      user_id: string;
      komentar: string;
      lokasi_pasal: string | null;
      halaman: number | null;
      pos_x?: number | null;
      pos_y?: number | null;
      lebar?: number | null;
      tinggi?: number | null;
      warna?: string | null;
    }) => {
      const { data, error } = await supabase.from("sk_comments").insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["comments", data.submission_id] });
    },
  });
}

export function useUpdateComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: {
      id: string;
      komentar?: string;
      lokasi_pasal?: string | null;
      halaman?: number | null;
      pos_x?: number | null;
      pos_y?: number | null;
      lebar?: number | null;
      tinggi?: number | null;
      warna?: string | null;
    }) => {
      const { data, error } = await supabase.from("sk_comments").update({ ...payload, updated_at: new Date().toISOString() }).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["comments", data.submission_id] });
    },
  });
}

export function useUpdateStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: StatusSK }) => {
      const { data, error } = await supabase.from("sk_submissions").update({ status }).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["submissions"] });
      qc.invalidateQueries({ queryKey: ["submission", data.id] });
      qc.invalidateQueries({ queryKey: ["status_history", data.id] });
    },
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { nama_kategori: string; deskripsi: string | null }) => {
      const { data, error } = await supabase.from("sk_categories").insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { id: string; nama_kategori: string; deskripsi: string | null }) => {
      const { data, error } = await supabase.from("sk_categories").update({ nama_kategori: payload.nama_kategori, deskripsi: payload.deskripsi }).eq("id", payload.id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("sk_categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useCreateInstansi() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { nama_instansi: string; kode_instansi: string }) => {
      const { data, error } = await supabase.from("instansi").insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["instansi"] });
    },
  });
}

export function useUpdateInstansi() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { id: string; nama_instansi: string; kode_instansi: string }) => {
      const { data, error } = await supabase.from("instansi").update({ nama_instansi: payload.nama_instansi, kode_instansi: payload.kode_instansi }).eq("id", payload.id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["instansi"] });
    },
  });
}

export function useDeleteInstansi() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("instansi").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["instansi"] });
    },
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { nama_lengkap: string; role: string; instansi_id: string | null; nip: string | null; password: string }) => {
      const { data, error } = await supabase.rpc("daftar_pengguna", {
        p_nama_lengkap: payload.nama_lengkap,
        p_role: payload.role,
        p_instansi_id: payload.instansi_id,
        p_nip: payload.nip,
        p_password: payload.password,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*, instansi_nama:instansi(nama_instansi)").order("created_at", { ascending: false });
      return data ?? [];
    },
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { id: string; nama_lengkap: string; role: string; instansi_id: string | null; nip: string | null }) => {
      const { data, error } = await supabase.from("profiles").update({
        nama_lengkap: payload.nama_lengkap,
        role: payload.role,
        instansi_id: payload.instansi_id,
        nip: payload.nip,
      }).eq("id", payload.id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("profiles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
    },
  });
}