const Utils = {
  formatDate(d) {
    return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  },
  formatTime(t) {
    const [h, m] = t.split(':');
    const hr = parseInt(h);
    return (hr % 12 || 12) + ':' + m + (hr >= 12 ? ' PM' : ' AM');
  },
  formatPrice(p) { return p === 0 ? 'Free' : '$' + p; },
  getQueryParam(p) { return new URLSearchParams(window.location.search).get(p); },
  getStorage(k, def) {
    try {
      var raw = localStorage.getItem('ep-' + k);
      if (raw === null) return (def === undefined ? null : def);
      var val = JSON.parse(raw);
      return (val === null || val === undefined) ? (def === undefined ? null : def) : val;
    } catch(e) { return (def === undefined ? null : def); }
  },
  setStorage(k, v) {
    try { localStorage.setItem('ep-' + k, JSON.stringify(v)); } catch(e) {}
  },
  removeStorage(k) {
    try { localStorage.removeItem('ep-' + k); } catch(e) {}
  },
  async fetchJSON(url) {
    try { var r = await fetch(url); if (!r.ok) throw new Error(r.status); return await r.json(); }
    catch(e) { console.error('Fetch error:', e); return []; }
  },
  escapeHTML(s) {
    if (s === null || s === undefined) return '';
    var d = document.createElement('div');
    d.textContent = String(s);
    return d.innerHTML;
  },
  isValidEmail(s) {
    if (!s || !s.trim()) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
  },
  safeRedirect(url) {
    if (!url) return 'index.html';
    var s = String(url).trim();
    if (!s || s === 'index.html') return 'index.html';
    if (/^(javascript|data|vbscript)\s*:/i.test(s)) return 'index.html';
    if (/^https?:\/\//i.test(s)) {
      try {
        var base = new URL(window.location.href).origin;
        if (new URL(s).origin === base) return s;
      } catch(e) {}
      return 'index.html';
    }
    if (/^file:/i.test(s)) return s;
    if (s.charAt(0) === '/' || /\.html$/i.test(s) || /\?/.test(s)) return s;
    return 'index.html';
  },
  toUtf8Hex(str) {
    var raw = unescape(encodeURIComponent(String(str || '')));
    var hex = '';
    for (var i = 0; i < raw.length; i++) {
      var c = raw.charCodeAt(i).toString(16);
      hex += (c.length < 2 ? '0' : '') + c;
    }
    return hex;
  },
  sha256(ascii) {
    if (typeof ascii !== 'string') ascii = String(ascii || '');
    if (/^[0-9a-fA-F]*$/.test(ascii) && ascii.length % 2 === 0) {
      var decoded = '';
      for (var h = 0; h < ascii.length; h += 2) {
        decoded += String.fromCharCode(parseInt(ascii.substr(h, 2), 16));
      }
      ascii = decoded;
    }
    function rot(value, amount) {
      return (value >>> amount) | (value << (32 - amount));
    }
    var mathPow = Math.pow;
    var maxWord = mathPow(2, 32);
    var result = '';
    var words = [];
    var asciiBitLength = ascii.length * 8;
    var hash = [];
    var k = [];
    var primeCounter = 0;
    var isComposite = {};
    var candidate, i, j;
    for (candidate = 2; primeCounter < 64; candidate++) {
      if (!isComposite[candidate]) {
        for (i = 0; i < 313; i += candidate) isComposite[i] = candidate;
        hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
        k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
      }
    }
    ascii += '\x80';
    while (ascii.length % 64 - 56) ascii += '\x00';
    for (i = 0; i < ascii.length; i++) {
      j = ascii.charCodeAt(i);
      if (j >> 8) return '';
      words[i >> 2] |= j << ((3 - i) % 4) * 8;
    }
    words[words.length] = ((asciiBitLength / maxWord) | 0);
    words[words.length] = (asciiBitLength);
    for (j = 0; j < words.length;) {
      var w = words.slice(j, j += 16);
      var oldHash = hash.slice(0, 8);
      for (i = 0; i < 64; i++) {
        var w15 = w[i - 15];
        var w2 = w[i - 2];
        var a = hash[0];
        var e = hash[4];
        var temp1 = hash[7]
          + (rot(e, 6) ^ rot(e, 11) ^ rot(e, 25))
          + ((e & hash[5]) ^ ((~e) & hash[6]))
          + k[i]
          + (w[i] = (i < 16) ? w[i] : (
              w[i - 16]
              + (rot(w15, 7) ^ rot(w15, 18) ^ (w15 >>> 3))
              + w[i - 7]
              + (rot(w2, 17) ^ rot(w2, 19) ^ (w2 >>> 10))
            ) | 0);
        var temp2 = (rot(a, 2) ^ rot(a, 13) ^ rot(a, 22))
          + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
        hash = [(temp1 + temp2) | 0].concat(hash);
        hash[4] = (hash[4] + temp1) | 0;
      }
      for (i = 0; i < 8; i++) hash[i] = (hash[i] + oldHash[i]) | 0;
    }
    for (i = 0; i < 8; i++) {
      for (j = 3; j + 1; j--) {
        var b = (hash[i] >> (j * 8)) & 255;
        result += ((b < 16) ? 0 : '') + b.toString(16);
      }
    }
    return result;
  },
  hashString(str) {
    return 's1_' + this.sha256(this.toUtf8Hex(str));
  },
  debounce(fn, ms) {
    ms = ms || 300;
    var t;
    return function() {
      var args = arguments;
      var ctx = this;
      clearTimeout(t);
      t = setTimeout(function() { fn.apply(ctx, args); }, ms);
    };
  },
  throttle(fn, ms) {
    ms = ms || 100;
    var last = 0;
    return function() {
      var now = Date.now();
      if (now - last >= ms) { last = now; fn.apply(this, arguments); }
    };
  },
  showToast(msg, type) {
    type = type || 'info';
    var c = document.getElementById('toastContainer');
    if (!c) return;
    while (c.children.length >= 5) c.removeChild(c.firstChild);
    var t = document.createElement('div');
    t.className = 'toast toast--' + type;
    t.setAttribute('role', 'status');
    var icon = document.createElement('span');
    icon.className = 'toast__icon';
    icon.innerHTML = type === 'success' ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>'
      : type === 'error' ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>'
      : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';
    var span = document.createElement('span');
    span.className = 'toast__msg';
    span.textContent = msg;
    t.appendChild(icon);
    t.appendChild(span);
    c.appendChild(t);
    requestAnimationFrame(function() { t.classList.add('show'); });
    function dismiss() {
      if (t.dataset.gone) return;
      t.dataset.gone = '1';
      t.classList.remove('show');
      setTimeout(function() { if (t.parentNode) t.parentNode.removeChild(t); }, 400);
    }
    t.addEventListener('click', dismiss);
    setTimeout(dismiss, 3200);
  }
};
