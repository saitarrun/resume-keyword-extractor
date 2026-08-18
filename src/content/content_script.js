// Content Script - Passive Listener Only (No Unsolicited In-Page Widgets)
// Executes keyword operations strictly on-demand when user opens the extension from Chrome.

(function() {
  let extractor = null;
  let highlighter = null;
  let picker = null;

  async function initEngines() {
    let customKeywords = [];
    try {
      const stored = await chrome.storage.local.get(['jke_custom_keywords']);
      if (stored && Array.isArray(stored.jke_custom_keywords)) {
        customKeywords = stored.jke_custom_keywords;
      }
    } catch (_) {}

    if (!extractor && typeof KeywordExtractor !== 'undefined') {
      extractor = new KeywordExtractor(window.SKILL_DICTIONARY || [], customKeywords);
    }
    if (!highlighter && typeof DomHighlighter !== 'undefined') {
      highlighter = new DomHighlighter();
    }
    if (!picker && typeof ElementPicker !== 'undefined') {
      picker = new ElementPicker((selectedElement) => {
        const text = typeof DeepDomReader !== 'undefined' ? DeepDomReader.extractDeepText(selectedElement) : PortalRegistry.cleanContainerText(selectedElement);
        if (text.length > 10 && extractor) {
          const extractionResult = extractor.extract(text);
          if (highlighter && extractionResult.allKeywords.length > 0) {
            highlighter.highlightKeywords(selectedElement, extractionResult.allKeywords);
          }
        }
      });
    }
  }

  async function extractPageData() {
    await initEngines();
    if (!extractor || typeof PortalRegistry === 'undefined') {
      return null;
    }

    const jobData = PortalRegistry.extractJobData();
    if (!jobData || !jobData.descriptionText) {
      return null;
    }

    const extractionResult = extractor.extract(jobData.descriptionText);
    return { jobData, extractionResult };
  }

  // Listen strictly for user-initiated actions from the Chrome extension popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'EXTRACT_PAGE_DATA' || request.action === 'RESCAN_PAGE') {
      extractPageData().then(data => {
        if (!data || !data.jobData || !data.jobData.descriptionText) {
          sendResponse({ success: false, error: 'No job posting content detected on this page.' });
        } else {
          sendResponse({ success: true, jobData: data.jobData, extractionResult: data.extractionResult });
        }
      });
      return true;
    }

    if (request.action === 'START_ELEMENT_PICKER') {
      initEngines().then(() => picker?.start());
      sendResponse({ success: true });
      return true;
    }

    if (request.action === 'SCROLL_TO_KEYWORD') {
      if (highlighter && request.term) {
        highlighter.scrollToKeyword(request.term);
      }
      sendResponse({ success: true });
      return true;
    }

    if (request.action === 'CLEAR_HIGHLIGHTS') {
      if (highlighter) {
        highlighter.clearHighlights();
      }
      sendResponse({ success: true });
      return true;
    }
  });
})();
