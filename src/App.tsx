import React, { useState, useEffect } from 'react';
import { DndContext, DragOverlay, closestCenter, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { Layers, UserCircle, Phone, User, MapPin, MoreVertical, ChevronRight, Moon, Sun, Check, Settings } from 'lucide-react';
import { MOCK_ORDERS, MOCK_MEASURERS, MOCK_ENGINEERS, INITIAL_SCHEDULE } from './types';
import type { Order, RouteInfo, EmployeeSchedule } from './types';
import { OrderSidebar } from './components/OrderSidebar';
import { EngineeringSidebar } from './components/EngineeringSidebar';
import { EngineeringBoard } from './components/EngineeringBoard';
import { TimelinePanel } from './components/TimelinePanel';
import { MapPanel } from './components/MapPanel';
import { OperatorMonitoring } from './components/OperatorMonitoring';
import { ManagerSettingsDrawer } from './components/ManagerSettingsDrawer';
import { ScheduleEditor } from './components/ScheduleEditor';
import { PayrollModule } from './components/PayrollModule';
import { EmployeesModule } from './components/EmployeesModule';
import { RolesModule } from './components/RolesModule';
import { AIAssistantModule } from './components/AIAssistantModule';
import { calculateRoute } from './utils/RouteCalculator';
import { useAuth } from './contexts/AuthContext';
import './index.css';

function App() {
  const { profile, signOut } = useAuth();
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [selectedOrder, setSelectedOrder] = useState<Order>(MOCK_ORDERS[0]);
  
  // Date State
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  
  // Assignments: key is `${dateStr}_${measurerId}_${slotId}` or `eng_${engineerId}_${orderId}`
  const [assignments, setAssignments] = useState<Record<string, Order>>({});
  
  // Schedules for employees
  const [schedules, setSchedules] = useState<EmployeeSchedule[]>(INITIAL_SCHEDULE);

  const [activeDragOrder, setActiveDragOrder] = useState<Order | null>(null);
  
  // Routes for current date
  const [routeInfos, setRouteInfos] = useState<Record<string, RouteInfo>>({});
  
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  // View Mode: 'day' | 'week'
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  
  // Navigation Drawer State
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isManagerSettingsOpen, setIsManagerSettingsOpen] = useState(false);
  const [activeModule, setActiveModule] = useState<string>('Співробітники');
  const [engineeringPool, setEngineeringPool] = useState<string>('Конструктив');
  const [lockedAssignments, setLockedAssignments] = useState<Record<string, boolean>>({});

  // Global Filters
  const [globalRegion, setGlobalRegion] = useState<string>('Всі');
  const [globalStatus, setGlobalStatus] = useState<string>('Актуальні'); // 'Актуальні', 'На паузі', 'Всі'
  const [globalType, setGlobalType] = useState<string>('Всі'); // 'По кресленню', 'З монтажем', 'Всі'

  const MODULES = [
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

  // Filter modules based on profile's allowed_modules
  const allowedModules = profile?.role?.allowed_modules || [];
  const visibleModules = MODULES.filter(m => allowedModules.includes(m));

  // If active module is not allowed, switch to the first allowed one
  useEffect(() => {
    if (visibleModules.length > 0 && !visibleModules.includes(activeModule)) {
      setActiveModule(visibleModules[0]);
    }
  }, [visibleModules, activeModule]);

  const dateStr = currentDate.toISOString().split('T')[0];

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  // Recalculate routes when assignments on current date change
  useEffect(() => {
    async function fetchRoutes() {
      const newRoutes: Record<string, RouteInfo> = {};
      
      for (const measurer of MOCK_MEASURERS) {
        // Find all orders assigned to this measurer on this date, ordered by slot
        const timeSlots = ['09:00', '12:00', '15:00', '18:00'];
        const assignedOrders = timeSlots
          .map(slot => assignments[`${dateStr}_${measurer.id}_${slot}`])
          .filter(Boolean) as Order[];

        if (assignedOrders.length >= 2) {
          const route = await calculateRoute(assignedOrders);
          if (route) {
            newRoutes[measurer.id] = route;
          }
        }
      }
      
      setRouteInfos(newRoutes);
    }

    if (activeModule === 'Планування замірів') {
      fetchRoutes();
    }
  }, [assignments, dateStr, activeModule]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleDragStart = (event: any) => {
    const { active } = event;
    const order = orders.find(o => o.id === active.id);
    if (order) {
      setActiveDragOrder(order);
      setSelectedOrder(order); 
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragOrder(null);

    if (over && over.id) {
      const orderToAssign = orders.find(o => o.id === active.id);
      if (orderToAssign) {
        // Find existing dropId and remove it to handle moves or removals
        const existingDropId = Object.keys(assignments).find(k => assignments[k].id === active.id);
        
        if (over.id === 'backlog') {
          if (existingDropId) {
            handleRemoveAssignment(existingDropId);
          }
          return;
        }

        const baseDropId = over.id as string;
        let dropId = baseDropId;
        // If dropping into Engineering Kanban column, allow multiple by appending order ID
        if (baseDropId.startsWith('eng_')) {
          dropId = `${baseDropId}_${orderToAssign.id}`;
        }
        
        setAssignments(prev => {
           const copy = { ...prev };
           if (existingDropId) delete copy[existingDropId];
           copy[dropId] = orderToAssign;
           return copy;
        });
      }
    }
  };

  const handleRemoveAssignment = (dropId: string) => {
    setAssignments(prev => {
      const copy = { ...prev };
      delete copy[dropId];
      return copy;
    });
  };

  const assignedOrderIds = Object.values(assignments).map(o => o.id);
  
  // Apply Global Filters
  const filteredOrders = orders.filter(o => {
    if (globalRegion !== 'Всі' && o.region !== globalRegion) return false;
    if (globalType !== 'Всі' && o.orderType !== globalType) return false;
    if (globalStatus === 'Актуальні' && o.status === 'PAUSED') return false;
    if (globalStatus === 'На паузі' && o.status !== 'PAUSED') return false;
    return true;
  });

  // Orders disappear from the left sidebar ONLY after they are locked
  const availableOrders = filteredOrders.filter(o => !lockedAssignments[o.id]);

  // Current day/week assignments for passing to TimelinePanel
  const timelineAssignments: Record<string, Order> = {};
  const assignmentsCountByDate: Record<string, number> = {};
  
  Object.keys(assignments).forEach(key => {
    // Count per date
    const keyDate = key.split('_')[0];
    assignmentsCountByDate[keyDate] = (assignmentsCountByDate[keyDate] || 0) + 1;

    if (viewMode === 'day') {
      if (key.startsWith(dateStr + '_') && !key.endsWith('_any')) {
        // TimelinePanel expects the full key now: "2026-06-26_m-1_12:00"
        timelineAssignments[key] = assignments[key];
      }
    } else {
      timelineAssignments[key] = assignments[key];
    }
  });

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter} 
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="dashboard-layout">
        
        {/* Navigation Drawer Overlay */}
        {isNavOpen && (
          <div 
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9998 }}
            onClick={() => setIsNavOpen(false)}
          ></div>
        )}

        {/* Navigation Drawer */}
        <div style={{
          position: 'fixed', top: 0, left: isNavOpen ? 0 : '-300px', bottom: 0, width: '280px',
          background: 'var(--bg-panel)', boxShadow: '4px 0 15px rgba(0,0,0,0.1)', zIndex: 9999,
          transition: 'left 0.3s ease', display: 'flex', flexDirection: 'column'
        }}>
          <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Layers size={24} color="var(--accent-color)" />
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Модулі системи</h2>
          </div>
          <div style={{ flex: 1, padding: '16px 0', overflowY: 'auto' }}>
            {visibleModules.map(mod => (
              <React.Fragment key={mod}>
                {mod === 'Графіки роботи' && (
                  <div style={{ height: '1px', background: 'var(--border-color)', margin: '8px 24px' }} />
                )}
                {mod === 'ШІ Аналітика' && (
                  <div style={{ height: '1px', background: 'var(--border-color)', margin: '8px 24px' }} />
                )}
                <div 
                  onClick={() => { setActiveModule(mod as any); setIsNavOpen(false); }}
                  style={{
                    padding: '12px 24px',
                    cursor: 'pointer',
                    background: activeModule === mod ? 'var(--bg-secondary)' : 'transparent',
                    borderLeft: `4px solid ${activeModule === mod ? 'var(--accent-color)' : 'transparent'}`,
                    color: activeModule === mod ? 'var(--accent-color)' : 'var(--text-primary)',
                    fontWeight: activeModule === mod ? 600 : 500,
                    transition: 'all 0.2s'
                  }}
                >
                  {mod}
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

        <header className="app-header">
          <div 
            className="app-brand" 
            onClick={() => setIsNavOpen(true)}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}
            title="Відкрити меню модулів"
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)' }}>
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </div>
            <div className="brand-icon">
              <Layers size={18} color="white" />
            </div>
            PLM Dispatcher <span style={{ opacity: 0.7, fontSize: '14px', marginLeft: '8px', fontWeight: 400 }}>| {activeModule}</span>
          </div>
          <div style={{ flex: 1 }}></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Global Filters */}
            <div style={{ display: 'flex', gap: '12px', marginRight: '16px', borderRight: '1px solid rgba(255,255,255,0.2)', paddingRight: '20px' }}>
              <select 
                value={globalRegion} 
                onChange={e => setGlobalRegion(e.target.value)}
                style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', padding: '4px 8px', fontSize: '13px' }}
              >
                <option value="Всі" style={{color: 'black'}}>Регіон: Всі</option>
                <option value="Київ" style={{color: 'black'}}>Київ</option>
                <option value="Львів" style={{color: 'black'}}>Львів</option>
                <option value="Одеса" style={{color: 'black'}}>Одеса</option>
              </select>
              <select 
                value={globalStatus} 
                onChange={e => setGlobalStatus(e.target.value)}
                style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', padding: '4px 8px', fontSize: '13px' }}
              >
                <option value="Актуальні" style={{color: 'black'}}>Актуальні</option>
                <option value="На паузі" style={{color: 'black'}}>На паузі</option>
                <option value="Всі" style={{color: 'black'}}>Статус: Всі</option>
              </select>
              <select 
                value={globalType} 
                onChange={e => setGlobalType(e.target.value)}
                style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', padding: '4px 8px', fontSize: '13px' }}
              >
                <option value="Всі" style={{color: 'black'}}>Тип: Всі</option>
                <option value="По кресленню" style={{color: 'black'}}>По кресленню</option>
                <option value="З монтажем" style={{color: 'black'}}>З монтажем</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '16px', background: 'var(--bg-panel)', padding: '4px 12px', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
              <UserCircle size={16} style={{ color: 'var(--accent-color)' }} />
              <span style={{ fontSize: '13px', fontWeight: 600 }}>{profile?.name || 'Завантаження...'}</span>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', background: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: '10px' }}>{profile?.role?.name || '...'}</span>
            </div>
            <button  
              onClick={toggleTheme} 
              style={{ background: 'transparent', border: 'none', color: 'var(--header-text)', padding: '4px', cursor: 'pointer' }}
              title={theme === 'light' ? 'Увімкнути темну тему' : 'Увімкнути світлу тему'}
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <button
              onClick={() => setIsManagerSettingsOpen(true)}
              style={{ background: 'transparent', border: 'none', color: 'var(--header-text)', padding: '4px', cursor: 'pointer' }}
              title="Налаштування"
            >
              <Settings size={20} />
            </button>
            <button 
              onClick={signOut}
              style={{ background: 'transparent', border: 'none', padding: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              title="Вийти"
            >
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--danger-color)' }}>Вийти</span>
            </button>
          </div>
        </header>

        <div className="main-layout">
          {activeModule === 'Конструктив' ? (
            <EngineeringSidebar 
              orders={availableOrders} 
              selectedOrder={selectedOrder} 
              onSelectOrder={setSelectedOrder} 
              activePool={engineeringPool}
              onAddOrder={(newOrder) => setOrders(prev => [...prev, newOrder])}
            />
          ) : (activeModule === 'Моніторинг замовлень' || activeModule === 'Графіки роботи' || activeModule === 'Розрахунок ЗП' || activeModule === 'Співробітники') ? null : (
            <OrderSidebar 
              orders={availableOrders} 
              selectedOrder={selectedOrder} 
              onSelectOrder={setSelectedOrder} 
            />
          )}

          <div className="main-area">
          {activeModule === 'Моніторинг замовлень' ? (
            <div style={{ padding: '24px', height: '100%', overflow: 'auto', boxSizing: 'border-box' }}>
              {/* Lazy loaded or standard import */}
              <OperatorMonitoring orders={filteredOrders} />
            </div>
          ) : activeModule === 'Співробітники' ? (
            <div style={{ height: '100%', overflow: 'auto', boxSizing: 'border-box' }}>
              <EmployeesModule />
            </div>
          ) : activeModule === 'Налаштування ролей' ? (
            <div style={{ height: '100%', overflow: 'auto', boxSizing: 'border-box' }}>
              <RolesModule />
            </div>
          ) : activeModule === 'ШІ Аналітика' ? (
            <div style={{ height: '100%', overflow: 'auto', boxSizing: 'border-box' }}>
              <AIAssistantModule />
            </div>
          ) : activeModule === 'Графіки роботи' ? (
            <ScheduleEditor schedules={schedules} setSchedules={setSchedules} />
          ) : activeModule === 'Розрахунок ЗП' ? (
            <div style={{ height: '100%', overflow: 'auto', boxSizing: 'border-box' }}>
              <PayrollModule />
            </div>
          ) : activeModule === 'Конструктив' ? (
            <EngineeringBoard 
              engineers={MOCK_ENGINEERS}
              assignments={assignments}
              onRemoveAssignment={handleRemoveAssignment}
              activePool={engineeringPool}
              onPoolChange={setEngineeringPool}
            />
          ) : (
            <>
              <TimelinePanel 
                  currentDate={currentDate}
                  onChangeDate={setCurrentDate}
                  measurers={MOCK_MEASURERS}
                  assignments={timelineAssignments} 
                  onRemoveAssignment={handleRemoveAssignment} 
                  routeInfos={routeInfos}
                  assignmentsCountByDate={assignmentsCountByDate}
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                  lockedAssignments={lockedAssignments}
                  onUnlockAssignment={(orderId) => setLockedAssignments(prev => { const c = {...prev}; delete c[orderId]; return c; })}
                  schedules={schedules}
                />

                <div className="bottom-split">
                  <div className="panel details-panel">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '4px' }}>Картка замовлення</div>
                        <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>{selectedOrder.id}</h2>
                      </div>
                      <button style={{ padding: '6px' }}><MoreVertical size={16} /></button>
                    </div>

                    <div className="details-grid">
                      <div>
                        <div className="detail-label">Клієнт</div>
                        <div className="detail-value">
                          <User size={14} className="text-accent" /> {selectedOrder.client}
                        </div>
                      </div>
                      <div>
                        <div className="detail-label">Телефон</div>
                        <div className="detail-value">
                          <Phone size={14} className="text-accent" /> {selectedOrder.phone}
                        </div>
                      </div>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <div className="detail-label">Адреса об'єкта</div>
                        <div className="detail-value">
                          <MapPin size={14} className="text-accent" /> {selectedOrder.address}
                        </div>
                      </div>
                      <div>
                        <div className="detail-label">Площа виробів</div>
                        <div className="detail-value">{selectedOrder.area}</div>
                      </div>
                      <div>
                        <div className="detail-label">Бажаний час</div>
                        <div className="detail-value">{selectedOrder.time}</div>
                      </div>
                    </div>

                    <div style={{ marginTop: '32px', display: 'flex', gap: '12px' }}>
                      <button className="primary-action" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '10px' }}>
                        Відкрити в системі
                        <ChevronRight size={16} />
                      </button>
                      
                      {assignedOrderIds.includes(selectedOrder.id) && !lockedAssignments[selectedOrder.id] && (
                        <button 
                          onClick={() => {
                            setLockedAssignments(prev => ({...prev, [selectedOrder.id]: true}));
                            alert('Замір зафіксовано!\n\nВідправлено повідомлення в Telegram замірнику.\nЗамовлення з\'явиться в його робочому столі "Заміри".');
                          }}
                          style={{ background: 'var(--success-color)', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '4px', fontWeight: 600, cursor: 'pointer' }}
                        >
                          Зафіксувати замір
                        </button>
                      )}
                      {lockedAssignments[selectedOrder.id] && (
                        <div style={{ padding: '10px 16px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success-color)', borderRadius: '4px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Check size={16} /> Зафіксовано
                        </div>
                      )}
                      
                      {!assignedOrderIds.includes(selectedOrder.id) && (
                        <div style={{ fontSize: '10px', color: 'red' }}>Debug: Not assigned. ID: {selectedOrder.id}, All: {assignedOrderIds.join(', ')}</div>
                      )}

                      {selectedOrder.status !== 'PAUSED' && (
                        <button style={{ color: 'var(--warning-color)', borderColor: 'var(--warning-color)', background: 'transparent' }}>
                          На паузу
                        </button>
                      )}
                    </div>
                  </div>

                  <MapPanel 
                    orders={filteredOrders} 
                    selectedOrder={selectedOrder} 
                    measurers={MOCK_MEASURERS}
                    routeInfos={routeInfos}
                    onSelectOrder={setSelectedOrder}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <ManagerSettingsDrawer 
        isOpen={isManagerSettingsOpen} 
        onClose={() => setIsManagerSettingsOpen(false)} 
      />

      <DragOverlay dropAnimation={null}>
        {activeDragOrder ? (
          <div className="order-card dragging" style={{ width: '280px', transform: 'rotate(2deg)' }}>
            <div className="order-meta">
              <span className="order-id">{activeDragOrder.id}</span>
            </div>
            <div className="order-client">{activeDragOrder.client}</div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export default App;
