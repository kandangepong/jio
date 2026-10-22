/**
 * Jio-Farm API Client for Vercel/Netlify Dashboard
 */

function getApiBase(): string {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('jio_api_url');
    if (saved) return saved.replace(/\/+$/, '');
  }
  const envUrl = import.meta.env.VITE_JIO_API_URL;
  if (envUrl) return envUrl.replace(/\/+$/, '');
  return 'https://sensitive-affiliates-winds-grey.trycloudflare.com';
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
  id?: string;
  project_id: string;
  api_key?: string;
  status: string;
  last_seen?: string;
  device_count?: number;
  error?: string;
}

export interface JioLink {
  id: number;
  phone_number: string;
  claim_url: string;
  harvested_at: string;
  claimed: boolean;
  claimed_at?: string;
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
    return Array.isArray(data) ? data : data.panels || [];
  },

  async getLinks(): Promise<JioLink[]> {
    const res = await fetch(`${getApiBase()}/api/links`);
    if (!res.ok) throw new Error(`Failed to fetch links: ${res.statusText}`);
    const data = await res.json();
    return Array.isArray(data) ? data : data.links || [];
  },

  async claimLink(linkId: number): Promise<void> {
    const res = await fetch(`${getApiBase()}/api/links/claim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: linkId }),
    });
    if (!res.ok) throw new Error(`Failed to claim link: ${res.statusText}`);
  },

  async getLogs(): Promise<string[]> {
    const res = await fetch(`${getApiBase()}/api/logs`);
    if (!res.ok) throw new Error(`Failed to fetch logs: ${res.statusText}`);
    const data = await res.json();
    return Array.isArray(data) ? data : data.logs || [];
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
