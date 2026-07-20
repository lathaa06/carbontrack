import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService, activityService } from '../services/api';
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
  FiSmile,
  FiTrash2,
  FiRefreshCw,
  FiArrowRight
} from 'react-icons/fi';
import EcoPulse from '../components/EcoPulse';

const CATEGORY_COLORS = {
  TRANSPORT: '#10b981',
  ELECTRICITY: '#06b6d4',
  FOOD: '#f59e0b',
  SHOPPING: '#ef4444',
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const getLocalDateString = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const fetchDashboard = async () => {
    try {
      const summary = await dashboardService.getDashboard();
      setData(summary);
    } catch (err) {
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleDeleteActivity = (id) => {
    setDeleteConfirmId(id);
  };

  const executeDelete = async (id) => {
    try {
      await activityService.deleteActivity(id);
      toast.success('Activity log deleted successfully!');
      fetchDashboard();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete activity log');
    }
  };

  const handleLogAgain = async (act) => {
    try {
      const payload = {
        category: act.category,
        activityType: act.activityType,
        quantity: Number(act.quantity),
        unit: act.unit,
        logDate: getLocalDateString(),
        notes: `Logged again from Dashboard`
      };
      await activityService.logActivity(payload);
      toast.success(`Logged ${act.quantity} ${act.unit.toLowerCase()} again!`);
      fetchDashboard();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to log activity again');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-center py-4 text-center">
          <EcoPulse className="h-20 w-20" />
          <p className="-mt-2 text-xs font-medium text-[var(--color-text-muted)]">Gathering your sustainability insights…</p>
        </div>
        <div className="animate-pulse space-y-6">
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
      </div>
    );
  }

  if (!data) {
    return (
      <div className="glass-card p-12 text-center flex flex-col items-center justify-center">
        <EcoPulse className="h-24 w-24" />
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

  // Calculate goal projection if activeGoal exists
  let projectionData = null;
  let dailyAllowed = 0;
  let currentDailyAvg = 0;
  let requiredDailyReduction = 0;
  if (data.activeGoal) {
    const goal = data.activeGoal;
    const start = new Date(goal.startDate);
    const today = new Date();
    const daysElapsed = Math.max(1, Math.ceil((today - start) / (1000 * 60 * 60 * 24)));
    
    dailyAllowed = (goal.targetCo2e / goal.periodDays);
    currentDailyAvg = (goal.currentCo2e / daysElapsed);
    requiredDailyReduction = Math.max(0, currentDailyAvg - dailyAllowed);

    projectionData = [
      { name: 'Start', 'Target Limit': 0, 'Actual Footprint': 0, 'Projected': 0 },
      { name: 'Today', 'Target Limit': Math.round(dailyAllowed * daysElapsed), 'Actual Footprint': goal.currentCo2e, 'Projected': goal.currentCo2e },
      { name: 'End Goal', 'Target Limit': goal.targetCo2e, 'Actual Footprint': null, 'Projected': Math.round(currentDailyAvg * goal.periodDays) }
    ];
  }

  return (
    <div className="space-y-8 fade-in">
      <section className="dashboard-hero overflow-hidden p-6 md:p-8">
        <div className="relative z-10 max-w-2xl">
          <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-100">
            <span className="pulse-dot bg-emerald-200" /> Your carbon pulse
          </p>
          <h1 className="font-outfit text-2xl font-extrabold tracking-tight text-white md:text-3xl">
            Small choices, measurable impact.
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-emerald-50/90">
            You have logged {data.monthlyCo2e} kg CO₂e in the last 30 days. Keep building a clearer picture of your footprint.
          </p>
          <Link to="/log-activity" className="hero-action mt-5 inline-flex items-center gap-2">
            Log an activity <FiArrowRight />
          </Link>
        </div>
        <EcoPulse className="absolute -right-3 -bottom-9 h-44 w-44 opacity-80 md:right-8" />
      </section>

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
          <div className="absolute top-4 right-4 p-2 bg-[rgba(6,182,212,0.1)] border border-[rgba(6,182,212,0.2)] rounded-lg text-[var(--color-accent-blue)]">
            <FiCalendar className="text-lg" />
          </div>
          <h4 className="text-xs text-[var(--color-text-muted)] font-bold uppercase tracking-wider">Weekly Footprint</h4>
          <h2 className="text-3xl font-bold font-outfit mt-2 text-[var(--color-text-primary)]">
            {data.weeklyCo2e} <span className="text-sm font-medium text-[var(--color-text-secondary)]">kg CO₂e</span>
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)] mt-2">Last 7 days cumulative</p>
        </div>

        <div className="stat-card relative overflow-hidden">
          <div className="absolute top-4 right-4 p-2 bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.2)] rounded-lg text-[var(--color-warning)]">
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
                <Line type="monotone" dataKey="Last Week" stroke="var(--color-text-muted)" strokeDasharray="5 5" strokeWidth={1.5} dot={{ r: 2 }} />
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

                {/* Calculations Row */}
                <div className="grid grid-cols-3 gap-2 py-3 border-t border-b border-[var(--color-border)]/50 text-[10px]">
                  <div>
                    <span className="text-[var(--color-text-muted)] block uppercase font-bold tracking-wider">Daily Budget</span>
                    <span className="font-bold text-xs text-[var(--color-text-primary)]">{dailyAllowed.toFixed(1)} kg</span>
                  </div>
                  <div>
                    <span className="text-[var(--color-text-muted)] block uppercase font-bold tracking-wider">Daily Average</span>
                    <span className="font-bold text-xs text-[var(--color-text-primary)]">{currentDailyAvg.toFixed(1)} kg</span>
                  </div>
                  <div>
                    <span className="text-[var(--color-text-muted)] block uppercase font-bold tracking-wider">Red. Required</span>
                    <span className={`font-bold text-xs ${requiredDailyReduction > 0 ? 'text-[var(--color-danger)]' : 'text-[var(--color-accent)]'}`}>
                      {requiredDailyReduction > 0 ? `${requiredDailyReduction.toFixed(1)} kg/d` : '0 kg/d'}
                    </span>
                  </div>
                </div>

                {/* Timeline Projection Chart */}
                <div className="pt-2">
                  <h4 className="text-[9px] uppercase font-bold tracking-wider text-[var(--color-text-muted)] mb-2">Footprint Projection Timeline</h4>
                  <div className="h-40 bg-[var(--color-bg-primary)]/50 border border-[var(--color-border)]/50 rounded-xl p-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={projectionData}>
                        <CartesianGrid stroke="rgba(0,0,0,0.03)" vertical={false} />
                        <XAxis dataKey="name" fontSize={9} stroke="var(--color-text-muted)" />
                        <YAxis fontSize={9} stroke="var(--color-text-muted)" />
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: 9 }} />
                        <Line name="Target Bound" type="monotone" dataKey="Target Limit" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="3 3" dot={{ r: 2 }} />
                        <Line name="Actual Footprint" type="monotone" dataKey="Actual Footprint" stroke="var(--color-accent)" strokeWidth={2.5} dot={{ r: 3 }} />
                        <Line name="Projected Path" type="monotone" dataKey="Projected" stroke={requiredDailyReduction > 0 ? "var(--color-danger)" : "var(--color-accent-blue)"} strokeWidth={1.5} strokeDasharray="5 5" dot={{ r: 2 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
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
                  <th className="py-2.5 text-center w-10"></th>
                </tr>
              </thead>
              <tbody>
                {data.recentActivities.length > 0 ? (
                  data.recentActivities.map((act) => (
                    <tr key={act.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-bg-card-hover)] transition-colors group">
                      <td className="py-3 text-[var(--color-text-secondary)]">{act.logDate}</td>
                      <td className="py-3">
                        <span className="capitalize">{act.category.toLowerCase()}</span>
                      </td>
                      <td className="py-3 text-[var(--color-text-secondary)] font-semibold">{act.activityType}</td>
                      <td className="py-3 text-[var(--color-text-secondary)]">{act.quantity} {act.unit}</td>
                      <td className="py-3 text-right text-[var(--color-accent-muted)] font-bold">{act.co2eKg} kg</td>
                      <td className="py-3 text-center">
                        <div className="flex justify-center gap-1.5">
                          <button
                            onClick={() => handleLogAgain(act)}
                            className="text-slate-400 hover:text-[var(--color-accent)] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer bg-transparent border-none p-1 flex items-center justify-center"
                            title="Log this again"
                          >
                            <FiRefreshCw className="text-[10px]" />
                          </button>
                          <button
                            onClick={() => handleDeleteActivity(act.id)}
                            className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer bg-transparent border-none p-1 flex items-center justify-center"
                            title="Delete activity log"
                          >
                            <FiTrash2 className="text-xs" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-6 text-center text-[var(--color-text-muted)]">
                      No activities logged recently.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Custom Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 max-w-sm w-full shadow-2xl flex flex-col items-center text-center animate-scale-up">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4 text-xl">
              <FiTrash2 />
            </div>
            <h4 className="font-bold text-base text-[var(--color-text-primary)] mb-2 font-outfit">Delete Activity Log</h4>
            <p className="text-xs text-[var(--color-text-muted)] leading-relaxed mb-6">
              Are you sure you want to delete this activity log? This action cannot be undone.
            </p>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-grow py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  executeDelete(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="flex-grow py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition shadow-md shadow-red-500/10 cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
