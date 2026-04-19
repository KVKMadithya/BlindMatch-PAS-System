import { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';

export default function Dashboard() {
  const { theme, isDarkMode, userName, showToast, searchQuery } = useOutletContext();
  const userId = localStorage.getItem('userId');
  
  const [stats, setStats] = useState({
    successfulProjects: 0,
    activeDeadlines: 0,
    currentProjects: [],
    upcomingDeadlines: []
  });
  
  const [isLoading, setIsLoading] = useState(true);
  
  // 🔘 Modal States
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [projectToComplete, setProjectToComplete] = useState(null);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`http://localhost:5269/api/project/dashboard/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Dashboard sync error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { 
    fetchDashboardData(); 
  }, [userId]);

  const filteredProjects = stats.currentProjects.filter(project => {
    if (!searchQuery) return true;
    return project.title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // 🚀 ACTION: Mark Project as Completed
  const handleMarkComplete = async () => {
    if (!projectToComplete) return;
    try {
      const response = await fetch(`http://localhost:5269/api/project/complete/${projectToComplete}`, { 
        method: 'PUT' 
      });
      if (response.ok) {
        showToast("Project successfully archived for grading!", "success");
        fetchDashboardData(); // Refresh stats to show 'Completed' status
      }
    } catch (error) { 
      showToast("Server error occurred.", "error"); 
    } finally { 
      setProjectToComplete(null); 
    }
  };

  const confirmDelete = async () => {
    if (!projectToDelete) return;
    try {
      const response = await fetch(`http://localhost:5269/api/project/delete/${projectToDelete}`, { 
        method: 'DELETE' 
      });
      if (response.ok) {
        showToast("Project removed from ecosystem.", "success");
        fetchDashboardData();
      }
    } catch (error) { 
      showToast("Error deleting project.", "error"); 
    } finally { 
      setProjectToDelete(null); 
    }
  };

  const getCalendarDate = (dateString) => {
    const date = new Date(dateString);
    return {
      month: date.toLocaleString('default', { month: 'short' }),
      day: date.getDate().toString().padStart(2, '0')
    };
  };

  if (isLoading) return <div className="flex justify-center items-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div></div>;

  return (
    <>
      {/* 🌟 MODAL: MARK COMPLETE 🌟 */}
      {projectToComplete && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-[#0a0f1c]/80 backdrop-blur-md" onClick={() => setProjectToComplete(null)}></div>
          <div className={`relative w-full max-w-sm p-8 rounded-[2.5rem] border shadow-2xl ${isDarkMode ? 'bg-[#161925] border-emerald-500/30' : 'bg-white border-emerald-200'}`}>
             <div className="text-center">
                <div className="text-4xl mb-4">🏆</div>
                <h3 className="text-xl font-bold mb-2">Finalize Project?</h3>
                <p className={`text-sm mb-8 ${theme.textMuted}`}>This will archive the project and notify the Module Leader to begin the final assessment/grading.</p>
                <div className="flex gap-3">
                  <button onClick={() => setProjectToComplete(null)} className="flex-1 py-3 rounded-xl bg-gray-500/10 font-bold">Wait</button>
                  <button onClick={handleMarkComplete} className="flex-1 py-3 rounded-xl bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-500/20">Complete</button>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* 🌟 DELETE MODAL 🌟 */}
      {projectToDelete && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-[#0a0f1c]/80 backdrop-blur-md" onClick={() => setProjectToDelete(null)}></div>
          <div className={`relative w-full max-w-sm p-8 rounded-[2.5rem] border ${isDarkMode ? 'bg-[#161925] border-rose-500/30' : 'bg-white border-rose-200 shadow-xl'}`}>
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">Delete Project?</h3>
              <p className={`text-sm mb-8 ${theme.textMuted}`}>All data, team connections, and workspace progress will be permanently erased.</p>
              <div className="flex gap-3">
                <button onClick={() => setProjectToDelete(null)} className="flex-1 py-3 rounded-xl bg-gray-500/10 font-bold">Cancel</button>
                <button onClick={confirmDelete} className="flex-1 py-3 rounded-xl bg-rose-500 text-white font-bold">Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black mb-1 tracking-tight">Ecosystem Hub</h1>
          <p className={theme.textMuted}>Managing research for <span className="text-indigo-500 font-bold">{userName}</span></p>
        </div>
      </div>

      {/* STATS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className={`p-8 rounded-[2.5rem] border shadow-xl ${theme.card}`}>
          <p className={`text-[10px] font-black uppercase tracking-widest mb-3 ${theme.textMuted}`}>Archived Research</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-5xl font-black">{stats.successfulProjects}</h3>
            <span className="text-emerald-500 text-xs font-bold uppercase tracking-widest">Graded</span>
          </div>
        </div>

        <div className={`p-8 rounded-[2.5rem] border shadow-xl ${theme.card}`}>
          <p className={`text-[10px] font-black uppercase tracking-widest mb-3 ${theme.textMuted}`}>Critical Dates</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-5xl font-black">{stats.activeDeadlines}</h3>
            <span className="text-rose-500 text-xs font-bold uppercase tracking-widest">Active</span>
          </div>
        </div>

        <div className="p-8 rounded-[2.5rem] bg-indigo-600 text-white shadow-2xl shadow-indigo-500/30 relative overflow-hidden flex flex-col justify-center group">
             <h3 className="text-xl font-bold mb-2 transition-transform group-hover:translate-x-1">New Proposal?</h3>
             <Link to="/dashboard/post" className="w-fit bg-white text-indigo-600 px-6 py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:scale-105 transition-all">
                Start Now
             </Link>
           <div className="absolute -right-6 -bottom-6 text-9xl opacity-10 rotate-12 group-hover:rotate-0 transition-all">📝</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* PROJECT LIST */}
        <div className={`lg:col-span-2 p-8 rounded-[3rem] border shadow-2xl ${theme.card}`}>
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold">Active Research Groups</h3>
            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Total: {filteredProjects.length}</span>
          </div>
          
          <div className="space-y-4">
            {filteredProjects.length === 0 ? (
              <p className="text-center py-20 opacity-30 italic">No active projects found.</p>
            ) : (
              filteredProjects.map(project => (
                <div key={project.id} className={`p-6 rounded-[2rem] flex justify-between items-center border transition-all ${isDarkMode ? 'bg-[#0f111a]/50 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex gap-5 items-center">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-sm shadow-inner ${project.role === 'Leader' ? 'bg-indigo-500/20 text-indigo-400' : project.role === 'Supervisor' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                      {project.role.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-base mb-1 truncate max-w-[200px] xl:max-w-[300px]">{project.title}</h4>
                      <div className="flex gap-4">
                        <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${project.status === 'Graded' ? 'bg-indigo-500 text-white' : 'bg-gray-500/10 text-gray-500'}`}>{project.status}</span>
                        <span className="text-[9px] font-black text-gray-500 opacity-50 uppercase tracking-widest">{project.role}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {/* 🌟 ACTION BUTTONS 🌟 */}
                    {project.status === 'Graded' ? (
                       <Link 
                         to={`/dashboard/results/${project.id}`} 
                         className="px-5 py-2.5 rounded-xl bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/30 transition-transform hover:scale-105"
                       >
                         View Marks
                       </Link>
                    ) : project.status === 'Completed' ? (
                       <span className="px-4 py-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest italic animate-pulse">Awaiting Grade...</span>
                    ) : (
                      <>
                        <Link to="/dashboard/workspace" className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-indigo-600 hover:bg-gray-50'}`}>Workspace</Link>
                        {project.role === 'Leader' && project.status === 'Supervised' && (
                          <button onClick={() => setProjectToComplete(project.id)} className="px-5 py-2.5 rounded-xl bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-transform hover:scale-105">Complete</button>
                        )}
                        {project.role === 'Leader' && (
                          <button onClick={() => setProjectToDelete(project.id)} className="text-gray-500 hover:text-rose-500 transition-colors p-2">
                             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* CALENDAR */}
        <div className={`p-8 rounded-[3rem] border shadow-2xl ${theme.card}`}>
          <h3 className="text-xl font-bold mb-8">Calendar</h3>
          <div className="space-y-6">
            {stats.upcomingDeadlines.length === 0 ? (
               <p className="text-center py-10 opacity-30 text-sm italic">No upcoming events found.</p>
            ) : (
              stats.upcomingDeadlines.map((deadline, index) => {
                const dateParts = getCalendarDate(deadline.deadline);
                return (
                  <div key={deadline.id} className="flex gap-5 items-center group">
                    <div className={`p-4 rounded-2xl text-center min-w-[70px] transition-all group-hover:rotate-3 shadow-lg ${index % 2 === 0 ? 'bg-rose-500 text-white shadow-rose-500/30' : 'bg-indigo-500 text-white shadow-indigo-500/30'}`}>
                      <p className="text-[10px] uppercase font-black">{dateParts.month}</p>
                      <p className="text-2xl font-black">{dateParts.day}</p>
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm truncate">{deadline.title}</h4>
                      <p className={`text-[9px] font-black uppercase tracking-[0.2em] mt-1 ${theme.textMuted}`}>{deadline.status}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
}