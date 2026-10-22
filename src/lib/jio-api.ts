/**
 * Jio-Farm API Client for Vercel/Netlify Dashboard
 */

const DEFAULT_TUNNEL_URL = 'https://sensitive-affiliates-winds-grey.trycloudflare.com';

export function normalizeUrl(url: string | null | undefined): string {
  if (!url) return DEFAULT_TUNNEL_URL;
  let clean = url.trim().replace(/\/+$/, '');
  if (!clean || clean.length < 10) return DEFAULT_TUNNEL_URL;
  if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
    clean = 'https://' + clean;
  }
  return clean;
}

export function getApiBase(): string {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('jio_api_url');
    if (saved && saved.trim().length >= 10) {
      return normalizeUrl(saved);
    }
  }
  const envUrl = import.meta.env.VITE_JIO_API_URL;
  if (envUrl && envUrl.trim().length >= 10) {
    return normalizeUrl(envUrl);
  }
  return DEFAULT_TUNNEL_URL;
}

export interface JioStats {
  status?: string;
  uptime_seconds?: number;
  total_panels_count?: number;
  active_panels_count?: number;
  active_devices_count?: number;
  fresh_links_count?: number;
  claimed_links_count?: number;
  proxy_count?: number;
  hunter_running?: boolean;
  farm_running?: boolean;
  tracker_running?: boolean;
  last_hunter_run?: string;
  last_farm_run?: string;
  last_tracker_run?: string;
}

export interface JioPanel {
  id?: number | string;
  host: string;
  status: string;
  sms_node?: string;
  last_scanned_at?: string;
  total_device_count?: number;
  active_device_count?: number;
  dead_device_count?: number;
  priority_score?: number;
}

export interface JioLink {
  id: number;
  jio_number: string;
  link: string;
  type?: string;
  created_at?: string;
  claimed?: boolean;
}

export interface JioLogItem {
  ts?: number;
  time?: string;
  level?: string;
  name?: string;
  channel?: string;
  msg: string;
}

export const jioApi = {
  async getStats(): Promise<JioStats> {
    const res = await fetch(`${getApiBase()}/api/stats`);
    if (!res.ok) throw new Error(`Failed to fetch stats: ${res.statusText}`);
    return res.json();
  },

  async getPanels(): Promise<JioPanel[]> {
    const res = await fetch(`${getApiBase()}/api/panels`);
    if (!res.ok) throw new Error(`Failed to fetch panels: ${res.statusText}`);
    const data = await res.json();
    return Array.isArray(data) ? data : (data.panels || []);
  },

  async getLinks(): Promise<JioLink[]> {
    const res = await fetch(`${getApiBase()}/api/links`);
    if (!res.ok) throw new Error(`Failed to fetch links: ${res.statusText}`);
    const data = await res.json();
    return Array.isArray(data) ? data : (data.links || []);
  },

  async claimLink(linkId: number): Promise<void> {
    const res = await fetch(`${getApiBase()}/api/links/claim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: linkId }),
    });
    if (!res.ok) throw new Error(`Failed to claim link: ${res.statusText}`);
  },

  async getLogs(): Promise<JioLogItem[]> {
    const res = await fetch(`${getApiBase()}/api/logs`);
    if (!res.ok) throw new Error(`Failed to fetch logs: ${res.statusText}`);
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.map((item: any) => {
      if (typeof item === 'string') {
        return { msg: item };
      }
      return {
        ts: item.ts,
        time: item.time || '',
        level: item.level || 'INFO',
        name: item.name || '',
        channel: item.channel || '',
        msg: item.msg || '',
      };
    });
  },

  async triggerControl(endpoint: string): Promise<any> {
    const res = await fetch(`${getApiBase()}/api/control/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error(`Control action failed: ${res.statusText}`);
    return res.json();
  },
};
