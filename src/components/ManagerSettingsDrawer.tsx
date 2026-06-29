import React, { useState } from 'react';
import { X, Settings, Clock, Layout, GitMerge, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface ManagerSettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ManagerSettingsDrawer({ isOpen, onClose }: ManagerSettingsDrawerProps) {
  const [activeTab, setActiveTab] = useState<'schedule' | 'display' | 'rules'>('schedule');

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          onClick={onClose}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 10000 }}
        />
      )}

      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, left: isOpen ? 0 : '-450px', bottom: 0, width: '450px',
        background: 'var(--bg-panel)', boxShadow: '4px 0 25px rgba(0,0,0,0.2)', zIndex: 10001,
        transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)', display: 'flex', flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'var(--accent-color)', color: 'white', padding: '8px', borderRadius: '8px', display: 'flex' }}>
              <Settings size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Налаштування відділу</h2>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Панель керівника (Планування замірів)</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}>
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
          <button 
            onClick={() => setActiveTab('schedule')}
            style={{ flex: 1, padding: '12px', background: activeTab === 'schedule' ? 'var(--bg-panel)' : 'transparent', border: 'none', borderBottom: activeTab === 'schedule' ? '2px solid var(--accent-color)' : '2px solid transparent', color: activeTab === 'schedule' ? 'var(--accent-color)' : 'var(--text-secondary)', fontWeight: 600, fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}
          >
            <Clock size={16} /> Графік
          </button>
          <button 
            onClick={() => setActiveTab('display')}
            style={{ flex: 1, padding: '12px', background: activeTab === 'display' ? 'var(--bg-panel)' : 'transparent', border: 'none', borderBottom: activeTab === 'display' ? '2px solid var(--accent-color)' : '2px solid transparent', color: activeTab === 'display' ? 'var(--accent-color)' : 'var(--text-secondary)', fontWeight: 600, fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}
          >
            <Layout size={16} /> Відображення
          </button>
          <button 
            onClick={() => setActiveTab('rules')}
            style={{ flex: 1, padding: '12px', background: activeTab === 'rules' ? 'var(--bg-panel)' : 'transparent', border: 'none', borderBottom: activeTab === 'rules' ? '2px solid var(--accent-color)' : '2px solid transparent', color: activeTab === 'rules' ? 'var(--accent-color)' : 'var(--text-secondary)', fontWeight: 600, fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}
          >
            <GitMerge size={16} /> Правила
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          
          {/* TAB 1: Графік */}
          {activeTab === 'schedule' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid var(--warning-color)', borderRadius: '8px', padding: '16px', display: 'flex', gap: '12px' }}>
                <AlertTriangle size={20} color="var(--warning-color)" style={{ flexShrink: 0 }} />
                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', color: 'var(--text-primary)', fontWeight: 600 }}>AI Аналітика: Ризик колапсу</h4>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>Система проаналізувала беклог і відпустки: Наступного тижня очікується на 25% більше нових заявок, при цьому оператор 'Іван' йде у відпустку. <strong style={{ color: 'var(--warning-color)' }}>Рекомендовано залучити резервного диспетчера.</strong></p>
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Налаштування змін операторів (поточний тиждень)</h3>
                
                {[
                  { name: 'Олексій', shift: '09:00 - 18:00', kpi: '45 дзвінків / 12 заплановано', status: 'Активний' },
                  { name: 'Петро', shift: '10:00 - 19:00', kpi: '30 дзвінків / 8 заплановано', status: 'Лікарняний (з ПТ)' },
                  { name: 'Іван', shift: 'Відпустка', kpi: '0 / 0', status: 'Відпустка' },
                ].map(w => (
                  <div key={w.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '6px', marginBottom: '8px' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{w.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>Зміна: {w.shift}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '12px', color: w.status.includes('Відпустка') || w.status.includes('Лікарняний') ? 'var(--warning-color)' : 'var(--success-color)', fontWeight: 600 }}>{w.status}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>KPI: {w.kpi}</div>
                    </div>
                  </div>
                ))}
                
                <button style={{ width: '100%', padding: '10px', background: 'var(--bg-secondary)', border: '1px dashed var(--border-color)', borderRadius: '6px', color: 'var(--text-secondary)', cursor: 'pointer', marginTop: '8px', fontSize: '13px' }}>
                  + Додати відхилення від графіка
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Відображення */}
          {activeTab === 'display' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Вигляд картки замовлення (No-code)</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>Оберіть, які поля будуть видимі для диспетчера планування замірів.</p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { label: 'ID Замовлення', checked: true },
                    { label: 'Клієнт (ПІБ)', checked: true },
                    { label: 'Телефон клієнта', checked: false },
                    { label: 'Адреса об\'єкта', checked: true },
                    { label: 'Площа виробів', checked: true },
                    { label: 'Бажаний час', checked: true },
                    { label: 'Коментар менеджера', checked: false },
                  ].map(field => (
                    <label key={field.label} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                      <div style={{ width: '36px', height: '20px', background: field.checked ? 'var(--accent-color)' : 'var(--bg-secondary)', borderRadius: '10px', position: 'relative', transition: '0.2s' }}>
                        <div style={{ width: '16px', height: '16px', background: 'white', borderRadius: '50%', position: 'absolute', top: '2px', left: field.checked ? '18px' : '2px', transition: '0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                      </div>
                      <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{field.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Фільтри сайдбару</h3>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked style={{ accentColor: 'var(--accent-color)' }} />
                  <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>Групувати за статусами у вкладках</span>
                </label>
              </div>
            </div>
          )}

          {/* TAB 3: Правила */}
          {activeTab === 'rules' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Логічні залежності (State Machine)</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>Налаштування поведінки системи залежно від поточного етапу замовлення.</p>
                
                <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px', marginBottom: '12px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Правило #1 (Активне)</div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>Якщо статус:</span>
                    <select style={{ flex: 1, padding: '6px 8px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '13px', background: 'var(--bg-panel)' }}>
                      <option>На паузі</option>
                      <option>Чорновик</option>
                    </select>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>То дія:</span>
                    <select style={{ flex: 1, padding: '6px 8px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '13px', background: 'var(--bg-panel)' }}>
                      <option>Заблокувати призначення на карту</option>
                      <option>Приховати кнопку "Зафіксувати"</option>
                    </select>
                  </div>
                </div>

                <div style={{ background: 'var(--bg-main)', border: '1px dashed var(--border-color)', borderRadius: '8px', padding: '16px', textAlign: 'center', cursor: 'pointer', opacity: 0.7 }}>
                  <div style={{ fontSize: '13px', color: 'var(--accent-color)', fontWeight: 600 }}>+ Створити нове правило</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)', background: 'var(--bg-secondary)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button onClick={onClose} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>
            Скасувати
          </button>
          <button onClick={() => {
            alert('Налаштування успішно збережено!');
            onClose();
          }} style={{ padding: '8px 16px', background: 'var(--accent-color)', border: 'none', borderRadius: '6px', color: 'white', fontWeight: 600, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={16} /> Зберегти
          </button>
        </div>
      </div>
    </>
  );
}
