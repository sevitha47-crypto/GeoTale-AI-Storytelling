import React, { useState } from 'react';
import { Story } from '../types.ts';
import { X, Download, Code, FileText, Check } from 'lucide-react';

interface ExportModalProps {
  story: Story | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ story, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !story) return null;

  const downloadJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(story, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${story.title.toLowerCase().replace(/\s+/g, '-')}-geotale.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const downloadHtmlTravelogue = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${story.title} — GeoTale Chronicle</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #FAF8F5; color: #1E252B; margin: 0; padding: 40px 20px; line-height: 1.6; }
    .container { max-width: 800px; margin: 0 auto; background: white; border-radius: 24px; padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.06); border: 1px solid #E8E2D9; }
    h1 { font-family: Georgia, serif; color: #1E252B; font-size: 32px; margin-bottom: 8px; }
    .badge { display: inline-block; background: #E07A5F; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
    .stop { border-left: 3px solid #E07A5F; margin: 30px 0; padding-left: 20px; position: relative; }
    .stop img { width: 100%; border-radius: 12px; margin-top: 10px; max-height: 380px; object-fit: cover; }
    .caption { font-style: italic; color: #4A5568; margin-top: 10px; background: #FAF8F5; padding: 12px; border-radius: 8px; }
    .coord { font-family: monospace; font-size: 12px; color: #A0AEC0; }
  </style>
</head>
<body>
  <div class="container">
    <span class="badge">${story.category}</span>
    <h1>${story.title}</h1>
    <p>${story.description}</p>
    <p><strong>Timeline:</strong> ${story.startDate} to ${story.endDate} · <strong>Stops:</strong> ${story.locations.length}</p>
    <hr style="border: 0; border-top: 1px solid #E8E2D9; margin: 25px 0;" />
    ${story.locations.map((loc, idx) => `
      <div class="stop">
        <h3>Stop ${idx + 1}: ${loc.name} (${loc.city})</h3>
        <div class="coord">${loc.lat}°N, ${loc.lng}°E · ${loc.date} ${loc.time || ''}</div>
        ${loc.media && loc.media[0] ? `<img src="${loc.media[0].url}" alt="${loc.name}">` : ''}
        <div class="caption">"${loc.aiPolishedCaption || loc.caption}"</div>
        ${loc.notes ? `<p><small><strong>Notes:</strong> ${loc.notes}</small></p>` : ''}
      </div>
    `).join('')}
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', url);
    downloadAnchor.setAttribute('download', `${story.title.toLowerCase().replace(/\s+/g, '-')}-travelogue.html`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    URL.revokeObjectURL(url);
  };

  const copyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(story, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#FAF8F5] rounded-3xl max-w-md w-full p-6 sm:p-8 border border-[#E8E2D9] shadow-2xl relative text-[#1E252B] space-y-6">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-[#EAE4DC] text-[#7A7369] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <span className="text-xs uppercase font-bold text-[#E07A5F] tracking-wider">
            Export Chronicle
          </span>
          <h2 className="font-serif text-2xl font-bold text-[#1E252B] mt-0.5">
            Download Story Package
          </h2>
          <p className="text-xs text-[#554E45] mt-1">
            Export {story.title} for offline presentation, archival, or sharing.
          </p>
        </div>

        <div className="space-y-3">
          {/* HTML Standalone Travelogue */}
          <div className="p-4 rounded-2xl bg-white border border-[#E8E2D9] flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#E07A5F]/15 text-[#E07A5F] flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#1E252B]">Standalone Travelogue (.html)</h4>
                <p className="text-xs text-[#7A7369]">Complete portable document with all photos and captions</p>
              </div>
            </div>
            <button
              onClick={downloadHtmlTravelogue}
              className="px-3 py-2 rounded-xl bg-[#2A3B4C] hover:bg-[#1E2A36] text-white text-xs font-bold shrink-0 transition-colors cursor-pointer"
            >
              Download
            </button>
          </div>

          {/* JSON Backup */}
          <div className="p-4 rounded-2xl bg-white border border-[#E8E2D9] flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#2A3B4C]/15 text-[#2A3B4C] flex items-center justify-center shrink-0">
                <Code className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#1E252B]">Raw Story Data (.json)</h4>
                <p className="text-xs text-[#7A7369]">Coordinate data, timestamps, and parameters</p>
              </div>
            </div>
            <button
              onClick={downloadJson}
              className="px-3 py-2 rounded-xl bg-[#2A3B4C] hover:bg-[#1E2A36] text-white text-xs font-bold shrink-0 transition-colors cursor-pointer"
            >
              Download
            </button>
          </div>
        </div>

        <button
          onClick={copyJson}
          className="w-full py-2.5 rounded-xl border border-[#D8CFBF] hover:bg-[#EAE4DC] text-xs font-semibold text-[#2A3B4C] flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Code className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied JSON to Clipboard!' : 'Copy Raw JSON to Clipboard'}</span>
        </button>
      </div>
    </div>
  );
};
