import { Link } from "react-router-dom";
import { FileText, Loader2, ArrowRight, BookOpen } from "lucide-react";
import { useTemplates } from "@/lib/api";

export default function TemplateListPage() {
  const { data: templates, isLoading } = useTemplates();

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-muted-foreground" /></div>;

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="mb-10">
        <div className="flex items-center gap-2 text-primary mb-2">
          <BookOpen size={16} />
          <span className="text-xs font-semibold uppercase tracking-widest">Dokumen Resmi</span>
        </div>
        <h1 className="font-display text-3xl font-semibold text-foreground">Template Dokumen</h1>
        <p className="mt-1.5 text-sm text-muted-foreground max-w-lg">
          Panduan format dan contoh dokumen surat keputusan yang dapat Anda gunakan sebagai acuan.
        </p>
      </div>

      {templates?.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border py-20">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <FileText size={28} className="text-muted-foreground/60" />
          </div>
          <p className="mt-4 text-sm font-medium text-foreground">Belum ada template</p>
          <p className="mt-1 text-xs text-muted-foreground">Template akan muncul setelah ditambahkan oleh admin.</p>
        </div>
      )}

      {templates && templates.length === 1 && (
        <div>
          {templates.map((t) => (
            <Link key={t.id} to={`/templates/${t.id}`} className="group block">
              <div className="relative overflow-hidden rounded-xl border border-border bg-gradient-to-br from-white to-muted/30 transition-all duration-200 hover:border-primary/30 hover:shadow-md">
                <div className="absolute right-0 top-0 h-40 w-40 translate-x-10 -translate-y-10 rounded-full bg-primary/[0.03]" />
                <div className="relative flex items-center gap-5 p-6 sm:p-8">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                    <FileText size={24} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                      {t.nama_template}
                    </h2>
                    {t.deskripsi && (
                      <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{t.deskripsi}</p>
                    )}
                    <div className="mt-3 flex items-center gap-1 text-sm font-medium text-primary">
                      Lihat Template <ArrowRight size={14} />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {templates && templates.length > 1 && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {(templates ?? []).map((t) => (
            <Link key={t.id} to={`/templates/${t.id}`} className="group">
              <div className="relative overflow-hidden rounded-xl border border-border bg-card transition-all duration-200 hover:border-primary/30 hover:shadow-sm">
                <div className="absolute right-0 top-0 h-24 w-24 translate-x-6 -translate-y-6 rounded-full bg-primary/[0.02]" />
                <div className="relative p-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                    <FileText size={20} />
                  </div>
                  <h3 className="mt-4 text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                    {t.nama_template}
                  </h3>
                  {t.deskripsi && (
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed line-clamp-2">{t.deskripsi}</p>
                  )}
                  <div className="mt-4 flex items-center gap-1 text-xs font-medium text-primary/70 group-hover:text-primary transition-colors">
                    Lihat <ArrowRight size={12} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}