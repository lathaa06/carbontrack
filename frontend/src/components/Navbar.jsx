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
    <header className="h-16 bg-[#16a34a] text-white flex items-center justify-between px-6 sticky top-0 z-40 shadow-sm">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="text-white hover:text-emerald-100 hover:bg-[#128a3e] p-2 rounded-lg transition cursor-pointer bg-transparent border-none outline-none flex items-center justify-center"
          title={sidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          aria-label="Toggle Sidebar"
        >
          <FiMenu className="text-xl" />
        </button>
        <h2 className="text-lg font-bold font-outfit text-white tracking-wide">{title}</h2>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Interactive Unit Selector */}
        <div className="relative flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#128a3e]/40 border border-[#128a3e]/60 text-xs text-emerald-100 font-semibold hover:border-emerald-500 hover:text-white transition">
          <FiGlobe className="text-emerald-200" />
          <span className="mr-1">System:</span>
          <select
            value={user?.preferredUnitSystem || 'METRIC'}
            onChange={handleUnitSystemChange}
            className="bg-transparent border-none outline-none font-bold text-white cursor-pointer pr-1"
          >
            <option value="METRIC" className="bg-[#064e3b] text-white">METRIC</option>
            <option value="IMPERIAL" className="bg-[#064e3b] text-white">IMPERIAL</option>
          </select>
        </div>

        <div 
          onClick={() => navigate('/profile')}
          className="flex items-center gap-3 hover:bg-[#128a3e]/50 py-1.5 px-3 rounded-xl cursor-pointer transition duration-200 border border-transparent hover:border-[#128a3e]/40 shadow-sm"
          title="View Profile"
        >
          <span className="text-xs text-emerald-100 font-medium">Hello, <strong className="text-white font-bold">{user?.username}</strong></span>
          {user?.profilePhoto ? (
            <img src={user.profilePhoto} alt={user.username} className="w-8 h-8 rounded-full object-cover border border-[#128a3e]/40" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#128a3e] border border-[#128a3e]/30 flex items-center justify-center font-bold text-white text-[10px] uppercase">
              {(user?.username || 'U').substring(0, 2)}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
