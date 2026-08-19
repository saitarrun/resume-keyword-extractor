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
      .replace(/([^\n])\s*(Required qualifications to be successful in this role|Required qualifications|Basic Qualifications|Minimum Qualifications|Minimum Requirements|Core Requirements|Requirements|Required Skills|Essential Skills|Technical Requirements|Skills & Experience|Skills & Requirements|Skills|Preferred Qualifications|Preferred Skills|Preferred Experience|Nice to Have|Bonus Points|Bonus Qualifications|You might be a great fit if|Your future duties and responsibilities|What you['’]ll do|What you will do|Responsibilities|About the role|About us)\s*[:\-–—]?/gi, '$1\n$2:');

    const lines = normalizedText.split(/\n+/);
    let currentSection = 'general';
    let hasExplicitSections = false;

    const requiredLines = [];
    const educationLines = [];
    const preferredLines = [];
    const generalLines = [];
    const requirementCuesLines = [];

    // Education / Degree Patterns
    const educationPatterns = [
      /^education\s*[:\-–—]?$/i,
      /^educational requirements\s*[:\-–—]?$/i,
      /^education & experience\s*[:\-–—]?$/i,
      /^degree requirements\s*[:\-–—]?$/i,
      /^academic background\s*[:\-–—]?$/i,
      /^education \/ certifications\s*[:\-–—]?$/i,
      /^minimum education\s*[:\-–—]?$/i,
      /education & qualifications/i,
      /academic requirements/i,
      /degree & education/i,
      /education:/i
    ];

    // Preferred / Nice-to-Have Patterns
    const preferredPatterns = [
      /^preferred\s*[:\-–—]?$/i,
      /^preferred\s+/i,
      /^nice[- ]to[- ]have\s*[:\-–—]?$/i,
      /^bonus\s*[:\-–—]?$/i,
      /^desired\s*[:\-–—]?$/i,
      /^plus\s*[:\-–—]?$/i,
      /^pluses\s*[:\-–—]?$/i,
      /preferred qualifications/i,
      /preferred skills/i,
      /preferred experience/i,
      /preferred background/i,
      /nice[- ]to[- ]have/i,
      /bonus points/i,
      /bonus qualifications/i,
      /bonus skills/i,
      /bonus if you have/i,
      /desired skills/i,
      /desired qualifications/i,
      /plus if you have/i,
      /great to have/i,
      /good to have/i,
      /what will make you stand out/i,
      /standout qualifications/i,
      /extra credit/i,
      /ideal candidate/i,
      /advantageous/i,
      /an asset/i,
      /optional/i
    ];

    // Required / Must-Have / Core Qualifications Patterns
    const requiredPatterns = [
      /required qualifications to be successful/i,
      /required qualifications/i,
      /qualifications to be successful/i,
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
      /job requirements/i,
      /^skills\s*[:\-–—]?$/i,
      /^technical skills\s*[:\-–—]?$/i,
      /^tech stack\s*[:\-–—]?$/i
    ];

    // General / Culture / Responsibilities Patterns
    const generalPatterns = [
      /your future duties and responsibilities/i,
      /duties and responsibilities/i,
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
    const requirementCueRegex = /(?:experience with|experience in|proficient in|proficiency in|knowledge of|familiar with|familiarity with|hands[- ]on|strong understanding|degree in|years of|expertise in|skilled in|must have|working knowledge|background in|ability to code in|passion for|ability to)/i;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      let transitionFound = false;

      // 1. Check Education first
      for (const e of educationPatterns) {
        if (e.test(trimmed) && trimmed.length < 120) {
          currentSection = 'education';
          transitionFound = true;
          hasExplicitSections = true;
          break;
        }
      }

      // 2. Check Preferred
      if (!transitionFound) {
        for (const p of preferredPatterns) {
          if (p.test(trimmed) && trimmed.length < 120) {
            currentSection = 'preferred';
            transitionFound = true;
            hasExplicitSections = true;
            break;
          }
        }
      }

      // 3. Check Required / Great Fit
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

      // 4. Check General / Duties / Culture
      if (!transitionFound) {
        for (const g of generalPatterns) {
          if (g.test(trimmed) && trimmed.length < 120) {
            currentSection = 'general';
            transitionFound = true;
            break;
          }
        }
      }

      if (currentSection !== 'preferred' && currentSection !== 'education' && requirementCueRegex.test(trimmed)) {
        requirementCuesLines.push(trimmed);
      }

      if (currentSection === 'education') {
        educationLines.push(trimmed);
      } else if (currentSection === 'required') {
        requiredLines.push(trimmed);
      } else if (currentSection === 'preferred') {
        preferredLines.push(trimmed);
      } else {
        generalLines.push(trimmed);
      }
    }

    return {
      requiredText: requiredLines.join('\n'),
      educationText: educationLines.join('\n'),
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
