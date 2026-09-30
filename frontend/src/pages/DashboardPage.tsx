import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import {
  GitBranch, Database, Activity, CheckCircle, AlertCircle, Loader2,
  Sparkles, ArrowRight, ShieldCheck, Cpu, HardDrive
} from 'lucide-react'
import { getHealth, getWorkflowStats, getWorkflows, getConnectors, getQualityOverview } from '../api'

function StatCard({
  label, value, sublabel, icon: Icon, color
}: {
  label: string; value: string | number; sublabel?: string; icon: React.ElementType; color: string
}) {
  return (
    <div className="bg-slate-800 border border-slate-700/80 rounded-xl p-5 shadow-sm hover:border-slate-600 transition-all">
      <div className="flex items-center justify-between mb-3">
        <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">{label}</p>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color} shadow-md`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
      {sublabel && <p className="text-xs text-slate-400 mt-1">{sublabel}</p>}
    </div>
  )
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const [quickPrompt, setQuickPrompt] = useState('')

  const { data: health, isLoading: hLoading, isError: hError } = useQuery({
    queryKey: ['health'],
    queryFn: getHealth,
  })

  const { data: wfStats } = useQuery({
    queryKey: ['workflow-stats'],
    queryFn: getWorkflowStats,
  })

  const { data: workflows = [] } = useQuery({
    queryKey: ['workflows'],
    queryFn: getWorkflows,
  })

  const { data: connectors = [] } = useQuery({
    queryKey: ['connectors'],
    queryFn: getConnectors,
  })

  const { data: quality } = useQuery({
    queryKey: ['quality-overview'],
    queryFn: getQualityOverview,
  })

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!quickPrompt.trim()) return
    navigate('/new-task', { state: { initialPrompt: quickPrompt } })
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Data Intelligence Dashboard</h1>
            <span className="bg-indigo-900/60 border border-indigo-700 text-indigo-300 text-xs px-2.5 py-0.5 rounded-full font-medium">
              Problem Statement 01
            </span>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Prompt-based AI data intelligence platform · Dynamic workflow design · Source-backed validation
          </p>
        </div>
        <Link
          to="/new-task"
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all shadow-md shadow-indigo-600/20"
        >
          <Sparkles className="w-4 h-4" />
          New Data Intelligence Task
        </Link>
      </div>

      {/* Backend Status Banner */}
      {hLoading ? (
        <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700 rounded-lg px-4 py-3 text-slate-400 text-sm">
          <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
          Connecting to DataPilot backend engine…
        </div>
      ) : hError ? (
        <div className="flex items-center gap-2 bg-red-950/40 border border-red-800 rounded-lg px-4 py-3 text-red-300 text-sm">
          <AlertCircle className="w-4 h-4 text-red-400" />
          Backend is offline. Ensure FastAPI is running on port 8000.
        </div>
      ) : (
        <div className="flex items-center justify-between flex-wrap gap-3 bg-emerald-950/30 border border-emerald-800/60 rounded-lg px-4 py-3 text-emerald-300 text-xs">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Platform Online</span>
            <span className="text-slate-400">·</span>
            <span>DataPilot Engine v{health?.version}</span>
            <span className="text-slate-400">·</span>
            <span className="capitalize">AI Mode: {health?.ai_mode}</span>
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <span>{connectors.length} Permitted Connectors Active</span>
            <Link to="/sources" className="text-indigo-400 hover:text-indigo-300 underline font-medium">
              Inspect Sources →
            </Link>
          </div>
        </div>
      )}

      {/* Quick Launch NL Requirement Card */}
      <div className="bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-800/80 border border-indigo-700/50 rounded-2xl p-6 shadow-lg backdrop-blur">
        <div className="flex items-center gap-2 mb-2 text-indigo-300 font-semibold text-sm">
          <Sparkles className="w-4 h-4" />
          <span>Quick Prompt Intelligence</span>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">What data do you need today?</h2>
        <p className="text-slate-300 text-xs mb-4 max-w-2xl leading-relaxed">
          Describe your business requirement in natural English. DataPilot will understand your requirement, select permitted sources, clean, deduplicate, validate, and produce a structured dataset.
        </p>
        <form onSubmit={handleQuickSubmit} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={quickPrompt}
            onChange={e => setQuickPrompt(e.target.value)}
            placeholder="e.g. Collect recent remote AI and Python engineering jobs with salary and tech stack..."
            className="flex-1 bg-slate-900/90 border border-indigo-500/40 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all"
          />
          <button
            type="submit"
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-6 py-3 rounded-xl text-sm transition-all shadow-md shrink-0"
          >
            <span>Design Pipeline</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Workflows"
          value={wfStats?.total ?? 0}
          sublabel={`${wfStats?.completed ?? 0} completed successfully`}
          icon={GitBranch}
          color="bg-indigo-600"
        />
        <StatCard
          label="Records Processed"
          value={wfStats?.total_records_processed.toLocaleString() ?? '0'}
          sublabel={`${quality?.total_nulls_filled ?? 0} nulls filled`}
          icon={HardDrive}
          color="bg-emerald-600"
        />
        <StatCard
          label="Datasets Created"
          value={quality?.total_datasets ?? 0}
          sublabel={`${quality?.total_dupes_removed ?? 0} duplicates pruned`}
          icon={Database}
          color="bg-violet-600"
        />
        <StatCard
          label="Quality Health Index"
          value={quality ? `${quality.avg_quality_score}/100` : '—'}
          sublabel={`${quality?.avg_completeness ?? 0}% average completeness`}
          icon={Activity}
          color="bg-amber-600"
        />
      </div>

      {/* 2-Column Section: Active Sources & Recent Workflows */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Permitted Sources */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-700 mb-4">
              <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Permitted Source Connectors
              </h3>
              <Link to="/sources" className="text-indigo-400 hover:text-indigo-300 text-xs">
                View all →
              </Link>
            </div>
            <div className="space-y-3">
              {connectors.map(c => (
                <div key={c.connector_id} className="bg-slate-900/60 border border-slate-750 p-3 rounded-lg flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <p className="text-white text-xs font-medium truncate">{c.display_name}</p>
                    <p className="text-slate-400 text-[11px] truncate mt-0.5">{c.description}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 font-medium ${
                    c.is_demo
                      ? 'bg-amber-900/40 text-amber-300 border border-amber-700/60'
                      : 'bg-emerald-900/40 text-emerald-300 border border-emerald-700/60'
                  }`}>
                    {c.is_demo ? 'Synthetic Demo' : 'Permitted API'}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-700/60 text-xs text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            100% compliant with source terms & robots.txt
          </div>
        </div>

        {/* Recent Workflows */}
        <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-xl p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-700 mb-4">
            <h3 className="text-white font-semibold text-sm flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-400" />
              Recent Collection Workflows
            </h3>
            <Link to="/workflows" className="text-indigo-400 hover:text-indigo-300 text-xs">
              Audit log →
            </Link>
          </div>

          {workflows.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400 text-sm">No collection workflows executed yet.</p>
              <Link to="/new-task" className="text-indigo-400 hover:text-indigo-300 text-xs mt-2 inline-block font-medium">
                Execute your first task →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-700/60">
              {workflows.slice(0, 5).map(wf => (
                <div key={wf.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-white text-sm font-medium truncate">{wf.name}</p>
                      <span className="text-[10px] text-slate-400 bg-slate-700/60 px-1.5 py-0.5 rounded">
                        #{wf.id}
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs truncate mt-0.5 max-w-lg">{wf.requirement}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-[11px] px-2.5 py-0.5 rounded-full border ${
                      wf.status === 'completed' ? 'bg-emerald-950 text-emerald-400 border-emerald-800' :
                      wf.status === 'failed' ? 'bg-red-950 text-red-400 border-red-800' :
                      'bg-blue-950 text-blue-400 border-blue-800'
                    }`}>
                      {wf.status}
                    </span>
                    <span className="text-slate-500 text-xs hidden sm:block">
                      {new Date(wf.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
