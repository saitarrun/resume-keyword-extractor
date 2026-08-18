# ⚡ Job Keyword Extractor - Chrome Extension

A fast, privacy-first, client-side Chrome Extension (Manifest V3) designed to scan job postings, extract essential technical keywords, classify them into **Required**, **Preferred**, and **Other**, and provide interactive in-page highlighting.

---

## ✨ Key Features

- **🎯 Exact Verbatim Text Preservation**: Preserves the exact grammatical spelling, capitalization, and case as written in the job posting (e.g. `Python 3`, `PostgreSQL`, `Distributed Systems`).
- **🛡️ 100% Technical-Only Dictionary**: Zero behavioral fluff or soft skills. Curated exclusively across Programming Languages, AI/ML, Cloud & DevOps, Databases, Systems, Web Frameworks, and Protocols.
- **📊 Precise Scope Categorization**:
  - 🔴 **Required**: Must-have requirements & core qualifications.
  - 🟡 **Preferred**: Nice-to-have, bonus skills, and plus qualifications.
  - ⚪ **Other**: Skills found in the general overview and role responsibilities.
- **🔢 1-to-1 Match Frequency Counter**: Accurately counts the exact occurrence frequency of each term on the live page (e.g. `4x`, `2x`).
- **🎨 Glassmorphism Popup Interface**: Modern translucent UI with frosted glass blur effects, circular check badges, scope filtering, instant keyword dismissal, and one-click copy.
- **🔍 Active Description Isolation**: Highlighting and DOM extraction are strictly scoped to the active job description pane (`#job-details`), completely ignoring search results, recommendation cards, and applicant statistics.
- **⚡ High-Speed Execution**: 10x–15x regex fast-path acceleration parsing large job descriptions in under 5ms.
- **🔒 100% Offline & Private**: Zero external API calls, zero tracking. All NLP classification runs entirely client-side in the browser.

---

## 🌐 Supported Platforms

- **LinkedIn** (Full support for both single-job view and multi-pane search/collections split-view)
- **Indeed** (Standard, SimpleApply, and modal layout)
- **Greenhouse ATS**
- **Lever ATS**
- **Workday Jobs**
- **Ashby ATS**
- **Y Combinator / Work at a Startup**
- **iCIMS Enterprise ATS**
- **Glassdoor**
- **SmartRecruiters**
- **Wellfound / AngelList**
- **Dice & ZipRecruiter**
- **Universal Fallback Engine** (Supports any company career portal)

---

## 🚀 Installation Guide

1. Clone or download this repository:
   ```bash
   git clone https://github.com/saitarrun/job-keyword-extractor-extension.git
   ```
2. Open Google Chrome and navigate to:
   ```text
   chrome://extensions/
   ```
3. Enable **Developer mode** using the toggle in the top-right corner.
4. Click the **Load unpacked** button.
5. Select the `job-keyword-extractor-extension` directory.
6. Pin the extension to your Chrome toolbar.

---

## 🛠️ Tech Stack & Architecture

- **Manifest V3** Chrome Extension
- **Client-Side NLP & Keyword Matching**: Trie structures, boundary-safe regular expressions, longest-alias precedence
- **DOM Parsers**: Scoped TreeWalker, Mutation-free safe text highlighting, CSS clamp remover
- **Styling**: Modern CSS3, Flexbox, Glassmorphism backdrop-filters, custom SVG iconography
