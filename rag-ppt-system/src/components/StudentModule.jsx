import React, { useState } from 'react';
import { MessageSquare, BookOpen } from 'lucide-react';

export default function StudentModule() {
  const [question, setQuestion] = useState('');
  const [marks, setMarks] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAskAI = async () => {
    if (!question) return;
    setLoading(true);
    try {
      const res = await fetch('/api/ask-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, marks: marks ? parseInt(marks) : null }),
      });
      const data = await res.json();
      if (data.answer) setAnswer(data.answer);
      else alert(data.error);
    } catch (err) {
      alert('Error querying AI.');
    }
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-600" /> Ask AI (Study Notes RAG)
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Your Question / Topic</label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. Explain Virtualization in Cloud Computing"
              className="w-full px-3 py-2 border rounded-md border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Target Answer Formatting</label>
            <select
              value={marks}
              onChange={(e) => setMarks(e.target.value)}
              className="w-full px-3 py-2 border rounded-md border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="">Simple Explanation</option>
              <option value="2">2-Mark Format (Short & Crisp)</option>
              <option value="6">6-Mark Format (Structured Points)</option>
              <option value="10">10-Mark Format (Detailed & Comprehensive)</option>
            </select>
          </div>

          <button
            onClick={handleAskAI}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-md font-medium transition flex justify-center items-center gap-2"
          >
            <MessageSquare className="w-4 h-4" /> {loading ? 'Generating Explanation...' : 'Ask AI'}
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
        <h2 className="text-lg font-bold mb-4">AI Answer</h2>
        <div className="flex-1 bg-slate-50 border p-4 rounded-md text-slate-700 whitespace-pre-wrap text-sm leading-relaxed overflow-y-auto max-h-[450px]">
          {answer ? answer : 'Enter your question and click "Ask AI" to get an explanation from the study material.'}
        </div>
      </div>
    </div>
  );
}