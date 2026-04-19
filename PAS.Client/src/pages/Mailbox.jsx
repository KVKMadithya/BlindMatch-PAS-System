import { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';

export default function Mailbox() {
  const { theme, isDarkMode, showToast } = useOutletContext();
  
  // 🌟 Core States
  const [activeFolder, setActiveFolder] = useState('inbox');
  const [messages, setMessages] = useState({ inbox: [], sent: [] });
  const [users, setUsers] = useState([]); 
  
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isComposing, setIsComposing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // ✍️ Compose & Searchable Dropdown States
  const [composeData, setComposeData] = useState({ recipientId: '', subject: '', body: '' });
  const [isSending, setIsSending] = useState(false);
  
  const [contactSearch, setContactSearch] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // 🤝 Invite Response State
  const [isResponding, setIsResponding] = useState(false);

  const userId = localStorage.getItem('userId');

  // 🔄 FETCH DATA
  const fetchMailData = async () => {
    try {
      const [inboxRes, sentRes, usersRes] = await Promise.all([
        fetch(`http://localhost:5269/api/mail/inbox/${userId}`),
        fetch(`http://localhost:5269/api/mail/sent/${userId}`),
        fetch('http://localhost:5269/api/admin/users') 
      ]);

      if (inboxRes.ok && sentRes.ok && usersRes.ok) {
        const inboxData = await inboxRes.json();
        const sentData = await sentRes.json();
        const usersData = await usersRes.json();

        setMessages({ inbox: inboxData, sent: sentData });
        setUsers(usersData.filter(u => u.id.toString() !== userId));
      }
    } catch (error) {
      showToast("Mail sync failed.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchMailData(); }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 📖 READ MESSAGE LOGIC
  const handleSelectMessage = async (msg) => {
    setSelectedMessage(msg);
    setIsComposing(false);

    if (activeFolder === 'inbox' && !msg.isRead) {
      await fetch(`http://localhost:5269/api/mail/read/${msg.id}`, { method: 'PUT' });
      setMessages(prev => ({
        ...prev,
        inbox: prev.inbox.map(m => m.id === msg.id ? { ...m, isRead: true } : m)
      }));
    }
  };

  // ✉️ SEND MESSAGE LOGIC
  const handleSend = async (e) => {
    e.preventDefault();
    if (!composeData.recipientId) {
      showToast("Please select a valid recipient from the list.", "error");
      return;
    }

    setIsSending(true);

    try {
      const response = await fetch('http://localhost:5269/api/mail/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: parseInt(userId),
          recipientId: parseInt(composeData.recipientId),
          subject: composeData.subject,
          body: composeData.body
        })
      });

      if (response.ok) {
        showToast("Encrypted message sent.", "success");
        setIsComposing(false);
        setComposeData({ recipientId: '', subject: '', body: '' });
        setContactSearch('');
        await fetchMailData(); 
        setActiveFolder('sent');
        setSelectedMessage(null);
      }
    } finally {
      setIsSending(false);
    }
  };

  // ↩️ REPLY LOGIC
  const handleReply = () => {
    const sender = users.find(u => u.fullName === selectedMessage.senderName);
    
    setComposeData({
      recipientId: sender ? sender.id : '',
      subject: selectedMessage.subject.startsWith('Re:') ? selectedMessage.subject : `Re: ${selectedMessage.subject}`,
      body: `\n\n\n\n--- Original Message from ${selectedMessage.senderName} ---\n${selectedMessage.body}`
    });
    
    setContactSearch(''); 
    setIsComposing(true);
  };

  // 🚀 PROJECT INVITATION RESPONSE LOGIC
  const handleInviteResponse = async (action) => {
    setIsResponding(true);
    try {
      const response = await fetch('http://localhost:5269/api/project/respond-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: parseInt(userId),
          subject: selectedMessage.subject, 
          action: action 
        })
      });

      if (response.ok) {
        showToast(`You have ${action.toLowerCase()}ed the project invitation.`, "success");
        setSelectedMessage(null); 
        fetchMailData(); 
      } else {
        const err = await response.json();
        showToast(err.message || "Failed to process the response.", "error");
      }
    } catch (error) {
      showToast("Server connection failed.", "error");
    } finally {
      setIsResponding(false);
    }
  };

  // 🎨 HELPERS
  const currentList = activeFolder === 'inbox' ? messages.inbox : messages.sent;
  const unreadCount = messages.inbox.filter(m => !m.isRead).length;

  const filteredContacts = users.filter(u => 
    u.fullName.toLowerCase().includes(contactSearch.toLowerCase()) ||
    u.role.toLowerCase().includes(contactSearch.toLowerCase())
  );

  const selectedRecipientName = users.find(u => u.id.toString() === composeData.recipientId.toString())?.fullName || '';

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' - ' + date.toLocaleDateString();
  };

  if (isLoading) return <div className="flex justify-center py-20"><div className="animate-spin h-10 w-10 border-b-2 border-emerald-500 rounded-full"></div></div>;

  return (
    <div className={`h-[calc(100vh-8rem)] flex rounded-[2.5rem] border overflow-hidden shadow-2xl transition-all ${isDarkMode ? 'bg-[#161925]/80 border-gray-800' : 'bg-white border-gray-200'}`}>
      
      {/* ================= COLUMN 1: SIDEBAR NAV ================= */}
      {/* Reduced fixed width from w-64 to w-48 on standard screens, expanding to w-64 only on huge xl screens */}
      <div className="w-48 xl:w-64 flex-shrink-0 flex flex-col p-4 xl:p-6 border-r border-gray-800/50">
        <button 
          onClick={() => { 
            setIsComposing(true); 
            setSelectedMessage(null); 
            setComposeData({ recipientId: '', subject: '', body: '' }); 
            setContactSearch('');
          }}
          className="w-full mb-8 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded-xl font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
          <span className="hidden xl:inline">New Transmission</span>
          <span className="xl:hidden">Compose</span>
        </button>

        <nav className="flex flex-col gap-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2 mb-2">Mailboxes</p>
          
          <button onClick={() => {setActiveFolder('inbox'); setIsComposing(false); setSelectedMessage(null);}} className={`flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-all ${activeFolder === 'inbox' ? (isDarkMode ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-50 text-emerald-600') : 'text-gray-500 hover:bg-gray-800/50 hover:text-gray-300'}`}>
            <div className="flex items-center gap-3 truncate">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
              <span className="truncate">Inbox</span>
            </div>
            {unreadCount > 0 && <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]">{unreadCount}</span>}
          </button>

          <button onClick={() => {setActiveFolder('sent'); setIsComposing(false); setSelectedMessage(null);}} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeFolder === 'sent' ? (isDarkMode ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-50 text-emerald-600') : 'text-gray-500 hover:bg-gray-800/50 hover:text-gray-300'}`}>
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            <span className="truncate">Sent Mails</span>
          </button>
        </nav>
      </div>

      {/* ================= COLUMN 2: MESSAGE LIST ================= */}
      {/* Reduced from w-80 to w-64 on laptops, pushing it to w-80 only on huge xl screens */}
      <div className={`w-64 xl:w-80 flex-shrink-0 border-r flex flex-col ${isDarkMode ? 'border-gray-800/50 bg-[#0a0f1c]/30' : 'border-gray-200 bg-gray-50'}`}>
        <div className="p-4 xl:p-6 border-b border-gray-800/50">
          <h2 className="text-xl font-bold capitalize tracking-tight">{activeFolder}</h2>
          <p className="text-xs text-gray-500 mt-1">{currentList.length} Messages</p>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
          {currentList.length === 0 ? (
            <p className="text-center text-sm text-gray-500 mt-10">Nothing to display.</p>
          ) : (
            currentList.map(msg => {
              const entityName = activeFolder === 'inbox' ? (msg.senderName || 'System') : (msg.recipientName || 'Unknown');
              
              return (
                <div 
                  key={msg.id} 
                  onClick={() => handleSelectMessage(msg)}
                  className={`cursor-pointer p-4 rounded-2xl transition-all duration-300 border ${
                    selectedMessage?.id === msg.id 
                      ? (isDarkMode ? 'bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.05)]' : 'bg-white border-emerald-200 shadow-sm')
                      : (isDarkMode ? 'bg-[#161925] border-transparent hover:border-gray-700' : 'bg-transparent border-transparent hover:bg-white hover:border-gray-200')
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-sm font-bold truncate pr-2 ${activeFolder === 'inbox' && !msg.isRead ? 'text-white' : 'text-gray-400'}`}>
                      {activeFolder === 'inbox' ? entityName : `To: ${entityName}`}
                    </span>
                    {activeFolder === 'inbox' && !msg.isRead && <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] mt-1.5 flex-shrink-0"></div>}
                  </div>
                  
                  <p className={`text-xs font-bold mb-1 truncate ${msg.isSystemNotification ? 'text-amber-500' : (isDarkMode ? 'text-gray-300' : 'text-gray-700')}`}>
                    {msg.isSystemNotification ? '⚠️ ' : ''}{msg.subject}
                  </p>
                  <p className="text-[11px] text-gray-500 truncate">{msg.body}</p>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ================= COLUMN 3: READING / COMPOSE PANE ================= */}
      {/* Added min-w-0 to ensure flexbox doesn't push it off screen */}
      <div className={`flex-1 flex flex-col relative min-w-0 ${isDarkMode ? 'bg-[#0a0f1c]/50' : 'bg-white'}`}>
        
        {/* COMPOSING VIEW */}
        {isComposing ? (
          <div className="p-6 lg:p-10 animation-fade-in h-full flex flex-col">
            <h2 className="text-2xl font-black mb-8 tracking-tight">Compose Dispatch</h2>
            <form onSubmit={handleSend} className="flex-1 flex flex-col gap-6">
              
              <div className="flex items-center border-b border-gray-700/50 pb-4 relative" ref={dropdownRef}>
                <label className="text-xs font-black uppercase tracking-widest text-gray-500 w-20">To:</label>
                <div className="flex-1 relative">
                  <input 
                    type="text"
                    value={isDropdownOpen ? contactSearch : (selectedRecipientName || contactSearch)}
                    onChange={(e) => {
                      setContactSearch(e.target.value);
                      setIsDropdownOpen(true);
                      if (composeData.recipientId) setComposeData({...composeData, recipientId: ''});
                    }}
                    onFocus={() => setIsDropdownOpen(true)}
                    placeholder="Search by name or role..."
                    className="w-full bg-transparent border-none focus:ring-0 text-base font-bold placeholder-gray-600 p-0"
                  />
                  {isDropdownOpen && (
                    <div className={`absolute top-full left-0 right-0 mt-2 z-50 rounded-xl border shadow-2xl max-h-48 overflow-y-auto custom-scrollbar ${isDarkMode ? 'bg-[#1c202f] border-gray-700' : 'bg-white border-gray-200'}`}>
                      {filteredContacts.length === 0 ? (
                        <div className="p-4 text-xs text-gray-500 text-center">No contacts found.</div>
                      ) : (
                        filteredContacts.map(u => (
                          <div 
                            key={u.id}
                            onClick={() => {
                              setComposeData({...composeData, recipientId: u.id});
                              setIsDropdownOpen(false);
                              setContactSearch('');
                            }}
                            className={`p-3 cursor-pointer flex items-center justify-between border-b last:border-0 transition-colors ${isDarkMode ? 'border-gray-800 hover:bg-emerald-500/10' : 'border-gray-100 hover:bg-emerald-50'}`}
                          >
                            <span className="font-bold text-sm">{u.fullName}</span>
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">{u.role}</span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center border-b border-gray-700/50 pb-4">
                <label className="text-xs font-black uppercase tracking-widest text-gray-500 w-20">Subject:</label>
                <input 
                  required
                  type="text" 
                  value={composeData.subject}
                  onChange={e => setComposeData({...composeData, subject: e.target.value})}
                  placeholder="Enter transmission subject"
                  className="flex-1 bg-transparent border-none focus:ring-0 text-base font-bold placeholder-gray-600 p-0"
                />
              </div>

              <div className="flex-1 flex flex-col pt-2">
                <textarea 
                  required
                  value={composeData.body}
                  onChange={e => setComposeData({...composeData, body: e.target.value})}
                  placeholder="Draft your message here..."
                  className="flex-1 w-full bg-transparent border-none focus:ring-0 text-base resize-none custom-scrollbar placeholder-gray-700 leading-relaxed p-0"
                />
              </div>

              <div className="pt-4 border-t border-gray-700/50 flex justify-end">
                <button disabled={isSending} type="submit" className="px-8 py-3 bg-emerald-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2">
                  {isSending ? 'Transmitting...' : 'Send Message'}
                  {!isSending && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>}
                </button>
              </div>
            </form>
          </div>
        ) 
        
        /* READING VIEW */
        : selectedMessage ? (
          <div className="flex flex-col h-full animation-fade-in">
            {/* Reading Header: Reduced padding from p-10 to p-6 lg:p-8 */}
            <div className="p-6 lg:p-8 border-b border-gray-800/50 flex-shrink-0">
              <div className="flex justify-between items-start mb-6 gap-4">
                <h2 className="text-2xl font-black tracking-tight break-words">{selectedMessage.subject}</h2>
                
                {activeFolder === 'inbox' && !selectedMessage.isSystemNotification && (
                  <button onClick={handleReply} className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${isDarkMode ? 'bg-gray-800 hover:bg-emerald-500/20 hover:text-emerald-400 text-gray-300' : 'bg-gray-100 hover:bg-emerald-100 hover:text-emerald-700 text-gray-700'}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                    Reply
                  </button>
                )}
              </div>
              
              <div className="flex justify-between items-end">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xl flex-shrink-0 ${selectedMessage.isSystemNotification ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-400'}`}>
                    {(activeFolder === 'inbox' ? (selectedMessage.senderName || 'S') : (selectedMessage.recipientName || 'U')).charAt(0)}
                  </div>
                  <div className="truncate pr-4">
                    <p className="font-bold text-sm truncate">{activeFolder === 'inbox' ? selectedMessage.senderName : selectedMessage.recipientName}</p>
                    <p className="text-[10px] uppercase tracking-widest text-emerald-500 font-black">{activeFolder === 'inbox' ? selectedMessage.senderRole : selectedMessage.recipientRole}</p>
                  </div>
                </div>
                <p className="text-xs font-mono text-gray-500 flex-shrink-0">{formatDate(selectedMessage.createdAt)}</p>
              </div>
            </div>
            
            {/* Reading Body: Reduced padding and bumped text size to text-base */}
            <div className="p-6 lg:p-8 flex-1 overflow-y-auto custom-scrollbar">
              {selectedMessage.isSystemNotification && (
                <div className="mb-8 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 flex items-start gap-3">
                  <span className="text-xl">🛡️</span>
                  <div>
                    <p className="text-xs font-black uppercase text-amber-500 tracking-widest mb-1">Official System Alert</p>
                    <p className="text-sm text-amber-500/80">This is an automated notification generated by the BlindMatch system.</p>
                  </div>
                </div>
              )}
              
              {/* BUMPED TEXT SIZE HERE */}
              <div className={`text-base leading-relaxed whitespace-pre-wrap ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                {selectedMessage.body}
              </div>

              {/* 🌟 THE PROJECT INVITATION ACTION CARD 🌟 */}
              {selectedMessage.isSystemNotification && selectedMessage.subject.startsWith('Team Invitation:') && (
                <div className={`mt-10 p-6 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-6 ${isDarkMode ? 'border-indigo-500/30 bg-indigo-500/5' : 'border-indigo-200 bg-indigo-50'}`}>
                  <div>
                    <p className="text-sm font-bold">Action Required</p>
                    <p className="text-xs opacity-70 mt-1">Please formally accept or decline this research project invitation.</p>
                  </div>
                  <div className="flex gap-3 w-full sm:w-auto">
                    <button 
                      onClick={() => handleInviteResponse('Reject')}
                      disabled={isResponding}
                      className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all"
                    >
                      Decline
                    </button>
                    <button 
                      onClick={() => handleInviteResponse('Accept')}
                      disabled={isResponding}
                      className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest bg-emerald-500 text-white hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
                    >
                      {isResponding ? 'Processing...' : 'Accept Invite'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) 
        
        /* EMPTY STATE */
        : (
          <div className="flex-1 flex flex-col items-center justify-center opacity-30">
            <svg className="w-16 h-16 lg:w-24 lg:h-24 mb-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            <p className="text-lg lg:text-xl font-bold tracking-tight">Select a message to view</p>
          </div>
        )}

      </div>
    </div>
  );
}