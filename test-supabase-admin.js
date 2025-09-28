import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

console.log('--- Checking environment variables ---');
console.log('SUPABASE URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Using key (first 10 chars):', process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 10) + '...');

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE env vars');
  process.exit(1);
}

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('--- Testing table access ---');
try {
  const { data, error } = await supabaseAdmin
    .from('likes') // pick any table you know exists
    .select('*')
    .limit(1);

  if (error) {
    console.error('❌ Query error:', error);
  } else {
    console.log('✅ Query success:', data);
  }
} catch (err) {
  console.error('❌ Unexpected error:', err);
}
