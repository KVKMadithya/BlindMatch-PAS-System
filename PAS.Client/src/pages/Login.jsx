import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [colorIndex, setColorIndex] = useState(0);

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: '' });

  const glowColors = [
    'from-indigo-600/40',
    'from-emerald-600/40',
    'from-rose-600/40',
    'from-blue-600/40'
  ];

  const handleBackgroundClick = () => {
    setColorIndex((prevIndex) => (prevIndex + 1) % glowColors.length);
  };

  const showToast = (message, type) => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: '', type: '' }), 3000);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🚀 THE UPDATED LOGIN BRIDGE
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5269/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // 🛡️ 1. THE SECURITY CHECK: Is this user banned?
        if (data.isBanned) {
          showToast("Access Denied: This account has been suspended.", "error");
          setIsLoading(false);
          return;
        }

        // 💾 2. THE SYSTEM SYNC: Save EVERYTHING to browser memory
        // This ensures the Dashboard Topbar and Sidebar update INSTANTLY
        localStorage.setItem('userId', data.userId);
        localStorage.setItem('userRole', data.role);
        localStorage.setItem('userFullName', data.fullName);
        
        // Save the profile photo path so the top bar icon shows up immediately
        if (data.profilePicturePath) {
          localStorage.setItem('userProfilePhotoPath', data.profilePicturePath);
        } else {
          localStorage.removeItem('userProfilePhotoPath');
        }

        showToast(`Welcome back, ${data.fullName.split(' ')[0]}!`, "success");
        
        // Brief delay for the toast to be seen before redirect
        setTimeout(() => navigate('/dashboard'), 1000); 
      } else {
        showToast(data.message || "Invalid credentials.", "error");
      }
    } catch (error) {
      console.error("Login Error:", error);
      showToast("Server connection failed. Is the API running?", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      onClick={handleBackgroundClick}
      className="relative min-h-screen flex items-center justify-center bg-[#0a0f1c] overflow-hidden cursor-pointer selection:bg-indigo-500/30"
    >
      {/* 3D FLOATING TOAST */}
      <div 
        className={`fixed top-8 left-1/2 -translate-x-1/2 z-[100] px-8 py-3.5 rounded-2xl font-bold text-sm shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5)] backdrop-blur-xl border transition-all duration-500 ease-out flex items-center gap-3 ${
          toast.visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-10 scale-95 pointer-events-none'
        } ${
          toast.type === 'success' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-rose-500/20 border-rose-500/40 text-rose-400'
        }`}
      >
        <span>{toast.type === 'success' ? '✅' : '⚠️'}</span>
        {toast.message}
      </div>

      <div 
        className={`absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b ${glowColors[colorIndex]} to-transparent blur-[120px] pointer-events-none transition-colors duration-1000 ease-in-out`}
      ></div>

      <div 
        onClick={(e) => e.stopPropagation()} 
        className="relative z-10 w-full max-w-[420px] bg-[#111522]/80 backdrop-blur-2xl border border-gray-800/60 rounded-[2.5rem] p-10 shadow-2xl cursor-default"
      >
        
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-indigo-500/20 flex items-center justify-center mb-6 rotate-3 hover:rotate-0 transition-transform duration-300">
             <h2 className="text-white font-black text-2xl">B.</h2>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter">BlindMatch.</h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">Authentication Portal</p>
        </div>

        <form className="flex flex-col gap-6" onSubmit={handleLogin}>
          
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Email Address</label>
            <div className="relative group">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-indigo-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <input 
                required
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@university.com" 
                className="w-full bg-[#0a0f1c] border border-gray-800 text-gray-200 text-sm rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 transition-all placeholder-gray-700"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between ml-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Secure Password</label>
              <a href="#" className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-wider">Forgot?</a>
            </div>
            <div className="relative group">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-indigo-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <input 
                required
                type="password" 
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••••••" 
                className="w-full bg-[#0a0f1c] border border-gray-800 text-gray-200 text-sm rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 transition-all placeholder-gray-700"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className={`w-full text-white text-sm font-bold py-4 rounded-2xl transition-all shadow-xl mt-4 active:scale-95 ${
              isLoading ? 'bg-indigo-500/50 cursor-not-allowed' : 'bg-indigo-500 hover:bg-indigo-600 shadow-indigo-500/20'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                Authenticating...
              </div>
            ) : 'Sign In to Workspace'}
          </button>
        </form>

        <div className="flex items-center gap-4 my-8">
          <div className="flex-1 h-px bg-gray-800/50"></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">Secure Access</span>
          <div className="flex-1 h-px bg-gray-800/50"></div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button type="button" className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/5 text-white text-[11px] font-bold py-3 rounded-xl transition-all">
            Google
          </button>
          
          <button type="button" className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/5 text-white text-[11px] font-bold py-3 rounded-xl transition-all">
            Outlook
          </button>
        </div>

        <div className="mt-10 text-center">
          <p className="text-xs text-gray-500 font-medium">
            New member of the faculty?{' '}
            <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors">
              Request Access
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}