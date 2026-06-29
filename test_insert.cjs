const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://speygkpiuimxiujtykmj.supabase.co', 'sb_publishable_9zx0OLeIgsJZP9K-wj_R2Q_UWRLXAca');

async function test() {
  // Sign up a dummy user
  const email = `test_${Date.now()}@example.com`;
  const { data: authData, error: authErr } = await supabase.auth.signUp({ email, password: 'password123' });
  if (authErr) {
    console.error('Auth Error:', authErr);
    return;
  }
  
  // Try inserting
  const { data, error } = await supabase.from('orders').insert({
    id: `TEST-${Date.now()}`,
    client: 'Test Client',
    address: 'Test Address',
    status: 'NEW'
  });
  
  if (error) {
    console.error('Insert Error:', error);
  } else {
    console.log('Insert Success!', data);
  }
}
test();
