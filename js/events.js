var Events = {
  all: [],
  favorites: [],
  init: async function() {
    this.favorites = Utils.getStorage('favorites', []);
    this.all = await Utils.fetchJSON('data/events.json');
    return this.all;
  },
  getFeatured: function(n) { return this.all.filter(function(e){return e.featured;}).slice(0, n||6); },
  getUpcoming: function(n) {
    var today = new Date().toISOString().split('T')[0];
    return this.all.filter(function(e){return e.date>=today;}).sort(function(a,b){return new Date(a.date)-new Date(b.date);}).slice(0, n||6);
  },
  getById: function(id) { return this.all.find(function(e){return e.id===parseInt(id);}); },
  getCategories: function() {
    var cats = {};
    this.all.forEach(function(e){ cats[e.category] = (cats[e.category]||0)+1; });
    var meta = {
      music:{icon:'🎵',label:'Music'}, technology:{icon:'💻',label:'Technology'},
      sports:{icon:'⚽',label:'Sports'}, business:{icon:'📊',label:'Business'},
      food:{icon:'🍕',label:'Food & Drink'}, education:{icon:'📚',label:'Education'},
      gaming:{icon:'🎮',label:'Gaming'}, art:{icon:'🎨',label:'Art & Culture'},
      travel:{icon:'✈️',label:'Travel'}
    };
    return Object.keys(cats).map(function(k) {
      return { slug:k, count:cats[k], icon:(meta[k]||{}).icon||'📌', label:(meta[k]||{}).label||k };
    });
  },
  toggleFav: function(id) {
    var i = this.favorites.indexOf(id);
    if (i === -1) { this.favorites.push(id); Utils.showToast('Saved to favorites!', 'success'); }
    else { this.favorites.splice(i, 1); Utils.showToast('Removed from favorites', 'info'); }
    Utils.setStorage('favorites', this.favorites);
    return this.favorites.indexOf(id) !== -1;
  },
  isFav: function(id) { return this.favorites.indexOf(id) !== -1; },
  cardHTML: function(ev) {
    var saved = this.isFav(ev.id);
    var price = ev.price === 0 ? '<span class="event-card__price event-card__price--free">Free</span>' : '<span class="event-card__price">' + Utils.formatPrice(ev.price) + '</span>';
    var badge = ev.featured ? '<span class="event-card__badge">Featured</span>' : '';
    var date = Utils.formatDate(ev.date);
    return '<article class="event-card" data-id="'+ev.id+'">' +
      '<div class="event-card__img"><img src="'+ev.image+'" alt="'+Utils.escapeHTML(ev.title)+'" loading="lazy">' + badge +
      '<button class="event-card__save '+(saved?'saved':'')+'" data-id="'+ev.id+'" aria-label="Save">&#9825;</button></div>' +
      '<div class="event-card__body">' +
      '<div class="event-card__date">'+date+'</div>' +
      '<h3 class="event-card__title"><a href="event-details.html?id='+ev.id+'">'+Utils.escapeHTML(ev.title)+'</a></h3>' +
      '<div class="event-card__location"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>'+Utils.escapeHTML(ev.location)+'</div>' +
      '<div class="event-card__footer">'+price+
      '<span class="event-card__rating"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>'+ev.rating+'</span></div>' +
      '</div></article>';
  },
  renderGrid: function(id, events) {
    var el = document.getElementById(id);
    if (!el) return;
    if (!events.length) {
      el.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:48px;color:var(--text-muted);">No events found.</div>';
      return;
    }
    el.innerHTML = events.map(this.cardHTML.bind(this)).join('');
    this.bindFavs(el);
  },
  renderCategories: function(id) {
    var el = document.getElementById(id);
    if (!el) return;
    var cats = this.getCategories();
    el.innerHTML = '<button class="category-chip active" data-cat="all"><span class="category-chip__icon">🔥</span>All</button>' +
      cats.map(function(c) {
        return '<a href="events.html?category='+c.slug+'" class="category-chip" data-cat="'+c.slug+'"><span class="category-chip__icon">'+c.icon+'</span>'+c.label+'</a>';
      }).join('');
  },
  bindFavs: function(el) {
    var self = this;
    el.querySelectorAll('.event-card__save').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.preventDefault(); e.stopPropagation();
        var id = parseInt(btn.dataset.id);
        var isSaved = self.toggleFav(id);
        btn.classList.toggle('saved', isSaved);
        btn.innerHTML = isSaved ? '&#9829;' : '&#9825;';
      });
    });
  }
};
