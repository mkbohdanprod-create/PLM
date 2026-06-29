import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { User, Layers, Ruler } from 'lucide-react';
import type { Order, Engineer } from '../types';

interface EngineerColumnProps {
  engineer: Engineer;
  assignedOrders: Order[];
  onRemoveAssignment: (dropId: string) => void;
}

function EngineerColumn({ engineer, assignedOrders, onRemoveAssignment }: EngineerColumnProps) {
  const dropId = `eng_${engineer.id}`;
  const { isOver, setNodeRef } = useDroppable({
    id: dropId,
  });

  // Calculate current load in sqm
  const currentLoadSqm = assignedOrders.reduce((sum, order) => {
    const area = parseFloat(order.area) || 0;
    return sum + area;
  }, 0).toFixed(1);

  return (
    <div 
      ref={setNodeRef}
      style={{ 
        flex: 1, 
        minWidth: '280px',
        background: isOver ? 'var(--bg-secondary)' : 'var(--bg-panel)',
        border: `1px solid ${isOver ? 'var(--accent-color)' : 'var(--border-color)'}`,
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.2s',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
      }}
    >
      <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
          <User size={20} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>{engineer.name}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{engineer.specialty}</div>
        </div>
        <div style={{ background: 'var(--accent-color)', color: '#fff', fontSize: '12px', fontWeight: 700, padding: '2px 8px', borderRadius: '12px' }}>
          {assignedOrders.length} завд.
        </div>
      </div>
      
      {/* KPI Header */}
      <div style={{ padding: '8px 16px', background: 'rgba(0,0,0,0.02)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: 'var(--text-secondary)' }}>Зараз в роботі</div>
          <div style={{ fontWeight: 700, color: 'var(--accent-color)', fontSize: '14px' }}>{currentLoadSqm} м²</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: 'var(--text-secondary)' }}>Виконано за місяць</div>
          <div style={{ fontWeight: 700, color: 'var(--success-color)', fontSize: '14px' }}>{engineer.completedSqmThisMonth} м²</div>
        </div>
      </div>

      <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', minHeight: '300px' }}>
        {assignedOrders.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px 0', fontSize: '13px' }}>
            Немає завдань. Перетягніть сюди замовлення для призначення.
          </div>
        ) : (
          assignedOrders.map(order => (
            <div key={order.id} style={{ background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '12px', position: 'relative' }}>
               <button 
                onClick={(e) => { e.stopPropagation(); onRemoveAssignment(dropId + '_' + order.id); }}
                style={{ position: 'absolute', top: '8px', right: '8px', padding: '2px 6px', fontSize: '10px', color: 'var(--danger-color)', border: 'none', background: 'transparent', cursor: 'pointer' }}
              >
                Зняти
              </button>
              <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)', marginBottom: '4px' }}>{order.id}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <User size={12} /> {order.client}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', background: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: '4px' }}>
                  <Layers size={12} /> КД не розпочато
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success-color)', padding: '2px 6px', borderRadius: '4px' }}>
                  <Ruler size={12} /> {order.area}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

interface EngineeringBoardProps {
  engineers: Engineer[];
  assignments: Record<string, Order>;
  onRemoveAssignment: (dropId: string) => void;
  activePool: string;
  onPoolChange: (pool: string) => void;
}

const POOLS = [
  'Конструктив',
  'Технолог',
  'Розкрій Твердих матеріалів',
  'Розкрій Акрилу',
  'Розкрій Компакт-плити'
];

export function EngineeringBoard({ engineers, assignments, onRemoveAssignment, activePool, onPoolChange }: EngineeringBoardProps) {
  const filteredEngineers = engineers.filter(eng => eng.pool === activePool);
  return (
    <div className="panel engineering-board" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="panel-header" style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <h2 className="panel-title" style={{ fontSize: '20px', margin: 0 }}>Розподіл роботи (Kanban)</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '4px 0 0 0' }}>
            Перетягніть замовлення з беклогу в колонку інженера. Відображаються лише спеціалісти обраного пулу.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {POOLS.map(pool => (
            <button
              key={pool}
              onClick={() => onPoolChange(pool)}
              style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: '20px',
                background: activePool === pool ? 'var(--accent-color)' : 'var(--bg-secondary)',
                color: activePool === pool ? '#fff' : 'var(--text-primary)',
                fontWeight: activePool === pool ? 600 : 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s'
              }}
            >
              {pool}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '20px', flex: 1, display: 'flex', gap: '20px', overflowX: 'auto', background: 'var(--bg-main)' }}>
        {filteredEngineers.map(eng => {
          // Find all orders assigned to this engineer. Keys are like "eng_eng-1_81-12345"
          const assignedOrders = Object.entries(assignments)
            .filter(([key]) => key.startsWith(`eng_${eng.id}_`))
            .map(([_, order]) => order);

          return (
            <EngineerColumn 
              key={eng.id} 
              engineer={eng} 
              assignedOrders={assignedOrders} 
              onRemoveAssignment={onRemoveAssignment} 
            />
          );
        })}
      </div>
    </div>
  );
}
