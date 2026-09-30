import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  BarChart3, CheckCircle2, ArrowRight, ShieldCheck
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import { getQualityOverview, getDatasets } from '../api'

export default function DataQualityPage() {
  const { data: quality } = useQuery({
    queryKey: ['quality-overview'],
    queryFn: getQualityOverview,
  })


  const { data: datasets = [] } = useQuery({
    queryKey: ['datasets'],
    queryFn: getDatasets,
  })

  const chartData = quality?.quality_distribution.map(d => ({
    range: d.range,
    count: d.count,
  })) || []

  const getBarColor = (range: string) => {
    if (range.includes('90') || range.includes('80')) return '#22c55e'
    if (range.includes('70')) return '#3b82f6'
    if (range.includes('60')) return '#f59e0b'
    return '#ef4444'
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-white tracking-tight">Data Quality & Health Index</h1>
          <span className="bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full font-medium">
            Automated Audit
          </span>
        </div>
        <p className="text-slate-400 text-sm mt-1">
          Real-time metrics on completeness, deduplication, schema validity, and source compliance across all collected datasets.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
          <p className="text-xs text-slate-400 uppercase font-semibold">Average Quality Score</p>
          <p className="text-3xl font-bold text-white mt-1">{quality ? `${quality.avg_quality_score}/100` : '—'}</p>
          <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {quality?.datasets_above_80 ?? 0} dataset(s) graded ≥80
          </p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
          <p className="text-xs text-slate-400 uppercase font-semibold">Data Completeness</p>
          <p className="text-3xl font-bold text-white mt-1">{quality?.avg_completeness ?? 0}%</p>
          <p className="text-xs text-slate-400 mt-2">
            {quality?.total_nulls_filled ?? 0} missing values imputed
          </p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
          <p className="text-xs text-slate-400 uppercase font-semibold">Uniqueness Score</p>
          <p className="text-3xl font-bold text-white mt-1">{quality?.avg_uniqueness ?? 0}%</p>
          <p className="text-xs text-slate-400 mt-2">
            {quality?.total_dupes_removed ?? 0} duplicates pruned
          </p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
          <p className="text-xs text-slate-400 uppercase font-semibold">Total Verified Records</p>
          <p className="text-3xl font-bold text-white mt-1">{quality?.total_records.toLocaleString() ?? '0'}</p>
          <p className="text-xs text-slate-400 mt-2">
            Across {quality?.total_datasets ?? 0} datasets
          </p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-semibold text-sm">Quality Score Distribution</h3>
              <p className="text-slate-400 text-xs mt-0.5">Frequency distribution of dataset health scores</p>
            </div>
            <BarChart3 className="w-4 h-4 text-indigo-400" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="range" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f8fafc', borderRadius: 8, fontSize: 12 }}
                  formatter={(val: any) => [`${val ?? 0} dataset(s)`, 'Count']}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(entry.range)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quality Guidelines Card */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Quality Assurance Protocol
            </h3>
            <div className="space-y-3 text-xs">
              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-750">
                <p className="text-white font-medium">1. Null Imputation</p>
                <p className="text-slate-400 text-[11px] mt-0.5">Numeric nulls filled with median values; strings standard-labeled.</p>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-750">
                <p className="text-white font-medium">2. Strict Deduplication</p>
                <p className="text-slate-400 text-[11px] mt-0.5">Prunes identical entities to prevent multi-source skew.</p>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-750">
                <p className="text-white font-medium">3. Schema Conformity</p>
                <p className="text-slate-400 text-[11px] mt-0.5">Enforces column typing and flags suspicious length strings.</p>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-700 text-[11px] text-slate-400">
            Complies with AI data governance standards.
          </div>
        </div>
      </div>

      {/* Dataset Quality Leaderboard */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
        <h3 className="text-white font-semibold text-sm mb-4">Dataset Health Leaderboard</h3>
        {datasets.length === 0 ? (
          <p className="text-slate-400 text-xs">No datasets generated yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-900 text-slate-400 border-b border-slate-700 font-semibold">
                <tr>
                  <th className="py-2.5 px-4">Dataset Name</th>
                  <th className="py-2.5 px-4">Source Connector</th>
                  <th className="py-2.5 px-4">Row Count</th>
                  <th className="py-2.5 px-4">Quality Score</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {datasets.map(d => (
                  <tr key={d.id} className="hover:bg-slate-750/40 transition-colors">
                    <td className="py-2.5 px-4 font-medium text-white">{d.name}</td>
                    <td className="py-2.5 px-4 text-slate-400">{d.source_label}</td>
                    <td className="py-2.5 px-4 text-slate-300">{d.row_count} rows</td>
                    <td className="py-2.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full font-semibold ${
                        d.quality_score >= 85 ? 'text-emerald-400 bg-emerald-950 border border-emerald-800' :
                        d.quality_score >= 70 ? 'text-amber-400 bg-amber-950 border border-amber-800' :
                        'text-red-400 bg-red-950 border border-red-800'
                      }`}>
                        {d.quality_score}/100
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <Link
                        to={`/datasets/${d.id}`}
                        className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium"
                      >
                        <span>Audit</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
