import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Filter, Download, Copy, Calendar as CalendarIcon, Check, Settings, X, Edit3 } from 'lucide-react';
import type { EmployeeSchedule, ShiftType } from '../types';



function getStyleForShift(shift: string | null, isWeekend: boolean): { bg: string, text: string } {
  if (!shift) {
    return isWeekend ? { bg: 'rgba(0,0,0,0.02)', text: 'var(--text-secondary)' } : { bg: 'transparent', text: 'var(--text-secondary)' };
  }
  const s = shift.toLowerCase();
  if (s.includes('відпустка') || s.includes('рахунок')) return { bg: 'rgba(245, 158, 11, 0.15)', text: 'var(--warning-color)' };
  if (s.includes('лікарняний')) return { bg: 'rgba(239, 68, 68, 0.15)', text: 'var(--danger-color)' };
  if (s.includes('перероб') || s.includes('менше')) return { bg: 'rgba(139, 92, 246, 0.15)', text: 'var(--accent-color)' }; // Purple-ish for edits
  if (s.includes('вихідний') || s === '') return { bg: 'var(--bg-secondary)', text: 'var(--text-secondary)' };
  
  // Default for hours like "09:00 - 18:00"
  return { bg: 'rgba(16, 185, 129, 0.15)', text: 'var(--success-color)' };
}

interface ScheduleEditorProps {
  schedules: EmployeeSchedule[];
  setSchedules: React.Dispatch<React.SetStateAction<EmployeeSchedule[]>>;
}

export function ScheduleEditor({ schedules, setSchedules }: ScheduleEditorProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 5, 1)); // June 2026
  const [roleFilter, setRoleFilter] = useState<string>('Всі');
  
  // Cell selection state
  const [activeCell, setActiveCell] = useState<{ empId: string, date: string } | null>(null);
  const [customShiftInput, setCustomShiftInput] = useState('');
  
  // Leave range selection state
  const [activeCellLeaveMode, setActiveCellLeaveMode] = useState<string | null>(null);
  const [leaveEndDate, setLeaveEndDate] = useState<string>('');

  // Generator Modal state
  const [generatorEmpId, setGeneratorEmpId] = useState<string | null>(null);
  const [genTemplate, setGenTemplate] = useState<'4/4' | '5/2'>('5/2');
  const [genHours, setGenHours] = useState('08:00 - 17:00');
  const [genStartDate, setGenStartDate] = useState('');

  // Generate days for the month
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i + 1);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    return { dateStr, dayNum: i + 1, isWeekend, d };
  });

  const monthNames = ['Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень', 'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'];

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  const handleSetShift = (empId: string, dateStr: string, shift: ShiftType) => {
    setSchedules(prev => prev.map(emp => {
      if (emp.id !== empId) return emp;
      const newShifts = { ...emp.shifts };
      if (shift === null || shift.trim() === '') {
        delete newShifts[dateStr];
      } else {
        newShifts[dateStr] = shift;
      }
      return { ...emp, shifts: newShifts };
    }));
    setActiveCell(null);
    setActiveCellLeaveMode(null);
    setCustomShiftInput('');
  };

  const applyLeaveRange = (empId: string, startDateStr: string) => {
    if (!activeCellLeaveMode || !leaveEndDate) return;
    const start = new Date(startDateStr);
    const end = new Date(leaveEndDate);
    if (end < start) return; // Invalid range

    setSchedules(prev => prev.map(emp => {
      if (emp.id !== empId) return emp;
      const newShifts = { ...emp.shifts };
      
      days.forEach(day => {
        const current = day.d;
        // Strip time from current for accurate comparison
        const currentMidnight = new Date(current.getFullYear(), current.getMonth(), current.getDate());
        const startMidnight = new Date(start.getFullYear(), start.getMonth(), start.getDate());
        const endMidnight = new Date(end.getFullYear(), end.getMonth(), end.getDate());

        if (currentMidnight >= startMidnight && currentMidnight <= endMidnight) {
          // Keep weekends empty unless they are explicitly working days (optional). But for vacations, we just fill them all.
          newShifts[day.dateStr] = activeCellLeaveMode;
        }
      });
      return { ...emp, shifts: newShifts };
    }));

    setActiveCell(null);
    setActiveCellLeaveMode(null);
  };

  const applyGenerator = () => {
    if (!generatorEmpId || !genStartDate) return;

    const start = new Date(genStartDate);
    
    setSchedules(prev => prev.map(emp => {
      if (emp.id !== generatorEmpId) return emp;
      const newShifts = { ...emp.shifts };
      
      days.forEach(day => {
        const current = day.d;
        if (current < start) return;

        const diffTime = current.getTime() - start.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (genTemplate === '5/2') {
          if (day.isWeekend) {
            newShifts[day.dateStr] = 'Вихідний';
          } else {
            newShifts[day.dateStr] = genHours;
          }
        } else if (genTemplate === '4/4') {
          const cycleDay = diffDays % 8;
          if (cycleDay < 4) {
            newShifts[day.dateStr] = genHours;
          } else {
            newShifts[day.dateStr] = 'Вихідний';
          }
        }
      });
      return { ...emp, shifts: newShifts };
    }));
    setGeneratorEmpId(null);
  };

  const exportToExcel = () => {
    // Generate CSV content
    // Add BOM for Excel UTF-8 support
    let csvContent = '\uFEFF';
    
    // Header row
    const headers = ['Співробітник', 'Відділ', ...days.map(d => `${d.dayNum}`)];
    csvContent += headers.join(';') + '\n';
    
    // Data rows
    filteredSchedules.forEach(emp => {
      const row = [
        emp.name,
        emp.role,
        ...days.map(d => emp.shifts[d.dateStr] || (d.isWeekend ? 'Вихідний' : ''))
      ];
      // Escape quotes and wrap in quotes to handle semicolons/newlines in text
      const formattedRow = row.map(cell => `"${String(cell).replace(/"/g, '""')}"`);
      csvContent += formattedRow.join(';') + '\n';
    });

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `Графік_${monthNames[currentMonth.getMonth()]}_${currentMonth.getFullYear()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredSchedules = schedules.filter(s => roleFilter === 'Всі' || s.role === roleFilter);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-main)', position: 'relative' }}>
      {/* Header Toolbar */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>Графіки роботи</h1>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-panel)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <button onClick={prevMonth} style={{ padding: '4px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><ChevronLeft size={20} /></button>
            <div style={{ fontSize: '14px', fontWeight: 600, minWidth: '120px', textAlign: 'center', color: 'var(--text-primary)' }}>
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </div>
            <button onClick={nextMonth} style={{ padding: '4px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><ChevronRight size={20} /></button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={16} color="var(--text-secondary)" />
            <select 
              value={roleFilter} 
              onChange={e => setRoleFilter(e.target.value)}
              style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-panel)', color: 'var(--text-primary)', fontSize: '13px' }}
            >
              <option value="Всі">Всі відділи</option>
              <option value="Оператор">Оператори</option>
              <option value="Замірник">Замірники</option>
              <option value="Конструктор">Конструктори</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button style={{ padding: '8px 16px', background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Copy size={16} /> Копіювати з минулого місяця
          </button>
          <button onClick={exportToExcel} style={{ padding: '8px 16px', background: 'var(--accent-color)', border: 'none', borderRadius: '6px', color: 'white', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Download size={16} /> Експорт в Excel
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
        <div style={{ 
          background: 'var(--bg-panel)', 
          border: '1px solid var(--border-color)', 
          borderRadius: '12px'
        }}>
          {/* Grid Header */}
          <div style={{ display: 'flex', borderBottom: '2px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
            <div style={{ width: '250px', padding: '16px', fontWeight: 600, fontSize: '13px', color: 'var(--text-secondary)', borderRight: '1px solid var(--border-color)', flexShrink: 0, position: 'sticky', left: 0, background: 'var(--bg-secondary)', zIndex: 10 }}>
              Співробітник
            </div>
            <div style={{ display: 'flex', flex: 1 }}>
              {days.map(d => (
                <div key={d.dayNum} style={{ 
                  flex: 1, 
                  minWidth: '40px', 
                  padding: '12px 4px', 
                  textAlign: 'center', 
                  borderRight: '1px solid var(--border-color)',
                  background: d.isWeekend ? 'rgba(0,0,0,0.02)' : 'transparent',
                  color: d.isWeekend ? 'var(--warning-color)' : 'var(--text-secondary)',
                  fontWeight: 600,
                  fontSize: '13px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  {d.dayNum}
                </div>
              ))}
            </div>
          </div>

          {/* Grid Rows */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filteredSchedules.map((emp, rowIdx) => (
              <div key={emp.id} style={{ display: 'flex', borderBottom: rowIdx === filteredSchedules.length - 1 ? 'none' : '1px solid var(--border-color)' }}>
                {/* Fixed Name Column - Clicking this opens Auto-Generator */}
                <div 
                  onClick={() => {
                    setGeneratorEmpId(emp.id);
                    setGenStartDate(days[0].dateStr); // Default to start of month
                  }}
                  title="Клікніть для масового налаштування графіка"
                  style={{ 
                    width: '250px', 
                    padding: '16px', 
                    borderRight: '1px solid var(--border-color)', 
                    flexShrink: 0, 
                    position: 'sticky', 
                    left: 0, 
                    background: 'var(--bg-panel)', 
                    zIndex: 10,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-panel)'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{emp.name}</div>
                    <Settings size={14} color="var(--text-secondary)" />
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{emp.role}</div>
                </div>

                {/* Day Cells */}
                <div style={{ display: 'flex', flex: 1 }}>
                  {days.map(d => {
                    const shift = emp.shifts[d.dateStr] || null;
                    const isCellActive = activeCell?.empId === emp.id && activeCell?.date === d.dateStr;
                    const styleConfig = getStyleForShift(shift, d.isWeekend);

                    // Shorten the text for display in the grid cell
                    let displayShift = shift || '';
                    if (displayShift.includes(' - ')) displayShift = displayShift.replace('00', '').replace('00', '').replace(':', '').replace(':', '');
                    if (displayShift.includes('Відпустка')) displayShift = 'В';
                    if (displayShift.includes('Лікарняний')) displayShift = 'Л';
                    if (displayShift.includes('Вихідний')) displayShift = '';

                    return (
                      <div 
                        key={d.dayNum} 
                        onClick={() => {
                          setActiveCell({ empId: emp.id, date: d.dateStr });
                          setCustomShiftInput(shift || '');
                        }}
                        style={{ 
                          flex: 1, 
                          minWidth: '40px', 
                          borderRight: '1px solid var(--border-color)',
                          background: styleConfig.bg,
                          cursor: 'pointer',
                          position: 'relative',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'background 0.1s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow = 'inset 0 0 0 1px var(--accent-color)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        {shift && (
                          <div style={{ 
                            fontSize: '11px', 
                            fontWeight: 700, 
                            color: styleConfig.text,
                            writingMode: shift.length <= 5 ? 'horizontal-tb' : 'vertical-rl',
                            textOrientation: 'mixed',
                            transform: shift.length <= 5 ? 'none' : 'rotate(180deg)'
                          }} title={shift}>
                            {displayShift}
                          </div>
                        )}

                        {/* Cell Popup Menu */}
                        {isCellActive && (
                          <div style={{
                            position: 'absolute',
                            top: '100%',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            background: 'var(--bg-panel)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '8px',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                            zIndex: 100,
                            padding: '12px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            minWidth: '220px',
                            cursor: 'default'
                          }} onClick={e => e.stopPropagation()}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)' }}>
                              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                                {activeCellLeaveMode ? `Діапазон: ${activeCellLeaveMode}` : `Зміна на ${d.dateStr}`}
                              </div>
                              <button onClick={() => {
                                setActiveCell(null);
                                setActiveCellLeaveMode(null);
                              }} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={14} /></button>
                            </div>
                            
                            {activeCellLeaveMode ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '4px 0' }}>
                                <div style={{ fontSize: '12px', color: 'var(--text-primary)' }}>
                                  З: <b>{d.dateStr}</b>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>По (включно):</label>
                                  <input 
                                    type="date" 
                                    value={leaveEndDate} 
                                    onChange={e => setLeaveEndDate(e.target.value)}
                                    style={{ padding: '6px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: '4px', background: 'var(--bg-main)', color: 'var(--text-primary)' }}
                                  />
                                </div>
                                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                                  <button onClick={() => setActiveCellLeaveMode(null)} style={{ flex: 1, padding: '6px', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '12px', cursor: 'pointer' }}>Назад</button>
                                  <button onClick={() => applyLeaveRange(emp.id, d.dateStr)} style={{ flex: 1, padding: '6px', background: 'var(--accent-color)', border: 'none', borderRadius: '4px', color: 'white', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>Зберегти</button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                  {[
                                    { label: '08:00 - 17:00', val: '08:00 - 17:00' },
                                    { label: '08:00 - 20:00', val: '08:00 - 20:00' },
                                    { label: '09:00 - 18:00', val: '09:00 - 18:00' },
                                    { label: 'Відпустка', val: 'Відпустка', isRange: true },
                                    { label: 'Лікарняний', val: 'Лікарняний', isRange: true },
                                    { label: 'Вихідний (свій рахунок)', val: 'Вихідний за свій рахунок' },
                                    { label: 'Очистити', val: null },
                                  ].map(opt => (
                                    <button 
                                      key={opt.label}
                                      onClick={(e) => {
                                        if (opt.isRange) {
                                          setActiveCellLeaveMode(opt.val as string);
                                          setLeaveEndDate(d.dateStr); // default to same day
                                        } else {
                                          handleSetShift(emp.id, d.dateStr, opt.val);
                                        }
                                      }}
                                      style={{
                                        padding: '6px 8px',
                                        border: 'none',
                                        background: 'transparent',
                                        textAlign: 'left',
                                        fontSize: '13px',
                                        color: opt.val === null ? 'var(--danger-color)' : 'var(--text-primary)',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between'
                                      }}
                                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                      {opt.label}
                                      {shift === opt.val && <Check size={14} color="var(--accent-color)" />}
                                    </button>
                                  ))}
                                </div>

                                <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed var(--border-color)' }}>
                                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Власні години або коментар:</div>
                                  <div style={{ display: 'flex', gap: '4px' }}>
                                    <input 
                                      type="text" 
                                      value={customShiftInput} 
                                      onChange={e => setCustomShiftInput(e.target.value)}
                                      placeholder="напр., Переробіток 2 год"
                                      style={{ flex: 1, padding: '6px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: '4px', background: 'var(--bg-main)', color: 'var(--text-primary)' }}
                                    />
                                    <button onClick={() => handleSetShift(emp.id, d.dateStr, customShiftInput)} style={{ background: 'var(--accent-color)', border: 'none', borderRadius: '4px', color: 'white', cursor: 'pointer', padding: '0 8px' }}><Check size={14} /></button>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Click outside active cell overlay */}
      {activeCell && (
        <div 
          onClick={() => setActiveCell(null)}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 90 }} 
        />
      )}

      {/* Generator Modal */}
      {generatorEmpId && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--bg-panel)', padding: '24px', borderRadius: '12px', width: '400px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Генератор графіка</h2>
              <button onClick={() => setGeneratorEmpId(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>Шаблон розкладу:</label>
                <select value={genTemplate} onChange={e => setGenTemplate(e.target.value as any)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-primary)' }}>
                  <option value="5/2">5/2 (5 робочих, 2 вихідних)</option>
                  <option value="4/4">4/4 (4 робочих, 4 вихідних)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>Робочі години:</label>
                <input type="text" value={genHours} onChange={e => setGenHours(e.target.value)} placeholder="08:00 - 20:00" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-primary)', boxSizing: 'border-box' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>Дата початку (відлік циклу):</label>
                <input type="date" value={genStartDate} onChange={e => setGenStartDate(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-primary)', boxSizing: 'border-box' }} />
              </div>

              <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => setGeneratorEmpId(null)} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', cursor: 'pointer' }}>Скасувати</button>
                <button onClick={applyGenerator} style={{ padding: '8px 16px', background: 'var(--accent-color)', border: 'none', borderRadius: '6px', color: 'white', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Check size={16} /> Проставити графік
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
