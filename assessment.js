/**
 * SHADOWPROOF ASSESSMENT ENGINE
 * Shared knowledge check + badge system for all modules.
 *
 * Usage in a module:
 *   1. Include this script: <script src="assessment.js"></script>
 *   2. Add a container div: <div id="shadowproof-assessment"></div>
 *   3. Call: ShadowproofAssessment.init({ moduleId: 'aitm', moduleTitle: 'Ghost Session', questions: [...], onPass: fn })
 *
 * Each question object:
 *   { question: 'text', options: ['a','b','c','d'], correct: 0, explanation: 'why' }
 */

(function() {
  const PROFILE_KEY = 'shadowproof_profile_v1';
  const PROGRESS_KEY = 'shadowproof_progress_v1';
  const BADGES_KEY = 'shadowproof_badges_v1';
  const PASS_THRESHOLD = 3; // 3 of 4 correct to pass

  function getProfile() {
    try { return JSON.parse(localStorage.getItem(PROFILE_KEY) || 'null'); }
    catch { return null; }
  }

  function requireProfile() {
    const p = getProfile();
    if (!p) {
      window.location.href = 'signin.html';
      return null;
    }
    return p;
  }

  function saveBadge(moduleId, moduleTitle, score, total) {
    try {
      const badges = JSON.parse(localStorage.getItem(BADGES_KEY) || '{}');
      badges[moduleId] = {
        moduleId,
        moduleTitle,
        earnedAt: Date.now(),
        score,
        total,
        badgeId: `SHDW-${moduleId.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`
      };
      localStorage.setItem(BADGES_KEY, JSON.stringify(badges));
      return badges[moduleId];
    } catch (e) {
      console.error('Could not save badge', e);
      return null;
    }
  }

  function saveProgress(moduleId, badge) {
    try {
      const p = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}');
      p[moduleId] = {
        completed: true,
        ts: Date.now(),
        badgeId: badge ? badge.badgeId : null,
        score: badge ? badge.score : null
      };
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
    } catch (e) {}
  }

  // Styles injected into the page — scoped with .sp- prefix to avoid collisions
  const styles = `
    .sp-assessment {
      background: rgba(0,0,0,0.4);
      border: 2px solid #00b873;
      border-radius: 4px;
      padding: 40px;
      margin: 40px 0;
      font-family: 'JetBrains Mono', monospace, system-ui, sans-serif;
      color: #e8eef2;
      max-width: 900px;
      position: relative;
    }
    .sp-assessment * { box-sizing: border-box; }
    .sp-header {
      display: flex; justify-content: space-between; align-items: center;
      padding-bottom: 20px; border-bottom: 1px dashed rgba(0, 255, 159, 0.3);
      margin-bottom: 32px;
    }
    .sp-title {
      font-family: 'Fraunces', 'Georgia', serif;
      font-size: 28px; font-weight: 700; letter-spacing: -0.02em;
      line-height: 1.1;
    }
    .sp-title-italic { font-style: italic; color: #00ff9f; }
    .sp-badge-preview {
      display: flex; align-items: center; gap: 8px;
      font-size: 10px; color: #8a9ba8; letter-spacing: 0.15em;
      text-transform: uppercase;
    }
    .sp-badge-icon {
      width: 32px; height: 32px; opacity: 0.4;
    }
    .sp-progress-row {
      display: flex; gap: 6px; margin-bottom: 24px;
    }
    .sp-progress-dot {
      flex: 1; height: 4px; background: #243038; border-radius: 2px;
      transition: background 0.3s;
    }
    .sp-progress-dot.active { background: #00ff9f; box-shadow: 0 0 8px rgba(0,255,159,0.5); }
    .sp-progress-dot.done { background: #00b873; }
    .sp-progress-dot.wrong { background: #ff4757; }

    .sp-q-number {
      font-size: 10px; letter-spacing: 0.2em; color: #00ff9f;
      margin-bottom: 12px; font-weight: 600;
    }
    .sp-q-text {
      font-family: 'Fraunces', Georgia, serif;
      font-size: 22px; line-height: 1.4; font-weight: 500;
      margin-bottom: 28px; color: #e8eef2;
    }
    .sp-options { display: grid; gap: 10px; }
    .sp-option {
      display: flex; align-items: flex-start; gap: 14px;
      padding: 14px 18px;
      background: rgba(19, 26, 32, 0.6);
      border: 1px solid #243038;
      color: #e8eef2;
      font-family: inherit; font-size: 14px; line-height: 1.5;
      cursor: pointer; text-align: left;
      transition: all 0.15s;
      width: 100%;
    }
    .sp-option:hover:not(:disabled) {
      background: rgba(0, 255, 159, 0.08);
      border-color: #00b873;
    }
    .sp-option-letter {
      font-family: 'Fraunces', Georgia, serif;
      font-style: italic; font-weight: 700; font-size: 18px;
      color: #00ff9f; min-width: 20px;
      line-height: 1.4;
    }
    .sp-option:disabled { cursor: default; opacity: 0.7; }
    .sp-option.correct {
      background: rgba(0, 184, 115, 0.15);
      border-color: #00ff9f;
      color: #e8eef2;
    }
    .sp-option.wrong {
      background: rgba(255, 71, 87, 0.15);
      border-color: #ff4757;
      color: #e8eef2;
    }
    .sp-option.correct .sp-option-letter { color: #00ff9f; }
    .sp-option.wrong .sp-option-letter { color: #ff4757; }

    .sp-explanation {
      margin-top: 20px; padding: 16px 20px;
      background: rgba(19, 26, 32, 0.8);
      border-left: 3px solid #00ff9f;
      font-size: 13px; line-height: 1.6;
      color: #b8c5cf;
      display: none; animation: spFadeIn 0.3s ease;
    }
    .sp-explanation.wrong { border-left-color: #ff4757; }
    .sp-explanation.show { display: block; }
    .sp-explanation strong { color: #e8eef2; }
    @keyframes spFadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }

    .sp-next-btn {
      margin-top: 20px; padding: 12px 24px;
      background: #00ff9f; color: #0a0d10;
      border: none; font-family: inherit; font-size: 11px;
      font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase;
      cursor: pointer; transition: all 0.15s;
    }
    .sp-next-btn:hover { background: #e8eef2; box-shadow: 0 0 20px rgba(0,255,159,0.4); }

    /* RESULT STATES */
    .sp-result {
      text-align: center; padding: 20px 0;
      animation: spFadeIn 0.4s ease;
    }
    .sp-result-score {
      font-family: 'Fraunces', Georgia, serif;
      font-size: 72px; font-weight: 800; line-height: 1;
      margin-bottom: 8px;
    }
    .sp-result-score.pass { color: #00ff9f; }
    .sp-result-score.fail { color: #ff4757; }
    .sp-result-score .of {
      color: #5a6b78; font-size: 32px;
    }
    .sp-result-title {
      font-family: 'Fraunces', Georgia, serif;
      font-size: 32px; font-weight: 700; margin-bottom: 12px;
    }
    .sp-result-title .italic { font-style: italic; color: #00ff9f; }
    .sp-result-sub {
      color: #8a9ba8; max-width: 500px;
      margin: 0 auto 32px; font-size: 14px; line-height: 1.6;
    }
    .sp-result-actions {
      display: flex; gap: 12px; justify-content: center;
      flex-wrap: wrap;
    }
    .sp-btn {
      padding: 14px 28px; background: transparent;
      border: 1px solid #243038; color: #e8eef2;
      font-family: inherit; font-size: 11px;
      letter-spacing: 0.2em; text-transform: uppercase; cursor: pointer;
      text-decoration: none; display: inline-block; font-weight: 600;
      transition: all 0.15s;
    }
    .sp-btn:hover { border-color: #00ff9f; color: #00ff9f; }
    .sp-btn.primary {
      background: #00ff9f; color: #0a0d10; border-color: #00ff9f;
    }
    .sp-btn.primary:hover {
      background: #e8eef2; border-color: #e8eef2; color: #0a0d10;
      box-shadow: 0 0 20px rgba(0,255,159,0.4);
    }

    /* BADGE ANIMATION */
    .sp-badge-earned {
      display: flex; flex-direction: column; align-items: center;
      margin: 32px 0;
      animation: spBadgeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    }
    @keyframes spBadgeIn {
      0% { opacity: 0; transform: scale(0.5) rotate(-10deg); }
      100% { opacity: 1; transform: scale(1) rotate(0); }
    }
    .sp-badge-earned svg {
      width: 180px; height: 180px;
      filter: drop-shadow(0 0 30px rgba(0, 255, 159, 0.5));
    }
    .sp-badge-id {
      font-family: 'JetBrains Mono', monospace; font-size: 10px;
      color: #5a6b78; letter-spacing: 0.15em;
      margin-top: 16px; text-transform: uppercase;
    }

    .sp-intro-panel {
      text-align: center; padding: 20px 0;
    }
    .sp-intro-icon {
      font-size: 48px; margin-bottom: 16px;
    }
    .sp-intro-body {
      color: #8a9ba8; max-width: 520px;
      margin: 0 auto 28px; line-height: 1.6; font-size: 14px;
    }
  `;

  function injectStyles() {
    if (document.getElementById('sp-assessment-styles')) return;
    const s = document.createElement('style');
    s.id = 'sp-assessment-styles';
    s.textContent = styles;
    document.head.appendChild(s);
  }

  // Badge SVG generator — creates a unique badge based on module
  function generateBadgeSVG(moduleId, moduleTitle) {
    const badges = {
      'aitm': { icon: '👻', label: 'GHOST SESSION', color: '#00ff9f', bg: '#0a0d10' },
      'bec': { icon: '💼', label: 'THE CEO TEXT', color: '#b8322b', bg: '#f4efe6' },
      'smishing': { icon: '📱', label: 'SILENT SIGNAL', color: '#ffb020', bg: '#0a0806' },
      'quishing': { icon: '🔲', label: 'PAINTED DOOR', color: '#d63838', bg: '#f8f4ec' },
      'vishing': { icon: '📞', label: 'VOICE ON LINE', color: '#d4a656', bg: '#1a1512' },
      'mfa-fatigue': { icon: '🔔', label: 'ENDLESS KNOCKING', color: '#5ab9ff', bg: '#0a0d18' },
      'oauth': { icon: '🎫', label: 'HANDED KEY', color: '#b48fff', bg: '#0a0810' },
      'passwords': { icon: '🗝️', label: 'MASTER KEY', color: '#40ff8a', bg: '#0a1010' },
      'usb': { icon: '💾', label: 'GIFT NOBODY SENT', color: '#ffb84d', bg: '#100a08' },
      'wifi': { icon: '📶', label: 'OPEN WINDOW', color: '#5ab9ff', bg: '#0a1018' },
      'social-eng': { icon: '🚪', label: 'HELD DOOR', color: '#ffb020', bg: '#100a08' },
      'insider': { icon: '📁', label: 'CARELESS HAND', color: '#b48fff', bg: '#0a0810' },
      'ransomware': { icon: '🔒', label: 'LOCKED DOOR', color: '#ff4757', bg: '#0a0508' },
      'deepfake': { icon: '🎭', label: 'PERFECT COPY', color: '#b48fff', bg: '#0a0810' },
      'home-network': { icon: '🏠', label: 'HOME FRONT', color: '#40ff8a', bg: '#0a1010' },
      'reporting': { icon: '🚨', label: 'FIRST NINE MINUTES', color: '#ff4757', bg: '#100508' }
    };
    const b = badges[moduleId] || { icon: '⚡', label: moduleTitle.toUpperCase(), color: '#00ff9f', bg: '#0a0d10' };

    return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg-${moduleId}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${b.bg}"/>
          <stop offset="100%" stop-color="${b.bg}" stop-opacity="0.8"/>
        </linearGradient>
        <filter id="glow-${moduleId}"><feGaussianBlur stdDeviation="2"/></filter>
      </defs>
      <!-- Outer ring -->
      <polygon points="100,10 175,55 175,145 100,190 25,145 25,55"
        fill="url(#bg-${moduleId})" stroke="${b.color}" stroke-width="3"/>
      <!-- Inner ring -->
      <polygon points="100,25 160,60 160,140 100,175 40,140 40,60"
        fill="none" stroke="${b.color}" stroke-width="1" opacity="0.5"/>
      <!-- Center circle for icon -->
      <circle cx="100" cy="90" r="30" fill="${b.color}" opacity="0.1" stroke="${b.color}" stroke-width="1.5"/>
      <!-- Icon (emoji) -->
      <text x="100" y="102" text-anchor="middle" font-size="34" fill="${b.color}">${b.icon}</text>
      <!-- Label -->
      <text x="100" y="145" text-anchor="middle" font-family="monospace" font-size="10" font-weight="700"
        fill="${b.color}" letter-spacing="1.5">${b.label}</text>
      <text x="100" y="160" text-anchor="middle" font-family="monospace" font-size="7"
        fill="${b.color}" opacity="0.7" letter-spacing="2">SHADOWPROOF</text>
      <!-- Corner marks -->
      <circle cx="100" cy="15" r="3" fill="${b.color}"/>
      <circle cx="100" cy="185" r="2" fill="${b.color}" opacity="0.6"/>
    </svg>`;
  }

  // MAIN INIT
  window.ShadowproofAssessment = {
    init: function(config) {
      const profile = requireProfile();
      if (!profile) return;

      injectStyles();

      const container = document.getElementById(config.containerId || 'shadowproof-assessment');
      if (!container) {
        console.error('Assessment container not found');
        return;
      }

      const state = {
        moduleId: config.moduleId,
        moduleTitle: config.moduleTitle,
        questions: config.questions,
        currentQ: 0,
        answers: [],
        score: 0,
        onPass: config.onPass || function() {},
        onFail: config.onFail || function() {},
        started: false
      };

      render();

      function render() {
        if (!state.started) {
          container.innerHTML = renderIntro();
          return;
        }
        if (state.currentQ >= state.questions.length) {
          renderResult();
          return;
        }
        renderQuestion();
      }

      function renderIntro() {
        return `
          <div class="sp-assessment">
            <div class="sp-header">
              <div class="sp-title">Knowledge <span class="sp-title-italic">check.</span></div>
              <div class="sp-badge-preview">
                <div class="sp-badge-icon">${generateBadgeSVG(state.moduleId, state.moduleTitle).replace('<svg', '<svg style="width:32px;height:32px;opacity:0.5"')}</div>
                Pass to earn badge
              </div>
            </div>
            <div class="sp-intro-panel">
              <div class="sp-intro-icon">🎯</div>
              <div style="font-family:'Fraunces',Georgia,serif;font-size:24px;font-weight:600;margin-bottom:12px;">
                Four questions. <span style="font-style:italic;color:#00ff9f;">Three to pass.</span>
              </div>
              <div class="sp-intro-body">
                Quick check to make sure the key patterns stuck. You'll see the correct answer with an explanation after each question. No time limit, unlimited retakes if you don't pass.
              </div>
              <button class="sp-btn primary" onclick="window.__spAssess.start()">Begin Assessment →</button>
            </div>
          </div>
        `;
      }

      function renderQuestion() {
        const q = state.questions[state.currentQ];
        const dots = state.questions.map((_, i) => {
          let cls = '';
          if (i < state.currentQ) {
            cls = state.answers[i] === state.questions[i].correct ? 'done' : 'wrong';
          } else if (i === state.currentQ) cls = 'active';
          return `<div class="sp-progress-dot ${cls}"></div>`;
        }).join('');

        container.innerHTML = `
          <div class="sp-assessment">
            <div class="sp-header">
              <div class="sp-title">Knowledge <span class="sp-title-italic">check.</span></div>
              <div class="sp-badge-preview">${state.moduleTitle.toUpperCase()}</div>
            </div>
            <div class="sp-progress-row">${dots}</div>
            <div class="sp-q-number">Question ${state.currentQ + 1} of ${state.questions.length}</div>
            <div class="sp-q-text">${q.question}</div>
            <div class="sp-options" id="spOptions">
              ${q.options.map((opt, i) => `
                <button class="sp-option" data-idx="${i}" onclick="window.__spAssess.answer(${i})">
                  <span class="sp-option-letter">${String.fromCharCode(65 + i)}.</span>
                  <span>${opt}</span>
                </button>
              `).join('')}
            </div>
            <div class="sp-explanation" id="spExplanation"></div>
          </div>
        `;
      }

      function renderResult() {
        const passed = state.score >= PASS_THRESHOLD;
        let badge = null;
        if (passed) {
          badge = saveBadge(state.moduleId, state.moduleTitle, state.score, state.questions.length);
          saveProgress(state.moduleId, badge);
        }

        container.innerHTML = `
          <div class="sp-assessment">
            <div class="sp-result">
              <div class="sp-result-score ${passed ? 'pass' : 'fail'}">${state.score}<span class="of">/${state.questions.length}</span></div>
              <div class="sp-result-title">${passed ? '<span class="italic">Passed.</span>' : 'Not quite yet.'}</div>
              <div class="sp-result-sub">
                ${passed
                  ? 'You showed the key patterns for this module. Your badge has been saved to your profile.'
                  : `You need ${PASS_THRESHOLD} of ${state.questions.length} correct to pass. Give it another go — the questions will stay the same so you can lock them in.`}
              </div>
              ${passed ? `
                <div class="sp-badge-earned">
                  ${generateBadgeSVG(state.moduleId, state.moduleTitle)}
                  <div class="sp-badge-id">BADGE ID: ${badge?.badgeId || '—'}</div>
                </div>
              ` : ''}
              <div class="sp-result-actions">
                ${passed
                  ? `<a href="index.html" class="sp-btn primary">Return to Suite →</a>
                     <button class="sp-btn" onclick="window.__spAssess.reset()">Retake for Practice</button>`
                  : `<button class="sp-btn primary" onclick="window.__spAssess.reset()">Try Again →</button>
                     <a href="index.html" class="sp-btn">Back to Suite</a>`
                }
              </div>
            </div>
          </div>
        `;

        if (passed) state.onPass(badge);
        else state.onFail(state.score);
      }

      // Expose control API
      window.__spAssess = {
        start: function() {
          state.started = true;
          state.currentQ = 0;
          state.answers = [];
          state.score = 0;
          render();
          container.scrollIntoView({ behavior: 'smooth', block: 'start' });
        },
        answer: function(idx) {
          const q = state.questions[state.currentQ];
          state.answers[state.currentQ] = idx;
          const correct = idx === q.correct;
          if (correct) state.score++;

          // Disable all options, mark answers
          document.querySelectorAll('.sp-option').forEach((el, i) => {
            el.disabled = true;
            if (i === q.correct) el.classList.add('correct');
            if (i === idx && !correct) el.classList.add('wrong');
          });

          // Show explanation
          const exp = document.getElementById('spExplanation');
          exp.innerHTML = `
            <strong style="color:${correct ? '#00ff9f' : '#ff4757'};">${correct ? '✓ Correct.' : '✗ Not quite.'}</strong>
            ${q.explanation}
            <div style="margin-top:16px;">
              <button class="sp-next-btn" onclick="window.__spAssess.next()">
                ${state.currentQ === state.questions.length - 1 ? 'See Results →' : 'Next Question →'}
              </button>
            </div>
          `;
          exp.classList.add('show');
          if (!correct) exp.classList.add('wrong');
        },
        next: function() {
          state.currentQ++;
          render();
        },
        reset: function() {
          state.started = true;
          state.currentQ = 0;
          state.answers = [];
          state.score = 0;
          render();
          container.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      };
    }
  };
})();
