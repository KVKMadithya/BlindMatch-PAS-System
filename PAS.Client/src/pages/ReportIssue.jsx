import { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';

export default function ReportIssue() {
  const { theme, isDarkMode, showToast } = useOutletContext();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ subject: '', message: '' });
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSending(true);
    const userId = localStorage.getItem('userId');

    try {
      const response = await fetch('http://localhost:5269/api/report/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, reporterId: parseInt(userId) })
      });
      if (response.ok) {
        showToast("Report submitted to Module Leader.", "success");
        navigate('/dashboard');
      }
    } finally { setIsSending(false); }
  };

  return (
    <div className="max-w-3xl mx-auto animation-fade-in pt-10">
      <h1 className="text-4xl font-black mb-2">Report an Issue</h1>
      <p className={`${theme.textMuted} mb-10`}>Your report will be reviewed by the Module Leader. Please provide clear details.</p>

      <form onSubmit={handleSubmit} className={`p-10 rounded-[3rem] border ${theme.card}`}>
        <div className="mb-6">
          <label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-1">Subject</label>
          <input required className={`w-full mt-2 p-4 rounded-2xl border transition-all ${isDarkMode ? 'bg-[#0f111a] border-gray-800' : 'bg-gray-50'}`}
            placeholder="e.g., Harassment, Technical Bug, Plagiarism"
            value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} />
        </div>
        <div className="mb-8">
          <label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-1">Detailed Message</label>
          <textarea required rows={6} className={`w-full mt-2 p-4 rounded-2xl border transition-all resize-none ${isDarkMode ? 'bg-[#0f111a] border-gray-800' : 'bg-gray-50'}`}
            placeholder="Please describe exactly what happened..."
            value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} />
        </div>
        <button disabled={isSending} className="w-full py-4 bg-indigo-500 text-white rounded-2xl font-bold hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/20">
          {isSending ? 'Transmitting...' : 'Send Official Report'}
        </button>
      </form>
    </div>
  );
}