# Topmaster — Claude Code Instructions

## Project
Reverse-auction marketplace for local services in Uzbekistan (topmaster.uz).
- Stack: Next.js 14 App Router (web), NestJS (api), PostgreSQL, Redis, Prisma
- Monorepo: `apps/web` (frontend), `apps/api` (backend)
- Bilingual: Uzbek (primary) + Russian. i18n lives in `apps/web/src/lib/i18n/`
- Deployed on Railway

## Active Skill
@.claude/skills/frontend-design/SKILL.md

## Design System

**Brand identity:** A premium Uzbek local services marketplace. Not cheap, not corporate. Trustworthy, fast, human. The T-mark logo (purple gradient square with white T and amber foot) is the signature — amber is the earned/reward colour, purple is the authority colour.

**Palette (fixed — do not drift):**
- `#7C3AED` — brand purple (primary)
- `#5B21B6` — brand purple dark
- `#A78BFA` — brand purple light
- `#F59E0B` — amber/gold (accent, CTAs for masters)
- `#0B0B18` — dark surface
- `#0D0D1A` — ink (body text)
- `#F8F7FF` — off-white (light section bg)
- `#71717A` — muted text

**Typography:**
- Display/headings: Plus Jakarta Sans 700–800 (Latin only — Uzbek Latin script)
- Body + UI: Inter 400–700 (Latin + Cyrillic — Russian text)
- Both fonts loaded in `layout.tsx`; body defaults to `font-inter`, headings use `font-jakarta`

**Signature element:** The amber foot on the T-mark. Use amber sparingly — only on master/executor CTAs and earned moments. Purple for customer/product CTAs.

**Layout rules:**
- Max content width: `max-w-5xl` (1024px)
- Section padding: `py-20 md:py-24 px-4`
- Cards: `rounded-2xl` or `rounded-3xl`, `border border-zinc-100`, hover: subtle shadow + `-translate-y-1`
- Buttons: `rounded-2xl` or `rounded-full`, `font-bold`, always have `active:scale-[0.98]`
- Mobile-first. Test at 390px. Every tap target minimum 44px.

**What to avoid (AI-template tells):**
- Emoji as primary icons — use SVG
- 01/02/03 numbering unless content is genuinely sequential
- Purple everywhere — amber is earned, not decorative
- Generic gradient orbs as the only visual interest
- Cards that all have the same hover state

## Conventions
- No comments unless WHY is non-obvious
- No new files without a clear reason
- Prefer editing existing files
- Trust signals always in i18n (never hardcoded to one language)
- `overflow-x: hidden` on `html, body` — never break mobile layout
