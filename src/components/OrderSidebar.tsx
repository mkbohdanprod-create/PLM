import React, { useState } from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { Search, MapPin, Clock } from 'lucide-react';
import { STATUS_LABELS } from '../types';
import type { Order, OrderStatus } from '../types';

export interface OrderCardProps {
  order: Order;
  isSelected: boolean;
  onSelect: (order: Order) => void;
}

export function DraggableOrderCard({ order, isSelected, onSelect }: OrderCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: order.id,
    data: order
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: isDragging ? 1000 : undefined,
  } : undefined;

  // Simple badge styling based on status category
  let badgeClass = 'cold';
  if (order.status === 'NEW' || order.status.includes('SCHEDULING')) badgeClass = 'hot';
  if (order.status === 'PAUSED' || order.status === 'CANCELLED') badgeClass = 'pause';

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`order-card ${isDragging ? 'dragging' : ''}`}
      onClick={(e) => {
        if (!isDragging) {
          onSelect(order);
        }
      }}
    >
      <div className="order-meta">
        <span className="order-id">{order.id}</span>
        <span className={`badge ${badgeClass}`}>
          {STATUS_LABELS[order.status] || order.status}
        </span>
      </div>
      <div className="order-client">{order.client}</div>
      <div className="order-detail-row">
        <MapPin size={12} /> {order.address}
      </div>
      <div className="order-detail-row">
        <Clock size={12} /> {order.time}
      </div>
    </div>
  );
}

interface OrderSidebarProps {
  orders: Order[];
  selectedOrder: Order;
  onSelectOrder: (order: Order) => void;
}

export function OrderSidebar({ orders, selectedOrder, onSelectOrder }: OrderSidebarProps) {
  const [activeTab, setActiveTab] = useState<OrderStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const { setNodeRef, isOver } = useDroppable({ id: 'backlog' });

  const measurementStatuses = ['NEW', 'PAUSED', 'MEASUREMENT_SCHEDULING', 'REMEASUREMENT_NEEDED'];
  
  const filteredOrders = orders.filter(o => {
    if (!measurementStatuses.includes(o.status)) return false;

    const matchStatus = activeTab === 'ALL' || o.status === activeTab;
    const matchSearch = o.client.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        o.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className={`panel sidebar ${isOver ? 'droppable-active' : ''}`} ref={setNodeRef}>
      <div style={{ padding: '12px 16px 0 16px' }}>
        <select 
          value={activeTab} 
          onChange={(e) => setActiveTab(e.target.value as OrderStatus | 'ALL')}
          style={{ 
            width: '100%', 
            padding: '8px', 
            borderRadius: '4px', 
            border: '1px solid var(--border-color)', 
            background: 'var(--bg-input)', 
            color: 'var(--text-primary)', 
            fontSize: '13px', 
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          <option value="ALL">Всі етапи</option>
          {Object.entries(STATUS_LABELS).map(([status, label]) => (
            <option key={status} value={status}>{label}</option>
          ))}
        </select>
      </div>

      <div className="search-box">
        <Search size={16} className="search-icon" />
        <input 
          type="text" 
          placeholder="Пошук замовлення..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="order-list">
        {filteredOrders.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px 0' }}>
            Немає замовлень
          </div>
        ) : (
          filteredOrders.map(order => (
            <DraggableOrderCard 
              key={order.id} 
              order={order} 
              isSelected={selectedOrder.id === order.id}
              onSelect={onSelectOrder}
            />
          ))
        )}
      </div>
    </div>
  );
}
