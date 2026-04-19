import { useState, useEffect } from 'react';
import { useParams, useOutletContext, Link } from 'react-router-dom';

export default function ProjectResults() {
  const { projectId } = useParams();
  const { theme, isDarkMode } = useOutletContext();
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await fetch(`http://localhost:5269/api/project/results/${projectId}`);
        if (res.ok) {
          const data = await res.json();
          setResult(data);
        }
      } catch (error) {
        console.error("Results not found");
      } finally {
        setIsLoading(false);
      }
    };
    fetchResults();
  }, [projectId]);

  if (isLoading) return <div className="flex justify-center py-20"><div className="animate-spin h-10 w-10 border-b-2 border-indigo-500 rounded-full"></div></div>;

  if (!result) return (
    <div className="max-w-2xl mx-auto py-20 text-center">
      <h2 className="text-2xl font-bold opacity-30 italic">Results for this project are currently being processed by the Module Leader.</h2>
      <Link to="/dashboard" className="mt-6 inline-block text-indigo-500 font-bold">Return to Dashboard</Link>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto animation-fade-in pb-20">
      <div className="mb-10 flex justify-between items-center">
        <Link to="/dashboard" className="text-sm font-bold flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
           Back to Dashboard
        </Link>
        <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Official Assessment Report</span>
      </div>

      <div className={`relative overflow-hidden rounded-[3.5rem] border shadow-2xl p-12 lg:p-20 ${isDarkMode ? 'bg-[#1c202f] border-indigo-500/20' : 'bg-white border-gray-100'}`}>
        
        {/* Background Decorative Element */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 text-center">
          <h1 className="text-4xl lg:text-5xl font-black tracking-tight mb-4">{result.title}</h1>
          <div className="flex justify-center gap-4 mb-16">
             <span className="px-4 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                Validated
             </span>
             <span className="px-4 py-1 rounded-full bg-indigo-500/10 text-indigo-500 text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">
                Final Result
             </span>
          </div>

          {/* THE BIG SCORE */}
          <div className="mb-16">
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 mb-6">Aggregate Performance</p>
             <div className="inline-flex items-baseline gap-2">
                <span className="text-9xl font-black bg-gradient-to-br from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                  {result.marks}
                </span>
                <span className="text-4xl font-black opacity-20">%</span>
             </div>
          </div>

          {/* FEEDBACK BLOCK */}
          <div className={`text-left p-8 lg:p-12 rounded-[2.5rem] border ${isDarkMode ? 'bg-[#0f111a] border-gray-800' : 'bg-gray-50 border-gray-100'}`}>
             <h3 className="text-xs font-black uppercase tracking-widest text-indigo-500 mb-6 flex items-center gap-3">
                <span className="w-8 h-[1px] bg-indigo-500/30"></span>
                Assessor's Commentary
             </h3>
             <p className={`text-lg leading-loose italic font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                "{result.feedback}"
             </p>
          </div>

          <p className="mt-12 text-[10px] font-mono opacity-30">
            Published on: {new Date(result.gradedAt).toLocaleString()} • System ID: {projectId}
          </p>
        </div>
      </div>
    </div>
  );
}