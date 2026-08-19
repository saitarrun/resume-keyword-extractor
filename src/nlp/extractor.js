// Hybrid Multi-Pass Keyword Extractor with Real-Time Adaptive Learning & Exact In-Text Case Preservation
// Incorporates Section Classification (Required, Preferred, Other) and Unsupervised Entity Discovery

class KeywordExtractor {
  constructor(dictionary = (typeof window !== 'undefined' ? window.SKILL_DICTIONARY : []) || [], customKeywords = []) {
    this.dictionary = [...dictionary];
    this.customKeywords = customKeywords;
    this.compiledRules = [];
    this.knownTermsSet = new Set();
    this.learner = typeof AdaptiveLearner !== 'undefined' ? new AdaptiveLearner() : (typeof window !== 'undefined' && window.AdaptiveLearner ? new window.AdaptiveLearner() : null);
    
    if (this.learner && typeof this.learner.init === 'function') {
      this.learner.init().catch(() => {});
    }

    this.initRules();
  }

  setCustomKeywords(customKeywords = []) {
    this.customKeywords = customKeywords;
    this.initRules();
  }

  setLearner(learner) {
    if (learner) {
      this.learner = learner;
    }
  }

  initRules() {
    const allEntries = [...this.dictionary];
    this.knownTermsSet = new Set();

    if (Array.isArray(this.customKeywords) && this.customKeywords.length > 0) {
      for (const custom of this.customKeywords) {
        if (!custom || !custom.term) continue;
        const aliases = custom.aliases || (this.learner ? this.learner.generateSmartAliases(custom.term) : [custom.term]);
        allEntries.push({
          term: custom.term,
          type: 'Technical',
          aliases
        });
      }
    }

    this.compiledRules = allEntries.map(item => {
      const allAliases = [item.term, ...(item.aliases || [])];
      const cleanedAliases = allAliases.map(a => a.toLowerCase().replace(/[\u2018\u2019]/g, "'").trim());
      const uniqueAliases = Array.from(new Set(cleanedAliases)).filter(a => a.length >= 1);

      uniqueAliases.forEach(a => this.knownTermsSet.add(a));
      this.knownTermsSet.add(item.term.toLowerCase().trim());

      uniqueAliases.sort((a, b) => b.length - a.length);

      const escaped = uniqueAliases.map(a => a.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
      
      const matchRegex = new RegExp(`(?<![a-zA-Z0-9])(${escaped})(?![a-zA-Z0-9])`, 'gi');
      const testRegex = new RegExp(`(?<![a-zA-Z0-9])(${escaped})(?![a-zA-Z0-9])`, 'i');

      return {
        term: item.term,
        type: item.type || 'Technical',
        aliases: item.aliases || [item.term],
        matchRegex,
        testRegex
      };
    });
  }

  normalizeText(text) {
    if (!text || typeof text !== 'string') return '';
    return text
      .replace(/\r\n/g, '\n')
      .replace(/#[A-Za-z0-9_\-]+/g, ' ')        // Strip LinkedIn & social hashtags (e.g. #NewGrad #WomenInTech)
      .replace(/https?:\/\/[^\s<>"')]+/gi, ' ') // Strip http:// and https:// URLs
      .replace(/www\.[^\s<>"')]+/gi, ' ')       // Strip www. links
      .replace(/mailto:[^\s<>"')]+/gi, ' ')     // Strip mailto links
      .replace(/[\u2018\u2019]/g, "'") // Normalize smart single quotes / apostrophes
      .replace(/[\u201c\u201d]/g, '"') // Normalize smart double quotes
      .replace(/\u00a0/g, ' ')         // Normalize non-breaking space
      .replace(/[\u200B-\u200D\uFEFF]/g, '') // Strip zero-width spaces
      .replace(/[\u2013\u2014]/g, '-'); // Normalize en-dash & em-dash
  }

  extract(text) {
    if (!text || typeof text !== 'string') {
      return {
        allKeywords: [],
        requiredKeywords: [],
        preferredKeywords: [],
        otherKeywords: [],
        totalCount: 0,
        requiredCount: 0,
        preferredCount: 0,
        otherCount: 0
      };
    }

    const cleanText = this.normalizeText(text);

    // Section classification
    const classifier = typeof SectionClassifier !== 'undefined' ? SectionClassifier : (typeof window !== 'undefined' ? window.SectionClassifier : null);
    let sections = { requiredText: '', preferredText: '', generalText: cleanText, requirementLinesText: '', hasExplicitSections: false };
    if (classifier && typeof classifier.classify === 'function') {
      sections = classifier.classify(cleanText);
    }

    const seenTermMap = new Map();

    for (const rule of this.compiledRules) {
      // Check if blocked by user learning preferences
      if (this.learner && this.learner.isBlocked(rule.term)) continue;

      // Fast-path: quickly skip rules not present in document (10x-15x faster execution)
      if (!rule.testRegex.test(cleanText)) continue;

      rule.matchRegex.lastIndex = 0;
      let totalFreq = 0;
      const exactTextOccurrences = new Map();
      let m;

      while ((m = rule.matchRegex.exec(cleanText)) !== null) {
        totalFreq++;
        const exactText = (m[1] || m[0]).trim();
        if (exactText) {
          exactTextOccurrences.set(exactText, (exactTextOccurrences.get(exactText) || 0) + 1);
        }
      }

      if (totalFreq > 0) {
        // Extract the exact verbatim grammatical spelling and capitalization from the text
        let bestExactText = rule.term;
        let maxCount = 0;
        for (const [exactVariant, count] of exactTextOccurrences.entries()) {
          if (count > maxCount) {
            maxCount = count;
            bestExactText = exactVariant;
          }
        }

        // Check if verbatim variant is blocked
        if (this.learner && this.learner.isBlocked(bestExactText)) continue;

        const matchedInRequired = !!(sections.requiredText && rule.testRegex.test(sections.requiredText));
        const matchedInRequirementCues = !!(sections.requirementLinesText && rule.testRegex.test(sections.requirementLinesText));
        const matchedInPreferred = !!(sections.preferredText && rule.testRegex.test(sections.preferredText));
        const matchedInGeneral = !!(sections.generalText && rule.testRegex.test(sections.generalText));

        let inRequired = false;
        let inPreferred = false;
        let inGeneral = false;
        let primarySection = 'other';

        if (matchedInRequired) {
          inRequired = true;
          primarySection = 'required';
          if (matchedInPreferred) inPreferred = true;
          if (matchedInGeneral) inGeneral = true;
        } else if (matchedInPreferred) {
          inPreferred = true;
          primarySection = 'preferred';
          if (matchedInGeneral) inGeneral = true;
        } else if (matchedInRequirementCues) {
          inRequired = true;
          primarySection = 'required';
          if (matchedInGeneral) inGeneral = true;
        } else {
          inGeneral = true;
          primarySection = 'other';
        }

        const dedupeKey = bestExactText.toLowerCase();

        if (seenTermMap.has(dedupeKey)) {
          const existing = seenTermMap.get(dedupeKey);
          if (totalFreq > existing.frequency) {
            existing.frequency = totalFreq;
            existing.term = bestExactText;
            existing.canonicalTerm = rule.term;
          }
          if (inRequired) {
            existing.inRequired = true;
            existing.section = 'required';
          }
          if (inPreferred) {
            existing.inPreferred = true;
            if (!existing.inRequired) existing.section = 'preferred';
          }
          if (inGeneral) existing.inGeneral = true;
        } else {
          const finalFrequency = maxCount || totalFreq;
          const keywordObj = {
            term: bestExactText, // Exact verbatim spelling & capitalization as found in the text
            canonicalTerm: rule.term,
            type: rule.type,
            section: primarySection,
            inRequired,
            inPreferred,
            inGeneral,
            isLearned: false,
            frequency: finalFrequency,
            aliases: rule.aliases
          };
          seenTermMap.set(dedupeKey, keywordObj);
        }
      }
    }

    // 2. Real-Time Autonomous Skill Discovery (Unsupervised in-page pattern mining)
    if (this.learner && typeof this.learner.discoverNewSkills === 'function') {
      const discovered = this.learner.discoverNewSkills(cleanText, this.knownTermsSet);
      for (const disc of discovered) {
        const dedupeKey = disc.term.toLowerCase();
        if (!seenTermMap.has(dedupeKey) && !this.learner.isBlocked(disc.term)) {
          // Check section placement for discovered term
          const termRegex = new RegExp(`(?<![a-zA-Z0-9])(${disc.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})(?![a-zA-Z0-9])`, 'i');
          const inReq = !!(sections.requiredText && termRegex.test(sections.requiredText)) || !!(sections.requirementLinesText && termRegex.test(sections.requirementLinesText));
          const inPref = !!(sections.preferredText && termRegex.test(sections.preferredText));
          
          disc.section = inReq ? 'required' : (inPref ? 'preferred' : 'other');
          disc.inRequired = inReq;
          disc.inPreferred = inPref;
          seenTermMap.set(dedupeKey, disc);
        }
      }
    }

    const allKeywords = Array.from(seenTermMap.values());
    const requiredKeywords = allKeywords.filter(k => k.inRequired || k.section === 'required');
    const preferredKeywords = allKeywords.filter(k => k.inPreferred || k.section === 'preferred');
    const otherKeywords = allKeywords.filter(k => k.section === 'other' || (!k.inRequired && !k.inPreferred));

    // Sort all arrays strictly by frequency descending
    allKeywords.sort((a, b) => b.frequency - a.frequency);
    requiredKeywords.sort((a, b) => b.frequency - a.frequency);
    preferredKeywords.sort((a, b) => b.frequency - a.frequency);
    otherKeywords.sort((a, b) => b.frequency - a.frequency);

    return {
      allKeywords,
      requiredKeywords,
      preferredKeywords,
      otherKeywords,
      totalCount: allKeywords.length,
      requiredCount: requiredKeywords.length,
      preferredCount: preferredKeywords.length,
      otherCount: otherKeywords.length
    };
  }
}

if (typeof window !== 'undefined') {
  window.KeywordExtractor = KeywordExtractor;
}
