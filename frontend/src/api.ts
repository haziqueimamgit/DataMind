import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 60_000,
})

export default api

// ── Shared types ──────────────────────────────────────────────────────────

export interface HealthStatus {
  status: string; app: string; version: string
  environment: string; ai_mode: string; timestamp: string
  connectors_available: string[]
}

export interface WorkflowSummary {
  id: number; name: string; requirement: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  source_connector: string | null; created_at: string; updated_at: string
}

export interface StepEvent {
  step: string; status: 'success' | 'warning' | 'error'
  detail: string; stats: Record<string, unknown>; timestamp: string
}

export interface WorkflowDetail extends WorkflowSummary {
  parsed_intent: Record<string, unknown>
  steps_log: StepEvent[]
  error_message: string | null
}

export interface WorkflowStats {
  total: number; completed: number; failed: number
  running: number; pending: number
  total_records_processed: number; avg_quality_score: number
}

export interface PlannedStep { step: string; description: string; status: string }

export interface WorkflowPlan {
  name: string; requirement: string; connector_id: string
  parsed_intent: Record<string, unknown>
  planned_steps: PlannedStep[]
  estimated_records: number; domain: string
  fields_requested: string[]; quality_ops_planned: string[]; ai_mode: string
}

export interface DatasetSummary {
  id: number; workflow_id: number; name: string; description: string | null
  source_connector: string; source_label: string; is_demo_data: boolean
  row_count: number; column_count: number
  duplicate_rows_removed: number; null_values_filled: number
  quality_score: number; created_at: string
}

export interface ColumnInfo {
  dtype: string; nullable: boolean; unique: number; sample: string[]
}

export interface DatasetDetail extends DatasetSummary {
  schema_info: Record<string, ColumnInfo>
  preview: Record<string, unknown>[]
}

export interface DatasetStats {
  total_datasets: number; total_records: number
  avg_quality_score: number; avg_completeness: number
  avg_uniqueness: number; total_nulls_filled: number; total_dupes_removed: number
}

export interface QualityMetrics {
  dataset_id: number; quality_score: number; completeness: number
  validity: number; uniqueness: number; null_count: number
  duplicate_count: number; total_rows_original: number; total_rows_clean: number
  columns: number; validation_issues: string[]
  quality_breakdown: { name: string; score: number; color: string }[]
}

export interface QualityOverview {
  total_datasets: number; avg_quality_score: number
  avg_completeness: number; avg_uniqueness: number
  datasets_above_80: number; datasets_below_60: number
  total_records: number; total_nulls_filled: number; total_dupes_removed: number
  quality_distribution: { range: string; count: number }[]
}

export interface RecordsResponse {
  records: Record<string, unknown>[]; total: number
  page: number; page_size: number; pages: number; columns: string[]
}

export interface ProvenanceInfo {
  dataset_id: number; source_connector: string; source_label: string
  is_demo_data: boolean; collection_timestamp: string
  connector_description: string; supported_domains: string[]
  requires_auth: boolean; data_notice: string
  workflow_id: number; workflow_name: string; workflow_requirement: string
}

export interface ConnectorInfo {
  connector_id: string; display_name: string; description: string
  is_demo: boolean; requires_auth: boolean; supported_domains: string[]
}

// ── API calls ─────────────────────────────────────────────────────────────

// Health
export const getHealth = () => api.get<HealthStatus>('/health').then(r => r.data)

// Workflows
export const getWorkflows = () => api.get<WorkflowSummary[]>('/workflows/').then(r => r.data)
export const getWorkflow  = (id: number) => api.get<WorkflowDetail>(`/workflows/${id}`).then(r => r.data)
export const createWorkflow = (p: { name: string; requirement: string; connector_id?: string }) =>
  api.post<WorkflowDetail>('/workflows/', p).then(r => r.data)
export const planWorkflow = (p: { name: string; requirement: string; connector_id?: string }) =>
  api.post<WorkflowPlan>('/workflows/plan', p).then(r => r.data)
export const getWorkflowStats = () => api.get<WorkflowStats>('/workflows/stats').then(r => r.data)

// Datasets
export const getDatasets    = () => api.get<DatasetSummary[]>('/datasets/').then(r => r.data)
export const getDataset     = (id: number) => api.get<DatasetDetail>(`/datasets/${id}`).then(r => r.data)
export const getDatasetStats = () => api.get<DatasetStats>('/datasets/stats').then(r => r.data)
export const getDatasetQuality = (id: number) => api.get<QualityMetrics>(`/datasets/${id}/quality`).then(r => r.data)
export const getDatasetProvenance = (id: number) => api.get<ProvenanceInfo>(`/datasets/${id}/provenance`).then(r => r.data)
export const getDatasetRecords = (id: number, params: {
  page?: number; page_size?: number; search?: string; sort_col?: string; sort_dir?: 'asc' | 'desc'
}) => api.get<RecordsResponse>(`/datasets/${id}/records`, { params }).then(r => r.data)

// Quality
export const getQualityOverview = () => api.get<QualityOverview>('/quality/overview').then(r => r.data)

// Connectors
export const getConnectors = () => api.get<ConnectorInfo[]>('/connectors/').then(r => r.data)

// Export helpers (return URL for link/download)
export const csvExportUrl  = (id: number) => `/api/datasets/${id}/export`
export const jsonExportUrl = (id: number) => `/api/datasets/${id}/export/json`
