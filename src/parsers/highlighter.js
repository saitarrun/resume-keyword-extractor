// In-Page DOM Keyword Highlighter with Smooth Jump-to-Keyword and Pulse Animation

class DomHighlighter {
  constructor() {
    this.highlightClass = 'jke-highlighted-keyword';
  }

  clearHighlights(root = document.body) {
    if (!root) return;
    const marks = root.querySelectorAll(`.${this.highlightClass}`);
    marks.forEach(mark => {
      const parent = mark.parentNode;
      if (parent) {
        while (mark.firstChild) {
          parent.insertBefore(mark.firstChild, mark);
        }
        parent.removeChild(mark);
        parent.normalize();
      }
    });
  }

  highlightKeywords(root = document.body, keywords = []) {
    if (!root || !keywords || keywords.length === 0) return;
    this.clearHighlights(root);

    // Build alias lookup set
    const allPhrases = [];
    keywords.forEach(k => {
      allPhrases.push(k.term);
      if (k.aliases && Array.isArray(k.aliases)) {
        k.aliases.forEach(a => allPhrases.push(a));
      }
    });

    // Clean and sort longest-first
    const uniquePhrases = Array.from(new Set(allPhrases.map(p => p.trim()))).filter(p => p.length >= 2);
    uniquePhrases.sort((a, b) => b.length - a.length);

    if (uniquePhrases.length === 0) return;

    const escaped = uniquePhrases.map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    const regex = new RegExp(`(?<![a-zA-Z0-9])(${escaped})(?![a-zA-Z0-9])`, 'gi');

    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          const parent = node.parentNode;
          if (!parent) return NodeFilter.FILTER_REJECT;
          const tag = parent.tagName;
          if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'INPUT', 'MARK', 'CODE', 'SVG', 'BUTTON'].includes(tag)) {
            return NodeFilter.FILTER_REJECT;
          }
          if (parent.closest && (
            parent.closest('.jke-sidebar-container') ||
            parent.closest('#jke-picker-banner') ||
            parent.closest('.jobs-search-results-list') ||
            parent.closest('.scaffold-layout__list') ||
            parent.closest('.jobs-search-two-pane__job-section') ||
            parent.closest('[data-view-name="job-card"]') ||
            parent.closest('.job-card-container') ||
            parent.closest('.jobs-premium-applicant-insights') ||
            parent.closest('.jobs-applicant-insights') ||
            parent.closest('#msg-overlay') ||
            parent.closest('header') ||
            parent.closest('nav') ||
            parent.closest('footer')
          )) {
            return NodeFilter.FILTER_REJECT;
          }
          regex.lastIndex = 0;
          return regex.test(node.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
        }
      }
    );

    const textNodes = [];
    while (walker.nextNode()) {
      textNodes.push(walker.currentNode);
    }

    for (const node of textNodes) {
      this.processTextNode(node, regex);
    }
  }

  processTextNode(node, regex) {
    const text = node.nodeValue;
    if (!text) return;
    regex.lastIndex = 0;

    const fragment = document.createDocumentFragment();
    let lastIdx = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      const matchText = match[1];
      const matchStart = match.index;
      const matchEnd = matchStart + matchText.length;

      if (matchStart > lastIdx) {
        fragment.appendChild(document.createTextNode(text.substring(lastIdx, matchStart)));
      }

      const mark = document.createElement('mark');
      mark.className = this.highlightClass;
      mark.dataset.jkeKeyword = matchText.toLowerCase();
      mark.textContent = matchText;
      mark.title = `Extracted Keyword: ${matchText} (Click to jump)`;

      fragment.appendChild(mark);
      lastIdx = matchEnd;
    }

    if (lastIdx < text.length) {
      fragment.appendChild(document.createTextNode(text.substring(lastIdx)));
    }

    if (node.parentNode) {
      node.parentNode.replaceChild(fragment, node);
    }
  }

  // Smooth scroll directly to the highlighted keyword on the webpage and pulse it
  scrollToKeyword(term) {
    if (!term) return false;
    const lowerTerm = term.toLowerCase().trim();
    const marks = document.querySelectorAll(`.${this.highlightClass}`);

    for (const mark of marks) {
      const text = mark.textContent.toLowerCase().trim();
      if (text === lowerTerm || lowerTerm.includes(text) || text.includes(lowerTerm)) {
        mark.scrollIntoView({ behavior: 'smooth', block: 'center' });
        mark.classList.remove('jke-pulse');
        // Trigger reflow to restart animation
        void mark.offsetWidth;
        mark.classList.add('jke-pulse');
        setTimeout(() => mark.classList.remove('jke-pulse'), 2500);
        return true;
      }
    }
    return false;
  }
}

if (typeof window !== 'undefined') {
  window.DomHighlighter = DomHighlighter;
}
