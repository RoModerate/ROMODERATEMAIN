# Design Guidelines: Enhanced Blox.report Platform

## Design Approach

**Reference-Based Approach**: Drawing inspiration from modern SaaS dashboards including Discord (for community management feel), Linear (for clean dashboard aesthetics), and Vercel (for developer-focused polish). The platform is utility-focused with visual appeal that builds trust and engagement.

## Core Design Principles

1. **Discord-Native Feel**: Interface should feel familiar to Discord users while maintaining unique identity
2. **Data Clarity**: Complex Roblox/Discord data presented in digestible, scannable formats
3. **Professional SaaS Polish**: Production-ready quality that builds immediate credibility
4. **Dark-First Design**: Optimized for extended dashboard usage with purple accents for hierarchy

---

## Typography System

**Font Stack**: 
- **Primary**: Inter (via Google Fonts CDN) - Clean, highly legible for UI and data
- **Accent**: JetBrains Mono (via Google Fonts CDN) - For API keys, bot IDs, technical identifiers

**Hierarchy**:
- **Hero/Page Titles**: text-4xl md:text-5xl, font-bold, tracking-tight
- **Section Headers**: text-2xl md:text-3xl, font-semibold
- **Card Titles**: text-lg font-semibold
- **Body Text**: text-base (16px), font-normal, leading-relaxed
- **Labels**: text-sm font-medium, uppercase tracking-wide
- **Metadata/Captions**: text-xs md:text-sm, opacity-70
- **Technical Text** (IDs, keys): font-mono text-sm

---

## Layout System

**Spacing Primitives**: Tailwind units of **2, 4, 6, 8, 12, 16** (e.g., p-4, m-8, gap-6)

**Dashboard Layout Structure**:
- **Sidebar**: Fixed width 64 (16rem) on desktop, collapsible to icon-only on tablet, full overlay on mobile
- **Main Content**: Full width with max-w-7xl container, px-6 md:px-8 padding
- **Card Spacing**: gap-6 for grid layouts, p-6 internal padding
- **Section Spacing**: py-12 between major sections, py-8 for subsections

**Grid Patterns**:
- **Server Cards**: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
- **Stats/Metrics**: grid-cols-2 md:grid-cols-4 gap-4
- **Bot Management**: Single column with max-w-4xl for clarity
- **Report Display**: Two-column split on desktop (lg:grid-cols-2), stacked mobile

---

## Component Library

### Navigation & Structure

**Sidebar Navigation**:
- Vertical stack with icon + label for each item
- Active state: purple background (bg-purple-600/20), border-l-4 border-purple-500
- Hover: bg-purple-600/10 transition
- Section dividers with subtle borders
- User profile card at bottom with avatar, username, logout

**Top Bar** (when sidebar is collapsed):
- Fixed height h-16
- Contains: Menu toggle, logo/icon, server dropdown selector, user avatar
- Backdrop blur effect for floating feel

### Cards & Containers

**Primary Cards**:
- Rounded borders (rounded-xl)
- Border with subtle opacity (border border-white/10)
- Background: bg-slate-800/50 with backdrop-blur-sm
- Padding: p-6
- Hover: Subtle lift with shadow-lg transition

**Server Selection Cards**:
- Display server icon (rounded-lg), name, member count
- "Manage" button prominent on each card
- Grid layout with equal heights

**Report Cards**:
- Header with Roblox avatar (rounded-full, size-16), username, profile link
- Body with key-value pairs in two-column grid
- Badge system for verification status, flags
- Footer with timestamp, actions

### Forms & Inputs

**Input Fields**:
- Consistent height h-12
- Rounded-lg borders
- Background: bg-slate-900/50
- Border: border-slate-600, focus:border-purple-500
- Padding: px-4
- Labels: text-sm font-medium mb-2, positioned above
- Helper text below in text-xs opacity-70

**Buttons**:
- **Primary CTA**: bg-purple-600 hover:bg-purple-500, px-6 py-3, rounded-lg, font-semibold
- **Secondary**: border border-purple-500 text-purple-400, hover:bg-purple-600/10
- **Danger**: bg-red-600/20 border-red-500 text-red-400, hover:bg-red-600/30
- **Icon Buttons**: size-10 rounded-lg with single icon, minimal padding

**Dropdowns/Selects**:
- Match input field styling
- Chevron indicator on right
- Dropdown menu: absolute, bg-slate-800, border, rounded-lg, shadow-xl, py-2
- Menu items: px-4 py-2, hover:bg-purple-600/20

### Data Display

**Statistics Cards**:
- Large metric number: text-3xl font-bold
- Label below: text-sm opacity-70
- Optional trend indicator (arrow + percentage)
- Compact size, works in 4-column grid

**Tables** (for logs, request history):
- Header row: bg-slate-800/80, text-xs uppercase font-semibold, sticky top-0
- Rows: border-b border-slate-700/50, hover:bg-slate-800/30
- Cell padding: px-4 py-3
- Alternating row backgrounds for long tables
- Responsive: horizontal scroll on mobile with min-w-full

**Badges**:
- Compact size: px-3 py-1, text-xs font-medium, rounded-full
- Status types: Success (green), Warning (yellow), Error (red), Info (blue), Verified (purple)
- Inline with text or standalone

**Code/Technical Display**:
- Background: bg-slate-900, border, rounded-md, p-4
- Font: font-mono text-sm
- Copy button positioned top-right
- Line numbers for multi-line content

### Bot Management Panel

**Connection Options Cards**:
- Two distinct cards: "Official Bot Invite" and "Register Your Bot"
- Icon differentiator (robot, link icons)
- Step-by-step numbered instructions inside each
- Clear CTA button at bottom of each card

**Webhook Registration Form**:
- Input for Bot ID (with validation indicator)
- Secure token display with copy function
- Success confirmation with next steps
- All within max-w-2xl centered container

### Overlays & Modals

**Modal Dialogs**:
- Centered overlay with backdrop (bg-black/60 backdrop-blur-sm)
- Content card: max-w-lg md:max-w-2xl, bg-slate-800, rounded-xl, p-6 md:p-8
- Header with title and close button
- Footer with action buttons (right-aligned)

**Toast Notifications**:
- Fixed bottom-right positioning
- Slide-in animation
- Auto-dismiss after 5s
- Status colors match badge system
- Icon + message + dismiss button

### Landing Page Sections

**Hero Section** (80vh):
- Centered content with max-w-4xl
- Large headline (text-5xl md:text-6xl font-bold) with gradient text effect on key words
- Subheadline (text-xl opacity-80)
- Primary CTA button (large, px-8 py-4) + "Connect with Discord" with Discord logo
- Background: Subtle grid pattern overlay, gradient from deep purple to dark slate

**Features Section**:
- 3-column grid (grid-cols-1 md:grid-cols-3)
- Icon (size-12) + title + description per feature
- Features: Bloxlink Integration, Secure Bot Management, Real-time Analytics, Server Management, Custom Reports, API Access
- Each card with hover lift effect

**How It Works**:
- 3-step process with numbered badges
- Icons illustrating each step
- Linear flow with connecting lines (hidden on mobile)

**Trust/Social Proof**:
- Stats bar: "X servers", "Y requests processed", "Z users"
- Optional: Testimonial cards if available

**CTA Section**:
- Full-width bg-gradient-to-r from-purple-900 to-purple-700
- Centered message with large CTA button
- py-16 vertical spacing

**Footer**:
- 4-column grid on desktop (Product, Resources, Community, Legal), stacked mobile
- Logo/icon on left
- Discord server link, GitHub, Support links
- Bottom bar with copyright and "Powered by" badge

---

## Icons

**Library**: Heroicons (via CDN)
- Navigation: outline style, size-6
- Feature cards: outline style, size-12
- Buttons: mini style, size-5
- Status indicators: solid style, size-4

---

## Images

**Logo/Icon Usage**:
- Header logo: h-8 md:h-10
- Favicon: 32x32 and 192x192 versions
- Landing page hero: Large size (h-24 md:h-32) above headline

**Hero Section Background**:
- Abstract gradient mesh or subtle grid pattern (CSS-generated)
- No photographic hero image; focus on icon branding and typography

**Server/User Avatars**:
- Pulled from Discord/Roblox APIs
- Fallback: Gradient placeholder with initials
- Consistent sizes: size-10 (small), size-16 (medium), size-24 (large)

**Report Display**:
- Roblox avatar images (from API)
- Profile thumbnails where applicable
- All user-generated images in rounded containers

---

## Animations

**Minimal, Purposeful Animation**:
- Page transitions: Subtle fade-in on route change
- Card hover: Slight lift (translate-y-1) with shadow increase
- Button interactions: Scale on click (scale-95)
- Modal entry: Fade + scale from 95% to 100%
- Toast notifications: Slide from bottom-right
- Loading states: Spinner or skeleton screens (no elaborate animations)

**No scroll-triggered animations** - focus on performance and clarity

---

## Dashboard-Specific Patterns

**Empty States**:
- Centered content with icon, headline, description, CTA
- "No servers found" → CTA to connect Discord
- "No reports yet" → CTA to generate first report

**Loading States**:
- Skeleton screens matching final layout structure
- Spinner for in-progress API calls
- Progress bar for batch operations

**Real-time Updates** (WebSocket):
- Subtle badge notification count increment
- New item fade-in to activity feed
- No aggressive flashing or popups

This design system creates a professional, Discord-aligned SaaS experience with distinctive purple branding, optimized for dashboard usage while maintaining excellent usability for complex Roblox/Discord data management.