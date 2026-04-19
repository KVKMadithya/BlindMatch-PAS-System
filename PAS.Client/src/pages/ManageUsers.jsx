import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';

export default function ManageUsers() {
  // 🌟 Destructure searchQuery to power the live filter
  const { theme, isDarkMode, showToast, searchQuery } = useOutletContext();
  const navigate = useNavigate();
  
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5269/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      showToast("Database synchronization failed.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  // 🔍 THE LIVE SEARCH FILTER
  const filteredUsers = users.filter(user => 
    user.fullName.toLowerCase().includes((searchQuery || '').toLowerCase()) ||
    user.email.toLowerCase().includes((searchQuery || '').toLowerCase())
  );

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const response = await fetch('http://localhost:5269/api/admin/update-user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedUser)
      });
      if (response.ok) {
        showToast("Directory updated successfully.", "success");
        fetchUsers();
        setSelectedUser(null);
      }
    } finally { setIsUpdating(false); }
  };

  const handleRoleChange = async (newRole) => {
    const response = await fetch(`http://localhost:5269/api/admin/change-role?userId=${selectedUser.id}&newRole=${newRole}`, { method: 'POST' });
    if (response.ok) {
      showToast(`User transitioned to ${newRole}`, "success");
      fetchUsers();
      setSelectedUser(null);
    }
  };

  const handleToggleBan = async () => {
    const response = await fetch(`http://localhost:5269/api/admin/toggle-ban/${selectedUser.id}`, { method: 'POST' });
    if (response.ok) {
      showToast(selectedUser.isBanned ? "Access Restored" : "Access Revoked", "success");
      fetchUsers();
      setSelectedUser(null);
    }
  };

  const renderUserSection = (title, roleName, accentColor) => {
    const sectionUsers = filteredUsers.filter(u => u.role === roleName);
    if (sectionUsers.length === 0) return null;

    return (
      <div className="mb-14 animation-fade-in">
        <div className="flex items-center gap-4 mb-6 ml-2">
          <div className={`w-1 h-6 rounded-full ${accentColor}`}></div>
          <h2 className="text-lg font-bold tracking-tight uppercase opacity-80">
            {title} <span className="ml-2 text-xs font-medium opacity-40">[{sectionUsers.length}]</span>
          </h2>
        </div>

        <div className="flex flex-col gap-3">
          {sectionUsers.map(user => (
            <div 
              key={user.id} 
              className={`relative overflow-hidden group flex items-center justify-between p-4 px-8 rounded-2xl border transition-all duration-300 ${
                theme.card
              } ${user.isBanned ? 'border-rose-500/30' : 'hover:border-indigo-500/40 hover:translate-x-1'}`}
            >
              <div className="flex items-center gap-6 z-10">
                {/* Clean, Non-playful Avatar */}
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-black border ${
                  user.isBanned ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 'bg-indigo-500/5 border-indigo-500/20 text-indigo-400'
                }`}>
                  {user.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>

                <div className="flex flex-col">
                  <span className="font-bold text-[15px]">{user.fullName}</span>
                  <span className="text-[11px] opacity-40 font-medium tracking-wide">{user.email}</span>
                </div>
              </div>

              <div className="flex items-center gap-8 z-10">
                <div className="hidden md:flex flex-col items-end">
                   <span className="text-[10px] font-black uppercase tracking-widest opacity-30">Faculty</span>
                   <span className="text-xs font-bold">{user.faculty || 'Unassigned'}</span>
                </div>

                <div className="w-[100px] text-right">
                   {user.isBanned ? (
                     <span className="text-[9px] font-black bg-rose-500/10 text-rose-500 px-2 py-1 rounded border border-rose-500/20">RESTRICTED</span>
                   ) : (
                     <span className="text-[9px] font-black bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded border border-emerald-500/20">ACTIVE</span>
                   )}
                </div>

                <button 
                  onClick={() => setSelectedUser(user)}
                  className={`p-2 rounded-xl transition-all ${isDarkMode ? 'hover:bg-white/5 text-gray-500 hover:text-white' : 'hover:bg-gray-100 text-gray-400 hover:text-black'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                </button>
              </div>

              {/* Subtle background glow on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/0 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="animation-fade-in max-w-6xl mx-auto pb-20 px-4">
      
      {/* PROFESSIONAL HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-black tracking-tight">User Directory</h1>
            <div className={`h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]`}></div>
          </div>
          <p className={`${theme.textMuted} text-sm font-medium`}>
            {searchQuery ? `Filtering directory for "${searchQuery}"` : "Global administrative control and system auditing."}
          </p>
        </div>
        <div className={`px-4 py-2 rounded-xl border text-[9px] font-black tracking-[0.2em] shadow-sm ${isDarkMode ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-white border-gray-200 text-indigo-600'}`}>
          SUPER-USER ACCESS GRANTED
        </div>
      </div>

      {renderUserSection("Management", "Module Leader", "bg-indigo-500")}
      {renderUserSection("Academic Supervisors", "Supervisor", "bg-purple-500")}
      {renderUserSection("Student Registry", "Student", "bg-blue-500")}

      {/* NO RESULTS VIEW */}
      {filteredUsers.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center py-24 opacity-30">
          <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <p className="text-xl font-bold">No matching records found.</p>
        </div>
      )}

      {/* 🌟 MANAGEMENT MODAL 🌟 */}
      {selectedUser && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-[#0a0f1c]/90 backdrop-blur-md" onClick={() => setSelectedUser(null)}></div>
          
          <div className={`relative w-full max-w-2xl rounded-[2.5rem] border shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden transition-all ${
            isDarkMode ? 'bg-[#1c202f] border-white/10' : 'bg-white border-gray-200'
          }`}>
            <div className="p-12">
              <div className="flex justify-between items-start mb-10">
                <div>
                  <p className="text-indigo-400 font-black text-[10px] uppercase tracking-[0.3em] mb-2">{selectedUser.role} Profile</p>
                  <h2 className="text-4xl font-black tracking-tight">{selectedUser.fullName}</h2>
                </div>
                <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-white/5 rounded-full transition-colors opacity-40">✕</button>
              </div>

              {selectedUser.role === "Module Leader" ? (
                <div className="p-10 border border-white/5 bg-white/5 rounded-[2rem] text-center">
                  <p className="text-sm font-medium opacity-50 italic">Administrative Protection: Root accounts are immutable via the workspace interface.</p>
                </div>
              ) : (
                <form onSubmit={handleUpdate} className="grid grid-cols-2 gap-8">
                  <div className="col-span-2 md:col-span-1">
                    <label className="text-[9px] font-black uppercase tracking-widest opacity-30 ml-1">Official Name</label>
                    <input className={`w-full mt-2 p-4 rounded-xl border font-bold text-sm transition-all focus:ring-2 focus:ring-indigo-500/50 ${isDarkMode ? 'bg-[#0f111a] border-white/5' : 'bg-gray-50'}`} 
                      value={selectedUser.fullName} onChange={e => setSelectedUser({...selectedUser, fullName: e.target.value})} />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="text-[9px] font-black uppercase tracking-widest opacity-30 ml-1">Email Endpoint</label>
                    <input className={`w-full mt-2 p-4 rounded-xl border font-bold text-sm transition-all focus:ring-2 focus:ring-indigo-500/50 ${isDarkMode ? 'bg-[#0f111a] border-white/5' : 'bg-gray-50'}`} 
                      value={selectedUser.email} onChange={e => setSelectedUser({...selectedUser, email: e.target.value})} />
                  </div>

                  <div className="col-span-2 flex flex-col gap-4 mt-6 pt-10 border-t border-white/5">
                    <div className="flex flex-wrap gap-3">
                      <button type="submit" disabled={isUpdating} className="px-8 py-3 bg-indigo-500 text-white rounded-xl font-bold text-xs hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/30">
                        {isUpdating ? 'Synchronizing...' : 'Save Directory Changes'}
                      </button>
                      <button type="button" onClick={handleToggleBan} className={`px-8 py-3 rounded-xl font-bold text-xs transition-all ${
                        selectedUser.isBanned ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-rose-500 text-white hover:bg-rose-600'
                      }`}>
                        {selectedUser.isBanned ? 'Authorize Access' : 'Revoke Access'}
                      </button>
                    </div>

                    <div className="flex gap-3">
                      <button type="button" onClick={() => handleRoleChange('Supervisor')} className="flex-1 py-3 border border-white/10 hover:border-indigo-500/50 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all">Elevate to Supervisor</button>
                      <button type="button" onClick={() => handleRoleChange('Student')} className="flex-1 py-3 border border-white/10 hover:border-gray-500/50 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all">Assign as Student</button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}