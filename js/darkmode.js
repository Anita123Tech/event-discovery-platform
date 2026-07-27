var DarkMode = {
  init: function() {
    var stored = Utils.getStorage('theme');
    if (stored) { this.set(stored); }
    else { this.set(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); }
    var self = this;
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
      if (!Utils.getStorage('theme')) self.set(e.matches ? 'dark' : 'light');
    });
    var btn = document.getElementById('themeToggle');
    if (btn) btn.addEventListener('click', function() { self.toggle(); });
  },
  set: function(t) {
    document.documentElement.setAttribute('data-theme', t);
    Utils.setStorage('theme', t);
  },
  toggle: function() {
    var cur = document.documentElement.getAttribute('data-theme');
    this.set(cur === 'dark' ? 'light' : 'dark');
  }
};
