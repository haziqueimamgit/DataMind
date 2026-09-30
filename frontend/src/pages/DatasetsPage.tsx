import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  Download, Database, TestTube, Search, ArrowRight,
  ShieldCheck, Trash2, FileJson, Sparkles
} from 'lucide-react'
import { getDatasets, csvExportUrl, jsonExportUrl } from '../api'
import api from '../api'

function QualityIndicator({ score }: { score: number }) {
  const color = score >= 85 ? 'text-emerald-400 bg-emerald-950/80 border-emerald-800' :
                score >= 70 ? 'text-amber-400 bg-amber-950/80 border-amber-800' :
                'text-red-400 bg-red-950/80 border-red-800'

  return (
    <div className="flex items-center gap-2">
      <span className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold ${color}`}>
        {score}/100 Quality
      </span>
    </div>
  )
}

export default function DatasetsPage() {
  const qc = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')

  const { data: datasets = [], isLoading } = useQuery({
    queryKey: ['datasets'],
    queryFn: getDatasets,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/datasets/${id}`).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['datasets'] })
      qc.invalidateQueries({ queryKey: ['workflow-stats'] })
      qc.invalidateQueries({ queryKey: ['quality-overview'] })
    },
  })

  const filtered = datasets.filter(d => {
    if (!searchTerm.trim()) return true
    const q = searchTerm.toLowerCase()
    return d.name.toLowerCase().includes(q) ||
           (d.description && d.description.toLowerCase().includes(q)) ||
           d.source_connector.toLowerCase().includes(q)
  })

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Structured Datasets</h1>
          <p className="text-slate-400 text-sm mt-1">
            Clean, source-backed datasets produced by natural-language workflows.
          </p>
        </div>
        <Link
          to="/new-task"
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all shadow-md shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          Generate New Dataset
        </Link>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Filter datasets by name, domain, or connector..."
          className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 outline-none"
        />
      </div>

      {isLoading ? (
        <p className="text-slate-400 text-sm">Loading datasets…</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-slate-800/40 border border-slate-800 rounded-2xl">
          <Database className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No datasets found.</p>
          <Link to="/new-task" className="text-indigo-400 hover:text-indigo-300 text-xs mt-2 inline-block font-medium">
            Run a workflow to create your first dataset →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(ds => (
            <div
              key={ds.id}
              className="bg-slate-800/90 border border-slate-700 hover:border-slate-600 rounded-2xl p-5 shadow-sm transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-white font-semibold text-base truncate">{ds.name}</h3>
                      <span className="text-[10px] text-slate-400 bg-slate-700/80 px-1.5 py-0.5 rounded">
                        #{ds.id}
                      </span>
                    </div>
                    {ds.description && (
                      <p className="text-slate-400 text-xs mt-1 line-clamp-2">{ds.description}</p>
                    )}
                  </div>
                  {ds.is_demo_data ? (
                    <span className="flex items-center gap-1 text-[11px] bg-amber-950/80 border border-amber-800 text-amber-300 px-2.5 py-0.5 rounded-full shrink-0 font-medium">
                      <TestTube className="w-3 h-3" />
                      Demo Synthetic
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] bg-emerald-950/80 border border-emerald-800 text-emerald-300 px-2.5 py-0.5 rounded-full shrink-0 font-medium">
                      <ShieldCheck className="w-3 h-3" />
                      Permitted Source
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-300 py-3 my-2 border-y border-slate-750">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">Records</span>
                    <span className="font-bold text-white">{ds.row_count.toLocaleString()} rows</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">Columns</span>
                    <span className="font-bold text-white">{ds.column_count} fields</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">Cleaned Dupes</span>
                    <span className="font-bold text-white">{ds.duplicate_rows_removed}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">Filled Nulls</span>
                    <span className="font-bold text-white">{ds.null_values_filled}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <QualityIndicator score={ds.quality_score} />
                  <span className="text-[11px] text-slate-500">
                    Source: <strong className="text-slate-300">{ds.source_label}</strong>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 mt-3 border-t border-slate-750/70">
                <Link
                  to={`/datasets/${ds.id}`}
                  className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                >
                  <span>Interactive Explorer & Lineage</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <div className="flex items-center gap-2">
                  <a
                    href={csvExportUrl(ds.id)}
                    download
                    className="inline-flex items-center gap-1 text-xs bg-slate-700/80 hover:bg-slate-650 text-slate-200 px-2.5 py-1.5 rounded-lg font-medium transition-colors"
                    title="Export CSV"
                  >
                    <Download className="w-3.5 h-3.5" />
                    CSV
                  </a>
                  <a
                    href={jsonExportUrl(ds.id)}
                    download
                    className="inline-flex items-center gap-1 text-xs bg-slate-700/80 hover:bg-slate-650 text-slate-200 px-2.5 py-1.5 rounded-lg font-medium transition-colors"
                    title="Export JSON"
                  >
                    <FileJson className="w-3.5 h-3.5" />
                    JSON
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Delete dataset "${ds.name}"?`)) {
                        deleteMutation.mutate(ds.id)
                      }
                    }}
                    className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                    title="Delete dataset"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
