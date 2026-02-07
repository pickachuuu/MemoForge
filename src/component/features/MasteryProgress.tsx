'use client';

import { ClayCard } from '@/component/ui/Clay';
import { useMasteryData } from '@/hooks/useDashboard';

function MasterySkeleton() {
  return (
    <ClayCard variant="default" padding="md" className="rounded-2xl animate-pulse h-full">
      <div className="flex flex-col items-center gap-4 py-4">
        <div className="w-24 h-24 bg-surface-elevated rounded-full" />
        <div className="h-4 w-32 bg-surface-elevated rounded-lg" />
        <div className="w-full space-y-2">
          <div className="h-3 w-full bg-surface-elevated rounded-lg" />
          <div className="h-3 w-3/4 bg-surface-elevated rounded-lg" />
        </div>
      </div>
    </ClayCard>
  );
}

interface ProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
}

function ProgressRing({ percentage, size = 120, strokeWidth = 10 }: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const getColor = () => {
    if (percentage >= 80) return { stroke: '#5B7BF0', trackStroke: 'rgba(91, 123, 240, 0.12)', glow: 'rgba(91, 123, 240, 0.10)' };
    if (percentage >= 50) return { stroke: '#5B7BF0', trackStroke: 'rgba(91, 123, 240, 0.10)', glow: 'rgba(91, 123, 240, 0.08)' };
    if (percentage >= 25) return { stroke: '#5B7BF0', trackStroke: 'rgba(91, 123, 240, 0.08)', glow: 'rgba(91, 123, 240, 0.06)' };
    return { stroke: '#64748B', trackStroke: 'rgba(100, 116, 139, 0.10)', glow: 'rgba(100, 116, 139, 0.06)' };
  };

  const color = getColor();

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <div
        className="absolute inset-0 rounded-full blur-xl transition-all duration-700"
        style={{ background: color.glow }}
      />
      <svg width={size} height={size} className="transform -rotate-90 relative z-10">
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color.trackStroke} strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color.stroke} strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
          style={{ filter: 'drop-shadow(0 0 6px rgba(91, 123, 240, 0.3))' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
        <span className="text-2xl font-extrabold text-foreground leading-none">{percentage}%</span>
      </div>
    </div>
  );
}

function getLevel(percentage: number) {
  if (percentage >= 80) return { label: 'Master', emoji: '👑', color: 'text-primary-light' };
  if (percentage >= 50) return { label: 'Scholar', emoji: '📖', color: 'text-primary-light' };
  if (percentage >= 25) return { label: 'Learner', emoji: '✏️', color: 'text-primary-light' };
  return { label: 'Novice', emoji: '🌱', color: 'text-foreground-muted' };
}

export default function MasteryProgress() {
  const { data: mastery, isLoading } = useMasteryData();

  if (isLoading) {
    return <MasterySkeleton />;
  }

  const {
    totalCards = 0,
    newCards = 0,
    learningCards = 0,
    reviewCards = 0,
    masteredCards = 0,
    masteryPercentage = 0,
  } = mastery || {};

  if (totalCards === 0) {
    return (
      <ClayCard variant="default" padding="md" className="rounded-2xl h-full">
        <div className="text-center py-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface-elevated flex items-center justify-center border border-border/40">
            <span className="text-2xl">📚</span>
          </div>
          <h3 className="font-semibold text-foreground mb-1 text-sm">No flashcards yet</h3>
          <p className="text-xs text-foreground-muted">Create flashcards to track mastery</p>
        </div>
      </ClayCard>
    );
  }

  const level = getLevel(masteryPercentage);

  // Status segments for horizontal bar
  const segments = [
    { label: 'New', count: newCards, color: 'bg-slate-500' },
    { label: 'Learning', count: learningCards, color: 'bg-primary' },
    { label: 'Review', count: reviewCards, color: 'bg-secondary' },
    { label: 'Mastered', count: masteredCards, color: 'bg-primary-light' },
  ];

  return (
    <ClayCard variant="default" padding="none" className="rounded-2xl h-full overflow-hidden">
      <div className="p-5 flex flex-col items-center text-center h-full">
        {/* Ring */}
        <ProgressRing percentage={masteryPercentage} size={100} strokeWidth={9} />

        {/* Level label */}
        <div className="mt-3 flex items-center gap-1.5">
          <span className="text-sm">{level.emoji}</span>
          <span className={`text-sm font-bold ${level.color}`}>{level.label}</span>
        </div>

        <p className="text-xs text-foreground-muted mt-1">{totalCards} total cards</p>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Stacked bar */}
        <div className="w-full mt-4">
          <div className="h-2.5 rounded-full overflow-hidden flex bg-surface-elevated border border-border/30">
            {segments.map((seg) => {
              const width = totalCards > 0 ? (seg.count / totalCards) * 100 : 0;
              return width > 0 ? (
                <div
                  key={seg.label}
                  className={`${seg.color} transition-all duration-500`}
                  style={{ width: `${width}%` }}
                  title={`${seg.label}: ${seg.count}`}
                />
              ) : null;
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-3">
            {segments.map((seg) => (
              <div key={seg.label} className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${seg.color}`} />
                <span className="text-[10px] text-foreground-muted font-medium">
                  {seg.label} ({seg.count})
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ClayCard>
  );
}
