import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  Plus, GitBranch, Database, Activity, Cpu, CheckCircle, AlertCircle, Loader2
} from 'lucide-react'
import { getHealth, getWorkflows, getDatasets } from '../api'

function StatCard({
  label, value, icon: Icon, color
}: {
  label: string; value: string | number; icon: React.ElementType; color: string
}) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-slate-400 text-sm">{label}</p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  )
}

export default function HomePage() {
  const { data: health, isLoading: hLoading, isError: hError } = useQuery({
    queryKey: ['health'],
    queryFn: getHealth,
  })
  const { data: workflows = [] } = useQuery({
    queryKey: ['workflows'],
    queryFn: getWorkflows,
  })
  const { data: datasets = [] } = useQuery({
    queryKey: ['datasets'],
    queryFn: getDatasets,
  })

  const completed = workflows.filter(w => w.status === 'completed').length
  const avgQuality = datasets.length
    ? Math.round(datasets.reduce((s, d) => s + d.quality_score, 0) / datasets.length)
    : 0

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">DataPilot Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">
            AI-Powered Data Intelligence Platform · Code Cubicle 6.0
          </p>
        </div>
        <Link
          to="/workflows/new"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Workflow
        </Link>
      </div>

      {/* Backend health banner */}
      {hLoading ? (
        <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 mb-6 text-slate-400 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          Connecting to DataPilot backend…
        </div>
      ) : hError ? (
        <div className="flex items-center gap-2 bg-red-900/30 border border-red-700 rounded-lg px-4 py-3 mb-6 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4" />
          Backend is offline. Start it with: <code className="ml-1 bg-slate-800 px-1.5 py-0.5 rounded text-red-300">python main.py</code>
        </div>
      ) : (
        <div className="flex items-center gap-2 bg-emerald-900/30 border border-emerald-700 rounded-lg px-4 py-3 mb-6 text-emerald-400 text-sm">
          <CheckCircle className="w-4 h-4" />
          Backend online · v{health?.version} · AI mode: <strong className="ml-1">{health?.ai_mode}</strong>
          &nbsp;· Connectors: {health?.connectors_available.join(', ')}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Workflows" value={workflows.length} icon={GitBranch} color="bg-indigo-600" />
        <StatCard label="Completed" value={completed} icon={CheckCircle} color="bg-emerald-600" />
        <StatCard label="Datasets Created" value={datasets.length} icon={Database} color="bg-violet-600" />
        <StatCard label="Avg Quality Score" value={datasets.length ? `${avgQuality}/100` : '—'} icon={Activity} color="bg-amber-600" />
      </div>

      {/* Recent workflows */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <h2 className="text-white font-semibold">Recent Workflows</h2>
          <Link to="/workflows" className="text-indigo-400 hover:text-indigo-300 text-sm">
            View all →
          </Link>
        </div>
        {workflows.length === 0 ? (
          <div className="text-center py-16">
            <Cpu className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No workflows yet.</p>
            <Link
              to="/workflows/new"
              className="mt-4 inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-sm"
            >
              <Plus className="w-4 h-4" />
              Create your first workflow
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-700">
            {workflows.slice(0, 5).map(wf => (
              <div key={wf.id} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="text-white text-sm font-medium">{wf.name}</p>
                  <p className="text-slate-400 text-xs mt-0.5 truncate max-w-md">
                    {wf.requirement}
                  </p>
                </div>
                <StatusBadge status={wf.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    completed: 'bg-emerald-900/40 text-emerald-400 border-emerald-700',
    failed:    'bg-red-900/40 text-red-400 border-red-700',
    running:   'bg-blue-900/40 text-blue-400 border-blue-700',
    pending:   'bg-slate-700 text-slate-400 border-slate-600',
  }
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full border ${map[status] ?? map.pending}`}>
      {status}
    </span>
  )
}
