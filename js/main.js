/* ===== Dice Roller - Main Application ===== */
(function() {
  'use strict';

  // ===== State =====
  const state = {
    diceCount: 1,
    results: [],
    history: [],
    theme: 'dark',
    isRolling: false
  };

  // ===== DOM Elements =====
  const elements = {
    diceCountValue: document.getElementById('dice-count-value'),
    diceMinus: document.getElementById('dice-minus'),
    dicePlus: document.getElementById('dice-plus'),
    rollBtn: document.getElementById('roll-btn'),
    diceArea: document.getElementById('dice-area'),
    totalValue: document.getElementById('total-value'),
    historyList: document.getElementById('history-list'),
    clearHistory: document.getElementById('clear-history'),
    themeToggle: document.getElementById('theme-toggle')
  };

  // ===== LocalStorage =====
  function saveState() {
    try {
      localStorage.setItem('diceRoller_state', JSON.stringify({
        diceCount: state.diceCount,
        theme: state.theme,
        history: state.history.slice(-50)
      }));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  }

  function loadState() {
    try {
      const saved = localStorage.getItem('diceRoller_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        state.diceCount = parsed.diceCount || 1;
        state.theme = parsed.theme || 'dark';
        state.history = parsed.history || [];
      }
    } catch (e) {
      console.warn('Failed to load from localStorage:', e);
    }
  }

  // ===== Crypto Random =====
  function getRandomInt(min, max) {
    const range = max - min + 1;
    const maxValid = Math.pow(2, 32) - (Math.pow(2, 32) % range);
    let value;
    do {
      const buffer = new Uint32Array(1);
      crypto.getRandomValues(buffer);
      value = buffer[0];
    } while (value >= maxValid);
    return min + (value % range);
  }

  // ===== Dice Face Patterns =====
  const diceFaces = {
    1: [0,0,0,0,1,0,0,0,0],
    2: [0,0,1,0,0,0,1,0,0],
    3: [0,0,1,0,1,0,1,0,0],
    4: [1,0,1,0,0,0,1,0,1],
    5: [1,0,1,0,1,0,1,0,1],
    6: [1,0,1,1,0,1,1,0,1]
  };

  // ===== Render Functions =====
  function createDieElement(value) {
    const die = document.createElement('div');
    die.className = 'die';
    die.setAttribute('role', 'img');
    die.setAttribute('aria-label', `Die showing ${value}`);
    die.setAttribute('tabindex', '0');

    const pattern = diceFaces[value];
    for (let i = 0; i < 9; i++) {
      const dot = document.createElement('div');
      dot.className = 'die-dot' + (pattern[i] ? ' active' : '');
      die.appendChild(dot);
    }

    return die;
  }

  function renderDice(results) {
    elements.diceArea.innerHTML = '';
    results.forEach(value => {
      elements.diceArea.appendChild(createDieElement(value));
    });
  }

  function renderHistory() {
    if (state.history.length === 0) {
      elements.historyList.innerHTML = '<p class="placeholder-text">No rolls yet</p>';
      return;
    }

    elements.historyList.innerHTML = '';
    const recent = state.history.slice(-10).reverse();

    recent.forEach((roll, index) => {
      const item = document.createElement('div');
      item.className = 'history-item';

      const diceContainer = document.createElement('div');
      diceContainer.className = 'history-dice';

      roll.dice.forEach(value => {
        const die = document.createElement('div');
        die.className = 'history-die';
        const pattern = diceFaces[value];
        for (let i = 0; i < 9; i++) {
          const dot = document.createElement('div');
          dot.className = 'die-dot' + (pattern[i] ? ' active' : '');
          die.appendChild(dot);
        }
        diceContainer.appendChild(die);
      });

      const totalSpan = document.createElement('span');
      totalSpan.className = 'history-total';
      totalSpan.textContent = `= ${roll.total}`;

      const timeSpan = document.createElement('span');
      timeSpan.className = 'history-time';
      timeSpan.textContent = roll.time;

      item.appendChild(diceContainer);
      item.appendChild(totalSpan);
      item.appendChild(timeSpan);
      elements.historyList.appendChild(item);
    });
  }

  function updateTotal(results) {
    const total = results.reduce((sum, val) => sum + val, 0);
    elements.totalValue.textContent = total;
    return total;
  }

  // ===== Roll Logic =====
  function rollDice() {
    if (state.isRolling) return;

    state.isRolling = true;
    elements.rollBtn.disabled = true;
    elements.diceArea.innerHTML = '';

    // Clear previous results
    state.results = [];

    // Create dice elements with rolling animation
    for (let i = 0; i < state.diceCount; i++) {
      const die = document.createElement('div');
      die.className = 'die rolling';
      die.setAttribute('role', 'img');
      die.setAttribute('aria-label', 'Rolling...');
      die.setAttribute('tabindex', '0');

      // Show random faces during animation
      let flickerCount = 0;
      const flickerInterval = setInterval(() => {
        const randomFace = getRandomInt(1, 6);
        const pattern = diceFaces[randomFace];
        die.innerHTML = '';
        for (let j = 0; j < 9; j++) {
          const dot = document.createElement('div');
          dot.className = 'die-dot' + (pattern[j] ? ' active' : '');
          die.appendChild(dot);
        }
        flickerCount++;
        if (flickerCount > 8) {
          clearInterval(flickerInterval);
        }
      }, 60);

      elements.diceArea.appendChild(die);
    }

    // After animation, show final results
    setTimeout(() => {
      const results = [];
      for (let i = 0; i < state.diceCount; i++) {
        results.push(getRandomInt(1, 6));
      }

      state.results = results;
      renderDice(results);
      updateTotal(results);

      // Add to history
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      state.history.push({
        dice: [...results],
        total: results.reduce((s, v) => s + v, 0),
        time: timeStr
      });

      saveState();
      renderHistory();

      state.isRolling = false;
      elements.rollBtn.disabled = false;
    }, 500);
  }

  // ===== Event Listeners =====
  function setupEventListeners() {
    // Roll button
    elements.rollBtn.addEventListener('click', rollDice);
    elements.rollBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        rollDice();
      }
    });

    // Dice count controls
    elements.diceMinus.addEventListener('click', () => {
      if (state.diceCount > 1) {
        state.diceCount--;
        updateDiceCountDisplay();
        saveState();
      }
    });

    elements.dicePlus.addEventListener('click', () => {
      if (state.diceCount < 10) {
        state.diceCount++;
        updateDiceCountDisplay();
        saveState();
      }
    });

    // Clear history
    elements.clearHistory.addEventListener('click', () => {
      if (confirm('Clear all roll history?')) {
        state.history = [];
        saveState();
        renderHistory();
      }
    });

    // Theme toggle
    elements.themeToggle.addEventListener('click', () => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      applyTheme();
      saveState();
    });

    // Keyboard shortcut: Space to roll
    document.addEventListener('keydown', (e) => {
      if (e.key === ' ' && !e.target.closest('input, button, select, textarea')) {
        e.preventDefault();
        rollDice();
      }
    });
  }

  function updateDiceCountDisplay() {
    elements.diceCountValue.textContent = state.diceCount;
  }

  // ===== Theme =====
  function applyTheme() {
    document.documentElement.setAttribute('data-theme', state.theme);
    const themeColor = state.theme === 'dark' ? '#1a1a2e' : '#f0f0f5';
    document.querySelector('meta[name="theme-color"]').setAttribute('content', themeColor);
  }

  // ===== PWA Installation =====
  let deferredPrompt;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
  });

  // ===== Initialize =====
  function init() {
    loadState();
    applyTheme();
    updateDiceCountDisplay();
    renderHistory();
    setupEventListeners();

    // Register service worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((reg) => {
            console.log('SW registered:', reg.scope);
          })
          .catch((err) => {
            console.warn('SW registration failed:', err);
          });
      });
    }

    // Request notification permission for install prompt
    if (deferredPrompt) {
      // Could show a custom install button here
      console.log('App can be installed');
    }
  }

  // Start the app
  init();

})();
