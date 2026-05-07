# Idea Radar Dashboard

A minimal, elegantly designed dashboard for exploring market opportunities and insights.

## 🎨 Design Philosophy

- **Minimal**: Clean, focused interface with intentional whitespace
- **Structured**: Organized components and clear visual hierarchy
- **Aesthetic**: Subtle interactions and refined typography
- **Performant**: Optimized with Next.js and Tailwind CSS

## 📁 Project Structure

```
app/
├── components/           # Reusable UI components
│   ├── Header.tsx       # Main dashboard header
│   ├── AgentStatusCard.tsx    # Status indicator for data sources
│   ├── OpportunitiesNav.tsx   # Navigation between opportunities
│   ├── OpportunityCard.tsx    # Main opportunity display
│   ├── InsightCard.tsx        # Insight containers
│   ├── NarrativeTrapsList.tsx # Risk/trap list
│   ├── LoadingState.tsx       # Loading UI
│   ├── ErrorState.tsx         # Error UI
│   └── index.ts         # Component exports
├── lib/
│   ├── constants.ts     # Constants and color mappings
│   └── utils.ts         # Utility functions
├── types/
│   └── index.ts         # TypeScript interfaces
├── layout.tsx           # Root layout
├── page.tsx             # Dashboard page
└── globals.css          # Global styles
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Backend running on `http://localhost:3001`

### Installation

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📚 Component Overview

### Header

Displays the dashboard title and formatted date

```tsx
<Header createdAt={brief.createdAt} />
```

### AgentStatusCard

Shows data source status (Reddit, Product Hunt, etc.)

```tsx
<AgentStatusCard label="Reddit" data={agents?.reddit} />
```

### OpportunitiesNav

Navigation buttons to switch between opportunities

```tsx
<OpportunitiesNav
  count={brief.top3Opportunities.length}
  selected={selected}
  onChange={setSelected}
/>
```

### OpportunityCard

Main opportunity display with details

```tsx
<OpportunityCard opportunity={opportunity} />
```

### InsightCard

Reusable insight container

```tsx
<InsightCard title="Rising Theme">{brief.risingTheme}</InsightCard>
```

### NarrativeTrapsList

Displays potential narrative pitfalls

```tsx
<NarrativeTrapsList traps={brief.narrativeTraps} />
```

## 🎯 Colors & Styling

The dashboard uses a refined Slate color palette:

- **Background**: `slate-50` (light) / `slate-950` (dark)
- **Text**: `slate-950` (dark) / `slate-50` (light)
- **Borders**: `slate-200` / `slate-800`
- **Competition Levels**:
  - Low: Emerald
  - Medium: Amber
  - High: Rose

## 🔧 Configuration

### API Base URL

Edit `app/lib/constants.ts`:

```ts
export const API_BASE = "http://localhost:3001/api";
```

### Color Mappings

Customize colors in `app/lib/constants.ts`:

```ts
export const COMPETITION_COLORS = {
  low: "...",
  medium: "...",
  high: "...",
};
```

## 📝 Development

### Adding New Components

1. Create component file in `app/components/`
2. Export from `app/components/index.ts`
3. Use path aliases: `@/app/components`

Example:

```tsx
// app/components/NewComponent.tsx
export const NewComponent = () => {
  return <div>Content</div>;
};

// app/components/index.ts
export { NewComponent } from "./NewComponent";

// In page.tsx
import { NewComponent } from "@/app/components";
```

### Type Safety

All TypeScript interfaces are in `app/types/index.ts`

## 🚀 Production Build

```bash
npm run build
npm start
```

## 📦 Dependencies

- **Next.js 16**: React framework
- **React 19**: UI library
- **Tailwind CSS 4**: Utility-first CSS
- **TypeScript 5**: Type safety

## 📄 License

MIT
