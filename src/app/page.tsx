'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import {
  ChevronDown,
  Clock,
  Zap,
  TrendingUp,
  CircleDot,
  Lock,
  ArrowRight,
  Sparkles,
  Check,
  RefreshCw,
  StickyNote,
  Filter,
  X,
} from 'lucide-react'

// ---------- Types ----------
type Status = 'overdue' | 'active' | 'done' | 'not-started'
type TagTone = 'blue' | 'green' | 'orange' | 'purple' | 'pink' | 'cyan'

type GridItem = {
  id: string
  header: string
  description: string
}

type ChecklistStep = {
  id: string
  title: string
  description: string
}

type PhaseCard = {
  id: string
  index: number
  title: string
  subtitle: string
  description: string
  status: Status
  bodyType: 'checklist' | 'grid'
  checklist?: ChecklistStep[]
  grid?: GridItem[]
  tags: { label: string; tone: TagTone }[]
  phaseTag: string // e.g. "Phase 0"
}

// ---------- Static meta ----------
const STATUS_META: Record<
  Status,
  { label: string; bg: string; text: string; ring: string; dot: string }
> = {
  overdue: {
    label: 'Overdue',
    bg: 'bg-red-500/15',
    text: 'text-red-300',
    ring: 'ring-1 ring-red-500/30',
    dot: 'bg-red-400',
  },
  active: {
    label: 'Working on it',
    bg: 'bg-orange-500/15',
    text: 'text-orange-300',
    ring: 'ring-1 ring-orange-500/30',
    dot: 'bg-orange-400',
  },
  done: {
    label: 'Done',
    bg: 'bg-emerald-500/15',
    text: 'text-emerald-300',
    ring: 'ring-1 ring-emerald-500/30',
    dot: 'bg-emerald-400',
  },
  'not-started': {
    label: 'Not started',
    bg: 'bg-zinc-500/15',
    text: 'text-zinc-400',
    ring: 'ring-1 ring-zinc-500/25',
    dot: 'bg-zinc-500',
  },
}

const TAG_TONES: Record<TagTone, string> = {
  blue: 'bg-blue-500/15 text-blue-200 ring-1 ring-blue-500/25',
  green: 'bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-500/25',
  orange: 'bg-orange-500/15 text-orange-200 ring-1 ring-orange-500/25',
  purple: 'bg-purple-500/15 text-purple-200 ring-1 ring-purple-500/25',
  pink: 'bg-pink-500/15 text-pink-200 ring-1 ring-pink-500/25',
  cyan: 'bg-cyan-500/15 text-cyan-200 ring-1 ring-cyan-500/25',
}

const PHASE_LEGEND = [
  { phase: 'Phase 0', color: 'bg-zinc-400', filterId: 'phase-0' },
  { phase: 'Phase 1', color: 'bg-orange-400', filterId: 'phase-1' },
  { phase: 'Phase 2', color: 'bg-blue-400', filterId: 'phase-2' },
  { phase: 'Phase 3', color: 'bg-purple-400', filterId: 'phase-3' },
  { phase: 'Phase 4', color: 'bg-emerald-400', filterId: 'phase-4' },
  { phase: 'Phase 5', color: 'bg-pink-400', filterId: 'phase-5' },
]

const METRICS = [
  { label: 'places', value: '5', icon: CircleDot },
  { label: 'mo in branch', value: '-18', icon: Clock },
  { label: 'monthly API actions', value: '0', icon: Zap },
  { label: 'total spend', value: '$0', icon: TrendingUp },
]

const DASHBOARD_OVERVIEW = [
  { label: 'Phases', value: '5 phases' },
  { label: 'Timeline', value: '-10mo to launch' },
  { label: 'Modules', value: '0 modules complete' },
  { label: 'Pipeline', value: '$0 total pipeline' },
]

const PHASE_CARDS: PhaseCard[] = [
  {
    id: 'phase-0',
    index: 0,
    phaseTag: 'Phase 0',
    title: 'Phase 0: BUILD — PRE-WORK — As You Today',
    subtitle: 'Pre-work • 24-step approach • PMF foundation',
    status: 'overdue',
    bodyType: 'checklist',
    description:
      'Review of the 24-step approach and tools to prepare your messaging and GTM. Ensuring PMF is dependent on assessing your personas and their JTBD/PAINS/GAINS in the early days. Use this section heavily for ideation, hacking and getting setup.',
    checklist: [
      {
        id: 'p0-s1',
        title: 'Review the 24-step guide',
        description:
          'Leverage the framework built around the 24 steps to successful innovation to structure your approach to customer discovery and validation.',
      },
      {
        id: 'p0-s2',
        title: 'Identify your primary persona (ICP)',
        description:
          'Determine your primary target persona (ICP). Be specific—"everyone" is not a target market.',
      },
      {
        id: 'p0-s3',
        title: 'Calculate the TAM/SAM/SOM',
        description:
          'Calculate the Total Addressable Market (TAM), Serviceable Addressable Market (SAM), and Serviceable Obtainable Market (SOM) for your primary persona.',
      },
      {
        id: 'p0-s4',
        title: 'Develop customer personas',
        description:
          'Flesh out your primary persona with details like demographics, psychographics, pain points, and motivations. Give them a face (or a stock photo).',
      },
      {
        id: 'p0-s5',
        title: 'Synthesize customer research',
        description:
          'Analyze the findings from your discovery interviews. Refine your customer persona and value proposition based on the insights gathered.',
      },
      {
        id: 'p0-s6',
        title: 'Update your messaging strategy',
        description:
          'Update your messaging to highlight how your product solves the specific pain points and delivers the desired gains of your target persona.',
      },
      {
        id: 'p0-s7',
        title: 'Create the full customer journey',
        description:
          'Chart out the step-by-step process of how your persona discovers, buys, and uses your product.',
      },
      {
        id: 'p0-s8',
        title: 'Review the GTM & PMF Playbook',
        description:
          'Read through the GTM & PMF playbook to ensure you have a solid understanding of the concepts and frameworks.',
      },
    ],
    tags: [
      { label: 'Discovery', tone: 'blue' },
      { label: 'ICP', tone: 'orange' },
      { label: 'TAM/SAM/SOM', tone: 'purple' },
      { label: 'Messaging', tone: 'green' },
      { label: 'GTM', tone: 'cyan' },
    ],
  },
  {
    id: 'phase-1',
    index: 1,
    phaseTag: 'Phase 1',
    title: 'Phase 1: Foundation — Build the core messaging, assets and strategy',
    subtitle: 'Brand identity • Positioning • Core value prop',
    status: 'active',
    bodyType: 'grid',
    description:
      'Establish a solid foundation. Define your brand, build your core messaging and start to map out the customer journey. Establish a core value prop, messaging, and overall business strategy.',
    grid: [
      {
        id: 'p1-g1',
        header: 'Establish the Core',
        description:
          'The core is your "unique advantage in the market". This is what sets you apart from competitors. What is your unique advantage? It could be network effects, customer service, lowest cost, or best user experience. Ensure everything you build reinforces your Core.',
      },
      {
        id: 'p1-g2',
        header: 'Brand Identity',
        description:
          'Develop your core brand elements: logo, color palette, typography, and brand voice. Ensure consistency across all touchpoints.',
      },
      {
        id: 'p1-g3',
        header: 'Customer Personas — Pains & Gains',
        description:
          'Flesh out your primary persona with details like demographics, psychographics, pain points, and motivations. Give them a name and a face.',
      },
      {
        id: 'p1-g4',
        header: 'Competitive Analysis',
        description:
          'Identify your direct and indirect competitors. Analyze their strengths and weaknesses to find your unique positioning in the market.',
      },
      {
        id: 'p1-g5',
        header: 'Positioning & Messaging',
        description:
          'Develop clear, concise messaging that communicates your unique value proposition. Create an elevator pitch, tagline, and boilerplate copy.',
      },
    ],
    tags: [
      { label: 'Foundational tasks', tone: 'blue' },
      { label: 'Infrastructure', tone: 'cyan' },
      { label: 'Brand identity', tone: 'orange' },
      { label: 'Competitive analysis', tone: 'purple' },
      { label: 'Legal setup', tone: 'green' },
    ],
  },
  {
    id: 'phase-2',
    index: 2,
    phaseTag: 'Phase 2',
    title: 'Phase 2: Content strategy — Generate interest and build an audience',
    subtitle: 'Audience building • Lead magnets • Email nurture',
    status: 'not-started',
    bodyType: 'grid',
    description:
      'Start building an audience of early adopters who are interested in your solution. This will be your initial customer base when you launch. Use content marketing, social media, and networking to drive traffic to your landing page.',
    grid: [
      {
        id: 'p2-g1',
        header: 'Create a Lead Magnet',
        description:
          'Offer something valuable for free in exchange for email addresses. This could be an ebook, checklist, webinar, or exclusive access. Ensure your lead magnet is highly relevant to your target persona.',
      },
      {
        id: 'p2-g2',
        header: 'Content Calendar',
        description:
          'Develop a content calendar. Plan out blog posts, social media updates, and newsletters. Focus on educating and engaging your audience, not just selling to them.',
      },
      {
        id: 'p2-g3',
        header: 'Social Media Outreach',
        description:
          'Actively participate in online communities where your target persona hangs out. Provide value, answer questions, and subtly promote your landing page.',
      },
      {
        id: 'p2-g4',
        header: 'Email Nurture Sequence',
        description:
          'Set up an automated email sequence to welcome new subscribers and introduce them to your brand. Keep them engaged until launch.',
      },
      {
        id: 'p2-g5',
        header: 'Partnerships',
        description:
          'Identify potential partners or influencers who share your target audience. Collaborate on content or promotions to tap into their existing following.',
      },
    ],
    tags: [
      { label: 'Lead generation', tone: 'blue' },
      { label: 'Content marketing', tone: 'green' },
      { label: 'Audience building', tone: 'orange' },
      { label: 'Social media', tone: 'purple' },
      { label: 'Email marketing', tone: 'pink' },
    ],
  },
  {
    id: 'phase-3',
    index: 3,
    phaseTag: 'Phase 3',
    title: 'Phase 3: Differentiation — Refine your product and positioning',
    subtitle: 'Beta feedback • Pricing • Sales collateral',
    status: 'not-started',
    bodyType: 'grid',
    description:
      'Incorporate feedback from your beta testers to refine your product. Strengthen your differentiation and ensure your solution truly solves the problem better than existing alternatives. This is about achieving product-market fit.',
    grid: [
      {
        id: 'p3-g1',
        header: 'Analyze Beta Feedback',
        description:
          'Review all the feedback you received from your beta testers. Look for patterns and identify areas for improvement. What features are they using the most? What features are they ignoring? Use this data to inform your product roadmap.',
      },
      {
        id: 'p3-g2',
        header: 'Product Iteration',
        description:
          'Implement necessary changes to your product based on beta feedback. Focus on improving usability, fixing bugs, and adding highly requested features.',
      },
      {
        id: 'p3-g3',
        header: 'Positioning Refinement',
        description:
          'Update your messaging and positioning based on how your beta testers describe your product. Use their language to resonate better with your broader audience.',
      },
      {
        id: 'p3-g4',
        header: 'Pricing Model Finalization',
        description:
          'Confirm your pricing structure. Consider tiered pricing, subscriptions, or one-time fees based on your business model and customer willingness to pay.',
      },
      {
        id: 'p3-g5',
        header: 'Sales Materials Creation',
        description:
          'Develop sales collateral such as pitch decks, case studies, and product demos. Prepare everything you need to sell your product effectively.',
      },
    ],
    tags: [
      { label: 'Product refinement', tone: 'orange' },
      { label: 'Pricing strategy', tone: 'green' },
      { label: 'Sales collateral', tone: 'blue' },
      { label: 'Onboarding', tone: 'purple' },
      { label: 'Customer support', tone: 'cyan' },
    ],
  },
  {
    id: 'phase-4',
    index: 4,
    phaseTag: 'Phase 4',
    title: 'Phase 4: Beta launch — Launch to your list and refine',
    subtitle: 'Soft launch • Test infra • Gather testimonials',
    status: 'not-started',
    bodyType: 'grid',
    description:
      'Launch your product to the audience you have built over the past few months. This is a soft launch to test your marketing messages, sales process, and product infrastructure under real-world conditions before a wider public launch.',
    grid: [
      {
        id: 'p4-g1',
        header: 'Execute the Launch Plan',
        description:
          'Roll out your marketing campaign to your email list and social media followers. Offer a special "early bird" discount or bonus to incentivize immediate action. Monitor the launch closely and be prepared to address any technical issues or customer questions.',
      },
      {
        id: 'p4-g2',
        header: 'Launch Communication',
        description:
          'Send a series of launch emails to your list. Build anticipation, announce the opening of the cart, and send reminders before the launch window closes.',
      },
      {
        id: 'p4-g3',
        header: 'Monitor System Performance',
        description:
          'Keep a close eye on your servers, payment processors, and application performance. Ensure everything can handle the influx of new users without crashing.',
      },
      {
        id: 'p4-g4',
        header: 'Gather Testimonials',
        description:
          'Reach out to your new paying customers and ask for reviews or testimonials. Use these to build social proof for your upcoming public launch.',
      },
      {
        id: 'p4-g5',
        header: 'Analyze Launch Metrics',
        description:
          'Review the performance of your launch. Calculate your conversion rate, customer acquisition cost (CAC), and lifetime value (LTV) projections.',
      },
    ],
    tags: [
      { label: 'Soft launch', tone: 'blue' },
      { label: 'Launch strategy', tone: 'orange' },
      { label: 'Performance monitoring', tone: 'green' },
      { label: 'Customer feedback', tone: 'purple' },
    ],
  },
]

// ---------- Persistence helpers ----------
const STORAGE_KEY = 'z2l-tracker-state-v1'

type TrackerState = {
  completed: Record<string, boolean>
  notes: Record<string, string>
}

const defaultState: TrackerState = { completed: {}, notes: {} }

function loadState(): TrackerState {
  if (typeof window === 'undefined') return defaultState
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultState
    const parsed = JSON.parse(raw)
    return {
      completed: parsed.completed ?? {},
      notes: parsed.notes ?? {},
    }
  } catch {
    return defaultState
  }
}

function saveState(state: TrackerState) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore quota errors
  }
}

// ---------- Sub-components ----------

function MetricBlock({
  value,
  label,
  Icon,
}: {
  value: string
  label: string
  Icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <div className="rounded-xl bg-[#0c0c0f] ring-1 ring-white/5 px-5 py-4 flex flex-col gap-2 transition hover:ring-white/15 hover:bg-[#101013]">
      <div className="flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-[0.18em] text-zinc-500 font-medium">
          {label}
        </span>
        <Icon className="h-3.5 w-3.5 text-zinc-600" />
      </div>
      <div className="text-2xl font-semibold text-white tabular-nums leading-tight">
        {value}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: Status }) {
  const meta = STATUS_META[status]
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${meta.bg} ${meta.text} ${meta.ring}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  )
}

function TagPill({ label, tone }: { label: string; tone: TagTone }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${TAG_TONES[tone]}`}
    >
      {label}
    </span>
  )
}

function ProgressBar({
  done,
  total,
}: {
  done: number
  total: number
}) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100)
  const tone =
    pct === 100
      ? 'bg-emerald-400'
      : pct >= 50
        ? 'bg-orange-400'
        : pct > 0
          ? 'bg-blue-400'
          : 'bg-zinc-600'
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-24 rounded-full bg-white/5 overflow-hidden">
        <div
          className={`h-full ${tone} transition-all duration-300`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[10px] tabular-nums text-zinc-500 font-medium">
        {done}/{total} · {pct}%
      </span>
    </div>
  )
}

function ChecklistBody({
  items,
  completed,
  onToggle,
}: {
  items: ChecklistStep[]
  completed: Record<string, boolean>
  onToggle: (id: string) => void
}) {
  return (
    <ol className="mt-5 space-y-3">
      {items.map((step, i) => {
        const isDone = !!completed[step.id]
        return (
          <li
            key={step.id}
            className={`group flex gap-4 rounded-lg p-4 ring-1 transition ${
              isDone
                ? 'bg-emerald-500/[0.06] ring-emerald-500/20'
                : 'bg-white/[0.02] ring-white/5 hover:bg-white/[0.04] hover:ring-white/10'
            }`}
          >
            <button
              onClick={() => onToggle(step.id)}
              aria-pressed={isDone}
              aria-label={`Mark step ${i + 1} ${isDone ? 'incomplete' : 'complete'}`}
              className="flex-shrink-0 mt-0.5 group/check"
            >
              <div className="flex items-center gap-2">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition ${
                    isDone
                      ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40'
                      : 'bg-zinc-800 text-zinc-300 ring-1 ring-white/10 group-hover/check:bg-orange-500/15 group-hover/check:text-orange-300 group-hover/check:ring-orange-500/30'
                  }`}
                >
                  {isDone ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </div>
              </div>
            </button>
            <div className="flex flex-col gap-1 min-w-0">
              <div
                className={`text-sm font-medium ${
                  isDone ? 'text-emerald-200' : 'text-zinc-100'
                }`}
              >
                {step.title}
              </div>
              <div className="text-[13px] leading-relaxed text-zinc-400">
                {step.description}
              </div>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

function GridBody({
  items,
  completed,
  onToggle,
}: {
  items: GridItem[]
  completed: Record<string, boolean>
  onToggle: (id: string) => void
}) {
  return (
    <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
      {items.map((item) => {
        const isDone = !!completed[item.id]
        return (
          <div
            key={item.id}
            className={`rounded-lg p-4 ring-1 transition ${
              isDone
                ? 'bg-emerald-500/[0.06] ring-emerald-500/20'
                : 'bg-white/[0.02] ring-white/5 hover:bg-white/[0.04] hover:ring-white/10'
            }`}
          >
            <div className="flex items-start justify-between gap-3 mb-1.5">
              <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-200">
                {item.header}
              </div>
              <button
                onClick={() => onToggle(item.id)}
                aria-pressed={isDone}
                aria-label={`Mark "${item.header}" ${isDone ? 'incomplete' : 'complete'}`}
                className={`flex-shrink-0 flex h-5 w-5 items-center justify-center rounded transition ${
                  isDone
                    ? 'bg-emerald-500/30 text-emerald-200 ring-1 ring-emerald-500/40'
                    : 'bg-white/5 text-zinc-500 ring-1 ring-white/10 hover:bg-emerald-500/15 hover:text-emerald-300 hover:ring-emerald-500/30'
                }`}
              >
                {isDone && <Check className="h-3 w-3" />}
              </button>
            </div>
            <div className="text-[13px] leading-relaxed text-zinc-400">
              {item.description}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function PhaseCardItem({
  card,
  expanded,
  onToggle,
  completed,
  notes,
  onToggleItem,
  onNoteChange,
  onMarkAll,
  onReset,
}: {
  card: PhaseCard
  expanded: boolean
  onToggle: () => void
  completed: Record<string, boolean>
  notes: Record<string, string>
  onToggleItem: (id: string) => void
  onNoteChange: (note: string) => void
  onMarkAll: () => void
  onReset: () => void
}) {
  const items = card.bodyType === 'checklist' ? card.checklist : card.grid
  const total = items?.length ?? 0
  const done = items?.filter((it) => completed[it.id]).length ?? 0
  const allDone = total > 0 && done === total

  return (
    <article className="rounded-2xl bg-[#161619] ring-1 ring-white/[0.06] overflow-hidden transition hover:ring-white/[0.12]">
      {/* Header (clickable) */}
      <button
        onClick={onToggle}
        className="w-full text-left px-5 md:px-6 py-5 flex items-start justify-between gap-4 cursor-pointer"
        aria-expanded={expanded}
      >
        <div className="flex items-start gap-4 min-w-0 flex-1">
          <div className="flex-shrink-0 mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.04] ring-1 ring-white/10 text-sm font-semibold text-zinc-300">
            P{card.index}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-base md:text-[17px] font-semibold text-white leading-snug">
              {card.title}
            </h2>
            <p className="mt-1 text-[13px] text-zinc-500">{card.subtitle}</p>
            <div className="mt-2.5">
              <ProgressBar done={done} total={total} />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <StatusBadge status={allDone ? 'done' : card.status} />
          <ChevronDown
            className={`h-4 w-4 text-zinc-500 transition-transform ${
              expanded ? 'rotate-180' : ''
            }`}
          />
        </div>
      </button>

      {/* Expandable body */}
      {expanded && (
        <div className="px-5 md:px-6 pb-6 pt-1 border-t border-white/5">
          <div className="mt-4 flex items-start justify-between gap-3 flex-wrap">
            <p className="text-[13.5px] leading-relaxed text-zinc-400 max-w-3xl">
              {card.description}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={onMarkAll}
                className="inline-flex items-center gap-1.5 rounded-md bg-white/5 px-2.5 py-1.5 text-[11px] font-medium text-zinc-300 ring-1 ring-white/10 hover:bg-white/10 transition"
              >
                <Check className="h-3 w-3" />
                Mark all
              </button>
              <button
                onClick={onReset}
                className="inline-flex items-center gap-1.5 rounded-md bg-white/5 px-2.5 py-1.5 text-[11px] font-medium text-zinc-400 ring-1 ring-white/10 hover:bg-white/10 transition"
              >
                <RefreshCw className="h-3 w-3" />
                Reset
              </button>
            </div>
          </div>

          {card.bodyType === 'checklist' && card.checklist && (
            <ChecklistBody
              items={card.checklist}
              completed={completed}
              onToggle={onToggleItem}
            />
          )}
          {card.bodyType === 'grid' && card.grid && (
            <GridBody
              items={card.grid}
              completed={completed}
              onToggle={onToggleItem}
            />
          )}

          {/* Notes */}
          <div className="mt-5 rounded-lg bg-white/[0.02] ring-1 ring-white/5 p-4">
            <label className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-zinc-500 font-medium mb-2">
              <StickyNote className="h-3 w-3" />
              Phase notes
            </label>
            <textarea
              value={notes[card.id] ?? ''}
              onChange={(e) => onNoteChange(e.target.value)}
              placeholder={`Add your private notes for ${card.phaseTag}...`}
              className="w-full bg-transparent text-[13px] leading-relaxed text-zinc-200 placeholder:text-zinc-600 resize-y min-h-[60px] outline-none"
            />
          </div>

          {/* Tags */}
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="text-[11px] uppercase tracking-[0.16em] text-zinc-600 mr-1">
              Tags
            </span>
            {card.tags.map((tag) => (
              <TagPill key={tag.label} label={tag.label} tone={tag.tone} />
            ))}
          </div>
        </div>
      )}
    </article>
  )
}

// ---------- Page ----------

export default function Home() {
  const [expandedId, setExpandedId] = useState<string | null>('phase-0')
  const [state, setState] = useState<TrackerState>(defaultState)
  const [hydrated, setHydrated] = useState(false)
  const [filter, setFilter] = useState<string | null>(null)

  // Hydrate from localStorage on mount (lazy init via useState initializer would
  // break SSR; we use a one-shot effect + ref guard to avoid cascading renders).
  const hydratedRef = useRef(false)
  useEffect(() => {
    if (hydratedRef.current) return
    hydratedRef.current = true
    const loaded = loadState()
    setState(loaded)
    setHydrated(true)
  }, [])

  // Persist on every change after hydration
  useEffect(() => {
    if (hydrated) saveState(state)
  }, [state, hydrated])

  const toggleItem = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      completed: { ...s.completed, [id]: !s.completed[id] },
    }))
  }, [])

  const setNote = useCallback((phaseId: string, note: string) => {
    setState((s) => ({ ...s, notes: { ...s.notes, [phaseId]: note } }))
  }, [])

  const markAll = useCallback((card: PhaseCard) => {
    setState((s) => {
      const next = { ...s.completed }
      const items = card.bodyType === 'checklist' ? card.checklist : card.grid
      items?.forEach((it) => (next[it.id] = true))
      return { ...s, completed: next }
    })
  }, [])

  const resetCard = useCallback((card: PhaseCard) => {
    setState((s) => {
      const next = { ...s.completed }
      const items = card.bodyType === 'checklist' ? card.checklist : card.grid
      items?.forEach((it) => delete next[it.id])
      return { ...s, completed: next }
    })
  }, [])

  const resetAll = useCallback(() => {
    if (
      typeof window !== 'undefined' &&
      !window.confirm('Reset ALL progress across every phase? This cannot be undone.')
    )
      return
    setState({ completed: {}, notes: {} })
  }, [])

  const toggle = (id: string) =>
    setExpandedId((cur) => (cur === id ? null : id))

  // Apply filter
  const visibleCards = useMemo(() => {
    if (!filter) return PHASE_CARDS
    return PHASE_CARDS.filter((c) => c.phaseTag === filter)
  }, [filter])

  // Overall stats
  const totalItems = useMemo(() => {
    return PHASE_CARDS.reduce((acc, c) => {
      const items = c.bodyType === 'checklist' ? c.checklist : c.grid
      return acc + (items?.length ?? 0)
    }, 0)
  }, [])

  const doneItems = useMemo(() => {
    return PHASE_CARDS.reduce((acc, c) => {
      const items = c.bodyType === 'checklist' ? c.checklist : c.grid
      return acc + (items?.filter((it) => state.completed[it.id]).length ?? 0)
    }, 0)
  }, [state.completed])

  const overallPct =
    totalItems === 0 ? 0 : Math.round((doneItems / totalItems) * 100)

  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-100 flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-white/5 bg-[#08080a]/80 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 md:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-md bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-white">
                Zero to Launch
              </span>
              <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                Project Tracker
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-[11px]">
              <span className="text-zinc-500">Overall:</span>
              <div className="h-1.5 w-24 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-400 to-emerald-400 transition-all duration-300"
                  style={{ width: `${overallPct}%` }}
                />
              </div>
              <span className="tabular-nums text-zinc-300 font-medium">
                {overallPct}%
              </span>
            </div>
            <button
              onClick={resetAll}
              className="inline-flex items-center gap-1.5 rounded-md bg-white/5 px-2.5 py-1.5 text-[11px] font-medium text-zinc-400 ring-1 ring-white/10 hover:bg-red-500/10 hover:text-red-300 hover:ring-red-500/30 transition"
              title="Reset all progress"
            >
              <RefreshCw className="h-3 w-3" />
              Reset all
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 md:px-8 py-6 md:py-10 space-y-8 flex-1 w-full">
        {/* Page heading */}
        <section className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-sm text-zinc-500 max-w-2xl">
            Track every phase of your journey from pre-work to beta launch.
            Tap any step to mark it complete — your progress is saved locally
            in your browser.
          </p>
        </section>

        {/* Metrics dashboard */}
        <section>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {METRICS.map((m) => (
              <MetricBlock
                key={m.label}
                value={m.value}
                label={m.label}
                Icon={m.icon}
              />
            ))}
          </div>

          {/* Dashboard overview row */}
          <div className="mt-3 rounded-xl bg-[#0c0c0f] ring-1 ring-white/5 px-5 py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-white/5">
              {DASHBOARD_OVERVIEW.map((item, i) => (
                <div
                  key={item.label}
                  className={`px-0 md:px-5 ${
                    i === 0 ? 'md:pl-0' : ''
                  } py-3 md:py-0 first:pt-0 last:pb-0`}
                >
                  <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500 font-medium">
                    {item.label}
                  </div>
                  <div className="mt-1 text-sm font-medium text-zinc-200">
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Phase legend (clickable filter) */}
        <section className="rounded-xl bg-[#0c0c0f] ring-1 ring-white/5 px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] uppercase tracking-[0.18em] text-zinc-500 font-medium">
              Phase Legend
            </span>
            <span className="text-[11px] text-zinc-600">
              Click a phase to filter
            </span>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-3">
            <button
              onClick={() => setFilter(null)}
              className={`group inline-flex items-center gap-2 text-xs transition ${
                filter === null
                  ? 'text-white'
                  : 'text-zinc-400 hover:text-zinc-100'
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-white ring-2 ring-white/10" />
              <span className="font-medium">All</span>
            </button>
            {PHASE_LEGEND.map((p) => {
              const isActive = filter === p.filterId
              return (
                <button
                  key={p.phase}
                  onClick={() => setFilter(isActive ? null : p.filterId)}
                  className={`group inline-flex items-center gap-2 text-xs transition ${
                    isActive
                      ? 'text-white'
                      : 'text-zinc-400 hover:text-zinc-100'
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${p.color} ring-2 ${
                      isActive ? 'ring-white/40' : 'ring-white/10'
                    }`}
                  />
                  <span className="font-medium">{p.phase}</span>
                </button>
              )
            })}
          </div>
        </section>

        {/* Filters / tags (also clickable) */}
        <section className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-zinc-600 mr-2">
            <Filter className="h-3 w-3" />
            Filters
          </span>
          {filter && (
            <button
              onClick={() => setFilter(null)}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white ring-1 ring-white/20 hover:bg-white/15 transition"
            >
              {filter.replace('-', ' ')}
              <X className="h-3 w-3" />
            </button>
          )}
          {!filter && (
            <span className="text-[11px] text-zinc-600">
              Showing all phases
            </span>
          )}
        </section>

        {/* Phase cards */}
        <section className="space-y-4">
          {visibleCards.length === 0 && (
            <div className="rounded-2xl bg-[#161619] ring-1 ring-white/5 p-10 text-center text-sm text-zinc-500">
              No phases match the current filter.
            </div>
          )}
          {visibleCards.map((card) => (
            <PhaseCardItem
              key={card.id}
              card={card}
              expanded={expandedId === card.id}
              onToggle={() => toggle(card.id)}
              completed={state.completed}
              notes={state.notes}
              onToggleItem={toggleItem}
              onNoteChange={(note) => setNote(card.id, note)}
              onMarkAll={() => markAll(card)}
              onReset={() => resetCard(card)}
            />
          ))}
        </section>

        {/* Footer CTA */}
        <section className="rounded-2xl bg-gradient-to-br from-[#1a1318] via-[#161619] to-[#0f1015] ring-1 ring-orange-500/15 p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/15 px-2.5 py-1 text-[11px] font-medium text-orange-300 ring-1 ring-orange-500/25 mb-3">
              <Sparkles className="h-3 w-3" />
              Pro membership
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-white">
              Are you ready for the next level?
            </h3>
            <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
              Join the{' '}
              <span className="text-zinc-200 font-medium">
                &quot;Zero to Launch&quot;
              </span>{' '}
              Pro membership to access exclusive resources, community support,
              and personalized coaching to accelerate your journey. Start your
              free 14-day trial today.
            </p>
          </div>
          <button className="group inline-flex items-center gap-2 rounded-lg bg-white text-zinc-900 px-5 py-2.5 text-sm font-semibold hover:bg-zinc-200 transition flex-shrink-0">
            Start free trial
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </section>
      </main>

      {/* Sticky footer */}
      <footer className="mt-auto border-t border-white/5 bg-[#08080a]">
        <div className="mx-auto max-w-6xl px-4 md:px-8 py-5 flex flex-col md:flex-row items-center justify-between gap-2 text-[11px] text-zinc-600">
          <span>
            © {new Date().getFullYear()} Zero to Launch · Project Tracker
          </span>
          <span className="flex items-center gap-3">
            <span>v1.0.0</span>
            <span className="h-1 w-1 rounded-full bg-zinc-700" />
            <span>Dark mode</span>
            <span className="h-1 w-1 rounded-full bg-zinc-700" />
            <span>{doneItems}/{totalItems} steps done</span>
          </span>
        </div>
      </footer>
    </div>
  )
}
