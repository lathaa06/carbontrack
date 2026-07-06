import { useEffect, useState } from 'react';
import { dashboardService } from '../services/api';
import { toast } from 'react-toastify';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from 'recharts';
import { 
  FiActivity, 
  FiAlertCircle, 
  FiCalendar, 
  FiCheckCircle, 
  FiCompass, 
  FiInfo, 
  FiSmile 
} from 'react-icons/fi';

const CATEGORY_COLORS = {
  TRANSPORT: '#22c55e',
  ELECTRICITY: '#3b82f6',
  FOOD: '#eab308',
  SHOPPING: '#ec4899',
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const summary = await dashboardService.getDashboard();
        setData(summary);
      } catch (err) {
        toast.error('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl"></div>
          <div className="h-80 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="glass-card p-12 text-center flex flex-col items-center justify-center">
        <FiAlertCircle className="text-4xl text-red-400 mb-4" />
        <h3 className="text-lg font-semibold">No data available</h3>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">Start by logging your carbon activities.</p>
      </div>
    );
  }

  // Parse category breakdown for Recharts
  const pieData = data.categoryBreakdown
    .filter((item) => item.totalCo2e > 0)
    .map((item) => ({
      name: item.category,
      value: Number(item.totalCo2e),
    }));

  // Parse trend data (this week vs last week)
  const trendData = data.thisWeekTrend.map((item, idx) => {
    const d = new Date(item.logDate);
    const dayLabel = DAYS[d.getDay()];
    return {
      name: dayLabel,
      'This Week': Number(item.totalCo2e),
      'Last Week': data.lastWeekTrend[idx] ? Number(data.lastWeekTrend[idx].totalCo2e) : 0,
    };
  });

  return (
    <div className="space-y-8 fade-in">
      {/* Top Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="stat-card relative overflow-hidden">
          <div className="absolute top-4 right-4 p-2 bg-[var(--color-accent-dim)] rounded-lg text-[var(--color-accent)]">
            <FiActivity className="text-lg" />
          </div>
          <h4 className="text-xs text-[var(--color-text-muted)] font-bold uppercase tracking-wider">Today's Footprint</h4>
          <h2 className="text-3xl font-bold font-outfit mt-2 text-[var(--color-text-primary)]">
            {data.todayCo2e} <span className="text-sm font-medium text-[var(--color-text-secondary)]">kg CO₂e</span>
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)] mt-2">Emissions logged today</p>
        </div>

        <div className="stat-card relative overflow-hidden">
          <div className="absolute top-4 right-4 p-2 bg-blue-50 border border-blue-100 rounded-lg text-blue-600">
            <FiCalendar className="text-lg" />
          </div>
          <h4 className="text-xs text-[var(--color-text-muted)] font-bold uppercase tracking-wider">Weekly Footprint</h4>
          <h2 className="text-3xl font-bold font-outfit mt-2 text-[var(--color-text-primary)]">
            {data.weeklyCo2e} <span className="text-sm font-medium text-[var(--color-text-secondary)]">kg CO₂e</span>
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)] mt-2">Last 7 days cumulative</p>
        </div>

        <div className="stat-card relative overflow-hidden">
          <div className="absolute top-4 right-4 p-2 bg-purple-50 border border-purple-100 rounded-lg text-purple-600">
            <FiCompass className="text-lg" />
          </div>
          <h4 className="text-xs text-[var(--color-text-muted)] font-bold uppercase tracking-wider">Monthly Footprint</h4>
          <h2 className="text-3xl font-bold font-outfit mt-2 text-[var(--color-text-primary)]">
            {data.monthlyCo2e} <span className="text-sm font-medium text-[var(--color-text-secondary)]">kg CO₂e</span>
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)] mt-2">Last 30 days cumulative</p>
        </div>
      </div>

      {/* Analytics Charts & Benchmarking Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Trend Line Chart */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-bold tracking-wide uppercase text-[var(--color-text-secondary)] mb-4">Weekly Emission Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--color-text-muted)" fontSize={11} />
                <YAxis stroke="var(--color-text-muted)" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', borderRadius: '8px' }}
                  labelStyle={{ color: 'var(--color-text-primary)' }}
                />
                <Legend />
                <Line type="monotone" dataKey="This Week" stroke="var(--color-accent)" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="Last Week" stroke="#a3b5a8" strokeDasharray="5 5" strokeWidth={1.5} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category breakdown Pie Chart */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-bold tracking-wide uppercase text-[var(--color-text-secondary)] mb-4">Emissions by Category</h3>
          <div className="h-64 flex items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name] || '#16a34a'} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', borderRadius: '8px' }}
                    itemStyle={{ color: 'var(--color-text-primary)' }}
                  />
                  <Legend iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-[var(--color-text-muted)] text-sm flex flex-col items-center justify-center">
                <FiInfo className="text-2xl mb-2" />
                No carbon activities logged in the last 30 days.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Goal Widget, Benchmarking & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Goal Widget */}
        <div className="glass-card p-6 lg:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold tracking-wide uppercase text-[var(--color-text-secondary)] mb-4">Carbon Reduction Goal</h3>
            {data.activeGoal ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-[var(--color-text-secondary)]">Baseline: {data.activeGoal.baselineCo2e} kg</span>
                  <span className="text-[var(--color-accent)] font-bold">Target: {data.activeGoal.targetCo2e} kg</span>
                </div>
                
                <div className="progress-bar-bg mt-1">
                  <div 
                    className="progress-bar-fill" 
                    style={{ width: `${Math.min(Number(data.activeGoal.progressPct), 100)}%` }}
                  ></div>
                </div>

                <div className="flex justify-between text-xs mt-1">
                  <span className="text-[var(--color-text-muted)]">Logged: {data.activeGoal.currentCo2e} kg ({data.activeGoal.progressPct}%)</span>
                  <span className={`badge ${data.activeGoal.trajectoryStatus === 'ON_TRACK' ? 'badge-green' : 'badge-red'}`}>
                    {data.activeGoal.trajectoryStatus}
                  </span>
                </div>

                <div className="p-3 bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-lg flex gap-2.5 items-start mt-2">
                  {data.activeGoal.trajectoryStatus === 'ON_TRACK' 
                    ? <FiCheckCircle className="text-emerald-400 mt-0.5 shrink-0" />
                    : <FiAlertCircle className="text-red-400 mt-0.5 shrink-0" />
                  }
                  <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
                    {data.activeGoal.alertMessage}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-sm text-[var(--color-text-muted)]">
                <FiInfo className="text-xl mx-auto mb-2" />
                No active reduction goal. Set one in the Goals page!
              </div>
            )}
          </div>
        </div>

        {/* Peer Benchmarking Card */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold tracking-wide uppercase text-[var(--color-text-secondary)] mb-4">Peer Benchmarking</h3>
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[var(--color-accent-dim)] border border-[var(--color-border)] text-3xl font-extrabold font-outfit text-[var(--color-accent)] mb-3 glow-green">
                {data.percentileRank}%
              </div>
              <h4 className="text-sm font-bold text-[var(--color-text-primary)]">Better than {data.percentileRank}% of users</h4>
              <p className="text-[11px] text-[var(--color-text-muted)] mt-1.5 leading-relaxed">
                Based on your daily emissions in the last 30 days compared anonymously to other platform users.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations & Recent Activities Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recommendations */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold tracking-wide uppercase text-[var(--color-text-secondary)] mb-4">Tailored Eco Tips</h3>
            <div className="space-y-4">
              {data.recommendations.map((tip, idx) => (
                <div key={idx} className="p-3 bg-[var(--color-bg-primary)] border-l-2 border-[var(--color-accent)] rounded-r-lg">
                  <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activities list */}
        <div className="glass-card p-6 lg:col-span-2">
          <h3 className="text-sm font-bold tracking-wide uppercase text-[var(--color-text-secondary)] mb-4">Recent Activities</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[var(--color-border)] text-[var(--color-text-muted)] uppercase tracking-wider font-bold">
                  <th className="py-2.5">Date</th>
                  <th className="py-2.5">Category</th>
                  <th className="py-2.5">Activity Type</th>
                  <th className="py-2.5">Qty</th>
                  <th className="py-2.5 text-right">CO₂ Emission</th>
                </tr>
              </thead>
              <tbody>
                {data.recentActivities.length > 0 ? (
                  data.recentActivities.map((act) => (
                    <tr key={act.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-bg-card-hover)] transition-colors">
                      <td className="py-3 text-[var(--color-text-secondary)]">{act.logDate}</td>
                      <td className="py-3">
                        <span className="capitalize">{act.category.toLowerCase()}</span>
                      </td>
                      <td className="py-3 text-[var(--color-text-secondary)] font-semibold">{act.activityType}</td>
                      <td className="py-3 text-[var(--color-text-secondary)]">{act.quantity} {act.unit}</td>
                      <td className="py-3 text-right text-[var(--color-accent-light)] font-bold">{act.co2eKg} kg</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-6 text-center text-[var(--color-text-muted)]">
                      No activities logged recently.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
