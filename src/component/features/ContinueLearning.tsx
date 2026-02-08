'use client';

import { ClayCard } from '@/component/ui/Clay';
import { useContinueLearning } from '@/hooks/useDashboard';
import {
  PlayIcon,
  Clock01Icon,
  Add01Icon,
  ArrowRight01Icon,
  SparklesIcon,
  PencilEdit01Icon,
  Bookmark01Icon,
} from 'hugeicons-react';
import { FlashcardIcon } from '@/component/icons';
import Link from 'next/link';

function ContinueSkeleton() {
  return (
    <ClayCard variant="elevated" padding="lg" className="rounded-3xl animate-pulse h-full">
      <div className="space-y-4">
        <div className="h-5 w-32 bg-surface rounded-lg" />
        <div className="h-28 bg-gradient-to-br from-surface to-surface-elevated rounded-2xl" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-14 bg-surface rounded-xl" />
          <div className="h-14 bg-surface rounded-xl" />
        </div>
      </div>
    </ClayCard>
  );
}

export default function ContinueLearning() {
  const { data, isLoading } = useContinueLearning();

  if (isLoading) {
    return <ContinueSkeleton />;
  }

  const { lastStudiedSet, suggestedAction, dueCardsCount } = data || {};

  const getActionConfig = () => {
    switch (suggestedAction) {
      case 'review_due':
        return {
          title: 'Review Due Cards',
          subtitle: `${dueCardsCount} cards waiting`,
          icon: <Clock01Icon className="w-6 h-6" />,
          href: '/flashcards',
          accentColor: 'secondary',
          priority: 'high',
        };
      case 'continue_set':
        return {
          title: 'Continue Studying',
          subtitle: lastStudiedSet ? `${lastStudiedSet.title}` : 'Pick up where you left off',
          icon: <PlayIcon className="w-6 h-6" />,
          href: lastStudiedSet ? `/flashcards/${lastStudiedSet.id}/study` : '/flashcards',
          accentColor: 'primary',
          priority: 'medium',
        };
      case 'start_new':
        return {
          title: 'Start New Set',
          subtitle: 'Begin studying a new set',
          icon: <FlashcardIcon className="w-6 h-6" />,
          href: '/flashcards',
          accentColor: 'tertiary',
          priority: 'normal',
        };
      case 'create_cards':
      default:
        return {
          title: 'Create Flashcards',
          subtitle: 'Generate from your notes',
          icon: <Add01Icon className="w-6 h-6" />,
          href: '/library',
          accentColor: 'primary',
          priority: 'normal',
        };
    }
  };

  const config = getActionConfig();
  const accentStyles = {
    primary: {
      bar: 'bg-primary',
      icon: 'text-primary',
      border: 'border-primary/30',
      tint: 'bg-primary/10',
    },
    secondary: {
      bar: 'bg-secondary',
      icon: 'text-secondary',
      border: 'border-secondary/30',
      tint: 'bg-secondary/10',
    },
    tertiary: {
      bar: 'bg-tertiary',
      icon: 'text-tertiary',
      border: 'border-tertiary/30',
      tint: 'bg-tertiary/10',
    },
  } as const;
  const accent = accentStyles[config.accentColor as keyof typeof accentStyles] ?? accentStyles.primary;

  return (
    <ClayCard variant="elevated" padding="none" className="rounded-3xl h-full relative">
      {/* Decorative tab */}
      <div className={`absolute top-0 right-6 w-8 h-10 bg-background-muted border border-border rounded-b-lg z-20 flex items-end justify-center pb-1 ${accent.icon}`}>
        <Bookmark01Icon className="w-4 h-4" />
      </div>

      <div className="p-6 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-5">
          <div className="p-1.5 rounded-lg bg-background-muted border border-border">
            <SparklesIcon className="w-4 h-4 text-primary" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">Recommended</h3>
        </div>

        {/* Main CTA Card */}
        <Link href={config.href} className="block">
          <div className="relative overflow-hidden rounded-2xl bg-surface border border-pencil/40 p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group">
            <span className={`absolute left-0 top-0 bottom-0 w-1.5 ${accent.bar}`} />

            <div className="relative flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-background-muted border border-border ${accent.icon}`}>
                {config.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-base leading-tight text-foreground">{config.title}</h4>
                <p className="text-foreground-muted text-xs mt-1 truncate">{config.subtitle}</p>
              </div>
              <ArrowRight01Icon className="w-5 h-5 text-foreground-muted opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all flex-shrink-0" />
            </div>

            {/* Progress bar for continue_set */}
            {suggestedAction === 'continue_set' && lastStudiedSet && (
              <div className="mt-4 pt-3 border-t border-border/70">
                <div className="flex items-center justify-between text-xs mb-2 text-foreground-muted">
                  <span>Progress</span>
                  <span className="font-bold text-foreground">{lastStudiedSet.progress}%</span>
                </div>
                <div className="h-2 bg-background-muted rounded-full overflow-hidden border border-border">
                  <div
                    className={`h-full ${accent.bar} rounded-full transition-all duration-500`}
                    style={{ width: `${lastStudiedSet.progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Priority badge */}
            {suggestedAction === 'review_due' && dueCardsCount && dueCardsCount > 5 && (
              <div className="mt-3">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${accent.border} ${accent.tint} ${accent.icon}`}>
                  ⚡ High Priority
                </span>
              </div>
            )}
          </div>
        </Link>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Quick Actions */}
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <Link href="/library">
            <div className="p-3.5 rounded-xl bg-surface border border-pencil/30 hover:bg-background-muted transition-all cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-background-muted border border-border">
                  <PencilEdit01Icon className="w-4 h-4 text-secondary" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-xs text-foreground group-hover:text-secondary transition-colors">New Note</p>
                  <p className="text-[10px] text-foreground-muted mt-0.5">Create a study note</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/flashcards">
            <div className="p-3.5 rounded-xl bg-surface border border-pencil/30 hover:bg-background-muted transition-all cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-background-muted border border-border">
                  <FlashcardIcon className="w-4 h-4 text-tertiary" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-xs text-foreground group-hover:text-tertiary transition-colors">Browse Sets</p>
                  <p className="text-[10px] text-foreground-muted mt-0.5">Review flashcards</p>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </ClayCard>
  );
}
