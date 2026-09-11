import { createHash } from "crypto";

const DEFAULT_BASE_URL = "https://vip-reseller.co.id/api/game-feature";

function md5(input: string): string {
  return createHash("md5").update(input).digest("hex");
}

export function getVipaymentConfig(): { baseUrl: string; apiId: string; apiKey: string } {
  return {
    baseUrl: process.env.VIPAYMENT_API_URL || DEFAULT_BASE_URL,
    apiId: process.env.VIPAYMENT_API_ID || "",
    apiKey: process.env.VIPAYMENT_API_KEY || "",
  };
}

export function isVipaymentConfigured(): boolean {
  const { apiId, apiKey } = getVipaymentConfig();
  return Boolean(apiId && apiKey);
}

export function vipaymentSign(): string {
  const { apiId, apiKey } = getVipaymentConfig();
  return md5(`${apiId}${apiKey}`);
}

// App game slug -> kode game untuk get-nickname.
// Daftar resmi VIPayment (https://vip-reseller.co.id/api/nickname-game-code.txt)
// hanya mendukung game di bawah ini; game lain otomatis fallback ke mode demo.
export const VIPAYMENT_NICKNAME_CODE: Record<string, string> = {
  "mobile-legends": "mobile-legends",
  "free-fire": "free-fire",
  "genshin-impact": "genshin-impact",
  "valorant": "valorant",
  "pubg-mobile": "pubgm",
  "honkai-star-rail": "honkai-star-rail",
  "point-blank": "pointblank",
};

// App game slug -> nama game utk filter services (diurutkan prioritas)
export const VIPAYMENT_GAME_NAMES: Record<string, string[]> = {
  "mobile-legends": ["Mobile Legends A", "Mobile Legends B"],
  "free-fire": ["Free Fire"],
  "genshin-impact": ["Genshin Impact"],
  "valorant": ["Valorant"],
  "pubg-mobile": ["PUBG Mobile (ID)", "PUBGM INDO A"],
  "afk-journey": ["AFK Journey"],
  "steam-wallet": ["Steam Wallet Code"],
  "ace-racer": ["Ace Racer"],
  "age-of-empires-mobile": ["Age of Empires Mobile"],
  "arena-breakout": ["Arena Breakout"],
  "arena-breakout-infinite": ["Arena Breakout: Infinite (PC)"],
  "arena-of-valor": ["Arena of Valor"],
  "astral-guardians": ["Astral Guardians: Cyber Fantasy"],
  "be-the-king": ["Be The King"],
  "blood-strike": ["Blood Strike"],
  "castle-duels": ["Castle Duels"],
  "dragon-raja": ["Dragon Raja"],
  "dragonheir": ["Dragonheir Silent Gods"],
  "dynasty-heroes": ["Dynasty Heroes"],
  "dynasty-warriors-overlords": ["Dynasty Warriors: Overlords"],
  "ea-sports-fc-mobile": ["EA SPORTS FC Mobile"],
  "eggy-party": ["Eggy Party"],
  "farlight-84": ["Farlight 84"],
  "football-master-2": ["Football Master 2"],
  "garena-undawn": ["Garena Undawn"],
  "growtopia": ["Growtopia"],
  "honkai-impact-3": ["Honkai Impact 3"],
  "identity-v": ["Identity V"],
  "infinite-borders": ["Infinite Borders"],
  "king-of-avalon": ["King of Avalon"],
  "lifeafter": ["LifeAfter"],
  "light-of-thel": ["Light of Thel: New Era"],
  "lords-mobile": ["Lords Mobile"],
  "love-and-deepspace": ["Love and Deepspace"],
  "magic-chess-go-go": ["Magic Chess: Go Go", "Magic Chess: Go Go (Global)"],
  "marvel-rivals": ["Marvel Rivals"],
  "metal-slug-awakening": ["Metal Slug Awakening"],
  "nba-infinite": ["NBA Infinite (Europe)"],
  "one-punch-man": ["One Punch Man"],
  "point-blank": ["Point Blank (ID)"],
  "ragnarok-x": ["RagnaroK X Next Generation"],
  "ragnarok-m-eternal-love": ["Ragnarok M Eternal Love (SEA)"],
  "ragnarok-origin-classic": ["Ragnarok Origin Classic"],
  "revelation-infinite-journey": ["Revelation Infinite Journey"],
  "rush-royale": ["Rush Royale"],
  "sausage-man": ["Sausage Man"],
  "state-of-survival": ["State of Survival: Zombie War"],
  "super-sus": ["Super Sus"],
  "tom-and-jerry-chase": ["Tom and Jerry Chase"],
  "war-robots": ["War Robots"],
  "watcher-of-realms": ["Watcher Of Realms"],
  "whiteout-survival": ["Whiteout Survival"],
  "call-of-duty-mobile": ["Call of Duty Mobile (Indonesia)"],
  "roblox": ["Roblox Via Login"],
  "zenless-zone-zero": ["Zenless Zone Zero (ZZZ)"],
  "honkai-star-rail": ["Honkai Star Rail"],
  "honor-of-kings": ["Honor of Kings Global"],
  "pubg-new-state": ["PUBG : New State Mobile"],
  "delta-force": ["Delta Force", "Delta Force (Garena)"],
  "lol-wild-rift": ["League of Legends", "League of Legends: Wild Rift"],
  "likee": ["Likee"],
  "lita": ["Lita"],
  "zepeto": ["Zepeto"],
  "garena-shell": ["Voucher Garena Shell"],
  "megaxus-voucher": ["Voucher Megaxus"],
  "pb-zepetto-voucher": ["Voucher PB Zepetto"],
  "psn-voucher": ["Voucher PSN"],
  "razer-gold": ["Voucher Razer Gold"],
};

function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function firstNumber(name: string): number | undefined {
  const m = name.match(/\d+/);
  return m ? parseInt(m[0], 10) : undefined;
}

interface VipayResponse {
  result?: boolean;
  message?: string;
  data?: unknown;
}

async function request(type: string, params: Record<string, string | number>): Promise<VipayResponse> {
  const { baseUrl, apiId, apiKey } = getVipaymentConfig();
  const res = await fetch(baseUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      key: apiKey,
      sign: md5(`${apiId}${apiKey}`),
      type,
      ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])),
    }),
    cache: "no-store",
  });
  const text = await res.text();
  let json: VipayResponse = {};
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    // ignore
  }
  return json;
}

export interface VipayNicknameResult {
  ok: boolean;
  nickname?: string;
  country?: { code: string; name: string };
  message?: string;
}

export async function getVipaymentNickname(params: {
  code: string;
  userId: string;
  zoneId?: string;
}): Promise<VipayNicknameResult> {
  const res = await request("get-nickname", {
    code: params.code,
    target: params.userId,
    additional_target: params.zoneId || "",
  });
  if (res.result === true && typeof res.data === "string") {
    return {
      ok: true,
      nickname: res.data,
      country: (res as unknown as { country?: { code: string; name: string } }).country,
      message: res.message,
    };
  }
  return { ok: false, message: res.message || "Gagal mendapatkan nickname" };
}

export interface VipayOrderResult {
  ok: boolean;
  trxid?: string;
  message?: string;
  status?: string;
  note?: string;
  balance?: number;
  price?: number;
}

export async function createVipaymentOrder(params: {
  service: string;
  userId: string;
  zoneId?: string;
}): Promise<VipayOrderResult> {
  const res = await request("order", {
    service: params.service,
    data_no: params.userId,
    data_zone: params.zoneId || "",
  });
  const data = res.data as
    | { trxid?: string; status?: string; note?: string; balance?: number; price?: number }
    | undefined;
  if (res.result === true && data?.trxid) {
    return {
      ok: true,
      trxid: data.trxid,
      message: res.message,
      status: data.status,
      note: data.note,
      balance: data.balance,
      price: data.price,
    };
  }
  return { ok: false, message: res.message || "Pesanan gagal dibuat" };
}

export interface VipayStatusResult {
  ok: boolean;
  status?: string;
  note?: string;
  trxid?: string;
  message?: string;
}

export async function checkVipaymentOrderStatus(trxid: string): Promise<VipayStatusResult> {
  const res = await request("status", { trxid });
  const data = Array.isArray(res.data) ? (res.data as Array<Record<string, unknown>>) : [];
  const item = data[0] || {};
  if (res.result === true && data.length > 0) {
    return {
      ok: true,
      status: typeof item.status === "string" ? item.status : undefined,
      note: typeof item.note === "string" ? item.note : undefined,
      trxid: typeof item.trxid === "string" ? item.trxid : undefined,
      message: res.message,
    };
  }
  return { ok: false, message: res.message || "Gagal mendapatkan status" };
}

export interface VipayService {
  code: string;
  game: string;
  name: string;
  status: string;
  server?: string;
}

export async function fetchVipaymentServices(filterGame?: string): Promise<VipayService[]> {
  const res = await request("services", {
    ...(filterGame ? { filter_game: filterGame } : {}),
  });
  if (res.result === true && Array.isArray(res.data)) {
    return res.data as VipayService[];
  }
  return [];
}

export async function resolveVipaymentService(
  gameSlug: string,
  itemName: string
): Promise<{ code?: string; serviceName?: string }> {
  const games = VIPAYMENT_GAME_NAMES[gameSlug];
  if (!games || games.length === 0) return {};

  const target = normalizeName(itemName);
  const targetNum = firstNumber(itemName);

  const score = (s: VipayService): number => {
    const sn = normalizeName(s.name);
    if (sn === target) return 0;
    if (sn.includes(target)) return 1;
    if (target.includes(sn)) {
      // Cegah salah ambil: "140 Diamonds" jgn terjebak ke "40 Diamonds"
      const snNum = firstNumber(s.name);
      if (targetNum !== undefined && snNum !== undefined && snNum !== targetNum) {
        return -1;
      }
      return 2;
    }
    // Match angka saja (contoh: item "475 Valorant Points" vs layanan "475 Points")
    if (targetNum !== undefined) {
      const snNum = firstNumber(s.name);
      if (snNum === targetNum) return 3;
    }
    return -1;
  };

  const ranked: { s: VipayService; score: number }[] = [];
  for (const game of games) {
    const services = await fetchVipaymentServices(game);
    for (const s of services) {
      const sc = score(s);
      if (sc >= 0) ranked.push({ s, score: sc });
    }
  }

  ranked.sort((a, b) => a.score - b.score);
  const available = ranked.find((r) => r.s.status === "available");
  const best = available || ranked[0];
  if (!best) return {};
  return { code: best.s.code, serviceName: `${best.s.game} - ${best.s.name}` };
}

// Pack/unpack tracking data VIPayment ke field `notes` transaksi
export function packVipaymentNotes(notes: string | null | undefined, extra: Record<string, unknown>): string {
  let parsed: Record<string, unknown> = {};
  if (notes) {
    try {
      parsed = JSON.parse(notes);
    } catch {
      parsed = { note: notes };
    }
  }
  return JSON.stringify({ ...parsed, ...extra });
}

export function extractVipaymentTrxId(notes: string | null | undefined): string | undefined {
  if (!notes) return undefined;
  try {
    const parsed = JSON.parse(notes);
    return parsed.trxid;
  } catch {
    return undefined;
  }
}