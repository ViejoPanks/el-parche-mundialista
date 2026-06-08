/**
 * Cliente para API-Football (v3).
 * Toda la comunicación con la API externa pasa por aquí.
 *
 * La API key vive SOLO en el servidor (process.env.API_FOOTBALL_KEY).
 * Nunca se expone al navegador.
 */

const API_BASE = 'https://v3.football.api-sports.io';
const WORLD_CUP_LEAGUE_ID = 1;
const SEASON = 2026;

interface ApiFixture {
  fixture: {
    id: number;
    date: string;
    status: {
      short: string; // 'NS' (not started), 'FT' (full time), '1H', '2H', etc.
      long: string;
    };
  };
  teams: {
    home: { id: number; name: string };
    away: { id: number; name: string };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
  score: {
    penalty: {
      home: number | null;
      away: number | null;
    };
  };
}

function getApiKey(): string {
  const key = process.env.API_FOOTBALL_KEY;
  if (!key) {
    throw new Error('API_FOOTBALL_KEY no está configurada');
  }
  return key;
}

async function apiFetch(endpoint: string): Promise<any> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'x-apisports-key': getApiKey(),
    },
    // No cachear: queremos datos frescos
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`API-Football error: ${response.status}`);
  }

  const data = await response.json();

  // API-Football devuelve errores en el body, no en el status HTTP
  if (data.errors && Object.keys(data.errors).length > 0) {
    throw new Error(`API-Football: ${JSON.stringify(data.errors)}`);
  }

  return data;
}

/**
 * Trae todos los fixtures del Mundial 2026.
 */
export async function fetchAllWorldCupFixtures(): Promise<ApiFixture[]> {
  const data = await apiFetch(
    `/fixtures?league=${WORLD_CUP_LEAGUE_ID}&season=${SEASON}`
  );
  return data.response as ApiFixture[];
}

/**
 * Trae solo los fixtures que ya terminaron (status FT, AET, PEN).
 */
export async function fetchFinishedFixtures(): Promise<ApiFixture[]> {
  const all = await fetchAllWorldCupFixtures();
  const finishedStatuses = ['FT', 'AET', 'PEN'];
  return all.filter((f) => finishedStatuses.includes(f.fixture.status.short));
}

/**
 * Determina si un fixture incluye penales (para "quién pasa de fase").
 * Devuelve el ID del equipo que ganó en penales, o null.
 */
export function getPenaltyWinner(fixture: ApiFixture): number | null {
  const { home, away } = fixture.score.penalty;
  if (home === null || away === null) return null;
  if (home > away) return fixture.teams.home.id;
  if (away > home) return fixture.teams.away.id;
  return null;
}

export type { ApiFixture };
