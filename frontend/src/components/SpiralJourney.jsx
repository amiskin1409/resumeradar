import { useMemo } from 'react'
import { motion } from 'framer-motion'

/**
 * SpiralJourney — circular / spiral presentation of the product journey.
 *
 * Architecture:
 *   - An Archimedean spiral (r grows linearly with angle) drawn in an 800x800 SVG.
 *   - A glowing "energy" segment flows continuously along the spiral.
 *   - The core circle is the engine that powers everything (local AI).
 *   - Each feature is a glass card attached to a node on the spiral by a
 *     connector line, ordered outward: the journey from gap analysis to offer.
 *   - Below lg the spiral is replaced by a simple responsive grid.
 */

const CX = 400
const CY = 400
const R_MIN = 60
const R_SPAN = 275
const TURNS = 1.55
const TH0 = (100 * Math.PI) / 180
const CARD_OFFSET = 68

const polar = (t) => {
  const th = TH0 + t * TURNS * Math.PI * 2
  const r = R_MIN + R_SPAN * t
  return { x: CX + r * Math.cos(th), y: CY + r * Math.sin(th), th, r }
}

const atCard = (t) => {
  const { th, r } = polar(t)
  const rc = r + CARD_OFFSET
  return { x: CX + rc * Math.cos(th), y: CY + rc * Math.sin(th) }
}

const SPIRAL_D = (() => {
  let d = ''
  for (let i = 0; i <= 420; i += 1) {
    const { x, y } = polar(i / 420)
    d += `${i ? ' L' : 'M'} ${x.toFixed(1)} ${y.toFixed(1)}`
  }
  return d
})()

const pct = (v) => `${(v / 800) * 100}%`

function Card({ item, index, className = '', compact = true, animate = true }) {
  const pad = compact ? 'p-2.5' : 'p-4'
  const iconBox = compact ? 'h-6 w-6 text-xs' : 'h-8 w-8 text-sm'
  const titleCls = compact ? 'mt-1.5 text-[13px] leading-snug' : 'mt-2 text-base'
  const textCls = compact ? 'mt-1 text-[11px] leading-snug line-clamp-3' : 'mt-1.5 text-sm leading-relaxed'
  return (
    <motion.div
      initial={animate ? { opacity: 0, scale: 0.85, y: 14 } : false}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: animate ? 0.25 + index * 0.12 : 0, duration: 0.5 }}
      whileHover={{ scale: 1.05, zIndex: 20 }}
      className={`glass group cursor-default ${pad} transition-shadow duration-300 hover:border-neon-violet/50 hover:shadow-[0_0_50px_-16px_rgb(139_92_246/0.85)] ${className}`}
    >
      <div className="flex items-center gap-2">
        <span className={`flex shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-neon-violet/30 to-neon-cyan/30 text-neon-cyan ${iconBox}`}>
          {item.icon}
        </span>
        <span className="font-display text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 transition-colors group-hover:text-neon-violet">
          step {String(index + 1).padStart(2, '0')}
        </span>
      </div>
      <h4 className={`font-display font-semibold text-white ${titleCls}`}>{item.title}</h4>
      <p className={`text-slate-400 ${textCls}`}>{item.text}</p>
    </motion.div>
  )
}

export default function SpiralJourney({ items, fallbackItems, core, endLabel = 'Job-ready' }) {
  const gridItems = fallbackItems || items
  const nodes = useMemo(
    () =>
      items.map((_, i) => {
        const t = 0.1 + (i * 0.8) / Math.max(1, items.length - 1)
        return { t, node: polar(t), card: atCard(t) }
      }),
    [items],
  )

  const end = polar(1)

  return (
    <div className="relative">
      {/* ---------- Spiral view (lg+) ---------- */}
      <div className="relative mx-auto hidden aspect-square w-full max-w-[860px] lg:block">
        <svg viewBox="0 0 800 800" className="absolute inset-0 h-full w-full overflow-visible">
          <defs>
            <linearGradient id="spiralGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="55%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>
            <filter id="spiralGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* concentric orbit rings */}
          {[140, 230, 320, 390].map((r) => (
            <circle
              key={r}
              cx={CX}
              cy={CY}
              r={r}
              fill="none"
              stroke="rgba(255,255,255,0.055)"
              strokeWidth="1"
              strokeDasharray="2 8"
            />
          ))}

          {/* slowly rotating dashed outer ring */}
          <circle
            cx={CX}
            cy={CY}
            r={396}
            fill="none"
            stroke="rgba(255,255,255,0.14)"
            strokeWidth="1.5"
            strokeDasharray="4 18"
            className="animate-spin [animation-duration:70s] [transform-box:view-box] [transform-origin:400px_400px]"
          />

          {/* base spiral, drawn on scroll into view */}
          <motion.path
            d={SPIRAL_D}
            fill="none"
            stroke="url(#spiralGrad)"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.5"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.8, ease: 'easeInOut' }}
          />

          {/* flowing energy segment along the spiral */}
          <path
            d={SPIRAL_D}
            fill="none"
            stroke="url(#spiralGrad)"
            strokeWidth="4"
            strokeLinecap="round"
            pathLength="1000"
            strokeDasharray="22 1000"
            filter="url(#spiralGlow)"
            className="spiral-flow"
          />

          {/* node dots + connectors to their cards */}
          {nodes.map(({ node, card }, i) => (
            <g key={i}>
              <line
                x1={node.x}
                y1={node.y}
                x2={card.x}
                y2={card.y}
                stroke="rgba(255,255,255,0.22)"
                strokeWidth="1.5"
                strokeDasharray="3 5"
              />
              <circle cx={node.x} cy={node.y} r="7" fill="#05060f" stroke="url(#spiralGrad)" strokeWidth="2.5" />
              <circle cx={node.x} cy={node.y} r="2.5" fill="#22d3ee" className="animate-pulse" />
            </g>
          ))}

          {/* journey endpoint */}
          <circle cx={end.x} cy={end.y} r="12" fill="none" stroke="rgba(52,211,153,0.45)" strokeWidth="1.5" className="animate-ping [animation-duration:2.4s] [transform-box:fill-box] [transform-origin:center]" />
          <circle cx={end.x} cy={end.y} r="6" fill="#34d399" filter="url(#spiralGlow)" />
        </svg>

        {/* feature cards on the spiral */}
        {items.map((item, i) => (
          <div
            key={item.title}
            className="absolute -translate-x-1/2 -translate-y-1/2 hover:z-20"
            style={{ left: pct(nodes[i].card.x), top: pct(nodes[i].card.y) }}
          >
            <Card item={item} index={i} className="w-[190px]" />
          </div>
        ))}

        {/* core: the engine powering every step */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass relative flex h-24 w-24 flex-col items-center justify-center rounded-full border-neon-cyan/40 text-center !shadow-[0_0_60px_-14px_rgb(34_211_238/0.7)]"
          >
            <span className="absolute inset-0 animate-pulse rounded-full border border-neon-cyan/25" />
            <span className="text-lg text-neon-cyan">{core.icon}</span>
            <span className="font-display text-[11px] font-bold leading-tight text-white">{core.title}</span>
            <span className="text-[9px] leading-tight text-slate-500">{core.sub}</span>
          </motion.div>
        </div>

        {/* endpoint label, sitting just above the glowing endpoint dot */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: pct(end.x), top: pct(end.y - 34) }}
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 1.6, duration: 0.5 }}
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-neon-emerald/50 bg-neon-emerald/15 px-3.5 py-1.5 text-xs font-semibold text-neon-emerald shadow-[0_0_40px_-12px_rgb(52_211_153/0.9)] backdrop-blur-xl"
          >
            🎯 {endLabel}
          </motion.span>
        </div>
      </div>

      {/* ---------- Grid fallback (below lg) ---------- */}
      <div className="grid gap-4 sm:grid-cols-2 lg:hidden">
        {gridItems.map((item, i) => (
          <Card key={item.title} item={item} index={i} compact={false} animate={false} />
        ))}
      </div>

      <p className="mt-8 text-center text-sm text-slate-500">
        Follow the spiral — every step builds on the last, powered by{' '}
        <span className="text-neon-cyan">{core.title}</span>, until you reach{' '}
        <span className="text-neon-emerald">{endLabel}</span>.
      </p>
    </div>
  )
}
