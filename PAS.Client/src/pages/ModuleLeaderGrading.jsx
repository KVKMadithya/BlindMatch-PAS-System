import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';

export default function ModuleLeaderGrading() {
  const { theme, isDarkMode, showToast } = useOutletContext();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [marks, setMarks] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCompleted = async () => {
    try {
      const res = await fetch('http://localhost:5269/api/project/all-completed');
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (error) {
      showToast("Failed to load completed projects.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchCompleted(); }, []);

  const handleGradeSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProject || !marks) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:5269/api/project/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: selectedProject.id,
          marks: parseFloat(marks),
          feedback: feedback,
          gradedBy: parseInt(localStorage.getItem('userId'))
        })
      });

      if (response.ok) {
        showToast(`Marks published for ${selectedProject.title}`, "success");
        setProjects(prev => prev.filter(p => p.id !== selectedProject.id));
        setSelectedProject(null);
        setMarks('');
        setFeedback('');
      }
    } catch (error) {
      showToast("Failed to publish grade.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="flex justify-center py-20"><div className="animate-spin h-10 w-10 border-b-2 border-amber-500 rounded-full"></div></div>;

  return (
    <div className="max-w-7xl mx-auto animation-fade-in pb-12">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Assessment Panel</h1>
          <p className={theme.textMuted}>Final grading and feedback for completed research projects.</p>
        </div>
        <div className="flex gap-4">
          <div className={`px-6 py-3 rounded-2xl border ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 block mb-1">Queue</span>
            <span className="text-xl font-bold">{projects.length} Projects Pending</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* LEFT: THE LIST (Following your reference image's table feel) */}
        <div className={`flex-1 rounded-[2.5rem] border overflow-hidden shadow-2xl ${isDarkMode ? 'bg-[#161925]/80 border-gray-800' : 'bg-white border-gray-200'}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`text-[10px] font-black uppercase tracking-widest border-b ${isDarkMode ? 'border-gray-800 text-gray-500' : 'border-gray-100 text-gray-400'}`}>
                  <th className="px-8 py-6">Project Title</th>
                  <th className="px-6 py-6">Faculty</th>
                  <th className="px-6 py-6 text-center">Team Size</th>
                  <th className="px-8 py-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/20">
                {projects.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-20 text-center opacity-40 font-bold">No projects awaiting assessment.</td>
                  </tr>
                ) : (
                  projects.map(p => (
                    <tr 
                      key={p.id} 
                      className={`group transition-all ${selectedProject?.id === p.id ? (isDarkMode ? 'bg-amber-500/10' : 'bg-amber-50') : 'hover:bg-gray-500/5'}`}
                    >
                      <td className="px-8 py-6">
                        <span className="text-sm font-bold block">{p.title}</span>
                        <span className="text-[10px] opacity-40 uppercase tracking-tighter">Completed: {new Date(p.deadline).toLocaleDateString()}</span>
                      </td>
                      <td className="px-6 py-6">
                        <span className={`text-[11px] font-black uppercase px-3 py-1 rounded-full ${isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
                          {p.faculty}
                        </span>
                      </td>
                      <td className="px-6 py-6 text-center text-sm font-bold opacity-60">
                        {p.memberCount} Members
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button 
                          onClick={() => setSelectedProject(p)}
                          className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedProject?.id === p.id ? 'bg-amber-500 text-white' : 'bg-gray-500/10 hover:bg-amber-500/20 text-gray-400 hover:text-amber-500'}`}
                        >
                          Evaluate
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT: THE GRADING CARD */}
        <div className={`w-full lg:w-[400px] flex-shrink-0 sticky top-10`}>
          {selectedProject ? (
            <div className={`p-8 rounded-[2.5rem] border shadow-2xl transition-all ${isDarkMode ? 'bg-[#1c202f] border-amber-500/30' : 'bg-white border-amber-200'}`}>
              <h2 className="text-2xl font-black mb-2">Grading Session</h2>
              <p className="text-xs text-amber-500 font-bold uppercase tracking-widest mb-8">{selectedProject.title}</p>
              
              <form onSubmit={handleGradeSubmit} className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Final Score (%)</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      max="100" min="0" required
                      value={marks}
                      onChange={(e) => setMarks(e.target.value)}
                      placeholder="00"
                      className={`w-full text-5xl font-black bg-transparent border-none focus:ring-0 p-0 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                    />
                    <span className="absolute right-0 bottom-2 text-2xl font-black opacity-20">%</span>
                  </div>
                </div>

                <div className="pt-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Assessor's Feedback</label>
                  <textarea 
                    required
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Write constructive team feedback here..."
                    className={`w-full h-40 bg-transparent border rounded-2xl p-4 text-sm resize-none focus:ring-1 focus:ring-amber-500 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
                  />
                </div>

                <button 
                  disabled={isSubmitting}
                  className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-amber-500/20 transition-all hover:-translate-y-1"
                >
                  {isSubmitting ? 'Publishing...' : 'Confirm & Publish Result'}
                </button>
              </form>
            </div>
          ) : (
            <div className={`h-[400px] rounded-[2.5rem] border border-dashed flex flex-col items-center justify-center text-center p-10 ${isDarkMode ? 'border-gray-800 bg-gray-800/20' : 'border-gray-200 bg-gray-50'}`}>
              <div className="text-4xl mb-4 opacity-20">✍️</div>
              <p className="text-sm font-bold opacity-30">Select a project from the directory to begin the assessment.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}