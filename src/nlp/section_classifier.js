// Comprehensive Section Classifier with Multi-Pattern & Line-Level Requirement Support
// Accurately extracts Required (Must-Have), Preferred (Nice-to-Have), and Line-Level Requirement cues

class SectionClassifier {
  static classify(text) {
    if (!text || typeof text !== 'string') {
      return {
        requiredText: '',
        preferredText: '',
        generalText: '',
        requirementLinesText: '',
        hasExplicitSections: false,
        fullText: ''
      };
    }

    // Split by newlines, or split inline headers if text was compressed
    const normalizedText = text
      .replace(/([^\n])\s*(Basic Qualifications|Minimum Qualifications|Requirements|Required Skills|Preferred Qualifications|Nice to Have|Bonus Points|You might be a great fit if|What you['’]ll do|Responsibilities)\s*:/gi, '$1\n$2:');

    const lines = normalizedText.split(/\n+/);
    let currentSection = 'general';
    let hasExplicitSections = false;

    const requiredLines = [];
    const preferredLines = [];
    const generalLines = [];
    const requirementCuesLines = [];

    // Preferred / Nice-to-Have Patterns
    const preferredPatterns = [
      /preferred qualifications/i,
      /nice[- ]to[- ]have/i,
      /bonus points/i,
      /bonus qualifications/i,
      /bonus skills/i,
      /bonus if you have/i,
      /preferred skills/i,
      /desired skills/i,
      /desired qualifications/i,
      /plus if you have/i,
      /great to have/i,
      /good to have/i,
      /preferred experience/i,
      /what will make you stand out/i,
      /standout qualifications/i,
      /extra credit/i,
      /ideal candidate/i,
      /pluses/i,
      /advantageous/i,
      /an asset/i,
      /optional/i
    ];

    // Required / Must-Have / Core Qualifications Patterns
    const requiredPatterns = [
      /you might be a great fit/i,
      /great fit if/i,
      /good fit if/i,
      /you['’]d be a great fit/i,
      /you are a great fit/i,
      /you will be a great fit/i,
      /who you are/i,
      /about you/i,
      /your background/i,
      /candidate profile/i,
      /you have/i,
      /you bring/i,
      /what you bring/i,
      /basic qualifications/i,
      /minimum qualifications/i,
      /minimum requirements/i,
      /must[- ]have/i,
      /what you need/i,
      /what we are looking for/i,
      /what we look for/i,
      /what you['’]ll need/i,
      /requirements/i,
      /required skills/i,
      /required qualifications/i,
      /core requirements/i,
      /essential skills/i,
      /essential requirements/i,
      /what you['’]ll bring/i,
      /qualifications/i,
      /education required/i,
      /mandatory/i,
      /prerequisites/i,
      /key requirements/i,
      /technical requirements/i,
      /skills & experience/i,
      /skills & requirements/i,
      /job requirements/i
    ];

    // General / Culture / Responsibilities Patterns
    const generalPatterns = [
      /how we work/i,
      /you might, one week to the next/i,
      /what you will do/i,
      /what you['’]ll do/i,
      /about the role/i,
      /about us/i,
      /about the team/i,
      /about the company/i,
      /job description/i,
      /overview/i,
      /responsibilities/i,
      /job duties/i,
      /key responsibilities/i,
      /benefits/i,
      /company culture/i,
      /compensation/i,
      /equal opportunity/i,
      /salary range/i,
      /work environment/i
    ];

    // Line-level requirement cue keywords
    const requirementCueRegex = /(?:experience with|experience in|proficient in|proficiency in|knowledge of|familiar with|familiarity with|hands[- ]on|strong understanding|degree in|years of|expertise in|skilled in|must have|working knowledge|background in|ability to code in)/i;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      let transitionFound = false;

      // 1. Check Preferred first
      for (const p of preferredPatterns) {
        if (p.test(trimmed) && trimmed.length < 120) {
          currentSection = 'preferred';
          transitionFound = true;
          hasExplicitSections = true;
          break;
        }
      }

      // 2. Check Required / Great Fit
      if (!transitionFound) {
        for (const r of requiredPatterns) {
          if (r.test(trimmed) && trimmed.length < 120) {
            currentSection = 'required';
            transitionFound = true;
            hasExplicitSections = true;
            break;
          }
        }
      }

      // 3. Check General / Duties / Culture
      if (!transitionFound) {
        for (const g of generalPatterns) {
          if (g.test(trimmed) && trimmed.length < 120) {
            currentSection = 'general';
            transitionFound = true;
            break;
          }
        }
      }

      if (currentSection !== 'preferred' && requirementCueRegex.test(trimmed)) {
        requirementCuesLines.push(trimmed);
      }

      if (currentSection === 'required') {
        requiredLines.push(trimmed);
      } else if (currentSection === 'preferred') {
        preferredLines.push(trimmed);
      } else {
        generalLines.push(trimmed);
      }
    }

    return {
      requiredText: requiredLines.join('\n'),
      preferredText: preferredLines.join('\n'),
      generalText: generalLines.join('\n'),
      requirementLinesText: requirementCuesLines.join('\n'),
      hasExplicitSections,
      fullText: text
    };
  }
}

if (typeof window !== 'undefined') {
  window.SectionClassifier = SectionClassifier;
}
