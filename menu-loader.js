/* ============================================
   MENU DATA LOADER
   Fetches menu items + categories from Supabase so admin edits
   show up live on the site. Falls back to the bundled
   DEFAULT_MENU_ITEMS / DEFAULT_CATEGORIES (from data.js) if
   Supabase isn't configured yet or the request fails.
   ============================================ */
window.MENU_ITEMS = [];
window.CATEGORIES = [];
 
function rowToMenuItem(row){
    return {
        id: row.id,
        name: row.name,
        category: row.category,
        desc: row.description,
        price: [row.price_min, row.price_max],
        image: row.image,
        icon: row.icon,
        rating: row.rating,
        badge: row.badge || undefined,
        variants: row.variants || null
    };
}
 
async function loadMenuData(){
    try {
        if (!window.supabaseClient) throw new Error('Supabase not configured');
 
        const [itemsRes, catsRes] = await Promise.all([
            window.supabaseClient.from('menu_items').select('*').order('category'),
            window.supabaseClient.from('categories').select('*')
        ]);
 
        if (itemsRes.error) throw itemsRes.error;
        if (catsRes.error) throw catsRes.error;
        if (!itemsRes.data || itemsRes.data.length === 0) throw new Error('No menu items in database yet');
 
        window.MENU_ITEMS = itemsRes.data.map(rowToMenuItem);
        window.CATEGORIES = (catsRes.data && catsRes.data.length)
            ? catsRes.data.map(c => ({ id: c.id, label: c.label, icon: c.icon }))
            : DEFAULT_CATEGORIES;
    } catch (err) {
        console.warn('Using bundled menu data (Supabase unavailable):', err.message || err);
        window.MENU_ITEMS = DEFAULT_MENU_ITEMS;
        window.CATEGORIES = DEFAULT_CATEGORIES;
    }
}
 