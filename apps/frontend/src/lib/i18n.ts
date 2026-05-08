/**
 * i18n dictionary — English / Spanish.
 * Keys are flat dot-notation for easy lookup.
 * @module lib/i18n
 */

export type Locale = "en" | "es";

const en: Record<string, string> = {
  /* ── Header ────────────────────────────────── */
  "header.sessions": "Sessions",
  "header.connectedAs": "Connected As",
  "header.disconnect": "DISCONNECT",
  "header.connectWallet": "CONNECT WALLET",
  "header.connecting": "CONNECTING…",

  /* ── Landing Page ──────────────────────────── */
  "landing.tag.builtOn": "Built on Stellar",
  "landing.tag.securedBy": "Secured by Soroban",
  "landing.tagline":
    "Accountability sessions on Stellar.<br />Deposit USDC. Vote absentees.<br />Earn rewards.",
  "landing.tagline.line1": "Accountability sessions on Stellar.",
  "landing.tagline.line2": "Deposit USDC. Vote absentees.",
  "landing.tagline.line3": "Earn rewards.",
  "landing.cta.connectWallet": "Connect Wallet",
  "landing.cta.startNow": "Start Now",
  "landing.metric.stakes": "Stakes",
  "landing.metric.players": "Players",
  "landing.metric.onchain": "On-chain",
  "landing.networkMetric01": "Network Metric 01",
  "landing.networkMetric02": "Network Metric 02",
  "landing.networkMetric03": "Network Metric 03",
  "landing.section.coreSystem": "Core System",
  "landing.section.protocolFlow": "Protocol Flow",
  "landing.feature.soroban": "Soroban Smart Contracts",
  "landing.feature.sorobanDesc":
    "Trustless automation on Stellar. Locks and distributes funds based on strict algorithmic parameters.",
  "landing.feature.lowFees": "Low Fees",
  "landing.feature.lowFeesDesc":
    "Minimal network costs. Keep more of your stake and rewards thanks to the highly efficient Stellar network.",
  "landing.feature.voting": "Transparent Voting",
  "landing.feature.votingDesc":
    "On-chain verifiable absence. Peer consensus mechanism ensures accurate penalty application.",
  "landing.feature.deposit.title": "Deposit",
  "landing.feature.deposit.desc":
    "Initialize a session by locking USDC. Set the rules of your accountability event with precision parameters.",
  "landing.feature.participate.title": "Participate",
  "landing.feature.participate.desc":
    "Join a session as a participant. Everyone deposits the same amount – fair play guaranteed.",
  "landing.feature.vote.title": "Vote",
  "landing.feature.vote.desc":
    "After the event, vote on who was absent. Majority rules – no more excuses.",
  "landing.feature.reward.title": "Earn",
  "landing.feature.reward.desc":
    "Absentees lose their deposit. Attendees split the pot and earn a reward.",
  "landing.cta.ready": "Are you ready?",
  "landing.cta.enter": "Pruébalo",
  "landing.cta.connectNow": "Connect Wallet Now",
  "landing.immutable": "Immutable Accountability",
  "landing.footer": "Tipay Protocol v1.0 — Stellar Network",

  /* ── Dashboard / Sessions ──────────────────── */
  "sessions.connectedWallet": "Connected Wallet",
  "sessions.notConnected": "Not connected",
  "sessions.total": "Total Sessions",
  "sessions.active": "Active",
  "sessions.history": "History",
  "sessions.new": "New Session",
  "sessions.refresh": "Refresh data",
  "sessions.noSessions": "No Sessions Yet",
  "sessions.noSessionsDesc": "Create your first accountability session",
  "sessions.createFirst": "Create Session",
  "sessions.found": "found",
  "sessions.activeSessions": "Active Sessions",
  "sessions.pastSessions": "History",

  /* ── Session Detail ────────────────────────── */
  "session.back": "Back to Sessions",
  "session.refresh": "Refresh data",
  "session.title": "Session #",
  "session.notFound": "Session Not Found",
  "session.notFoundDesc": "Session doesn't exist.",
  "session.usdcPerPerson": "USDC / Person",
  "session.deposited": "Deposited",
  "session.event": "Event",
  "session.votingEnds": "Voting Ends",
  "session.id": "ID:",
  "session.participants": "Participants",
  "session.host": "Host",
  "session.you": "You",
  "session.votes": "votes",
  "session.yourDeposit": "Your Deposit",
  "session.deposit": "Deposit",
  "session.building": "Building…",
  "session.signing": "Sign in Wallet…",
  "session.submitting": "On Chain…",
  "session.tryAgain": "Try Again",
  "session.votingWindowClosed": "Voting Window Closed",
  "session.votingWindowDesc":
    "Anyone can resolve this session now. Absentees lose their deposit, attendees split the pool.",
  "session.resolve": "Resolve Session",
  "session.resolved": "✓ Resolved!",
  "session.finalized.title": "Session Finalized",
  "session.finalized.desc":
    "Funds have been distributed. Absentees lost their deposit, attendees received their share.",

  /* ── Create Session Modal ──────────────────── */
  "modal.title": "New Session",
  "modal.amount": "Amount Per Person (USDC)",
  "modal.amountPlaceholder": "1.00",
  "modal.date": "Date",
  "modal.time": "Time",
  "modal.votingWindow": "Voting Window (Minutes)",
  "modal.participants": "Participants",
  "modal.host": "Host",
  "modal.friendPlaceholder": "Friend {n} (G…)",
  "modal.addFriend": "Add Friend",
  "modal.create": "Create Session",
  "modal.created": "✓ Created!",
  "modal.building": "Building…",
  "modal.signing": "Sign in Wallet…",
  "modal.submitting": "On Chain…",
  "modal.tryAgain": "Try Again",
  "modal.error.connectWallet": "Connect your wallet first",
  "modal.error.amount": "Enter an amount greater than 0",
  "modal.error.date": "Set a date and time for the event",
  "modal.error.future": "The event must be in the future",
  "modal.error.minFriends": "You need at least 2 more friends (3 total)",
  "modal.error.maxFriends": "Maximum 5 participants total",

  /* ── Deposit Button ────────────────────────── */
  "deposit.deposited": "Deposited {amount} USDC",
  "deposit.yourDeposit": "Your Deposit",
  "deposit.button": "Deposit",
  "deposit.building": "Building…",
  "deposit.signing": "Sign in Wallet…",
  "deposit.submitting": "On Chain…",
  "deposit.tryAgain": "Try Again",

  /* ── Vote Panel ────────────────────────────── */
  "vote.title": "Who was absent?",
  "vote.cast": "Cast Vote",
  "vote.alreadyVoted": "Vote Cast",
  "vote.voteEnds": "Vote ends in",

  /* ── Status Badge ──────────────────────────── */
  "status.waiting": "WAITING",
  "status.active": "ACTIVE",
  "status.voting": "VOTING",
  "status.votingClosed": "CLOSED",
  "status.refunded": "REFUNDED",
  "status.finalized": "FINALIZED",

  /* ── Session Card ──────────────────────────── */
  "card.host": "Host",
};

/* ── Spanish translations ──────────────────────────── */
const es: Record<string, string> = {
  "header.sessions": "Sesiones",
  "header.connectedAs": "Conectado como",
  "header.disconnect": "DESCONECTAR",
  "header.connectWallet": "CONECTAR WALLET",
  "header.connecting": "CONECTANDO…",

  "landing.tag.builtOn": "Construido en Stellar",
  "landing.tag.securedBy": "Asegurado por Soroban",
  "landing.tagline":
    "Sesiones de responsabilidad en Stellar.<br />Depositá USDC. Votá ausentes.<br />Ganá recompensas.",
  "landing.tagline.line1": "Sesiones de responsabilidad en Stellar.",
  "landing.tagline.line2": "Depositá USDC. Votá ausentes.",
  "landing.tagline.line3": "Ganá recompensas.",
  "landing.cta.connectWallet": "Conectar Wallet",
  "landing.cta.startNow": "Empezar Ya",
  "landing.metric.stakes": "Apuestas",
  "landing.metric.players": "Jugadores",
  "landing.metric.onchain": "On-chain",
  "landing.networkMetric01": "Métrica de Red 01",
  "landing.networkMetric02": "Métrica de Red 02",
  "landing.networkMetric03": "Métrica de Red 03",
  "landing.section.coreSystem": "Sistema Central",
  "landing.section.protocolFlow": "Flujo del Protocolo",
  "landing.feature.soroban": "Contratos Soroban",
  "landing.feature.sorobanDesc":
    "Automatización sin confianza en Stellar. Bloquea y distribuye fondos basado en parámetros algorítmicos estrictos.",
  "landing.feature.lowFees": "Comisiones Bajas",
  "landing.feature.lowFeesDesc":
    "Costos de red mínimos. Conservá más de tus apuestas y recompensas gracias a la red altamente eficiente de Stellar.",
  "landing.feature.voting": "Votación Transparente",
  "landing.feature.votingDesc":
    "Ausencia verificable on-chain. El mecanismo de consenso entre pares garantiza una aplicación precisa de penalizaciones.",
  "landing.feature.deposit.title": "Depositá",
  "landing.feature.deposit.desc":
    "Iniciá una sesión bloqueando USDC. Configurá las reglas de tu evento de responsabilidad con parámetros de precisión.",
  "landing.feature.participate.title": "Participá",
  "landing.feature.participate.desc":
    "Unite a una sesión como participante. Todos depositan el mismo monto: juego limpio garantizado.",
  "landing.feature.vote.title": "Votá",
  "landing.feature.vote.desc":
    "Después del evento, votá quién faltó. La mayoría decide: se acabaron las excusas.",
  "landing.feature.reward.title": "Ganá",
  "landing.feature.reward.desc":
    "Los ausentes pierden su depósito. Los asistentes se reparten el pozo y ganan una recompensa.",
  "landing.cta.ready": "¿Estás listo?",
  "landing.cta.enter": "Pruébalo",
  "landing.cta.connectNow": "Conectar Wallet Ahora",
  "landing.immutable": "Responsabilidad Inmutable",
  "landing.footer": "Protocolo Tipay v1.0 — Red Stellar",

  "sessions.connectedWallet": "Wallet Conectada",
  "sessions.notConnected": "No conectada",
  "sessions.total": "Sesiones Totales",
  "sessions.active": "Activas",
  "sessions.history": "Historial",
  "sessions.new": "Nueva Sesión",
  "sessions.refresh": "Actualizar datos",
  "sessions.noSessions": "Sin Sesiones",
  "sessions.noSessionsDesc": "Creá tu primera sesión de responsabilidad",
  "sessions.createFirst": "Crear Sesión",
  "sessions.found": "encontradas",
  "sessions.activeSessions": "Sesiones Activas",
  "sessions.pastSessions": "Historial",

  "session.back": "Volver a Sesiones",
  "session.refresh": "Actualizar datos",
  "session.title": "Sesión #",
  "session.notFound": "Sesión No Encontrada",
  "session.notFoundDesc": "La sesión no existe.",
  "session.usdcPerPerson": "USDC / Persona",
  "session.deposited": "Depositado",
  "session.event": "Evento",
  "session.votingEnds": "Votación Termina",
  "session.id": "ID:",
  "session.participants": "Participantes",
  "session.host": "Anfitrión",
  "session.you": "Vos",
  "session.votes": "votos",
  "session.yourDeposit": "Tu Depósito",
  "session.deposit": "Depositar",
  "session.building": "Construyendo…",
  "session.signing": "Firmar en Wallet…",
  "session.submitting": "Enviando…",
  "session.tryAgain": "Intentar de Nuevo",
  "session.votingWindowClosed": "Ventana de Votación Cerrada",
  "session.votingWindowDesc":
    "Cualquiera puede resolver esta sesión ahora. Los ausentes pierden su depósito, los asistentes se reparten el pozo.",
  "session.resolve": "Resolver Sesión",
  "session.resolved": "✓ Resuelta!",
  "session.finalized.title": "Sesión Finalizada",
  "session.finalized.desc":
    "Los fondos han sido distribuidos. Los ausentes perdieron su depósito, los asistentes recibieron su parte.",

  "modal.title": "Nueva Sesión",
  "modal.amount": "Monto por Persona (USDC)",
  "modal.amountPlaceholder": "1.00",
  "modal.date": "Fecha",
  "modal.time": "Hora",
  "modal.votingWindow": "Ventana de Votación (Minutos)",
  "modal.participants": "Participantes",
  "modal.host": "Anfitrión",
  "modal.friendPlaceholder": "Amigo {n} (G…)",
  "modal.addFriend": "Agregar Amigo",
  "modal.create": "Crear Sesión",
  "modal.created": "✓ Creada!",
  "modal.building": "Construyendo…",
  "modal.signing": "Firmar en Wallet…",
  "modal.submitting": "Enviando…",
  "modal.tryAgain": "Intentar de Nuevo",
  "modal.error.connectWallet": "Conectá tu wallet primero",
  "modal.error.amount": "Ingresá un monto mayor a 0",
  "modal.error.date": "Establecé una fecha y hora para el evento",
  "modal.error.future": "El evento debe ser en el futuro",
  "modal.error.minFriends": "Necesitás al menos 2 amigos más (3 total)",
  "modal.error.maxFriends": "Máximo 5 participantes en total",

  "deposit.deposited": "Depositado {amount} USDC",
  "deposit.yourDeposit": "Tu Depósito",
  "deposit.button": "Depositar",
  "deposit.building": "Construyendo…",
  "deposit.signing": "Firmar en Wallet…",
  "deposit.submitting": "Enviando…",
  "deposit.tryAgain": "Intentar de Nuevo",

  "vote.title": "¿Quién faltó?",
  "vote.cast": "Votar",
  "vote.alreadyVoted": "Voto Emitido",
  "vote.voteEnds": "Votación termina en",

  "status.waiting": "ESPERANDO",
  "status.active": "ACTIVA",
  "status.voting": "VOTANDO",
  "status.votingClosed": "CERRADA",
  "status.refunded": "REEMBOLSADA",
  "status.finalized": "FINALIZADA",

  "card.host": "Anfitrión",
};

/* ── Locale detection ──────────────────────────────── */

/**
 * Detects the user's preferred locale from the browser / OS.
 * Falls back to English if neither en nor es.
 */
export function detectLocale(): Locale {
  if (typeof window === "undefined") return "en";
  const lang = navigator.language?.toLowerCase() || "";
  if (lang.startsWith("es")) return "es";
  return "en";
}

/**
 * Returns the saved locale from localStorage, or detects it.
 */
export function getSavedLocale(): Locale {
  if (typeof window === "undefined") return "en";
  const saved = localStorage.getItem("tipay-locale") as Locale | null;
  if (saved === "en" || saved === "es") return saved;
  return detectLocale();
}

/**
 * Persists the user's locale choice.
 */
export function saveLocale(locale: Locale): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("tipay-locale", locale);
  }
}

/* ── Dictionary lookup ─────────────────────────────── */

const dict: Record<Locale, Record<string, string>> = { en, es };

/**
 * Returns the translated string for `key` in the given `locale`.
 * Falls back to English if the key is missing.
 */
export function t(key: string, locale: Locale): string {
  return dict[locale]?.[key] ?? dict["en"]?.[key] ?? key;
}
