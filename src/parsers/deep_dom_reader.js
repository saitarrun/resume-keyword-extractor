// Deep DOM & Shadow DOM / iFrame Piercing Reader with Auto-Expand Engine
// Programmatically expands truncated "Show More / Read More" containers across LinkedIn, Indeed, Glassdoor, and all ATS portals

class DeepDomReader {
  static autoExpandTruncatedContent(root = document.body) {
    if (!root) return;

    // 1. Click dedicated platform expand buttons
    const expandSelectors = [
      // LinkedIn
      '.jobs-description__footer-button',
      'button[aria-label*="Show more"]',
      'button[aria-label*="show more"]',
      '.show-more-less-html__button--more',
      '.jobs-description-content__footer button',
      // Indeed
      '#jobDescriptionSection button',
      '.jobsearch-JobComponent-description button',
      'button[data-testid="view-more-button"]',
      // Glassdoor
      '.JobDetails_showMore___ylQy',
      'button[data-test="show-more-button"]'
    ];

    for (const sel of expandSelectors) {
      try {
        const buttons = root.querySelectorAll(sel);
        buttons.forEach(btn => {
          if (btn && btn.tagName !== 'A' && !btn.hasAttribute('href') && typeof btn.click === 'function') {
            btn.click();
          }
        });
      } catch (_) {}
    }

    // 3. Remove CSS truncation clamps & line clamps
    try {
      const clampedElements = root.querySelectorAll('.show-more-less-html__markup--clamp-after-5, .jobs-description__content--condensed, [class*="clamp"], [class*="collapsed"]');
      clampedElements.forEach(el => {
        el.style.maxHeight = 'none';
        el.style.webkitLineClamp = 'unset';
        el.style.overflow = 'visible';
      });
    } catch (_) {}
  }

  static extractDeepText(root = document.body) {
    if (!root) return '';
    
    // Auto-expand any truncated sections before traversing
    this.autoExpandTruncatedContent(root);

    const textPieces = [];
    this.traverseNode(root, textPieces);
    const rawText = textPieces.join(' ');
    return this.normalizeText(rawText);
  }

  static traverseNode(node, textPieces) {
    if (!node) return;

    // Handle Shadow DOM if present
    if (node.shadowRoot) {
      this.traverseNode(node.shadowRoot, textPieces);
    }

    // Handle same-origin iframes
    if (node.tagName === 'IFRAME') {
      try {
        const iframeDoc = node.contentDocument || node.contentWindow?.document;
        if (iframeDoc && iframeDoc.body) {
          this.traverseNode(iframeDoc.body, textPieces);
        }
      } catch (_) {
        // Cross-origin iframe security restriction - ignore
      }
      return;
    }

    // Skip non-visible, script, style, SVG, or extension elements
    if (node.nodeType === Node.ELEMENT_NODE) {
      const tag = node.tagName.toUpperCase();
      if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'SVG', 'CANVAS', 'OBJECT', 'EMBED'].includes(tag)) {
        return;
      }
      if (node.classList && (node.classList.contains('jke-sidebar-container') || node.id === 'jke-picker-banner')) {
        return;
      }
    }

    // Capture text content of text nodes
    if (node.nodeType === Node.TEXT_NODE) {
      const val = node.nodeValue ? node.nodeValue.trim() : '';
      if (val.length > 0) {
        textPieces.push(val);
      }
      return;
    }

    // Recursively traverse children
    let child = node.firstChild;
    while (child) {
      this.traverseNode(child, textPieces);
      child = child.nextSibling;
    }
  }

  static normalizeText(text) {
    if (!text || typeof text !== 'string') return '';
    return text
      .replace(/\r\n/g, '\n')
      .replace(/https?:\/\/[^\s<>"')]+/gi, ' ') // Strip http:// and https:// URLs
      .replace(/www\.[^\s<>"')]+/gi, ' ')       // Strip www. links
      .replace(/mailto:[^\s<>"')]+/gi, ' ')     // Strip mailto links
      .replace(/[\u2018\u2019]/g, "'") // Smart single quotes / apostrophes
      .replace(/[\u201c\u201d]/g, '"') // Smart double quotes
      .replace(/\u00a0/g, ' ')         // Non-breaking space
      .replace(/[\u200B-\u200D\uFEFF]/g, '') // Zero-width spaces
      .replace(/[\u2013\u2014]/g, '-') // En-dash & em-dash
      .replace(/\s+/g, ' ')            // Normalize multiple whitespace to single space
      .trim();
  }
}

if (typeof window !== 'undefined') {
  window.DeepDomReader = DeepDomReader;
}
