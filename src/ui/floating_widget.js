// Unified Floating Widget Controller displaying all keywords in a single cohesive view

class FloatingWidget {
  constructor(jobData, extractionResult, highlighter, onRescanRequested, onPickElementRequested) {
    this.jobData = jobData;
    this.extractionResult = extractionResult;
    this.highlighter = highlighter;
    this.onRescanRequested = onRescanRequested;
    this.onPickElementRequested = onPickElementRequested;

    this.isMinimized = false;
    this.highlightsEnabled = true;
    this.container = null;
    this.render();
  }

  updateData(newJobData, newExtractionResult) {
    this.jobData = newJobData;
    this.extractionResult = newExtractionResult;
    this.render();
  }

  render() {
    if (document.getElementById('jke-floating-sidebar')) {
      document.getElementById('jke-floating-sidebar').remove();
    }

    this.container = document.createElement('div');
    this.container.id = 'jke-floating-sidebar';
    this.container.className = `jke-sidebar-container ${this.isMinimized ? 'jke-minimized' : ''}`;

    if (this.isMinimized) {
      this.container.innerHTML = `
        <div class="jke-toggle-badge" id="jke-btn-maximize" title="Open Job Keyword Extractor">
          <span>⚡</span>
          <span>${this.extractionResult.totalCount} Keywords Found</span>
        </div>
      `;
      document.body.appendChild(this.container);
      document.getElementById('jke-btn-maximize').addEventListener('click', () => {
        this.isMinimized = false;
        this.render();
      });
      return;
    }

    this.container.innerHTML = `
      <div class="jke-header">
        <div class="jke-header-title" title="${this.jobData.jobTitle} - ${this.jobData.company}">
          <span>⚡</span>
          <span>${this.jobData.jobTitle || 'Active Job'}</span>
        </div>
        <div class="jke-header-actions">
          <button class="jke-btn-icon" id="jke-btn-rescan" title="Re-Scan Active Job">🔄</button>
          <button class="jke-btn-icon" id="jke-btn-pick-element" title="Target Specific Job Text on Screen">🎯</button>
          <button class="jke-btn-icon" id="jke-btn-toggle-hl" title="${this.highlightsEnabled ? 'Disable Highlighting' : 'Enable Highlighting'}">
            ${this.highlightsEnabled ? '👁️' : '🚫'}
          </button>
          <button class="jke-btn-icon" id="jke-btn-minimize" title="Minimize">─</button>
          <button class="jke-btn-icon" id="jke-btn-close" title="Close">✕</button>
        </div>
      </div>

      <div class="jke-body">
        <div class="jke-stats-bar">
          <span>${this.jobData.company || this.jobData.platform}</span>
          <span style="font-weight: 700;">${this.extractionResult.totalCount} Keywords Detected</span>
        </div>

        <div class="jke-chips-container" id="jke-keywords-content">
          ${this.renderAllKeywords()}
        </div>

        <div class="jke-actions">
          <button class="jke-btn-primary" id="jke-copy-all">
            📋 Copy All Keywords
          </button>
          <button class="jke-btn-secondary" id="jke-copy-bullets" title="Copy as bullet list">
            Copy as Bullets
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(this.container);
    this.attachEventListeners();

    if (this.highlightsEnabled && this.jobData.containerElement) {
      this.highlighter.highlightKeywords(this.jobData.containerElement, this.extractionResult.allKeywords);
    } else if (this.jobData.containerElement) {
      this.highlighter.clearHighlights(this.jobData.containerElement);
    }
  }

  renderAllKeywords() {
    const keywords = this.extractionResult.allKeywords || [];
    if (keywords.length === 0) {
      return `<div style="text-align: center; color: #94a3b8; padding: 24px 0;">No keywords found. Click 🎯 to target a job description.</div>`;
    }

    return `
      <div class="jke-chips-wrap">
        ${keywords.map(k => `
          <span class="jke-chip" title="${k.term} (mentioned ${k.frequency}x)">
            ${k.term}
            <span class="jke-chip-count">${k.frequency}x</span>
          </span>
        `).join('')}
      </div>
    `;
  }

  attachEventListeners() {
    document.getElementById('jke-btn-minimize')?.addEventListener('click', () => {
      this.isMinimized = true;
      this.render();
    });

    document.getElementById('jke-btn-close')?.addEventListener('click', () => {
      if (this.jobData.containerElement) {
        this.highlighter.clearHighlights(this.jobData.containerElement);
      }
      this.container?.remove();
    });

    document.getElementById('jke-btn-rescan')?.addEventListener('click', () => {
      if (this.onRescanRequested) this.onRescanRequested();
    });

    document.getElementById('jke-btn-pick-element')?.addEventListener('click', () => {
      if (this.onPickElementRequested) this.onPickElementRequested();
    });

    document.getElementById('jke-btn-toggle-hl')?.addEventListener('click', () => {
      this.highlightsEnabled = !this.highlightsEnabled;
      this.render();
    });

    document.getElementById('jke-copy-all')?.addEventListener('click', () => {
      const allList = this.extractionResult.allKeywords.map(s => s.term).join(', ');
      navigator.clipboard.writeText(allList || 'None');
      alert(`Copied ${this.extractionResult.totalCount} keyword(s) to clipboard!`);
    });

    document.getElementById('jke-copy-bullets')?.addEventListener('click', () => {
      const bullets = this.extractionResult.allKeywords.map(s => `• ${s.term}`).join('\n');
      navigator.clipboard.writeText(bullets || 'None');
      alert(`Copied ${this.extractionResult.totalCount} keyword(s) as bullets!`);
    });
  }
}

if (typeof window !== 'undefined') {
  window.FloatingWidget = FloatingWidget;
}
