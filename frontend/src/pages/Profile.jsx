import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { profileService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FiUser, FiEye, FiLoader, FiCamera, FiUpload, FiTrash2, FiAward } from 'react-icons/fi';

const ALL_BADGES = [
  { name: 'First Log', icon: '🚀🌱', desc: 'Log your very first carbon activity on the platform' },
  { name: 'First Step', icon: '👣✨', desc: 'Successfully achieve your first carbon reduction goal' },
  { name: 'Carbon Saver 10', icon: '🌱🔋', desc: 'Reduce cumulative footprint by 10 kg CO₂e' },
  { name: 'Carbon Saver 25', icon: '🌲🌳', desc: 'Reduce cumulative footprint by 25 kg CO₂e' },
  { name: 'Carbon Saver 50', icon: '🌎🛡️', desc: 'Reduce cumulative footprint by 50 kg CO₂e' },
  { name: 'Green Commuter', icon: '🚗🌱', desc: 'Log transit activities for 7 days in a row' },
  { name: 'Eco Warrior', icon: '🚴🌲', desc: 'Log transit activities for 15 days in a row' },
  { name: 'Planet Protector', icon: '👑🌍', desc: 'Log transit activities for 30 days in a row' },
];

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState(null);
  const [earnedBadges, setEarnedBadges] = useState([]);
  
  const { updateUser } = useAuth();
  const { register, handleSubmit, reset, watch } = useForm();
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const watchedUsername = watch('username', '');

  useEffect(() => {
    async function loadProfile() {
      try {
        const profile = await profileService.getProfile();
        reset({
          username: profile.username,
          goalVisibility: profile.goalVisibility,
          selectedBadge: profile.selectedBadge || '',
        });
        setProfilePhoto(profile.profilePhoto || null);
        setEarnedBadges(profile.badges || []);
      } catch (err) {
        toast.error('Failed to load profile details');
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [reset]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File size exceeds 2MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setProfilePhoto(uploadEvent.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
         video: { width: 400, height: 400, facingMode: 'user' } 
      });
      setStream(mediaStream);
      setCameraActive(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 100);
    } catch (err) {
      console.error(err);
      toast.error('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setStream(null);
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setProfilePhoto(dataUrl);
      stopCamera();
    }
  };

  const removePhoto = () => {
    setProfilePhoto(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = async (formData) => {
    setUpdating(true);
    try {
      const payload = {
        username: formData.username,
        goalVisibility: formData.goalVisibility,
        profilePhoto: profilePhoto || "",
        selectedBadge: formData.selectedBadge,
      };
      const updated = await profileService.updateProfile(payload);
      updateUser(updated);
      setEarnedBadges(updated.badges || []);
      toast.success('Sustainability profile updated successfully!');
    } catch (err) {
      if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error('Failed to update preferences');
      }
    } finally {
      setUpdating(false);
    }
  };

  // Compute user level based on earned badges
  const getLevelDetails = () => {
    let levelNum = 1;
    let title = 'Green Novice';
    let progress = 15;
    let nextMilestone = 'Log your first carbon activity to reach Level 2';
    
    if (earnedBadges.includes('First Log')) {
      levelNum = 2;
      title = 'Eco Starter';
      progress = 30;
      nextMilestone = 'Achieve your first goal to reach Level 3';
    }
    if (earnedBadges.includes('First Step')) {
      levelNum = 3;
      title = 'Carbon Saver';
      progress = 50;
      nextMilestone = 'Reduce 10 kg carbon to reach Level 4';
    }
    if (earnedBadges.includes('Carbon Saver 10')) {
      levelNum = 4;
      title = 'Sustainability Champ';
      progress = 65;
      nextMilestone = 'Reduce 25 kg carbon to reach Level 5';
    }
    if (earnedBadges.includes('Carbon Saver 25')) {
      levelNum = 5;
      title = 'Climate Advocate';
      progress = 85;
      nextMilestone = 'Reduce 50 kg carbon to reach Level 6';
    }
    if (earnedBadges.includes('Carbon Saver 50')) {
      levelNum = 6;
      title = 'Climate Hero';
      progress = 100;
      nextMilestone = 'Maximum level achieved!';
    }
    return { levelNum, title, progress, nextMilestone };
  };

  const levelInfo = getLevelDetails();

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto h-96 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl animate-pulse"></div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 fade-in pb-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Level and form */}
        <div className="md:col-span-1 space-y-6">
          
          {/* Level Progress Card */}
          <div className="glass-card p-6 relative overflow-hidden shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)]">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--color-accent)]/5 rounded-full blur-2xl -mr-6 -mt-6"></div>
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] uppercase font-extrabold px-2.5 py-1 rounded-full bg-[var(--color-accent-dim)] text-[var(--color-accent)] tracking-wider">
                  Level {levelInfo.levelNum}
                </span>
                <span className="text-2xl">🌱</span>
              </div>
              <h4 className="text-base font-bold font-outfit text-[var(--color-text-primary)]">{levelInfo.title}</h4>
              <p className="text-[10px] text-[var(--color-text-muted)] mt-1 leading-normal">{levelInfo.nextMilestone}</p>
            </div>
            
            <div className="mt-6">
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200/50 shadow-inner">
                <div 
                  className="bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-blue)] h-full transition-all duration-500" 
                  style={{ width: `${levelInfo.progress}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[9px] text-[var(--color-text-muted)] font-bold mt-2.5 uppercase tracking-wider">
                <span>Novice</span>
                <span>Hero</span>
              </div>
            </div>
          </div>

          {/* Preferences Card */}
          <div className="glass-card p-6 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)]">
            <div className="flex items-center gap-2 mb-4 text-[var(--color-text-primary)]">
              <FiUser className="text-lg text-[var(--color-accent)]" />
              <h3 className="text-sm font-bold tracking-wide uppercase font-outfit">Preferences</h3>
            </div>

            {/* Profile Avatar Section */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative">
                {/* Avatar Circle */}
                <div className="w-24 h-24 rounded-full bg-slate-50 border border-slate-200/60 flex items-center justify-center overflow-hidden shadow-sm relative">
                  {profilePhoto ? (
                    <img 
                      src={profilePhoto} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FiUser className="text-slate-300 text-3xl" />
                  )}
                </div>

                {/* Trash Bin / Remove Photo */}
                {profilePhoto && (
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-100 border border-red-200 text-red-600 hover:bg-red-200 flex items-center justify-center shadow-sm cursor-pointer transition duration-200"
                    title="Remove photo"
                  >
                    <FiTrash2 className="text-[10px]" />
                  </button>
                )}

                {/* Floating Action Buttons */}
                <div className="absolute bottom-0 right-0 flex gap-1 translate-x-2 translate-y-1">
                  {/* Upload image */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-8 h-8 rounded-full bg-emerald-800 hover:bg-emerald-900 text-white flex items-center justify-center shadow-md border-2 border-white cursor-pointer transition duration-200"
                    title="Upload image file"
                  >
                    <FiCamera className="text-xs" />
                  </button>
                  
                  {/* Live camera */}
                  <button
                    type="button"
                    onClick={startCamera}
                    className="w-8 h-8 rounded-full bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-center shadow-md border-2 border-white cursor-pointer transition duration-200"
                    title="Use camera stream"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <p className="text-[10px] text-[var(--color-text-muted)] font-bold mt-4 tracking-wider uppercase">
                Upload image or use camera
              </p>

              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept="image/*" 
                className="hidden" 
              />
              <canvas ref={canvasRef} style={{ display: 'none' }} width="400" height="400" />
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="label">Username</label>
                <input 
                  type="text" 
                  className="input-field py-2 text-xs"
                  {...register('username', { required: 'Username is required' })}
                />
              </div>

              <div>
                <label className="label flex items-center gap-1">
                  <FiEye className="text-2xs shrink-0" />
                  Visibility
                </label>
                <select 
                  className="input-field py-2 text-xs"
                  {...register('goalVisibility')}
                >
                  <option value="PRIVATE" className="bg-[var(--color-bg-secondary)]">Private</option>
                  <option value="LEADERBOARD" className="bg-[var(--color-bg-secondary)]">Leaderboard</option>
                  <option value="PUBLIC" className="bg-[var(--color-bg-secondary)]">Public</option>
                </select>
              </div>

              <div>
                <label className="label flex items-center gap-1">
                  <FiAward className="text-2xs shrink-0" />
                  Featured Badge
                </label>
                <select 
                  className="input-field py-2 text-xs"
                  {...register('selectedBadge')}
                >
                  <option value="" className="bg-[var(--color-bg-secondary)]">None</option>
                  {earnedBadges.map((badge) => (
                    <option key={badge} value={badge} className="bg-[var(--color-bg-secondary)]">
                      {badge}
                    </option>
                  ))}
                </select>
              </div>

              <button type="submit" disabled={updating} className="w-full btn-primary flex items-center justify-center gap-2 py-2 text-xs mt-2">
                {updating ? <FiLoader className="animate-spin" /> : 'Save Profile'}
              </button>
            </form>
          </div>

        </div>

        {/* Right Column: Badges Grid */}
        <div className="md:col-span-2">
          <div className="glass-card p-6 h-full shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)]">
            <h4 className="text-sm font-bold tracking-wide uppercase text-[var(--color-text-secondary)] mb-6 flex items-center gap-1.5">
              <FiAward className="text-[var(--color-accent)] text-lg" />
              Sustainability Badges & Achievements
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {ALL_BADGES.map((item) => {
                const isEarned = earnedBadges.includes(item.name);
                return (
                  <div 
                    key={item.name} 
                    className={`p-4 border rounded-2xl flex flex-col justify-between items-center text-center transition-all duration-300 ${
                      isEarned 
                        ? 'bg-[var(--color-bg-card)] border-[var(--color-accent)]/20 shadow-[0_10px_30px_-10px_rgba(16,185,129,0.08)] hover:-translate-y-0.5' 
                        : 'bg-slate-50 border-slate-200/50 opacity-40 grayscale border-dashed shadow-none hover:translate-y-0'
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-3xl mb-2.5 filter drop-shadow-sm">{item.icon}</span>
                      <h5 className="font-bold text-xs text-[var(--color-text-primary)]">{item.name}</h5>
                      <p className="text-[10px] text-[var(--color-text-muted)] mt-1.5 leading-relaxed">{item.desc}</p>
                    </div>
                    <span className={`text-[8px] uppercase font-extrabold mt-4 px-2 py-0.5 rounded-full tracking-wider ${
                      isEarned ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {isEarned ? 'Unlocked' : 'Locked'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* Camera Capture Modal */}
      {cameraActive && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card max-w-sm w-full p-6 flex flex-col items-center bg-[var(--color-bg-secondary)] border-[var(--color-border)] shadow-xl">
            <h4 className="text-md font-bold text-[var(--color-text-primary)] mb-4 font-outfit">Capture Profile Photo</h4>
            <div className="w-64 h-64 rounded-full overflow-hidden border-4 border-[var(--color-accent)] relative bg-black flex items-center justify-center">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover transform -scale-x-100" 
              />
            </div>
            <div className="flex gap-4 mt-6 w-full">
              <button
                type="button"
                onClick={stopCamera}
                className="flex-1 btn-ghost py-2 border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={capturePhoto}
                className="flex-1 btn-primary py-2 text-xs text-white rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FiCamera />
                Snap Photo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
