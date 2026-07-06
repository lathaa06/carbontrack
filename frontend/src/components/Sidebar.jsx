import { useState } from 'react';
import { NavLink } from 'react-router-dom';
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

export default function Sidebar() {
  const { user, logout, isOrgAdmin } = useAuth();
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);

  return (
    <div className="w-64 bg-[var(--color-bg-secondary)] border-r border-[var(--color-border)] flex flex-col h-screen fixed left-0 top-0 z-50">
      <div className="p-6 border-b border-[var(--color-border)]">
        <h1 className="text-xl font-bold flex items-center gap-2 text-[var(--color-accent)] font-outfit">
          <LuSprout className="text-2xl text-[var(--color-accent)]" />
          CarbonTrack
        </h1>
        <p className="text-xs text-[var(--color-text-muted)] mt-1">Sustainability Analytics</p>
      </div>

      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <FiHome className="text-lg" />
          Dashboard
        </NavLink>
        <NavLink to="/log-activity" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <FiPlusCircle className="text-lg" />
          Log Activity
        </NavLink>
        <NavLink to="/goals" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <FiTarget className="text-lg" />
          Goals
        </NavLink>
        <NavLink to="/leaderboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <FiAward className="text-lg" />
          Leaderboard
        </NavLink>
        
        {isOrgAdmin && (
          <NavLink to="/organisation" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <FiShield className="text-lg" />
            Org Dashboard
          </NavLink>
        )}

        <NavLink to="/profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <FiUser className="text-lg" />
          Profile
        </NavLink>
      </nav>

      <div className="p-4 border-t border-[var(--color-border)]">
        <div className="flex items-center gap-3 mb-4 px-2">
          {user?.profilePhoto ? (
            <img src={user.profilePhoto} alt={user.username} className="w-9 h-9 rounded-full object-cover border border-[var(--color-border)]" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-[var(--color-accent-dim)] border border-[var(--color-border)] flex items-center justify-center font-bold text-[var(--color-accent)] text-sm uppercase">
              {user?.username?.substring(0, 2)}
            </div>
          )}
          <div className="overflow-hidden">
            <h4 className="text-sm font-semibold truncate">{user?.username}</h4>
            <p className="text-xs text-[var(--color-text-muted)] truncate capitalize">{user?.role?.toLowerCase()}</p>
          </div>
        </div>
        <button 
          onClick={() => setShowConfirmLogout(true)}
          className="w-full flex items-center justify-center gap-2 btn-ghost text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300 cursor-pointer"
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
