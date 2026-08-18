// High-Performance Aho-Corasick Multi-Pattern Search Automaton
// Enables linear O(N + M) search across thousands of keywords and aliases simultaneously.

class AhoCorasick {
  constructor() {
    this.root = this.createNode();
    this.isBuilt = false;
  }

  createNode() {
    return {
      children: new Map(),
      fail: null,
      outputs: [] // Array of matched objects/terms
    };
  }

  addPattern(pattern, data) {
    let node = this.root;
    const normalized = pattern.toLowerCase();

    for (let i = 0; i < normalized.length; i++) {
      const char = normalized[i];
      if (!node.children.has(char)) {
        node.children.set(char, this.createNode());
      }
      node = node.children.get(char);
    }

    node.outputs.push({
      term: data.term,
      canonical: data.canonical || data.term,
      category: data.category,
      pattern: pattern,
      importance: data.importance || 'standard',
      meta: data
    });
  }

  buildFailureLinks() {
    const queue = [];

    // Initialize root's direct children
    for (const [char, childNode] of this.root.children.entries()) {
      childNode.fail = this.root;
      queue.push(childNode);
    }

    // BFS to build failure links & collect outputs
    while (queue.length > 0) {
      const currentNode = queue.shift();

      for (const [char, childNode] of currentNode.children.entries()) {
        let failNode = currentNode.fail;

        while (failNode !== null && !failNode.children.has(char)) {
          failNode = failNode.fail;
        }

        childNode.fail = failNode !== null ? failNode.children.get(char) : this.root;

        // Collect outputs from failure node
        if (childNode.fail && childNode.fail.outputs.length > 0) {
          childNode.outputs = childNode.outputs.concat(childNode.fail.outputs);
        }

        queue.push(childNode);
      }
    }

    this.isBuilt = true;
  }

  // Search text with word boundary & punctuation awareness
  search(text) {
    if (!this.isBuilt) {
      this.buildFailureLinks();
    }

    const results = [];
    let currentNode = this.root;
    const lowerText = text.toLowerCase();
    const len = text.length;

    for (let i = 0; i < len; i++) {
      const char = lowerText[i];

      while (currentNode !== null && !currentNode.children.has(char)) {
        currentNode = currentNode.fail;
      }

      if (currentNode === null) {
        currentNode = this.root;
        continue;
      }

      currentNode = currentNode.children.get(char);

      if (currentNode.outputs.length > 0) {
        for (const output of currentNode.outputs) {
          const matchStart = i - output.pattern.length + 1;
          const matchEnd = i + 1;

          // Validate word boundary (allowing symbols like +, #, ., -, /)
          if (this.isValidWordBoundary(lowerText, matchStart, matchEnd, output.pattern)) {
            results.push({
              term: output.term,
              canonical: output.canonical,
              category: output.category,
              importance: output.importance,
              pattern: output.pattern,
              start: matchStart,
              end: matchEnd,
              matchedText: text.substring(matchStart, matchEnd),
              meta: output.meta
            });
          }
        }
      }
    }

    return this.deduplicateOverlaps(results);
  }

  isValidWordBoundary(text, start, end, pattern) {
    const isSpecialCharPattern = /[+#.-]/.test(pattern);

    // Check character before start
    if (start > 0) {
      const prevChar = text[start - 1];
      if (isSpecialCharPattern) {
        if (/[a-zA-Z0-9]/.test(prevChar)) return false;
      } else {
        if (/[a-zA-Z0-9_]/.test(prevChar)) return false;
      }
    }

    // Check character after end
    if (end < text.length) {
      const nextChar = text[end];
      if (isSpecialCharPattern) {
        if (/[a-zA-Z0-9]/.test(nextChar)) return false;
      } else {
        if (/[a-zA-Z0-9_]/.test(nextChar)) return false;
      }
    }

    return true;
  }

  deduplicateOverlaps(matches) {
    if (matches.length <= 1) return matches;

    // Sort primarily by match length descending, then by position
    matches.sort((a, b) => (b.end - b.start) - (a.end - a.start) || a.start - b.start);

    const filtered = [];
    const occupied = new Array(Math.max(...matches.map(m => m.end)) + 1).fill(false);

    for (const match of matches) {
      let isOverlapping = false;
      for (let i = match.start; i < match.end; i++) {
        if (occupied[i]) {
          isOverlapping = true;
          break;
        }
      }

      if (!isOverlapping) {
        filtered.push(match);
        for (let i = match.start; i < match.end; i++) {
          occupied[i] = true;
        }
      }
    }

    return filtered.sort((a, b) => a.start - b.start);
  }
}

if (typeof window !== 'undefined') {
  window.AhoCorasick = AhoCorasick;
}
