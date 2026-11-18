/* =========================================================
   Camada de dados da loja
   - No servidor (Render): usa a API /api/...
   - Sem servidor (preview): "modo demonstração" no navegador (localStorage)
   ========================================================= */
(function(){
  const LS_KEY = 'loja_demo_v1';
  const TOKEN_KEY = 'loja_admin_token';

  /* ---------- dados iniciais (exemplo) ---------- */
  const SEED = () => ({
    settings: {
      name: 'Casa & Cor',
      tagline: 'Utilidades para casa',
      whatsapp: '5579999999999',
      instagram: '',
      address: 'Rua Exemplo, 123 — Centro',
      hours: 'Seg. a sáb., 8h às 18h',
      primary: '#0E4D4A',
      accent: '#FF6B4A',
      freeShip: 199,
      topbar: ['Entrega grátis acima de R$ 199', 'Até 3x sem juros no cartão', 'Peça pelo WhatsApp e retire na loja'],
      heroes: [
        {eyebrow:'Coleção de Natal', title:'Neste Natal, celebre o', highlight:'extraordinário', text:'Potes, garrafas e copos térmicos para presentear quem você ama.', btn:'Ver presentes', art:'natal'},
        {eyebrow:'Só esta semana', title:'Ofertas de', highlight:'Black Friday', text:'Até 40% OFF em linhas selecionadas. Corra, é por tempo limitado!', btn:'Ver ofertas', art:'oferta'},
        {eyebrow:'Organização', title:'Organize seu', highlight:'freezer', text:'Potes que empilham, vedam e duram anos.', btn:'Conhecer', art:'organiza'}
      ],
      values: [
        {t:'Favoritos confiáveis', d:'Produtos que resistem ao teste do tempo.'},
        {t:'Abordagem inovadora', d:'Função e design pensados para o dia a dia.'},
        {t:'Sempre melhorando', d:'Novidades toda semana na nossa vitrine.'}
      ]
    },
    categories: ['Armazenar','Para levar','Cozinhar e aquecer','Servir','Preparar'],
    products: [
      P(1,'Pote Retangular com Divisórias 550ml Uva','Para levar',40.9,61.9,18,'marmita',['#7b4fa0','#e6d9f2'],22,{novo:false}),
      P(2,'Pote Retangular com Divisórias 550ml Azul Profundo','Para levar',40.9,61.9,18,'marmita',['#123b6d','#cfe0f5'],15),
      P(3,'Tigela Floral 1L Folhas Douradas','Servir',79.9,0,40,'tigela',['#2f6b4f','#e8c66a'],8,{novo:true}),
      P(4,'Tigela Floral 2L Folhas Douradas','Servir',106.9,0,52,'tigela',['#2f6b4f','#e8c66a'],6,{novo:true}),
      P(5,'Jarra Clássica 2L Folhas Douradas','Servir',94.9,159.9,45,'jarra',['#2f6b4f','#e8c66a'],5,{novo:true}),
      P(6,'Pote Quadrado Freezer 400ml Pistache','Armazenar',34.9,0,15,'pote',['#a8c98a','#ffffff'],30),
      P(7,'Pote Quadrado Freezer 400ml Turmalina','Armazenar',34.9,0,15,'pote',['#1f8a8a','#ffffff'],12),
      P(8,'Pote Quadrado Freezer 400ml Azul Água','Armazenar',34.9,0,15,'pote',['#7fd3e0','#ffffff'],3),
      P(9,'Garrafa Redonda 500ml Açafrão','Para levar',47.9,0,20,'garrafa',['#f0a530','#ffffff'],25),
      P(10,'Garrafa Redonda 500ml Cinza','Para levar',47.9,0,20,'garrafa',['#8a8f99','#ffffff'],14),
      P(11,'Garrafa Freezer 470ml Pêssego','Para levar',41.9,66.9,18,'garrafa',['#f6b59a','#ffffff'],9),
      P(12,'Copo Térmico com Canudo 1,1L Rosa','Para levar',272.9,419.9,150,'copo',['#f2a7bd','#ffffff'],4),
      P(13,'Copo Térmico com Canudo 1,1L Mar Profundo','Para levar',419.9,0,190,'copo',['#0f3d5c','#ffffff'],2),
      P(14,'Caixa para Açúcar 1,4kg','Armazenar',55.9,92.9,25,'pote',['#ffffff','#d9534f'],11),
      P(15,'Caixa para Café 700g Preto','Armazenar',55.9,92.9,25,'pote',['#222222','#c9a36b'],7),
      P(16,'Travessa de Vidro Retangular 650ml','Cozinhar e aquecer',157.9,0,80,'travessa',['#d6eef0','#0E4D4A'],6),
      P(17,'Travessa de Vidro Retangular 400ml','Cozinhar e aquecer',120.9,0,60,'travessa',['#d6eef0','#0E4D4A'],8),
      P(18,'Kit Tigelas para Preparo 3 peças','Preparar',129.9,169.9,65,'tigela',['#ff6b4a','#ffe1d9'],10)
    ],
    orders: demoOrders(),
    seq: 100
  });
  function P(id,name,category,price,oldPrice,cost,art,colors,stock,flags){
    return {id:String(id),name,category,price,oldPrice:oldPrice||0,cost,stock,art,colors,image:'',active:true,
      novo:!!(flags&&flags.novo),destaque:id<=6,description:'',created:Date.now()-id*86400000};
  }
  function demoOrders(){
    // pedidos de exemplo dos últimos 14 dias para o painel ter o que mostrar
    const names=['Ana Paula','Joana','Marcos','Cida','Rita','Fernanda','Carla','Lúcia','Patrícia','Bruno'];
    const picks=[[1,2],[6,3],[9,1],[3,1],[12,1],[14,2],[5,1],[16,1],[11,2],[7,4],[18,1],[2,1],[10,1],[15,1]];
    const st=['entregue','entregue','entregue','pago','separado','novo'];
    const prices={1:40.9,2:40.9,3:79.9,5:94.9,6:34.9,7:34.9,9:47.9,10:47.9,11:41.9,12:272.9,14:55.9,15:55.9,16:157.9,18:129.9};
    const nm={1:'Pote Retangular com Divisórias 550ml Uva',2:'Pote Retangular com Divisórias 550ml Azul Profundo',3:'Tigela Floral 1L Folhas Douradas',5:'Jarra Clássica 2L Folhas Douradas',6:'Pote Quadrado Freezer 400ml Pistache',7:'Pote Quadrado Freezer 400ml Turmalina',9:'Garrafa Redonda 500ml Açafrão',10:'Garrafa Redonda 500ml Cinza',11:'Garrafa Freezer 470ml Pêssego',12:'Copo Térmico com Canudo 1,1L Rosa',14:'Caixa para Açúcar 1,4kg',15:'Caixa para Café 700g Preto',16:'Travessa de Vidro Retangular 650ml',18:'Kit Tigelas para Preparo 3 peças'};
    const costs={1:18,2:18,3:40,5:45,6:15,7:15,9:20,10:20,11:18,12:150,14:25,15:25,16:80,18:65};
    const out=[]; let n=1;
    for(let d=13; d>=0; d--){
      const k=(d*7)%3+1;
      for(let j=0;j<k;j++){
        const [pid,q]=picks[(d+j*5)%picks.length];
        const items=[{id:String(pid),name:nm[pid],price:prices[pid],cost:costs[pid],qty:q}];
        const t=new Date(); t.setDate(t.getDate()-d); t.setHours(9+j*3,15*j,0,0);
        out.push({id:String(n++),date:t.getTime(),items,total:+(prices[pid]*q).toFixed(2),
          customer:{name:names[(d+j)%names.length],phone:'(79) 9 9999-0000',delivery:j%2?'Retirada na loja':'Entrega',address:''},
          payment:['PIX','Cartão','Dinheiro'][(d+j)%3],status:d>2?'entregue':st[(d+j)%st.length],channel:j%2?'site':'manual',note:''});
      }
    }
    return out.reverse();
  }

  /* ---------- modo demo (localStorage) ---------- */
  function load(){ try{ const d=JSON.parse(localStorage.getItem(LS_KEY)); if(d&&d.products) return d }catch(e){} return SEED() }
  function persist(db){ try{ localStorage.setItem(LS_KEY, JSON.stringify(db)) }catch(e){ throw new Error('Sem espaço no navegador (fotos muito grandes?)') } }
  let memo=null; const DB=()=> memo||(memo=load());

  // regra única de pedido (igual à do servidor)
  function makeOrder(db, body, manual){
    const items=[];
    for(const it of (body.items||[])){
      const p=db.products.find(x=>x.id===String(it.id)); const qty=Math.max(1,parseInt(it.qty)||1);
      if(!p) throw new Error('Produto não encontrado');
      if(p.stock<qty) throw new Error(`Estoque insuficiente: ${p.name} (restam ${p.stock})`);
      items.push({id:p.id,name:p.name,price:manual&&it.price!=null?+it.price:p.price,cost:p.cost||0,qty});
    }
    if(!items.length) throw new Error('Carrinho vazio');
    items.forEach(it=>{ db.products.find(x=>x.id===it.id).stock-=it.qty });
    const c=body.customer||{};
    const o={id:String(++db.seq),date:Date.now(),items,total:+items.reduce((s,i)=>s+i.price*i.qty,0).toFixed(2),
      customer:{name:String(c.name||'').slice(0,80),phone:String(c.phone||'').slice(0,30),delivery:String(c.delivery||''),address:String(c.address||'').slice(0,200)},
      payment:String(body.payment||''),status:manual?(body.status||'pago'):'novo',channel:manual?'manual':'site',note:String(body.note||'').slice(0,300)};
    db.orders.unshift(o); return o;
  }
  function setStatus(db,id,status){
    const o=db.orders.find(x=>x.id===id); if(!o) throw new Error('Pedido não encontrado');
    const wasCancel=o.status==='cancelado', isCancel=status==='cancelado';
    if(!wasCancel&&isCancel) o.items.forEach(i=>{const p=db.products.find(x=>x.id===i.id); if(p)p.stock+=i.qty});
    if(wasCancel&&!isCancel) o.items.forEach(i=>{const p=db.products.find(x=>x.id===i.id); if(p)p.stock-=i.qty});
    o.status=status; return o;
  }
  const publicView = db => ({settings:db.settings,categories:db.categories,products:db.products.filter(p=>p.active).map(({cost,...p})=>p)});

  const demo = {
    store: async()=>publicView(DB()),
    order: async b=>{ const db=DB(); const o=makeOrder(db,b,false); persist(db); return o },
    login: async pw=>{ if(pw!=='admin') throw new Error('Senha incorreta (no modo demonstração a senha é: admin)'); return 'demo' },
    data: async()=>DB(),
    saveSettings: async(s,cats)=>{ const db=DB(); db.settings={...db.settings,...s}; if(cats) db.categories=cats; persist(db); return db },
    saveProduct: async p=>{ const db=DB(); if(!p.id){ p.id=String(Date.now()); p.created=Date.now(); db.products.unshift(p) } else { const i=db.products.findIndex(x=>x.id===p.id); db.products[i]={...db.products[i],...p} } persist(db); return p },
    deleteProduct: async id=>{ const db=DB(); db.products=db.products.filter(x=>x.id!==id); persist(db) },
    setOrderStatus: async(id,s)=>{ const db=DB(); const o=setStatus(db,id,s); persist(db); return o },
    createOrder: async b=>{ const db=DB(); const o=makeOrder(db,b,true); persist(db); return o },
    deleteOrder: async id=>{ const db=DB(); const o=db.orders.find(x=>x.id===id); if(o&&o.status!=='cancelado') setStatus(db,id,'cancelado'); db.orders=db.orders.filter(x=>x.id!==id); persist(db) },
    importAll: async d=>{ if(!d||!Array.isArray(d.products)) throw new Error('Arquivo inválido'); memo={...SEED(),...d}; persist(memo); return memo },
    reset: async()=>{ memo=SEED(); persist(memo); return memo }
  };

  /* ---------- modo servidor ---------- */
  const tok = ()=>{ try{return localStorage.getItem(TOKEN_KEY)||''}catch(e){return ''} };
  async function call(path, opt={}){
    const r=await fetch('api/'+path,{...opt,headers:{'Content-Type':'application/json','Authorization':'Bearer '+tok(),...(opt.headers||{})},body:opt.body?JSON.stringify(opt.body):undefined});
    let j=null; try{ j=await r.json() }catch(e){}
    if(r.status===401) { const e=new Error('Sessão expirada. Entre de novo.'); e.auth=true; throw e }
    if(!r.ok) throw new Error((j&&j.error)||'Erro no servidor');
    return j;
  }
  const server = {
    store: ()=>call('store'),
    order: b=>call('orders',{method:'POST',body:b}),
    login: async pw=>{ const j=await call('login',{method:'POST',body:{password:pw}}); return j.token },
    data: ()=>call('admin/data'),
    saveSettings: (s,cats)=>call('admin/settings',{method:'PUT',body:{settings:s,categories:cats}}),
    saveProduct: p=>call('admin/products',{method:'POST',body:p}),
    deleteProduct: id=>call('admin/products/'+encodeURIComponent(id),{method:'DELETE'}),
    setOrderStatus: (id,s)=>call('admin/orders/'+encodeURIComponent(id),{method:'PUT',body:{status:s}}),
    createOrder: b=>call('admin/orders',{method:'POST',body:b}),
    deleteOrder: id=>call('admin/orders/'+encodeURIComponent(id),{method:'DELETE'}),
    importAll: d=>call('admin/import',{method:'POST',body:d}),
    reset: ()=>{ throw new Error('Indisponível no servidor') }
  };

  /* ---------- detecta qual modo usar ---------- */
  let modeP=null;
  function mode(){
    return modeP||(modeP=(async()=>{
      try{ const r=await fetch('api/ping',{cache:'no-store'}); const j=await r.json(); return j&&j.ok===true?'server':'demo' }catch(e){ return 'demo' }
    })());
  }
  const API={ mode, setToken:t=>{try{localStorage.setItem(TOKEN_KEY,t)}catch(e){}}, clearToken:()=>{try{localStorage.removeItem(TOKEN_KEY)}catch(e){}}, hasToken:()=>!!tok() };
  Object.keys(demo).forEach(k=>{ API[k]=async(...a)=>((await mode())==='server'?server:demo)[k](...a) });
  window.API=API;


  /* ---------- textos padrão do site (tudo editável no painel) ---------- */
  window.CONTENT_DEFAULTS = {
    logo:'', logoHeight:40, favicon:'',
    mainShow:true, mainKicker:'Os principais produtos', mainTitle:'Escolhidos para você', tabNovidades:'Novidades', tabMais:'Mais vendidos', tabOfertas:'Ofertas',
    catSectionsShow:true,
    bannerShow:true, bannerKicker:'Os melhores produtos', bannerTitle:'Para sua cozinha, para sua vida!', bannerText:'Qualidade que dura, com o atendimento de quem te conhece.', bannerBtn:'Explorar novos produtos', bannerLink:'#principais', bannerImage:'',
    valuesShow:true, valuesKicker:'Nosso jeito', valuesTitle:'Cultive um futuro melhor', valuesText:'Produtos pensados para durar e facilitar o seu dia.',
    perksShow:true, perks:[{t:'Entrega rápida',d:'ou retire na loja'},{t:'Produtos originais',d:'Com garantia'},{t:'Ofertas imperdíveis',d:'Novidades toda semana'},{t:'Atendimento',d:'Pelo WhatsApp'}],
    newsShow:true, newsTitle:'Fique por dentro', newsText:'Receba novidades e promoções.', newsOk:'Pronto! Você vai receber nossas novidades.',
    pages:[{t:'Trocas e devoluções',b:'Você tem até 7 dias após o recebimento para solicitar a troca ou devolução. O produto deve estar sem uso e na embalagem original. Fale com a gente pelo WhatsApp.'},{t:'Prazos de entrega',b:'Entregamos na cidade em até 2 dias úteis após a confirmação do pagamento. Você também pode retirar na loja.'},{t:'Formas de pagamento',b:'PIX, cartão de crédito (até 3x sem juros), cartão de débito e dinheiro.'}],
    helpTitle:'Ajuda', contactTitle:'Fale com a gente', catsTitle:'Categorias',
    payments:'PIX, VISA, MASTER, ELO', legal:'', installments:3, installmentsMin:0,
    cookieShow:true, cookieText:'Este site usa cookies para garantir a melhor experiência.',
    checkoutNote:'Você confirma o pedido pelo WhatsApp', orderDoneText:'Toque no botão abaixo para confirmar pelo WhatsApp e combinar o pagamento.',
    paymentOptions:'PIX, Cartão de crédito, Cartão de débito, Dinheiro', deliveryShow:true, pickupShow:true,
    soldOut:'ESGOTADO', newBadge:'Novidade', addBtn:'+ Adicionar'
  };
  window.contentOf = S => ({...CONTENT_DEFAULTS, ...((S&&S.content)||{})});

  /* ---------- utilidades compartilhadas ---------- */
  window.brl = v => (+v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
  window.esc = s => String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  // ilustração do produto quando não há foto
  window.prodArt = function(p, bg){
    if(p.image) return `<img src="${p.image}" alt="${esc(p.name)}" loading="lazy" style="width:100%;height:100%;object-fit:cover">`;
    const [a,b]=(p.colors&&p.colors.length?p.colors:['#cfd8dc','#ffffff']).concat(['#ffffff']);
    const t=p.art||guessArt(p.name);
    const S={
      pote:`<g transform="translate(90 120)"><rect x="0" y="40" width="220" height="170" rx="26" fill="${b}" stroke="#0000001a" stroke-width="2"/><rect x="0" y="40" width="220" height="170" rx="26" fill="${a}" opacity=".18"/><rect x="-10" y="20" width="240" height="42" rx="16" fill="${a}"/><rect x="60" y="8" width="100" height="18" rx="9" fill="${a}"/><rect x="18" y="120" width="184" height="4" rx="2" fill="${a}" opacity=".35"/></g>`,
      marmita:`<g transform="translate(70 140)"><rect x="0" y="30" width="260" height="140" rx="22" fill="#ffffff" stroke="#0000001a" stroke-width="2"/><path d="M110 40v120M190 40v120" stroke="#0000001a" stroke-width="3"/><rect x="-8" y="10" width="276" height="40" rx="16" fill="${a}"/><rect x="20" y="70" width="80" height="60" rx="12" fill="${b}" opacity=".9"/></g>`,
      garrafa:`<g transform="translate(150 50)"><rect x="25" y="0" width="50" height="34" rx="8" fill="${a}"/><path d="M15 34h70c10 0 18 8 18 18v220c0 14-11 25-25 25H22c-14 0-25-11-25-25V52c0-10 8-18 18-18Z" fill="${a}" opacity=".88"/><rect x="5" y="120" width="90" height="70" rx="8" fill="${b}" opacity=".6"/></g>`,
      copo:`<g transform="translate(130 40)"><rect x="96" y="-10" width="10" height="70" rx="5" fill="#ffffff" stroke="#0000002a"/><rect x="0" y="40" width="140" height="34" rx="12" fill="${a}"/><path d="M6 74h128l-14 230c-1 10-9 16-18 16H38c-9 0-17-6-18-16Z" fill="${a}" opacity=".9"/><path d="M20 110h100" stroke="${b}" stroke-width="6" opacity=".5"/><path d="M-26 140c-20 0-20 70 0 70h22" fill="none" stroke="${a}" stroke-width="14" stroke-linecap="round"/></g>`,
      tigela:`<g transform="translate(60 150)"><ellipse cx="140" cy="30" rx="140" ry="30" fill="${a}"/><path d="M0 30c0 90 60 140 140 140s140-50 140-140" fill="${a}" opacity=".92"/><ellipse cx="140" cy="30" rx="124" ry="22" fill="${b}" opacity=".55"/><g fill="${b}" opacity=".85"><circle cx="80" cy="90" r="7"/><circle cx="140" cy="110" r="7"/><circle cx="200" cy="90" r="7"/></g></g>`,
      jarra:`<g transform="translate(120 60)"><path d="M20 20h120l-10 40v200c0 14-11 25-25 25H45c-14 0-25-11-25-25Z" fill="${a}" opacity=".9"/><rect x="10" y="0" width="140" height="30" rx="10" fill="${b}"/><path d="M130 90c50 0 50 110 0 110" fill="none" stroke="${a}" stroke-width="16"/><g fill="${b}" opacity=".85"><circle cx="60" cy="140" r="8"/><circle cx="95" cy="180" r="8"/><circle cx="60" cy="220" r="8"/></g></g>`,
      travessa:`<g transform="translate(50 150)"><rect x="0" y="20" width="300" height="120" rx="26" fill="${a}" stroke="#0000001a" stroke-width="2"/><rect x="18" y="34" width="264" height="92" rx="18" fill="#ffffff" opacity=".55"/><rect x="-14" y="0" width="328" height="34" rx="14" fill="${b}" opacity=".85"/></g>`
    };
    return `<svg viewBox="0 0 400 400" aria-hidden="true" style="width:100%;height:100%"><rect width="400" height="400" fill="${bg||'#f4f5f7'}"/><ellipse cx="200" cy="350" rx="130" ry="12" fill="#000" opacity=".05"/>${S[t]||S.pote}</svg>`;
  };
  function guessArt(n){ n=(n||'').toLowerCase();
    if(/garraf/.test(n))return'garrafa'; if(/copo/.test(n))return'copo'; if(/tigel|bowl/.test(n))return'tigela';
    if(/jarr/.test(n))return'jarra'; if(/travess|forma|assadeira/.test(n))return'travessa'; if(/marmit|lancheir|divis/.test(n))return'marmita'; return 'pote'; }

  // reduz a foto antes de salvar (deixa o site leve)
  window.resizeImage = (file, max=900, q=.82) => new Promise((res,rej)=>{
    const fr=new FileReader(); fr.onerror=rej;
    fr.onload=()=>{ const im=new Image(); im.onerror=rej; im.onload=()=>{
      const s=Math.min(1,max/Math.max(im.width,im.height)); const c=document.createElement('canvas');
      c.width=Math.round(im.width*s); c.height=Math.round(im.height*s);
      const x=c.getContext('2d'); x.fillStyle='#fff'; x.fillRect(0,0,c.width,c.height); x.drawImage(im,0,0,c.width,c.height);
      res(c.toDataURL('image/jpeg',q)); }; im.src=fr.result; };
    fr.readAsDataURL(file);
  });
})();
