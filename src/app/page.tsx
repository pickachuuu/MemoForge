'use client';

import Link from 'next/link';
import { LazyMotion, domAnimation } from 'motion/react';
import * as m from 'motion/react-m';
import {
  Note01Icon,
  FlashIcon,
  AiMagicIcon,
  Share01Icon,
  CheckmarkCircle02Icon,
  ArrowRight01Icon,
  SparklesIcon,
  Target01Icon,
  BookOpen01Icon,
  Clock01Icon,
  Idea01Icon,
} from 'hugeicons-react';
import { ClayCard, ClayButton, ClayBadge, ClayIconBox, ClaySection } from '@/component/ui/Clay';
import {
  fadeIn,
  fadeInUp,
  fadeInRight,
  scaleIn,
  staggerContainer,
  viewportOnce,
  hoverScale,
  tapScale,
} from '@/lib/animations';

export default function LandingPage() {
  return (
    <LazyMotion features={domAnimation}>
      <div className="min-h-screen bg-background">
        {/* Navigation */}
        <m.nav
          className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="text-2xl font-bold text-foreground hover:text-accent transition-colors">
                MemoForge
              </Link>
              <div className="flex items-center gap-4">
                <Link href="/auth">
                  <ClayButton variant="ghost" size="sm">Sign In</ClayButton>
                </Link>
                <Link href="/auth">
                  <ClayButton variant="primary" size="sm">Get Started</ClayButton>
                </Link>
              </div>
            </div>
          </div>
        </m.nav>

        {/* Hero Section with Academic Background */}
        <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 academic-bg">
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <m.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                <m.div variants={fadeInUp}>
                  <ClayBadge variant="accent" className="mb-6">
                    <SparklesIcon className="w-4 h-4" />
                    Powered by Google Gemini AI
                  </ClayBadge>
                </m.div>

                <m.h1
                  variants={fadeInUp}
                  className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight"
                >
                  Study Smarter,
                  <br />
                  <span className="text-accent">Not Harder</span>
                </m.h1>

                <m.p
                  variants={fadeInUp}
                  className="text-lg text-foreground-muted mb-8 max-w-lg"
                >
                  Transform your notes into interactive flashcards instantly with AI.
                  MemoForge analyzes your content and creates personalized study materials
                  that help you retain information 3x faster than traditional methods.
                </m.p>

                <m.div variants={fadeInUp} className="flex flex-wrap gap-4 mb-8">
                  <Link href="/auth">
                    <m.div whileHover={hoverScale} whileTap={tapScale}>
                      <ClayButton variant="primary" size="lg" className="flex items-center gap-2">
                        Start Learning Free
                        <ArrowRight01Icon className="w-5 h-5" />
                      </ClayButton>
                    </m.div>
                  </Link>
                  <Link href="#how-it-works">
                    <m.div whileHover={hoverScale} whileTap={tapScale}>
                      <ClayButton variant="secondary" size="lg">
                        See How It Works
                      </ClayButton>
                    </m.div>
                  </Link>
                </m.div>

              </m.div>

              {/* Right - Hero Visual */}
              <m.div
                className="relative"
                variants={fadeInRight}
                initial="hidden"
                animate="visible"
              >
                <ClayCard variant="elevated" padding="lg" className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <ClayIconBox size="sm" variant="accent">
                      <Note01Icon className="w-5 h-5 text-accent" />
                    </ClayIconBox>
                    <span className="font-semibold text-foreground">Your Study Notes</span>
                  </div>
                  <div className="space-y-3 mb-6">
                    <div className="h-3 bg-background-muted rounded-full w-full" />
                    <div className="h-3 bg-background-muted rounded-full w-4/5" />
                    <div className="h-3 bg-background-muted rounded-full w-3/5" />
                  </div>
                  <div className="flex justify-center my-4">
                    <ClayIconBox variant="accent" size="md">
                      <AiMagicIcon className="w-6 h-6 text-accent" />
                    </ClayIconBox>
                  </div>
                  <ClayCard variant="pressed" padding="md">
                    <div className="flex items-center gap-3 mb-3">
                      <FlashIcon className="w-5 h-5 text-accent" />
                      <span className="font-medium text-foreground">AI Generated Flashcard</span>
                    </div>
                    <p className="text-sm text-foreground font-medium mb-2">
                      Q: What is photosynthesis?
                    </p>
                    <p className="text-xs text-foreground-muted">
                      Click to reveal answer...
                    </p>
                  </ClayCard>
                </ClayCard>

                {/* Static Decorative Elements */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-accent-muted rounded-3xl -z-10 opacity-60" />
                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-accent-muted rounded-3xl -z-10 opacity-40" />
              </m.div>
            </div>
          </div>
        </section>

{/* Features Section - Notion-style layout with floating cards */}
        <ClaySection variant="muted" id="features" className="forge-bg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center relative z-10">
            {/* Left - Text Content */}
            <m.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
            >
              <m.div variants={fadeInUp}>
                <ClayBadge variant="accent" className="mb-4">AI-Powered</ClayBadge>
              </m.div>
              <m.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Generate flashcards instantly.
              </m.h2>
              <m.p variants={fadeInUp} className="text-lg text-foreground-muted mb-6">
                Paste your notes, click generate, and watch AI create study-ready flashcards in seconds.
              </m.p>
              <m.ul variants={fadeInUp} className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <ClayIconBox size="sm" variant="accent">
                    <AiMagicIcon className="w-4 h-4 text-accent" />
                  </ClayIconBox>
                  <span className="text-foreground">50+ cards from a single note</span>
                </li>
                <li className="flex items-center gap-3">
                  <ClayIconBox size="sm" variant="accent">
                    <Target01Icon className="w-4 h-4 text-accent" />
                  </ClayIconBox>
                  <span className="text-foreground">Easy, Medium, Hard difficulty</span>
                </li>
                <li className="flex items-center gap-3">
                  <ClayIconBox size="sm" variant="accent">
                    <CheckmarkCircle02Icon className="w-4 h-4 text-accent" />
                  </ClayIconBox>
                  <span className="text-foreground">Multiple choice or open-ended</span>
                </li>
              </m.ul>
            </m.div>

{/* Right - Floating Note Cards + Flashcards */}
            <m.div
              className="relative h-[400px] lg:h-[500px]"
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
            >
              {/* Main note card - center */}
              <m.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 z-50"
                variants={scaleIn}
              >
                <ClayCard variant="elevated" padding="md" className="cursor-pointer hover:translate-y-[-2px] transition-transform">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Note01Icon className="w-5 h-5 text-accent" />
                      <span className="font-semibold text-foreground text-sm">Biology 101</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-medium">Medium</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-foreground-muted mb-2">
                    <FlashIcon className="w-3 h-3" />
                    <span>24 flashcards</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-foreground-muted">Best score</span>
                    <span className="text-sm font-bold text-accent">92%</span>
                  </div>
                </ClayCard>
              </m.div>

{/* Flashcard 1 - top left */}
              <m.div
                className="absolute top-20 left-0 w-48 -rotate-3 z-20"
                variants={fadeInUp}
              >
                <ClayCard padding="lg" className="cursor-pointer hover:translate-y-[-2px] transition-transform min-h-[140px] flex flex-col">
                  <div className="flex items-center gap-2 mb-4">
                    <FlashIcon className="w-5 h-5 text-accent" />
                    <span className="text-xs text-foreground-muted font-medium">Flashcard</span>
                  </div>
                  <p className="text-sm font-semibold text-foreground flex-grow">What is the powerhouse of the cell?</p>
                  <p className="text-xs text-accent text-center border-t border-border pt-3 mt-4">Click to reveal answer</p>
                </ClayCard>
              </m.div>

{/* Note card - top right */}
              <m.div
                className="absolute top-0 right-0 w-44 rotate-3 z-10"
                variants={fadeInUp}
              >
                <ClayCard padding="sm" className="cursor-pointer hover:translate-y-[-2px] transition-transform">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1">
                      <Note01Icon className="w-3 h-3 text-accent" />
                      <span className="text-[11px] font-semibold text-foreground">Organic Chem</span>
                    </div>
                    <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">Hard</span>
                  </div>
                  <div className="text-[10px] text-foreground-muted mb-1">18 flashcards</div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-foreground-muted">Best score</span>
                    <span className="text-xs font-bold text-accent">87%</span>
                  </div>
                </ClayCard>
              </m.div>

{/* Flashcard 2 - right middle */}
              <m.div
                className="absolute top-1/2 -translate-y-1/2 right-0 w-44 rotate-2 z-10"
                variants={fadeInUp}
              >
                <ClayCard padding="lg" className="cursor-pointer hover:translate-y-[-2px] transition-transform min-h-[140px] flex flex-col">
                  <div className="flex items-center gap-2 mb-4">
                    <FlashIcon className="w-5 h-5 text-accent" />
                    <span className="text-xs text-foreground-muted font-medium">Flashcard</span>
                  </div>
                  <p className="text-sm font-semibold text-foreground flex-grow">What year did WW2 end?</p>
                  <p className="text-xs text-accent text-center border-t border-border pt-3 mt-4">Click to reveal answer</p>
                </ClayCard>
              </m.div>

{/* Note card - bottom left */}
              <m.div
                className="absolute bottom-0 left-4 w-44 -rotate-3 z-10"
                variants={fadeInUp}
              >
                <ClayCard padding="sm" className="cursor-pointer hover:translate-y-[-2px] transition-transform">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1">
                      <Note01Icon className="w-3 h-3 text-accent" />
                      <span className="text-[11px] font-semibold text-foreground">World History</span>
                    </div>
                    <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">Easy</span>
                  </div>
                  <div className="text-[10px] text-foreground-muted mb-1">31 flashcards</div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-foreground-muted">Best score</span>
                    <span className="text-xs font-bold text-accent">95%</span>
                  </div>
                </ClayCard>
              </m.div>

{/* Note card - top center-left */}
              <m.div
                className="absolute top-8 left-1/3 -translate-x-1/2 w-40 -rotate-6 z-0"
                variants={fadeInUp}
              >
                <ClayCard padding="sm" className="cursor-pointer hover:translate-y-[-2px] transition-transform">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1">
                      <Note01Icon className="w-3 h-3 text-accent" />
                      <span className="text-[11px] font-semibold text-foreground">Calculus II</span>
                    </div>
                    <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">Hard</span>
                  </div>
                  <div className="text-[10px] text-foreground-muted mb-1">42 flashcards</div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-foreground-muted">Best score</span>
                    <span className="text-xs font-bold text-accent">78%</span>
                  </div>
                </ClayCard>
              </m.div>

{/* Note card - bottom right */}
              <m.div
                className="absolute bottom-0 right-4 w-40 rotate-4 z-0"
                variants={fadeInUp}
              >
                <ClayCard padding="sm" className="cursor-pointer hover:translate-y-[-2px] transition-transform">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1">
                      <Note01Icon className="w-3 h-3 text-accent" />
                      <span className="text-[11px] font-semibold text-foreground">Psychology</span>
                    </div>
                    <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-medium">Medium</span>
                  </div>
                  <div className="text-[10px] text-foreground-muted mb-1">28 flashcards</div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-foreground-muted">Best score</span>
                    <span className="text-xs font-bold text-accent">100%</span>
                  </div>
                </ClayCard>
              </m.div>
            </m.div>
          </div>
        </ClaySection>

{/* Mock Exam Section */}
        <ClaySection id="how-it-works" className="notebook-bg">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center relative z-10">
{/* Left - Mock Exam Visual - Two stacked cards */}
            <m.div
              className="relative h-[520px]"
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
            >
              {/* Multiple Choice Card - Behind, on the left side */}
              <m.div
                className="absolute top-0 left-0 w-[75%] -rotate-3 z-10"
                variants={fadeInUp}
              >
                <ClayCard variant="elevated" padding="md">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <ClayIconBox size="sm" variant="accent">
                        <CheckmarkCircle02Icon className="w-4 h-4 text-accent" />
                      </ClayIconBox>
                      <span className="font-semibold text-foreground text-sm">Multiple Choice</span>
                    </div>
                    <span className="text-[10px] px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">15 questions</span>
                  </div>

                  <ClayCard variant="pressed" padding="sm" className="mb-4">
                    <p className="text-[10px] text-foreground-muted mb-2">Question 1 of 15</p>
                    <p className="text-xs font-medium text-foreground mb-4">What organelle is responsible for producing ATP in eukaryotic cells?</p>
                    <div className="space-y-2">
                      <div className="p-2 rounded-lg border border-border">
                        <span className="text-xs text-foreground">A. Nucleus</span>
                      </div>
                      <div className="p-2 rounded-lg border-2 border-accent bg-accent-muted">
                        <span className="text-xs text-foreground font-medium">B. Mitochondria</span>
                      </div>
                      <div className="p-2 rounded-lg border border-border">
                        <span className="text-xs text-foreground">C. Ribosome</span>
                      </div>
                      <div className="p-2 rounded-lg border border-border">
                        <span className="text-xs text-foreground">D. Golgi apparatus</span>
                      </div>
                    </div>
                  </ClayCard>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-foreground-muted">Time: 12:34</span>
                    <ClayButton variant="primary" size="sm">Next</ClayButton>
                  </div>
                </ClayCard>
              </m.div>

              {/* Essay Card - On top, offset to the right */}
              <m.div
                className="absolute top-8 right-0 w-[75%] rotate-2 z-20"
                variants={scaleIn}
              >
                <ClayCard variant="elevated" padding="md">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <ClayIconBox size="sm" variant="accent">
                        <BookOpen01Icon className="w-4 h-4 text-accent" />
                      </ClayIconBox>
                      <span className="font-semibold text-foreground text-sm">Essay</span>
                    </div>
                    <span className="text-[10px] px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">5 questions</span>
                  </div>

                  <ClayCard variant="pressed" padding="sm" className="mb-4">
                    <p className="text-[10px] text-foreground-muted mb-2">Question 1 of 5</p>
                    <p className="text-xs font-medium text-foreground mb-4">Explain the process of cellular respiration and its importance in living organisms.</p>
                    <div className="bg-background-muted rounded-lg p-4 min-h-[120px] border border-border">
                      <p className="text-xs text-foreground-muted italic">Type your answer here...</p>
                      <div className="mt-3 space-y-2">
                        <div className="h-2 bg-border/50 rounded w-full"></div>
                        <div className="h-2 bg-border/50 rounded w-4/5"></div>
                        <div className="h-2 bg-border/50 rounded w-3/5"></div>
                      </div>
                    </div>
                  </ClayCard>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-foreground-muted">Time: 25:00</span>
                    <ClayButton variant="primary" size="sm">Submit</ClayButton>
                  </div>
                </ClayCard>
              </m.div>
            </m.div>

            {/* Right - Text Content */}
            <m.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
            >
              <m.div variants={fadeInUp}>
                <ClayBadge variant="accent" className="mb-4">Test Yourself</ClayBadge>
              </m.div>
              <m.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Take mock exams your way.
              </m.h2>
              <m.p variants={fadeInUp} className="text-lg text-foreground-muted mb-6">
                Choose your exam format and test your knowledge before the real thing. AI generates questions based on your notes.
              </m.p>
              <m.ul variants={fadeInUp} className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <ClayIconBox size="sm" variant="accent" className="mt-0.5">
                    <CheckmarkCircle02Icon className="w-4 h-4 text-accent" />
                  </ClayIconBox>
                  <div>
                    <span className="font-medium text-foreground">Multiple Choice</span>
                    <p className="text-sm text-foreground-muted">Quick assessments with instant feedback and scoring</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <ClayIconBox size="sm" variant="accent" className="mt-0.5">
                    <BookOpen01Icon className="w-4 h-4 text-accent" />
                  </ClayIconBox>
                  <div>
                    <span className="font-medium text-foreground">Essay Questions</span>
                    <p className="text-sm text-foreground-muted">Practice written responses with AI-powered evaluation</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <ClayIconBox size="sm" variant="accent" className="mt-0.5">
                    <Clock01Icon className="w-4 h-4 text-accent" />
                  </ClayIconBox>
                  <div>
                    <span className="font-medium text-foreground">Timed Exams</span>
                    <p className="text-sm text-foreground-muted">Simulate real exam conditions with countdown timer</p>
                  </div>
                </li>
              </m.ul>
            </m.div>
          </div>

        </ClaySection>

        {/* Footer */}
        <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-border">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link href="/" className="text-xl font-bold text-foreground hover:text-accent transition-colors">
              MemoForge
            </Link>
            <p className="text-foreground-muted text-sm">
              © 2025 MemoForge. AI-Powered Study Assistant.
            </p>
          </div>
        </footer>
      </div>
    </LazyMotion>
  );
}
