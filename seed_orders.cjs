const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://speygkpiuimxiujtykmj.supabase.co', 'sb_publishable_9zx0OLeIgsJZP9K-wj_R2Q_UWRLXAca');

const data = [
  { id: '81-1629717', client: 'Андрієнко В. В.', address: 'вул. Хрещатик, 24, Київ', time: '14:00', status: 'MEASUREMENT_SCHEDULING', phone: '+380671234567', lat: 50.4477, lng: 30.5225, material: 'Тверді матеріали', region: 'Київ', order_type: 'З монтажем', is_subtask: false },
  { id: '81-1250918', client: 'Сахаров К. В.', address: 'пр. Перемоги, 12, Київ', time: '16:30', status: 'MEASUREMENT_SCHEDULING', phone: '+380501234567', lat: 50.4501, lng: 30.4721, material: 'Тверді матеріали', region: 'Київ', order_type: 'З монтажем', is_subtask: false },
  { id: '81-9988776', client: 'ТОВ "БудПостач"', address: 'вул. Богатирська, 11, Київ', time: '10:00', status: 'MEASUREMENT_SCHEDULING', phone: '+380631234567', lat: 50.5182, lng: 30.4851, material: 'Акрил', region: 'Київ', order_type: 'З монтажем', is_subtask: false },
  { id: '81-5544332', client: 'Коваленко О. І.', address: 'вул. Дмитрівська, 2, Київ', time: 'Будь-коли', status: 'MEASUREMENT_SCHEDULING', phone: '+380679876543', lat: 50.4523, lng: 30.4932, material: 'Компакт-плита', region: 'Київ', order_type: 'З монтажем', is_subtask: false },
  { id: '81-4455667', client: 'Ткаченко С. М.', address: 'вул. Городоцька, 72, Львів', time: 'Будь-коли', status: 'NEW', phone: '+380931234567', lat: 49.8429, lng: 24.0311, material: 'Тверді матеріали', region: 'Львів', order_type: 'По кресленню', is_subtask: false },
  { id: '81-2233445', client: 'Олійник П. С.', address: 'вул. Дерибасівська, 1, Одеса', time: '11:00', status: 'NEW', phone: '+380502233445', lat: 46.4825, lng: 30.7233, material: 'Акрил', region: 'Одеса', order_type: 'З монтажем', is_subtask: false },
  { id: '81-1122334', client: 'Григоренко І. М.', address: 'вул. Сахарова, 45, Львів', time: '12:00', status: 'MEASUREMENT_SCHEDULING', phone: '+380971234567', lat: 49.8322, lng: 24.0122, material: 'Тверді матеріали', region: 'Львів', order_type: 'З монтажем', is_subtask: false },
  { id: '81-7766554', client: 'Шевченко Д. В.', address: 'вул. Пушкінська, 10, Київ', time: '15:00', status: 'ENGINEERING_DESIGN', phone: '+380675556677', lat: 50.4455, lng: 30.5188, material: 'Акрил', region: 'Київ', order_type: 'З монтажем', is_subtask: false },
  { id: '81-3344556', client: 'Мельник А. О.', address: 'вул. Чорновола, 15, Львів', time: '10:00', status: 'PRODUCTION_CNC', phone: '+380634445566', lat: 49.8455, lng: 24.0200, material: 'Компакт-плита', region: 'Львів', order_type: 'З монтажем', is_subtask: false },
  { id: '81-9900112', client: 'Бойко В. І.', address: 'вул. Франка, 20, Одеса', time: '09:00', status: 'DELIVERY_SCHEDULING', phone: '+380509900112', lat: 46.4755, lng: 30.7300, material: 'Тверді матеріали', region: 'Одеса', order_type: 'З монтажем', is_subtask: false }
];

async function seed() {
  for (const item of data) {
    const { error } = await supabase.from('orders').upsert(item);
    if (error) console.error('Error:', item.id, error.message);
  }
  console.log('Done seeding!');
}
seed();
