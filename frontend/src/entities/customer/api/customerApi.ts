import { http } from '@/shared/api'
import type { Customer } from '../model/types'

export const fetchCustomers = () => http<Customer[]>('/customers')
