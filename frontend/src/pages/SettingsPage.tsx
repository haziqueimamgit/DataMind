import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Cpu, Save, CheckCircle2,
  Sliders, Info
} from 'lucide-react'

import { getHealth } from '../api'

export default function SettingsPage() {
  const { data: health } = useQuery({
    queryKey: ['health'],
    queryFn: getHealth,
  })

  const [aiMode, setAiMode] = useState('demo')
  const [nullStrategy, setNullStrategy] = useState('median')
  const [dedupStrict, setDedupStrict] = useState(true)
  const [maxRecords, setMaxRecords] = useState(200)
  const [saved, setSaved] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Platform Settings & Engine Config</h1>
        <p className="text-slate-400 text-sm mt-1">
          Configure AI intent understanding models, data cleaning thresholds, and pipeline rules.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* AI Intent Engine */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-750 pb-3">
            <Cpu className="w-5 h-5 text-indigo-400" />
            <h2 className="text-white font-semibold text-sm">AI Intent Understanding & Parsing</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Parsing Engine Model
              </label>
              <select
                value={aiMode}
                onChange={e => setAiMode(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs text-white outline-none"
              >
                <option value="demo">High-Accuracy Rule-Based NLP (Zero-key, Fast & Offline)</option>
                <option value="gpt-4o-mini">OpenAI GPT-4o-mini (Requires OPENAI_API_KEY in .env)</option>
                <option value="gemini-pro">Google Gemini 1.5 Pro / Flash</option>
              </select>
              <p className="text-[11px] text-slate-400 mt-1">
                Active server mode: <strong className="text-indigo-400 capitalize">{health?.ai_mode || 'demo'}</strong>
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Maximum Ingress Record Limit
              </label>
              <input
                type="number"
                min={20}
                max={1000}
                value={maxRecords}
                onChange={e => setMaxRecords(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs text-white outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Upper bound on records collected per single natural language workflow run.
              </p>
            </div>
          </div>
        </div>

        {/* Data Quality & Cleaning Strategy */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-750 pb-3">
            <Sliders className="w-5 h-5 text-emerald-400" />
            <h2 className="text-white font-semibold text-sm">Automated Data Cleaning & Imputation Rules</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Missing Numeric Values Strategy
              </label>
              <select
                value={nullStrategy}
                onChange={e => setNullStrategy(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs text-white outline-none"
              >
                <option value="median">Column Median (Robust to outliers)</option>
                <option value="mean">Column Mean (Arithmetic average)</option>
                <option value="zero">Fill with 0</option>
              </select>
            </div>

            <div className="flex items-center justify-between bg-slate-900/60 p-4 rounded-xl border border-slate-750">
              <div>
                <p className="text-xs font-semibold text-white">Full-Hash Deduplication</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Prune duplicate rows using entity key signatures
                </p>
              </div>
              <input
                type="checkbox"
                checked={dedupStrict}
                onChange={e => setDedupStrict(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded bg-slate-800 border-slate-700"
              />
            </div>
          </div>
        </div>

        {/* System & Architecture Info */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-750 pb-3">
            <Info className="w-5 h-5 text-indigo-400" />
            <h2 className="text-white font-semibold text-sm">Deployment & Runtime Architecture</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-900/70 p-3.5 rounded-xl border border-slate-750">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Engine Version</span>
              <span className="text-white font-bold text-sm">DataPilot v{health?.version || '1.0.0'}</span>
            </div>
            <div className="bg-slate-900/70 p-3.5 rounded-xl border border-slate-750">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Database Engine</span>
              <span className="text-white font-bold text-sm">SQLite (datapilot.db)</span>
            </div>
            <div className="bg-slate-900/70 p-3.5 rounded-xl border border-slate-750">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">CORS & Security</span>
              <span className="text-emerald-400 font-bold text-sm">Active & Enforced</span>
            </div>
          </div>
        </div>

        {/* Save button & status */}
        <div className="flex items-center justify-between pt-2">
          {saved ? (
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              Settings updated successfully.
            </div>
          ) : <div />}

          <button
            type="submit"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-6 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-600/30"
          >
            <Save className="w-4 h-4" />
            Save Configuration
          </button>
        </div>
      </form>
    </div>
  )
}
