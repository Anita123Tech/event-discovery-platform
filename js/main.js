var App = {
  init: async function() {
    DarkMode.init();
    this.initNavbar();
    this.initBackToTop();
    this.initScrollReveal();
    this.initNewsletter();
    var events = await Events.init();
    Search.init(events);
    this.renderHome(events);
    this.hideLoader();
  },
  hideLoader: function() {
    var l = document.getElementById('loadingScreen');
    if (l) setTimeout(function(){ l.classList.add('hidden'); }, 300);
  },
  initNavbar: function() {
    var nav = document.getElementById('navbar');
    var ham = document.getElementById('hamburger');
    var links = document.getElementById('navLinks');
    window.addEventListener('scroll', Utils.throttle(function() {
      if (nav) nav.classList.toggle('navbar--shadow', window.scrollY > 10);
    }, 100));
    if (ham && links) {
      function closeMenu() {
        ham.classList.remove('active');
        links.classList.remove('open');
        var ov = document.querySelector('.nav-overlay');
        if (ov) { ov.classList.remove('active'); document.body.style.overflow=''; setTimeout(function(){ov.remove();},300); }
        else document.body.style.overflow='';
      }
      ham.addEventListener('click', function() {
        ham.classList.toggle('active');
        links.classList.toggle('open');
        var ov = document.querySelector('.nav-overlay');
        if (links.classList.contains('open')) {
          if (!ov) { ov = document.createElement('div'); ov.className='nav-overlay active'; document.body.appendChild(ov); }
          else ov.classList.add('active');
          document.body.style.overflow='hidden';
        } else {
          closeMenu();
        }
      });
      var closeBtn = document.getElementById('navClose');
      if (closeBtn) closeBtn.addEventListener('click', closeMenu);
      document.addEventListener('click', function(e) {
        if (e.target.classList.contains('nav-overlay')) closeMenu();
      });
    }
  },
  initBackToTop: function() {
    var btn = document.getElementById('backToTop');
    if (!btn) return;
    window.addEventListener('scroll', Utils.throttle(function() {
      btn.classList.toggle('visible', window.scrollY > 400);
    }, 100));
    btn.addEventListener('click', function() { window.scrollTo({top:0,behavior:'smooth'}); });
  },
  initScrollReveal: function() {
    var els = document.querySelectorAll('.reveal');
    if (!els.length) return;
    var obs = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) { if (e.isIntersecting) { e.target.classList.add('revealed'); obs.unobserve(e.target); } });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function(el) { obs.observe(el); });
  },
  initNewsletter: function() {
    var form = document.getElementById('newsletterForm');
    if (!form) return;
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      var input = form.querySelector('input');
      var email = input.value.trim();
      if (email) {
        var subs = Utils.getStorage('subs', []);
        if (subs.indexOf(email) === -1) { subs.push(email); Utils.setStorage('subs', subs); Utils.showToast('Subscribed successfully!', 'success'); }
        else Utils.showToast('Already subscribed!', 'info');
        input.value = '';
      }
    });
  },
  renderHome: function(events) {
    // Home page renders events via inline script — this only runs on inner pages that need grids
    var featuredGrid = document.getElementById('featuredGrid');
    if (featuredGrid) Events.renderGrid('featuredGrid', Events.getFeatured(6));
    var upcomingGrid = document.getElementById('upcomingGrid');
    if (upcomingGrid) Events.renderGrid('upcomingGrid', Events.getUpcoming(6));
  }
};

Auth.init();
document.addEventListener('DOMContentLoaded', function() { App.init(); });
