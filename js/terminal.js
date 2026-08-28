'use strict';

/* ============================================================
   terminal.js — Boot Sequence, Typing, Command Palette
   ============================================================ */

/* ── Syntax Highlighter (single-pass tokenizer — no cascading regex) ── */
const SyntaxHL = {
  KEYWORDS: new Set([
    'interface', 'const', 'let', 'var', 'function', 'return',
    'export', 'default', 'import', 'from', 'type', 'class',
    'extends', 'async', 'await', 'string', 'number', 'boolean',
    'null', 'undefined', 'true', 'false', 'new', 'this', 'typeof'
  ]),

  highlightLine(line) {
    if (!line.trim()) return '';

    // Full-line comment
    const trimmed = line.trimStart();
    if (trimmed.startsWith('//')) {
      const indent = line.slice(0, line.length - trimmed.length);
      return this._esc(indent) + `<span class="token-comment">${this._esc(trimmed)}</span>`;
    }

    // Inline comment: find // not inside a string
    let commentStart = -1;
    let inStr = false;
    let strChar = '';
    for (let i = 0; i < line.length; i++) {
      if (inStr) {
        if (line[i] === strChar && line[i - 1] !== '\\') inStr = false;
      } else if (line[i] === '"' || line[i] === "'") {
        inStr = true; strChar = line[i];
      } else if (line[i] === '/' && line[i + 1] === '/') {
        commentStart = i; break;
      }
    }

    const codePart    = commentStart >= 0 ? line.slice(0, commentStart) : line;
    const commentPart = commentStart >= 0 ? line.slice(commentStart) : '';

    let result = this._processCode(codePart);
    if (commentPart) {
      result += `<span class="token-comment">${this._esc(commentPart)}</span>`;
    }
    return result;
  },

  _processCode(text) {
    let result = '';
    let i = 0;

    while (i < text.length) {
      const ch = text[i];

      // String literals: "..." or '...'
      if (ch === '"' || ch === "'") {
        let j = i + 1;
        while (j < text.length && !(text[j] === ch && text[j - 1] !== '\\')) j++;
        const str = text.slice(i, j + 1);
        result += `<span class="token-string">${this._esc(str)}</span>`;
        i = j + 1;
        continue;
      }

      // Words: keywords, types, props, identifiers
      if (/[a-zA-Z_$]/.test(ch)) {
        let j = i;
        while (j < text.length && /[a-zA-Z0-9_$]/.test(text[j])) j++;
        const word = text.slice(i, j);

        // Peek ahead past whitespace for ':'
        let peek = j;
        while (peek < text.length && text[peek] === ' ') peek++;
        const nextCh = text[peek] || '';
        const nextNext = text[peek + 1] || '';

        if (this.KEYWORDS.has(word)) {
          result += `<span class="token-keyword">${this._esc(word)}</span>`;
        } else if (nextCh === ':' && nextNext !== ':') {
          // property key (not :: scope operator)
          result += `<span class="token-prop">${this._esc(word)}</span>`;
        } else if (/^[A-Z]/.test(word)) {
          // PascalCase → type name
          result += `<span class="token-type">${this._esc(word)}</span>`;
        } else {
          result += this._esc(word);
        }
        i = j;
        continue;
      }

      // Numbers
      if (/[0-9]/.test(ch)) {
        let j = i;
        while (j < text.length && /[0-9.]/.test(text[j])) j++;
        result += `<span class="token-number">${this._esc(text.slice(i, j))}</span>`;
        i = j;
        continue;
      }

      // Operators
      if ('=+-*/!<>'.includes(ch)) {
        result += `<span class="token-operator">${this._esc(ch)}</span>`;
        i++;
        continue;
      }

      // Everything else (brackets, commas, etc.)
      result += this._esc(ch);
      i++;
    }

    return result;
  },

  _esc(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
};

/* ── Boot Sequence ── */
const BootSequence = {
  el: null,
  done: false,
  skipCallbacks: [],

  onSkip(fn) { this.skipCallbacks.push(fn); },

  async run(lines) {
    this.el = document.getElementById('boot-screen');
    const container = document.getElementById('boot-lines');
    if (!this.el || !container) { this._finish(); return; }

    const skipHandler = () => this._finish();
    this.el.addEventListener('click', skipHandler, { once: true });
    document.addEventListener('keydown', skipHandler, { once: true });

    const baseDelay = 170;

    for (let i = 0; i < lines.length; i++) {
      if (this.done) break;
      const lineEl = document.createElement('div');
      lineEl.className = 'boot-line';
      lineEl.style.animationDelay = '0s';

      const colored = lines[i]
        .replace(/\[ OK \]/g, '<span class="ok">[ OK ]</span>')
        .replace(/\[OK\]/g, '<span class="ok">[OK]</span>')
        .replace(/\[ ERR \]/g, '<span style="color:#ef4444;">[ ERR ]</span>');
      lineEl.innerHTML = colored;

      container.appendChild(lineEl);
      container.scrollTop = container.scrollHeight;

      const delay = i === lines.length - 1 ? baseDelay * 3 : baseDelay + Math.random() * 50;
      await this._sleep(delay);
    }

    if (!this.done) {
      await this._sleep(800);
      this._finish();
    }
  },

  _finish() {
    if (this.done) return;
    this.done = true;
    if (this.el) {
      this.el.classList.add('fade-out');
      setTimeout(() => {
        this.el.style.display = 'none';
        this.skipCallbacks.forEach(fn => fn());
      }, 600);
    } else {
      this.skipCallbacks.forEach(fn => fn());
    }
  },

  _sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
};

/* ── Typing Effect ── */
const TypingEffect = {
  /**
   * Types the code character-by-character using safe textContent,
   * then swaps to syntax-highlighted HTML when done.
   * This avoids any HTML injection bugs during typing.
   */
  async type(element, code, speed = 18) {
    if (!element) return;

    const lines = element.__codeLines || code.split('\n');
    element.innerHTML = '<span class="code-cursor"></span>';
    const cursor = element.querySelector('.code-cursor');

    for (let li = 0; li < lines.length; li++) {
      const line = lines[li];
      const lineEl = document.createElement('span');
      lineEl.style.display = 'block';
      element.insertBefore(lineEl, cursor);

      // Type characters safely as plain text
      for (let ci = 0; ci < line.length; ci++) {
        lineEl.textContent = line.slice(0, ci + 1);
        await this._sleep(speed + Math.random() * 8);
      }
    }

    // Remove cursor and apply full syntax highlighting atomically
    if (cursor) cursor.remove();
    element.innerHTML = lines
      .map(line => `<span style="display:block">${SyntaxHL.highlightLine(line) || '&nbsp;'}</span>`)
      .join('');
  },

  _sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
};

/* ── Command Palette ── */
const CommandPalette = {
  overlay: null,
  input: null,
  results: null,
  commands: [],
  filtered: [],
  selectedIndex: 0,
  isOpen: false,

  init(commands) {
    this.commands = commands;
    this.overlay  = document.getElementById('cmd-overlay');
    this.input    = document.getElementById('cmd-input');
    this.results  = document.getElementById('cmd-results');
    if (!this.overlay) return;

    document.getElementById('cmd-palette-btn')?.addEventListener('click', () => this.open());
    document.addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        this.isOpen ? this.close() : this.open();
      }
      if (e.key === 'Escape' && this.isOpen) this.close();
    });
    this.overlay.addEventListener('click', e => { if (e.target === this.overlay) this.close(); });

    this.input?.addEventListener('input', () => {
      this.selectedIndex = 0;
      this.render(this.input.value.trim());
    });

    this.overlay?.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        this.selectedIndex = Math.min(this.selectedIndex + 1, this.filtered.length - 1);
        this.highlight();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
        this.highlight();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        this.execute(this.filtered[this.selectedIndex]);
      }
    });
  },

  open() {
    if (!this.overlay) return;
    this.isOpen = true;
    this.overlay.classList.add('open');
    this.overlay.setAttribute('aria-hidden', 'false');
    this.render('');
    setTimeout(() => this.input?.focus(), 50);
  },

  close() {
    if (!this.overlay) return;
    this.isOpen = false;
    this.overlay.classList.remove('open');
    this.overlay.setAttribute('aria-hidden', 'true');
    if (this.input) this.input.value = '';
  },

  render(query) {
    const q = query.toLowerCase();
    this.filtered = q
      ? this.commands.filter(c => c.label.toLowerCase().includes(q))
      : this.commands;
    if (!this.results) return;
    this.results.innerHTML = this.filtered.map((cmd, i) => `
      <div class="cmd-item${i === this.selectedIndex ? ' selected' : ''}"
           role="option" aria-selected="${i === this.selectedIndex}" data-index="${i}">
        <i class="${cmd.icon}" aria-hidden="true"></i>
        ${this._esc(cmd.label)}
      </div>`).join('');

    this.results.querySelectorAll('.cmd-item').forEach(item => {
      item.addEventListener('click', () => this.execute(this.filtered[parseInt(item.dataset.index, 10)]));
      item.addEventListener('mouseenter', () => {
        this.selectedIndex = parseInt(item.dataset.index, 10);
        this.highlight();
      });
    });
  },

  highlight() {
    if (!this.results) return;
    this.results.querySelectorAll('.cmd-item').forEach((item, i) => {
      const active = i === this.selectedIndex;
      item.classList.toggle('selected', active);
      item.setAttribute('aria-selected', active);
      if (active) item.scrollIntoView({ block: 'nearest' });
    });
  },

  execute(cmd) {
    if (!cmd) return;
    this.close();
    switch (cmd.action) {
      case 'scroll': {
        const t = document.querySelector(cmd.target);
        if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
        break;
      }
      case 'link':
      case 'external':
        window.open(cmd.target, '_blank', 'noopener,noreferrer');
        break;
      case 'theme':
        document.dispatchEvent(new CustomEvent('toggle-theme'));
        break;
    }
  },

  _esc(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
};

/* ── Contact Terminal Animator ── */
const ContactTerminal = {
  run(container, personal, social) {
    if (!container) return;
    const lines = [
      { type: 'prompt', cmd: 'connect --platform email',    out: personal.email },
      { type: 'prompt', cmd: 'connect --platform github',   out: `github.com/${personal.githubUsername}` },
      { type: 'prompt', cmd: 'connect --platform linkedin', out: 'linkedin.com/in/samanuaia257' },
      { type: 'prompt', cmd: 'status --check availability', out: `[ OK ] ${personal.status}` },
    ];

    container.innerHTML = lines.flatMap((l, i) => [
      `<div class="terminal-line" style="transition-delay: ${i * 0.15}s">
        <span class="terminal-prompt">samanuai@os</span>
        <span class="terminal-cmd"> ${this._esc(l.cmd)}</span>
       </div>`,
      `<div class="terminal-line" style="transition-delay: ${i * 0.15 + 0.08}s">
        <span class="terminal-output">${this._esc(l.out)}</span>
       </div>`
    ]).join('');

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          container.querySelectorAll('.terminal-line').forEach(line => line.classList.add('visible'));
          observer.disconnect();
        }
      });
    }, { threshold: 0.2 });
    observer.observe(container);
  },

  _esc(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
};

// Exports
window.BootSequence    = BootSequence;
window.TypingEffect    = TypingEffect;
window.CommandPalette  = CommandPalette;
window.ContactTerminal = ContactTerminal;
window.SyntaxHL        = SyntaxHL;
