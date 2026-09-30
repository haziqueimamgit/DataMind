import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowLeft, Download, FileJson, Search, ShieldCheck, TestTube,
  CheckCircle2, ArrowUpDown, ChevronLeft, ChevronRight,
  Database, Table, Activity, ExternalLink
} from 'lucide-react'

import {
  getDataset, getDatasetQuality, getDatasetProvenance, getDatasetRecords,
  csvExportUrl, jsonExportUrl
} from '../api'

export default function DatasetDetailPage() {
  const { id } = useParams<{ id: string }>()
  const datasetId = parseInt(id || '0', 10)

  const [activeTab, setActiveTab] = useState<'grid' | 'quality' | 'lineage' | 'schema'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(15)
  const [sortCol, setSortCol] = useState('')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const { data: detail, isLoading: dLoading } = useQuery({
    queryKey: ['dataset', datasetId],
    queryFn: () => getDataset(datasetId),
    enabled: !!datasetId,
  })

  const { data: quality } = useQuery({
    queryKey: ['dataset-quality', datasetId],
    queryFn: () => getDatasetQuality(datasetId),
    enabled: !!datasetId,
  })

  const { data: provenance } = useQuery({
    queryKey: ['dataset-provenance', datasetId],
    queryFn: () => getDatasetProvenance(datasetId),
    enabled: !!datasetId,
  })

  const { data: recordsData, isLoading: rLoading } = useQuery({
    queryKey: ['dataset-records', datasetId, page, pageSize, searchTerm, sortCol, sortDir],
    queryFn: () => getDatasetRecords(datasetId, {
      page,
      page_size: pageSize,
      search: searchTerm,
      sort_col: sortCol || undefined,
      sort_dir: sortDir,
    }),
    enabled: !!datasetId,
  })

  const handleSort = (col: string) => {
    if (sortCol === col) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortCol(col)
      setSortDir('asc')
    }
  }

  if (dLoading) {
    return (
      <div className="p-8 text-center text-slate-400">
        Loading dataset intelligence…
      </div>
    )
  }

  if (!detail) {
    return (
      <div className="p-8 text-center text-slate-400">
        <p>Dataset #{datasetId} not found.</p>
        <Link to="/datasets" className="text-indigo-400 hover:text-indigo-300 text-xs mt-2 inline-block">
          ← Back to Datasets
        </Link>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Back button & top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/datasets"
          className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white text-xs font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to All Datasets
        </Link>

        <div className="flex items-center gap-2">
          <a
            href={csvExportUrl(detail.id)}
            download
            className="inline-flex items-center gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-xl font-medium transition-all shadow"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </a>
          <a
            href={jsonExportUrl(detail.id)}
            download
            className="inline-flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-2 rounded-xl font-medium transition-all"
          >
            <FileJson className="w-3.5 h-3.5" />
            Export JSON
          </a>
        </div>
      </div>

      {/* Dataset Header Card */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white tracking-tight">{detail.name}</h1>
              {detail.is_demo_data ? (
                <span className="flex items-center gap-1 text-xs bg-amber-950/80 border border-amber-800 text-amber-300 px-2.5 py-0.5 rounded-full font-medium">
                  <TestTube className="w-3.5 h-3.5" />
                  Synthetic Demo
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs bg-emerald-950/80 border border-emerald-800 text-emerald-300 px-2.5 py-0.5 rounded-full font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Permitted Source
                </span>
              )}
            </div>
            {detail.description && (
              <p className="text-slate-400 text-xs mt-1.5 max-w-3xl">{detail.description}</p>
            )}
          </div>

          <div className="flex items-center gap-4 bg-slate-900/80 border border-slate-750 px-4 py-2.5 rounded-xl shrink-0">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Quality Index</span>
              <span className="text-lg font-bold text-emerald-400">{detail.quality_score}/100</span>
            </div>
            <div className="w-px h-8 bg-slate-800" />
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Clean Rows</span>
              <span className="text-lg font-bold text-white">{detail.row_count.toLocaleString()}</span>
            </div>
            <div className="w-px h-8 bg-slate-800" />
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Columns</span>
              <span className="text-lg font-bold text-white">{detail.column_count}</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-t border-slate-700/80 mt-6 pt-4">
          <button
            onClick={() => setActiveTab('grid')}
            className={`flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-xl transition-all ${
              activeTab === 'grid'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-750'
            }`}
          >
            <Table className="w-4 h-4" />
            Interactive Data Explorer
          </button>
          <button
            onClick={() => setActiveTab('quality')}
            className={`flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-xl transition-all ${
              activeTab === 'quality'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-750'
            }`}
          >
            <Activity className="w-4 h-4" />
            Quality & Hygiene Metrics
          </button>
          <button
            onClick={() => setActiveTab('lineage')}
            className={`flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-xl transition-all ${
              activeTab === 'lineage'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-750'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Source Traceability & Lineage
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-xl transition-all ${
              activeTab === 'schema'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-750'
            }`}
          >
            <Database className="w-4 h-4" />
            Schema Inspector
          </button>
        </div>
      </div>

      {/* Tab 1: Interactive Data Explorer */}
      {activeTab === 'grid' && (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => {
                  setSearchTerm(e.target.value)
                  setPage(1)
                }}
                placeholder="Search across all fields..."
                className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none"
              />
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span>Rows per page:</span>
              <select
                value={pageSize}
                onChange={e => {
                  setPageSize(Number(e.target.value))
                  setPage(1)
                }}
                className="bg-slate-900 border border-slate-700 text-white rounded-lg px-2 py-1 outline-none"
              >
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span>Total records: <strong className="text-white">{recordsData?.total ?? 0}</strong></span>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto border border-slate-700/80 rounded-xl">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-900 text-slate-400 border-b border-slate-700 font-semibold tracking-wide">
                <tr>
                  <th className="py-2.5 px-3 w-10 text-center">#</th>
                  {recordsData?.columns.map(col => (
                    <th
                      key={col}
                      onClick={() => handleSort(col)}
                      className="py-2.5 px-3 whitespace-nowrap cursor-pointer hover:text-white select-none transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>{col}</span>
                        <ArrowUpDown className={`w-3 h-3 ${sortCol === col ? 'text-indigo-400' : 'text-slate-600'}`} />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {rLoading ? (
                  <tr>
                    <td colSpan={100} className="py-8 text-center text-slate-400">
                      Querying records…
                    </td>
                  </tr>
                ) : !recordsData?.records.length ? (
                  <tr>
                    <td colSpan={100} className="py-8 text-center text-slate-400">
                      No matching records found.
                    </td>
                  </tr>
                ) : (
                  recordsData.records.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-750/50 transition-colors">
                      <td className="py-2 px-3 text-center text-slate-600 font-mono text-[11px]">
                        {(page - 1) * pageSize + rIdx + 1}
                      </td>
                      {recordsData.columns.map(col => {
                        const val = row[col]
                        const isUrl = typeof val === 'string' && (val.startsWith('http://') || val.startsWith('https://'))

                        return (
                          <td key={col} className="py-2 px-3 whitespace-nowrap max-w-xs truncate text-slate-300">
                            {val == null ? (
                              <span className="text-slate-600 italic">null</span>
                            ) : isUrl ? (
                              <a
                                href={val}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 underline"
                              >
                                <span>{val.slice(0, 32)}…</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            ) : (
                              String(val)
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {recordsData && recordsData.pages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400">
                Page <strong className="text-white">{page}</strong> of <strong className="text-white">{recordsData.pages}</strong>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="p-1.5 bg-slate-900 border border-slate-700 disabled:opacity-40 text-slate-300 rounded-lg hover:text-white"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage(p => Math.min(recordsData.pages, p + 1))}
                  disabled={page >= recordsData.pages}
                  className="p-1.5 bg-slate-900 border border-slate-700 disabled:opacity-40 text-slate-300 rounded-lg hover:text-white"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Quality & Hygiene Metrics */}
      {activeTab === 'quality' && quality && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quality.quality_breakdown.map((item, idx) => (
              <div key={idx} className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
                <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider mb-2">{item.name}</p>
                <p className="text-3xl font-bold text-white mb-2">{item.score}%</p>
                <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${item.score}%`, backgroundColor: item.color }} />
                </div>
              </div>
            ))}
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 space-y-4">
            <h3 className="text-white font-semibold text-sm">Automated Pipeline Cleaning Operations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-750">
                <p className="text-xs text-slate-400 font-semibold uppercase mb-1">Deduplication Results</p>
                <p className="text-xl font-bold text-white">{quality.duplicate_count} duplicate row(s) removed</p>
                <p className="text-xs text-slate-400 mt-1">
                  Evaluated across full record entity hashes to prevent multi-source overlap.
                </p>
              </div>
              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-750">
                <p className="text-xs text-slate-400 font-semibold uppercase mb-1">Missing Value Imputation</p>
                <p className="text-xl font-bold text-white">{quality.null_count} null/missing field(s) filled</p>
                <p className="text-xs text-slate-400 mt-1">
                  Numeric columns imputed with column median; categorical strings formatted with standards.
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Validation & Integrity Checks
              </p>
              <div className="space-y-2">
                {quality.validation_issues.map((issue, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs bg-slate-900/60 p-3 rounded-lg border border-slate-750 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{issue}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Source Traceability & Lineage */}
      {activeTab === 'lineage' && provenance && (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 space-y-6">
          <div>
            <h3 className="text-white font-bold text-base mb-1">Source Lineage & Audit Verification</h3>
            <p className="text-slate-400 text-xs">
              Every row and value produced by DataPilot can be traced back to its collection origin.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-750 space-y-3">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Origin Connector</span>
                <span className="text-sm font-bold text-white">{provenance.source_label} ({provenance.source_connector})</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Connector Scope & Terms</span>
                <span className="text-xs text-slate-300 leading-relaxed">{provenance.connector_description}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Permitted Compliance Notice</span>
                <span className="text-xs text-emerald-400 font-medium">{provenance.data_notice}</span>
              </div>
            </div>

            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-750 space-y-3">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Triggering Workflow</span>
                <Link to="/workflows" className="text-sm font-bold text-indigo-400 hover:text-indigo-300">
                  {provenance.workflow_name} (WF #{provenance.workflow_id})
                </Link>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Original Natural Language Prompt</span>
                <span className="text-xs text-slate-300 italic block mt-0.5">"{provenance.workflow_requirement}"</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Collection Timestamp</span>
                <span className="text-xs text-slate-400">{new Date(provenance.collection_timestamp).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Schema Inspector */}
      {activeTab === 'schema' && (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 space-y-4">
          <h3 className="text-white font-semibold text-sm">Inferred Column Schema & Data Types</h3>
          <div className="overflow-x-auto border border-slate-700/80 rounded-xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-900 text-slate-400 border-b border-slate-700">
                <tr>
                  <th className="py-2.5 px-4">Column Name</th>
                  <th className="py-2.5 px-4">Inferred Type</th>
                  <th className="py-2.5 px-4">Nullable</th>
                  <th className="py-2.5 px-4">Distinct Count</th>
                  <th className="py-2.5 px-4">Sample Values</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {Object.entries(detail.schema_info || {}).map(([col, info]) => (
                  <tr key={col} className="hover:bg-slate-750/40">
                    <td className="py-2.5 px-4 font-mono font-medium text-white">{col}</td>
                    <td className="py-2.5 px-4 text-indigo-400 font-mono">{info.dtype}</td>
                    <td className="py-2.5 px-4">
                      {info.nullable ? (
                        <span className="text-amber-400">Yes</span>
                      ) : (
                        <span className="text-emerald-400 font-medium">No (Strict)</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-slate-300">{info.unique}</td>
                    <td className="py-2.5 px-4 text-slate-400 font-mono text-[11px] truncate max-w-xs">
                      {info.sample?.join(', ') || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
