import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Types for entries
interface SymptomEntry {
  date: string;
  symptom: string;
  severity: string;
  notes?: string;
}
interface MealEntry {
  date: string;
  meal: string;
  notes?: string;
}
interface MedicationEntry {
  date: string;
  medication: string;
  dose: string;
  notes?: string;
}

const moods = [
  { label: '😊', value: 'happy' },
  { label: '😐', value: 'neutral' },
  { label: '😢', value: 'sad' },
  { label: '😡', value: 'angry' },
  { label: '😴', value: 'tired' },
  { label: '🤒', value: 'sick' },
];

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

const TrackerDashboard: React.FC = () => {
  const [tab, setTab] = useState<'symptoms' | 'mood' | 'meals' | 'medications' | 'analysis'>('symptoms');

  const [symptoms, setSymptoms] = useState<SymptomEntry[]>([]);
  const [symptomsLoading, setSymptomsLoading] = useState(false);
  const [symptomsError, setSymptomsError] = useState<string | null>(null);

  const [meals, setMeals] = useState<MealEntry[]>([]);
  const [mealsLoading, setMealsLoading] = useState(false);
  const [mealsError, setMealsError] = useState<string | null>(null);

  const [medications, setMedications] = useState<MedicationEntry[]>([]);
  const [medicationsLoading, setMedicationsLoading] = useState(false);
  const [medicationsError, setMedicationsError] = useState<string | null>(null);

  const [moodLog, setMoodLog] = useState<{ [date: string]: string }>({});
  const [moodLoading, setMoodLoading] = useState(false);
  const [moodError, setMoodError] = useState<string | null>(null);

  // Form states
  const [symptomForm, setSymptomForm] = useState({ date: getToday(), symptom: '', severity: '', notes: '' });
  const [mealForm, setMealForm] = useState({ date: getToday(), meal: '', notes: '' });
  const [medForm, setMedForm] = useState({ date: getToday(), medication: '', dose: '', notes: '' });

  // Calendar helpers
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  function daysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
  }
  function getMonthDays(monthStr: string) {
    const [year, month] = monthStr.split('-').map(Number);
    return Array.from({ length: daysInMonth(year, month - 1) }, (_, i) => i + 1);
  }

  // Helper to format date as YYYY-MM-DD
  function formatDate(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  // --- Mood calendar selection state ---
  const [moodSelectDay, setMoodSelectDay] = useState<string | null>(null);

  // --- Fetch all tracker data from backend ---
  async function fetchTrackerData() {
    setSymptomsLoading(true);
    setMealsLoading(true);
    setMedicationsLoading(true);
    setMoodLoading(true);
    setSymptomsError(null);
    setMealsError(null);
    setMedicationsError(null);
    setMoodError(null);
    try {
      const [symRes, mealRes, medRes, moodRes] = await Promise.all([
        axios.get('/api/tracker/symptoms'),
        axios.get('/api/tracker/meals'),
        axios.get('/api/tracker/medications'),
        axios.get('/api/tracker/moods'),
      ]);
      setSymptoms(symRes.data || []);
      setMeals(mealRes.data || []);
      setMedications(medRes.data || []);
      setMoodLog(moodRes.data.reduce((acc: { [date: string]: string }, m: any) => {
        acc[m.date] = m.mood;
        return acc;
      }, {}));
    } catch (err) {
      setSymptomsError('Failed to load symptoms');
      setMealsError('Failed to load meals');
      setMedicationsError('Failed to load medications');
      setMoodError('Failed to load moods');
    } finally {
      setSymptomsLoading(false);
      setMealsLoading(false);
      setMedicationsLoading(false);
      setMoodLoading(false);
    }
  }

  // Initial load
  useEffect(() => {
    fetchTrackerData();
  }, []);


  // Handlers
  const handleSymptomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSymptomsLoading(true);
    setSymptomsError(null);
    try {
      await axios.post('/api/tracker/symptoms', symptomForm);
      setSymptomForm({ date: getToday(), symptom: '', severity: '', notes: '' });
      fetchTrackerData();
    } catch (err: any) {
      setSymptomsError('Failed to log symptom');
    } finally {
      setSymptomsLoading(false);
    }
  };
  const handleMealSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMealsLoading(true);
    setMealsError(null);
    try {
      await axios.post('/api/tracker/meals', mealForm);
      setMealForm({ date: getToday(), meal: '', notes: '' });
      fetchTrackerData();
    } catch (err: any) {
      setMealsError('Failed to log meal');
    } finally {
      setMealsLoading(false);
    }
  };
  const handleMedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMedicationsLoading(true);
    setMedicationsError(null);
    try {
      await axios.post('/api/tracker/medications', medForm);
      setMedForm({ date: getToday(), medication: '', dose: '', notes: '' });
      fetchTrackerData();
    } catch (err: any) {
      setMedicationsError('Failed to log medication');
    } finally {
      setMedicationsLoading(false);
    }
  };
  const handleMoodSelect = async (date: string, mood: string) => {
    setMoodLoading(true);
    setMoodError(null);
    try {
      await axios.post('/api/tracker/moods', { date, mood });
      fetchTrackerData();
    } catch (err: any) {
      setMoodError('Failed to log mood');
    } finally {
      setMoodLoading(false);
    }
  };

  // Calendar navigation
  const handlePrevMonth = () => {
    const [year, month] = calendarMonth.split('-').map(Number);
    const d = new Date(year, month - 2, 1);
    setCalendarMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };
  const handleNextMonth = () => {
    const [year, month] = calendarMonth.split('-').map(Number);
    const d = new Date(year, month, 1);
    setCalendarMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-[#f8fafc] to-[#e0e7ef] dark:from-[#181f2a] dark:to-[#232946] rounded-2xl shadow-2xl p-4 backdrop-blur-md">
      {/* Modern Tabs */}
      <div className="flex justify-center gap-2 mb-6">
        {[
          { key: 'symptoms', label: 'Symptoms', color: 'from-blue-400 to-cyan-400' },
          { key: 'mood', label: 'Mood', color: 'from-pink-400 to-fuchsia-400' },
          { key: 'meals', label: 'Meals', color: 'from-green-400 to-lime-400' },
          { key: 'medications', label: 'Medications', color: 'from-purple-400 to-indigo-400' },
          { key: 'analysis', label: 'Analysis', color: 'from-yellow-400 to-orange-400' },
        ].map(tabObj => (
          <button
            key={tabObj.key}
            className={`transition-all duration-300 px-4 py-2 rounded-xl font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-300 backdrop-blur-sm ${tab === tabObj.key ? `bg-gradient-to-r ${tabObj.color} text-white scale-105` : 'bg-white/60 dark:bg-black/30 text-gray-600 dark:text-gray-300 hover:bg-gray-100'}`}
            onClick={() => setTab(tabObj.key as typeof tab)}
          >
            {tabObj.label}
          </button>
        ))}
      </div>
      {/* Animated Content Switch */}
      <div className="flex-1 overflow-y-auto transition-all duration-500">
        {tab === 'symptoms' && (
          <div>
            <form className="mb-4 flex flex-col gap-2" onSubmit={handleSymptomSubmit}>
              <div className="flex gap-2">
                <input type="date" className="border rounded p-1" value={symptomForm.date} onChange={e => setSymptomForm(f => ({ ...f, date: e.target.value }))} required />
                <input type="text" className="border rounded p-1 flex-1" placeholder="Symptom" value={symptomForm.symptom} onChange={e => setSymptomForm(f => ({ ...f, symptom: e.target.value }))} required />
                <select className="border rounded p-1" value={symptomForm.severity} onChange={e => setSymptomForm(f => ({ ...f, severity: e.target.value }))} required>
                  <option value="">Severity</option>
                  <option value="mild">Mild</option>
                  <option value="moderate">Moderate</option>
                  <option value="severe">Severe</option>
                </select>
              </div>
              <textarea className="border rounded p-1" placeholder="Notes (optional)" value={symptomForm.notes} onChange={e => setSymptomForm(f => ({ ...f, notes: e.target.value }))} />
              <button className="self-end bg-blue-600 text-white px-4 py-1 rounded" type="submit">Add Symptom</button>
            </form>
            <div>
              <h3 className="font-bold mb-2">Logged Symptoms</h3>
              <ul className="space-y-1">
                {symptoms.map((entry, i) => (
                  <li key={i} className="border p-2 rounded text-sm flex flex-col">
                    <span><b>{entry.date}</b> - {entry.symptom} ({entry.severity})</span>
                    {entry.notes && <span className="text-gray-500">{entry.notes}</span>}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
        {tab === 'meals' && (
          <div className="max-w-xl mx-auto">
            <div className="bg-white/70 dark:bg-black/30 rounded-2xl shadow-lg p-6 mb-6 backdrop-blur-md border border-green-100 dark:border-green-900">
              <h2 className="text-xl font-bold mb-4 text-green-700 dark:text-green-300 flex items-center gap-2"><span>🍽️</span> Log Meal</h2>
              <form className="flex flex-col gap-4" onSubmit={handleMealSubmit}>
                <div className="flex gap-2">
                  <input type="date" className="flex-1 border-none rounded-lg p-2 bg-gray-100 dark:bg-gray-800 focus:ring-2 focus:ring-green-300" value={mealForm.date} onChange={e => setMealForm(f => ({ ...f, date: e.target.value }))} required />
                  <input type="text" className="flex-1 border-none rounded-lg p-2 bg-gray-100 dark:bg-gray-800 focus:ring-2 focus:ring-green-300" placeholder="Meal" value={mealForm.meal} onChange={e => setMealForm(f => ({ ...f, meal: e.target.value }))} required />
                </div>
                <textarea className="border-none rounded-lg p-2 bg-gray-100 dark:bg-gray-800 focus:ring-2 focus:ring-green-300" placeholder="Notes (optional)" value={mealForm.notes} onChange={e => setMealForm(f => ({ ...f, notes: e.target.value }))} />
                <button className="self-end bg-gradient-to-r from-green-400 to-lime-400 hover:from-lime-400 hover:to-green-400 text-white px-6 py-2 rounded-lg shadow-lg font-semibold transition-all duration-300" type="submit">Add Meal</button>
              </form>
            </div>
            <div className="bg-white/70 dark:bg-black/30 rounded-2xl shadow p-4 backdrop-blur-md border border-green-100 dark:border-green-900">
              <h3 className="font-bold mb-2 text-green-700 dark:text-green-300 flex items-center gap-2"><span>📋</span> Logged Meals</h3>
              <ul className="space-y-2">
                {meals.map((entry: any, i: number) => (
                  <li key={i} className="bg-green-50/60 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-3 text-sm flex flex-col shadow-sm">
                    <span><b>{entry.date}</b> - {entry.meal}</span>
                    {entry.notes && <span className="text-gray-500 mt-1">{entry.notes}</span>}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )
        {tab === 'medications' && (
          <div className="max-w-xl mx-auto">
            <div className="bg-white/70 dark:bg-black/30 rounded-2xl shadow-lg p-6 mb-6 backdrop-blur-md border border-purple-100 dark:border-purple-900">
              <h2 className="text-xl font-bold mb-4 text-purple-700 dark:text-purple-300 flex items-center gap-2"><span>💊</span> Log Medication</h2>
              <form className="flex flex-col gap-4" onSubmit={handleMedSubmit}>
                <div className="flex gap-2">
                  <input type="date" className="flex-1 border-none rounded-lg p-2 bg-gray-100 dark:bg-gray-800 focus:ring-2 focus:ring-purple-300" value={medForm.date} onChange={e => setMedForm(f => ({ ...f, date: e.target.value }))} required />
                  <input type="text" className="flex-1 border-none rounded-lg p-2 bg-gray-100 dark:bg-gray-800 focus:ring-2 focus:ring-purple-300" placeholder="Medication" value={medForm.medication} onChange={e => setMedForm(f => ({ ...f, medication: e.target.value }))} required />
                  <input type="text" className="w-24 border-none rounded-lg p-2 bg-gray-100 dark:bg-gray-800 focus:ring-2 focus:ring-purple-300" placeholder="Dose" value={medForm.dose} onChange={e => setMedForm(f => ({ ...f, dose: e.target.value }))} required />
                </div>
                <textarea className="border-none rounded-lg p-2 bg-gray-100 dark:bg-gray-800 focus:ring-2 focus:ring-purple-300" placeholder="Notes (optional)" value={medForm.notes} onChange={e => setMedForm(f => ({ ...f, notes: e.target.value }))} />
                <button className="self-end bg-gradient-to-r from-purple-400 to-indigo-400 hover:from-indigo-400 hover:to-purple-400 text-white px-6 py-2 rounded-lg shadow-lg font-semibold transition-all duration-300" type="submit">Add Medication</button>
              </form>
            </div>
            <div className="bg-white/70 dark:bg-black/30 rounded-2xl shadow p-4 backdrop-blur-md border border-purple-100 dark:border-purple-900">
              <h3 className="font-bold mb-2 text-purple-700 dark:text-purple-300 flex items-center gap-2"><span>📋</span> Logged Medications</h3>
              <ul className="space-y-2">
                {medications.map((entry: any, i: number) => (
                  <li key={i} className="bg-purple-50/60 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-lg p-3 text-sm flex flex-col shadow-sm">
                    <span><b>{entry.date}</b> - {entry.medication} <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">{entry.dose}</span></span>
                    {entry.notes && <span className="text-gray-500 mt-1">{entry.notes}</span>}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
        {tab === 'mood' && (
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <button className="px-3 py-1 rounded-lg bg-white/70 dark:bg-gray-900/70 shadow hover:bg-yellow-100 dark:hover:bg-yellow-800 transition-all" onClick={handlePrevMonth}>&lt;</button>
              <span className="font-semibold text-lg text-yellow-700 dark:text-yellow-300 bg-white/60 dark:bg-gray-900/60 px-4 py-2 rounded-xl shadow">{(() => { const [y, m] = calendarMonth.split('-').map(Number); return new Date(y, m - 1).toLocaleString('default', { month: 'long', year: 'numeric' }); })()}</span>
              <button className="px-3 py-1 rounded-lg bg-white/70 dark:bg-gray-900/70 shadow hover:bg-yellow-100 dark:hover:bg-yellow-800 transition-all" onClick={handleNextMonth}>&gt;</button>
            </div>
            <div className="grid grid-cols-7 gap-4 bg-white/60 dark:bg-gray-900/50 rounded-3xl p-6 shadow-xl backdrop-blur-md">
              {getMonthDays(calendarMonth).map((day: number) => {
                const [year, month] = calendarMonth.split('-').map(Number);
                const dateStr = formatDate(new Date(year, month - 1, day));
                const mood = moodLog[dateStr];
                return (
                  <div key={day} className={`relative flex flex-col items-center justify-center h-20 w-14 rounded-2xl cursor-pointer select-none transition-all duration-200 group ${mood ? 'bg-gradient-to-br from-yellow-200/70 to-yellow-400/80 dark:from-yellow-800/70 dark:to-yellow-600/80 shadow-lg scale-105' : 'bg-white/80 dark:bg-gray-800/40 hover:bg-yellow-50 dark:hover:bg-yellow-900/40'}`}
                    onClick={() => setMoodSelectDay(dateStr)}>
                    <span className="text-xs text-gray-500 mb-1">{day}</span>
                    <span className="text-2xl">
                      {mood || '😶'}
                    </span>
                    {moodSelectDay === dateStr && (
                      <div className="absolute left-1/2 -translate-x-1/2 z-20 top-16 flex gap-1 bg-white/95 dark:bg-gray-900/95 border border-yellow-200 dark:border-yellow-800 rounded-xl shadow-2xl p-2 animate-fade-in">
                        {['😀', '🙂', '😐', '😔', '😢', '😡', '😶'].map((m: string) => (
                          <button key={m} className={`text-xl px-1 rounded-lg hover:scale-125 transition-all ${m === mood ? 'ring-2 ring-yellow-400' : ''}`}
                            onClick={e => { e.stopPropagation(); handleMoodSelect(dateStr, m); setMoodSelectDay(null); }}>
                            {m}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {tab === 'analysis' && (
          <AnalysisSection />
        )}
      </div>
      <div className="mt-4 flex justify-end">
        <ExportPDFButton />
      </div>
    </div>
  );
};

// --- Analysis Section Component ---
const AnalysisSection: React.FC = () => {
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchAnalysis = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get('/api/tracker/analysis');
        setData(res.data);
      } catch (e) {
        setError('Failed to load analysis');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysis();
  }, []);

  if (loading) return <div className="text-center text-blue-500">Loading analysis...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;
  if (!data) return null;

  return (
    <div className="max-w-2xl mx-auto bg-white/70 dark:bg-gray-900/70 rounded-3xl p-6 shadow-xl backdrop-blur-md">
      <h2 className="text-2xl font-bold mb-4 text-yellow-700 dark:text-yellow-300">Smart Analysis & Trends</h2>
      <div className="mb-6">
        <h3 className="font-semibold text-lg mb-2">Symptom Trends</h3>
        <div>Total logged: <b>{data.symptomSummary.total}</b></div>
        <div>By severity:</div>
        <ul className="ml-4 mb-2">
          <li>Mild: {data.symptomSummary.bySeverity.mild}</li>
          <li>Moderate: {data.symptomSummary.bySeverity.moderate}</li>
          <li>Severe: {data.symptomSummary.bySeverity.severe}</li>
        </ul>
        <div>Most common:</div>
        <ul className="ml-4">
          {data.symptomSummary.mostCommon.map((s: any) => (
            <li key={s.description}>{s.description} ({s.count}x)</li>
          ))}
        </ul>
      </div>
      <div className="mb-6">
        <h3 className="font-semibold text-lg mb-2">Medication Adherence</h3>
        <div>Total doses logged: <b>{data.medicationSummary.total}</b></div>
        <div>Days with medication: <b>{data.medicationSummary.adherenceDays}</b></div>
      </div>
      <div>
        <h3 className="font-semibold text-lg mb-2">Mood Breakdown</h3>
        <ul className="ml-4">
          {Object.entries(data.moodSummary.byMood).map(([mood, count]) => (
            <li key={mood}>{mood}: {count as number}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// --- PDF Export Button ---
const ExportPDFButton: React.FC = () => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleExport = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('/api/tracker/export-pdf', { responseType: 'blob' });
      let blob: Blob;
      if (res.data instanceof Blob) {
        blob = res.data;
      } else if (typeof res.data === 'string' || res.data instanceof ArrayBuffer) {
        blob = new Blob([res.data], { type: 'application/pdf' });
      } else {
        blob = new Blob([], { type: 'application/pdf' }); // fallback empty blob
      }
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'health_report.pdf');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError('Failed to export PDF');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className="bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-orange-400 hover:to-yellow-400 text-white px-6 py-2 rounded-lg shadow-lg font-semibold transition-all duration-300"
      onClick={handleExport}
      disabled={loading}
    >
      {loading ? 'Exporting...' : 'Export PDF'}
    </button>
  );
};

export default TrackerDashboard;
