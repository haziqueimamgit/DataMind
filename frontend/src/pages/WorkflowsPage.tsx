import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useLocation } from 'react-router-dom'
import {
  Plus, ChevronDown, ChevronUp, CheckCircle, XCircle, Clock,
  AlertTriangle, RotateCw, Trash2, Database, Search, Filter, Sparkles
} from 'lucide-react'
import { getWorkflows, getWorkflow, getDatasets, type WorkflowDetail } from '../api'
import api from '../api'

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { cls: string; Icon: React.ElementType }> = {
    completed: { cls: 'bg-emerald-950/80 text-emerald-400 border-emerald-800', Icon: CheckCircle },
    failed:    { cls: 'bg-red-950/80 text-red-400 border-red-800',             Icon: XCircle },
    running:   { cls: 'bg-blue-950/80 text-blue-400 border-blue-800 animate-pulse', Icon: Clock },
    pending:   { cls: 'bg-slate-800 text-slate-400 border-slate-700',          Icon: Clock },
  }
  const { cls, Icon } = map[status] ?? map.pending
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${cls} font-medium`}>
      <Icon className="w-3.5 h-3.5" />
      <span className="capitalize">{status}</span>
    </span>
  )
}

function StepBadge({ status }: { status: string }) {
  if (status === 'success') return <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
  if (status === 'warning') return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
  return <XCircle className="w-4 h-4 text-red-400 shrink-0" />
}

function WorkflowRow({
  id,
  defaultOpen = false,
  matchingDatasetId,
}: {
  id: number
  defaultOpen?: boolean
  matchingDatasetId?: number
}) {
  const [open, setOpen] = useState(defaultOpen)
  const qc = useQueryClient()

  const { data: workflows = [] } = useQuery({
    queryKey: ['workflows'],
    queryFn: getWorkflows,
  })
  const summary = workflows.find(w => w.id === id)

  const { data: detail, isLoading: dLoading } = useQuery<WorkflowDetail>({
    queryKey: ['workflow', id],
    queryFn: () => getWorkflow(id),
    enabled: open,
  })

  // Re-run mutation
  const rerunMutation = useMutation({
    mutationFn: () => api.post(`/workflows/${id}/rerun`).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workflows'] })
      qc.invalidateQueries({ queryKey: ['workflow', id] })
      qc.invalidateQueries({ queryKey: ['datasets'] })
      qc.invalidateQueries({ queryKey: ['workflow-stats'] })
      qc.invalidateQueries({ queryKey: ['quality-overview'] })
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/workflows/${id}`).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workflows'] })
      qc.invalidateQueries({ queryKey: ['datasets'] })
      qc.invalidateQueries({ queryKey: ['workflow-stats'] })
      qc.invalidateQueries({ queryKey: ['quality-overview'] })
    },
  })

  if (!summary) return null

  return (
    <div className={`border rounded-xl overflow-hidden transition-all ${
      open ? 'border-indigo-600/70 bg-slate-800/90 shadow-lg' : 'border-slate-700/80 bg-slate-800/60 hover:border-slate-600'
    }`}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left gap-4"
      >
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          <StatusBadge status={summary.status} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-white font-semibold text-sm truncate">{summary.name}</p>
              <span className="text-[10px] text-slate-400 bg-slate-700 px-1.5 py-0.5 rounded">
                WF #{summary.id}
              </span>
              {summary.source_connector && (
                <span className="text-[10px] text-indigo-300 bg-indigo-950/70 border border-indigo-800 px-2 py-0.5 rounded-full">
                  {summary.source_connector}
                </span>
              )}
            </div>
            <p className="text-slate-400 text-xs truncate mt-0.5 max-w-xl">{summary.requirement}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="text-slate-500 text-xs hidden sm:block">
            {new Date(summary.created_at).toLocaleDateString()}
          </span>
          {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </button>

      {open && (
        <div className="bg-slate-900/90 border-t border-slate-700/80 px-6 py-5 space-y-4">
          {dLoading ? (
            <p className="text-slate-400 text-xs">Loading execution audit trail…</p>
          ) : detail ? (
            <>
              {/* Actions Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="text-xs text-slate-400">
                  <span>Last executed: {new Date(detail.updated_at).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  {matchingDatasetId && (
                    <Link
                      to={`/datasets/${matchingDatasetId}`}
                      className="inline-flex items-center gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg font-medium transition-all shadow"
                    >
                      <Database className="w-3.5 h-3.5" />
                      Explore Dataset
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => rerunMutation.mutate()}
                    disabled={rerunMutation.isPending}
                    className="inline-flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg font-medium transition-all"
                  >
                    <RotateCw className={`w-3.5 h-3.5 ${rerunMutation.isPending ? 'animate-spin' : ''}`} />
                    Re-run Pipeline
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Delete this workflow task and its associated datasets?')) {
                        deleteMutation.mutate()
                      }
                    }}
                    disabled={deleteMutation.isPending}
                    className="inline-flex items-center gap-1.5 text-xs bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/80 px-3 py-1.5 rounded-lg font-medium transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              </div>

              {/* Parsed Intent Tags */}
              {detail.parsed_intent && Object.keys(detail.parsed_intent).length > 0 && (
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    AI Parsed Intent & Constraints
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(detail.parsed_intent).map(([k, v]) => (
                      <span key={k} className="text-xs bg-slate-800 border border-slate-700 text-slate-300 px-3 py-1 rounded-lg">
                        <span className="text-indigo-400 font-semibold">{k}:</span>{' '}
                        <span>{Array.isArray(v) ? v.join(', ') || 'none' : String(v)}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Pipeline Steps Log */}
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                  Pipeline Step Execution Log
                </p>
                <div className="space-y-2">
                  {detail.steps_log.map((step, i) => (
                    <div key={i} className="flex items-start gap-3 bg-slate-800/80 border border-slate-750 rounded-xl px-4 py-3">
                      <StepBadge status={step.status} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-white text-xs font-semibold capitalize tracking-wide">{step.step}</p>
                          <span className="text-slate-500 text-[10px]">
                            {new Date(step.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-slate-300 text-xs mt-0.5">{step.detail}</p>
                        {step.stats && Object.keys(step.stats).length > 0 && (
                          <div className="mt-1.5 flex flex-wrap gap-1.5">
                            {Object.entries(step.stats).map(([sk, sv]) => (
                              <span key={sk} className="text-[10px] bg-slate-900 text-slate-400 px-2 py-0.5 rounded border border-slate-700">
                                {sk}: <span className="text-slate-200 font-medium">{String(sv)}</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {detail.error_message && (
                <div className="bg-red-950/50 border border-red-800 rounded-xl p-3.5 text-red-300 text-xs">
                  <strong className="block text-red-400 mb-1">Execution Failure:</strong>
                  {detail.error_message}
                </div>
              )}
            </>
          ) : null}
        </div>
      )}
    </div>
  )
}

export default function WorkflowsPage() {
  const location = useLocation()
  const highlightId = (location.state as { highlightId?: number })?.highlightId

  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'failed' | 'running'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const { data: workflows = [], isLoading } = useQuery({
    queryKey: ['workflows'],
    queryFn: getWorkflows,
  })

  const { data: datasets = [] } = useQuery({
    queryKey: ['datasets'],
    queryFn: getDatasets,
  })

  // Create a mapping from workflow_id -> dataset_id
  const wfDatasetMap = new Map<number, number>()
  for (const ds of datasets) {
    wfDatasetMap.set(ds.workflow_id, ds.id)
  }

  const filtered = workflows.filter(w => {
    if (statusFilter !== 'all' && w.status !== statusFilter) return false
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase()
      return w.name.toLowerCase().includes(q) || w.requirement.toLowerCase().includes(q)
    }
    return true
  })

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Workflow Management & Audit</h1>
          <p className="text-slate-400 text-sm mt-1">
            Monitor, inspect, and re-execute collection pipelines with full execution traces.
          </p>
        </div>
        <Link
          to="/new-task"
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all shadow-md shadow-indigo-600/20 shrink-0"
        >
          <Plus className="w-4 h-4" />
          New Workflow Task
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search workflows by prompt or name..."
            className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 outline-none"
          />
        </div>
        <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-xl p-1 shrink-0">
          <Filter className="w-3.5 h-3.5 text-slate-400 ml-2" />
          {(['all', 'completed', 'running', 'failed'] as const).map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors capitalize ${
                statusFilter === st ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <p className="text-slate-400 text-sm">Loading workflows…</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-slate-800/40 border border-slate-800 rounded-2xl">
          <p className="text-slate-400 text-sm">No workflows match your search filters.</p>
          <Link to="/new-task" className="text-indigo-400 hover:text-indigo-300 text-xs mt-2 inline-block font-medium">
            Launch a new data task →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(wf => (
            <WorkflowRow
              key={wf.id}
              id={wf.id}
              defaultOpen={wf.id === highlightId}
              matchingDatasetId={wfDatasetMap.get(wf.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
