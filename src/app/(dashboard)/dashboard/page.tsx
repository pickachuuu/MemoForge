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

      <div className="mt-6 space-y-5">
        {/* Streak (1/3) + Weekly Activity (2/3) row */}
        <div className="flex flex-col md:flex-row gap-5">
          <div className="w-full md:w-1/3">
            <StudyStreak />
          </div>
          <div className="w-full md:w-2/3">
            <WeeklyActivityChart />
          </div>
        </div>

        <ContinueLearning />
        <RecentActivity />
      </div>
    </div>
  );
}
