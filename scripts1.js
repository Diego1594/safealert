"use strict";
/* ============ UTILIDADES ============ */
const $ = (s, r = document) => r.querySelector(s),
  $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const T = (m) =>
  String(Math.floor(m / 60)).padStart(2, "0") +
  ":" +
  String(m % 60).padStart(2, "0");
const T12 = (m) => {
  const h = Math.floor(m / 60);
  return (
    String(h % 12 || 12).padStart(2, "0") +
    ":" +
    String(m % 60).padStart(2, "0") +
    (h < 12 ? " a. m." : " p. m.")
  );
};
const num = (n) => n.toLocaleString("en-US");
const dist = (m) =>
  m >= 1000 ? (m / 1000).toFixed(1).replace(/\.0$/, "") + " km" : m + " m";
const walk = (m) => Math.max(1, Math.round(m / 75));
const ago = (t) => {
  const d = S.clock - t;
  return d < 1
    ? "ahora"
    : d < 60
      ? `hace ${d} min`
      : `hace ${Math.floor(d / 60)} h`;
};
const clr = {
  ok: "#16a34a",
  casi: "#ea580c",
  lleno: "#dc2626",
  cerrado: "#94a3b8",
};

/* ============ CATÁLOGOS ============ */
const RT = {
  bloqueo: ["🚧", "Bloqueo de vía"],
  derrumbe: ["🪨", "Derrumbe"],
  inundacion: ["🌊", "Inundación"],
  heridos: ["🩸", "Heridos"],
  incendio: ["🔥", "Incendio"],
  otro: ["❓", "Otro"],
};
const LV = {
  critico: { t: "Emergencia", s: "Crítico", c: "red", n: 3 },
  alto: { t: "Riesgo alto", s: "Alto", c: "orange", n: 2 },
  medio: { t: "Precaución", s: "Medio", c: "yellow", n: 1 },
  info: { t: "Informativo", s: "Informativo", c: "blue", n: 0 },
};
const KIND = {
  huaico: ["🌊", "Huaico"],
  sismo: ["🌍", "Sismo"],
  inundacion: ["💧", "Inundación"],
  lluvia: ["🌧️", "Lluvia"],
  gas: ["⚠️", "Fuga de gas"],
  incendio: ["🔥", "Incendio"],
  otro: ["🚨", "Otra emergencia"],
};
const NAV = {
  residente: [
    ["dashboard", "🏠", "Dashboard"],
    ["alertas", "🚨", "Alertas", "a"],
    ["mapa", "🗺️", "Mapa de riesgo"],
    ["evacuacion", "🏃", "Evacuación"],
    ["refugios", "🏫", "Refugios"],
    ["familiares", "👨‍👩‍👧", "Familiares"],
    ["reportar", "📝", "Reportar"],
    ["asistente", "🤖", "Asistente IA"],
    ["config", "⚙️", "Configuración"],
  ],
  visitante: [
    ["dashboard", "🧭", "Dashboard"],
    ["alertas", "🚨", "Alertas"],
    ["navegacion", "📍", "Navegación"],
    ["brujula", "🧭", "Brújula escape"],
    ["refugios", "🏫", "Refugios"],
    ["reportar", "📝", "Reportar"],
    ["sos", "🆘", "SOS"],
  ],
  serenazgo: [
    ["dashboard", "📊", "Dashboard operativo"],
    ["mapa", "🗺️", "Mapa táctico"],
    ["alertas", "🚨", "Alertas", "a"],
    ["triaje", "📋", "Triaje reportes"],
    ["bloqueos", "🚧", "Bloqueos viales"],
    ["refugios", "🏫", "Refugios"],
    ["unidades", "🚓", "Unidades"],
    ["sos", "🆘", "SOS / Rescate", "s"],
    ["stats", "📈", "Estadísticas"],
  ],
};
const ROLE = {
  residente: { n: "Residente", e: "🏘️", u: "Rosa Quispe" },
  visitante: { n: "Visitante", e: "🧭", u: "Visitante" },
  serenazgo: { n: "Serenazgo", e: "🚓", u: "Agente Lima" },
};
const ZONES = {
  z1: { x: 400, y: 90, w: 220, h: 170, c: "#dc2626", f: "rgba(230,0,18,.17)" },
  z2: {
    x: 640,
    y: 215,
    w: 130,
    h: 100,
    c: "#ea580c",
    f: "rgba(234,88,12,.16)",
  },
};
const ST = {
  h: [
    [60, "Av. Central", 500],
    [160, "Av. Los Héroes", 140],
    [260, "Jr. Las Flores", 150],
    [360, "Av. Principal", 560],
  ],
  v: [
    [220, "Jr. San Martín", 300],
    [340, "Jr. Los Álamos", 110],
    [580, "Av. Quebrada", 330],
  ],
};

/* ============ ESTADO (fuente única de datos) ============ */
const initState = () => ({
  clock: 9 * 60 + 31,
  me: {
    name: "Rosa Quispe",
    safe: false,
    arrived: false,
    evac: false,
    x: 220,
    y: 360,
  },
  target: null,
  navStep: 0,
  mySOS: null,
  draft: { type: null, desc: "", photo: false, audio: false },
  tab: {},
  evacuated: 178,
  chat: [
    {
      r: "b",
      t: "Hola Rosa, soy el asistente de SafeAlert. Puedo orientarte sobre alertas, rutas y refugios. Recuerda: las alertas oficiales tienen prioridad.",
    },
  ],
  alerts: [
    {
      id: 1,
      kind: "huaico",
      title: "Riesgo de huaico en Sector Ate-Quebrada",
      short: "Huaico · Sector Ate-Quebrada",
      level: "critico",
      t: 564,
      src: "INDECI",
      users: 4250,
      status: "activa",
      dist: 1800,
      zone: "z1",
      today: true,
      seen: true,
      msg: "Incremento de caudal detectado en la quebrada. El huaico se aproxima desde el este. Evacúa hacia el norte o hacia el refugio más cercano.",
    },
    {
      id: 2,
      kind: "sismo",
      title: "Sismo M 4.2 al sur de Lima",
      short: "Sismo · Lima Sur",
      level: "alto",
      t: 490,
      src: "IGP",
      users: 28000,
      status: "activa",
      dist: 12000,
      today: true,
      seen: true,
      msg: "Sismo de magnitud 4.2 registrado al sur de Lima. No se espera tsunami. Mantén la calma y revisa posibles daños en tu entorno.",
    },
    {
      id: 3,
      kind: "inundacion",
      title: "Inundación en Av. Las Flores",
      short: "Inundación · Av. Las Flores",
      level: "medio",
      t: 465,
      src: "Serenazgo",
      users: 3100,
      status: "activa",
      dist: 900,
      zone: "z2",
      today: true,
      seen: true,
      msg: "Acumulación de agua en Av. Las Flores. Evita la zona y usa rutas alternas.",
    },
    {
      id: 4,
      kind: "lluvia",
      title: "Lluvia intensa prevista para esta tarde",
      short: "Lluvia · Todo Lima",
      level: "info",
      t: 1110,
      src: "SENAMHI",
      users: 120000,
      status: "resuelta",
      dist: null,
      today: false,
      seen: true,
      msg: "Lluvia intensa prevista desde las 18:30. Riesgo bajo de inundación en zonas bajas.",
    },
    {
      id: 5,
      kind: "gas",
      title: "Fuga de gas controlada en Av. Central",
      short: "Fuga de gas · Av. Central",
      level: "medio",
      t: 400,
      src: "Bomberos",
      users: 800,
      status: "resuelta",
      dist: 2100,
      today: true,
      seen: true,
      msg: "La fuga fue controlada por Bomberos. Ya no hay riesgo.",
    },
  ],
  shelters: [
    {
      id: 1,
      name: "Colegio San Martín",
      addr: "Jr. San Martín 120, Ate",
      cap: 450,
      occ: 120,
      dist: 450,
      x: 220,
      y: 150,
      closed: false,
    },
    {
      id: 2,
      name: "Centro Municipal Ate",
      addr: "Av. Central 450, Ate",
      cap: 300,
      occ: 240,
      dist: 1200,
      x: 700,
      y: 360,
      closed: false,
    },
    {
      id: 3,
      name: "Parroquia San Pedro",
      addr: "Jr. Cusco 310, Ate",
      cap: 200,
      occ: 60,
      dist: 1800,
      x: 100,
      y: 160,
      closed: false,
    },
    {
      id: 4,
      name: "Coliseo Municipal",
      addr: "Av. Los Héroes 1020, Ate",
      cap: 800,
      occ: 800,
      dist: 2300,
      x: 700,
      y: 60,
      closed: false,
    },
    {
      id: 5,
      name: "Losa Deportiva Santa Clara",
      addr: "Calle 5, Urb. Santa Clara, Ate",
      cap: 250,
      occ: 40,
      dist: 2600,
      x: 460,
      y: 360,
      closed: false,
    },
  ],
  reports: [
    {
      id: 1,
      type: "derrumbe",
      loc: "Jr. Los Álamos",
      user: "Carlos M.",
      t: 550,
      prio: "alta",
      status: "pendiente",
      x: 340,
      y: 200,
      unit: null,
    },
    {
      id: 2,
      type: "inundacion",
      loc: "Av. Las Flores",
      user: "María R.",
      t: 545,
      prio: "alta",
      status: "pendiente",
      x: 640,
      y: 260,
      unit: null,
    },
    {
      id: 3,
      type: "derrumbe",
      loc: "Quebrada Norte",
      user: "Luis T.",
      t: 535,
      prio: "media",
      status: "verificado",
      x: 520,
      y: 100,
      unit: "S-03",
    },
    {
      id: 4,
      type: "heridos",
      loc: "Av. Central",
      user: "Jorge V.",
      t: 520,
      prio: "alta",
      status: "revision",
      x: 300,
      y: 60,
      unit: null,
    },
    {
      id: 5,
      type: "bloqueo",
      loc: "Jr. Lima",
      user: "Vecino",
      t: 455,
      prio: "baja",
      status: "verificado",
      x: 100,
      y: 360,
      unit: null,
    },
    {
      id: 6,
      type: "incendio",
      loc: "Jr. Cusco",
      user: "Anónimo",
      t: 430,
      prio: "media",
      status: "rechazado",
      x: 460,
      y: 300,
      unit: null,
    },
    {
      id: 7,
      type: "otro",
      loc: "Av. Principal",
      user: "Rocío S.",
      t: 465,
      prio: "baja",
      status: "verificado",
      x: 500,
      y: 360,
      unit: null,
    },
  ],
  blocks: [
    {
      id: 1,
      street: "Jr. Los Álamos cdra 3",
      cause: "Derrumbe",
      t: 550,
      prio: "alta",
      active: true,
      x: 340,
      y: 200,
    },
    {
      id: 2,
      street: "Av. Las Flores cdra 8",
      cause: "Inundación",
      t: 530,
      prio: "media",
      active: true,
      x: 640,
      y: 260,
    },
    {
      id: 3,
      street: "Jr. Lima cdra 2",
      cause: "Bloqueo ciudadano",
      t: 450,
      prio: "baja",
      active: false,
      x: 100,
      y: 360,
    },
  ],
  units: [
    {
      id: "S-01",
      op: "Agente Torres",
      loc: "Av. Principal",
      st: "disponible",
      mission: "En patrulla",
      x: 300,
      y: 360,
    },
    {
      id: "S-02",
      op: "Agente Flores",
      loc: "Jr. Los Álamos",
      st: "ruta",
      mission: "Evacuación zona 3B",
      x: 340,
      y: 230,
    },
    {
      id: "S-03",
      op: "Agente Lima",
      loc: "Quebrada Norte",
      st: "emergencia",
      mission: "Rescate SOS",
      x: 560,
      y: 110,
    },
    {
      id: "S-04",
      op: "Agente Ríos",
      loc: "Av. Las Flores",
      st: "disponible",
      mission: "Apoyo comunidad",
      x: 580,
      y: 262,
    },
    {
      id: "S-05",
      op: "Agente Castro",
      loc: "Base",
      st: "fuera",
      mission: "Mantenimiento",
      x: null,
      y: null,
    },
  ],
  sos: [
    {
      id: 1,
      name: "Carlos Mendoza",
      loc: "Jr. Lima 234",
      t: 558,
      prio: "alta",
      msg: "Atrapado en primer piso con agua",
      lat: -12.023,
      lon: -76.891,
      status: "pendiente",
      unit: null,
      x: 160,
      y: 230,
    },
    {
      id: 2,
      name: "Ana Pérez",
      loc: "Av. Central 890",
      t: 564,
      prio: "media",
      msg: "Anciana sola sin poder salir",
      lat: -12.031,
      lon: -76.887,
      status: "asignado",
      unit: "S-03",
      x: 480,
      y: 60,
    },
  ],
  family: [
    { n: "Mamá", e: "👩", loc: "Av. Central, Ate", st: "salvo" },
    { n: "Papá", e: "👨", loc: "En ruta al refugio", st: "evac" },
    { n: "Hermano", e: "🧑", loc: "Sin conexión · últ. hace 1 h", st: "pend" },
  ],
});
let S = Object.assign(initState(), {
  role: null,
  page: "dashboard",
  view: "landing",
  menu: false,
  loginRole: "residente",
  cfg: { notif: true, lvl: 1, realtime: true, size: 0, dark: false, hc: false },
});

/* ============ DERIVADOS ============ */
const actAlerts = () => S.alerts.filter((a) => a.status === "activa");
const nearAlerts = () =>
  actAlerts().filter((a) => a.dist != null && a.dist <= 3000);
const topAlert = () =>
  nearAlerts().sort((a, b) => LV[b.level].n - LV[a.level].n || b.t - a.t)[0];
const shSt = (s) =>
  s.closed
    ? "cerrado"
    : s.occ >= s.cap
      ? "lleno"
      : s.occ / s.cap >= 0.7
        ? "casi"
        : "ok";
const shBadge = (s) =>
  ({
    cerrado: ["gray", "Cerrado"],
    lleno: ["red", "Lleno"],
    casi: ["orange", "Casi lleno"],
    ok: ["green", "Disponible"],
  })[shSt(s)];
const avail = () =>
  S.shelters
    .filter((s) => ["ok", "casi"].includes(shSt(s)))
    .sort((a, b) => a.dist - b.dist);
const nearest = () => avail()[0] || null;
const tgt = () => {
  const s = S.shelters.find((x) => x.id === S.target);
  return s && ["ok", "casi"].includes(shSt(s)) ? s : nearest();
};
const actSOS = () => S.sos.filter((s) => s.status !== "atendido");
const pendRep = () =>
  S.reports.filter((r) => r.status === "pendiente" || r.status === "revision");
const actBlocks = () => S.blocks.filter((b) => b.active);
const riskOf = () => {
  const a = topAlert();
  if (!a) return ["BAJO", "blue"];
  return LV[a.level].n >= 2 ? ["ALTO", "red"] : ["MEDIO", "yellow"];
};
const ucount = () => S.units.filter((u) => u.st !== "fuera").length;
function routePts(s) {
  const u = S.me,
    p = [
      [u.x, u.y],
      [u.x, s.y],
      [s.x, s.y],
    ];
  return p.filter(
    (q, i) => i === 0 || q[0] !== p[i - 1][0] || q[1] !== p[i - 1][1],
  );
}
function steps(s) {
  const P = routePts(s),
    segs = [];
  let tot = 0;
  for (let i = 1; i < P.length; i++) {
    const dx = P[i][0] - P[i - 1][0],
      dy = P[i][1] - P[i - 1][1],
      len = Math.abs(dx) + Math.abs(dy);
    if (len) {
      segs.push({ dx: Math.sign(dx), dy: Math.sign(dy), len });
      tot += len;
    }
  }
  const k = s.dist / tot;
  let out = [],
    pv = null,
    acc = 0;
  segs.forEach((g, i) => {
    const m =
      i === segs.length - 1 ? s.dist - acc : Math.round((g.len * k) / 10) * 10;
    acc += m;
    const card =
        g.dy < 0 ? "norte" : g.dy > 0 ? "sur" : g.dx > 0 ? "este" : "oeste",
      arrow = g.dy < 0 ? "↑" : g.dy > 0 ? "↓" : g.dx > 0 ? "→" : "←";
    let turn = "";
    if (pv) turn = pv.dx * g.dy - pv.dy * g.dx > 0 ? "derecha" : "izquierda";
    out.push({ m, card, arrow, turn });
    pv = g;
  });
  out.push({ m: 0, arrow: "🏁", end: true });
  return out;
}
const stepText = (st, s, i) =>
  st.end
    ? `Llegas a ${s.name}`
    : i === 0
      ? `Camina ${st.m} m hacia el ${st.card}`
      : `Gira a la ${st.turn} y camina ${st.m} m hacia el ${st.card}`;
const bearing = (s) => {
  const dx = s.x - S.me.x,
    dy = s.y - S.me.y;
  return (Math.round((Math.atan2(dx, -dy) * 180) / Math.PI) + 360) % 360;
};
const cardinal = (b) =>
  [
    "NORTE",
    "NORESTE",
    "ESTE",
    "SURESTE",
    "SUR",
    "SUROESTE",
    "OESTE",
    "NOROESTE",
  ][Math.round(b / 45) % 8];

/* ============ MAPA SVG ============ */
function mapSVG(L) {
  const xs = [0, 100, 220, 340, 460, 580, 700, 800],
    ys = [0, 60, 160, 260, 360, 420];
  let s = '<rect width="800" height="420" fill="#e8eef6"/>';
  ST.h.forEach(
    (h) =>
      (s += `<line x1="0" x2="800" y1="${h[0]}" y2="${h[0]}" stroke="#fff" stroke-width="22"/>`),
  );
  [100, 220, 340, 460, 580, 700].forEach(
    (x) =>
      (s += `<line y1="0" y2="420" x1="${x}" x2="${x}" stroke="#fff" stroke-width="22"/>`),
  );
  for (let i = 0; i < 7; i++)
    for (let j = 0; j < 5; j++) {
      const w = xs[i + 1] - xs[i] - 22,
        h = ys[j + 1] - ys[j] - 22;
      s += `<rect x="${xs[i] + 11}" y="${ys[j] + 11}" width="${w}" height="${h}" rx="4" fill="#d3dce9"/>`;
    }
  ST.h.forEach(
    (h) =>
      (s += `<text x="${h[2]}" y="${h[0] + 3}" font-size="10" font-weight="600" fill="#5b6b82" text-anchor="middle">${h[1]}</text>`),
  );
  ST.v.forEach(
    (v) =>
      (s += `<text transform="translate(${v[0] + 3},${v[2]}) rotate(-90)" font-size="10" font-weight="600" fill="#5b6b82" text-anchor="middle">${v[1]}</text>`),
  );
  if (L.has("zones"))
    actAlerts()
      .filter((a) => a.zone)
      .forEach((a) => {
        const z = ZONES[a.zone],
          cx = z.x + z.w / 2,
          cy = z.y + z.h / 2;
        s += `<rect x="${z.x}" y="${z.y}" width="${z.w}" height="${z.h}" rx="10" fill="${z.f}" stroke="${z.c}" stroke-width="2.5" stroke-dasharray="8 6"/><polygon points="${cx},${cy - 22} ${cx + 20},${cy + 14} ${cx - 20},${cy + 14}" fill="${z.c}"/>`;
      });
  if (L.has("route")) {
    const t = tgt();
    if (t)
      s += `<polyline class="${S.me.evac ? "flow" : ""}" points="${routePts(t)
        .map((p) => p.join(","))
        .join(
          " ",
        )}" fill="none" stroke="#22a85a" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`;
  }
  if (L.has("blocks"))
    actBlocks().forEach(
      (b) =>
        (s += `<g><rect x="${b.x - 14}" y="${b.y - 14}" width="28" height="28" rx="6" fill="#dc2626"/><text x="${b.x}" y="${b.y + 6}" font-size="16" text-anchor="middle">🚧</text></g>`),
    );
  if (L.has("reports"))
    S.reports
      .filter((r) => r.status !== "rechazado")
      .forEach(
        (r) =>
          (s += `<g><circle cx="${r.x}" cy="${r.y}" r="11" fill="#f59e0b" stroke="#fff" stroke-width="2"/><text x="${r.x}" y="${r.y + 4}" font-size="12" font-weight="800" fill="#fff" text-anchor="middle">!</text></g>`),
      );
  if (L.has("shelters"))
    S.shelters.forEach(
      (h) =>
        (s += `<g><circle cx="${h.x}" cy="${h.y}" r="16" fill="${clr[shSt(h)]}" stroke="#fff" stroke-width="3"/><text x="${h.x}" y="${h.y + 5}" font-size="14" text-anchor="middle">🏫</text></g>`),
    );
  if (L.has("units"))
    S.units
      .filter((u) => u.x != null && u.st !== "fuera")
      .forEach(
        (u) =>
          (s += `<g><circle cx="${u.x}" cy="${u.y}" r="13" fill="#7c3aed" stroke="#fff" stroke-width="3"/><text x="${u.x}" y="${u.y + 4}" font-size="11" font-weight="800" fill="#fff" text-anchor="middle">S</text></g>`),
      );
  if (L.has("sos"))
    actSOS().forEach(
      (o) =>
        (s += `<g class="pulse"><circle cx="${o.x}" cy="${o.y}" r="14" fill="#dc2626" stroke="#fff" stroke-width="3"/><text x="${o.x}" y="${o.y + 3.5}" font-size="9" font-weight="800" fill="#fff" text-anchor="middle">SOS</text></g>`),
    );
  if (L.has("me"))
    s += `<circle class="pulse" cx="${S.me.x}" cy="${S.me.y}" r="34" fill="rgba(37,99,235,.2)"/><circle cx="${S.me.x}" cy="${S.me.y}" r="15" fill="#2563eb" stroke="#fff" stroke-width="3"/><text x="${S.me.x}" y="${S.me.y + 4}" font-size="11" font-weight="800" fill="#fff" text-anchor="middle">Tú</text>`;
  return s;
}
function mapBox(layers, cls = "") {
  const L = new Set(layers);
  const lg = [
    L.has("me") && ["#2563eb", "Mi ubicación"],
    L.has("shelters") && ["#16a34a", "Refugio"],
    L.has("zones") && ["#f87171", "Zona peligro"],
    L.has("route") && ["#22a85a", "Ruta segura"],
    L.has("units") && ["#7c3aed", "Unidad"],
    L.has("sos") && ["#dc2626", "SOS"],
    L.has("blocks") && ["#dc2626", "Bloqueo"],
    L.has("reports") && ["#f59e0b", "Reporte"],
  ].filter(Boolean);
  return `<div class="map ${cls}" data-z="1" data-cx="400" data-cy="210"><svg viewBox="0 0 800 420" preserveAspectRatio="xMidYMid meet">${mapSVG(L)}</svg><div class="legend"><b>Leyenda</b><br>${lg.map((l) => `<div><i style="background:${l[0]}"></i>${l[1]}</div>`).join("")}</div><div class="mc"><button data-a="zoom" data-v="1" aria-label="Acercar">+</button><button data-a="zoom" data-v="-1" aria-label="Alejar">−</button><button data-a="locate" aria-label="Centrar">⌖</button></div></div>`;
}
function applyView(m) {
  const z = +m.dataset.z,
    w = 800 / z,
    h = 420 / z;
  let cx = +m.dataset.cx,
    cy = +m.dataset.cy;
  cx = Math.min(800 - w / 2, Math.max(w / 2, cx));
  cy = Math.min(420 - h / 2, Math.max(h / 2, cy));
  $("svg", m).setAttribute("viewBox", `${cx - w / 2} ${cy - h / 2} ${w} ${h}`);
}

/* ============ COMPONENTES ============ */
const badge = (c, t) => `<span class="badge bg-${c}">${t}</span>`;
const lvBadge = (l) => badge(LV[l].c, "● " + LV[l].t.toUpperCase());
const tabsHTML = (key, list, def) => {
  const cur = S.tab[key] || def;
  return `<div class="tabs">${list.map(([v, l]) => `<button class="tab ${cur === v ? "on" : ""}" data-a="tab" data-k="${key}" data-v="${v}">${l}</button>`).join("")}</div>`;
};
const kpi = (ic, bg, v, l, sub, cls = "", col = "") =>
  `<div class="card kpi ${cls}"><div class="ic" style="background:${bg}">${ic}</div><div class="v ${col}">${v}</div><div class="l">${l}</div>${sub ? `<div class="xs muted">${sub}</div>` : ""}</div>`;
const bar = (s) =>
  `<div class="prog"><i style="width:${Math.min(100, (s.occ / s.cap) * 100)}%;background:${clr[shSt(s)]}"></i></div>`;
const aT = (a) => (a.today ? T(a.t) : "Ayer " + T(a.t));
function modal(h) {
  $("#modal").innerHTML =
    `<div class="ov" data-a="mclose"><div class="md" role="dialog" aria-modal="true">${h}</div></div>`;
}
const closeModal = () => {
  $("#modal").innerHTML = "";
};
function toast(m, t = "") {
  const e = document.createElement("div");
  e.className = "toast " + t;
  e.textContent = m;
  $("#toasts").append(e);
  setTimeout(() => e.remove(), 3600);
}
const go = (p) => {
  location.hash = "#/" + p;
};
const goApp = (p) => go(`app/${S.role}/${p}`);

/* ============ LANDING ============ */
function landing() {
  const a = topAlert();
  return `<div class="lnav"><div class="logo"><i>🛡️</i>SafeAlert</div><nav><a data-a="scroll" data-v="funciones">Funciones</a><a data-a="scroll" data-v="acerca">Acerca de</a><a data-a="scroll" data-v="instituciones">Instituciones</a></nav><button class="btn navy" data-a="go" data-v="login" style="padding:.5rem 1rem;font-size:.8rem">Iniciar sesión →</button></div>
 <section class="hero">${a ? `<div class="float f1">🚨 ALERTA ACTIVA · ${esc(KIND[a.kind][1])} · Ate</div>` : ""}<div class="float f2">✅ Refugio disponible · ${nearest() ? dist(nearest().dist) : "—"}</div>
 <span class="pill">● Sistema activo · Lima, Perú</span><h1>Alertas tempranas que<br><span>salvan vidas</span></h1>
 <p>SafeAlert es la plataforma peruana de alerta geolocalizada para sismos, huaicos e inundaciones. Alertas inteligentes, rutas de evacuación y coordinación con Serenazgo y Defensa Civil.</p>
 <div class="row wrap" style="justify-content:center"><button class="btn red" data-a="go" data-v="login">🚨 Ingresar al sistema</button><button class="btn" style="background:rgba(255,255,255,.18);color:#fff" data-a="go" data-v="login">Ver demostración →</button></div></section>
 <section class="sec" id="acerca"><div class="eb">DISEÑADO PARA TRES SEGMENTOS</div><h2>Una plataforma, tres experiencias</h2><div class="seg">
 ${[
   [
     "residente",
     "🏘️",
     "#dcfce7",
     "Residente",
     "Para familias en zonas vulnerables. Recibe alertas, monitorea a tu familia y encuentra rutas de evacuación.",
     "c-green",
   ],
   [
     "visitante",
     "🧭",
     "#dbeafe",
     "Visitante / Flotante",
     "Para personas en tránsito. Navegación de emergencia, brújula de escape y botón SOS.",
     "c-blue",
   ],
   [
     "serenazgo",
     "🚓",
     "#ede9fe",
     "Serenazgo / COEL",
     "Centro de operaciones. Mapa táctico, triaje de reportes, gestión de unidades y envío de alertas.",
     "",
   ],
 ]
   .map(
     (x) =>
       `<div class="card" data-a="segment" data-v="${x[0]}"><div class="ic" style="background:${x[2]}">${x[1]}</div><h3>${x[3]}</h3><p class="sm muted" style="margin:.4rem 0 .8rem">${x[4]}</p><span class="sm b ${x[5]}" ${x[5] ? "" : 'style="color:#7c3aed"'}>Ver dashboard →</span></div>`,
   )
   .join("")}</div></section>
 <section class="sec dark-sec" id="funciones"><h2>Funciones clave</h2><div class="feat">${[
   ["📍", "Alertas geolocalizadas"],
   ["🗺️", "Mapa de riesgo en tiempo real"],
   ["🏃", "Rutas de evacuación"],
   ["🤖", "Asistente IA"],
   ["👨‍👩‍👧", "Monitoreo de familiares"],
   ["📝", "Reportes ciudadanos"],
   ["🆘", "Botón SOS"],
   ["🚓", "Coordinación con Serenazgo"],
 ]
   .map((f) => `<div><b>${f[0]}</b>${f[1]}</div>`)
   .join("")}</div></section>
 <section class="sec" id="instituciones"><h2>Instituciones</h2><div class="inst">${["Serenazgo de Lima", "Defensa Civil", "INDECI", "IGP", "SENAMHI", "Cuerpo de Bomberos", "SAMU"].map((i) => `<span class="badge bg-gray" style="font-size:.85rem;padding:.5rem 1rem">${i}</span>`).join("")}</div></section>
 <div class="foot">© 2026 SafeAlert · Lima, Perú · Prototipo de demostración con datos ficticios. No reemplaza las alertas oficiales.</div>`;
}

/* ============ LOGIN ============ */
function login() {
  const r = S.loginRole;
  return `<div class="login"><div class="lp"><div class="logo"><i style="background:rgba(255,255,255,.12)">🛡️</i>SafeAlert</div><div class="sp"></div>
 <span class="pill" style="align-self:flex-start">● Sistema activo</span><h1>Protección inteligente para Lima</h1><p style="color:#a9c8f5">Alertas geolocalizadas, rutas de evacuación en tiempo real y coordinación con Serenazgo y Defensa Civil.</p>
 <ul><li>🔴 Alertas verificadas en tiempo real</li><li>📍 Geolocalización inteligente</li><li>🏃 Rutas de evacuación optimizadas</li><li>👨‍👩‍👧 Monitoreo de familiares</li></ul><div class="sp"></div><div class="xs" style="color:#6fb0ff">© 2026 SafeAlert · Lima, Perú</div></div>
 <div class="rp"><div class="in"><h1 style="text-align:center;font-size:1.9rem">Bienvenido de vuelta</h1><p class="muted" style="text-align:center;margin-bottom:1.2rem">Ingresa tus credenciales para continuar</p>
 <div class="card"><div class="xs b muted">DEMO: SELECCIONA TU ROL</div><div class="roles">${Object.entries(
   ROLE,
 )
   .map(
     ([k, v]) =>
       `<button type="button" class="role ${r === k ? "sel" : ""}" data-a="selRole" data-v="${k}"><span class="e">${v.e}</span>${k === "serenazgo" ? "Serenazgo" : v.n}</button>`,
   )
   .join("")}</div></div>
 <form class="card mt" id="lf"><label style="margin-top:0" for="em">Correo electrónico</label><input id="em" type="email" placeholder="usuario@lima.gob.pe" autocomplete="email">
 <label for="pw">Contraseña</label><div style="position:relative"><input id="pw" type="password" value="12345678"><button type="button" data-a="pw" style="position:absolute;right:.8rem;top:.7rem" aria-label="Mostrar contraseña">👁️</button></div>
 <div class="row mt"><label class="row" style="margin:0;font-weight:400"><input type="checkbox" style="width:auto"> Recordarme</label><div class="sp"></div><a class="c-blue sm" href="#/login" data-a="forgot">¿Olvidaste tu contraseña?</a></div>
 <button class="btn navy full mt" type="submit">Iniciar sesión →</button><div class="xs muted" style="text-align:center;margin-top:.9rem">Modo demostración: cualquier correo y contraseña son válidos.</div><div class="sm muted" style="text-align:center;margin-top:.6rem">🔒 Conexión cifrada SSL · Sistema oficial</div></form>
 <div style="text-align:center;margin-top:1rem"><a class="sm muted" href="#/">← Volver al inicio</a></div></div></div></div>`;
}

/* ============ SHELL ============ */
function shell() {
  const r = S.role,
    P = PAGES[r][S.page](),
    R = ROLE[r];
  const badgeN = { a: actAlerts().length, s: actSOS().length };
  return `<div class="app"><aside class="sb ${S.menu ? "open" : ""}"><div class="brand"><i>🛡️</i><div><b>SafeAlert</b><div class="xs" style="color:#7db4ff">Sistema de alertas</div></div></div>
 <div class="sess s-${r}">Sesión como<b>${R.e} ${R.n}</b></div>
 <nav>${NAV[r].map((n) => `<a class="ni ${S.page === n[0] ? "on" : ""}" href="#/app/${r}/${n[0]}"><span>${n[1]}</span>${n[2]}${n[3] && badgeN[n[3]] ? `<span class="n">${badgeN[n[3]]}</span>` : ""}</a>`).join("")}</nav>
 <div class="sbf"><small>DEMO: CAMBIAR ROL</small>${Object.keys(ROLE)
   .filter((k) => k !== r)
   .map((k) => `<a href="#/app/${k}/dashboard">${ROLE[k].e} ${ROLE[k].n}</a>`)
   .join(
     "",
   )}<button class="lo" data-a="logout">← Cerrar sesión</button></div></aside><div class="scrim" data-a="menu"></div>
 <div class="main"><header class="top"><button class="burger" data-a="menu" aria-label="Menú">☰</button><div><h2>${P.t}</h2><div class="xs muted">SafeAlert · Lima, Perú</div></div><div class="sp"></div><span class="chip">● Ate, Lima</span><span class="sm muted loc">📍 Ate, Lima</span><a class="bell" href="#/app/${r}/alertas" aria-label="Alertas">🔔${actAlerts().length ? "<i></i>" : ""}</a><div class="row who"><div class="av" style="width:2.2rem">${R.u[0]}</div><div style="line-height:1.15"><div class="sm b">${R.u}</div><div class="xs muted">${R.n}</div></div></div></header>
 <main class="page ${P.w || ""}">${P.h}</main></div></div>`;
}

/* ============ PÁGINAS ============ */
const alertRow = (a) =>
  `<div data-a="alertView" data-v="${a.id}" style="cursor:pointer"><div class="aic">${KIND[a.kind][0]}</div><div class="sp"><div><b>${esc(a.title)}</b> ${badge("green", "✓ Oficial")}</div><div class="xs muted">🕒 ${aT(a)} · 📍 ${a.dist != null ? dist(a.dist) : "–"} · ${esc(a.src)}</div></div>${lvBadge(a.level)}</div>`;
const shelterCard = (s, i, role) => {
  const [c, t] = shBadge(s),
    full = ["lleno", "cerrado"].includes(shSt(s));
  return `<div class="card"><div class="row"><b>🏫 ${esc(s.name)}</b>${role === "residente" && nearest() && nearest().id === s.id ? '<span class="badge navy">Más cercano</span>' : ""}<div class="sp"></div>${badge(c, t)}</div><div class="sm muted" style="margin:.2rem 0 .6rem">📍 ${dist(s.dist)} · ${esc(s.addr)}</div>
 <div class="row"><div class="sp">${bar(s)}</div><span class="sm b">${s.occ}/${s.cap}</span></div>
 ${full && shSt(s) === "lleno" && avail()[0] ? `<div class="banner" style="background:#fde4e6;color:#b91c1c;padding:.6rem .8rem;margin-top:.7rem;font-size:.82rem">🔴 Refugio lleno · Alternativa: ${esc(avail()[0].name)} (${dist(avail()[0].dist)})</div>` : ""}
 <div class="g2 mt" style="gap:.6rem"><button class="btn navy" data-a="howto" data-v="${s.id}" ${full ? "disabled" : ""}>🗺️ ${role === "visitante" ? "Ir aquí" : "Cómo llegar"}</button><button class="btn out-g" data-a="arrive" data-v="${s.id}" ${full ? "disabled" : ""}>✅ ${role === "visitante" ? "Llegué" : "Confirmar llegada"}</button></div></div>`;
};
const reportForm = () => {
  const d = S.draft;
  return `<div class="card"><div class="b mb">Tipo de incidente</div><div class="rt-grid">${Object.entries(
    RT,
  )
    .map(
      ([k, v]) =>
        `<button class="rt ${d.type === k ? "sel" : ""}" data-a="selType" data-v="${k}"><span>${v[0]}</span>${v[1]}</button>`,
    )
    .join("")}</div>
 <div class="card mt" style="background:var(--soft);box-shadow:none;padding:.7rem 1rem"><div class="xs muted">Ubicación detectada</div><b>📍 Av. Principal, Ate · Lima</b></div>
 <textarea id="repDesc" rows="3" class="mt" placeholder="Describe brevemente lo que ves…">${esc(d.desc)}</textarea>
 <div class="g2 mt" style="gap:.6rem"><button class="btn ghost" id="bPhoto" data-a="attach" data-v="photo">${d.photo ? "✅ Foto adjunta" : "📷 Foto"}</button><button class="btn ghost" id="bAudio" data-a="attach" data-v="audio">${d.audio ? "✅ Audio adjunto" : "🎤 Audio"}</button></div>
 <button class="btn navy full mt" id="sendRep" data-a="sendReport" ${d.type ? "" : "disabled"}>📤 Enviar reporte</button><div class="xs muted mt" id="repHint" style="text-align:center">${d.type ? "Tu reporte será revisado por Serenazgo." : "Selecciona un tipo de incidente para poder enviar."}</div></div>`;
};
const sosCard = () => {
  if (S.mySOS) {
    const o = S.sos.find((x) => x.id === S.mySOS);
    return `<div class="card" style="border:2px solid #86efac;text-align:center"><div style="font-size:3rem">✅</div><h3>SOS enviado</h3><p class="muted sm" style="margin:.5rem 0 1rem">Serenazgo y Defensa Civil recibieron tu ubicación GPS (${o ? o.lat + ", " + o.lon : ""}). Mantén la calma y permanece en un lugar seguro.</p><div class="badge bg-yellow">Estado: ${o ? o.status : ""}</div><div class="mt"><button class="btn ghost" data-a="sosCancel">Cancelar SOS</button></div></div>`;
  }
  return `<div class="card" style="border:2px solid #fecdd3;text-align:center"><div style="font-size:3rem">🆘</div><h3>¿Confirmar SOS?</h3><p class="muted sm" style="margin:.4rem 0 1rem">Se enviará tu ubicación GPS a Serenazgo y Defensa Civil.</p><textarea id="sosMsg" rows="2" placeholder="Mensaje adicional (opcional)"></textarea><div class="g2 mt" style="gap:.6rem"><button class="btn ghost" data-a="${S.role === "residente" ? "mclose" : "back"}">Cancelar</button><button class="btn red" data-a="sosConfirm">🆘 CONFIRMAR SOS</button></div></div>`;
};

const PAGES = { residente: {}, visitante: {}, serenazgo: {} };
/* ---- RESIDENTE ---- */
PAGES.residente.dashboard = () => {
  const a = topAlert(),
    n = nearest(),
    [rk, rc] = riskOf(),
    fam = S.family.filter((f) => f.st === "salvo").length + (S.me.safe ? 0 : 0);
  return {
    t: "Dashboard",
    h: `<div class="split2 g2" style="grid-template-columns:2fr 1fr"><div class="card hi"><div class="sm" style="color:#bcd6ff">${Math.floor(S.clock / 60) < 12 ? "Buenos días," : "Buenas tardes,"}</div><h1 style="margin:.2rem 0">${S.me.name} 👋</h1><div class="sm" style="color:#bcd6ff">📍 Ate, Lima · Zona 3B</div><div class="row wrap mt"><a class="btn" href="#/app/residente/alertas">🚨 Ver alertas</a><a class="btn" href="#/app/residente/asistente">🤖 Asistente IA</a></div></div>
 <div class="card"><div class="row"><span class="badge bg-${rc}">● RIESGO ${rk}</span><div class="sp"></div><span class="xs muted">${a ? ago(a.t) : ""}</span></div><h2 class="c-${rc}" style="margin:.5rem 0 .2rem">RIESGO ${rk}</h2><div class="sm muted">${a ? "Tu zona está bajo vigilancia activa." : "Sin alertas en tu zona."}</div>
 <div class="row sm mt"><span class="muted">Refugio más cercano</span><div class="sp"></div><b>${n ? dist(n.dist) : "—"}</b></div><div class="row sm" style="margin:.3rem 0 .8rem"><span class="muted">Ruta recomendada</span><div class="sp"></div><b>${n ? walk(n.dist) + " min" : "—"}</b></div><button class="btn orange full" data-a="evacStart">🏃 Ver ruta de evacuación</button></div></div>
 <div class="g4 mt">${kpi("🚨", "#fde4e6", actAlerts().length, "Alertas activas", nearAlerts().length + " en tu zona", "al", "c-red")}${kpi("🏫", "#dcfce7", avail().length, "Refugios disponibles", "de " + S.shelters.length + " en 3 km", "", "c-green")}${kpi("👨‍👩‍👧", "#fef3c7", fam + "/" + S.family.length, "Familiares a salvo", S.family.length - fam + " sin confirmar o en ruta", "", "c-orange")}${kpi("📋", "#dbeafe", S.reports.filter((r) => r.status !== "rechazado").length, "Reportes cercanos", "activos hoy", "", "c-blue")}</div>
 <div class="split mt" style="grid-template-columns:1.7fr 1fr"><div><div class="row mb"><h3>Mapa de riesgo</h3><div class="sp"></div><a class="c-blue sm b" href="#/app/residente/mapa">Ver completo →</a></div>${mapBox(["zones", "shelters", "route", "me"])}</div><div><h3 class="mb">Acciones rápidas</h3><div class="act"><button class="btn orange" data-a="evacStart">🏃 Iniciar evacuación</button><a class="btn navy" href="#/app/residente/reportar">📝 Reportar incidente</a><button class="btn out-g" data-a="safe">✅ Estoy a salvo</button><button class="btn ghost" data-a="sosModal">🆘 Necesito ayuda</button></div></div></div>
 ${a ? `<div class="banner b-warn mt2"><span style="font-size:1.6rem">⚠️</span><div class="sp"><b>${esc(a.title)}</b><div class="sm">${esc(a.msg)}</div><div class="xs mt" style="opacity:.85">🕒 ${T(a.t)} · Fuente oficial ${esc(a.src)} · ✓ Verificada</div></div><button class="btn ghost" data-a="alertView" data-v="${a.id}">Ver →</button></div>` : ""}`,
  };
};
PAGES.residente.alertas = () => {
  const tab = S.tab.alr || "activas",
    crit = actAlerts().find((a) => a.level === "critico" && a.dist <= 3000);
  let l = S.alerts
    .filter((a) =>
      tab === "activas"
        ? a.status === "activa"
        : tab === "historial"
          ? a.status === "resuelta"
          : true,
    )
    .filter((a) => LV[a.level].n >= S.cfg.lvl || a.status === "resuelta")
    .sort((a, b) => b.today - a.today || b.t - a.t);
  return {
    t: "Alertas",
    w: "m",
    h: `<div class="ph"><div><h1>Centro de alertas</h1><div class="muted sm">Historial de alertas en tu zona</div></div><div class="sp"></div>${tabsHTML(
      "alr",
      [
        ["todas", "Todas"],
        ["activas", "Activas"],
        ["historial", "Historial"],
      ],
      "activas",
    )}</div>
 ${crit ? `<div class="banner b-red mb"><span style="font-size:2rem">🚨</span><div class="sp"><div class="xs b" style="letter-spacing:.05em">ALERTA CRÍTICA ACTIVA</div><h2>${esc(KIND[crit.kind][1])} · EVACÚA AHORA</h2><div class="sm">Se aproxima desde el este, a ${dist(crit.dist)} de tu ubicación.</div></div><button class="btn" style="background:#fff;color:#c20010" data-a="alertView" data-v="${crit.id}">Ver alerta →</button></div>` : ""}
 <div class="card list" style="padding:.4rem .8rem">${l.length ? l.map(alertRow).join("") : '<div class="muted">No hay alertas para mostrar.</div>'}</div>`,
  };
};
const mapPage = (title, sub, tabsKey, tabs, layersBy, cls) => {
  const cur = S.tab[tabsKey] || tabs[0][0];
  return `<div class="ph"><div><h1>${title}</h1><div class="muted sm">${sub}</div></div><div class="sp"></div>${tabsHTML(tabsKey, tabs, tabs[0][0])}</div>${mapBox(layersBy[cur], cls)}`;
};
PAGES.residente.mapa = () => ({
  t: "Mapa de riesgo",
  w: "m",
  h:
    mapPage(
      "Mapa de riesgo interactivo",
      "Ate, Lima · Actualizado hace 3 min",
      "mp",
      [
        ["riesgo", "Riesgo"],
        ["rutas", "Rutas"],
        ["refugios", "Refugios"],
        ["incid", "Incidentes"],
      ],
      {
        riesgo: ["zones", "shelters", "me"],
        rutas: ["zones", "route", "shelters", "me"],
        refugios: ["shelters", "me"],
        incid: ["zones", "reports", "blocks", "me"],
      },
      "tall",
    ) +
    `<div class="g4 mt">${[
      [
        "🔴",
        "#fde4e6",
        actAlerts().filter((a) => a.zone).length,
        "zonas en peligro",
      ],
      ["🏫", "#dcfce7", avail().length, "refugios disponibles"],
      [
        "📋",
        "#fef3c7",
        S.reports.filter((r) => r.status !== "rechazado").length,
        "reportes activos",
      ],
      ["🏃", "#dbeafe", 1, "ruta activa"],
    ]
      .map(
        (x) =>
          `<div class="card row" style="background:${x[1]};box-shadow:none"><span style="font-size:1.6rem">${x[0]}</span><div><b style="font-size:1.1rem">${x[2]}</b><div class="sm" style="color:#334155">${x[3]}</div></div></div>`,
      )
      .join("")}</div>`,
});
const evacPage = () => {
  const s = tgt(),
    st = s ? steps(s) : [],
    me = S.me;
  if (!s)
    return {
      t: "Evacuación",
      h: '<div class="card">No hay refugios disponibles en este momento. Contacta a Serenazgo.</div>',
    };
  return {
    t: "Evacuación",
    w: "m",
    h: `<h1>Ruta de evacuación</h1><div class="muted sm mb">De tu ubicación al refugio seleccionado</div><div class="split">${mapBox(["zones", "route", "shelters", "me"], "tall")}<div class="act" style="gap:1rem">
 <div class="card"><div class="xs muted">Origen</div><b>🔵 Tu ubicación · Av. Principal, Ate</b><div class="xs muted mt">Destino</div><b>🟢 ${esc(s.name)}</b><select id="tsel" class="mt" data-a="target" style="padding:.5rem">${avail()
   .map(
     (h) =>
       `<option value="${h.id}" ${h.id === s.id ? "selected" : ""}>${esc(h.name)} · ${dist(h.dist)}</option>`,
   )
   .join(
     "",
   )}</select><div class="g2 mt" style="gap:.6rem"><div class="card" style="text-align:center;background:var(--soft);box-shadow:none"><b style="font-size:1.4rem">${dist(s.dist)}</b><div class="xs muted">Distancia</div></div><div class="card" style="text-align:center;background:var(--soft);box-shadow:none"><b style="font-size:1.4rem">${walk(s.dist)} min</b><div class="xs muted">A pie</div></div></div></div>
 <div class="card"><b>Instrucciones</b><ol class="ol">${st.map((x, i) => `<li>${stepText(x, s, i)}</li>`).join("")}</ol></div>
 ${me.arrived ? '<div class="banner" style="background:#dcfce7;color:#15803d">✅ Llegada confirmada. Tu familia fue notificada.</div>' : me.evac ? `<div class="banner" style="background:#fff3e6;color:#c2410c">🏃 Evacuación en curso…</div><button class="btn green" data-a="arrive" data-v="${s.id}">✅ Confirmar llegada</button>` : '<button class="btn orange" data-a="evacStart">🏃 Iniciar evacuación</button>'}
 <button class="btn ghost" data-a="reset">← Reiniciar demo</button></div></div>`,
  };
};
PAGES.residente.evacuacion = evacPage;
PAGES.residente.refugios = () => ({
  t: "Refugios",
  w: "n",
  h: `<h1>Refugios cercanos</h1><div class="muted sm mb">Ordenados por distancia desde tu ubicación</div><div class="act" style="gap:1rem">${[
    ...S.shelters,
  ]
    .sort((a, b) => a.dist - b.dist)
    .map((s) => shelterCard(s, 0, "residente"))
    .join("")}</div>`,
});
PAGES.residente.familiares = () => ({
  t: "Familiares",
  w: "n",
  h: `<h1>Mi familia</h1><div class="muted sm mb">Estado en tiempo real</div><button class="btn green full" style="padding:1.4rem;font-size:1.3rem" data-a="safe">${S.me.safe ? "✅ YA AVISASTE QUE ESTÁS A SALVO" : "✅ ESTOY A SALVO"}</button>
 <div class="card list mt" style="padding:.4rem .8rem">${S.family
   .map((f, i) => {
     const m = {
       salvo: ["green", "A salvo"],
       evac: ["orange", "Evacuando"],
       pend: ["yellow", "Sin confirmar"],
     }[f.st];
     return `<div><div class="aic" style="background:var(--soft);border-radius:50%;font-size:1.6rem">${f.e}</div><div class="sp"><b>${f.n}</b><div class="xs muted">📍 ${f.loc}</div></div><div style="text-align:right">${badge(m[0], m[1])}<div class="mt" style="margin-top:.4rem"><button class="sm-btn ghost" data-a="famView" data-v="${i}">📍 Ver</button><button class="sm-btn ghost" data-a="famCall" data-v="${i}">📞 Llamar</button></div></div></div>`;
   })
   .join("")}</div>`,
});
PAGES.residente.reportar = PAGES.visitante.reportar = () => ({
  t: "Reportar",
  w: "n",
  h: `<h1>Reportar incidente</h1><div class="muted sm mb">Tu reporte ayuda a la comunidad</div>${reportForm()}`,
});
PAGES.residente.asistente = () => ({
  t: "Asistente IA",
  w: "n",
  h: `<div class="row mb"><div class="ic" style="background:var(--soft);margin:0">🤖</div><div><h3>SafeAlert IA</h3><div class="xs c-green b">● En línea · Orientación de emergencia</div></div></div><div class="banner b-warn mb" style="padding:.6rem 1rem;font-size:.82rem">⚠️ Las alertas oficiales tienen prioridad. Este asistente es orientativo.</div>
 <div class="card"><div class="chat" id="chat">${chatHTML()}</div><div class="chips">${["¿Hay una alerta en mi zona?", "¿Qué hago si estoy atrapado?", "¿Está bloqueada la Av. Principal?", "¿Dónde está el refugio más cercano?", "¿Cuál es la ruta más segura?", "¿Dónde están mis familiares?"].map((q) => `<button data-a="chip" data-v="${q}">${q}</button>`).join("")}</div><div class="row"><input id="chatIn" type="text" placeholder="Escribe tu pregunta…" autocomplete="off"><button class="btn navy" data-a="chatSend">Enviar</button></div></div>`,
});
const chatHTML = () =>
  S.chat.map((m) => `<div class="msg ${m.r}">${esc(m.t)}</div>`).join("");
function botReply(q) {
  q = q.toLowerCase();
  const n = nearest(),
    t = tgt(),
    na = nearAlerts();
  if (/familia|mam[aá]|pap[aá]|hermano/.test(q))
    return (
      "Estado de tu familia:\n" +
      S.family
        .map(
          (f) =>
            `• ${f.n}: ${{ salvo: "a salvo", evac: "evacuando", pend: "sin confirmar" }[f.st]} (${f.loc})`,
        )
        .join("\n")
    );
  if (/atrapad|ayuda|auxilio/.test(q))
    return 'Si estás atrapado: 1) Mantén la calma y sube a un lugar alto o seguro. 2) Envía un SOS desde "Necesito ayuda" en el Dashboard. 3) Llama al 115 (Defensa Civil) o al 105 (Policía). 4) Haz ruido o señales visibles para los rescatistas.';
  if (/bloquead|bloqueo|calle|principal|álamos|alamos/.test(q)) {
    const b = actBlocks();
    return (
      (/principal/.test(q)
        ? "No hay bloqueos reportados en Av. Principal.\n"
        : "") +
      (b.length
        ? "Bloqueos activos ahora: " +
          b.map((x) => `${x.street} (${x.cause.toLowerCase()})`).join("; ") +
          "."
        : "No hay bloqueos activos.")
    );
  }
  if (/refugio|cerca|albergue/.test(q))
    return n
      ? `El refugio más cercano es ${n.name}, a ${dist(n.dist)} (${walk(n.dist)} min a pie). Capacidad disponible: ${n.cap - n.occ} personas.`
      : "No hay refugios disponibles ahora. Contacta a Serenazgo.";
  if (/ruta|evacu|segura|camino/.test(q))
    return t
      ? `Tu ruta más segura ahora: ${steps(t)
          .filter((x) => !x.end)
          .map((x, i) => stepText(x, t, i))
          .join(
            " → ",
          )} → ${t.name}. Distancia: ${dist(t.dist)} · Tiempo: ${walk(t.dist)} min. ${
          actBlocks().length
            ? "Evita: " +
              actBlocks()
                .map((b) => b.street)
                .join(", ") +
              "."
            : ""
        }`
      : "No encuentro una ruta disponible ahora.";
  if (/alerta|zona|hay|peligro/.test(q))
    return na.length
      ? `Hay ${na.length} alerta(s) activa(s) en tu zona:\n` +
          na
            .map((a) => `• ${a.short} (${LV[a.level].t}) a ${dist(a.dist)}`)
            .join("\n")
      : "No hay alertas activas en tu zona.";
  return "Puedo ayudarte con: alertas en tu zona, ruta de evacuación, refugios cercanos, bloqueos y estado de tus familiares. ¿Qué necesitas?";
}
PAGES.residente.config = () => {
  const c = S.cfg,
    tg = (v) => `<span class="tg ${v ? "on" : ""}"></span>`,
    L = [
      "Informativo (Azul)",
      "Precaución (Amarillo)",
      "Riesgo alto (Naranja)",
      "Emergencia (Rojo)",
    ],
    SZ = ["Normal", "Grande", "Muy grande"];
  const it = (e, t, s, a, v, r = "→") =>
    `<button class="it" data-a="${a}" data-v="${v || ""}"><span class="e">${e}</span><div class="sp"><b>${t}</b><div class="xs muted">${s}</div></div>${r}</button>`;
  return {
    t: "Configuración",
    w: "n",
    h: `<h1 class="mb">Configuración</h1>
 <div class="card set" style="padding:0"><h4>PERFIL Y UBICACIÓN</h4>${it("👤", "Mi perfil", S.me.name, "info", "Edición de perfil (demo)")}${it("📍", "Zona de interés", "Ate, Lima · Zona 3B", "info", "Zona de interés (demo)")}</div>
 <div class="card set mt" style="padding:0"><h4>ALERTAS Y NOTIFICACIONES</h4>${it("🔔", "Notificaciones", (c.notif ? "Activas" : "Desactivadas") + " · Sismos, Huaicos, Inundaciones", "cfg", "notif", tg(c.notif))}${it("⚠️", "Nivel mínimo de alerta", L[c.lvl], "cfg", "lvl")}</div>
 <div class="card set mt" style="padding:0"><h4>PRIVACIDAD Y ACCESO</h4>${it("📡", "Ubicación en tiempo real", c.realtime ? "Activa" : "Desactivada", "cfg", "realtime", tg(c.realtime))}${it("👨‍👩‍👧", "Familiares", S.family.length + " contactos", "nav", "familiares")}</div>
 <div class="card set mt" style="padding:0"><h4>ACCESIBILIDAD</h4>${it("🔤", "Tamaño de texto", SZ[c.size], "cfg", "size")}${it("🌓", "Modo oscuro", c.dark ? "Activado" : "Desactivado", "cfg", "dark", tg(c.dark))}${it("♿", "Alto contraste", c.hc ? "Activado" : "Desactivado", "cfg", "hc", tg(c.hc))}</div>
 <button class="btn full mt" style="background:#fde4e6;color:#c20010" data-a="logout">Cerrar sesión</button>`,
  };
};

/* ---- VISITANTE ---- */
PAGES.visitante.dashboard = () => {
  const a = topAlert(),
    n = nearest(),
    [rk, rc] = riskOf();
  return {
    t: "Dashboard",
    w: "m",
    h: `<div class="card hi" style="background:linear-gradient(135deg,#102a5c,#1e3f9a)"><div class="sm" style="color:#bcd6ff">Estás en</div><h1>Ate, Lima 📍</h1><div class="sm" style="color:#bcd6ff;margin:.2rem 0 .6rem">Zona desconocida · Visitante</div><span class="badge bg-${rc}">● RIESGO ${rk}</span></div>
 <div class="g4 mt">${kpi("🚨", "#fde4e6", nearAlerts().length, "Alertas en tu zona", "", "al", "c-red")}${kpi("🏫", "#dcfce7", n ? dist(n.dist) : "—", "Refugio más cercano", n ? esc(n.name) : "", "", "c-green")}${kpi("🚧", "#ffe9d9", actBlocks().length, "Calles bloqueadas", "", "", "c-orange")}${kpi("⏱️", "#dbeafe", n ? walk(n.dist) + " min" : "—", "Ruta estimada", "a pie", "", "c-blue")}</div>
 <div class="split mt" style="grid-template-columns:1.6fr 1fr">${mapBox(["zones", "shelters", "route", "me"])}<div class="act"><button class="btn orange" data-a="evacStart">🏃 Iniciar evacuación</button><a class="btn" style="border:2px solid var(--blue);color:var(--blue)" href="#/app/visitante/brujula">🧭 Brújula de escape</a><a class="btn red" href="#/app/visitante/sos">🆘 SOS · Emergencia</a><a class="btn ghost" href="#/app/visitante/refugios">🏫 Ver refugios</a></div></div>
 ${a ? `<div class="banner b-red mt2"><div class="sp"><div class="xs b">ALERTA EN TU UBICACIÓN</div><h2>${esc(KIND[a.kind][1])} detectado a ${dist(a.dist)}</h2><div class="sm">Evacúa hacia el norte</div></div><button class="btn" style="background:#fff;color:#c20010" data-a="evacStart">🏃 INICIAR RUTA</button></div>` : ""}`,
  };
};
PAGES.visitante.alertas = () => {
  const l = nearAlerts().sort((a, b) => LV[b.level].n - LV[a.level].n),
    n = nearest();
  return {
    t: "Alertas",
    w: "n",
    h: `<h1 class="mb">Alertas en tu ubicación</h1>${l.map((a) => (a.level === "critico" ? `<div class="card mb" style="border:2px solid #fca5a5;background:#fff1f2;color:#7f1d1d"><div class="xs b c-red">● ACTIVA · ACTUALIZADA ${ago(a.t).toUpperCase()}</div><h2 class="c-red" style="margin:.3rem 0">${esc(KIND[a.kind][1])} detectado a ${dist(a.dist)}</h2><div class="sm">${esc(a.msg)}</div>${n ? `<div class="card mt" style="padding:.6rem .9rem;color:#0f1f35">📍 Refugio más cercano: ${esc(n.name)} · ${dist(n.dist)} · ${walk(n.dist)} min</div>` : ""}</div>` : `<div class="card mb" data-a="alertView" data-v="${a.id}" style="cursor:pointer"><b>${KIND[a.kind][0]} ${esc(a.title)}</b><div class="sm muted" style="margin:.2rem 0 .5rem">${esc(a.msg)}</div>${lvBadge(a.level)}</div>`)).join("") || '<div class="card muted">Sin alertas activas en tu zona.</div>'}`,
  };
};
PAGES.visitante.navegacion = () => {
  const s = tgt();
  if (!s)
    return {
      t: "Navegación",
      h: '<div class="card">No hay refugios disponibles.</div>',
    };
  const st = steps(s),
    i = Math.min(S.navStep, st.length - 1),
    cur = st[i],
    nx = st[i + 1],
    rem = s.dist - st.slice(0, i).reduce((a, x) => a + x.m, 0);
  return {
    t: "Navegación",
    w: "m",
    h: `<div class="ph"><h1>Navegación de evacuación</h1><div class="sp"></div><span class="badge bg-gray">📡 Modo online</span></div><div class="split2" style="grid-template-columns:1.2fr 1fr;display:grid;gap:1rem">${mapBox(["zones", "route", "shelters", "me"], "tall")}<div>
 <div class="navbig"><div class="sm" style="color:#9cc4ff">${cur.end ? "¡Has llegado!" : i === 0 ? "Avanza hacia adelante" : "Continúa"}</div><div class="arr">${cur.arrow}</div>${cur.end ? "" : `<div style="font-size:2.4rem;font-weight:800">${cur.m} m</div>`}<div class="sm" style="color:#9cc4ff">${cur.end ? esc(s.name) : nx ? "→ Luego: " + stepText(nx, s, i + 1) : ""}</div></div>
 <div class="card mt row"><span style="font-size:1.6rem">🏫</span><div class="sp"><b>${esc(s.name)}</b><div class="xs muted">Refugio · ${shBadge(s)[1]}</div></div><div style="text-align:right"><b>${dist(rem)}</b><div class="xs muted">${walk(rem)} min</div></div></div>
 <div class="steps">${st.map((x, j) => `<i class="${j <= i ? "on" : ""}"></i>`).join("")}</div><div class="g2" style="gap:.6rem"><button class="btn ghost" data-a="navStep" data-v="-1">← Anterior</button><button class="btn green" data-a="navStep" data-v="1">${i >= st.length - 1 ? "Confirmar llegada" : "Siguiente →"}</button></div>
 <button class="btn full mt" style="background:#fff3e6;color:#c2410c;border:1px solid #fdba74" data-a="reportBlock">🚧 Reportar bloqueo</button></div></div>`,
  };
};
PAGES.visitante.brujula = () => {
  const s = tgt(),
    b = s ? bearing(s) : 0,
    hd = S.heading || 0;
  return {
    t: "Brújula escape",
    w: "n",
    h: `<div style="text-align:center"><h1>Brújula de escape</h1><div class="muted sm">Dirección hacia el refugio más cercano</div></div><div class="card mt" style="text-align:center"><div class="compass" id="dial" style="transform:rotate(${-hd}deg)"><span style="top:.5rem;left:50%;margin-left:-.3rem">N</span><span style="bottom:.5rem;left:50%;margin-left:-.3rem">S</span><span style="right:.7rem;top:50%">E</span><span style="left:.7rem;top:50%">O</span><div class="needle" id="needle" style="transform:rotate(${b}deg)"></div></div>
 <div class="xs b c-blue" style="letter-spacing:.05em">DIRECCIÓN RECOMENDADA</div><div style="font-size:2.4rem;font-weight:800">${s ? cardinal(b) : "—"}</div><div class="c-green b" style="font-size:1.6rem">${s ? dist(s.dist) : ""}</div><div class="sm muted">${s ? esc(s.name) + " · Refugio " + shBadge(s)[1].toLowerCase() : ""}</div>
 <div class="card mt" style="background:var(--soft);box-shadow:none">${s ? `Camina hacia el <b>${cardinal(b).toLowerCase()}</b> aproximadamente <b>${s.dist} metros</b>.` : ""}</div><button class="btn ghost mt" data-a="sensor">📡 Activar sensor de orientación</button></div>`,
  };
};
PAGES.visitante.refugios = () => ({
  t: "Refugios",
  w: "n",
  h: `<h1 class="mb">Refugios disponibles</h1><div class="act" style="gap:1rem">${[
    ...S.shelters,
  ]
    .sort((a, b) => a.dist - b.dist)
    .map((s) => shelterCard(s, 0, "visitante"))
    .join("")}</div>`,
});
PAGES.visitante.sos = () => ({
  t: "SOS",
  w: "n",
  h: `<div style="text-align:center" class="mb"><h1>Emergencia SOS</h1><div class="muted sm">Solicitar rescate de emergencia</div></div>${sosCard()}
 <div class="card mt"><b>Líneas de emergencia</b><div class="g2 mt" style="gap:.6rem">${[
   ["105", "Policía (PNP)"],
   ["116", "Bomberos"],
   ["106", "SAMU"],
   ["115", "Defensa Civil"],
 ]
   .map(
     (x) => `<a class="btn ghost" href="tel:${x[0]}">📞 ${x[0]} · ${x[1]}</a>`,
   )
   .join("")}</div></div>`,
});

/* ---- SERENAZGO ---- */
PAGES.serenazgo.dashboard = () => {
  const so = actSOS();
  return {
    t: "Dashboard operativo",
    w: "m",
    h: `<div class="ph"><div><h1>Centro de Operaciones</h1><div class="muted sm">Monitoreo en tiempo real · Lima · <span class="clk">${T12(S.clock)}</span></div></div><div class="sp"></div><span class="b sm"><span class="c-green">●</span> Sistema operativo</span></div>
 <div class="g4" style="grid-template-columns:repeat(6,1fr)">${kpi("🚨", "#fde4e6", actAlerts().length, "Alertas activas", "", "al", "c-red")}${kpi("📋", "#ffe9d9", pendRep().length, "Reportes pendientes", "por revisar", "", "c-orange")}${kpi("🚓", "#dbeafe", ucount(), "Unidades en campo", "de " + S.units.length, "", "c-blue")}${kpi("🏃", "#dcfce7", num(S.evacuated), "Personas evacuadas", "hoy", "", "c-green")}${kpi("🆘", "#fde4e6", so.length, "SOS activos", "", so.length ? "al" : "", "c-red")}${kpi("🏫", "#dcfce7", avail().length + "/" + S.shelters.length, "Refugios disp.", "", "", "c-green")}</div>
 <div class="split mt" style="grid-template-columns:1.8fr 1fr"><div><div class="row mb"><h3>Mapa táctico</h3><div class="sp"></div><a class="c-blue sm b" href="#/app/serenazgo/mapa">Ver completo →</a></div>${mapBox(["zones", "shelters", "blocks", "units", "sos"], "sh")}</div>
 <div class="act" style="gap:1rem"><div class="card"><div class="row"><b>🆘 SOS activos</b><div class="sp"></div>${badge("red", so.length)}</div>${so.map((o) => `<div class="row mt"><span class="c-${o.prio === "alta" ? "red" : "orange"}">●</span><div class="sp"><b class="sm">${esc(o.name.split(" ")[0])} ${esc(o.name.split(" ")[1] ? o.name.split(" ")[1][0] + "." : "")}</b><div class="xs muted">📍 ${esc(o.loc)}</div></div><a class="sm-btn red" href="#/app/serenazgo/sos">Atender</a></div>`).join("") || '<div class="sm muted mt">Sin SOS activos</div>'}</div>
 <div class="card"><div class="row"><b>📋 Reportes recientes</b><div class="sp"></div><a class="c-blue xs b" href="#/app/serenazgo/triaje">Ver todos</a></div>${[
   ...S.reports,
 ]
   .sort((a, b) => b.t - a.t)
   .slice(0, 3)
   .map(
     (r) =>
       `<div class="row mt"><span>${RT[r.type][0]}</span><div class="sp"><b class="sm">${RT[r.type][1]}</b><div class="xs muted">📍 ${esc(r.loc)} · ${T(r.t)}</div></div>${repBadge(r.status)}</div>`,
   )
   .join("")}</div>
 <div class="g2" style="gap:.6rem"><button class="btn red" data-a="alertNew">🚨 Crear alerta</button><a class="btn ghost" href="#/app/serenazgo/bloqueos" style="background:var(--card);border:1px solid var(--line)">🚧 Bloqueos</a></div></div></div>`,
  };
};
const repBadge = (s) =>
  badge(
    {
      pendiente: "yellow",
      revision: "blue",
      verificado: "green",
      rechazado: "gray",
    }[s],
    {
      pendiente: "pendiente",
      revision: "en revisión",
      verificado: "verificado",
      rechazado: "rechazado",
    }[s],
  );
PAGES.serenazgo.mapa = () => ({
  t: "Mapa táctico",
  w: "m",
  h:
    mapPage(
      "Mapa táctico",
      "Visión operativa completa · Lima, Perú",
      "mt",
      [
        ["todos", "Todos"],
        ["alertas", "Alertas"],
        ["reportes", "Reportes"],
        ["unidades", "Unidades"],
        ["sos", "SOS"],
      ],
      {
        todos: ["zones", "shelters", "blocks", "reports", "units", "sos"],
        alertas: ["zones", "shelters"],
        reportes: ["reports", "blocks"],
        unidades: ["units", "shelters"],
        sos: ["sos", "units"],
      },
      "tall",
    ) +
    `<div class="g4 mt" style="grid-template-columns:repeat(5,1fr)">${[
      [
        "🔴",
        "#fde4e6",
        actAlerts().filter((a) => a.zone).length,
        "Zonas críticas",
      ],
      [
        "📋",
        "#ffe9d9",
        S.reports.filter((r) => r.status !== "rechazado").length,
        "Incidentes",
      ],
      ["🚓", "#dbeafe", ucount(), "Unidades"],
      ["🏫", "#dcfce7", S.shelters.length, "Refugios"],
      ["🚧", "#fef3c7", actBlocks().length, "Bloqueos"],
    ]
      .map(
        (x) =>
          `<div class="card" style="background:${x[1]};box-shadow:none;text-align:center"><div style="font-size:1.5rem">${x[0]}</div><b style="font-size:1.3rem">${x[2]}</b><div class="xs" style="color:#334155">${x[3]}</div></div>`,
      )
      .join("")}</div>`,
});
PAGES.serenazgo.alertas = () => {
  const tu = S.alerts.filter((a) => a.today),
    res = S.alerts.filter((a) => a.status === "resuelta" && a.today).length;
  return {
    t: "Alertas",
    w: "m",
    h: `<div class="ph"><h1>Gestión de alertas</h1><div class="sp"></div><button class="btn red" data-a="alertNew">+ Crear nueva alerta</button></div>
 <div class="g3">${kpi("🚨", "#fde4e6", actAlerts().length, "Alertas activas", "", "al", "c-red")}${kpi("📡", "#e0e7ff", num(tu.reduce((s, a) => s + a.users, 0)), "Usuarios notificados hoy", "", "", "c-blue")}${kpi("✅", "#dcfce7", res, "Resueltas hoy", "", "", "c-green")}</div>
 <div class="card list mt" style="padding:.4rem .8rem">${[...S.alerts]
   .sort(
     (a, b) =>
       (a.status === "activa" ? 0 : 1) - (b.status === "activa" ? 0 : 1) ||
       b.today - a.today ||
       b.t - a.t,
   )
   .map(
     (a) =>
       `<div><div class="aic">${KIND[a.kind][0]}</div><div class="sp"><b>${esc(a.short)}</b><div class="xs muted">🕒 ${aT(a)} · 👥 ${num(a.users)} usuarios</div></div>${badge(LV[a.level].c, LV[a.level].s)}${badge(a.status === "activa" ? "red" : "green", a.status)}<button class="sm-btn ghost" data-a="alertView" data-v="${a.id}">Ver</button>${a.status === "activa" ? `<button class="sm-btn green" data-a="alertResolve" data-v="${a.id}">Resolver</button>` : ""}</div>`,
   )
   .join("")}</div>`,
  };
};
PAGES.serenazgo.triaje = () => {
  const tab = S.tab.tri || "pendiente",
    P = { alta: 0, media: 1, baja: 2 };
  const l = S.reports
    .filter((r) => tab === "todos" || r.status === tab)
    .sort((a, b) => P[a.prio] - P[b.prio] || a.t - b.t);
  return {
    t: "Triaje reportes",
    w: "m",
    h: `<div class="ph"><h1>Triaje de reportes</h1><div class="sp"></div>${tabsHTML(
      "tri",
      [
        ["todos", "Todos"],
        ["pendiente", "Pendiente"],
        ["revision", "Revisión"],
        ["verificado", "Verificado"],
        ["rechazado", "Rechazado"],
      ],
      "pendiente",
    )}</div>
 <div class="card tw" style="padding:.3rem"><table><tr><th>TIPO</th><th>UBICACIÓN</th><th>USUARIO</th><th>HORA</th><th>ESPERA</th><th>PRIORIDAD</th><th>ESTADO</th><th>ACCIONES</th></tr>${l.map((r) => `<tr><td><b>${RT[r.type][0]} ${RT[r.type][1]}</b></td><td>📍 ${esc(r.loc)}</td><td>${esc(r.user)}</td><td class="muted">${T(r.t)}</td><td class="muted">${S.clock - r.t} min</td><td>${badge({ alta: "red", media: "orange", baja: "blue" }[r.prio], r.prio)}</td><td>${repBadge(r.status)}</td><td>${["pendiente", "revision"].includes(r.status) ? `<button class="sm-btn green" title="Verificar reporte" data-a="repSet" data-v="${r.id}" data-s="verificado">✓ Verificar</button><button class="sm-btn red" title="Rechazar reporte" data-a="repSet" data-v="${r.id}" data-s="rechazado">✗ Rechazar</button>` : ""}${r.unit ? `<span class="badge bg-purple">🚓 ${r.unit}</span>` : r.status !== "rechazado" ? `<button class="sm-btn blue" data-a="repUnit" data-v="${r.id}">+ Unidad</button>` : ""}</td></tr>`).join("") || '<tr><td colspan="8" class="muted">No hay reportes en este estado.</td></tr>'}</table></div>`,
  };
};
PAGES.serenazgo.bloqueos = () => ({
  t: "Bloqueos viales",
  w: "m",
  h: `<div class="ph"><h1>Bloqueos viales</h1><div class="sp"></div><button class="btn navy" data-a="blockAdd">+ Agregar bloqueo</button></div>${mapBox(["zones", "blocks", "route", "units"], "sh")}
 <div class="card list mt" style="padding:.4rem .8rem">${S.blocks.map((b) => `<div><span style="font-size:1.6rem">🚧</span><div class="sp"><b>${esc(b.street)}</b><div class="xs muted">${esc(b.cause)} · Reportado ${T(b.t)}</div></div>${badge({ alta: "red", media: "orange", baja: "yellow" }[b.prio], b.prio)}${badge(b.active ? "red" : "green", b.active ? "activo" : "habilitado")}<button class="sm-btn ghost" data-a="blockEdit" data-v="${b.id}">Editar</button><button class="sm-btn ${b.active ? "green" : "red"}" data-a="blockToggle" data-v="${b.id}">${b.active ? "✓ Habilitar vía" : "🚧 Volver a bloquear"}</button></div>`).join("")}</div>`,
});
PAGES.serenazgo.refugios = () => ({
  t: "Refugios",
  w: "m",
  h: `<h1 class="mb">Control de refugios</h1><div class="g2">${S.shelters
    .map((s) => {
      const [c, t] = shBadge(s);
      return `<div class="card"><div class="row"><b>🏫 ${esc(s.name)}</b><div class="sp"></div>${badge(c, s.closed ? "Cerrado" : shSt(s) === "ok" ? "Operativo" : t)}</div><div class="g3 mt" style="gap:.5rem">${[
        [s.cap, "Capacidad", ""],
        [s.occ, "Ocupación", ""],
        [s.cap - s.occ, "Disponible", s.cap - s.occ ? "c-green" : "c-red"],
      ]
        .map(
          (x) =>
            `<div class="card" style="background:var(--soft);box-shadow:none;text-align:center;padding:.6rem"><b class="${x[2]}" style="font-size:1.2rem">${x[0]}</b><div class="xs muted">${x[1]}</div></div>`,
        )
        .join(
          "",
        )}</div><div class="mt">${bar(s)}</div><div class="xs muted" style="text-align:right;margin:.3rem 0">${Math.round((s.occ / s.cap) * 100)}% de capacidad</div>
 <div class="row wrap"><button class="sm-btn ghost" data-a="shAdj" data-v="${s.id}" data-d="-10">− 10</button><button class="sm-btn ghost" data-a="shAdj" data-v="${s.id}" data-d="10">+ 10</button><div class="sp"></div><button class="sm-btn ${s.closed ? "green" : "ghost"}" data-a="shClose" data-v="${s.id}">${s.closed ? "Reabrir" : "Cerrar refugio"}</button></div></div>`;
    })
    .join("")}</div>`,
});
const uSt = {
  disponible: ["green", "Disponible"],
  ruta: ["blue", "En ruta"],
  emergencia: ["red", "En emergencia"],
  fuera: ["gray", "Fuera de servicio"],
};
PAGES.serenazgo.unidades = () => ({
  t: "Unidades",
  w: "m",
  h: `<h1 class="mb">Unidades en campo</h1><div class="g4">${Object.entries(uSt)
    .map(
      ([k, v]) =>
        `<div class="card" style="text-align:center"><b class="c-${v[0] === "gray" ? "" : v[0]}" style="font-size:1.8rem">${S.units.filter((u) => u.st === k).length}</b><div class="xs muted">${v[1]}</div></div>`,
    )
    .join("")}</div>
 <div class="card tw mt" style="padding:.3rem"><table><tr><th>UNIDAD</th><th>OPERADOR</th><th>UBICACIÓN</th><th>ESTADO</th><th>MISIÓN</th><th>ACCIONES</th></tr>${S.units.map((u) => `<tr><td><b>🚓 ${u.id}</b></td><td>${u.op}</td><td>📍 ${esc(u.loc)}</td><td>${badge(...uSt[u.st])}</td><td>${esc(u.mission)}</td><td><button class="sm-btn bg-blue" data-a="unitView" data-v="${u.id}">Ver</button>${u.st !== "fuera" ? `<button class="sm-btn bg-green" data-a="unitAssign" data-v="${u.id}">Asignar</button>` : ""}</td></tr>`).join("")}</table></div>`,
});
PAGES.serenazgo.sos = () => ({
  t: "SOS / Rescate",
  w: "n",
  h: `<div class="ph"><h1>Panel SOS / Rescate</h1><div class="sp"></div><b class="c-red sm">● ${actSOS().length} solicitudes activas</b></div>${
    actSOS()
      .map(
        (
          o,
        ) => `<div class="sosb mb" style="border-color:${o.prio === "alta" ? "#dc2626" : "#ea580c"};background:var(--card)"><div class="row"><div class="ic" style="margin:0;background:#fde4e6">🆘</div><div class="sp"><b>${esc(o.name)}</b><div class="xs muted">📍 ${esc(o.loc)} · 🕒 ${T(o.t)}</div></div>${badge(o.prio === "alta" ? "red" : "orange", o.prio === "alta" ? "Alta" : "Media")}${badge(o.status === "pendiente" ? "yellow" : "blue", o.status)}</div>
 <div class="card mt" style="background:var(--soft);box-shadow:none;padding:.6rem .9rem">💬 "${esc(o.msg)}"</div><div class="row xs muted mt"><span>🌐 Lat: ${o.lat}</span><div class="sp"></div><span>Lon: ${o.lon}</span></div>${o.unit ? `<div class="sm b mt c-blue">🚓 Unidad asignada: ${o.unit}</div>` : ""}
 <div class="g3 mt" style="gap:.6rem"><button class="btn blue" data-a="sosAssign" data-v="${o.id}">🚓 ${o.unit ? "Reasignar" : "Asignar"} unidad</button><button class="btn out-g" data-a="sosCall" data-v="${o.id}">📞 Contactar</button><button class="btn ghost" data-a="sosDone" data-v="${o.id}">✓ Atendido</button></div></div>`,
      )
      .join("") ||
    '<div class="card muted" style="text-align:center">No hay solicitudes SOS activas. 🎉</div>'
  }`,
});
PAGES.serenazgo.stats = () => {
  const types = Object.keys(RT).map((k) => [
    RT[k][1].split(" ")[0].slice(0, 9),
    S.reports.filter((r) => r.type === k).length,
    {
      bloqueo: "#ea580c",
      derrumbe: "#dc2626",
      inundacion: "#2563eb",
      heridos: "#7c3aed",
      incendio: "#f59e0b",
      otro: "#64748b",
    }[k],
  ]);
  const wk = [
      ["Lun", 145],
      ["Mar", 89],
      ["Mié", 312],
      ["Jue", 203],
      ["Vie", S.evacuated],
    ],
    mx = Math.max(...wk.map((x) => x[1]));
  const ver = S.reports.filter((r) => r.status === "verificado").length,
    rej = S.reports.filter((r) => r.status === "rechazado").length,
    tu = S.alerts.filter((a) => a.today);
  const bars = (d, mx) =>
    `<div class="bars">${d.map((x) => `<div class="bc"><b>${x[1]}</b><div class="ba"><i style="height:${Math.max(3, (x[1] / mx) * 100)}%;background:${x[2] || "#0f2d4f"}"></i></div><span class="muted">${x[0]}</span></div>`).join("")}</div>`;
  return {
    t: "Estadísticas",
    w: "m",
    h: `<h1 class="mb">Estadísticas operativas</h1><div class="g4">${kpi("📊", "#dcfce7", S.reports.length, "Incidentes hoy", "reportes recibidos")}${kpi("📡", "#e0e7ff", tu.length, "Alertas enviadas", "a " + num(tu.reduce((s, a) => s + a.users, 0)) + " usuarios", "", "c-blue")}${kpi("⏱️", "#dcfce7", "4.2 min", "Tiempo respuesta", "promedio", "", "c-green")}${kpi("✅", "#dcfce7", (ver + rej ? Math.round((ver / (ver + rej)) * 100) : 0) + "%", "Reportes verificados", "tasa de precisión", "", "c-green")}</div>
 <div class="g2 mt"><div class="card"><b>Incidentes por tipo · hoy</b><div class="mt">${bars(types, Math.max(1, ...types.map((t) => t[1])))}</div></div><div class="card"><b>Personas evacuadas · Semana</b><div class="mt">${bars(
   wk.map((x, i) => [
     x[0],
     x[1],
     i === 2 ? "#dc2626" : i === 4 ? "#ea580c" : "#0f2d4f",
   ]),
   mx,
 )}</div></div></div>
 <div class="g2 mt"><div class="card"><b>Capacidad de refugios</b>${S.shelters.map((s) => `<div class="mt"><div class="row sm"><span>${esc(s.name)}</span><div class="sp"></div><b style="color:${clr[shSt(s)]}">${s.occ}/${s.cap}</b></div>${bar(s)}</div>`).join("")}</div>
 <div class="card"><b>Validez de reportes ciudadanos</b>${[
   [
     "green",
     "Verificados",
     S.reports.filter((r) => r.status === "verificado").length,
   ],
   [
     "blue",
     "En revisión",
     S.reports.filter((r) => r.status === "revision").length,
   ],
   [
     "yellow",
     "Por verificar",
     S.reports.filter((r) => r.status === "pendiente").length,
   ],
   ["red", "Rechazados (falsos)", rej],
 ]
   .map(
     (x) =>
       `<div class="row mt"><span class="c-${x[0]}">●</span><span class="sp sm">${x[1]}</span><b class="c-${x[0]}">${x[2]}</b></div>`,
   )
   .join("")}</div></div>`,
  };
};

/* ============ ACCIONES ============ */
const ACT = {
  go: (el) => go(el.dataset.v),
  scroll: (el) =>
    document
      .getElementById(el.dataset.v)
      ?.scrollIntoView({ behavior: "smooth" }),
  segment: (el) => {
    S.loginRole = el.dataset.v;
    go("login");
  },
  selRole: (el) => {
    S.loginRole = el.dataset.v;
    $$(".role").forEach((r) => r.classList.toggle("sel", r === el));
  },
  pw: () => {
    const i = $("#pw");
    i.type = i.type === "password" ? "text" : "password";
  },
  forgot: (el, e) => {
    e.preventDefault();
    toast("Función de recuperación (demo)");
  },
  login: () => {
    S.me.name = "Rosa Quispe";
    go(`app/${S.loginRole}/dashboard`);
  },
  logout: () => {
    S.role = null;
    go("login");
  },
  menu: () => {
    S.menu = !S.menu;
    $(".sb")?.classList.toggle("open", S.menu);
  },
  mclose: (el, e) => {
    if (el.classList.contains("ov") && e.target !== el) return;
    closeModal();
  },
  back: () => history.back(),
  info: (el) => toast(el.dataset.v),
  nav: (el) => goApp(el.dataset.v),
  tab: (el) => {
    S.tab[el.dataset.k] = el.dataset.v;
    render();
  },
  zoom: (el) => {
    const m = el.closest(".map");
    m.dataset.z = Math.min(3, Math.max(1, +m.dataset.z + +el.dataset.v * 0.5));
    applyView(m);
  },
  locate: (el) => {
    const m = el.closest(".map");
    if (S.role === "serenazgo") {
      m.dataset.z = 1;
      m.dataset.cx = 400;
      m.dataset.cy = 210;
    } else {
      m.dataset.z = 2;
      m.dataset.cx = S.me.x;
      m.dataset.cy = S.me.y;
    }
    applyView(m);
  },
  reset: () => {
    const k = {
      role: S.role,
      cfg: S.cfg,
      view: S.view,
      page: S.page,
      menu: false,
      loginRole: S.loginRole,
    };
    S = Object.assign(initState(), k);
    toast("Demo reiniciada", "ok");
    render();
  },
  /* evacuación */
  evacStart: () => {
    S.me.evac = true;
    S.me.arrived = false;
    S.navStep = 0;
    if (!S.target) S.target = nearest()?.id;
    toast("Evacuación iniciada. Sigue la ruta verde.", "ok");
    goApp(S.role === "visitante" ? "navegacion" : "evacuacion");
  },
  target: (el) => {
    S.target = +el.value;
    render();
  },
  howto: (el) => {
    S.target = +el.dataset.v;
    S.me.evac = true;
    S.navStep = 0;
    goApp(S.role === "visitante" ? "navegacion" : "evacuacion");
  },
  arrive: (el) => {
    const s = S.shelters.find((x) => x.id == el.dataset.v);
    if (S.me.arrived) return toast("Ya confirmaste tu llegada.");
    if (!s || ["lleno", "cerrado"].includes(shSt(s)))
      return toast("Este refugio no está disponible.", "err");
    s.occ++;
    S.me.arrived = true;
    S.me.safe = true;
    S.me.evac = false;
    S.evacuated++;
    toast(
      `Llegada confirmada en ${s.name}.${S.role === "residente" ? " Tu familia fue notificada." : ""}`,
      "ok",
    );
    render();
  },
  navStep: (el) => {
    const s = tgt(),
      n = steps(s).length;
    const d = +el.dataset.v;
    if (d > 0 && S.navStep >= n - 1)
      return ACT.arrive({ dataset: { v: s.id } });
    S.navStep = Math.max(0, Math.min(n - 1, S.navStep + d));
    render();
  },
  reportBlock: () => {
    S.draft.type = "bloqueo";
    goApp("reportar");
  },
  sensor: async () => {
    try {
      if (
        typeof DeviceOrientationEvent !== "undefined" &&
        DeviceOrientationEvent.requestPermission
      ) {
        const r = await DeviceOrientationEvent.requestPermission();
        if (r !== "granted") return toast("Permiso denegado", "err");
      }
      addEventListener("deviceorientationabsolute", oriH, true);
      addEventListener("deviceorientation", oriH, true);
      toast("Sensor activado. Gira tu dispositivo.", "ok");
    } catch (e) {
      toast("Tu dispositivo no tiene sensor de orientación.", "err");
    }
  },
  /* familia */
  safe: () => {
    S.me.safe = true;
    toast("Avisaste a tu familia que estás a salvo ✅", "ok");
    render();
  },
  famView: (el) => {
    const f = S.family[el.dataset.v];
    toast(`📍 ${f.n}: ${f.loc}`);
  },
  famCall: (el) => toast(`📞 Llamando a ${S.family[el.dataset.v].n}…`),
  /* reportes */
  selType: (el) => {
    S.draft.type = el.dataset.v;
    $$(".rt").forEach((b) => b.classList.toggle("sel", b === el));
    $("#sendRep").disabled = false;
    $("#repHint").textContent = "Tu reporte será revisado por Serenazgo.";
  },
  attach: (el) => {
    const k = el.dataset.v;
    S.draft[k] = !S.draft[k];
    el.textContent = S.draft[k]
      ? k === "photo"
        ? "✅ Foto adjunta"
        : "✅ Audio adjunto"
      : k === "photo"
        ? "📷 Foto"
        : "🎤 Audio";
  },
  sendReport: () => {
    const d = S.draft;
    if (!d.type) return;
    const loc = "Av. Principal";
    S.reports.push({
      id: Date.now(),
      type: d.type,
      loc,
      user: S.role === "visitante" ? "Visitante" : "Rosa Q.",
      t: S.clock,
      prio: ["heridos", "incendio", "derrumbe", "inundacion"].includes(d.type)
        ? "alta"
        : d.type === "bloqueo"
          ? "media"
          : "baja",
      status: "pendiente",
      x: S.me.x + 30,
      y: S.me.y - 30,
      unit: null,
      desc: d.desc,
    });
    S.draft = { type: null, desc: "", photo: false, audio: false };
    toast("Reporte enviado. ¡Gracias por ayudar!", "ok");
    render();
  },
  /* chat */
  chip: (el) => {
    $("#chatIn").value = el.dataset.v;
    ACT.chatSend();
  },
  chatSend: () => {
    const i = $("#chatIn"),
      q = i.value.trim();
    if (!q) return;
    i.value = "";
    S.chat.push({ r: "u", t: q });
    upChat();
    setTimeout(() => {
      S.chat.push({ r: "b", t: botReply(q) });
      upChat();
    }, 450);
  },
  /* config */
  cfg: (el) => {
    const k = el.dataset.v,
      c = S.cfg;
    if (k === "lvl") c.lvl = (c.lvl + 1) % 4;
    else if (k === "size") c.size = (c.size + 1) % 3;
    else c[k] = !c[k];
    applyCfg();
    render();
  },
  /* SOS */
  sosModal: () => modal(sosCard()),
  sosConfirm: () => {
    const m = $("#sosMsg")?.value.trim() || "Solicito ayuda";
    const o = {
      id: Date.now(),
      name: S.role === "visitante" ? "Visitante" : S.me.name,
      loc: "Av. Principal, Ate",
      t: S.clock,
      prio: "alta",
      msg: m,
      lat: -12.0262,
      lon: -76.9051,
      status: "pendiente",
      unit: null,
      x: S.me.x,
      y: S.me.y,
    };
    S.sos.push(o);
    S.mySOS = o.id;
    closeModal();
    toast("🆘 SOS enviado a Serenazgo y Defensa Civil", "ok");
    render();
  },
  sosCancel: () => {
    S.sos = S.sos.filter((o) => o.id !== S.mySOS);
    S.mySOS = null;
    toast("SOS cancelado");
    render();
  },
  /* alertas */
  alertView: (el) => {
    const a = S.alerts.find((x) => x.id == el.dataset.v),
      n = nearest();
    modal(
      `<div class="row"><div class="aic">${KIND[a.kind][0]}</div><div><h3>${esc(a.title)}</h3><div class="xs muted">🕒 ${aT(a)} · ${esc(a.src)} · ${a.dist != null ? dist(a.dist) : "Toda Lima"}</div></div></div><div class="mt">${lvBadge(a.level)} ${badge(a.status === "activa" ? "red" : "green", a.status)}</div><p class="mt">${esc(a.msg)}</p>${a.status === "activa" && n && S.role !== "serenazgo" ? `<div class="card mt" style="background:var(--soft);box-shadow:none">🏫 Refugio más cercano: <b>${esc(n.name)}</b> · ${dist(n.dist)} · ${walk(n.dist)} min</div>` : ""}<div class="mf"><button class="btn ghost" data-a="mclose">Cerrar</button>${a.status === "activa" && S.role !== "serenazgo" ? '<button class="btn orange" data-a="evacGo">🏃 Ver ruta</button>' : ""}</div>`,
    );
  },
  evacGo: () => {
    closeModal();
    ACT.evacStart();
  },
  alertResolve: (el) => {
    const a = S.alerts.find((x) => x.id == el.dataset.v);
    modal(
      `<h3>¿Resolver esta alerta?</h3><p class="mt muted">${esc(a.short)} dejará de mostrarse como activa para ${num(a.users)} usuarios.</p><div class="mf"><button class="btn ghost" data-a="mclose">Cancelar</button><button class="btn green" data-a="alertResolveOk" data-v="${a.id}">Sí, resolver</button></div>`,
    );
  },
  alertResolveOk: (el) => {
    S.alerts.find((x) => x.id == el.dataset.v).status = "resuelta";
    closeModal();
    toast("Alerta resuelta", "ok");
    render();
  },
  alertNew: () => {
    const d = S.dA || {
      kind: "huaico",
      level: "alto",
      zone: "Ate, Lima",
      msg: "",
    };
    modal(
      `<h3>Crear nueva alerta</h3><label for="na-k">Tipo</label><select id="na-k">${Object.entries(
        KIND,
      )
        .map(
          ([k, v]) =>
            `<option value="${k}" ${d.kind === k ? "selected" : ""}>${v[0]} ${v[1]}</option>`,
        )
        .join(
          "",
        )}</select><label for="na-l">Nivel</label><select id="na-l">${Object.entries(
        LV,
      )
        .map(
          ([k, v]) =>
            `<option value="${k}" ${d.level === k ? "selected" : ""}>${v.s}</option>`,
        )
        .join(
          "",
        )}</select><label for="na-z">Zona</label><input id="na-z" type="text" value="${esc(d.zone)}"><label for="na-m">Mensaje para los ciudadanos</label><textarea id="na-m" rows="3" placeholder="Qué ocurre y qué deben hacer…">${esc(d.msg)}</textarea><div class="mf"><button class="btn ghost" data-a="mclose">Cancelar</button><button class="btn red" data-a="alertReview">Revisar →</button></div>`,
    );
  },
  alertReview: () => {
    const d = {
      kind: $("#na-k").value,
      level: $("#na-l").value,
      zone: $("#na-z").value.trim() || "Ate, Lima",
      msg: $("#na-m").value.trim(),
    };
    if (!d.msg) return toast("Escribe el mensaje de la alerta", "err");
    S.dA = d;
    const u = { critico: 12430, alto: 8200, medio: 3100, info: 1500 }[d.level];
    modal(
      `<h3>⚠️ Confirmar envío</h3><p class="mt">Vas a enviar una alerta <b>${LV[d.level].s}</b> de <b>${KIND[d.kind][1]}</b> en <b>${esc(d.zone)}</b> a aproximadamente <b>${num(u)} usuarios</b>.</p><div class="card mt" style="background:var(--soft);box-shadow:none">${esc(d.msg)}</div><p class="sm c-red mt">Esta acción no se puede deshacer.</p><div class="mf"><button class="btn ghost" data-a="alertNew">← Volver</button><button class="btn red" data-a="alertSend" data-v="${u}">🚨 Enviar ahora</button></div>`,
    );
  },
  alertSend: (el) => {
    const d = S.dA,
      u = +el.dataset.v;
    S.alerts.push({
      id: Date.now(),
      kind: d.kind,
      title: `${KIND[d.kind][1]} · ${d.zone}`,
      short: `${KIND[d.kind][1]} · ${d.zone}`,
      level: d.level,
      t: S.clock,
      src: "Serenazgo",
      users: u,
      status: "activa",
      dist: 1500,
      today: true,
      seen: false,
      msg: d.msg,
    });
    S.dA = null;
    closeModal();
    toast(`Alerta enviada a ${num(u)} usuarios`, "ok");
    render();
  },
  /* triaje / unidades */
  repSet: (el) => {
    const r = S.reports.find((x) => x.id == el.dataset.v);
    r.status = el.dataset.s;
    toast(
      el.dataset.s === "verificado"
        ? "Reporte verificado"
        : "Reporte rechazado",
      el.dataset.s === "verificado" ? "ok" : "",
    );
    render();
  },
  repUnit: (el) => {
    const r = S.reports.find((x) => x.id == el.dataset.v),
      us = S.units.filter((u) => u.st === "disponible");
    if (!us.length) return toast("No hay unidades disponibles", "err");
    modal(
      `<h3>Asignar unidad</h3><p class="muted sm">${RT[r.type][1]} · ${esc(r.loc)}</p><label for="un">Unidad disponible</label><select id="un">${us.map((u) => `<option value="${u.id}">${u.id} · ${u.op}</option>`).join("")}</select><div class="mf"><button class="btn ghost" data-a="mclose">Cancelar</button><button class="btn blue" data-a="repUnitOk" data-v="${r.id}">Asignar</button></div>`,
    );
  },
  repUnitOk: (el) => {
    const r = S.reports.find((x) => x.id == el.dataset.v),
      u = S.units.find((x) => x.id === $("#un").value);
    u.st = "ruta";
    u.mission = `Atender: ${RT[r.type][1]}`;
    u.loc = r.loc;
    u.x = r.x;
    u.y = r.y;
    r.unit = u.id;
    if (r.status === "pendiente") r.status = "revision";
    closeModal();
    toast(`${u.id} en camino a ${r.loc}`, "ok");
    render();
  },
  unitView: (el) => {
    const u = S.units.find((x) => x.id === el.dataset.v);
    toast(`🚓 ${u.id} · ${u.op} · ${u.loc} · ${uSt[u.st][1]}`);
  },
  unitAssign: (el) => {
    const u = S.units.find((x) => x.id === el.dataset.v),
      opts = [
        ...actSOS().map(
          (o) =>
            `<option value="s${o.id}">🆘 SOS · ${esc(o.name)} (${esc(o.loc)})</option>`,
        ),
        ...pendRep().map(
          (r) =>
            `<option value="r${r.id}">${RT[r.type][0]} ${RT[r.type][1]} · ${esc(r.loc)}</option>`,
        ),
        '<option value="p">Patrulla / disponible</option>',
      ];
    modal(
      `<h3>Asignar ${u.id}</h3><p class="muted sm">${u.op}</p><label for="ms">Misión</label><select id="ms">${opts.join("")}</select><div class="mf"><button class="btn ghost" data-a="mclose">Cancelar</button><button class="btn blue" data-a="unitAssignOk" data-v="${u.id}">Asignar</button></div>`,
    );
  },
  unitAssignOk: (el) => {
    const u = S.units.find((x) => x.id === el.dataset.v),
      v = $("#ms").value;
    if (v === "p") {
      u.st = "disponible";
      u.mission = "En patrulla";
    } else if (v[0] === "s") {
      const o = S.sos.find((x) => x.id == v.slice(1));
      u.st = "emergencia";
      u.mission = "Rescate SOS";
      u.loc = o.loc;
      u.x = o.x;
      u.y = o.y;
      o.unit = u.id;
      o.status = "asignado";
    } else {
      const r = S.reports.find((x) => x.id == v.slice(1));
      u.st = "ruta";
      u.mission = `Atender: ${RT[r.type][1]}`;
      u.loc = r.loc;
      u.x = r.x;
      u.y = r.y;
      r.unit = u.id;
    }
    closeModal();
    toast(`${u.id} asignada`, "ok");
    render();
  },
  sosAssign: (el) => {
    const o = S.sos.find((x) => x.id == el.dataset.v),
      us = S.units.filter((u) => u.st === "disponible" || u.id === o.unit);
    if (!us.length) return toast("No hay unidades disponibles", "err");
    modal(
      `<h3>Asignar unidad a SOS</h3><p class="muted sm">${esc(o.name)} · ${esc(o.loc)}</p><label for="un">Unidad</label><select id="un">${us.map((u) => `<option value="${u.id}">${u.id} · ${u.op}</option>`).join("")}</select><div class="mf"><button class="btn ghost" data-a="mclose">Cancelar</button><button class="btn blue" data-a="sosAssignOk" data-v="${o.id}">Asignar</button></div>`,
    );
  },
  sosAssignOk: (el) => {
    const o = S.sos.find((x) => x.id == el.dataset.v),
      u = S.units.find((x) => x.id === $("#un").value);
    u.st = "emergencia";
    u.mission = "Rescate SOS";
    u.loc = o.loc;
    u.x = o.x;
    u.y = o.y;
    o.unit = u.id;
    o.status = "asignado";
    closeModal();
    toast(`${u.id} asignada al SOS de ${o.name}`, "ok");
    render();
  },
  sosCall: (el) => {
    const o = S.sos.find((x) => x.id == el.dataset.v);
    toast(`📞 Contactando a ${o.name}…`);
  },
  sosDone: (el) => {
    const o = S.sos.find((x) => x.id == el.dataset.v);
    o.status = "atendido";
    const u = S.units.find((x) => x.id === o.unit);
    if (u) {
      u.st = "disponible";
      u.mission = "En patrulla";
    }
    toast("SOS marcado como atendido", "ok");
    render();
  },
  /* bloqueos / refugios */
  blockToggle: (el) => {
    const b = S.blocks.find((x) => x.id == el.dataset.v);
    b.active = !b.active;
    toast(b.active ? "Vía bloqueada" : "Vía habilitada", "ok");
    render();
  },
  blockEdit: (el) => {
    const b = S.blocks.find((x) => x.id == el.dataset.v);
    modal(
      `<h3>Editar bloqueo</h3><p class="muted sm">${esc(b.street)}</p><label for="bp">Prioridad</label><select id="bp">${["alta", "media", "baja"].map((p) => `<option ${b.prio === p ? "selected" : ""}>${p}</option>`).join("")}</select><div class="mf"><button class="btn ghost" data-a="mclose">Cancelar</button><button class="btn navy" data-a="blockSave" data-v="${b.id}">Guardar</button></div>`,
    );
  },
  blockSave: (el) => {
    S.blocks.find((x) => x.id == el.dataset.v).prio = $("#bp").value;
    closeModal();
    render();
  },
  blockAdd: () =>
    modal(
      `<h3>Agregar bloqueo</h3><label for="bs">Calle / cuadra</label><input id="bs" type="text" placeholder="Ej. Av. Central cdra 5"><label for="bc">Causa</label><select id="bc"><option>Derrumbe</option><option>Inundación</option><option>Accidente</option><option>Bloqueo ciudadano</option></select><label for="bp">Prioridad</label><select id="bp"><option>alta</option><option selected>media</option><option>baja</option></select><div class="mf"><button class="btn ghost" data-a="mclose">Cancelar</button><button class="btn navy" data-a="blockAddOk">Agregar</button></div>`,
    ),
  blockAddOk: () => {
    const s = $("#bs").value.trim();
    if (!s) return toast("Indica la calle", "err");
    const pos = [
      [460, 160],
      [580, 60],
      [100, 260],
      [700, 160],
    ][S.blocks.length % 4];
    S.blocks.push({
      id: Date.now(),
      street: s,
      cause: $("#bc").value,
      t: S.clock,
      prio: $("#bp").value,
      active: true,
      x: pos[0],
      y: pos[1],
    });
    closeModal();
    toast("Bloqueo agregado", "ok");
    render();
  },
  shAdj: (el) => {
    const s = S.shelters.find((x) => x.id == el.dataset.v);
    s.occ = Math.max(0, Math.min(s.cap, s.occ + +el.dataset.d));
    render();
  },
  shClose: (el) => {
    const s = S.shelters.find((x) => x.id == el.dataset.v);
    s.closed = !s.closed;
    toast(s.closed ? `${s.name} cerrado` : `${s.name} reabierto`);
    render();
  },
};
function oriH(e) {
  const h =
    e.webkitCompassHeading != null
      ? e.webkitCompassHeading
      : e.alpha != null
        ? 360 - e.alpha
        : null;
  if (h == null) return;
  S.heading = Math.round(h);
  const d = $("#dial");
  if (d) d.style.transform = `rotate(${-S.heading}deg)`;
}
function upChat() {
  const c = $("#chat");
  if (!c) return;
  c.innerHTML = chatHTML();
  c.scrollTop = c.scrollHeight;
}

/* ============ EVENTOS ============ */
document.addEventListener("click", (e) => {
  const el = e.target.closest("[data-a]");
  if (!el || el.tagName === "SELECT") return;
  const f = ACT[el.dataset.a];
  if (f) f(el, e);
});
document.addEventListener("change", (e) => {
  const el = e.target.closest("select[data-a]");
  if (el && ACT[el.dataset.a]) ACT[el.dataset.a](el, e);
});
document.addEventListener("input", (e) => {
  if (e.target.id === "repDesc") S.draft.desc = e.target.value;
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
  if (e.key === "Enter" && e.target.id === "chatIn") ACT.chatSend();
});
document.addEventListener("submit", (e) => {
  e.preventDefault();
  if (e.target.id === "lf") ACT.login();
});

/* ============ RENDER Y RUTEO ============ */
function applyCfg() {
  document.body.classList.toggle("dark", S.cfg.dark);
  document.body.classList.toggle("hc", S.cfg.hc);
  document.documentElement.style.fontSize = [16, 18, 20][S.cfg.size] + "px";
}
function parse() {
  const p = location.hash.replace(/^#\/?/, "").split("/");
  if (p[0] === "app" && NAV[p[1]]) {
    S.role = p[1];
    S.page = PAGES[p[1]][p[2]] ? p[2] : "dashboard";
    S.view = "app";
  } else if (p[0] === "login") S.view = "login";
  else S.view = "landing";
}
function render() {
  const a = $("#app");
  if (S.view === "landing") a.innerHTML = landing();
  else if (S.view === "login") a.innerHTML = login();
  else a.innerHTML = shell();
  if (S.view === "app" && S.role !== "serenazgo" && S.cfg.notif) {
    S.alerts
      .filter(
        (x) => !x.seen && x.status === "activa" && LV[x.level].n >= S.cfg.lvl,
      )
      .forEach((x) => {
        x.seen = true;
        toast(`🚨 Nueva alerta: ${x.short}`, "err");
      });
  }
  if (S.view === "app" && S.page === "asistente") upChat();
}
addEventListener("hashchange", () => {
  parse();
  S.menu = false;
  closeModal();
  render();
  scrollTo(0, 0);
});
setInterval(() => {
  S.clock++;
  $$(".clk").forEach((e) => (e.textContent = T12(S.clock)));
}, 60000);
applyCfg();
parse();
render();
