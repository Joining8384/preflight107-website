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
// Handles headings, code fences, lists, horizontal rules, and paragraphs.
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
