import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { FcGoogle } from 'react-icons/fc';
import { 
  FiArrowRight, 
  FiActivity, 
  FiTrendingUp, 
  FiTarget, 
  FiAward, 
  FiUsers, 
  FiZap,
  FiMenu,
  FiX,
  FiChevronDown,
  FiChevronsDown,
  FiCheckCircle,
  FiMail,
  FiLock,
  FiUser,
  FiEye,
  FiEyeOff,
  FiLoader
} from 'react-icons/fi';

export default function Home() {
  const { isAuthenticated, logout, login, register: signup } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);

  // Auth modal states
  const [authModal, setAuthModal] = useState(null); // 'login' | 'register' | null
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Forms setup
  const { 
    register: loginRegister, 
    handleSubmit: handleLoginSubmit, 
    formState: { errors: loginErrors },
    reset: resetLoginForm
  } = useForm();

  const { 
    register: registerFormRegister, 
    handleSubmit: handleRegisterSubmit, 
    formState: { errors: registerErrors },
    reset: resetRegisterForm
  } = useForm();

  const openModal = (mode) => {
    setAuthModal(mode);
    setShowPassword(false);
    resetLoginForm();
    resetRegisterForm();
  };

  const onLoginSubmit = async (data) => {
    setLoading(true);
    try {
      await login(data);
      toast.success('Logged in successfully!', { toastId: 'login-success' });
      setAuthModal(null);
      resetLoginForm();
      navigate('/dashboard');
    } catch (err) {
      if (!err.response) {
        toast.error('Server is starting up or unreachable. Please try again in a few seconds.');
      } else {
        toast.error(err.response.data?.message || 'Invalid credentials');
      }
    } finally {
      setLoading(false);
    }
  };

  const onRegisterSubmit = async (data) => {
    setLoading(true);
    try {
      await signup(data);
      toast.success('Account created successfully!', { toastId: 'register-success' });
      setAuthModal(null);
      resetRegisterForm();
      navigate('/dashboard');
    } catch (err) {
      if (!err.response) {
        toast.error('Server is starting up or unreachable. Please try again in a few seconds.');
      } else {
        toast.error(err.response.data?.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  // Smooth scroll handler
  const handleScrollTo = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Scroll event listener for changing navbar opacity
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: <FiActivity className="text-3xl text-emerald-600" />,
      title: "Granular Tracking",
      description: "Log daily activities across transport, food, shopping, and home energy. We use IPCC and EPA-certified data to calculate your precise CO₂ equivalent emissions."
    },
    {
      icon: <FiTrendingUp className="text-3xl text-emerald-600" />,
      title: "Interactive Analytics",
      description: "Visualize carbon trends and category distribution through interactive charts. Spot carbon-heavy habits instantly and track your improvements over time."
    },
    {
      icon: <FiTarget className="text-3xl text-emerald-600" />,
      title: "Custom Reductions",
      description: "Define personalized goals and emission milestones. CarbonTrack breaks them down into actionable micro-steps to keep you motivated."
    },
    {
      icon: <FiUsers className="text-3xl text-emerald-600" />,
      title: "Corporate & Community Leagues",
      description: "Join organizations, establish green teams, and compete on community leaderboards. Drive healthy, sustainable competition."
    },
    {
      icon: <FiAward className="text-3xl text-emerald-600" />,
      title: "Gamified Badge System",
      description: "Earn unique badges like the 'Green Commuter Streak' or 'First Step' reward. Collect milestone badges as you build long-lasting habits."
    },
    {
      icon: <FiZap className="text-3xl text-emerald-600" />,
      title: "Smart Recommendations",
      description: "Receive AI-powered, eco-friendly suggestions tailored to your footprint. Cut down emissions efficiently without compromising your quality of life."
    }
  ];

  const steps = [
    {
      num: "01",
      title: "Log Daily Habits",
      desc: "Quickly enter commuting distances, meals consumed, energy sources, or general retail purchases using our optimized logs."
    },
    {
      num: "02",
      title: "Analyze & Compete",
      desc: "Review your footprints instantly. See how your lifestyle ranks against your friends, local community, or your corporate colleagues."
    },
    {
      num: "03",
      title: "Reduce & Earn Badges",
      desc: "Implement tips, set target reduction goals, and earn digital achievements to validate your active contribution to the planet."
    }
  ];

  const faqs = [
    {
      q: "How does CarbonTrack calculate my carbon footprint?",
      a: "CarbonTrack integrates active emission coefficients sourced from the Environmental Protection Agency (EPA 2024) and the Intergovernmental Panel on Climate Change (IPCC AR6). We multiply your entered activity values (e.g. liters of fuel consumed, food type, kWh of electricity) by the matching emission coefficient to produce precise CO₂ equivalent (CO₂e) output."
    },
    {
      q: "Can I use CarbonTrack with my company or organization?",
      a: "Yes! CarbonTrack includes dedicated Organization portals. Corporate admins can establish shared CSR carbon targets, list internal company rankings, and invite employees to join corporate teams to log collective eco-savings."
    },
    {
      q: "Is it possible to track in both Metric and Imperial units?",
      a: "Absolutely. In your User Preferences / Profile, you can instantly toggle your preferred unit system (kilometers vs miles, liters vs gallons, kg vs lbs). The calculations will dynamically translate standard values based on your choice."
    },
    {
      q: "Are the digital badges printable or exportable?",
      a: "Currently, achievements are logged securely in your profile dashboard as dynamic, gamified credentials. We are planning exportable badge certificates and social sharing capabilities in upcoming releases."
    }
  ];

  return (
    <div className="min-h-screen bg-[#f4faf6] text-[#0f291b] font-sans antialiased overflow-x-hidden relative">
      <div className={`transition-all duration-500 \${authModal ? 'blur-[6px] pointer-events-none' : ''}`}>
      
      {/* 1. HEADER / NAVBAR */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 \${
        scrolled 
          ? 'bg-white/80 backdrop-blur-md border-b border-emerald-100/60 py-4 shadow-sm' 
          : 'bg-transparent py-6'
      }`}>
        <div className="max-w-[1440px] mx-auto px-6 sm:px-10 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 decoration-none cursor-pointer">
            <svg viewBox="0 0 100 100" className="w-8 h-8 flex-shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="ringGrad" x1="15" y1="15" x2="85" y2="85" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#4ade80" />
                  <stop offset="50%" stopColor="#16a34a" />
                  <stop offset="100%" stopColor="#15803d" />
                </linearGradient>
                <linearGradient id="leafLeft" x1="45" y1="40" x2="58" y2="75" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#22c55e" />
                  <stop offset="100%" stopColor="#15803d" />
                </linearGradient>
                <linearGradient id="leafRight" x1="58" y1="40" x2="70" y2="75" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#15803d" />
                  <stop offset="100%" stopColor="#14532d" />
                </linearGradient>
              </defs>
              <path d="M 50,14 A 36,36 0 1,1 30,22" stroke="url(#ringGrad)" strokeWidth="7" strokeLinecap="round" />
              <path d="M 41,6 L 54,14 L 41,22 Z" fill="#4ade80" />
              <path d="M 28,34 C 20,48 24,66 38,74 C 30,64 28,50 34,36 C 35,34 32,32 28,34 Z" fill="#166534" />
              <path d="M 37,42 C 31,54 33,68 44,74 C 38,66 36,54 41,43 C 42,41 39,40 37,42 Z" fill="#15803d" />
              <path d="M 49,75 C 44,60 47,44 57,36 C 58,48 56,62 49,75 Z" fill="url(#leafLeft)" />
              <path d="M 49,75 C 56,62 58,48 57,36 C 68,40 73,53 69,67 C 66,73 58,76 49,75 Z" fill="url(#leafRight)" />
              <path d="M 49,75 C 53,62 55,48 57,36" stroke="#bbf7d0" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span className="text-xl font-extrabold tracking-tight font-outfit text-[#0f291b] transition-colors">
              Carbon<span className="text-emerald-600">Track</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <button 
              onClick={() => handleScrollTo('features')}
              className="text-[#385846] hover:text-emerald-700 transition-colors cursor-pointer bg-transparent border-none outline-none"
            >
              Features
            </button>
            <button 
              onClick={() => handleScrollTo('how-it-works')}
              className="text-[#385846] hover:text-emerald-700 transition-colors cursor-pointer bg-transparent border-none outline-none"
            >
              How It Works
            </button>
            <button 
              onClick={() => handleScrollTo('impact')}
              className="text-[#385846] hover:text-emerald-700 transition-colors cursor-pointer bg-transparent border-none outline-none"
            >
              Our Impact
            </button>
            <button 
              onClick={() => handleScrollTo('faqs')}
              className="text-[#385846] hover:text-emerald-700 transition-colors cursor-pointer bg-transparent border-none outline-none"
            >
              FAQs
            </button>
          </nav>

          {/* Auth Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="px-4 py-2 text-sm font-semibold text-emerald-700 hover:text-emerald-950 transition-colors decoration-none">
                  Dashboard
                </Link>
                <button 
                  onClick={() => { logout(); navigate('/'); }}
                  className="px-4 py-2 text-sm font-semibold rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 hover:border-emerald-300 transition cursor-pointer"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => openModal('login')} 
                  className="px-4 py-2 text-sm font-semibold text-[#385846] hover:text-emerald-700 transition-colors bg-transparent border-none cursor-pointer"
                >
                  Log In
                </button>
                <button 
                  onClick={() => openModal('register')} 
                  className="px-5 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-500 hover:to-green-600 text-white shadow-[0_4px_20px_rgba(16,185,129,0.15)] hover:shadow-[0_4px_20px_rgba(16,185,129,0.25)] transition transform hover:-translate-y-0.5 border-none cursor-pointer"
                >
                  Get Started
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-2xl text-[#a3b8aa] hover:text-white cursor-pointer bg-transparent border-none outline-none"
          >
            {mobileMenuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-md border-b border-emerald-100/80 px-6 py-6 flex flex-col gap-5 shadow-2xl fade-in animate-slide-down">
            <button 
              onClick={() => handleScrollTo('features')}
              className="text-left text-[#385846] hover:text-emerald-700 text-base py-1.5 font-medium bg-transparent border-none outline-none cursor-pointer"
            >
              Features
            </button>
            <button 
              onClick={() => handleScrollTo('how-it-works')}
              className="text-left text-[#385846] hover:text-emerald-700 text-base py-1.5 font-medium bg-transparent border-none outline-none cursor-pointer"
            >
              How It Works
            </button>
            <button 
              onClick={() => handleScrollTo('impact')}
              className="text-left text-[#385846] hover:text-emerald-700 text-base py-1.5 font-medium bg-transparent border-none outline-none cursor-pointer"
            >
              Our Impact
            </button>
            <button 
              onClick={() => handleScrollTo('faqs')}
              className="text-left text-[#385846] hover:text-emerald-700 text-base py-1.5 font-medium bg-transparent border-none outline-none cursor-pointer"
            >
              FAQs
            </button>

            <hr className="border-emerald-100/60 my-1" />

            <div className="flex flex-col gap-3">
              {isAuthenticated ? (
                <>
                  <Link 
                    to="/dashboard" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 rounded-lg bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200 decoration-none"
                  >
                    Dashboard
                  </Link>
                  <button 
                    onClick={() => { logout(); setMobileMenuOpen(false); navigate('/'); }}
                    className="w-full py-2.5 rounded-lg bg-[#f4faf6] text-emerald-700 font-semibold border border-emerald-200 cursor-pointer"
                  >
                    Log Out
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => { openModal('login'); setMobileMenuOpen(false); }}
                    className="w-full text-center py-2.5 text-[#385846] hover:text-emerald-700 font-semibold cursor-pointer bg-transparent border-none"
                  >
                    Log In
                  </button>
                  <button 
                    onClick={() => { openModal('register'); setMobileMenuOpen(false); }}
                    className="w-full text-center py-2.5 rounded-lg bg-gradient-to-r from-emerald-600 to-green-700 text-white font-semibold shadow-lg cursor-pointer border-none"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* 2. HERO SECTION WITH LOOPING BACKGROUND VIDEO */}
      <section className="relative min-h-screen flex items-center justify-start pt-24 pb-12 overflow-hidden">
        
        {/* Background Video (High Visibility) */}
        <video 
          src="/windmill.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0 filter brightness-[0.95] contrast-[1.02]"
        />

        {/* Subtle, soft light horizontal gradient overlay (legible text on left, clear video on right) */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#f4faf6]/95 via-[#f4faf6]/60 to-transparent z-10" />

        {/* Hero Content (Left Aligned for high video visibility) */}
        <div className="relative z-20 max-w-[1440px] mx-auto px-8 sm:px-10 w-full flex items-center justify-start">
          <div className="max-w-2xl text-left flex flex-col items-start animate-fade-in">
            
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-200 text-xs font-semibold text-emerald-800 mb-6 tracking-wider uppercase shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Empowering Green Innovation
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight font-outfit text-[#0f291b] leading-tight mb-6">
              Shrink Your Footprint,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700">
                Grow Your Eco Legacy
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[#385846] max-w-xl mb-8 leading-relaxed font-medium">
              Track daily activities, challenge communities, and hit reduction targets. 
              CarbonTrack converts routines into green action logs using scientific global factors.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              {isAuthenticated ? (
                <Link 
                  to="/dashboard" 
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-500 hover:to-green-600 text-white font-bold text-base shadow-lg transition transform hover:-translate-y-1 flex items-center justify-center gap-2 decoration-none"
                >
                  Go to Dashboard <FiArrowRight />
                </Link>
              ) : (
                <>
                  <button 
                    onClick={() => openModal('register')}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-500 hover:to-green-600 text-white font-bold text-base shadow-lg transition transform hover:-translate-y-1 flex items-center justify-center gap-2 cursor-pointer border-none"
                  >
                    Start Tracking <FiArrowRight />
                  </button>
                  <button 
                    onClick={() => handleScrollTo('features')}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white/80 hover:bg-emerald-50 text-emerald-800 font-bold text-base border border-emerald-250 transition cursor-pointer shadow-sm"
                  >
                    Explore Features
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex flex-col items-center gap-1 opacity-60 hover:opacity-100 transition-opacity">
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#385846]">Scroll Down</span>
          <FiChevronsDown className="text-2xl text-emerald-600 animate-bounce" />
        </div>
      </section>

      {/* 3. KEY STATS / DYNAMIC IMPACT */}
      <section id="impact" className="relative py-20 bg-white border-y border-emerald-100/60 shadow-sm animate-fade-in">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card bg-[#f4faf6]/40 border-emerald-100/70 px-8 py-10 rounded-2xl text-center flex flex-col items-center">
              <span className="text-4xl sm:text-5xl font-extrabold text-emerald-800 font-outfit mb-3">124,500+</span>
              <span className="text-emerald-600 text-sm font-bold tracking-wider uppercase mb-2">Tons of CO₂e Prevented</span>
              <p className="text-xs text-[#708b7b]">Calculated using EPA carbon coefficients against verified user logs.</p>
            </div>
            <div className="glass-card bg-[#f4faf6]/40 border-emerald-100/70 px-8 py-10 rounded-2xl text-center flex flex-col items-center">
              <span className="text-4xl sm:text-5xl font-extrabold text-emerald-800 font-outfit mb-3">48,000+</span>
              <span className="text-emerald-600 text-sm font-bold tracking-wider uppercase mb-2">Eco-Changers Active</span>
              <p className="text-xs text-[#708b7b]">Individuals and professionals working collectively to live sustainably.</p>
            </div>
            <div className="glass-card bg-[#f4faf6]/40 border-emerald-100/70 px-8 py-10 rounded-2xl text-center flex flex-col items-center">
              <span className="text-4xl sm:text-5xl font-extrabold text-emerald-800 font-outfit mb-3">150+</span>
              <span className="text-emerald-600 text-sm font-bold tracking-wider uppercase mb-2">Corporate Partners</span>
              <p className="text-xs text-[#708b7b]">Companies utilizing CSR portals to track, align and incentivize teams.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FEATURES GRID */}
      <section id="features" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-emerald-700 tracking-widest uppercase mb-3">Core Capabilities</h2>
            <h3 className="text-3xl sm:text-4xl font-bold font-outfit text-[#0f291b] mb-6">Designed to simplify climate responsibility</h3>
            <p className="text-base text-[#385846] leading-relaxed">
              We make tracking your environmental footprint simple, engaging, and community-driven. Explore features customized for personal and organizational change.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feat, idx) => (
              <div 
                key={idx} 
                className="glass-card bg-white border border-emerald-100/80 p-8 rounded-2xl hover:border-emerald-300/80 hover:shadow-lg transition duration-300 group flex flex-col"
              >
                <div className="p-3 bg-[#f4faf6] rounded-xl w-fit mb-6 group-hover:scale-110 transition duration-300 border border-emerald-100/50">
                  {feat.icon}
                </div>
                <h4 className="text-lg font-bold font-outfit text-[#0f291b] mb-3">{feat.title}</h4>
                <p className="text-sm text-[#385846] leading-relaxed flex-grow">{feat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. PROCESS SECTION (HOW IT WORKS) */}
      <section id="how-it-works" className="py-24 bg-white border-y border-emerald-100/60 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-emerald-700 tracking-widest uppercase mb-3">Simple Process</h2>
            <h3 className="text-3xl sm:text-4xl font-bold font-outfit text-[#0f291b] mb-6">How CarbonTrack Works</h3>
            <p className="text-base text-[#385846] leading-relaxed">
              Three seamless steps stand between you and an optimized, carbon-reduced life.
            </p>
          </div>

          <div className="relative">
            {/* Connection Line */}
            <div className="hidden lg:block absolute top-[32px] left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-emerald-100 via-emerald-300 to-emerald-100 z-0" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative z-10">
              {steps.map((step, idx) => (
                <div key={idx} className="flex flex-col items-center text-center px-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#f4faf6] border border-emerald-200 text-emerald-800 font-extrabold text-xl mb-6 shadow-md relative group hover:border-emerald-400 hover:bg-emerald-50 transition duration-300 flex items-center justify-center">
                    {step.num}
                  </div>
                  <h4 className="text-lg font-bold font-outfit text-[#0f291b] mb-3">{step.title}</h4>
                  <p className="text-sm text-[#385846] leading-relaxed max-w-sm">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. FAQS SECTION */}
      <section id="faqs" className="py-24 relative">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-xs font-bold text-emerald-700 tracking-widest uppercase mb-3">Got Questions?</h2>
            <h3 className="text-3xl sm:text-4xl font-bold font-outfit text-[#0f291b]">Frequently Asked</h3>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div 
                key={idx} 
                className="bg-white border border-emerald-100/80 rounded-xl overflow-hidden transition-all duration-300 shadow-sm"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-6 text-left text-[#0f291b] font-bold font-outfit hover:text-emerald-700 transition cursor-pointer bg-transparent border-none outline-none"
                >
                  <span className="text-base sm:text-lg pr-4">{faq.q}</span>
                  <FiChevronDown className={`text-xl text-[#708b7b] transition-transform duration-300 \${activeFaq === idx ? 'transform rotate-180 text-emerald-600' : ''}`} />
                </button>
                <div className={`transition-all duration-300 ease-in-out overflow-hidden \${
                  activeFaq === idx ? 'max-h-72 border-t border-emerald-100/60' : 'max-h-0'
                }`}>
                  <p className="p-6 text-sm text-[#385846] leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* 8. FOOTER */}
      <footer className="py-10 bg-white border-t border-emerald-100/60 text-[#708b7b] text-sm">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 100 100" className="w-8 h-8 flex-shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="ringGradFooter" x1="15" y1="15" x2="85" y2="85" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#4ade80" />
                  <stop offset="50%" stopColor="#16a34a" />
                  <stop offset="100%" stopColor="#15803d" />
                </linearGradient>
                <linearGradient id="leafLeftFooter" x1="45" y1="40" x2="58" y2="75" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#22c55e" />
                  <stop offset="100%" stopColor="#15803d" />
                </linearGradient>
                <linearGradient id="leafRightFooter" x1="58" y1="40" x2="70" y2="75" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#15803d" />
                  <stop offset="100%" stopColor="#14532d" />
                </linearGradient>
              </defs>
              <path d="M 50,14 A 36,36 0 1,1 30,22" stroke="url(#ringGradFooter)" strokeWidth="7" strokeLinecap="round" />
              <path d="M 41,6 L 54,14 L 41,22 Z" fill="#4ade80" />
              <path d="M 28,34 C 20,48 24,66 38,74 C 30,64 28,50 34,36 C 35,34 32,32 28,34 Z" fill="#166534" />
              <path d="M 37,42 C 31,54 33,68 44,74 C 38,66 36,54 41,43 C 42,41 39,40 37,42 Z" fill="#15803d" />
              <path d="M 49,75 C 44,60 47,44 57,36 C 58,48 56,62 49,75 Z" fill="url(#leafLeftFooter)" />
              <path d="M 49,75 C 56,62 58,48 57,36 C 68,40 73,53 69,67 C 66,73 58,76 49,75 Z" fill="url(#leafRightFooter)" />
              <path d="M 49,75 C 53,62 55,48 57,36" stroke="#bbf7d0" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span className="font-extrabold font-outfit text-[#0f291b]">Carbon<span className="text-emerald-600">Track</span></span>
          </div>
          <p>© {new Date().getFullYear()} CarbonTrack. All rights reserved. Built for global sustainability.</p>
          <div className="flex gap-6">
            <span className="hover:text-emerald-700 cursor-pointer transition">Privacy Policy</span>
            <span className="hover:text-emerald-700 cursor-pointer transition">Terms of Service</span>
          </div>
        </div>
      </footer>
      </div>

      {/* AUTH POPUP MODAL */}
      {authModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setAuthModal(null);
          }}
        >
          <div className="relative w-full max-w-md bg-white border border-emerald-100/80 p-8 rounded-2xl shadow-2xl overflow-hidden text-[#0f291b] z-55">
            
            {/* Close Button */}
            <button 
              onClick={() => setAuthModal(null)}
              className="absolute right-4 top-4 text-[#708b7b] hover:text-emerald-700 transition-colors cursor-pointer bg-transparent border-none outline-none"
            >
              <FiX className="text-xl" />
            </button>

            {/* Glowing accents inside modal */}
            <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-emerald-500/5 opacity-30 blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-emerald-600/5 opacity-30 blur-3xl pointer-events-none"></div>

            {authModal === 'login' ? (
              /* LOGIN VIEW */
              <>
                <div className="text-center mb-8">
                  <h3 className="text-3xl font-bold font-outfit text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-600">
                    Welcome Back
                  </h3>
                  <p className="text-xs text-[#385846] mt-1.5">Enter credentials to access your dashboard</p>
                </div>

                <form onSubmit={handleLoginSubmit(onLoginSubmit)} className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#385846] mb-1.5">Username or Email</label>
                    <div className="relative">
                      <FiMail className="absolute left-3.5 top-3.5 text-emerald-600" />
                      <input 
                        type="text" 
                        placeholder="eco_user" 
                        className="w-full bg-white border border-emerald-250 focus:border-emerald-600 rounded-xl py-3 pl-11 pr-4 text-sm outline-none text-[#0f291b] transition-colors"
                        {...loginRegister('usernameOrEmail', { required: 'Username or email is required' })}
                      />
                    </div>
                    {loginErrors.usernameOrEmail && <p className="text-red-500 text-xs mt-1">{loginErrors.usernameOrEmail.message}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#385846] mb-1.5">Password</label>
                    <div className="relative">
                      <FiLock className="absolute left-3.5 top-3.5 text-emerald-600" />
                      <input 
                        type={showPassword ? 'text' : 'password'} 
                        placeholder="••••••••" 
                        className="w-full bg-white border border-emerald-250 focus:border-emerald-600 rounded-xl py-3 pl-11 pr-11 text-sm outline-none text-[#0f291b] transition-colors"
                        {...loginRegister('password', { required: 'Password is required' })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3 text-[#708b7b] hover:text-[#0f291b] transition-colors focus:outline-none cursor-pointer bg-transparent border-none"
                      >
                        {showPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                    {loginErrors.password && <p className="text-red-500 text-xs mt-1">{loginErrors.password.message}</p>}
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading} 
                    className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-500 hover:to-green-600 text-white font-bold text-sm shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2 cursor-pointer border-none"
                  >
                    {loading ? <FiLoader className="animate-spin text-lg" /> : 'Log In'}
                  </button>
                </form>

                <div className="flex items-center my-6">
                  <div className="flex-1 border-t border-emerald-100"></div>
                  <span className="px-3 text-[10px] text-[#708b7b] font-semibold uppercase tracking-widest">Or</span>
                  <div className="flex-1 border-t border-emerald-100"></div>
                </div>

                <button
                  type="button"
                  onClick={() => window.location.href = '/oauth2/authorization/google'}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-white hover:bg-emerald-50/50 text-[#0f291b] border border-emerald-250 hover:border-emerald-350 font-semibold text-sm transition-all rounded-xl cursor-pointer"
                >
                  <FcGoogle className="text-lg" />
                  Continue with Google
                </button>

                <div className="text-center mt-6">
                  <p className="text-xs text-[#385846]">
                    Don't have an account?{' '}
                    <button 
                      onClick={() => openModal('register')}
                      className="text-emerald-700 font-bold hover:text-emerald-800 hover:underline bg-transparent border-none cursor-pointer p-0 ml-1"
                    >
                      Register Here
                    </button>
                  </p>
                </div>
              </>
            ) : (
              /* REGISTER VIEW */
              <>
                <div className="text-center mb-6">
                  <h3 className="text-3xl font-bold font-outfit text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-600">
                    Create Account
                  </h3>
                  <p className="text-xs text-[#385846] mt-1.5">Join CarbonTrack to log activities and save CO₂</p>
                </div>

                <form onSubmit={handleRegisterSubmit(onRegisterSubmit)} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#385846] mb-1.5">Username</label>
                    <div className="relative">
                      <FiUser className="absolute left-3.5 top-3.5 text-emerald-600" />
                      <input 
                        type="text" 
                        placeholder="eco_warrior" 
                        className="w-full bg-white border border-emerald-250 focus:border-emerald-600 rounded-xl py-3 pl-11 pr-4 text-sm outline-none text-[#0f291b] transition-colors"
                        {...registerFormRegister('username', { required: 'Username is required' })}
                      />
                    </div>
                    {registerErrors.username && <p className="text-red-500 text-xs mt-1">{registerErrors.username.message}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#385846] mb-1.5">Email Address</label>
                    <div className="relative">
                      <FiMail className="absolute left-3.5 top-3.5 text-emerald-600" />
                      <input 
                        type="email" 
                        placeholder="email@example.com" 
                        className="w-full bg-white border border-emerald-250 focus:border-emerald-600 rounded-xl py-3 pl-11 pr-4 text-sm outline-none text-[#0f291b] transition-colors"
                        {...registerFormRegister('email', { 
                          required: 'Email is required',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Invalid email address'
                          }
                        })}
                      />
                    </div>
                    {registerErrors.email && <p className="text-red-500 text-xs mt-1">{registerErrors.email.message}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#385846] mb-1.5">Password</label>
                    <div className="relative">
                      <FiLock className="absolute left-3.5 top-3.5 text-emerald-600" />
                      <input 
                        type={showPassword ? 'text' : 'password'} 
                        placeholder="••••••••" 
                        className="w-full bg-white border border-emerald-250 focus:border-emerald-600 rounded-xl py-3 pl-11 pr-11 text-sm outline-none text-[#0f291b] transition-colors"
                        {...registerFormRegister('password', { 
                          required: 'Password is required',
                          minLength: { value: 8, message: 'Password must be at least 8 characters' }
                        })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3 text-[#708b7b] hover:text-[#0f291b] transition-colors focus:outline-none cursor-pointer bg-transparent border-none"
                      >
                        {showPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                    {registerErrors.password && <p className="text-red-500 text-xs mt-1">{registerErrors.password.message}</p>}
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading} 
                    className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-500 hover:to-green-600 text-white font-bold text-sm shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2 cursor-pointer border-none"
                  >
                    {loading ? <FiLoader className="animate-spin text-lg" /> : 'Register'}
                  </button>
                </form>

                <div className="flex items-center my-5">
                  <div className="flex-1 border-t border-emerald-100"></div>
                  <span className="px-3 text-[10px] text-[#708b7b] font-semibold uppercase tracking-widest">Or</span>
                  <div className="flex-1 border-t border-emerald-100"></div>
                </div>

                <button
                  type="button"
                  onClick={() => window.location.href = '/oauth2/authorization/google'}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-white hover:bg-emerald-50/50 text-[#0f291b] border border-emerald-250 hover:border-emerald-350 font-semibold text-sm transition-all rounded-xl cursor-pointer"
                >
                  <FcGoogle className="text-lg" />
                  Continue with Google
                </button>

                <div className="text-center mt-5">
                  <p className="text-xs text-[#385846]">
                    Already have an account?{' '}
                    <button 
                      onClick={() => openModal('login')}
                      className="text-emerald-700 font-bold hover:text-emerald-800 hover:underline bg-transparent border-none cursor-pointer p-0 ml-1"
                    >
                      Log In
                    </button>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
