import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, Plus, Search as SearchIcon, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { STATUS_LABELS } from '../types';
import type { Order, OrderStatus } from '../types';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet's default icon path issues in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface CreateOrderModalProps {
  onClose: () => void;
  onSuccess: (order: Order) => void;
}

function MapEvents({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
}

function MapCenterUpdater({ lat, lng }: { lat: number, lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
}

export function CreateOrderModal({ onClose, onSuccess }: CreateOrderModalProps) {
  const [formData, setFormData] = useState({
    id: `ORD-${Date.now().toString().slice(-4)}`,
    client: '',
    phone: '',
    address: '',
    region: 'Київ',
    material: 'Тверді матеріали',
    order_type: 'По кресленню',
    area: '',
    status: 'NEW' as OrderStatus,
    lat: 50.4501, // Default Kyiv center
    lng: 30.5234
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Close suggestions on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setSuggestions([]);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Address search via Nominatim
  useEffect(() => {
    if (searchQuery.length < 3) {
      setSuggestions([]);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&countrycodes=ua`);
        const data = await res.json();
        setSuggestions(data);
      } catch (err) {
        console.error('Search error', err);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSuggestionSelect = (sug: any) => {
    setFormData(prev => ({
      ...prev,
      address: sug.display_name,
      lat: parseFloat(sug.lat),
      lng: parseFloat(sug.lon)
    }));
    setSearchQuery(sug.display_name);
    setSuggestions([]);
  };

  const handleMapClick = async (lat: number, lng: number) => {
    setFormData(prev => ({ ...prev, lat, lng }));
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      if (data && data.display_name) {
        setFormData(prev => ({ ...prev, address: data.display_name }));
        setSearchQuery(data.display_name);
      }
    } catch (err) {
      console.error('Reverse geocode error', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setFormData(prev => ({ ...prev, address: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const { error: insertError } = await supabase.from('orders').insert({
        id: formData.id,
        client: formData.client || 'Невідомий клієнт',
        phone: formData.phone || '',
        address: formData.address || 'Не вказано',
        region: formData.region,
        material: formData.material,
        order_type: formData.order_type,
        area: formData.area || '',
        status: formData.status,
        lat: formData.lat,
        lng: formData.lng,
        time: 'Будь-коли',
        is_subtask: false
      });

      if (insertError) throw insertError;
      
      const newOrder: Order = {
        id: formData.id,
        client: formData.client || 'Невідомий клієнт',
        phone: formData.phone || '',
        address: formData.address || 'Не вказано',
        region: formData.region,
        material: formData.material,
        orderType: formData.order_type,
        area: formData.area || '',
        status: formData.status,
        time: 'Будь-коли',
        isSubtask: false,
        lat: formData.lat,
        lng: formData.lng
      };
      
      onSuccess(newOrder);
    } catch (err: any) {
      setError(err.message || 'Сталася помилка при створенні замовлення');
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <>
      <div 
        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 10000 }}
        onClick={onClose}
      />
      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        background: 'var(--bg-panel)', width: '900px', maxHeight: '90vh',
        borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', zIndex: 10001,
        display: 'flex', flexDirection: 'column', overflow: 'hidden'
      }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-primary)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <Plus size={20} style={{ color: 'var(--accent-color)' }} />
            Нове замовлення
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex' }}><X size={20} /></button>
        </div>

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Form Side */}
          <form onSubmit={handleSubmit} style={{ width: '450px', padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', borderRight: '1px solid var(--border-color)' }}>
            {error && (
              <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger-color)', borderRadius: '6px', fontSize: '14px' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', gridColumn: '1 / -1' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Пошук адреси об'єкта</label>
                <div style={{ position: 'relative' }} ref={suggestionsRef}>
                  <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0 12px' }}>
                    <SearchIcon size={16} style={{ color: 'var(--text-secondary)' }} />
                    <input 
                      type="text" 
                      value={searchQuery} 
                      onChange={handleAddressChange} 
                      placeholder="Введіть адресу для пошуку на карті..." 
                      style={{ padding: '8px 12px', border: 'none', background: 'transparent', color: 'var(--text-primary)', fontSize: '14px', width: '100%', outline: 'none' }} 
                      required
                    />
                    {isSearching && <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Пошук...</span>}
                  </div>
                  
                  {suggestions.length > 0 && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '6px', marginTop: '4px', zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', maxHeight: '200px', overflowY: 'auto' }}>
                      {suggestions.map((sug, i) => (
                        <div 
                          key={i} 
                          onClick={() => handleSuggestionSelect(sug)}
                          style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-color)', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}
                        >
                          <MapPin size={14} style={{ color: 'var(--accent-color)', marginTop: '2px', flexShrink: 0 }} />
                          <span>{sug.display_name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Клієнт (ПІБ або Назва)</label>
                <input type="text" name="client" value={formData.client} onChange={handleChange} required placeholder="Іванов І.І." style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '14px' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Телефон</label>
                <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="+380..." style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '14px' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Номер замовлення (ID)</label>
                <input type="text" name="id" value={formData.id} onChange={handleChange} required style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '14px' }} />
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Статус</label>
                <select name="status" value={formData.status} onChange={handleChange} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '14px' }}>
                  {Object.entries(STATUS_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Регіон</label>
                <select name="region" value={formData.region} onChange={handleChange} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '14px' }}>
                  <option value="Київ">Київ</option>
                  <option value="Львів">Львів</option>
                  <option value="Одеса">Одеса</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Тип замовлення</label>
                <select name="order_type" value={formData.order_type} onChange={handleChange} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '14px' }}>
                  <option value="По кресленню">По кресленню</option>
                  <option value="З монтажем">З монтажем</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Матеріал</label>
                <select name="material" value={formData.material} onChange={handleChange} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '14px' }}>
                  <option value="Тверді матеріали">Тверді матеріали</option>
                  <option value="Акрил">Акрил</option>
                  <option value="Компакт-плита">Компакт-плита</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Орієнтовна площа (м²)</label>
                <input type="text" name="area" value={formData.area} onChange={handleChange} placeholder="Наприклад: 4.5" style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '14px' }} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
              <button type="button" onClick={onClose} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 600 }}>
                Скасувати
              </button>
              <button type="submit" disabled={isSubmitting} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: 'var(--accent-color)', color: '#fff', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', opacity: isSubmitting ? 0.7 : 1 }}>
                <Save size={16} />
                {isSubmitting ? 'Збереження...' : 'Створити'}
              </button>
            </div>
          </form>

          {/* Map Side */}
          <div style={{ flex: 1, position: 'relative' }}>
            <div style={{ position: 'absolute', top: '10px', left: '50px', zIndex: 400, background: 'var(--bg-panel)', padding: '6px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: 600, boxShadow: '0 2px 6px rgba(0,0,0,0.2)', pointerEvents: 'none' }}>
              Клікніть на карту, щоб поставити точку
            </div>
            <MapContainer 
              center={[formData.lat, formData.lng]} 
              zoom={13} 
              style={{ width: '100%', height: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[formData.lat, formData.lng]} />
              <MapCenterUpdater lat={formData.lat} lng={formData.lng} />
              <MapEvents onMapClick={handleMapClick} />
            </MapContainer>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
