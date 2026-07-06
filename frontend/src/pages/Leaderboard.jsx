import { useEffect, useState } from 'react';
import { leaderboardService } from '../services/api';
import { toast } from 'react-toastify';
import { FiAward, FiInfo, FiSmile, FiCheckCircle } from 'react-icons/fi';

export default function Leaderboard() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const data = await leaderboardService.getLeaderboard();
        setEntries(data);
      } catch (err) {
        toast.error('Failed to load leaderboard entries');
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 fade-in">
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-6">
          <FiAward className="text-2xl text-[var(--color-accent)]" />
          <h3 className="text-lg font-bold font-outfit text-[var(--color-text-primary)]">Community Leaderboard</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-[var(--color-text-muted)] uppercase tracking-wider font-bold">
                <th className="py-3 px-4 text-center">Rank</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Avg Daily Footprint</th>
                <th className="py-3 px-4">Category Strength</th>
                <th className="py-3 px-4">Badges</th>
              </tr>
            </thead>
            <tbody>
              {entries.length > 0 ? (
                entries.map((entry, index) => (
                  <tr key={entry.userId} className="border-b border-[var(--color-border)] hover:bg-[var(--color-bg-card-hover)] transition-colors">
                    {/* Rank */}
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs ${
                        index === 0 ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' :
                        index === 1 ? 'bg-slate-100 text-slate-700 border border-slate-200' :
                        index === 2 ? 'bg-amber-600/20 text-amber-600 border border-amber-600/30' :
                        'bg-[var(--color-bg-primary)] text-[var(--color-text-secondary)] border border-[var(--color-border)]'
                      }`}>
                        {index + 1}
                      </span>
                    </td>
                    
                    {/* Username & Habits Popup */}
                    <td className="py-4 px-4">
                      <div>
                        <span className="font-semibold text-[var(--color-text-primary)]">{entry.username}</span>
                        {entry.habitTips && entry.habitTips.length > 0 && (
                          <div className="text-[10px] text-[var(--color-text-muted)] mt-1 flex flex-col gap-0.5">
                            {entry.habitTips.map((habit, hIdx) => (
                              <span key={hIdx} className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] shrink-0"></span>
                                {habit}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Average daily */}
                    <td className="py-4 px-4 font-bold text-[var(--color-text-primary)]">
                      {entry.averageDailyEmission} <span className="text-[10px] font-normal text-[var(--color-text-muted)]">kg/day</span>
                    </td>

                    {/* Category Strength */}
                    <td className="py-4 px-4 text-[var(--color-text-secondary)]">
                      {entry.categoryStrength}
                    </td>

                    {/* Badges list */}
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1">
                        {entry.badges.length > 0 ? (
                          entry.badges.map((badge, bIdx) => (
                            <span key={bIdx} className="badge badge-green text-[9px] py-0.5 px-2">
                              {badge}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-[var(--color-text-muted)]">No badges yet</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-[var(--color-text-muted)]">
                    <FiInfo className="text-xl mx-auto mb-2" />
                    No leaderboard profiles available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
