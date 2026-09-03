import { useState, useCallback } from 'react';
import { getMeetings, saveMeeting, getMeeting, getStats } from '@/lib/storage';
import type { Meeting, AppStats } from '@/types';

export function useMeetings() {
  const [meetings, setMeetings] = useState<Meeting[]>(() => getMeetings());
  const [stats, setStats] = useState<AppStats>(() => getStats());

  const refresh = useCallback(() => {
    setMeetings(getMeetings());
    setStats(getStats());
  }, []);

  const save = useCallback((meeting: Meeting) => {
    saveMeeting(meeting);
    refresh();
  }, [refresh]);

  const get = useCallback((id: string): Meeting | undefined => {
    return getMeeting(id);
  }, []);

  return { meetings, stats, refresh, save, get };
}
