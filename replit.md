# 67 UNBLOCKED GAMES

## Overview
A full-featured gaming site with a games library, settings, credits, movies, and a real-time chat room system.

## Stack
- **Frontend**: Plain HTML/CSS/JS (all CSS inlined per file for GitHub Pages compatibility)
- **Backend**: Node.js + Express (port 5000)
- **Real-time**: WebSocket (ws package)
- **Database**: PostgreSQL (via DATABASE_URL env var)

## In-Game Overlay
- `overlay.js` — Injected into all 28 game pages; press **Ctrl+Shift+O** to toggle
  - **Chat tab**: login → join room → real-time chat (full WebSocket, images supported); draggable panel
  - **Settings tab**: Tab Cloak toggle (None / Schoology / iReady) applied instantly
  - Minimizable, closeable, draggable; remembers session (re-checks `/api/me` on open)

## Key Pages
- `index.html` — Home/landing page
- `games.html` — Games grid with live search filter
- `chat.html` — Real-time chat rooms (login required); Discord-like layout by default
- `settings.html` — Export/Import data, Tab Cloaker (Schoology spoof), Low Memory Mode, Chat Layout toggle (Discord/Legacy)
- `credits.html` — Credits page
- `movies.html` — Movies page
- `proxies.html` — Proxies hub (formatted like `games.html`); currently lists GhostLink which lives at `games/proxy/index.html`. Reuses the `.game-grid` / `.game-btn` classes and the `gameSearch` input so `script.js`'s search filter works without changes.

## Chat Layout Modes
- **Discord mode** (default): Full-viewport layout with a 240px room sidebar on the left, `# channel` header, flex-column chat area, member list on right. Stored as `localStorage.getItem('legacyChat') !== '1'`.
- **Legacy mode**: Original centered `max-width: 900px` layout with fixed 440px message height. Enable via Settings → Chat Layout.
- Layout class: `body.discord-mode` — applied by inline script at top of `<body>` before render to avoid flash.

## Database Tables
- `chat_messages` — (id, room_code, username, message, media_url, media_type, reply_to_username, reply_to_message, created_at)
- `users` — (id, username, password_hash, created_at)
- `room_owners` — (room_code, owner_username, created_at)
- `room_bans` — (id, room_code, banned_username)
- `staff` — (username)
- `direct_messages` — (id, from_username, to_username, message, media_url, media_type, is_read, created_at)
- `user_blocks` — (blocker_username, blocked_username, created_at)
- `room_reports` — (id, room_code, reporter_username, reason, resolved, created_at)
- `user_reports` — (id, reported_username, reporter_username, reason, resolved, created_at)

## Chat Features
- **Login System**: Username/password auth (bcrypt hashed), persistent sessions (express-session)
- **Room creation**: Auto-generated or custom room codes; first user = room owner
- **Ban/Kick**: Room owner sees kick/ban buttons next to each member; bans are persisted in DB
- **Media uploads**: Images and videos (up to 50MB) via multer; stored in `/uploads/`; displayed inline with lightbox for images
- **Message history**: Last 80 messages loaded on room join (includes message IDs for deletion)
- **Members list**: Live sidebar showing who is online
- **Reply system**: Quote-reply any message with ↩ Reply button; quoted preview shown in message
- **Colored usernames**: Deterministic HSL color per user; staff get red + ⚡ symbol
- **Staff system**: Hardcoded "Loafyen" as staff/owner; `/staff <user>` to assign, `/unstaff <user>` to remove (staff-only; Loafyen cannot be removed)
- **DM system**: Real-time direct messages via WebSocket; DM modal with conversations, block/unblock, unread badges
- **Presence WS**: Lobby presence connection keeps users reachable for DMs outside rooms
- **Room moderation**: Report rooms, delete rooms (owner/staff), delete messages (staff/author)
- **Account moderation**: Report users (anyone), delete accounts (staff only), wipes all user data
- **Staff Reports panel**: Two-tab panel (Rooms / Users) for staff; resolve, delete room, delete account actions. Opened via the lobby button (legacy mode) or the 📋 sidebar icon (Discord mode)
- **All Rooms panel (staff)**: Lists every room ever created with owner, online count, message count, last-message time, and created date. Filterable, supports Join and Delete. Opened via the lobby button (legacy mode) or the 📂 sidebar icon (Discord mode). Backed by `GET /api/staff/rooms`.

## Server Notes
- `server.js` runs on `0.0.0.0:PORT` (PORT env or 5000)
- Uploads served from `/uploads/` directory
- WebSocket shares the same HTTP server
- Sessions use `SESSION_SECRET` env var (fallback to hardcoded default)
- Sessions are stored in PostgreSQL via `connect-pg-simple` (table `user_sessions`, auto-created). This survives server restarts and republishes, and works across multiple Autoscale instances. Cookie max age is 30 days, `rolling: true` to refresh on activity. `app.set('trust proxy', 1)` is set so the session cookie works behind the Replit proxy.

## Packages
express, ws, pg, bcrypt, multer, express-session, connect-pg-simple, uuid
