import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  CheckSquare, 
  Zap, 
  AlertTriangle, 
  Clock, 
  Plus, 
  Calendar,
  FileText,
  BarChart3,
  Filter,
  Target
} from "lucide-react";
import { useProjectStore } from "@/stores/projectStore";
import { useState } from "react";

export function Dashboard() {
  const [selectedWorkstream, setSelectedWorkstream] = useState("all");
  
  const { capabilities, getCapabilitiesStats, getRecentActivity, getUpcomingDeliveries } = useProjectStore();
  const stats = getCapabilitiesStats();
  
  // Filter capabilities by workstream - actually use the filtered data
  const filteredCapabilities = selectedWorkstream === "all" 
    ? capabilities 
    : capabilities.filter(cap => cap.workstream === selectedWorkstream);
  
  // Update stats based on filtered capabilities
  const filteredStats = {
    total: filteredCapabilities.length,
    inProgress: filteredCapabilities.filter(c => c.status === 'In Progress').length,
    atRisk: filteredCapabilities.filter(c => c.status === 'At Risk').length,
    overdue: filteredCapabilities.filter(c => c.rag === 'Red').length,
    completed: filteredCapabilities.filter(c => c.status === 'Completed').length
  };
  
  const recentActivity = getRecentActivity();
  const upcomingDeliveries = getUpcomingDeliveries().filter(delivery => 
    selectedWorkstream === "all" || 
    filteredCapabilities.some(cap => cap.name.includes(delivery.name.split(' ')[0]))
  );

  const handleViewAllActivity = () => {
    const event = new CustomEvent('navigate', { detail: 'capabilities' });
    window.dispatchEvent(event);
  };

  const handleFullDeliveriesView = () => {
    const event = new CustomEvent('navigate', { detail: 'plans' });
    window.dispatchEvent(event);
  };

  const handleQuickAction = (action: string) => {
    const event = new CustomEvent('navigate', { detail: action });
    window.dispatchEvent(event);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive overview of IT transformation project status and key metrics
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Capabilities
            </CardTitle>
            <CheckSquare className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredStats.total}</div>
            <p className="text-xs text-green-600">
              {selectedWorkstream === "all" ? "+3 this week" : `${selectedWorkstream} workstream`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Deliveries
            </CardTitle>
            <Zap className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredStats.inProgress}</div>
            <p className="text-xs text-orange-600">{filteredStats.atRisk} at risk</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Overdue Milestones
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredStats.overdue}</div>
            <p className="text-xs text-red-600">Requires attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Project Health
            </CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                AMBER
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">Timeline concerns</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Activity</CardTitle>
              <Select defaultValue="7days">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 days</SelectItem>
                  <SelectItem value="30days">Last 30 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  activity.type === 'new' ? 'bg-green-500' :
                  activity.type === 'delayed' ? 'bg-orange-500' :
                  activity.type === 'updated' ? 'bg-blue-500' :
                  'bg-green-500'
                }`} />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">{activity.title}</p>
                  <p className="text-xs text-muted-foreground">{activity.description}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
            <Button variant="link" className="w-full text-primary p-0" onClick={handleViewAllActivity}>
              View all activity →
            </Button>
          </CardContent>
        </Card>

        {/* Upcoming Deliveries */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Upcoming Deliveries</CardTitle>
              <div className="flex items-center gap-2">
                <Select defaultValue="30days">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30days">Next 30 days</SelectItem>
                    <SelectItem value="60days">Next 60 days</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={handleFullDeliveriesView}>
                  Full View
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-xs text-muted-foreground border-b pb-2">
              <span>Mon 13</span>
              <span>Tue 14</span>
              <span>Wed 15</span>
              <span>Thu 16</span>
              <span>Fri 17</span>
              <span>Sat 18</span>
              <span>Sun 19</span>
            </div>
            
            {upcomingDeliveries.map((delivery, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-primary">{delivery.name}</span>
                </div>
                <div className="flex gap-1">
                  {delivery.timeline.map((item, i) => (
                    <div
                      key={i}
                      className={`h-4 rounded-sm flex-1 ${
                        item.phase === 'Development' ? 'bg-blue-500' :
                        item.phase === 'CST' ? 'bg-green-600' :
                        item.phase === 'UAT' ? 'bg-orange-500' :
                        item.phase === 'Design' ? 'bg-purple-500' :
                        'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <div className="text-xs text-muted-foreground">{delivery.phase}</div>
              </div>
            ))}

            <div className="flex flex-wrap gap-2 pt-4 border-t">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-gray-400 rounded-sm" />
                <span className="text-xs">Requirements</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-purple-500 rounded-sm" />
                <span className="text-xs">Design</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-500 rounded-sm" />
                <span className="text-xs">Development</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-600 rounded-sm" />
                <span className="text-xs">CST</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-orange-500 rounded-sm" />
                <span className="text-xs">UAT</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => handleQuickAction('capabilities')}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Capability
              <span className="ml-auto text-xs text-muted-foreground">
                Add capability to project
              </span>
            </Button>
            
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => handleQuickAction('plans')}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Create Plan
              <span className="ml-auto text-xs text-muted-foreground">
                Set delivery timeline
              </span>
            </Button>
            
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => handleQuickAction('milestones')}
            >
              <Target className="w-4 h-4 mr-2" />
              Milestones
              <span className="ml-auto text-xs text-muted-foreground">
                Configure project milestones
              </span>
            </Button>
            

            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium mb-2">Filter by Workstream</h4>
              <Select value={selectedWorkstream} onValueChange={setSelectedWorkstream}>
                <SelectTrigger>
                  <SelectValue placeholder="All Workstreams" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Workstreams</SelectItem>
                  <SelectItem value="Frontend Development">Frontend Development</SelectItem>
                  <SelectItem value="Backend Services">Backend Services</SelectItem>
                  <SelectItem value="Data & Analytics">Data & Analytics</SelectItem>
                  <SelectItem value="Security & Compliance">Security & Compliance</SelectItem>
                  <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}