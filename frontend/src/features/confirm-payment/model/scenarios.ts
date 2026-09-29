import type { ConfirmPaymentInput } from '../api/confirmPayment'

/** Device a fraudster logs in from; never in any customer's trusted list. */
export const UNKNOWN_DEVICE = 'unknown-android'

export type ScenarioId = 'routine' | 'fakeCall' | 'takeover' | 'genuine'

/** Titles and hints live in shared/i18n under `scenario.<id>.*`. */
export type Scenario = { id: ScenarioId; input: ConfirmPaymentInput }

export const SCENARIOS: Scenario[] = [
  {
    id: 'routine',
    input: { customer_id: 'aigerim', payee: 'KZ12 Mother', amount: 20_000, device_id: 'iphone-aigerim', failed_otp: 0 },
  },
  {
    id: 'fakeCall',
    input: { customer_id: 'aigerim', payee: 'KZ99 Safe account', amount: 900_000, device_id: 'iphone-aigerim', failed_otp: 0 },
  },
  {
    id: 'takeover',
    input: { customer_id: 'aigerim', payee: 'KZ99 Safe account', amount: 900_000, device_id: UNKNOWN_DEVICE, failed_otp: 3 },
  },
  {
    id: 'genuine',
    input: { customer_id: 'timur', payee: 'UZ88 Car dealer', amount: 2_000_000, device_id: 'android-timur', failed_otp: 0 },
  },
]
