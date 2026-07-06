import { useAuth } from '../context/AuthContext';
import { profileService } from '../services/api';
import { toast } from 'react-toastify';
import { FiGlobe } from 'react-icons/fi';

export default function Navbar({ title }) {
  const { user, updateUser } = useAuth();

  const handleUnitSystemChange = async (e) => {
    const newSystem = e.target.value;
    try {
      const updated = await profileService.updateProfile({
        preferredUnitSystem: newSystem
      });
      updateUser(updated);
      toast.success(`Unit system updated to ${newSystem.toLowerCase()}!`);
    } catch (err) {
      toast.error('Failed to update preferred unit system');
    }
  };

  return (
    <header className="h-16 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] flex items-center justify-between px-8 sticky top-0 z-40">
      <h2 className="text-lg font-bold font-outfit text-[var(--color-text-primary)] tracking-wide">{title}</h2>
      
      <div className="flex items-center gap-4">
        {/* Interactive Unit Selector */}
        <div className="relative flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] font-semibold hover:border-[var(--color-accent)] transition">
          <FiGlobe className="text-[var(--color-accent)]" />
          <span className="mr-1">System:</span>
          <select
            value={user?.preferredUnitSystem || 'METRIC'}
            onChange={handleUnitSystemChange}
            className="bg-transparent border-none outline-none font-bold text-[var(--color-text-primary)] cursor-pointer pr-1"
          >
            <option value="METRIC" className="bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]">METRIC</option>
            <option value="IMPERIAL" className="bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]">IMPERIAL</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-[var(--color-text-secondary)]">Hello, <strong className="text-[var(--color-text-primary)]">{user?.username}</strong></span>
          {user?.profilePhoto ? (
            <img src={user.profilePhoto} alt={user.username} className="w-8 h-8 rounded-full object-cover border border-[var(--color-border)]" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[var(--color-accent-dim)] border border-[var(--color-border)] flex items-center justify-center font-bold text-[var(--color-accent)] text-[10px] uppercase">
              {(user?.username || 'U').substring(0, 2)}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
