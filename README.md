# Vibent — Event Discovery & Booking Platform

A premium, modern frontend platform for discovering and booking events. Built with vanilla HTML, CSS, and JavaScript — no frameworks, no dependencies.

## Live Preview

Open `index.html` in any modern browser.

## Tech Stack

- HTML5 (Semantic)
- CSS3 (Custom Properties, Grid, Flexbox, Animations)
- Vanilla JavaScript (ES6 Modules Pattern)
- LocalStorage (Theme, Favorites, Newsletter)
- Fetch API (JSON-based event data)

## Project Structure

```
event-discovery-platform/
├── index.html              # Homepage
├── events.html             # Events listing page
├── event-details.html      # Single event detail + booking
├── about.html              # About page
├── contact.html            # Contact page
├── css/
│   ├── style.css           # Main styles + components
│   ├── responsive.css      # Breakpoint-specific styles
│   ├── animations.css      # Scroll reveal, loading, effects
│   └── darkmode.css        # Dark theme overrides
├── js/
│   ├── utils.js            # Reusable utility functions
│   ├── darkmode.js         # Dark/light mode toggle
│   ├── search.js           # Search & filtering logic
│   ├── events.js           # Event data, cards, rendering
│   ├── events-page.js      # Events listing page logic
│   └── main.js             # App init, navbar, scroll effects
├── data/
│   └── events.json         # Event data (18 events)
└── images/                 # Local images directory
```

## Features

### Core
- **5-page responsive website** (Home, Events, Event Details, About, Contact)
- **Dark/Light mode** with system preference detection
- **LocalStorage** persistence for theme, favorites, newsletter, contact messages
- **Fetch API** loading events from JSON data
- **Search** with real-time autocomplete dropdown
- **Filter & Sort** events by category, price, date, rating, popularity

### Design
- Premium modern UI with glassmorphism elements
- Custom color palette: Warm Orange (#D95A2B), Deep Purple (#1C0B2B), Emerald (#1E8C6B)
- Gradient backgrounds and soft shadows
- Scroll reveal animations (IntersectionObserver)
- Loading screen with spinner
- Back-to-top floating button
- Toast notification system
- Hover micro-interactions on all interactive elements
- Responsive across desktop, laptop, tablet, and mobile

### Pages
1. **Homepage** — Hero, Categories, Featured Events, Why Choose Us, Upcoming Events, Testimonials, Newsletter, Footer
2. **Events** — Search, category/sort filters, paginated grid, load more
3. **Event Details** — Full event info, booking sidebar, save to favorites
4. **About** — Story, values, team grid
5. **Contact** — Form with validation, contact info, localStorage persistence

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## How to Run

1. Clone or download the repository
2. Open `index.html` in a browser
3. No server required (all data is local)

> **Note:** For full Fetch API functionality on `events.html`, serve via a local server (`npx serve .` or VS Code Live Server).


