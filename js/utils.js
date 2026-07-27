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
    try { var v = localStorage.getItem('ep-' + k); return v ? JSON.parse(v) : (def || null); } catch(e) { return def || null; }
  },
  setStorage(k, v) {
    try { localStorage.setItem('ep-' + k, JSON.stringify(v)); } catch(e) {}
  },
  async fetchJSON(url) {
    try { var r = await fetch(url); if (!r.ok) throw new Error(r.status); return await r.json(); }
    catch(e) { console.error('Fetch error:', e); return []; }
  },
  escapeHTML(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; },
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
    var t = document.createElement('div');
    t.className = 'toast toast--' + type;
    t.innerHTML = '<span>' + msg + '</span>';
    c.appendChild(t);
    requestAnimationFrame(function() { t.classList.add('show'); });
    setTimeout(function() { t.classList.remove('show'); setTimeout(function() { t.remove(); }, 400); }, 3000);
  }
};
