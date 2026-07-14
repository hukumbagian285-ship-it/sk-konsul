import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Instansi, SkCategory, SkSubmission, SkVersion, SkComment, SkStatusHistory, StatusSK } from "@/lib/types";

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
      const { data } = await supabase.from("sk_categories").select("*").eq("is_active", true).order("nama_kategori");
      return (data ?? []) as SkCategory[];
    },
  });
}

export function useSubmissions(role: string | null, userId: string | undefined) {
  return useQuery({
    queryKey: ["submissions", role],
    queryFn: async () => {
      let query = supabase
        .from("sk_submissions")
        .select("*, kategori_nama:sk_categories!kategori_id(nama_kategori), instansi_nama:instansi!instansi_id(nama_instansi)")
        .order("created_at", { ascending: false });

      if (role === "pemohon" && userId) {
        query = query.eq("pemohon_id", userId);
      }

      const { data } = await query;
      return (data ?? []) as SkSubmission[];
    },
    enabled: !!role,
  });
}

export function useSubmission(id: string | undefined) {
  return useQuery({
    queryKey: ["submission", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("sk_submissions")
        .select("*, kategori_nama:sk_categories!kategori_id(nama_kategori), instansi_nama:instansi!instansi_id(nama_instansi)")
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
      const { data } = await supabase
        .from("sk_versions")
        .select("*")
        .eq("submission_id", submissionId)
        .order("versi_ke", { ascending: false });
      return (data ?? []) as SkVersion[];
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
        .select("*, user_nama:profiles!user_id(nama_lengkap)")
        .eq("submission_id", submissionId)
        .order("created_at", { ascending: true });
      return (data ?? []) as SkComment[];
    },
    enabled: !!submissionId,
  });
}

export function useStatusHistory(submissionId: string | undefined) {
  return useQuery({
    queryKey: ["status_history", submissionId],
    queryFn: async () => {
      const { data } = await supabase
        .from("sk_status_history")
        .select("*, diubah_oleh_nama:profiles!diubah_oleh(nama_lengkap)")
        .eq("submission_id", submissionId)
        .order("created_at", { ascending: false });
      return (data ?? []) as SkStatusHistory[];
    },
    enabled: !!submissionId,
  });
}

export function useCreateVersion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { submission_id: string; drive_file_id: string; catatan_perubahan: string | null; diunggah_oleh: string }) => {
      const { data, error } = await supabase.from("sk_versions").insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["versions", data.submission_id] });
    },
  });
}

export function useCreateAttachment() {
  return useMutation({
    mutationFn: async (payload: { submission_id: string; nama_file: string; drive_file_id: string; tipe_file: string | null; ukuran_bytes: number | null; diunggah_oleh: string }) => {
      const { data, error } = await supabase.from("sk_attachments").insert(payload).select().single();
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { submission_id: string; version_id: string; user_id: string; komentar: string; lokasi_pasal: string | null }) => {
      const { data, error } = await supabase.from("sk_comments").insert(payload).select().single();
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
