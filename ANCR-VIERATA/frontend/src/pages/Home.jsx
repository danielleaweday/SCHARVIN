import React, { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import { WelcomeHeader } from "@/components/dashboard/WelcomeHeader";
import { DailyAffirmation } from "@/components/dashboard/DailyAffirmation";
import { ArrivingCheckIn } from "@/components/dashboard/ArrivingCheckIn";
import { WellnessSnapshot } from "@/components/dashboard/WellnessSnapshot";
import { CreativeDemand } from "@/components/dashboard/CreativeDemand";
import { Recommendations } from "@/components/dashboard/Recommendations";
import { UpcomingEvents } from "@/components/dashboard/UpcomingEvents";
import { ContinueLearning } from "@/components/dashboard/ContinueLearning";
import { WeeklyPattern } from "@/components/dashboard/WeeklyPattern";
import { QuickAccess } from "@/components/dashboard/QuickAccess";

export default function HomePage() {
  const [todayCheckin, setTodayCheckin] = useState(null);
  const [tick, setTick] = useState(0);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get("/checkins/today");
      setTodayCheckin(data);
    } catch {}
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSaved = (data) => {
    setTodayCheckin(data);
    setTick((t) => t + 1);
  };

  return (
    <div className="flex flex-col gap-6">
      <WelcomeHeader />
      <DailyAffirmation />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-8">
          <ArrivingCheckIn onSaved={handleSaved} />
        </div>
        <div className="xl:col-span-4">
          <WellnessSnapshot checkin={todayCheckin} />
        </div>

        <div className="xl:col-span-6">
          <CreativeDemand checkin={todayCheckin} onSaved={handleSaved} />
        </div>
        <div className="xl:col-span-6">
          <Recommendations refreshKey={tick} />
        </div>

        <div className="xl:col-span-8">
          <WeeklyPattern refreshKey={tick} />
        </div>
        <div className="xl:col-span-4 flex flex-col gap-6">
          <ContinueLearning />
          <UpcomingEvents />
        </div>

        <div className="xl:col-span-12">
          <QuickAccess />
        </div>
      </div>
    </div>
  );
}
