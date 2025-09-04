"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import {
  Users,
  FileText,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Settings,
  Activity,
  Filter,
} from "lucide-react"

interface Statistics {
  totalDiplomas: number
  totalUsers: number
  totalTemplates: number
  approvedTemplates: number
  pendingTemplates: number
  activeVisitors: number
  monthlyGrowth: number
  templateCategories: Array<{ category: string; _count: { category: number } }>
  topTemplates: Array<{
    id: string
    name: string
    uses: number
    generatedDiplomas: number
    category: string
  }>
  recentActivity: Array<{
    id: string
    count: number
    createdAt: string
    user: { email: string }
    template: { name: string }
  }>
}

interface Template {
  id: string
  name: string
  uploader?: string
  uploaderUser?: { email: string }
  category: string
  createdAt: string
  approved: boolean
  uses: number
}

interface User {
  id: string
  email: string
  signedUpAt: string
  diplomasCreated: number
  lastActive: string
  generationSessions: Array<{
    count: number
    createdAt: string
    template: { name: string; image: string }
  }>
  templatesUsed: Array<{
    template: { name: string; image: string }
  }>
  uploadedTemplates: Array<{
    id: string
    name: string
    approved: boolean
    createdAt: string
  }>
}

// Default chart data for when we don't have enough historical data
const defaultChartData = [
  { name: "Jan", diplomas: 0, users: 0 },
  { name: "Feb", diplomas: 0, users: 0 },
  { name: "Mar", diplomas: 0, users: 0 },
  { name: "Apr", diplomas: 0, users: 0 },
  { name: "May", diplomas: 0, users: 0 },
  { name: "Jun", diplomas: 0, users: 0 },
]

export function AdminDashboard() {
  const [statistics, setStatistics] = useState<Statistics | null>(null)
  const [pendingTemplates, setPendingTemplates] = useState<Template[]>([])
  const [allTemplates, setAllTemplates] = useState<any[]>([])
  const [recentUsers, setRecentUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [adSettings, setAdSettings] = useState({
    enabled: true,
    headerAd: true,
    sidebarAd: true,
    footerAd: false,
  })

  // Fetch statistics and data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch statistics
        const statsRes = await fetch('/api/statistics')
        if (statsRes.ok) {
          const statsData = await statsRes.json()
          setStatistics(statsData)
        }

        // Fetch pending templates
        const templatesRes = await fetch('/api/templates?approved=false')
        if (templatesRes.ok) {
          const templatesData = await templatesRes.json()
          setPendingTemplates(templatesData.templates || [])
        }

        // Fetch all templates
        const allRes = await fetch('/api/templates')
        if (allRes.ok) {
          const allData = await allRes.json()
          setAllTemplates(allData.templates || [])
        }

        // Fetch recent users
        const usersRes = await fetch('/api/users?limit=10')
        if (usersRes.ok) {
          const usersData = await usersRes.json()
          setRecentUsers(usersData.users || [])
        }

      } catch (err) {
        setError('Failed to load dashboard data')
        console.error('Dashboard error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const approveTemplate = async (templateId: string, approved: boolean) => {
    try {
      const res = await fetch('/api/templates/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId, approved })
      })

      if (res.ok) {
        // Remove from pending list
        setPendingTemplates(prev => prev.filter(t => t.id !== templateId))
        
        // Refresh statistics
        const statsRes = await fetch('/api/statistics')
        if (statsRes.ok) {
          const statsData = await statsRes.json()
          setStatistics(statsData)
        }
      } else {
        throw new Error('Failed to approve template')
      }
    } catch (err) {
      console.error('Error approving template:', err)
      setError('Failed to approve template')
    }
  }

  const rejectTemplate = async (templateId: string) => {
    try {
      const res = await fetch('/api/templates/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId, approved: false })
      })
      if (!res.ok) throw new Error('Failed to reject template')
      setPendingTemplates(prev => prev.filter(t => t.id !== templateId))
      const statsRes = await fetch('/api/statistics')
      if (statsRes.ok) setStatistics(await statsRes.json())
    } catch (err) {
      console.error('Reject error:', err)
      setError('Failed to reject template')
    }
  }

  const deleteTemplate = async (templateId: string) => {
    try {
      const res = await fetch('/api/templates/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId })
      })
      if (!res.ok) throw new Error('Failed to delete template')
      setAllTemplates(prev => prev.filter(t => t.id !== templateId))
    } catch (err) {
      console.error('Delete error:', err)
      setError('Failed to delete template')
    }
  }

  const addTemplate = async (tpl: { name: string; image: string; description?: string; category?: string }) => {
    try {
      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: tpl.name,
          image: tpl.image,
          description: tpl.description || '',
          category: tpl.category || 'other',
          source: 'admin',
          autoApprove: true
        })
      })
      if (!res.ok) throw new Error('Failed to add template')
      const data = await res.json()
      setAllTemplates(prev => [data.template, ...prev])
    } catch (err) {
      console.error('Add template error:', err)
      setError('Failed to add template')
    }
  }

  // Prepare chart data
  const chartData = defaultChartData // For now, use default data
  
  // Prepare template categories data for pie chart
  const templateData = statistics?.templateCategories?.map((cat, index) => ({
    name: cat.category,
    value: cat._count.category,
    color: ['#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0'][index % 5]
  })) || []

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading dashboard...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-serif text-foreground mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage your diploma generator platform</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="ads">Ads</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Diplomas</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statistics?.totalDiplomas?.toLocaleString() || '0'}</div>
                <p className="text-xs text-muted-foreground">+{statistics?.monthlyGrowth?.toFixed(1) || '0'}% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statistics?.totalUsers?.toLocaleString() || '0'}</div>
                <p className="text-xs text-muted-foreground">+12% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Visitors</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statistics?.activeVisitors?.toLocaleString() || '0'}</div>
                <p className="text-xs text-muted-foreground">Currently online</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Templates</CardTitle>
                <Download className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statistics?.approvedTemplates || 0}</div>
                <p className="text-xs text-muted-foreground">{statistics?.pendingTemplates || 0} pending approval</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-serif">Monthly Activity</CardTitle>
                <CardDescription>Diplomas generated and user registrations</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="diplomas" fill="#059669" />
                    <Bar dataKey="users" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-serif">Template Categories</CardTitle>
                <CardDescription>Distribution of template types</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={templateData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {templateData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-serif">Recent Activity</CardTitle>
              <CardDescription>Latest platform activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">New template approved</p>
                    <p className="text-xs text-muted-foreground">Modern Certificate by dill.doe@email.com</p>
                  </div>
                  <Badge variant="outline">2 hours ago</Badge>
                </div>
                <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
                  <Users className="h-5 w-5 text-blue-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">25 new user registrations</p>
                    <p className="text-xs text-muted-foreground">Daily signup milestone reached</p>
                  </div>
                  <Badge variant="outline">4 hours ago</Badge>
                </div>
                <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
                  <FileText className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">1,000 diplomas generated today</p>
                    <p className="text-xs text-muted-foreground">New daily record</p>
                  </div>
                  <Badge variant="outline">6 hours ago</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold font-serif">Template Management</h2>
              <p className="text-muted-foreground">Review and manage user-uploaded templates</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pending Approval ({pendingTemplates.length})</CardTitle>
              <CardDescription>Templates waiting for admin review</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Template Name</TableHead>
                    <TableHead>Uploader</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Upload Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingTemplates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell className="font-medium">{template.name}</TableCell>
                      <TableCell>{template.uploaderUser?.email || template.uploader || 'Unknown'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{template.category}</Badge>
                      </TableCell>
                      <TableCell>{new Date(template.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">pending</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => approveTemplate(template.id, true)}>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Approve
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => rejectTemplate(template.id)}>
                            <XCircle className="h-3 w-3 mr-1" />
                            Reject
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setSelectedTemplate(template.id)}>
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* All Templates Management */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">All Templates ({allTemplates.length})</CardTitle>
              <CardDescription>Add or remove templates without approval</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Preview</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allTemplates.map((tpl) => (
                      <TableRow key={tpl.id}>
                        <TableCell>
                          <img src={tpl.image || '/placeholder.svg'} alt={tpl.name} className="h-10 w-16 object-cover rounded" />
                        </TableCell>
                        <TableCell className="font-medium">{tpl.name}</TableCell>
                        <TableCell><Badge variant="outline">{tpl.category}</Badge></TableCell>
                        <TableCell>
                          <Badge variant={tpl.approved ? 'default' : 'secondary'}>{tpl.approved ? 'approved' : 'pending'}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => deleteTemplate(tpl.id)}>Remove</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {/* Simple Add Template Form */}
              <div className="mt-4 flex gap-2">
                <Input placeholder="Template name" id="tpl-name" className="w-48" />
                <Input placeholder="Image URL" id="tpl-img" className="flex-1" />
                <Button size="sm" onClick={() => {
                  const nameEl = document.getElementById('tpl-name') as HTMLInputElement
                  const imgEl = document.getElementById('tpl-img') as HTMLInputElement
                  if (nameEl?.value && imgEl?.value) {
                    addTemplate({ name: nameEl.value, image: imgEl.value })
                    nameEl.value = ''
                    imgEl.value = ''
                  }
                }}>Add Template</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold font-serif">User Management</h2>
              <p className="text-muted-foreground">Monitor and manage platform users</p>
            </div>
            <div className="flex gap-2">
              <Input placeholder="Search users..." className="w-64" />
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Active Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">1,247</div>
                <p className="text-xs text-muted-foreground">Last 30 days</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">New Signups</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">156</div>
                <p className="text-xs text-muted-foreground">This week</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Avg. Diplomas/User</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">5.9</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Users</CardTitle>
              <CardDescription>Latest user registrations and activity</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead>Diplomas Generated</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentUsers.map((user) => {
                    const isActive = new Date(user.lastActive) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                    return (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.email}</TableCell>
                        <TableCell>{new Date(user.signedUpAt).toLocaleDateString()}</TableCell>
                        <TableCell>{user.diplomasCreated}</TableCell>
                        <TableCell>{new Date(user.lastActive).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant={isActive ? "default" : "secondary"}>
                            {isActive ? "active" : "inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost">
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Settings className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ads" className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold font-serif">Advertisement Management</h2>
            <p className="text-muted-foreground">Configure ad placements and settings</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ad Revenue</CardTitle>
                <CardDescription>Monthly advertising income</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600 mb-2">$2,847</div>
                <p className="text-sm text-muted-foreground">+15% from last month</p>
                <div className="mt-4">
                  <ResponsiveContainer width="100%" height={150}>
                    <LineChart data={chartData}>
                      <Line type="monotone" dataKey="diplomas" stroke="#059669" strokeWidth={2} />
                      <XAxis dataKey="name" hide />
                      <YAxis hide />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ad Performance</CardTitle>
                <CardDescription>Click-through rates and impressions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Header Ads</span>
                  <div className="text-right">
                    <div className="text-sm font-medium">2.3% CTR</div>
                    <div className="text-xs text-muted-foreground">45,230 impressions</div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Sidebar Ads</span>
                  <div className="text-right">
                    <div className="text-sm font-medium">1.8% CTR</div>
                    <div className="text-xs text-muted-foreground">32,150 impressions</div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Footer Ads</span>
                  <div className="text-right">
                    <div className="text-sm font-medium">0.9% CTR</div>
                    <div className="text-xs text-muted-foreground">18,420 impressions</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ad Placement Settings</CardTitle>
              <CardDescription>Configure where ads appear on the platform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Enable Advertisements</Label>
                  <p className="text-xs text-muted-foreground">Master switch for all ad placements</p>
                </div>
                <Switch
                  checked={adSettings.enabled}
                  onCheckedChange={(checked) => setAdSettings({ ...adSettings, enabled: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Header Banner</Label>
                  <p className="text-xs text-muted-foreground">Display ads in the header section</p>
                </div>
                <Switch
                  checked={adSettings.headerAd}
                  onCheckedChange={(checked) => setAdSettings({ ...adSettings, headerAd: checked })}
                  disabled={!adSettings.enabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Sidebar Ads</Label>
                  <p className="text-xs text-muted-foreground">Show ads in template gallery sidebar</p>
                </div>
                <Switch
                  checked={adSettings.sidebarAd}
                  onCheckedChange={(checked) => setAdSettings({ ...adSettings, sidebarAd: checked })}
                  disabled={!adSettings.enabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Footer Ads</Label>
                  <p className="text-xs text-muted-foreground">Display ads in the footer area</p>
                </div>
                <Switch
                  checked={adSettings.footerAd}
                  onCheckedChange={(checked) => setAdSettings({ ...adSettings, footerAd: checked })}
                  disabled={!adSettings.enabled}
                />
              </div>

              <Button className="w-full">Save Ad Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold font-serif">Platform Settings</h2>
            <p className="text-muted-foreground">Configure global platform settings</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">General Settings</CardTitle>
                <CardDescription>Basic platform configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm">Platform Name</Label>
                  <Input defaultValue="DiplomaGen" className="mt-1" />
                </div>
                <div>
                  <Label className="text-sm">Support Email</Label>
                  <Input defaultValue="support@diplomagen.com" className="mt-1" />
                </div>
                <div>
                  <Label className="text-sm">Max File Size (MB)</Label>
                  <Input type="number" defaultValue="10" className="mt-1" />
                </div>
                <div>
                  <Label className="text-sm">Maintenance Mode</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Switch />
                    <span className="text-xs text-muted-foreground">Enable maintenance mode</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Security Settings</CardTitle>
                <CardDescription>Platform security configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm">Rate Limiting</Label>
                  <Select defaultValue="moderate">
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low (100 req/min)</SelectItem>
                      <SelectItem value="moderate">Moderate (50 req/min)</SelectItem>
                      <SelectItem value="strict">Strict (20 req/min)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm">Auto-approve Templates</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Switch />
                    <span className="text-xs text-muted-foreground">Automatically approve user templates</span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm">Content Moderation</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Switch defaultChecked />
                    <span className="text-xs text-muted-foreground">Enable content filtering</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Notification Settings</CardTitle>
              <CardDescription>Configure admin notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm">Admin Email</Label>
                <Input defaultValue="admin@diplomagen.com" className="mt-1" />
              </div>
              <div>
                <Label className="text-sm">Notification Preferences</Label>
                <div className="space-y-2 mt-2">
                  <div className="flex items-center space-x-2">
                    <Switch defaultChecked />
                    <span className="text-xs">New template uploads</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch defaultChecked />
                    <span className="text-xs">User registrations</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch />
                    <span className="text-xs">System errors</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch />
                    <span className="text-xs">Daily reports</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Changes to platform settings may require a restart to take effect. Please test thoroughly before applying
              to production.
            </AlertDescription>
          </Alert>

          <div className="flex gap-3">
            <Button>Save Settings</Button>
            <Button variant="outline">Reset to Defaults</Button>
          </div>
        </TabsContent>
      </Tabs>
    {/* Template Preview Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedTemplate(null)}>
          <div className="bg-background rounded-lg max-w-3xl w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Template Preview</h3>
              <Button variant="ghost" size="sm" onClick={() => setSelectedTemplate(null)}>Close</Button>
            </div>
            <div className="p-4">
              {(() => {
                const tpl = pendingTemplates.find(t => t.id === selectedTemplate) || allTemplates.find((t: any) => t.id === selectedTemplate)
                if (!tpl) return <div className="text-sm text-muted-foreground">Template not found.</div>
                return (
                  <div className="space-y-3">
                    <img src={(tpl as any).image || '/placeholder.svg'} alt={(tpl as any).name} className="w-full h-auto rounded" />
                    <div className="text-sm text-muted-foreground">{(tpl as any).name} • {(tpl as any).category}</div>
                    <div className="flex gap-2">
                      {!(tpl as any).approved && (
                        <>
                          <Button size="sm" onClick={() => approveTemplate((tpl as any).id, true)}>
                            Approve
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => rejectTemplate((tpl as any).id)}>
                            Reject
                          </Button>
                        </>
                      )}
                      <Button size="sm" variant="outline" onClick={() => deleteTemplate((tpl as any).id)}>
                        Remove
                      </Button>
                    </div>
                  </div>
                )
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
