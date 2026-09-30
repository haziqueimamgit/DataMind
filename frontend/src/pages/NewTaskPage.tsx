import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import {
  ArrowLeft, Loader2, AlertCircle,
  Zap, Compass, Layers, ShieldCheck, ChevronRight
} from 'lucide-react'

import { createWorkflow, planWorkflow, getConnectors, type WorkflowPlan } from '../api'

const PRESET_REQUIREMENTS = [
  {
    category: 'Job Openings',
    title: 'AI & Engineering Job Openings',
    prompt: 'Collect recent remote AI, Machine Learning, and Python engineering job openings with salary ranges, required tech skills, and company information.',
    recommendedConnector: 'jobs'
  },
  {
    category: 'Market Intelligence',
    title: 'Top Digital Assets & Valuations',
    prompt: 'Aggregate market capitalization, 24-hour trading volumes, and price movements for top digital assets. Fill missing entries and deduplicate.',
    recommendedConnector: 'crypto_market'
  },
  {
    category: 'Sponsor & Leads',
    title: 'Startup Hiring & Sponsor Leads',
    prompt: 'Extract verified startup hiring leads and sponsorship opportunities from tech founders, ensuring source thread URL traceability.',
    recommendedConnector: 'hn_leads'
  },
  {
    category: 'Enterprise Demo',
    title: 'Clean E-Commerce Transactions',
    prompt: 'Get me clean sales order data – detect missing customer emails, prune duplicates, and compute composite data quality index.',
    recommendedConnector: 'demo'
  },
]

export default function NewTaskPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const qc = useQueryClient()

  const initialPrompt = (location.state as { initialPrompt?: string })?.initialPrompt || ''

  const [name, setName] = useState('')
  const [requirement, setRequirement] = useState(initialPrompt)
  const [connector, setConnector] = useState('auto')
  const [plan, setPlan] = useState<WorkflowPlan | null>(null)

  const { data: connectors = [] } = useQuery({
    queryKey: ['connectors'],
    queryFn: getConnectors,
  })

  // Set default name if prompt is provided
  useEffect(() => {
    if (requirement && !name) {
      const words = requirement.slice(0, 30).trim()
      setName(`${words}... Task`)
    }
  }, [requirement, name])

  // Plan mutation
  const planMutation = useMutation({
    mutationFn: planWorkflow,
    onSuccess: (data) => {
      setPlan(data)
    },
  })

  // Run execution mutation
  const runMutation = useMutation({
    mutationFn: createWorkflow,
    onSuccess: (wf) => {
      qc.invalidateQueries({ queryKey: ['workflows'] })
      qc.invalidateQueries({ queryKey: ['datasets'] })
      qc.invalidateQueries({ queryKey: ['workflow-stats'] })
      qc.invalidateQueries({ queryKey: ['quality-overview'] })
      navigate('/workflows', { state: { highlightId: wf.id } })
    },
  })

  const handlePlanPreview = (e: React.FormEvent) => {
    e.preventDefault()
    if (!requirement.trim()) return
    planMutation.mutate({
      name: name.trim() || 'Data Intelligence Task',
      requirement: requirement.trim(),
      connector_id: connector === 'auto' ? undefined : connector,
    })
  }

  const handleExecute = () => {
    if (!requirement.trim()) return
    runMutation.mutate({
      name: name.trim() || 'Data Intelligence Task',
      requirement: requirement.trim(),
      connector_id: connector === 'auto' ? undefined : connector,
    })
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <Link
        to="/workflows"
        className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white text-xs font-medium transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Workflows
      </Link>

      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-white tracking-tight">New Data Intelligence Task</h1>
          <span className="bg-indigo-900/60 border border-indigo-700 text-indigo-300 text-xs px-2.5 py-0.5 rounded-full font-medium">
            AI Prompt Engine
          </span>
        </div>
        <p className="text-slate-400 text-sm mt-1">
          Describe any data collection requirement in natural language. DataPilot dynamically plans the extraction, runs quality rules, and outputs clean, source-backed datasets.
        </p>
      </div>

      {/* Preset cards */}
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
          Quick Start Templates (Click to apply)
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {PRESET_REQUIREMENTS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setName(preset.title)
                setRequirement(preset.prompt)
                setConnector(preset.recommendedConnector)
                setPlan(null)
              }}
              className="text-left bg-slate-800/80 hover:bg-slate-750 border border-slate-700/80 hover:border-indigo-500/60 p-3.5 rounded-xl transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider">
                  {preset.category}
                </span>
                <span className="text-[11px] text-slate-500 group-hover:text-indigo-300 transition-colors">
                  Apply Template →
                </span>
              </div>
              <p className="text-white text-xs font-medium mb-1">{preset.title}</p>
              <p className="text-slate-400 text-[11px] line-clamp-2">{preset.prompt}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Task Form */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-md space-y-5">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
            Task Name
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Q4 Tech Talent Pipeline or Top 50 Market Intelligence"
            className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center justify-between">
            <span>Natural Language Business Requirement</span>
            <span className="text-indigo-400 font-normal lowercase text-xs">powered by AI NLP</span>
          </label>
          <textarea
            value={requirement}
            onChange={e => {
              setRequirement(e.target.value)
              setPlan(null)
            }}
            rows={4}
            placeholder="Describe exactly what information you want to collect, from what domains, and what cleaning operations (e.g. deduplicate, fill nulls, validate schema)..."
            className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none resize-none leading-relaxed"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
            Source Connector Selection
          </label>
          <select
            value={connector}
            onChange={e => {
              setConnector(e.target.value)
              setPlan(null)
            }}
            className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none cursor-pointer"
          >
            <option value="auto">✨ Auto-Detect Best Source Connector (Recommended)</option>
            {connectors.map(c => (
              <option key={c.connector_id} value={c.connector_id}>
                {c.is_demo ? '🧪 ' : '🌐 '} {c.display_name} ({c.connector_id})
              </option>
            ))}
          </select>
          <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            All connectors operate strictly within permitted public boundaries with source traceability.
          </p>
        </div>

        {/* Buttons: Plan Preview and Execute */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handlePlanPreview}
            disabled={planMutation.isPending || !requirement.trim()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-650 disabled:opacity-50 text-slate-200 px-5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all border border-slate-600"
          >
            {planMutation.isPending ? (
              <><Loader2 className="w-4 h-4 animate-spin text-indigo-400" /> Designing Plan…</>
            ) : (
              <><Compass className="w-4 h-4 text-indigo-400" /> Preview AI Execution Plan</>
            )}
          </button>

          <button
            type="button"
            onClick={handleExecute}
            disabled={runMutation.isPending || !requirement.trim()}
            className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md shadow-indigo-600/30"
          >
            {runMutation.isPending ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Executing Pipeline (Collect → Clean → Validate → Deduplicate)…</>
            ) : (
              <><Zap className="w-4 h-4" /> Run End-to-End Workflow</>
            )}
          </button>
        </div>

        {/* Mutation Errors */}
        {(planMutation.isError || runMutation.isError) && (
          <div className="flex items-center gap-2 bg-red-950/40 border border-red-800 rounded-xl p-3 text-red-300 text-xs">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>
              {((planMutation.error || runMutation.error) as Error)?.message || 'Pipeline execution failed.'}
            </span>
          </div>
        )}
      </div>

      {/* Render AI Execution Plan Preview if generated */}
      {plan && (
        <div className="bg-slate-800/90 border border-indigo-700/60 rounded-2xl p-6 shadow-xl space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center justify-between border-b border-slate-700 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              <h3 className="text-white font-semibold text-sm">
                Dynamically Designed Execution Plan
              </h3>
            </div>
            <span className="text-xs bg-indigo-950 text-indigo-300 border border-indigo-800 px-2.5 py-0.5 rounded-full font-medium">
              Domain: {plan.domain} · Target: ~{plan.estimated_records} records
            </span>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-750 text-xs space-y-1.5">
            <p className="text-slate-300">
              <strong className="text-indigo-400">Target Objective:</strong> {String(plan.parsed_intent.objective)}
            </p>
            <p className="text-slate-400">
              <strong className="text-slate-300">Resolved Connector:</strong> {plan.connector_id} · <strong className="text-slate-300">Quality Operations:</strong> {plan.quality_ops_planned.join(', ')}
            </p>
          </div>

          <div className="space-y-2.5 pt-1">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Planned Pipeline Stages:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {plan.planned_steps.map((s, idx) => (
                <div key={idx} className="bg-slate-900 border border-slate-750 p-3 rounded-xl flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-indigo-900/60 border border-indigo-700 text-indigo-300 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="text-white text-xs font-semibold capitalize">{s.step.replace('_', ' ')}</p>
                    <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">{s.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={handleExecute}
              disabled={runMutation.isPending}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md"
            >
              <span>Confirm & Execute Planned Workflow</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
