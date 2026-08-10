import React, { useState } from 'react';
import pptxgen from 'pptxgenjs';
import { Upload, FileText, Download } from 'lucide-react';

export default function FacultyModule({ passcode }) {
  const [topicContent, setTopicContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [slides, setSlides] = useState([]);

  const handlePDFUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('pdf', file);

    const res = await fetch('/api/upload-pdf', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    alert(data.message || data.error);
  };

  const handleGeneratePPT = async () => {
    if (!topicContent) return;
    setLoading(true);
    try {
      const res = await fetch('/api/faculty/generate-ppt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-faculty-code': passcode,
        },
        body: JSON.stringify({ topicText: topicContent }),
      });
      const data = await res.json();
      if (data.slides) setSlides(data.slides);
      else alert(data.error);
    } catch (err) {
      alert('Error generating slides.');
    }
    setLoading(false);
  };

  const downloadPPTX = () => {
    const ppt = new pptxgen();
    slides.forEach((slide) => {
      const s = ppt.addSlide();
      s.addText(slide.title, { x: 0.5, y: 0.5, fontSize: 24, bold: true, color: '1F2937' });
      s.addText(slide.bullets.join('\n'), { x: 0.5, y: 1.5, fontSize: 16, color: '4B5563' });
    });
    ppt.writeFile({ fileName: 'Lecture_Presentation.pptx' });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Upload className="w-5 h-5 text-indigo-600" /> Upload Notes PDF for Students
        </h2>
        <input type="file" accept="application/pdf" onChange={handlePDFUpload} className="block w-full text-sm text-slate-500" />
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-600" /> Generate PPT from Content
        </h2>
        <textarea
          rows={5}
          value={topicContent}
          onChange={(e) => setTopicContent(e.target.value)}
          placeholder="Paste textbook content or enter topic details here..."
          className="w-full p-3 border rounded-md border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none mb-4"
        />
        <button
          onClick={handleGeneratePPT}
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-md font-medium transition"
        >
          {loading ? 'Generating Slides...' : 'Generate PPT Structure'}
        </button>
      </div>

      {slides.length > 0 && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">Generated Slides ({slides.length})</h3>
            <button
              onClick={downloadPPTX}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium"
            >
              <Download className="w-4 h-4" /> Download .pptx
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {slides.map((s, idx) => (
              <div key={idx} className="border p-4 rounded-md bg-slate-50">
                <h4 className="font-bold text-slate-800 mb-2">{idx + 1}. {s.title}</h4>
                <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
                  {s.bullets.map((b, bIdx) => <li key={bIdx}>{b}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}