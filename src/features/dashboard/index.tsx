import { useEffect, useState, useRef } from 'react'
import {
  Play,
  Square,
  RefreshCw,
  Terminal,
  Link as LinkIcon,
  Server,
  Layers,
  Copy,
  Check,
  ExternalLink,
  Shield,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ThemeSwitch } from '@/components/theme-switch'
import { jioApi, type JioStats, type JioPanel, type JioLink } from '@/lib/jio-api'

export function Dashboard() {
  const [stats, setStats] = useState<JioStats | null>(null)
  const [panels, setPanels] = useState<JioPanel[]>([])
  const [links, setLinks] = useState<JioLink[]>([])
  const [logs, setLogs] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<number | null>(null)
  const DEFAULT_TUNNEL = 'https://sensitive-affiliates-winds-grey.trycloudflare.com'
  const [apiUrl, setApiUrl] = useState(() => {
    const saved = localStorage.getItem('jio_api_url')
    if (saved && saved.length >= 10 && saved.includes('http')) return saved
    return import.meta.env.VITE_JIO_API_URL || DEFAULT_TUNNEL
  })
  const [autoRefresh, setAutoRefresh] = useState(true)
  const logBottomRef = useRef<HTMLDivElement>(null)

  const handleSaveApiUrl = (url: string) => {
    setApiUrl(url)
    localStorage.setItem('jio_api_url', url)
  }

  const handleResetApiUrl = () => {
    localStorage.removeItem('jio_api_url')
    setApiUrl(DEFAULT_TUNNEL)
    setTimeout(() => loadAllData(), 100)
  }

  const loadAllData = async () => {
    try {
      setLoading(true)
      const [sData, pData, lData, logsData] = await Promise.allSettled([
        jioApi.getStats(),
        jioApi.getPanels(),
        jioApi.getLinks(),
        jioApi.getLogs(),
      ])

      if (sData.status === 'fulfilled') setStats(sData.value)
      if (pData.status === 'fulfilled') setPanels(pData.value)
      if (lData.status === 'fulfilled') setLinks(lData.value)
      if (logsData.status === 'fulfilled') setLogs(logsData.value)
    } catch (err) {
      console.error('Failed to load Jio data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAllData()
    if (!autoRefresh) return

    const interval = setInterval(() => {
      loadAllData()
    }, 5000)

    return () => clearInterval(interval)
  }, [autoRefresh])

  const handleControl = async (endpoint: string) => {
    try {
      await jioApi.triggerControl(endpoint)
      await loadAllData()
    } catch (err) {
      alert(`Action error: ${err}`)
    }
  }

  const handleClaim = async (id: number) => {
    try {
      await jioApi.claimLink(id)
      await loadAllData()
    } catch (err) {
      alert(`Claim failed: ${err}`)
    }
  }

  const copyToClipboard = (text: string, id: number) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <>
      <Header>
        <div className='flex items-center gap-2 font-bold text-lg'>
          <Shield className='h-5 w-5 text-primary' />
          <span>Jio-Farm Cloud Console</span>
        </div>
        <div className='ml-auto flex items-center space-x-3'>
          <div className='flex items-center gap-1.5'>
            <Input
              value={apiUrl}
              onChange={(e) => handleSaveApiUrl(e.target.value)}
              placeholder='Backend API URL'
              className='h-8 w-72 text-xs font-mono'
            />
            <Button
              variant='ghost'
              size='sm'
              className='h-8 text-xs px-2'
              onClick={handleResetApiUrl}
              title='Reset to default Cloudflare Tunnel'
            >
              Reset
            </Button>
          </div>
          <Button
            variant={autoRefresh ? 'default' : 'outline'}
            size='sm'
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            Auto: {autoRefresh ? 'ON' : 'OFF'}
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => loadAllData()}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <ThemeSwitch />
        </div>
      </Header>

      <Main className='space-y-6'>
        {/* Top Control Bar */}
        <Card className='border-primary/20 bg-card/60 backdrop-blur'>
          <CardHeader className='pb-3'>
            <div className='flex items-center justify-between'>
              <div>
                <CardTitle className='text-base font-semibold'>Cluster Controls</CardTitle>
                <CardDescription>Start, stop, and rescan automation workers</CardDescription>
              </div>
              <div className='flex items-center gap-2'>
                <Button
                  size='sm'
                  variant={stats?.hunter_running ? 'destructive' : 'default'}
                  onClick={() => handleControl(stats?.hunter_running ? 'hunter/stop' : 'hunter/start')}
                >
                  {stats?.hunter_running ? <Square className='h-3.5 w-3.5 mr-1' /> : <Play className='h-3.5 w-3.5 mr-1' />}
                  Hunter ({stats?.hunter_running ? 'Active' : 'Stopped'})
                </Button>

                <Button
                  size='sm'
                  variant={stats?.farm_running ? 'destructive' : 'default'}
                  onClick={() => handleControl(stats?.farm_running ? 'farm/stop' : 'farm/start')}
                >
                  {stats?.farm_running ? <Square className='h-3.5 w-3.5 mr-1' /> : <Play className='h-3.5 w-3.5 mr-1' />}
                  Farm ({stats?.farm_running ? 'Active' : 'Stopped'})
                </Button>

                <Button
                  size='sm'
                  variant='outline'
                  onClick={() => handleControl('rescan')}
                >
                  <RefreshCw className='h-3.5 w-3.5 mr-1' />
                  Rescan
                </Button>

                <Button
                  size='sm'
                  variant='outline'
                  onClick={() => handleControl('reload_config')}
                >
                  Reload Config
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Telemetry Metrics */}
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Active Panels</CardTitle>
              <Server className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{stats?.active_panels_count ?? panels.length}</div>
              <p className='text-xs text-muted-foreground'>Total scanned Firebase endpoints</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Active Jio Numbers</CardTitle>
              <Layers className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{stats?.active_devices_count ?? 0}</div>
              <p className='text-xs text-muted-foreground'>Verified OTP targets</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Ready Claim Links</CardTitle>
              <LinkIcon className='h-4 w-4 text-primary' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-primary'>
                {stats?.fresh_links_count ?? links.filter((l) => !l.claimed).length}
              </div>
              <p className='text-xs text-muted-foreground'>Gemini AI Pro activations</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Proxy Pool</CardTitle>
              <Shield className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{stats?.proxy_count ?? 0}</div>
              <p className='text-xs text-muted-foreground'>Rotated proxies alive</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Content */}
        <Tabs defaultValue='links' className='space-y-4'>
          <TabsList>
            <TabsTrigger value='links' className='gap-2'>
              <LinkIcon className='h-4 w-4' />
              Harvested Links ({links.length})
            </TabsTrigger>
            <TabsTrigger value='panels' className='gap-2'>
              <Server className='h-4 w-4' />
              Firebase Panels ({panels.length})
            </TabsTrigger>
            <TabsTrigger value='logs' className='gap-2'>
              <Terminal className='h-4 w-4' />
              Live Console
            </TabsTrigger>
          </TabsList>

          {/* Links Tab */}
          <TabsContent value='links' className='space-y-4'>
            <Card>
              <CardHeader className='pb-3'>
                <div className='flex items-center justify-between'>
                  <div>
                    <CardTitle className='text-lg'>Ready-to-Claim Gemini Links</CardTitle>
                    <CardDescription>Direct Google Gemini Pro subscription activation URLs</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {links.length === 0 ? (
                  <div className='py-8 text-center text-sm text-muted-foreground'>
                    Belum ada link yang dipanen. Pastikan Hunter dan Farm berjalan aktif.
                  </div>
                ) : (
                  <div className='overflow-x-auto'>
                    <table className='w-full text-left text-sm'>
                      <thead className='border-b text-xs font-medium uppercase text-muted-foreground'>
                        <tr>
                          <th className='py-3 px-2'>No. HP</th>
                          <th className='py-3 px-2'>Link Klaim</th>
                          <th className='py-3 px-2'>Status</th>
                          <th className='py-3 px-2 text-right'>Aksi</th>
                        </tr>
                      </thead>
                      <tbody className='divide-y'>
                        {links.map((item) => (
                          <tr key={item.id} className='hover:bg-muted/50'>
                            <td className='py-3 px-2 font-mono font-medium'>{item.phone_number}</td>
                            <td className='py-3 px-2 font-mono text-xs max-w-md truncate'>
                              <a
                                href={item.claim_url}
                                target='_blank'
                                rel='noreferrer'
                                className='hover:underline text-primary flex items-center gap-1'
                              >
                                {item.claim_url}
                                <ExternalLink className='h-3 w-3 inline' />
                              </a>
                            </td>
                            <td className='py-3 px-2'>
                              <Badge variant={item.claimed ? 'secondary' : 'default'}>
                                {item.claimed ? 'Claimed' : 'Ready'}
                              </Badge>
                            </td>
                            <td className='py-3 px-2 text-right space-x-2'>
                              <Button
                                size='sm'
                                variant='outline'
                                onClick={() => copyToClipboard(item.claim_url, item.id)}
                              >
                                {copiedId === item.id ? (
                                  <Check className='h-3.5 w-3.5 text-green-500 mr-1' />
                                ) : (
                                  <Copy className='h-3.5 w-3.5 mr-1' />
                                )}
                                Salin
                              </Button>
                              {!item.claimed && (
                                <Button
                                  size='sm'
                                  variant='default'
                                  onClick={() => handleClaim(item.id)}
                                >
                                  Claim
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Panels Tab */}
          <TabsContent value='panels' className='space-y-4'>
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>Firebase Inventory & Sessions</CardTitle>
                <CardDescription>Live active panel configurations and health</CardDescription>
              </CardHeader>
              <CardContent>
                {panels.length === 0 ? (
                  <div className='py-8 text-center text-sm text-muted-foreground'>
                    Tidak ada panel ditemukan.
                  </div>
                ) : (
                  <div className='overflow-x-auto'>
                    <table className='w-full text-left text-sm'>
                      <thead className='border-b text-xs font-medium uppercase text-muted-foreground'>
                        <tr>
                          <th className='py-3 px-2'>Project ID</th>
                          <th className='py-3 px-2'>Devices</th>
                          <th className='py-3 px-2'>Status</th>
                        </tr>
                      </thead>
                      <tbody className='divide-y'>
                        {panels.map((p, idx) => (
                          <tr key={idx} className='hover:bg-muted/50'>
                            <td className='py-3 px-2 font-mono'>{p.project_id}</td>
                            <td className='py-3 px-2'>{p.device_count ?? '-'}</td>
                            <td className='py-3 px-2'>
                              <Badge variant={p.status === 'active' ? 'default' : 'secondary'}>
                                {p.status || 'unknown'}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Live Console Tab */}
          <TabsContent value='logs' className='space-y-4'>
            <Card className='bg-zinc-950 text-zinc-100 font-mono text-xs border-zinc-800'>
              <CardHeader className='pb-2 border-b border-zinc-800 flex flex-row items-center justify-between'>
                <CardTitle className='text-sm text-zinc-300'>Live Terminal Output</CardTitle>
                <div className='flex items-center gap-2'>
                  <Button
                    size='sm'
                    variant='outline'
                    className='h-7 text-xs bg-zinc-900 border-zinc-700 hover:bg-zinc-800 text-zinc-200'
                    onClick={() => setLogs([])}
                  >
                    <Trash2 className='h-3 w-3 mr-1' /> Clear
                  </Button>
                </div>
              </CardHeader>
              <CardContent className='p-4'>
                <div className='h-96 overflow-y-auto space-y-1 select-text'>
                  {logs.length === 0 ? (
                    <div className='text-zinc-500'>Waiting for live logs from backend...</div>
                  ) : (
                    logs.map((line, idx) => (
                      <div key={idx} className='leading-relaxed break-all'>
                        {line}
                      </div>
                    ))
                  )}
                  <div ref={logBottomRef} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}
