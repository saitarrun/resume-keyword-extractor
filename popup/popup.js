// Advanced Minimalist Popup Controller with Polished UX, Toast Feedback, and Item Management

document.addEventListener('DOMContentLoaded', async () => {
  let customKeywords = [];
  let extractionResult = {
    allKeywords: [],
    requiredKeywords: [],
    preferredKeywords: [],
    otherKeywords: [],
    totalCount: 0,
    requiredCount: 0,
    preferredCount: 0,
    otherCount: 0
  };
  let currentScope = 'all'; // 'all' | 'required' | 'preferred' | 'other'
  let isExpanded = false;
  let highlightsActive = true;
  const INITIAL_VISIBLE_COUNT = 6;

  // Initialize AIService
  const aiService = typeof AIService !== 'undefined' ? new AIService() : (typeof window !== 'undefined' && window.AIService ? new window.AIService() : null);
  if (aiService && typeof aiService.init === 'function') {
    await aiService.init();
  }

  // Load custom user keywords from chrome storage
  try {
    const stored = await chrome.storage.local.get(['jke_custom_keywords']);
    if (stored && Array.isArray(stored.jke_custom_keywords)) {
      customKeywords = stored.jke_custom_keywords;
    }
  } catch (_) {}

  const extractor = new KeywordExtractor(window.SKILL_DICTIONARY || [], customKeywords);

  async function getActiveTab() {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) {
      const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
      tab = tabs[0];
    }
    return tab;
  }

  function showToast(msg = 'Copied to clipboard!') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
  }

  async function scanActiveTab() {
    const jobTitleEl = document.getElementById('job-title');
    const jobCompanyEl = document.getElementById('job-company');
    const listContainer = document.getElementById('skills-list');
    const showMoreWrap = document.getElementById('show-more-wrap');

    jobTitleEl.textContent = 'Scanning active page...';
    jobCompanyEl.textContent = 'Extracting requirements & skills...';
    listContainer.innerHTML = `
      <div class="empty-state">
        <div class="spinner"></div>
        <span>Analyzing job description...</span>
      </div>
    `;
    showMoreWrap.style.display = 'none';

    try {
      const tab = await getActiveTab();

      if (!tab || !tab.id) {
        showEmptyState('No active webpage detected.');
        return;
      }

      if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('edge://') || tab.url.startsWith('about:') || tab.url.startsWith('chrome-extension://')) {
        showEmptyState('Please open a job posting webpage in Chrome to scan keywords.');
        return;
      }

      // Inject highlight styles directly into the tab
      try {
        await chrome.scripting.insertCSS({
          target: { tabId: tab.id },
          files: ['src/ui/floating_widget.css']
        });
      } catch (_) {}

      // Deep DOM + Auto-Expand + Dedicated Platform Extraction
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          // 1. Programmatically auto-expand truncated descriptions safely without clicking external/profile links
          function autoExpandTruncatedContent() {
            // Find the job description container first
            const descContainer = document.querySelector(
              '#job-details, .jobs-description-content__text, .jobs-box__html-content, .jobs-description__container, .show-more-less-html__markup, #jobDescriptionText, .jobsearch-JobComponent-description, .JobDetails_jobDescription__uW_fK, .iCIMS_JobContent, ._description_10l3e_43, .posting-sections, #content'
            ) || document.body;

            const safeButtonSelectors = [
              '.jobs-description__footer-button',
              'button[aria-label*="Show more"]',
              'button[aria-label*="show more"]',
              '.show-more-less-html__button--more',
              '.jobs-description-content__footer button',
              '#jobDescriptionSection button',
              '.jobsearch-JobComponent-description button',
              'button[data-testid="view-more-button"]',
              '.JobDetails_showMore___ylQy',
              'button[data-test="show-more-button"]'
            ];

            for (const sel of safeButtonSelectors) {
              try {
                const buttons = descContainer.querySelectorAll(sel);
                buttons.forEach(btn => {
                  // Guard: NEVER click anchor links (<a>) or elements with hrefs
                  if (btn && btn.tagName !== 'A' && !btn.hasAttribute('href') && typeof btn.click === 'function') {
                    btn.click();
                  }
                });
              } catch (_) {}
            }

            // Remove CSS line clamps directly
            try {
              const clampedElements = descContainer.querySelectorAll('.show-more-less-html__markup--clamp-after-5, .jobs-description__content--condensed, [class*="clamp"], [class*="collapsed"]');
              clampedElements.forEach(el => {
                el.style.maxHeight = 'none';
                el.style.webkitLineClamp = 'unset';
                el.style.overflow = 'visible';
              });
            } catch (_) {}
          }

          autoExpandTruncatedContent();

          // 2. Deep DOM traversal
          // 2. Deep DOM traversal with strict noise exclusions
          function extractDeepText(root = document.body) {
            if (!root) return '';
            const textPieces = [];

            const EXCLUDED_SELECTORS = [
              // Left-hand job recommendation/search list cards (Other applications)
              '.jobs-search-results-list',
              '.scaffold-layout__list',
              '.jobs-search-two-pane__job-section',
              '.jobs-search-results-list__list',
              '[data-view-name="job-card"]',
              '.job-card-container',
              '.jobs-search-results',
              '.jobs-search-results-list__list-item',
              '.jobs-search-box',
              '.jobs-search-results-list__header',
              // Applicant statistics & candidate insights
              '.jobs-premium-applicant-insights',
              '.jobs-premium-applicant-insights__education',
              '.jobs-unified-top-card__applicant-count',
              '.jobs-applicant-insights',
              // Messaging, headers, sidebars & navigation
              '.global-nav', '#global-nav', 'header', 'nav', 'footer', 'aside',
              '#msg-overlay', '.msg-overlay', '.msg-overlay-list-bubble', '.feed-shared-update-v2',
              '.jke-sidebar-container', '#jke-picker-banner'
            ];

            function isExcluded(node) {
              if (!node) return false;
              const el = (node.nodeType === Node.ELEMENT_NODE) ? node : node.parentElement;
              if (!el) return false;

              for (const sel of EXCLUDED_SELECTORS) {
                if (el.matches && el.matches(sel)) return true;
                if (el.closest && el.closest(sel)) return true;
              }
              return false;
            }

            function traverse(node) {
              if (!node) return;
              if (isExcluded(node)) return;

              if (node.shadowRoot) traverse(node.shadowRoot);
              if (node.tagName === 'IFRAME') {
                try {
                  const doc = node.contentDocument || node.contentWindow?.document;
                  if (doc && doc.body) traverse(doc.body);
                } catch (_) {}
                return;
              }
              if (node.nodeType === Node.ELEMENT_NODE) {
                const tag = node.tagName.toUpperCase();
                if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'SVG', 'CANVAS', 'OBJECT', 'BUTTON', 'FORM', 'INPUT'].includes(tag)) return;
              }
              if (node.nodeType === Node.TEXT_NODE) {
                const val = node.nodeValue ? node.nodeValue.trim() : '';
                if (val.length > 0) textPieces.push(val);
                return;
              }
              let child = node.firstChild;
              while (child) {
                traverse(child);
                child = child.nextSibling;
              }
            }
            traverse(root);
            return textPieces.join(' ');
          }

          // Dedicated active job description selectors (Ordered strictly by specificity)
          const platformSelectors = [
            // LinkedIn exact active description pane
            '.jobs-search__job-details #job-details',
            '.scaffold-layout__detail #job-details',
            '.jobs-description-content__text',
            '#job-details',
            '.jobs-box__html-content',
            '.jobs-description__container',
            '.show-more-less-html__markup',
            '.jobs-search__job-details--container #job-details',
            // Indeed
            '#jobDescriptionText',
            '.jobsearch-jobDescriptionText',
            '.jobsearch-JobComponent-description',
            '#jobDescriptionSection',
            // Greenhouse / Lever / Workday
            '#content', '#job-body', '.posting-sections', '[data-automation-id="jobPostingDescription"]',
            // YC / Startup / Wellfound
            '.job-description', '.job-details', '.company-description', '[data-test="job-description"]', '[data-test="JobDescription"]',
            // iCIMS
            '.iCIMS_JobContent', '.iCIMS_JobDescription', '#iCIMS_JobContent', '.iCIMS_JobData',
            // Ashby
            '._description_10l3e_43', '._jobPostingDescription_10l3e_1', '[data-testid="job-description"]',
            // SmartRecruiters / Glassdoor / Dice / ZipRecruiter / BambooHR / Rippling / Taleo
            '.job-sections', '.job-detail__description', '.JobDetails_jobDescription__uW_fK', '#JobDescriptionContainer', '#jobDescription', '.job_description', '.jss-job-description', '.pos-description', '.job-posting-body', '.editcontentfield', '.contentpane'
          ];

          let text = '';
          let title = '';
          let company = '';

          // Exact active Job Title selectors
          const titleSelectors = [
            '.job-details-jobs-unified-top-card__job-title',
            '.jobs-unified-top-card__job-title',
            '.jobs-search__job-details--container h1',
            'h1.jobsearch-JobInfoHeader-title',
            '[data-testid="simpler-jobTitle"]',
            'h1.company-title', 'h1.job-title', '.job-name h1',
            '.iCIMS_Header h1', '.iCIMS_JobTitle',
            '[data-testid="job-title"]',
            '.app-title', '.posting-headline h2', '[data-automation-id="jobPostingHeader"]',
            'h1'
          ];

          for (const sel of titleSelectors) {
            const el = document.querySelector(sel);
            if (el && el.innerText && el.innerText.trim()) {
              title = el.innerText.trim();
              break;
            }
          }

          // Exact active Company selectors
          const companySelectors = [
            '.job-details-jobs-unified-top-card__company-name',
            '.jobs-unified-top-card__company-name',
            '.jobs-details-top-card__company-url',
            '[data-testid="inlineHeader-companyName"]',
            '.company-name', '.company-details h2',
            '.iCIMS_CompanyHeader', '._companyName_10l3e_13',
            '.main-header-logo', '[data-automation-id="companyName"]'
          ];

          for (const sel of companySelectors) {
            const el = document.querySelector(sel);
            if (el && el.innerText && el.innerText.trim()) {
              company = el.innerText.trim();
              break;
            }
          }

          // Try dedicated active job description pane
          for (const sel of platformSelectors) {
            const el = document.querySelector(sel);
            if (el && el.innerText && el.innerText.trim().length > 50) {
              text = extractDeepText(el);
              if (text.length > 50) break;
            }
          }

          // Fallback: search-restricted root
          if (!text || text.length < 50) {
            const mainContent = document.querySelector('.jobs-search__job-details, .scaffold-layout__detail, main, article') || document.body;
            text = extractDeepText(mainContent);
          }

          if (!title && text) {
            const match = text.match(/(?:Job Title|Position Title|Position|Role)\s*:\s*([^\n\r]+)/i);
            if (match && match[1]) title = match[1].trim();
            else title = document.title.split(/[-|•–]/)[0].trim() || 'Job Posting';
          }

          if (!company && text) {
            const match = text.match(/(?:Location|Company|Employer)\s*:\s*([^\n\r,]+)/i);
            if (match && match[1]) company = match[1].trim();
            else {
              try {
                const host = window.location.hostname.replace('www.', '').split('.')[0];
                company = host.charAt(0).toUpperCase() + host.slice(1);
              } catch (_) {
                company = '';
              }
            }
          }

          return { text: text || '', title: title || 'Job Posting', company: company || '' };
        }
      });

      if (!results || !results[0] || !results[0].result) {
        showEmptyState('Could not read page text. Please refresh the page.');
        return;
      }

      const pageData = results[0].result;
      if (!pageData.text || pageData.text.trim().length === 0) {
        showEmptyState('Page text is empty or still loading. Please refresh.');
        return;
      }

      extractor.setCustomKeywords(customKeywords);
      extractionResult = extractor.extract(pageData.text);

      jobTitleEl.textContent = pageData.title || 'Job Posting';
      jobCompanyEl.textContent = pageData.company || 'Job Post';

      // Update badge counts across all 4 tabs
      updateBadgeCounts();
      renderCurrentScopeList();

      // Highlight keywords directly on the live webpage
      if (extractionResult.allKeywords.length > 0 && highlightsActive) {
        applyInPageHighlights(tab.id, extractionResult.allKeywords);
      }

      // Background AI Semantic Enrichment (Implied Architectures & Deep Stack Deduction)
      if (aiService && aiService.isEnabled) {
        aiService.extractSemanticSkills(pageData.text).then(aiData => {
          if (aiData) {
            mergeAIRefinements(aiData, tab.id);
          }
        }).catch(err => console.warn('AI semantic note:', err));
      }

    } catch (err) {
      console.error('Scan error:', err);
      showEmptyState('Please refresh the page and try again.');
    }
  }

  function mergeAIRefinements(aiData, tabId) {
    if (!aiData) return;
    const existingTerms = new Set(extractionResult.allKeywords.map(k => k.term.toLowerCase()));
    let newItemsAdded = false;

    // 1. Merge Implied Skills (e.g. Distributed Systems, Kafka from high-throughput log contexts)
    if (Array.isArray(aiData.impliedSkills)) {
      aiData.impliedSkills.forEach(skill => {
        if (!skill || typeof skill !== 'string') return;
        const lower = skill.toLowerCase().trim();
        if (!existingTerms.has(lower) && (!extractor.learner || !extractor.learner.isBlocked(skill))) {
          existingTerms.add(lower);
          const item = {
            term: skill.trim(),
            canonicalTerm: skill.trim(),
            type: 'Technical',
            section: 'other',
            isAIImplied: true,
            frequency: 1
          };
          extractionResult.allKeywords.push(item);
          extractionResult.otherKeywords.push(item);
          newItemsAdded = true;
        }
      });
    }

    // 2. Merge Required & Preferred Skills found by AI
    if (Array.isArray(aiData.requiredSkills)) {
      aiData.requiredSkills.forEach(skill => {
        if (!skill || typeof skill !== 'string') return;
        const lower = skill.toLowerCase().trim();
        if (!existingTerms.has(lower) && (!extractor.learner || !extractor.learner.isBlocked(skill))) {
          existingTerms.add(lower);
          const item = {
            term: skill.trim(),
            canonicalTerm: skill.trim(),
            type: 'Technical',
            section: 'required',
            inRequired: true,
            isAISemantic: true,
            frequency: 1
          };
          extractionResult.allKeywords.push(item);
          extractionResult.requiredKeywords.push(item);
          newItemsAdded = true;
        }
      });
    }

    if (Array.isArray(aiData.preferredSkills)) {
      aiData.preferredSkills.forEach(skill => {
        if (!skill || typeof skill !== 'string') return;
        const lower = skill.toLowerCase().trim();
        if (!existingTerms.has(lower) && (!extractor.learner || !extractor.learner.isBlocked(skill))) {
          existingTerms.add(lower);
          const item = {
            term: skill.trim(),
            canonicalTerm: skill.trim(),
            type: 'Technical',
            section: 'preferred',
            inPreferred: true,
            isAISemantic: true,
            frequency: 1
          };
          extractionResult.allKeywords.push(item);
          extractionResult.preferredKeywords.push(item);
          newItemsAdded = true;
        }
      });
    }

    if (newItemsAdded) {
      updateBadgeCounts();
      renderCurrentScopeList();
      if (highlightsActive && tabId) {
        applyInPageHighlights(tabId, extractionResult.allKeywords);
      }
    }
  }

  function updateBadgeCounts() {
    document.getElementById('tab-count-all').textContent = extractionResult.allKeywords?.length || 0;
    document.getElementById('tab-count-required').textContent = extractionResult.requiredKeywords?.length || 0;
    document.getElementById('tab-count-preferred').textContent = extractionResult.preferredKeywords?.length || 0;
    document.getElementById('tab-count-other').textContent = extractionResult.otherKeywords?.length || 0;
  }

  function getVisibleKeywords() {
    if (currentScope === 'required') return extractionResult.requiredKeywords || [];
    if (currentScope === 'preferred') return extractionResult.preferredKeywords || [];
    if (currentScope === 'other') return extractionResult.otherKeywords || [];
    return extractionResult.allKeywords || [];
  }

  function renderCurrentScopeList() {
    const list = getVisibleKeywords();
    const searchVal = document.getElementById('search-input')?.value.toLowerCase().trim();
    const filtered = searchVal ? list.filter(k => k.term.toLowerCase().includes(searchVal)) : list;
    
    renderSkillsList(filtered);
  }

  function renderSkillsList(keywords) {
    const container = document.getElementById('skills-list');
    const showMoreWrap = document.getElementById('show-more-wrap');
    const showMoreBtn = document.getElementById('btn-show-more');
    const showMoreLabel = document.getElementById('show-more-label');
    container.innerHTML = '';

    if (!keywords || keywords.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <span>No matching keywords in this scope.</span>
        </div>
      `;
      showMoreWrap.style.display = 'none';
      return;
    }

    const totalCount = keywords.length;
    const shouldShowToggle = totalCount > INITIAL_VISIBLE_COUNT;
    const displayList = (shouldShowToggle && !isExpanded) ? keywords.slice(0, INITIAL_VISIBLE_COUNT) : keywords;

    container.innerHTML = displayList.map(k => {
      let scopeBadgeHtml = '';
      if (k.isAIImplied) {
        scopeBadgeHtml = '<span class="tag-scope tag-ai">✨ AI Implied</span>';
      } else if (k.isLearned) {
        scopeBadgeHtml = '<span class="tag-scope tag-learned">✨ Learned</span>';
      } else if (k.section === 'required' || k.inRequired) {
        scopeBadgeHtml = '<span class="tag-scope tag-req">Required</span>';
      } else if (k.section === 'preferred' || k.inPreferred) {
        scopeBadgeHtml = '<span class="tag-scope tag-pref">Preferred</span>';
      } else {
        scopeBadgeHtml = '<span class="tag-scope tag-oth">Other</span>';
      }

      return `
        <div class="skill-row" data-term="${k.term}" title="Click to scroll to '${k.term}' on page">
          <div class="skill-left-wrap">
            <div class="check-icon-circle">
              <svg viewBox="0 0 12 12">
                <path d="M2.5 6l2.5 2.5 4.5-4.5"/>
              </svg>
            </div>
            <span class="skill-title-text">${k.term}</span>
          </div>
          <div class="skill-badges-wrap">
            ${scopeBadgeHtml}
            <span class="tag-freq">${k.frequency}x</span>
            <button class="btn-remove-item" data-term="${k.term}" title="Dismiss & block keyword">✕</button>
          </div>
        </div>
      `;
    }).join('');

    // Toggle button visibility & label
    if (shouldShowToggle) {
      showMoreWrap.style.display = 'block';
      showMoreLabel.textContent = isExpanded ? 'show less' : `show more (${totalCount - INITIAL_VISIBLE_COUNT} more)`;
      if (isExpanded) showMoreBtn.classList.add('expanded');
      else showMoreBtn.classList.remove('expanded');
    } else {
      showMoreWrap.style.display = 'none';
    }

    // Scroll to keyword on click
    container.querySelectorAll('.skill-row').forEach(row => {
      row.addEventListener('click', async (e) => {
        if (e.target.closest('.btn-remove-item')) return; // Ignore if clicked dismiss

        const term = row.dataset.term;
        const tab = await getActiveTab();
        if (tab?.id) {
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            args: [term],
            func: (targetTerm) => {
              const lowerTerm = targetTerm.toLowerCase().trim();
              const marks = document.querySelectorAll('.jke-highlighted-keyword');
              for (const mark of marks) {
                const text = mark.textContent.toLowerCase().trim();
                if (text === lowerTerm || lowerTerm.includes(text) || text.includes(lowerTerm)) {
                  mark.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  mark.classList.remove('jke-pulse');
                  void mark.offsetWidth;
                  mark.classList.add('jke-pulse');
                  setTimeout(() => mark.classList.remove('jke-pulse'), 2500);
                  break;
                }
              }
            }
          });
        }
      });
    });

    // Dismiss keyword on click of '✕' (Adaptive Negative Reinforcement)
    container.querySelectorAll('.btn-remove-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const term = btn.dataset.term;
        if (extractor.learner && typeof extractor.learner.blockKeyword === 'function') {
          extractor.learner.blockKeyword(term);
        }
        extractionResult.allKeywords = extractionResult.allKeywords.filter(k => k.term !== term);
        extractionResult.requiredKeywords = extractionResult.requiredKeywords.filter(k => k.term !== term);
        extractionResult.preferredKeywords = extractionResult.preferredKeywords.filter(k => k.term !== term);
        extractionResult.otherKeywords = extractionResult.otherKeywords.filter(k => k.term !== term);
        updateBadgeCounts();
        renderCurrentScopeList();
        showToast(`Learned: "${term}" will be suppressed`);
      });
    });
  }

  // Show More / Show Less Click Listener
  document.getElementById('btn-show-more')?.addEventListener('click', (e) => {
    e.preventDefault();
    isExpanded = !isExpanded;
    renderCurrentScopeList();
  });

  function showEmptyState(msg) {
    document.getElementById('job-title').textContent = 'No keywords detected';
    document.getElementById('job-company').textContent = 'Open a job post in Chrome to scan';
    document.getElementById('tab-count-all').textContent = '0';
    document.getElementById('tab-count-required').textContent = '0';
    document.getElementById('tab-count-preferred').textContent = '0';
    document.getElementById('tab-count-other').textContent = '0';
    document.getElementById('skills-list').innerHTML = `
      <div class="empty-state">
        <span>${msg || 'Could not detect keywords on this page.'}</span>
      </div>
    `;
    document.getElementById('show-more-wrap').style.display = 'none';
  }

  // Scope Tab Navigation (All, Required, Preferred, Other)
  document.querySelectorAll('.scope-btn').forEach(tabBtn => {
    tabBtn.addEventListener('click', () => {
      document.querySelectorAll('.scope-btn').forEach(b => b.classList.remove('active'));
      tabBtn.classList.add('active');
      currentScope = tabBtn.dataset.scope;
      isExpanded = false; // reset expansion when switching tabs
      renderCurrentScopeList();
    });
  });

  // Search Filter & Clear Button
  const searchInput = document.getElementById('search-input');
  const clearSearchBtn = document.getElementById('btn-clear-search');

  searchInput?.addEventListener('input', () => {
    const val = searchInput.value.trim();
    if (clearSearchBtn) clearSearchBtn.style.display = val ? 'block' : 'none';
    isExpanded = true; // automatically expand full results when filtering
    renderCurrentScopeList();
  });

  clearSearchBtn?.addEventListener('click', () => {
    if (searchInput) searchInput.value = '';
    clearSearchBtn.style.display = 'none';
    renderCurrentScopeList();
  });

  // Add Custom Keyword
  document.getElementById('btn-add-custom-kw')?.addEventListener('click', async () => {
    const input = document.getElementById('custom-kw-input');
    const term = input.value.trim();
    if (!term) return;

    if (!customKeywords.some(c => c.term.toLowerCase() === term.toLowerCase())) {
      customKeywords.push({ term, aliases: [term] });
      try {
        await chrome.storage.local.set({ jke_custom_keywords: customKeywords });
      } catch (_) {}
    }

    input.value = '';
    showToast(`Added custom keyword: "${term}"`);
    scanActiveTab();
  });

  // Safe In-Page Highlighting
  async function applyInPageHighlights(tabId, keywords) {
    if (!keywords || keywords.length === 0) return;
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tabId },
        args: [keywords],
        func: (kwList) => {
          const highlightClass = 'jke-highlighted-keyword';

          document.querySelectorAll('.' + highlightClass).forEach(mark => {
            const parent = mark.parentNode;
            if (parent) {
              while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
              parent.removeChild(mark);
              parent.normalize();
            }
          });

          const allPhrases = [];
          kwList.forEach(k => {
            allPhrases.push(k.term);
            if (k.aliases && Array.isArray(k.aliases)) {
              k.aliases.forEach(a => allPhrases.push(a));
            }
          });

          const uniquePhrases = Array.from(new Set(allPhrases.map(p => p.trim()))).filter(p => p.length >= 2);
          uniquePhrases.sort((a, b) => b.length - a.length);

          if (uniquePhrases.length === 0) return;

          const escaped = uniquePhrases.map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
          const regex = new RegExp(`(?<![a-zA-Z0-9])(${escaped})(?![a-zA-Z0-9])`, 'gi');

          // Locate active job description container strictly to prevent polluting sidebars/search lists
          const targetContainer = document.querySelector(
            '.jobs-search__job-details #job-details, .scaffold-layout__detail #job-details, .scaffold-layout__detail, .jobs-search__job-details, #job-details, .jobs-description-content__text, .jobs-box__html-content, .jobs-description__container, .show-more-less-html__markup, #jobDescriptionText, .jobsearch-jobDescriptionText, .jobsearch-JobComponent-description, #jobDescriptionSection, .iCIMS_JobContent, ._description_10l3e_43, .posting-sections, #content, #job-body, .job-sections, .JobDetails_jobDescription__uW_fK, #JobDescriptionContainer, #jobDescription, .job_description, .jss-job-description, .pos-description, .job-posting-body'
          ) || document.querySelector('main, article') || document.body;

          const EXCLUDED_SELECTORS = [
            // Left-hand job recommendation/search list cards (Other applications)
            '.jobs-search-results-list',
            '.scaffold-layout__list',
            '.jobs-search-two-pane__job-section',
            '.jobs-search-results-list__list',
            '[data-view-name="job-card"]',
            '.job-card-container',
            '.jobs-search-results',
            '.jobs-search-results-list__list-item',
            '.jobs-search-box',
            '.jobs-search-results-list__header',
            // Applicant statistics & candidate insights
            '.jobs-premium-applicant-insights',
            '.jobs-premium-applicant-insights__education',
            '.jobs-unified-top-card__applicant-count',
            '.jobs-applicant-insights',
            // Messaging, headers, sidebars & navigation
            '.global-nav', '#global-nav', 'header', 'nav', 'footer', 'aside',
            '#msg-overlay', '.msg-overlay', '.msg-overlay-list-bubble', '.feed-shared-update-v2',
            '.jke-sidebar-container', '#jke-picker-banner'
          ];

          function isExcluded(node) {
            if (!node) return false;
            const el = (node.nodeType === Node.ELEMENT_NODE) ? node : node.parentElement;
            if (!el) return false;

            for (const sel of EXCLUDED_SELECTORS) {
              if (el.matches && el.matches(sel)) return true;
              if (el.closest && el.closest(sel)) return true;
            }
            return false;
          }

          const walker = document.createTreeWalker(
            targetContainer,
            NodeFilter.SHOW_TEXT,
            {
              acceptNode: (node) => {
                const parent = node.parentNode;
                if (!parent) return NodeFilter.FILTER_REJECT;
                if (isExcluded(parent)) return NodeFilter.FILTER_REJECT;
                const tag = parent.tagName;
                if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'INPUT', 'MARK', 'CODE', 'SVG', 'BUTTON'].includes(tag)) {
                  return NodeFilter.FILTER_REJECT;
                }
                regex.lastIndex = 0;
                return regex.test(node.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
              }
            }
          );

          const textNodes = [];
          while (walker.nextNode()) textNodes.push(walker.currentNode);

          for (const node of textNodes) {
            const text = node.nodeValue;
            if (!text) continue;
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
              mark.className = highlightClass;
              mark.textContent = matchText;
              mark.title = `Extracted Keyword: ${matchText}`;

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
        }
      });
    } catch (err) {
      console.warn('Highlight note:', err);
    }
  }

  // Re-scan Button
  document.getElementById('btn-rescan')?.addEventListener('click', () => {
    showToast('Re-scanning page...');
    scanActiveTab();
  });

  // Toggle Highlights Button
  document.getElementById('btn-toggle-hl')?.addEventListener('click', async () => {
    highlightsActive = !highlightsActive;
    showToast(highlightsActive ? 'In-page highlights enabled' : 'Highlights disabled');

    const tab = await getActiveTab();
    if (tab?.id) {
      if (highlightsActive) {
        applyInPageHighlights(tab.id, extractionResult.allKeywords);
      } else {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            document.querySelectorAll('.jke-highlighted-keyword').forEach(mark => {
              const parent = mark.parentNode;
              if (parent) {
                while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
                parent.removeChild(mark);
                parent.normalize();
              }
            });
          }
        });
      }
    }
  });

  // Target Picker
  document.getElementById('btn-pick')?.addEventListener('click', async () => {
    const tab = await getActiveTab();
    if (tab?.id) {
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: [
            'src/nlp/trie.js', 'src/nlp/dictionary.js', 'src/nlp/adaptive_learner.js',
            'src/nlp/section_classifier.js', 'src/nlp/extractor.js', 'src/parsers/deep_dom_reader.js',
            'src/parsers/portal_registry.js', 'src/parsers/highlighter.js',
            'src/parsers/element_picker.js', 'src/content/content_script.js'
          ]
        });
        chrome.tabs.sendMessage(tab.id, { action: 'START_ELEMENT_PICKER' });
      } catch (e) {
        console.error(e);
      }
      window.close();
    }
  });

  // Safe clipboard helper with fallback
  async function copyToClipboard(text) {
    if (!text) return false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (_) {}
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      return success;
    } catch (_) {
      return false;
    }
  }

  // Add Custom Keyword (Click + Enter Key)
  const customKwInput = document.getElementById('custom-kw-input');
  const btnAddCustom = document.getElementById('btn-add-custom-kw');

  customKwInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      btnAddCustom?.click();
    }
  });

  btnAddCustom?.addEventListener('click', async () => {
    if (!customKwInput) return;
    const term = customKwInput.value.trim();
    if (!term) return;

    if (!customKeywords.some(c => c.term.toLowerCase() === term.toLowerCase())) {
      customKeywords.push({ term, aliases: [term] });
      try {
        await chrome.storage.local.set({ jke_custom_keywords: customKeywords });
      } catch (_) {}
    }

    customKwInput.value = '';
    showToast(`Added custom keyword: "${term}"`);
    scanActiveTab();
  });

  // Copy Comma-Separated
  document.getElementById('btn-copy-all')?.addEventListener('click', async () => {
    const list = getVisibleKeywords();
    if (!list.length) return;
    const text = list.map(k => k.term).join(', ');
    await copyToClipboard(text);
    showToast(`✓ Copied ${list.length} keywords (comma-separated)!`);
  });

  // Copy Bullets
  document.getElementById('btn-copy-bullets')?.addEventListener('click', async () => {
    const list = getVisibleKeywords();
    if (!list.length) return;
    const bullets = list.map(k => `• ${k.term}`).join('\n');
    await copyToClipboard(bullets);
    showToast(`✓ Copied ${list.length} bullets!`);
  });

  // Settings Modal Controller
  const settingsModal = document.getElementById('settings-modal');
  const btnSettings = document.getElementById('btn-settings');
  const btnCloseSettings = document.getElementById('btn-close-settings');
  const selectProvider = document.getElementById('select-ai-provider');
  const geminiKeyWrap = document.getElementById('gemini-key-wrap');
  const openaiKeyWrap = document.getElementById('openai-key-wrap');
  const inputGeminiKey = document.getElementById('input-gemini-key');
  const inputOpenaiKey = document.getElementById('input-openai-key');
  const toggleAiEnabled = document.getElementById('toggle-ai-enabled');
  const btnSaveSettings = document.getElementById('btn-save-settings');

  async function updateSettingsUI() {
    if (!aiService) return;
    const status = await aiService.getStatus();

    if (toggleAiEnabled) toggleAiEnabled.checked = status.isEnabled;
    if (selectProvider) selectProvider.value = status.currentProvider || 'auto';
    if (inputGeminiKey) inputGeminiKey.value = aiService.geminiApiKey || '';
    if (inputOpenaiKey) inputOpenaiKey.value = aiService.openaiApiKey || '';

    const isOp = (selectProvider?.value === 'openai');
    if (geminiKeyWrap) geminiKeyWrap.style.display = isOp ? 'none' : 'block';
    if (openaiKeyWrap) openaiKeyWrap.style.display = isOp ? 'block' : 'none';

    const dot = document.getElementById('ai-status-dot');
    const txt = document.getElementById('ai-status-text');
    if (status.hasGeminiNano) {
      dot?.classList.add('active');
      if (txt) txt.textContent = 'Chrome Gemini Nano active (On-Device Local AI)';
    } else if (status.hasGeminiApiKey) {
      dot?.classList.add('active');
      if (txt) txt.textContent = 'Google Gemini Flash API connected';
    } else if (status.hasOpenaiApiKey) {
      dot?.classList.add('active');
      if (txt) txt.textContent = 'OpenAI API connected';
    } else {
      dot?.classList.remove('active');
      if (txt) txt.textContent = 'No API key set. Running in High-Speed Dictionary Mode.';
    }
  }

  btnSettings?.addEventListener('click', async () => {
    if (settingsModal) settingsModal.style.display = 'flex';
    await updateSettingsUI();
  });

  btnCloseSettings?.addEventListener('click', () => {
    if (settingsModal) settingsModal.style.display = 'none';
  });

  selectProvider?.addEventListener('change', () => {
    const isOp = (selectProvider.value === 'openai');
    if (geminiKeyWrap) geminiKeyWrap.style.display = isOp ? 'none' : 'block';
    if (openaiKeyWrap) openaiKeyWrap.style.display = isOp ? 'block' : 'none';
  });

  btnSaveSettings?.addEventListener('click', async () => {
    const isEnabled = toggleAiEnabled?.checked ?? true;
    const provider = selectProvider?.value || 'auto';
    const geminiApiKey = inputGeminiKey?.value || '';
    const openaiApiKey = inputOpenaiKey?.value || '';

    if (aiService) {
      await aiService.saveSettings({ provider, geminiApiKey, openaiApiKey, isEnabled });
    }
    showToast('✓ AI Settings Saved!');
    if (settingsModal) settingsModal.style.display = 'none';
    scanActiveTab();
  });

  // Initial scan
  scanActiveTab();
});
