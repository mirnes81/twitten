import React, { useState, useEffect } from "react";
import {
  Grid3x3, Layers, Bath, Droplets, Hammer, Paintbrush, Zap, Flame,
  Camera, Mic, FileText, MapPin, ChevronRight, ChevronLeft, Search,
  Sparkles, AlertTriangle, Home, Briefcase, MessageSquare, User,
  CheckCircle2, Clock, Star, Shield, Send, Plus, Minus, X, Check,
  Calendar, TrendingUp, Eye, Image, PenLine, Building2, LayoutDashboard,
  Users, BarChart3, Video, Phone, AlertCircle, FileSignature, Trash2, Bell,
  Loader2, CreditCard, QrCode
} from "lucide-react";

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
const Tag = ({ children, color = T.sub, bg = T.soft }) => (
  <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: 11, color, background: bg, padding: "3px 8px", borderRadius: 6, whiteSpace: "nowrap" }}>{children}</span>
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
const OFFERS = [
  { id: "A", ent: "Carrelage Dubuis Sàrl", lieu: "Sion", note: 4.8, ch: 127, prix: 18450, fourn: "Incluses", debut: "12 août", duree: "8 j", gar: "5 ans", rep: "≈ 2 h" },
  { id: "B", ent: "Batisol Valais SA", lieu: "Conthey", note: 4.6, ch: 89, prix: 17900, fourn: "Partielles", debut: "25 août", duree: "7 j", gar: "2 ans", rep: "≈ 5 h" },
  { id: "C", ent: "MV-3 PRO Sàrl", lieu: "Sion", note: 4.9, ch: 214, prix: 20200, fourn: "Incluses", debut: "5 août", duree: "10 j", gar: "5 ans", rep: "≈ 1 h" },
];
const VARIANTES = {
  Essentiel: { prix: "17'400", desc: "Pose uniquement, fournitures par le client", gar: "2 ans", lignes: [["Dépose et évacuation", "735"], ["Étanchéité douche", "810"], ["Pose sol 60×60", "1'120"], ["Pose murale 30×60", "2'900"], ["Douche italienne (pose)", "1'850"], ["Joints et silicone", "485"]] },
  Recommandé: { prix: "20'200", desc: "Fourniture et pose, carrelage Savoia standard", gar: "5 ans", lignes: [["Dépose et évacuation", "735"], ["Étanchéité complète", "980"], ["Fourniture Savoia 60×60", "1'890"], ["Fourniture murale 30×60", "2'095"], ["Pose sol + murs", "4'020"], ["Douche italienne complète", "2'450"]] },
  Premium: { prix: "23'900", desc: "Fournitures premium, protection, nettoyage final, garantie étendue", gar: "10 ans", lignes: [["Dépose et évacuation", "735"], ["Étanchéité + natte", "1'240"], ["Fourniture grès premium 120×60", "3'480"], ["Pose grand format", "4'890"], ["Douche italienne + niche LED", "3'180"], ["Protection + nettoyage final", "690"]] },
};
/* ---------------- Catalogue de soumission (bordereau type carrelage) ---------------- */
// Grille de positions standard inspirée des catalogues CAN/CRB utilisés en Suisse romande :
// chaque position a une unité fixe (m², ml, pce, forfait) et une quantité calculée depuis
// les métrés du chantier publié. L'entreprise ne saisit que son prix unitaire.
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
// Prix de référence marché (CHF), affichés à titre indicatif — l'entreprise reste libre de son prix.
const PRIX_REF = {
  "111.1": 250, "221.2": 35, "221.4": 180, "228.1": 28, "271.3": 42, "271.5": 38,
  "241.1": 95, "241.3": 88, "241.6": 24, "241.8": 32, "241.9": 12, "251.4": 1850, "299.0": 220,
};
const METRES_LABELS = {
  surfSol: ["Surface sol", "m²"], surfMur: ["Surface murs", "m²"], mlEtanch: ["Étanchéité relevés", "ml"],
  mlPlinthes: ["Plinthes", "ml"], mlSeuils: ["Seuils / profilés", "ml"], mlJoints: ["Joints de dilatation", "ml"],
  nbDouches: ["Douches italiennes", "pce"],
};
const buildBoqLines = metres => CATALOGUE_CARRELAGE
  .map(p => ({ code: p.code, d: p.d, u: p.u, q: p.qKey ? (metres[p.qKey] || 0) : 1, pu: PRIX_REF[p.code] || 0 }))
  .filter(l => l.q > 0);

/* ---------------- Chantiers publiés (marketplace) ---------------- */
const CHANTIERS_INIT = [
  {
    id: 1, titre: "Salle de bains complète — 7 m²", categorie: "Carrelage", ville: "Savièse", dist: "6 km",
    desc: "Rénovation complète d'une salle de bains, dépose de l'ancien carrelage, douche italienne à créer.",
    metres: { surfSol: 7, surfMur: 20, mlEtanch: 9, mlPlinthes: 5, mlSeuils: 2, mlJoints: 6, nbDouches: 1 },
    budget: "10 000 – 25 000 CHF", delai: "Dans le mois", limite: "25 juillet", statut: "Ouvert",
    prive: false, neuf: true, match: 96, tags: ["Douche italienne", "Dépose", "Étanchéité"],
  },
  {
    id: 2, titre: "Carrelage sol séjour — 48 m²", categorie: "Carrelage", ville: "Conthey", dist: "9 km",
    desc: "Pose de carrelage grand format au sol sur chauffage au sol existant, sans dépose.",
    metres: { surfSol: 48, surfMur: 0, mlEtanch: 0, mlPlinthes: 22, mlSeuils: 3, mlJoints: 14, nbDouches: 0 },
    budget: "5 000 – 10 000 CHF", delai: "Dans les 2 semaines", limite: "22 juillet", statut: "Ouvert",
    prive: false, neuf: true, match: 88, tags: ["Grand format 60×120", "Chauffage au sol"],
  },
  {
    id: 3, titre: "Terrasse sur plots — 32 m²", categorie: "Carrelage", ville: "Nendaz", dist: "14 km",
    desc: "Pose de grès cérame 2 cm sur plots en extérieur, sans étanchéité ni dépose.",
    metres: { surfSol: 32, surfMur: 0, mlEtanch: 0, mlPlinthes: 0, mlSeuils: 4, mlJoints: 18, nbDouches: 0 },
    budget: "10 000 – 25 000 CHF", delai: "Flexible", limite: "1 août", statut: "Ouvert",
    prive: false, neuf: false, match: 74, tags: ["Extérieur", "Grès cérame 2 cm"],
  },
  {
    id: 4, titre: "Appel d'offres privé — Lot 03 Carrelage", categorie: "Carrelage", ville: "Sion", dist: "3 km",
    desc: "Résidence Les Alpes · 12 appartements · série de prix, sur invitation uniquement.",
    metres: { surfSol: 640, surfMur: 380, mlEtanch: 120, mlPlinthes: 210, mlSeuils: 38, mlJoints: 96, nbDouches: 12 },
    budget: "180 000 CHF", delai: "Dans le mois", limite: "10 juillet", statut: "Ouvert",
    prive: true, neuf: true, match: 92, tags: ["Résidence Les Alpes", "12 apparts", "Série de prix"],
  },
];
const emptyChForm = () => ({
  titre: "", categorie: "Carrelage", ville: "", adresse: "", typeBien: "Appartement", etage: "", numAppart: "", desc: "",
  metres: { surfSol: 0, surfMur: 0, mlEtanch: 0, mlPlinthes: 0, mlSeuils: 0, mlJoints: 0, nbDouches: 0 },
  budget: "10 000 – 25 000 CHF", delai: "Dans le mois", limite: "", prive: false, photos: [],
});
const NOTES_ENTREPRISES = { "MV-3 PRO Sàrl": 4.9, "Carrelage Dubuis Sàrl": 4.8, "Batisol Valais SA": 4.6, "Ceramica Rhône Sàrl": 4.4 };
const SOUMISSIONS_SEED = [
  { id: "s1", chantierId: 1, entreprise: "Carrelage Dubuis Sàrl", total: 18450, delaiDebut: "12 août", duree: "8 j", garantie: "5 ans", statut: "En attente", date: "Il y a 2 j" },
  { id: "s2", chantierId: 1, entreprise: "Batisol Valais SA", total: 17900, delaiDebut: "25 août", duree: "7 j", garantie: "2 ans", statut: "En attente", date: "Il y a 1 j" },
  { id: "s3", chantierId: 4, entreprise: "Carrelage Dubuis Sàrl", total: 178200, delaiDebut: "sept.", duree: "35 j", garantie: "5 ans", statut: "En attente", date: "Il y a 3 j" },
  { id: "s4", chantierId: 4, entreprise: "Batisol Valais SA", total: 172550, delaiDebut: "sept.", duree: "32 j", garantie: "2 ans", statut: "En attente", date: "Il y a 4 j" },
  { id: "s5", chantierId: 4, entreprise: "Ceramica Rhône Sàrl", total: 181900, delaiDebut: "sept.", duree: "34 j", garantie: "2 ans", statut: "Perdue", date: "Il y a 5 j" },
  { id: "s6", chantierId: 2, entreprise: "MV-3 PRO Sàrl", total: 6120, delaiDebut: "29 juillet", duree: "3 j", garantie: "5 ans", statut: "Gagnée", date: "La semaine dernière" },
];
const LOTS = [
  { n: "Lot 01 — Démolition", st: "Adjugé", c: T.sub, bg: T.soft, info: "Démo Valais SA · 84'500 CHF" },
  { n: "Lot 02 — Chape", st: "3 offres", c: T.amber, bg: T.amberBg, info: "Délai : 25 juillet" },
  { n: "Lot 03 — Carrelage", st: "Comparer", c: T.red, bg: T.redBg, info: "3 soumissions reçues", go: true },
  { n: "Lot 04 — Parquet", st: "Invitations", c: T.amber, bg: T.amberBg, info: "4 entreprises invitées" },
  { n: "Lot 05 — Sanitaire", st: "Brouillon", c: T.sub, bg: T.soft, info: "Documents en préparation" },
];
const ADMIN_QUEUE = [
  { t: "Salle de bains — Savièse", s: "Il y a 12 min · Particulier · Dossier complet", q: "A", go: true },
  { t: "Peinture façade — Martigny", s: "Il y a 1 h · Catégorie à corriger", q: "B" },
  { t: "Carrelage 15 m² — Sierre", s: "Il y a 3 h · Doublon possible", q: "C" },
];

/* ================================================================== */
export default function App() {
  const [role, setRole] = useState("client");
  const [screen, setScreen] = useState("home");
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    type: "Rénovation", bien: "Appartement", npa: "1965 Savièse", surfSol: 7, surfMur: 20,
    sdb: true, depose: true, chauff: false, budget: "10 000 – 25 000 CHF", delai: "Dans le mois",
    visite: "Visite sur place", creneau: "Mardi 14h–17h",
  });
  const [variant, setVariant] = useState("Recommandé");
  const [accepted, setAccepted] = useState(false);
  const [signed, setSigned] = useState(false);
  const [received, setReceived] = useState(false);
  const [review, setReview] = useState({ q: 5, prix: 5, delai: 4, com: 5, prop: 5, sav: 5, done: false });
  const [chantiers, setChantiers] = useState(CHANTIERS_INIT);
  const [soumissions, setSoumissions] = useState(SOUMISSIONS_SEED);
  const [selectedChantierId, setSelectedChantierId] = useState(1);
  const [pilotChantierId, setPilotChantierId] = useState(1);
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
    st.textContent = "@keyframes spin{to{transform:rotate(360deg)}}";
    document.head.appendChild(st);
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const go = s => { setScreen(s); window.scrollTo(0, 0); };
  const switchRole = r => {
    setRole(r);
    go(r === "pro" ? "proHome" : r === "promo" ? "promoHome" : r === "admin" ? "adminHome" : "home");
  };
  /* --- Marketplace : publication de chantiers et soumissions structurées --- */
  const setMetre = (k, v) => setChForm(f => ({ ...f, metres: { ...f.metres, [k]: Math.max(0, v) } }));
  const addChPhotos = files => {
    const items = Array.from(files).map(f => ({ url: URL.createObjectURL(f), name: f.name }));
    setChForm(f => ({ ...f, photos: [...f.photos, ...items] }));
  };
  const removeChPhoto = i => setChForm(f => ({ ...f, photos: f.photos.filter((_, j) => j !== i) }));
  const publishChantier = () => {
    const id = Math.max(0, ...chantiers.map(c => c.id)) + 1;
    setChantiers([{ ...chForm, id, statut: "Ouvert", neuf: true, match: 90, tags: [chForm.categorie] }, ...chantiers]);
    setChStep(0);
    setChForm(emptyChForm());
    go("chantierPublished");
  };
  const openBid = chantierId => {
    const ch = chantiers.find(c => c.id === chantierId);
    setSelectedChantierId(chantierId);
    setBidLines(buildBoqLines(ch.metres));
    setBidMeta({ delaiDebut: "", duree: "", garantie: "5 ans", remarques: "" });
    go("proBid");
  };
  const updateBidLine = (i, field, value) => setBidLines(ls => ls.map((l, j) => j === i ? { ...l, [field]: Math.max(0, Number(value) || 0) } : l));
  const bidTotal = bidLines.reduce((s, l) => s + l.q * l.pu, 0);
  const submitBid = () => {
    setSoumissions(s => [{
      id: "s" + Date.now(), chantierId: selectedChantierId, entreprise: "MV-3 PRO Sàrl",
      lignes: bidLines, total: Math.round(bidTotal * 1.081), delaiDebut: bidMeta.delaiDebut || "À convenir",
      duree: bidMeta.duree || "—", garantie: bidMeta.garantie, remarques: bidMeta.remarques, statut: "En attente", date: "À l'instant",
    }, ...s]);
    go("proSent");
  };
  const adjuger = (chantierId, soumissionId) => {
    setSoumissions(s => s.map(x => x.chantierId !== chantierId ? x : { ...x, statut: x.id === soumissionId ? "Gagnée" : "Perdue" }));
    setChantiers(cs => cs.map(c => c.id === chantierId ? { ...c, statut: "Attribué" } : c));
  };

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
            <span style={{ position: "absolute", top: 4, right: 4, width: 7, height: 7, borderRadius: "50%", background: T.red }} />
          </button>
          <div style={{ display: "flex", background: T.soft, borderRadius: 9, padding: 3 }}>
            {[["client", "Client"], ["pro", "Pro"], ["promo", "Promo"], ["admin", "Admin"]].map(([r, l]) => (
              <button key={r} onClick={() => switchRole(r)} style={{
                fontFamily: FONT, fontWeight: 700, fontSize: 10.5, padding: "6px 8px", borderRadius: 7,
                border: "none", cursor: "pointer", background: role === r ? T.ink : "transparent", color: role === r ? "#fff" : T.sub
              }}>{l}</button>
            ))}
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
    const next = () => step < 8 ? setStep(step + 1) : go("published");
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
  const RequestsScreen = () => (
    <div style={{ padding: 16 }}>
      <h1 style={{ ...S.h1, margin: "10px 0 16px" }}>Mes chantiers</h1>
      <div style={S.label}>Demandes actives</div>
      <Card onClick={() => go("request")} style={{ marginTop: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 15 }}>Salle de bains — Savièse</div>
            <div style={{ ...S.sub, marginTop: 2 }}>Carrelage · Sol 7 m² + murs 20 m²</div>
          </div>
          <Tag color={T.green} bg={T.greenBg}>3 offres</Tag>
        </div>
        <div style={{ display: "flex", gap: 14, marginTop: 12, paddingTop: 12, borderTop: `1px solid ${T.line}` }}>
          {[["3", "offres"], ["5", "intéressés"], ["2", "messages"], ["1", "visite"]].map(([n, l]) => (
            <div key={l}><span style={{ fontFamily: FONT, fontWeight: 900, fontSize: 16, color: T.red }}>{n}</span><span style={{ ...S.sub, fontSize: 11.5, marginLeft: 4 }}>{l}</span></div>
          ))}
        </div>
      </Card>
      {signed && <>
        <div style={{ ...S.label, marginTop: 18 }}>Travaux en cours</div>
        <Card onClick={() => go("works")} style={{ marginTop: 8, borderLeft: `4px solid ${T.green}` }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 15 }}>MV-3 PRO Sàrl</div>
            <Tag color={T.green} bg={T.greenBg}>{received ? "Réceptionné" : "Signé"}</Tag>
          </div>
          <div style={{ ...S.sub, marginTop: 2 }}>Début 5 août · {VARIANTES[variant].prix} CHF · Acompte 30 % payé</div>
        </Card>
      </>}
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

  /* ================= CLIENT — COMPARATOR ================= */
  const RequestScreen = () => (
    <div style={{ padding: 16 }}>
      <Back onClick={() => go("requests")} label="Mes chantiers" />
      <h1 style={{ ...S.h1, fontSize: 22 }}>Comparer les offres</h1>
      <p style={{ ...S.sub, margin: "6px 0 14px" }}>3 offres normalisées pour votre salle de bains, toutes vérifiées.</p>
      <div style={{ overflowX: "auto", margin: "0 -16px", padding: "0 16px" }}>
        <table style={{ borderCollapse: "separate", borderSpacing: 0, width: "100%", minWidth: 430, fontFamily: FONT, fontSize: 12.5 }}>
          <thead><tr>
            <th></th>
            {OFFERS.map(o => (
              <th key={o.id} style={{ padding: "8px 6px", background: o.id === "C" ? T.redBg : "transparent", borderRadius: "10px 10px 0 0" }}>
                <div style={{ fontWeight: 800, fontSize: 12, lineHeight: 1.2 }}>{o.ent.split(" ")[0]}<br />{o.ent.split(" ").slice(1).join(" ")}</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 3, marginTop: 3 }}>
                  <Star size={11} color={T.amber} fill={T.amber} /><span style={{ fontWeight: 800 }}>{o.note}</span>
                </div>
              </th>
            ))}
          </tr></thead>
          <tbody>
            {[["Prix total", o => <b style={{ fontSize: 13.5 }}>{o.prix.toLocaleString("fr-CH")}</b>], ["Fournitures", o => o.fourn], ["Début", o => o.debut], ["Durée", o => o.duree], ["Garantie", o => o.gar], ["Réponse", o => o.rep], ["Vérifiée", () => <Check size={15} color={T.green} strokeWidth={3} />]].map(([lbl, fn]) => (
              <tr key={lbl}>
                <td style={{ padding: "9px 6px", color: T.sub, fontWeight: 700, borderTop: `1px solid ${T.line}` }}>{lbl}</td>
                {OFFERS.map(o => <td key={o.id} style={{ padding: "9px 6px", textAlign: "center", borderTop: `1px solid ${T.line}`, background: o.id === "C" ? T.redBg : "transparent" }}>{fn(o)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
        {OFFERS.map(o => (
          <Card key={o.id} style={o.id === "C" ? { border: `2px solid ${T.red}` } : {}}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 15 }}>{o.ent}</div>
                <div style={S.sub}>{o.lieu} · {o.ch} chantiers vérifiés</div>
              </div>
              <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 16 }}>{o.prix.toLocaleString("fr-CH")}<span style={{ fontSize: 11, color: T.sub }}> CHF</span></div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <Btn kind="soft" style={{ fontSize: 13, padding: "10px" }} onClick={() => go("chat")}><MessageSquare size={15} /> Question</Btn>
              <Btn style={{ fontSize: 13, padding: "10px" }} onClick={() => go(o.id === "C" ? "offerDetail" : "offerDetail")}>Voir le devis <ChevronRight size={15} /></Btn>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  /* ================= CLIENT — OFFER DETAIL + VARIANTES ================= */
  const OfferDetailScreen = () => {
    const v = VARIANTES[variant];
    return (
      <div style={{ padding: 16 }}>
        <Back onClick={() => go("request")} label="Comparer les offres" />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <h1 style={{ ...S.h1, fontSize: 21 }}>Devis MV-3 PRO Sàrl</h1>
          <Tag color={T.green} bg={T.greenBg}>Vérifié ✓</Tag>
        </div>
        <p style={{ ...S.sub, margin: "4px 0 14px" }}>Sion · 4.9 ★ · 214 chantiers · Réponse ≈ 1 h</p>
        <div style={{ display: "flex", background: T.soft, borderRadius: 11, padding: 4, marginBottom: 12 }}>
          {Object.keys(VARIANTES).map(k => (
            <button key={k} onClick={() => setVariant(k)} style={{
              flex: 1, fontFamily: FONT, fontWeight: 700, fontSize: 12.5, padding: "9px 4px",
              borderRadius: 8, border: "none", cursor: "pointer",
              background: variant === k ? T.white : "transparent",
              color: variant === k ? T.red : T.sub,
              boxShadow: variant === k ? "0 1px 3px rgba(0,0,0,.08)" : "none"
            }}>{k}</button>
          ))}
        </div>
        <Card>
          <div style={{ ...S.sub, marginBottom: 10 }}>{v.desc}</div>
          {v.lignes.map(([d, p], i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderTop: i ? `1px solid ${T.line}` : "none", fontFamily: FONT, fontSize: 13.5 }}>
              <span style={{ fontWeight: 600 }}>{d}</span><span style={{ fontWeight: 800 }}>{p} CHF</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0 2px", borderTop: `2px solid ${T.ink}`, marginTop: 4 }}>
            <div>
              <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 15 }}>Total TTC (TVA 8.1 %)</div>
              <div style={{ ...S.sub, fontSize: 12 }}>Garantie {v.gar} · Début 5 août · 10 jours</div>
            </div>
            <span style={{ fontFamily: FONT, fontWeight: 900, fontSize: 19, color: T.red }}>{v.prix} CHF</span>
          </div>
        </Card>
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <Btn kind="soft" style={{ fontSize: 13 }}><FileText size={16} /> PDF</Btn>
          <Btn kind="soft" style={{ fontSize: 13 }} onClick={() => go("chat")}><MessageSquare size={16} /> Modifier</Btn>
        </div>
        <div style={{ marginTop: 8 }}>
          <Btn onClick={() => go("sign")}><FileSignature size={17} /> Accepter et signer — {v.prix} CHF</Btn>
        </div>
      </div>
    );
  };

  /* ================= CLIENT — E-SIGNATURE ================= */
  const SignScreen = () => (
    <div style={{ padding: 16 }}>
      <Back onClick={() => go("offerDetail")} label="Devis" />
      <h1 style={{ ...S.h1, fontSize: 22 }}>Signature électronique</h1>
      <p style={{ ...S.sub, margin: "6px 0 16px" }}>Contrat : offre <b>{variant}</b> de MV-3 PRO Sàrl · {VARIANTES[variant].prix} CHF TTC · Garantie {VARIANTES[variant].gar}</p>
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

  /* ================= CLIENT — WORKS ================= */
  const WorksScreen = () => (
    <div style={{ padding: 16 }}>
      <Back onClick={() => go("requests")} label="Mes chantiers" />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ ...S.h1, fontSize: 22 }}>Salle de bains</h1>
        <Tag color={T.green} bg={T.greenBg}>{received ? "Réceptionné ✓" : "En cours"}</Tag>
      </div>
      <p style={{ ...S.sub, margin: "4px 0 16px" }}>MV-3 PRO Sàrl · Offre {variant} signée · {VARIANTES[variant].prix} CHF</p>
      <div style={S.label}>Échéancier de paiement</div>
      <Card style={{ marginTop: 8 }}>
        {[["Acompte 30 %", "Payé par TWINT ✓", true], ["Début des travaux 30 %", "QR-facture le 5 août", false], ["En cours 30 %", "—", false], ["Réception 10 %", "Après validation", received]].map(([t, s, done], i) => (
          <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", padding: "9px 0", borderTop: i ? `1px solid ${T.line}` : "none" }}>
            {done ? <CheckCircle2 size={18} color={T.green} /> : <Clock size={18} color={T.sub} />}
            <div><div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 13.5 }}>{t}</div><div style={{ ...S.sub, fontSize: 12 }}>{s}</div></div>
          </div>
        ))}
      </Card>
      <div style={{ ...S.label, marginTop: 16 }}>Photos du chantier</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginTop: 8 }}>
        {["Avant", "Pendant", "Après"].map(p => (
          <div key={p} style={{ background: T.soft, borderRadius: 10, height: 88, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5 }}>
            <Camera size={18} color={T.sub} /><span style={{ ...S.sub, fontSize: 11, fontWeight: 700 }}>{p}</span>
          </div>
        ))}
      </div>
      <div style={{ ...S.label, marginTop: 16 }}>Journal de chantier</div>
      <Card style={{ marginTop: 8 }}>
        {[["18 juil.", "Contrat signé · QR-facture d'acompte envoyée"], ["22 juil.", "Commande carrelage Savoia confirmée"], ["5 août", "Début — dépose et préparation du support"], ["8 août", "Étanchéité posée · photo ajoutée"]].map(([d, t], i) => (
          <div key={i} style={{ display: "flex", gap: 12, padding: "8px 0", borderTop: i ? `1px solid ${T.line}` : "none" }}>
            <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: 12, color: T.red, minWidth: 52 }}>{d}</span>
            <span style={{ ...S.body, fontSize: 13 }}>{t}</span>
          </div>
        ))}
      </Card>
      <Card style={{ marginTop: 12, background: T.amberBg, border: "none" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 14, color: T.amber }}>Avenant proposé</div>
            <div style={{ ...S.sub, fontSize: 13 }}>Niche murale LED · + 380 CHF · + 0.5 jour</div>
          </div>
          <Btn kind="dark" style={{ width: "auto", fontSize: 12, padding: "9px 14px" }}>Signer</Btn>
        </div>
      </Card>
      {!received && <div style={{ marginTop: 14 }}>
        <Btn kind="green" onClick={() => { setReceived(true); go("review"); }}><CheckCircle2 size={18} /> Réception des travaux</Btn>
      </div>}
      {received && <div style={{ marginTop: 14 }}>
        <Btn kind="soft" onClick={() => go("review")}><Star size={17} /> {review.done ? "Voir mon évaluation" : "Évaluer l'entreprise"}</Btn>
      </div>}
    </div>
  );

  /* ================= CLIENT — REVIEW ================= */
  const ReviewScreen = () => (
    <div style={{ padding: 16 }}>
      <Back onClick={() => go("works")} label="Chantier" />
      <h1 style={{ ...S.h1, fontSize: 22 }}>Évaluer MV-3 PRO Sàrl</h1>
      <p style={{ ...S.sub, margin: "6px 0 16px" }}>Votre avis est lié à un chantier vérifié et signé — il compte vraiment.</p>
      {[["q", "Qualité du travail"], ["prix", "Respect du prix"], ["delai", "Respect des délais"], ["com", "Communication"], ["prop", "Propreté"], ["sav", "Service après-vente"]].map(([k, lbl]) => (
        <Card key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, padding: "12px 14px" }}>
          <span style={{ ...S.body, fontWeight: 700, fontSize: 13.5 }}>{lbl}</span>
          <Stars v={review[k]} set={v => setReview(r => ({ ...r, [k]: v }))} size={19} />
        </Card>
      ))}
      <textarea placeholder="Racontez votre expérience (facultatif)…" style={{ width: "100%", boxSizing: "border-box", fontFamily: FONT, fontSize: 14, padding: 13, borderRadius: 12, border: `1px solid ${T.line}`, background: T.white, minHeight: 80, resize: "none", outline: "none", marginBottom: 12 }} />
      <Btn disabled={review.done} onClick={() => setReview(r => ({ ...r, done: true }))}>
        {review.done ? "✓ Avis publié — merci !" : "Publier mon avis"}
      </Btn>
    </div>
  );

  /* ================= CHAT ================= */
  const ChatScreen = () => (
    <div style={{ padding: 16, display: "flex", flexDirection: "column", minHeight: "calc(100vh - 165px)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: T.ink, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontWeight: 900, fontSize: 15 }}>M</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 15 }}>{role === "client" ? "MV-3 PRO Sàrl" : "Client — SdB Savièse"}</div>
          <div style={{ ...S.sub, fontSize: 12 }}>🔒 Coordonnées masquées avant acceptation · Traduction auto</div>
        </div>
        <Phone size={18} color={T.sub} />
      </div>
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
        <Card>
          <div style={S.label}>Dossier</div>
          <div style={{ ...S.body, marginTop: 6 }}>{ch.desc}</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
            {Object.entries(ch.metres).filter(([, v]) => v > 0).map(([k, v]) => (
              <Tag key={k}>{METRES_LABELS[k][0]} : {v} {METRES_LABELS[k][1]}</Tag>
            ))}
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
    const mine = soumissions.filter(s => s.entreprise === "MV-3 PRO Sàrl");
    const statusStyle = st => st === "Gagnée" ? [T.green, T.greenBg] : st === "Perdue" ? [T.sub, T.soft] : [T.amber, T.amberBg];
    return (
      <div style={{ padding: 16 }}>
        <h1 style={{ ...S.h1, margin: "10px 0 16px" }}>Mes soumissions</h1>
        {mine.map(s => {
          const ch = chantiers.find(c => c.id === s.chantierId);
          const [c, bg] = statusStyle(s.statut);
          return (
            <Card key={s.id} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 15 }}>{ch ? ch.titre : "Chantier"}</div>
                  <div style={S.sub}>{s.total.toLocaleString("fr-CH")} CHF · {s.date}</div>
                </div>
                <Tag color={c} bg={bg}>{s.statut === "Gagnée" ? "Gagnée ✓" : s.statut}</Tag>
              </div>
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
              <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 14, color: "#fff" }}>Plan Premium · commission 4 %</div>
              <div style={{ fontFamily: FONT, fontSize: 12.5, color: "#B9BDC6" }}>Appels d'offres privés inclus · Sync Dolibarr active</div>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  /* ================= PROMOTEUR ================= */
  const PromoHomeScreen = () => (
    <div style={{ padding: 16 }}>
      <h1 style={{ ...S.h1, margin: "10px 0 4px" }}>Mes projets</h1>
      <p style={{ ...S.sub, margin: "0 0 14px" }}>Appels d'offres privés — vous choisissez les entreprises invitées, lot par lot.</p>
      <Card onClick={() => go("promoProject")} style={{ borderLeft: `4px solid ${T.red}` }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 16 }}>Résidence Les Alpes</div>
            <div style={S.sub}>Sion · 12 appartements · 2 bâtiments</div>
          </div>
          <Tag color={T.amber} bg={T.amberBg}>En soumission</Tag>
        </div>
        <div style={{ marginTop: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
            <span style={{ ...S.sub, fontSize: 12 }}>Adjudication des lots</span>
            <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: 12 }}>1 / 5</span>
          </div>
          <div style={{ display: "flex", gap: 3 }}>
            {[1, 0, 0, 0, 0].map((v, i) => <div key={i} style={{ flex: 1, height: 6, borderRadius: 2, background: v ? T.green : T.soft }} />)}
          </div>
        </div>
        <div style={{ display: "flex", gap: 14, marginTop: 12, paddingTop: 12, borderTop: `1px solid ${T.line}` }}>
          {[["5", "lots"], ["11", "invitées"], ["7", "soumissions"]].map(([n, l]) => (
            <div key={l}><span style={{ fontFamily: FONT, fontWeight: 900, fontSize: 16, color: T.red }}>{n}</span><span style={{ ...S.sub, fontSize: 11.5, marginLeft: 4 }}>{l}</span></div>
          ))}
        </div>
      </Card>
      <Card style={{ marginTop: 10, opacity: 0.75 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 15 }}>Villa jumelle — Grimisuat</div>
            <div style={S.sub}>Livré en mai 2026 · 8 lots adjugés</div>
          </div>
          <Tag color={T.green} bg={T.greenBg}>Terminé</Tag>
        </div>
      </Card>
      <button style={{ width: "100%", marginTop: 12, fontFamily: FONT, fontWeight: 700, fontSize: 14, color: T.red, background: T.redBg, border: `1.5px dashed ${T.red}`, borderRadius: 11, padding: "13px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        <Plus size={17} /> Nouveau projet
      </button>
    </div>
  );

  const PromoProjectScreen = () => (
    <div style={{ padding: 16 }}>
      <Back onClick={() => go("promoHome")} label="Mes projets" />
      <h1 style={{ ...S.h1, fontSize: 22 }}>Résidence Les Alpes</h1>
      <p style={{ ...S.sub, margin: "4px 0 16px" }}>Sion · 12 appartements · Documents contractuels et séries de prix par lot. Chaque entreprise ne voit que ses lots.</p>
      <div style={S.label}>Lots</div>
      <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
        {LOTS.map(l => (
          <Card key={l.n} onClick={() => l.go && go("promoLot")} style={l.go ? { border: `2px solid ${T.red}` } : {}}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 14.5 }}>{l.n}</div>
                <div style={{ ...S.sub, fontSize: 12.5, marginTop: 2 }}>{l.info}</div>
              </div>
              <Tag color={l.c} bg={l.bg}>{l.st}</Tag>
            </div>
          </Card>
        ))}
      </div>
      <Card style={{ marginTop: 12, display: "flex", gap: 12, alignItems: "center" }}>
        <Users size={22} color={T.sub} />
        <div>
          <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 13.5 }}>Équipe projet</div>
          <div style={{ ...S.sub, fontSize: 12.5 }}>2 architectes · 1 DT · permissions par lot</div>
        </div>
      </Card>
    </div>
  );

  const PromoLotScreen = () => (
    <div style={{ padding: 16 }}>
      <Back onClick={() => go("promoProject")} label="Résidence Les Alpes" />
      <h1 style={{ ...S.h1, fontSize: 22 }}>Lot 03 — Carrelage</h1>
      <p style={{ ...S.sub, margin: "4px 0 14px" }}>3 soumissions sur série de prix · Délai clos le 10 juillet · 12 appartements + communs</p>
      <div style={{ overflowX: "auto", margin: "0 -16px", padding: "0 16px" }}>
        <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 430, fontFamily: FONT, fontSize: 12.5 }}>
          <thead><tr>
            <th style={{ textAlign: "left", padding: "8px 6px", ...S.label, fontSize: 10 }}>Position</th>
            {["MV-3 PRO", "Dubuis", "Batisol"].map(e => <th key={e} style={{ padding: "8px 6px", fontWeight: 800 }}>{e}</th>)}
          </tr></thead>
          <tbody>
            {[["Sols apparts 60×60 (640 m²)", "78'400", "82'100", "80'250"],
            ["Murs SdB (380 m²)", "52'900", "55'800", "54'100"],
            ["Communs grand format", "24'600", "26'900", "25'300"],
            ["Plinthes et profils", "12'500", "13'400", "12'900"]].map(([p, a, b, c], i) => (
              <tr key={p}>
                <td style={{ padding: "9px 6px", fontWeight: 600, borderTop: `1px solid ${T.line}` }}>{p}</td>
                {[a, b, c].map((v, j) => (
                  <td key={j} style={{ padding: "9px 6px", textAlign: "center", borderTop: `1px solid ${T.line}`, fontWeight: j === 0 ? 800 : 500, color: j === 0 ? T.green : T.ink }}>{v}</td>
                ))}
              </tr>
            ))}
            <tr>
              <td style={{ padding: "10px 6px", fontWeight: 900, borderTop: `2px solid ${T.ink}` }}>Total</td>
              {[["168'400", T.green], ["178'200", T.ink], ["172'550", T.ink]].map(([v, c], j) => (
                <td key={j} style={{ padding: "10px 6px", textAlign: "center", borderTop: `2px solid ${T.ink}`, fontWeight: 900, fontSize: 13.5, color: c }}>{v}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <Card style={{ marginTop: 12, background: T.greenBg, border: "none" }}>
        <div style={{ ...S.sub, color: T.green, fontWeight: 700 }}>💡 MV-3 PRO : meilleure offre (−5.5 %), note 4.9, disponible dès septembre. Écart max entre offres : 9'800 CHF.</div>
      </Card>
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <Btn kind="soft" style={{ fontSize: 13 }}><MessageSquare size={15} /> Négocier</Btn>
        <Btn kind="green" style={{ fontSize: 13 }}><Check size={16} strokeWidth={3} /> Adjuger à MV-3 PRO</Btn>
      </div>
    </div>
  );

  /* ================= ADMIN ================= */
  const AdminHomeScreen = () => (
    <div style={{ padding: 16 }}>
      <h1 style={{ ...S.h1, margin: "10px 0 16px" }}>Cockpit</h1>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <KPI n="14" l="demandes aujourd'hui" c={T.red} /><KPI n="5" l="à vérifier" c={T.amber} />
        <KPI n="38 %" l="taux de conversion" c={T.green} /><KPI n="4'320" l="CHF commissions / sem." />
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

  /* ================= ADMIN — PUBLIER UN CHANTIER ================= */
  const CH_STEPS = ["Description du chantier", "Adresse", "Photos", "Métrés", "Conditions", "Vérification"];
  const CH_LAST = CH_STEPS.length - 1;
  const AdminPublishScreen = () => {
    const next = () => chStep < CH_LAST ? setChStep(chStep + 1) : publishChantier();
    const back = () => chStep > 0 ? setChStep(chStep - 1) : go("adminHome");
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
              <Chip key={o} active={chForm.categorie === o} onClick={() => setChForm(f => ({ ...f, categorie: o }))}>{o}</Chip>)}
          </div>
          <textarea placeholder="Description des travaux demandés…" value={chForm.desc} onChange={e => setChForm(f => ({ ...f, desc: e.target.value }))}
            style={{ width: "100%", boxSizing: "border-box", fontFamily: FONT, fontSize: 14, padding: 13, borderRadius: 12, border: `1px solid ${T.line}`, background: T.white, minHeight: 90, resize: "none", outline: "none" }} />
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
            {Object.entries(METRES_LABELS).map(([k, [lbl, u]]) => (
              <div key={k} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderTop: k !== "surfSol" ? `1px solid ${T.line}` : "none" }}>
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
        </div>}

        {chStep === 5 && <div style={{ display: "grid", gap: 8 }}>
          {[["Titre", chForm.titre || "—"], ["Catégorie", chForm.categorie],
          ["Adresse", [chForm.adresse, chForm.ville].filter(Boolean).join(", ") || "—"],
          ["Type de bien", chForm.typeBien + (chForm.etage ? ` · ${chForm.etage}` : "") + (chForm.numAppart ? ` · N° ${chForm.numAppart}` : "")],
          ["Photos", chForm.photos.length ? `${chForm.photos.length} photo${chForm.photos.length > 1 ? "s" : ""}` : "Aucune"],
          ["Métrés", Object.entries(chForm.metres).filter(([, v]) => v > 0).map(([k, v]) => `${METRES_LABELS[k][0]} ${v} ${METRES_LABELS[k][1]}`).join(" · ") || "—"],
          ["Budget", chForm.budget], ["Délai", chForm.delai], ["Limite de soumission", chForm.limite || "—"],
          ["Visibilité", chForm.prive ? "Invitation privée" : "Ouvert (max 4 soumissions)"]].map(([k, v]) => (
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
      <Btn onClick={() => go("adminPilot")}>Voir le pilotage marketplace</Btn>
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
      return { ent, nb: mine.length, gagnees, taux: decidees ? Math.round((gagnees / decidees) * 100) : null, ecartMoy, note: NOTES_ENTREPRISES[ent] || 4.5 };
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
                  <td style={{ padding: "9px 6px", textAlign: "center", borderTop: `1px solid ${T.line}` }}>{s.note} ★</td>
                  <td style={{ padding: "9px 6px", textAlign: "center", borderTop: `1px solid ${T.line}` }}>{s.nb}</td>
                  <td style={{ padding: "9px 6px", textAlign: "center", borderTop: `1px solid ${T.line}`, fontWeight: 700, color: s.taux === null ? T.sub : s.taux >= 50 ? T.green : T.amber }}>{s.taux === null ? "—" : s.taux + " %"}</td>
                  <td style={{ padding: "9px 6px", textAlign: "center", borderTop: `1px solid ${T.line}`, color: s.ecartMoy <= 0 ? T.green : T.ink }}>{s.ecartMoy > 0 ? "+" : ""}{s.ecartMoy.toFixed(1)} %</td>
                  <td style={{ padding: "9px 6px", textAlign: "center", borderTop: `1px solid ${T.line}`, fontWeight: 800 }}>{s.gagnees}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const AdminChantierCompareScreen = () => {
    const ch = chantiers.find(c => c.id === pilotChantierId) || chantiers[0];
    const mine = soumissions.filter(s => s.chantierId === ch.id).sort((a, b) => a.total - b.total);
    return (
      <div style={{ padding: 16 }}>
        <Back onClick={() => go("adminPilot")} label="Pilotage marketplace" />
        <h1 style={{ ...S.h1, fontSize: 21 }}>{ch.titre}</h1>
        <p style={{ ...S.sub, margin: "4px 0 14px" }}>{ch.ville} · {mine.length} soumission{mine.length > 1 ? "s" : ""} · statut {ch.statut}</p>
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
                {s.statut === "En attente" && <Btn kind="green" style={{ width: "auto", fontSize: 12, padding: "9px 14px" }} onClick={() => adjuger(ch.id, s.id)}><Check size={14} strokeWidth={3} /> Adjuger</Btn>}
              </div>
            </Card>
          ))}
          {!mine.length && <Card><div style={S.sub}>Aucune soumission reçue pour ce chantier pour l'instant.</div></Card>}
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
      client: [["Nom", "Client démo"], ["Commune", "Savièse (VS)"], ["Langue", "Français"], ["Notifications", "Push + e-mail"], ["Mes documents", "2 contrats signés"]],
      pro: [["Note", "4.9 / 5 · 214 chantiers"], ["Zones", "Valais central · 25 km"], ["Catalogue", "Sync Dolibarr ✓"], ["Documents", "RC ✓ · AVS ✓ · Assurance ✓"], ["Abonnement", "Premium · commission 4 %"], ["Équipe", "4 utilisateurs"]],
      promo: [["Organisation", "Architecture Rhône SA"], ["Projets actifs", "1 · 5 lots"], ["Équipe", "2 architectes + 1 DT"], ["Modèles", "Séries de prix CAN"]],
      admin: [["Rôle", "Super-admin"], ["Entreprises actives", "142 vérifiées"], ["Demandes / mois", "380"], ["Journal d'audit", "Toutes les actions tracées"]],
    };
    return (
      <div style={{ padding: 16 }}>
        <h1 style={{ ...S.h1, margin: "10px 0 16px" }}>{role === "pro" ? "MV-3 PRO Sàrl" : role === "promo" ? "Architecture Rhône SA" : role === "admin" ? "Administration" : "Mon profil"}</h1>
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
  const PayScreen = () => (
    <div style={{ padding: 16 }}>
      <Back onClick={() => go("sign")} label="Signature" />
      <h1 style={{ ...S.h1, fontSize: 22 }}>Acompte de 30 %</h1>
      <p style={{ ...S.sub, margin: "6px 0 14px" }}>Offre {variant} · Total {VARIANTES[variant].prix} CHF · Acompte sécurisé en séquestre jusqu'au début des travaux</p>
      <Card style={{ textAlign: "center", padding: 18 }}>
        <div style={S.label}>Montant à payer</div>
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 32, color: T.red, margin: "6px 0", letterSpacing: "-0.02em" }}>6'060 CHF</div>
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
        <Btn kind="green" onClick={() => { setSigned(true); setAccepted(true); go("works"); }}>
          <Check size={18} strokeWidth={3} /> Payer 6'060 CHF
        </Btn>
      </div>
      <div style={{ ...S.sub, fontSize: 11.5, textAlign: "center", marginTop: 10 }}>Facture générée dans Dolibarr · reçu PDF par e-mail</div>
    </div>
  );

  /* ================= NOTIFICATIONS ================= */
  const NotifsScreen = () => {
    const N = {
      client: [["À l'instant", "Nouvelle offre reçue", "MV-3 PRO Sàrl a soumis une offre — 20'200 CHF", T.red],
      ["Il y a 2 h", "Visite confirmée", "Carrelage Dubuis · mardi 21 juillet à 14h30", T.green],
      ["Hier", "Question d'une entreprise", "Batisol Valais : « Le receveur de douche est-il déjà choisi ? »", T.amber],
      ["Lun.", "Demande validée", "Votre demande a été transmise à 3 entreprises compatibles", T.green]],
      pro: [["À l'instant", "Nouvelle opportunité 96 %", "Salle de bains complète à Savièse — 6 km de votre dépôt", T.red],
      ["Il y a 1 h", "Offre consultée", "Villa Vétroz : le client a ouvert votre devis (2×)", T.amber],
      ["Hier", "Invitation privée", "Résidence Les Alpes — Lot 03 Carrelage · délai 10 juillet", T.ink],
      ["Lun.", "Chantier gagné 🎉", "Terrasse Grimisuat — 8'750 CHF · contrat signé", T.green]],
      promo: [["Il y a 3 h", "3ᵉ soumission reçue", "Lot 03 Carrelage — comparaison des séries de prix disponible", T.red],
      ["Hier", "Délai lot 02 demain", "Chape : 3 offres reçues sur 4 entreprises invitées", T.amber]],
      admin: [["À l'instant", "5 demandes à vérifier", "Dont 1 qualité A prête à publier", T.red],
      ["Il y a 1 h", "Document expiré", "Assurance RC — Batisol Valais SA · suspension dans 5 jours", T.amber],
      ["Hier", "Litige ouvert", "Chantier #1847 — preuves demandées aux deux parties", T.amber]],
    };
    return (
      <div style={{ padding: 16 }}>
        <h1 style={{ ...S.h1, margin: "10px 0 16px" }}>Notifications</h1>
        {N[role].map(([d, t, s, c], i) => (
          <Card key={i} style={{ marginBottom: 8, borderLeft: `4px solid ${c}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
              <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 14 }}>{t}</div>
              <span style={{ ...S.sub, fontSize: 11, flexShrink: 0 }}>{d}</span>
            </div>
            <div style={{ ...S.sub, fontSize: 13, marginTop: 3 }}>{s}</div>
          </Card>
        ))}
        <div style={{ ...S.sub, fontSize: 12, textAlign: "center", marginTop: 8 }}>Push · e-mail · SMS · WhatsApp selon vos préférences</div>
      </div>
    );
  };

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
        {[["Raison sociale", "MV-3 PRO Sàrl"], ["IDE / TVA", "CHE-465.910.257"], ["Adresse", "Sion (VS)"], ["Métiers", "Carrelage · Parquet · Sanitaire"], ["Zones desservies", "Valais central · 25 km"], ["Employés", "4 · depuis 2015"], ["Langues", "FR · DE · BS"]].map(([k, v]) => (
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
    sign: SignScreen, pay: PayScreen, works: WorksScreen, review: ReviewScreen, chat: ChatScreen,
    aiAssist: AiAssistScreen, notifs: NotifsScreen,
    proHome: ProHomeScreen, proOpp: ProOppScreen, proBid: ProBidScreen, proSent: ProSentScreen,
    proAgenda: ProAgendaScreen, proStats: ProStatsScreen, proOnboard: ProOnboardScreen,
    promoHome: PromoHomeScreen, promoProject: PromoProjectScreen, promoLot: PromoLotScreen,
    adminHome: AdminHomeScreen, adminQueue: AdminQueueScreen, adminRequest: AdminRequestScreen,
    adminPublish: AdminPublishScreen, chantierPublished: ChantierPublishedScreen,
    adminPilot: AdminPilotScreen, adminChantierCompare: AdminChantierCompareScreen,
    profile: ProfileScreen,
  };

  return (
    <div style={{ background: "#DDDBD2", minHeight: "100vh", fontFamily: FONT }}>
      <div style={{ maxWidth: 480, margin: "0 auto", background: T.bg, minHeight: "100vh", paddingBottom: 90 }}>
        <Header />
        {screens[screen]()}
        <NavBar />
      </div>
    </div>
  );
}
