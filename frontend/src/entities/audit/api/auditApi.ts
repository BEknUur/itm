import { apiUrl, http } from '@/shared/api'
import type { AuditEvent } from '../model/types'

export const fetchAuditTrail = (paymentId: string) => http<AuditEvent[]>(`/audit/${paymentId}`)

export const auditExportUrl = apiUrl('/audit/export.csv')
