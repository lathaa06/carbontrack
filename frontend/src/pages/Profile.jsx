import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { profileService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FiUser, FiGlobe, FiEye, FiLoader, FiCamera, FiUpload, FiTrash2 } from 'react-icons/fi';

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState(null);
  
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
          preferredUnitSystem: profile.preferredUnitSystem,
          goalVisibility: profile.goalVisibility,
        });
        setProfilePhoto(profile.profilePhoto || null);
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
      // Wait for React to mount the video element before setting srcObject
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
      
      // Draw circular crop or square snapshot
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
        preferredUnitSystem: formData.preferredUnitSystem,
        goalVisibility: formData.goalVisibility,
        profilePhoto: profilePhoto
      };
      const updated = await profileService.updateProfile(payload);
      updateUser(updated);
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

  if (loading) {
    return (
      <div className="max-w-md mx-auto h-96 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl animate-pulse"></div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-6 fade-in pb-12">
      <div className="glass-card p-8">
        <div className="flex items-center gap-3 mb-6 text-[var(--color-text-primary)]">
          <FiUser className="text-2xl text-[var(--color-accent)]" />
          <h3 className="text-xl font-bold font-outfit">User Profile</h3>
        </div>

        {/* Profile Avatar Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative group">
            {profilePhoto ? (
              <img 
                src={profilePhoto} 
                alt="Profile Preview" 
                className="w-24 h-24 rounded-full object-cover border-2 border-[var(--color-accent)] shadow-md"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-[var(--color-accent-dim)] border-2 border-[var(--color-border)] flex items-center justify-center font-bold text-[var(--color-accent)] text-3xl uppercase">
                {(watchedUsername || 'U').substring(0, 2)}
              </div>
            )}
            {profilePhoto && (
              <button
                type="button"
                onClick={removePhoto}
                className="absolute -top-1 -right-1 p-1.5 bg-red-100 border border-red-200 text-red-600 rounded-full hover:bg-red-200 hover:text-red-700 transition shadow-sm cursor-pointer"
                title="Remove photo"
              >
                <FiTrash2 className="text-xs" />
              </button>
            )}
          </div>

          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn-ghost flex items-center gap-1.5 py-1.5 px-3 text-xs border-[var(--color-border)] hover:bg-[var(--color-bg-primary)] rounded-lg transition"
            >
              <FiUpload />
              Upload Image
            </button>
            <button
              type="button"
              onClick={startCamera}
              className="btn-ghost flex items-center gap-1.5 py-1.5 px-3 text-xs border-[var(--color-border)] hover:bg-[var(--color-bg-primary)] rounded-lg transition"
            >
              <FiCamera />
              Take Photo
            </button>
          </div>

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept="image/*" 
            className="hidden" 
          />
          <canvas ref={canvasRef} style={{ display: 'none' }} width="400" height="400" />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Username Input Field */}
          <div>
            <label className="label flex items-center gap-1.5">
              Username
            </label>
            <input 
              type="text" 
              placeholder="username" 
              className="input-field"
              {...register('username', { required: 'Username is required' })}
            />
            <p className="text-[10px] text-[var(--color-text-muted)] mt-1.5">
              Must be unique. Changing this updates your community nickname.
            </p>
          </div>

          <div>
            <label className="label flex items-center gap-1.5">
              <FiGlobe />
              Preferred Unit System
            </label>
            <select 
              className="input-field"
              {...register('preferredUnitSystem')}
            >
              <option value="METRIC" className="bg-[var(--color-bg-secondary)]">Metric (km, kg, servings)</option>
              <option value="IMPERIAL" className="bg-[var(--color-bg-secondary)]">Imperial (miles, lbs, servings)</option>
            </select>
            <p className="text-[10px] text-[var(--color-text-muted)] mt-1.5">
              Determines how quantity values are displayed across logging forms.
            </p>
          </div>

          <div>
            <label className="label flex items-center gap-1.5">
              <FiEye />
              Goal Visibility
            </label>
            <select 
              className="input-field"
              {...register('goalVisibility')}
            >
              <option value="PRIVATE" className="bg-[var(--color-bg-secondary)]">Private (Visible only to you)</option>
              <option value="LEADERBOARD" className="bg-[var(--color-bg-secondary)]">Leaderboard (Pseudonymous entry)</option>
              <option value="PUBLIC" className="bg-[var(--color-bg-secondary)]">Public (Full name shared)</option>
            </select>
            <p className="text-[10px] text-[var(--color-text-muted)] mt-1.5">
              Controls whether you are displayed in the community leaderboard ranking.
            </p>
          </div>

          <button type="submit" disabled={updating} className="w-full btn-primary flex items-center justify-center gap-2 mt-2">
            {updating ? <FiLoader className="animate-spin" /> : 'Save Profile'}
          </button>
        </form>
      </div>

      {/* Camera Capture Modal */}
      {cameraActive && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card max-w-sm w-full p-6 flex flex-col items-center bg-[var(--color-bg-secondary)] border-[var(--color-border)] shadow-xl animate-pulse-once">
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
                className="flex-1 btn-ghost py-2 border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={capturePhoto}
                className="flex-1 btn-primary py-2 text-xs text-white rounded-lg flex items-center justify-center gap-1.5"
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
