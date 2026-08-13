warning: in the working copy of 'style.css', LF will be replaced by CRLF the next time Git touches it
[1mdiff --cc style.css[m
[1mindex 7158e86,634f550..0000000[m
[1m--- a/style.css[m
[1m+++ b/style.css[m
[36m@@@ -1,1242 -1,1242 +1,1241 @@@[m
[31m -@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Work+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap');[m
[31m -[m
[31m -/* ============================================[m
[31m -   DESIGN TOKENS[m
[31m -   ============================================ */[m
[31m -:root{[m
[31m -    --flame:#ff4426;[m
[31m -    --flame-dark:#d92e12;[m
[31m -    --ember:#ffb020;[m
[31m -[m
[31m -    --bg:#150f0c;[m
[31m -    --surface:#211812;[m
[31m -    --surface-raised:#2b1f17;[m
[31m -    --border:rgba(255,236,220,.1);[m
[31m -    --text:#f5ede4;[m
[31m -    --text-muted:#b8a99a;[m
[31m -    --shadow:0 1rem 3rem rgba(0,0,0,.45);[m
[31m -[m
[31m -    --font-display:'Bebas Neue', sans-serif;[m
[31m -    --font-body:'Work Sans', sans-serif;[m
[31m -}[m
[31m -[m
[31m -[data-theme="light"]{[m
[31m -    --bg:#faf5ee;[m
[31m -    --surface:#ffffff;[m
[31m -    --surface-raised:#fff9f2;[m
[31m -    --border:rgba(30,20,12,.1);[m
[31m -    --text:#221a13;[m
[31m -    --text-muted:#6d5f52;[m
[31m -    --shadow:0 1rem 3rem rgba(60,40,20,.12);[m
[31m -}[m
[31m -[m
[31m -*{[m
[31m -    margin:0; padding:0;[m
[31m -    box-sizing: border-box;[m
[31m -    outline: none;[m
[31m -    border: none;[m
[31m -    text-decoration: none;[m
[31m -    transition: background .25s linear, color .25s linear, border-color .25s linear, transform .2s linear, box-shadow .2s linear;[m
[31m -}[m
[31m -[m
[31m -*::selection{[m
[31m -    background:var(--flame);[m
[31m -    color:#fff;[m
[31m -}[m
[31m -[m
[31m -html{[m
[31m -    font-size: 62.5%;[m
[31m -    overflow-x: hidden;[m
[31m -    scroll-behavior: smooth;[m
[31m -    scroll-padding-top: 8rem;[m
[31m -}[m
[31m -[m
[31m -body{[m
[31m -    background:var(--bg);[m
[31m -    color:var(--text);[m
[31m -    font-family: var(--font-body);[m
[31m -}[m
[31m -[m
[31m -img{ max-width:100%; display:block; }[m
[31m -[m
[31m -section{[m
[31m -    padding:6rem 9%;[m
[31m -}[m
[31m -[m
[31m -.eyebrow{[m
[31m -    font-family: var(--font-body);[m
[31m -    font-weight:700;[m
[31m -    letter-spacing:.3rem;[m
[31m -    text-transform: uppercase;[m
[31m -    font-size: 1.3rem;[m
[31m -    color:var(--flame);[m
[31m -    display:inline-flex;[m
[31m -    align-items:center;[m
[31m -    gap:.8rem;[m
[31m -}[m
[31m -[m
[31m -.eyebrow::before{[m
[31m -    content:'';[m
[31m -    width:2.4rem; height:.2rem;[m
[31m -    background:var(--flame);[m
[31m -    display:inline-block;[m
[31m -}[m
[31m -[m
[31m -.heading{[m
[31m -    font-family: var(--font-display);[m
[31m -    letter-spacing:.1rem;[m
[31m -    font-size: 5rem;[m
[31m -    line-height: 1;[m
[31m -    color:var(--text);[m
[31m -    margin-top:.6rem;[m
[31m -}[m
[31m -[m
[31m -.heading span{[m
[31m -    color:var(--flame);[m
[31m -}[m
[31m -[m
[31m -.section-head{[m
[31m -    text-align:center;[m
[31m -    max-width:60rem;[m
[31m -    margin:0 auto 4rem;[m
[31m -}[m
[31m -[m
[31m -.section-head.left{[m
[31m -    text-align:left;[m
[31m -    margin:0 0 4rem;[m
[31m -}[m
[31m -[m
[31m -.sub{[m
[31m -    font-size:1.6rem;[m
[31m -    color:var(--text-muted);[m
[31m -    margin-top:1rem;[m
[31m -    line-height:1.6;[m
[31m -}[m
[31m -[m
[31m -/* grill-mark signature motif: diagonal char-lines, used as dividers & hover burn */[m
[31m -.grill-lines{[m
[31m -    background-image: repeating-linear-gradient(135deg, var(--flame) 0 3px, transparent 3px 22px);[m
[31m -    opacity:.5;[m
[31m -}[m
[31m -[m
[31m -/* ============================================[m
[31m -   BUTTONS[m
[31m -   ============================================ */[m
[31m -.btn{[m
[31m -    display:inline-flex;[m
[31m -    align-items:center;[m
[31m -    gap:.8rem;[m
[31m -    padding:1.3rem 3.2rem;[m
[31m -    background:var(--flame);[m
[31m -    color:#fff;[m
[31m -    font-weight:700;[m
[31m -    font-size: 1.5rem;[m
[31m -    letter-spacing:.05rem;[m
[31m -    text-transform: uppercase;[m
[31m -    cursor:pointer;[m
[31m -    border-radius:.5rem;[m
[31m -    position:relative;[m
[31m -    overflow:hidden;[m
[31m -    z-index:0;[m
[31m -}[m
[31m -[m
[31m -.btn::before{[m
[31m -    content:'';[m
[31m -    position:absolute;[m
[31m -    inset:0;[m
[31m -    background-image: repeating-linear-gradient(135deg, rgba(0,0,0,.18) 0 3px, transparent 3px 10px);[m
[31m -    opacity:0;[m
[31m -    z-index:-1;[m
[31m -}[m
[31m -[m
[31m -.btn:hover::before{ opacity:1; }[m
[31m -.btn:hover{ transform: translateY(-.2rem); box-shadow: 0 .8rem 1.6rem rgba(255,68,38,.35); }[m
[31m -[m
[31m -.btn.outline{[m
[31m -    background:transparent;[m
[31m -    border:.15rem solid var(--flame);[m
[31m -    color:var(--flame);[m
[31m -}[m
[31m -.btn.outline:hover{ color:#fff; }[m
[31m -.btn.outline::after{[m
[31m -    content:'';[m
[31m -    position:absolute; inset:0;[m
[31m -    background:var(--flame);[m
[31m -    transform: scaleX(0);[m
[31m -    transform-origin:left;[m
[31m -    transition: transform .3s ease;[m
[31m -    z-index:-1;[m
[31m -}[m
[31m -.btn.outline:hover::after{ transform: scaleX(1); }[m
[31m -[m
[31m -.btn.small{ padding:.9rem 2rem; font-size:1.3rem; }[m
[31m -.btn.block{ width:100%; justify-content:center; }[m
[31m -.btn:disabled{ opacity:.5; cursor:not-allowed; transform:none; box-shadow:none; }[m
[31m -/* anchor-based buttons (e.g. #checkoutBtn) can't use :disabled — script.js[m
[31m -   toggles this class instead when the cart is empty */[m
[31m -.btn.is-disabled{ opacity:.5; cursor:not-allowed; pointer-events:none; transform:none; box-shadow:none; }[m
[31m -[m
[31m -.icon-btn{[m
[31m -    width:4.2rem; height:4.2rem;[m
[31m -    display:inline-flex; align-items:center; justify-content:center;[m
[31m -    border-radius:50%;[m
[31m -    background:var(--surface-raised);[m
[31m -    border:.1rem solid var(--border);[m
[31m -    color:var(--text);[m
[31m -    font-size:1.7rem;[m
[31m -    cursor:pointer;[m
[31m -    position:relative;[m
[31m -    flex-shrink:0;[m
[31m -}[m
[31m -.icon-btn:hover{ color:var(--flame); border-color:var(--flame); }[m
[31m -[m
[31m -.badge-count{[m
[31m -    position:absolute;[m
[31m -    top:-.4rem; right:-.4rem;[m
[31m -    background:var(--flame);[m
[31m -    color:#fff;[m
[31m -    font-size:1.1rem;[m
[31m -    font-weight:700;[m
[31m -    min-width:1.9rem; height:1.9rem;[m
[31m -    border-radius:50%;[m
[31m -    display:flex; align-items:center; justify-content:center;[m
[31m -    padding:0 .3rem;[m
[31m -    border:.2rem solid var(--bg);[m
[31m -}[m
[31m -[m
[31m -/* ============================================[m
[31m -   HEADER / NAV[m
[31m -   ============================================ */[m
[31m -header{[m
[31m -    position: fixed;[m
[31m -    top:0; left:0; right:0;[m
[31m -    z-index:1000;[m
[31m -    display:flex;[m
[31m -    align-items:center;[m
[31m -    justify-content:space-between;[m
[31m -    gap:2rem;[m
[31m -    background:var(--surface);[m
[31m -    padding:1.6rem 9%;[m
[31m -    box-shadow:var(--shadow);[m
[31m -    border-bottom:.1rem solid var(--border);[m
[31m -}[m
[31m -[m
[31m -header .logo{[m
[31m -    font-family: var(--font-display);[m
[31m -    font-size: 2.8rem;[m
[31m -    letter-spacing:.05rem;[m
[31m -    color:var(--text);[m
[31m -    display:flex;[m
[31m -    align-items:center;[m
[31m -    white-space:n