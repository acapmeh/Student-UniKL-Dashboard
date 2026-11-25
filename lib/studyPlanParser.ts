import { StudyPlanData, StudyPlanSubject } from './types';

export interface PdfTextSpan {
  str: string;
  x: number;
  y: number;
  width?: number;
}

interface TextLine {
  y: number;
  spans: PdfTextSpan[];
  text: string;
}

type ColumnKey =
  | 'rowNum'
  | 'year'
  | 'sem'
  | 'subject'
  | 'name'
  | 'credit'
  | 'category'
  | 'preReq'
  | 'semTaken'
  | 'status'
  | 'creditGained';

interface ColumnRanges {
  bounds: Array<{ key: ColumnKey; minX: number; maxX: number }>;
  subjectMinX: number;
  subjectMaxX: number;
  creditCenterX: number;
}

const SUBJECT_CODE_REGEX = /^[A-Z]{2,4}\d{4,5}$/;
const COMPACT_SUBJECT_CODE_REGEX = /^([A-Z]{2,4})\s+(\d{4,5})$/;
const STOP_LINE_REGEX = /^(?:legend\s*\/\s*note|other\s+subjects|summary\b|printed\s+date|page\s+\d+\s+of\s+\d+)/i;

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function normalizeSubjectCode(raw: string): string | null {
  const cleaned = normalizeWhitespace(raw).toUpperCase();
  if (SUBJECT_CODE_REGEX.test(cleaned)) return cleaned;
  const spaced = cleaned.match(COMPACT_SUBJECT_CODE_REGEX);
  if (spaced) return `${spaced[1]}${spaced[2]}`;
  return null;
}

function groupSpansIntoLines(spans: PdfTextSpan[], yTolerance = 3.5): TextLine[] {
  const nonEmpty = spans
    .filter((s) => s.str && s.str.trim().length > 0)
    .slice()
    .sort((a, b) => b.y - a.y || a.x - b.x);

  const groups: Array<{ y: number; spans: PdfTextSpan[] }> = [];
  for (const span of nonEmpty) {
    const existing = groups.find((g) => Math.abs(g.y - span.y) <= yTolerance);
    if (existing) {
      existing.spans.push(span);
    } else {
      groups.push({ y: span.y, spans: [span] });
    }
  }

  return groups.map((g) => {
    const sorted = g.spans.slice().sort((a, b) => a.x - b.x);
    return {
      y: g.y,
      spans: sorted,
      text: normalizeWhitespace(sorted.map((s) => s.str).join(' ')),
    };
  });
}

function detectColumnsOnLine(line: TextLine, nextLine?: TextLine): ColumnRanges | null {
  const combinedSpans =
    nextLine && Math.abs(line.y - nextLine.y) <= 16
      ? [...line.spans, ...nextLine.spans].sort((a, b) => a.x - b.x)
      : line.spans;

  const combinedText = normalizeWhitespace(combinedSpans.map((s) => s.str).join(' ')).toLowerCase();
  if (
    !combinedText.includes('subject') ||
    !combinedText.includes('name') ||
    !combinedText.includes('credit') ||
    !combinedText.includes('status')
  ) {
    return null;
  }

  const anchors: Array<{ key: ColumnKey; x: number; rightX: number }> = [];
  let sawSubject = false;
  let sawName = false;
  let sawStatus = false;

  for (const span of combinedSpans) {
    const token = normalizeWhitespace(span.str).toLowerCase();
    const rightX = span.x + (span.width ?? Math.max(20, token.length * 5.2));
    if (token === '#' || token === 'no' || token === 'no.') {
      anchors.push({ key: 'rowNum', x: span.x, rightX });
    } else if (token === 'year' || token.startsWith('year ')) {
      anchors.push({ key: 'year', x: span.x, rightX });
    } else if (token === 'sem' || token === 'sem.') {
      anchors.push({ key: 'sem', x: span.x, rightX });
    } else if (!sawSubject && (token === 'subject' || token.startsWith('subject '))) {
      sawSubject = true;
      anchors.push({ key: 'subject', x: span.x, rightX });
    } else if (!sawName && (token === 'name' || token.includes('subject name'))) {
      sawName = true;
      anchors.push({ key: 'name', x: span.x, rightX });
    } else if (token.includes('credit gained')) {
      anchors.push({ key: 'creditGained', x: span.x, rightX });
    } else if (token === 'credit' || token === 'cr' || token === 'credits') {
      anchors.push({
        key: sawStatus || (sawName && anchors.some((a) => a.key === 'credit')) ? 'creditGained' : 'credit',
        x: span.x,
        rightX,
      });
    } else if (token.startsWith('category')) {
      anchors.push({ key: 'category', x: span.x, rightX });
    } else if (token.includes('pre-') || token.includes('requisite') || token.includes('prereq')) {
      if (!anchors.some((a) => a.key === 'preReq')) {
        anchors.push({ key: 'preReq', x: span.x, rightX });
      }
    } else if (token === 'semester' || token.startsWith('semester ')) {
      anchors.push({ key: 'semTaken', x: span.x, rightX });
    } else if (token === 'status') {
      sawStatus = true;
      anchors.push({ key: 'status', x: span.x, rightX });
    }
  }

  // Fallback if header tokens were merged into a single string span
  if (anchors.length < 4) {
    return null;
  }

  // Ensure rowNum band exists before Year even when '#' header text is absent in PGR032
  const yearAnchor = anchors.find((a) => a.key === 'year');
  if (yearAnchor && !anchors.some((a) => a.key === 'rowNum')) {
    anchors.push({ key: 'rowNum', x: Math.max(0, yearAnchor.x - 16), rightX: Math.max(0, yearAnchor.x - 6) });
  }

  // Deduplicate by key (keep earliest occurrence except allow credit vs creditGained)
  const sortedAnchors = anchors
    .slice()
    .sort((a, b) => a.x - b.x)
    .filter((item, idx, arr) => arr.findIndex((other) => other.key === item.key) === idx);

  const bounds: Array<{ key: ColumnKey; minX: number; maxX: number }> = [];
  for (let i = 0; i < sortedAnchors.length; i++) {
    const curr = sortedAnchors[i];
    const prev = sortedAnchors[i - 1];
    const next = sortedAnchors[i + 1];

    const calcBoundary = (left: { key: ColumnKey; x: number; rightX: number }, right: { key: ColumnKey; x: number; rightX: number }) => {
      // Right-aligned Credit numbers sit up to left.rightX while Category starts slightly left of Category header
      if (left.key === 'credit' && right.key === 'category') {
        return (left.rightX + right.x) / 2;
      }
      if (left.key === 'name' && right.key === 'credit') {
        return Math.min(right.x - 4, (left.x + right.x) / 2 + 55);
      }
      return (left.x + right.x) / 2;
    };

    const minX = prev ? calcBoundary(prev, curr) : -Infinity;
    const maxX = next ? calcBoundary(curr, next) : Infinity;
    bounds.push({ key: curr.key, minX, maxX });
  }

  const subjectRange = bounds.find((b) => b.key === 'subject');
  const creditAnchor = sortedAnchors.find((a) => a.key === 'credit');
  return {
    bounds,
    subjectMinX: subjectRange ? subjectRange.minX : 80,
    subjectMaxX: subjectRange ? subjectRange.maxX : 140,
    creditCenterX: creditAnchor ? creditAnchor.x : 305,
  };
}

function getColumnForX(x: number, cols: ColumnRanges): ColumnKey {
  for (const bound of cols.bounds) {
    if (x >= bound.minX && x < bound.maxX) {
      return bound.key;
    }
  }
  return 'name';
}

const HEADER_LABEL_STOP =
  /^(?:Institute|Programme|Student\s*ID|Name|Intake\s*Sem|Acad\s*Sem|Status|Total\s*Credit(?:\s*to)?|Elective|Academic(?:\s*Advisor)?|Advisor|Report\s*ID)\b\s*:?$/i;

function extractColonlessGridField(lines: TextLine[], labelRegex: RegExp): string | undefined {
  for (const line of lines) {
    // Only scan metadata area (avoid table 'Name' column header line)
    const lineLower = line.text.toLowerCase();
    if (lineLower.includes('subject') && lineLower.includes('credit')) continue;

    for (let i = 0; i < line.spans.length; i++) {
      const spanText = normalizeWhitespace(line.spans[i].str);
      if (!labelRegex.test(spanText)) continue;

      const labelX = line.spans[i].x;
      const values: string[] = [];
      for (let j = i + 1; j < line.spans.length; j++) {
        const cand = line.spans[j];
        const candText = normalizeWhitespace(cand.str);
        if (!candText) continue;
        if (HEADER_LABEL_STOP.test(candText)) break;
        // Stop before far-right institutional/program codes like "00015" or "H18"
        if (cand.x >= 520 && /^[A-Z0-9]{2,6}$/.test(candText)) break;
        if (cand.x > labelX) {
          values.push(candText);
        }
      }
      const joined = normalizeWhitespace(values.join(' '));
      if (joined) return joined;
    }
  }
  return undefined;
}

function extractLabeledField(lines: TextLine[], labelPattern: RegExp, exactSpanLabel?: RegExp): string | undefined {
  const stopLookahead =
    '(?=\\s+(?:Name|Student\\s*ID|Programme|Institute|Intake\\s*Sem|Acad\\s*Sem|Status|Elective|Total\\s*Credits?(?:\\s+to\\s+Graduate(?:\\s*\\(TCG\\))?)?|Semester\\s*Credit\\s*Taken(?:\\s*\\(SCT\\))?|Academic\\s*Advisor|Report\\s*ID)\\s*:|$)';
  const combined = new RegExp(`${labelPattern.source}\\s*:\\s*(.+?)${stopLookahead}`, 'i');

  for (const line of lines) {
    const match = line.text.match(combined);
    if (match && match[1]) {
      const value = normalizeWhitespace(match[1]);
      if (value.length > 0 && !value.endsWith(':')) {
        return value;
      }
    }
  }

  if (exactSpanLabel) {
    return extractColonlessGridField(lines, exactSpanLabel);
  }
  return undefined;
}

function mergeUniquePreReqs(existing: string | undefined, addition: string): string | undefined {
  const tokens = normalizeWhitespace(addition)
    .split(/[\s,;]+/)
    .map((t) => normalizeSubjectCode(t) || t.trim())
    .filter((t) => t.length > 0 && t !== '-' && t.toUpperCase() !== 'NONE');

  if (tokens.length === 0) return existing;

  const current = existing
    ? existing.split(',').map((item) => item.trim()).filter(Boolean)
    : [];
  for (const token of tokens) {
    if (!current.includes(token)) {
      current.push(token);
    }
  }
  return current.length > 0 ? current.join(', ') : undefined;
}

/**
 * Pure parser converting extracted PDF text spans (x, y coordinates per page)
 * into a structured UniKL Study Plan record (`Report ID : PGR032`).
 */
export function parseStudyPlanFromPages(
  pages: PdfTextSpan[][],
  importedAt: string = new Date().toISOString()
): StudyPlanData {
  if (!pages || pages.length === 0) {
    throw new Error('This PDF contains no readable text pages.');
  }

  const allPageLines = pages.map((pageSpans) => groupSpansIntoLines(pageSpans));
  const flatLines = allPageLines.flat();

  const reportIdMatch = flatLines
    .map((l) => l.text.match(/Report\s*ID\s*:\s*([A-Z0-9-]+)/i))
    .find(Boolean);
  const reportId = reportIdMatch ? reportIdMatch[1].toUpperCase() : undefined;

  const institute = extractLabeledField(flatLines, /Institute/, /^Institute\s*:?$/i);
  const programme = extractLabeledField(flatLines, /Programme/, /^Programme\s*:?$/i);
  const studentId = extractLabeledField(flatLines, /Student\s*ID/, /^Student\s*ID\s*:?$/i);
  const rawStudentName = extractLabeledField(flatLines, /\bName/, /^Name\s*:?$/i);
  const studentName = rawStudentName?.replace(/\s*\(\s*\d{6,}\s*\)\s*$/, '').trim();
  const acadSem = extractLabeledField(flatLines, /Acad\s*Sem/, /^Acad\s*Sem\s*:?$/i);
  const academicAdvisor = extractLabeledField(
    flatLines,
    /Academic\s*Advisor/,
    /^Academic(?:\s*Advisor)?\s*:?$/i
  );

  const headerTcgRaw = extractLabeledField(
    flatLines,
    /Total\s*Credit\s*to\s*Graduate/,
    /^Total\s*Credit\s*to(?:\s*Graduate)?\s*:?$/i
  );
  const summaryTcgRaw = extractLabeledField(flatLines, /Total\s*Credits\s*to\s*Graduate\s*\(TCG\)/);
  const summarySctRaw = extractLabeledField(flatLines, /Semester\s*Credit\s*Taken\s*\(SCT\)/);
  const summaryTotalLine = flatLines.find((l) => /^TOTAL\s*:/i.test(l.text));
  const summaryTotalNumbers = summaryTotalLine
    ? (summaryTotalLine.text.match(/\d+/g) ?? []).map((n) => parseInt(n, 10))
    : [];

  const subjects: StudyPlanSubject[] = [];
  let activeCols: ColumnRanges | null = null;
  let catalogSubtotalCredits = 0;

  for (const pageLines of allPageLines) {
    let activeSubject: StudyPlanSubject | null = null;
    let inTable = false;

    for (let i = 0; i < pageLines.length; i++) {
      const line = pageLines[i];
      const nextLine = pageLines[i + 1];

      // Check if this line starts/repeats a table header
      const detectedHeader = detectColumnsOnLine(line, nextLine);
      if (detectedHeader) {
        activeCols = detectedHeader;
        inTable = true;
        activeSubject = null;
        // Skip wrapped second header line if it mostly contains header words
        if (nextLine && Math.abs(line.y - nextLine.y) <= 16) {
          const nextLower = nextLine.text.toLowerCase();
          if (
            (nextLower.includes('requisite') || nextLower.includes('gained')) &&
            !nextLower.match(SUBJECT_CODE_REGEX)
          ) {
            i++;
          }
        }
        continue;
      }

      if (!activeCols) {
        continue;
      }

      if (STOP_LINE_REGEX.test(line.text) || /^TOTAL\s*:/i.test(line.text)) {
        activeSubject = null;
        inTable = false;
        continue;
      }

      // Skip metadata lines before table on pages if any leak through
      if (!inTable) {
        inTable = true;
      }

      // Bucket each span by detected column X boundary
      const buckets: Record<ColumnKey, string[]> = {
        rowNum: [],
        year: [],
        sem: [],
        subject: [],
        name: [],
        credit: [],
        category: [],
        preReq: [],
        semTaken: [],
        status: [],
        creditGained: [],
      };

      for (const span of line.spans) {
        const col = getColumnForX(span.x, activeCols);
        buckets[col].push(span.str.trim());
      }

      const rowNumText = normalizeWhitespace(buckets.rowNum.join(' '));
      const subjectText = normalizeWhitespace(buckets.subject.join(' '));
      const nameText = normalizeWhitespace(buckets.name.join(' '));
      const creditText = normalizeWhitespace(buckets.credit.join(' '));
      const categoryText = normalizeWhitespace(buckets.category.join(' '));
      const preReqText = normalizeWhitespace(buckets.preReq.join(' '));
      const semTakenText = normalizeWhitespace(buckets.semTaken.join(' '));
      const statusText = normalizeWhitespace(buckets.status.join(' ')).toUpperCase();
      const creditGainedText = normalizeWhitespace(buckets.creditGained.join(' '));

      // Handle table subtotal row (e.g., "182   54" in credit + creditGained columns, no rowNum / subject)
      const isSubtotalRow =
        !rowNumText &&
        !subjectText &&
        !nameText &&
        /^\d{2,4}$/.test(creditText) &&
        (!creditGainedText || /^\d{1,4}$/.test(creditGainedText));
      if (isSubtotalRow) {
        catalogSubtotalCredits = parseInt(creditText, 10);
        activeSubject = null;
        continue;
      }

      // Extract leading integers from pre-Subject region in case #, Year, Sem share a wide span
      const preSubjectNums = normalizeWhitespace(
        `${buckets.rowNum.join(' ')} ${buckets.year.join(' ')} ${buckets.sem.join(' ')}`
      )
        .split(/\s+/)
        .filter((tok) => /^\d{1,3}$/.test(tok))
        .map((tok) => parseInt(tok, 10));

      const subjectCode = normalizeSubjectCode(subjectText);

      if (preSubjectNums.length >= 1 && subjectCode) {
        const rowNumber = preSubjectNums[0];
        const year = preSubjectNums[1] ?? 0;
        const sem = preSubjectNums[2] ?? 0;
        const creditHours = /^\d{1,2}$/.test(creditText) ? parseInt(creditText, 10) : 0;
        const creditGained = /^\d{1,2}$/.test(creditGainedText)
          ? parseInt(creditGainedText, 10)
          : undefined;

        const subjectEntry: StudyPlanSubject = {
          rowNumber,
          year,
          sem,
          code: subjectCode,
          name: nameText,
          creditHours,
          category: categoryText || 'CORE',
          ...(preReqText ? { preRequisite: mergeUniquePreReqs(undefined, preReqText) } : {}),
          ...(semTakenText ? { semesterTaken: semTakenText } : {}),
          status: statusText || 'PLANNED',
          ...(creditGained !== undefined ? { creditGained } : {}),
        };

        subjects.push(subjectEntry);
        activeSubject = subjectEntry;
        continue;
      }

      // Continuation line for wrapped subject title or multi-line prerequisite
      if (activeSubject && !rowNumText && !subjectCode) {
        // Guard against footer or unrelated page metadata far below the active row
        if (Math.abs(line.y - pageLines[Math.max(0, i - 1)].y) > 45) {
          activeSubject = null;
          continue;
        }
        if (nameText) {
          activeSubject.name = normalizeWhitespace(`${activeSubject.name} ${nameText}`);
        }
        if (preReqText) {
          activeSubject.preRequisite = mergeUniquePreReqs(activeSubject.preRequisite, preReqText);
        }
        if (!activeSubject.semesterTaken && semTakenText) {
          activeSubject.semesterTaken = semTakenText;
        }
        if (activeSubject.status === 'PLANNED' && statusText) {
          activeSubject.status = statusText;
        }
        if (activeSubject.creditGained === undefined && /^\d{1,2}$/.test(creditGainedText)) {
          activeSubject.creditGained = parseInt(creditGainedText, 10);
        }
      }
    }
  }

  if (subjects.length === 0) {
    throw new Error(
      'Could not find any Study Plan subject rows in this PDF. Please upload a valid UniKL Study Plan PDF (Report ID PGR032).'
    );
  }

  const parsedTcg =
    parseInt(summaryTcgRaw ?? '', 10) ||
    parseInt(headerTcgRaw ?? '', 10) ||
    summaryTotalNumbers[0] ||
    0;

  const summedCompleted = subjects.reduce((sum, s) => {
    if (typeof s.creditGained === 'number') return sum + s.creditGained;
    if (s.status === 'PASS' || s.status === 'CT' || s.status === 'EX') return sum + s.creditHours;
    return sum;
  }, 0);

  const completedCredits =
    summaryTotalNumbers.length >= 2 && Number.isFinite(summaryTotalNumbers[1])
      ? summaryTotalNumbers[1]
      : summedCompleted;

  const summedCurrentSem = subjects
    .filter((s) => s.status === 'ST')
    .reduce((sum, s) => sum + s.creditHours, 0);

  const currentSemCredits =
    parseInt(summarySctRaw ?? '', 10) || summedCurrentSem;

  const summedListedCredits = subjects.reduce((sum, s) => sum + s.creditHours, 0);
  const totalListedCredits = catalogSubtotalCredits || summedListedCredits;

  const totalCreditToGraduate = parsedTcg || totalListedCredits;

  return {
    ...(reportId ? { reportId } : {}),
    ...(studentName ? { studentName } : {}),
    ...(studentId ? { studentId } : {}),
    ...(programme ? { programme } : {}),
    ...(institute ? { institute } : {}),
    ...(acadSem ? { acadSem } : {}),
    ...(academicAdvisor ? { academicAdvisor } : {}),
    totalCreditToGraduate,
    completedCredits,
    currentSemCredits,
    totalListedCredits,
    subjects,
    importedAt,
  };
}
