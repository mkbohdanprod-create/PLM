import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Shield, Plus, Save, Trash2 } from 'lucide-react';

const ALL_MODULES = [
  'Планування замірів',
  'Заміри (AppSheet)',
  'Конструктив',
  'Виробництво (MES)',
  'Планування доставок',
  'Доставка',
  'Планування монтажів',
  'Монтажі (AppSheet)',
  'Моніторинг замовлень',
  'Графіки роботи',
  'Розрахунок ЗП',
  'Співробітники',
  'Налаштування ролей',
  'ШІ Аналітика'
];

interface Role {
  id: string;
  name: string;
  allowed_modules: string[];
}

export function RolesModule() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [newRoleName, setNewRoleName] = useState('');

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const { data, error } = await supabase.from('roles').select('*').order('created_at');
      if (error) throw error;
      setRoles(data || []);
    } catch (err) {
      console.error('Error fetching roles:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = async () => {
    if (!newRoleName.trim()) return;
    try {
      const { error } = await supabase.from('roles').insert([
        { name: newRoleName, allowed_modules: [] }
      ]);
      if (error) throw error;
      setNewRoleName('');
      fetchRoles();
    } catch (err) {
      console.error('Error creating role:', err);
      alert('Помилка при створенні ролі');
    }
  };

  const handleDeleteRole = async (id: string) => {
    if (!confirm('Видалити роль? Всі співробітники з цією роллю втратять доступ до системи.')) return;
    try {
      const { error } = await supabase.from('roles').delete().eq('id', id);
      if (error) throw error;
      fetchRoles();
    } catch (err) {
      console.error('Error deleting role:', err);
      alert('Помилка при видаленні');
    }
  };

  const toggleModuleForRole = async (role: Role, moduleName: string) => {
    const isAllowed = role.allowed_modules.includes(moduleName);
    const newModules = isAllowed 
      ? role.allowed_modules.filter(m => m !== moduleName)
      : [...role.allowed_modules, moduleName];
    
    // Optimistic update
    setRoles(prev => prev.map(r => r.id === role.id ? { ...r, allowed_modules: newModules } : r));

    try {
      const { error } = await supabase.from('roles').update({ allowed_modules: newModules }).eq('id', role.id);
      if (error) {
        // Revert on error
        setRoles(prev => prev.map(r => r.id === role.id ? { ...r, allowed_modules: role.allowed_modules } : r));
        throw error;
      }
    } catch (err) {
      console.error('Error updating role:', err);
      alert('Помилка при збереженні');
    }
  };

  if (loading) return <div style={{ padding: '24px' }}>Завантаження ролей...</div>;

  return (
    <div style={{ padding: '24px', background: 'var(--bg-secondary)', minHeight: '100%', overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Shield size={24} style={{ color: 'var(--accent-color)' }} />
          Налаштування ролей та доступів
        </h1>
      </div>

      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        {/* Список ролей */}
        <div style={{ flex: 1, background: 'var(--bg-panel)', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
            <input 
              type="text" 
              placeholder="Назва нової ролі..." 
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              style={{ flex: 1, padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
            />
            <button onClick={handleCreateRole} style={{ padding: '10px 16px', background: 'var(--success-color)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
              <Plus size={16} /> Додати
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {roles.map(role => (
              <div key={role.id} style={{ border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                  <span style={{ fontWeight: 600, fontSize: '15px' }}>{role.name}</span>
                  <button onClick={() => handleDeleteRole(role.id)} style={{ padding: '4px', background: 'none', border: 'none', color: 'var(--danger-color)', cursor: 'pointer' }} title="Видалити роль">
                    <Trash2 size={16} />
                  </button>
                </div>
                <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                  {ALL_MODULES.map(mod => {
                    const isChecked = role.allowed_modules.includes(mod);
                    return (
                      <label key={mod} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                        <input 
                          type="checkbox" 
                          checked={isChecked}
                          onChange={() => toggleModuleForRole(role, mod)}
                          style={{ width: '16px', height: '16px', accentColor: 'var(--accent-color)' }}
                        />
                        {mod}
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
