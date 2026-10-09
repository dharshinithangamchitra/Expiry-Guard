# ExpiryGuard 🛡️

> **Stay Ahead of Expiry.** A smart, modern product expiry management system built with React, TypeScript, and Tailwind CSS.

![ExpiryGuard Dashboard](https://img.shields.io/badge/Status-Active-brightgreen) ![React](https://img.shields.io/badge/React-19-61DAFB?logo=react) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript) ![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)

---

## ✨ Features

- **📊 Dashboard** — At-a-glance overview of all products, expiry statuses, and recent alerts
- **📦 Product Management** — Add, edit, delete, and track medicines, cosmetics, skincare, and personal care products
- **⏰ Expiry Tracking** — Color-coded status badges: Safe · Expiring Soon · Urgent · Expired
- **📅 Expiry Calendar** — Monthly calendar view showing products grouped by expiry date
- **🔔 Notifications** — In-app notification center with unread badge counts and read/mark-all-read
- **📈 Reports & Analytics** — Bar charts, pie charts, and category breakdowns powered by Recharts
- **⚙️ Settings** — Profile editing, notification preferences, theme toggles
- **📱 Responsive** — Works on desktop, tablet, and mobile with a collapsible sidebar and bottom navigation
- **🎨 Modern Design** — Glassmorphism, smooth animations, Inter + Poppins typography, teal accent palette

## 🗂️ Product Categories

| Category | Icon | Color |
|---|---|---|
| Medicines | 💊 Pill | Teal |
| Cosmetics | ✨ Sparkles | Purple |
| Skincare | 💧 Droplets | Blue |
| Personal Care | ❤️ Heart | Rose |
| Food & Supplements | 🌿 Leaf | Green |
| Other | 📦 Package | Slate |

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Installation

```bash
# Clone the repository
git clone https://github.com/dharshinithangamchitra/ExpiryGuard.git
cd ExpiryGuard

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app runs at **http://localhost:5173** in demo mode with mock data pre-loaded.

### Build for Production

```bash
npm run build
```

## 🔌 Connecting to Supabase (Optional)

The app runs fully in **Demo Mode** out of the box with rich mock data. To persist data with a real backend:

1. Create a project at [supabase.com](https://supabase.com)
2. Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

3. Restart the dev server — the app will automatically switch from demo mode to live mode.

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build Tool | Vite 8 |
| Styling | Tailwind CSS v4 |
| State Management | Zustand (with localStorage persistence) |
| Charts | Recharts |
| Icons | Lucide React |
| Date Utilities | date-fns |
| Toast Notifications | react-hot-toast |
| Routing | React Router v7 |
| Backend (optional) | Supabase |

## 📁 Project Structure

```
src/
├── components/
│   ├── layout/          # Sidebar, TopBar, BottomNav
│   ├── pages/           # Dashboard, ProductsPage, AddProductPage, ProductDetail,
│   │                    # CalendarPage, NotificationsPage, ReportsPage, SettingsPage
│   └── ui/              # Common, StatusBadge, CategoryIcon
├── data/
│   └── mockData.ts      # Demo products, users, notifications
├── store/
│   └── index.ts         # Zustand store with persist middleware
├── utils/
│   └── expiry.ts        # Expiry status logic, date formatting
├── config.ts            # App-wide constants and thresholds
├── App.tsx              # Root component, routing logic
├── main.tsx             # React entry point
└── index.css            # Tailwind CSS v4 theme + global styles
```

## 🎨 Design System

- **Primary**: Teal (`#0F766E`)
- **Background**: Slate-50 (`#F8FAFC`)
- **Cards**: White with `border-radius: 16px`
- **Status Colors**: Green (Safe), Yellow (Expiring Soon), Orange (Urgent), Red (Expired)
- **Fonts**: Inter (body), Poppins (display)

## 📄 License

MIT © 2024 Dharshini Thangamchitra
