import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Loader2, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTemplate } from "@/lib/api";

export default function TemplateDetailPage() {
  const { id } = useParams();
  const { data: template, isLoading } = useTemplate(id);

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-muted-foreground" /></div>;
  if (!template) return <div className="text-center text-muted-foreground">Template tidak ditemukan.</div>;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Link to="/templates" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft size={14} /> Kembali ke daftar template
      </Link>

      <h1 className="mb-1 font-display text-2xl font-semibold text-foreground">{template.nama_template}</h1>
      {template.deskripsi && <p className="mb-4 text-sm text-muted-foreground">{template.deskripsi}</p>}

      {template.aturan_penulisan && (
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Aturan Penulisan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap text-sm text-foreground">{template.aturan_penulisan}</div>
          </CardContent>
        </Card>
      )}

      <Card className="flex-1">
        <CardContent className="h-full p-0">
          <iframe
            src={`https://docs.google.com/document/d/${template.drive_file_id}/preview`}
            className="h-full w-full rounded-lg border-0"
            title="Pratinjau dokumen"
          />
        </CardContent>
      </Card>

      <a
        href={`https://docs.google.com/document/d/${template.drive_file_id}/edit`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex items-center gap-1 text-sm text-primary hover:underline"
      >
        <ExternalLink size={14} /> Buka di Google Docs
      </a>
    </div>
  );
}
