import { motion } from 'framer-motion'

const COLORS = {
  violet: ['#8b5cf6', '#22d3ee'],
  emerald: ['#34d399', '#22d3ee'],
  amber: ['#fbbf24', '#fb7185'],
}

/**
 * Animated SVG progress ring.
 * value: 0-100
 */
export default function ProgressRing({
  value = 0,
  size = 150,
  strokeWidth = 12,
  color = 'violet',
  label,
  sublabel,
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = Math.min(100, Math.max(0, value))
  const offset = circumference - (progress / 100) * circumference
  const [from, to] = COLORS[color] || COLORS.violet
  const gradId = `ring-grad-${color}`

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={from} />
            <stop offset="100%" stopColor={to} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.4, ease: 'easeOut' }}
          style={{ filter: 'drop-shadow(0 0 8px rgba(139,92,246,0.5))' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="font-display text-3xl font-bold text-white"
        >
          {Math.round(progress)}
          <span className="text-lg text-slate-400">%</span>
        </motion.span>
        {label && <span className="mt-0.5 text-[11px] uppercase tracking-widest text-slate-400">{label}</span>}
        {sublabel && <span className="text-[11px] text-neon-cyan">{sublabel}</span>}
      </div>
    </div>
  )
}
