import React, { useState } from 'react';
import type { Order } from '../types';
import { Search, Filter, ArrowUpDown } from 'lucide-react';
import { STATUS_LABELS } from '../types';

interface OperatorMonitoringProps {
  orders: Order[];
}

type SortConfig = {
  key: keyof Order | '';
  direction: 'asc' | 'desc';
};

export function OperatorMonitoring({ orders }: OperatorMonitoringProps) {
  const [searchTermId, setSearchTermId] = useState('');
  const [searchTermClient, setSearchTermClient] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('Всі');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: '', direction: 'asc' });

  // Локальне фільтрування (другий рівень)
  const filteredOrders = orders.filter(order => {
    if (searchTermId && !order.id.toLowerCase().includes(searchTermId.toLowerCase())) return false;
    if (searchTermClient && !order.client.toLowerCase().includes(searchTermClient.toLowerCase())) return false;
    if (filterStatus !== 'Всі' && order.status !== filterStatus) return false;
    return true;
  });

  // Сортування
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (sortConfig.key) {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (aVal === undefined || bVal === undefined) return 0;
      
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const handleSort = (key: keyof Order) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const statusOptions = Array.from(new Set(orders.map(o => o.status)));

  return (
    <div style={{ background: 'var(--bg-panel)', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Загальна картина замовлень</h2>
        <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          Відображено: {sortedOrders.length} / {orders.length}
        </div>
      </div>

      {/* Local Filters */}
      <div style={{ padding: '16px 24px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Пошук по ID</label>
          <div className="search-input">
            <Search size={16} />
            <input 
              type="text" 
              placeholder="Введіть ID..." 
              value={searchTermId} 
              onChange={e => setSearchTermId(e.target.value)} 
            />
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Клієнт</label>
          <div className="search-input">
            <Search size={16} />
            <input 
              type="text" 
              placeholder="Ім'я клієнта..." 
              value={searchTermClient} 
              onChange={e => setSearchTermClient(e.target.value)} 
            />
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Локальний статус</label>
          <select 
            value={filterStatus} 
            onChange={e => setFilterStatus(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-panel)', color: 'var(--text-primary)', outline: 'none' }}
          >
            <option value="Всі">Всі статуси</option>
            {statusOptions.map(status => (
              <option key={status} value={status}>{STATUS_LABELS[status] || status}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-panel)', zIndex: 1, boxShadow: '0 1px 0 var(--border-color)' }}>
            <tr>
              <th onClick={() => handleSort('id')} style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>ID <ArrowUpDown size={14} opacity={sortConfig.key === 'id' ? 1 : 0.3} /></div>
              </th>
              <th onClick={() => handleSort('client')} style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>Клієнт <ArrowUpDown size={14} opacity={sortConfig.key === 'client' ? 1 : 0.3} /></div>
              </th>
              <th onClick={() => handleSort('address')} style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>Адреса <ArrowUpDown size={14} opacity={sortConfig.key === 'address' ? 1 : 0.3} /></div>
              </th>
              <th onClick={() => handleSort('region')} style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>Регіон <ArrowUpDown size={14} opacity={sortConfig.key === 'region' ? 1 : 0.3} /></div>
              </th>
              <th onClick={() => handleSort('orderType')} style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>Тип <ArrowUpDown size={14} opacity={sortConfig.key === 'orderType' ? 1 : 0.3} /></div>
              </th>
              <th onClick={() => handleSort('status')} style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>Статус <ArrowUpDown size={14} opacity={sortConfig.key === 'status' ? 1 : 0.3} /></div>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedOrders.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  Замовлень не знайдено за поточними фільтрами
                </td>
              </tr>
            ) : (
              sortedOrders.map((order) => (
                <tr key={order.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }} className="table-row-hover">
                  <td style={{ padding: '16px', fontSize: '14px', fontWeight: 600, color: 'var(--accent-color)' }}>{order.id}</td>
                  <td style={{ padding: '16px', fontSize: '14px', color: 'var(--text-primary)' }}>
                    {order.client}
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>{order.phone}</div>
                  </td>
                  <td style={{ padding: '16px', fontSize: '14px', color: 'var(--text-secondary)' }}>{order.address}</td>
                  <td style={{ padding: '16px', fontSize: '14px' }}>
                    <span style={{ display: 'inline-block', padding: '4px 8px', background: 'var(--bg-secondary)', borderRadius: '4px', fontSize: '12px' }}>
                      {order.region || 'Не вказано'}
                    </span>
                  </td>
                  <td style={{ padding: '16px', fontSize: '14px', color: 'var(--text-secondary)' }}>{order.orderType || '-'}</td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ 
                      display: 'inline-block', 
                      padding: '4px 8px', 
                      background: order.status === 'PAUSED' ? 'var(--bg-secondary)' : 'rgba(0, 132, 255, 0.1)', 
                      color: order.status === 'PAUSED' ? 'var(--warning-color)' : 'var(--accent-color)', 
                      borderRadius: '4px', 
                      fontSize: '12px',
                      fontWeight: 600
                    }}>
                      {STATUS_LABELS[order.status] || order.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <style>{`
        .table-row-hover:hover {
          background: var(--bg-secondary);
        }
      `}</style>
    </div>
  );
}
