import Tasks from './Tasks'
import Habits from './Habits'
import CalendarWidget from './Calendar'
import Goals from './Goals'
import AIBrief from './AIBrief'


function Dashboard({ user, onLogout, theme, onToggleTheme }) {
  const firstName = user.email.split('@')[0]

  return (
    <div style={{ minHeight: '100vh', padding: '32px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px'
      }}>
        <div>
          <h1 style={{ fontSize: '24px' }}>Good day, {firstName} 👋</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            Here's what's happening today
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={onToggleTheme} style={ghostButton}>
            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </button>
          <button onClick={onLogout} style={ghostButton}>
            Log out
          </button>
        </div>
      </div>

      {/* Card grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '20px'
      }}>
         {/* habits */}
        <div style={{
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: '16px',
  padding: '24px',
  minHeight: '140px'
}}>
  <h3 style={{ marginBottom: '12px', fontSize: '16px' }}>✅ Tasks</h3>
  <Tasks userId={user.id} />
</div> 
       <div style={{
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: '16px',
  padding: '24px',
  minHeight: '140px'
}}>
  <h3 style={{ marginBottom: '12px', fontSize: '16px' }}>💊 Habits</h3>
  <Habits userId={user.id} />
</div>
       {/* calendar*/}
       <div style={{
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: '16px',
  padding: '24px',
  minHeight: '140px'
}}>
  <h3 style={{ marginBottom: '12px', fontSize: '16px' }}>📅 Schedule</h3>
  <CalendarWidget userId={user.id} />
</div>
       
       {/* goals*/}
       <div style={{
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: '16px',
  padding: '24px',
  minHeight: '140px'
}}>
  <h3 style={{ marginBottom: '12px', fontSize: '16px' }}>🎯 Goals</h3>
  <Goals userId={user.id} />
</div>
       
        {/* groq*/}
       <div style={{
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: '16px',
  padding: '24px',
  minHeight: '140px'
}}>
  <h3 style={{ marginBottom: '12px', fontSize: '16px' }}>🤖 AI Daily Brief</h3>
  <AIBrief userId={user.id} />
</div>
      </div>
    </div>
  )
}

function Card({ title, content }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: '16px',
      padding: '24px',
      minHeight: '140px'
    }}>
      <h3 style={{ marginBottom: '12px', fontSize: '16px' }}>{title}</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{content}</p>
    </div>
  )
}

const ghostButton = {
  padding: '8px 16px',
  borderRadius: '8px',
  border: '1px solid var(--border)',
  background: 'var(--surface)',
  color: 'var(--text)',
  cursor: 'pointer',
  fontSize: '14px'
}

export default Dashboard