import * as React from "react";
import { Link } from "react-router-dom";
import { Building2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { STATUS_URUTAN, STATUS_WARNA, type SkSubmission } from "@/lib/types";
import { MOCK_SUBMISSIONS, MOCK_CATEGORIES, MOCK_INSTANSI } from "@/lib/mock-data";
import { formatTanggal } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

function SubmissionCard({ item }: { item: SkSubmission }) {
  return (
    <Link to={`/submissions/${item.id}`}>
      <Card className="mb-3 hover:border-primary/50 hover:shadow-md transition-shadow">
        <CardContent className="p-3">
          <p className="ticket-tag mb-1.5">{item.nomor_tiket}</p>
          <p className="font-display text-sm font-semibold leading-snug text-foreground">
            {item.judul_sk}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Building2 size={12} />
            {item.instansi_nama}
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{formatTanggal(item.updated_at)}</span>
            {item.kategori_nama && (
              <Badge className="border-border bg-muted text-muted-foreground">
                {item.kategori_nama}
              </Badge>
            )}
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

  // Pemohon hanya lihat SK miliknya sendiri (Bagian 4.1 RBAC)
  const visible = React.useMemo(() => {
    return MOCK_SUBMISSIONS.filter((s) => {
      if (user.role === "pemohon" && s.pemohon_id !== user.id) return false;
      if (filterKategori && s.kategori_id !== filterKategori) return false;
      if (filterInstansi && s.instansi_id !== filterInstansi) return false;
      return true;
    });
  }, [user, filterKategori, filterInstansi]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground">Papan Konsultasi SK</h1>
          <p className="text-sm text-muted-foreground">
            {visible.length} pengajuan {user.role === "pemohon" ? "milik Anda" : "aktif dalam sistem"}
          </p>
        </div>
        <div className="flex gap-2">
          <Select
            value={filterKategori}
            onChange={(e) => setFilterKategori(e.target.value)}
            className="w-48"
          >
            <option value="">Semua kategori</option>
            {MOCK_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nama_kategori}
              </option>
            ))}
          </Select>
          <Select
            value={filterInstansi}
            onChange={(e) => setFilterInstansi(e.target.value)}
            className="w-48"
          >
            <option value="">Semua instansi</option>
            {MOCK_INSTANSI.map((i) => (
              <option key={i.id} value={i.id}>
                {i.nama_instansi}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {STATUS_URUTAN.map((status) => {
          const items = visible.filter((s) => s.status === status);
          return (
            <div key={status} className="min-w-0">
              <div
                className={`mb-3 flex items-center justify-between rounded-md border px-3 py-2 ${STATUS_WARNA[status]}`}
              >
                <span className="text-xs font-semibold uppercase tracking-wide">{status}</span>
                <Badge className="border-transparent bg-white/60 text-current">{items.length}</Badge>
              </div>
              <div className="min-h-[120px]">
                {items.length === 0 ? (
                  <p className="rounded-md border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
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
