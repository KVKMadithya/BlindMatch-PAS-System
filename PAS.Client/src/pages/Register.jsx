import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();
  const [colorIndex, setColorIndex] = useState(0);

  // 1. THE DATA STATE: Holds everything the user types
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    studentId: '',
    batch: '',
    faculty: '',
    degreeType: 'PLY',
    degreeProgram: '',
    password: '',
    confirmPassword: ''
  });

  // 2. THE UI STATE: Handles loading and the professional notification
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

  // Helper to trigger the notification
  const showToast = (message, type) => {
    setToast({ visible: true, message, type });
    // Hide it automatically after 3 seconds
    setTimeout(() => setToast({ visible: false, message: '', type: '' }), 3000);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. THE API BRIDGE
  const handleRegister = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      showToast("Passwords do not match!", "error");
      return;
    }

    setIsLoading(true); // Lock the button

    try {
      const response = await fetch('http://localhost:5269/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        showToast("Registration successful! Redirecting...", "success");
        // Wait 2 seconds so they can read the success message, then navigate
        setTimeout(() => navigate('/'), 2000); 
      } else {
        const errorData = await response.json();
        showToast(errorData.message || "Registration failed.", "error");
      }
    } catch (error) {
      console.error("Error:", error);
      showToast("Server connection failed. Is the backend running?", "error");
    } finally {
      setIsLoading(false); // Unlock the button
    }
  };

  return (
    <div 
      onClick={handleBackgroundClick}
      className="relative min-h-screen flex items-center justify-center bg-[#0a0f1c] overflow-hidden cursor-pointer selection:bg-indigo-500/30 py-10"
    >
      {/* CUSTOM TOAST NOTIFICATION */}
      <div 
        className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full font-medium text-sm text-white shadow-2xl backdrop-blur-md border transition-all duration-500 ease-out ${
          toast.visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10 pointer-events-none'
        } ${
          toast.type === 'success' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200' : 'bg-rose-500/20 border-rose-500/50 text-rose-200'
        }`}
      >
        {toast.message}
      </div>

      <div 
        className={`absolute top-[-10%] left-1/2 -translate-x-1/2 w-[900px] h-[700px] bg-gradient-to-b ${glowColors[colorIndex]} to-transparent blur-[120px] pointer-events-none transition-colors duration-1000 ease-in-out`}
      ></div>

      <div 
        onClick={(e) => e.stopPropagation()} 
        className="relative z-10 w-full max-w-[550px] bg-[#111522] border border-gray-800/60 rounded-3xl p-8 shadow-2xl cursor-default"
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-white mb-2">Create an Account</h1>
          <p className="text-sm text-gray-400">Join the BlindMatch academic network.</p>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleRegister}>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-300 ml-1">Full Name</label>
            <input 
              required type="text" name="fullName" placeholder="e.g. Kavindu Madithya" 
              value={formData.fullName} onChange={handleChange}
              className="w-full bg-[#0a0f1c] border border-gray-800 text-gray-200 text-sm rounded-xl py-2.5 px-4 focus:outline-none focus:border-indigo-500 transition-all placeholder-gray-600"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-300 ml-1">University Email</label>
            <input 
              required type="email" name="email" placeholder="student@students.nsbm.ac.lk" 
              value={formData.email} onChange={handleChange}
              className="w-full bg-[#0a0f1c] border border-gray-800 text-gray-200 text-sm rounded-xl py-2.5 px-4 focus:outline-none focus:border-indigo-500 transition-all placeholder-gray-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-300 ml-1">Student ID</label>
              <input 
                required type="text" name="studentId" placeholder="e.g. 10023456" 
                value={formData.studentId} onChange={handleChange}
                className="w-full bg-[#0a0f1c] border border-gray-800 text-gray-200 text-sm rounded-xl py-2.5 px-4 focus:outline-none focus:border-indigo-500 transition-all placeholder-gray-600"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-300 ml-1">Batch</label>
              <input 
                required type="text" name="batch" placeholder="e.g. 22.2" 
                value={formData.batch} onChange={handleChange}
                className="w-full bg-[#0a0f1c] border border-gray-800 text-gray-200 text-sm rounded-xl py-2.5 px-4 focus:outline-none focus:border-indigo-500 transition-all placeholder-gray-600"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-300 ml-1">Faculty</label>
            <select 
              required name="faculty" 
              value={formData.faculty} onChange={handleChange}
              className="w-full bg-[#0a0f1c] border border-gray-800 text-gray-200 text-sm rounded-xl py-2.5 px-4 focus:outline-none focus:border-indigo-500 transition-all appearance-none cursor-pointer"
            >
              <option value="" disabled>Select your Faculty</option>
              <option value="Computing">Faculty of Computing</option>
              <option value="Business">Faculty of Business</option>
              <option value="Engineering">Faculty of Engineering</option>
              <option value="Medicine">Faculty of Medicine</option>
              <option value="Law">Faculty of Law</option>
            </select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1 flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-300 ml-1">Type</label>
              <select 
                required name="degreeType" 
                value={formData.degreeType} onChange={handleChange}
                className="w-full bg-[#0a0f1c] border border-gray-800 text-gray-200 text-sm rounded-xl py-2.5 px-4 focus:outline-none focus:border-indigo-500 transition-all appearance-none cursor-pointer"
              >
                <option value="PLY">PLY</option>
                <option value="UGC">UGC</option>
                <option value="VU">VU</option>
              </select>
            </div>
            <div className="col-span-2 flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-300 ml-1">Degree Program</label>
              <input 
                required type="text" name="degreeProgram" placeholder="e.g. Software Engineering" 
                value={formData.degreeProgram} onChange={handleChange}
                className="w-full bg-[#0a0f1c] border border-gray-800 text-gray-200 text-sm rounded-xl py-2.5 px-4 focus:outline-none focus:border-indigo-500 transition-all placeholder-gray-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-300 ml-1">Password</label>
              <input 
                required type="password" name="password" placeholder="••••••••" 
                value={formData.password} onChange={handleChange}
                className="w-full bg-[#0a0f1c] border border-gray-800 text-gray-200 text-sm rounded-xl py-2.5 px-4 focus:outline-none focus:border-indigo-500 transition-all placeholder-gray-600"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-300 ml-1">Confirm Password</label>
              <input 
                required type="password" name="confirmPassword" placeholder="••••••••" 
                value={formData.confirmPassword} onChange={handleChange}
                className="w-full bg-[#0a0f1c] border border-gray-800 text-gray-200 text-sm rounded-xl py-2.5 px-4 focus:outline-none focus:border-indigo-500 transition-all placeholder-gray-600"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className={`w-full text-white text-sm font-medium py-3 rounded-xl transition-all shadow-lg mt-4 ${
              isLoading ? 'bg-indigo-500/50 cursor-not-allowed' : 'bg-indigo-500 hover:bg-indigo-600 shadow-[0_0_20px_rgba(99,102,241,0.3)]'
            }`}
          >
            {isLoading ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            Already have an account?{' '}
            <Link to="/" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
              Please login
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}