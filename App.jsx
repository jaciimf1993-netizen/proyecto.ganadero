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
// Coordinates extracted from uploaded KML/KMZ files
// Format: [lon, lat] pairs as in KML
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
    // Approximate bounding of the scattered monte nativo polygons
    coords:[[-55.60427,-30.8489],[-55.60282,-30.8516],[-55.60163,-30.8559],[-55.60069,-30.8580],[-55.59355,-30.8555],[-55.59058,-30.8590],[-55.59060,-30.8515],[-55.59182,-30.8530],[-55.59400,-30.8430],[-55.59880,-30.8461],[-55.60427,-30.8489]]
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
  {id:47, prop:"Jaciara",numero:"22",   caravana:"8673",brinco:"43088673",sexo:"H",edadMeses:64, raza:"XX",status:"Vivo",cat:"Matriz",prenhez:"Preñada"},
  {id:48, prop:"Jaciara",numero:"21-52",caravana:"8671",brinco:"43088671",sexo:"H",edadMeses:64, raza:"XX",status:"Vivo",cat:"Matriz",prenhez:"Preñada"},
  {id:49, prop:"Claudio",numero:"",     caravana:"2847",brinco:"47532847",sexo:"H",edadMeses:67, raza:"CC",status:"Vivo",cat:"Matriz",prenhez:"Preñada"},
  {id:50, prop:"Jaciara",numero:"13",   caravana:"9213",brinco:"43619213",sexo:"H",edadMeses:77, raza:"XX",status:"Vivo",cat:"Matriz",prenhez:"Preñada"},
  {id:51, prop:"Jaciara",numero:"14",   caravana:"9218",brinco:"43619218",sexo:"H",edadMeses:77, raza:"XX",status:"Vivo",cat:"Matriz",prenhez:"Vacía"},
  {id:52, prop:"Jaciara",numero:"15",   caravana:"5542",brinco:"45005542",sexo:"H",edadMeses:77, raza:"XX",status:"Vivo",cat:"Matriz",prenhez:"Preñada"},
  {id:53, prop:"Jaciara",numero:"16",   caravana:"2650",brinco:"64772650",sexo:"H",edadMeses:77, raza:"XX",status:"Vivo",cat:"Matriz",prenhez:"Vacía"},
  {id:54, prop:"Jaciara",numero:"17",   caravana:"5550",brinco:"45005550",sexo:"H",edadMeses:77, raza:"XX",status:"Vivo",cat:"Matriz",prenhez:"Preñada"},
  {id:55, prop:"Agustin",numero:"10",   caravana:"7933",brinco:"39997933",sexo:"H",edadMeses:91, raza:"XX",status:"Vivo",cat:"Matriz",prenhez:"Vacía"},
  {id:56, prop:"Claudio",numero:"",     caravana:"3794",brinco:"39433794",sexo:"H",edadMeses:91, raza:"XX",status:"Vivo",cat:"Matriz",prenhez:"Preñada"},
  {id:57, prop:"Jaciara",numero:"11",   caravana:"3782",brinco:"39433782",sexo:"H",edadMeses:92, raza:"XX",status:"Vivo",cat:"Matriz",prenhez:"Preñada"},
  {id:58, prop:"Agustin",numero:"12",   caravana:"3790",brinco:"39433790",sexo:"H",edadMeses:92, raza:"XX",status:"Vivo",cat:"Matriz",prenhez:"Preñada"},
  {id:59, prop:"Claudio",numero:"",     caravana:"3784",brinco:"39433784",sexo:"H",edadMeses:92, raza:"XX",status:"Vivo",cat:"Matriz",prenhez:"Preñada"},
  {id:60, prop:"Jaciara",numero:"9",    caravana:"3189",brinco:"32823189",sexo:"H",edadMeses:101,raza:"CC",status:"Vivo",cat:"Matriz",prenhez:"Preñada"},
  {id:61, prop:"Claudio",numero:"",     caravana:"3181",brinco:"32823181",sexo:"H",edadMeses:102,raza:"CC",status:"Vivo",cat:"Matriz",prenhez:"Preñada"},
  {id:62, prop:"Jaciara",numero:"8",    caravana:"6545",brinco:"32666545",sexo:"H",edadMeses:104,raza:"CC",status:"Vivo",cat:"Matriz",prenhez:"Preñada"},
  {id:63, prop:"Jaciara",numero:"7",    caravana:"6541",brinco:"32666541",sexo:"H",edadMeses:115,raza:"CC",status:"Vivo",cat:"Matriz",prenhez:"Preñada"},
  {id:64, prop:"Claudio",numero:"",     caravana:"7038",brinco:"64367038",sexo:"H",edadMeses:115,raza:"XX",status:"Vivo",cat:"Matriz",prenhez:"Vacía"},
  {id:65, prop:"Jaciara",numero:"5",    caravana:"6482",brinco:"30036482",sexo:"H",edadMeses:126,raza:"CC",status:"Vivo",cat:"Matriz",prenhez:"Preñada"},
  {id:66, prop:"Jaciara",numero:"6",    caravana:"6487",brinco:"30036487",sexo:"H",edadMeses:126,raza:"CC",status:"Vivo",cat:"Matriz",prenhez:"Preñada"},
  {id:67, prop:"Agustin",numero:"4",    caravana:"6467",brinco:"30036467",sexo:"H",edadMeses:127,raza:"CC",status:"Vivo",cat:"Matriz",prenhez:"Preñada"},
  {id:68, prop:"Claudio",numero:"",     caravana:"2940",brinco:"27422940",sexo:"H",edadMeses:139,raza:"CC",status:"Vivo",cat:"Matriz",prenhez:"Preñada"},
  {id:69, prop:"Jaciara",numero:"3",    caravana:"2950",brinco:"27422950",sexo:"H",edadMeses:140,raza:"CC",status:"Vivo",cat:"Matriz",prenhez:"Vacía"},
  {id:70, prop:"Claudio",numero:"",     caravana:"5850",brinco:"61635850",sexo:"H",edadMeses:140,raza:"CC",status:"Vivo",cat:"Matriz",prenhez:"Vacía"},
  {id:71, prop:"Jaciara",numero:"2",    caravana:"6730",brinco:"24436730",sexo:"H",edadMeses:150,raza:"CC",status:"Vivo",cat:"Matriz",prenhez:"Preñada"},
  {id:72, prop:"Claudio",numero:"",     caravana:"6709",brinco:"24436709",sexo:"H",edadMeses:150,raza:"CC",status:"Vivo",cat:"Matriz",prenhez:"Vacía"},
  {id:73, prop:"Jaciara",numero:"1",    caravana:"2648",brinco:"64772648",sexo:"H",edadMeses:160,raza:"CC",status:"Vivo",cat:"Matriz",prenhez:"Preñada"},
  {id:74, prop:"Jaciara",numero:"amarilla",caravana:"2651",brinco:"64772651",sexo:"M",edadMeses:null,raza:"AA",status:"Vivo",cat:"Toro"},
  {id:75, prop:"Claudio",numero:"",     caravana:"8745",brinco:"47668745",sexo:"M",edadMeses:null,raza:"XX",status:"Vivo",cat:"Toro"},
  {id:76, prop:"Claudio",numero:"",     caravana:"5859",brinco:"61635859",sexo:"M",edadMeses:null,raza:"XX",status:"Vivo",cat:"Toro"},
  {id:77, prop:"Claudio",numero:"",     caravana:"7089",brinco:"",        sexo:"H",edadMeses:null,raza:"XX",status:"Vivo",cat:"Matriz",prenhez:"Vacía"},
];

const PARICION0 = [
  {id:1, lote:1,prop:"Agustin",numero:"12",caravana:"3790",periodo:"Jun-Jul 2026",dataParto:"",        sexoCria:"",     status:"Pendiente"},
  {id:2, lote:1,prop:"Jaciara",numero:"13",caravana:"9213",periodo:"Jun-Jul 2026",dataParto:"2026-06-20",sexoCria:"Macho",status:"Parida"},
  {id:3, lote:1,prop:"Jaciara",numero:"18",caravana:"8666",periodo:"Jun-Jul 2026",dataParto:"",        sexoCria:"",     status:"Pendiente"},
  {id:4, lote:1,prop:"Claudio",numero:"",  caravana:"3181",periodo:"Jun-Jul 2026",dataParto:"",        sexoCria:"",     status:"Pendiente"},
  {id:5, lote:2,prop:"Jaciara",numero:"1", caravana:"2648",periodo:"Jul-Ago 2026",dataParto:"",        sexoCria:"",     status:"Pendiente"},
  {id:6, lote:2,prop:"Jaciara",numero:"6", caravana:"6487",periodo:"Jul-Ago 2026",dataParto:"",        sexoCria:"",     status:"Pendiente"},
  {id:7, lote:2,prop:"Jaciara",numero:"8", caravana:"6545",periodo:"Jul-Ago 2026",dataParto:"",        sexoCria:"",     status:"Pendiente"},
  {id:8, lote:2,prop:"Jaciara",numero:"20",caravana:"8669",periodo:"Jul-Ago 2026",dataParto:"",        sexoCria:"",     status:"Pendiente"},
  {id:9, lote:2,prop:"Jaciara",numero:"22",caravana:"8673",periodo:"Jul-Ago 2026",dataParto:"",        sexoCria:"",     status:"Pendiente"},
  {id:10,lote:2,prop:"Jaciara",numero:"27",caravana:"8478",periodo:"Jul-Ago 2026",dataParto:"",        sexoCria:"",     status:"Pendiente"},
  {id:11,lote:2,prop:"Claudio",numero:"",  caravana:"9902",periodo:"Jul-Ago 2026",dataParto:"",        sexoCria:"",     status:"Pendiente"},
  {id:12,lote:3,prop:"Jaciara",numero:"15",caravana:"5542",periodo:"Set 2026",    dataParto:"",        sexoCria:"",     status:"Pendiente"},
  {id:13,lote:3,prop:"Jaciara",numero:"29",caravana:"8487",periodo:"Set 2026",    dataParto:"",        sexoCria:"",     status:"Pendiente"},
  {id:14,lote:3,prop:"Claudio",numero:"",  caravana:"0194",periodo:"Set 2026",    dataParto:"",        sexoCria:"",     status:"Pendiente"},
  {id:15,lote:3,prop:"Claudio",numero:"",  caravana:"4504",periodo:"Set 2026",    dataParto:"",        sexoCria:"",     status:"Pendiente"},
  {id:16,lote:4,prop:"Jaciara",numero:"5", caravana:"6482",periodo:"Out 2026",    dataParto:"",        sexoCria:"",     status:"Pendiente"},
  {id:17,lote:4,prop:"Jaciara",numero:"7", caravana:"6541",periodo:"Out 2026",    dataParto:"",        sexoCria:"",     status:"Pendiente"},
  {id:18,lote:4,prop:"Jaciara",numero:"24",caravana:"8677",periodo:"Out 2026",    dataParto:"",        sexoCria:"",     status:"Pendiente"},
  {id:19,lote:4,prop:"Claudio",numero:"",  caravana:"2940",periodo:"Out 2026",    dataParto:"",        sexoCria:"",     status:"Pendiente"},
  {id:20,lote:4,prop:"Claudio",numero:"",  caravana:"7615",periodo:"Out 2026",    dataParto:"",        sexoCria:"",     status:"Pendiente"},
  {id:21,lote:4,prop:"Claudio",numero:"",  caravana:"9901",periodo:"Out 2026",    dataParto:"",        sexoCria:"",     status:"Pendiente"},
  {id:22,lote:5,prop:"Jaciara",numero:"2", caravana:"6730",periodo:"Nov 2026",    dataParto:"",        sexoCria:"",     status:"Pendiente"},
  {id:23,lote:5,prop:"Jaciara",numero:"19",caravana:"8668",periodo:"Nov 2026",    dataParto:"",        sexoCria:"",     status:"Pendiente"},
  {id:24,lote:5,prop:"Jaciara",numero:"25",caravana:"8678",periodo:"Nov 2026",    dataParto:"",        sexoCria:"",     status:"Pendiente"},
  {id:25,lote:5,prop:"Claudio",numero:"",  caravana:"1476",periodo:"Nov 2026",    dataParto:"",        sexoCria:"",     status:"Pendiente"},
  {id:26,lote:5,prop:"Claudio",numero:"",  caravana:"1477",periodo:"Nov 2026",    dataParto:"",        sexoCria:"",     status:"Pendiente"},
  {id:27,lote:5,prop:"Claudio",numero:"",  caravana:"1479",periodo:"Nov 2026",    dataParto:"",        sexoCria:"",     status:"Pendiente"},
  {id:28,lote:5,prop:"Claudio",numero:"",  caravana:"2847",periodo:"Nov 2026",    dataParto:"",        sexoCria:"",     status:"Pendiente"},
  {id:29,lote:5,prop:"Claudio",numero:"",  caravana:"7614",periodo:"Nov 2026",    dataParto:"",        sexoCria:"",     status:"Pendiente"},
  {id:30,lote:6,prop:"Jaciara",numero:"9", caravana:"3189",periodo:"Dez 2026",    dataParto:"",        sexoCria:"",     status:"Pendiente"},
  {id:31,lote:6,prop:"Jaciara",numero:"23",caravana:"8675",periodo:"Dez 2026",    dataParto:"",        sexoCria:"",     status:"Pendiente"},
  {id:32,lote:6,prop:"Jaciara",numero:"26",caravana:"8475",periodo:"Dez 2026",    dataParto:"",        sexoCria:"",     status:"Pendiente"},
  {id:33,lote:7,prop:"Agustin",numero:"4", caravana:"6467",periodo:"Jan 2027",    dataParto:"",        sexoCria:"",     status:"Pendiente"},
  {id:34,lote:7,prop:"Jaciara",numero:"17",caravana:"5550",periodo:"Jan 2027",    dataParto:"",        sexoCria:"",     status:"Pendiente"},
  {id:35,lote:7,prop:"Jaciara",numero:"52",caravana:"8671",periodo:"Jan 2027",    dataParto:"",        sexoCria:"",     status:"Pendiente"},
  {id:36,lote:7,prop:"Claudio",numero:"",  caravana:"3784",periodo:"Jan 2027",    dataParto:"",        sexoCria:"",     status:"Pendiente"},
  {id:37,lote:7,prop:"Claudio",numero:"",  caravana:"3794",periodo:"Jan 2027",    dataParto:"",        sexoCria:"",     status:"Pendiente"},
  {id:38,lote:8,prop:"Jaciara",numero:"11",caravana:"3782",periodo:"Fev 2027",    dataParto:"",        sexoCria:"",     status:"Pendiente"},
];

// ─── EJERCICIO ───────────────────────────────────────────────────────────────
const EJERCICIO = { inicio:"2025-07-01", fin:"2026-06-30" };
const CATS_HACIENDA = ["Vaca","Vaquillona","Ternero/a","Toro","Ovino","Equino"];
const CATEGORIAS_CUSTO = ["Sanidade","Alimentação","Mão de obra","Arrendamento","Impostos","Combustível/Maquinaria","Outros"];
const ESPECIES = ["Bovino","Ovino","Equino"];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function calcUG(a){
  if(a.cat==="Toro")   return 1.35;
  if(a.cat==="Matriz") return 1.0;
  if(a.cat==="Recría"&&(a.edadMeses||0)>=12) return 0.7;
  return 0.4;
}
function fmt(n,d=0){if(n==null||isNaN(n))return "—";return n.toLocaleString("pt-BR",{minimumFractionDigits:d,maximumFractionDigits:d});}
function fmtR(n){if(n==null||isNaN(n))return "—";return "R$ "+n.toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2});}
function Badge({children,color}){ return <span style={S.badge(color)}>{children}</span>; }
function KPI({label,value,sub,color=C.green}){
  return <div style={S.kpi(color)}>
    <div style={S.kpiVal(color)}>{value}</div>
    <div style={S.kpiLabel}>{label}</div>
    {sub&&<div style={S.kpiSub}>{sub}</div>}
  </div>;
}
function ProgressBar({pct,color=C.green}){
  return <div style={{height:7,borderRadius:4,background:C.border,overflow:"hidden"}}>
    <div style={{height:"100%",width:`${Math.min(pct||0,100)}%`,background:color,borderRadius:4,transition:"width .4s"}}/>
  </div>;
}
function HRow({children,onClick}){
  const [h,setH]=useState(false);
  return <tr style={{background:h?C.border:"transparent",cursor:onClick?"pointer":"default"}}
    onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} onClick={onClick}>{children}</tr>;
}

// ─── LEAFLET MAP COMPONENT ────────────────────────────────────────────────────
function LeafletMap({ potreros, animalData, selected, onSelect }) {
  const mapRef = useRef(null);
  const instanceRef = useRef(null);
  const layersRef = useRef({});

  // Convert [lon,lat] KML coords to Leaflet [lat,lon]
  function toLatLon(coords){ return coords.map(([lon,lat])=>[lat,lon]); }

  function getStyle(pot) {
    const isSel = selected === pot.id;
    const anim = animalData.filter(a=>pot.animalIds&&pot.animalIds.includes(a.id)&&a.status==="Vivo");
    const ug = anim.reduce((s,a)=>s+calcUG(a),0);
    const ugha = pot.hectareas>0?ug/pot.hectareas:0;
    const f = pot.forraje||80;
    let fillColor = pot.cor;
    if(pot.tipo==="monte") fillColor = "#1a4a1a";
    else if(pot.tipo==="perimetral") fillColor = "transparent";
    else if(f<30) fillColor = C.red;
    else if(f<60) fillColor = C.orange;
    return {
      color: isSel ? "#ffffff" : pot.cor,
      weight: isSel ? 3 : pot.tipo==="perimetral"?2:1.5,
      fillColor,
      fillOpacity: pot.tipo==="perimetral"?0:isSel?0.5:0.3,
      dashArray: pot.tipo==="perimetral"?"6 4":null,
    };
  }

  useEffect(()=>{
    if(instanceRef.current) return;
    const L = window.L;
    if(!L){ console.warn("Leaflet not loaded"); return; }
    const map = L.map(mapRef.current, {
      center:[-30.849, -55.5964],
      zoom:13,
      zoomControl:true,
    });
    L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{
      maxZoom:20, subdomains:['mt0','mt1','mt2','mt3'],
      attribution:'© Google Satellite'
    }).addTo(map);
    instanceRef.current = map;
  },[]);

  useEffect(()=>{
    const L = window.L;
    const map = instanceRef.current;
    if(!L||!map) return;
    // Clear existing layers
    Object.values(layersRef.current).forEach(l=>map.removeLayer(l));
    layersRef.current = {};
    // Add polygons
    potreros.forEach(pot=>{
      if(pot.coords.length<3) return;
      const style = getStyle(pot);
      const poly = L.polygon(toLatLon(pot.coords), style);
      const anim = animalData.filter(a=>pot.animalIds&&pot.animalIds.includes(a.id)&&a.status==="Vivo");
      const ug = anim.reduce((s,a)=>s+calcUG(a),0).toFixed(1);
      const ugha = pot.hectareas>0?(ug/pot.hectareas).toFixed(2):"—";
      poly.bindTooltip(`
        <b>${pot.nome}</b><br>
        ${pot.hectareas} ha · ${anim.length} animais<br>
        ${pot.tipo!=="perimetral"&&pot.tipo!=="monte"?`Carga: ${ugha} UG/ha<br>Forraje: ${pot.forraje||80}%`:""}
      `, {sticky:true, className:"leaflet-tooltip-dark"});
      if(pot.tipo!=="perimetral"){
        poly.on("click",()=>onSelect(pot.id===selected?null:pot.id));
      }
      // Label
      if(pot.tipo!=="perimetral"){
        const center = poly.getBounds().getCenter();
        L.marker(center,{
          icon:L.divIcon({
            className:"",
            html:`<div style="color:${pot.tipo==="monte"?"#4a9a4a":pot.cor};font-size:11px;font-weight:700;text-shadow:0 1px 3px #000;white-space:nowrap;pointer-events:none;">${pot.nome}<br><span style="font-size:10px;opacity:.8">${pot.hectareas}ha</span></div>`,
            iconAnchor:[0,0]
          })
        }).addTo(map);
      }
      poly.addTo(map);
      layersRef.current[pot.id] = poly;
    });
  },[potreros, selected, animalData]);

  return (
    <div style={{position:"relative"}}>
      <div ref={mapRef} style={{height:420,borderRadius:10,overflow:"hidden",border:`1px solid ${C.border}`}}/>
      <div style={{position:"absolute",bottom:10,right:10,background:"#0008",borderRadius:6,padding:"6px 10px",fontSize:11,color:"#fff",display:"flex",flexDirection:"column",gap:3}}>
        <span><span style={{color:C.green}}>■</span> Bom forraje (&gt;60%)</span>
        <span><span style={{color:C.orange}}>■</span> Moderado (30-60%)</span>
        <span><span style={{color:C.red}}>■</span> Baixo (&lt;30%)</span>
        <span><span style={{color:"#1a4a1a"}}>■</span> Monte Nativo</span>
        <span><span style={{color:"#4a6e4c"}}>--</span> Padrão (limite)</span>
      </div>
    </div>
  );
}

// ─── DASHBOARD ───────────────────────────────────────────────────────────────
function Dashboard({ animals, paricion, potreros, vendas, compras, mortes, custos }) {
  const vivos    = animals.filter(a=>a.status==="Vivo");
  const matrices = vivos.filter(a=>a.cat==="Matriz");
  const prenhadas= matrices.filter(a=>a.prenhez==="Preñada");
  const recrias  = vivos.filter(a=>a.cat==="Recría");
  const toros    = vivos.filter(a=>a.cat==="Toro");
  const paridas  = paricion.filter(p=>p.status==="Parida");
  const pctP     = matrices.length?Math.round(prenhadas.length/matrices.length*100):0;

  const supPasto  = KMZ_POTREROS.filter(p=>p.tipo==="pastoreo").reduce((s,p)=>s+p.hectareas,0);
  const supMonte  = 18; // ha monte nativo
  const supTotal  = 417;
  const totalUG   = vivos.reduce((s,a)=>s+calcUG(a),0);
  const cargaHa   = supPasto>0?(totalUG/supPasto).toFixed(2):"—";

  const recVendas = vendas.reduce((s,v)=>s+Number(v.valorTotal),0);
  const cstCompras= compras.reduce((s,c)=>s+Number(c.valorTotal),0);
  const totalCust = custos.reduce((s,c)=>s+Number(c.valor),0);
  const margem    = recVendas - cstCompras - totalCust;
  const kgVend    = vendas.reduce((s,v)=>s+Number(v.kg),0);
  const custXkg   = kgVend>0?(totalCust/kgVend):0;
  const custXha   = supPasto>0?(totalCust/supPasto):0;
  const taxaNatal = matrices.length?(paridas.length/matrices.length*100):0;
  const taxaMorte = (vivos.length+mortes.length)>0?(mortes.length/(vivos.length+mortes.length)*100):0;

  return <div>
    {/* PRODUTIVOS */}
    <div style={{fontSize:13,fontWeight:700,color:C.green,marginBottom:10}}>📊 Indicadores Produtivos — Exercício {EJERCICIO.inicio} → {EJERCICIO.fin}</div>
    <div style={S.kpiGrid}>
      <KPI label="Total em Pé"     value={vivos.length}         sub="animais vivos"         color={C.green}/>
      <KPI label="Matrizes"        value={matrices.length}       sub="vacas"                 color={C.blue}/>
      <KPI label="% Preñez"        value={`${pctP}%`}            sub="Meta: 85%"             color={pctP>=80?C.green:C.orange}/>
      <KPI label="Taxa Natalidade" value={`${fmt(taxaNatal,1)}%`} sub="partos/matrizes"      color={taxaNatal>=70?C.green:C.orange}/>
      <KPI label="Taxa Mortalidade"value={`${fmt(taxaMorte,1)}%`} sub="Meta <2%"             color={taxaMorte<2?C.green:C.red}/>
      <KPI label="Recria"          value={recrias.length}         sub="terneras/vaquilhonas"  color={C.purple}/>
      <KPI label="Sup. Pastoreio"  value={`${fmt(supPasto,0)} ha`} sub={`${fmt(supMonte,0)} ha monte`} color={C.teal}/>
      <KPI label="Carga Animal"    value={`${cargaHa} UG/ha`}    sub="sobre pastoreio"       color={C.yellow}/>
    </div>
    {/* FINANCEIROS */}
    <div style={{fontSize:13,fontWeight:700,color:C.teal,marginBottom:10}}>💰 Indicadores Financeiros</div>
    <div style={S.kpiGrid}>
      <KPI label="Receita Vendas"  value={fmtR(recVendas)}   sub={`${vendas.length} vendas`}   color={C.green}/>
      <KPI label="Custo Compras"   value={fmtR(cstCompras)}  sub={`${compras.length} compras`}  color={C.red}/>
      <KPI label="Custos Operac."  value={fmtR(totalCust)}   sub={`${custos.length} registros`} color={C.orange}/>
      <KPI label="Margem Bruta"    value={fmtR(margem)}      sub="receita-compras-custos"        color={margem>=0?C.green:C.red}/>
      <KPI label="Custo/kg Prod."  value={fmtR(custXkg)+"/kg"} sub={`${fmt(kgVend)} kg vend.`}  color={C.yellow}/>
      <KPI label="Custo/ha"        value={fmtR(custXha)+"/ha"} sub={`${fmt(supPasto,0)} ha`}    color={C.orange}/>
      <KPI label="Giro Capital"    value={totalCust>0?`${fmt(recVendas/totalCust,2)}x`:"—"} sub="receita/custo" color={C.teal}/>
      <KPI label="Partos 2026"     value={paridas.length}    sub={`/${paricion.length} prenhas`} color={C.green}/>
    </div>

    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
      <div style={S.card}>
        <div style={S.sTitle}>🐄 Preñez por Propietario</div>
        {["Jaciara","Claudio","Agustin"].map(n=>{
          const m=matrices.filter(a=>a.prop===n);
          const pr=m.filter(a=>a.prenhez==="Preñada");
          const pct=m.length?Math.round(pr.length/m.length*100):0;
          return <div key={n} style={{marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
              <span style={{fontSize:12,color:C.textMid}}>{n}</span>
              <span style={{fontSize:12,color:C.green,fontWeight:700}}>{pct}%</span>
            </div>
            <ProgressBar pct={pct} color={C.green}/>
            <div style={{fontSize:10,color:C.textLow,marginTop:2}}>{pr.length}/{m.length} prenhas</div>
          </div>;
        })}
      </div>
      <div style={S.card}>
        <div style={S.sTitle}>📅 Cronograma de Parição</div>
        {[...new Set(paricion.map(p=>p.periodo))].map(per=>{
          const tot=paricion.filter(p=>p.periodo===per).length;
          const par=paricion.filter(p=>p.periodo===per&&p.status==="Parida").length;
          return <div key={per} style={{display:"flex",alignItems:"center",gap:8,marginBottom:7}}>
            <span style={{fontSize:11,color:C.textMid,minWidth:105}}>{per}</span>
            <div style={{flex:1}}><ProgressBar pct={tot?par/tot*100:0} color={C.blue}/></div>
            <span style={{fontSize:11,color:C.blue,minWidth:36,textAlign:"right"}}>{par}/{tot}</span>
          </div>;
        })}
      </div>
    </div>
  </div>;
}

// ─── INVENTARIO ──────────────────────────────────────────────────────────────
function Inventario({ animals, setAnimals }) {
  const [filter,setFilter]=useState({prop:"",cat:"",search:""});
  const [modal, setModal] =useState(null);
  const catC={Matriz:C.blue,Recría:C.purple,Toro:C.yellow};
  const preC={Preñada:C.green,Vacía:C.red};
  const filtered=useMemo(()=>animals.filter(a=>{
    if(filter.prop&&a.prop!==filter.prop) return false;
    if(filter.cat&&a.cat!==filter.cat) return false;
    if(filter.search){const s=filter.search.toLowerCase();if(!a.caravana.includes(s)&&!String(a.numero).includes(s)) return false;}
    return true;
  }),[animals,filter]);
  return <div>
    <div style={S.filterBar}>
      <input style={{...S.input,width:180}} placeholder="Caravana..." value={filter.search} onChange={e=>setFilter(f=>({...f,search:e.target.value}))}/>
      <select style={S.select} value={filter.prop} onChange={e=>setFilter(f=>({...f,prop:e.target.value}))}>
        <option value="">Todos</option>{["Jaciara","Claudio","Agustin"].map(p=><option key={p}>{p}</option>)}
      </select>
      <select style={S.select} value={filter.cat} onChange={e=>setFilter(f=>({...f,cat:e.target.value}))}>
        <option value="">Todas cat.</option>{["Matriz","Recría","Toro"].map(c=><option key={c}>{c}</option>)}
      </select>
      <span style={{color:C.textLow,fontSize:12,marginLeft:"auto"}}>{filtered.length} animais</span>
    </div>
    <div style={S.card}>
      <table style={S.table}>
        <thead><tr>{["Prop","N°","Caravana","Brinco","Idade","Raça","Cat","Preñez","UG","Status"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
        <tbody>{filtered.map(a=><HRow key={a.id} onClick={()=>setModal({...a})}>
          <td style={S.td}>{a.prop}</td>
          <td style={S.td}>{a.numero||"—"}</td>
          <td style={{...S.td,fontFamily:"monospace",color:C.green}}>{a.caravana}</td>
          <td style={{...S.td,fontSize:10,color:C.textLow}}>{a.brinco||"—"}</td>
          <td style={S.td}>{a.edadMeses!=null?(a.edadMeses>=24?`${Math.floor(a.edadMeses/12)}a ${a.edadMeses%12}m`:`${a.edadMeses}m`):a.cat==="Toro"?"Toro":"—"}</td>
          <td style={S.td}><Badge color={C.textLow}>{a.raza}</Badge></td>
          <td style={S.td}><Badge color={catC[a.cat]||C.textLow}>{a.cat}</Badge></td>
          <td style={S.td}>{a.prenhez?<Badge color={preC[a.prenhez]}>{a.prenhez}</Badge>:"—"}</td>
          <td style={{...S.td,color:C.yellow}}>{calcUG(a).toFixed(2)}</td>
          <td style={S.td}><Badge color={a.status==="Vivo"?C.green:a.status==="Morto"?C.red:C.orange}>{a.status}</Badge></td>
        </HRow>)}</tbody>
      </table>
    </div>
    {modal&&<div style={S.modal} onClick={e=>e.target===e.currentTarget&&setModal(null)}>
      <div style={S.mbox}>
        <div style={{fontSize:15,fontWeight:700,color:C.green,marginBottom:14}}>Editar — {modal.caravana}</div>
        {[["Propietario","prop"],["Número","numero"],["Raça","raza"]].map(([l,k])=><div key={k} style={S.frow}>
          <label style={S.label}>{l}</label><input style={S.input} value={modal[k]||""} onChange={e=>setModal(m=>({...m,[k]:e.target.value}))}/>
        </div>)}
        <div style={S.frow}><label style={S.label}>Categoria</label>
          <select style={{...S.select,width:"100%"}} value={modal.cat} onChange={e=>setModal(m=>({...m,cat:e.target.value}))}>
            {["Matriz","Recría","Toro"].map(c=><option key={c}>{c}</option>)}
          </select>
        </div>
        {modal.cat==="Matriz"&&<div style={S.frow}><label style={S.label}>Preñez</label>
          <select style={{...S.select,width:"100%"}} value={modal.prenhez||""} onChange={e=>setModal(m=>({...m,prenhez:e.target.value}))}>
            <option value="">—</option><option>Preñada</option><option>Vacía</option>
          </select>
        </div>}
        <div style={S.frow}><label style={S.label}>Status</label>
          <select style={{...S.select,width:"100%"}} value={modal.status} onChange={e=>setModal(m=>({...m,status:e.target.value}))}>
            <option>Vivo</option><option>Morto</option><option>Vendido</option>
          </select>
        </div>
        <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:16}}>
          <button style={S.btn("secondary")} onClick={()=>setModal(null)}>Cancelar</button>
          <button style={S.btn("primary")} onClick={()=>{setAnimals(p=>p.map(a=>a.id===modal.id?modal:a));setModal(null);}}>Salvar</button>
        </div>
      </div>
    </div>}
  </div>;
}

// ─── PARICIÓN ────────────────────────────────────────────────────────────────
function Paricion({ paricion, setParicion }) {
  const [loteF,setLoteF]=useState(0);
  const [modal,setModal]=useState(null);
  const lotes=[...new Set(paricion.map(p=>p.lote))].sort((a,b)=>a-b);
  const pByL={}; paricion.forEach(p=>{pByL[p.lote]=p.periodo;});
  const filtered=loteF===0?paricion:paricion.filter(p=>p.lote===loteF);
  const paridas=paricion.filter(p=>p.status==="Parida").length;
  return <div>
    <div style={S.kpiGrid}>
      <KPI label="Total Prenhas" value={paricion.length} color={C.blue}/>
      <KPI label="Paridas"       value={paridas}         color={C.green}/>
      <KPI label="Pendentes"     value={paricion.length-paridas} color={C.orange}/>
      <KPI label="% Avanço"      value={`${paricion.length?Math.round(paridas/paricion.length*100):0}%`} color={C.green}/>
    </div>
    <div style={S.filterBar}>
      <span style={{fontSize:12,color:C.textLow}}>Lote:</span>
      <span style={S.chip(loteF===0)} onClick={()=>setLoteF(0)}>Todos</span>
      {lotes.map(l=><span key={l} style={S.chip(loteF===l)} onClick={()=>setLoteF(l)}>L{l} · {pByL[l]}</span>)}
    </div>
    <div style={S.card}>
      <table style={S.table}>
        <thead><tr>{["Lote","Período","Prop","N°","Caravana","Data Parto","Sexo Cria","Status"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
        <tbody>{filtered.map(p=><HRow key={p.id} onClick={()=>setModal({...p})}>
          <td style={S.td}><Badge color={C.blue}>L{p.lote}</Badge></td>
          <td style={S.td}>{p.periodo}</td>
          <td style={S.td}>{p.prop}</td>
          <td style={S.td}>{p.numero||"—"}</td>
          <td style={{...S.td,fontFamily:"monospace",color:C.green}}>{p.caravana}</td>
          <td style={S.td}>{p.dataParto||"—"}</td>
          <td style={S.td}>{p.sexoCria?<Badge color={p.sexoCria==="Macho"?C.blue:C.pink}>{p.sexoCria}</Badge>:"—"}</td>
          <td style={S.td}><Badge color={p.status==="Parida"?C.green:p.status==="Aborto"?C.red:C.orange}>{p.status}</Badge></td>
        </HRow>)}</tbody>
      </table>
    </div>
    {modal&&<div style={S.modal} onClick={e=>e.target===e.currentTarget&&setModal(null)}>
      <div style={S.mbox}>
        <div style={{fontSize:15,fontWeight:700,color:C.green,marginBottom:4}}>Registrar Parto</div>
        <div style={{fontSize:12,color:C.textLow,marginBottom:14}}>{modal.prop} · {modal.caravana} · {modal.periodo}</div>
        <div style={S.frow}><label style={S.label}>Data do Parto</label>
          <input type="date" style={S.input} value={modal.dataParto} onChange={e=>setModal(m=>({...m,dataParto:e.target.value}))}/>
        </div>
        <div style={S.frow}><label style={S.label}>Sexo da Cria</label>
          <select style={{...S.select,width:"100%"}} value={modal.sexoCria} onChange={e=>setModal(m=>({...m,sexoCria:e.target.value}))}>
            <option value="">—</option><option>Macho</option><option>Hembra</option>
          </select>
        </div>
        <div style={S.frow}><label style={S.label}>Status</label>
          <select style={{...S.select,width:"100%"}} value={modal.status} onChange={e=>setModal(m=>({...m,status:e.target.value}))}>
            <option>Pendiente</option><option>Parida</option><option>Aborto</option><option>Mortinato</option>
          </select>
        </div>
        <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:14}}>
          <button style={S.btn("secondary")} onClick={()=>setModal(null)}>Cancelar</button>
          <button style={S.btn("primary")} onClick={()=>{setParicion(p=>p.map(x=>x.id===modal.id?modal:x));setModal(null);}}>Salvar</button>
        </div>
      </div>
    </div>}
  </div>;
}

// ─── PESAJES ─────────────────────────────────────────────────────────────────
function Pesajes({ pesajes, setPesajes }) {
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({data:"",especie:"Bovino",categoria:"Vaca",potrero:"",cabezas:0,kgProm:0,gdp:0,obs:""});
  const empty=()=>({data:"",especie:"Bovino",categoria:"Vaca",potrero:"",cabezas:0,kgProm:0,gdp:0,obs:""});

  const catsBov = ["Vaca","Vaquillona","Ternero/a","Toro","Novillo"];
  const catsOv  = ["Oveja","Cordero","Capón","Carnero"];
  const catsEq  = ["Yegua","Potro","Caballo"];

  function getCats(esp){ return esp==="Bovino"?catsBov:esp==="Ovino"?catsOv:catsEq; }

  function save(){
    if(!form.data||!form.cabezas) return;
    const kgTotal = Number(form.cabezas)*Number(form.kgProm);
    setPesajes(p=>[{id:Date.now(),...form,cabezas:Number(form.cabezas),kgProm:Number(form.kgProm),kgTotal,gdp:Number(form.gdp)},...p]);
    setModal(false); setForm(empty());
  }

  // Group by category for summary
  const byCat = {};
  pesajes.forEach(p=>{
    if(!byCat[p.categoria]) byCat[p.categoria]={n:0,kgTotal:0,kgProm:[]};
    byCat[p.categoria].n++;
    byCat[p.categoria].kgTotal+=p.kgTotal;
    byCat[p.categoria].kgProm.push(p.kgProm);
  });
  const totalKg = pesajes.reduce((s,p)=>s+p.kgTotal,0);
  const totalCab = pesajes.reduce((s,p)=>s+p.cabezas,0);

  return <div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14,gap:12}}>
      <div style={{...S.kpiGrid,flex:1,marginBottom:0}}>
        <KPI label="Pesagens"     value={pesajes.length}        color={C.blue}/>
        <KPI label="Total kg pes."value={`${fmt(totalKg)} kg`}  color={C.green}/>
        <KPI label="Cabeças pes." value={fmt(totalCab)}         color={C.purple}/>
        <KPI label="Kg médio"     value={`${totalCab>0?fmt(totalKg/totalCab,0):0} kg`} color={C.yellow}/>
      </div>
      <button style={{...S.btn("primary"),whiteSpace:"nowrap",marginTop:2}} onClick={()=>{setModal(true);setForm(empty());}}>+ Nova Pesagem</button>
    </div>

    {/* Resumo por categoria */}
    {Object.keys(byCat).length>0&&<div style={S.card}>
      <div style={S.sTitle}>📊 Resumo por Categoria</div>
      <table style={S.table}>
        <thead><tr>{["Categoria","Pesagens","Cab. totais","Kg médio","Kg total"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
        <tbody>{Object.entries(byCat).map(([cat,d])=><HRow key={cat}>
          <td style={S.td}><Badge color={C.blue}>{cat}</Badge></td>
          <td style={S.td}>{d.n}</td>
          <td style={S.td}>{d.kgProm.length}</td>
          <td style={{...S.td,color:C.yellow}}>{fmt(d.kgProm.reduce((s,x)=>s+x,0)/d.kgProm.length,0)} kg</td>
          <td style={{...S.td,color:C.green}}>{fmt(d.kgTotal)} kg</td>
        </HRow>)}</tbody>
      </table>
    </div>}

    <div style={S.card}>
      {!pesajes.length
        ?<div style={{textAlign:"center",padding:40,color:C.textLow}}>
          <div style={{fontSize:36,marginBottom:10}}>⚖️</div>
          Sem pesagens registradas. Clique em "+ Nova Pesagem".
        </div>
        :<table style={S.table}>
          <thead><tr>{["Data","Espécie","Categoria","Potrero","Cabeças","Kg médio","Kg total","GDP (g/dia)","Obs"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
          <tbody>{pesajes.map(p=><HRow key={p.id}>
            <td style={S.td}>{p.data}</td>
            <td style={S.td}><Badge color={C.teal}>{p.especie}</Badge></td>
            <td style={S.td}><Badge color={C.blue}>{p.categoria}</Badge></td>
            <td style={S.td}>{p.potrero||"—"}</td>
            <td style={S.td}>{p.cabezas}</td>
            <td style={{...S.td,color:C.yellow}}>{fmt(p.kgProm,0)} kg</td>
            <td style={{...S.td,color:C.green,fontWeight:600}}>{fmt(p.kgTotal)} kg</td>
            <td style={{...S.td,color:p.gdp>=600?C.green:p.gdp>0?C.orange:C.textLow}}>{p.gdp>0?`${fmt(p.gdp,0)} g`:"—"}</td>
            <td style={{...S.td,fontSize:11,color:C.textLow}}>{p.obs||"—"}</td>
          </HRow>)}</tbody>
        </table>}
    </div>

    {modal&&<div style={S.modal} onClick={e=>e.target===e.currentTarget&&setModal(false)}>
      <div style={S.mbox}>
        <div style={{fontSize:15,fontWeight:700,color:C.blue,marginBottom:14}}>⚖️ Nova Pesagem</div>
        <div style={S.grid2}>
          <div style={S.frow}><label style={S.label}>Data *</label>
            <input type="date" style={S.input} value={form.data} onChange={e=>setForm(f=>({...f,data:e.target.value}))}/>
          </div>
          <div style={S.frow}><label style={S.label}>Espécie</label>
            <select style={{...S.select,width:"100%"}} value={form.especie} onChange={e=>setForm(f=>({...f,especie:e.target.value,categoria:getCats(e.target.value)[0]}))}>
              {ESPECIES.map(e=><option key={e}>{e}</option>)}
            </select>
          </div>
          <div style={S.frow}><label style={S.label}>Categoria</label>
            <select style={{...S.select,width:"100%"}} value={form.categoria} onChange={e=>setForm(f=>({...f,categoria:e.target.value}))}>
              {getCats(form.especie).map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
          <div style={S.frow}><label style={S.label}>Potrero</label>
            <select style={{...S.select,width:"100%"}} value={form.potrero} onChange={e=>setForm(f=>({...f,potrero:e.target.value}))}>
              <option value="">—</option>
              {KMZ_POTREROS.filter(p=>p.tipo==="pastoreo").map(p=><option key={p.id}>{p.nome}</option>)}
            </select>
          </div>
          <div style={S.frow}><label style={S.label}>Cabeças pesadas *</label>
            <input type="number" style={S.input} value={form.cabezas} onChange={e=>setForm(f=>({...f,cabezas:e.target.value}))}/>
          </div>
          <div style={S.frow}><label style={S.label}>Kg médio por cabeça</label>
            <input type="number" style={S.input} value={form.kgProm} onChange={e=>setForm(f=>({...f,kgProm:e.target.value}))}/>
          </div>
          <div style={S.frow}><label style={S.label}>GDP (g/dia)</label>
            <input type="number" style={S.input} placeholder="Ex: 750" value={form.gdp||""} onChange={e=>setForm(f=>({...f,gdp:e.target.value}))}/>
          </div>
        </div>
        {form.cabezas>0&&form.kgProm>0&&<div style={{background:C.bg3,borderRadius:8,padding:10,marginBottom:12,textAlign:"center"}}>
          <span style={{color:C.yellow,fontWeight:700,fontSize:14}}>Total: {fmt(Number(form.cabezas)*Number(form.kgProm))} kg</span>
        </div>}
        <div style={S.frow}><label style={S.label}>Observações</label>
          <input style={S.input} value={form.obs} onChange={e=>setForm(f=>({...f,obs:e.target.value}))}/>
        </div>
        <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:14}}>
          <button style={S.btn("secondary")} onClick={()=>setModal(false)}>Cancelar</button>
          <button style={S.btn("primary")} onClick={save}>Salvar</button>
        </div>
      </div>
    </div>}
  </div>;
}

// ─── HACIENDA (EJERCICIO) ────────────────────────────────────────────────────
function Hacienda({ hacienda, setHacienda, animals, vendas, compras, mortes }) {
  const [editId, setEditId] = useState(null);
  const [form,   setForm]   = useState(null);

  // Initialize if empty
  useEffect(()=>{
    if(hacienda.length===0){
      const init = CATS_HACIENDA.map((cat,i)=>{
        const count = animals.filter(a=>a.status==="Vivo"&&(
          cat==="Vaca"?a.cat==="Matriz":
          cat==="Toro"?a.cat==="Toro":
          cat==="Vaquillona"?(a.cat==="Recría"&&(a.edadMeses||0)>=13):
          cat==="Ternero/a"?(a.cat==="Recría"&&(a.edadMeses||0)<=12):
          false
        )).length;
        return {id:i+1,categoria:cat,especie:"Bovino",inicio:count,entradas:0,saidas:0,mortes:0,fim:count};
      });
      setHacienda(init);
    }
  },[]);

  function recalc(h){ return {...h, fim: h.inicio + h.entradas - h.saidas - h.mortes}; }

  function save(){
    setHacienda(prev=>prev.map(x=>x.id===editId?recalc({...x,...form}):x));
    setEditId(null); setForm(null);
  }

  const totalInicio = hacienda.reduce((s,h)=>s+Number(h.inicio),0);
  const totalFim    = hacienda.reduce((s,h)=>s+Number(h.fim),0);
  const entTot = hacienda.reduce((s,h)=>s+Number(h.entradas),0);
  const saiTot = hacienda.reduce((s,h)=>s+Number(h.saidas),0);
  const morTot = hacienda.reduce((s,h)=>s+Number(h.mortes),0);
  const varPct = totalInicio>0?((totalFim-totalInicio)/totalInicio*100):0;

  // Financial from movements
  const recVendas = vendas.reduce((s,v)=>s+Number(v.valorTotal),0);
  const cstComp   = compras.reduce((s,c)=>s+Number(c.valorTotal),0);
  const kgV = vendas.reduce((s,v)=>s+Number(v.kg),0);
  const kgC = compras.reduce((s,c)=>s+Number(c.kg),0);
  const supPasto = KMZ_POTREROS.filter(p=>p.tipo==="pastoreo").reduce((s,p)=>s+p.hectareas,0);
  const kgPorHa  = supPasto>0?(kgV/supPasto).toFixed(1):"—";

  return <div>
    <div style={{fontSize:14,fontWeight:700,color:C.green,marginBottom:4}}>🏠 Hacienda — Exercício {EJERCICIO.inicio} → {EJERCICIO.fin}</div>
    <div style={{fontSize:12,color:C.textLow,marginBottom:14}}>Bovino, Ovino e Equino · Clique em uma linha para editar</div>

    <div style={S.kpiGrid}>
      <KPI label="Início exercício" value={totalInicio}     color={C.blue}/>
      <KPI label="Entradas"         value={`+${entTot}`}    color={C.green}/>
      <KPI label="Saídas/Vendas"    value={`-${saiTot}`}    color={C.orange}/>
      <KPI label="Mortes"           value={`-${morTot}`}    color={C.red}/>
      <KPI label="Fim exercício"    value={totalFim}        color={C.teal}/>
      <KPI label="Variação"         value={`${varPct>=0?"+":""}${fmt(varPct,1)}%`} color={varPct>=0?C.green:C.red}/>
      <KPI label="Receita vendas"   value={fmtR(recVendas)} color={C.green}/>
      <KPI label="Kg prod./ha"      value={`${kgPorHa} kg`} color={C.yellow}/>
    </div>

    <div style={S.card}>
      <div style={S.sTitle}>📋 Movimentações por Categoria</div>
      <table style={S.table}>
        <thead><tr>{["Espécie","Categoria","Início","Entradas","Saídas","Mortes","Fim exercício","Saldo"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
        <tbody>{hacienda.map(h=><HRow key={h.id} onClick={()=>{setEditId(h.id);setForm({inicio:h.inicio,entradas:h.entradas,saidas:h.saidas,mortes:h.mortes,especie:h.especie,categoria:h.categoria});}}>
          <td style={S.td}><Badge color={C.teal}>{h.especie}</Badge></td>
          <td style={S.td}>{h.categoria}</td>
          <td style={S.td}>{h.inicio}</td>
          <td style={{...S.td,color:C.green}}>+{h.entradas}</td>
          <td style={{...S.td,color:C.orange}}>-{h.saidas}</td>
          <td style={{...S.td,color:C.red}}>-{h.mortes}</td>
          <td style={{...S.td,fontWeight:600,color:C.teal}}>{h.fim}</td>
          <td style={{...S.td,color:h.fim>=h.inicio?C.green:C.red}}>{h.fim>=h.inicio?"+":""}{h.fim-h.inicio}</td>
        </HRow>)}
        <tr style={{background:C.border}}>
          <td style={{...S.td,fontWeight:700,color:C.textMid}} colSpan={2}>TOTAL</td>
          <td style={{...S.td,fontWeight:700}}>{totalInicio}</td>
          <td style={{...S.td,color:C.green,fontWeight:700}}>+{entTot}</td>
          <td style={{...S.td,color:C.orange,fontWeight:700}}>-{saiTot}</td>
          <td style={{...S.td,color:C.red,fontWeight:700}}>-{morTot}</td>
          <td style={{...S.td,fontWeight:700,color:C.teal}}>{totalFim}</td>
          <td style={{...S.td,color:varPct>=0?C.green:C.red,fontWeight:700}}>{totalFim>=totalInicio?"+":""}{totalFim-totalInicio}</td>
        </tr>
        </tbody>
      </table>
    </div>

    {/* Detalle financiero */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
      <div style={S.card}>
        <div style={S.sTitle}>📤 Vendas do Exercício</div>
        {!vendas.length?<div style={{color:C.textLow,fontSize:12}}>Sem vendas registradas.</div>:
        <><table style={S.table}>
          <thead><tr>{["Data","Categoria","Kg","Valor","R$/kg"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
          <tbody>{vendas.slice(0,5).map(v=><HRow key={v.id}>
            <td style={S.td}>{v.data}</td>
            <td style={S.td}><Badge color={C.blue}>{v.categoria}</Badge></td>
            <td style={S.td}>{fmt(v.kg)} kg</td>
            <td style={{...S.td,color:C.green}}>{fmtR(v.valorTotal)}</td>
            <td style={{...S.td,color:C.teal}}>{v.kg>0?fmtR(v.valorTotal/v.kg):"-"}</td>
          </HRow>)}</tbody>
        </table>
        <div style={{fontSize:11,color:C.textLow,marginTop:8}}>Total: {fmtR(recVendas)} · {fmt(kgV)} kg</div></>}
      </div>
      <div style={S.card}>
        <div style={S.sTitle}>📥 Compras do Exercício</div>
        {!compras.length?<div style={{color:C.textLow,fontSize:12}}>Sem compras registradas.</div>:
        <><table style={S.table}>
          <thead><tr>{["Data","Categoria","Kg","Valor","R$/kg"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
          <tbody>{compras.slice(0,5).map(c=><HRow key={c.id}>
            <td style={S.td}>{c.data}</td>
            <td style={S.td}><Badge color={C.orange}>{c.categoria}</Badge></td>
            <td style={S.td}>{fmt(c.kg)} kg</td>
            <td style={{...S.td,color:C.red}}>{fmtR(c.valorTotal)}</td>
            <td style={{...S.td,color:C.orange}}>{c.kg>0?fmtR(c.valorTotal/c.kg):"-"}</td>
          </HRow>)}</tbody>
        </table>
        <div style={{fontSize:11,color:C.textLow,marginTop:8}}>Total: {fmtR(cstComp)} · {fmt(kgC)} kg</div></>}
      </div>
    </div>

    {editId&&form&&<div style={S.modal} onClick={e=>e.target===e.currentTarget&&setEditId(null)}>
      <div style={S.mbox}>
        <div style={{fontSize:15,fontWeight:700,color:C.green,marginBottom:14}}>Editar — {form.categoria}</div>
        <div style={S.grid2}>
          {[["Cabeças no Início","inicio"],["Entradas (compras/nascimentos)","entradas"],["Saídas (vendas)","saidas"],["Mortes","mortes"]].map(([l,k])=><div key={k} style={S.frow}>
            <label style={S.label}>{l}</label>
            <input type="number" style={S.input} value={form[k]||0} onChange={e=>setForm(f=>({...f,[k]:Number(e.target.value)}))}/>
          </div>)}
        </div>
        <div style={{background:C.bg3,borderRadius:8,padding:10,marginBottom:12,textAlign:"center"}}>
          <span style={{color:C.teal,fontWeight:700}}>Fim do exercício: {form.inicio+form.entradas-form.saidas-form.mortes} cabeças</span>
        </div>
        <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
          <button style={S.btn("secondary")} onClick={()=>setEditId(null)}>Cancelar</button>
          <button style={S.btn("primary")} onClick={save}>Salvar</button>
        </div>
      </div>
    </div>}
  </div>;
}

// ─── SANIDADE ─────────────────────────────────────────────────────────────────
function Sanidade({ animals, sanidad, setSanidad }) {
  const [modal,setModal]=useState(false);
  const [form,setForm]=useState({fecha:"",tipo:"",producto:"",dosis:"",lote:"",obs:"",ids:[]});
  const [search,setSearch]=useState("");
  const tC={Vacunación:C.green,Desparasitación:C.blue,Vitaminas:C.yellow,Tratamiento:C.red,Otro:C.textLow};
  const shown=animals.filter(a=>a.status==="Vivo"&&(!search||a.caravana.includes(search))).slice(0,40);
  function save(){
    if(!form.fecha||!form.tipo||!form.ids.length) return;
    setSanidad(p=>[{id:Date.now(),...form},...p]);
    setModal(false); setForm({fecha:"",tipo:"",producto:"",dosis:"",lote:"",obs:"",ids:[]}); setSearch("");
  }
  return <div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14,gap:12}}>
      <div style={{...S.kpiGrid,flex:1,marginBottom:0}}>
        <KPI label="Eventos"          value={sanidad.length} color={C.blue}/>
        <KPI label="Animais tratados" value={[...new Set(sanidad.flatMap(s=>s.ids))].length} color={C.green}/>
      </div>
      <button style={{...S.btn("primary"),whiteSpace:"nowrap"}} onClick={()=>setModal(true)}>+ Novo Manejo</button>
    </div>
    {!sanidad.length
      ?<div style={{...S.card,textAlign:"center",padding:40}}>
        <div style={{fontSize:36,marginBottom:10}}>💉</div>
        <div style={{color:C.textLow}}>Sem eventos sanitários. Registre o primeiro acima.</div>
      </div>
      :<div style={S.card}>
        <table style={S.table}>
          <thead><tr>{["Data","Tipo","Produto","Dose","Potrero","Animais","Obs"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
          <tbody>{sanidad.map(ev=><HRow key={ev.id}>
            <td style={S.td}>{ev.fecha}</td>
            <td style={S.td}><Badge color={tC[ev.tipo]||C.textLow}>{ev.tipo}</Badge></td>
            <td style={S.td}>{ev.producto||"—"}</td>
            <td style={S.td}>{ev.dosis||"—"}</td>
            <td style={S.td}>{ev.lote||"—"}</td>
            <td style={S.td}>{ev.ids.length}</td>
            <td style={{...S.td,fontSize:11,color:C.textLow}}>{ev.obs||"—"}</td>
          </HRow>)}</tbody>
        </table>
      </div>}
    {modal&&<div style={S.modal} onClick={e=>e.target===e.currentTarget&&setModal(false)}>
      <div style={S.mbox}>
        <div style={{fontSize:15,fontWeight:700,color:C.green,marginBottom:14}}>💉 Novo Manejo Sanitário</div>
        <div style={S.grid2}>
          <div style={S.frow}><label style={S.label}>Data *</label><input type="date" style={S.input} value={form.fecha} onChange={e=>setForm(f=>({...f,fecha:e.target.value}))}/></div>
          <div style={S.frow}><label style={S.label}>Tipo *</label>
            <select style={{...S.select,width:"100%"}} value={form.tipo} onChange={e=>setForm(f=>({...f,tipo:e.target.value}))}>
              <option value="">—</option>{["Vacunación","Desparasitación","Vitaminas","Tratamiento","Otro"].map(t=><option key={t}>{t}</option>)}
            </select>
          </div>
          <div style={S.frow}><label style={S.label}>Produto</label><input style={S.input} value={form.producto} onChange={e=>setForm(f=>({...f,producto:e.target.value}))}/></div>
          <div style={S.frow}><label style={S.label}>Dose</label><input style={S.input} value={form.dosis} onChange={e=>setForm(f=>({...f,dosis:e.target.value}))}/></div>
        </div>
        <div style={S.frow}><label style={S.label}>Potrero</label>
          <select style={{...S.select,width:"100%"}} value={form.lote} onChange={e=>setForm(f=>({...f,lote:e.target.value}))}>
            <option value="">—</option>{KMZ_POTREROS.filter(p=>p.tipo==="pastoreo").map(p=><option key={p.id}>{p.nome}</option>)}
          </select>
        </div>
        <div style={S.frow}><label style={S.label}>Obs</label><input style={S.input} value={form.obs} onChange={e=>setForm(f=>({...f,obs:e.target.value}))}/></div>
        <div style={S.frow}>
          <label style={S.label}>Animais ({form.ids.length} sel.)</label>
          <input style={{...S.input,marginBottom:7}} placeholder="Filtrar caravana..." value={search} onChange={e=>setSearch(e.target.value)}/>
          <div style={{maxHeight:180,overflowY:"auto",border:`1px solid ${C.border2}`,borderRadius:6}}>
            {shown.map(a=><div key={a.id} onClick={()=>setForm(f=>({...f,ids:f.ids.includes(a.id)?f.ids.filter(x=>x!==a.id):[...f.ids,a.id]}))}
              style={{padding:"5px 9px",cursor:"pointer",display:"flex",alignItems:"center",gap:8,background:form.ids.includes(a.id)?C.border:"transparent",borderBottom:`1px solid ${C.bg3}`}}>
              <div style={{width:12,height:12,borderRadius:3,border:`2px solid ${form.ids.includes(a.id)?C.green:C.border2}`,background:form.ids.includes(a.id)?C.green:"transparent"}}/>
              <span style={{fontSize:11,color:C.green,fontFamily:"monospace"}}>{a.caravana}</span>
              <span style={{fontSize:11,color:C.textLow}}>{a.prop} · {a.cat}</span>
            </div>)}
          </div>
        </div>
        <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:12}}>
          <button style={S.btn("secondary")} onClick={()=>setModal(false)}>Cancelar</button>
          <button style={S.btn("primary")} onClick={save}>Salvar</button>
        </div>
      </div>
    </div>}
  </div>;
}

// ─── VENDAS / COMPRAS ────────────────────────────────────────────────────────
function VendasCompras({ vendas, setVendas, compras, setCompras }) {
  const [tab,setTab]=useState("vendas");
  const [modalV,setModalV]=useState(false);
  const [modalC,setModalC]=useState(false);
  const [fv,setFv]=useState({data:"",prop:"",caravana:"",categoria:"Vaca gordo",kg:0,valorTotal:0,comprador:"",obs:""});
  const [fc,setFc]=useState({data:"",prop:"",caravana:"",categoria:"Vaca",kg:0,valorTotal:0,vendedor:"",obs:""});
  const CATS_VENDA=["Vaca gordo","Boi gordo","Novillo","Terneiro","Vaquillona","Toro","Ovino","Equino","Outro"];
  const CATS_COMPRA=["Vaca","Vaquillona","Terneiro/a","Toro","Reprodutor","Ovino","Equino","Outro"];

  const totV=vendas.reduce((s,v)=>s+Number(v.valorTotal),0);
  const kgV=vendas.reduce((s,v)=>s+Number(v.kg),0);
  const totC=compras.reduce((s,c)=>s+Number(c.valorTotal),0);
  const kgC=compras.reduce((s,c)=>s+Number(c.kg),0);

  function saveV(){
    if(!fv.data||!fv.kg) return;
    setVendas(p=>[{id:Date.now(),...fv,kg:Number(fv.kg),valorTotal:Number(fv.valorTotal)},...p]);
    setModalV(false); setFv({data:"",prop:"",caravana:"",categoria:"Vaca gordo",kg:0,valorTotal:0,comprador:"",obs:""});
  }
  function saveC(){
    if(!fc.data||!fc.kg) return;
    setCompras(p=>[{id:Date.now(),...fc,kg:Number(fc.kg),valorTotal:Number(fc.valorTotal)},...p]);
    setModalC(false); setFc({data:"",prop:"",caravana:"",categoria:"Vaca",kg:0,valorTotal:0,vendedor:"",obs:""});
  }

  function FormMovimento({ titulo, cor, form, setForm, cats, onSave, onCancel, extra }) {
    return <div style={S.mbox}>
      <div style={{fontSize:15,fontWeight:700,color:cor,marginBottom:14}}>{titulo}</div>
      <div style={S.grid2}>
        <div style={S.frow}><label style={S.label}>Data *</label><input type="date" style={S.input} value={form.data} onChange={e=>setForm(f=>({...f,data:e.target.value}))}/></div>
        <div style={S.frow}><label style={S.label}>Propietario</label>
          <select style={{...S.select,width:"100%"}} value={form.prop} onChange={e=>setForm(f=>({...f,prop:e.target.value}))}>
            <option value="">—</option>{["Jaciara","Claudio","Agustin"].map(p=><option key={p}>{p}</option>)}
          </select>
        </div>
        <div style={S.frow}><label style={S.label}>Caravana / Lote</label><input style={S.input} value={form.caravana} onChange={e=>setForm(f=>({...f,caravana:e.target.value}))}/></div>
        <div style={S.frow}><label style={S.label}>Categoria</label>
          <select style={{...S.select,width:"100%"}} value={form.categoria} onChange={e=>setForm(f=>({...f,categoria:e.target.value}))}>
            {cats.map(c=><option key={c}>{c}</option>)}
          </select>
        </div>
        <div style={S.frow}><label style={S.label}>Kg *</label><input type="number" style={S.input} value={form.kg} onChange={e=>setForm(f=>({...f,kg:e.target.value}))}/></div>
        <div style={S.frow}><label style={S.label}>Valor Total (R$) *</label><input type="number" style={S.input} value={form.valorTotal} onChange={e=>setForm(f=>({...f,valorTotal:e.target.value}))}/></div>
      </div>
      {extra}
      <div style={S.frow}><label style={S.label}>Observações</label><input style={S.input} value={form.obs} onChange={e=>setForm(f=>({...f,obs:e.target.value}))}/></div>
      <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:14}}>
        <button style={S.btn("secondary")} onClick={onCancel}>Cancelar</button>
        <button style={S.btn("primary")} onClick={onSave}>Salvar</button>
      </div>
    </div>;
  }

  return <div>
    <div style={S.kpiGrid}>
      <KPI label="Receita Vendas"  value={fmtR(totV)}         sub={`${vendas.length} vendas · ${fmt(kgV)} kg`}  color={C.green}/>
      <KPI label="Preço Médio"     value={kgV>0?fmtR(totV/kgV)+"/kg":"—"} sub="vendas"                          color={C.teal}/>
      <KPI label="Custo Compras"   value={fmtR(totC)}         sub={`${compras.length} compras · ${fmt(kgC)} kg`} color={C.red}/>
      <KPI label="Saldo Líquido"   value={fmtR(totV-totC)}    sub="vendas − compras"                             color={(totV-totC)>=0?C.green:C.red}/>
    </div>
    <div style={{display:"flex",gap:8,marginBottom:14,alignItems:"center"}}>
      <div style={{display:"flex",gap:3}}>
        <button style={{...S.navBtn(tab==="vendas"),fontSize:12,padding:"6px 14px"}} onClick={()=>setTab("vendas")}>📤 Vendas ({vendas.length})</button>
        <button style={{...S.navBtn(tab==="compras"),fontSize:12,padding:"6px 14px"}} onClick={()=>setTab("compras")}>📥 Compras ({compras.length})</button>
      </div>
      <div style={{marginLeft:"auto",display:"flex",gap:8}}>
        <button style={S.btn("primary")} onClick={()=>setModalV(true)}>+ Nova Venda</button>
        <button style={S.btn("secondary")} onClick={()=>setModalC(true)}>+ Nova Compra</button>
      </div>
    </div>
    {tab==="vendas"&&<div style={S.card}>
      {!vendas.length?<div style={{textAlign:"center",padding:36,color:C.textLow}}>📤 Sem vendas registradas.</div>
        :<table style={S.table}>
          <thead><tr>{["Data","Prop","Caravana","Categoria","Kg","Valor","R$/kg","Comprador"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
          <tbody>{vendas.map(v=><HRow key={v.id}>
            <td style={S.td}>{v.data}</td>
            <td style={S.td}>{v.prop||"—"}</td>
            <td style={{...S.td,fontFamily:"monospace",color:C.green}}>{v.caravana||"—"}</td>
            <td style={S.td}><Badge color={C.blue}>{v.categoria}</Badge></td>
            <td style={S.td}>{fmt(v.kg)} kg</td>
            <td style={{...S.td,color:C.green,fontWeight:600}}>{fmtR(v.valorTotal)}</td>
            <td style={{...S.td,color:C.teal}}>{v.kg>0?fmtR(v.valorTotal/v.kg):"—"}</td>
            <td style={S.td}>{v.comprador||"—"}</td>
          </HRow>)}</tbody>
        </table>}
    </div>}
    {tab==="compras"&&<div style={S.card}>
      {!compras.length?<div style={{textAlign:"center",padding:36,color:C.textLow}}>📥 Sem compras registradas.</div>
        :<table style={S.table}>
          <thead><tr>{["Data","Prop","Caravana","Categoria","Kg","Valor","R$/kg","Vendedor"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
          <tbody>{compras.map(c=><HRow key={c.id}>
            <td style={S.td}>{c.data}</td>
            <td style={S.td}>{c.prop||"—"}</td>
            <td style={{...S.td,fontFamily:"monospace",color:C.orange}}>{c.caravana||"—"}</td>
            <td style={S.td}><Badge color={C.orange}>{c.categoria}</Badge></td>
            <td style={S.td}>{fmt(c.kg)} kg</td>
            <td style={{...S.td,color:C.red,fontWeight:600}}>{fmtR(c.valorTotal)}</td>
            <td style={{...S.td,color:C.orange}}>{c.kg>0?fmtR(c.valorTotal/c.kg):"—"}</td>
            <td style={S.td}>{c.vendedor||"—"}</td>
          </HRow>)}</tbody>
        </table>}
    </div>}
    {modalV&&<div style={S.modal} onClick={e=>e.target===e.currentTarget&&setModalV(false)}>
      <FormMovimento titulo="📤 Nova Venda" cor={C.green} form={fv} setForm={setFv} cats={CATS_VENDA} onSave={saveV} onCancel={()=>setModalV(false)}
        extra={<div style={S.frow}><label style={S.label}>Comprador</label><input style={S.input} value={fv.comprador} onChange={e=>setFv(f=>({...f,comprador:e.target.value}))}/></div>}/>
    </div>}
    {modalC&&<div style={S.modal} onClick={e=>e.target===e.currentTarget&&setModalC(false)}>
      <FormMovimento titulo="📥 Nova Compra" cor={C.orange} form={fc} setForm={setFc} cats={CATS_COMPRA} onSave={saveC} onCancel={()=>setModalC(false)}
        extra={<div style={S.frow}><label style={S.label}>Vendedor</label><input style={S.input} value={fc.vendedor} onChange={e=>setFc(f=>({...f,vendedor:e.target.value}))}/></div>}/>
    </div>}
  </div>;
}

// ─── MORTES ──────────────────────────────────────────────────────────────────
function Mortes({ mortes, setMortes, animals, setAnimals }) {
  const [modal,setModal]=useState(false);
  const [form,setForm]=useState({data:"",caravana:"",cat:"Matriz",prop:"",kg:0,causa:"",obs:""});
  const CAUSAS=["Enfermidade","Predador","Acidente","Parto","Desnutrição","Intoxicação","Desconhecida","Outro"];
  function save(){
    if(!form.data||!form.caravana) return;
    setMortes(p=>[{id:Date.now(),...form,kg:Number(form.kg)},...p]);
    setAnimals(prev=>prev.map(a=>a.caravana===form.caravana?{...a,status:"Morto"}:a));
    setModal(false); setForm({data:"",caravana:"",cat:"Matriz",prop:"",kg:0,causa:"",obs:""});
  }
  const kgT=mortes.reduce((s,m)=>s+Number(m.kg),0);
  return <div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14,gap:12}}>
      <div style={{...S.kpiGrid,flex:1,marginBottom:0}}>
        <KPI label="Total Mortes"    value={mortes.length}       color={C.red}/>
        <KPI label="Kg Perdidos"     value={`${fmt(kgT)} kg`}    color={C.orange}/>
        <KPI label="Taxa Mortalidade"value={`${animals.length?(mortes.length/(animals.length+mortes.length)*100).toFixed(1):0}%`} sub="Meta <2%" color={C.red}/>
      </div>
      <button style={{...S.btn("danger"),whiteSpace:"nowrap"}} onClick={()=>setModal(true)}>+ Registrar Morte</button>
    </div>
    <div style={S.card}>
      {!mortes.length?<div style={{textAlign:"center",padding:36,color:C.textLow}}>
        <div style={{fontSize:36,marginBottom:10}}>💀</div>Sem mortes registradas.
      </div>
      :<table style={S.table}>
        <thead><tr>{["Data","Caravana","Prop","Categoria","Kg","Causa","Obs"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
        <tbody>{mortes.map(m=><HRow key={m.id}>
          <td style={S.td}>{m.data}</td>
          <td style={{...S.td,fontFamily:"monospace",color:C.red}}>{m.caravana}</td>
          <td style={S.td}>{m.prop||"—"}</td>
          <td style={S.td}><Badge color={C.orange}>{m.cat}</Badge></td>
          <td style={S.td}>{fmt(m.kg)} kg</td>
          <td style={S.td}><Badge color={C.red}>{m.causa||"—"}</Badge></td>
          <td style={{...S.td,fontSize:11,color:C.textLow}}>{m.obs||"—"}</td>
        </HRow>)}</tbody>
      </table>}
    </div>
    {modal&&<div style={S.modal} onClick={e=>e.target===e.currentTarget&&setModal(false)}>
      <div style={S.mbox}>
        <div style={{fontSize:15,fontWeight:700,color:C.red,marginBottom:14}}>💀 Registrar Morte</div>
        <div style={S.grid2}>
          <div style={S.frow}><label style={S.label}>Data *</label><input type="date" style={S.input} value={form.data} onChange={e=>setForm(f=>({...f,data:e.target.value}))}/></div>
          <div style={S.frow}><label style={S.label}>Propietario</label>
            <select style={{...S.select,width:"100%"}} value={form.prop} onChange={e=>setForm(f=>({...f,prop:e.target.value}))}>
              <option value="">—</option>{["Jaciara","Claudio","Agustin"].map(p=><option key={p}>{p}</option>)}
            </select>
          </div>
          <div style={S.frow}><label style={S.label}>Caravana *</label>
            <input list="cara-list" style={S.input} value={form.caravana} onChange={e=>setForm(f=>({...f,caravana:e.target.value}))}/>
            <datalist id="cara-list">{animals.filter(a=>a.status==="Vivo").map(a=><option key={a.id} value={a.caravana}>{a.caravana} – {a.prop}</option>)}</datalist>
          </div>
          <div style={S.frow}><label style={S.label}>Categoria</label>
            <select style={{...S.select,width:"100%"}} value={form.cat} onChange={e=>setForm(f=>({...f,cat:e.target.value}))}>
              {["Matriz","Recría","Toro","Cria"].map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
          <div style={S.frow}><label style={S.label}>Peso (kg)</label><input type="number" style={S.input} value={form.kg} onChange={e=>setForm(f=>({...f,kg:e.target.value}))}/></div>
          <div style={S.frow}><label style={S.label}>Causa</label>
            <select style={{...S.select,width:"100%"}} value={form.causa} onChange={e=>setForm(f=>({...f,causa:e.target.value}))}>
              <option value="">—</option>{CAUSAS.map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div style={S.frow}><label style={S.label}>Obs</label><input style={S.input} value={form.obs} onChange={e=>setForm(f=>({...f,obs:e.target.value}))}/></div>
        <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:14}}>
          <button style={S.btn("secondary")} onClick={()=>setModal(false)}>Cancelar</button>
          <button style={S.btn("danger")} onClick={save}>Registrar</button>
        </div>
      </div>
    </div>}
  </div>;
}

// ─── CUSTOS ──────────────────────────────────────────────────────────────────
function Custos({ custos, setCustos }) {
  const [modal,setModal]=useState(false);
  const [form,setForm]=useState({data:"",categoria:"Sanidade",descricao:"",valor:0,prop:"",obs:""});
  const supPasto=KMZ_POTREROS.filter(p=>p.tipo==="pastoreo").reduce((s,p)=>s+p.hectareas,0);
  const total=custos.reduce((s,c)=>s+Number(c.valor),0);
  const cxha=supPasto>0?total/supPasto:0;
  function save(){
    if(!form.data||!form.valor) return;
    setCustos(p=>[{id:Date.now(),...form,valor:Number(form.valor)},...p]);
    setModal(false); setForm({data:"",categoria:"Sanidade",descricao:"",valor:0,prop:"",obs:""});
  }
  const porCat=CATEGORIAS_CUSTO.map(cat=>({cat,total:custos.filter(c=>c.categoria===cat).reduce((s,c)=>s+Number(c.valor),0),n:custos.filter(c=>c.categoria===cat).length}));
  return <div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14,gap:12}}>
      <div style={{...S.kpiGrid,flex:1,marginBottom:0}}>
        <KPI label="Total Custos"  value={fmtR(total)}       color={C.orange}/>
        <KPI label="Custo/ha"      value={fmtR(cxha)+"/ha"} sub={`${fmt(supPasto,0)} ha`} color={C.yellow}/>
        <KPI label="Registros"     value={custos.length}     color={C.blue}/>
      </div>
      <button style={{...S.btn("warn"),whiteSpace:"nowrap"}} onClick={()=>setModal(true)}>+ Novo Custo</button>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:10,marginBottom:14}}>
      {porCat.map(x=><div key={x.cat} style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 14px",borderLeft:`3px solid ${x.total>0?C.yellow:C.border2}`}}>
        <div style={{fontSize:17,fontWeight:800,color:x.total>0?C.yellow:C.textLow}}>{fmtR(x.total)}</div>
        <div style={{fontSize:11,color:C.textLow,marginTop:3}}>{x.cat}</div>
        <div style={{fontSize:10,color:C.textMuted,marginTop:2}}>{x.n} registro{x.n!==1?"s":""}</div>
      </div>)}
    </div>
    <div style={S.card}>
      {!custos.length?<div style={{textAlign:"center",padding:36,color:C.textLow}}>
        <div style={{fontSize:36,marginBottom:10}}>💸</div>Sem custos registrados.
      </div>
      :<table style={S.table}>
        <thead><tr>{["Data","Categoria","Descrição","Propietario","Valor","Obs"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
        <tbody>{custos.map(c=><HRow key={c.id}>
          <td style={S.td}>{c.data}</td>
          <td style={S.td}><Badge color={C.yellow}>{c.categoria}</Badge></td>
          <td style={S.td}>{c.descricao||"—"}</td>
          <td style={S.td}>{c.prop||"Geral"}</td>
          <td style={{...S.td,color:C.orange,fontWeight:600}}>{fmtR(c.valor)}</td>
          <td style={{...S.td,fontSize:11,color:C.textLow}}>{c.obs||"—"}</td>
        </HRow>)}</tbody>
      </table>}
    </div>
    {modal&&<div style={S.modal} onClick={e=>e.target===e.currentTarget&&setModal(false)}>
      <div style={S.mbox}>
        <div style={{fontSize:15,fontWeight:700,color:C.yellow,marginBottom:14}}>💸 Novo Custo Operacional</div>
        <div style={S.grid2}>
          <div style={S.frow}><label style={S.label}>Data *</label><input type="date" style={S.input} value={form.data} onChange={e=>setForm(f=>({...f,data:e.target.value}))}/></div>
          <div style={S.frow}><label style={S.label}>Categoria *</label>
            <select style={{...S.select,width:"100%"}} value={form.categoria} onChange={e=>setForm(f=>({...f,categoria:e.target.value}))}>
              {CATEGORIAS_CUSTO.map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
          <div style={S.frow}><label style={S.label}>Valor (R$) *</label><input type="number" style={S.input} value={form.valor} onChange={e=>setForm(f=>({...f,valor:e.target.value}))}/></div>
          <div style={S.frow}><label style={S.label}>Propietario</label>
            <select style={{...S.select,width:"100%"}} value={form.prop} onChange={e=>setForm(f=>({...f,prop:e.target.value}))}>
              <option value="">Geral</option>{["Jaciara","Claudio","Agustin"].map(p=><option key={p}>{p}</option>)}
            </select>
          </div>
        </div>
        <div style={S.frow}><label style={S.label}>Descrição</label><input style={S.input} value={form.descricao} onChange={e=>setForm(f=>({...f,descricao:e.target.value}))}/></div>
        <div style={S.frow}><label style={S.label}>Obs</label><input style={S.input} value={form.obs} onChange={e=>setForm(f=>({...f,obs:e.target.value}))}/></div>
        <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:14}}>
          <button style={S.btn("secondary")} onClick={()=>setModal(false)}>Cancelar</button>
          <button style={S.btn("warn")} onClick={save}>Salvar</button>
        </div>
      </div>
    </div>}
  </div>;
}

// ─── PASTURAS ────────────────────────────────────────────────────────────────
function Pasturas({ pasturas, setPasturas }) {
  const [modal,setModal]=useState(false);
  const [form,setForm]=useState({data:"",potrero:"",tipo:"Campo natural",especie:"",altura:0,dispKgHa:0,obs:""});
  const empty=()=>({data:"",potrero:"",tipo:"Campo natural",especie:"",altura:0,dispKgHa:0,obs:""});
  const TIPOS=["Campo natural","Pastagem cultivada","Verdura","Silagem"];
  const ESPECIES_PAST=["Misto campo natural","Festuca","Azevém","Tifton","Aveia","Sorgo","Milho","Outro"];

  function save(){
    if(!form.data||!form.potrero) return;
    setPasturas(p=>[{id:Date.now(),...form,altura:Number(form.altura),dispKgHa:Number(form.dispKgHa)},...p]);
    setModal(false); setForm(empty());
  }

  // Last reading per potrero
  const ultimosPorPot = {};
  pasturas.forEach(p=>{
    if(!ultimosPorPot[p.potrero]||p.data>ultimosPorPot[p.potrero].data) ultimosPorPot[p.potrero]=p;
  });

  const medAltura = pasturas.length?pasturas.reduce((s,p)=>s+p.altura,0)/pasturas.length:0;
  const medDisp   = pasturas.length?pasturas.reduce((s,p)=>s+p.dispKgHa,0)/pasturas.length:0;

  return <div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14,gap:12}}>
      <div style={{...S.kpiGrid,flex:1,marginBottom:0}}>
        <KPI label="Medições"     value={pasturas.length}        color={C.green}/>
        <KPI label="Altura média" value={`${fmt(medAltura,1)} cm`} color={C.teal}/>
        <KPI label="Disp. média"  value={`${fmt(medDisp,0)} kg/ha`} color={C.yellow}/>
      </div>
      <button style={{...S.btn("primary"),whiteSpace:"nowrap"}} onClick={()=>setModal(true)}>+ Nova Medição</button>
    </div>

    {/* Último por potrero */}
    {Object.keys(ultimosPorPot).length>0&&<div style={S.card}>
      <div style={S.sTitle}>🌿 Última Medição por Potrero</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:10}}>
        {Object.entries(ultimosPorPot).map(([pot,m])=>{
          const alt=m.altura;
          const col=alt>=15?C.green:alt>=8?C.orange:C.red;
          return <div key={pot} style={{background:C.bg3,borderRadius:8,padding:"12px 14px",borderLeft:`3px solid ${col}`}}>
            <div style={{fontSize:13,fontWeight:600,color:C.textMid,marginBottom:4}}>{pot}</div>
            <div style={{fontSize:20,fontWeight:800,color:col}}>{alt} cm</div>
            {m.dispKgHa>0&&<div style={{fontSize:11,color:C.yellow}}>{fmt(m.dispKgHa)} kg MS/ha</div>}
            <div style={{fontSize:10,color:C.textLow,marginTop:3}}>{m.data} · {m.tipo}</div>
            {m.especie&&<div style={{fontSize:10,color:C.textLow}}>{m.especie}</div>}
          </div>;
        })}
      </div>
      <div style={{fontSize:11,color:C.textLow,marginTop:10}}>
        <span style={{color:C.green}}>●</span> &gt;15cm (ideal) &nbsp;
        <span style={{color:C.orange}}>●</span> 8–15cm (atenção) &nbsp;
        <span style={{color:C.red}}>●</span> &lt;8cm (pastejo ou descanso)
      </div>
    </div>}

    <div style={S.card}>
      {!pasturas.length
        ?<div style={{textAlign:"center",padding:36,color:C.textLow}}>
          <div style={{fontSize:36,marginBottom:10}}>🌾</div>
          Sem medições de pasturas. Registre a primeira acima.
        </div>
        :<table style={S.table}>
          <thead><tr>{["Data","Potrero","Tipo","Espécie","Altura (cm)","Disp. MS (kg/ha)","Obs"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
          <tbody>{pasturas.map(p=><HRow key={p.id}>
            <td style={S.td}>{p.data}</td>
            <td style={S.td}><Badge color={C.green}>{p.potrero}</Badge></td>
            <td style={S.td}><Badge color={C.teal}>{p.tipo}</Badge></td>
            <td style={S.td}>{p.especie||"—"}</td>
            <td style={{...S.td,color:p.altura>=15?C.green:p.altura>=8?C.orange:C.red,fontWeight:600}}>{p.altura} cm</td>
            <td style={{...S.td,color:C.yellow}}>{p.dispKgHa>0?`${fmt(p.dispKgHa)} kg`:"—"}</td>
            <td style={{...S.td,fontSize:11,color:C.textLow}}>{p.obs||"—"}</td>
          </HRow>)}</tbody>
        </table>}
    </div>

    {modal&&<div style={S.modal} onClick={e=>e.target===e.currentTarget&&setModal(false)}>
      <div style={S.mbox}>
        <div style={{fontSize:15,fontWeight:700,color:C.green,marginBottom:14}}>🌾 Nova Medição de Pastura</div>
        <div style={S.grid2}>
          <div style={S.frow}><label style={S.label}>Data *</label><input type="date" style={S.input} value={form.data} onChange={e=>setForm(f=>({...f,data:e.target.value}))}/></div>
          <div style={S.frow}><label style={S.label}>Potrero *</label>
            <select style={{...S.select,width:"100%"}} value={form.potrero} onChange={e=>setForm(f=>({...f,potrero:e.target.value}))}>
              <option value="">— Selecionar —</option>
              {KMZ_POTREROS.filter(p=>p.tipo==="pastoreo").map(p=><option key={p.id}>{p.nome}</option>)}
            </select>
          </div>
          <div style={S.frow}><label style={S.label}>Tipo</label>
            <select style={{...S.select,width:"100%"}} value={form.tipo} onChange={e=>setForm(f=>({...f,tipo:e.target.value}))}>
              {TIPOS.map(t=><option key={t}>{t}</option>)}
            </select>
          </div>
          <div style={S.frow}><label style={S.label}>Espécie / Forrageira</label>
            <select style={{...S.select,width:"100%"}} value={form.especie} onChange={e=>setForm(f=>({...f,especie:e.target.value}))}>
              <option value="">—</option>{ESPECIES_PAST.map(e=><option key={e}>{e}</option>)}
            </select>
          </div>
          <div style={S.frow}><label style={S.label}>Altura (cm)</label>
            <input type="number" style={S.input} value={form.altura} onChange={e=>setForm(f=>({...f,altura:e.target.value}))}/>
          </div>
          <div style={S.frow}><label style={S.label}>Disponib. MS (kg/ha)</label>
            <input type="number" style={S.input} placeholder="Ej: 1800" value={form.dispKgHa||""} onChange={e=>setForm(f=>({...f,dispKgHa:e.target.value}))}/>
          </div>
        </div>
        <div style={S.frow}><label style={S.label}>Observações</label><input style={S.input} value={form.obs} onChange={e=>setForm(f=>({...f,obs:e.target.value}))}/></div>
        <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:14}}>
          <button style={S.btn("secondary")} onClick={()=>setModal(false)}>Cancelar</button>
          <button style={S.btn("primary")} onClick={save}>Salvar</button>
        </div>
      </div>
    </div>}
  </div>;
}

// ─── POTREROS (with real Leaflet map) ────────────────────────────────────────
function Potreros({ animals, potreros, setPotreros }) {
  const [sel,   setSel]   = useState(null);
  const [editM, setEditM] = useState(null);
  const [asnM,  setAsnM]  = useState(null);
  const [srch,  setSrch]  = useState("");
  const [leafletReady, setLeafletReady] = useState(false);

  // Load Leaflet dynamically
  useEffect(()=>{
    if(window.L){ setLeafletReady(true); return; }
    const link = document.createElement("link");
    link.rel="stylesheet";
    link.href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
    document.head.appendChild(link);
    const script = document.createElement("script");
    script.src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
    script.onload=()=>setLeafletReady(true);
    document.head.appendChild(script);
    // CSS for dark tooltip
    const style = document.createElement("style");
    style.textContent=`.leaflet-tooltip-dark{background:#162019;color:#c8dcc9;border:1px solid #2d4a32;font-size:12px;padding:6px 10px;}`;
    document.head.appendChild(style);
  },[]);

  const selP = potreros.find(p=>p.id===sel);
  const getA  = p=>animals.filter(a=>p.animalIds&&p.animalIds.includes(a.id)&&a.status==="Vivo");
  const potUG = p=>getA(p).reduce((s,a)=>s+calcUG(a),0);
  const potC  = p=>p.hectareas?(potUG(p)/p.hectareas).toFixed(2):"—";

  function toggle(pid,aid){
    setPotreros(p=>p.map(x=>x.id!==pid?x:{...x,animalIds:x.animalIds?x.animalIds.includes(aid)?x.animalIds.filter(i=>i!==aid):[...x.animalIds,aid]:[aid]}));
  }

  const shownA=animals.filter(a=>a.status==="Vivo"&&(!srch||a.caravana.includes(srch)||String(a.numero).includes(srch))).slice(0,50);
  const supPasto=potreros.filter(p=>p.tipo==="pastoreo").reduce((s,p)=>s+p.hectareas,0);
  const totalUG =animals.filter(a=>a.status==="Vivo").reduce((s,a)=>s+calcUG(a),0);
  const asign   =[...new Set(potreros.flatMap(p=>p.animalIds||[]))].length;
  const alertas =potreros.filter(p=>(p.forraje||80)<30).length;

  return <div>
    <div style={S.kpiGrid}>
      <KPI label="Potreros pastoreio" value={potreros.filter(p=>p.tipo==="pastoreo").length} color={C.green}/>
      <KPI label="Sup. pastoreio"     value={`${fmt(supPasto,0)} ha`}                        color={C.blue}/>
      <KPI label="Monte Nativo"       value="~18 ha"                                          color="#4a9a4a" sub="Não contabilizado em carga"/>
      <KPI label="Padrão total"        value="~417 ha"                                        color={C.teal}/>
      <KPI label="Carga Global"        value={`${supPasto?(totalUG/supPasto).toFixed(2):"—"} UG/ha`} color={C.yellow}/>
      <KPI label="Animais asign."      value={`${asign}/${animals.filter(a=>a.status==="Vivo").length}`} color={C.purple}/>
      <KPI label="Alertas forraje"     value={alertas} sub={alertas?"Forraje <30%":"OK"} color={alertas?C.red:C.green}/>
    </div>

    {/* MAPA LEAFLET */}
    <div style={{...S.card,padding:14}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
        <div style={S.sTitle}>🗺️ Mapa Real dos Potreros — Padrón 12163, Rodeio, Jaciara</div>
        <span style={{fontSize:11,color:C.textLow}}>Satélite Google · Polígonos reais dos KML</span>
      </div>
      {leafletReady
        ?<LeafletMap
            potreros={potreros.map(p=>({...p,animalIds:p.animalIds||[]}))}
            animalData={animals}
            selected={sel}
            onSelect={setSel}
          />
        :<div style={{height:420,borderRadius:10,background:C.bg3,display:"flex",alignItems:"center",justifyContent:"center",border:`1px solid ${C.border}`}}>
          <span style={{color:C.textLow}}>Carregando mapa Leaflet…</span>
        </div>
      }
    </div>

    {/* Painel potrero selecionado */}
    {selP&&<div style={{...S.card,borderColor:selP.cor}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:10,marginBottom:14}}>
        <div>
          <div style={{fontSize:16,fontWeight:700,color:selP.cor}}>{selP.nome}</div>
          <div style={{fontSize:12,color:C.textLow}}>{selP.tipo} · {selP.hectareas} ha · {(selP.animalIds||[]).length} animais · {potUG(selP).toFixed(1)} UG · {potC(selP)} UG/ha</div>
        </div>
        <div style={{display:"flex",gap:8}}>
          {selP.tipo==="pastoreo"&&<button style={S.btn("secondary")} onClick={()=>setAsnM(selP.id)}>Asignar animais</button>}
          <button style={S.btn("secondary")} onClick={()=>setEditM({...selP})}>Editar</button>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:12}}>
        {[
          {l:"Superfície",v:`${selP.hectareas} ha`,c:C.blue},
          {l:"Animais",   v:(selP.animalIds||[]).length, c:C.green},
          {l:"Carga",     v:`${potC(selP)} UG/ha`,       c:C.yellow},
          {l:"Forraje",   v:`${selP.forraje||80}%`,       c:(selP.forraje||80)>60?C.green:(selP.forraje||80)>30?C.orange:C.red},
        ].map(k=><div key={k.l} style={{background:C.bg3,borderRadius:8,padding:"10px 12px",borderLeft:`3px solid ${k.c}`}}>
          <div style={{fontSize:18,fontWeight:800,color:k.c}}>{k.v}</div>
          <div style={{fontSize:10,color:C.textLow,marginTop:2}}>{k.l}</div>
        </div>)}
      </div>
      <div style={{marginBottom:12}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
          <span style={{fontSize:12,color:C.textMid}}>🌿 Forraje disponível</span>
          <span style={{fontSize:12,color:(selP.forraje||80)>60?C.green:(selP.forraje||80)>30?C.orange:C.red}}>{selP.forraje||80}%</span>
        </div>
        <ProgressBar pct={selP.forraje||80} color={(selP.forraje||80)>60?C.green:(selP.forraje||80)>30?C.orange:C.red}/>
      </div>
      {getA(selP).length>0&&<>
        <div style={{fontSize:12,fontWeight:600,color:C.textMid,marginBottom:7}}>Animais neste potrero</div>
        <table style={S.table}>
          <thead><tr>{["Prop","N°","Caravana","Categoria","Preñez","UG"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
          <tbody>{getA(selP).map(a=><HRow key={a.id}>
            <td style={S.td}>{a.prop}</td>
            <td style={S.td}>{a.numero||"—"}</td>
            <td style={{...S.td,fontFamily:"monospace",color:C.green}}>{a.caravana}</td>
            <td style={S.td}><Badge color={{Matriz:C.blue,Recría:C.purple,Toro:C.yellow}[a.cat]||C.textLow}>{a.cat}</Badge></td>
            <td style={S.td}>{a.prenhez?<Badge color={a.prenhez==="Preñada"?C.green:C.red}>{a.prenhez}</Badge>:"—"}</td>
            <td style={{...S.td,color:C.yellow}}>{calcUG(a).toFixed(2)}</td>
          </HRow>)}</tbody>
        </table>
      </>}
    </div>}

    {/* Tabela resumo */}
    <div style={S.card}>
      <div style={S.sTitle}>📊 Resumo dos Potreros</div>
      <table style={S.table}>
        <thead><tr>{["Potrero","Tipo","Ha","Animais","UG","UG/ha","Forraje","Status"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
        <tbody>{potreros.map(p=>{
          const al=(p.forraje||80)<30;
          return <HRow key={p.id} onClick={()=>setSel(p.id===sel?null:p.id)}>
            <td style={S.td}><span style={{width:8,height:8,borderRadius:2,background:p.cor,display:"inline-block",marginRight:6}}/>{p.nome}</td>
            <td style={S.td}><Badge color={p.tipo==="monte"?"#4a9a4a":p.tipo==="perimetral"?C.textLow:C.blue}>{p.tipo}</Badge></td>
            <td style={S.td}>{p.hectareas}</td>
            <td style={S.td}>{(p.animalIds||[]).length}</td>
            <td style={{...S.td,color:C.yellow}}>{potUG(p).toFixed(1)}</td>
            <td style={{...S.td,color:C.yellow}}>{potC(p)}</td>
            <td style={S.td}><span style={{color:(p.forraje||80)>60?C.green:(p.forraje||80)>30?C.orange:C.red}}>{p.forraje||80}%</span></td>
            <td style={S.td}>{al?<Badge color={C.red}>⚠ Atenção</Badge>:<Badge color={C.green}>OK</Badge>}</td>
          </HRow>;
        })}</tbody>
      </table>
    </div>

    {/* Modal editar */}
    {editM&&<div style={S.modal} onClick={e=>e.target===e.currentTarget&&setEditM(null)}>
      <div style={S.mbox}>
        <div style={{fontSize:15,fontWeight:700,color:C.green,marginBottom:14}}>Editar — {editM.nome}</div>
        {[["Nome","nome","text"],["Hectáreas","hectareas","number"],["Forraje disponível (%)","forraje","number"]].map(([l,k,t])=><div key={k} style={S.frow}>
          <label style={S.label}>{l}</label>
          <input type={t} style={S.input} value={editM[k]||""} onChange={e=>setEditM(m=>({...m,[k]:t==="number"?Number(e.target.value):e.target.value}))}/>
        </div>)}
        <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:14}}>
          <button style={S.btn("secondary")} onClick={()=>setEditM(null)}>Cancelar</button>
          <button style={S.btn("primary")} onClick={()=>{setPotreros(p=>p.map(x=>x.id===editM.id?editM:x));setEditM(null);}}>Salvar</button>
        </div>
      </div>
    </div>}

    {/* Modal asignar */}
    {asnM!=null&&<div style={S.modal} onClick={e=>e.target===e.currentTarget&&(setAsnM(null),setSrch(""))}>
      <div style={S.mbox}>
        <div style={{fontSize:15,fontWeight:700,color:C.green,marginBottom:4}}>Asignar Animais</div>
        <div style={{fontSize:12,color:C.textLow,marginBottom:12}}>{potreros.find(p=>p.id===asnM)?.nome} · UG atual: {potUG(potreros.find(p=>p.id===asnM)||{animalIds:[]}).toFixed(1)}</div>
        <input style={{...S.input,marginBottom:8}} placeholder="Filtrar caravana..." value={srch} onChange={e=>setSrch(e.target.value)}/>
        <div style={{maxHeight:300,overflowY:"auto",border:`1px solid ${C.border2}`,borderRadius:6}}>
          {shownA.map(a=>{
            const inThis=potreros.find(p=>p.id===asnM)?.animalIds?.includes(a.id);
            return <div key={a.id} onClick={()=>toggle(asnM,a.id)}
              style={{padding:"6px 10px",cursor:"pointer",display:"flex",alignItems:"center",gap:8,background:inThis?C.border:"transparent",borderBottom:`1px solid ${C.bg3}`}}>
              <div style={{width:12,height:12,borderRadius:3,border:`2px solid ${inThis?C.green:C.border2}`,background:inThis?C.green:"transparent",flexShrink:0}}/>
              <span style={{fontSize:11,color:C.green,fontFamily:"monospace",minWidth:55}}>{a.caravana}</span>
              <span style={{fontSize:11,color:C.textLow}}>{a.prop}</span>
              <span style={{marginLeft:"auto"}}><Badge color={{Matriz:C.blue,Recría:C.purple,Toro:C.yellow}[a.cat]||C.textLow}>{a.cat}</Badge></span>
              <span style={{fontSize:10,color:C.yellow}}>{calcUG(a).toFixed(2)} UG</span>
            </div>;
          })}
        </div>
        <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:12}}>
          <button style={S.btn("primary")} onClick={()=>{setAsnM(null);setSrch("");}}>Feito</button>
        </div>
      </div>
    </div>}
  </div>;
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
const TABS=[
  {id:"dashboard",  label:"📊 Resumo"},
  {id:"inventario", label:"🐄 Inventário"},
  {id:"paricion",   label:"🐮 Parição"},
  {id:"hacienda",   label:"🏠 Hacienda"},
  {id:"pesajes",    label:"⚖️ Pesajes"},
  {id:"sanidade",   label:"💉 Sanidade"},
  {id:"ventas",     label:"💰 Vendas/Compras"},
  {id:"mortes",     label:"💀 Mortes"},
  {id:"custos",     label:"💸 Custos"},
  {id:"pasturas",   label:"🌾 Pasturas"},
  {id:"potreros",   label:"🗺️ Potreros"},
];

export default function App() {
  const [tab,      setTab]      = useState("dashboard");
  const [animals,  setAnimals]  = useState(ANIMALS0);
  const [paricion, setParicion] = useState(PARICION0);
  const [sanidad,  setSanidad]  = useState([]);
  const [potreros, setPotreros] = useState(KMZ_POTREROS.map(p=>({...p,animalIds:[],forraje:80})));
  const [vendas,   setVendas]   = useState([]);
  const [compras,  setCompras]  = useState([]);
  const [mortes,   setMortes]   = useState([]);
  const [custos,   setCustos]   = useState([]);
  const [pesajes,  setPesajes]  = useState([]);
  const [hacienda, setHacienda] = useState([]);
  const [pasturas, setPasturas] = useState([]);

  return <div style={S.app}>
    <div style={S.header}>
      <span style={{fontSize:26}}>🐄</span>
      <div>
        <div style={S.headerTitle}>Rodeo Rodeio — Jaciara & Claudio</div>
        <div style={S.headerSub}>Gestão Ganadera · Padrão 12163 · Exercício {EJERCICIO.inicio} → {EJERCICIO.fin}</div>
      </div>
    </div>
    <div style={S.nav}>
      {TABS.map(t=><button key={t.id} style={S.navBtn(tab===t.id)} onClick={()=>setTab(t.id)}>{t.label}</button>)}
    </div>
    <div style={S.main}>
      {tab==="dashboard"  && <Dashboard animals={animals} paricion={paricion} potreros={potreros} vendas={vendas} compras={compras} mortes={mortes} custos={custos}/>}
      {tab==="inventario" && <Inventario animals={animals} setAnimals={setAnimals}/>}
      {tab==="paricion"   && <Paricion paricion={paricion} setParicion={setParicion}/>}
      {tab==="hacienda"   && <Hacienda hacienda={hacienda} setHacienda={setHacienda} animals={animals} vendas={vendas} compras={compras} mortes={mortes}/>}
      {tab==="pesajes"    && <Pesajes pesajes={pesajes} setPesajes={setPesajes}/>}
      {tab==="sanidade"   && <Sanidade animals={animals} sanidad={sanidad} setSanidad={setSanidad}/>}
      {tab==="ventas"     && <VendasCompras vendas={vendas} setVendas={setVendas} compras={compras} setCompras={setCompras}/>}
      {tab==="mortes"     && <Mortes mortes={mortes} setMortes={setMortes} animals={animals} setAnimals={setAnimals}/>}
      {tab==="custos"     && <Custos custos={custos} setCustos={setCustos}/>}
      {tab==="pasturas"   && <Pasturas pasturas={pasturas} setPasturas={setPasturas}/>}
      {tab==="potreros"   && <Potreros animals={animals} potreros={potreros} setPotreros={setPotreros}/>}
    </div>
  </div>;
}
