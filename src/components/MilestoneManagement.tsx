import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Search, 
  Calendar, 
  Edit2, 
  Trash2, 
  Download
} from "lucide-react";
import { useProjectStore } from "@/stores/projectStore";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { MilestoneForm } from "@/components/MilestoneForm";

export function MilestoneManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState(null);
  const [milestoneType, setMilestoneType] = useState<"technical" | "business">("technical");
  const { milestones, getUsageCount, deleteMilestone } = useProjectStore();

  const technicalMilestones = milestones.filter(m => m.type === "technical");
  const businessMilestones = milestones.filter(m => m.type === "business");

  const handleEdit = (milestone: any) => {
    setEditingMilestone(milestone);
    setMilestoneType(milestone.type);
    setShowForm(true);
  };

  const handleDelete = (milestoneId: string) => {
    if (window.confirm('Are you sure you want to delete this milestone?')) {
      deleteMilestone(milestoneId);
    }
  };

  const handleExportCalendar = () => {
    alert('Export calendar functionality would be implemented here');
  };

  const handleDownload = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Milestone Name,Target Date,Type,Description,Status,Usage Count\n" +
      milestones.map(milestone => 
        `${milestone.name},${milestone.date},${milestone.type},"${milestone.description}",${milestone.status},${getUsageCount(milestone.id)}`
      ).join("\n");
    
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "milestones.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddNew = (type: "technical" | "business") => {
    setMilestoneType(type);
    setEditingMilestone(null);
    setShowForm(true);
  };

  if (showForm) {
    return (
      <MilestoneForm 
        milestone={editingMilestone}
        type={milestoneType}
        onClose={() => {
          setShowForm(false);
          setEditingMilestone(null);
        }}
      />
    );
  }

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Milestone Management</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Configure technical and business milestones that anchor project timelines across all capabilities
          </p>
        </div>
      </div>

      <Tabs defaultValue="technical" className="space-y-6">
        <TabsList>
          <TabsTrigger value="technical">Technical Milestones</TabsTrigger>
          <TabsTrigger value="business">Business Milestones</TabsTrigger>
        </TabsList>

        <TabsContent value="technical">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Technical Milestones</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Define technical delivery checkpoints and system implementation markers
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button variant="outline" size="sm" onClick={handleExportCalendar} className="w-full sm:w-auto">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Export Calendar</span>
                    <span className="sm:hidden">Export</span>
                  </Button>
                  <Button onClick={() => handleAddNew("technical")} className="w-full sm:w-auto">
                    <Plus className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Add New Milestone</span>
                    <span className="sm:hidden">Add</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search technical milestones..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground hidden sm:inline">All Milestones</span>
                    <Button variant="outline" size="sm" onClick={handleDownload}>
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b bg-muted/50">
                      <tr>
                        <th className="text-left p-4 font-medium">Milestone Name</th>
                        <th className="text-left p-4 font-medium">Target Date</th>
                        <th className="text-left p-4 font-medium">Description</th>
                        <th className="text-left p-4 font-medium">Usage Count</th>
                        <th className="text-left p-4 font-medium">Status</th>
                        <th className="text-left p-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {technicalMilestones.map((milestone) => (
                        <tr key={milestone.id} className="border-b hover:bg-muted/25">
                          <td className="p-4 font-medium">{milestone.name}</td>
                          <td className="p-4 text-muted-foreground">{milestone.date}</td>
                          <td className="p-4 text-sm text-muted-foreground max-w-md">
                            {milestone.description}
                          </td>
                          <td className="p-4">
                            <Badge variant="outline" className="bg-blue-50 text-blue-700">
                              {getUsageCount(milestone.id)} capabilities
                            </Badge>
                          </td>
                          <td className="p-4">
                            <Badge className={
                              milestone.status === 'On Track' ? 'bg-green-100 text-green-800' :
                              milestone.status === 'In Progress' ? 'bg-orange-100 text-orange-800' :
                              'bg-red-100 text-red-800'
                            }>
                              {milestone.status}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEdit(milestone)}>
                                  <Edit2 className="w-4 h-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleDelete(milestone.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="business">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Business Milestones</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Define business delivery checkpoints and value realization markers
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button variant="outline" size="sm" onClick={handleExportCalendar} className="w-full sm:w-auto">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Export Calendar</span>
                    <span className="sm:hidden">Export</span>
                  </Button>
                  <Button onClick={() => handleAddNew("business")} className="w-full sm:w-auto">
                    <Plus className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Add New Milestone</span>
                    <span className="sm:hidden">Add</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search business milestones..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground hidden sm:inline">All Milestones</span>
                    <Button variant="outline" size="sm" onClick={handleDownload}>
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b bg-muted/50">
                      <tr>
                        <th className="text-left p-4 font-medium">Milestone Name</th>
                        <th className="text-left p-4 font-medium">Target Date</th>
                        <th className="text-left p-4 font-medium">Description</th>
                        <th className="text-left p-4 font-medium">Usage Count</th>
                        <th className="text-left p-4 font-medium">Status</th>
                        <th className="text-left p-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {businessMilestones.map((milestone) => (
                        <tr key={milestone.id} className="border-b hover:bg-muted/25">
                          <td className="p-4 font-medium">{milestone.name}</td>
                          <td className="p-4 text-muted-foreground">{milestone.date}</td>
                          <td className="p-4 text-sm text-muted-foreground max-w-md">
                            {milestone.description}
                          </td>
                          <td className="p-4">
                            <Badge variant="outline" className="bg-blue-50 text-blue-700">
                              {getUsageCount(milestone.id)} capabilities
                            </Badge>
                          </td>
                          <td className="p-4">
                            <Badge className={
                              milestone.status === 'On Track' ? 'bg-green-100 text-green-800' :
                              milestone.status === 'In Progress' ? 'bg-orange-100 text-orange-800' :
                              'bg-red-100 text-red-800'
                            }>
                              {milestone.status}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEdit(milestone)}>
                                  <Edit2 className="w-4 h-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleDelete(milestone.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}