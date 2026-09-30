import { Outlet, NavLink, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  LayoutDashboard, Plus, GitBranch, Database, BarChart3,
  Globe, Settings, Layers, Activity, CheckCircle, AlertCircle
} from 'lucide-react'
import { getHealth } from '../api'

const NAV_ITEMS = [
  { to: '/',         label: 'Dashboard',     icon: LayoutDashboard, end: true },
  { to: '/new-task', label: 'New Data Task', icon: Plus,            end: false, highlight: true },
  { to: '/workflows',label: 'Workflows',     icon: GitBranch,       end: false },
  { to: '/datasets', label: 'Datasets',      icon: Database,        end: false },
  { to: '/quality',  label: 'Data Quality',  icon: BarChart3,       end: false },
  { to: '/sources',  label: 'Sources',       icon: Globe,           end: false },
  { to: '/settings', label: 'Settings',      icon: Settings,        end: false },
]

export default function Layout() {
  const { data: health, isError, isLoading } = useQuery({
    queryKey: ['health'],
    queryFn: getHealth,
    refetchInterval: 30_000,
  })

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', backgroundColor: '#0f172a' }}>
      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <aside style={{
        width: '220px', flexShrink: 0, backgroundColor: '#1e293b',
        borderRight: '1px solid #334155', display: 'flex', flexDirection: 'column'
      }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '20px 16px', borderBottom: '1px solid #334155'
          }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <Layers size={18} color="white" />
            </div>
            <div>
              <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '15px', lineHeight: 1 }}>
                DataPilot
              </div>
              <div style={{ color: '#64748b', fontSize: '11px', marginTop: '2px' }}>
                AI Intelligence
              </div>
            </div>
          </div>
        </Link>

        {/* Nav Items */}
        <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
          {NAV_ITEMS.map(({ to, label, icon: Icon, end, highlight }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '9px 10px', borderRadius: '8px', marginBottom: '2px',
                textDecoration: 'none', fontSize: '13.5px', fontWeight: 500,
                transition: 'all 0.15s',
                backgroundColor: highlight
                  ? (isActive ? '#4f46e5' : '#312e81')
                  : (isActive ? '#312e81' : 'transparent'),
                color: isActive ? '#e0e7ff'
                  : highlight ? '#a5b4fc' : '#94a3b8',
                border: highlight ? '1px solid #4338ca' : '1px solid transparent',
              })}
            >
              <Icon size={15} style={{ flexShrink: 0 }} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Status pill */}
        <div style={{ padding: '12px 14px', borderTop: '1px solid #334155' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px' }}>
            {isLoading ? (
              <><Activity size={12} color="#64748b" /><span style={{ color: '#64748b' }}>Connecting…</span></>
            ) : isError ? (
              <><AlertCircle size={12} color="#f87171" /><span style={{ color: '#f87171' }}>Backend offline</span></>
            ) : (
              <><CheckCircle size={12} color="#34d399" /><span style={{ color: '#64748b' }}>v{health?.version} · {health?.ai_mode} mode</span></>
            )}
          </div>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <main style={{ flex: 1, overflowY: 'auto', backgroundColor: '#0f172a' }}>
        <Outlet />
      </main>
    </div>
  )
}
