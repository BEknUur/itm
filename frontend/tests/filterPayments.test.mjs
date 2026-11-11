import test from 'node:test'
import assert from 'node:assert/strict'
import { filterPayments } from '../src/widgets/payments-queue/model/filterPayments.ts'

const rows = [
  { id: 1, customer_id: 'aigerim', payee: 'KZ12 Mother', status: 'HELD' },
  { id: 2, customer_id: 'aigerim', payee: 'KZ99 Safe account', status: 'CANCELLED' },
  { id: 3, customer_id: 'timur', payee: 'UZ88 Car dealer', status: 'RELEASED' },
  { id: 4, customer_id: 'elena', payee: 'KG77 Utilities', status: 'SENT' },
]
const ids = (query, status = 'ALL', data = rows) => filterPayments(data, query, status).map(row => row.id)
test('NF-01 customer prefix is case insensitive and trims query', () => assert.deepEqual(ids('  AIG  '), [1, 2]))
test('NF-02 payee prefix is case insensitive and trims query', () => { assert.deepEqual(ids('  uz88 c  '), [3]); assert.deepEqual(ids('KZ12'), [1]) })
test('NF-03 customer substrings do not match', () => { assert.deepEqual(ids('ge'), []); assert.deepEqual(ids('rim'), []) })
test('NF-04 inner words and partial interior strings do not match', () => { for (const query of ['Mother', 'CAR DEAL', 'Safe', 'Z12']) assert.deepEqual(ids(query), []) })
test('NF-05 full fields match', () => { assert.deepEqual(ids('AIGERIM'), [1, 2]); assert.deepEqual(ids('KZ12 Mother'), [1]) })
test('NF-06 Held', () => assert.deepEqual(ids('', 'HELD'), [1]))
test('NF-07 Sent', () => assert.deepEqual(ids('', 'SENT'), [4]))
test('NF-08 Released', () => assert.deepEqual(ids('', 'RELEASED'), [3]))
test('NF-09 Cancelled', () => assert.deepEqual(ids('', 'CANCELLED'), [2]))
test('NF-10 text AND status', () => { assert.deepEqual(ids('aigerim', 'CANCELLED'), [2]); assert.deepEqual(ids('timur', 'HELD'), []); assert.deepEqual(ids('KZ', 'CANCELLED'), [2]) })
test('NF-11 unknown query returns empty', () => assert.deepEqual(ids('nonexistent'), []))
test('NF-12 cleared/whitespace query and All return every record', () => { assert.deepEqual(ids(''), [1, 2, 3, 4]); assert.deepEqual(ids('   '), [1, 2, 3, 4]) })
test('NF-13 empty input, order and no mutation', () => { const original = structuredClone(rows); assert.deepEqual(ids('', 'ALL', []), []); assert.deepEqual(ids(''), [1, 2, 3, 4]); assert.deepEqual(rows, original) })
test('NF-14 refreshed status respected without changing filters', () => { const fresh = [{ ...rows[0], status: 'RELEASED' }]; assert.deepEqual(ids('', 'HELD', fresh), []); assert.deepEqual(ids('', 'RELEASED', fresh), [1]) })
