// Real-Time In-Browser Adaptive Learning & Technical Entity Discovery Engine
// 1. Mines emerging technical entities & tools using strict grammatical context heuristics
// 2. Filters out social hashtags, job titles, and recruitment buzzwords
// 3. Persists user feedback (blocklist on dismissal, auto-aliased custom terms) via chrome.storage.local

class AdaptiveLearner {
  constructor() {
    this.blocklist = new Set();
    this.learnedSkills = new Map(); // term -> { term, aliases, count, discoveredAt }
    this.isInitialized = false;

    // Common non-technical words, corporate titles, hashtags, and recruitment noise to exclude
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
      'session', 'tracing', 'such', 'like', 'including', 'following', 'across', 'within',
      // Job titles & social hashtags
      'newgrad', 'new grad', 'softwareengineer', 'software engineer', 'softwaredeveloper',
      'software developer', 'womenintech', 'women in tech', 'societyofwomenengineers',
      'careergrowth', 'career growth', 'softwaredevelopment', 'software development',
      'systemsengineering', 'earlycareer', 'early career', 'diversity', 'inclusion',
      'equalopportunity', 'equal opportunity', 'hiring', 'recruiting', 'recruitment',
      'referral', 'location', 'salary', 'benefits', 'job', 'jobs', 'careers'
    ]);

    // Strict Technical Context Patterns that precede real technical tools/skills
    this.contextPatterns = [
      /(?:experience with|experience in|proficient in|proficiency in|hands[- ]on with|hands[- ]on in|strong knowledge of|skilled in|working knowledge of|expertise in|mastery of|background in|familiarity with|familiar with|working with|technologies including|tech stack including|tools such as|technologies such as|frameworks like|libraries like|languages such as|coding in|development using)\s+([A-Za-z0-9\.\+#]+(?:\s+[A-Za-z0-9\.\+#]+)?)/gi,
      /(?:frameworks|libraries|packages|tools|databases|languages)\s*:\s*([A-Za-z0-9\.\+#]+(?:\s*,\s*[A-Za-z0-9\.\+#]+)*)/gi
    ];
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

  // Mine the job description for genuine unseen technical tools and frameworks
  discoverNewSkills(text, knownDictionaryTerms = new Set()) {
    if (!text || typeof text !== 'string') return [];

    const discoveredCandidates = new Map();

    const addCandidate = (rawTerm, reason) => {
      let cleaned = rawTerm.replace(/[,;:\(\)\[\]"']/g, '').trim();
      // Strip leading hashtag
      cleaned = cleaned.replace(/^#+/, '').trim();
      // Strip trailing conjunctions/prepositions
      cleaned = cleaned.replace(/\s+(and|or|for|with|in|to|as|of|on|by|via|using)$/i, '').trim();
      // Strip leading conjunctions/prepositions
      cleaned = cleaned.replace(/^(and|or|for|with|in|to|as|of|on|by|via|using)\s+/i, '').trim();

      if (cleaned.length < 2 || cleaned.length > 30) return;

      const lower = cleaned.toLowerCase();
      if (this.stopWords.has(lower)) return;
      if (this.blocklist.has(lower)) return;
      if (knownDictionaryTerms.has(lower)) return;
      if (/^\d+$/.test(cleaned)) return; // Ignore purely numbers

      // Filter out long compound concatenated words (e.g. 3+ capitalized words joined together like SocietyOfWomenEngineers)
      const uppercaseWordCount = (cleaned.match(/[A-Z][a-z0-9]*/g) || []).length;
      if (uppercaseWordCount >= 3 && !cleaned.includes('.') && !cleaned.includes('-')) {
        return; // Filter out hashtag-style sentence joins
      }

      // Filter out job title suffixes
      if (/(?:engineer|developer|manager|specialist|consultant|director|analyst|administrator|officer|recruiter|coordinator)$/i.test(cleaned)) {
        return;
      }

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

    // 1. Mine strict grammatical context hooks only
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
