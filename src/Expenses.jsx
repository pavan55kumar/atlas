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

const QUICK_CATEGORIES = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Bills', 'Travel', 'Other']
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

      <style>{`
        .exp-page { display: flex; flex-direction: column; gap: 20px; }
        .exp-hero { padding: 4px 2px 8px; }
        .exp-hero-eyebrow { font-size: 12px; color: var(--text-muted); font-weight: 600; letter-spacing: 0.04em; margin-bottom: 8px; }
        .exp-hero-balance { font-size: 42px; font-weight: 700; letter-spacing: -0.03em; margin-bottom: 6px; }
        .exp-hero-sub { font-size: 13px; color: var(--text-muted); }
        .exp-hero-note { font-size: 11px; }

        .exp-kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 14px; }
        .exp-kpi-card { padding: 18px; }
        .exp-kpi-icon { width: 30px; height: 30px; border-radius: 9px; display: flex; align-items: center; justify-content: center; margin-bottom: 12px; }
        .exp-kpi-label { font-size: 12px; color: var(--text-muted); margin-bottom: 4px; }
        .exp-kpi-value { font-size: 22px; font-weight: 700; letter-spacing: -0.02em; }
        .exp-kpi-sub { font-size: 11px; color: var(--text-muted); margin-top: 3px; }

        .exp-insights { display: flex; flex-direction: column; gap: 8px; }
        .exp-insight-card {
          display: flex; align-items: center; gap: 10px; padding: 12px 16px;
          background: var(--surface-2); border-radius: 12px; font-size: 13px;
        }

        .exp-add-panel { padding: 20px; }
        .exp-add-row { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; }
        .exp-input {
          padding: 11px 14px; border-radius: 12px; border: 1px solid var(--border);
          background: var(--surface-2); color: var(--text); font-size: 13px; outline: none;
        }
        .exp-amount-wrap { position: relative; width: 120px; }
        .exp-currency { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-muted); font-size: 13px; }
        .exp-amount-input { width: 100%; padding-left: 24px; }
        .exp-type-toggle { display: flex; border-radius: 12px; background: var(--surface-2); border: 1px solid var(--border); overflow: hidden; }
        .exp-type-btn { padding: 11px 16px; border: none; background: transparent; color: var(--text-muted); font-size: 12.5px; font-weight: 500; }
        .exp-type-btn.active { background: var(--accent); color: #fff; }
        .exp-type-btn.active.income { background: #34D399; }

        .exp-category-row { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 14px; }
        .exp-chip {
          display: flex; align-items: center; gap: 5px; padding: 6px 12px; border-radius: 999px;
          border: 1px solid var(--border); background: var(--surface-2); color: var(--text-muted); font-size: 11.5px;
        }
        .exp-chip.active { background: var(--surface); font-weight: 600; }
        .exp-category-custom { flex: 1 1 140px; border-radius: 999px; padding: 6px 12px; font-size: 11.5px; }

        .exp-submit-btn {
          width: 100%; display: flex; align-items: center; justify-content: center; gap: 6px;
          padding: 12px; border-radius: 12px; border: none;
          background: linear-gradient(135deg, var(--accent), var(--accent-hover));
          color: #fff; font-size: 13px; font-weight: 600;
        }

        .exp-category-breakdown { padding: 20px; }
        .exp-section-title { font-size: 14px; font-weight: 600; margin-bottom: 16px; }
        .exp-cat-row-label { display: flex; justify-content: space-between; font-size: 12.5px; margin-bottom: 6px; }
        .exp-cat-bar-track { width: 100%; height: 7px; background: var(--bg); border-radius: 5px; overflow: hidden; }
        .exp-cat-bar-fill { height: 100%; border-radius: 5px; }

        .exp-transactions { padding: 20px; }
        .exp-tx-card {
          display: flex; align-items: center; gap: 12px; padding: 12px;
          border-radius: 14px; background: var(--surface-2); border: 1px solid var(--border);
        }
        .exp-tx-icon { width: 34px; height: 34px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .exp-tx-title { font-size: 13px; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .exp-tx-meta { display: flex; gap: 8px; align-items: center; font-size: 11px; color: var(--text-muted); margin-top: 2px; }
        .exp-tx-chip { border: 1px solid; padding: 1px 7px; border-radius: 999px; font-size: 10px; }
        .exp-tx-amount { display: flex; align-items: center; gap: 3px; font-size: 13px; font-weight: 700; color: #F87171; white-space: nowrap; }
        .exp-tx-amount.income { color: #34D399; }
        .exp-menu-btn {
          width: 28px; height: 28px; border-radius: 8px; border: 1px solid var(--border);
          background: var(--surface); color: var(--text-muted); display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .exp-menu {
          position: absolute; right: 0; top: 34px; background: var(--surface); border: 1px solid var(--border);
          border-radius: 10px; padding: 4px; z-index: 20; min-width: 110px; box-shadow: 0 8px 24px rgba(0,0,0,0.2);
        }
        .exp-menu-item {
          display: flex; align-items: center; gap: 6px; width: 100%; padding: 8px 10px;
          border-radius: 7px; border: none; background: transparent; color: #F87171; font-size: 12.5px; text-align: left;
        }
        .exp-menu-item:hover { background: var(--surface-2); }
      `}</style>
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