import { useEffect, useState } from 'react'
import { Wallet } from 'lucide-react'
import { supabase } from './lib/supabase'
import { inputStyle, primaryButton, ghostButton, deleteX } from './styles'

function Expenses({ userId }) {
  const [entries, setEntries] = useState([])
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState('expense')
  const [category, setCategory] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchEntries() }, [])

  async function fetchEntries() {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('entry_date', { ascending: false })
    if (!error) setEntries(data)
    setLoading(false)
  }

  async function addEntry(e) {
    e.preventDefault()
    if (!title.trim() || !amount) return
    const today = new Date().toISOString().split('T')[0]
    const { error } = await supabase
      .from('expenses')
      .insert([{ title, amount: parseFloat(amount), type, category, user_id: userId, entry_date: today }])
    if (!error) { setTitle(''); setAmount(''); setCategory(''); fetchEntries() }
  }

  async function deleteEntry(id) {
    await supabase.from('expenses').delete().eq('id', id)
    fetchEntries()
  }

  const income = entries.filter(e => e.type === 'income').reduce((a, e) => a + e.amount, 0)
  const expense = entries.filter(e => e.type === 'expense').reduce((a, e) => a + e.amount, 0)
  const balance = income - expense

  const byCategory = {}
  entries.filter(e => e.type === 'expense').forEach(e => {
    const cat = e.category || 'Uncategorized'
    byCategory[cat] = (byCategory[cat] || 0) + e.amount
  })

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
        <SummaryCard label="Balance" value={balance} color={balance >= 0 ? '#6EE7B7' : '#FCA5A5'} />
        <SummaryCard label="Income" value={income} color="#6EE7B7" />
        <SummaryCard label="Expenses" value={expense} color="#FCA5A5" />
      </div>

      <form onSubmit={addEntry} style={{ display: 'flex', gap: '6px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What was it for..."
          style={{ ...inputStyle, flex: '1 1 120px' }}
        />
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
          style={{ ...inputStyle, width: '100px' }}
        />
        <input
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Category"
          style={{ ...inputStyle, width: '110px' }}
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          style={{ ...inputStyle, width: '100px' }}
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
        <button type="submit" style={primaryButton}>Add</button>
      </form>

      {Object.keys(byCategory).length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>SPENDING BY CATEGORY</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {Object.entries(byCategory).sort((a, b) => b[1] - a[1]).map(([cat, amt]) => (
              <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
                <span>{cat}</span>
                <span style={{ color: 'var(--text-muted)' }}>₹{amt.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Loading...</p>
      ) : entries.length === 0 ? (
        <div className="empty-state"><Wallet size={28} /><span>No entries yet — log your first expense above</span></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {entries.map((entry) => (
            <div key={entry.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              fontSize: '13px', padding: '10px 12px', borderRadius: '10px', background: 'var(--surface-2)'
            }}>
              <div>
                <span>{entry.title}</span>
                {entry.category && <span style={{ marginLeft: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>{entry.category}</span>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ color: entry.type === 'income' ? '#6EE7B7' : '#FCA5A5', fontWeight: 600 }}>
                  {entry.type === 'income' ? '+' : '-'}₹{entry.amount.toFixed(2)}
                </span>
                <span onClick={() => deleteEntry(entry.id)} style={deleteX}>✕</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function SummaryCard({ label, value, color }) {
  return (
    <div style={{ background: 'var(--surface-2)', borderRadius: '12px', padding: '14px' }}>
      <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>{label}</p>
      <p style={{ fontSize: '20px', fontWeight: 700, color }}>₹{value.toFixed(2)}</p>
    </div>
  )
}

export default Expenses