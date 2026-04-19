import { useState, useEffect, useRef } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';

export default function PostProject() {
  const { theme, isDarkMode, showToast } = useOutletContext();
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    faculty: 'Computing',
  });

  // 🌟 Real Database Members State
  const [availableStudents, setAvailableStudents] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]); 
  
  // Combobox State
  const [memberSearch, setMemberSearch] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🔄 Fetch all students from the DB
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch('http://localhost:5269/api/admin/users');
        if (response.ok) {
          const data = await response.json();
          // Filter: Only students, and exclude the person currently logging the project
          const studentsOnly = data.filter(u => u.role === 'Student' && u.id.toString() !== userId);
          setAvailableStudents(studentsOnly);
        }
      } catch (error) {
        showToast("Could not load student directory.", "error");
      }
    };
    fetchStudents();
  }, [userId, showToast]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // 🤝 Handle Team Selection
  const addMember = (student) => {
    if (selectedMembers.length >= 6) { // 6 invited + 1 creator = 7 max
      showToast("Maximum team size is 7.", "error");
      return;
    }
    if (selectedMembers.find(m => m.id === student.id)) {
      showToast("Student is already in the team.", "error");
      return;
    }
    
    setSelectedMembers([...selectedMembers, student]);
    setMemberSearch('');
    setIsDropdownOpen(false);
  };

  const removeMember = (studentId) => {
    setSelectedMembers(selectedMembers.filter(m => m.id !== studentId));
  };

  const filteredStudents = availableStudents.filter(s => 
    s.fullName.toLowerCase().includes(memberSearch.toLowerCase()) || 
    s.email.toLowerCase().includes(memberSearch.toLowerCase())
  );

  // 🚀 THE API BRIDGE
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return; 
    setIsSubmitting(true);    
    
    if (!userId) {
      showToast("Error: You are not logged in properly.", "error");
      setIsSubmitting(false);
      return;
    }

    // Map the selected members to extract just their Database IDs
    const payload = {
      ...formData,
      createdById: parseInt(userId, 10),
      invitedMemberIds: selectedMembers.map(m => m.id) // Send array of IDs to C#
    };

    try {
      // Pointing to a newly designed endpoint that handles the email dispatch
      const response = await fetch('http://localhost:5269/api/project/create-with-invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        showToast("Draft created! Invitations sent to team members.", "success"); 
        setTimeout(() => navigate('/dashboard/feed'), 1500); 
      } else {
        const errorData = await response.json();
        showToast(errorData.message || "Failed to save project.", "error");
        setIsSubmitting(false); 
      }
    } catch (error) {
      console.error("Error:", error);
      showToast("Server connection failed.", "error");
      setIsSubmitting(false); 
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-10 animation-fade-in">
      <div className="mb-8">
        <h1 className="text-4xl font-black mb-2 tracking-tight">Propose Research</h1>
        <p className={theme.textMuted}>Submit your project details and invite registered students to your team.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        
        {/* SECTION 1: Core Details */}
        <div className={`p-8 rounded-[2rem] border shadow-lg transition-colors ${theme.card}`}>
          <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
            <span className="bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 w-8 h-8 rounded-full flex items-center justify-center text-sm font-black">1</span> 
            Core Details
          </h2>
          <div className="flex flex-col gap-5">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-1">Project Title</label>
              <input 
                required type="text" name="title" value={formData.title} onChange={handleChange}
                placeholder="e.g. Nsnap - Campus Photography App" 
                className={`w-full mt-2 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-sm ${isDarkMode ? 'bg-[#0f111a] border border-gray-700 text-white' : 'bg-gray-50 border border-gray-200 text-gray-900'}`}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-1">Faculty</label>
                <select 
                  name="faculty" value={formData.faculty} onChange={handleChange}
                  className={`w-full mt-2 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer font-bold text-sm ${isDarkMode ? 'bg-[#0f111a] border border-gray-700 text-white' : 'bg-gray-50 border border-gray-200 text-gray-900'}`}
                >
                  <option value="Computing">Faculty of Computing</option>
                  <option value="Business">Faculty of Business</option>
                  <option value="Engineering">Faculty of Engineering</option>
                  <option value="Medicine">Faculty of Medicine</option>
                  <option value="Law">Faculty of Law</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-1">Proposed Deadline</label>
                <input 
                  required type="date" name="deadline" value={formData.deadline} onChange={handleChange}
                  className={`w-full mt-2 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-sm ${isDarkMode ? 'bg-[#0f111a] border border-gray-700 text-white [color-scheme:dark]' : 'bg-gray-50 border border-gray-200 text-gray-900'}`}
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-1">Project Description</label>
              <textarea 
                required name="description" value={formData.description} onChange={handleChange} rows="4"
                placeholder="Explain the core problem, your proposed solution, and the technologies you plan to use..." 
                className={`w-full mt-2 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none text-sm leading-relaxed ${isDarkMode ? 'bg-[#0f111a] border border-gray-700 text-white' : 'bg-gray-50 border border-gray-200 text-gray-900'}`}
              ></textarea>
            </div>
          </div>
        </div>

        {/* SECTION 2: Live Team Invites */}
        <div className={`p-8 rounded-[2rem] border shadow-lg transition-colors ${theme.card}`}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold flex items-center gap-3">
              <span className="bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 w-8 h-8 rounded-full flex items-center justify-center text-sm font-black">2</span> 
              Team Assembly ({selectedMembers.length + 1}/7)
            </h2>
          </div>
          
          <p className={`text-sm mb-6 ${theme.textMuted}`}>Search the student registry to invite members to your project. The project will remain in "Draft" state until all members accept their invites via their Mailbox.</p>

          {/* 🌟 Live Search Dropdown 🌟 */}
          <div className="relative mb-6 z-50" ref={dropdownRef}>
            <input 
              type="text" 
              value={memberSearch}
              onChange={(e) => { setMemberSearch(e.target.value); setIsDropdownOpen(true); }}
              onFocus={() => setIsDropdownOpen(true)}
              placeholder="Search students by name or email..." 
              className={`w-full rounded-xl py-3 px-11 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-sm ${isDarkMode ? 'bg-[#0f111a] border border-gray-700 text-white' : 'bg-white border border-gray-200'}`}
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50">🔍</span>

            {isDropdownOpen && memberSearch && (
              <div className={`absolute top-full left-0 right-0 mt-2 rounded-xl border shadow-2xl max-h-48 overflow-y-auto custom-scrollbar ${isDarkMode ? 'bg-[#1c202f] border-gray-700' : 'bg-white border-gray-200'}`}>
                {filteredStudents.length === 0 ? (
                  <div className="p-4 text-xs text-center opacity-50">No students found.</div>
                ) : (
                  filteredStudents.map(student => (
                    <div 
                      key={student.id}
                      onClick={() => addMember(student)}
                      className={`p-3 cursor-pointer flex items-center justify-between border-b last:border-0 transition-colors ${isDarkMode ? 'border-gray-800 hover:bg-indigo-500/10' : 'border-gray-100 hover:bg-indigo-50'}`}
                    >
                      <div>
                        <p className="font-bold text-sm">{student.fullName}</p>
                        <p className="text-[10px] opacity-50">{student.email}</p>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Invite</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Selected Members Visual List */}
          <div className="flex flex-col gap-3">
            {/* The Creator (Always there) */}
            <div className={`flex items-center justify-between p-4 rounded-xl border ${isDarkMode ? 'bg-[#0f111a] border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'}`}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-black">⭐</div>
                <span className="font-bold text-sm">You (Project Leader)</span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">ACCEPTED</span>
            </div>

            {/* Invited Members */}
            {selectedMembers.map((member) => (
              <div key={member.id} className={`flex items-center justify-between p-4 rounded-xl border ${isDarkMode ? 'bg-[#0f111a] border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-black text-xs">
                    {member.fullName.charAt(0)}
                  </div>
                  <span className="font-bold text-sm">{member.fullName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 bg-amber-500/10 px-2 py-1 rounded">PENDING INVITE</span>
                  <button type="button" onClick={() => removeMember(member.id)} className="text-rose-500 hover:text-rose-400 font-black p-2">✕</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="flex justify-end gap-4 pt-4">
          <button type="button" onClick={() => navigate('/dashboard')} className={`px-6 py-3 rounded-xl font-bold text-sm transition-colors ${isDarkMode ? 'hover:bg-white/5 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}>
            Cancel
          </button>
          
          <button 
            type="submit" 
            disabled={isSubmitting}
            className={`px-8 py-3 rounded-xl font-bold text-sm uppercase tracking-widest transition-all shadow-lg ${isSubmitting ? 'bg-indigo-500/50 text-white shadow-none cursor-wait' : 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-indigo-500/30 hover:-translate-y-0.5'}`}
          >
            {isSubmitting ? 'Processing...' : 'Send Invitations & Propose'}
          </button>
        </div>

      </form>
    </div>
  );
}