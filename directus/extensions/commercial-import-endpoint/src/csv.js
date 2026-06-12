function isQuote(value) {
  return value === '"';
}

function isComma(value) {
  return value === ',';
}

function isLineBreak(value) {
  return value === '\n' || value === '\r';
}

function normalizeCell(value) {
  return String(value ?? '');
}

function finalizeRecord(headers, cells) {
  if (!headers || cells.length === 0) {
    return null;
  }

  const record = {};
  for (let index = 0; index < headers.length; index += 1) {
    record[headers[index]] = normalizeCell(cells[index]);
  }

  return record;
}

export function parseCommercialCsv(csvText) {
  const text = String(csvText ?? '').replace(/^\uFEFF/, '');
  const rows = [];
  let headers = null;
  let cells = [];
  let cell = '';
  let inQuotes = false;

  for (let index = 0; index <= text.length; index += 1) {
    const char = text[index] ?? '\n';

    if (inQuotes) {
      if (isQuote(char)) {
        if (text[index + 1] === '"') {
          cell += '"';
          index += 1;
        } else {
          inQuotes = false;
        }
      } else {
        cell += char;
      }
      continue;
    }

    if (isQuote(char)) {
      inQuotes = true;
      continue;
    }

    if (isComma(char)) {
      cells.push(cell);
      cell = '';
      continue;
    }

    if (isLineBreak(char)) {
      if (char === '\r' && text[index + 1] === '\n') {
        index += 1;
      }

      cells.push(cell);
      cell = '';

      if (!headers) {
        headers = cells.map((value) => String(value ?? '').trim());
      } else {
        const record = finalizeRecord(headers, cells);
        if (record && Object.values(record).some((value) => String(value).trim() !== '')) {
          rows.push(record);
        }
      }

      cells = [];
      continue;
    }

    cell += char;
  }

  return rows;
}

function escapeCsvCell(value) {
  const text = String(value ?? '');
  if (/[,"\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

export function renderCommercialImportErrorRows(errors) {
  const lines = ['row,field,message'];
  for (const error of errors) {
    lines.push(
      [error.row, error.field, error.message].map(escapeCsvCell).join(',')
    );
  }

  return lines.join('\n');
}
