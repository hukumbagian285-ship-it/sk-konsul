import { Link } from "react-router-dom";
import { FileText, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useTemplates } from "@/lib/api";

export default function TemplateListPage() {
  const { data: templates, isLoading } = useTemplates();

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-muted-foreground" /></div>;

  return (
    <div className="w-full max-w-5xl">
      <div className="mb-6">
        <h1 className="font-display text-xl font-semibold text-foreground">Template Dokumen</h1>
        <p className="text-sm text-muted-foreground">Panduan format dan contoh dokumen SK</p>
      </div>

      {templates?.length === 0 && (
        <p className="text-center text-sm text-muted-foreground">Belum ada template.</p>
      )}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {(templates ?? []).map((t) => (
          <Link key={t.id} to={`/templates/${t.id}`}>
            <Card className="h-full transition-colors hover:bg-muted/50">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FileText size={20} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{t.nama_template}</p>
                  {t.deskripsi && <p className="truncate text-xs text-muted-foreground">{t.deskripsi}</p>}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
