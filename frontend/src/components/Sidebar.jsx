import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LuSprout } from 'react-icons/lu';
import Lottie from "lottie-react";
import globeAnimation from "../assets/globe-animation.json";
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
    <>
      <div className={`w-64 bg-[var(--color-bg-secondary)] border-r border-[var(--color-border)] flex flex-col h-screen fixed left-0 top-0 z-50 shadow-lg text-[var(--color-text-primary)] transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-6 border-b border-[var(--color-border)]">
          <h1 className="text-xl font-bold flex items-center gap-2 text-[var(--color-text-primary)] font-outfit">
            <svg viewBox="0 0 100 100" className="w-6 h-6 flex-shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M 50,14 A 36,36 0 1,1 30,22" stroke="var(--color-text-primary)" strokeWidth="7" strokeLinecap="round" />
              <path d="M 41,6 L 54,14 L 41,22 Z" fill="var(--color-accent)" />
              <path d="M 28,34 C 20,48 24,66 38,74 C 30,64 28,50 34,36 C 35,34 32,32 28,34 Z" fill="var(--color-accent-blue)" opacity="0.8" />
              <path d="M 37,42 C 31,54 33,68 44,74 C 38,66 36,54 41,43 C 42,41 39,40 37,42 Z" fill="var(--color-accent-blue)" opacity="0.9" />
              <path d="M 49,75 C 44,60 47,44 57,36 C 58,48 56,62 49,75 Z" fill="var(--color-accent-light)" />
              <path d="M 49,75 C 56,62 58,48 57,36 C 68,40 73,53 69,67 C 66,73 58,76 49,75 Z" fill="var(--color-bg-card)" />
              <path d="M 49,75 C 53,62 55,48 57,36" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            CarbonTrack
          </h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">Sustainability Analytics</p>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <NavLink 
            to="/dashboard" 
            className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition duration-200 decoration-none cursor-pointer ${
              isActive 
                ? 'bg-[var(--color-bg-card)] text-[var(--color-accent)] border border-[var(--color-border)]' 
                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-card-hover)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            <FiHome className="text-lg" />
            Dashboard
          </NavLink>
          <NavLink 
            to="/log-activity" 
            className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition duration-200 decoration-none cursor-pointer ${
              isActive 
                ? 'bg-[var(--color-bg-card)] text-[var(--color-accent)] border border-[var(--color-border)]' 
                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-card-hover)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            <FiPlusCircle className="text-lg" />
            Log Activity
          </NavLink>
          <NavLink 
            to="/goals" 
            className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition duration-200 decoration-none cursor-pointer ${
              isActive 
                ? 'bg-[var(--color-bg-card)] text-[var(--color-accent)] border border-[var(--color-border)]' 
                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-card-hover)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            <FiTarget className="text-lg" />
            Goals
          </NavLink>
          <NavLink 
            to="/leaderboard" 
            className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition duration-200 decoration-none cursor-pointer ${
              isActive 
                ? 'bg-[var(--color-bg-card)] text-[var(--color-accent)] border border-[var(--color-border)]' 
                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-card-hover)] hover:text-[var(--color-text-primary)]'
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
                  ? 'bg-[var(--color-bg-card)] text-[var(--color-accent)] border border-[var(--color-border)]' 
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-card-hover)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              <FiShield className="text-lg" />
              Org Dashboard
            </NavLink>
          )}
        </nav>

       {/* Sidebar Footer Animation */}

        <div className="mt-auto px-4 pb-4">
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-3 shadow-sm">
                <Lottie
                    animationData={globeAnimation}
                    loop
                    autoplay
                    style={{
                        width: 120,
                        height: 120,
                        margin: "0 auto"
                    }}
                />

                <div className="mt-2 text-center">
                  <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                    Every Action Counts
                  </p>

                  <p className="text-[11px] text-[var(--color-text-secondary)]">
                    Reduce • Reuse • Restore
                  </p>
                </div>
            </div>
        </div>

        <div className="p-4 border-t border-[var(--color-border)]">
          <button 
            onClick={() => setShowConfirmLogout(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-danger)] hover:bg-red-950/20 hover:border-red-900/30 transition-all font-semibold text-xs cursor-pointer bg-transparent"
          >
            <FiLogOut />
            Logout
          </button>
        </div>
      </div>

      {showConfirmLogout && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="glass-card max-w-sm w-full p-6 flex flex-col items-center bg-[var(--color-bg-secondary)] border-[var(--color-border)] shadow-xl animate-fade-in text-[#0f291b]">
            <h4 className="text-md font-bold mb-2 font-outfit">Confirm Logout</h4>
            <p className="text-xs text-[#385846] text-center mb-6 leading-relaxed">
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
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 text-xs rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer border-none"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
