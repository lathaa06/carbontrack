import { useAuth } from '../context/AuthContext';
import { profileService } from '../services/api';
import { toast } from 'react-toastify';
import { FiGlobe, FiMenu } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

export default function Navbar({ title, sidebarOpen, onToggleSidebar }) {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

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
    <header className="h-16 bg-[var(--color-bg-secondary)]/80 text-[var(--color-text-primary)] border-b border-[var(--color-border)]/50 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-card)] p-2 rounded-lg transition cursor-pointer bg-transparent border-none outline-none flex items-center justify-center"
          title={sidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          aria-label="Toggle Sidebar"
        >
          <FiMenu className="text-xl" />
        </button>
        <h2 className="text-lg font-bold font-outfit text-[var(--color-text-primary)] tracking-wide">{title}</h2>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Interactive Unit Selector */}
        <div className="relative flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--color-bg-card)] border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] font-semibold hover:border-[var(--color-border-hover)] hover:text-[var(--color-text-primary)] transition">
          <FiGlobe className="text-[var(--color-accent-blue)]" />
          <span className="mr-1">System:</span>
          <select
            value={user?.preferredUnitSystem || 'METRIC'}
            onChange={handleUnitSystemChange}
            className="bg-transparent border-none outline-none font-bold text-[var(--color-text-primary)] cursor-pointer pr-1"
          >
            <option value="METRIC" className="bg-[var(--color-bg-card)] text-[var(--color-text-primary)]">METRIC</option>
            <option value="IMPERIAL" className="bg-[var(--color-bg-card)] text-[var(--color-text-primary)]">IMPERIAL</option>
          </select>
        </div>

        {/* Profile Avatar Capsule */}
        <div 
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2 pl-2 py-1 pr-3 hover:bg-[var(--color-bg-card-hover)] border border-[var(--color-border)] rounded-full cursor-pointer transition duration-200 shadow-sm"
          title="View Profile"
        >
          {user?.profilePhoto ? (
            <img src={user.profilePhoto} alt={user.username} className="w-7 h-7 rounded-full object-cover border border-[var(--color-border)]/50" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-[var(--color-bg-card)] border border-[var(--color-border)]/50 flex items-center justify-center font-bold text-[var(--color-accent)] text-[10px] uppercase">
              {user?.username?.substring(0, 2)}
            </div>
          )}
          <span className="text-xs font-bold text-[var(--color-text-secondary)]">{user?.username}</span>
        </div>
      </div>
    </header>
  );
}
