import { FileText, Download, ExternalLink } from 'lucide-react';
import { getDirectusUrl } from '@/lib/directus-runtime.mjs';
import type { ProductDocument, DirectusFile } from '@/lib/directus';

interface ProductDocumentsProps {
  documents: ProductDocument[];
  labels?: {
    title?: string;
    download?: string;
    preview?: string;
    noDocuments?: string;
  };
}

function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const docTypeBadgeStyles: Record<string, string> = {
  tds: 'bg-blue-100 text-blue-800',
  msds: 'bg-orange-100 text-orange-800',
  certificate: 'bg-green-100 text-green-800',
  brochure: 'bg-purple-100 text-purple-800',
};

const docTypeLabels: Record<string, string> = {
  tds: 'TDS',
  msds: 'MSDS',
  certificate: 'Certificate',
  brochure: 'Brochure',
};

export default function ProductDocuments({ documents, labels }: ProductDocumentsProps) {
  const directusUrl = getDirectusUrl();
  const title = labels?.title ?? 'Tài liệu kỹ thuật';
  const downloadLabel = labels?.download ?? 'Tải xuống';
  const previewLabel = labels?.preview ?? 'Xem trước';
  const noDocumentsLabel = labels?.noDocuments ?? 'Chưa có tài liệu nào.';

  if (!documents || documents.length === 0) {
    return (
      <section>
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <p className="text-gray-500">{noDocumentsLabel}</p>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div className="divide-y border rounded-lg overflow-hidden">
        {documents.map((doc) => {
          const file = typeof doc.file === 'object' ? (doc.file as DirectusFile | null) : null;
          const hasFile = file !== null;

          return (
            <div
              key={doc.id}
              className="flex items-center justify-between px-4 py-3 bg-white"
            >
              {/* Left: icon + title + badge */}
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="h-5 w-5 text-gray-400 shrink-0" />
                <span className="truncate font-medium text-gray-900">
                  {doc.title}
                </span>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium shrink-0 ${docTypeBadgeStyles[doc.doc_type] ?? 'bg-gray-100 text-gray-800'}`}
                >
                  {docTypeLabels[doc.doc_type] ?? doc.doc_type}
                </span>
              </div>

              {/* Right: file size + actions */}
              <div className="flex items-center gap-3 shrink-0 ml-4">
                {hasFile && file.filesize != null && (
                  <span className="text-sm text-gray-500">
                    {formatFileSize(file.filesize)}
                  </span>
                )}

                {hasFile ? (
                  <>
                    <a
                      href={`${directusUrl}/assets/${file.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      title={previewLabel}
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span className="sr-only">{previewLabel}</span>
                    </a>
                    <a
                      href={`${directusUrl}/assets/${file.id}?download`}
                      download
                      className="inline-flex items-center gap-1 rounded px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      title={downloadLabel}
                    >
                      <Download className="h-4 w-4" />
                      <span className="sr-only">{downloadLabel}</span>
                    </a>
                  </>
                ) : (
                  <>
                    <button
                      disabled
                      className="inline-flex items-center gap-1 rounded px-2 py-1 text-sm text-gray-300 cursor-not-allowed"
                      title={previewLabel}
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span className="sr-only">{previewLabel}</span>
                    </button>
                    <button
                      disabled
                      className="inline-flex items-center gap-1 rounded px-2 py-1 text-sm text-gray-300 cursor-not-allowed"
                      title={downloadLabel}
                    >
                      <Download className="h-4 w-4" />
                      <span className="sr-only">{downloadLabel}</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
