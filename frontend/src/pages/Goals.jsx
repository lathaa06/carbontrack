import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { goalService } from '../services/api';
import { toast } from 'react-toastify';
import { FiLoader, FiTarget, FiInfo, FiPlusCircle, FiCheckCircle } from 'react-icons/fi';

export default function Goals() {
  const [activeGoal, setActiveGoal] = useState(null);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      targetReductionPct: '',
      periodDays: '',
    }
  });

  const fetchData = async () => {
    try {
      const [activeData, historyData] = await Promise.all([
        goalService.getActiveGoal(),
        goalService.getGoals(),
      ]);
      setActiveGoal(activeData);
      setGoals(historyData);
    } catch (err) {
      toast.error('Failed to load goal metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await goalService.createGoal({
        targetReductionPct: Number(data.targetReductionPct),
        periodDays: Number(data.periodDays),
      });
      toast.success('Reduction goal configured successfully!');
      reset();
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create goal');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-48 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl"></div>
          <div className="h-64 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 fade-in">
      {/* Active Goal Summary Card */}
      <div className="glass-card p-8">
        <div className="flex items-center gap-3 mb-6 text-[var(--color-text-primary)]">
          <FiTarget className="text-2xl text-[var(--color-accent)]" />
          <h3 className="text-xl font-bold font-outfit">Active Carbon Reduction Goal</h3>
        </div>

        {activeGoal ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-[var(--color-text-secondary)]">Baseline Emissions</span>
                <span className="text-[var(--color-text-primary)] font-bold">{activeGoal.baselineCo2e} kg CO₂e</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-[var(--color-text-secondary)]">Target (Reduction)</span>
                <span className="text-[var(--color-accent)] font-bold">
                  {activeGoal.targetCo2e} kg CO₂e (-{activeGoal.targetReductionPct}%)
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-[var(--color-text-secondary)]">Progress Period</span>
                <span className="text-[var(--color-text-primary)] font-semibold">{activeGoal.periodDays} Days</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-[var(--color-text-secondary)]">Start Date</span>
                <span className="text-[var(--color-text-primary)] font-semibold">{activeGoal.startDate}</span>
              </div>
            </div>

            <div className="flex flex-col justify-center space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <h4 className="text-xs text-[var(--color-text-muted)] font-bold uppercase tracking-wider">Current Emissions</h4>
                  <p className="text-2xl font-bold font-outfit mt-1 text-[var(--color-text-primary)]">{activeGoal.currentCo2e} kg CO₂e</p>
                </div>
                <span className={`badge ${activeGoal.trajectoryStatus === 'ON_TRACK' ? 'badge-green' : 'badge-red'} mb-1`}>
                  {activeGoal.trajectoryStatus}
                </span>
              </div>

              <div className="progress-bar-bg">
                <div 
                  className="progress-bar-fill" 
                  style={{ width: `${Math.min(Number(activeGoal.progressPct), 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-[var(--color-text-muted)]">
                <span>{activeGoal.progressPct}% of target reached</span>
                <span>Active</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-sm text-[var(--color-text-muted)] border border-dashed border-[var(--color-border)] rounded-2xl">
            <FiInfo className="text-2xl mx-auto mb-2 text-[var(--color-text-muted)]" />
            No active goal currently set. Use the form below to configure a new carbon reduction target.
          </div>
        )}
      </div>

      {/* Action Forms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Set Goal Form */}
        <div className="glass-card p-6 md:col-span-1">
          <div className="flex items-center gap-2 mb-6 text-[var(--color-text-primary)]">
            <FiPlusCircle className="text-lg text-[var(--color-accent)]" />
            <h3 className="text-sm font-bold tracking-wide uppercase">Set New Goal</h3>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Target Reduction (%)</label>
              <div className="relative">
                <input 
                  type="number" 
                  placeholder="e.g. 15" 
                  className="input-field pr-12"
                  {...register('targetReductionPct', { 
                    required: 'Reduction percentage is required',
                    min: { value: 1, message: 'Must be at least 1%' },
                    max: { value: 100, message: 'Cannot exceed 100%' }
                  })}
                />
                <span className="absolute right-3 top-3 text-xs text-[var(--color-text-muted)]">%</span>
              </div>
              {errors.targetReductionPct && <p className="error-text">{errors.targetReductionPct.message}</p>}
            </div>

            <div>
              <label className="label">Period (Days)</label>
              <div className="relative">
                <input 
                  type="number" 
                  placeholder="e.g. 30" 
                  className="input-field pr-16"
                  {...register('periodDays', { 
                    required: 'Goal period is required',
                    min: { value: 1, message: 'Must be at least 1 day' }
                  })}
                />
                <span className="absolute right-3 top-3 text-xs text-[var(--color-text-muted)]">Days</span>
              </div>
              {errors.periodDays && <p className="error-text">{errors.periodDays.message}</p>}
            </div>

            <button type="submit" disabled={submitting} className="w-full btn-primary flex items-center justify-center gap-2">
              {submitting ? <FiLoader className="animate-spin" /> : 'Activate Goal'}
            </button>
          </form>
        </div>

        {/* Goals History List */}
        <div className="glass-card p-6 md:col-span-2">
          <h3 className="text-sm font-bold tracking-wide uppercase text-[var(--color-text-secondary)] mb-6">Goals History</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[var(--color-border)] text-[var(--color-text-muted)] uppercase tracking-wider font-bold">
                  <th className="py-2">Start Date</th>
                  <th className="py-2 text-center">Period</th>
                  <th className="py-2 text-center">Reduction</th>
                  <th className="py-2 text-right">Baseline</th>
                  <th className="py-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {goals.length > 0 ? (
                  goals.map((g) => (
                    <tr key={g.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-bg-card-hover)] transition-colors">
                      <td className="py-3 text-[var(--color-text-secondary)]">{g.startDate}</td>
                      <td className="py-3 text-center text-[var(--color-text-secondary)]">{g.periodDays} Days</td>
                      <td className="py-3 text-center font-bold text-[var(--color-text-primary)]">-{g.targetReductionPct}%</td>
                      <td className="py-3 text-right text-[var(--color-text-secondary)]">{Number(g.baselineCo2eKg).toFixed(1)} kg</td>
                      <td className="py-3 text-right">
                        <span className={`badge ${
                          g.status === 'ACHIEVED' ? 'badge-green' : 
                          g.status === 'ACTIVE' ? 'badge-blue' : 'badge-red'
                        }`}>
                          {g.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-6 text-center text-[var(--color-text-muted)]">
                      No goal settings logged.
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
