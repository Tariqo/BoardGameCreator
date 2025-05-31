import { logAnalyticsEvent } from '../firebase';

// Track user session start
export const startUserSession = () => {
  logAnalyticsEvent('session_start', {
    timestamp: new Date().toISOString()
  });
};

// Track user session end
export const endUserSession = (duration: number) => {
  logAnalyticsEvent('session_end', {
    duration_seconds: duration,
    timestamp: new Date().toISOString()
  });
};

// Track game page view
export const trackGamePageView = (gameId: string, gameName: string) => {
  logAnalyticsEvent('game_view', {
    game_id: gameId,
    game_name: gameName,
    timestamp: new Date().toISOString()
  });
};

// Track concurrent users
export const trackUserPresence = (isOnline: boolean) => {
  logAnalyticsEvent('user_presence', {
    status: isOnline ? 'online' : 'offline',
    timestamp: new Date().toISOString()
  });
};

// Track game session start
export const trackGameStart = (gameId: string, gameName: string) => {
  logAnalyticsEvent('game_session_start', {
    game_id: gameId,
    game_name: gameName,
    timestamp: new Date().toISOString()
  });
};

// Track game session end
export const trackGameEnd = (gameId: string, gameName: string, duration: number) => {
  logAnalyticsEvent('game_session_end', {
    game_id: gameId,
    game_name: gameName,
    duration_seconds: duration,
    timestamp: new Date().toISOString()
  });
};

// Track minutes spent on play page
export const trackPlayPageMinutes = (gameId: string | undefined, minutes: number) => {
  logAnalyticsEvent('play_page_time', {
    game_id: gameId || 'unknown',
    minutes_spent: minutes,
    timestamp: new Date().toISOString()
  });
}; 