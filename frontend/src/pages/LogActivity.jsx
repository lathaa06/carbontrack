import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { activityService, EMISSION_FACTORS } from '../services/api';
import { toast } from 'react-toastify';
import { FiLoader, FiCheckCircle, FiInfo } from 'react-icons/fi';

const CATEGORIES = ['TRANSPORT', 'ELECTRICITY', 'FOOD', 'SHOPPING'];

export default function LogActivity() {
  const [activeCategory, setActiveCategory] = useState('TRANSPORT');
  const [loading, setLoading] = useState(false);
  const [co2ePreview, setCo2ePreview] = useState(0);

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
    defaultValues: {
      category: 'TRANSPORT',
      activityType: '',
      quantity: '',
      unit: '',
      logDate: new Date().toISOString().split('T')[0],
      notes: '',
    }
  });

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
        quantity: '',
        unit: EMISSION_FACTORS[activeCategory][Object.keys(EMISSION_FACTORS[activeCategory])[0]]?.unit || '',
        logDate: new Date().toISOString().split('T')[0],
        notes: '',
      });
      setCo2ePreview(0);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to log activity');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 fade-in">
      {/* Tab Navigation */}
      <div className="flex gap-2 p-1 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`flex-1 tab-btn capitalize ${activeCategory === cat ? 'active' : ''}`}
          >
            {cat.toLowerCase()}
          </button>
        ))}
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
                  step="any"
                  placeholder="0.00" 
                  className="input-field pr-16"
                  {...register('quantity', { 
                    required: 'Quantity is required',
                    min: { value: 0.0001, message: 'Quantity must be greater than zero' }
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
              <span className="text-sm font-bold text-[var(--color-accent-light)] flex items-center gap-1">
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
  );
}
