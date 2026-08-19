// Dedicated, High-Precision Platform Parsers for Top 20+ Job Boards & ATS Platforms
// Custom tailored for: Y Combinator, iCIMS, Ashby, Greenhouse, LinkedIn, Indeed, Lever, Workday, etc.

const PORTAL_SELECTORS = {
  // 1. LinkedIn (Job search feed, single job view, collections, easy apply)
  linkedin: {
    name: 'LinkedIn',
    hostnames: ['linkedin.com'],
    jobTitleSelectors: [
      '.job-details-jobs-unified-top-card__job-title',
      '.jobs-unified-top-card__job-title',
      'h1.t-24',
      '.topcard__title',
      '.jobs-details__main-content h1',
      '.jobs-search__job-details--container h1'
    ],
    companySelectors: [
      '.job-details-jobs-unified-top-card__company-name',
      '.jobs-unified-top-card__company-name',
      '.topcard__flavor:first-child',
      '.jobs-details-top-card__company-url'
    ],
    descriptionSelectors: [
      '.jobs-search__job-details #job-details',
      '.scaffold-layout__detail #job-details',
      '.jobs-description-content__text',
      '#job-details',
      '.jobs-box__html-content',
      '.jobs-description__container',
      '.show-more-less-html__markup',
      '.jobs-description'
    ]
  },

  // 2. Indeed (Standard, SimpleApply, Mobile view)
  indeed: {
    name: 'Indeed',
    hostnames: ['indeed.com'],
    jobTitleSelectors: [
      'h1.jobsearch-JobInfoHeader-title',
      '[data-testid="simpler-jobTitle"]',
      'h2.jobTitle',
      'h1[data-testid="jobsearch-JobInfoHeader-title"]',
      '.jobsearch-JobInfoHeader-title-container h1'
    ],
    companySelectors: [
      '[data-testid="inlineHeader-companyName"]',
      '.jobsearch-InlineCompanyRating-companyHeader',
      '[data-testid="jobsearch-CompanyAvatar-button"]',
      '.jobsearch-JobInfoHeader-companyNameLink'
    ],
    descriptionSelectors: [
      '#jobDescriptionText',
      '.jobsearch-jobDescriptionText',
      '.jobsearch-JobComponent-description',
      '#jobDescriptionSection'
    ]
  },

  // 3. Y Combinator (Work at a Startup & YC Jobs)
  ycombinator: {
    name: 'Y Combinator',
    hostnames: ['workatastartup.com', 'ycombinator.com'],
    jobTitleSelectors: [
      'h1.company-title',
      'h1.job-title',
      '.job-name h1',
      '.company-header h1',
      'h1.font-bold'
    ],
    companySelectors: [
      '.company-name',
      '.company-details h2',
      '.company-header h2',
      'h2.font-medium'
    ],
    descriptionSelectors: [
      '.job-description',
      '.job-details',
      '.company-description',
      '.content-container',
      '.job-overview',
      '[data-test="job-description"]'
    ]
  },

  // 4. iCIMS ATS (Enterprise ATS Portal)
  icims: {
    name: 'iCIMS',
    hostnames: ['icims.com'],
    jobTitleSelectors: [
      '.iCIMS_Header h1',
      '.iCIMS_JobHeader h1',
      '.iCIMS_JobTitle',
      'h1.title',
      '.iCIMS_SubHeader h1'
    ],
    companySelectors: [
      '.iCIMS_CompanyHeader',
      '.iCIMS_CompanyName',
      '.company-name',
      '.iCIMS_JobHeader .iCIMS_SubHeader'
    ],
    descriptionSelectors: [
      '.iCIMS_JobContent',
      '.iCIMS_JobDescription',
      '#iCIMS_JobContent',
      '.iCIMS_Expandable_Content',
      '.iCIMS_JobData'
    ]
  },

  // 5. Ashby ATS (Modern Tech Startup ATS)
  ashby: {
    name: 'Ashby',
    hostnames: ['ashbyhq.com', 'jobs.ashbyhq.com'],
    jobTitleSelectors: [
      'h1',
      '._heading_10l3e_1',
      '._title_10l3e_1',
      '[data-testid="job-title"]',
      'h1._title_'
    ],
    companySelectors: [
      '._companyName_10l3e_13',
      '._company_10l3e_1',
      '[data-testid="company-name"]',
      'a._companyLink_'
    ],
    descriptionSelectors: [
      '._description_10l3e_43',
      '._jobPostingDescription_10l3e_1',
      '[data-testid="job-description"]',
      '._body_10l3e_1',
      '._descriptionContainer_'
    ]
  },

  // 6. Greenhouse ATS
  greenhouse: {
    name: 'Greenhouse',
    hostnames: ['greenhouse.io', 'boards.greenhouse.io', 'job-boards.greenhouse.io'],
    jobTitleSelectors: [
      '.app-title',
      'h1.job-title',
      '.job__title',
      'h1#app_title',
      '#header h1'
    ],
    companySelectors: [
      '.company-name',
      '.header__logo-container',
      '.org-name',
      '.company'
    ],
    descriptionSelectors: [
      '#content',
      '#job-body',
      '.job-description',
      '#app-body',
      '.body--medium'
    ]
  },

  // 7. Lever ATS
  lever: {
    name: 'Lever',
    hostnames: ['lever.co', 'jobs.lever.co'],
    jobTitleSelectors: [
      '.posting-headline h2',
      'h2.posting-headline',
      'h1',
      '.posting-title'
    ],
    companySelectors: [
      '.main-header-logo',
      '.posting-headline .main-header-logo',
      '.header-company-name'
    ],
    descriptionSelectors: [
      '.section-wrapper .section[data-qa="job-description"]',
      '.posting-sections',
      '.content',
      '.section-wrapper'
    ]
  },

  // 8. Workday ATS
  workday: {
    name: 'Workday',
    hostnames: ['myworkdayjobs.com', 'workday.com'],
    jobTitleSelectors: [
      '[data-automation-id="jobPostingHeader"]',
      'h1[data-automation-id="jobTitle"]',
      'h2[data-automation-id="jobPostingHeader"]'
    ],
    companySelectors: [
      '[data-automation-id="companyName"]',
      '.css-1q2s0gq'
    ],
    descriptionSelectors: [
      '[data-automation-id="jobPostingDescription"]',
      '.css-ky584b',
      '[data-automation-id="job-posting-details"]'
    ]
  },

  // 9. SmartRecruiters ATS
  smartrecruiters: {
    name: 'SmartRecruiters',
    hostnames: ['smartrecruiters.com', 'jobs.smartrecruiters.com'],
    jobTitleSelectors: [
      '.job-title',
      'h1.details-title',
      'h1.job-header__title'
    ],
    companySelectors: [
      '.company-name',
      '.details-company-name'
    ],
    descriptionSelectors: [
      '#job-details',
      '.job-sections',
      '.job-description',
      '.job-detail__description'
    ]
  },

  // 10. Glassdoor
  glassdoor: {
    name: 'Glassdoor',
    hostnames: ['glassdoor.com'],
    jobTitleSelectors: [
      'h1.heading_Heading__Katq4',
      '.JobDetails_jobTitle__Rw_gn',
      '[data-test="job-title"]'
    ],
    companySelectors: [
      '.EmployerProfile_compactEmployerName__9MGcV',
      '[data-test="employer-name"]'
    ],
    descriptionSelectors: [
      '.JobDetails_jobDescription__uW_fK',
      '#JobDescriptionContainer',
      '.jobDescriptionContent'
    ]
  },

  // 11. Wellfound / AngelList
  wellfound: {
    name: 'Wellfound',
    hostnames: ['wellfound.com', 'angel.co'],
    jobTitleSelectors: [
      'h1.text-xl',
      '.styles_header__34Nls h1',
      'h1'
    ],
    companySelectors: [
      '.styles_startupName__N3Xz2',
      'h2.text-md'
    ],
    descriptionSelectors: [
      '.styles_description__3eA_8',
      '.styles_jobDescription__m0i2o',
      '[data-test="JobDescription"]'
    ]
  },

  // 12. ZipRecruiter
  ziprecruiter: {
    name: 'ZipRecruiter',
    hostnames: ['ziprecruiter.com'],
    jobTitleSelectors: [
      'h1.job_title',
      '.job_header_text h1'
    ],
    companySelectors: [
      '.hiring_company_text',
      '.company_name'
    ],
    descriptionSelectors: [
      '.job_description',
      '.jobDescriptionSection'
    ]
  },

  // 13. Dice
  dice: {
    name: 'Dice',
    hostnames: ['dice.com'],
    jobTitleSelectors: [
      'h1[data-cy="jobTitle"]',
      'h1.job-title'
    ],
    companySelectors: [
      '[data-cy="companyName"]',
      '.company-name'
    ],
    descriptionSelectors: [
      '#jobDescription',
      '[data-cy="jobDescription"]',
      '.job-details'
    ]
  },

  // 14. BambooHR
  bamboohr: {
    name: 'BambooHR',
    hostnames: ['bamboohr.com'],
    jobTitleSelectors: [
      '.jss-job-title',
      'h2.pos-title'
    ],
    companySelectors: [
      '.jss-company-name',
      '.header-logo'
    ],
    descriptionSelectors: [
      '.jss-job-description',
      '.pos-description',
      '#job-description'
    ]
  },

  // 15. Rippling
  rippling: {
    name: 'Rippling',
    hostnames: ['rippling.com', 'ats.rippling.com'],
    jobTitleSelectors: [
      'h1',
      '.job-posting-header h1'
    ],
    companySelectors: [
      '.company-name',
      'h2'
    ],
    descriptionSelectors: [
      '.job-posting-body',
      '.description-content'
    ]
  },

  // 16. Taleo / Oracle Cloud
  taleo: {
    name: 'Oracle Taleo',
    hostnames: ['taleo.net', 'oraclecloud.com'],
    jobTitleSelectors: [
      '.titlelabel',
      '#requisitionDescriptionInterface\\.reqTitleLinkAction\\.row1'
    ],
    companySelectors: [
      '.companylabel',
      '.orglabel'
    ],
    descriptionSelectors: [
      '.editcontentfield',
      '#requisitionDescriptionInterface\\.ID1489\\.row1',
      '.contentpane'
    ]
  }
};

class PortalRegistry {
  static detectPlatform() {
    const currentHost = window.location.hostname.toLowerCase();
    for (const key in PORTAL_SELECTORS) {
      const portal = PORTAL_SELECTORS[key];
      if (portal.hostnames.some(h => currentHost.includes(h))) {
        return { key, ...portal };
      }
    }
    return { key: 'generic', name: 'Career Portal', hostnames: [] };
  }

  // Clean a container by stripping out headers, navbars, sidebars, scripts, and styles
  static cleanContainerText(element) {
    if (!element) return '';

    const clone = element.cloneNode(true);

    const clutterSelectors = [
      'nav', 'header', 'footer', 'aside',
      '.global-nav', '#global-nav',
      '.jobs-search-results-list', '.scaffold-layout__list', '.jobs-search-two-pane__job-section',
      '.jobs-search-results-list__list', '[data-view-name="job-card"]', '.job-card-container',
      '.jobs-search-box', '.jobs-search-results-list__header',
      '.jobs-premium-applicant-insights', '.jobs-premium-applicant-insights__education',
      '.jobs-unified-top-card__applicant-count', '.jobs-applicant-insights',
      '#msg-overlay', '.msg-overlay', '.msg-overlay-list-bubble',
      '.cookie-banner', '.advertisement', '.ad-container',
      'button', 'svg', 'form', 'input', 'script', 'style', 'noscript',
      '.jke-sidebar-container', '#jke-picker-banner'
    ];

    clutterSelectors.forEach(sel => {
      clone.querySelectorAll(sel).forEach(el => el.remove());
    });

    return (clone.innerText || clone.textContent || '').trim();
  }

  static extractJobData() {
    const platform = this.detectPlatform();
    let jobTitle = '';
    let company = '';
    let descriptionText = '';
    let containerElement = null;

    // 1. Try dedicated ATS / Portal selectors first
    if (platform.key !== 'generic') {
      if (platform.jobTitleSelectors) {
        for (const selector of platform.jobTitleSelectors) {
          const el = document.querySelector(selector);
          if (el && el.innerText && el.innerText.trim()) {
            jobTitle = el.innerText.trim();
            break;
          }
        }
      }

      if (platform.companySelectors) {
        for (const selector of platform.companySelectors) {
          const el = document.querySelector(selector);
          if (el && el.innerText && el.innerText.trim()) {
            company = el.innerText.trim();
            break;
          }
        }
      }

      if (platform.descriptionSelectors) {
        for (const selector of platform.descriptionSelectors) {
          const el = document.querySelector(selector);
          if (el) {
            const cleanedText = this.cleanContainerText(el);
            if (cleanedText.length > 50) {
              descriptionText = cleanedText;
              containerElement = el;
              break;
            }
          }
        }
      }
    }

    // 2. Universal Extractor: If no dedicated selector, find candidate or scan page body
    if (!descriptionText || descriptionText.length < 50) {
      const fallback = this.extractUniversalFallback();
      if (fallback.text && fallback.text.length > 20) {
        descriptionText = fallback.text;
        containerElement = fallback.element;
      }
    }

    // If still empty, fall back directly to cleaned document.body
    if (!descriptionText && document.body) {
      descriptionText = this.cleanContainerText(document.body);
      containerElement = document.body;
    }

    if (!jobTitle) {
      const titleMatch = descriptionText.match(/(?:Job Title|Position Title|Position|Role)\s*:\s*([^\n\r]+)/i);
      if (titleMatch && titleMatch[1]) {
        jobTitle = titleMatch[1].trim();
      } else {
        jobTitle = document.querySelector('h1')?.innerText?.trim() ||
                   document.querySelector('h2')?.innerText?.trim() ||
                   document.title.split(/[-|•–]/)[0].trim() || 'Job Posting';
      }
    }

    if (!company) {
      const companyMatch = descriptionText.match(/(?:Location|Company|Employer)\s*:\s*([^\n\r,]+)/i);
      if (companyMatch && companyMatch[1]) {
        company = companyMatch[1].trim();
      } else {
        const host = window.location.hostname.replace('www.', '').split('.')[0];
        company = host.charAt(0).toUpperCase() + host.slice(1);
      }
    }

    return {
      platform: platform.name,
      jobTitle,
      company,
      url: window.location.href,
      descriptionText: descriptionText || '',
      containerElement: containerElement || document.body
    };
  }

  static extractUniversalFallback() {
    const candidateSelectors = [
      'article', 'main', '[role="main"]',
      '.job-description', '.description', '#job-description',
      '.jobsearch-JobComponent-description', '.jobs-description-content',
      '.posting-sections', '#jobDescriptionText', '.careers-content',
      '.job-detail', '.job-post', '.content'
    ];

    const candidates = Array.from(document.querySelectorAll(candidateSelectors.join(',')));
    
    let bestElement = null;
    let maxScore = 0;

    for (const el of candidates) {
      if (el.tagName === 'BODY' || el.tagName === 'HTML' || el.classList.contains('jke-sidebar-container')) continue;

      const cleanedText = this.cleanContainerText(el);
      const length = cleanedText.length;

      if (length > 50 && length < 80000) {
        const lower = cleanedText.toLowerCase();
        let score = length;
        if (lower.includes('job duties') || lower.includes('responsibilit')) score += 600;
        if (lower.includes('requirement') || lower.includes('education')) score += 500;
        if (lower.includes('experience') || lower.includes('skills')) score += 400;

        if (score > maxScore) {
          maxScore = score;
          bestElement = el;
        }
      }
    }

    if (bestElement) {
      return { text: this.cleanContainerText(bestElement), element: bestElement };
    }

    return { text: document.body ? this.cleanContainerText(document.body) : '', element: document.body };
  }
}

if (typeof window !== 'undefined') {
  window.PORTAL_SELECTORS = PORTAL_SELECTORS;
  window.PortalRegistry = PortalRegistry;
}
