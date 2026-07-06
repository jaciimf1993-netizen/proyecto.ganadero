import { useState, useMemo, useEffect, useRef } from "react";

// ─── DESIGN ──────────────────────────────────────────────────────────────────
const C = {
  bg:"#0f1a12",bg2:"#162019",bg3:"#111d13",
  border:"#1e3020",border2:"#2d4a32",
  green:"#7ec87f",blue:"#5cb8d4",purple:"#b47ec8",
  yellow:"#e8c84a",orange:"#e8a84a",red:"#e85a4a",
  teal:"#4ac8b4",pink:"#e87ec8",
  text:"#e8f0e9",textMid:"#c8dcc9",textLow:"#5a7a5c",textMuted:"#1e3020",
};
const S = {
  app:    { fontFamily:"'Inter',system-ui,sans-serif", background:C.bg, minHeight:"100vh", color:C.text },
  header: { background:"linear-gradient(135deg,#1a2e1d,#243529)", borderBottom:`1px solid ${C.border}`, padding:"14px 20px", display:"flex", alignItems:"center", gap:14 },
  headerTitle:{ fontSize:18, fontWeight:700, color:C.green, letterSpacing:"-0.5px" },
  headerSub:  { fontSize:11, color:C.textLow, marginTop:2 },
  nav:    { display:"flex", gap:3, padding:"8px 20px", background:C.bg3, borderBottom:`1px solid ${C.border}`, overflowX:"auto", flexWrap:"nowrap" },
  navBtn: a=>({ padding:"6px 12px", borderRadius:6, border:"none", cursor:"pointer", fontSize:11, fontWeight:600, transition:"all .15s", whiteSpace:"nowrap",
    background:a?"#2d5c32":"transparent", color:a?C.green:C.textLow, borderBottom:a?`2px solid ${C.green}`:"2px solid transparent" }),
  main:   { padding:20, maxWidth:1400, margin:"0 auto" },
  card:   { background:C.bg2, border:`1px solid ${C.border}`, borderRadius:12, padding:18, marginBottom:14 },
  kpiGrid:{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(145px,1fr))", gap:10, marginBottom:18 },
  kpi:    c=>({ background:C.bg2, border:`1px solid ${c}33`, borderRadius:10, padding:"12px 14px", borderLeft:`3px solid ${c}` }),
  kpiVal: c=>({ fontSize:24, fontWeight:800, color:c, lineHeight:1 }),
  kpiLabel:{ fontSize:10, color:C.textLow, marginTop:3, textTransform:"uppercase", letterSpacing:"0.5px" },
  kpiSub: { fontSize:11, color:"#7a9a7c", marginTop:2 },
  sTitle: { fontSize:14, fontWeight:700, color:C.green, marginBottom:12, display:"flex", alignItems:"center", gap:7 },
  table:  { width:"100%", borderCollapse:"collapse", fontSize:12 },
  th:     { textAlign:"left", padding:"7px 9px", borderBottom:`1px solid ${C.border}`, color:C.textLow, fontSize:10, textTransform:"uppercase", letterSpacing:"0.5px" },
  td:     { padding:"7px 9px", borderBottom:`1px solid ${C.bg3}`, color:C.textMid },
  badge:  c=>({ display:"inline-block", padding:"2px 7px", borderRadius:4, fontSize:10, fontWeight:600, background:`${c}22`, color:c }),
  input:  { background:C.bg, border:`1px solid ${C.border2}`, borderRadius:6, padding:"5px 9px", color:C.text, fontSize:12, width:"100%", outline:"none" },
  select: { background:C.bg, border:`1px solid ${C.border2}`, borderRadius:6, padding:"5px 9px", color:C.text, fontSize:12 },
  btn:    v=>({ padding:"7px 14px", borderRadius:6, border:"none", cursor:"pointer", fontSize:12, fontWeight:600,
    background:v==="primary"?"#2d5c32":v==="danger"?"#5c2d2d":v==="warn"?"#5c4a1e":"#1e3020",
    color:v==="primary"?C.green:v==="danger"?C.red:v==="warn"?C.yellow:C.textLow }),
  modal:  { position:"fixed", inset:0, background:"#000b", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200 },
  mbox:   { background:C.bg2, border:`1px solid ${C.border2}`, borderRadius:12, padding:22, width:520, maxWidth:"95vw", maxHeight:"90vh", overflowY:"auto" },
  label:  { fontSize:11, color:C.textLow, marginBottom:3, display:"block" },
  frow:   { marginBottom:12 },
  grid2:  { display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 },
  filterBar:{ display:"flex", gap:8, marginBottom:14, flexWrap:"wrap", alignItems:"center" },
  chip:   a=>({ padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:600, cursor:"pointer", border:"1px solid",
    background:a?"#2d5c32":"transparent", color:a?C.green:C.textLow, borderColor:a?C.green:C.border2 }),
};

// ─── KMZ POLYGON DATA ────────────────────────────────────────────────────────
const KMZ_POTREROS = [
  {
    id:1, nome:"Frente", hectareas:92.44, cor:"#7ec87f", tipo:"pastoreo",
    coords:[[-55.59993535246832,-30.84711052590648],[-55.60415779858693,-30.84893522755042],[-55.60422751351662,-30.84909564610304],[-55.6033866987956,-30.85278227674311],[-55.60296679683688,-30.85493882842182],[-55.60256705555502,-30.85522988625027],[-55.60160899454032,-30.85590888548698],[-55.60069637791624,-30.85801831409096],[-55.59353930782148,-30.85548709717132],[-55.59303956064067,-30.85608537266263],[-55.5927074541827,-30.85647585517062],[-55.59013515163102,-30.85497133103832],[-55.58899264388068,-30.85435233403164],[-55.5917321533593,-30.85295075605043],[-55.59397111029664,-30.85184927565697],[-55.59578043429613,-30.85094060793357],[-55.59730173177617,-30.84812960811412],[-55.59808360936309,-30.84788849857926],[-55.59804852578675,-30.84781841246667],[-55.59993535246832,-30.84711052590648]]
  },
  {
    id:2, nome:"Abajo", hectareas:78.07, cor:"#5cb8d4", tipo:"pastoreo",
    coords:[[-55.58900247974016,-30.85434606003207],[-55.58772164393542,-30.85372295728411],[-55.58586004975984,-30.85325966119266],[-55.58873977806988,-30.8469311766345],[-55.59082019893192,-30.84272235804186],[-55.59083740221705,-30.84273539512276],[-55.59290842186851,-30.84389415431948],[-55.59449817235345,-30.84495742121266],[-55.59568529902561,-30.8457543969311],[-55.59709289460827,-30.84713201296852],[-55.59731033038403,-30.84753849788429],[-55.59704718278977,-30.84762113320826],[-55.59731030213201,-30.84811711026319],[-55.59579566756234,-30.85097167342451],[-55.58900247974016,-30.85434606003207]]
  },
  {
    id:3, nome:"Fondo", hectareas:25.10, cor:"#b47ec8", tipo:"pastoreo",
    coords:[[-55.59057792869482,-30.85897414745338],[-55.58826337971018,-30.8579602037379],[-55.58466013478313,-30.85577738299964],[-55.58584542600561,-30.85325521265272],[-55.58770945153547,-30.85372271884205],[-55.58899085133342,-30.85435046347174],[-55.59268675955597,-30.85648677946581],[-55.59057792869482,-30.85897414745338]]
  },
  {
    id:4, nome:"Nueces", hectareas:3.43, cor:"#e8c84a", tipo:"pastoreo",
    coords:[[-55.59289497240251,-30.8438857062016],[-55.59289983940688,-30.84387916399598],[-55.59082906146804,-30.8427322962205],[-55.59125530694172,-30.84160792242524],[-55.59376129632723,-30.84287265661067],[-55.59289497240251,-30.8438857062016]]
  },
  {
    id:5, nome:"Potrero 3", hectareas:2.30, cor:"#e8a84a", tipo:"pastoreo",
    coords:[[-55.59450650865681,-30.84494110921651],[-55.59289867159393,-30.84388168612505],[-55.59376871017771,-30.84286213061139],[-55.59511116587959,-30.84426260255925],[-55.59450650865681,-30.84494110921651]]
  },
  {
    id:6, nome:"Potrero 2", hectareas:1.85, cor:"#4ac8b4", tipo:"pastoreo",
    coords:[[-55.59676698788544,-30.8450261232889],[-55.5966123762677,-30.84524313128409],[-55.59568580131473,-30.84575092762873],[-55.59450548316362,-30.84495354796386],[-55.59511451141528,-30.84424496260087],[-55.59676698788544,-30.8450261232889]]
  },
  {
    id:7, nome:"Potrero (corral)", hectareas:3.69, cor:"#e87ec8", tipo:"infraestructura",
    coords:[[-55.59819435906665,-30.84682796637134],[-55.59807711277965,-30.84695504410337],[-55.59799555477276,-30.84692587393051],[-55.59805262458955,-30.84665547784185],[-55.59762742194016,-30.84661271967528],[-55.59763621631641,-30.84694523820452],[-55.59721912577698,-30.84713706733206],[-55.59709488246714,-30.84712320678726],[-55.59643113060395,-30.84648951173978],[-55.59568933261421,-30.84575100578321],[-55.59661716044561,-30.84523610802347],[-55.59676609672731,-30.84502399252383],[-55.59872009267111,-30.84607928716127],[-55.59879964690319,-30.84616054515676],[-55.59860287675672,-30.84662687734091],[-55.59833422633524,-30.84689548443437],[-55.59819435906665,-30.84682796637134]]
  },
  {
    id:8, nome:"Cuadro", hectareas:0.48, cor:"#7ec87f", tipo:"infraestructura",
    coords:[[-55.59807520420727,-30.84787749376526],[-55.59730886580639,-30.84812049106446],[-55.59706378346873,-30.84762388000099],[-55.59788302409287,-30.84736394532231],[-55.59807520420727,-30.84787749376526]]
  },
  {
    id:9, nome:"Dormidero", hectareas:1.02, cor:"#5cb8d4", tipo:"infraestructura",
    coords:[[-55.59995067991518,-30.84709702002292],[-55.59824633112417,-30.84774461989349],[-55.59818324143903,-30.84755692551414],[-55.59809925378572,-30.84730106734889],[-55.59818141376081,-30.84724002505244],[-55.59828966746734,-30.84709450346096],[-55.59823870679871,-30.84705029198217],[-55.5988165260827,-30.84667870063543],[-55.59995067991518,-30.84709702002292]]
  },
  {
    id:10, nome:"Huerta", hectareas:0.21, cor:"#b47ec8", tipo:"infraestructura",
    coords:[[-55.59807125242089,-30.8460176700923],[-55.59839223392117,-30.84625154068206],[-55.59809888882273,-30.84660588981189],[-55.59772926185205,-30.84638021068285],[-55.59807125242089,-30.8460176700923]]
  },
  {
    id:11, nome:"Monte Nativo", hectareas:18.0, cor:"#2d5c32", tipo:"monte",
    coords:[[-55.60427,-30.8489],[-55.60282,-30.8516],[-55.60163,-30.8559],[-55.60069,-30.8580],[-55.59355,-30.8555],[-55.59058,-30.8590],[-55.59060,-30.8515],[-55.59182,-30.8530],[-55.59400,-30.8430],[-55.59800,-30.8461],[-55.60427,-30.8489]]
  },
  {
    id:12, nome:"Padrón 12163", hectareas:417.0, cor:"#4a6e4c", tipo:"perimetral",
    coords:[[-55.60296373498566,-30.85494493918947],[-55.60162898380491,-30.85590536595303],[-55.60069310952484,-30.85800981584552],[-55.59354863657721,-30.85549845977595],[-55.5905799048735,-30.85898018059769],[-55.58860829985521,-30.8581161185609],[-55.58465542885248,-30.85578213606854],[-55.59126338409569,-30.84162060357384],[-55.59400825190944,-30.84301515482824],[-55.59511365156006,-30.84424338843065],[-55.59605475079355,-30.84462830785256],[-55.59880284585336,-30.84614103366154],[-55.59874969287402,-30.84657814885759],[-55.60427963536249,-30.84894502505247],[-55.60296373498566,-30.85494493918947]]
  },
];

// ─── ANIMAL DATA ─────────────────────────────────────────────────────────────
const ANIMALS0 = [
  {id:1,  prop:"Jaciara",numero:"39",   caravana:"2642",brinco:"64772642",sexo:"H",edadMeses:5,  raza:"XX",status:"Vivo",cat:"Recría"},
  {id:2,  prop:"Jaciara",numero:"40",   caravana:"2644",brinco:"64772644",sexo:"H",edadMeses:5,  raza:"XX",status:"Vivo",cat:"Recría"},
  {id:3,  prop:"Jaciara",numero:"41",   caravana:"2645",brinco:"64772645",sexo:"H",edadMeses:5,  raza:"XX",status:"Vivo",cat:"Recría"},
  {id:4,  prop:"Jaciara",numero:"42",   caravana:"2646",brinco:"64772646",sexo:"H",edadMeses:5,  raza:"XX",status:"Vivo",cat:"Recría"},
  {id:5,  prop:"Jaciara",numero:"43",   caravana:"2647",brinco:"64772647",sexo:"H",edadMeses:5,  raza:"XX",status:"Vivo",cat:"Recría"},
  {id:6,  prop:"Claudio",numero:"",     caravana:"5853",brinco:"61635853",sexo:"H",edadMeses:5,  raza:"XX",status:"Vivo",cat:"Recría"},
  {id:7,  prop:"Claudio",numero:"",     caravana:"5855",brinco:"61635855",sexo:"H",edadMeses:5,  raza:"XX",status:"Vivo",cat:"Recría"},
  {id:8,  prop:"Claudio",numero:"",     caravana:"5856",brinco:"61635856",sexo:"H",edadMeses:5,  raza:"XX",status:"Vivo",cat:"Recría"},
  {id:9,  prop:"Claudio",numero:"",     caravana:"5857",brinco:"61635857",sexo:"H",edadMeses:5,  raza:"XX",status:"Vivo",cat:"Recría"},
  {id:10, prop:"Claudio",numero:"",     caravana:"5858",brinco:"61635858",sexo:"H",edadMeses:5,  raza:"XX",status:"Vivo",cat:"Recría"},
  {id:11, prop:"Jaciara",numero:"37",   caravana:"8954",brinco:"58758954",sexo:"H",edadMeses:6,  raza:"XX",status:"Vivo",cat:"Recría"},
  {id:12, prop:"Jaciara",numero:"38",   caravana:"8959",brinco:"58758959",sexo:"H",edadMeses:6,  raza:"AA",status:"Vivo",cat:"Recría"},
  {id:13, prop:"Claudio",numero:"",     caravana:"5822",brinco:"61635822",sexo:"H",edadMeses:17, raza:"XX",status:"Vivo",cat:"Recría"},
  {id:14, prop:"Claudio",numero:"",     caravana:"5823",brinco:"61635823",sexo:"H",edadMeses:17, raza:"XX",status:"Vivo",cat:"Recría"},
  {id:15, prop:"Claudio",numero:"",     caravana:"5824",brinco:"61635824",sexo:"H",edadMeses:17, raza:"XX",status:"Vivo",cat:"Recría"},
  {id:16, prop:"Claudio",numero:"",     caravana:"5826",brinco:"61635826",sexo:"H",edadMeses:17, raza:"XX",status:"Vivo",cat:"Recría"},
  {id:17, prop:"Claudio",numero:"",     caravana:"5829",brinco:"61635829",sexo:"H",edadMeses:17, raza:"XX",status:"Vivo",cat:"Recría"},
  {id:18, prop:"Claudio",numero:"",     caravana:"5831",brinco:"61635831",sexo:"H",edadMeses:17, raza:"XX",status:"Vivo",cat:"Recría"},
  {id:19, prop:"Claudio",numero:"",     caravana:"7039",brinco:"64367039",sexo:"H",edadMeses:17, raza:"XX",status:"Vivo",cat:"Recría"},
  {id:20, prop:"Jaciara",numero:"32",   caravana:"8942",brinco:"58758942",sexo:"H",edadMeses:18, raza:"XX",status:"Vivo",cat:"Recría"},
  {id:21, prop:"Jaciara",numero:"33",   caravana:"8946",brinco:"58758946",sexo:"H",edadMeses:18, raza:"XX",status:"Vivo",cat:"Recría"},
  {id:22, prop:"Jaciara",numero:"34",   caravana:"8947",brinco:"58758947",sexo:"H",edadMeses:18, raza:"XX",status:"Vivo",cat:"Recría"},
  {id:23, prop:"Jaciara",numero:"35",   caravana:"8950",brinco:"58758950",sexo:"H",edadMeses:18, raza:"XX",status:"Vivo",cat:"Recría"},
  {id:24, prop:"Jaciara",numero:"36",   caravana:"8951",brinco:"58758951",sexo:"H",edadMeses:18, raza:"XX",status:"Vivo",cat:"Recría"},
  {id:25, prop:"Jaciara",numero:"31",   caravana:"8488",brinco:"51198488",sexo:"H",edadMeses:29, raza:"XX",status:"Vivo",cat:"Matriz",prenhez:"Preñada"},
  {id:26, prop:"Claudio",numero:"",     caravana:"1476",brinco:"58481476",sexo:"H",edadMeses:29, raza:"XX",status:"Vivo",cat:"Matriz",prenhez:"Preñada"},
  {id:27, prop:"Claudio",numero:"",     caravana:"1477",brinco:"58481477",sexo:"H",edadMeses:29, raza:"XX",status:"Vivo",cat:"Matriz",prenhez:"Preñada"},
  {id:28, prop:"Claudio",numero:"",     caravana:"1479",brinco:"58481479",sexo:"H",edadMeses:29, raza:"XX",status:"Vivo",cat:"Matriz",prenhez:"Preñada"},
  {id:29, prop:"Claudio",numero:"",     caravana:"7614",brinco:"55747614",sexo:"H",edadMeses:29, raza:"BD",status:"Vivo",cat:"Matriz",prenhez:"Preñada"},
  {id:30, prop:"Claudio",numero:"",     caravana:"7615",brinco:"55747615",sexo:"H",edadMeses:29, raza:"AA",status:"Vivo",cat:"Matriz",prenhez:"Preñada"},
  {id:31, prop:"Jaciara",numero:"30",   caravana:"8481",brinco:"51198481",sexo:"H",edadMeses:41, raza:"XX",status:"Vivo",cat:"Matriz",prenhez:"Vacía"},
  {id:32, prop:"Jaciara",numero:"28",   caravana:"8486",brinco:"51198486",sexo:"H",edadMeses:44, raza:"XX",status:"Vivo",cat:"Matriz",prenhez:"Vacía"},
  {id:33, prop:"Jaciara",numero:"29",   caravana:"8487",brinco:"51198487",sexo:"H",edadMeses:44, raza:"XX",status:"Vivo",cat:"Matriz",prenhez:"Preñada"},
  {id:34, prop:"Jaciara",numero:"27",   caravana:"8478",brinco:"51198478",sexo:"H",edadMeses:52, raza:"XX",status:"Vivo",cat:"Matriz",prenhez:"Preñada"},
  {id:35, prop:"Jaciara",numero:"23",   caravana:"8675",brinco:"43088675",sexo:"H",edadMeses:53, raza:"XX",status:"Vivo",cat:"Matriz",prenhez:"Preñada"},
  {id:36, prop:"Jaciara",numero:"26",   caravana:"8475",brinco:"51198475",sexo:"H",edadMeses:53, raza:"XX",status:"Vivo",cat:"Matriz",prenhez:"Preñada"},
  {id:37, prop:"Jaciara",numero:"24",   caravana:"8677",brinco:"43088677",sexo:"H",edadMeses:54, raza:"XX",status:"Vivo",cat:"Matriz",prenhez:"Preñada"},
  {id:38, prop:"Jaciara",numero:"25",   caravana:"8678",brinco:"43088678",sexo:"H",edadMeses:54, raza:"XX",status:"Vivo",cat:"Matriz",prenhez:"Preñada"},
  {id:39, prop:"Claudio",numero:"",     caravana:"0186",brinco:"49280186",sexo:"H",edadMeses:54, raza:"XX",status:"Vivo",cat:"Matriz",prenhez:"Vacía"},
  {id:40, prop:"Claudio",numero:"",     caravana:"0194",brinco:"49280194",sexo:"H",edadMeses:54, raza:"XX",status:"Vivo",cat:"Matriz",prenhez:"Preñada"},
  {id:41, prop:"Claudio",numero:"",     caravana:"4504",brinco:"51504504",sexo:"H",edadMeses:54, raza:"XX",status:"Vivo",cat:"Matriz",prenhez:"Preñada"},
  {id:42, prop:"Claudio",numero:"",     caravana:"9901",brinco:"45249901",sexo:"H",edadMeses:55, raza:"XX",status:"Vivo",cat:"Matriz",prenhez:"Preñada"},
  {id:43, prop:"Claudio",numero:"",     caravana:"9902",brinco:"45249902",sexo:"H",edadMeses:55, raza:"XX",status:"Vivo",cat:"Matriz",prenhez:"Preñada"},
  {id:44, prop:"Jaciara",numero:"18",   caravana:"8666",brinco:"43088666",sexo:"H",edadMeses:64, raza:"XX",status:"Vivo",cat:"Matriz",prenhez:"Preñada"},
  {id:45, prop:"Jaciara",numero:"19",   caravana:"8668",brinco:"43088668",sexo:"H",edadMeses:64, raza:"XX",status:"Vivo",cat:"Matriz",prenhez:"Preñada"},
  {id:46, prop:"Jaciara",numero:"20",   caravana:"8669",brinco:"43088669",sexo:"H",edadMeses:64, raza:"XX",status:"Vivo",cat:"Matriz",prenhez:"Preñada"},
  {id:47, prop:"Jaciara",numero:"22",   caravana:"8673",brinco:"43088673",sexo:"H",edadMeses:64, raza:"XX",status:"Vivo",cat:"Matriz",prenhez:"Preñada"}
];

// ─── COMPONENTE FORM MOVIMENTO (AQUI ESTAVA O ERRO) ──────────────────────────
function FormMovimento({ compras }) {
  const fmt = (val) => (val ? val.toLocaleString("pt-BR") : "0");
  const fmtR = (val) => (val ? val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "R$ 0,00");

  return (
    <div style={S.card}>
      <h3 style={S.sTitle}>Movimentações de Compra</h3>
      <div style={{ overflowX: "auto" }}>
        <table style={S.table}>
          <thead>
            <tr>
              <th style={S.th}>Data</th>
              <th style={S.th}>Proprietário</th>
              <th style={S.th}>Caravana</th>
              <th style={S.th}>Categoria</th>
              <th style={S.th}>Peso</th>
              <th style={S.th}>Valor Total</th>
              <th style={S.th}>R$ / Kg</th>
              <th style={S.th}>Vendedor</th>
            </tr>
          </thead>
          <tbody>
            {compras.map((c) => (
              <tr key={c.id}>
                <td style={S.td}>{c.data}</td>
                <td style={S.td}>{c.prop || "—"}</td>
                <td style={{ ...S.td, fontFamily: "monospace", color: C.green }}>{c.caravana || "—"}</td>
                <td style={S.td}><span style={S.badge(C.orange)}>{c.categoria}</span></td>
                <td style={S.td}>{fmt(c.kg)} kg</td>
                <td style={{ ...S.td, color: C.red, fontWeight: 600 }}>{fmtR(c.valorTotal)}</td>
                <td style={{ ...S.td, color: C.orange }}>{c.kg > 0 ? fmtR(c.valorTotal / c.kg) : "—"}</td>
                <td style={S.td}>{c.vendedor || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── COMPONENTE PRINCIPAL APP ────────────────────────────────────────────────
function App() {
  const [tab, setTab] = useState("dashboard");
  const [animals, setAnimals] = useState(ANIMALS0);
  const [compras, setCompras] = useState([]);

  const TABS = [
    { id: "dashboard", label: "Dashboard" },
    { id: "movimentos", label: "Movimentos" }
  ];

  return (
    <div style={S.app}>
      <div style={S.header}>
        <div>
          <div style={S.headerTitle}>🐄 Rodeo Rodeio</div>
          <div style={S.headerSub}>Gestão Ganadera · Padrón 12163</div>
        </div>
      </div>
      <div style={S.nav}>
        {TABS.map((t) => (
          <button key={t.id} style={S.navBtn(tab === t.id)} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>
      <div style={S.main}>
        {tab === "dashboard" && (
          <div style={S.card}>
            <h3 style={S.sTitle}>Painel Geral</h3>
            <div style={S.kpiGrid}>
              <div style={S.kpi(C.green)}>
                <div style={S.kpiVal(C.green)}>{animals.length}</div>
                <div style={S.kpiLabel}>Total Animais</div>
              </div>
            </div>
          </div>
        )}
        {tab === "movimentos" && <FormMovimento compras={compras} />}
      </div>
    </div>
  );
}

export default App;
