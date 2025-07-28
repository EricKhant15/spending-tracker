// App structure for Spending Tracker with Daily, Weekly, Monthly filter
import React, { useState, useEffect } from 'react';
import { Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import './styles.css';

ChartJS.register(ArcElement, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

const spendingCategories = [
  "Groceries", "Utilities", "Transportation", "Entertainment",
  "Dining Out", "Health", "Shopping", "Travel", "Education", "Miscellaneous"
];

function App() {
  const [page, setPage] = useState('journal');

  return (
    <div className="app">
      <header>
        <h1>Spending Tracker</h1>
        <nav>
          <button onClick={() => setPage('journal')}>Journal</button>
          <button onClick={() => setPage('analytics')}>Analytics</button>
        </nav>
      </header>
      {page === 'journal' ? <Journal /> : <AnalyticsDashboard />}
    </div>
  );
}

function Journal() {
  const [records, setRecords] = useState(() => {
    const saved = localStorage.getItem('records');
    return saved ? JSON.parse(saved) : [];
  });
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('Groceries');
  const [amount, setAmount] = useState('');

  const addRecord = () => {
    if (!date || !amount || !category) return;
    const newRecord = { date, category, amount: parseFloat(amount) };
    const updated = [...records, newRecord];
    setRecords(updated);
    localStorage.setItem('records', JSON.stringify(updated));
    setDate('');
    setAmount('');
  };

  return (
    <div>
      <h2>Journal</h2>
      <input type="date" value={date} onChange={e => setDate(e.target.value)} />
      <select value={category} onChange={e => setCategory(e.target.value)}>
        {spendingCategories.map(cat => <option key={cat}>{cat}</option>)}
      </select>
      <input type="number" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} />
      <button onClick={addRecord}>Add</button>
      <ul>
        {records.map((r, i) => (
          <li key={i}>{r.date} - {r.category} - ${r.amount.toFixed(2)}</li>
        ))}
      </ul>
    </div>
  );
}

function AnalyticsDashboard() {
  const [records, setRecords] = useState(() => {
    const saved = localStorage.getItem('records');
    return saved ? JSON.parse(saved) : [];
  });
  const [filter, setFilter] = useState('all');
  const [month, setMonth] = useState('');
  const [weekStart, setWeekStart] = useState('');
  const [selectedDay, setSelectedDay] = useState('');

  const filtered = records.filter(r => {
    if (filter === 'month' && month) return r.date.startsWith(month);
    if (filter === 'week' && weekStart) {
      const start = new Date(weekStart);
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      const dateObj = new Date(r.date);
      return dateObj >= start && dateObj <= end;
    }
    if (filter === 'day' && selectedDay) {
      return r.date === selectedDay;
    }
    return true;
  });

  const total = filtered.reduce((acc, r) => acc + r.amount, 0);

  const grouped = {};
  const lineData = {};
  filtered.forEach(r => {
    if (!grouped[r.category]) grouped[r.category] = 0;
    grouped[r.category] += r.amount;

    const day = r.date;
    if (!lineData[day]) lineData[day] = 0;
    lineData[day] += r.amount;
  });

  const pieChartData = {
    labels: Object.keys(grouped),
    datasets: [{
      data: Object.values(grouped),
      backgroundColor: [
        '#FF6384', '#36A2EB', '#FFCE56', '#8AFFC1', '#FF9A76',
        '#8E44AD', '#3498DB', '#1ABC9C', '#F39C12', '#2ECC71'
      ]
    }]
  };

  const lineChartData = {
    labels: Object.keys(lineData).sort(),
    datasets: [{
      label: 'Spending Over Time',
      data: Object.keys(lineData).sort().map(d => lineData[d]),
      borderColor: '#36A2EB',
      tension: 0.3
    }]
  };

  return (
    <div>
      <h2>Analytics</h2>
      <label>
        Filter:
        <select value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">All Time</option>
          <option value="month">By Month</option>
          <option value="week">By Week</option>
          <option value="day">By Day</option>
        </select>
      </label>
      {filter === 'month' && (
        <input
        type="text"
        placeholder="YYYY-MM"
        value={selectedMonth}
        onChange={handleMonthChange}
      />      
      )}
      {filter === 'week' && (
        <input type="date" value={weekStart} onChange={e => setWeekStart(e.target.value)} />
      )}
      {filter === 'day' && (
        <input type="date" value={selectedDay} onChange={e => setSelectedDay(e.target.value)} />
      )}
      <p>Total Spending: ${total.toFixed(2)}</p>
      <h3>Spending by Category (Pie Chart)</h3>
      <Pie data={pieChartData} />
      <h3>Spending Over Time (Line Chart)</h3>
      <Line data={lineChartData} />
    </div>
  );
}

export default App;
