import { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';

export default function SupervisorCommand() {
  const { theme, isDarkMode, showToast } = useOutletContext();
  const userId = localStorage.getItem('userId');

  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSupervisedProjects = async () => {
      try {
        const res = await fetch(`http://localhost:5269/api/project/supervised/${userId}`);
        if (res.ok) {
          const data = await res.json();
          setProjects(data);
          if (data.length > 0) setSelectedProject(data[0]); // Auto-select the first one
        }
      } catch (error) {
        showToast("Failed to load supervised projects.", "error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSupervisedProjects();
  }, [userId, showToast]);

  if (isLoading) return <div className="flex justify-center py-20"><div className="animate-spin h-10 w-10 border-b-2 border-indigo-500 rounded-full"></div></div>;

  return (
    <div className="max-w-7xl mx-auto animation-fade-in pb-12">
      <div className="mb-8">
        <h1 className="text-4xl font-black tracking-tight mb-2">Supervisor Command</h1>
        <p className={theme.textMuted}>Monitor your mentored research groups and team rosters.</p>
      </div>

      {projects.length === 0 ? (
        <div className={`flex flex-col items-center justify-center py-32 rounded-[3rem] border-2 border-dashed ${isDarkMode ? 'border-gray-800 bg-[#0f111a]/50' : 'border-gray-200 bg-gray-50'}`}>
          <span className="text-6xl mb-4 opacity-50">👨‍🏫</span>
          <h3 className="text-xl font-bold opacity-50">You are not supervising any projects yet.</h3>
          <p className="text-sm mt-2 opacity-40">Check the Project Feed to find teams looking for a mentor.</p>
        </div>
      ) : (
        <div className={`flex h-[750px] rounded-[2.5rem] border overflow-hidden shadow-2xl ${isDarkMode ? 'bg-[#161925]/80 border-gray-800' : 'bg-white border-gray-200'}`}>
          
          {/* LEFT COLUMN: PROJECT LIST */}
          <div className={`w-80 flex-shrink-0 border-r flex flex-col ${isDarkMode ? 'border-gray-800/50 bg-[#0a0f1c]/30' : 'border-gray-200 bg-gray-50'}`}>
            <div className="p-6 border-b border-gray-800/50">
              <h2 className="text-sm font-black uppercase tracking-widest text-indigo-500">Mentored Projects</h2>
              <p className="text-xs text-gray-500 mt-1">{projects.length} Active Teams</p>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
              {projects.map(p => (
                <div 
                  key={p.id} 
                  onClick={() => setSelectedProject(p)}
                  className={`cursor-pointer p-4 rounded-2xl transition-all duration-300 border ${
                    selectedProject?.id === p.id 
                      ? (isDarkMode ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-indigo-50 border-indigo-200')
                      : (isDarkMode ? 'bg-transparent border-transparent hover:bg-gray-800/50' : 'bg-transparent border-transparent hover:bg-white')
                  }`}
                >
                  <p className="text-sm font-bold truncate mb-1">{p.title}</p>
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                    <span className="text-gray-500">{new Date(p.deadline).toLocaleDateString()}</span>
                    <span className="text-indigo-400">{p.members.length} Members</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN: TEAM DETAILS */}
          {selectedProject && (
            <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar p-8 lg:p-12">
              
              <div className="flex justify-between items-start gap-4 mb-8">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      {selectedProject.status}
                    </span>
                    <span className="text-xs font-bold text-gray-500">{selectedProject.faculty} Faculty</span>
                  </div>
                  <h2 className="text-3xl font-black tracking-tight mb-4">{selectedProject.title}</h2>
                  <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {selectedProject.description}
                  </p>
                </div>

                <Link to="/dashboard/workspace" className="flex-shrink-0 px-6 py-3 bg-indigo-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/20">
                  Open Workspace
                </Link>
              </div>

              <div className="mt-4">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                  <span className="text-2xl">👥</span> Team Roster
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedProject.members.map(member => (
                    <div key={member.id} className={`p-5 rounded-2xl border flex items-center gap-4 transition-all ${isDarkMode ? 'bg-[#0f111a] border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg ${member.inviteStatus === 'Accepted' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-gray-500/10 text-gray-400'}`}>
                        {member.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <p className="font-bold text-sm truncate">{member.name}</p>
                          {member.inviteStatus !== 'Accepted' && (
                            <span className="text-[9px] uppercase tracking-widest font-black text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded">Pending</span>
                          )}
                        </div>
                        <p className="text-[10px] font-mono text-gray-500 truncate mb-1">{member.email}</p>
                        <p className={`text-xs font-medium truncate ${isDarkMode ? 'text-indigo-300' : 'text-indigo-600'}`}>
                          {member.degreeProgram} <span className="opacity-50">({member.batch})</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>
      )}
    </div>
  );
}