"use client"

import { useState } from "react"
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

// Mock data for demonstration
const analyticsData = {
  totalDiplomas: 52847,
  totalUsers: 8934,
  activeUsers: 1247,
  templatesUploaded: 342,
  monthlyGrowth: 23.5,
  conversionRate: 12.8,
}

const chartData = [
  { name: "Jan", diplomas: 2400, users: 400 },
  { name: "Feb", diplomas: 1398, users: 300 },
  { name: "Mar", diplomas: 9800, users: 600 },
  { name: "Apr", diplomas: 3908, users: 480 },
  { name: "May", diplomas: 4800, users: 520 },
  { name: "Jun", diplomas: 3800, users: 450 },
]

const templateData = [
  { name: "Education", value: 45, color: "#059669" },
  { name: "Awards", value: 25, color: "#10b981" },
  { name: "Training", value: 20, color: "#34d399" },
  { name: "Corporate", value: 10, color: "#6ee7b7" },
]

const pendingTemplates = [
  {
    id: 1,
    name: "Modern University Diploma",
    uploader: "john.doe@email.com",
    uploadDate: "2024-01-15",
    category: "Education",
    status: "pending",
    downloads: 0,
  },
  {
    id: 2,
    name: "Corporate Training Certificate",
    uploader: "jane.smith@company.com",
    uploadDate: "2024-01-14",
    category: "Training",
    status: "pending",
    downloads: 0,
  },
  {
    id: 3,
    name: "Achievement Award Template",
    uploader: "mike.wilson@school.edu",
    uploadDate: "2024-01-13",
    category: "Awards",
    status: "pending",
    downloads: 0,
  },
]

const recentUsers = [
  {
    id: 1,
    email: "user1@example.com",
    joinDate: "2024-01-15",
    diplomasGenerated: 5,
    lastActive: "2024-01-15",
    status: "active",
  },
  {
    id: 2,
    email: "user2@example.com",
    joinDate: "2024-01-14",
    diplomasGenerated: 12,
    lastActive: "2024-01-14",
    status: "active",
  },
  {
    id: 3,
    email: "user3@example.com",
    joinDate: "2024-01-13",
    diplomasGenerated: 3,
    lastActive: "2024-01-13",
    status: "inactive",
  },
]

export function AdminDashboard() {
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null)
  const [adSettings, setAdSettings] = useState({
    enabled: true,
    headerAd: true,
    sidebarAd: true,
    footerAd: false,
  })

  const approveTemplate = (id: number) => {
    console.log("Approving template:", id)
    // Handle template approval
  }

  const rejectTemplate = (id: number) => {
    console.log("Rejecting template:", id)
    // Handle template rejection
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
                <div className="text-2xl font-bold">{analyticsData.totalDiplomas.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">+{analyticsData.monthlyGrowth}% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.totalUsers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">+12% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.activeUsers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">+8% from last week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Templates</CardTitle>
                <Download className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.templatesUploaded}</div>
                <p className="text-xs text-muted-foreground">+5 pending approval</p>
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
                    <p className="text-xs text-muted-foreground">Modern Certificate by jane.doe@email.com</p>
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
                      <TableCell>{template.uploader}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{template.category}</Badge>
                      </TableCell>
                      <TableCell>{template.uploadDate}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{template.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => approveTemplate(template.id)}>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Approve
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => rejectTemplate(template.id)}>
                            <XCircle className="h-3 w-3 mr-1" />
                            Reject
                          </Button>
                          <Button size="sm" variant="ghost">
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
                  {recentUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.email}</TableCell>
                      <TableCell>{user.joinDate}</TableCell>
                      <TableCell>{user.diplomasGenerated}</TableCell>
                      <TableCell>{user.lastActive}</TableCell>
                      <TableCell>
                        <Badge variant={user.status === "active" ? "default" : "secondary"}>{user.status}</Badge>
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
                  ))}
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
    </div>
  )
}
