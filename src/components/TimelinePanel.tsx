import React, { useState } from 'react';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import { CalendarDays, ChevronLeft, ChevronRight, MapPin, User, Car, GripVertical, Lock, Unlock } from 'lucide-react';
import type { Order, Measurer, EmployeeSchedule } from '../types';

interface TimeSlotProps {
  id: string;
  timeLabel: string;
  assignedOrder?: Order;
  onRemoveAssignment?: (slotId: string) => void;
  travelTimeBefore?: number | null;
  isWeekMode?: boolean;
  isLocked?: boolean;
  onUnlock?: (orderId: string) => void;
}

function DraggableAssignedOrder({ order, timeLabel, isWeekMode, onRemoveAssignment, slotId, isLocked, onUnlock }: any) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: order.id,
    data: order,
    disabled: isLocked
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: isDragging ? 1000 : undefined,
    opacity: isDragging ? 0.5 : 1,
  } : undefined;

  return (
    <div ref={setNodeRef} style={{ width: '100%', cursor: 'grab', ...style }} {...listeners} {...attributes}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: isWeekMode ? '11px' : '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          {isLocked && <Lock size={12} style={{ color: 'var(--warning-color)' }} />}
          {isWeekMode ? order.id : timeLabel}
        </span>
        {isLocked ? (
          <button 
            onClick={(e) => { e.stopPropagation(); onUnlock?.(order.id); }}
            style={{ padding: '2px 6px', fontSize: '10px', color: 'var(--warning-color)', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <Unlock size={10} />
          </button>
        ) : (
          <button 
            onClick={(e) => { e.stopPropagation(); onRemoveAssignment?.(slotId); }}
            style={{ padding: '2px 6px', fontSize: '10px', color: 'var(--danger-color)', border: 'none', background: 'transparent', cursor: 'pointer' }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            Зняти
          </button>
        )}
      </div>
      {!isWeekMode && <div style={{ fontWeight: 500, color: 'var(--accent-color)' }}>{order.id}</div>}
      <div style={{ fontSize: '12px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
        <User size={12} /> {order.client}
      </div>
      {!isWeekMode && (
        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <MapPin size={12} /> {order.address}
        </div>
      )}
    </div>
  );
}

function DroppableTimeSlot({ id, timeLabel, assignedOrder, onRemoveAssignment, travelTimeBefore, isWeekMode, isLocked, onUnlock }: TimeSlotProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: id,
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', minWidth: isWeekMode ? '160px' : '200px', flex: 1 }}>
      {!isWeekMode && travelTimeBefore !== undefined && travelTimeBefore !== null && (
        <div style={{ padding: '0 8px', color: 'var(--text-secondary)', fontSize: '11px', display: 'flex', flexDirection: 'column', alignItems: 'center', whiteSpace: 'nowrap' }}>
          <Car size={14} style={{ marginBottom: '2px', color: 'var(--accent-color)' }} />
          ~{Math.round(travelTimeBefore)} хв
        </div>
      )}
      <div
        ref={setNodeRef}
        className={`timeline-slot ${isOver && !assignedOrder ? 'droppable-active' : ''} ${assignedOrder ? 'filled' : ''} ${isLocked ? 'locked' : ''}`}
        style={{ width: '100%', minWidth: isWeekMode ? 'auto' : '220px', minHeight: isWeekMode ? '80px' : 'auto', border: isLocked ? '1px solid var(--warning-color)' : undefined }}
      >
        {assignedOrder ? (
          <DraggableAssignedOrder 
            order={assignedOrder} 
            timeLabel={timeLabel} 
            isWeekMode={isWeekMode} 
            onRemoveAssignment={onRemoveAssignment} 
            slotId={id}
            isLocked={isLocked}
            onUnlock={onUnlock}
          />
        ) : (
          <div>
            <span style={{ display: 'block', fontWeight: 600, marginBottom: '4px', fontSize: isWeekMode ? '11px' : '13px' }}>
              {isWeekMode ? 'Вільний слот' : timeLabel}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

interface TimelinePanelProps {
  currentDate: Date;
  onChangeDate: (date: Date) => void;
  measurers: Measurer[];
  assignments: Record<string, Order>;
  onRemoveAssignment: (slotId: string) => void;
  routeInfos: Record<string, any>;
  assignmentsCountByDate: Record<string, number>;
  viewMode: 'day' | 'week';
  onViewModeChange: (mode: 'day' | 'week') => void;
  lockedAssignments?: Record<string, boolean>;
  onUnlockAssignment?: (orderId: string) => void;
  schedules?: EmployeeSchedule[];
}

const TIME_SLOTS = [
  { id: '09:00', label: '09:00 - 11:00' },
  { id: '12:00', label: '12:00 - 14:00' },
  { id: '15:00', label: '15:00 - 17:00' },
  { id: '18:00', label: '18:00 - 20:00' }
];

export function TimelinePanel({ currentDate, onChangeDate, measurers, assignments, onRemoveAssignment, routeInfos, assignmentsCountByDate, viewMode, onViewModeChange, lockedAssignments = {}, onUnlockAssignment, schedules = [] }: TimelinePanelProps) {
  
  const shiftDate = (days: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    onChangeDate(newDate);
  };

  // Generate week days starting from Monday of the current week
  const getMonday = (d: Date) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(date.setDate(diff));
  };

  const monday = getMonday(currentDate);
  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    return d;
  });

  const getDayShort = (d: Date) => d.toLocaleDateString('uk-UA', { weekday: 'short' }).toUpperCase();
  const getDayNum = (d: Date) => d.getDate();

  const currentMonthName = currentDate.toLocaleDateString('uk-UA', { month: 'long', year: 'numeric' });
  const formattedMonth = currentMonthName.charAt(0).toUpperCase() + currentMonthName.slice(1);

  return (
    <div className="panel timeline-panel" style={{ height: '420px', overflowY: 'auto' }}>
      <div className="panel-header" style={{ position: 'sticky', top: 0, zIndex: 10, display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'stretch' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h2 className="panel-title" style={{ margin: 0 }}>
              <CalendarDays size={18} className="text-accent" />
              Графік замірників
            </h2>
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', background: 'var(--bg-secondary)', padding: '4px 12px', borderRadius: '20px' }}>
              {formattedMonth}
            </span>
          </div>
          
          <div className="tabs-container" style={{ margin: 0 }}>
            <button 
              className={`tab-btn ${viewMode === 'day' ? 'active' : ''}`}
              onClick={() => onViewModeChange('day')}
            >
              День
            </button>
            <button 
              className={`tab-btn ${viewMode === 'week' ? 'active' : ''}`}
              onClick={() => onViewModeChange('week')}
            >
              Тиждень
            </button>
          </div>
        </div>
        
        {/* Week Selector Strip (only relevant if in Day mode, or acts as header in Week mode) */}
        {viewMode === 'day' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button onClick={() => shiftDate(-7)} style={{ padding: '6px' }} title="Минулий тиждень"><ChevronLeft size={16} /></button>
            
            <div style={{ display: 'flex', flex: 1, gap: '8px', justifyContent: 'space-between' }}>
              {Array.from({ length: 7 }).map((_, i) => {
                const d = new Date(currentDate);
                d.setDate(d.getDate() - 3 + i);
                const isSelected = d.toDateString() === currentDate.toDateString();
                const isToday = d.toDateString() === new Date().toDateString();
                const dateStr = d.toISOString().split('T')[0];
                const count = assignmentsCountByDate[dateStr] || 0;

                return (
                  <div 
                    key={d.toISOString()}
                    onClick={() => onChangeDate(d)}
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      padding: '8px 4px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      background: isSelected ? 'var(--accent-color)' : 'var(--bg-panel)',
                      color: isSelected ? '#fff' : 'var(--text-primary)',
                      border: `1px solid ${isSelected ? 'var(--accent-color)' : 'var(--border-color)'}`,
                      transition: 'all 0.2s',
                      position: 'relative',
                      boxShadow: isSelected ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                    }}
                  >
                    <span style={{ fontSize: '11px', textTransform: 'uppercase', opacity: isSelected ? 0.9 : 0.6, fontWeight: 600 }}>
                      {getDayShort(d)}
                    </span>
                    <span style={{ fontSize: '18px', fontWeight: 700, marginTop: '2px' }}>
                      {getDayNum(d)}
                    </span>
                    
                    {isToday && !isSelected && (
                      <div style={{ position: 'absolute', top: '4px', right: '4px', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--danger-color)' }} title="Сьогодні"></div>
                    )}

                    {count > 0 && (
                      <div style={{
                        position: 'absolute',
                        bottom: '-6px',
                        background: isSelected ? '#fff' : 'var(--accent-color)',
                        color: isSelected ? 'var(--accent-color)' : '#fff',
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: '10px',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                      }}>
                        {count}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <button onClick={() => shiftDate(7)} style={{ padding: '6px' }} title="Наступний тиждень"><ChevronRight size={16} /></button>
          </div>
        )}
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', background: 'var(--bg-secondary)', flex: 1 }}>
        {viewMode === 'week' && (
           <div style={{ display: 'flex', alignItems: 'stretch', gap: '12px', marginBottom: '4px' }}>
             <div style={{ width: '120px' }}></div>
             <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
               {weekDays.map(d => (
                 <div key={d.toISOString()} style={{ flex: 1, textAlign: 'center', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                   {getDayShort(d)}, {getDayNum(d)}
                 </div>
               ))}
             </div>
           </div>
        )}

        {[...measurers, { id: 'unassigned', name: 'Без замірника', color: '#cbd5e1', capacity: 10 }].map((measurer) => {
          let assignedCount = 0;

          // Check schedule for the current date
          const dateStr = currentDate.toISOString().split('T')[0];
          const measurerSchedule = schedules.find(s => s.id === measurer.id);
          const shiftForDay = measurerSchedule?.shifts[dateStr];
          
          const isUnavailable = measurer.id !== 'unassigned' && (!shiftForDay || shiftForDay.toLowerCase().includes('відпустка') || shiftForDay.toLowerCase().includes('лікарняний') || shiftForDay.toLowerCase().includes('вихідний'));
          const unavailableReason = isUnavailable ? (shiftForDay || 'Не працює') : null;

          const measurerRoute = routeInfos[measurer.id];
          const legs = measurerRoute?.legs || []; 

          return (
            <div key={measurer.id} style={{ display: 'flex', alignItems: 'stretch', gap: '12px' }}>
              <div style={{ 
                width: '120px', 
                background: 'var(--bg-panel)', 
                borderLeft: `4px solid ${measurer.color}`, 
                borderRadius: '4px',
                padding: '12px',
                display: 'flex',
                alignItems: 'center',
                fontWeight: 600,
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                opacity: isUnavailable ? 0.6 : 1
              }}>
                {measurer.name}
              </div>
              
              {viewMode === 'day' ? (
                <div className="timeline-track" style={{ padding: '0', background: 'transparent', flex: 1, overflowX: 'auto', display: 'flex' }}>
                  {isUnavailable ? (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', fontWeight: 600, borderRadius: '4px', fontStyle: 'italic' }}>
                      {unavailableReason}
                    </div>
                  ) : (
                    TIME_SLOTS.map((slot) => {
                      const dropId = `${dateStr}_${measurer.id}_${slot.id}`;
                      const order = assignments[dropId];
                      let travelTime = null;
                      
                      if (order && assignedCount > 0 && legs[assignedCount - 1]) {
                         travelTime = legs[assignedCount - 1].duration / 60;
                      }
                      if (order) assignedCount++;

                      return (
                        <DroppableTimeSlot 
                          key={dropId}
                          id={dropId}
                          timeLabel={slot.label}
                          assignedOrder={order}
                          onRemoveAssignment={onRemoveAssignment}
                          travelTimeBefore={travelTime}
                          isLocked={order ? lockedAssignments[order.id] : false}
                          onUnlock={onUnlockAssignment}
                        />
                      );
                    })
                  )}
                </div>
              ) : (
                <div className="timeline-track" style={{ padding: '0', background: 'transparent', flex: 1, display: 'flex', gap: '8px' }}>
                  {weekDays.map(d => {
                    const dStr = d.toISOString().split('T')[0];
                    const dropId = `${dStr}_${measurer.id}_any`;
                    const order = assignments[dropId];
                    
                    const measurerSchedule = schedules.find(s => s.id === measurer.id);
                    const shiftForDay = measurerSchedule?.shifts[dStr];
                    const isUnavailable = measurer.id !== 'unassigned' && (!shiftForDay || shiftForDay.toLowerCase().includes('відпустка') || shiftForDay.toLowerCase().includes('лікарняний') || shiftForDay.toLowerCase().includes('вихідний'));
                    const unavailableReason = isUnavailable ? (shiftForDay || 'Не працює') : null;

                    return (
                      <div key={dStr} style={{ flex: 1, display: 'flex' }}>
                        {isUnavailable ? (
                           <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', fontWeight: 600, borderRadius: '4px', fontStyle: 'italic', fontSize: '11px', margin: '2px' }}>
                             {unavailableReason}
                           </div>
                        ) : (
                           <DroppableTimeSlot 
                             id={dropId}
                             timeLabel="Слот"
                             assignedOrder={order}
                             onRemoveAssignment={onRemoveAssignment}
                             isWeekMode={true}
                             isLocked={order ? lockedAssignments[order.id] : false}
                             onUnlock={onUnlockAssignment}
                           />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
