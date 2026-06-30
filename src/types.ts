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
  assignment_key?: string;

  // --- Нові поля з AppSheet / БД ---
  
  // Загальна інформація
  orderNumber?: string; // 3. № Замовлення (Text)
  createdAt?: string; // 4. Дата оформлення замо (Date)
  baseReadyDate?: string; // 5. Дата готовності по базі (Date)
  paymentDate?: string; // 6. Дата оплати (Date)
  orderTypeEnum?: string; // 7. Тип Замовлення (Enum)
  workType?: string; // 8. Тип робіт (Enum)
  paymentPercent?: number; // 9. Оплата (Percent)
  estimatedReadyDate?: string; // 10. Розрахункова дата готов (Date)
  branch?: string; // 11. Філія (Enum)
  contractor?: string; // 12. Контрагент (Text)
  contactPhone?: string; // 13. Контактний номер (Phone)
  deliveryAddress?: string; // 14. Адреса (Address)
  // 15. Матеріал вже є
  decor?: string; // 16. Декор (Text)
  sinkCutout?: string; // 17. Виріз під мийку (Text)
  hobCutout?: string; // 18. Виріз під варильну (Text)
  decorCount?: number; // 19. Кількість декорів (Number)
  areaValue?: number; // 20. Площа (Decimal)
  accessToObject?: string; // 21. Доступ на обєкт (Phone)
  designApprovalContact?: string; // 22. Погодження конструкти (Phone)
  designerContact?: string; // 23. Дизайнер (Phone)
  contact3?: string; // 24. Контакт 3 (Phone)
  contact4?: string; // 25. Контакт 4 (Phone)
  approvalFormFile?: string; // 26. Бланк погодження (File)
  invoiceFile?: string; // 27. Рахунок (File)
  parsingStatus?: string; // 28. Статус парсингу (Text)
  folderLink?: string; // 29. Folder Link (Text)
  orderRelevance?: string; // 30. Актуальність замовлен (Enum)

  // Дати по етапах
  measurementPlannedDate?: string; // 44. Дата замір заплановано (Date)
  measurementDoneDate?: string; // 45. Дата замір готово (Date)
  designDoneDate?: string; // 46. Дата конструктив готов (Date)
  productionDoneDate?: string; // 47. Дата виробництво готов (Date)
  installationPlannedDate?: string; // 48. Дата монтаж запланова (Date)
  installationDoneDate?: string; // 49. Дата монтаж готово (Date)
  orderDoneDate?: string; // 50. Дата замовлення готов (Date)

  // Планування заміру
  measurementPlanningStatus?: string; // 56. Статус планування замі (Enum)
  measurementPlanningButtons?: string; // 57. Кнопки планування зам (Text)
  newDateComment?: string; // 58. Коментар нова дата (Text)
  nextCallDateTime?: string; // 59. Дата наступного дзвінк (DateTime)
  operatorComment?: string; // 60. Коментар Оператора (Text)
  transferredToMeasurementDate?: string; // 61. Дата передано на замір (Date)
  measurementDateTime?: string; // 62. Дата заміру (DateTime)
  measurementTime?: string; // 63. Час заміру (Time)
  callBeforeDuration?: string; // 64. Набрати за (Duration)
  measurerId?: string; // 65. Замірник (Ref)
  measurementDuration?: string; // 66. Час на замір (Duration)
  travelDuration?: string; // 67. Час на дорогу (Duration)

  // Деталі заміру
  measurementStatusEnum?: string; // 71. Статус замір (Enum)
  measurementButtons?: string; // 72. Кнопки замір (Enum)
  timeInWork?: string; // 73. Час в роботі (Date)
  timeDone?: string; // 74. Час готово (Date)
  timeToCall?: string; // 75. Час коли потрібно подз (DateTime)
  sinkOnMeasurement?: string; // 76. Мийка на замірі (Enum)
  hobOnMeasurement?: string; // 77. Варочна (Enum)
  hasElevator?: boolean; // 78. Ліфт (Yes/No)
  manualLifting?: string; // 79. Підйом в ручну (Enum)
  floorNumber?: number; // 80. Поверх (Number)
  uploadButton?: string; // 81. Кнопка підвантаження (Text)
  addressComment?: string; // 82. Коментар до адреси (Text)
  measurementComment?: string; // 83. Коментар до заміру (Text)
  impossibleReasons?: string; // 84. Причини не можливо об (Enum)
  impossibleComment?: string; // 85. Коментар не не можлив (Text)
  impossiblePhoto?: string; // 86. Фото не можливо оброб (Drawing)
  departurePoint?: string; // 87. Точка виїзду (Address)
  shifts?: Record<string, string | null>;
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

export type ShiftType = string | null;

export interface EmployeeSchedule {
  id: string;
  name: string;
  role: 'Оператор' | 'Замірник' | 'Конструктор';
  shifts: Record<string, ShiftType>; // Key is YYYY-MM-DD
}