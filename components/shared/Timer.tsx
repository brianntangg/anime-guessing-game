'use client';

interface TimerProps {
  remainingMs: number;
  totalMs: number;
  size?: 'sm' | 'lg';
}

export function Timer({ remainingMs, totalMs, size = 'lg' }: TimerProps) {
  const pct = Math.max(0, Math.min(1, remainingMs / totalMs));
  const seconds = Math.ceil(remainingMs / 1000);
  const isUrgent = pct < 0.25;

  if (size === 'sm') {
    return (
      <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-linear ${isUrgent ? 'bg-red-400' : 'bg-green-400'}`}
          style={{ width: `${pct * 100}%` }}
        />
      </div>
    );
  }

  const r = 54;
  const circ = 2 * Math.PI * r;
  const dash = circ * pct;

  return (
    <div className="relative flex items-center justify-center w-32 h-32">
      <svg width="128" height="128" className="-rotate-90">
        <circle cx="64" cy="64" r={r} fill="none" stroke="white" strokeOpacity="0.2" strokeWidth="8" />
        <circle
          cx="64" cy="64" r={r} fill="none"
          stroke={isUrgent ? '#f87171' : '#4ade80'}
          strokeWidth="8"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s linear' }}
        />
      </svg>
      <span className={`absolute text-3xl font-bold tabular-nums ${isUrgent ? 'text-red-300' : 'text-white'}`}>
        {seconds}
      </span>
    </div>
  );
}
