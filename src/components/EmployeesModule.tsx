import React, { useState } from 'react';
import { Plus, Edit2, Search, Filter, Trash2, CheckCircle2, X } from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  role: 'Оператор' | 'Замірник' | 'Конструктор' | 'Монтажник' | 'Інше';
  subRole?: string;
  rank?: 'Стажер' | 'Спеціаліст' | 'Старший спеціаліст' | 'Керівник';
  phone: string;
  telegram: string;
  status: 'Працює' | 'У відпустці' | 'Лікарняний' | 'Звільнений';
}

const INITIAL_EMPLOYEES: Employee[] = [
  { id: '1', name: 'Олексій', role: 'Оператор', rank: 'Старший спеціаліст', phone: '+380 50 123 45 67', telegram: '@oleksiy_disp', status: 'Працює' },
  { id: '2', name: 'Марія', role: 'Оператор', rank: 'Спеціаліст', phone: '+380 67 123 45 67', telegram: '@mariya_disp', status: 'Працює' },
  { id: '3', name: 'Іван', role: 'Замірник', rank: 'Стажер', phone: '+380 63 987 65 43', telegram: '@ivan_zamir', status: 'Лікарняний' },
  { id: '4', name: 'Петро', role: 'Замірник', rank: 'Старший спеціаліст', phone: '+380 97 111 22 33', telegram: '@petro_zam', status: 'Працює' },
  { id: '5', name: 'Андрій', role: 'Конструктор', subRole: 'Технолог', rank: 'Керівник', phone: '+380 50 555 66 77', telegram: '@andriy_cad', status: 'У відпустці' },
  { id: '6', name: 'Віктор', role: 'Монтажник', rank: 'Спеціаліст', phone: '+380 67 999 88 77', telegram: '@viktor_montazh', status: 'Працює' }
];

export function EmployeesModule() {
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('Всі');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          emp.phone.includes(searchTerm) || 
                          emp.telegram.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'Всі' || emp.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleEdit = (emp: Employee) => {
    setEditingEmp(emp);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingEmp({
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      role: 'Конструктор',
      subRole: '',
      rank: 'Спеціаліст',
      phone: '',
      telegram: '',
      status: 'Працює'
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Ви впевнені, що хочете видалити цього співробітника?')) {
      setEmployees(prev => prev.filter(e => e.id !== id));
    }
  };

  const handleSave = () => {
    if (!editingEmp) return;
    
    setEmployees(prev => {
      const exists = prev.find(e => e.id === editingEmp.id);
      if (exists) {
        return prev.map(e => e.id === editingEmp.id ? editingEmp : e);
      } else {
        return [...prev, editingEmp];
      }
    });
    setIsModalOpen(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Працює': return 'var(--success-color)';
      case 'У відпустці': return 'var(--accent-color)';
      case 'Лікарняний': return 'var(--warning-color)';
      case 'Звільнений': return 'var(--text-secondary)';
      default: return 'var(--text-secondary)';
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-main)' }}>
      {/* Header */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', background: 'var(--bg-panel)' }}>
        <div>
          <h1 style={{ margin: '0 0 16px 0', fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>Персонал компанії</h1>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ position: 'relative', width: '300px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input 
                type="text" 
                placeholder="Пошук за ім'ям, телефоном..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-primary)', fontSize: '14px' }}
              />
            </div>
            
            <select 
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-primary)', fontSize: '14px', fontWeight: 500 }}
            >
              <option value="Всі">Всі відділи</option>
              <option value="Оператор">Оператори</option>
              <option value="Замірник">Замірники</option>
              <option value="Конструктор">Конструктори</option>
              <option value="Монтажник">Монтажники</option>
            </select>
          </div>
        </div>

        <button onClick={handleAdd} style={{ padding: '10px 20px', background: 'var(--accent-color)', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> Додати співробітника
        </button>
      </div>

      {/* Content / Table */}
      <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
        <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '16px 20px', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>ПІБ</th>
                <th style={{ padding: '16px 20px', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>Посада</th>
                <th style={{ padding: '16px 20px', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>Контакти</th>
                <th style={{ padding: '16px 20px', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>Статус</th>
                <th style={{ padding: '16px 20px', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600, textAlign: 'right' }}>Дії</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map(emp => (
                <tr key={emp.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-main)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '16px 20px', fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    <div>{emp.name}</div>
                    {emp.rank && <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500, marginTop: '2px' }}>{emp.rank}</div>}
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                      <span style={{ padding: '4px 8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '12px', fontWeight: 500, color: 'var(--text-primary)' }}>
                        {emp.role}
                      </span>
                      {emp.role === 'Конструктор' && emp.subRole && (
                        <span style={{ fontSize: '12px', color: 'var(--accent-color)', fontWeight: 500, background: 'rgba(124, 58, 237, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                          {emp.subRole}
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ fontSize: '14px', color: 'var(--text-primary)', marginBottom: '4px' }}>{emp.phone}</div>
                    <div style={{ fontSize: '13px', color: 'var(--accent-color)' }}>{emp.telegram}</div>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: getStatusColor(emp.status) }} />
                      <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>{emp.status}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <button onClick={() => handleEdit(emp)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '6px', marginRight: '8px' }}>
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDelete(emp.id)} style={{ background: 'transparent', border: 'none', color: 'var(--warning-color)', cursor: 'pointer', padding: '6px' }}>
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    Співробітників не знайдено
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit/Create Modal */}
      {isModalOpen && editingEmp && (
        <>
          <div 
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 10000 }}
            onClick={() => setIsModalOpen(false)}
          />
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            background: 'var(--bg-panel)', width: '500px',
            borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', zIndex: 10001,
            display: 'flex', flexDirection: 'column'
          }}>
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                {employees.some(e => e.id === editingEmp.id) ? 'Редагувати співробітника' : 'Новий співробітник'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}>
                <X size={24} />
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>ПІБ</label>
                <input 
                  type="text" 
                  value={editingEmp.name} 
                  onChange={e => setEditingEmp({ ...editingEmp, name: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-primary)', fontSize: '14px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Посада / Відділ</label>
                  <select 
                    value={editingEmp.role} 
                    onChange={e => setEditingEmp({ ...editingEmp, role: e.target.value as any })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-primary)', fontSize: '14px' }}
                  >
                    <option value="Оператор">Оператор</option>
                    <option value="Замірник">Замірник</option>
                    <option value="Конструктор">Конструктор</option>
                    <option value="Монтажник">Монтажник</option>
                    <option value="Інше">Інше</option>
                  </select>
                </div>
                {editingEmp.role === 'Конструктор' ? (
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Суб-роль (Підрозділ)</label>
                    <select 
                      value={editingEmp.subRole || ''} 
                      onChange={e => setEditingEmp({ ...editingEmp, subRole: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-primary)', fontSize: '14px' }}
                    >
                      <option value="">Не обрано</option>
                      {['Конструктив', 'Технолог', 'Розкрій Твердих матеріалів', 'Розкрій Акрилу', 'Розкрій Компакт-плити'].map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                ) : <div />}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Ранг</label>
                  <select 
                    value={editingEmp.rank || 'Спеціаліст'} 
                    onChange={e => setEditingEmp({ ...editingEmp, rank: e.target.value as any })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-primary)', fontSize: '14px' }}
                  >
                    <option value="Стажер">Стажер</option>
                    <option value="Спеціаліст">Спеціаліст</option>
                    <option value="Старший спеціаліст">Старший спеціаліст</option>
                    <option value="Керівник">Керівник</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Статус</label>
                  <select 
                    value={editingEmp.status} 
                    onChange={e => setEditingEmp({ ...editingEmp, status: e.target.value as any })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-primary)', fontSize: '14px' }}
                  >
                    <option value="Працює">Працює</option>
                    <option value="У відпустці">У відпустці</option>
                    <option value="Лікарняний">Лікарняний</option>
                    <option value="Звільнений">Звільнений</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Телефон</label>
                  <input 
                    type="text" 
                    placeholder="+380..."
                    value={editingEmp.phone} 
                    onChange={e => setEditingEmp({ ...editingEmp, phone: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-primary)', fontSize: '14px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Telegram ID</label>
                  <input 
                    type="text" 
                    placeholder="@username"
                    value={editingEmp.telegram} 
                    onChange={e => setEditingEmp({ ...editingEmp, telegram: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-primary)', fontSize: '14px' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)', background: 'var(--bg-secondary)', display: 'flex', justifyContent: 'flex-end', gap: '12px', borderRadius: '0 0 16px 16px' }}>
              <button onClick={() => setIsModalOpen(false)} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>
                Скасувати
              </button>
              <button onClick={handleSave} style={{ padding: '10px 20px', background: 'var(--accent-color)', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 600, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={18} /> Зберегти
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
