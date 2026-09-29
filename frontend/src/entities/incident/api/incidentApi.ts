import { http } from '@/shared/api'
import type { Incident } from '../model/types'

export const fetchIncidents = () => http<Incident[]>('/nafc/incidents')
