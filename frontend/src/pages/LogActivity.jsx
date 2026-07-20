import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { activityService, EMISSION_FACTORS } from '../services/api';
import { toast } from 'react-toastify';
import { FiLoader, FiCheckCircle, FiInfo, FiTrash2, FiRefreshCw } from 'react-icons/fi';

const CATEGORIES = ['TRANSPORT', 'ELECTRICITY', 'FOOD', 'SHOPPING'];

const DEFAULT_QUICK_LOGS = [
  { title: 'Petrol Car Ride', category: 'TRANSPORT', activityType: 'CAR_PETROL', quantity: 10, unit: 'KM', icon: '🚗' },
  { title: 'Bus Commute', category: 'TRANSPORT', activityType: 'PUBLIC_TRANSIT_BUS', quantity: 15, unit: 'KM', icon: '🚌' },
  { title: 'Train Travel', category: 'TRANSPORT', activityType: 'PUBLIC_TRANSIT_RAIL', quantity: 20, unit: 'KM', icon: '🚂' },
  { title: 'Home Power', category: 'ELECTRICITY', activityType: 'GRID_ELECTRICITY', quantity: 10, unit: 'KWH', icon: '⚡' },
  { title: 'Vegan Lunch', category: 'FOOD', activityType: 'VEGAN_MEAL', quantity: 1, unit: 'SERVING', icon: '🥗' },
];

const getLocalDateString = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function LogActivity() {
  const [activeCategory, setActiveCategory] = useState('TRANSPORT');
  const [loading, setLoading] = useState(false);
  const [co2ePreview, setCo2ePreview] = useState(0);
  const [quickLoggingIndex, setQuickLoggingIndex] = useState(null);
  
  const [quickLogs, setQuickLogs] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
    defaultValues: {
      category: 'TRANSPORT',
      activityType: '',
      quantity: 0,
      unit: '',
      logDate: getLocalDateString(),
      notes: '',
    }
  });

  const getQuickLogDetails = (category, type) => {
    const mappings = {
      CAR_PETROL: { title: 'Petrol Car Ride', icon: '🚗' },
      CAR_DIESEL: { title: 'Diesel Car Ride', icon: '🚗' },
      CAR_ELECTRIC: { title: 'Electric Car Ride', icon: '⚡🚗' },
      FLIGHT_SHORT_HAUL: { title: 'Short-haul Flight', icon: '✈️' },
      FLIGHT_LONG_HAUL: { title: 'Long-haul Flight', icon: '✈️' },
      PUBLIC_TRANSIT_BUS: { title: 'Bus Commute', icon: '🚌' },
      PUBLIC_TRANSIT_RAIL: { title: 'Train Travel', icon: '🚂' },
      GRID_ELECTRICITY: { title: 'Home Power', icon: '⚡' },
      RENEWABLE_ELECTRICITY: { title: 'Renewable Power', icon: '🌿⚡' },
      BEEF_MEAL: { title: 'Beef Meal', icon: '🥩' },
      CHICKEN_MEAL: { title: 'Chicken Meal', icon: '🍗' },
      VEGETARIAN_MEAL: { title: 'Veggie Meal', icon: '🥗' },
      VEGAN_MEAL: { title: 'Vegan Meal', icon: '🌱' },
      CLOTHING: { title: 'New Clothes', icon: '👕' },
      ELECTRONICS: { title: 'Electronics', icon: '💻' },
      GENERAL_RETAIL: { title: 'General Shopping', icon: '🛍️' },
    };
    return mappings[type] || { title: type.replace(/_/g, ' '), icon: '☘️' };
  };

  const fetchLogsAndFrequents = async () => {
    try {
      const res = await activityService.getActivities(0, 50);
      const logs = res.content || [];
      setRecentLogs(logs.slice(0, 10));
      
      if (logs.length === 0) {
        setQuickLogs(DEFAULT_QUICK_LOGS);
        return;
      }

      // Count frequencies
      const frequencies = {};
      logs.forEach(log => {
        const key = `${log.category}|${log.activityType}`;
        if (!frequencies[key]) {
          frequencies[key] = {
            category: log.category,
            activityType: log.activityType,
            unit: log.unit,
            quantity: log.quantity,
            count: 0
          };
        }
        frequencies[key].count += 1;
      });

      const sorted = Object.values(frequencies)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const mapped = sorted.map(item => {
        const details = getQuickLogDetails(item.category, item.activityType);
        return {
          title: details.title,
          category: item.category,
          activityType: item.activityType,
          quantity: item.quantity,
          unit: item.unit,
          icon: details.icon
        };
      });

      setQuickLogs(mapped);
    } catch (err) {
      console.error(err);
      setQuickLogs(DEFAULT_QUICK_LOGS);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchLogsAndFrequents();
  }, []);

  const handleQuickLog = async (item, index) => {
    setQuickLoggingIndex(index);
    try {
      const payload = {
        category: item.category,
        activityType: item.activityType,
        quantity: Number(item.quantity),
        unit: item.unit,
        logDate: getLocalDateString(),
        notes: `Quick Log: ${item.title}`
      };
      await activityService.logActivity(payload);
      toast.success(`Logged ${item.quantity} ${item.unit.toLowerCase()} for ${item.title.toLowerCase()}!`);
      fetchLogsAndFrequents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to log activity');
    } finally {
      setQuickLoggingIndex(null);
    }
  };

  const handleDeleteActivity = (id) => {
    setDeleteConfirmId(id);
  };

  const executeDelete = async (id) => {
    try {
      await activityService.deleteActivity(id);
      toast.success('Activity log deleted successfully!');
      fetchLogsAndFrequents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete activity log');
    }
  };

  const handleLogAgain = async (log) => {
    try {
      const payload = {
        category: log.category,
        activityType: log.activityType,
        quantity: Number(log.quantity),
        unit: log.unit,
        logDate: getLocalDateString(),
        notes: `Logged again: ${getQuickLogDetails(log.category, log.activityType).title}`
      };
      await activityService.logActivity(payload);
      toast.success(`Logged ${log.quantity} ${log.unit.toLowerCase()} again!`);
      fetchLogsAndFrequents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to log activity again');
    }
  };

  const selectedActivityType = watch('activityType');
  const quantityInput = watch('quantity');

  // Set category in form when activeCategory state changes
  useEffect(() => {
    setValue('category', activeCategory);
    // Reset activityType and unit to first option of new category
    const options = Object.keys(EMISSION_FACTORS[activeCategory]);
    if (options.length > 0) {
      setValue('activityType', options[0]);
      setValue('unit', EMISSION_FACTORS[activeCategory][options[0]].unit);
    }
  }, [activeCategory, setValue]);

  // Update unit label when selectedActivityType changes
  useEffect(() => {
    if (selectedActivityType && EMISSION_FACTORS[activeCategory][selectedActivityType]) {
      setValue('unit', EMISSION_FACTORS[activeCategory][selectedActivityType].unit);
    }
  }, [selectedActivityType, activeCategory, setValue]);

  // Compute real-time CO2e preview instantly
  useEffect(() => {
    if (selectedActivityType && quantityInput && !isNaN(quantityInput)) {
      const entry = EMISSION_FACTORS[activeCategory][selectedActivityType];
      if (entry) {
        const preview = Number(quantityInput) * entry.factor;
        setCo2ePreview(preview.toFixed(3));
        return;
      }
    }
    setCo2ePreview(0);
  }, [selectedActivityType, quantityInput, activeCategory]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        quantity: Number(data.quantity),
      };
      await activityService.logActivity(payload);
      toast.success('Activity logged successfully!');
      // Keep category and reset form
      reset({
        category: activeCategory,
        activityType: Object.keys(EMISSION_FACTORS[activeCategory])[0] || '',
        quantity: 0,
        unit: EMISSION_FACTORS[activeCategory][Object.keys(EMISSION_FACTORS[activeCategory])[0]]?.unit || '',
        logDate: getLocalDateString(),
        notes: '',
      });
      setCo2ePreview(0);
      fetchLogsAndFrequents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to log activity');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto fade-in pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Logger Actions & Carousel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Capsule Track Tab Navigation */}
          <div className="flex p-1 bg-slate-100/80 border border-slate-200/40 rounded-full shadow-inner">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`flex-1 py-2.5 text-xs font-bold rounded-full transition-all duration-300 cursor-pointer text-center capitalize ${
                  activeCategory === cat 
                    ? 'bg-white text-[var(--color-accent)] shadow-sm border border-slate-200/20' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {cat.toLowerCase()}
              </button>
            ))}
          </div>

          {/* Quick-Log Carousel */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase font-bold tracking-wider text-[var(--color-text-muted)] pl-1">
              Frequently Logged (Quick Log)
            </h4>
            <div className="flex gap-4 overflow-x-auto pb-3 pt-1 scrollbar-none">
              {quickLogs.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => quickLoggingIndex === null && handleQuickLog(item, idx)}
                  className={`flex-shrink-0 w-44 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-4 flex flex-col justify-between hover:border-[var(--color-accent)]/30 hover:-translate-y-1 transition-all duration-300 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] cursor-pointer relative overflow-hidden ${
                    quickLoggingIndex === idx ? 'opacity-70 pointer-events-none' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-[9px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 tracking-wider">
                      {item.category.toLowerCase()}
                    </span>
                  </div>
                  <div className="mt-4">
                    <h5 className="font-bold text-xs text-[var(--color-text-primary)] truncate">{item.title}</h5>
                    <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5">{item.quantity} {item.unit.toLowerCase()}</p>
                  </div>
                  
                  {quickLoggingIndex === idx && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
                      <FiLoader className="animate-spin text-[var(--color-accent)]" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Log Form Card */}
          <div className="glass-card p-8 relative overflow-hidden">
            <h3 className="text-xl font-bold font-outfit mb-6 text-[var(--color-text-primary)] capitalize">
              Log {activeCategory.toLowerCase()} Activity
            </h3>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="label">Activity Type</label>
                  <select 
                    className="input-field"
                    {...register('activityType', { required: 'Activity type is required' })}
                  >
                    {Object.entries(EMISSION_FACTORS[activeCategory]).map(([key, value]) => (
                      <option key={key} value={key} className="bg-[var(--color-bg-secondary)]">
                        {value.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Quantity</label>
                  <div className="relative">
                    <input 
                      type="number"
                      min="0"
                      step="0.0001"
                      inputMode="decimal"
                      placeholder="0.00"
                      className="input-field pr-16"
                      onKeyDown={(event) => {
                        if (['-', '+', 'e', 'E'].includes(event.key)) {
                          event.preventDefault();
                        }
                      }}
                      {...register('quantity', { 
                        required: 'Quantity is required',
                        min: { value: 0, message: 'Quantity cannot be negative' }
                      })}
                    />
                    <span className="absolute right-3 top-3 text-xs font-semibold text-[var(--color-text-secondary)]">
                      {watch('unit')}
                    </span>
                  </div>
                  {errors.quantity && <p className="error-text">{errors.quantity.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="label">Date</label>
                  <input 
                    type="date" 
                    className="input-field text-xs"
                    {...register('logDate', { required: 'Date is required' })}
                  />
                </div>

                <div>
                  <label className="label">Notes (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Daily commute, business flight" 
                    className="input-field"
                    {...register('notes')}
                  />
                </div>
              </div>

              {/* Real-time preview */}
              {co2ePreview > 0 && (
                <div className="p-4 bg-[var(--color-accent-dim)] border border-[var(--color-border)] rounded-xl flex items-center justify-between glow-green">
                  <div className="flex items-center gap-2">
                    <FiInfo className="text-[var(--color-accent)] text-sm shrink-0" />
                    <span className="text-xs text-[var(--color-text-secondary)]">CO₂ footprint preview:</span>
                  </div>
                  <span className="text-sm font-bold text-[var(--color-accent-muted)] flex items-center gap-1">
                    <FiCheckCircle />
                    {co2ePreview} kg CO₂e
                  </span>
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading} 
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                {loading ? <FiLoader className="animate-spin" /> : 'Save Activity Log'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Activity Log History Sidebar */}
        <div className="lg:col-span-1">
          <div className="glass-card p-6 space-y-4 sticky top-24">
            <div className="flex justify-between items-center pb-2 border-b border-[var(--color-border)]/50">
              <h3 className="text-xs font-bold tracking-wide uppercase text-[var(--color-text-secondary)]">Recent Activity Logs</h3>
              <span className="text-[10px] text-[var(--color-text-muted)] font-bold">{recentLogs.length} Logged</span>
            </div>
            
            {historyLoading ? (
              <div className="space-y-3 animate-pulse">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-14 bg-slate-100 rounded-xl"></div>
                ))}
              </div>
            ) : recentLogs.length > 0 ? (
              <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
                {recentLogs.map((log) => (
                  <div key={log.id} className="p-3 bg-[var(--color-bg-primary)]/50 border border-[var(--color-border)] rounded-xl flex items-center justify-between group hover:border-[var(--color-accent)]/20 transition-all duration-300">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <span className="text-xl shrink-0">
                        {getQuickLogDetails(log.category, log.activityType).icon}
                      </span>
                      <div className="overflow-hidden">
                        <h5 className="font-bold text-[11px] text-[var(--color-text-primary)] truncate">
                          {getQuickLogDetails(log.category, log.activityType).title}
                        </h5>
                        <p className="text-[10px] text-[var(--color-text-muted)] truncate">
                          {log.logDate} • {log.quantity} {log.unit.toLowerCase()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] font-bold text-[var(--color-accent-muted)]">{log.co2eKg} kg</span>
                      <button
                        onClick={() => handleLogAgain(log)}
                        className="text-slate-400 hover:text-[var(--color-accent)] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer bg-transparent border-none p-1 flex items-center justify-center"
                        title="Log this again"
                      >
                        <FiRefreshCw className="text-[10px]" />
                      </button>
                      <button
                        onClick={() => handleDeleteActivity(log.id)}
                        className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer bg-transparent border-none p-1 flex items-center justify-center"
                        title="Delete log"
                      >
                        <FiTrash2 className="text-xs" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-[var(--color-text-muted)] border border-dashed border-[var(--color-border)] rounded-2xl">
                <FiInfo className="text-xl mx-auto mb-2 text-[var(--color-text-muted)]" />
                No logged activities found.
              </div>
            )}
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
