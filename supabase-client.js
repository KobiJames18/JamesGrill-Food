/* ============================================
   SUPABASE CLIENT
   Fill these in from: Supabase Dashboard → Project Settings → API
   SUPABASEURL   → "Project URL"
   SUPABASEANON  → "anon public" key (safe to expose in client-side code)
   ============================================ */
const SUPABASE_URL = 'https://mupnyjtoojliemkqwnvi.supabase.co';
const SUPABASE_ANON = 'sb_publishable_TZxTgNoAZMGUMaFxAECCRQ_7Vd0Az0E';

try {
    window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
    console.log('✅ Supabase client initialized:', window.supabaseClient);
} catch (err) {
    window.supabaseClient = null;
    console.error('❌ Supabase failed to initialize:', err);
}