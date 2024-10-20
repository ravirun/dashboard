// app/api/venues/route.js
import { supabase } from '@/utils/supabaseClient';

export async function GET() {
  const { data, error } = await supabase.from('venues').select('*');
  if (error) {
    return new Response(error.message, { status: 500 });
  }

  return new Response(JSON.stringify(data), { status: 200 });
}
