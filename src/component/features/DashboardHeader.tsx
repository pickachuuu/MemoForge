'use client';

import { format } from 'date-fns';
import { ClayCard, ClayBadge } from '@/component/ui/Clay';
import { Calendar03Icon, SparklesIcon, Notebook01Icon } from 'hugeicons-react';
import type { UserProfile } from '@/hooks/useAuth';

const MOTIVATIONAL_LINES = [
  "Ready to forge some knowledge? Let's make today count.",
  "Every page turned is a step closer to mastery.",
  "Your notes are waiting. Let's build something great.",
  "Small steps, big results. Let's get started.",
  "The best time to study is now. Let's go!",
];

function getMotivationalLine() {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return MOTIVATIONAL_LINES[dayOfYear % MOTIVATIONAL_LINES.length];
}

export default function DashboardHeader({ user }: { user?: UserProfile | null }) {
  const currentDate = new Date();
  const greeting = getGreeting();

  function getGreeting() {
    const hour = currentDate.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }

  const displayName = user?.full_name || user?.email?.split('@')[0] || 'there';

  return (
    <ClayCard variant="elevated" padding="none" className="rounded-3xl relative overflow-hidden">
      {/* Notebook ruled-line texture background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 27px,
              #6366F1 27px,
              #6366F1 28px
            )
          `,
          backgroundSize: '100% 28px',
          backgroundPosition: '0 8px',
        }}
      />

      {/* Gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-gradient-to-bl from-primary/12 via-primary/6 to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-28 -left-28 w-64 h-64 bg-gradient-to-tr from-tertiary/10 via-tertiary/4 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/4 right-1/3 w-40 h-40 bg-gradient-to-br from-secondary/8 to-transparent rounded-full blur-2xl" />
      </div>

      {/* Red margin line accent (like notebook margin) */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-red-300/60 via-red-400/40 to-red-300/20 rounded-l-3xl" />

      <div className="relative z-10 px-8 py-7 md:px-10 md:py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <ClayBadge variant="accent" className="text-xs font-semibold px-3 py-1.5">
                <SparklesIcon className="w-3.5 h-3.5" />
                Welcome back
              </ClayBadge>
            </div>

            <div className="space-y-1.5">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight leading-tight">
                {greeting},{' '}
                <span className="bg-gradient-to-r from-primary via-primary-light to-tertiary bg-clip-text text-transparent">
                  {displayName}
                </span>
              </h1>
              <p className="text-foreground-muted text-base md:text-lg max-w-lg leading-relaxed">
                {getMotivationalLine()}
              </p>
            </div>
          </div>

          {/* Date + Notebook icon cluster */}
          <div className="flex items-center gap-4">
            {/* Mini notebook icon */}
            <div className="hidden md:flex p-3 rounded-2xl bg-gradient-to-br from-primary-muted/60 to-tertiary-muted/40 border border-white/60 shadow-sm">
              <Notebook01Icon className="w-6 h-6 text-primary" />
            </div>

            {/* Date card */}
            <div className="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/80 shadow-sm">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary-muted to-primary-muted/60">
                <Calendar03Icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-[10px] text-foreground-muted font-semibold uppercase tracking-widest">Today</p>
                <p className="text-sm font-bold text-foreground">
                  {format(currentDate, 'EEEE, MMM d')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ClayCard>
  );
}
