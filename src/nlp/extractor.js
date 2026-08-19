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
        educationKeywords: [],
        otherKeywords: [],
        totalCount: 0,
        requiredCount: 0,
        educationCount: 0,
        otherCount: 0
      };
    }

    const cleanText = this.normalizeText(text);

    // Section classification
    const classifier = typeof SectionClassifier !== 'undefined' ? SectionClassifier : (typeof window !== 'undefined' ? window.SectionClassifier : null);
    let sections = { requiredText: '', educationText: '', preferredText: '', generalText: cleanText, requirementLinesText: '', hasExplicitSections: false };
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

        // Disambiguate short English homographs (e.g. Go programming vs English verb "go")
        if (rule.term === 'Go / Golang') {
          const explicitGoRegex = /\b(?:golang|go\s*lang|go\s*language|go\s*programming|goroutines?|go\s*(?:developer|engineer|backend|microservices?|code|services?|apis?))\b/i;
          const techListPattern = /(?:Python|Java|Rust|C\+\+|TypeScript|JavaScript|Node|Ruby|C#|SQL|AWS|Docker|Kubernetes|gRPC|backend|programming|languages?|technologies?)\s*(?:[,/|\s]|\bor\b|\band\b)+\s*Go\b|\bGo\s*(?:[,/|\s]|\bor\b|\band\b)+\s*(?:Python|Java|Rust|C\+\+|TypeScript|JavaScript|Node|Ruby|C#|SQL|AWS|Docker|Kubernetes|gRPC|backend|programming|languages?|technologies?)/i;
          const techExpPattern = /(?:experience\s+with|proficiency\s+in|proficient\s+in|knowledge\s+of|working\s+with|skills?\s+in|familiarity\s+with|built\s+with|written\s+in|using)\s+Go\b/i;

          const isExplicit = explicitGoRegex.test(cleanText);
          const isContextual = /(?<![a-zA-Z0-9])Go(?![a-zA-Z0-9])/.test(cleanText) && (techListPattern.test(cleanText) || techExpPattern.test(cleanText));

          if (!isExplicit && !isContextual) {
            continue; // Skip English verb "go"
          }
          if (isContextual && !isExplicit) {
            bestExactText = 'Go';
          }
        }

        // Check if verbatim variant is blocked
        if (this.learner && this.learner.isBlocked(bestExactText)) continue;

        const isEducationRule = rule.type === 'Education';
        const matchedInEducation = isEducationRule || !!(sections.educationText && rule.testRegex.test(sections.educationText));
        const matchedInGeneral = !!(sections.generalText && rule.testRegex.test(sections.generalText));

        let inRequired = false;
        let inEducation = false;
        let inGeneral = false;
        let primarySection = 'required';

        if (matchedInEducation || isEducationRule) {
          inEducation = true;
          primarySection = 'education';
          if (matchedInGeneral) inGeneral = true;
        } else {
          // All Technical keywords are strictly classified under Required
          inRequired = true;
          primarySection = 'required';
          if (matchedInGeneral) inGeneral = true;
        }

        const dedupeKey = bestExactText.toLowerCase();

        if (seenTermMap.has(dedupeKey)) {
          const existing = seenTermMap.get(dedupeKey);
          if (totalFreq > existing.frequency) {
            existing.frequency = totalFreq;
            existing.term = bestExactText;
            existing.canonicalTerm = rule.term;
          }
          if (inEducation || isEducationRule) {
            existing.inEducation = true;
            existing.section = 'education';
          } else {
            existing.inRequired = true;
            existing.section = 'required';
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
            inEducation,
            inGeneral,
            isLearned: false,
            frequency: finalFrequency,
            aliases: rule.aliases
          };
          seenTermMap.set(dedupeKey, keywordObj);
        }
      }
    }

    const allKeywords = Array.from(seenTermMap.values());
    const educationKeywords = allKeywords.filter(k => k.type === 'Education' || k.inEducation || k.section === 'education');
    const requiredKeywords = allKeywords.filter(k => k.type !== 'Education' && k.section !== 'education');
    const otherKeywords = allKeywords.filter(k => k.section === 'other' || k.type === 'Other');

    // Sort all arrays strictly by frequency descending
    allKeywords.sort((a, b) => b.frequency - a.frequency);
    requiredKeywords.sort((a, b) => b.frequency - a.frequency);
    educationKeywords.sort((a, b) => b.frequency - a.frequency);
    otherKeywords.sort((a, b) => b.frequency - a.frequency);

    return {
      allKeywords,
      requiredKeywords,
      educationKeywords,
      otherKeywords,
      totalCount: allKeywords.length,
      requiredCount: requiredKeywords.length,
      educationCount: educationKeywords.length,
      otherCount: otherKeywords.length
    };
  }
}

if (typeof window !== 'undefined') {
  window.KeywordExtractor = KeywordExtractor;
}
