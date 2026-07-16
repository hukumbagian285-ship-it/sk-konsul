import { Link } from "react-router-dom";
import { FileText, Loader2, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useTemplates } from "@/lib/api";

export default function TemplateListPage() {
  const { data: templates, isLoading } = useTemplates();

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-muted-foreground" /></div>;

  return (
    <div className="w-full max-w-5xl">
      <div className="mb-8 border-b border-border pb-6">
        <h1 className="font-display text-2xl font-semibold text-foreground">Template Dokumen</h1>
        <p className="mt-1 text-sm text-muted-foreground">Panduan format dan contoh dokumen SK</p>
      </div>

      {templates?.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border py-16">
          <FileText size={40} className="text-muted-foreground/40" />
          <p className="mt-3 text-sm text-muted-foreground">Belum ada template tersedia.</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {(templates ?? []).map((t) => (
          <Link key={t.id} to={`/templates/${t.id}`} className="group">
            <Card className="h-full transition-all duration-200 hover:border-primary/30 hover:shadow-sm">
              <CardContent className="flex items-start gap-4 p-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                  <FileText size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{t.nama_template}</p>
                  {t.deskripsi && <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{t.deskripsi}</p>}
                </div>
                <ChevronRight size={16} className="mt-1 shrink-0 text-muted-foreground/30 transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
