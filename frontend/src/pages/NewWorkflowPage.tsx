import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Loader2, Sparkles, AlertCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { createWorkflow } from '../api'

const EXAMPLE_REQUIREMENTS = [
  'Get me clean sales data for analysis – remove duplicates and fill missing values',
  'I need a customer dataset with unique emails, no nulls, validated for the marketing team',
  'Pull product inventory data, deduplicate by SKU, and ensure all prices are valid numbers',
  'Generate a clean employee dataset for HR analytics with no missing salary information',
]

export default function NewWorkflowPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [name, setName] = useState('')
  const [requirement, setRequirement] = useState('')
  const [connector, setConnector] = useState('demo')

  const mutation = useMutation({
    mutationFn: createWorkflow,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workflows'] })
      qc.invalidateQueries({ queryKey: ['datasets'] })
      navigate('/workflows')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !requirement.trim()) return
    mutation.mutate({ name: name.trim(), requirement: requirement.trim(), connector_id: connector })
  }

  return (
    <div className="p-8 max-w-2xl">
      <Link to="/workflows" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Workflows
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">New Workflow</h1>
        <p className="text-slate-400 text-sm mt-1">
          Describe your data requirement in plain English. The AI will parse it, collect data,
          clean it, and produce a validated dataset.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Workflow name */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Workflow Name
          </label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Q4 Sales Analysis"
            required
            className="w-full bg-slate-800 border border-slate-600 text-white placeholder-slate-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {/* Requirement */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Business Requirement <span className="text-indigo-400 font-normal">(natural language)</span>
          </label>
          <textarea
            value={requirement}
            onChange={e => setRequirement(e.target.value)}
            placeholder="Describe what data you need and what quality you expect…"
            required
            rows={5}
            className="w-full bg-slate-800 border border-slate-600 text-white placeholder-slate-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
          />
          {/* Example chips */}
          <div className="mt-2">
            <p className="text-xs text-slate-500 mb-1.5">Quick examples:</p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_REQUIREMENTS.map((ex, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRequirement(ex)}
                  className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 px-2.5 py-1 rounded-full transition-colors text-left"
                >
                  {ex.slice(0, 48)}…
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Connector */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Data Source Connector
          </label>
          <select
            value={connector}
            onChange={e => setConnector(e.target.value)}
            className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="demo">Built-in Demo Dataset (synthetic, always available)</option>
          </select>
          <p className="text-xs text-slate-500 mt-1">
            🔒 Demo data is clearly labeled as synthetic – never presented as real-world data.
          </p>
        </div>

        {/* Error */}
        {mutation.isError && (
          <div className="flex items-start gap-2 bg-red-900/30 border border-red-700 rounded-lg px-4 py-3 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{(mutation.error as Error).message}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={mutation.isPending || !name.trim() || !requirement.trim()}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          {mutation.isPending ? (
            <><Loader2 className="w-4 h-4 animate-spin" />Running Pipeline…</>
          ) : (
            <><Sparkles className="w-4 h-4" />Run Workflow</>
          )}
        </button>
      </form>
    </div>
  )
}
