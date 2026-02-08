'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ClayBadge, ClayCard } from '@/component/ui/Clay';
import { FilterIcon, Search01Icon, SparklesIcon } from 'hugeicons-react';
import { ExamIcon, FlashcardIcon, NotebookIcon } from '@/component/icons';

type CommunityType = 'note' | 'flashcard' | 'exam';

type CommunityItem = {
  id: string;
  type: CommunityType;
  title: string;
  summary: string;
  tags: string[];
  author: string;
  updatedAt: string;
  href: string;
};

const COMMUNITY_ITEMS: CommunityItem[] = [
  {
    id: 'note-photosynthesis',
    type: 'note',
    title: 'AP Biology: Photosynthesis',
    summary: 'Concise notes with diagrams on light and dark reactions.',
    tags: ['biology', 'ap', 'plants'],
    author: 'Jenna L.',
    updatedAt: '2d ago',
    href: '/library'
  },
  {
    id: 'flashcard-calc-derivatives',
    type: 'flashcard',
    title: 'Calculus: Derivatives Drill',
    summary: '120-card set focused on derivative rules and trig identities.',
    tags: ['calculus', 'math', 'derivatives'],
    author: 'Noah K.',
    updatedAt: '5d ago',
    href: '/flashcards'
  },
  {
    id: 'exam-us-history',
    type: 'exam',
    title: 'US History: Progressive Era Practice',
    summary: 'Timed practice exam with mixed multiple choice and short answer.',
    tags: ['history', 'ap', 'civics'],
    author: 'Maria S.',
    updatedAt: '1w ago',
    href: '/exams'
  },
  {
    id: 'note-psych-learning',
    type: 'note',
    title: 'Psychology: Learning Theories',
    summary: 'Classical vs operant conditioning with key researchers.',
    tags: ['psychology', 'behavior', 'notes'],
    author: 'Leo R.',
    updatedAt: '3d ago',
    href: '/library'
  },
  {
    id: 'flashcard-chem-bonds',
    type: 'flashcard',
    title: 'Chemistry: Bonding Basics',
    summary: 'Ionic, covalent, metallic bonding with quick checks.',
    tags: ['chemistry', 'bonds', 'science'],
    author: 'Sasha P.',
    updatedAt: '4d ago',
    href: '/flashcards'
  },
  {
    id: 'exam-statistics',
    type: 'exam',
    title: 'Statistics: Hypothesis Testing',
    summary: 'Confidence intervals, p-values, and decision rules.',
    tags: ['statistics', 'math', 'probability'],
    author: 'Ivy T.',
    updatedAt: '6d ago',
    href: '/exams'
  }
];

const FILTER_OPTIONS: { id: CommunityType | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'note', label: 'Notes' },
  { id: 'flashcard', label: 'Flashcards' },
  { id: 'exam', label: 'Exams' }
];

const TYPE_META = {
  note: {
    label: 'Note',
    badge: 'accent',
    icon: NotebookIcon,
    tint: 'text-primary'
  },
  flashcard: {
    label: 'Flashcards',
    badge: 'success',
    icon: FlashcardIcon,
    tint: 'text-tertiary'
  },
  exam: {
    label: 'Exam',
    badge: 'warning',
    icon: ExamIcon,
    tint: 'text-secondary'
  }
} as const;

const TRENDING_TAGS = ['biology', 'calculus', 'psychology', 'history', 'chemistry', 'statistics'];

export default function CommunityPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<CommunityType | 'all'>('all');

  const filteredItems = useMemo(() => {
    let filtered = [...COMMUNITY_ITEMS];

    if (selectedType !== 'all') {
      filtered = filtered.filter((item) => item.type === selectedType);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((item) =>
        item.title.toLowerCase().includes(query) ||
        item.summary.toLowerCase().includes(query) ||
        item.author.toLowerCase().includes(query) ||
        item.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [searchQuery, selectedType]);

  const stats = useMemo(() => {
    return {
      total: COMMUNITY_ITEMS.length,
      notes: COMMUNITY_ITEMS.filter((item) => item.type === 'note').length,
      flashcards: COMMUNITY_ITEMS.filter((item) => item.type === 'flashcard').length,
      exams: COMMUNITY_ITEMS.filter((item) => item.type === 'exam').length
    };
  }, []);

  const typeCounts = {
    all: stats.total,
    note: stats.notes,
    flashcard: stats.flashcards,
    exam: stats.exams
  };

  return (
    <div className="space-y-6">
      <ClayCard variant="elevated" padding="lg" className="rounded-3xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-4 rounded-2xl bg-background-muted border border-border">
              <Search01Icon className="w-8 h-8 text-primary" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Community</h1>
                <ClayBadge variant="accent" className="px-3 py-1.5 text-xs">
                  <SparklesIcon className="w-3.5 h-3.5" />
                  Shared
                </ClayBadge>
              </div>
              <p className="text-foreground-muted mt-1">
                Search shared notes, flashcards, and exams from other learners.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/library"
              className="px-4 py-2 rounded-xl bg-surface border border-border text-sm font-semibold text-foreground hover:shadow-md transition-all"
            >
              My Library
            </Link>
            <Link
              href="/flashcards"
              className="px-4 py-2 rounded-xl bg-surface border border-border text-sm font-semibold text-foreground hover:shadow-md transition-all"
            >
              My Flashcards
            </Link>
            <Link
              href="/exams"
              className="px-4 py-2 rounded-xl bg-surface border border-border text-sm font-semibold text-foreground hover:shadow-md transition-all"
            >
              My Exams
            </Link>
          </div>
        </div>
      </ClayCard>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-4">
          <ClayCard variant="default" padding="lg" className="rounded-3xl">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Browse resources</h2>
                <p className="text-sm text-foreground-muted">
                  Showing {filteredItems.length} of {stats.total} shared materials
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground-muted">
                <span className="px-3 py-1.5 rounded-full bg-background-muted border border-border">
                  Notes {stats.notes}
                </span>
                <span className="px-3 py-1.5 rounded-full bg-background-muted border border-border">
                  Flashcards {stats.flashcards}
                </span>
                <span className="px-3 py-1.5 rounded-full bg-background-muted border border-border">
                  Exams {stats.exams}
                </span>
              </div>
            </div>

            {filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 rounded-2xl bg-background-muted border border-border flex items-center justify-center mx-auto mb-5">
                  <Search01Icon className="w-9 h-9 text-foreground-muted" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No matches yet</h3>
                <p className="text-sm text-foreground-muted mb-5">
                  Try another keyword or switch resource types.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedType('all');
                  }}
                  className="px-4 py-2 rounded-xl bg-surface border border-border text-sm font-semibold text-foreground hover:shadow-md transition-all"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="space-y-3 mt-5">
                {filteredItems.map((item) => {
                  const meta = TYPE_META[item.type];
                  const Icon = meta.icon;

                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className="block rounded-2xl border border-border bg-surface hover:shadow-sm transition-all"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-4 py-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2.5 rounded-xl bg-background-muted border border-border">
                            <Icon className={`w-5 h-5 ${meta.tint}`} />
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
                              <ClayBadge variant={meta.badge} className="px-2.5 py-1 text-[11px]">
                                {meta.label}
                              </ClayBadge>
                            </div>
                            <p className="text-sm text-foreground-muted mt-1">{item.summary}</p>
                            <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-foreground-muted">
                              <span>By {item.author}</span>
                              <span className="h-1 w-1 rounded-full bg-border" />
                              <span>Updated {item.updatedAt}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          {item.tags.map((tag) => (
                            <span
                              key={`${item.id}-${tag}`}
                              className="px-2.5 py-1 rounded-full bg-background-muted border border-border text-[11px] text-foreground-muted"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </ClayCard>
        </div>

        <div className="lg:col-span-4 space-y-4">
          <ClayCard variant="default" padding="md" className="rounded-2xl">
            <div className="flex items-center gap-2">
              <Search01Icon className="w-5 h-5 text-foreground-muted" />
              <input
                type="text"
                placeholder="Search community materials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-surface border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground placeholder:text-foreground-muted"
              />
            </div>
          </ClayCard>

          <ClayCard variant="default" padding="md" className="rounded-2xl">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-foreground-muted">
                <FilterIcon className="w-4 h-4" />
                Type
              </div>
              <div className="flex flex-wrap gap-2">
                {FILTER_OPTIONS.map((option) => {
                  const isActive = selectedType === option.id;
                  return (
                    <button
                      key={option.id}
                      onClick={() => setSelectedType(option.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                        isActive
                          ? 'bg-background-muted text-foreground border-border'
                          : 'text-foreground-muted border-transparent hover:text-foreground hover:border-border'
                      }`}
                    >
                      {option.label}
                      <span className="ml-2 text-[10px] text-foreground-muted">
                        {typeCounts[option.id]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </ClayCard>

          <ClayCard variant="default" padding="md" className="rounded-2xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">Community pulse</p>
                <span className="text-xs font-semibold text-primary">Active</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl border border-border bg-background-muted px-2 py-3">
                  <p className="text-base font-semibold text-foreground">{stats.total}</p>
                  <p className="text-[10px] text-foreground-muted">Shared</p>
                </div>
                <div className="rounded-xl border border-border bg-background-muted px-2 py-3">
                  <p className="text-base font-semibold text-foreground">{stats.notes}</p>
                  <p className="text-[10px] text-foreground-muted">Notes</p>
                </div>
                <div className="rounded-xl border border-border bg-background-muted px-2 py-3">
                  <p className="text-base font-semibold text-foreground">{stats.flashcards}</p>
                  <p className="text-[10px] text-foreground-muted">Flashcards</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-foreground-muted mb-2">
                  Trending topics
                </p>
                <div className="flex flex-wrap gap-2">
                  {TRENDING_TAGS.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setSearchQuery(tag)}
                      className="px-3 py-1.5 rounded-full bg-surface border border-border text-[11px] font-semibold text-foreground-muted hover:text-foreground hover:shadow-sm transition-all"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </ClayCard>
        </div>
      </div>
    </div>
  );
}
