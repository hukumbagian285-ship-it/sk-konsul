import * as React from "react";
import { Link } from "react-router-dom";
import { Building2, Loader2, FileText, Clock, CheckCircle, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { STATUS_URUTAN, STATUS_WARNA, type SkSubmission } from "@/lib/types";
import { formatTanggal } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useSubmissions, useCategories, useInstansi } from "@/lib/api";

function SubmissionCard({ item }: { item: SkSubmission }) {
  return (
    <Link to={`/submissions/${item.id}`}>
      <Card className="mb-2 transition-shadow hover:border-primary/50 hover:shadow-md">
        <CardContent className="p-3">
          <div className="flex items-start justify-between gap-2">
            <p className="ticket-tag mb-1">{item.nomor_tiket}</p>
            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${STATUS_WARNA[item.status]}`}>
              {item.status}
            </span>
          </div>
          <p className="font-display text-sm font-semibold leading-snug text-foreground">
            {item.judul_sk}
          </p>
          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <Building2 size={12} />
            {(item as any).instansi_nama?.nama_instansi}
            <span className="mx-1">·</span>
            {formatTanggal(item.updated_at)}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function DashboardKanban() {
  const { user } = useAuth();
  const [filterKategori, setFilterKategori] = React.useState("");
  const [filterInstansi, setFilterInstansi] = React.useState("");
  const [search, setSearch] = React.useState("");

  const { data: submissions, isLoading } = useSubmissions(user?.role ?? null, user?.id);
  const { data: categories } = useCategories();
  const { data: instansi } = useInstansi();

  const visible = React.useMemo(() => {
    return (submissions ?? []).filter((s) => {
      if (filterKategori && s.kategori_id !== filterKategori) return false;
      if (filterInstansi && s.instansi_id !== filterInstansi) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!s.judul_sk.toLowerCase().includes(q) && !s.nomor_tiket.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [submissions, filterKategori, filterInstansi, search]);

  const stats = React.useMemo(() => {
    const total = visible.length;
    const counts: Record<string, number> = {};
    STATUS_URUTAN.forEach((s) => { counts[s] = 0; });
    visible.forEach((s) => { counts[s.status] = (counts[s.status] || 0) + 1; });
    return { total, counts };
  }, [visible]);

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div>
      {/* stats row */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileText size={20} />
            </span>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </CardContent>
        </Card>
        {STATUS_URUTAN.slice(0, 3).map((s) => (
          <Card key={s}>
            <CardContent className="flex items-center gap-3 p-4">
              <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${s === "Draft Masuk" ? "bg-slate-100 text-slate-600" : s === "Pemeriksaan Berkas" ? "bg-blue-50 text-blue-600" : "bg-indigo-50 text-indigo-600"}`}>
                <Clock size={20} />
              </span>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.counts[s]}</p>
                <p className="text-xs text-muted-foreground leading-tight">{s}</p>
              </div>
            </CardContent>
          </Card>
        ))}
        {STATUS_URUTAN.slice(3).map((s) => (
          <Card key={s}>
            <CardContent className="flex items-center gap-3 p-4">
              <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${s === "Revisi Pemohon" ? "bg-amber-50 text-warning" : s === "Finalisasi" ? "bg-emerald-50 text-accent" : "bg-emerald-100 text-emerald-700"}`}>
                <CheckCircle size={20} />
              </span>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.counts[s]}</p>
                <p className="text-xs text-muted-foreground leading-tight">{s}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* filters */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari judul atau tiket..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterKategori} onChange={(e) => setFilterKategori(e.target.value)}>
          <option value="">Semua kategori</option>
          {(categories ?? []).map((c) => (
            <option key={c.id} value={c.id}>{c.nama_kategori}</option>
          ))}
        </Select>
        <Select value={filterInstansi} onChange={(e) => setFilterInstansi(e.target.value)}>
          <option value="">Semua instansi</option>
          {(instansi ?? []).map((i) => (
            <option key={i.id} value={i.id}>{i.nama_instansi}</option>
          ))}
        </Select>
      </div>

      {/* kanban */}
      <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory md:grid md:grid-cols-3 lg:grid-cols-6 md:overflow-x-visible md:pb-0">
        {STATUS_URUTAN.map((status) => {
          const items = visible.filter((s) => s.status === status);
          return (
            <div key={status} className="min-w-[280px] flex-shrink-0 snap-start md:min-w-0">
              <div className={`mb-3 flex items-center justify-between rounded-lg border px-3 py-2 ${STATUS_WARNA[status]}`}>
                <span className="text-xs font-semibold uppercase tracking-wide">{status}</span>
                <Badge className="border-transparent bg-white/60 text-current">{items.length}</Badge>
              </div>
              <div className="min-h-[100px]">
                {items.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                    Tidak ada berkas
                  </p>
                ) : (
                  items.map((item) => <SubmissionCard key={item.id} item={item} />)
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
