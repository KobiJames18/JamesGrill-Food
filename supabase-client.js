/* ============================================
   SUPABASE CLIENT
   Fill these in from: Supabase Dashboard → Project Settings → API
   SUPABASE_URL   → "Project URL"
   SUPABASE_ANON  → "anon public" key (safe to expose in client-side code)
   ============================================ */
const SUPABASE_URL = 'https://mupnyjtoojliemkqwnvi.supabase.co';
const SUPABASE_ANON = 'sb_publishable_TZxTgNoAZMGUMaFxAECCRQ_7Vd0Az0E';

window.supabaseClient = (SUPABASE_URL.startsWith('http'))
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON)
    : null;

if (!window.supabaseClient) {
    console.warn('Supabase is not configured yet — fill in SUPABASE_URL / SUPABASE_ANON in supabase-client.js. Falling back to bundled menu data and local-only orders.');
}