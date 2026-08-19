// Real-Time In-Browser Adaptive Learning & Technical Entity Discovery Engine
// 1. Mines emerging technical entities & tools using grammatical context heuristics
// 2. Persists user feedback (blocklist on dismissal, auto-aliased custom terms) via chrome.storage.local
// 3. Builds a local, offline skill knowledge graph across job postings

class AdaptiveLearner {
  constructor() {
    this.blocklist = new Set();
    this.learnedSkills = new Map(); // term -> { term, aliases, count, discoveredAt }
    this.isInitialized = false;

    // Common non-technical English capitalized words to exclude from candidate discovery
    this.stopWords = new Set([
      'the', 'this', 'that', 'with', 'from', 'have', 'been', 'were', 'will',
      'and', 'or', 'for', 'nor', 'but', 'yet', 'so', 'in', 'to', 'as', 'of', 'on', 'by', 'via', 'using',
      'your', 'their', 'about', 'role', 'team', 'teams', 'company', 'client',
      'clients', 'work', 'working', 'experience', 'experiences', 'year', 'years',
      'level', 'levels', 'degree', 'degrees', 'candidate', 'candidates', 'opportunity',
      'opportunities', 'growth', 'learning', 'environment', 'environments', 'strong',
      'solid', 'proven', 'excellent', 'great', 'fast', 'paced', 'high', 'quality',
      'responsibilities', 'duties', 'requirements', 'qualifications', 'overview',
      'ability', 'passion', 'focus', 'solutions', 'processes', 'standards',
      'practices', 'trends', 'discussions', 'decisions', 'projects', 'tasks',
      'benefits', 'culture', 'remote', 'hybrid', 'office', 'full', 'time', 'part',
      'monday', 'friday', 'january', 'december', 'september', 'october', 'november',
      'bachelor', 'master', 'united', 'states', 'america', 'europe', 'asia', 'canada',
      'session', 'tracing', 'such', 'like', 'including', 'following', 'across', 'within'
    ]);

    // Heuristic Context Patterns that precede technical skills in job descriptions
    this.contextPatterns = [
      /(?:experience with|experience in|proficient in|proficiency in|hands[- ]on with|hands[- ]on in|strong knowledge of|skilled in|working knowledge of|expertise in|mastery of|background in|familiarity with|familiar with|working with|technologies including|tech stack including|tools such as|technologies such as|frameworks like|libraries like|languages such as|coding in|development using)\s+([A-Za-z0-9\.\+#]+(?:\s+[A-Za-z0-9\.\+#]+)?)/gi,
      /(?:using|leverage|leveraging|utilize|utilizing|deploy|deploying|build with|built with|developed with)\s+([A-Z][a-zA-Z0-9\.\+#]+(?:\s+[A-Z][a-zA-Z0-9\.\+#]+)?)/g
    ];

    // PascalCase / CamelCase technical pattern (e.g., NextAuth, LangSmith, FastAPI, TailwindCSS)
    this.pascalTechPattern = /\b([A-Z][a-z0-9]+[A-Z][a-zA-Z0-9]*(?:\.js)?)\b/g;

    // Technical Acronym Pattern (e.g., JWT, RBAC, SDK, CLI, REST, WASM, RTOS)
    this.acronymPattern = /\b([A-Z]{2,5})\b/g;
  }

  async init() {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      try {
        const data = await chrome.storage.local.get(['jke_user_blocklist', 'jke_learned_skills']);
        if (data.jke_user_blocklist && Array.isArray(data.jke_user_blocklist)) {
          this.blocklist = new Set(data.jke_user_blocklist.map(t => t.toLowerCase().trim()));
        }
        if (data.jke_learned_skills && typeof data.jke_learned_skills === 'object') {
          for (const [k, v] of Object.entries(data.jke_learned_skills)) {
            this.learnedSkills.set(k.toLowerCase().trim(), v);
          }
        }
      } catch (err) {
        console.warn('Learner storage init note:', err);
      }
    }
    this.isInitialized = true;
  }

  // Block a keyword when dismissed by the user (Negative Reinforcement)
  async blockKeyword(term) {
    if (!term) return;
    const lower = term.toLowerCase().trim();
    this.blocklist.add(lower);
    this.learnedSkills.delete(lower);

    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      try {
        await chrome.storage.local.set({
          jke_user_blocklist: Array.from(this.blocklist),
          jke_learned_skills: Object.fromEntries(this.learnedSkills)
        });
      } catch (_) {}
    }
  }

  // Remove a keyword from the blocklist
  async unblockKeyword(term) {
    if (!term) return;
    const lower = term.toLowerCase().trim();
    this.blocklist.delete(lower);

    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      try {
        await chrome.storage.local.set({
          jke_user_blocklist: Array.from(this.blocklist)
        });
      } catch (_) {}
    }
  }

  isBlocked(term) {
    if (!term) return false;
    return this.blocklist.has(term.toLowerCase().trim());
  }

  // Automatically derive smart aliases for custom keywords (e.g. NextAuth.js -> nextauth, next-auth)
  generateSmartAliases(term) {
    if (!term) return [];
    const base = term.trim();
    const aliases = new Set([base, base.toLowerCase()]);

    // Handle .js extension
    if (base.toLowerCase().endsWith('.js')) {
      const withoutJs = base.slice(0, -3);
      aliases.add(withoutJs);
      aliases.add(withoutJs.toLowerCase());
    }

    // Handle hyphenated terms (e.g., front-end -> frontend, front end)
    if (base.includes('-')) {
      aliases.add(base.replace(/-/g, ' '));
      aliases.add(base.replace(/-/g, ''));
    }

    // Handle CamelCase (e.g., TailwindCSS -> tailwind css, tailwind)
    const spaced = base.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase();
    if (spaced !== base.toLowerCase()) {
      aliases.add(spaced);
    }

    return Array.from(aliases);
  }

  // Mine the job description for previously unseen technical entities
  discoverNewSkills(text, knownDictionaryTerms = new Set()) {
    if (!text || typeof text !== 'string') return [];

    const discoveredCandidates = new Map();

    const addCandidate = (rawTerm, reason) => {
      let cleaned = rawTerm.replace(/[,;:\(\)\[\]"']/g, '').trim();
      // Strip trailing conjunctions/prepositions
      cleaned = cleaned.replace(/\s+(and|or|for|with|in|to|as|of|on|by|via|using)$/i, '').trim();
      // Strip leading conjunctions/prepositions
      cleaned = cleaned.replace(/^(and|or|for|with|in|to|as|of|on|by|via|using)\s+/i, '').trim();

      if (cleaned.length < 2 || cleaned.length > 35) return;

      const lower = cleaned.toLowerCase();
      if (this.stopWords.has(lower)) return;
      if (this.blocklist.has(lower)) return;
      if (knownDictionaryTerms.has(lower)) return;
      if (/^\d+$/.test(cleaned)) return; // Ignore purely numbers

      const current = discoveredCandidates.get(lower) || {
        term: cleaned,
        canonicalTerm: cleaned,
        type: 'Technical',
        section: 'other',
        isLearned: true,
        frequency: 0,
        aliases: this.generateSmartAliases(cleaned),
        reason
      };

      current.frequency++;
      discoveredCandidates.set(lower, current);
    };

    // 1. Mine grammatical context hooks
    for (const pattern of this.contextPatterns) {
      pattern.lastIndex = 0;
      let match;
      while ((match = pattern.exec(text)) !== null) {
        if (match[1]) {
          const parts = match[1].split(/[\s,]+/);
          for (const p of parts) {
            addCandidate(p, 'context_hook');
          }
        }
      }
    }

    // 2. Mine CamelCase / PascalCase technical terms
    this.pascalTechPattern.lastIndex = 0;
    let match;
    while ((match = this.pascalTechPattern.exec(text)) !== null) {
      if (match[1]) {
        addCandidate(match[1], 'camel_case_tech');
      }
    }

    // Return candidates that passed validation
    return Array.from(discoveredCandidates.values()).filter(c => c.frequency >= 1);
  }

  // Save dynamically confirmed learned skills
  async persistLearnedSkill(skillObj) {
    if (!skillObj || !skillObj.term) return;
    const lower = skillObj.term.toLowerCase().trim();
    if (this.blocklist.has(lower)) return;

    const existing = this.learnedSkills.get(lower) || { ...skillObj, occurrences: 0 };
    existing.occurrences = (existing.occurrences || 0) + 1;
    existing.lastSeen = Date.now();
    this.learnedSkills.set(lower, existing);

    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      try {
        await chrome.storage.local.set({
          jke_learned_skills: Object.fromEntries(this.learnedSkills)
        });
      } catch (_) {}
    }
  }
}

if (typeof window !== 'undefined') {
  window.AdaptiveLearner = AdaptiveLearner;
}
