import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [userName, setUserName] = useState("Loading...");
  const [userRole, setUserRole] = useState(""); // Starts empty to prevent "Student" flash
  
  // 🌟 DYNAMIC AVATAR STATE
  const [profilePhoto, setProfilePhoto] = useState(null);
  
  // 🔍 THE SEARCH STATE
  const [searchQuery, setSearchQuery] = useState('');
  
  const [toast, setToast] = useState({ visible: false, message: '', type: '' });

  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: '', type: '' }), 3000);
  };

  // 🔄 RE-SYNC: Fetch the latest profile data from the C# source of truth
  useEffect(() => {
    const syncProfile = async () => {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        navigate("/"); // Kick back to login if no ID found
        return;
      }

      try {
        const response = await fetch(`http://localhost:5269/api/profile/${userId}`);
        if (response.ok) {
          const data = await response.json();
          
          // Update the states with REAL database values
          setUserName(data.fullName);
          setUserRole(data.role); // This fixes the "Stuck as Student" bug!
          setProfilePhoto(data.profilePicturePath);
          
          // Sync localStorage so it's ready for page refreshes
          localStorage.setItem('userFullName', data.fullName);
          localStorage.setItem('userRole', data.role);
          localStorage.setItem('userProfilePhotoPath', data.profilePicturePath);
        }
      } catch (error) {
        console.error("Dashboard Sync Error:", error);
      }
    };

    syncProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const theme = {
    bg: isDarkMode ? "bg-[#0f111a]" : "bg-gray-50",
    sidebar: isDarkMode ? "bg-[#161925] border-gray-800" : "bg-white border-gray-200",
    card: isDarkMode ? "bg-[#1c202f] border-gray-700/50" : "bg-white border-gray-200 shadow-sm",
    textMain: isDarkMode ? "text-white" : "text-gray-900",
    textMuted: isDarkMode ? "text-gray-400" : "text-gray-500",
    input: isDarkMode ? "bg-[#0f111a] border-gray-700 text-white" : "bg-gray-100 border-transparent text-gray-900",
  };

  const getLinkStyle = (path, exact = false) => {
    const isActive = exact ? location.pathname === path : location.pathname.startsWith(path);
    if (isActive) {
      return isDarkMode 
        ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]' 
        : 'bg-indigo-50 text-indigo-600 border border-indigo-200 shadow-sm';
    }
    return `${theme.textMuted} hover:bg-indigo-500/10 hover:text-indigo-400 border border-transparent`;
  };

  return (
    <div className={`min-h-screen flex font-sans transition-colors duration-300 ${theme.bg} ${theme.textMain}`}>
      
      {/* 3D FLOATING NOTIFICATION */}
      <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-3.5 rounded-2xl font-semibold text-sm shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5)] backdrop-blur-xl border-t border-white/20 transition-all duration-500 ease-out flex items-center gap-3 ${
        toast.visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-10 scale-95 pointer-events-none'
      } ${
        toast.type === 'success' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white' : 'bg-gradient-to-r from-rose-500 to-red-500 text-white'
      }`}>
        <span className="text-lg">{toast.type === 'success' ? '✅' : '⚠️'}</span>
        {toast.message}
      </div>

      {/* SIDEBAR NAVIGATION */}
      <aside className={`w-72 border-r flex flex-col p-6 transition-colors duration-300 ${theme.sidebar}`}>
        <div className="mb-10">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent tracking-tighter">BlindMatch.</h2>
        </div>
        
        <nav className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
          <p className="text-xs uppercase tracking-wider font-bold mb-3 text-gray-500 ml-1">Main Menu</p>
          <Link to="/dashboard" className={`block w-full px-4 py-3 rounded-xl font-medium transition-all ${getLinkStyle('/dashboard', true)}`}>Overview Dashboard</Link>
          <Link to="/dashboard/feed" className={`block w-full px-4 py-3 rounded-xl font-medium transition-all ${getLinkStyle('/dashboard/feed')}`}>Project Feed</Link>
          
          {/* 🌟 NEW MAILBOX LINK 🌟 */}
          <Link to="/dashboard/mail" className={`block w-full px-4 py-3 rounded-xl font-medium transition-all ${getLinkStyle('/dashboard/mail')}`}>
            <div className="flex items-center justify-between">
              <span>Secure Mailbox</span>
            </div>
          </Link>

          <Link to="/dashboard/workspace" className={`block w-full px-4 py-3 rounded-xl font-medium transition-all ${getLinkStyle('/dashboard/workspace')}`}>
            <div className="flex items-center justify-between">
               <span>Project Workspace</span>
              
           </div>
          </Link>

          {/* You can show this link ONLY if the user is a Supervisor, or just show it to everyone for now */}
          {localStorage.getItem('userRole') === 'Supervisor' && (
            <Link to="/dashboard/command" className={`block w-full px-4 py-3 rounded-xl font-medium transition-all ${getLinkStyle('/dashboard/command')}`}>
              <div className="flex items-center justify-between">
                <span>Supervisor Command Center</span>
              </div>
            </Link>
        )}

          {/* 🛠️ MODULE LEADER ONLY SECTION */}
          {userRole === 'Module Leader' && (
            <>
              <p className="text-xs uppercase tracking-wider font-bold mb-3 mt-8 text-gray-500 ml-1">Administration</p>
              <Link to="/dashboard/manage-users" className={`block w-full px-4 py-3 rounded-xl transition-all font-medium ${getLinkStyle('/dashboard/manage-users')}`}>All Users</Link>
              <Link to="/dashboard/reports" className={`block w-full px-4 py-3 rounded-xl transition-all font-medium ${getLinkStyle('/dashboard/reports')}`}>User Reports</Link>
            </>
          )}

          {localStorage.getItem('userRole') === 'Module Leader' && (
            <Link to="/dashboard/grading" className={`block w-full px-4 py-3 rounded-xl font-medium transition-all ${getLinkStyle('/dashboard/grading')}`}>
              <div className="flex items-center justify-between">
                  <span>Assessment Panel</span>
              </div>
            </Link>
)}

          {/* 🎓 STUDENT ONLY SECTION */}
          {userRole === 'Student' && (
            <>
              <p className="text-xs uppercase tracking-wider font-bold mb-3 mt-8 text-gray-500 ml-1">Actions</p>
              <Link to="/dashboard/post-project" className={`block w-full px-4 py-3 rounded-xl transition-all font-medium ${getLinkStyle('/dashboard/post-project')}`}>Post a Project</Link>
              <Link to="/dashboard/report-issue" className={`block w-full px-4 py-3 rounded-xl transition-all font-medium ${getLinkStyle('/dashboard/report-issue')}`}>Report an Issue</Link>
            </>
          )}
        </nav>

        <button onClick={handleLogout} className="mt-auto flex items-center justify-center gap-2 text-rose-500 hover:bg-rose-500/10 px-4 py-3 rounded-xl transition-colors font-bold border border-transparent">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          Logout
        </button>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className={`h-20 border-b px-8 flex items-center justify-between backdrop-blur-md transition-colors duration-300 z-50 ${isDarkMode ? 'bg-[#0f111a]/80 border-gray-800' : 'bg-white/80 border-gray-200'}`}>
          
          <div className="relative w-96 group">
            <svg className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${theme.textMuted} group-focus-within:text-indigo-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your workspace..." 
              className={`w-full rounded-full py-2.5 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm ${theme.input}`} 
            />
          </div>

          <div className="flex items-center gap-6">
            <button onClick={toggleTheme} className={`p-2.5 rounded-full transition-all active:scale-90 ${isDarkMode ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}>
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            
            <div className="flex items-center gap-4 border-l pl-6 border-gray-700">
              <div className="text-right">
                <p className="text-sm font-bold tracking-tight">{userName}</p>
                {/* 🌟 DYNAMIC ROLE (Updates via syncProfile) 🌟 */}
                <p className={`text-[10px] uppercase font-extrabold tracking-widest ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>{userRole || 'Loading...'}</p>
              </div>
              
              <Link 
                to="/dashboard/profile"
                className="relative group transition-transform hover:scale-105 active:scale-95 flex-shrink-0" 
              >
                {profilePhoto && profilePhoto !== "null" ? (
                  <img 
                    src={`http://localhost:5269/images/profiles/${profilePhoto}`} 
                    alt="User"
                    className="w-11 h-11 rounded-full border-2 border-indigo-200 shadow-xl object-cover bg-white"
                    onError={() => setProfilePhoto(null)} 
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 border-2 border-indigo-200 shadow-xl flex items-center justify-center text-white text-lg font-bold">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="absolute inset-0 rounded-full shadow-[0_0_20px_rgba(99,102,241,0.5)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Link>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 relative scroll-smooth">
          {/* Passing ALL tools down to the nested pages */}
          <Outlet context={{ isDarkMode, theme, userName, userRole, showToast, searchQuery, setProfilePhoto }} />
        </div>
      </main>
    </div>
  );
}