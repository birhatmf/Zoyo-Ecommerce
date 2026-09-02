import "server-only";

import sanitizeHtml from "sanitize-html";

// Admin'in düzenlediği zengin içerik güvenli biçimde render edilir (PRD §40).
export function sanitizeCmsContent(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      "p", "br", "strong", "em", "u", "s",
      "h2", "h3", "h4",
      "ul", "ol", "li",
      "a", "blockquote",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
    },
    allowedSchemes: ["http", "https", "mailto"],
  });
}
