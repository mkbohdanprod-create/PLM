import React, { useState } from 'react';
import { X, Save, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import type { PayrollRecord } from './PayrollModule';

interface MotivationSettings {
  baseSalary: number;
  targetDays: number;
  pieceRates: { id: string; name: string; unit: string; price: number }[];
  bonusRules: { id: string; description: string; amount: number }[];
}

interface PayrollSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: PayrollRecord | null;
  onSave: (empId: string, newSettings: MotivationSettings) => void;
}

export function PayrollSettingsModal({ isOpen, onClose, employee, onSave }: PayrollSettingsModalProps) {
  if (!isOpen || !employee) return null;

  // Initialize state with employee's current settings or defaults
  const [baseSalary, setBaseSalary] = useState(employee.baseSalary || 0);
  const [targetDays, setTargetDays] = useState(employee.totalDays || 22);
  
  // Dummy initialization for demo purposes. In real app, these would come from employee.motivationSettings
  const [pieceRates, setPieceRates] = useState<{ id: string; name: string; unit: string; price: number }[]>([
    { id: '1', name: 'Розкрій', unit: 'м²', price: 50 },
    { id: '2', name: 'Монтаж', unit: 'об\'єкт', price: 2500 }
  ]);
  
  const [bonusRules, setBonusRules] = useState<{ id: string; description: string; amount: number }[]>([
    { id: '1', description: 'Премія за відсутність рекламацій', amount: 2000 }
  ]);

  const handleSave = () => {
    onSave(employee.id, {
      baseSalary,
      targetDays,
      pieceRates,
      bonusRules
    });
    onClose();
  };

  const addPieceRate = () => {
    setPieceRates([...pieceRates, { id: Math.random().toString(), name: '', unit: '', price: 0 }]);
  };

  const removePieceRate = (id: string) => {
    setPieceRates(pieceRates.filter(pr => pr.id !== id));
  };

  const addBonusRule = () => {
    setBonusRules([...bonusRules, { id: Math.random().toString(), description: '', amount: 0 }]);
  };

  const removeBonusRule = (id: string) => {
    setBonusRules(bonusRules.filter(br => br.id !== id));
  };

  return (
    <>
      <div 
        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 10000 }}
        onClick={onClose}
      />
      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        background: 'var(--bg-panel)', width: '600px', maxHeight: '90vh', overflowY: 'auto',
        borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', zIndex: 10001,
        display: 'flex', flexDirection: 'column'
      }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'var(--bg-panel)', zIndex: 1 }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Налаштування мотивації</h2>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>Співробітник: {employee.name}</div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}>
            <X size={24} />
          </button>
        </div>

        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Section 1: Basic */}
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Основні показники</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Базова ставка (грн)</label>
                <input 
                  type="number" 
                  value={baseSalary} 
                  onChange={e => setBaseSalary(Number(e.target.value))}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-primary)', fontSize: '14px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Планових робочих днів</label>
                <input 
                  type="number" 
                  value={targetDays} 
                  onChange={e => setTargetDays(Number(e.target.value))}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-primary)', fontSize: '14px' }}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Piece Rates */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Відрядна ЗП (Метрики)</h3>
              <button onClick={addPieceRate} style={{ background: 'transparent', border: 'none', color: 'var(--accent-color)', cursor: 'pointer', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Plus size={16} /> Додати метрику
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {pieceRates.map((pr, i) => (
                <div key={pr.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '12px', alignItems: 'center' }}>
                  <input 
                    placeholder="Назва роботи"
                    value={pr.name}
                    onChange={e => { const newPrs = [...pieceRates]; newPrs[i].name = e.target.value; setPieceRates(newPrs); }}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-primary)', fontSize: '13px' }}
                  />
                  <input 
                    placeholder="Одиниця (шт, м²)"
                    value={pr.unit}
                    onChange={e => { const newPrs = [...pieceRates]; newPrs[i].unit = e.target.value; setPieceRates(newPrs); }}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-primary)', fontSize: '13px' }}
                  />
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="number"
                      placeholder="Ціна"
                      value={pr.price}
                      onChange={e => { const newPrs = [...pieceRates]; newPrs[i].price = Number(e.target.value); setPieceRates(newPrs); }}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-primary)', fontSize: '13px', paddingRight: '30px' }}
                    />
                    <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', color: 'var(--text-secondary)' }}>₴</span>
                  </div>
                  <button onClick={() => removePieceRate(pr.id)} style={{ padding: '8px', background: 'transparent', border: 'none', color: 'var(--warning-color)', cursor: 'pointer', opacity: 0.7 }}>
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              {pieceRates.length === 0 && <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Немає налаштованих метрик</div>}
            </div>
          </div>

          {/* Section 3: Fixed Bonuses */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Премії та Бонуси</h3>
              <button onClick={addBonusRule} style={{ background: 'transparent', border: 'none', color: 'var(--accent-color)', cursor: 'pointer', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Plus size={16} /> Додати бонус
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {bonusRules.map((br, i) => (
                <div key={br.id} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr auto', gap: '12px', alignItems: 'center' }}>
                  <input 
                    placeholder="Умова / Опис бонусу"
                    value={br.description}
                    onChange={e => { const newBrs = [...bonusRules]; newBrs[i].description = e.target.value; setBonusRules(newBrs); }}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-primary)', fontSize: '13px' }}
                  />
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="number"
                      placeholder="Сума"
                      value={br.amount}
                      onChange={e => { const newBrs = [...bonusRules]; newBrs[i].amount = Number(e.target.value); setBonusRules(newBrs); }}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-primary)', fontSize: '13px', paddingRight: '30px' }}
                    />
                    <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', color: 'var(--text-secondary)' }}>₴</span>
                  </div>
                  <button onClick={() => removeBonusRule(br.id)} style={{ padding: '8px', background: 'transparent', border: 'none', color: 'var(--warning-color)', cursor: 'pointer', opacity: 0.7 }}>
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              {bonusRules.length === 0 && <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Немає налаштованих бонусів</div>}
            </div>
          </div>

        </div>

        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)', background: 'var(--bg-secondary)', display: 'flex', justifyContent: 'flex-end', gap: '12px', position: 'sticky', bottom: 0, borderRadius: '0 0 16px 16px' }}>
          <button onClick={onClose} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>
            Скасувати
          </button>
          <button onClick={handleSave} style={{ padding: '10px 20px', background: 'var(--accent-color)', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 600, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={18} /> Зберегти налаштування
          </button>
        </div>
      </div>
    </>
  );
}
