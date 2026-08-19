// AI Service: Semantic Technical Skill Extraction & Implied Architecture Deduction
// Supports:
// 1. Chrome Built-in On-Device AI (window.ai / Gemini Nano)
// 2. Google Gemini API (gemini-1.5-flash / gemini-2.0-flash)
// 3. OpenAI API (gpt-4o-mini)

class AIService {
  constructor() {
    this.provider = 'auto'; // 'auto', 'gemini_nano', 'gemini_api', 'openai'
    this.geminiApiKey = '';
    this.openaiApiKey = '';
    this.isEnabled = true;
    this.isInitialized = false;
  }

  async init() {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      try {
        const data = await chrome.storage.local.get([
          'jke_ai_provider',
          'jke_gemini_api_key',
          'jke_openai_api_key',
          'jke_ai_enabled'
        ]);
        if (data.jke_ai_provider) this.provider = data.jke_ai_provider;
        if (data.jke_gemini_api_key) this.geminiApiKey = data.jke_gemini_api_key;
        if (data.jke_openai_api_key) this.openaiApiKey = data.jke_openai_api_key;
        if (typeof data.jke_ai_enabled === 'boolean') this.isEnabled = data.jke_ai_enabled;
      } catch (err) {
        console.warn('AIService storage init note:', err);
      }
    }
    this.isInitialized = true;
  }

  async saveSettings({ provider, geminiApiKey, openaiApiKey, isEnabled }) {
    if (provider !== undefined) this.provider = provider;
    if (geminiApiKey !== undefined) this.geminiApiKey = geminiApiKey.trim();
    if (openaiApiKey !== undefined) this.openaiApiKey = openaiApiKey.trim();
    if (isEnabled !== undefined) this.isEnabled = isEnabled;

    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      await chrome.storage.local.set({
        jke_ai_provider: this.provider,
        jke_gemini_api_key: this.geminiApiKey,
        jke_openai_api_key: this.openaiApiKey,
        jke_ai_enabled: this.isEnabled
      });
    }
  }

  async getStatus() {
    if (!this.isInitialized) await this.init();

    // Check Gemini Nano support
    let hasGeminiNano = false;
    try {
      if (typeof window !== 'undefined' && window.ai && window.ai.languageModel) {
        const capabilities = await window.ai.languageModel.capabilities();
        hasGeminiNano = capabilities.available === 'readily';
      }
    } catch (_) {}

    return {
      isEnabled: this.isEnabled,
      currentProvider: this.provider,
      hasGeminiNano,
      hasGeminiApiKey: !!this.geminiApiKey,
      hasOpenaiApiKey: !!this.openaiApiKey
    };
  }

  // Generate structured extraction prompt
  buildPrompt(jobText) {
    // Truncate to first 4,000 chars for speed & token efficiency
    const truncated = jobText.length > 4000 ? jobText.substring(0, 4000) + '...' : jobText;

    return `You are an expert Technical Recruiter and Principal Software Architect.
Analyze this job description and extract strictly TECHNICAL software skills, programming languages, frameworks, cloud infrastructure, databases, developer tools, and architectural patterns.

Also infer "impliedSkills" if the text explicitly describes a technical problem space (for example, "high-throughput distributed consensus" implies "Distributed Systems" and "Event-Driven Architecture").

Job Description:
"""
${truncated}
"""

Return ONLY a valid JSON object without any Markdown formatting or codeblocks:
{
  "requiredSkills": ["exact technical term 1", "exact technical term 2"],
  "preferredSkills": ["exact technical term 3"],
  "impliedSkills": ["implied architecture or skill 1", "implied architecture or skill 2"]
}`;
  }

  // Parse JSON response safely
  parseAIResponse(responseText) {
    if (!responseText) return null;
    try {
      // Strip markdown code fences if present
      let cleanJson = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
      const firstBrace = cleanJson.indexOf('{');
      const lastBrace = cleanJson.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        cleanJson = cleanJson.substring(firstBrace, lastBrace + 1);
      }
      return JSON.parse(cleanJson);
    } catch (err) {
      console.warn('AI Response JSON Parse failed:', err, responseText);
      return null;
    }
  }

  // 1. Chrome Gemini Nano Local Inference
  async extractWithGeminiNano(prompt) {
    if (typeof window === 'undefined' || !window.ai || !window.ai.languageModel) {
      throw new Error('Chrome Built-in AI (Gemini Nano) is not enabled on this device.');
    }
    const session = await window.ai.languageModel.create({
      systemPrompt: 'You are an ATS technical skill extraction model. Output valid JSON only.'
    });
    const result = await session.prompt(prompt);
    session.destroy();
    return this.parseAIResponse(result);
  }

  // 2. Google Gemini Flash API
  async extractWithGeminiAPI(prompt, apiKey = this.geminiApiKey) {
    if (!apiKey) throw new Error('Google Gemini API Key is missing. Please set it in Settings.');

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: 'application/json'
        }
      })
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Gemini API Error (${response.status}): ${errBody}`);
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return this.parseAIResponse(candidateText);
  }

  // 3. OpenAI API (gpt-4o-mini)
  async extractWithOpenAI(prompt, apiKey = this.openaiApiKey) {
    if (!apiKey) throw new Error('OpenAI API Key is missing. Please set it in Settings.');

    const url = 'https://api.openai.com/v1/chat/completions';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an ATS technical skill extraction model. Output valid JSON only.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`OpenAI API Error (${response.status}): ${errBody}`);
    }

    const data = await response.json();
    const candidateText = data.choices?.[0]?.message?.content;
    return this.parseAIResponse(candidateText);
  }

  // Main Semantic Extraction Pipeline
  async extractSemanticSkills(jobText) {
    if (!this.isEnabled || !jobText || jobText.length < 50) return null;
    if (!this.isInitialized) await this.init();

    const prompt = this.buildPrompt(jobText);

    // Provider resolution
    if (this.provider === 'gemini_nano') {
      return await this.extractWithGeminiNano(prompt);
    } else if (this.provider === 'gemini_api') {
      return await this.extractWithGeminiAPI(prompt);
    } else if (this.provider === 'openai') {
      return await this.extractWithOpenAI(prompt);
    } else {
      // Auto-fallback cascade: Nano -> Gemini API -> OpenAI API
      try {
        if (typeof window !== 'undefined' && window.ai?.languageModel) {
          return await this.extractWithGeminiNano(prompt);
        }
      } catch (_) {}

      if (this.geminiApiKey) {
        return await this.extractWithGeminiAPI(prompt);
      } else if (this.openaiApiKey) {
        return await this.extractWithOpenAI(prompt);
      }
    }

    return null;
  }
}

if (typeof window !== 'undefined') {
  window.AIService = AIService;
}
