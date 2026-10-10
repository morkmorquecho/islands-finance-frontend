import { ref, computed } from 'vue'
import transactionsService from '@/services/transactions.service'
import { todayLocal } from '@/utils/date'

function createTransferId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function transferMetadata(note, transferId, destinationId) {
  return `${note ? `${note} · ` : ''}[transfer:${transferId};destination:${destinationId}]`
}

function transferDestinationId(transaction) {
  return transaction?.note?.match(/\[transfer:[^;\]]+;destination:([^\]]+)\]/)?.[1] ?? ''
}

export function useTransactionForm({
  islandId,
  islandRef,
  isCashIsland,
  availableDestinations,
  currency,
  getAvailableBalance,
  onSaved,
}) {
  const newTransaction = ref({
    type: 'deposit',
    date: todayLocal(),
    amount: '',
    quantity: '',
    price_at_tx: '',
    category: '',
    note: '',
    destinationIslandId: '',
  })

  const editingTransaction = ref(null)
  const editTransaction = ref({
    date: '', amount: '', quantity: '', price_at_tx: '',
    category: '', note: '', destinationIslandId: '',
  })

  const savingTransaction = ref(false)
  const transactionError = ref('')

  const isExpense = computed(() => newTransaction.value.type === 'expense')
  const isTransfer = computed(() => newTransaction.value.type === 'withdrawal')
  const isEditingTransfer = computed(() => editingTransaction.value?.type === 'withdrawal')

  /** Saldo disponible actual, en moneda base. */
  const availableBalance = computed(() => Number(getAvailableBalance?.() ?? 0))

  function resetNewTransaction() {
    newTransaction.value = {
      type: isCashIsland.value ? 'deposit' : 'buy',
      date: todayLocal(),
      amount: '', quantity: '', price_at_tx: '', category: '', note: '', destinationIslandId: '',
    }
  }

  /* ── Validación de saldo (nueva transacción) ─────────────── */

  function validateNewDebit() {
    const isDebit = newTransaction.value.type === 'expense' || newTransaction.value.type === 'withdrawal'
    if (!isCashIsland.value || !isDebit) return true

    const amount = Number(newTransaction.value.amount)
    if (!Number.isFinite(amount) || amount <= 0) {
      transactionError.value = 'Ingresa un monto válido.'
      return false
    }
    if (amount > availableBalance.value) {
      transactionError.value = `El monto no puede superar el total disponible (${availableBalance.value.toFixed(2)} ${currency?.value ?? ''}).`.trim()
      return false
    }
    return true
  }

  /* ── Validación de saldo (edición) ───────────────────────── */

  function validateEditDebit() {
    const original = editingTransaction.value
    if (!original || !isCashIsland.value) return true

    const isDebit = original.type === 'expense' || original.type === 'withdrawal'
    if (!isDebit) return true

    const newAmount = Number(editTransaction.value.amount)
    const originalAmount = Number(original.amount) || 0

    // El monto original ya está descontado del saldo actual: lo "devolvemos"
    // virtualmente para no bloquear ediciones que en realidad son válidas.
    const effectiveBalance = availableBalance.value + originalAmount

    if (!Number.isFinite(newAmount) || newAmount <= 0) {
      transactionError.value = 'Ingresa un monto válido.'
      return false
    }
    if (newAmount > effectiveBalance) {
      transactionError.value = `El monto no puede superar el total disponible (${effectiveBalance.toFixed(2)} ${currency?.value ?? ''}).`.trim()
      return false
    }
    return true
  }

  async function createTransaction() {
    savingTransaction.value = true
    transactionError.value = ''

    if (!validateNewDebit()) {
      savingTransaction.value = false
      return
    }

    let withdrawalCreated = false
    try {
      const payload = {
        island: islandId.value,
        type: newTransaction.value.type,
        date: newTransaction.value.date,
        note: newTransaction.value.note,
      }

      if (isCashIsland.value) {
        payload.amount = newTransaction.value.amount
        if (isExpense.value) payload.category = newTransaction.value.category
      } else {
        payload.quantity = newTransaction.value.quantity
        payload.price_at_tx = newTransaction.value.price_at_tx
      }

      if (isTransfer.value) {
        const transferId = createTransferId()
        const destination = availableDestinations.value.find(
          (c) => String(c.id) === newTransaction.value.destinationIslandId
        )
        payload.note = transferMetadata(
          newTransaction.value.note, transferId, newTransaction.value.destinationIslandId
        )
        await transactionsService.create(payload)
        withdrawalCreated = true
        await transactionsService.create({
          island: newTransaction.value.destinationIslandId,
          type: 'deposit',
          date: newTransaction.value.date,
          amount: newTransaction.value.amount,
          note: `Transferencia desde ${islandRef.value.name} a ${destination?.name ?? 'otra isla'} [transfer:${transferId};destination:${newTransaction.value.destinationIslandId}]`,
        })
      } else {
        await transactionsService.create(payload)
      }
      resetNewTransaction()
      await onSaved?.()
    } catch (err) {
      transactionError.value = withdrawalCreated
        ? 'El retiro se registró, pero no se pudo completar el depósito en la isla destino. Revisa tus movimientos antes de intentarlo de nuevo.'
        : err.message ?? 'No se pudo guardar el movimiento.'
    } finally {
      savingTransaction.value = false
    }
  }

  function startEditing(transaction) {
    editingTransaction.value = transaction
    editTransaction.value = {
      date: transaction.date,
      amount: transaction.amount ?? '',
      quantity: transaction.quantity ?? '',
      price_at_tx: transaction.price_at_tx ?? '',
      category: transaction.category ?? '',
      note: transaction.note?.replace(/\s*\[transfer:[^\]]+\]$/, '') ?? '',
      destinationIslandId: transferDestinationId(transaction) || String(availableDestinations.value[0]?.id ?? ''),
    }
  }

  function cancelEditing() {
    editingTransaction.value = null
  }

  async function findTransferDeposit(withdrawal) {
    const destinationId = transferDestinationId(withdrawal)
    if (!destinationId) return null
    const transferId = withdrawal.note?.match(/\[transfer:([^;\]]+)/)?.[1]
    const data = await transactionsService.list({
      island: destinationId, type: 'deposit', ordering: '-created_at',
    })
    return (data.results ?? []).find((t) => t.note?.includes(`[transfer:${transferId};`)) ?? null
  }

  async function saveEdit() {
    const original = editingTransaction.value
    if (!original) return
    savingTransaction.value = true
    transactionError.value = ''

    if (!validateEditDebit()) {
      savingTransaction.value = false
      return
    }

    try {
      const payload = { date: editTransaction.value.date, note: editTransaction.value.note }
      if (isCashIsland.value) {
        payload.amount = editTransaction.value.amount
        if (original.type === 'expense') payload.category = editTransaction.value.category
      } else {
        payload.quantity = editTransaction.value.quantity
        payload.price_at_tx = editTransaction.value.price_at_tx
      }

      if (original.type === 'withdrawal') {
        const previousDestinationId = transferDestinationId(original)
        const transferId = original.note?.match(/\[transfer:([^;\]]+)/)?.[1] ?? createTransferId()
        const destination = availableDestinations.value.find(
          (c) => String(c.id) === editTransaction.value.destinationIslandId
        )
        const pairedDeposit = await findTransferDeposit(original)
        payload.note = transferMetadata(
          editTransaction.value.note, transferId, editTransaction.value.destinationIslandId
        )

        if (previousDestinationId === editTransaction.value.destinationIslandId && pairedDeposit) {
          await Promise.all([
            transactionsService.partialUpdate(original.id, payload),
            transactionsService.partialUpdate(pairedDeposit.id, {
              date: editTransaction.value.date,
              amount: editTransaction.value.amount,
              note: `Transferencia desde ${islandRef.value.name} a ${destination?.name ?? 'otra isla'} [transfer:${transferId};destination:${editTransaction.value.destinationIslandId}]`,
            }),
          ])
        } else {
          await transactionsService.create({
            island: editTransaction.value.destinationIslandId,
            type: 'deposit',
            date: editTransaction.value.date,
            amount: editTransaction.value.amount,
            note: `Transferencia desde ${islandRef.value.name} a ${destination?.name ?? 'otra isla'} [transfer:${transferId};destination:${editTransaction.value.destinationIslandId}]`,
          })
          await transactionsService.partialUpdate(original.id, payload)
          if (pairedDeposit) await transactionsService.destroy(pairedDeposit.id)
        }
      } else {
        await transactionsService.partialUpdate(original.id, payload)
      }

      cancelEditing()
      await onSaved?.()
    } catch (err) {
      transactionError.value = err.message ?? 'No se pudo actualizar el movimiento.'
    } finally {
      savingTransaction.value = false
    }
  }

  return {
    newTransaction, editingTransaction, editTransaction,
    savingTransaction, transactionError,
    isExpense, isTransfer, isEditingTransfer,
    availableBalance,
    resetNewTransaction, createTransaction,
    startEditing, cancelEditing, saveEdit,
    transferDestinationId,
  }
}