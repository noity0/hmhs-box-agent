import pptxgen from 'pptxgenjs';
import * as docx from 'docx';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';

export interface GeneratedFileResult {
  fileName: string;
  format: string;
  sizeBytes: number;
  url?: string;
  blob: Blob;
}

// 1. REAL PPTX GENERATOR (Microsoft PowerPoint Presentation)
export async function generateRealPptx(options: {
  title: string;
  subtitle?: string;
  author?: string;
  slides: Array<{
    title: string;
    bullets?: string[];
    body?: string;
    callout?: string;
    tableData?: string[][];
  }>;
}): Promise<GeneratedFileResult> {
  const pptx = new pptxgen();

  // Presentation Metadata & Layout
  pptx.layout = 'LAYOUT_WIDE';
  pptx.author = options.author || 'HMHS Box AI Agent #12';
  pptx.company = 'HMHS Quantum Cloud Systems';
  pptx.subject = options.title;
  pptx.title = options.title;

  // Title Slide
  const titleSlide = pptx.addSlide();
  titleSlide.background = { color: '0A0E1A' };

  titleSlide.addText(options.title, {
    x: 1.0,
    y: 2.2,
    w: 11.3,
    h: 1.8,
    fontSize: 40,
    fontFace: 'Helvetica',
    color: '38BDF8',
    bold: true,
    align: 'left',
  });

  if (options.subtitle) {
    titleSlide.addText(options.subtitle, {
      x: 1.0,
      y: 4.0,
      w: 11.3,
      h: 1.0,
      fontSize: 20,
      fontFace: 'Helvetica',
      color: '94A3B8',
      align: 'left',
    });
  }

  titleSlide.addText('⚡ Engineered by HMHS 100+ File AI Agents Core • Gemini 3.8 Flash Engine', {
    x: 1.0,
    y: 6.2,
    w: 11.3,
    h: 0.5,
    fontSize: 11,
    fontFace: 'Courier New',
    color: '34D399',
    align: 'left',
  });

  // Content Slides
  options.slides.forEach((s, idx) => {
    const slide = pptx.addSlide();
    slide.background = { color: '0F172A' };

    // Slide Header
    slide.addText(s.title, {
      x: 0.8,
      y: 0.6,
      w: 11.5,
      h: 0.8,
      fontSize: 26,
      fontFace: 'Helvetica',
      color: 'F8FAFC',
      bold: true,
    });

    // Decorative line
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.8,
      y: 1.4,
      w: 11.5,
      h: 0.04,
      fill: { color: '38BDF8' },
    });

    let currentY = 1.7;

    // Bullet Points
    if (s.bullets && s.bullets.length > 0) {
      const bulletItems = s.bullets.map((b) => ({
        text: b,
        options: {
          fontSize: 16,
          color: 'E2E8F0',
          bullet: true,
          fontFace: 'Helvetica',
          breakLine: true,
        },
      }));

      slide.addText(bulletItems, {
        x: 0.8,
        y: currentY,
        w: 11.5,
        h: Math.min(3.5, s.bullets.length * 0.7),
        lineSpacing: 28,
      });

      currentY += Math.min(3.5, s.bullets.length * 0.7) + 0.2;
    }

    // Body Text
    if (s.body && (!s.bullets || s.bullets.length === 0)) {
      slide.addText(s.body, {
        x: 0.8,
        y: currentY,
        w: 11.5,
        h: 2.8,
        fontSize: 16,
        color: 'CBD5E1',
        fontFace: 'Helvetica',
        lineSpacing: 24,
      });
      currentY += 3.0;
    }

    // Table Data
    if (s.tableData && s.tableData.length > 0) {
      const rows = s.tableData.map((row, rIdx) =>
        row.map((cell) => ({
          text: cell,
          options: {
            fill: { color: rIdx === 0 ? '1E293B' : '0F172A' },
            color: rIdx === 0 ? '38BDF8' : 'F1F5F9',
            bold: rIdx === 0,
            fontSize: 13,
            border: { type: 'solid', pt: 1, color: '334155' },
          },
        }))
      );

      slide.addTable(rows as any, {
        x: 0.8,
        y: currentY,
        w: 11.5,
      });
    }

    // Footer
    slide.addText(`Slide ${idx + 1} of ${options.slides.length} • HMHS Box Quantum Matrix`, {
      x: 0.8,
      y: 6.8,
      w: 11.5,
      h: 0.4,
      fontSize: 10,
      fontFace: 'Courier New',
      color: '64748B',
      align: 'right',
    });
  });

  const rawBlob = (await pptx.write({ outputType: 'blob' })) as Blob;
  const fileName = `${options.title.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40)}.pptx`;
  return {
    fileName,
    format: 'PPTX',
    sizeBytes: rawBlob.size,
    blob: rawBlob,
  };
}

// 2. REAL XLSX GENERATOR (Microsoft Excel Spreadsheet)
export async function generateRealXlsx(options: {
  fileName: string;
  sheets: Array<{
    sheetName: string;
    data: (string | number)[][];
    columnWidths?: number[];
  }>;
}): Promise<GeneratedFileResult> {
  const wb = XLSX.utils.book_new();

  for (const sheet of options.sheets) {
    const ws = XLSX.utils.aoa_to_sheet(sheet.data);

    // Apply column widths
    if (sheet.columnWidths) {
      ws['!cols'] = sheet.columnWidths.map((w) => ({ wch: w }));
    } else if (sheet.data.length > 0) {
      const colMax = sheet.data[0].length;
      ws['!cols'] = Array.from({ length: colMax }, (_, c) => {
        let maxLen = 12;
        for (let r = 0; r < sheet.data.length; r++) {
          const val = sheet.data[r][c];
          if (val != null) {
            maxLen = Math.max(maxLen, String(val).length + 3);
          }
        }
        return { wch: Math.min(maxLen, 45) };
      });
    }

    XLSX.utils.book_append_sheet(wb, ws, sheet.sheetName.slice(0, 31));
  }

  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const rawBlob = new Blob([wbout], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const cleanName = options.fileName.endsWith('.xlsx') ? options.fileName : `${options.fileName}.xlsx`;

  return {
    fileName: cleanName,
    format: 'XLSX',
    sizeBytes: rawBlob.size,
    blob: rawBlob,
  };
}

// 3. REAL DOCX GENERATOR (Microsoft Word Document)
export async function generateRealDocx(options: {
  title: string;
  subtitle?: string;
  author?: string;
  sections: Array<{
    heading?: string;
    paragraphs?: string[];
    bullets?: string[];
    table?: string[][];
  }>;
}): Promise<GeneratedFileResult> {
  const children: any[] = [];

  // Title
  children.push(
    new docx.Paragraph({
      text: options.title,
      heading: docx.HeadingLevel.TITLE,
      spacing: { after: 140 },
    })
  );

  // Subtitle
  if (options.subtitle) {
    children.push(
      new docx.Paragraph({
        children: [
          new docx.TextRun({
            text: options.subtitle,
            italics: true,
            color: '64748B',
            size: 24,
          }),
        ],
        spacing: { after: 200 },
      })
    );
  }

  // Author & System Meta
  children.push(
    new docx.Paragraph({
      children: [
        new docx.TextRun({
          text: `Engineered by: ${options.author || 'HMHS Box AI Agent #15 (Word Executive Scribe)'} • 100+ File Matrix`,
          color: '0284C7',
          size: 18,
          bold: true,
        }),
      ],
      spacing: { after: 300 },
    })
  );

  // Divider
  children.push(
    new docx.Paragraph({
      text: '_________________________________________________________________________________',
      spacing: { after: 300 },
    })
  );

  // Sections
  for (const s of options.sections) {
    if (s.heading) {
      children.push(
        new docx.Paragraph({
          text: s.heading,
          heading: docx.HeadingLevel.HEADING_1,
          spacing: { before: 240, after: 120 },
        })
      );
    }

    if (s.paragraphs) {
      for (const p of s.paragraphs) {
        children.push(
          new docx.Paragraph({
            text: p,
            spacing: { after: 120 },
          })
        );
      }
    }

    if (s.bullets) {
      for (const b of s.bullets) {
        children.push(
          new docx.Paragraph({
            text: b,
            bullet: { level: 0 },
            spacing: { after: 60 },
          })
        );
      }
    }

    if (s.table && s.table.length > 0) {
      const rows = s.table.map(
        (row, rIdx) =>
          new docx.TableRow({
            children: row.map(
              (cell) =>
                new docx.TableCell({
                  children: [
                    new docx.Paragraph({
                      text: cell,
                      children: [
                        new docx.TextRun({
                          text: cell,
                          bold: rIdx === 0,
                          color: rIdx === 0 ? '0369A1' : '1E293B',
                        }),
                      ],
                    }),
                  ],
                  shading: {
                    fill: rIdx === 0 ? 'F1F5F9' : 'FFFFFF',
                  },
                })
            ),
          })
      );

      children.push(
        new docx.Table({
          rows,
          width: { size: 100, type: docx.WidthType.PERCENTAGE },
        })
      );

      children.push(new docx.Paragraph({ text: '', spacing: { after: 200 } }));
    }
  }

  const doc = new docx.Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  const rawBlob = await docx.Packer.toBlob(doc);
  const fileName = `${options.title.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40)}.docx`;

  return {
    fileName,
    format: 'DOCX',
    sizeBytes: rawBlob.size,
    blob: rawBlob,
  };
}

// 4. REAL PDF GENERATOR
export async function generateRealPdf(options: {
  title: string;
  subtitle?: string;
  paragraphs: string[];
  tableData?: string[][];
}): Promise<GeneratedFileResult> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // Dark header banner
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 32, 'F');

  // Title
  doc.setTextColor(56, 189, 248);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(options.title, 14, 16);

  // Subtitle
  if (options.subtitle) {
    doc.setTextColor(203, 213, 225);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(options.subtitle, 14, 24);
  }

  let y = 42;

  // Paragraphs
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);

  for (const p of options.paragraphs) {
    const lines = doc.splitTextToSize(p, 180);
    doc.text(lines, 14, y);
    y += lines.length * 6 + 4;

    if (y > 270) {
      doc.addPage();
      y = 20;
    }
  }

  // Table
  if (options.tableData && options.tableData.length > 0) {
    y += 4;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);

    const cols = options.tableData[0].length;
    const colWidth = 180 / cols;

    options.tableData.forEach((row, rIdx) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }

      if (rIdx === 0) {
        doc.setFillColor(241, 245, 249);
        doc.rect(14, y - 4, 180, 7, 'F');
        doc.setTextColor(2, 132, 199);
      } else {
        doc.setTextColor(51, 65, 85);
      }

      row.forEach((cell, cIdx) => {
        doc.text(String(cell).slice(0, 25), 16 + cIdx * colWidth, y);
      });

      y += 7;
    });
  }

  // Footer
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(8);
  doc.text(
    'Engineered by HMHS Box AI • 100+ File Format Agent Matrix • Google Gemini 3.8',
    14,
    288
  );

  const rawBlob = doc.output('blob');
  const fileName = `${options.title.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40)}.pdf`;

  return {
    fileName,
    format: 'PDF',
    sizeBytes: rawBlob.size,
    blob: rawBlob,
  };
}

// 5. TEXT-BASED FILE GENERATOR (CSV, JSON, HTML, SVG, MD, SQL, PY, SH, etc.)
export async function generateTextFile(options: {
  fileName: string;
  format: string;
  content: string;
  mimeType?: string;
}): Promise<GeneratedFileResult> {
  const mime = options.mimeType || 'text/plain;charset=utf-8';
  const blob = new Blob([options.content], { type: mime });

  return {
    fileName: options.fileName,
    format: options.format.toUpperCase(),
    sizeBytes: blob.size,
    blob,
  };
}

// Download Helper
export function downloadFileResult(fileResult: GeneratedFileResult) {
  saveAs(fileResult.blob, fileResult.fileName);
}
