var Search = {
  init: function(events) {
    this.events = events;
    var self = this;
    var navInput = document.getElementById('navSearchInput');
    var heroInput = document.getElementById('heroSearch');
    if (navInput) {
      navInput.addEventListener('keyup', function(e) {
        if (e.key === 'Enter' && navInput.value.trim()) {
          window.location.href = 'events.html?search=' + encodeURIComponent(navInput.value.trim());
        }
      });
    }
    if (heroInput) {
      heroInput.addEventListener('keyup', function(e) {
        if (e.key === 'Enter' && heroInput.value.trim()) {
          window.location.href = 'events.html?search=' + encodeURIComponent(heroInput.value.trim());
        }
      });
    }
  },
  filter: function(events, opts) {
    return events.filter(function(ev) {
      if (opts.category && opts.category !== 'all' && ev.category !== opts.category) return false;
      if (opts.query) {
        var q = opts.query.toLowerCase();
        if (ev.title.toLowerCase().indexOf(q) === -1 &&
            ev.category.toLowerCase().indexOf(q) === -1 &&
            ev.location.toLowerCase().indexOf(q) === -1 &&
            ev.description.toLowerCase().indexOf(q) === -1) return false;
      }
      return true;
    });
  },
  sort: function(events, by) {
    var s = events.slice();
    switch(by) {
      case 'price-low': s.sort(function(a,b){return a.price-b.price;}); break;
      case 'price-high': s.sort(function(a,b){return b.price-a.price;}); break;
      case 'rating': s.sort(function(a,b){return b.rating-a.rating;}); break;
      case 'popular': s.sort(function(a,b){return b.attendees-a.attendees;}); break;
      default: s.sort(function(a,b){return new Date(a.date)-new Date(b.date);});
    }
    return s;
  }
};
