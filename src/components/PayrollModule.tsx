import React, { useState } from 'react';
import { ChevronLeft, Filter, Download, ArrowLeft, TrendingUp, AlertTriangle, CheckCircle, CreditCard, DollarSign, Settings } from 'lucide-react';
import { PayrollSettingsModal } from './PayrollSettingsModal';

export interface PayrollRecord {
  id: string;
  name: string;
  role: 'Оператор' | 'Замірник' | 'Конструктор' | 'Монтажник';
  baseSalary: number;
  workedDays: number;
  totalDays: number;
  workedHours: number;
  overtimeHours: number;
  bonuses: number;
  penalties: number;
  bonusDetails: { description: string; amount: number }[];
  penaltyDetails: { description: string; amount: number }[];
  completedWorks?: { date: string; orderId: string; description: string; metric: string; earned: number }[];
}

const INITIAL_PAYROLL: PayrollRecord[] = [
  {
    id: '1', name: 'Олексій (Диспетчер)', role: 'Оператор',
    baseSalary: 15000, workedDays: 20, totalDays: 22, workedHours: 160, overtimeHours: 4,
    bonuses: 3500, penalties: 0,
    bonusDetails: [
      { description: 'Бонус за 150 успішних записів', amount: 3000 },
      { description: 'Премія за ідеальну якість дзвінків', amount: 500 }
    ],
    penaltyDetails: []
  },
  {
    id: '2', name: 'Марія (Диспетчер)', role: 'Оператор',
    baseSalary: 15000, workedDays: 22, totalDays: 22, workedHours: 176, overtimeHours: 12,
    bonuses: 4200, penalties: 500,
    bonusDetails: [
      { description: 'Бонус за 180 успішних записів', amount: 4200 }
    ],
    penaltyDetails: [
      { description: 'Запізнення 15.06', amount: 500 }
    ]
  },
  {
    id: '3', name: 'Іван (Замірник)', role: 'Замірник',
    baseSalary: 10000, workedDays: 18, totalDays: 22, workedHours: 144, overtimeHours: 0,
    bonuses: 12500, penalties: 0,
    bonusDetails: [
      { description: 'Бонус за 45 замірів (по 200 грн)', amount: 9000 },
      { description: 'Процент від допродажу на замірі', amount: 3500 }
    ],
    penaltyDetails: []
  },
  {
    id: '4', name: 'Петро (Замірник)', role: 'Замірник',
    baseSalary: 10000, workedDays: 20, totalDays: 22, workedHours: 160, overtimeHours: 8,
    bonuses: 8000, penalties: 1500,
    bonusDetails: [
      { description: 'Бонус за 40 замірів (по 200 грн)', amount: 8000 }
    ],
    penaltyDetails: [
      { description: 'Пошкодження інструменту', amount: 1500 }
    ]
  },
  {
    id: '5', name: 'Андрій (Конструктор)', role: 'Конструктор',
    baseSalary: 25000, workedDays: 22, totalDays: 22, workedHours: 185, overtimeHours: 9,
    bonuses: 8500, penalties: 0,
    bonusDetails: [
      { description: 'Бонус за 150 м² розкрою (по 50 грн)', amount: 7500 },
      { description: 'Премія за швидкість', amount: 1000 }
    ],
    penaltyDetails: [],
    completedWorks: [
      { date: '10.06.2026', orderId: 'ЗМ-002', description: 'Креслення стільниці', metric: '3 м²', earned: 150 },
      { date: '12.06.2026', orderId: 'ЗМ-005', description: 'Сходи з мармуру (складний розкрій)', metric: '12 м²', earned: 600 },
      { date: '15.06.2026', orderId: 'ЗМ-010', description: 'Підвіконня', metric: '5 м²', earned: 250 },
      { date: '18.06.2026', orderId: 'ЗМ-011', description: 'Камін', metric: '8 м²', earned: 400 },
      { date: '21.06.2026', orderId: 'ЗМ-015', description: 'Кухонний острів', metric: '6 м²', earned: 300 }
    ]
  },
  {
    id: '6', name: 'Віктор (Монтажник)', role: 'Монтажник',
    baseSalary: 0, workedDays: 15, totalDays: 22, workedHours: 120, overtimeHours: 15,
    bonuses: 35000, penalties: 2000,
    bonusDetails: [
      { description: 'Монтаж 12 об\'єктів (відрядна ЗП)', amount: 35000 }
    ],
    penaltyDetails: [
      { description: 'Рекламація по об\'єкту №81-1234', amount: 2000 }
    ]
  }
];

export function PayrollModule() {
  const [employees, setEmployees] = useState<PayrollRecord[]>(INITIAL_PAYROLL);
  const [activeTab, setActiveTab] = useState<'Оператори' | 'Замірники' | 'Конструктори' | 'Монтажники'>('Оператори');
  const [selectedEmpId, setSelectedEmpId] = useState<string | null>(null);
  const [isWorksExpanded, setIsWorksExpanded] = useState(true);
  const [settingsEmpId, setSettingsEmpId] = useState<string | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH', maximumFractionDigits: 0 }).format(amount);
  };

  const selectedEmp = selectedEmpId ? employees.find(p => p.id === selectedEmpId) : null;
  const settingsEmp = settingsEmpId ? employees.find(p => p.id === settingsEmpId) : null;

  const handleSaveSettings = (empId: string, newSettings: any) => {
    setEmployees(prev => prev.map(emp => {
      if (emp.id !== empId) return emp;
      return {
        ...emp,
        baseSalary: newSettings.baseSalary,
        totalDays: newSettings.targetDays
      };
    }));
  };

  if (selectedEmp) {
    // Detail View (Employee Card)
    const totalToPay = (selectedEmp.baseSalary / selectedEmp.totalDays * selectedEmp.workedDays) + selectedEmp.bonuses - selectedEmp.penalties;
    const actualBase = (selectedEmp.baseSalary / selectedEmp.totalDays * selectedEmp.workedDays);

    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-main)', overflow: 'auto' }}>
        {/* Header */}
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '16px', position: 'sticky', top: 0, background: 'var(--bg-main)', zIndex: 10 }}>
          <button onClick={() => setSelectedEmpId(null)} style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>{selectedEmp.name}</h1>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{selectedEmp.role} • Розрахунок за поточний місяць</div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => setSettingsEmpId(selectedEmp.id)}
                style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px 16px', color: 'var(--text-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}
              >
                <Settings size={18} /> Налаштування мотивації
              </button>
            <button style={{ padding: '10px 20px', background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Download size={18} /> Завантажити розрахунковий
            </button>
            <button style={{ padding: '10px 20px', background: 'var(--success-color)', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' }}>
              <CreditCard size={18} /> Відправити на виплату
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto', width: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Top KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Відпрацьовано</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)' }}>{selectedEmp.workedDays} <span style={{ fontSize: '16px', fontWeight: 500, color: 'var(--text-secondary)' }}>днів</span></div>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>/ {selectedEmp.totalDays}</div>
              </div>
              <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed var(--border-color)', display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Годин: <b style={{ color: 'var(--text-primary)' }}>{selectedEmp.workedHours}</b></span>
                {selectedEmp.overtimeHours > 0 && (
                  <span style={{ color: 'var(--accent-color)', fontWeight: 600 }}>+{selectedEmp.overtimeHours} перепрац.</span>
                )}
              </div>
            </div>
            <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Фактична ставка</div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)' }}>{formatCurrency(actualBase)}</div>
            </div>
            <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '12px', padding: '20px' }}>
              <div style={{ fontSize: '13px', color: 'var(--success-color)', marginBottom: '8px', fontWeight: 600 }}>Бонуси та премії</div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--success-color)' }}>+{formatCurrency(selectedEmp.bonuses)}</div>
            </div>
            <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px', padding: '20px' }}>
              <div style={{ fontSize: '13px', color: 'var(--danger-color)', marginBottom: '8px', fontWeight: 600 }}>Штрафи та утримання</div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--danger-color)' }}>-{formatCurrency(selectedEmp.penalties)}</div>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* Bonuses list */}
            <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={18} color="var(--success-color)" />
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>Деталізація бонусів</h3>
              </div>
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {selectedEmp.bonusDetails.map((b, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success-color)' }}>
                        <CheckCircle size={16} />
                      </div>
                      <div style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500 }}>{b.description}</div>
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--success-color)' }}>+{formatCurrency(b.amount)}</div>
                  </div>
                ))}
                {selectedEmp.bonusDetails.length === 0 && (
                  <div style={{ color: 'var(--text-secondary)', fontSize: '14px', textAlign: 'center', padding: '20px 0' }}>Бонусів немає</div>
                )}
              </div>
            </div>

            {/* Penalties list */}
            <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={18} color="var(--danger-color)" />
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>Деталізація штрафів</h3>
              </div>
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {selectedEmp.penaltyDetails.map((p, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--danger-color)' }}>
                        <AlertTriangle size={16} />
                      </div>
                      <div style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500 }}>{p.description}</div>
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--danger-color)' }}>-{formatCurrency(p.amount)}</div>
                  </div>
                ))}
                {selectedEmp.penaltyDetails.length === 0 && (
                  <div style={{ color: 'var(--text-secondary)', fontSize: '14px', textAlign: 'center', padding: '20px 0' }}>Штрафів немає</div>
                )}
              </div>
            </div>
          </div>

          {/* Completed Works Table */}
          {selectedEmp.completedWorks && selectedEmp.completedWorks.length > 0 && (
            <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden' }}>
              <div 
                onClick={() => setIsWorksExpanded(!isWorksExpanded)}
                style={{ padding: '16px 20px', borderBottom: isWorksExpanded ? '1px solid var(--border-color)' : 'none', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', transition: 'background 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={18} color="var(--accent-color)" />
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>Реєстр виконаних робіт (відрядна частина)</h3>
                </div>
                <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
                  {isWorksExpanded ? <ChevronLeft size={20} style={{ transform: 'rotate(90deg)' }} /> : <ChevronLeft size={20} style={{ transform: 'rotate(-90deg)' }} />}
                </div>
              </div>
              
              {isWorksExpanded && (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-main)', borderBottom: '1px solid var(--border-color)' }}>
                        <th style={{ padding: '12px 20px', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>Дата</th>
                        <th style={{ padding: '12px 20px', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>Замовлення</th>
                        <th style={{ padding: '12px 20px', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>Опис робіт</th>
                        <th style={{ padding: '12px 20px', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>Метрика (м² / шт)</th>
                        <th style={{ padding: '12px 20px', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600, textAlign: 'right' }}>Нараховано</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedEmp.completedWorks.map((work, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s', cursor: 'default' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-main)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <td style={{ padding: '12px 20px', fontSize: '14px', color: 'var(--text-primary)' }}>{work.date}</td>
                          <td style={{ padding: '12px 20px', fontSize: '14px', fontWeight: 500, color: 'var(--accent-color)' }}>{work.orderId}</td>
                          <td style={{ padding: '12px 20px', fontSize: '14px', color: 'var(--text-primary)' }}>{work.description}</td>
                          <td style={{ padding: '12px 20px', fontSize: '14px', color: 'var(--text-secondary)' }}>{work.metric}</td>
                          <td style={{ padding: '12px 20px', fontSize: '14px', fontWeight: 600, color: 'var(--success-color)', textAlign: 'right' }}>+{formatCurrency(work.earned)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Grand Total */}
          <div style={{ background: 'linear-gradient(135deg, var(--accent-color) 0%, #6d28d9 100%)', borderRadius: '16px', padding: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white', boxShadow: '0 10px 30px rgba(124, 58, 237, 0.3)' }}>
            <div>
              <div style={{ fontSize: '16px', opacity: 0.9, marginBottom: '8px' }}>До виплати на руки (Чистими)</div>
              <div style={{ fontSize: '13px', opacity: 0.7 }}>База {formatCurrency(actualBase)} + Бонуси {formatCurrency(selectedEmp.bonuses)} - Штрафи {formatCurrency(selectedEmp.penalties)}</div>
            </div>
            <div style={{ fontSize: '48px', fontWeight: 800, letterSpacing: '-1px' }}>
              {formatCurrency(totalToPay)}
            </div>
          </div>

          <PayrollSettingsModal 
            isOpen={!!settingsEmpId}
            onClose={() => setSettingsEmpId(null)}
            employee={settingsEmp || null}
            onSave={handleSaveSettings}
          />
        </div>
      </div>
    );
  }

  // Dashboard View
  const tabs: ('Оператори' | 'Замірники' | 'Конструктори' | 'Монтажники')[] = ['Оператори', 'Замірники', 'Конструктори', 'Монтажники'];
  const filteredList = employees.filter(p => {
    if (activeTab === 'Оператори') return p.role === 'Оператор';
    if (activeTab === 'Замірники') return p.role === 'Замірник';
    if (activeTab === 'Конструктори') return p.role === 'Конструктор';
    if (activeTab === 'Монтажники') return p.role === 'Монтажник';
    return false;
  });

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-main)' }}>
      {/* Header Toolbar */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ margin: '0 0 16px 0', fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>Розрахунок ЗП</h1>
          <div style={{ display: 'flex', gap: '8px' }}>
            {tabs.map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '8px 16px',
                  background: activeTab === tab ? 'var(--accent-color)' : 'var(--bg-panel)',
                  border: `1px solid ${activeTab === tab ? 'var(--accent-color)' : 'var(--border-color)'}`,
                  color: activeTab === tab ? 'white' : 'var(--text-primary)',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <select style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-panel)', color: 'var(--text-primary)', fontSize: '13px', fontWeight: 600 }}>
            <option>Червень 2026</option>
            <option>Травень 2026</option>
          </select>
          <button style={{ padding: '10px 20px', background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Download size={18} /> Експорт відомості
          </button>
        </div>
      </div>

      {/* Main List */}
      <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '1000px', margin: '0 auto' }}>
          {filteredList.map(emp => {
            const actualBase = (emp.baseSalary / emp.totalDays * emp.workedDays);
            const total = actualBase + emp.bonuses - emp.penalties;
            
            return (
              <div 
                key={emp.id}
                onClick={() => setSelectedEmpId(emp.id)}
                style={{ 
                  background: 'var(--bg-panel)', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '12px', 
                  padding: '20px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.06)';
                  e.currentTarget.style.borderColor = 'var(--accent-color)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.02)';
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '24px', background: 'rgba(124, 58, 237, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-color)' }}>
                    <DollarSign size={24} />
                  </div>
                  <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>{emp.name}</h3>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Відпрацьовано: {emp.workedDays}/{emp.totalDays} дн.</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '48px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Ставка</div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{formatCurrency(actualBase)}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Бонуси/Штрафи</div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: emp.bonuses - emp.penalties >= 0 ? 'var(--success-color)' : 'var(--danger-color)' }}>
                      {emp.bonuses - emp.penalties >= 0 ? '+' : ''}{formatCurrency(emp.bonuses - emp.penalties)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end', width: '120px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>До виплати</div>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>{formatCurrency(total)}</div>
                  </div>
                </div>
              </div>
            );
          })}
          
          {filteredList.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              Немає співробітників у цьому відділі
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
