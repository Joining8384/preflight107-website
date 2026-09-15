import type { ReactNode } from 'react';

// ── Inline markdown renderer ──────────────────────────────────────────────────
// Handles **bold**, *italic*, and `inline code` within a single line of text.
export function renderInline(text: string): ReactNode {
  const parts: ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    const token = match[0];
    if (token.startsWith('**')) {
      parts.push(<strong key={key++}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith('*')) {
      parts.push(<em key={key++}>{token.slice(1, -1)}</em>);
    } else {
      parts.push(<code key={key++} className="blog-inline-code">{token.slice(1, -1)}</code>);
    }
    last = match.index + token.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.length === 1 ? parts[0] : parts;
}

// ── Block markdown renderer ───────────────────────────────────────────────────
// Handles headings, code fences, lists (bulleted + numbered), tables, horizontal
// rules, and paragraphs.
// Shared by the blog and the help/guides section so both render identically.
export function renderMarkdown(content: string): ReactNode[] {
  const lines = content.split('\n');
  const blocks: ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block
    if (line.startsWith('```')) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing fence
      blocks.push(
        <pre key={key++} className="blog-pre">
          <code>{codeLines.join('\n')}</code>
        </pre>
      );
      continue;
    }

    // h3
    if (line.startsWith('### ')) {
      blocks.push(<h3 key={key++} className="blog-h3">{renderInline(line.slice(4))}</h3>);
      i++; continue;
    }
    // h2
    if (line.startsWith('## ')) {
      blocks.push(<h2 key={key++} className="blog-h2">{renderInline(line.slice(3))}</h2>);
      i++; continue;
    }

    // Horizontal rule
    if (line.trim() === '---') {
      blocks.push(<hr key={key++} className="blog-hr" />);
      i++; continue;
    }

    // Standalone image on its own line: ![alt](src) or ![alt](src "caption")
    const imgMatch = line.match(/^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)\s*$/);
    if (imgMatch) {
      blocks.push(
        <figure key={key++} className="blog-figure">
          <img className="blog-img" src={imgMatch[2]} alt={imgMatch[1]} loading="lazy" />
          {imgMatch[3] ? <figcaption className="blog-figcaption">{imgMatch[3]}</figcaption> : null}
        </figure>
      );
      i++; continue;
    }

    // Table — a header row, a |---| separator row, then body rows
    if (line.trim().startsWith('|') && i + 1 < lines.length && /^\s*\|?\s*:?-{3,}/.test(lines[i + 1])) {
      const cells = (row: string) => row.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
      const header = cells(line);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        rows.push(cells(lines[i]));
        i++;
      }
      blocks.push(
        <div key={key++} className="blog-table-wrap">
          <table className="blog-table">
            <thead><tr>{header.map((h, c) => <th key={c}>{renderInline(h)}</th>)}</tr></thead>
            <tbody>
              {rows.map((r, ri) => (
                <tr key={ri}>{r.map((cell, c) => <td key={c}>{renderInline(cell)}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    // Ordered list — "1. step" lines, with optional indented "- " sub-bullets
    if (/^\d+\. /.test(line)) {
      const items: ReactNode[] = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        const text = lines[i].replace(/^\d+\. /, '');
        i++;
        const subs: ReactNode[] = [];
        while (i < lines.length && /^\s+- /.test(lines[i])) {
          subs.push(<li key={subs.length}>{renderInline(lines[i].replace(/^\s+- /, ''))}</li>);
          i++;
        }
        items.push(
          <li key={items.length}>
            {renderInline(text)}
            {subs.length > 0 && <ul className="blog-ul blog-ul-nested">{subs}</ul>}
          </li>
        );
      }
      blocks.push(<ol key={key++} className="blog-ol">{items}</ol>);
      continue;
    }

    // Unordered list — collect consecutive list items
    if (line.startsWith('- ')) {
      const items: ReactNode[] = [];
      while (i < lines.length && lines[i].startsWith('- ')) {
        items.push(<li key={items.length}>{renderInline(lines[i].slice(2))}</li>);
        i++;
      }
      blocks.push(<ul key={key++} className="blog-ul">{items}</ul>);
      continue;
    }

    // Empty line
    if (line.trim() === '') { i++; continue; }

    // Paragraph — collect consecutive non-special lines
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].startsWith('#') &&
      !lines[i].startsWith('- ') &&
      !/^\d+\. /.test(lines[i]) &&
      !(lines[i].trim().startsWith('|') && i + 1 < lines.length && /^\s*\|?\s*:?-{3,}/.test(lines[i + 1])) &&
      !lines[i].startsWith('```') &&
      lines[i].trim() !== '---'
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length > 0) {
      blocks.push(<p key={key++} className="blog-p">{renderInline(paraLines.join(' '))}</p>);
    }
  }

  return blocks;
}
