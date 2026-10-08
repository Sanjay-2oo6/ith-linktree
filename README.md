# INNOTECH HUB — Brutalist Link Hub & Admin Console

A production-ready single-hub social & product link application (Linktree clone) with an integrated Admin Console, built in the **Neo-Brutalist** visual design system.

---

## 🎨 Visual Design Specifications

The application strictly adheres to the Neo-Brutalist design specification:

* **Background**: Off-White / Light Gray (`#F4F4F0`)
* **Primary Accent**: Mustard Yellow (`#EAB308`)
* **Primary Dark**: Jet Black (`#0D0D0D`)
* **Card Surface**: Pure White (`#FFFFFF`)
* **Muted Text**: Slate Gray (`#737373`)
* **Typography**:
  * Headings, Hero Title, Search Text: **Space Grotesk** (700 Bold / 800 Extra-Bold, ALL CAPS)
  * Body, Buttons, Tags, Metrics: **JetBrains Mono** (600–800 Monospace weight)
* **Borders & Shadows**:
  * `3px solid #0D0D0D` on all cards, buttons, and inputs
  * Hard Card Shadows: `box-shadow: 5px 5px 0px #0D0D0D;`
  * Hard Button/Pill Shadows: `box-shadow: 3px 3px 0px #0D0D0D;`
  * Hover translation: `transform: translate(-2px, -2px);` with `8px 8px 0px #0D0D0D;`
  * Active button press: `transform: translate(2px, 2px);` with `1px 1px 0px #0D0D0D;`

---

## 🚀 Features

### 1. Dual-View Architecture (Split View, Public Hub, Admin Console)
* **Split View**: Left sidebar houses the Admin Console while the right main stage displays the Public Link Hub.
* **Public Hub View**: Dedicated view for end-users and mobile linktree usage.
* **Admin Console View**: Dedicated console view for link curation and management.

### 2. Automatic URL-to-Icon and Category Detection
Live, real-time detection as the administrator enters or pastes URLs:
* `github.com` → **GitHub** (`fa-brands fa-github`) → `CODE`
* `linkedin.com` → **LinkedIn** (`fa-brands fa-linkedin`) → `SOCIAL`
* `x.com` / `twitter.com` → **X / Twitter** (`fa-brands fa-x-twitter`) → `SOCIAL`
* `instagram.com` → **Instagram** (`fa-brands fa-instagram`) → `SOCIAL`
* `youtube.com` / `youtu.be` → **YouTube** (`fa-brands fa-youtube`) → `MEDIA`
* `discord.gg` / `discord.com` → **Discord** (`fa-brands fa-discord`) → `COMMUNITY`
* `whatsapp.com` / `wa.me` → **WhatsApp** (`fa-brands fa-whatsapp`) → `COMMUNITY`
* `t.me` / `telegram.org` → **Telegram** (`fa-brands fa-telegram`) → `COMMUNITY`
* `spotify.com` → **Spotify** (`fa-brands fa-spotify`) → `MEDIA`
* `figma.com` → **Figma** (`fa-brands fa-figma`) → `CODE`
* `medium.com` → **Medium** (`fa-brands fa-medium`) → `SOCIAL`
* `reddit.com` → **Reddit** (`fa-brands fa-reddit`) → `COMMUNITY`
* `mailto:` → **Email** (`fa-solid fa-envelope`) → `COMMUNITY`
* Any other URL → **Website** (`fa-solid fa-globe`) → `WEB`

### 3. Full Admin Console Functionality
* **Add Link**: Real-time URL platform preview, title validation, optional featured highlight.
* **Edit Link**: Pre-populates existing data, allows updating title, URL, or spotlight status.
* **Reorder Links**: Move Up (↑) and Move Down (↓) with immediate order update across views.
* **Highlight Toggle (★)**: Star/unstar items with immediate yellow featured banner on the public card.
* **Delete Link**: Protected by a Neo-Brutalist confirmation modal (`[YES, DELETE]` / `[CANCEL]`).
* **Reset to Defaults**: Restores official seed data and default order.

### 4. Interactive Public Link Hub
* **Top Ticker Bar**: Real-time counter of Active Links, Total Clicks, and Unique Platforms.
* **Black Hero Box**: Neo-brutalist hero banner with official badge, handle, bio, and segmented progress indicator (`01 — 02 — 03 — 04`).
* **Live Search**: Full-width search bar filtering by title, URL, platform, or category.
* **Category Filters**: Instant filtering by `ALL LINKS`, `SOCIALS`, `CODE`, `MEDIA`, `COMMUNITY`, and `WEB`.
* **Click Tracker**: Every link click increments the link's click count and updates global statistics immediately.

### 5. Live Integrated APIs
* **LinkPreview API (`cd9bed6d9c4e22e5e3ea83b7c4554842`)**:
  * **Auto-Fetch Metadata**: Clicking `⚡ AUTO-FETCH` in the admin form automatically fetches and populates the page title, description, and thumbnail image for any entered URL.
* **IPGeolocation API (`c818bbbba1954f2fba08acf5bc644f41`)**:
  * **Visitor Geo Detection**: Detects your visitor location and displays it in the top ticker bar (`📍 Raniganj, India`).
  * **Click Geography Tracking**: Records the city and country for every link click and powers the **Geo Analytics** dashboard in the Admin Console showing top visitor countries and a live activity feed.
* **Supabase Cloud Sync (`sb_publishable_aAzZVe05dzPDhcYazkO_5g_FydypNDh`)**:
  * **Multi-Device Cloud Sync**: Configure your Supabase Project URL (`https://your-project.supabase.co`) in the Admin Console to automatically sync links and clicks to Supabase PostgreSQL cloud tables.

---

## 📦 Official Seed Links Included

* **Instagram**: `https://www.instagram.com/innotechhub.official/`
* **X**: `https://x.com/InnotechH93449`
* **YouTube**: `https://www.youtube.com/@innotechhub.official`
* **LinkedIn**: `https://www.linkedin.com/company/innotechhub-official`
* **Website**: `https://innotechhub.in`
* **GitHub**: `https://github.com/innotech-hub`
* **Discord**: `https://discord.gg/innotechhub`
* **Contact**: `mailto:contact@innotechhub.in`

---

## 🛠️ Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Locally in Development Mode
```bash
npm run dev
```
Open [http://localhost:5173/](http://localhost:5173/) in your browser.

### 3. Run the Automated Test Suite (67 Tests)
```bash
npm test
```

### 4. Build for Production
```bash
npm run build
```
The optimized bundle will be generated in the `dist/` directory.
