import { PdfTextSpan, parseStudyPlanFromPages } from './studyPlanParser';
import { StudyPlanData } from './types';

function isPdfFile(file: File): boolean {
  const name = (file.name || '').toLowerCase();
  return file.type === 'application/pdf' || name.endsWith('.pdf');
}

/**
 * Browser-only UniKL Study Plan PDF reader using dynamically imported pdfjs-dist
 * and a local worker script (`/pdf.worker.min.js`) compatible with Next.js static export.
 */
export async function readStudyPlanPdf(file: File): Promise<StudyPlanData> {
  if (typeof window === 'undefined') {
    throw new Error('PDF parsing is only supported in the browser.');
  }
  if (!isPdfFile(file)) {
    throw new Error('Please upload a valid .pdf file (UniKL Study Plan PGR032).');
  }

  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;

  const pages: PdfTextSpan[][] = [];
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const spans: PdfTextSpan[] = [];

    for (const item of textContent.items) {
      if ('str' in item && typeof item.str === 'string') {
        const transform = Array.isArray(item.transform) ? item.transform : [1, 0, 0, 1, 0, 0];
        spans.push({
          str: item.str,
          x: Number(transform[4]) || 0,
          y: Number(transform[5]) || 0,
          width: 'width' in item ? Number(item.width) : undefined,
        });
      }
    }
    pages.push(spans);
  }

  return parseStudyPlanFromPages(pages);
}
