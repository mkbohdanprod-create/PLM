import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Search, Plus, X, Check } from 'lucide-react';
import type { Order } from '../types';
import { DraggableOrderCard } from './OrderSidebar';

interface EngineeringSidebarProps {
  orders: Order[];
  selectedOrder: Order;
  onSelectOrder: (order: Order) => void;
  activePool?: string;
  onAddOrder?: (order: Order) => void;
  onDeleteOrder?: (orderId: string) => void;
}

export function EngineeringSidebar({ orders, selectedOrder, onSelectOrder, activePool, onAddOrder, onDeleteOrder }: EngineeringSidebarProps) {
  const [filterType, setFilterType] = useState<'new' | 'paused' | 'subtasks'>('new');
  const [isCreating, setIsCreating] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const { setNodeRef, isOver } = useDroppable({ id: 'backlog' });

  // Pool routing logic
  const poolOrders = orders.filter(o => {
    if (activePool === 'Конструктив') {
      return o.status === 'MEASUREMENT_COMPLETED' || o.status === 'ENGINEERING_DESIGN' || o.status === 'CLIENT_APPROVAL' || o.status === 'PAUSED';
    } else if (activePool === 'Технолог') {
      return o.status === 'ENGINEERING_DESIGN' || o.status === 'ENGINEERING_NESTING' || o.status === 'PAUSED';
    } else if (activePool === 'Розкрій Твердих матеріалів') {
      return (o.status === 'ENGINEERING_DESIGN' || o.status === 'ENGINEERING_NESTING' || o.status === 'PAUSED') && o.material === 'Тверді матеріали';
    } else if (activePool === 'Розкрій Акрилу') {
      return (o.status === 'ENGINEERING_DESIGN' || o.status === 'ENGINEERING_NESTING' || o.status === 'PAUSED') && o.material === 'Акрил';
    } else if (activePool === 'Розкрій Компакт-плити') {
      return (o.status === 'ENGINEERING_DESIGN' || o.status === 'ENGINEERING_NESTING' || o.status === 'PAUSED') && o.material === 'Компакт-плита';
    }
    return false;
  });

  // Second level filter based on toggle
  const engineeringOrders = poolOrders.filter(o => {
    if (filterType === 'new') {
      return o.status !== 'PAUSED' && !o.isSubtask;
    } else if (filterType === 'paused') {
      return o.status === 'PAUSED';
    } else if (filterType === 'subtasks') {
      return !!o.isSubtask;
    }
    return false;
  });

  // Counts for badges
  const newCount = poolOrders.filter(o => o.status !== 'PAUSED' && !o.isSubtask).length;
  const pausedCount = poolOrders.filter(o => o.status === 'PAUSED').length;
  const subtasksCount = poolOrders.filter(o => !!o.isSubtask).length;

  const handleCreateSubtask = () => {
    if (!newTaskTitle.trim() || !onAddOrder) return;
    
    const newOrder: Order = {
      id: `SUB-${Date.now().toString().slice(-4)}`,
      client: `Доп. задача: ${newTaskTitle}`,
      address: 'Цех',
      time: 'Будь-коли',
      status: 'ENGINEERING_DESIGN',
      phone: '-',
      area: '0.0 м²',
      lat: 50.4,
      lng: 30.5,
      isSubtask: true,
      material: activePool === 'Розкрій Акрилу' ? 'Акрил' : 
                activePool === 'Розкрій Компакт-плити' ? 'Компакт-плита' : 
                'Тверді матеріали',
      region: 'Київ',
      orderType: 'По кресленню'
    };
    
    onAddOrder(newOrder);
    setNewTaskTitle('');
    setIsCreating(false);
    setFilterType('subtasks'); // Switch to subtasks view to see it
  };

  return (
    <div className={`panel sidebar ${isOver ? 'droppable-active' : ''}`} ref={setNodeRef}>
      <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>Беклог: {activePool}</h3>
        <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>Замовлення, готові до роботи</p>
        
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          <button 
            onClick={() => setFilterType('new')}
            style={{ flex: 1, padding: '4px', fontSize: '11px', borderRadius: '4px', border: 'none', background: filterType === 'new' ? 'var(--accent-color)' : 'rgba(0,0,0,0.05)', color: filterType === 'new' ? '#fff' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
          >Нові <span style={{ opacity: filterType === 'new' ? 0.9 : 0.6, fontSize: '10px' }}>{newCount}</span></button>
          <button 
            onClick={() => setFilterType('paused')}
            style={{ flex: 1, padding: '4px', fontSize: '11px', borderRadius: '4px', border: 'none', background: filterType === 'paused' ? 'var(--warning-color)' : 'rgba(0,0,0,0.05)', color: filterType === 'paused' ? '#fff' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
          >Паузи <span style={{ opacity: filterType === 'paused' ? 0.9 : 0.6, fontSize: '10px' }}>{pausedCount}</span></button>
          <button 
            onClick={() => setFilterType('subtasks')}
            style={{ flex: 1, padding: '4px', fontSize: '11px', borderRadius: '4px', border: 'none', background: filterType === 'subtasks' ? '#8b5cf6' : 'rgba(0,0,0,0.05)', color: filterType === 'subtasks' ? '#fff' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
          >Доп. задачі <span style={{ opacity: filterType === 'subtasks' ? 0.9 : 0.6, fontSize: '10px' }}>{subtasksCount}</span></button>
          <button 
            onClick={() => setIsCreating(!isCreating)}
            style={{ padding: '4px', width: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', border: 'none', background: 'rgba(0,0,0,0.05)', color: 'var(--text-primary)', cursor: 'pointer' }}
            title="Створити додаткову задачу"
          ><Plus size={14} /></button>
        </div>
      </div>

      {isCreating && (
        <div style={{ padding: '12px 16px', background: 'var(--bg-main)', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>Нова доп. задача</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input 
              type="text" 
              value={newTaskTitle}
              onChange={e => setNewTaskTitle(e.target.value)}
              placeholder="Напр. Розкрій шаблону..."
              style={{ flex: 1, padding: '6px 8px', fontSize: '12px', borderRadius: '4px', border: '1px solid var(--border-color)', outline: 'none' }}
              onKeyDown={e => e.key === 'Enter' && handleCreateSubtask()}
              autoFocus
            />
            <button 
              onClick={handleCreateSubtask}
              style={{ background: 'var(--success-color)', color: '#fff', border: 'none', borderRadius: '4px', padding: '0 8px', cursor: 'pointer' }}
            ><Check size={14} /></button>
            <button 
              onClick={() => setIsCreating(false)}
              style={{ background: 'var(--danger-color)', color: '#fff', border: 'none', borderRadius: '4px', padding: '0 8px', cursor: 'pointer' }}
            ><X size={14} /></button>
          </div>
        </div>
      )}

      <div className="search-box">
        <Search size={16} className="search-icon" />
        <input type="text" placeholder="Пошук замовлення..." />
      </div>

      <div className="order-list">
        {engineeringOrders.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px 0' }}>
            Беклог пустий
          </div>
        ) : (
          engineeringOrders.map(order => (
            <DraggableOrderCard 
              key={order.id} 
              order={order} 
              isSelected={selectedOrder.id === order.id}
              onSelect={onSelectOrder}
              onDelete={onDeleteOrder}
            />
          ))
        )}
      </div>
    </div>
  );
}
