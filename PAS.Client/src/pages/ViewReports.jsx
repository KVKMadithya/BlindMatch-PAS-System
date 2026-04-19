import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';

export default function ViewReports() {
  const { theme, isDarkMode, showToast } = useOutletContext();
  const [reports, setReports] = useState([]);
  const [replyId, setReplyId] = useState(null);
  const [responseText, setResponseText] = useState("");

  const fetchReports = () => {
    fetch('http://localhost:5269/api/report/all')
      .then(res => res.json())
      .then(data => setReports(data));
  };

  useEffect(() => { fetchReports(); }, []);

  const handleRespond = async (id) => {
    const response = await fetch(`http://localhost:5269/api/report/respond/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(responseText)
    });
    if (response.ok) {
      showToast("Response sent.", "success");
      setReplyId(null);
      setResponseText("");
      fetchReports();
    }
  };

  return (
    <div className="max-w-6xl mx-auto animation-fade-in">
      <h1 className="text-4xl font-black mb-10">Oversight Inbox</h1>
      
      <div className="space-y-6">
        {reports.map(report => (
          <div key={report.id} className={`p-8 rounded-[2.5rem] border transition-all ${theme.card} ${report.isResolved ? 'opacity-60 grayscale-[0.5]' : 'border-indigo-500/30'}`}>
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center font-bold text-indigo-400">
                  {report.senderName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{report.subject}</h3>
                  <p className="text-xs">
                    Sent by <span className="text-indigo-400 font-bold">{report.senderName}</span> 
                    <span className={`ml-2 px-2 py-0.5 rounded text-[10px] font-black uppercase border ${
                      report.senderRole === 'Supervisor' ? 'border-emerald-500/50 text-emerald-500' : 'border-blue-500/50 text-blue-500'
                    }`}>
                      {report.senderRole}
                    </span>
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono opacity-40">{new Date(report.createdAt).toLocaleString()}</span>
            </div>

            <p className={`p-5 rounded-2xl mb-6 text-sm leading-relaxed ${isDarkMode ? 'bg-[#0f111a]' : 'bg-gray-50'}`}>
              {report.message}
            </p>

            {report.isResolved ? (
              <div className="p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5">
                <p className="text-[10px] font-black text-emerald-500 uppercase mb-2">ML Response</p>
                <p className="text-sm italic">{report.adminResponse}</p>
              </div>
            ) : (
              replyId === report.id ? (
                <div className="mt-4">
                  <textarea className={`w-full p-4 rounded-2xl border ${isDarkMode ? 'bg-[#0f111a] border-gray-700' : 'bg-white'}`} 
                    placeholder="Write your response here..." value={responseText} onChange={e => setResponseText(e.target.value)} />
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => handleRespond(report.id)} className="px-6 py-2 bg-indigo-500 text-white rounded-xl text-sm font-bold">Send Response</button>
                    <button onClick={() => setReplyId(null)} className="px-6 py-2 border border-gray-700 rounded-xl text-sm font-bold">Cancel</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setReplyId(report.id)} className="px-6 py-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 rounded-xl text-sm font-bold hover:bg-indigo-500 hover:text-white transition-all">
                  Respond to Report
                </button>
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );
}