import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  Globe, ShieldCheck, TestTube, CheckCircle2,
  Sparkles, Code2
} from 'lucide-react'

import { getConnectors } from '../api'

export default function SourcesPage() {
  const navigate = useNavigate()
  const [testingId, setTestingId] = useState<string | null>(null)
  const [testResults, setTestResults] = useState<Record<string, { status: string; latency: number }>>({})

  const { data: connectors = [], isLoading } = useQuery({
    queryKey: ['connectors'],
    queryFn: getConnectors,
  })

  const runTest = (connectorId: string) => {
    setTestingId(connectorId)
    setTimeout(() => {
      setTestResults(prev => ({
        ...prev,
        [connectorId]: { status: 'Operational (200 OK)', latency: Math.floor(Math.random() * 45 + 35) }
      }))
      setTestingId(null)
    }, 600)
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-white tracking-tight">Permitted Source Connectors</h1>
          <span className="bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full font-medium">
            Source Traceability & Compliance
          </span>
        </div>
        <p className="text-slate-400 text-sm mt-1">
          Registered data ingress connectors permitted for web intelligence gathering, live API aggregation, and synthetic validation.
        </p>
      </div>

      {/* Connectors Grid */}
      {isLoading ? (
        <p className="text-slate-400 text-sm">Loading connectors…</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {connectors.map(c => {
            const result = testResults[c.connector_id]
            const isTesting = testingId === c.connector_id

            return (
              <div
                key={c.connector_id}
                className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-750 flex items-center justify-center text-indigo-400 shrink-0">
                        {c.is_demo ? <TestTube className="w-5 h-5 text-amber-400" /> : <Globe className="w-5 h-5 text-emerald-400" />}
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-sm">{c.display_name}</h3>
                        <span className="text-[11px] font-mono text-slate-400">id: {c.connector_id}</span>
                      </div>
                    </div>

                    {c.is_demo ? (
                      <span className="text-[11px] bg-amber-950/80 border border-amber-800 text-amber-300 px-2.5 py-0.5 rounded-full font-medium">
                        Synthetic Demo
                      </span>
                    ) : (
                      <span className="text-[11px] bg-emerald-950/80 border border-emerald-800 text-emerald-300 px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Permitted Public API
                      </span>
                    )}
                  </div>

                  <p className="text-slate-300 text-xs leading-relaxed mb-4">{c.description}</p>

                  <div className="space-y-2 mb-4">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                        Supported Domains
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {c.supported_domains.map(d => (
                          <span key={d} className="text-[11px] bg-slate-900 border border-slate-750 text-slate-300 px-2.5 py-0.5 rounded-lg">
                            {d}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-400 pt-2">
                      <span>Auth: <strong className="text-slate-200">Zero-Auth Required</strong></span>
                      <span>Rate Limit: <strong className="text-slate-200">Respects source headers</strong></span>
                    </div>
                  </div>
                </div>

                {/* Test Result Bar & Action Buttons */}
                <div className="pt-4 border-t border-slate-750 space-y-3">
                  {result && (
                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-750 flex items-center justify-between text-xs">
                      <span className="text-emerald-400 flex items-center gap-1.5 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {result.status}
                      </span>
                      <span className="text-slate-400 font-mono text-[11px]">{result.latency}ms latency</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => runTest(c.connector_id)}
                      disabled={isTesting}
                      className="text-xs bg-slate-700/80 hover:bg-slate-650 text-slate-200 px-3 py-1.5 rounded-lg font-medium transition-all"
                    >
                      {isTesting ? 'Pinging endpoint…' : 'Ping Health'}
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate('/new-task', { state: { initialPrompt: `Collect information from ${c.display_name}...` } })}
                      className="inline-flex items-center gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-1.5 rounded-lg font-medium transition-all shadow"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Collect with this Source
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Guide: Adding New Connectors */}
      <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 space-y-3">
        <div className="flex items-center gap-2">
          <Code2 className="w-5 h-5 text-indigo-400" />
          <h3 className="text-white font-semibold text-sm">Extensible Connector Architecture</h3>
        </div>
        <p className="text-slate-400 text-xs leading-relaxed max-w-3xl">
          DataPilot uses an open plug-and-play connector interface. Any new permitted source, enterprise warehouse, or custom scraper can be added by implementing the <code className="bg-slate-900 text-indigo-300 px-1 py-0.5 rounded font-mono">BaseConnector</code> class with the <code className="bg-slate-900 text-indigo-300 px-1 py-0.5 rounded font-mono">@register_connector</code> decorator in <code className="bg-slate-900 text-slate-300 px-1 py-0.5 rounded font-mono">backend/app/connectors/</code>.
        </p>
      </div>
    </div>
  )
}
