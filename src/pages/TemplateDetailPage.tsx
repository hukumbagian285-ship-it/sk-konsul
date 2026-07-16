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
    <div className="mx-auto max-w-4xl">
      <Link to="/templates" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft size={14} /> Kembali ke daftar template
      </Link>

      <h1 className="mb-1 font-display text-2xl font-semibold text-foreground">{template.nama_template}</h1>
      {template.deskripsi && <p className="mb-6 text-sm text-muted-foreground">{template.deskripsi}</p>}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">Pratinjau Dokumen</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="aspect-[4/3] w-full">
              <iframe
                src={`https://docs.google.com/document/d/${template.drive_file_id}/preview`}
                className="h-full w-full rounded-b-lg border-0"
                title="Pratinjau dokumen"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">Aturan Penulisan</CardTitle>
          </CardHeader>
          <CardContent>
            {template.aturan_penulisan ? (
              <div className="whitespace-pre-wrap text-sm text-foreground">{template.aturan_penulisan}</div>
            ) : (
              <p className="text-sm text-muted-foreground">Belum ada aturan penulisan.</p>
            )}
          </CardContent>
        </Card>
      </div>

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
