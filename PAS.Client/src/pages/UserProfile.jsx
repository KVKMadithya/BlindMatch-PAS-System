import { useState, useEffect, useRef } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';

// 🌟 FACULTY CATEGORY DICTIONARY (20 per major faculty)
const FACULTY_CATEGORIES = {
  'Computing': [
    'Artificial Intelligence', 'Machine Learning', 'Web Development', 'Mobile Apps', 
    'Cybersecurity', 'Data Science', 'Cloud Computing', 'IoT (Internet of Things)', 
    'Blockchain', 'DevOps', 'Game Development', 'UI/UX Design', 'Software Engineering', 
    'Database Admin', 'Networking', 'NLP', 'Robotics', 'AR/VR', 'Quantum Computing', 'Distributed Systems'
  ],
  'Business': [
    'Marketing', 'Finance', 'Accounting', 'Human Resources', 'Operations', 
    'Supply Chain', 'Economics', 'International Business', 'Entrepreneurship', 'Strategic Management', 
    'Business Analytics', 'Sales', 'Public Relations', 'Project Management', 'Retail', 
    'E-commerce', 'Leadership', 'Risk Management', 'Corporate Law', 'Real Estate'
  ],
  'Engineering': [
    'Civil Engineering', 'Mechanical', 'Electrical', 'Chemical', 'Aerospace', 
    'Biomedical', 'Automotive', 'Environmental', 'Structural', 'Manufacturing', 
    'Robotics', 'Materials Science', 'Industrial', 'Petroleum', 'Nuclear', 
    'Systems Engineering', 'Geotechnical', 'Marine', 'Software Engineering', 'Optical'
  ],
  'Default': [
    'Research', 'Methodology', 'Academic Writing', 'Data Analysis', 'Project Planning',
    'Literature Review', 'Ethics', 'Statistics', 'Field Work', 'Lab Work'
  ]
};

export default function UserProfile() {
  const { theme, isDarkMode, showToast, setProfilePhoto } = useOutletContext();
  const navigate = useNavigate();
  
  // 1. DATA STATE
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // 2. EDITING STATE (Bio)
  const [currentBio, setCurrentBio] = useState('');
  const [isBioSaving, setIsBioSaving] = useState(false);

  // 3. IMAGE STATE
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef(null); 

  // 4. 🌟 EXPERTISE STATE & MODAL 🌟
  const [isExpertiseModalOpen, setIsExpertiseModalOpen] = useState(false);
  const [expertiseDetails, setExpertiseDetails] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isExpertiseSaving, setIsExpertiseSaving] = useState(false);

  // Fetch data on load
  useEffect(() => {
    const fetchProfile = async () => {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        showToast("Session expired. Please log in.", "error");
        navigate("/");
        return;
      }

      try {
        const response = await fetch(`http://localhost:5269/api/profile/${userId}`);
        if (response.ok) {
          const data = await response.json();
          setProfileData(data);
          setCurrentBio(data.bio || ''); 
          
          // Populate Expertise Data
          setExpertiseDetails(data.expertiseDetails || '');
          if (data.expertiseCategories) {
            setSelectedCategories(data.expertiseCategories.split(','));
          }
        }
      } catch (error) {
        showToast("Server connection error.", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [navigate, showToast]);

  // UPDATE BIO FUNCTION
  const handleBioSave = async () => {
    if (isBioSaving) return;
    setIsBioSaving(true);
    const userId = localStorage.getItem('userId');

    try {
      const response = await fetch('http://localhost:5269/api/profile/update-bio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: parseInt(userId, 10), bio: currentBio })
      });
      if (response.ok) showToast("Bio updated successfully!", "success");
    } finally {
      setIsBioSaving(false);
    }
  };

  // 🌟 UPDATE EXPERTISE FUNCTION 🌟
  const handleExpertiseSave = async () => {
    if (isExpertiseSaving) return;
    setIsExpertiseSaving(true);
    const userId = localStorage.getItem('userId');

    try {
      const response = await fetch('http://localhost:5269/api/profile/update-expertise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: parseInt(userId, 10), 
          details: expertiseDetails,
          categories: selectedCategories.join(',') // Convert array to string
        })
      });

      if (response.ok) {
        showToast("Expertise portfolio updated!", "success");
        // Update local state to reflect changes immediately
        setProfileData(prev => ({ 
          ...prev, 
          expertiseDetails: expertiseDetails, 
          expertiseCategories: selectedCategories.join(',') 
        }));
        setIsExpertiseModalOpen(false);
      }
    } finally {
      setIsExpertiseSaving(false);
    }
  };

  // Toggle Category Selection
  const toggleCategory = (category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      if (selectedCategories.length >= 5) {
        showToast("You can only select up to 5 core competencies.", "error");
        return;
      }
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  // THIS IS THE PROFILE PICTURE UPLOAD FUNCTION
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast("File is too large (max 5MB).", "error");
      return;
    }

    setIsUploadingPhoto(true);
    const userId = localStorage.getItem('userId');
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`http://localhost:5269/api/profile/upload-photo/${userId}`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        showToast("Profile photo updated!", "success");
        setProfileData(prev => ({ ...prev, profilePicturePath: data.filename }));
        localStorage.setItem('userProfilePhotoPath', data.filename);
        if (setProfilePhoto) setProfilePhoto(data.filename);
      }
    } finally {
      setIsUploadingPhoto(false);
      e.target.value = null;
    }
  };

  const isSupervisor = profileData?.role === 'Supervisor' || profileData?.role === 'Module Leader';
  const cardStyle = isDarkMode 
    ? 'bg-[#1c202f]/80 backdrop-blur-xl border border-gray-700/50 hover:border-indigo-500/30 hover:shadow-[0_8px_30px_rgba(0,0,0,0.2)]' 
    : 'bg-white/90 backdrop-blur-xl border border-gray-200 hover:border-indigo-300 hover:shadow-lg';

  if (isLoading || !profileData) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const profilePhotoUrl = profileData.profilePicturePath 
    ? `http://localhost:5269/images/profiles/${profileData.profilePicturePath}` 
    : 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';

  // Determine which list of categories to show based on the user's faculty
  const availableCategories = FACULTY_CATEGORIES[profileData.faculty] || FACULTY_CATEGORIES['Default'];

  return (
    <div className="pb-12 max-w-6xl mx-auto animation-fade-in relative">
      
      {/* 🌟 1. THE HERO CARD 🌟 */}
      <div className={`relative p-10 rounded-[2rem] transition-all duration-500 flex flex-col md:flex-row items-start md:items-center gap-10 mb-8 overflow-hidden shadow-2xl ${cardStyle}`}>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-600/40 to-purple-700/40 rounded-full translate-x-1/3 -translate-y-1/3 blur-[80px] pointer-events-none"></div>
        
        <div className="relative group flex-shrink-0 z-10">
          <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.2)] transition-transform duration-300 group-hover:scale-105 group-hover:border-indigo-400">
            <img src={profilePhotoUrl} alt="Profile" className={`w-full h-full object-cover transition-opacity duration-300 ${isUploadingPhoto ? 'opacity-30' : 'opacity-100'}`} />
          </div>
          <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />
          <button onClick={() => fileInputRef.current.click()} disabled={isUploadingPhoto} className="absolute inset-0 m-1 bg-black/60 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center text-white cursor-pointer">
            {isUploadingPhoto ? <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div> : <span className="text-xs font-bold tracking-wider">CHANGE</span>}
          </button>
        </div>

        <div className="relative z-10 flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className={`px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-bold rounded-full ${isDarkMode ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-indigo-100 text-indigo-700'}`}>
              {profileData.role}
            </span>
          </div>
          <h1 className="text-5xl font-extrabold mb-2 tracking-tight">{profileData.fullName}</h1>
          <p className={`text-xl font-medium mb-4 ${theme.textMuted}`}>{profileData.email}</p>
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium ${isDarkMode ? 'bg-[#0f111a]/80 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
            <span className="text-indigo-400">🏫</span> {profileData.faculty || 'Unassigned Faculty'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* 🌟 2. THE BIO EDITOR CARD 🌟 */}
        <div className={`lg:col-span-3 p-8 rounded-[2rem] transition-all duration-500 flex flex-col ${cardStyle}`}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold flex items-center gap-3">
              <span className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">✨</span> What I Do
            </h3>
            <span className={`text-xs font-bold tracking-wider ${theme.textMuted}`}>{currentBio.length} / 500</span>
          </div>
          <textarea 
            value={currentBio} onChange={(e) => setCurrentBio(e.target.value)} maxLength={500} rows={8}
            placeholder="Write a brief overview of your research interests, tech stack, and experience..." 
            className={`w-full flex-1 rounded-2xl py-4 px-5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none mb-6 leading-relaxed text-[15px] ${isDarkMode ? 'bg-[#0f111a]/80 border border-gray-700/50 text-gray-200' : 'bg-gray-50 border border-gray-200 text-gray-800'}`}
          />
          <div className="flex justify-end mt-auto">
            <button onClick={handleBioSave} disabled={isBioSaving} className="px-8 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:-translate-y-0.5">
              {isBioSaving ? 'Saving...' : 'Save Profile Bio'}
            </button>
          </div>
        </div>

        {/* 🌟 3. RIGHT COLUMN 🌟 */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          <div className={`p-8 rounded-[2rem] transition-all duration-500 flex-1 ${cardStyle}`}>
            <h3 className="text-xl font-bold mb-6">My Experience</h3>
            <div className="space-y-4">
              <div className={`flex justify-between items-center p-5 rounded-2xl transition-colors ${isDarkMode ? 'bg-[#0f111a]/60 border border-gray-800' : 'bg-gray-50 border border-gray-100'}`}>
                <span className={`text-sm font-bold tracking-wide ${theme.textMuted}`}>University Batch</span>
                <span className="text-base font-extrabold">{profileData.batch || 'Pending'}</span>
              </div>
              <div className={`flex justify-between items-center p-5 rounded-2xl transition-colors ${isDarkMode ? 'bg-[#0f111a]/60 border border-gray-800' : 'bg-gray-50 border border-gray-100'}`}>
                <span className={`text-sm font-bold tracking-wide ${theme.textMuted}`}>Member Since</span>
                <span className="text-base font-extrabold">{new Date(profileData.createdAt).getFullYear()}</span>
              </div>
            </div>
          </div>

          {/* 🌟 NEW SUPERVISOR EXPERTISE CARD 🌟 */}
          {isSupervisor && (
            <div 
              onClick={() => setIsExpertiseModalOpen(true)}
              className={`p-8 rounded-[2rem] transition-all duration-500 relative overflow-hidden group cursor-pointer border ${
                isDarkMode 
                  ? 'bg-gradient-to-br from-[#1c202f] to-[#161925] border-indigo-500/30 hover:border-indigo-400/60 hover:shadow-[0_0_30px_rgba(99,102,241,0.15)]' 
                  : 'bg-indigo-50 border-indigo-200 hover:shadow-lg hover:border-indigo-400'
              }`}
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 text-5xl transition-transform group-hover:scale-110 group-hover:rotate-12">🔬</div>
              <h3 className="text-xl font-bold mb-2 flex items-center justify-between">
                Field of Expertise
                <svg className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
              </h3>
              
              {/* Display Tags if they exist, otherwise show prompt */}
              {profileData.expertiseCategories ? (
                <div className="flex flex-wrap gap-2 mt-4 relative z-10">
                  {profileData.expertiseCategories.split(',').map((cat, i) => (
                    <span key={i} className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md border ${isDarkMode ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-white text-indigo-700 border-indigo-200'}`}>
                      {cat}
                    </span>
                  ))}
                </div>
              ) : (
                <p className={`text-sm leading-relaxed mt-2 ${theme.textMuted}`}>
                  Click to configure your academic competencies and allow students to find you easily.
                </p>
              )}
            </div>
          )}

        </div>
      </div>

      {/* 🌟 EXPERTISE CONFIGURATION MODAL 🌟 */}
      {isExpertiseModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-6">
          <div className="absolute inset-0 bg-[#0a0f1c]/90 backdrop-blur-md" onClick={() => setIsExpertiseModalOpen(false)}></div>
          
          <div className={`relative w-full max-w-3xl rounded-[2.5rem] border shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[90vh] ${
            isDarkMode ? 'bg-[#1c202f] border-indigo-500/30' : 'bg-white border-gray-200'
          }`}>
            <div className="p-8 md:p-10 border-b border-gray-800/50 flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-black tracking-tight">Configure Expertise</h2>
                <p className={`text-sm mt-1 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'} font-medium`}>Setup your academic matchmaking profile.</p>
              </div>
              <button onClick={() => setIsExpertiseModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors opacity-50">✕</button>
            </div>

            <div className="p-8 md:p-10 flex-1 overflow-y-auto custom-scrollbar">
              <div className="mb-10">
                <div className="flex justify-between items-end mb-3">
                  <label className="text-[11px] font-black uppercase tracking-widest opacity-50">Core Competencies</label>
                  <span className={`text-xs font-bold ${selectedCategories.length === 5 ? 'text-rose-500' : theme.textMuted}`}>{selectedCategories.length} / 5 Selected</span>
                </div>
                
                {/* 🌟 INTERACTIVE CHIP SELECTOR 🌟 */}
                <div className="flex flex-wrap gap-3">
                  {availableCategories.map(category => {
                    const isSelected = selectedCategories.includes(category);
                    return (
                      <button
                        key={category}
                        onClick={() => toggleCategory(category)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                          isSelected 
                            ? 'bg-indigo-500 text-white border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.4)] hover:bg-indigo-600' 
                            : (isDarkMode ? 'bg-[#0f111a] text-gray-400 border-gray-700 hover:border-indigo-500/50 hover:text-indigo-300' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600')
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}{category}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-black uppercase tracking-widest opacity-50 mb-3 block">Detailed Preferences & Constraints</label>
                <textarea 
                  value={expertiseDetails}
                  onChange={(e) => setExpertiseDetails(e.target.value)}
                  rows={4}
                  placeholder="e.g., 'I prefer projects utilizing Python and TensorFlow. I am not currently accepting projects focused on Web3...'" 
                  className={`w-full rounded-2xl py-4 px-5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none leading-relaxed text-sm ${
                    isDarkMode ? 'bg-[#0f111a]/80 border border-gray-700/50 text-gray-200' : 'bg-gray-50 border border-gray-200 text-gray-800'
                  }`}
                />
              </div>
            </div>

            <div className="p-8 border-t border-gray-800/50 flex justify-end gap-4 bg-black/10">
              <button onClick={() => setIsExpertiseModalOpen(false)} className={`px-6 py-3 rounded-xl text-sm font-bold transition-colors ${isDarkMode ? 'hover:bg-white/5 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}>Cancel</button>
              <button 
                onClick={handleExpertiseSave}
                disabled={isExpertiseSaving}
                className="px-8 py-3 bg-emerald-500 text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
              >
                {isExpertiseSaving ? 'Synchronizing...' : 'Save Expertise Profile'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}