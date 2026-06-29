export type OrderStatus = 
  | 'DRAFT' 
  | 'NEW' 
  | 'MEASUREMENT_SCHEDULING' 
  | 'MEASUREMENT_SCHEDULED' 
  | 'MEASUREMENT_COMPLETED' 
  | 'REMEASUREMENT_NEEDED'
  | 'ENGINEERING_DESIGN' 
  | 'ENGINEERING_NESTING'
  | 'CLIENT_APPROVAL' 
  | 'PRODUCTION_QUEUE' 
  | 'IN_PRODUCTION' 
  | 'PRODUCTION_COMPLETED' 
  | 'INSTALLATION_SCHEDULING' 
  | 'INSTALLATION_SCHEDULED' 
  | 'COMPLETED' 
  | 'PAUSED' 
  | 'CANCELLED';

export const STATUS_LABELS: Record<OrderStatus, string> = {
  'DRAFT': 'Чорновик',
  'NEW': 'Нове',
  'MEASUREMENT_SCHEDULING': 'Очікує планування заміру',
  'MEASUREMENT_SCHEDULED': 'Замір заплановано',
  'MEASUREMENT_COMPLETED': 'Замір виконано',
  'REMEASUREMENT_NEEDED': 'Перезамір',
  'ENGINEERING_DESIGN': 'Конструювання',
  'ENGINEERING_NESTING': 'Підготовка розкрою',
  'CLIENT_APPROVAL': 'Очікує погодження клієнта',
  'PRODUCTION_QUEUE': 'В черзі на виробництво',
  'IN_PRODUCTION': 'У виробництві',
  'PRODUCTION_COMPLETED': 'Готово на складі',
  'INSTALLATION_SCHEDULING': 'Очікує планування монтажу',
  'INSTALLATION_SCHEDULED': 'Монтаж заплановано',
  'COMPLETED': 'Завершено',
  'PAUSED': 'На паузі',
  'CANCELLED': 'Скасовано'
};

export interface Order {
  id: string;
  client: string;
  address: string;
  time: string;
  status: OrderStatus;
  phone: string;
  area: string;
  lat: number;
  lng: number;
  material?: string; // e.g. 'Тверді матеріали', 'Акрил', 'Компакт-плита'
  isSubtask?: boolean; // For additional tasks like template nesting
  region: string;
  orderType: 'По кресленню' | 'З монтажем';
}

export interface Measurer {
  id: string;
  name: string;
  color: string;
}

export interface Engineer {
  id: string;
  name: string;
  specialty: string;
  pool: string; // 'Конструктив' | 'Розкрій Твердих матеріалів' | 'Розкрій Акрилу' | 'Розкрій Компакт-плити'
  avatarUrl?: string;
  completedSqmThisMonth: number; // Mock KPI
}

export interface RouteInfo {
  distance: number; // in meters
  duration: number; // in seconds
  geometry: [number, number][]; // Array of [lat, lng]
  legs?: { duration: number; distance: number }[];
}

export const MOCK_MEASURERS: Measurer[] = [
  { id: 'm-2', name: 'Петро', color: '#10b981' }, // Green
  { id: 'm-3', name: 'Іван', color: '#f59e0b' }, // Orange
];

export const MOCK_ENGINEERS: Engineer[] = [
  { id: 'eng-1', name: 'Олександр К.', specialty: 'Загальне конструювання', pool: 'Конструктив', completedSqmThisMonth: 125.5 },
  { id: 'eng-2', name: 'Марія В.', specialty: 'Скло / Дзеркала', pool: 'Конструктив', completedSqmThisMonth: 84.0 },
  { id: 'eng-7', name: 'Віталій Б.', specialty: 'Фурнітура / Техкарти', pool: 'Технолог', completedSqmThisMonth: 310.0 },
  { id: 'eng-3', name: 'Ігор С.', specialty: 'Натуральний камінь', pool: 'Розкрій Твердих матеріалів', completedSqmThisMonth: 210.2 },
  { id: 'eng-4', name: 'Олена П.', specialty: 'Кварцит / Кераміка', pool: 'Розкрій Твердих матеріалів', completedSqmThisMonth: 190.8 },
  { id: 'eng-5', name: 'Дмитро М.', specialty: 'Штучний камінь', pool: 'Розкрій Акрилу', completedSqmThisMonth: 145.0 },
  { id: 'eng-6', name: 'Анна Л.', specialty: 'HPL', pool: 'Розкрій Компакт-плити', completedSqmThisMonth: 95.5 },
];

export const MOCK_ORDERS: Order[] = [
  { id: '81-1629717', client: 'Андрієнко В. В.', address: 'вул. Хрещатик, 24, Київ', time: '14:00', status: 'MEASUREMENT_SCHEDULING', phone: '+380 50 123 45 67', area: '4.5 м²', lat: 50.4474, lng: 30.5226, material: 'Тверді матеріали', region: 'Київ', orderType: 'З монтажем' },
  { id: '81-1250918', client: 'Сахаров К. В.', address: 'пр. Перемоги, 12, Київ', time: '16:30', status: 'MEASUREMENT_SCHEDULING', phone: '+380 67 987 65 43', area: '2.1 м²', lat: 50.4504, lng: 30.4789, material: 'Акрил', region: 'Київ', orderType: 'З монтажем' },
  { id: '81-1928374', client: 'Іванова М. О.', address: 'вул. Саксаганського, 100, Київ', time: 'Очікування', status: 'PAUSED', phone: '+380 63 111 22 33', area: '6.0 м²', lat: 50.4355, lng: 30.4952, material: 'Компакт-плита', region: 'Київ', orderType: 'По кресленню' },
  { id: '81-9988776', client: 'ТОВ "БудПостач"', address: 'вул. Богатирська, 11, Київ', time: '10:00 (Завтра)', status: 'MEASUREMENT_SCHEDULING', phone: '+380 44 555 44 33', area: '12.4 м²', lat: 50.5085, lng: 30.4878, material: 'Тверді матеріали', region: 'Київ', orderType: 'З монтажем' },
  { id: '81-5544332', client: 'Коваленко О. І.', address: 'вул. Дмитрівська, 2, Київ', time: 'Будь-коли', status: 'MEASUREMENT_SCHEDULING', phone: '+380 66 123 99 88', area: '1.2 м²', lat: 50.4485, lng: 30.4935, material: 'Акрил', region: 'Київ', orderType: 'З монтажем' },
  
  // Додано 10 нових замовлень у різних статусах
  { id: '81-4455667', client: 'Ткаченко С. М.', address: 'вул. Городоцька, 72, Львів', time: 'Будь-коли', status: 'NEW', phone: '+380 50 222 33 44', area: '3.5 м²', lat: 49.8397, lng: 24.0297, material: 'Тверді матеріали', region: 'Львів', orderType: 'По кресленню' },
  { id: '81-2233445', client: 'Олійник П. С.', address: 'вул. Дерибасівська, 1, Одеса', time: '11:00', status: 'NEW', phone: '+380 99 333 44 55', area: '8.0 м²', lat: 46.4825, lng: 30.7233, material: 'Компакт-плита', region: 'Одеса', orderType: 'З монтажем' },
  { id: '81-1122334', client: 'ЖК "Новопечерські Липки"', address: 'вул. Драгомирова, 14, Київ', time: 'Будь-коли', status: 'MEASUREMENT_SCHEDULED', phone: '+380 67 444 55 66', area: '15.0 м²', lat: 50.4116, lng: 30.5458, material: 'Тверді матеріали', region: 'Київ', orderType: 'З монтажем' },
  { id: '81-7788990', client: 'Григоренко Л. В.', address: 'пр. Чорновола, 10, Львів', time: 'Будь-коли', status: 'MEASUREMENT_COMPLETED', phone: '+380 63 555 66 77', area: '4.2 м²', lat: 49.8450, lng: 24.0250, material: 'Акрил', region: 'Львів', orderType: 'З монтажем' },
  { id: '81-5566778', client: 'Бондар А. А.', address: 'вул. Оболонська Набережна, 15, Київ', time: 'Будь-коли', status: 'ENGINEERING_DESIGN', phone: '+380 44 666 77 88', area: '9.8 м²', lat: 50.5050, lng: 30.5180, material: 'Тверді матеріали', region: 'Київ', orderType: 'З монтажем' },
  { id: '81-3344556', client: 'ТОВ "Меблі Ексклюзив"', address: 'пр. Степана Бандери, 23, Київ', time: 'Будь-коли', status: 'CLIENT_APPROVAL', phone: '+380 50 777 88 99', area: '25.0 м²', lat: 50.4880, lng: 30.4975, material: 'Акрил', region: 'Київ', orderType: 'По кресленню' },
  { id: '81-1002003', client: 'Павлюк В. В.', address: 'вул. Шевченка, 152, Львів', time: 'Будь-коли', status: 'ENGINEERING_NESTING', phone: '+380 66 100 20 30', area: '14.0 м²', lat: 49.8400, lng: 24.0100, material: 'Компакт-плита', region: 'Львів', orderType: 'По кресленню' },
  { id: '81-8899001', client: 'Кравчук О. П.', address: 'Французький бульвар, 34, Одеса', time: 'Будь-коли', status: 'PRODUCTION_QUEUE', phone: '+380 67 888 99 00', area: '5.5 м²', lat: 46.4650, lng: 30.7500, material: 'Тверді матеріали', region: 'Одеса', orderType: 'З монтажем' },
  { id: '81-9900112', client: 'Сидоренко І. В.', address: 'вул. Глибочицька, 44, Київ', time: 'Будь-коли', status: 'IN_PRODUCTION', phone: '+380 99 999 00 11', area: '2.8 м²', lat: 50.4630, lng: 30.4950, material: 'Акрил', region: 'Київ', orderType: 'По кресленню' },
  { id: '81-4433221', client: 'ЖК "Комфорт Таун"', address: 'пр. Соборності, 17, Київ', time: 'Будь-коли', status: 'INSTALLATION_SCHEDULING', phone: '+380 63 000 11 22', area: '10.5 м²', lat: 50.4350, lng: 30.6180, material: 'Тверді матеріали', region: 'Київ', orderType: 'З монтажем' },
  { id: '81-2211009', client: 'Макаренко Д. М.', address: 'вул. Жилянська, 59, Київ', time: 'Будь-коли', status: 'COMPLETED', phone: '+380 44 111 22 33', area: '3.1 м²', lat: 50.4375, lng: 30.5030, material: 'Компакт-плита', region: 'Київ', orderType: 'З монтажем' },
  
  // Доп. задачі
  { id: 'SUB-001', client: 'Внутрішнє: Розкрій шаблону', address: 'Цех', time: 'Будь-коли', status: 'ENGINEERING_DESIGN', phone: '-', area: '1.0 м²', lat: 50.4, lng: 30.5, material: 'Тверді матеріали', isSubtask: true, region: 'Київ', orderType: 'По кресленню' },
  { id: 'SUB-002', client: 'Внутрішнє: Металоконструкція', address: 'Цех', time: 'Будь-коли', status: 'ENGINEERING_DESIGN', phone: '-', area: '0.5 м²', lat: 50.4, lng: 30.5, material: 'Тверді матеріали', isSubtask: true, region: 'Київ', orderType: 'По кресленню' },
];

export type ShiftType = string | null;

export interface EmployeeSchedule {
  id: string;
  name: string;
  role: 'Оператор' | 'Замірник' | 'Конструктор';
  shifts: Record<string, ShiftType>; // Key is YYYY-MM-DD
}

export const INITIAL_SCHEDULE: EmployeeSchedule[] = [
  { id: '1', name: 'Олексій (Диспетчер)', role: 'Оператор', shifts: { '2026-06-25': '08:00 - 17:00', '2026-06-26': '08:00 - 17:00', '2026-06-29': '08:00 - 17:00' } },
  { id: '2', name: 'Марія (Диспетчер)', role: 'Оператор', shifts: { '2026-06-25': '10:00 - 19:00', '2026-06-26': '10:00 - 19:00', '2026-06-29': '10:00 - 19:00' } },
  { id: 'm-3', name: 'Іван (Замірник)', role: 'Замірник', shifts: { '2026-06-25': 'Відпустка', '2026-06-26': 'Відпустка', '2026-06-29': 'Відпустка' } },
  { id: 'm-2', name: 'Петро (Замірник)', role: 'Замірник', shifts: { '2026-06-26': 'Лікарняний', '2026-06-29': '09:00 - 18:00' } },
  { id: 'eng-1', name: 'Олександр К.', role: 'Конструктор', shifts: { '2026-06-25': '09:00 - 18:00', '2026-06-26': '09:00 - 18:00', '2026-06-29': '09:00 - 18:00' } },
];
