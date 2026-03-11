/**
 * report-export.ts
 * Client-side export utility for all financial reports.
 * Uses: jspdf + jspdf-autotable (PDF), xlsx (Excel), docx (Word)
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ExportOptions {
  title: string;
  subtitle?: string;
  headers: string[];
  rows: (string | number)[][];
  totals?: (string | number)[][];   // optional footer / totals row(s)
  filename?: string;                // without extension
  companyName?: string;
  period?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const safeFilename = (title: string) =>
  title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// ─── PDF Export ──────────────────────────────────────────────────────────────

export async function exportToPDF(opts: ExportOptions): Promise<void> {
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const company = opts.companyName ?? 'Naxos Pharmaceuticals';
  const now = new Date().toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' });

  // Header block
  doc.setFontSize(16).setFont('helvetica', 'bold');
  doc.text(company, 14, 16);
  doc.setFontSize(12).setFont('helvetica', 'normal');
  doc.text(opts.title, 14, 24);
  if (opts.subtitle) doc.setFontSize(9).text(opts.subtitle, 14, 30);
  if (opts.period) {
    doc.setFontSize(9).text(`Period: ${opts.period}`, 14, opts.subtitle ? 36 : 30);
  }
  doc.setFontSize(8).setTextColor(150);
  doc.text(`Generated: ${now}`, doc.internal.pageSize.width - 14, 16, { align: 'right' });
  doc.setTextColor(0);

  const startY = opts.period ? 42 : opts.subtitle ? 38 : 34;

  const bodyRows = opts.rows.map(r => r.map(String));
  const footRows = (opts.totals ?? []).map(r => r.map(String));

  autoTable(doc, {
    startY,
    head: [opts.headers],
    body: bodyRows,
    foot: footRows,
    headStyles: { fillColor: [41, 98, 255], textColor: 255, fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 8 },
    footStyles: { fillColor: [230, 230, 230], textColor: 0, fontStyle: 'bold', fontSize: 9 },
    alternateRowStyles: { fillColor: [248, 249, 250] },
    margin: { top: 14, left: 14, right: 14 },
    styles: { overflow: 'linebreak', cellPadding: 2 },
    didDrawPage: (data) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pageCount = (doc as any).internal.getNumberOfPages();
      doc.setFontSize(7).setTextColor(150);
      doc.text(
        `Page ${data.pageNumber} of ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 6,
        { align: 'center' }
      );
    },
  });

  doc.save(`${opts.filename ?? safeFilename(opts.title)}.pdf`);
}

// ─── Excel Export ─────────────────────────────────────────────────────────────

export async function exportToExcel(opts: ExportOptions): Promise<void> {
  const XLSX = await import('xlsx');

  const wsData: (string | number)[][] = [];

  // Title rows
  wsData.push([opts.companyName ?? 'Naxos Pharmaceuticals']);
  wsData.push([opts.title]);
  if (opts.subtitle) wsData.push([opts.subtitle]);
  if (opts.period) wsData.push([`Period: ${opts.period}`]);
  wsData.push([`Generated: ${new Date().toLocaleDateString('en-NG')}`]);
  wsData.push([]); // blank

  // Data
  wsData.push(opts.headers);
  opts.rows.forEach(r => wsData.push(r));
  if (opts.totals?.length) {
    wsData.push([]); // blank before totals
    opts.totals.forEach(r => wsData.push(r));
  }

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Auto column widths
  const colWidths = opts.headers.map((h, i) => {
    const maxLen = Math.max(
      h.length,
      ...opts.rows.map(r => String(r[i] ?? '').length)
    );
    return { wch: Math.min(maxLen + 4, 40) };
  });
  ws['!cols'] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, opts.title.slice(0, 31));
  XLSX.writeFile(wb, `${opts.filename ?? safeFilename(opts.title)}.xlsx`);
}

// ─── Word (.docx) Export ──────────────────────────────────────────────────────

export async function exportToWord(opts: ExportOptions): Promise<void> {
  const {
    Document, Packer, Paragraph, Table, TableRow, TableCell,
    TextRun, HeadingLevel, AlignmentType, WidthType, BorderStyle,
    ShadingType,
  } = await import('docx');

  const boldCell = (text: string, shade = false) =>
    new TableCell({
      children: [new Paragraph({ children: [new TextRun({ text, bold: true, size: 18 })] })],
      shading: shade ? { type: ShadingType.CLEAR, fill: '2962FF', color: 'FFFFFF' } : undefined,
    });

  const normalCell = (text: string) =>
    new TableCell({
      children: [new Paragraph({ children: [new TextRun({ text, size: 18 })] })],
    });

  const totalCell = (text: string) =>
    new TableCell({
      children: [new Paragraph({ children: [new TextRun({ text, bold: true, size: 18 })] })],
      shading: { type: ShadingType.CLEAR, fill: 'E6E6E6' },
    });

  const headerRow = new TableRow({
    children: opts.headers.map(h => boldCell(h, true)),
    tableHeader: true,
  });

  const dataRows = opts.rows.map(
    row => new TableRow({ children: row.map(cell => normalCell(String(cell))) })
  );

  const totalRows = (opts.totals ?? []).map(
    row => new TableRow({ children: row.map(cell => totalCell(String(cell))) })
  );

  const table = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...dataRows, ...totalRows],
    borders: {
      top:    { style: BorderStyle.SINGLE, size: 1 },
      bottom: { style: BorderStyle.SINGLE, size: 1 },
      left:   { style: BorderStyle.SINGLE, size: 1 },
      right:  { style: BorderStyle.SINGLE, size: 1 },
    },
  });

  const now = new Date().toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' });

  const doc = new Document({
    sections: [{
      children: [
        new Paragraph({
          text: opts.companyName ?? 'Naxos Pharmaceuticals',
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
          text: opts.title,
          heading: HeadingLevel.HEADING_2,
          alignment: AlignmentType.CENTER,
        }),
        ...(opts.subtitle ? [new Paragraph({ text: opts.subtitle, alignment: AlignmentType.CENTER })] : []),
        ...(opts.period ? [new Paragraph({ text: `Period: ${opts.period}`, alignment: AlignmentType.CENTER })] : []),
        new Paragraph({
          children: [new TextRun({ text: `Generated: ${now}`, italics: true, size: 18, color: '888888' })],
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({ text: '' }),
        table,
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${opts.filename ?? safeFilename(opts.title)}.docx`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Print ────────────────────────────────────────────────────────────────────

export function printReport(opts: ExportOptions): void {
  const company = opts.companyName ?? 'Naxos Pharmaceuticals';
  const now = new Date().toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' });

  const thead = `<tr>${opts.headers.map(h => `<th>${h}</th>`).join('')}</tr>`;
  const tbody = opts.rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('');
  const tfoot = (opts.totals ?? []).map(r => `<tr class="total-row">${r.map(c => `<td><strong>${c}</strong></td>`).join('')}</tr>`).join('');

  const html = `<!DOCTYPE html><html><head><title>${opts.title}</title>
  <style>
    body { font-family: Arial, sans-serif; font-size: 12px; margin: 20px; }
    h1 { font-size: 18px; margin: 0; } h2 { font-size: 14px; margin: 4px 0 2px; }
    .meta { color: #888; font-size: 11px; margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    th { background: #1a56db; color: #fff; padding: 6px 8px; text-align: left; font-size: 11px; }
    td { padding: 5px 8px; border-bottom: 1px solid #e5e7eb; font-size: 11px; }
    tr:nth-child(even) { background: #f9fafb; }
    .total-row td { background: #e5e7eb; font-weight: bold; }
    @media print { body { margin: 0; } }
  </style></head><body>
  <h1>${company}</h1><h2>${opts.title}</h2>
  ${opts.subtitle ? `<p class="meta">${opts.subtitle}</p>` : ''}
  ${opts.period ? `<p class="meta">Period: ${opts.period}</p>` : ''}
  <p class="meta">Generated: ${now}</p>
  <table><thead>${thead}</thead><tbody>${tbody}</tbody><tfoot>${tfoot}</tfoot></table>
  </body></html>`;

  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  win.print();
}
