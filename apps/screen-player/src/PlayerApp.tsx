import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Import shared types
import { Screen, Advertisement, AdSchedule } from '../../../packages/api/types';

interface PlayerAppProps {
  screenId: string;
  apiBaseUrl: string;
}

interface ScheduledAd {
  ad: Advertisement;
  schedule: AdSchedule;
}

export const PlayerApp: React.FC<PlayerAppProps> = ({ screenId, apiBaseUrl }) => {
  const [ads, setAds] = useState<ScheduledAd[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Fetch scheduled ads for this screen
  useEffect(() => {
    async function fetchSchedule() {
      try {
        const { data: schedules } = await axios.get<AdSchedule[]>(`${apiBaseUrl}/screens/${screenId}/schedule`);
        const adIds = schedules.map(s => s.adId);
        const { data: ads } = await axios.get<Advertisement[]>(`${apiBaseUrl}/ads`, { params: { ids: adIds.join(',') } });
        // Merge ads and schedules
        const scheduledAds: ScheduledAd[] = schedules.map(s => ({
          ad: ads.find(a => a.id === s.adId)!,
          schedule: s,
        })).filter(sa => sa.ad);
        setAds(scheduledAds);
      } catch (err: any) {
        setError('Failed to fetch schedule or ads.');
      }
    }
    fetchSchedule();
  }, [screenId, apiBaseUrl]);

  // Loop through ads
  useEffect(() => {
    if (ads.length === 0) return;
    const duration = ads[currentIdx].ad.durationSec * 1000;
    const timer = setTimeout(() => {
      setCurrentIdx((idx) => (idx + 1) % ads.length);
    }, duration);
    return () => clearTimeout(timer);
  }, [ads, currentIdx]);

  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (ads.length === 0) return <div>Loading ads...</div>;

  const currentAd = ads[currentIdx].ad;

  return (
    <div style={{ width: '100vw', height: '100vh', background: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {currentAd.mediaType.startsWith('image') ? (
        <img src={currentAd.mediaUrl} alt={currentAd.title} style={{ maxWidth: '100%', maxHeight: '100%' }} />
      ) : currentAd.mediaType.startsWith('video') ? (
        <video src={currentAd.mediaUrl} autoPlay controls={false} style={{ maxWidth: '100%', maxHeight: '100%' }} />
      ) : (
        <div style={{ color: 'white' }}>Unsupported media type</div>
      )}
    </div>
  );
};
