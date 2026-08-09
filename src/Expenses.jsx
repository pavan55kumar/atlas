import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence, animate } from 'framer-motion'
import {
  Wallet, TrendingUp, TrendingDown, PiggyBank, Receipt, ShoppingBag, Coffee,
  Car, Utensils, Gamepad2, Plane, House, CircleDollarSign, ArrowUpRight,
  ArrowDownRight, Sparkles, MoreVertical, Trash2, Plus
} from 'lucide-react'
import { supabase } from './lib/supabase'
import Sparkline from './Sparkline'
import TiltCard from './TiltCard'
import './Expenses.css'

const QUICK_CATEGORIES = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Bills', 'Travel', 'Other']
const QUICK_AMOUNTS = [50, 100, 200, 500, 1000]
const PALETTE = ['#7C5CFF', '#F0876C', '#6CC7F0', '#8CF06C', '#FDBA74', '#F87171', '#34D399', '#60A5FA']

function hashOf(input) {
  const str = String(input || '')
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0
  }
  return h
}

function categoryIcon(category) {
  const c = (category || '').toLowerCase()
  if (c.includes('food') || c.includes('grocery') || c.includes('eat')) return Utensils
  if (c.includes('transport') || c.includes('car') || c.includes('fuel')) return Car
  if (c.includes('shop')) return ShoppingBag
  if (c.includes('entertain') || c.includes('game')) return Gamepad2
  if (c.includes('travel') || c.includes('flight') || c.includes('trip')) return Plane
  if (c.includes('rent') || c.includes('house') || c.includes('home')) return House
  if (c.includes('coffee')) return Coffee
  if (c.includes('bill') || c.includes('utility')) return Receipt
  return CircleDollarSign
}

function categoryColor(category) {
  return PALETTE[hashOf(category) % PALETTE.length]
}

function CountUp({ value, prefix, decimals, style }) {
  const [display, setDisplay] = useState(0)
  const prevRef = useRef(0)

  useEffect(function () {
    const controls = animate(prevRef.current, value, {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: function (v) { setDisplay(v) }
    })
    prevRef.current = value
    return function () { controls.stop() }
  }, [value])

  return <span style={style}>{prefix || ''}{display.toFixed(decimals != null ? decimals : 2)}</span>
}

function Expenses({ userId }) {
  const [entries, setEntries] = useState([])
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState('expense')
  const [category, setCategory] = useState('')
  const [loading, setLoading] = useState(true)
  const [menuOpenId, setMenuOpenId] = useState(null)

  useEffect(function () { fetchEntries() }, [])

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
    setMenuOpenId(null)
    await supabase.from('expenses').delete().eq('id', id)
    fetchEntries()
  }

  const income = entries.filter(function (e) { return e.type === 'income' }).reduce(function (a, e) { return a + e.amount }, 0)
  const expense = entries.filter(function (e) { return e.type === 'expense' }).reduce(function (a, e) { return a + e.amount }, 0)
  const balance = income - expense

  const byCategory = {}
  entries.filter(function (e) { return e.type === 'expense' }).forEach(function (e) {
    const cat = e.category || 'Uncategorized'
    byCategory[cat] = (byCategory[cat] || 0) + e.amount
  })
  const categoryList = Object.entries(byCategory).sort(function (a, b) { return b[1] - a[1] })
  const topCategory = categoryList.length > 0 ? categoryList[0] : null

  const dayKeys = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    dayKeys.push(d.toISOString().split('T')[0])
  }
  const incomeTrend = dayKeys.map(function (k) {
    return entries.filter(function (e) { return e.type === 'income' && e.entry_date === k }).reduce(function (a, e) { return a + e.amount }, 0)
  })
  const expenseTrend = dayKeys.map(function (k) {
    return entries.filter(function (e) { return e.type === 'expense' && e.entry_date === k }).reduce(function (a, e) { return a + e.amount }, 0)
  })
  const balanceTrend = (function () {
    let running = 0
    return dayKeys.map(function (k, i) {
      running += incomeTrend[i] - expenseTrend[i]
      return running
    })
  })()

  const prevWeekKeys = []
  for (let i = 13; i >= 7; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    prevWeekKeys.push(d.toISOString().split('T')[0])
  }
  const thisWeekSpend = expenseTrend.reduce(function (a, v) { return a + v }, 0)
  const prevWeekSpend = entries.filter(function (e) { return e.type === 'expense' && prevWeekKeys.indexOf(e.entry_date) !== -1 }).reduce(function (a, e) { return a + e.amount }, 0)
  const weekChangePct = prevWeekSpend > 0 ? Math.round(((thisWeekSpend - prevWeekSpend) / prevWeekSpend) * 100) : null

  const today = new Date()
  const dayOfMonth = today.getDate()
  const monthKey = today.toISOString().slice(0, 7)
  const monthExpense = entries.filter(function (e) { return e.type === 'expense' && e.entry_date && e.entry_date.slice(0, 7) === monthKey }).reduce(function (a, e) { return a + e.amount }, 0)
  const avgDailySpend = monthExpense / Math.max(dayOfMonth, 1)

  const savingsRate = income > 0 ? Math.round(((income - expense) / income) * 100) : (expense > 0 ? -100 : 0)
  const healthScoreRaw = 50 + savingsRate / 2
  const healthScore = Math.max(0, Math.min(100, Math.round(healthScoreRaw)))
  const healthLabel = healthScore >= 80 ? 'Excellent' : healthScore >= 60 ? 'Good' : healthScore >= 40 ? 'Fair' : 'Needs attention'

  const insights = []
  if (weekChangePct !== null) {
    insights.push({
      icon: weekChangePct >= 0 ? TrendingUp : TrendingDown,
      color: weekChangePct >= 0 ? '#F87171' : '#34D399',
      text: 'Your spending ' + (weekChangePct >= 0 ? 'increased' : 'decreased') + ' ' + Math.abs(weekChangePct) + '% compared to last week.'
    })
  }
  if (topCategory && expense > 0) {
    const pct = Math.round((topCategory[1] / expense) * 100)
    if (pct >= 30) {
      insights.push({
        icon: PiggyBank,
        color: '#FDBA74',
        text: topCategory[0] + ' makes up ' + pct + '% of your spending — your biggest category this period.'
      })
    }
  }
  if (savingsRate >= 20) {
    insights.push({ icon: Sparkles, color: '#34D399', text: "You're saving " + savingsRate + '% of your income — great pace.' })
  } else if (savingsRate < 0) {
    insights.push({ icon: TrendingDown, color: '#F87171', text: "You're spending more than you're earning right now." })
  }

  // Last 3 distinct categories used, most recent first (entries already ordered by entry_date desc)
  const recentCategories = (function () {
    const seen = new Set()
    const list = []
    for (const e of entries) {
      if (e.category && !seen.has(e.category)) {
        seen.add(e.category)
        list.push(e.category)
      }
      if (list.length === 3) break
    }
    return list
  })()

  const monthLabel = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div className="exp-page">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="exp-hero">
        <p className="exp-hero-eyebrow">{monthLabel} · Financial Overview</p>
        <h2 className="exp-hero-balance">
          <CountUp value={balance} prefix="₹" decimals={2} />
        </h2>
        <p className="exp-hero-sub">
          Health score <strong style={{ color: healthScore >= 60 ? '#34D399' : healthScore >= 40 ? '#FDBA74' : '#F87171' }}>{healthScore}/100 · {healthLabel}</strong>
          <span className="exp-hero-note"> (simple estimate, not financial advice)</span>
        </p>
      </motion.div>

      <div className="exp-kpi-grid">
        <TiltCard><KpiCard icon={Wallet} color="#7C5CFF" label="Balance" value={balance} trend={balanceTrend} delay={0} /></TiltCard>
        <TiltCard><KpiCard icon={TrendingUp} color="#34D399" label="Income" value={income} trend={incomeTrend} delay={0.05} /></TiltCard>
        <TiltCard><KpiCard icon={TrendingDown} color="#F87171" label="Expenses" value={expense} trend={expenseTrend} delay={0.1} /></TiltCard>
        <TiltCard>
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }} className="card exp-kpi-card">
            <div className="exp-kpi-icon" style={{ background: '#FDBA74' }}><PiggyBank size={16} color="#fff" /></div>
            <p className="exp-kpi-label">Savings rate</p>
            <p className="exp-kpi-value">{savingsRate}%</p>
            <p className="exp-kpi-sub">of income saved</p>
          </motion.div>
        </TiltCard>
        <TiltCard>
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }} className="card exp-kpi-card">
            <div className="exp-kpi-icon" style={{ background: '#6CC7F0' }}><Receipt size={16} color="#fff" /></div>
            <p className="exp-kpi-label">Avg daily spend</p>
            <p className="exp-kpi-value">₹{avgDailySpend.toFixed(0)}</p>
            <p className="exp-kpi-sub">this month so far</p>
          </motion.div>
        </TiltCard>
      </div>

      {insights.length > 0 && (
        <div className="exp-insights">
          {insights.map(function (ins, i) {
            const Icon = ins.icon
            return (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.05 * i }} className="exp-insight-card">
                <Icon size={15} color={ins.color} />
                <span>{ins.text}</span>
              </motion.div>
            )
          })}
        </div>
      )}

      <motion.form
        onSubmit={addEntry}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="card exp-add-panel"
      >
        <div className="exp-add-row">
          <input
            value={title}
            onChange={function (e) { setTitle(e.target.value) }}
            placeholder="What was it for..."
            className="exp-input"
            style={{ flex: '2 1 160px' }}
          />
          <div className="exp-amount-wrap">
            <span className="exp-currency">₹</span>
            <input
              type="number"
              value={amount}
              onChange={function (e) { setAmount(e.target.value) }}
              placeholder="0.00"
              className="exp-input exp-amount-input"
            />
          </div>
          <div className="exp-type-toggle">
            <button type="button" onClick={function () { setType('expense') }} className={type === 'expense' ? 'exp-type-btn active' : 'exp-type-btn'}>Expense</button>
            <button type="button" onClick={function () { setType('income') }} className={type === 'income' ? 'exp-type-btn active income' : 'exp-type-btn'}>Income</button>
          </div>
        </div>

        <div className="exp-quick-amounts">
          {QUICK_AMOUNTS.map(function (v) {
            const selected = amount === String(v)
            return (
              <button
                key={v}
                type="button"
                onClick={function () { setAmount(String(v)) }}
                className={selected ? 'exp-amount-chip active' : 'exp-amount-chip'}
              >
                ₹{v}
              </button>
            )
          })}
        </div>

        {recentCategories.length > 0 && (
          <div className="exp-recent-row">
            <span className="exp-recent-label">Recently Used</span>
            {recentCategories.map(function (c) {
              const Icon = categoryIcon(c)
              const color = categoryColor(c)
              const selected = category === c
              return (
                <button
                  key={c}
                  type="button"
                  onClick={function () { setCategory(c) }}
                  className={selected ? 'exp-chip active' : 'exp-chip'}
                  style={selected ? { borderColor: color, color: color } : {}}
                >
                  <Icon size={12} /> {c}
                </button>
              )
            })}
          </div>
        )}

        <div className="exp-category-row">
          {QUICK_CATEGORIES.map(function (c) {
            const Icon = categoryIcon(c)
            const selected = category === c
            return (
              <button
                key={c}
                type="button"
                onClick={function () { setCategory(c) }}
                className={selected ? 'exp-chip active' : 'exp-chip'}
                style={selected ? { borderColor: categoryColor(c), color: categoryColor(c) } : {}}
              >
                <Icon size={12} /> {c}
              </button>
            )
          })}
          <input
            value={category}
            onChange={function (e) { setCategory(e.target.value) }}
            placeholder="Custom category"
            className="exp-input exp-category-custom"
          />
        </div>

        <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} className="exp-submit-btn">
          <Plus size={15} /> Add {type === 'income' ? 'Income' : 'Expense'}
        </motion.button>
      </motion.form>

      {categoryList.length > 0 && (
        <div className="card exp-category-breakdown">
          <p className="exp-section-title">Spending by category</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {categoryList.map(function (entry) {
              const cat = entry[0]
              const amt = entry[1]
              const pct = expense > 0 ? Math.round((amt / expense) * 100) : 0
              const color = categoryColor(cat)
              const Icon = categoryIcon(cat)
              return (
                <div key={cat}>
                  <div className="exp-cat-row-label">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Icon size={13} color={color} /> {cat}
                    </span>
                    <span style={{ color: 'var(--text-muted)' }}>₹{amt.toFixed(2)} · {pct}%</span>
                  </div>
                  <div className="exp-cat-bar-track">
                    <motion.div
                      className="exp-cat-bar-fill"
                      style={{ background: color }}
                      initial={{ width: 0 }}
                      animate={{ width: pct + '%' }}
                      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="card exp-transactions">
        <p className="exp-section-title">Recent Transactions</p>
        {loading ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Loading...</p>
        ) : entries.length === 0 ? (
          <div className="empty-state"><Wallet size={28} /><span>No entries yet — log your first expense above</span></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <AnimatePresence>
              {entries.map(function (entry) {
                const Icon = categoryIcon(entry.category)
                const color = categoryColor(entry.category || entry.title)
                return (
                  <motion.div
                    key={entry.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.18 } }}
                    whileHover={{ y: -2 }}
                    className="exp-tx-card"
                  >
                    <div className="exp-tx-icon" style={{ background: color }}>
                      <Icon size={15} color="#fff" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p className="exp-tx-title">{entry.title}</p>
                      <div className="exp-tx-meta">
                        {entry.category && <span className="exp-tx-chip" style={{ color: color, borderColor: color }}>{entry.category}</span>}
                        <span>{entry.entry_date}</span>
                      </div>
                    </div>
                    <span className={entry.type === 'income' ? 'exp-tx-amount income' : 'exp-tx-amount'}>
                      {entry.type === 'income' ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                      ₹{entry.amount.toFixed(2)}
                    </span>
                    <div style={{ position: 'relative' }}>
                      <button className="exp-menu-btn" onClick={function () { setMenuOpenId(menuOpenId === entry.id ? null : entry.id) }}>
                        <MoreVertical size={15} />
                      </button>
                      {menuOpenId === entry.id && (
                        <div className="exp-menu">
                          <button className="exp-menu-item" onClick={function () { deleteEntry(entry.id) }}>
                            <Trash2 size={13} /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}

function KpiCard({ icon, color, label, value, trend, delay }) {
  const Icon = icon
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: delay }} className="card exp-kpi-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="exp-kpi-icon" style={{ background: color }}><Icon size={16} color="#fff" /></div>
          <p className="exp-kpi-label">{label}</p>
          <p className="exp-kpi-value"><CountUp value={value} prefix="₹" decimals={2} /></p>
        </div>
        <Sparkline data={trend} width={56} height={30} color={color} />
      </div>
    </motion.div>
  )
}

export default Expenses