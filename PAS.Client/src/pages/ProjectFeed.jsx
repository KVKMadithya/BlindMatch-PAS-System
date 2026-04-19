import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';

export default function ProjectFeed() {
  // 🌟 Destructure searchQuery and userRole for live logic
  const { theme, isDarkMode, searchQuery, userRole, showToast } = useOutletContext();
  const navigate = useNavigate();
  
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const fetchProjects = async () => {
    try {
      const response = await fetch('http://localhost:5269/api/project/all');
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      }
    } catch (error) {
      console.error("Feed sync error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  // 🔍 THE SEARCH FILTER
  const filteredProjects = projects.filter(project => 
    project.title.toLowerCase().includes((searchQuery || '').toLowerCase()) ||
    project.faculty.toLowerCase().includes((searchQuery || '').toLowerCase())
  );

  // 🤝 THE SUPERVISION HANDSHAKE
  const handleSupervise = async (projectId) => {
    setIsActionLoading(true);
    const userId = localStorage.getItem('userId');

    try {
      const response = await fetch(`http://localhost:5269/api/project/supervise/${projectId}?supervisorId=${userId}`, {
        method: 'POST'
      });

      if (response.ok) {
        showToast("Supervision Accepted! Project moved to your workspace.", "success");
        setSelectedProject(null);
        fetchProjects(); // Refresh the list - the project will now disappear from the feed!
      }
    } catch (error) {
      showToast("Connection failed.", "error");
    } finally {
      setIsActionLoading(false);
    }
  };

  const getAccentColor = (faculty) => {
    switch(faculty) {
      case 'Computing': return 'bg-indigo-500 shadow-indigo-500/50';
      case 'Engineering': return 'bg-rose-500 shadow-rose-500/50';
      case 'Business': return 'bg-emerald-500 shadow-emerald-500/50';
      default: return 'bg-blue-500 shadow-blue-500/50';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No Deadline";
    return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const canSupervise = userRole === 'Supervisor' || userRole === 'Module Leader';

  return (
    <div className="relative pb-20 animation-fade-in">
      
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Research Feed</h1>
          <p className={theme.textMuted}>
            {searchQuery ? `Searching for "${searchQuery}" in active proposals...` : "Explore active research proposals looking for members and supervisors."}
          </p>
        </div>
        <div className={`px-4 py-1.5 rounded-full border text-xs font-bold ${isDarkMode ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300' : 'bg-indigo-50 border-indigo-200 text-indigo-700'}`}>
           Available: {filteredProjects.length} Projects
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div></div>
      ) : filteredProjects.length === 0 ? (
        <div className={`w-full py-24 rounded-[3rem] border-2 border-dashed flex flex-col items-center justify-center ${isDarkMode ? 'border-gray-800 bg-white/5' : 'border-gray-200 bg-gray-50'}`}>
          <span className="text-5xl mb-4">🔎</span>
          <p className="text-xl font-bold mb-1">No Matching Proposals</p>
          <p className={theme.textMuted}>Try adjusting your search or faculty filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div 
              key={project.id} 
              onClick={() => setSelectedProject(project)}
              className={`relative group p-8 rounded-[2rem] border transition-all duration-300 cursor-pointer ${
                isDarkMode 
                  ? 'bg-[#1c202f]/60 border-white/5 hover:border-indigo-500/40 hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/10' 
                  : 'bg-white border-gray-200 hover:-translate-y-2 hover:shadow-xl'
              }`}
            >
              <div className={`absolute left-0 top-10 bottom-10 w-1 rounded-r-full transition-all group-hover:w-2 ${getAccentColor(project.faculty)}`}></div>
              
              <div className="flex justify-between items-center mb-6 pl-2">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-40">{project.faculty}</span>
                <span className="text-[10px] font-bold bg-indigo-500/10 text-indigo-400 px-2 py-1 rounded">MATCHING ACTIVE</span>
              </div>
              
              <div className="pl-2">
                <h3 className="text-xl font-bold mb-3 line-clamp-2 leading-tight group-hover:text-indigo-400 transition-colors">{project.title}</h3>
                <p className={`text-sm mb-6 line-clamp-2 leading-relaxed ${theme.textMuted}`}>
                  {project.description}
                </p>
                
                <div className="flex items-center justify-between pt-5 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">👥 {project.memberCount} / 7</span>
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-tighter opacity-50">
                    DUE: {formatDate(project.deadline)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 🌟 PROJECT DETAIL MODAL 🌟 */}
      {selectedProject && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-[#0a0f1c]/90 backdrop-blur-md" onClick={() => setSelectedProject(null)}></div>
          
          <div className={`relative w-full max-w-2xl rounded-[3rem] border shadow-2xl overflow-hidden transition-all ${
            isDarkMode ? 'bg-[#161925] border-white/10' : 'bg-white border-gray-200'
          }`}>
            <div className="p-12">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <p className="text-indigo-400 font-black text-[10px] uppercase tracking-widest mb-2">{selectedProject.faculty} RESEARCH</p>
                  <h2 className="text-3xl font-black tracking-tight">{selectedProject.title}</h2>
                </div>
                <button onClick={() => setSelectedProject(null)} className="p-2 hover:bg-white/5 rounded-full opacity-40">✕</button>
              </div>

              <div className={`p-6 rounded-2xl mb-8 leading-relaxed text-sm ${isDarkMode ? 'bg-[#0f111a] text-gray-400' : 'bg-gray-50 text-gray-600'}`}>
                {selectedProject.description}
              </div>

              <div className="flex items-center gap-6 mb-10">
                <div className="flex items-center gap-2">
                   <span className="text-xs font-bold opacity-40">TEAM SIZE:</span>
                   <span className="text-xs font-bold">{selectedProject.memberCount} Members</span>
                </div>
                <div className="flex items-center gap-2">
                   <span className="text-xs font-bold opacity-40">DEADLINE:</span>
                   <span className="text-xs font-bold">{formatDate(selectedProject.deadline)}</span>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex justify-end gap-3 pt-8 border-t border-white/5">
                <button onClick={() => setSelectedProject(null)} className="px-6 py-3 font-bold text-xs uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity">Close</button>
                
                {/* 🌟 ROLE-BASED SUPERVISION BUTTON 🌟 */}
                {canSupervise ? (
                  <button 
                    disabled={isActionLoading}
                    onClick={() => handleSupervise(selectedProject.id)}
                    className="px-8 py-3 bg-emerald-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
                  >
                    {isActionLoading ? 'Finalizing...' : 'Accept Supervision'}
                  </button>
                ) : (
                  <button className="px-8 py-3 bg-indigo-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/20">
                    Request to Join
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}