'use client';

import DashboardHeader from '@/component/features/DashboardHeader';
import StudyStreak from '@/component/features/StudyStreak';
import WeeklyActivityChart from '@/component/features/WeeklyActivityChart';
import ContinueLearning from '@/component/features/ContinueLearning';
import RecentActivity from '@/component/features/RecentActivity';
import { useUserProfile } from '@/hooks/useAuth';
import { motion, type Variants } from 'motion/react';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

export default function Dashboard() {
  const { data: user } = useUserProfile();

  return (
    <div className="pb-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <DashboardHeader user={user ?? undefined} />
      </motion.div>

      {/* Bento Grid: Streak + Activity Chart + Recommended */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 auto-rows-min">
        {/* Study Streak - tall on desktop */}
        <motion.div
          className="xl:row-span-2"
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          <StudyStreak />
        </motion.div>

        {/* Weekly Activity Chart - wide */}
        <motion.div
          className="md:col-span-1 xl:col-span-2 xl:row-span-2"
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          <WeeklyActivityChart />
        </motion.div>

        {/* Continue Learning / Recommended */}
        <motion.div
          className="xl:row-span-2"
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          <ContinueLearning />
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        className="mt-5"
        custom={3}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        <RecentActivity />
      </motion.div>
    </div>
  );
}
