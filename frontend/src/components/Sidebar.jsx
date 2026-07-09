import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LuSprout } from 'react-icons/lu';
import { 
  FiHome, 
  FiPlusCircle, 
  FiTarget, 
  FiAward, 
  FiUser, 
  FiLogOut, 
  FiShield 
} from 'react-icons/fi';

export default function Sidebar({ isOpen }) {
  const { user, logout, isOrgAdmin } = useAuth();
  const navigate = useNavigate();
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);

  return (
    <div className={`w-64 bg-[#16a34a] border-r border-[#128a3e]/30 flex flex-col h-screen fixed left-0 top-0 z-50 shadow-lg text-white transition-transform duration-300 ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    }`}>
      <div className="p-6 border-b border-[#128a3e]/50">
        <h1 className="text-xl font-bold flex items-center gap-2 text-white font-outfit">
          <LuSprout className="text-2xl text-emerald-100" />
          CarbonTrack
        </h1>
        <p className="text-xs text-emerald-100/80 mt-1">Sustainability Analytics</p>
      </div>

      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition duration-200 decoration-none cursor-pointer ${
            isActive 
              ? 'bg-[#064e3b] text-white shadow-inner border border-emerald-950/20' 
              : 'text-emerald-50 hover:bg-[#128a3e] hover:text-white'
          }`}
        >
          <FiHome className="text-lg" />
          Dashboard
        </NavLink>
        <NavLink 
          to="/log-activity" 
          className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition duration-200 decoration-none cursor-pointer ${
            isActive 
              ? 'bg-[#064e3b] text-white shadow-inner border border-emerald-950/20' 
              : 'text-emerald-50 hover:bg-[#128a3e] hover:text-white'
          }`}
        >
          <FiPlusCircle className="text-lg" />
          Log Activity
        </NavLink>
        <NavLink 
          to="/goals" 
          className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition duration-200 decoration-none cursor-pointer ${
            isActive 
              ? 'bg-[#064e3b] text-white shadow-inner border border-emerald-950/20' 
              : 'text-emerald-50 hover:bg-[#128a3e] hover:text-white'
          }`}
        >
          <FiTarget className="text-lg" />
          Goals
        </NavLink>
        <NavLink 
          to="/leaderboard" 
          className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition duration-200 decoration-none cursor-pointer ${
            isActive 
              ? 'bg-[#064e3b] text-white shadow-inner border border-emerald-950/20' 
              : 'text-emerald-50 hover:bg-[#128a3e] hover:text-white'
          }`}
        >
          <FiAward className="text-lg" />
          Leaderboard
        </NavLink>
        
        {isOrgAdmin && (
          <NavLink 
            to="/organisation" 
            className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition duration-200 decoration-none cursor-pointer ${
              isActive 
                ? 'bg-[#064e3b] text-white shadow-inner border border-emerald-950/20' 
                : 'text-emerald-50 hover:bg-[#128a3e] hover:text-white'
            }`}
          >
            <FiShield className="text-lg" />
            Org Dashboard
          </NavLink>
        )}
      </nav>

      <div className="p-4 border-t border-[#128a3e]/50">
        <div 
          onClick={() => navigate('/profile')}
          className="flex items-center gap-3 mb-4 px-2 hover:bg-[#128a3e]/50 p-2 rounded-xl cursor-pointer transition duration-200 border border-transparent hover:border-[#128a3e]/40 shadow-sm"
          title="View Profile"
        >
          {user?.profilePhoto ? (
            <img src={user.profilePhoto} alt={user.username} className="w-9 h-9 rounded-full object-cover border border-[#128a3e]/40" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-[#128a3e] border border-[#0d6e30]/30 flex items-center justify-center font-bold text-white text-sm uppercase">
              {user?.username?.substring(0, 2)}
            </div>
          )}
          <div className="overflow-hidden">
            <h4 className="text-sm font-semibold text-white truncate">{user?.username}</h4>
            <p className="text-xs text-emerald-100/70 truncate capitalize">{user?.role?.toLowerCase()}</p>
          </div>
        </div>
        <button 
          onClick={() => setShowConfirmLogout(true)}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-[#128a3e]/40 text-emerald-50 hover:text-red-300 hover:bg-red-950/20 hover:border-red-900/30 transition-all font-semibold text-xs cursor-pointer bg-transparent"
        >
          <FiLogOut />
          Logout
        </button>
      </div>

      {showConfirmLogout && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card max-w-sm w-full p-6 flex flex-col items-center bg-[var(--color-bg-secondary)] border-[var(--color-border)] shadow-xl animate-fade-in">
            <h4 className="text-md font-bold text-[var(--color-text-primary)] mb-2 font-outfit">Confirm Logout</h4>
            <p className="text-xs text-[var(--color-text-secondary)] text-center mb-6 leading-relaxed">
              Are you sure you want to log out of your session? Unsaved activity logs may be lost.
            </p>
            <div className="flex gap-4 w-full">
              <button
                type="button"
                onClick={() => setShowConfirmLogout(false)}
                className="flex-1 btn-ghost py-2 border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowConfirmLogout(false);
                  logout();
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 text-xs rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
