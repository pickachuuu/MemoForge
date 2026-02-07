'use client';

import DashboardHeader from '@/component/features/DashboardHeader';
import StudyStreak from '@/component/features/StudyStreak';
import WeeklyActivityChart from '@/component/features/WeeklyActivityChart';
import ContinueLearning from '@/component/features/ContinueLearning';
import RecentActivity from '@/component/features/RecentActivity';
import { useUserProfile } from '@/hooks/useAuth';

export default function Dashboard() {
  const { data: user } = useUserProfile();

  return (
    <div className="pb-10">
      {/* Header */}
      <DashboardHeader user={user ?? undefined} />

      {/* Bento Grid: Streak + Activity Chart + Recommended */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 auto-rows-min">
        {/* Study Streak - tall on desktop */}
        <div className="xl:row-span-2">
          <StudyStreak />
        </div>

        {/* Weekly Activity Chart - wide */}
        <div className="md:col-span-1 xl:col-span-2 xl:row-span-2">
          <WeeklyActivityChart />
        </div>

        {/* Continue Learning / Recommended */}
        <div className="xl:row-span-2">
          <ContinueLearning />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-5">
        <RecentActivity />
      </div>
    </div>
  );
}
