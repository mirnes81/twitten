import React, { useState, useEffect } from "react";
import {
  Grid3x3, Layers, Bath, Droplets, Hammer, Paintbrush, Zap, Flame,
  Camera, Mic, FileText, MapPin, ChevronRight, ChevronLeft, Search,
  Sparkles, AlertTriangle, Home, Briefcase, MessageSquare, User,
  CheckCircle2, Clock, Star, Shield, Send, Plus, Minus, X, Check,
  Calendar, TrendingUp, Eye, Image, PenLine, Building2, LayoutDashboard,
  BarChart3, Video, Phone, AlertCircle, FileSignature, Bell,
  Loader2, CreditCard, QrCode, LogOut, Lock, Mail
} from "lucide-react";
import { api, setToken, getToken } from "./api";

/* ---------------- Tokens ---------------- */
const T = {
  bg: "#F4F3EE", ink: "#16181C", sub: "#6B6F76", red: "#DD2A17",
  line: "#E4E2D9", white: "#FFFFFF", green: "#1E8A4E", greenBg: "#E8F4EC",
  amber: "#B97709", amberBg: "#FBF3E2", soft: "#ECEAE2", redBg: "#FDEEEC",
};
const FONT = "'Archivo', -apple-system, 'Segoe UI', Roboto, sans-serif";
const S = {
  h1: { fontFamily: FONT, fontWeight: 800, fontSize: 25, lineHeight: 1.1, letterSpacing: "-0.02em", color: T.ink },
  label: { fontFamily: FONT, fontWeight: 700, fontSize: 11, letterSpacing: "0.09em", textTransform: "uppercase", color: T.sub },
  body: { fontFamily: FONT, fontSize: 14, color: T.ink, lineHeight: 1.45 },
  sub: { fontFamily: FONT, fontSize: 13, color: T.sub, lineHeight: 1.4 },
};

/* ---------------- Building blocks ---------------- */
const Card = ({ children, style, onClick }) => (
  <div onClick={onClick} style={{ background: T.white, border: `1px solid ${T.line}`, borderRadius: 12, padding: 14, cursor: onClick ? "pointer" : "default", ...style }}>{children}</div>
);
const Btn = ({ children, onClick, kind = "primary", style, disabled }) => {
  const kinds = {
    primary: { background: T.red, color: "#fff" }, dark: { background: T.ink, color: "#fff" },
    ghost: { background: "transparent", color: T.ink, border: `1.5px solid ${T.ink}` },
    soft: { background: T.soft, color: T.ink }, green: { background: T.green, color: "#fff" },
  };
  return <button disabled={disabled} onClick={onClick} style={{
    fontFamily: FONT, fontWeight: 700, fontSize: 15, borderRadius: 10, padding: "13px 16px",
    width: "100%", border: "none", cursor: disabled ? "default" : "pointer",
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
    opacity: disabled ? 0.4 : 1, ...kinds[kind], ...style
  }}>{children}</button>;
};
const Chip = ({ children, active, onClick, style }) => (
  <button onClick={onClick} style={{
    fontFamily: FONT, fontWeight: 600, fontSize: 14, padding: "12px 14px", borderRadius: 10,
    cursor: "pointer", textAlign: "left", border: active ? `2px solid ${T.red}` : `1px solid ${T.line}`,
    background: active ? T.redBg : T.white, color: T.ink, display: "flex", alignItems: "center", gap: 8, ...style
  }}>{active && <Check size={16} color={T.red} strokeWidth={3} />}{children}</button>
);
const Tag = ({ children, color = T.sub, bg = T.soft, style }) => (
  <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: 11, color, background: bg, padding: "3px 8px", borderRadius: 6, whiteSpace: "nowrap", ...style }}>{children}</span>
);
const TileProgress = ({ step, total }) => (
  <div style={{ display: "flex", gap: 3 }}>
    {Array.from({ length: total }).map((_, i) => (
      <div key={i} style={{ flex: 1, height: 6, borderRadius: 2, background: i < step ? T.red : T.soft, transition: "background .3s" }} />
    ))}
  </div>
);
const Back = ({ onClick, label }) => (
  <button onClick={onClick} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, padding: 0, margin: "6px 0 10px", fontFamily: FONT, fontWeight: 700, fontSize: 13, color: T.sub }}>
    <ChevronLeft size={16} /> {label}
  </button>
);
const KPI = ({ n, l, c }) => (
  <Card style={{ padding: "12px 12px", textAlign: "left" }}>
    <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 22, color: c || T.ink, letterSpacing: "-0.02em" }}>{n}</div>
    <div style={{ ...S.sub, fontSize: 11.5, marginTop: 2 }}>{l}</div>
  </Card>
);
const Stars = ({ v, set, size = 22 }) => (
  <div style={{ display: "flex", gap: 4 }}>
    {[1, 2, 3, 4, 5].map(i => (
      <Star key={i} size={size} style={{ cursor: set ? "pointer" : "default" }}
        color={i <= v ? T.amber : T.line} fill={i <= v ? T.amber : "none"}
        onClick={() => set && set(i)} />
    ))}
  </div>
);

/* ---------------- Data ---------------- */
const CATS = [
  { n: "Carrelage", I: Grid3x3, live: true }, { n: "Parquet", I: Layers, live: true },
  { n: "Salle de bains", I: Bath, live: true }, { n: "Sanitaire", I: Droplets, live: true },
  { n: "Rénovation", I: Hammer, live: true }, { n: "Peinture", I: Paintbrush, live: false },
  { n: "Électricité", I: Zap, live: false }, { n: "Chauffage", I: Flame, live: false },
];
/* ---------------- Catalogues de soumission (bordereaux par métier) ---------------- */
// Grilles de positions inspirées des catalogues CAN/CRB utilisés en Suisse romande :
// chaque position a une unité fixe (m², ml, pce, forfait) et une quantité calculée depuis
// les métrés du chantier publié. L'entreprise ne saisit que son prix unitaire.
const METRES_SCHEMAS = {
  Carrelage: {
    surfSol: ["Surface sol", "m²"], surfMur: ["Surface murs", "m²"], mlEtanch: ["Étanchéité relevés", "ml"],
    mlPlinthes: ["Plinthes", "ml"], mlSeuils: ["Seuils / profilés", "ml"], mlJoints: ["Joints de dilatation", "ml"],
    nbDouches: ["Douches italiennes", "pce"],
  },
  "Salle de bains": {
    surfSol: ["Surface sol", "m²"], surfMur: ["Surface murs", "m²"], mlEtanch: ["Étanchéité relevés", "ml"],
    mlPlinthes: ["Plinthes", "ml"], mlSeuils: ["Seuils / profilés", "ml"], mlJoints: ["Joints de dilatation", "ml"],
    nbDouches: ["Douches italiennes", "pce"],
  },
  Parquet: {
    surfDepose: ["Surface à déposer", "m²"], surfPose: ["Surface à poser", "m²"],
    mlPlinthes: ["Plinthes", "ml"], surfPoncage: ["Ponçage / vitrification", "m²"], nbSeuils: ["Seuils de porte", "pce"],
  },
  Sanitaire: {
    nbAppareils: ["Appareils sanitaires", "pce"], nbPointsEau: ["Points d'eau", "pce"],
    mlTuyauterie: ["Tuyauterie", "ml"], nbRadiateurs: ["Radiateurs", "pce"],
  },
  Rénovation: {
    surfSol: ["Surface sol", "m²"], surfMur: ["Surface murs", "m²"], mlCloisons: ["Cloisons", "ml"], nbPieces: ["Pièces concernées", "pce"],
  },
};
const metresDefaut = categorie => Object.fromEntries(Object.keys(METRES_SCHEMAS[categorie] || METRES_SCHEMAS.Carrelage).map(k => [k, 0]));

const CATALOGUE_CARRELAGE = [
  { code: "111.1", d: "Installation de chantier et protections", u: "forfait", qKey: null },
  { code: "221.2", d: "Dépose de l'ancien revêtement", u: "m²", qKey: "surfSol" },
  { code: "221.4", d: "Évacuation et mise en décharge des gravats", u: "forfait", qKey: null },
  { code: "228.1", d: "Préparation du support / ragréage", u: "m²", qKey: "surfSol" },
  { code: "271.3", d: "Étanchéité (SEP) sol", u: "m²", qKey: "surfSol" },
  { code: "271.5", d: "Étanchéité relevés muraux et angles", u: "ml", qKey: "mlEtanch" },
  { code: "241.1", d: "Fourniture et pose carrelage sol", u: "m²", qKey: "surfSol" },
  { code: "241.3", d: "Fourniture et pose carrelage mural", u: "m²", qKey: "surfMur" },
  { code: "241.6", d: "Pose plinthes", u: "ml", qKey: "mlPlinthes" },
  { code: "241.8", d: "Seuils et profilés de finition", u: "ml", qKey: "mlSeuils" },
  { code: "241.9", d: "Joints de dilatation périphériques", u: "ml", qKey: "mlJoints" },
  { code: "251.4", d: "Douche italienne complète (receveur à carreler)", u: "pce", qKey: "nbDouches" },
  { code: "299.0", d: "Nettoyage fin de chantier", u: "forfait", qKey: null },
];
const CATALOGUES = {
  Carrelage: CATALOGUE_CARRELAGE,
  "Salle de bains": CATALOGUE_CARRELAGE,
  Parquet: [
    { code: "622.1", d: "Dépose de l'ancien revêtement", u: "m²", qKey: "surfDepose" },
    { code: "622.3", d: "Préparation et ragréage du support", u: "m²", qKey: "surfPose" },
    { code: "631.1", d: "Fourniture et pose parquet", u: "m²", qKey: "surfPose" },
    { code: "631.5", d: "Pose plinthes", u: "ml", qKey: "mlPlinthes" },
    { code: "631.8", d: "Ponçage et vitrification", u: "m²", qKey: "surfPoncage" },
    { code: "631.9", d: "Seuils de porte", u: "pce", qKey: "nbSeuils" },
    { code: "299.0", d: "Nettoyage fin de chantier", u: "forfait", qKey: null },
  ],
  Sanitaire: [
    { code: "421.1", d: "Dépose des appareils sanitaires existants", u: "pce", qKey: "nbAppareils" },
    { code: "421.4", d: "Raccordement des points d'eau", u: "pce", qKey: "nbPointsEau" },
    { code: "421.6", d: "Pose de tuyauterie", u: "ml", qKey: "mlTuyauterie" },
    { code: "422.1", d: "Fourniture et pose appareils sanitaires", u: "pce", qKey: "nbAppareils" },
    { code: "422.5", d: "Fourniture et pose radiateurs", u: "pce", qKey: "nbRadiateurs" },
    { code: "429.0", d: "Mise en service et tests d'étanchéité", u: "forfait", qKey: null },
  ],
  Rénovation: [
    { code: "111.1", d: "Installation de chantier et protections", u: "forfait", qKey: null },
    { code: "201.1", d: "Démolition et évacuation", u: "forfait", qKey: null },
    { code: "211.2", d: "Cloisons à créer ou déplacer", u: "ml", qKey: "mlCloisons" },
    { code: "228.1", d: "Préparation des supports", u: "m²", qKey: "surfSol" },
    { code: "281.1", d: "Finitions sol", u: "m²", qKey: "surfSol" },
    { code: "282.1", d: "Finitions murs", u: "m²", qKey: "surfMur" },
    { code: "299.0", d: "Nettoyage fin de chantier", u: "forfait", qKey: null },
  ],
};
// Prix de référence marché (CHF), affichés à titre indicatif — l'entreprise reste libre de son prix.
const PRIX_REF = {
  "111.1": 250, "221.2": 35, "221.4": 180, "228.1": 28, "271.3": 42, "271.5": 38,
  "241.1": 95, "241.3": 88, "241.6": 24, "241.8": 32, "241.9": 12, "251.4": 1850, "299.0": 220,
  "622.1": 28, "622.3": 18, "631.1": 110, "631.5": 22, "631.8": 45, "631.9": 85,
  "421.1": 120, "421.4": 180, "421.6": 45, "422.1": 650, "422.5": 420, "429.0": 150,
  "201.1": 850, "211.2": 95, "281.1": 60, "282.1": 55,
};
const buildBoqLines = (categorie, metres) => (CATALOGUES[categorie] || CATALOGUES.Carrelage)
  .map(p => ({ code: p.code, d: p.d, u: p.u, q: p.qKey ? (metres[p.qKey] || 0) : 1, pu: PRIX_REF[p.code] || 0 }))
  .filter(l => l.q > 0);
const emptyChForm = () => ({
  titre: "", categorie: "Carrelage", ville: "", adresse: "", typeBien: "Appartement", etage: "", numAppart: "", desc: "",
  metres: metresDefaut("Carrelage"),
  budget: "10 000 – 25 000 CHF", delai: "Dans le mois", limite: "", prive: false, invites: [], photos: [],
  demandeur: "",
});
/* ---------------- Commission plateforme (facturation entreprises) ---------------- */
const COMMISSION_RATES = { Starter: 0.10, Pro: 0.07, Premium: 0.04 };
const ADMIN_QUEUE = [
  { t: "Salle de bains — Savièse", s: "Il y a 12 min · Particulier · Dossier complet", q: "A", go: true },
  { t: "Peinture façade — Martigny", s: "Il y a 1 h · Catégorie à corriger", q: "B" },
  { t: "Carrelage 15 m² — Sierre", s: "Il y a 3 h · Doublon possible", q: "C" },
];

/* ================================================================== */
export default function App() {
  const [authUser, setAuthUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [authScreen, setAuthScreen] = useState("login");
  const [authError, setAuthError] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [authForm, setAuthForm] = useState({
    role: "client", email: "", password: "", nom: "", entreprise: "", organisation: "", npaCommune: "",
  });
  const [prosDisponibles, setProsDisponibles] = useState([]);

  const [role, setRole] = useState(null);
  const [screen, setScreen] = useState("home");
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    type: "Rénovation", bien: "Appartement", npa: "1965 Savièse", surfSol: 7, surfMur: 20,
    sdb: true, depose: true, chauff: false, budget: "10 000 – 25 000 CHF", delai: "Dans le mois",
    visite: "Visite sur place", creneau: "Mardi 14h–17h",
  });
  const [review, setReview] = useState({ q: 5, prix: 5, delai: 4, com: 5, prop: 5, sav: 5, commentaire: "", done: false });
  const [chantiers, setChantiers] = useState([]);
  const [soumissions, setSoumissions] = useState([]);
  const [suivis, setSuivis] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedChantierId, setSelectedChantierId] = useState(null);
  const [pilotChantierId, setPilotChantierId] = useState(null);
  const [suiviId, setSuiviId] = useState(null);
  const [pdfSoumissionId, setPdfSoumissionId] = useState(null);
  const [factures, setFactures] = useState([]);
  const [pdfFactureId, setPdfFactureId] = useState(null);
  const [monChantierId, setMonChantierId] = useState(null);
  const [selectedSoumissionId, setSelectedSoumissionId] = useState(null);
  const [chatChantierId, setChatChantierId] = useState(null);
  const [chStep, setChStep] = useState(0);
  const [chForm, setChForm] = useState(emptyChForm());
  const [bidLines, setBidLines] = useState([]);
  const [bidMeta, setBidMeta] = useState({ delaiDebut: "", duree: "", garantie: "5 ans", remarques: "" });
  const [chatMsgs, setChatMsgs] = useState([
    { me: false, t: "Bonjour ! Merci pour votre demande. La niche murale est-elle à créer ou existante ?" },
    { me: true, t: "À créer, environ 60×30 cm dans la douche." },
    { me: false, t: "Parfait, c'est inclus dans notre offre Recommandé. Nous pouvons commencer le 5 août." },
  ]);
  const [draft, setDraft] = useState("");
  const [adminValidated, setAdminValidated] = useState(false);
  const [selectedCos, setSelectedCos] = useState(["MV-3 PRO Sàrl", "Carrelage Dubuis Sàrl", "Batisol Valais SA"]);
  const [aiText, setAiText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [payMethod, setPayMethod] = useState("TWINT");
  const [onb, setOnb] = useState(0);
  const [plan, setPlan] = useState("Premium");

  useEffect(() => {
    const l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Archivo:wght@400;600;700;800;900&display=swap";
    document.head.appendChild(l);
    const st = document.createElement("style");
    st.textContent = "@keyframes spin{to{transform:rotate(360deg)}}" +
      "@media print{body *{visibility:hidden}.pdf-doc,.pdf-doc *{visibility:visible}" +
      ".pdf-doc{position:absolute;left:0;top:0;box-shadow:none!important;margin:0!important}" +
      ".no-print{display:none!important}@page{size:A4;margin:0}}";
    document.head.appendChild(st);
  }, []);

  useEffect(() => {
    (async () => {
      const t = getToken();
      if (!t) { setAuthChecked(true); return; }
      try {
        const { user } = await api.me();
        await afterLogin(user);
      } catch {
        setToken(null);
      }
      setAuthChecked(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const go = s => { setScreen(s); window.scrollTo(0, 0); };
  const MY_ENTREPRISE = authUser?.entreprise || authUser?.nom || "";
  const MY_ORG = authUser?.organisation || authUser?.nom || "";

  /* --- Authentification --- */
  const refreshAll = async (u) => {
    const me = u || authUser;
    if (!me) return;
    setDataLoading(true);
    try {
      let chs = [], soums = [], suivisList = [];
      if (me.role === "pro") {
        const [{ chantiers: browseChs }, { soumissions: mySoums }] = await Promise.all([
          api.listChantiers("browse"), api.listMySoumissions(),
        ]);
        soums = mySoums;
        const knownIds = new Set(browseChs.map(c => c.id));
        const extraIds = [...new Set(mySoums.map(s => s.chantierId))].filter(id => !knownIds.has(id));
        const extraChs = await Promise.all(extraIds.map(id => api.getChantier(id).then(r => r.chantier)));
        chs = [...browseChs, ...extraChs];
        const wonIds = mySoums.filter(s => s.statut === "Gagnée").map(s => s.chantierId);
        suivisList = (await Promise.all(wonIds.map(id => api.getSuiviByChantier(id).then(r => r.suivi)))).filter(Boolean);
      } else {
        const { chantiers: myChs } = await api.listChantiers();
        chs = myChs;
        soums = (await Promise.all(chs.map(c => api.listSoumissions(c.id).then(r => r.soumissions)))).flat();
        suivisList = (await Promise.all(
          chs.filter(c => c.statut !== "Ouvert").map(c => api.getSuiviByChantier(c.id).then(r => r.suivi))
        )).filter(Boolean);
      }
      setChantiers(chs);
      setSoumissions(soums);
      setSuivis(suivisList);
      if (me.role === "client" && !monChantierId && chs.length) setMonChantierId(chs[0].id);
      if (me.role === "pro" || me.role === "admin") {
        const { factures: facs } = await api.listFactures();
        setFactures(facs);
      }
      if (me.role === "admin" || me.role === "promo") {
        const { pros } = await api.listPros();
        setProsDisponibles(pros);
      }
      const { notifications: notifs } = await api.listNotifications();
      setNotifications(notifs);
    } catch (e) {
      console.error("refreshAll", e);
    }
    setDataLoading(false);
  };

  const afterLogin = async (u) => {
    setAuthUser(u);
    setRole(u.role);
    if (u.role === "pro" && u.plan) setPlan(u.plan);
    await refreshAll(u);
    go(u.role === "pro" ? "proHome" : u.role === "promo" ? "promoHome" : u.role === "admin" ? "adminHome" : "home");
  };
  const doLogin = async (email, password) => {
    setAuthError(""); setAuthBusy(true);
    try {
      const { token, user } = await api.login({ email, password });
      setToken(token);
      await afterLogin(user);
    } catch (e) {
      setAuthError(e.message);
    }
    setAuthBusy(false);
  };
  const doRegister = async (payload) => {
    setAuthError(""); setAuthBusy(true);
    try {
      const { token, user } = await api.register(payload);
      setToken(token);
      await afterLogin(user);
    } catch (e) {
      setAuthError(e.message);
    }
    setAuthBusy(false);
  };
  const doLogout = async () => {
    try { await api.logout(); } catch { /* déjà expiré, tant pis */ }
    setToken(null);
    setAuthUser(null);
    setRole(null);
    setChantiers([]); setSoumissions([]); setSuivis([]); setFactures([]); setNotifications([]);
    setMonChantierId(null);
    go("home");
  };

  /* --- Marketplace : publication de chantiers et soumissions structurées --- */
  const uploadFile = async file => {
    const { url, name } = await api.upload(file);
    return { url, name };
  };
  const setMetre = (k, v) => setChForm(f => ({ ...f, metres: { ...f.metres, [k]: Math.max(0, v) } }));
  const setChCategorie = cat => setChForm(f => ({ ...f, categorie: cat, metres: metresDefaut(cat) }));
  const toggleInvite = nom => setChForm(f => ({ ...f, invites: f.invites.includes(nom) ? f.invites.filter(x => x !== nom) : [...f.invites, nom] }));
  const addChPhotos = async files => {
    const uploaded = await Promise.all(Array.from(files).map(uploadFile));
    setChForm(f => ({ ...f, photos: [...f.photos, ...uploaded] }));
  };
  const removeChPhoto = i => setChForm(f => ({ ...f, photos: f.photos.filter((_, j) => j !== i) }));
  const publishChantier = async () => {
    await api.createChantier({ ...chForm, demandeur: chForm.demandeur.trim() });
    setChStep(0);
    setChForm(emptyChForm());
    await refreshAll();
    go("chantierPublished");
  };
  const publishClientDemande = async () => {
    const payload = {
      titre: `${form.type} — ${form.bien}`, categorie: "Carrelage", ville: form.npa, adresse: "",
      typeBien: form.bien, etage: "", numAppart: "",
      desc: [form.type, form.sdb && "Douche italienne à créer", form.depose && "Dépose de l'ancien revêtement", form.chauff && "Chauffage au sol"].filter(Boolean).join(" · "),
      metres: { surfSol: form.surfSol, surfMur: form.surfMur, mlEtanch: 0, mlPlinthes: 0, mlSeuils: 0, mlJoints: 0, nbDouches: form.sdb ? 1 : 0 },
      budget: form.budget, delai: form.delai, limite: "", prive: false, invites: [], photos: [],
      tags: [form.type],
    };
    const { chantier } = await api.createChantier(payload);
    setMonChantierId(chantier.id);
    await refreshAll();
    go("published");
  };
  const startPromoProject = () => {
    setChForm({ ...emptyChForm(), demandeur: MY_ORG });
    setChStep(0);
    go("adminPublish");
  };
  const openBid = chantierId => {
    const ch = chantiers.find(c => c.id === chantierId);
    setSelectedChantierId(chantierId);
    setBidLines(buildBoqLines(ch.categorie, ch.metres));
    setBidMeta({ delaiDebut: "", duree: "", garantie: "5 ans", remarques: "" });
    go("proBid");
  };
  const updateBidLine = (i, field, value) => setBidLines(ls => ls.map((l, j) => j === i ? { ...l, [field]: Math.max(0, Number(value) || 0) } : l));
  const bidTotal = bidLines.reduce((s, l) => s + l.q * l.pu, 0);
  const submitBid = async () => {
    await api.createSoumission({
      chantierId: selectedChantierId, lignes: bidLines,
      delaiDebut: bidMeta.delaiDebut, duree: bidMeta.duree, garantie: bidMeta.garantie, remarques: bidMeta.remarques,
    });
    await refreshAll();
    go("proSent");
  };
  const adjuger = async (chantierId, soumissionId) => {
    await api.adjuger(soumissionId);
    await refreshAll();
    const { suivi } = await api.getSuiviByChantier(chantierId);
    return suivi;
  };
  const payerFacture = async id => {
    await api.payFacture(id);
    await refreshAll();
  };
  const viewFacturePdf = id => { setPdfFactureId(id); go("facturePdf"); };
  const toggleJalon = async (sid, jid) => {
    await api.toggleJalon(sid, jid);
    await refreshAll();
  };
  const addSuiviPhoto = async (sid, cat, files) => {
    const uploaded = await Promise.all(Array.from(files).map(uploadFile));
    for (const p of uploaded) await api.addSuiviPhoto(sid, cat, p.url, p.name);
    await refreshAll();
  };
  const removeSuiviPhoto = async (sid, cat, i) => {
    const suivi = suivis.find(s => s.id === sid);
    const photo = suivi?.photos?.[cat]?.[i];
    if (!photo) return;
    await api.removeSuiviPhoto(sid, photo.url);
    await refreshAll();
  };
  const finirChantier = async sid => {
    await api.finishSuivi(sid);
    await refreshAll();
  };
  const addSuiviDoc = async (sid, jalonId, file) => {
    if (!file) return;
    const { url, name } = await uploadFile(file);
    await api.addSuiviDocument(sid, jalonId, url, name);
    await refreshAll();
  };
  const removeSuiviDoc = async (sid, docId) => {
    await api.removeSuiviDocument(docId);
    await refreshAll();
  };
  const viewPdf = soumissionId => { setPdfSoumissionId(soumissionId); go("bordereauPdf"); };

  /* --- Analyse IA réelle (API Anthropic) --- */
  const analyzeAI = async () => {
    setAiLoading(true); setAiResult(null);
    try {
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6", max_tokens: 1000,
          messages: [{
            role: "user",
            content: `Tu es l'assistant de la marketplace suisse de travaux MV3 Connect. Analyse la description de projet du client et réponds UNIQUEMENT avec un objet JSON valide, sans backticks ni texte autour, au format exact: {"categorie": string (métier principal, ex. Carrelage, Parquet, Sanitaire, Peinture...), "type": un de ["Rénovation","Nouvelle construction","Réparation","Fourniture et pose","Pose uniquement","Demande urgente"], "bien": un de ["Appartement","Maison","Villa","Immeuble","Commerce","Chantier de promotion"], "surfSol": nombre entier en m² (0 si inconnu), "surfMur": nombre entier en m² (0 si inconnu), "sdb": booléen (douche italienne mentionnée), "depose": booléen (dépose d'un ancien revêtement), "chauff": booléen (chauffage au sol), "budget": un de ["Je ne connais pas mon budget","5 000 – 10 000 CHF","10 000 – 25 000 CHF","25 000 – 50 000 CHF"], "delai": un de ["Urgent — sous 48 h","Dans les 2 semaines","Dans le mois","Flexible"], "resume": string (résumé professionnel en 2 phrases en français)}. Description du client: "${aiText}"`
          }]
        })
      });
      const data = await r.json();
      const txt = data.content.filter(b => b.type === "text").map(b => b.text).join("");
      setAiResult(JSON.parse(txt.replace(/```json|```/g, "").trim()));
    } catch (e) {
      setAiResult({ categorie: "Carrelage", type: "Rénovation", bien: "Appartement", surfSol: 7, surfMur: 20, sdb: true, depose: true, chauff: false, budget: "10 000 – 25 000 CHF", delai: "Dans le mois", resume: "Mode démo hors ligne : rénovation de salle de bains estimée d'après votre description. Confirmez ou corrigez les éléments détectés." });
    }
    setAiLoading(false);
  };
  const applyAI = () => {
    setForm(f => ({
      ...f, type: aiResult.type, bien: aiResult.bien,
      surfSol: aiResult.surfSol || f.surfSol, surfMur: aiResult.surfMur || f.surfMur,
      sdb: aiResult.sdb, depose: aiResult.depose, chauff: aiResult.chauff,
      budget: aiResult.budget, delai: aiResult.delai,
    }));
    setStep(8); go("form");
  };

  /* ---------------- Authentification ---------------- */
  const AuthScreen = () => {
    const isRegister = authScreen === "register";
    const af = k => e => setAuthForm(f => ({ ...f, [k]: e.target.value }));
    const submit = e => {
      e.preventDefault();
      if (isRegister) {
        doRegister({
          role: authForm.role, email: authForm.email, password: authForm.password, nom: authForm.nom,
          entreprise: authForm.entreprise, organisation: authForm.organisation, npaCommune: authForm.npaCommune,
        });
      } else {
        doLogin(authForm.email, authForm.password);
      }
    };
    return (
      <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ width: "100%", maxWidth: 380 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 22 }}>
            <div style={{ width: 26, height: 26, background: T.red, borderRadius: 5, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, padding: 4 }}>
              {[0, 1, 2, 3].map(i => <div key={i} style={{ background: "#fff", borderRadius: 1 }} />)}
            </div>
            <span style={{ fontFamily: FONT, fontWeight: 900, fontSize: 19, letterSpacing: "-0.02em" }}>MV3 CONNECT</span>
          </div>
          <Card style={{ padding: 22 }}>
            <div style={{ display: "flex", background: T.soft, borderRadius: 10, padding: 3, marginBottom: 18 }}>
              {[["login", "Se connecter"], ["register", "Créer un compte"]].map(([k, l]) => (
                <button key={k} onClick={() => { setAuthScreen(k); setAuthError(""); }} style={{
                  flex: 1, fontFamily: FONT, fontWeight: 700, fontSize: 13, padding: "9px 4px", borderRadius: 8,
                  border: "none", cursor: "pointer", background: authScreen === k ? T.white : "transparent",
                  color: authScreen === k ? T.red : T.sub, boxShadow: authScreen === k ? "0 1px 3px rgba(0,0,0,.08)" : "none",
                }}>{l}</button>
              ))}
            </div>
            <form onSubmit={submit} style={{ display: "grid", gap: 10 }}>
              {isRegister && <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
                  {[["client", "Client"], ["pro", "Sous-traitant"], ["promo", "Promoteur"]].map(([r, l]) => (
                    <button type="button" key={r} onClick={() => setAuthForm(f => ({ ...f, role: r }))} style={{
                      fontFamily: FONT, fontWeight: 700, fontSize: 11.5, padding: "9px 4px", borderRadius: 8,
                      border: authForm.role === r ? `2px solid ${T.red}` : `1px solid ${T.line}`,
                      background: authForm.role === r ? T.redBg : T.white, color: T.ink, cursor: "pointer",
                    }}>{l}</button>
                  ))}
                </div>
                <input required placeholder="Nom complet" value={authForm.nom} onChange={af("nom")}
                  style={{ fontFamily: FONT, fontSize: 14, padding: "12px 14px", borderRadius: 10, border: `1px solid ${T.line}`, outline: "none" }} />
                {authForm.role === "pro" && (
                  <input placeholder="Raison sociale de l'entreprise" value={authForm.entreprise} onChange={af("entreprise")}
                    style={{ fontFamily: FONT, fontSize: 14, padding: "12px 14px", borderRadius: 10, border: `1px solid ${T.line}`, outline: "none" }} />
                )}
                {authForm.role === "promo" && (
                  <input placeholder="Organisation (bureau, régie…)" value={authForm.organisation} onChange={af("organisation")}
                    style={{ fontFamily: FONT, fontSize: 14, padding: "12px 14px", borderRadius: 10, border: `1px solid ${T.line}`, outline: "none" }} />
                )}
                {authForm.role === "client" && (
                  <input placeholder="NPA et commune" value={authForm.npaCommune} onChange={af("npaCommune")}
                    style={{ fontFamily: FONT, fontSize: 14, padding: "12px 14px", borderRadius: 10, border: `1px solid ${T.line}`, outline: "none" }} />
                )}
              </>}
              <div style={{ display: "flex", alignItems: "center", gap: 8, border: `1px solid ${T.line}`, borderRadius: 10, padding: "0 12px" }}>
                <Mail size={15} color={T.sub} />
                <input required type="email" placeholder="E-mail" value={authForm.email} onChange={af("email")} autoComplete="username"
                  style={{ flex: 1, fontFamily: FONT, fontSize: 14, padding: "12px 0", border: "none", outline: "none", background: "transparent" }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, border: `1px solid ${T.line}`, borderRadius: 10, padding: "0 12px" }}>
                <Lock size={15} color={T.sub} />
                <input required type="password" placeholder="Mot de passe" value={authForm.password} onChange={af("password")}
                  autoComplete={isRegister ? "new-password" : "current-password"} minLength={isRegister ? 8 : undefined}
                  style={{ flex: 1, fontFamily: FONT, fontSize: 14, padding: "12px 0", border: "none", outline: "none", background: "transparent" }} />
              </div>
              {authError && <div style={{ ...S.sub, color: T.red, fontWeight: 700, fontSize: 12.5 }}>{authError}</div>}
              <Btn disabled={authBusy} style={{ marginTop: 4 }}>
                {authBusy ? <Loader2 size={17} style={{ animation: "spin 1s linear infinite" }} /> : (isRegister ? "Créer mon compte" : "Se connecter")}
              </Btn>
            </form>
          </Card>
          <div style={{ ...S.sub, fontSize: 11.5, textAlign: "center", marginTop: 14 }}>
            Les comptes administrateur sont créés directement par l'équipe MV3 Connect.
          </div>
        </div>
      </div>
    );
  };

  /* ---------------- Header ---------------- */
  const Header = () => (
    <div style={{ position: "sticky", top: 0, zIndex: 20, background: T.bg, borderBottom: `1px solid ${T.line}`, padding: "12px 14px 10px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <div style={{ width: 21, height: 21, background: T.red, borderRadius: 4, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, padding: 3 }}>
            {[0, 1, 2, 3].map(i => <div key={i} style={{ background: "#fff", borderRadius: 1 }} />)}
          </div>
          <span style={{ fontFamily: FONT, fontWeight: 900, fontSize: 15.5, letterSpacing: "-0.02em" }}>MV3 CONNECT</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button onClick={() => go("notifs")} style={{ position: "relative", background: T.white, border: `1px solid ${T.line}`, borderRadius: 9, padding: 7, cursor: "pointer", display: "flex" }}>
            <Bell size={15} color={T.ink} />
            {notifications.some(n => !n.lu) && <span style={{ position: "absolute", top: 4, right: 4, width: 7, height: 7, borderRadius: "50%", background: T.red }} />}
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: T.soft, borderRadius: 9, padding: "5px 6px 5px 10px" }}>
            <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: 11.5, color: T.ink, maxWidth: 90, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {authUser?.entreprise || authUser?.organisation || authUser?.nom}
            </span>
            <button onClick={doLogout} title="Se déconnecter" style={{ background: T.white, border: `1px solid ${T.line}`, borderRadius: 7, padding: 5, cursor: "pointer", display: "flex" }}>
              <LogOut size={13} color={T.sub} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  /* ---------------- Bottom nav ---------------- */
  const NAVS = {
    client: [["home", Home, "Accueil"], ["requests", Briefcase, "Chantiers"], ["chat", MessageSquare, "Messages"], ["profile", User, "Profil"]],
    pro: [["proHome", Home, "Chantiers"], ["proSent", Briefcase, "Soumissions"], ["proAgenda", Calendar, "Agenda"], ["proStats", BarChart3, "Stats"], ["profile", User, "Profil"]],
    promo: [["promoHome", Building2, "Projets"], ["chat", MessageSquare, "Messages"], ["profile", User, "Profil"]],
    admin: [["adminHome", LayoutDashboard, "Cockpit"], ["adminPublish", Plus, "Publier"], ["adminPilot", BarChart3, "Pilotage"], ["adminQueue", AlertCircle, "Vérifier"], ["profile", User, "Profil"]],
  };
  const NavBar = () => (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 30, background: T.white, borderTop: `1px solid ${T.line}`, display: "flex", justifyContent: "space-around", padding: "8px 0 max(10px, env(safe-area-inset-bottom))", maxWidth: 480, margin: "0 auto" }}>
      {NAVS[role].map(([s, I, lbl]) => {
        const a = screen === s;
        return (
          <button key={s} onClick={() => go(s)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, flex: 1 }}>
            <I size={20} color={a ? T.red : T.sub} strokeWidth={a ? 2.4 : 2} />
            <span style={{ fontFamily: FONT, fontSize: 10, fontWeight: a ? 800 : 600, color: a ? T.red : T.sub }}>{lbl}</span>
          </button>
        );
      })}
    </div>
  );

  /* ================= CLIENT — HOME ================= */
  const HomeScreen = () => (
    <div style={{ padding: 16 }}>
      <h1 style={{ ...S.h1, margin: "10px 0 4px" }}>Quel travail souhaitez-vous réaliser&nbsp;?</h1>
      <p style={{ ...S.sub, margin: "0 0 16px" }}>Publiez une demande en 3 minutes. Jusqu'à 4 offres comparables d'entreprises vérifiées en Valais.</p>
      <div style={{ display: "flex", alignItems: "center", gap: 10, background: T.white, border: `1px solid ${T.line}`, borderRadius: 12, padding: "13px 14px", marginBottom: 12 }}>
        <Search size={18} color={T.sub} /><span style={{ ...S.sub, fontSize: 14 }}>Ex. refaire une salle de bains…</span>
        <Mic size={17} color={T.red} style={{ marginLeft: "auto" }} />
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <Btn kind="dark" style={{ fontSize: 13, padding: "11px 6px" }} onClick={() => go("aiAssist")}><Sparkles size={16} /> Décrire avec l'IA</Btn>
        <Btn kind="ghost" style={{ fontSize: 13, padding: "11px 6px" }} onClick={() => { setStep(0); go("form"); }}><AlertTriangle size={16} /> Urgent</Btn>
      </div>
      <div style={S.label}>Catégories</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, background: T.line, padding: 6, borderRadius: 14, marginTop: 8 }}>
        {CATS.map(c => (
          <div key={c.n} onClick={() => c.live && (setStep(0), go("form"))} style={{ background: T.white, borderRadius: 9, padding: "17px 14px", cursor: c.live ? "pointer" : "default", opacity: c.live ? 1 : 0.55, display: "flex", flexDirection: "column", gap: 9 }}>
            <c.I size={23} color={c.live ? T.red : T.sub} strokeWidth={2.2} />
            <div>
              <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 14 }}>{c.n}</div>
              {!c.live && <div style={{ ...S.sub, fontSize: 11 }}>Bientôt</div>}
            </div>
          </div>
        ))}
      </div>
      <Card style={{ marginTop: 16, display: "flex", gap: 12, alignItems: "center" }}>
        <Shield size={26} color={T.green} />
        <div>
          <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 14 }}>Entreprises vérifiées</div>
          <div style={S.sub}>RC, AVS et registre du commerce contrôlés. Avis liés à de vrais chantiers.</div>
        </div>
      </Card>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 12 }}>
        <KPI n="1'240" l="chantiers réalisés" c={T.red} /><KPI n="4.8" l="note moyenne" /><KPI n="24 h" l="1ʳᵉ offre en moy." />
      </div>
    </div>
  );

  /* ================= CLIENT — FORM (9 étapes) ================= */
  const FORM_STEPS = ["Type de demande", "Type de bien", "Localisation", "Description des travaux", "Photos et documents", "Budget et délai", "Visite souhaitée", "Coordonnées", "Vérification"];
  const FormScreen = () => {
    const next = () => step < 8 ? setStep(step + 1) : publishClientDemande();
    const back = () => step > 0 ? setStep(step - 1) : go("home");
    return (
      <div style={{ padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "6px 0 14px" }}>
          <button onClick={back} style={{ background: T.white, border: `1px solid ${T.line}`, borderRadius: 9, padding: 8, cursor: "pointer", display: "flex" }}><ChevronLeft size={18} /></button>
          <div style={{ flex: 1 }}>
            <TileProgress step={step + 1} total={9} />
            <div style={{ ...S.sub, fontSize: 11, marginTop: 4 }}>Étape {step + 1} / 9 — Carrelage</div>
          </div>
        </div>
        <h2 style={{ ...S.h1, fontSize: 22, margin: "0 0 16px" }}>{FORM_STEPS[step]}</h2>

        {step === 0 && <div style={{ display: "grid", gap: 8 }}>
          {["Rénovation", "Nouvelle construction", "Réparation", "Fourniture et pose", "Pose uniquement", "Demande urgente"].map(o =>
            <Chip key={o} active={form.type === o} onClick={() => set("type", o)}>{o}</Chip>)}
        </div>}

        {step === 1 && <div style={{ display: "grid", gap: 8 }}>
          {["Appartement", "Maison", "Villa", "Immeuble", "Commerce", "Chantier de promotion"].map(o =>
            <Chip key={o} active={form.bien === o} onClick={() => set("bien", o)}>{o}</Chip>)}
        </div>}

        {step === 2 && <div style={{ display: "grid", gap: 10 }}>
          <Card><div style={S.label}>NPA et commune</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}><MapPin size={17} color={T.red} /><span style={{ ...S.body, fontWeight: 700 }}>{form.npa}</span></div>
          </Card>
          <Card><div style={S.label}>Accès</div><div style={{ ...S.body, marginTop: 6 }}>2ᵉ étage · Ascenseur ✓ · Stationnement ✓ · Accès camion ✓</div></Card>
          <Card style={{ background: T.amberBg, border: "none" }}>
            <div style={{ ...S.sub, color: T.amber, fontWeight: 600 }}>🔒 Votre adresse exacte reste masquée jusqu'à la mise en relation officielle.</div>
          </Card>
        </div>}

        {step === 3 && <div style={{ display: "grid", gap: 10 }}>
          <Card>
            <div style={S.label}>Surfaces</div>
            {[["Sol", "surfSol"], ["Murs", "surfMur"]].map(([lbl, k]) => (
              <div key={k} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
                <span style={{ ...S.body, fontWeight: 600 }}>{lbl}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <button onClick={() => set(k, Math.max(0, form[k] - 1))} style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${T.line}`, background: T.white, cursor: "pointer" }}><Minus size={14} /></button>
                  <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: 16, minWidth: 52, textAlign: "center" }}>{form[k]} m²</span>
                  <button onClick={() => set(k, form[k] + 1)} style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${T.line}`, background: T.white, cursor: "pointer" }}><Plus size={14} /></button>
                </div>
              </div>
            ))}
          </Card>
          <div style={S.label}>Options</div>
          {[["sdb", "Douche italienne à créer"], ["depose", "Dépose de l'ancien revêtement"], ["chauff", "Chauffage au sol"]].map(([k, lbl]) =>
            <Chip key={k} active={form[k]} onClick={() => set(k, !form[k])}>{lbl}</Chip>)}
        </div>}

        {step === 4 && <div style={{ display: "grid", gap: 10 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
            {[[Camera, "Photo"], [Video, "Vidéo"], [FileText, "Plan"], [Mic, "Vocal"]].map(([I, lbl]) => (
              <div key={lbl} style={{ background: T.white, border: `1.5px dashed ${T.line}`, borderRadius: 12, padding: "16px 4px", textAlign: "center", cursor: "pointer" }}>
                <I size={20} color={T.sub} style={{ margin: "0 auto 5px" }} />
                <div style={{ ...S.sub, fontWeight: 700, fontSize: 11 }}>{lbl}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {[1, 2, 3].map(i => <div key={i} style={{ width: 64, height: 64, borderRadius: 10, background: T.soft, display: "flex", alignItems: "center", justifyContent: "center" }}><Image size={20} color={T.sub} /></div>)}
          </div>
          <Card style={{ background: T.redBg, border: "none" }}>
            <div style={{ display: "flex", gap: 8 }}>
              <Sparkles size={18} color={T.red} style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 13, color: T.red }}>Analyse IA de vos photos</div>
                <div style={{ ...S.body, marginTop: 4 }}>Salle de bains d'environ <b>7 m² au sol</b>, murs à carreler <b>≈ 20 m²</b>, dépose de l'existant et <b>douche italienne</b> à prévoir.</div>
                <div style={{ display: "flex", gap: 8, marginTop: 10 }}><Tag color={T.green} bg={T.greenBg}>✓ Confirmé</Tag><Tag>Corriger</Tag></div>
              </div>
            </div>
          </Card>
        </div>}

        {step === 5 && <div>
          <div style={S.label}>Budget estimé</div>
          <div style={{ display: "grid", gap: 8, margin: "8px 0 18px" }}>
            {["Je ne connais pas mon budget", "5 000 – 10 000 CHF", "10 000 – 25 000 CHF", "25 000 – 50 000 CHF"].map(b =>
              <Chip key={b} active={form.budget === b} onClick={() => set("budget", b)}>{b}</Chip>)}
          </div>
          <div style={S.label}>Délai souhaité</div>
          <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
            {["Urgent — sous 48 h", "Dans les 2 semaines", "Dans le mois", "Flexible"].map(d =>
              <Chip key={d} active={form.delai === d} onClick={() => set("delai", d)}>{d}</Chip>)}
          </div>
        </div>}

        {step === 6 && <div>
          <div style={{ display: "grid", gap: 8 }}>
            {[["Devis sur dossier", FileText], ["Visite sur place", MapPin], ["Appel vidéo", Video], ["Rendez-vous téléphonique", Phone]].map(([o, I]) =>
              <Chip key={o} active={form.visite === o} onClick={() => set("visite", o)}><I size={16} color={T.sub} /> {o}</Chip>)}
          </div>
          {form.visite === "Visite sur place" && <>
            <div style={{ ...S.label, margin: "16px 0 8px" }}>Vos disponibilités</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["Mardi 14h–17h", "Jeudi 8h–12h", "Samedi matin"].map(c =>
                <Chip key={c} active={form.creneau === c} onClick={() => set("creneau", c)} style={{ padding: "9px 12px", fontSize: 13 }}>{c}</Chip>)}
            </div>
          </>}
        </div>}

        {step === 7 && <div style={{ display: "grid", gap: 10 }}>
          {[["Prénom et nom", "Client Démo"], ["Téléphone", "+41 79 000 00 00"], ["E-mail", "client@exemple.ch"], ["Langue", "Français"], ["Contact préféré", "WhatsApp"]].map(([k, v]) => (
            <Card key={k} style={{ display: "flex", justifyContent: "space-between", padding: "12px 14px" }}>
              <span style={{ ...S.sub, fontWeight: 700 }}>{k}</span><span style={{ ...S.body, fontWeight: 700 }}>{v}</span>
            </Card>
          ))}
          <Card style={{ background: T.greenBg, border: "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ display: "flex", gap: 6 }}>
                {["4", "7", "1", "9"].map((d, i) => (
                  <div key={i} style={{ width: 38, height: 44, background: T.white, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontWeight: 900, fontSize: 18, border: `1px solid ${T.line}` }}>{d}</div>
                ))}
              </div>
              <div style={{ ...S.sub, fontWeight: 700, color: T.green }}>✓ Numéro validé par SMS</div>
            </div>
          </Card>
        </div>}

        {step === 8 && <div style={{ display: "grid", gap: 8 }}>
          {[["Catégorie", "Carrelage — salle de bains"], ["Type", `${form.type} · ${form.bien}`], ["Lieu", form.npa],
          ["Surfaces", `Sol ${form.surfSol} m² · Murs ${form.surfMur} m²`],
          ["Options", [form.sdb && "Douche italienne", form.depose && "Dépose", form.chauff && "Chauffage sol"].filter(Boolean).join(" · ") || "—"],
          ["Budget", form.budget], ["Délai", form.delai], ["Visite", `${form.visite}${form.visite === "Visite sur place" ? " · " + form.creneau : ""}`],
          ["Pièces jointes", "3 photos · 1 analyse IA"]].map(([k, v]) => (
            <Card key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px" }}>
              <span style={{ ...S.sub, fontWeight: 700 }}>{k}</span>
              <span style={{ ...S.body, fontWeight: 700, textAlign: "right", maxWidth: "60%" }}>{v}</span>
            </Card>
          ))}
          <div style={{ ...S.sub, fontSize: 12, marginTop: 4 }}>Vos coordonnées ne seront visibles qu'après votre accord. Maximum 4 offres.</div>
        </div>}

        <div style={{ marginTop: 22 }}>
          <Btn onClick={next}>{step === 8 ? "Publier ma demande" : "Continuer"} <ChevronRight size={18} /></Btn>
        </div>
      </div>
    );
  };

  /* ================= CLIENT — PUBLISHED ================= */
  const PublishedScreen = () => (
    <div style={{ padding: 16, textAlign: "center", paddingTop: 56 }}>
      <div style={{ width: 76, height: 76, borderRadius: "50%", background: T.greenBg, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
        <CheckCircle2 size={40} color={T.green} />
      </div>
      <h1 style={{ ...S.h1, fontSize: 24 }}>Demande publiée !</h1>
      <p style={{ ...S.sub, margin: "10px 20px 24px" }}>Notre équipe vérifie votre demande puis la transmet aux entreprises compatibles. Premières offres sous 24–48 h.</p>
      <Btn onClick={() => go("requests")}>Voir mon tableau de bord</Btn>
    </div>
  );

  /* ================= CLIENT — DASHBOARD ================= */
  const RequestsScreen = () => {
    const ch = chantiers.find(c => c.id === monChantierId);
    const mine = ch ? soumissions.filter(s => s.chantierId === ch.id) : [];
    const suivi = ch ? suivis.find(sv => sv.chantierId === ch.id) : null;
    return (
    <div style={{ padding: 16 }}>
      <h1 style={{ ...S.h1, margin: "10px 0 16px" }}>Mes chantiers</h1>
      {!ch && (
        <Card style={{ textAlign: "center", padding: 24 }}>
          <div style={{ ...S.body, marginBottom: 12 }}>Vous n'avez pas encore publié de demande.</div>
          <Btn onClick={() => { setStep(0); go("home"); }}>Publier une demande <ChevronRight size={17} /></Btn>
        </Card>
      )}
      {ch && !suivi && <>
        <div style={S.label}>Demandes actives</div>
        <Card onClick={() => go("request")} style={{ marginTop: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 15 }}>{ch.titre}</div>
              <div style={{ ...S.sub, marginTop: 2 }}>{ch.categorie} · Sol {ch.metres.surfSol} m² + murs {ch.metres.surfMur} m²</div>
            </div>
            <Tag color={T.green} bg={T.greenBg}>{mine.length} offre{mine.length > 1 ? "s" : ""}</Tag>
          </div>
        </Card>
      </>}
      {ch && suivi && (
        <>
          <div style={S.label}>Travaux en cours</div>
          <Card onClick={() => { setSuiviId(suivi.id); go("suivi"); }} style={{ marginTop: 8, borderLeft: `4px solid ${T.green}` }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 15 }}>{suivi.entreprise}</div>
              <Tag color={T.green} bg={T.greenBg}>{suivi.statut}</Tag>
            </div>
            <div style={{ ...S.sub, marginTop: 2 }}>{ch.titre} · {suivi.jalons.filter(j => j.done).length} / {suivi.jalons.length} jalons</div>
          </Card>
        </>
      )}
      <div style={{ ...S.label, marginTop: 18 }}>Terminés</div>
      <Card style={{ marginTop: 8, opacity: 0.75 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 14 }}>Parquet chambre — Aproz</div>
            <div style={S.sub}>Terminé en mars 2026 · Garantie active</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}><Star size={14} color={T.amber} fill={T.amber} /><span style={{ fontFamily: FONT, fontWeight: 800, fontSize: 14 }}>5.0</span></div>
        </div>
      </Card>
    </div>
    );
  };

  /* ================= CLIENT — COMPARATOR ================= */
  const RequestScreen = () => {
    const ch = chantiers.find(c => c.id === monChantierId);
    const offres = ch ? soumissions.filter(s => s.chantierId === ch.id) : [];
    const meilleureNote = offres.length ? Math.max(...offres.map(o => o.note || 0)) : 0;
    return (
      <div style={{ padding: 16 }}>
        <Back onClick={() => go("requests")} label="Mes chantiers" />
        <h1 style={{ ...S.h1, fontSize: 22 }}>Comparer les offres</h1>
        <p style={{ ...S.sub, margin: "6px 0 14px" }}>{offres.length} offre{offres.length > 1 ? "s" : ""} normalisée{offres.length > 1 ? "s" : ""} pour votre chantier, toutes vérifiées.</p>
        {offres.length === 0 && <Card><div style={S.sub}>Aucune offre reçue pour l'instant. Vous serez notifié dès la première soumission.</div></Card>}
        {offres.length > 0 && <>
          <div style={{ overflowX: "auto", margin: "0 -16px", padding: "0 16px" }}>
            <table style={{ borderCollapse: "separate", borderSpacing: 0, width: "100%", minWidth: 430, fontFamily: FONT, fontSize: 12.5 }}>
              <thead><tr>
                <th></th>
                {offres.map(o => {
                  const note = o.note || 0;
                  const best = note === meilleureNote;
                  return (
                    <th key={o.id} style={{ padding: "8px 6px", background: best ? T.redBg : "transparent", borderRadius: "10px 10px 0 0" }}>
                      <div style={{ fontWeight: 800, fontSize: 12, lineHeight: 1.2 }}>{o.entreprise.split(" ")[0]}<br />{o.entreprise.split(" ").slice(1).join(" ")}</div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 3, marginTop: 3 }}>
                        <Star size={11} color={T.amber} fill={T.amber} /><span style={{ fontWeight: 800 }}>{note}</span>
                      </div>
                    </th>
                  );
                })}
              </tr></thead>
              <tbody>
                {[["Prix total", o => <b style={{ fontSize: 13.5 }}>{o.total.toLocaleString("fr-CH")}</b>], ["Début", o => o.delaiDebut], ["Durée", o => o.duree], ["Garantie", o => o.garantie], ["Vérifiée", () => <Check size={15} color={T.green} strokeWidth={3} />]].map(([lbl, fn]) => (
                  <tr key={lbl}>
                    <td style={{ padding: "9px 6px", color: T.sub, fontWeight: 700, borderTop: `1px solid ${T.line}` }}>{lbl}</td>
                    {offres.map(o => <td key={o.id} style={{ padding: "9px 6px", textAlign: "center", borderTop: `1px solid ${T.line}`, background: (o.note || 0) === meilleureNote ? T.redBg : "transparent" }}>{fn(o)}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
            {offres.map(o => (
              <Card key={o.id} style={(o.note || 0) === meilleureNote ? { border: `2px solid ${T.red}` } : {}}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 15 }}>{o.entreprise}</div>
                    <div style={S.sub}>{o.note || "—"} ★ · entreprise vérifiée</div>
                  </div>
                  <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 16 }}>{o.total.toLocaleString("fr-CH")}<span style={{ fontSize: 11, color: T.sub }}> CHF</span></div>
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <Btn kind="soft" style={{ fontSize: 13, padding: "10px" }} onClick={() => { setChatChantierId(ch.id); go("chat"); }}><MessageSquare size={15} /> Question</Btn>
                  <Btn style={{ fontSize: 13, padding: "10px" }} onClick={() => { setSelectedSoumissionId(o.id); go("offerDetail"); }}>Voir le devis <ChevronRight size={15} /></Btn>
                </div>
              </Card>
            ))}
          </div>
        </>}
      </div>
    );
  };

  /* ================= CLIENT — OFFER DETAIL ================= */
  const OfferDetailScreen = () => {
    const s = soumissions.find(x => x.id === selectedSoumissionId);
    if (!s) return (
      <div style={{ padding: 16 }}>
        <Back onClick={() => go("request")} label="Comparer les offres" />
        <div style={S.sub}>Devis introuvable.</div>
      </div>
    );
    const note = s.note;
    const lignes = s.lignes && s.lignes.length ? s.lignes : [{ code: "—", d: "Prestation forfaitaire", u: "forfait", q: 1, pu: Math.round(s.total / 1.081) }];
    return (
      <div style={{ padding: 16 }}>
        <Back onClick={() => go("request")} label="Comparer les offres" />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <h1 style={{ ...S.h1, fontSize: 21 }}>Devis {s.entreprise}</h1>
          <Tag color={T.green} bg={T.greenBg}>Vérifié ✓</Tag>
        </div>
        <p style={{ ...S.sub, margin: "4px 0 14px" }}>{note ? `${note} ★ · ` : ""}Début {s.delaiDebut} · Durée {s.duree} · Garantie {s.garantie}</p>
        <Card>
          {lignes.map((l, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderTop: i ? `1px solid ${T.line}` : "none", fontFamily: FONT, fontSize: 13.5 }}>
              <span style={{ fontWeight: 600 }}>{l.d}</span><span style={{ fontWeight: 800 }}>{(l.q * l.pu).toLocaleString("fr-CH")} CHF</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0 2px", borderTop: `2px solid ${T.ink}`, marginTop: 4 }}>
            <div>
              <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 15 }}>Total TTC (TVA 8.1 %)</div>
              <div style={{ ...S.sub, fontSize: 12 }}>Garantie {s.garantie} · Début {s.delaiDebut} · {s.duree}</div>
            </div>
            <span style={{ fontFamily: FONT, fontWeight: 900, fontSize: 19, color: T.red }}>{s.total.toLocaleString("fr-CH")} CHF</span>
          </div>
        </Card>
        {s.remarques && (
          <Card style={{ marginTop: 10, background: T.soft, border: "none" }}>
            <div style={{ ...S.sub, fontWeight: 600 }}>{s.remarques}</div>
          </Card>
        )}
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <Btn kind="soft" style={{ fontSize: 13 }} onClick={() => viewPdf(s.id)}><FileText size={16} /> PDF</Btn>
          <Btn kind="soft" style={{ fontSize: 13 }} onClick={() => { const ch = chantiers.find(c => c.id === s.chantierId); if (ch) setChatChantierId(ch.id); go("chat"); }}><MessageSquare size={16} /> Modifier</Btn>
        </div>
        <div style={{ marginTop: 8 }}>
          <Btn onClick={() => go("sign")}><FileSignature size={17} /> Accepter et signer — {s.total.toLocaleString("fr-CH")} CHF</Btn>
        </div>
      </div>
    );
  };

  /* ================= CLIENT — E-SIGNATURE ================= */
  const SignScreen = () => {
    const s = soumissions.find(x => x.id === selectedSoumissionId);
    return (
    <div style={{ padding: 16 }}>
      <Back onClick={() => go("offerDetail")} label="Devis" />
      <h1 style={{ ...S.h1, fontSize: 22 }}>Signature électronique</h1>
      <p style={{ ...S.sub, margin: "6px 0 16px" }}>Contrat : offre de <b>{s ? s.entreprise : "—"}</b> · {s ? s.total.toLocaleString("fr-CH") : "—"} CHF TTC · Garantie {s ? s.garantie : "—"}</p>
      <Card>
        {["Devis détaillé et conditions générales", "Échéancier : 30 / 30 / 30 / 10 %", "Assurance RC de l'entreprise vérifiée", "Droit de rétractation 14 jours"].map((t, i) => (
          <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", padding: "8px 0", borderTop: i ? `1px solid ${T.line}` : "none" }}>
            <CheckCircle2 size={17} color={T.green} /><span style={{ ...S.body, fontSize: 13.5 }}>{t}</span>
          </div>
        ))}
      </Card>
      <div style={{ ...S.label, margin: "16px 0 8px" }}>Signez ci-dessous</div>
      <div style={{ background: T.white, border: `2px dashed ${T.line}`, borderRadius: 14, height: 130, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
        <svg width="200" height="70" viewBox="0 0 200 70">
          <path d="M10 50 C 40 10, 60 65, 85 40 S 130 15, 150 45 S 180 55, 195 30" fill="none" stroke={T.ink} strokeWidth="2.5" strokeLinecap="round" />
        </svg>
        <PenLine size={16} color={T.sub} style={{ position: "absolute", top: 10, right: 12 }} />
      </div>
      <div style={{ marginTop: 16 }}>
        <Btn kind="green" onClick={() => go("pay")}>
          <Check size={18} strokeWidth={3} /> Confirmer et payer l'acompte
        </Btn>
      </div>
      <div style={{ ...S.sub, fontSize: 11.5, textAlign: "center", marginTop: 10 }}>Horodatage sécurisé · Copie PDF envoyée par e-mail</div>
    </div>
    );
  };

  /* ================= CLIENT — REVIEW ================= */
  const ReviewScreen = () => {
    const ch = chantiers.find(c => c.id === monChantierId);
    const suivi = ch && suivis.find(sv => sv.chantierId === ch.id);
    return (
    <div style={{ padding: 16 }}>
      <Back onClick={() => go("suivi")} label="Chantier" />
      <h1 style={{ ...S.h1, fontSize: 22 }}>Évaluer {suivi ? suivi.entreprise : "l'entreprise"}</h1>
      <p style={{ ...S.sub, margin: "6px 0 16px" }}>Votre avis est lié à un chantier vérifié et signé — il compte vraiment.</p>
      {[["q", "Qualité du travail"], ["prix", "Respect du prix"], ["delai", "Respect des délais"], ["com", "Communication"], ["prop", "Propreté"], ["sav", "Service après-vente"]].map(([k, lbl]) => (
        <Card key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, padding: "12px 14px" }}>
          <span style={{ ...S.body, fontWeight: 700, fontSize: 13.5 }}>{lbl}</span>
          <Stars v={review[k]} set={v => setReview(r => ({ ...r, [k]: v }))} size={19} />
        </Card>
      ))}
      <textarea placeholder="Racontez votre expérience (facultatif)…" value={review.commentaire} onChange={e => setReview(r => ({ ...r, commentaire: e.target.value }))}
        style={{ width: "100%", boxSizing: "border-box", fontFamily: FONT, fontSize: 14, padding: 13, borderRadius: 12, border: `1px solid ${T.line}`, background: T.white, minHeight: 80, resize: "none", outline: "none", marginBottom: 12 }} />
      <Btn disabled={review.done || !suivi} onClick={async () => {
        await api.createReview({ suiviId: suivi.id, q: review.q, prix: review.prix, delai: review.delai, com: review.com, prop: review.prop, sav: review.sav, commentaire: review.commentaire });
        setReview(r => ({ ...r, done: true }));
      }}>
        {review.done ? "✓ Avis publié — merci !" : "Publier mon avis"}
      </Btn>
    </div>
    );
  };

  /* ================= CHAT ================= */
  const ChatScreen = () => {
    const chatCh = chatChantierId && chantiers.find(c => c.id === chatChantierId);
    return (
    <div style={{ padding: 16, display: "flex", flexDirection: "column", minHeight: "calc(100vh - 165px)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: chatCh ? 6 : 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: T.ink, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontWeight: 900, fontSize: 15 }}>M</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 15 }}>{role === "client" ? "MV-3 PRO Sàrl" : "Client — SdB Savièse"}</div>
          <div style={{ ...S.sub, fontSize: 12 }}>🔒 Coordonnées masquées avant acceptation · Traduction auto</div>
        </div>
        <Phone size={18} color={T.sub} />
      </div>
      {chatCh && (
        <div style={{ ...S.sub, fontSize: 12, marginBottom: 12, display: "flex", alignItems: "center", gap: 5 }}>
          <Briefcase size={12} /> À propos de : <b style={{ color: T.ink }}>{chatCh.titre}</b>
        </div>
      )}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        {chatMsgs.map((m, i) => (
          <div key={i} style={{
            alignSelf: m.me ? "flex-end" : "flex-start", maxWidth: "80%",
            background: m.me ? T.red : T.white, color: m.me ? "#fff" : T.ink,
            border: m.me ? "none" : `1px solid ${T.line}`,
            borderRadius: m.me ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
            padding: "10px 13px", fontFamily: FONT, fontSize: 14, lineHeight: 1.4
          }}>{m.t}</div>
        ))}
        <div style={{ alignSelf: "flex-start", display: "flex", gap: 6, marginTop: 4 }}>
          <Tag><Calendar size={11} style={{ verticalAlign: -2 }} /> Proposer un RDV</Tag>
          <Tag><Camera size={11} style={{ verticalAlign: -2 }} /> Photo</Tag>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
        <button style={{ background: T.white, border: `1px solid ${T.line}`, borderRadius: 10, width: 44, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><Mic size={18} color={T.sub} /></button>
        <input value={draft} onChange={e => setDraft(e.target.value)} placeholder="Écrire un message…"
          style={{ flex: 1, fontFamily: FONT, fontSize: 14, padding: "12px 14px", borderRadius: 10, border: `1px solid ${T.line}`, outline: "none", background: T.white }} />
        <button onClick={() => { if (draft.trim()) { setChatMsgs([...chatMsgs, { me: true, t: draft }]); setDraft(""); } }}
          style={{ background: T.red, border: "none", borderRadius: 10, width: 46, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <Send size={18} color="#fff" />
        </button>
      </div>
    </div>
    );
  };

  /* ================= PRO — CHANTIERS DISPONIBLES ================= */
  const ProHomeScreen = () => (
    <div style={{ padding: 16 }}>
      <h1 style={{ ...S.h1, margin: "10px 0 4px" }}>Chantiers disponibles</h1>
      <p style={{ ...S.sub, margin: "0 0 14px" }}>Chantiers publiés correspondant à vos métiers, triés par compatibilité.</p>
      <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4, marginBottom: 12 }}>
        {["Carrelage", "< 20 km", "Budget 10k+", "Dossier complet", "Urgent", "Privés"].map((f, i) => (
          <span key={f} style={{ fontFamily: FONT, fontWeight: 700, fontSize: 12, whiteSpace: "nowrap", padding: "7px 12px", borderRadius: 20, background: i < 2 ? T.ink : T.white, color: i < 2 ? "#fff" : T.sub, border: i < 2 ? "none" : `1px solid ${T.line}` }}>{f}</span>
        ))}
      </div>
      <div style={{ display: "grid", gap: 10 }}>
        {chantiers.filter(c => c.statut === "Ouvert").map(o => {
          const nbSoum = soumissions.filter(s => s.chantierId === o.id).length;
          return (
            <Card key={o.id} onClick={() => { setSelectedChantierId(o.id); go("proOpp"); }} style={o.prive ? { borderLeft: `4px solid ${T.ink}` } : {}}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 15, lineHeight: 1.25 }}>{o.titre}</div>
                <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 13, flexShrink: 0, color: o.match >= 90 ? T.green : o.match >= 80 ? T.amber : T.sub, background: o.match >= 90 ? T.greenBg : o.match >= 80 ? T.amberBg : T.soft, padding: "4px 9px", borderRadius: 8, height: "fit-content" }}>{o.match} %</div>
              </div>
              <div style={{ ...S.sub, margin: "6px 0 10px", display: "flex", alignItems: "center", gap: 5 }}><MapPin size={13} /> {o.ville} · {o.dist || "—"} · {o.budget}</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{o.tags.map(t => <Tag key={t}>{t}</Tag>)}</div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, paddingTop: 10, borderTop: `1px solid ${T.line}` }}>
                <span style={{ ...S.sub, fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}><Eye size={13} /> {nbSoum} soumission{nbSoum > 1 ? "s" : ""} · max 4</span>
                {o.prive ? <Tag color="#fff" bg={T.ink}>Invitation privée</Tag> : o.neuf && <Tag color={T.red} bg={T.redBg}>Nouveau</Tag>}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );

  /* ================= PRO — DOSSIER CHANTIER ================= */
  const ProOppScreen = () => {
    const ch = chantiers.find(c => c.id === selectedChantierId) || chantiers[0];
    const nbSoum = soumissions.filter(s => s.chantierId === ch.id).length;
    return (
      <div style={{ padding: 16 }}>
        <Back onClick={() => go("proHome")} label="Chantiers disponibles" />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <h1 style={{ ...S.h1, fontSize: 21, maxWidth: "75%" }}>{ch.titre}</h1>
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 14, color: T.green, background: T.greenBg, padding: "5px 10px", borderRadius: 8 }}>{ch.match} %</div>
        </div>
        <p style={{ ...S.sub, margin: "4px 0 14px" }}>{ch.ville} · {ch.dist || "—"} · {ch.budget} · {ch.delai} · Limite {ch.limite}</p>
        {ch.demandeur && <div style={{ marginBottom: 10 }}><Tag color={T.ink} bg={T.soft}>Pour le compte de : {ch.demandeur}</Tag></div>}
        <Card>
          <div style={S.label}>Dossier</div>
          <div style={{ ...S.body, marginTop: 6 }}>{ch.desc}</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
            {Object.entries(ch.metres).filter(([, v]) => v > 0).map(([k, v]) => {
              const schema = METRES_SCHEMAS[ch.categorie] || METRES_SCHEMAS.Carrelage;
              return schema[k] ? <Tag key={k}>{schema[k][0]} : {v} {schema[k][1]}</Tag> : null;
            })}
          </div>
          {ch.photos && ch.photos.length > 0 && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
              {ch.photos.map((p, i) => <img key={i} src={p.url} alt={p.name} style={{ width: 64, height: 64, borderRadius: 9, objectFit: "cover" }} />)}
            </div>
          )}
        </Card>
        <Card style={{ marginTop: 10, background: T.redBg, border: "none" }}>
          <div style={{ display: "flex", gap: 8 }}>
            <FileSignature size={18} color={T.red} style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 13, color: T.red }}>Formulaire de soumission structuré</div>
              <div style={{ ...S.body, marginTop: 4 }}>Bordereau de positions pré-rempli à partir des métrés du chantier (m², ml, pce). Vous ne saisissez que vos prix unitaires — le total se calcule automatiquement, comme une vraie soumission.</div>
            </div>
          </div>
        </Card>
        <div style={{ ...S.sub, fontSize: 12, margin: "10px 0", display: "flex", alignItems: "center", gap: 5 }}><Eye size={13} /> {nbSoum} soumission{nbSoum > 1 ? "s" : ""} reçue{nbSoum > 1 ? "s" : ""} sur ce chantier · max 4</div>
        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
          <Btn kind="soft" style={{ fontSize: 13 }} onClick={() => go("proAgenda")}><Calendar size={16} /> Visite</Btn>
          <Btn kind="soft" style={{ fontSize: 13 }} onClick={() => { setChatChantierId(ch.id); go("chat"); }}><MessageSquare size={16} /> Message</Btn>
        </div>
        <div style={{ marginTop: 8 }}>
          <Btn style={{ fontSize: 13 }} onClick={() => openBid(ch.id)}>Soumissionner <ChevronRight size={16} /></Btn>
        </div>
      </div>
    );
  };

  /* ================= PRO — FORMULAIRE DE SOUMISSION (bordereau) ================= */
  const ProBidScreen = () => {
    const ch = chantiers.find(c => c.id === selectedChantierId) || chantiers[0];
    return (
      <div style={{ padding: 16 }}>
        <Back onClick={() => go("proOpp")} label="Dossier chantier" />
        <h1 style={{ ...S.h1, fontSize: 21 }}>Soumission — {ch.titre}</h1>
        <p style={{ ...S.sub, margin: "4px 0 14px" }}>Bordereau de positions basé sur les métrés publiés. Ajustez la quantité si nécessaire et indiquez votre prix unitaire.</p>
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ display: "flex", gap: 6, padding: "9px 12px", background: T.soft, ...S.label, fontSize: 10 }}>
            <span style={{ flex: 1 }}>Position</span><span style={{ width: 46, textAlign: "right" }}>Qté</span>
            <span style={{ width: 34, textAlign: "center" }}>Un.</span><span style={{ width: 62, textAlign: "right" }}>P.U.</span>
            <span style={{ width: 66, textAlign: "right" }}>Total</span>
          </div>
          {bidLines.map((l, i) => (
            <div key={l.code} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", borderTop: `1px solid ${T.line}`, fontFamily: FONT, fontSize: 12.5 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700 }}>{l.d}</div>
                <div style={{ color: T.sub, fontSize: 10.5 }}>Position {l.code}</div>
              </div>
              <input type="number" min="0" value={l.q} onChange={e => updateBidLine(i, "q", e.target.value)}
                style={{ width: 46, fontFamily: FONT, fontWeight: 700, fontSize: 12.5, textAlign: "right", border: `1px solid ${T.line}`, borderRadius: 6, padding: "5px 4px" }} />
              <span style={{ width: 34, textAlign: "center", color: T.sub, fontSize: 11 }}>{l.u}</span>
              <input type="number" min="0" value={l.pu} onChange={e => updateBidLine(i, "pu", e.target.value)}
                style={{ width: 62, fontFamily: FONT, fontWeight: 700, fontSize: 12.5, textAlign: "right", border: `1px solid ${T.line}`, borderRadius: 6, padding: "5px 4px" }} />
              <span style={{ width: 66, textAlign: "right", fontWeight: 800 }}>{(l.q * l.pu).toLocaleString("fr-CH")}</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "12px", borderTop: `2px solid ${T.ink}` }}>
            <span style={{ fontFamily: FONT, fontWeight: 900, fontSize: 14 }}>Total TTC (TVA 8.1 %)</span>
            <span style={{ fontFamily: FONT, fontWeight: 900, fontSize: 16, color: T.red }}>{Math.round(bidTotal * 1.081).toLocaleString("fr-CH")} CHF</span>
          </div>
        </Card>
        <div style={{ ...S.label, margin: "16px 0 8px" }}>Conditions de la soumission</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
          <input placeholder="Début possible (ex. 12 août)" value={bidMeta.delaiDebut} onChange={e => setBidMeta(m => ({ ...m, delaiDebut: e.target.value }))}
            style={{ fontFamily: FONT, fontSize: 13, padding: "11px 12px", borderRadius: 10, border: `1px solid ${T.line}`, background: T.white, outline: "none" }} />
          <input placeholder="Durée (ex. 8 j)" value={bidMeta.duree} onChange={e => setBidMeta(m => ({ ...m, duree: e.target.value }))}
            style={{ fontFamily: FONT, fontSize: 13, padding: "11px 12px", borderRadius: 10, border: `1px solid ${T.line}`, background: T.white, outline: "none" }} />
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          {["2 ans", "5 ans", "10 ans"].map(g => <Chip key={g} active={bidMeta.garantie === g} onClick={() => setBidMeta(m => ({ ...m, garantie: g }))} style={{ padding: "9px 12px", fontSize: 13 }}>Garantie {g}</Chip>)}
        </div>
        <textarea placeholder="Remarques (variantes, exclusions, précisions techniques)…" value={bidMeta.remarques} onChange={e => setBidMeta(m => ({ ...m, remarques: e.target.value }))}
          style={{ width: "100%", boxSizing: "border-box", fontFamily: FONT, fontSize: 13.5, padding: 12, borderRadius: 10, border: `1px solid ${T.line}`, background: T.white, minHeight: 70, resize: "none", outline: "none" }} />
        <div style={{ marginTop: 14 }}>
          <Btn onClick={submitBid}>Envoyer la soumission — {Math.round(bidTotal * 1.081).toLocaleString("fr-CH")} CHF <Send size={16} /></Btn>
        </div>
        <div style={{ ...S.sub, fontSize: 11.5, textAlign: "center", marginTop: 10 }}>Conforme au bordereau publié · PDF généré automatiquement</div>
      </div>
    );
  };

  /* ================= PRO — SOUMISSIONS ================= */
  const ProSentScreen = () => {
    const mine = soumissions;
    const statusStyle = st => st === "Gagnée" ? [T.green, T.greenBg] : st === "Perdue" ? [T.sub, T.soft] : [T.amber, T.amberBg];
    return (
      <div style={{ padding: 16 }}>
        <h1 style={{ ...S.h1, margin: "10px 0 16px" }}>Mes soumissions</h1>
        {mine.map(s => {
          const ch = chantiers.find(c => c.id === s.chantierId);
          const [c, bg] = statusStyle(s.statut);
          const suivi = suivis.find(sv => sv.soumissionId === s.id);
          return (
            <Card key={s.id} style={{ marginBottom: 10 }}
              onClick={suivi ? () => { setSuiviId(suivi.id); go("suivi"); } : undefined}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 15 }}>{ch ? ch.titre : "Chantier"}</div>
                  <div style={S.sub}>{s.total.toLocaleString("fr-CH")} CHF · {s.date}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                  <Tag color={c} bg={bg}>{s.statut === "Gagnée" ? "Gagnée ✓" : s.statut}</Tag>
                  <button onClick={e => { e.stopPropagation(); viewPdf(s.id); }} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 4, fontFamily: FONT, fontWeight: 700, fontSize: 11.5, color: T.sub }}>
                    <FileText size={12} /> PDF
                  </button>
                </div>
              </div>
              {suivi && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10, paddingTop: 10, borderTop: `1px solid ${T.line}` }}>
                  <span style={{ ...S.sub, fontSize: 12 }}>{suivi.jalons.filter(j => j.done).length} / {suivi.jalons.length} jalons · {suivi.statut}</span>
                  <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: 12.5, color: T.red, display: "flex", alignItems: "center", gap: 3 }}>Voir le suivi <ChevronRight size={14} /></span>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    );
  };

  /* ================= PRO — AGENDA ================= */
  const ProAgendaScreen = () => (
    <div style={{ padding: 16 }}>
      <h1 style={{ ...S.h1, margin: "10px 0 16px" }}>Agenda</h1>
      {[["Mar 21 juil. · 14h30", "Visite — SdB Savièse", "Client démo · 6 km", T.red],
      ["Jeu 23 juil. · 8h00", "Métrage — Villa Vétroz", "24'300 CHF en jeu", T.amber],
      ["Ven 24 juil. · 17h00", "Appel vidéo — Terrasse Nendaz", "Avant soumission", T.sub],
      ["Lun 5 août · 7h30", "Début chantier — SdB Savièse", "Équipe : 2 poseurs", T.green]].map(([d, t, s, c], i) => (
        <Card key={i} style={{ marginBottom: 10, borderLeft: `4px solid ${c}` }}>
          <div style={{ ...S.label, fontSize: 10.5, color: c }}>{d}</div>
          <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 15, marginTop: 3 }}>{t}</div>
          <div style={{ ...S.sub, marginTop: 2 }}>{s}</div>
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <Tag><MapPin size={11} style={{ verticalAlign: -2 }} /> Itinéraire</Tag>
            <Tag><MessageSquare size={11} style={{ verticalAlign: -2 }} /> Message</Tag>
          </div>
        </Card>
      ))}
      <div style={{ ...S.sub, fontSize: 12, textAlign: "center", marginTop: 6 }}>Synchronisé avec l'agenda Dolibarr et le planning d'équipe</div>
    </div>
  );

  /* ================= PRO — STATS ================= */
  const ProStatsScreen = () => {
    const months = [["Mars", 34], ["Avril", 52], ["Mai", 41], ["Juin", 68], ["Juil.", 47]];
    const max = 68;
    const mesFactures = factures;
    const totalDu = mesFactures.filter(f => f.statut === "Due").reduce((s, f) => s + f.commission, 0);
    return (
      <div style={{ padding: 16 }}>
        <h1 style={{ ...S.h1, margin: "10px 0 16px" }}>Statistiques</h1>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <KPI n="42 %" l="taux de réussite" c={T.green} /><KPI n="61'069" l="CHF en jeu" c={T.red} />
          <KPI n="≈ 1 h" l="délai de réponse" /><KPI n="4.9 ★" l="note · 214 chantiers" />
        </div>
        <div style={{ ...S.label, margin: "18px 0 10px" }}>CA gagné via la plateforme (kCHF)</div>
        <Card>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 130 }}>
            {months.map(([m, v]) => (
              <div key={m} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, height: "100%", justifyContent: "flex-end" }}>
                <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: 12 }}>{v}</span>
                <div style={{ width: "100%", borderRadius: "6px 6px 2px 2px", background: v === max ? T.red : T.soft, height: `${(v / max) * 80}%` }} />
                <span style={{ ...S.sub, fontSize: 11 }}>{m}</span>
              </div>
            ))}
          </div>
        </Card>
        <div style={{ ...S.label, margin: "16px 0 8px" }}>Entonnoir du mois</div>
        <Card>
          {[["Opportunités reçues", 26, 100], ["Dossiers consultés", 18, 69], ["Offres envoyées", 9, 35], ["Chantiers gagnés", 4, 15]].map(([l, n, pct], i) => (
            <div key={l} style={{ padding: "8px 0", borderTop: i ? `1px solid ${T.line}` : "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ ...S.body, fontWeight: 600, fontSize: 13 }}>{l}</span>
                <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: 13 }}>{n}</span>
              </div>
              <div style={{ height: 6, background: T.soft, borderRadius: 3 }}>
                <div style={{ height: 6, width: `${pct}%`, background: T.red, borderRadius: 3 }} />
              </div>
            </div>
          ))}
        </Card>
        <Card style={{ background: T.ink, border: "none", marginTop: 12 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <TrendingUp size={24} color="#7BE0A3" />
            <div>
              <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 14, color: "#fff" }}>Plan {plan} · commission {Math.round(COMMISSION_RATES[plan] * 100)} %</div>
              <div style={{ fontFamily: FONT, fontSize: 12.5, color: "#B9BDC6" }}>Appels d'offres privés inclus · Sync Dolibarr active</div>
            </div>
          </div>
        </Card>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "18px 0 8px" }}>
          <div style={S.label}>Facturation MV3 Connect</div>
          {totalDu > 0 && <Tag color={T.red} bg={T.redBg}>{totalDu.toLocaleString("fr-CH")} CHF dus</Tag>}
        </div>
        {mesFactures.length === 0 && <Card><div style={S.sub}>Aucune commission facturée pour l'instant.</div></Card>}
        {mesFactures.map(f => {
          const ch = chantiers.find(c => c.id === f.chantierId);
          return (
            <Card key={f.id} style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 14 }}>{ch ? ch.titre : "Chantier"}</div>
                  <div style={{ ...S.sub, fontSize: 12 }}>Commission {Math.round(f.taux * 100)} % sur {f.montant.toLocaleString("fr-CH")} CHF · {f.date}</div>
                </div>
                <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 15 }}>{f.commission.toLocaleString("fr-CH")}<span style={{ fontSize: 11, color: T.sub }}> CHF</span></div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10, paddingTop: 10, borderTop: `1px solid ${T.line}` }}>
                <Tag color={f.statut === "Payée" ? T.green : T.amber} bg={f.statut === "Payée" ? T.greenBg : T.amberBg}>{f.statut}</Tag>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <button onClick={() => viewFacturePdf(f.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 4, fontFamily: FONT, fontWeight: 700, fontSize: 12, color: T.sub }}>
                    <FileText size={13} /> PDF
                  </button>
                  {f.statut === "Due" && <Btn kind="dark" style={{ width: "auto", fontSize: 12, padding: "9px 14px" }} onClick={() => payerFacture(f.id)}>Payer</Btn>}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    );
  };

  /* ================= PROMOTEUR ================= */
  const PromoHomeScreen = () => {
    const mesChantiers = chantiers;
    const actifs = mesChantiers.filter(c => c.statut !== "Terminé");
    const termines = mesChantiers.filter(c => c.statut === "Terminé");
    const totalSoum = mesChantiers.reduce((s, c) => s + soumissions.filter(x => x.chantierId === c.id).length, 0);
    return (
    <div style={{ padding: 16 }}>
      <h1 style={{ ...S.h1, margin: "10px 0 4px" }}>Mes projets</h1>
      <p style={{ ...S.sub, margin: "0 0 14px" }}>Chantiers publiés pour {MY_ORG} — comparez les soumissions et adjugez.</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
        <KPI n={actifs.length} l="projets actifs" c={T.red} /><KPI n={totalSoum} l="soumissions reçues" />
      </div>
      <div style={S.label}>Actifs</div>
      <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
        {actifs.map(c => {
          const mine = soumissions.filter(s => s.chantierId === c.id);
          const meilleure = mine.length ? Math.min(...mine.map(s => s.total)) : null;
          return (
            <Card key={c.id} onClick={() => { setPilotChantierId(c.id); go("adminChantierCompare"); }} style={{ borderLeft: `4px solid ${T.red}` }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 16 }}>{c.titre}</div>
                  <div style={S.sub}>{c.ville} · {c.categorie}</div>
                </div>
                <Tag color={c.statut === "Attribué" ? T.green : T.amber} bg={c.statut === "Attribué" ? T.greenBg : T.amberBg}>{c.statut}</Tag>
              </div>
              <div style={{ display: "flex", gap: 14, marginTop: 12, paddingTop: 12, borderTop: `1px solid ${T.line}` }}>
                {[[String(mine.length), mine.length > 1 ? "soumissions" : "soumission"], [meilleure ? meilleure.toLocaleString("fr-CH") : "—", "meilleur prix CHF"]].map(([n, l]) => (
                  <div key={l}><span style={{ fontFamily: FONT, fontWeight: 900, fontSize: 16, color: T.red }}>{n}</span><span style={{ ...S.sub, fontSize: 11.5, marginLeft: 4 }}>{l}</span></div>
                ))}
              </div>
            </Card>
          );
        })}
        {actifs.length === 0 && <Card><div style={S.sub}>Aucun projet actif. Publiez-en un pour recevoir des soumissions structurées.</div></Card>}
      </div>
      {termines.length > 0 && <>
        <div style={{ ...S.label, marginTop: 18 }}>Terminés</div>
        {termines.map(c => (
          <Card key={c.id} style={{ marginTop: 8, opacity: 0.75 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 15 }}>{c.titre}</div>
                <div style={S.sub}>{c.ville}</div>
              </div>
              <Tag color={T.green} bg={T.greenBg}>Terminé</Tag>
            </div>
          </Card>
        ))}
      </>}
      <button onClick={startPromoProject} style={{ width: "100%", marginTop: 12, fontFamily: FONT, fontWeight: 700, fontSize: 14, color: T.red, background: T.redBg, border: `1.5px dashed ${T.red}`, borderRadius: 11, padding: "13px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        <Plus size={17} /> Nouveau projet
      </button>
    </div>
    );
  };

  /* ================= ADMIN ================= */
  const AdminHomeScreen = () => {
    const totalCommissions = factures.reduce((s, f) => s + f.commission, 0);
    return (
    <div style={{ padding: 16 }}>
      <h1 style={{ ...S.h1, margin: "10px 0 16px" }}>Cockpit</h1>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <KPI n="14" l="demandes aujourd'hui" c={T.red} /><KPI n="5" l="à vérifier" c={T.amber} />
        <KPI n="38 %" l="taux de conversion" c={T.green} /><KPI n={totalCommissions.toLocaleString("fr-CH")} l="CHF commissions marketplace" />
      </div>
      <div style={{ ...S.label, margin: "18px 0 8px" }}>Alertes</div>
      {[["Assurance RC expirée — Batisol Valais SA", "Suspension automatique dans 5 jours", T.red, T.redBg],
      ["Avis signalé — chantier #1847", "Preuves demandées aux deux parties", T.amber, T.amberBg],
      ["Contournement suspecté — demande #2011", "Numéro échangé dans le chat avant acceptation", T.amber, T.amberBg]].map(([t, s, c, bg], i) => (
        <Card key={i} style={{ marginBottom: 8, background: bg, border: "none" }}>
          <div style={{ display: "flex", gap: 10 }}>
            <AlertCircle size={18} color={c} style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 13.5, color: c }}>{t}</div>
              <div style={{ ...S.sub, fontSize: 12.5 }}>{s}</div>
            </div>
          </div>
        </Card>
      ))}
      <div style={{ ...S.label, margin: "16px 0 8px" }}>File de vérification</div>
      <Btn kind="dark" onClick={() => go("adminQueue")}>Traiter les 5 demandes en attente <ChevronRight size={17} /></Btn>
      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <Btn kind="soft" style={{ fontSize: 13 }} onClick={() => go("adminPublish")}><Plus size={16} /> Publier un chantier</Btn>
        <Btn kind="soft" style={{ fontSize: 13 }} onClick={() => go("adminPilot")}><BarChart3 size={16} /> Pilotage</Btn>
      </div>
    </div>
    );
  };

  /* ================= ADMIN — PUBLIER UN CHANTIER ================= */
  const CH_STEPS = ["Description du chantier", "Adresse", "Photos", "Métrés", "Conditions", "Vérification"];
  const CH_LAST = CH_STEPS.length - 1;
  const AdminPublishScreen = () => {
    const next = () => chStep < CH_LAST ? setChStep(chStep + 1) : publishChantier();
    const back = () => chStep > 0 ? setChStep(chStep - 1) : go(role === "promo" ? "promoHome" : "adminHome");
    const showEtage = chForm.typeBien === "Appartement" || chForm.typeBien === "Immeuble";
    return (
      <div style={{ padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "6px 0 14px" }}>
          <button onClick={back} style={{ background: T.white, border: `1px solid ${T.line}`, borderRadius: 9, padding: 8, cursor: "pointer", display: "flex" }}><ChevronLeft size={18} /></button>
          <div style={{ flex: 1 }}>
            <TileProgress step={chStep + 1} total={CH_STEPS.length} />
            <div style={{ ...S.sub, fontSize: 11, marginTop: 4 }}>Étape {chStep + 1} / {CH_STEPS.length}</div>
          </div>
        </div>
        <h2 style={{ ...S.h1, fontSize: 22, margin: "0 0 16px" }}>{CH_STEPS[chStep]}</h2>

        {chStep === 0 && <div style={{ display: "grid", gap: 10 }}>
          <input placeholder="Titre (ex. Salle de bains complète — 7 m²)" value={chForm.titre} onChange={e => setChForm(f => ({ ...f, titre: e.target.value }))}
            style={{ fontFamily: FONT, fontSize: 14, padding: "12px 14px", borderRadius: 10, border: `1px solid ${T.line}`, background: T.white, outline: "none" }} />
          <div style={S.label}>Catégorie</div>
          <div style={{ display: "grid", gap: 8 }}>
            {["Carrelage", "Parquet", "Salle de bains", "Sanitaire", "Rénovation"].map(o =>
              <Chip key={o} active={chForm.categorie === o} onClick={() => setChCategorie(o)}>{o}</Chip>)}
          </div>
          <textarea placeholder="Description des travaux demandés…" value={chForm.desc} onChange={e => setChForm(f => ({ ...f, desc: e.target.value }))}
            style={{ width: "100%", boxSizing: "border-box", fontFamily: FONT, fontSize: 14, padding: 13, borderRadius: 12, border: `1px solid ${T.line}`, background: T.white, minHeight: 90, resize: "none", outline: "none" }} />
          {role === "admin" && <>
            <div style={S.label}>Publié pour le compte de</div>
            <div style={{ display: "grid", gap: 8 }}>
              <Chip active={!chForm.demandeur} onClick={() => setChForm(f => ({ ...f, demandeur: "" }))}>MV3 Connect (direct)</Chip>
              <Chip active={!!chForm.demandeur} onClick={() => setChForm(f => ({ ...f, demandeur: f.demandeur || " " }))}>Un promoteur / une régie</Chip>
            </div>
            {!!chForm.demandeur && (
              <input placeholder="Nom du promoteur (ex. Architecture Rhône SA)" value={chForm.demandeur.trim()} onChange={e => setChForm(f => ({ ...f, demandeur: e.target.value }))}
                style={{ fontFamily: FONT, fontSize: 14, padding: "12px 14px", borderRadius: 10, border: `1px solid ${T.line}`, background: T.white, outline: "none" }} />
            )}
          </>}
        </div>}

        {chStep === 1 && <div style={{ display: "grid", gap: 10 }}>
          <input placeholder="Ville / commune (ex. Sion)" value={chForm.ville} onChange={e => setChForm(f => ({ ...f, ville: e.target.value }))}
            style={{ fontFamily: FONT, fontSize: 14, padding: "12px 14px", borderRadius: 10, border: `1px solid ${T.line}`, background: T.white, outline: "none" }} />
          <input placeholder="Adresse (rue et numéro)" value={chForm.adresse} onChange={e => setChForm(f => ({ ...f, adresse: e.target.value }))}
            style={{ fontFamily: FONT, fontSize: 14, padding: "12px 14px", borderRadius: 10, border: `1px solid ${T.line}`, background: T.white, outline: "none" }} />
          <div style={S.label}>Type de bien</div>
          <div style={{ display: "grid", gap: 8 }}>
            {["Appartement", "Villa", "Maison", "Immeuble", "Commerce"].map(o =>
              <Chip key={o} active={chForm.typeBien === o} onClick={() => setChForm(f => ({ ...f, typeBien: o }))}>{o}</Chip>)}
          </div>
          {showEtage && <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <input placeholder="Étage (ex. 2ᵉ étage)" value={chForm.etage} onChange={e => setChForm(f => ({ ...f, etage: e.target.value }))}
              style={{ fontFamily: FONT, fontSize: 14, padding: "12px 14px", borderRadius: 10, border: `1px solid ${T.line}`, background: T.white, outline: "none" }} />
            <input placeholder="N° d'appartement" value={chForm.numAppart} onChange={e => setChForm(f => ({ ...f, numAppart: e.target.value }))}
              style={{ fontFamily: FONT, fontSize: 14, padding: "12px 14px", borderRadius: 10, border: `1px solid ${T.line}`, background: T.white, outline: "none" }} />
          </div>}
          <Card style={{ background: T.amberBg, border: "none" }}>
            <div style={{ ...S.sub, color: T.amber, fontWeight: 600 }}>🔒 L'adresse exacte reste masquée aux entreprises jusqu'à l'acceptation d'une soumission — seules la ville et la distance approximative sont visibles avant.</div>
          </Card>
        </div>}

        {chStep === 2 && <div style={{ display: "grid", gap: 10 }}>
          <label style={{ background: T.white, border: `1.5px dashed ${T.line}`, borderRadius: 12, padding: "22px 14px", textAlign: "center", cursor: "pointer", display: "block" }}>
            <input type="file" accept="image/*" multiple onChange={e => { addChPhotos(e.target.files); e.target.value = ""; }} style={{ display: "none" }} />
            <Camera size={22} color={T.red} style={{ margin: "0 auto 8px" }} />
            <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 13.5 }}>Ajouter des photos du chantier</div>
            <div style={{ ...S.sub, fontSize: 11.5, marginTop: 3 }}>État actuel, surfaces à traiter, accès</div>
          </label>
          {chForm.photos.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {chForm.photos.map((p, i) => (
                <div key={i} style={{ position: "relative", borderRadius: 10, overflow: "hidden", aspectRatio: "1", background: T.soft }}>
                  <img src={p.url} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  <button onClick={() => removeChPhoto(i)} style={{ position: "absolute", top: 4, right: 4, width: 22, height: 22, borderRadius: "50%", background: "rgba(22,24,28,.75)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <X size={13} color="#fff" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div style={{ ...S.sub, fontSize: 12 }}>{chForm.photos.length} photo{chForm.photos.length > 1 ? "s" : ""} ajoutée{chForm.photos.length > 1 ? "s" : ""} · visibles par les entreprises invitées à soumissionner</div>
        </div>}

        {chStep === 3 && <div style={{ display: "grid", gap: 10 }}>
          <Card style={{ background: T.redBg, border: "none" }}>
            <div style={{ ...S.sub, color: T.red, fontWeight: 600 }}>Ces métrés servent à pré-remplir le bordereau de soumission (SIA/CAN) que rempliront les entreprises — quantité fixe, elles ne saisissent que leur prix.</div>
          </Card>
          <Card>
            {Object.entries(METRES_SCHEMAS[chForm.categorie] || METRES_SCHEMAS.Carrelage).map(([k, [lbl, u]], i) => (
              <div key={k} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderTop: i ? `1px solid ${T.line}` : "none" }}>
                <span style={{ ...S.body, fontWeight: 600, fontSize: 13.5 }}>{lbl} <span style={{ color: T.sub, fontSize: 11.5 }}>({u})</span></span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button onClick={() => setMetre(k, chForm.metres[k] - 1)} style={{ width: 28, height: 28, borderRadius: 7, border: `1px solid ${T.line}`, background: T.white, cursor: "pointer" }}><Minus size={12} /></button>
                  <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: 14, minWidth: 30, textAlign: "center" }}>{chForm.metres[k]}</span>
                  <button onClick={() => setMetre(k, chForm.metres[k] + 1)} style={{ width: 28, height: 28, borderRadius: 7, border: `1px solid ${T.line}`, background: T.white, cursor: "pointer" }}><Plus size={12} /></button>
                </div>
              </div>
            ))}
          </Card>
        </div>}

        {chStep === 4 && <div>
          <div style={S.label}>Budget indicatif</div>
          <div style={{ display: "grid", gap: 8, margin: "8px 0 18px" }}>
            {["Je ne connais pas mon budget", "5 000 – 10 000 CHF", "10 000 – 25 000 CHF", "25 000 – 50 000 CHF"].map(b =>
              <Chip key={b} active={chForm.budget === b} onClick={() => setChForm(f => ({ ...f, budget: b }))}>{b}</Chip>)}
          </div>
          <div style={S.label}>Délai souhaité</div>
          <div style={{ display: "grid", gap: 8, margin: "8px 0 18px" }}>
            {["Urgent — sous 48 h", "Dans les 2 semaines", "Dans le mois", "Flexible"].map(d =>
              <Chip key={d} active={chForm.delai === d} onClick={() => setChForm(f => ({ ...f, delai: d }))}>{d}</Chip>)}
          </div>
          <input placeholder="Date limite de soumission (ex. 25 juillet)" value={chForm.limite} onChange={e => setChForm(f => ({ ...f, limite: e.target.value }))}
            style={{ width: "100%", boxSizing: "border-box", fontFamily: FONT, fontSize: 14, padding: "12px 14px", borderRadius: 10, border: `1px solid ${T.line}`, background: T.white, outline: "none", marginBottom: 10 }} />
          <div style={S.label}>Visibilité</div>
          <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
            <Chip active={!chForm.prive} onClick={() => setChForm(f => ({ ...f, prive: false }))}>Ouvert à toutes les entreprises vérifiées (max 4 soumissions)</Chip>
            <Chip active={chForm.prive} onClick={() => setChForm(f => ({ ...f, prive: true }))}>Sur invitation privée uniquement</Chip>
          </div>
          {chForm.prive && <>
            <div style={{ ...S.label, margin: "18px 0 8px" }}>Entreprises invitées</div>
            <div style={{ display: "grid", gap: 8 }}>
              {prosDisponibles.length === 0 && <div style={S.sub}>Aucune entreprise inscrite pour l'instant.</div>}
              {prosDisponibles.map(e => {
                const on = chForm.invites.includes(e.id);
                return (
                  <Card key={e.id} onClick={() => toggleInvite(e.id)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", ...(on ? { border: `2px solid ${T.red}` } : {}) }}>
                    <div>
                      <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 14 }}>{e.nom}</div>
                      {e.note && <div style={{ ...S.sub, fontSize: 12.5 }}>{e.note} ★</div>}
                    </div>
                    <div style={{ width: 24, height: 24, borderRadius: 7, border: on ? "none" : `2px solid ${T.line}`, background: on ? T.red : T.white, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {on && <Check size={15} color="#fff" strokeWidth={3} />}
                    </div>
                  </Card>
                );
              })}
            </div>
          </>}
        </div>}

        {chStep === 5 && <div style={{ display: "grid", gap: 8 }}>
          {[["Titre", chForm.titre || "—"], ["Catégorie", chForm.categorie],
          ["Publié pour", chForm.demandeur.trim() || "MV3 Connect (direct)"],
          ["Adresse", [chForm.adresse, chForm.ville].filter(Boolean).join(", ") || "—"],
          ["Type de bien", chForm.typeBien + (chForm.etage ? ` · ${chForm.etage}` : "") + (chForm.numAppart ? ` · N° ${chForm.numAppart}` : "")],
          ["Photos", chForm.photos.length ? `${chForm.photos.length} photo${chForm.photos.length > 1 ? "s" : ""}` : "Aucune"],
          ["Métrés", Object.entries(chForm.metres).filter(([, v]) => v > 0).map(([k, v]) => {
            const schema = METRES_SCHEMAS[chForm.categorie] || METRES_SCHEMAS.Carrelage;
            return schema[k] ? `${schema[k][0]} ${v} ${schema[k][1]}` : null;
          }).filter(Boolean).join(" · ") || "—"],
          ["Budget", chForm.budget], ["Délai", chForm.delai], ["Limite de soumission", chForm.limite || "—"],
          ["Visibilité", chForm.prive ? "Invitation privée" : "Ouvert (max 4 soumissions)"],
          ...(chForm.prive ? [["Entreprises invitées", chForm.invites.length ? chForm.invites.map(id => prosDisponibles.find(e => e.id === id)?.nom || id).join(" · ") : "Aucune sélectionnée"]] : [])].map(([k, v]) => (
            <Card key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px" }}>
              <span style={{ ...S.sub, fontWeight: 700 }}>{k}</span>
              <span style={{ ...S.body, fontWeight: 700, textAlign: "right", maxWidth: "60%" }}>{v}</span>
            </Card>
          ))}
          {chForm.photos.length > 0 && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {chForm.photos.map((p, i) => <img key={i} src={p.url} alt={p.name} style={{ width: 58, height: 58, borderRadius: 9, objectFit: "cover" }} />)}
            </div>
          )}
        </div>}

        <div style={{ marginTop: 22 }}>
          <Btn onClick={next}>{chStep === CH_LAST ? "Publier le chantier" : "Continuer"} <ChevronRight size={18} /></Btn>
        </div>
      </div>
    );
  };

  const ChantierPublishedScreen = () => (
    <div style={{ padding: 16, textAlign: "center", paddingTop: 56 }}>
      <div style={{ width: 76, height: 76, borderRadius: "50%", background: T.greenBg, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
        <CheckCircle2 size={40} color={T.green} />
      </div>
      <h1 style={{ ...S.h1, fontSize: 24 }}>Chantier publié !</h1>
      <p style={{ ...S.sub, margin: "10px 20px 24px" }}>Les entreprises compatibles peuvent désormais consulter le dossier et soumissionner avec le bordereau structuré.</p>
      <Btn onClick={() => go(role === "promo" ? "promoHome" : "adminPilot")}>{role === "promo" ? "Voir mes projets" : "Voir le pilotage marketplace"}</Btn>
    </div>
  );

  /* ================= ADMIN — PILOTAGE MARKETPLACE ================= */
  const AdminPilotScreen = () => {
    const actifs = chantiers.filter(c => c.statut === "Ouvert").length;
    const avecSoum = chantiers.filter(c => soumissions.some(s => s.chantierId === c.id)).length;
    const tauxReponse = chantiers.length ? Math.round((avecSoum / chantiers.length) * 100) : 0;
    const chiffreEnJeu = soumissions.reduce((s, x) => s + x.total, 0);

    const entreprises = [...new Set(soumissions.map(s => s.entreprise))];
    const stats = entreprises.map(ent => {
      const mine = soumissions.filter(s => s.entreprise === ent);
      const gagnees = mine.filter(s => s.statut === "Gagnée").length;
      const perdues = mine.filter(s => s.statut === "Perdue").length;
      const decidees = gagnees + perdues;
      const ecarts = mine.map(s => {
        const rivales = soumissions.filter(x => x.chantierId === s.chantierId);
        const min = Math.min(...rivales.map(x => x.total));
        return min > 0 ? ((s.total - min) / min) * 100 : 0;
      });
      const ecartMoy = ecarts.length ? ecarts.reduce((a, b) => a + b, 0) / ecarts.length : 0;
      return { ent, nb: mine.length, gagnees, taux: decidees ? Math.round((gagnees / decidees) * 100) : null, ecartMoy, note: mine[0]?.note || null };
    }).sort((a, b) => b.gagnees - a.gagnees);

    return (
      <div style={{ padding: 16 }}>
        <h1 style={{ ...S.h1, margin: "10px 0 16px" }}>Pilotage marketplace</h1>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <KPI n={actifs} l="chantiers actifs" c={T.red} /><KPI n={tauxReponse + " %"} l="taux de réponse" c={T.green} />
          <KPI n="≈ 18 h" l="délai 1ʳᵉ soumission" /><KPI n={chiffreEnJeu.toLocaleString("fr-CH")} l="CHF en soumission" />
        </div>

        <div style={{ ...S.label, margin: "18px 0 8px" }}>Chantiers vs soumissions reçues</div>
        <div style={{ display: "grid", gap: 8 }}>
          {chantiers.map(c => {
            const mine = soumissions.filter(s => s.chantierId === c.id);
            const meilleure = mine.length ? Math.min(...mine.map(s => s.total)) : null;
            return (
              <Card key={c.id} onClick={() => { setPilotChantierId(c.id); go("adminChantierCompare"); }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <div>
                    <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 14.5 }}>{c.titre}</div>
                    <div style={{ ...S.sub, fontSize: 12 }}>{c.ville} · {mine.length} soumission{mine.length > 1 ? "s" : ""}{meilleure ? ` · dès ${meilleure.toLocaleString("fr-CH")} CHF` : ""}</div>
                    {c.demandeur && <div style={{ ...S.sub, fontSize: 11, marginTop: 2, fontStyle: "italic" }}>Pour le compte de {c.demandeur}</div>}
                  </div>
                  <Tag color={c.statut === "Attribué" ? T.green : T.amber} bg={c.statut === "Attribué" ? T.greenBg : T.amberBg}>{c.statut}</Tag>
                </div>
              </Card>
            );
          })}
        </div>

        <div style={{ ...S.label, margin: "18px 0 8px" }}>Performance des sous-traitants</div>
        <div style={{ overflowX: "auto", margin: "0 -16px", padding: "0 16px" }}>
          <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 430, fontFamily: FONT, fontSize: 12.5 }}>
            <thead><tr>
              {["Entreprise", "Note", "Soum.", "Conversion", "Écart vs meilleur prix", "Gagnés"].map(h => (
                <th key={h} style={{ textAlign: h === "Entreprise" ? "left" : "center", padding: "8px 6px", ...S.label, fontSize: 10 }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {stats.map(s => (
                <tr key={s.ent}>
                  <td style={{ padding: "9px 6px", fontWeight: 700, borderTop: `1px solid ${T.line}` }}>{s.ent}</td>
                  <td style={{ padding: "9px 6px", textAlign: "center", borderTop: `1px solid ${T.line}` }}>{s.note ? `${s.note} ★` : "—"}</td>
                  <td style={{ padding: "9px 6px", textAlign: "center", borderTop: `1px solid ${T.line}` }}>{s.nb}</td>
                  <td style={{ padding: "9px 6px", textAlign: "center", borderTop: `1px solid ${T.line}`, fontWeight: 700, color: s.taux === null ? T.sub : s.taux >= 50 ? T.green : T.amber }}>{s.taux === null ? "—" : s.taux + " %"}</td>
                  <td style={{ padding: "9px 6px", textAlign: "center", borderTop: `1px solid ${T.line}`, color: s.ecartMoy <= 0 ? T.green : T.ink }}>{s.ecartMoy > 0 ? "+" : ""}{s.ecartMoy.toFixed(1)} %</td>
                  <td style={{ padding: "9px 6px", textAlign: "center", borderTop: `1px solid ${T.line}`, fontWeight: 800 }}>{s.gagnees}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ ...S.label, margin: "18px 0 8px" }}>Commissions de la marketplace</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
          <KPI n={factures.reduce((s, f) => s + f.commission, 0).toLocaleString("fr-CH")} l="CHF commissions totales" c={T.red} />
          <KPI n={factures.filter(f => f.statut === "Due").reduce((s, f) => s + f.commission, 0).toLocaleString("fr-CH")} l="CHF en attente de paiement" c={T.amber} />
        </div>
        {factures.map(f => {
          const ch = chantiers.find(c => c.id === f.chantierId);
          return (
            <Card key={f.id} style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 14 }}>{f.entreprise}</div>
                  <div style={{ ...S.sub, fontSize: 12 }}>{ch ? ch.titre : "Chantier"} · {Math.round(f.taux * 100)} % sur {f.montant.toLocaleString("fr-CH")} CHF</div>
                </div>
                <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 15 }}>{f.commission.toLocaleString("fr-CH")}<span style={{ fontSize: 11, color: T.sub }}> CHF</span></div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10, paddingTop: 10, borderTop: `1px solid ${T.line}` }}>
                <Tag color={f.statut === "Payée" ? T.green : T.amber} bg={f.statut === "Payée" ? T.greenBg : T.amberBg}>{f.statut}</Tag>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <button onClick={() => viewFacturePdf(f.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 4, fontFamily: FONT, fontWeight: 700, fontSize: 12, color: T.sub }}>
                    <FileText size={13} /> PDF
                  </button>
                  {f.statut === "Due" && <Btn kind="soft" style={{ width: "auto", fontSize: 12, padding: "9px 14px" }} onClick={() => payerFacture(f.id)}>Marquer payée</Btn>}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    );
  };

  const AdminChantierCompareScreen = () => {
    const ch = chantiers.find(c => c.id === pilotChantierId) || chantiers[0];
    const mine = soumissions.filter(s => s.chantierId === ch.id).sort((a, b) => a.total - b.total);
    const suivi = suivis.find(sv => sv.chantierId === ch.id);
    return (
      <div style={{ padding: 16 }}>
        <Back onClick={() => go(role === "promo" ? "promoHome" : "adminPilot")} label={role === "promo" ? "Mes projets" : "Pilotage marketplace"} />
        <h1 style={{ ...S.h1, fontSize: 21 }}>{ch.titre}</h1>
        <p style={{ ...S.sub, margin: "4px 0 14px" }}>{ch.ville} · {mine.length} soumission{mine.length > 1 ? "s" : ""} · statut {ch.statut}</p>
        {ch.demandeur && role === "admin" && (
          <Card style={{ marginBottom: 10, background: T.amberBg, border: "none" }}>
            <div style={{ ...S.sub, color: T.amber, fontWeight: 600 }}>Publié pour le compte de <b>{ch.demandeur}</b>. En l'absence de décision de sa part, vous pouvez adjuger ce chantier en son nom.</div>
          </Card>
        )}
        {suivi && (
          <Card onClick={() => { setSuiviId(suivi.id); go("suivi"); }} style={{ marginBottom: 10, background: T.greenBg, border: "none" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 14, color: T.green }}>Suivi du chantier — {suivi.entreprise}</div>
                <div style={{ ...S.sub, fontSize: 12 }}>{suivi.jalons.filter(j => j.done).length} / {suivi.jalons.length} jalons · {suivi.statut}</div>
              </div>
              <ChevronRight size={17} color={T.green} />
            </div>
          </Card>
        )}
        <div style={{ display: "grid", gap: 8 }}>
          {mine.map(s => (
            <Card key={s.id} style={s.statut === "Gagnée" ? { border: `2px solid ${T.green}` } : {}}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 15 }}>{s.entreprise}</div>
                  <div style={S.sub}>Début {s.delaiDebut} · {s.duree} · Garantie {s.garantie}</div>
                </div>
                <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 16 }}>{s.total.toLocaleString("fr-CH")}<span style={{ fontSize: 11, color: T.sub }}> CHF</span></div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10, paddingTop: 10, borderTop: `1px solid ${T.line}` }}>
                <Tag color={s.statut === "Gagnée" ? T.green : s.statut === "Perdue" ? T.sub : T.amber} bg={s.statut === "Gagnée" ? T.greenBg : s.statut === "Perdue" ? T.soft : T.amberBg}>{s.statut}</Tag>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <button onClick={() => viewPdf(s.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 4, fontFamily: FONT, fontWeight: 700, fontSize: 12, color: T.sub }}>
                    <FileText size={13} /> PDF
                  </button>
                  {s.statut === "En attente" && <Btn kind="green" style={{ width: "auto", fontSize: 12, padding: "9px 14px" }} onClick={() => adjuger(ch.id, s.id)}><Check size={14} strokeWidth={3} /> {ch.demandeur && role === "admin" ? `Adjuger au nom de ${ch.demandeur}` : "Adjuger"}</Btn>}
                </div>
              </div>
            </Card>
          ))}
          {!mine.length && <Card><div style={S.sub}>Aucune soumission reçue pour ce chantier pour l'instant.</div></Card>}
        </div>
      </div>
    );
  };

  /* ================= SUIVI DE CHANTIER (après adjudication) ================= */
  const SuiviScreen = () => {
    const suivi = suivis.find(s => s.id === suiviId);
    const backTarget = role === "pro" ? "proSent" : role === "client" ? "requests" : "adminChantierCompare";
    if (!suivi) return (
      <div style={{ padding: 16 }}>
        <Back onClick={() => go(backTarget)} label="Retour" />
        <div style={S.sub}>Aucun suivi disponible.</div>
      </div>
    );
    const ch = chantiers.find(c => c.id === suivi.chantierId);
    const pct = Math.round((suivi.jalons.filter(j => j.done).length / suivi.jalons.length) * 100);
    const PHOTO_CATS = [["avant", "Avant"], ["pendant", "Pendant"], ["apres", "Après"]];
    const canEdit = role !== "client";
    return (
      <div style={{ padding: 16 }}>
        <Back onClick={() => go(backTarget)} label="Retour" />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1 style={{ ...S.h1, fontSize: 21 }}>{ch ? ch.titre : "Chantier"}</h1>
          <Tag color={suivi.statut === "Terminé" ? T.green : T.amber} bg={suivi.statut === "Terminé" ? T.greenBg : T.amberBg}>{suivi.statut}</Tag>
        </div>
        <p style={{ ...S.sub, margin: "4px 0 16px" }}>{suivi.entreprise}{ch ? ` · ${ch.ville}` : ""}</p>

        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={S.label}>Avancement</span>
            <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: 13 }}>{pct} %</span>
          </div>
          <div style={{ height: 8, background: T.soft, borderRadius: 4 }}>
            <div style={{ height: 8, width: `${pct}%`, background: T.green, borderRadius: 4, transition: "width .3s" }} />
          </div>
        </Card>

        {suivi.soumissionId && (
          <button onClick={() => viewPdf(suivi.soumissionId)} style={{ width: "100%", background: T.white, border: `1px solid ${T.line}`, borderRadius: 10, padding: "10px 12px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontFamily: FONT, fontWeight: 700, fontSize: 13, color: T.red }}>
            <FileText size={15} /> Voir le bordereau PDF de la soumission
          </button>
        )}

        <div style={{ ...S.label, margin: "16px 0 8px" }}>Jalons</div>
        <Card>
          {suivi.jalons.map((j, i) => (
            <div key={j.id} style={{ padding: "10px 0", borderTop: i ? `1px solid ${T.line}` : "none" }}>
              <div onClick={() => canEdit && toggleJalon(suivi.id, j.id)} style={{ display: "flex", gap: 10, alignItems: "center", cursor: canEdit ? "pointer" : "default" }}>
                {j.done ? <CheckCircle2 size={19} color={T.green} /> : <Clock size={19} color={T.sub} />}
                <span style={{ ...S.body, fontWeight: 700, fontSize: 13.5, color: j.done ? T.ink : T.sub }}>{j.label}</span>
              </div>
              {j.id === "acompte" && ((suivi.documents || []).some(d => d.jalonId === "acompte") || canEdit) && (
                <div style={{ marginLeft: 29, marginTop: 8, display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {(suivi.documents || []).filter(d => d.jalonId === "acompte").map(d => (
                    <a key={d.id} href={d.url} download={d.name} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: FONT, fontSize: 12, fontWeight: 700, color: T.red, background: T.redBg, padding: "6px 10px", borderRadius: 8, textDecoration: "none" }}>
                      <FileText size={13} /> {d.name}
                      {canEdit && <span onClick={e => { e.preventDefault(); removeSuiviDoc(suivi.id, d.id); }} style={{ display: "flex", marginLeft: 2 }}><X size={12} /></span>}
                    </a>
                  ))}
                  {canEdit && (
                    <label style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: FONT, fontSize: 12, fontWeight: 700, color: T.sub, border: `1.5px dashed ${T.line}`, padding: "6px 10px", borderRadius: 8, cursor: "pointer" }}>
                      <input type="file" accept="application/pdf" onChange={e => { addSuiviDoc(suivi.id, "acompte", e.target.files[0]); e.target.value = ""; }} style={{ display: "none" }} />
                      <Plus size={12} /> Joindre le PDF de demande d'acompte
                    </label>
                  )}
                </div>
              )}
            </div>
          ))}
        </Card>

        {PHOTO_CATS.map(([cat, lbl]) => (
          <div key={cat}>
            <div style={{ ...S.label, margin: "16px 0 8px" }}>Photos — {lbl}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {suivi.photos[cat].map((p, i) => (
                <div key={i} style={{ position: "relative", borderRadius: 10, overflow: "hidden", aspectRatio: "1", background: T.soft }}>
                  <img src={p.url} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  {canEdit && <button onClick={() => removeSuiviPhoto(suivi.id, cat, i)} style={{ position: "absolute", top: 4, right: 4, width: 20, height: 20, borderRadius: "50%", background: "rgba(22,24,28,.75)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <X size={11} color="#fff" />
                  </button>}
                </div>
              ))}
              {canEdit && (
                <label style={{ background: T.white, border: `1.5px dashed ${T.line}`, borderRadius: 10, aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <input type="file" accept="image/*" multiple onChange={e => { addSuiviPhoto(suivi.id, cat, e.target.files); e.target.value = ""; }} style={{ display: "none" }} />
                  <Camera size={18} color={T.sub} />
                </label>
              )}
              {!canEdit && suivi.photos[cat].length === 0 && <div style={{ ...S.sub, fontSize: 11.5 }}>Aucune photo</div>}
            </div>
          </div>
        ))}

        {canEdit && suivi.statut !== "Terminé" && (
          <div style={{ marginTop: 18 }}>
            <Btn kind="green" onClick={() => finirChantier(suivi.id)}><CheckCircle2 size={18} /> Marquer le chantier terminé</Btn>
          </div>
        )}
        {role === "client" && suivi.statut === "Terminé" && (
          <div style={{ marginTop: 18 }}>
            <Btn kind="soft" onClick={() => go("review")}><Star size={17} /> {review.done ? "Voir mon évaluation" : "Évaluer l'entreprise"}</Btn>
          </div>
        )}
      </div>
    );
  };

  /* ================= BORDEREAU — DOCUMENT PDF ================= */
  const BordereauPdfScreen = () => {
    const s = soumissions.find(x => x.id === pdfSoumissionId);
    const ch = s && chantiers.find(c => c.id === s.chantierId);
    const backTarget = role === "pro" ? "proSent" : role === "client" ? "offerDetail" : role === "promo" ? "adminChantierCompare" : "adminPilot";
    if (!s || !ch) return (
      <div className="no-print" style={{ padding: 16 }}>
        <Back onClick={() => go(backTarget)} label="Retour" />
        <div style={S.sub}>Document introuvable.</div>
      </div>
    );
    const lignes = s.lignes && s.lignes.length ? s.lignes : [{ code: "—", d: "Prestation forfaitaire (détail non fourni)", u: "forfait", q: 1, pu: Math.round(s.total / 1.081) }];
    const sousTotal = lignes.reduce((sum, l) => sum + l.q * l.pu, 0);
    const tva = Math.round(sousTotal * 0.081);
    const totalTTC = s.lignes ? Math.round(sousTotal * 1.081) : s.total;
    const ref = "MV3-" + String(s.id).replace(/[^0-9]/g, "").slice(-6).padStart(6, "0");
    const dateEmission = new Date().toLocaleDateString("fr-CH", { day: "2-digit", month: "long", year: "numeric" });
    const note = s.note;
    const colWidths = ["10%", "40%", "10%", "12%", "13%", "15%"];
    return (
      <div>
        <div className="no-print" style={{ position: "sticky", top: 0, zIndex: 10, background: T.bg, borderBottom: `1px solid ${T.line}`, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <Back onClick={() => go(backTarget)} label="Retour" />
          <Btn style={{ width: "auto", padding: "10px 16px", fontSize: 13 }} onClick={() => window.print()}><FileText size={16} /> Enregistrer en PDF</Btn>
        </div>
        <div style={{ overflowX: "auto", padding: "24px 12px", background: "#9C9A91" }}>
          <div className="pdf-doc" style={{ width: "210mm", minHeight: "297mm", margin: "0 auto", background: "#fff", padding: "16mm 14mm", boxSizing: "border-box", fontFamily: FONT, color: T.ink, boxShadow: "0 4px 24px rgba(0,0,0,.25)", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingBottom: 14, borderBottom: `2px solid ${T.ink}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 26, height: 26, background: T.red, borderRadius: 5, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, padding: 4 }}>
                  {[0, 1, 2, 3].map(i => <div key={i} style={{ background: "#fff", borderRadius: 1 }} />)}
                </div>
                <div>
                  <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 17, letterSpacing: "-0.02em" }}>MV3 CONNECT</div>
                  <div style={{ fontFamily: FONT, fontSize: 10, color: T.sub }}>Marketplace de chantiers — Valais</div>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 13, letterSpacing: "0.06em", textTransform: "uppercase", color: T.red }}>Bordereau de soumission</div>
                <div style={{ fontFamily: FONT, fontSize: 11, color: T.sub, marginTop: 3 }}>Réf. {ref} · {dateEmission}</div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, margin: "18px 0" }}>
              <div>
                <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 9.5, letterSpacing: "0.08em", textTransform: "uppercase", color: T.sub, marginBottom: 6 }}>Entreprise soumissionnaire</div>
                <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 14 }}>{s.entreprise}</div>
                {note && <div style={{ fontFamily: FONT, fontSize: 11.5, color: T.sub, marginTop: 2 }}>{note} ★ · entreprise vérifiée</div>}
                <div style={{ fontFamily: FONT, fontSize: 11.5, color: T.sub, marginTop: 2 }}>Garantie {s.garantie}</div>
              </div>
              <div>
                <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 9.5, letterSpacing: "0.08em", textTransform: "uppercase", color: T.sub, marginBottom: 6 }}>Chantier</div>
                <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 14 }}>{ch.titre}</div>
                <div style={{ fontFamily: FONT, fontSize: 11.5, color: T.sub, marginTop: 2 }}>{ch.ville} · {ch.categorie}</div>
                <div style={{ fontFamily: FONT, fontSize: 11.5, color: T.sub, marginTop: 2 }}>Début {s.delaiDebut} · Durée {s.duree}</div>
              </div>
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", fontFamily: FONT, fontSize: 10 }}>
              <colgroup>{colWidths.map((w, i) => <col key={i} style={{ width: w }} />)}</colgroup>
              <thead>
                <tr>
                  {["Position", "Description", "Unité", "Quantité", "Prix unit.", "Total"].map((h, i) => (
                    <th key={h} style={{ textAlign: i >= 2 ? "right" : "left", padding: "7px 6px", background: T.soft, fontWeight: 700, fontSize: 9, letterSpacing: "0.04em", textTransform: "uppercase", color: T.sub, borderBottom: `1.5px solid ${T.ink}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lignes.map((l, i) => (
                  <tr key={i}>
                    <td style={{ padding: "7px 6px", borderBottom: `1px solid ${T.line}`, color: T.sub, fontSize: 9.5 }}>{l.code}</td>
                    <td style={{ padding: "7px 6px", borderBottom: `1px solid ${T.line}`, overflowWrap: "break-word", fontWeight: 600 }}>{l.d}</td>
                    <td style={{ padding: "7px 6px", borderBottom: `1px solid ${T.line}`, textAlign: "right", color: T.sub }}>{l.u}</td>
                    <td style={{ padding: "7px 6px", borderBottom: `1px solid ${T.line}`, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{l.q}</td>
                    <td style={{ padding: "7px 6px", borderBottom: `1px solid ${T.line}`, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{l.pu.toLocaleString("fr-CH")}</td>
                    <td style={{ padding: "7px 6px", borderBottom: `1px solid ${T.line}`, textAlign: "right", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{(l.q * l.pu).toLocaleString("fr-CH")}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
              <div style={{ width: "55%" }}>
                {[["Sous-total HT", sousTotal], ["TVA 8.1 %", tva]].map(([lbl, v]) => (
                  <div key={lbl} style={{ display: "flex", justifyContent: "space-between", padding: "5px 6px", fontFamily: FONT, fontSize: 11 }}>
                    <span style={{ color: T.sub }}>{lbl}</span>
                    <span style={{ fontVariantNumeric: "tabular-nums" }}>{v.toLocaleString("fr-CH")} CHF</span>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", padding: "9px 6px", borderTop: `2px solid ${T.ink}`, marginTop: 4 }}>
                  <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: 13 }}>Total TTC</span>
                  <span style={{ fontFamily: FONT, fontWeight: 900, fontSize: 15, color: T.red, fontVariantNumeric: "tabular-nums" }}>{totalTTC.toLocaleString("fr-CH")} CHF</span>
                </div>
              </div>
            </div>

            {s.remarques && (
              <div style={{ marginTop: 18 }}>
                <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 9.5, letterSpacing: "0.08em", textTransform: "uppercase", color: T.sub, marginBottom: 4 }}>Remarques</div>
                <div style={{ fontFamily: FONT, fontSize: 11, lineHeight: 1.5 }}>{s.remarques}</div>
              </div>
            )}

            <div style={{ marginTop: "auto", paddingTop: 10, borderTop: `1px solid ${T.line}`, display: "flex", justifyContent: "space-between", fontFamily: FONT, fontSize: 9, color: T.sub }}>
              <span>MV3 Connect — document généré automatiquement, valable 30 jours</span>
              <span>Réf. {ref}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* ================= FACTURE DE COMMISSION — DOCUMENT PDF ================= */
  const FactureCommissionPdfScreen = () => {
    const f = factures.find(x => x.id === pdfFactureId);
    const ch = f && chantiers.find(c => c.id === f.chantierId);
    const backTarget = role === "admin" ? "adminPilot" : "proStats";
    if (!f) return (
      <div className="no-print" style={{ padding: 16 }}>
        <Back onClick={() => go(backTarget)} label="Retour" />
        <div style={S.sub}>Facture introuvable.</div>
      </div>
    );
    const ref = "FAC-" + String(f.id).replace(/[^0-9]/g, "").slice(-6).padStart(6, "0");
    const dateEmission = new Date().toLocaleDateString("fr-CH", { day: "2-digit", month: "long", year: "numeric" });
    const commissionHT = Math.round(f.commission / 1.081);
    const tva = f.commission - commissionHT;
    return (
      <div>
        <div className="no-print" style={{ position: "sticky", top: 0, zIndex: 10, background: T.bg, borderBottom: `1px solid ${T.line}`, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <Back onClick={() => go(backTarget)} label="Retour" />
          <Btn style={{ width: "auto", padding: "10px 16px", fontSize: 13 }} onClick={() => window.print()}><FileText size={16} /> Enregistrer en PDF</Btn>
        </div>
        <div style={{ overflowX: "auto", padding: "24px 12px", background: "#9C9A91" }}>
          <div className="pdf-doc" style={{ width: "210mm", minHeight: "297mm", margin: "0 auto", background: "#fff", padding: "16mm 14mm", boxSizing: "border-box", fontFamily: FONT, color: T.ink, boxShadow: "0 4px 24px rgba(0,0,0,.25)", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingBottom: 14, borderBottom: `2px solid ${T.ink}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 26, height: 26, background: T.red, borderRadius: 5, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, padding: 4 }}>
                  {[0, 1, 2, 3].map(i => <div key={i} style={{ background: "#fff", borderRadius: 1 }} />)}
                </div>
                <div>
                  <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 17, letterSpacing: "-0.02em" }}>MV3 CONNECT</div>
                  <div style={{ fontFamily: FONT, fontSize: 10, color: T.sub }}>MV3 Connect Sàrl · Sion (VS) · CHE-100.200.300</div>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 13, letterSpacing: "0.06em", textTransform: "uppercase", color: T.red }}>Facture de commission</div>
                <div style={{ fontFamily: FONT, fontSize: 11, color: T.sub, marginTop: 3 }}>N° {ref} · {dateEmission}</div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, margin: "18px 0" }}>
              <div>
                <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 9.5, letterSpacing: "0.08em", textTransform: "uppercase", color: T.sub, marginBottom: 6 }}>Facturé à</div>
                <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 14 }}>{f.entreprise}</div>
                <div style={{ fontFamily: FONT, fontSize: 11.5, color: T.sub, marginTop: 2 }}>Entreprise partenaire MV3 Connect</div>
              </div>
              <div>
                <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 9.5, letterSpacing: "0.08em", textTransform: "uppercase", color: T.sub, marginBottom: 6 }}>Chantier concerné</div>
                <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 14 }}>{ch ? ch.titre : "—"}</div>
                <div style={{ fontFamily: FONT, fontSize: 11.5, color: T.sub, marginTop: 2 }}>{ch ? ch.ville : ""} · Soumission gagnée le {f.date}</div>
              </div>
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", fontFamily: FONT, fontSize: 10.5 }}>
              <colgroup><col style={{ width: "58%" }} /><col style={{ width: "14%" }} /><col style={{ width: "14%" }} /><col style={{ width: "14%" }} /></colgroup>
              <thead>
                <tr>
                  {["Description", "Montant soumission", "Taux", "Commission"].map((h, i) => (
                    <th key={h} style={{ textAlign: i === 0 ? "left" : "right", padding: "7px 6px", background: T.soft, fontWeight: 700, fontSize: 9, letterSpacing: "0.04em", textTransform: "uppercase", color: T.sub, borderBottom: `1.5px solid ${T.ink}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: "9px 6px", borderBottom: `1px solid ${T.line}`, fontWeight: 600 }}>Commission plateforme MV3 Connect sur chantier attribué</td>
                  <td style={{ padding: "9px 6px", borderBottom: `1px solid ${T.line}`, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{f.montant.toLocaleString("fr-CH")} CHF</td>
                  <td style={{ padding: "9px 6px", borderBottom: `1px solid ${T.line}`, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{Math.round(f.taux * 100)} %</td>
                  <td style={{ padding: "9px 6px", borderBottom: `1px solid ${T.line}`, textAlign: "right", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{f.commission.toLocaleString("fr-CH")} CHF</td>
                </tr>
              </tbody>
            </table>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
              <div style={{ width: "55%" }}>
                {[["Montant HT", commissionHT], ["TVA 8.1 %", tva]].map(([lbl, v]) => (
                  <div key={lbl} style={{ display: "flex", justifyContent: "space-between", padding: "5px 6px", fontFamily: FONT, fontSize: 11 }}>
                    <span style={{ color: T.sub }}>{lbl}</span>
                    <span style={{ fontVariantNumeric: "tabular-nums" }}>{v.toLocaleString("fr-CH")} CHF</span>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", padding: "9px 6px", borderTop: `2px solid ${T.ink}`, marginTop: 4 }}>
                  <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: 13 }}>Total dû</span>
                  <span style={{ fontFamily: FONT, fontWeight: 900, fontSize: 15, color: T.red, fontVariantNumeric: "tabular-nums" }}>{f.commission.toLocaleString("fr-CH")} CHF</span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 18, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 9.5, letterSpacing: "0.08em", textTransform: "uppercase", color: T.sub, marginBottom: 4 }}>Conditions de paiement</div>
                <div style={{ fontFamily: FONT, fontSize: 11, lineHeight: 1.6 }}>Payable à 30 jours · IBAN CH00 0000 0000 0000 0000 0<br />Statut : <b style={{ color: f.statut === "Payée" ? T.green : T.amber }}>{f.statut}</b></div>
              </div>
              <div style={{ width: 64, height: 64, background: T.ink, borderRadius: 8, display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 2, padding: 6, flexShrink: 0 }}>
                {Array.from({ length: 25 }).map((_, i) => <div key={i} style={{ background: (i * 7) % 3 ? "#fff" : T.ink, borderRadius: 1 }} />)}
              </div>
            </div>

            <div style={{ marginTop: "auto", paddingTop: 10, borderTop: `1px solid ${T.line}`, display: "flex", justifyContent: "space-between", fontFamily: FONT, fontSize: 9, color: T.sub }}>
              <span>MV3 Connect Sàrl — facture générée automatiquement</span>
              <span>N° {ref}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const AdminQueueScreen = () => (
    <div style={{ padding: 16 }}>
      <h1 style={{ ...S.h1, margin: "10px 0 16px" }}>À vérifier</h1>
      {ADMIN_QUEUE.map((r, i) => (
        <Card key={i} onClick={() => r.go && go("adminRequest")} style={{ marginBottom: 10, ...(r.go ? { border: `2px solid ${T.red}` } : {}) }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 14.5 }}>{r.t}</div>
              <div style={{ ...S.sub, fontSize: 12.5, marginTop: 2 }}>{r.s}</div>
            </div>
            <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 15, color: r.q === "A" ? T.green : T.amber, background: r.q === "A" ? T.greenBg : T.amberBg, width: 34, height: 34, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center" }}>{r.q}</div>
          </div>
        </Card>
      ))}
    </div>
  );

  const AdminRequestScreen = () => (
    <div style={{ padding: 16 }}>
      <Back onClick={() => go("adminQueue")} label="File de vérification" />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <h1 style={{ ...S.h1, fontSize: 21 }}>Salle de bains — Savièse</h1>
        <Tag color={T.green} bg={T.greenBg}>Qualité A</Tag>
      </div>
      <p style={{ ...S.sub, margin: "4px 0 14px" }}>Particulier vérifié par SMS · Dossier complet · Pas de doublon détecté · Budget cohérent avec l'analyse IA</p>
      <Card>
        <div style={S.label}>Contrôles automatiques</div>
        {[["Catégorie : Carrelage ✓", true], ["Photos analysées, surfaces cohérentes ✓", true], ["Doublons : aucun ✓", true], ["Coordonnées SMS validées ✓", true]].map(([t], i) => (
          <div key={i} style={{ display: "flex", gap: 9, alignItems: "center", padding: "7px 0", borderTop: i ? `1px solid ${T.line}` : "none" }}>
            <CheckCircle2 size={16} color={T.green} /><span style={{ ...S.body, fontSize: 13 }}>{t}</span>
          </div>
        ))}
      </Card>
      <div style={{ ...S.label, margin: "16px 0 8px" }}>Sélection des entreprises (max 4)</div>
      {[["MV-3 PRO Sàrl", "96 % · 4.9 ★ · réponse 1 h"], ["Carrelage Dubuis Sàrl", "91 % · 4.8 ★ · réponse 2 h"], ["Batisol Valais SA", "84 % · 4.6 ★ · ⚠ RC expire"], ["Ceramica Rhône Sàrl", "71 % · 4.4 ★ · à 28 km"]].map(([n, s]) => {
        const on = selectedCos.includes(n);
        return (
          <Card key={n} onClick={() => setSelectedCos(on ? selectedCos.filter(x => x !== n) : [...selectedCos, n])}
            style={{ marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center", ...(on ? { border: `2px solid ${T.red}` } : {}) }}>
            <div>
              <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 14 }}>{n}</div>
              <div style={{ ...S.sub, fontSize: 12.5 }}>{s}</div>
            </div>
            <div style={{ width: 24, height: 24, borderRadius: 7, border: on ? "none" : `2px solid ${T.line}`, background: on ? T.red : T.white, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {on && <Check size={15} color="#fff" strokeWidth={3} />}
            </div>
          </Card>
        );
      })}
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <Btn kind="ghost" style={{ fontSize: 13 }}><X size={16} /> Refuser</Btn>
        <Btn kind="green" style={{ fontSize: 13 }} disabled={adminValidated} onClick={() => setAdminValidated(true)}>
          {adminValidated ? "✓ Publiée aux " + selectedCos.length + " entreprises" : "Valider et publier"}
        </Btn>
      </div>
    </div>
  );

  /* ================= PROFILE ================= */
  const ProfileScreen = () => {
    const data = {
      client: [["Nom", authUser?.nom || "—"], ["Commune", authUser?.npaCommune || "—"], ["Langue", "Français"], ["Notifications", "Push + e-mail"], ["E-mail", authUser?.email || "—"]],
      pro: [["Note", authUser?.note ? `${authUser.note} / 5` : "Pas encore noté"], ["Catalogue", "Sync Dolibarr ✓"], ["Documents", "RC ✓ · AVS ✓ · Assurance ✓"], ["Abonnement", `${plan} · commission ${Math.round(COMMISSION_RATES[plan] * 100)} %`], ["E-mail", authUser?.email || "—"]],
      promo: [["Organisation", MY_ORG], ["Projets actifs", String(chantiers.filter(c => c.statut !== "Terminé").length)], ["E-mail", authUser?.email || "—"], ["Modèles", "Séries de prix CAN"]],
      admin: [["Rôle", "Super-admin"], ["Nom", authUser?.nom || "—"], ["E-mail", authUser?.email || "—"], ["Journal d'audit", "Toutes les actions tracées"]],
    };
    return (
      <div style={{ padding: 16 }}>
        <h1 style={{ ...S.h1, margin: "10px 0 16px" }}>{role === "pro" ? MY_ENTREPRISE : role === "promo" ? MY_ORG : role === "admin" ? "Administration" : "Mon profil"}</h1>
        {role === "pro" && (
          <Card style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <Shield size={22} color={T.green} />
                <div>
                  <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 14 }}>Entreprise vérifiée</div>
                  <div style={{ ...S.sub, fontSize: 12 }}>Badge visible sur toutes vos offres</div>
                </div>
              </div>
              <Tag color={T.red} bg={T.redBg}>Premium</Tag>
            </div>
          </Card>
        )}
        {role === "pro" && (
          <Card onClick={() => { setOnb(0); go("proOnboard"); }} style={{ marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <FileText size={18} color={T.red} />
              <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: 13.5 }}>Parcours d'inscription entreprise</span>
            </div>
            <ChevronRight size={17} color={T.sub} />
          </Card>
        )}
        {data[role].map(([k, v]) => (
          <Card key={k} style={{ marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 14px" }}>
            <span style={{ ...S.sub, fontWeight: 700 }}>{k}</span>
            <span style={{ ...S.body, fontWeight: 700, fontSize: 13.5, textAlign: "right" }}>{v}</span>
          </Card>
        ))}
        <div style={{ ...S.sub, fontSize: 11.5, textAlign: "center", marginTop: 16 }}>Prototype cliquable v3 · MV3 Connect · Données fictives</div>
      </div>
    );
  };

  /* ================= ASSISTANT IA (API réelle) ================= */
  const AiAssistScreen = () => (
    <div style={{ padding: 16 }}>
      <Back onClick={() => go("home")} label="Accueil" />
      <h1 style={{ ...S.h1, fontSize: 22 }}>Décrire mon projet avec l'IA</h1>
      <p style={{ ...S.sub, margin: "6px 0 14px" }}>Expliquez librement, comme à un artisan. L'IA reconnaît le métier, les surfaces, le budget et prépare votre demande.</p>
      <textarea value={aiText} onChange={e => setAiText(e.target.value)}
        placeholder="Ex. Je veux refaire ma salle de bains d'environ 7 m² dans mon appartement à Savièse, avec une douche italienne. Il faut enlever l'ancien carrelage. Budget environ 20 000 francs, idéalement ce mois-ci."
        style={{ width: "100%", boxSizing: "border-box", fontFamily: FONT, fontSize: 14.5, padding: 14, borderRadius: 14, border: `1px solid ${T.line}`, background: T.white, minHeight: 140, resize: "none", outline: "none", lineHeight: 1.5 }} />
      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <button style={{ background: T.white, border: `1px solid ${T.line}`, borderRadius: 10, width: 52, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}><Mic size={19} color={T.red} /></button>
        <Btn kind="dark" disabled={aiLoading || !aiText.trim()} onClick={analyzeAI}>
          {aiLoading ? <Loader2 size={17} style={{ animation: "spin 1s linear infinite" }} /> : <Sparkles size={17} />}
          {aiLoading ? "Analyse en cours…" : "Analyser avec l'IA"}
        </Btn>
      </div>
      {aiResult && (
        <Card style={{ background: T.redBg, border: "none", marginTop: 14 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <Sparkles size={18} color={T.red} style={{ flexShrink: 0, marginTop: 2 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 13.5, color: T.red }}>{aiResult.categorie} — {aiResult.type}</div>
              <div style={{ ...S.body, marginTop: 4 }}>{aiResult.resume}</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
                {aiResult.surfSol > 0 && <Tag>Sol {aiResult.surfSol} m²</Tag>}
                {aiResult.surfMur > 0 && <Tag>Murs {aiResult.surfMur} m²</Tag>}
                {aiResult.sdb && <Tag>Douche italienne</Tag>}
                {aiResult.depose && <Tag>Dépose</Tag>}
                {aiResult.chauff && <Tag>Chauffage au sol</Tag>}
                <Tag>{aiResult.budget}</Tag><Tag>{aiResult.delai}</Tag>
              </div>
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <Btn onClick={applyAI}>Pré-remplir ma demande <ChevronRight size={17} /></Btn>
          </div>
        </Card>
      )}
      <div style={{ ...S.sub, fontSize: 11.5, textAlign: "center", marginTop: 12 }}>Analyse réelle par IA · vous confirmez chaque élément avant publication</div>
    </div>
  );

  /* ================= PAIEMENT ACOMPTE ================= */
  const PayScreen = () => {
    const s = soumissions.find(x => x.id === selectedSoumissionId);
    const acompte = s ? Math.round(s.total * 0.3) : 0;
    const accepterEtPayer = async () => {
      if (!s) return;
      const suivi = await adjuger(s.chantierId, s.id);
      if (suivi) setSuiviId(suivi.id);
      go("suivi");
    };
    return (
    <div style={{ padding: 16 }}>
      <Back onClick={() => go("sign")} label="Signature" />
      <h1 style={{ ...S.h1, fontSize: 22 }}>Acompte de 30 %</h1>
      <p style={{ ...S.sub, margin: "6px 0 14px" }}>Offre de {s ? s.entreprise : "—"} · Total {s ? s.total.toLocaleString("fr-CH") : "—"} CHF · Acompte sécurisé en séquestre jusqu'au début des travaux</p>
      <Card style={{ textAlign: "center", padding: 18 }}>
        <div style={S.label}>Montant à payer</div>
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 32, color: T.red, margin: "6px 0", letterSpacing: "-0.02em" }}>{acompte.toLocaleString("fr-CH")} CHF</div>
        <div style={{ ...S.sub, fontSize: 12 }}>Libéré à l'entreprise au démarrage du chantier</div>
      </Card>
      <div style={{ ...S.label, margin: "16px 0 8px" }}>Moyen de paiement</div>
      <div style={{ display: "grid", gap: 8 }}>
        {[["TWINT", Phone, "Paiement instantané"], ["QR-facture suisse", QrCode, "Depuis votre e-banking"], ["Carte bancaire", CreditCard, "Visa · Mastercard"]].map(([m, I, s]) => (
          <Chip key={m} active={payMethod === m} onClick={() => setPayMethod(m)}>
            <I size={17} color={T.sub} />
            <span>{m}<div style={{ ...S.sub, fontSize: 11.5, fontWeight: 500 }}>{s}</div></span>
          </Chip>
        ))}
      </div>
      {payMethod === "TWINT" && (
        <Card style={{ textAlign: "center", marginTop: 10 }}>
          <div style={{ width: 108, height: 108, margin: "4px auto 8px", background: T.ink, borderRadius: 12, display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 3, padding: 10 }}>
            {Array.from({ length: 25 }).map((_, i) => <div key={i} style={{ background: (i * 7) % 3 ? "#fff" : T.ink, borderRadius: 2 }} />)}
          </div>
          <div style={{ ...S.sub, fontSize: 12 }}>Scannez avec l'app TWINT ou payez directement sur ce téléphone</div>
        </Card>
      )}
      <div style={{ marginTop: 14 }}>
        <Btn kind="green" onClick={accepterEtPayer}>
          <Check size={18} strokeWidth={3} /> Payer {acompte.toLocaleString("fr-CH")} CHF
        </Btn>
      </div>
      <div style={{ ...S.sub, fontSize: 11.5, textAlign: "center", marginTop: 10 }}>Facture générée dans Dolibarr · reçu PDF par e-mail</div>
    </div>
    );
  };

  /* ================= NOTIFICATIONS ================= */
  const NotifsScreen = () => (
    <div style={{ padding: 16 }}>
      <h1 style={{ ...S.h1, margin: "10px 0 16px" }}>Notifications</h1>
      {notifications.length === 0 && <Card><div style={S.sub}>Aucune notification pour l'instant.</div></Card>}
      {notifications.map(n => (
        <Card key={n.id} style={{ marginBottom: 8, borderLeft: `4px solid ${n.color || T.sub}`, opacity: n.lu ? 0.7 : 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
            <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 14 }}>{n.titre}</div>
            <span style={{ ...S.sub, fontSize: 11, flexShrink: 0 }}>{new Date(n.date).toLocaleDateString("fr-CH", { day: "2-digit", month: "short" })}</span>
          </div>
          <div style={{ ...S.sub, fontSize: 13, marginTop: 3 }}>{n.texte}</div>
        </Card>
      ))}
      <div style={{ ...S.sub, fontSize: 12, textAlign: "center", marginTop: 8 }}>Push · e-mail · SMS · WhatsApp selon vos préférences</div>
    </div>
  );

  /* ================= PRO — INSCRIPTION ENTREPRISE ================= */
  const ProOnboardScreen = () => (
    <div style={{ padding: 16 }}>
      <Back onClick={() => go("profile")} label="Profil" />
      <div style={{ margin: "0 0 14px" }}>
        <TileProgress step={onb + 1} total={3} />
        <div style={{ ...S.sub, fontSize: 11, marginTop: 4 }}>Inscription entreprise — étape {onb + 1} / 3</div>
      </div>
      {onb === 0 && <>
        <h1 style={{ ...S.h1, fontSize: 22, marginBottom: 14 }}>Votre entreprise</h1>
        {[["Raison sociale", MY_ENTREPRISE], ["IDE / TVA", "À compléter"], ["Adresse", "À compléter"], ["Métiers", "Carrelage · Parquet · Sanitaire"], ["Zones desservies", "Valais central · 25 km"], ["Employés", "À compléter"], ["Langues", "FR · DE · BS"]].map(([k, v]) => (
          <Card key={k} style={{ marginBottom: 8, display: "flex", justifyContent: "space-between", padding: "12px 14px" }}>
            <span style={{ ...S.sub, fontWeight: 700 }}>{k}</span><span style={{ ...S.body, fontWeight: 700, fontSize: 13.5, textAlign: "right" }}>{v}</span>
          </Card>
        ))}
      </>}
      {onb === 1 && <>
        <h1 style={{ ...S.h1, fontSize: 22, marginBottom: 6 }}>Documents</h1>
        <p style={{ ...S.sub, margin: "0 0 14px" }}>Vérifiés par notre équipe sous 48 h. Le badge « Vérifié » débloque les soumissions.</p>
        {[["Extrait du registre du commerce", "Vérifié", T.green, T.greenBg], ["Assurance RC professionnelle", "En vérification", T.amber, T.amberBg], ["Attestation AVS", "Vérifié", T.green, T.greenBg], ["Qualification professionnelle (CFC)", "Vérifié", T.green, T.greenBg], ["Coordonnées bancaires (IBAN)", "À téléverser", T.red, T.redBg]].map(([d, st, c, bg]) => (
          <Card key={d} style={{ marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <FileText size={17} color={T.sub} style={{ flexShrink: 0 }} />
              <span style={{ ...S.body, fontWeight: 600, fontSize: 13 }}>{d}</span>
            </div>
            <Tag color={c} bg={bg}>{st}</Tag>
          </Card>
        ))}
      </>}
      {onb === 2 && <>
        <h1 style={{ ...S.h1, fontSize: 22, marginBottom: 14 }}>Choisissez votre plan</h1>
        {[["Starter", "0 CHF/mois", "Profil public · 5 opportunités/mois · commission 10 %", false],
        ["Pro", "89 CHF/mois", "Opportunités illimitées · filtres avancés · devis intégrés · commission 7 %", false],
        ["Premium", "189 CHF/mois", "Appels d'offres privés · sync Dolibarr · équipe · planning · commission 4 %", true]].map(([n, p, d, best]) => (
          <Card key={n} onClick={() => setPlan(n)} style={{ marginBottom: 8, ...(plan === n ? { border: `2px solid ${T.red}` } : {}) }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 16, display: "flex", alignItems: "center", gap: 8 }}>{n} {best && <Tag color={T.red} bg={T.redBg}>Recommandé</Tag>}</div>
              <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 13.5 }}>{p}</div>
            </div>
            <div style={{ ...S.sub, fontSize: 12.5, marginTop: 4 }}>{d}</div>
          </Card>
        ))}
      </>}
      <div style={{ marginTop: 16 }}>
        <Btn onClick={() => onb < 2 ? setOnb(onb + 1) : go("profile")}>
          {onb === 2 ? `Activer mon compte ${plan}` : "Continuer"} <ChevronRight size={17} />
        </Btn>
      </div>
    </div>
  );

  /* ---------------- Router ---------------- */
  const screens = {
    home: HomeScreen, form: FormScreen, published: PublishedScreen,
    requests: RequestsScreen, request: RequestScreen, offerDetail: OfferDetailScreen,
    sign: SignScreen, pay: PayScreen, review: ReviewScreen, chat: ChatScreen,
    aiAssist: AiAssistScreen, notifs: NotifsScreen,
    proHome: ProHomeScreen, proOpp: ProOppScreen, proBid: ProBidScreen, proSent: ProSentScreen,
    proAgenda: ProAgendaScreen, proStats: ProStatsScreen, proOnboard: ProOnboardScreen,
    promoHome: PromoHomeScreen,
    adminHome: AdminHomeScreen, adminQueue: AdminQueueScreen, adminRequest: AdminRequestScreen,
    adminPublish: AdminPublishScreen, chantierPublished: ChantierPublishedScreen,
    adminPilot: AdminPilotScreen, adminChantierCompare: AdminChantierCompareScreen,
    suivi: SuiviScreen, bordereauPdf: BordereauPdfScreen, facturePdf: FactureCommissionPdfScreen,
    profile: ProfileScreen,
  };

  if (!authChecked) {
    return (
      <div style={{ background: "#DDDBD2", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 size={28} color={T.red} style={{ animation: "spin 1s linear infinite" }} />
      </div>
    );
  }
  if (!authUser) {
    return (
      <div style={{ background: "#DDDBD2", minHeight: "100vh", fontFamily: FONT }}>
        <AuthScreen />
      </div>
    );
  }

  return (
    <div style={{ background: "#DDDBD2", minHeight: "100vh", fontFamily: FONT }}>
      <div style={{ maxWidth: 480, margin: "0 auto", background: T.bg, minHeight: "100vh", paddingBottom: 90 }}>
        <Header />
        {dataLoading && chantiers.length === 0 ? (
          <div style={{ padding: 60, textAlign: "center" }}>
            <Loader2 size={24} color={T.red} style={{ animation: "spin 1s linear infinite" }} />
          </div>
        ) : screens[screen]()}
        <NavBar />
      </div>
    </div>
  );
}
