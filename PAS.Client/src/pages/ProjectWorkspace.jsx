import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';

export default function ProjectWorkspace() {
  const { theme, isDarkMode, showToast } = useOutletContext();
  const userId = localStorage.getItem('userId');

  const [myProjects, setMyProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [workspace, setWorkspace] = useState({ tasks: [], comments: [], githubRepoUrl: '' });
  
  // Forms
  const [newTask, setNewTask] = useState({ taskName: '', startDate: '', endDate: '', progress: 0 });
  const [newComment, setNewComment] = useState('');
  const [githubUrl, setGithubUrl] = useState('');

  // 1. Fetch Dropdown Projects (Now powered by our updated C# query!)
  useEffect(() => {
    if (!userId) return;
    fetch(`http://localhost:5269/api/workspace/my-projects/${userId}`)
      .then(res => res.json())
      .then(data => setMyProjects(data))
      .catch(() => showToast("Failed to load workspace projects.", "error"));
  }, [userId, showToast]);

  // 2. Fetch Workspace Data when a project is selected
  const fetchWorkspace = async (projectId) => {
    if (!projectId) {
      setWorkspace({ tasks: [], comments: [], githubRepoUrl: '' });
      setGithubUrl('');
      return;
    }
    try {
      const res = await fetch(`http://localhost:5269/api/workspace/${projectId}`);
      if (res.ok) {
        const data = await res.json();
        setWorkspace(data);
        setGithubUrl(data.githubRepoUrl || '');
      }
    } catch (error) {
      showToast("Failed to load project details.", "error");
    }
  };

  useEffect(() => { fetchWorkspace(selectedProjectId); }, [selectedProjectId]);

  // Actions
  const handleAddTask = async (e) => {
    e.preventDefault();
    await fetch('http://localhost:5269/api/workspace/task', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newTask, projectId: selectedProjectId })
    });
    showToast("Task added to timeline.", "success");
    setNewTask({ taskName: '', startDate: '', endDate: '', progress: 0 });
    fetchWorkspace(selectedProjectId);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    await fetch('http://localhost:5269/api/workspace/comment', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId: selectedProjectId, userId: parseInt(userId), message: newComment })
    });
    setNewComment('');
    fetchWorkspace(selectedProjectId);
  };

  const handleUpdateGithub = async () => {
    await fetch(`http://localhost:5269/api/workspace/github/${selectedProjectId}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(githubUrl)
    });
    showToast("GitHub link synced.", "success");
  };

  // 🌟 GANTT CHART MATH 🌟
  const calculateGanttStyles = (start, end) => {
    if (workspace.tasks.length === 0) return { left: '0%', width: '100%' };
    
    const minDate = new Date(Math.min(...workspace.tasks.map(t => new Date(t.startDate))));
    const maxDate = new Date(Math.max(...workspace.tasks.map(t => new Date(t.endDate))));
    const totalDuration = maxDate - minDate || 1; 

    const taskStart = new Date(start);
    const taskEnd = new Date(end);
    
    const leftPercent = ((taskStart - minDate) / totalDuration) * 100;
    const widthPercent = ((taskEnd - taskStart) / totalDuration) * 100;

    return { 
      left: `${Math.max(0, leftPercent)}%`, 
      width: `${Math.max(5, widthPercent)}%` 
    };
  };

  return (
    <div className="max-w-7xl mx-auto animation-fade-in pb-12">
      
      {/* 🌟 HEADER & PROJECT SELECTOR 🌟 */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Project Workspace</h1>
          <p className={theme.textMuted}>Manage timelines, sync repositories, and communicate with your team.</p>
        </div>
        
        <select 
          value={selectedProjectId} 
          onChange={(e) => setSelectedProjectId(e.target.value)}
          className={`px-6 py-3 rounded-2xl font-bold shadow-lg appearance-none cursor-pointer border focus:ring-2 focus:ring-indigo-500 transition-all ${isDarkMode ? 'bg-[#1c202f] border-gray-700 text-indigo-400' : 'bg-white border-gray-200 text-indigo-600'}`}
        >
          <option value="">Select a Project to View...</option>
          {myProjects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
        </select>
      </div>

      {!selectedProjectId ? (
        <div className={`flex flex-col items-center justify-center py-32 rounded-[3rem] border-2 border-dashed ${isDarkMode ? 'border-gray-800 bg-[#0f111a]/50' : 'border-gray-200 bg-gray-50'}`}>
          <span className="text-6xl mb-4 opacity-50">📊</span>
          <h3 className="text-xl font-bold opacity-50">Select a project to load the workspace</h3>
          {myProjects.length === 0 && (
            <p className="text-sm mt-2 opacity-40">You don't have any active projects yet.</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 🌟 LEFT COLUMN: GANTT CHART & GITHUB 🌟 */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            
            {/* GitHub Section */}
            <div className={`p-6 rounded-[2rem] border shadow-lg flex flex-col sm:flex-row items-center gap-4 ${isDarkMode ? 'bg-[#1c202f] border-gray-700/50' : 'bg-white border-gray-200'}`}>
              <div className="p-3 bg-gray-800 rounded-xl text-white"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg></div>
              <input 
                value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="Paste GitHub Repository Link here..."
                className={`flex-1 bg-transparent border-none focus:ring-0 font-medium ${theme.textMain}`}
              />
              <button onClick={handleUpdateGithub} className="px-6 py-2.5 bg-gray-800 hover:bg-black text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all">Link Repo</button>
            </div>

            {/* Gantt Chart UI */}
            <div className={`p-8 rounded-[2.5rem] border shadow-2xl overflow-hidden ${isDarkMode ? 'bg-[#1c202f] border-gray-700/50' : 'bg-white border-gray-200'}`}>
              <h2 className="text-2xl font-black mb-8">Timeline & Gantt</h2>
              
              <div className="relative pt-6 pb-12 border-l-2 border-dashed border-gray-500/30 pl-4 space-y-6">
                {workspace.tasks.length === 0 ? (
                  <p className="text-sm opacity-50 italic">No tasks added yet. Start planning below.</p>
                ) : (
                  workspace.tasks.map(task => {
                    const styles = calculateGanttStyles(task.startDate, task.endDate);
                    return (
                      <div key={task.id} className="relative w-full h-12 bg-gray-500/10 rounded-xl">
                        {/* THE 3D GLOSSY TASK BAR */}
                        <div 
                          style={{ left: styles.left, width: styles.width }}
                          className="absolute h-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 shadow-[0_10px_20px_-10px_rgba(99,102,241,0.8)] border-t border-white/30 flex items-center px-4 overflow-hidden group transition-all hover:-translate-y-1 hover:shadow-[0_15px_30px_-10px_rgba(99,102,241,1)]"
                        >
                          <div style={{ width: `${task.progress}%` }} className="absolute left-0 top-0 bottom-0 bg-white/20"></div>
                          <span className="relative z-10 text-white font-bold text-xs truncate drop-shadow-md">
                            {task.taskName} ({task.progress}%)
                          </span>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              {/* Add Task Form */}
              <form onSubmit={handleAddTask} className="mt-8 pt-8 border-t border-gray-700/30 flex flex-wrap gap-3">
                <input required placeholder="Task Name" value={newTask.taskName} onChange={e => setNewTask({...newTask, taskName: e.target.value})} className={`flex-1 min-w-[200px] p-3 rounded-xl border text-sm ${isDarkMode ? 'bg-[#0f111a] border-gray-700' : 'bg-gray-50'}`} />
                <input required type="date" value={newTask.startDate} onChange={e => setNewTask({...newTask, startDate: e.target.value})} className={`w-36 p-3 rounded-xl border text-sm ${isDarkMode ? 'bg-[#0f111a] border-gray-700' : 'bg-gray-50'}`} />
                <input required type="date" value={newTask.endDate} onChange={e => setNewTask({...newTask, endDate: e.target.value})} className={`w-36 p-3 rounded-xl border text-sm ${isDarkMode ? 'bg-[#0f111a] border-gray-700' : 'bg-gray-50'}`} />
                <button className="px-6 py-3 bg-indigo-500 text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/20">Add Task</button>
              </form>
            </div>
          </div>

          {/* 🌟 RIGHT COLUMN: COMMENTS / CHAT 🌟 */}
          <div className={`flex flex-col h-[800px] rounded-[2.5rem] border shadow-xl overflow-hidden ${isDarkMode ? 'bg-[#1c202f] border-gray-700/50' : 'bg-white border-gray-200'}`}>
            <div className="p-6 border-b border-gray-700/30">
              <h2 className="text-xl font-black">Team Discussion</h2>
              <p className="text-xs opacity-50">Private space for members and supervisor</p>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {workspace.comments.length === 0 ? (
                <p className="text-center text-xs opacity-50 mt-10">No messages yet. Say hello!</p>
              ) : (
                workspace.comments.map(c => (
                  <div key={c.id} className={`p-4 rounded-2xl ${c.senderRole === 'Supervisor' ? 'bg-emerald-500/10 border border-emerald-500/20' : (isDarkMode ? 'bg-[#0f111a]' : 'bg-gray-50')}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="text-xs font-bold mr-2">{c.senderName}</span>
                        <span className={`text-[9px] uppercase tracking-widest font-black ${c.senderRole === 'Supervisor' ? 'text-emerald-500' : 'text-indigo-400'}`}>{c.senderRole}</span>
                      </div>
                      <span className="text-[9px] opacity-40">{new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm leading-relaxed">{c.message}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleAddComment} className={`p-4 border-t ${isDarkMode ? 'border-gray-700/30 bg-[#161925]' : 'bg-gray-50'}`}>
              <div className="flex gap-2">
                <input required value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Type a message..." className={`flex-1 p-3 rounded-xl border text-sm ${isDarkMode ? 'bg-[#0f111a] border-gray-700 focus:ring-indigo-500' : 'bg-white border-gray-200'}`} />
                <button className="px-6 py-3 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/20">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                </button>
              </div>
            </form>
          </div>

        </div>
      )}
    </div>
  );
}