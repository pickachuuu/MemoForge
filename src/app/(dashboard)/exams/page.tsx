'use client';

import { ClayCard, ClayBadge } from '@/component/ui/Clay';
import {
  TestTube01Icon,
  SparklesIcon,
  Clock01Icon,
  Target01Icon
} from 'hugeicons-react';

export default function ExamsPage() {
  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <ClayCard variant="elevated" padding="lg" className="rounded-3xl relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-gradient-to-bl from-secondary/10 via-secondary/5 to-transparent rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-gradient-to-tr from-tertiary/8 via-tertiary/4 to-transparent rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Title area */}
            <div className="flex items-start gap-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-secondary-muted to-secondary-muted/60 shadow-lg shadow-secondary/10">
                <TestTube01Icon className="w-8 h-8 text-secondary" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                    Exams
                  </h1>
                  <ClayBadge variant="warning" className="text-xs px-2 py-1">
                    <SparklesIcon className="w-3 h-3" />
                    Coming Soon
                  </ClayBadge>
                </div>
                <p className="text-foreground-muted">
                  Test your knowledge with AI-generated practice exams
                </p>
              </div>
            </div>
          </div>
        </div>
      </ClayCard>

      {/* Coming Soon Content */}
      <ClayCard variant="elevated" padding="lg" className="rounded-3xl">
        <div className="text-center py-16">
          <div className="relative w-32 h-32 mx-auto mb-8">
            {/* Decorative background */}
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-secondary/5 rounded-3xl rotate-6" />
            <div className="absolute inset-0 bg-gradient-to-br from-tertiary/20 to-tertiary/5 rounded-3xl -rotate-6" />
            <div className="relative w-full h-full rounded-3xl bg-gradient-to-br from-secondary-muted to-secondary-muted/60 flex items-center justify-center shadow-lg">
              <TestTube01Icon className="w-16 h-16 text-secondary" />
            </div>
          </div>

          <h3 className="text-2xl font-bold text-foreground mb-3">Practice Exams Coming Soon</h3>
          <p className="text-foreground-muted mb-8 max-w-md mx-auto">
            We&apos;re building a powerful exam system that will help you prepare for tests with AI-generated questions based on your notebooks.
          </p>

          {/* Feature preview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-200/80">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-muted to-primary-muted/60 flex items-center justify-center mx-auto mb-3">
                <SparklesIcon className="w-5 h-5 text-primary" />
              </div>
              <h4 className="font-semibold text-foreground text-sm mb-1">AI-Generated</h4>
              <p className="text-xs text-foreground-muted">Questions created from your notes</p>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-200/80">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary-muted to-secondary-muted/60 flex items-center justify-center mx-auto mb-3">
                <Clock01Icon className="w-5 h-5 text-secondary" />
              </div>
              <h4 className="font-semibold text-foreground text-sm mb-1">Timed Tests</h4>
              <p className="text-xs text-foreground-muted">Practice under real exam conditions</p>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-200/80">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-tertiary-muted to-tertiary-muted/60 flex items-center justify-center mx-auto mb-3">
                <Target01Icon className="w-5 h-5 text-tertiary" />
              </div>
              <h4 className="font-semibold text-foreground text-sm mb-1">Track Progress</h4>
              <p className="text-xs text-foreground-muted">See your improvement over time</p>
            </div>
          </div>
        </div>
      </ClayCard>
    </div>
  );
}
