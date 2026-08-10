import React, { useState } from 'react';
import StudentModule from './components/StudentModule';
import FacultyModule from './components/FacultyModule';
import { Lock, GraduationCap, ShieldCheck } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('student');
  const [facultyPasscode, setFacultyPasscode] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passInput, setPassInput] = useState('');

  const handleUnlock = (e) => {
    e.preventDefault();
    if (passInput.trim()) {
      setFacultyPasscode(passInput);
      setIsUnlocked(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <header className="bg-slate-900 text-white p-4 shadow-md flex justify-between items-center">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-indigo-400" /> Academic RAG & PPT Suite
        </h1>
        <div className="flex gap-2 bg-slate-800 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('student')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
              activeTab === 'student' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Student Portal
          </button>
          <button
            onClick={() => setActiveTab('faculty')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition flex items-center gap-1 ${
              activeTab === 'faculty' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" /> Faculty Portal
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-6xl w-full mx-auto">
        {activeTab === 'student' ? (
          <StudentModule />
        ) : isUnlocked ? (
          <FacultyModule passcode={facultyPasscode} />
        ) : (
          <div className="max-w-md mx-auto mt-16 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-center mb-4 text-indigo-600">
              <ShieldCheck className="w-12 h-12" />
            </div>
            <h2 className="text-lg font-semibold text-center mb-2">Faculty Access Authentication</h2>
            <p className="text-sm text-slate-500 text-center mb-4">
              Enter the faculty passcode to access slide generation and document management tools.
            </p>
            <form onSubmit={handleUnlock} className="space-y-4">
              <input
                type="password"
                placeholder="Enter Faculty Passcode"
                value={passInput}
                onChange={(e) => setPassInput(e.target.value)}
                className="w-full px-3 py-2 border rounded-md border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-md font-medium transition"
              >
                Access Faculty Suite
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}