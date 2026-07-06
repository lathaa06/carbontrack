import { useEffect, useState } from 'react';
import { organisationService } from '../services/api';
import { toast } from 'react-toastify';
import { ResponsiveContainer, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { FiShield, FiTrendingUp, FiTrendingDown, FiActivity, FiUsers, FiInfo } from 'react-icons/fi';

const CATEGORY_COLORS = {
  TRANSPORT: '#22c55e',
  ELECTRICITY: '#3b82f6',
  FOOD: '#eab308',
  SHOPPING: '#ec4899',
};

export default function Organisation() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrgDashboard() {
      try {
        const res = await organisationService.getDashboard();
        setData(res);
      } catch (err) {
        toast.error('Failed to load organisation dashboard. Ensure you have the ORG_ADMIN role.');
      } finally {
        setLoading(false);
      }
    }
    fetchOrgDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-32 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl"></div>
          <div className="h-32 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl"></div>
        </div>
        <div className="h-64 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl"></div>
        <div className="h-64 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="glass-card p-12 text-center flex flex-col items-center justify-center">
        <FiShield className="text-4xl text-red-400 mb-4" />
        <h3 className="text-lg font-semibold">Access Denied</h3>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          This dashboard requires ORG_ADMIN authorization.
        </p>
      </div>
    );
  }

  // Parse category breakdown for BarChart
  const barData = data.categoryBreakdown.map((item) => ({
    name: item.category,
    Emissions: Number(item.totalCo2e),
  }));

  // Calculate MoM change
  const current = Number(data.currentMonthEmissions);
  const previous = Number(data.previousMonthEmissions);
  let momChange = 0;
  let isIncrease = false;
  if (previous > 0) {
    momChange = (((current - previous) / previous) * 100).toFixed(1);
    isIncrease = current > previous;
  }

  return (
    <div className="space-y-8 fade-in">
      {/* Top Banner */}
      <div className="glass-card p-6 flex items-center justify-between border-l-4 border-[var(--color-accent)]">
        <div>
          <h2 className="text-2xl font-bold font-outfit text-[var(--color-text-primary)]">{data.organisationName}</h2>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">Corporate Sustainability Dashboard</p>
        </div>
        <div className="p-3 bg-[var(--color-accent-dim)] rounded-xl text-[var(--color-accent)]">
          <FiShield className="text-2xl animate-pulse" />
        </div>
      </div>

      {/* MoM Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="stat-card">
          <h4 className="text-xs text-[var(--color-text-muted)] font-bold uppercase tracking-wider">Current Month Emissions</h4>
          <h2 className="text-3xl font-bold font-outfit mt-2 text-[var(--color-text-primary)]">
            {data.currentMonthEmissions} <span className="text-sm font-medium text-[var(--color-text-secondary)]">kg CO₂e</span>
          </h2>
          {previous > 0 ? (
            <p className="text-xs mt-2 flex items-center gap-1">
              {isIncrease ? (
                <>
                  <FiTrendingUp className="text-red-600" />
                  <span className="text-red-600 font-semibold">+{momChange}%</span>
                </>
              ) : (
                <>
                  <FiTrendingDown className="text-emerald-600" />
                  <span className="text-emerald-600 font-semibold">{momChange}%</span>
                </>
              )}
              <span className="text-[var(--color-text-muted)]">vs last month ({data.previousMonthEmissions} kg)</span>
            </p>
          ) : (
            <p className="text-xs text-[var(--color-text-muted)] mt-2">No preceding month records</p>
          )}
        </div>

        <div className="stat-card">
          <h4 className="text-xs text-[var(--color-text-muted)] font-bold uppercase tracking-wider">Active Employees</h4>
          <h2 className="text-3xl font-bold font-outfit mt-2 text-[var(--color-text-primary)]">
            {data.employees.length} <span className="text-sm font-medium text-[var(--color-text-secondary)]">Members</span>
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)] mt-2">Enrolled under organisation tenant</p>
        </div>
      </div>

      {/* Team category totals */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-bold tracking-wide uppercase text-[var(--color-text-secondary)] mb-6">Team Emissions by Category</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--color-text-muted)" fontSize={11} />
              <YAxis stroke="var(--color-text-muted)" fontSize={11} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', borderRadius: '8px' }}
                itemStyle={{ color: 'var(--color-text-primary)' }}
              />
              <Bar dataKey="Emissions" radius={[4, 4, 0, 0]}>
                {barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name] || '#16a34a'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Employees CSR comparison table */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-bold tracking-wide uppercase text-[var(--color-text-secondary)] mb-6">Employee Sustainability Comparison (CSR)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-[var(--color-text-muted)] uppercase tracking-wider font-bold">
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Total Emissions (30 Days)</th>
                <th className="py-3 px-4 text-center">Active Goal Status</th>
                <th className="py-3 px-4 text-right">Last Log Date</th>
              </tr>
            </thead>
            <tbody>
              {data.employees.length > 0 ? (
                data.employees.map((emp) => (
                  <tr key={emp.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-bg-card-hover)] transition-colors">
                    <td className="py-4 px-4 font-semibold text-[var(--color-text-primary)]">{emp.username}</td>
                    <td className="py-4 px-4 font-bold text-[var(--color-accent-light)]">
                      {emp.totalCo2e} <span className="text-[10px] font-normal text-[var(--color-text-muted)]">kg CO₂e</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`badge ${
                        emp.activeGoalStatus === 'ON_TRACK' ? 'badge-green' :
                        emp.activeGoalStatus === 'OFF_TRACK' ? 'badge-red' : 'badge-yellow'
                      }`}>
                        {emp.activeGoalStatus === 'NO_ACTIVE_GOAL' ? 'NO GOAL' : emp.activeGoalStatus}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right text-[var(--color-text-secondary)]">
                      {emp.lastLogDate}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-[var(--color-text-muted)]">
                    <FiInfo className="text-xl mx-auto mb-2" />
                    No employees registered in this organisation.
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
