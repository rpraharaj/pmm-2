import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit2, 
  Trash2, 
  Eye,
  Download,
  Settings,
  Calendar,
  Upload
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useProjectStore } from "@/stores/projectStore";
import { CapabilityForm } from "@/components/CapabilityForm";
import { CapabilityDetailsDialog } from "@/components/CapabilityDetailsDialog";

export function CapabilitiesManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingCapability, setEditingCapability] = useState(null);
  const [workstreamFilter, setWorkstreamFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [ragFilter, setRagFilter] = useState("all");
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedCapability, setSelectedCapability] = useState(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { capabilities, milestones, deleteCapability, addCapability } = useProjectStore();
  const { toast } = useToast();

  // Filter capabilities based on all filters
  const filteredCapabilities = capabilities.filter(cap => {
    const searchMatch = cap.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       cap.workstream.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       cap.workstreamLead.name.toLowerCase().includes(searchTerm.toLowerCase());
    const workstreamMatch = workstreamFilter === "all" || cap.workstream === workstreamFilter;
    const statusMatch = statusFilter === "all" || cap.status === statusFilter;
    const ragMatch = ragFilter === "all" || cap.rag === ragFilter;
    return searchMatch && workstreamMatch && statusMatch && ragMatch;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      "In Progress": "default",
      "At Risk": "destructive", 
      "On Track": "default",
      "Completed": "default",
      "Not Started": "secondary"
    };
    
    const colors = {
      "In Progress": "bg-orange-100 text-orange-800",
      "At Risk": "bg-red-100 text-red-800",
      "On Track": "bg-green-100 text-green-800", 
      "Completed": "bg-green-100 text-green-800",
      "Not Started": "bg-gray-100 text-gray-800"
    };

    return (
      <Badge className={colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        {status}
      </Badge>
    );
  };

  const getRagIndicator = (rag: string) => {
    const colors = {
      "Red": "bg-red-500",
      "Amber": "bg-orange-500", 
      "Green": "bg-green-500",
      "Blue": "bg-blue-500"
    };
    
    return (
      <div className={`w-3 h-3 rounded-full ${colors[rag as keyof typeof colors] || "bg-gray-300"}`} />
    );
  };

  const handleEdit = (capability: any) => {
    setEditingCapability(capability);
    setShowForm(true);
  };

  const handleDelete = (capabilityId: string) => {
    if (confirm("Are you sure you want to delete this capability?")) {
      deleteCapability(capabilityId);
    }
  };

  const handleReset = () => {
    setSearchTerm("");
    setWorkstreamFilter("all");
    setStatusFilter("all");
    setRagFilter("all");
  };

  const handleExport = () => {
    const headers = ['Name', 'Workstream', 'Lead', 'SME', 'BA', 'Status', 'RAG', 'Technical Milestone', 'Business Milestone'];
    const csvData = filteredCapabilities.map(cap => [
      cap.name,
      cap.workstream,
      cap.workstreamLead.name,
      cap.sme,
      cap.ba,
      cap.status,
      cap.rag,
      cap.technicalMilestone?.name || '',
      cap.businessMilestone?.name || ''
    ]);
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    const dataBlob = new Blob([csvContent], {type:'text/csv'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'capabilities.csv';
    link.click();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string;
        const lines = csv.split('\n');
        const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
        
        // Expected headers: Name, Workstream, Lead, SME, BA, Status, RAG, Technical Milestone, Business Milestone
        const expectedHeaders = ['Name', 'Workstream', 'Lead', 'SME', 'BA', 'Status', 'RAG'];
        const hasValidHeaders = expectedHeaders.every(header => headers.includes(header));
        
        if (!hasValidHeaders) {
          toast({
            title: "Import Error",
            description: "CSV file must have headers: Name, Workstream, Lead, SME, BA, Status, RAG",
            variant: "destructive"
          });
          return;
        }

        let importedCount = 0;
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          const values = line.split(',').map(v => v.replace(/"/g, '').trim());
          
          if (values.length >= expectedHeaders.length) {
            const capability = {
              name: values[headers.indexOf('Name')] || '',
              workstream: values[headers.indexOf('Workstream')] || '',
              workstreamLead: { name: values[headers.indexOf('Lead')] || '' },
              sme: values[headers.indexOf('SME')] || '',
              ba: values[headers.indexOf('BA')] || '',
              status: values[headers.indexOf('Status')] || 'Not Started',
              rag: values[headers.indexOf('RAG')] || 'Blue',
              notes: ''
            };
            
            // Validate required fields
            if (capability.name && capability.workstream) {
              addCapability(capability);
              importedCount++;
            }
          }
        }
        
        toast({
          title: "Import Successful",
          description: `Imported ${importedCount} capabilities successfully.`
        });
        
      } catch (error) {
        toast({
          title: "Import Error",
          description: "Failed to parse CSV file. Please check the format.",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleViewDetails = (capability: any) => {
    setSelectedCapability(capability);
    setShowDetailsDialog(true);
  };

  const handleManagePlan = () => {
    const event = new CustomEvent('navigate', { detail: 'plans' });
    window.dispatchEvent(event);
  };

  if (showForm) {
    return (
      <CapabilityForm 
        capability={editingCapability}
        onClose={() => {
          setShowForm(false);
          setEditingCapability(null);
        }}
      />
    );
  }

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Capabilities Management</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Manage project capabilities with comprehensive CRUD operations and advanced filtering
          </p>
        </div>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardContent className="pt-4 md:pt-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4">
              <div className="relative w-full">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search capabilities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Select value={workstreamFilter} onValueChange={setWorkstreamFilter}>
                  <SelectTrigger className="w-full">
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

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="At Risk">At Risk</SelectItem>
                    <SelectItem value="On Track">On Track</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Not Started">Not Started</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={ragFilter} onValueChange={setRagFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All RAG" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All RAG</SelectItem>
                    <SelectItem value="Red">Red</SelectItem>
                    <SelectItem value="Amber">Amber</SelectItem>
                    <SelectItem value="Green">Green</SelectItem>
                    <SelectItem value="Blue">Blue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="file"
                ref={fileInputRef}
                accept=".csv"
                onChange={handleImport}
                className="hidden"
              />
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="w-full sm:w-auto">
                <Upload className="w-4 h-4 mr-2" />
                Import CSV
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport} className="w-full sm:w-auto">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button variant="outline" size="sm" onClick={handleReset} className="w-full sm:w-auto">
                <Settings className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button onClick={() => setShowForm(true)} className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Add New Capability</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Capabilities Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="text-left p-2 md:p-4 font-medium">
                    <Checkbox />
                  </th>
                  <th className="text-left p-2 md:p-4 font-medium">Capability Name</th>
                  <th className="text-left p-2 md:p-4 font-medium hidden md:table-cell">Workstream Lead</th>
                  <th className="text-left p-2 md:p-4 font-medium hidden lg:table-cell">SME</th>
                  <th className="text-left p-2 md:p-4 font-medium hidden lg:table-cell">BA</th>
                  <th className="text-left p-2 md:p-4 font-medium hidden xl:table-cell">Technical Milestone</th>
                  <th className="text-left p-2 md:p-4 font-medium hidden xl:table-cell">Business Milestone</th>
                  <th className="text-left p-2 md:p-4 font-medium">Status</th>
                  <th className="text-left p-2 md:p-4 font-medium">RAG</th>
                  <th className="text-left p-2 md:p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                 {filteredCapabilities.map((capability) => (
                   <tr key={capability.id} className="border-b hover:bg-muted/25">
                     <td className="p-2 md:p-4">
                       <Checkbox />
                     </td>
                     <td className="p-2 md:p-4">
                       <div>
                         <div className="font-medium text-sm md:text-base">{capability.name}</div>
                         <div className="text-xs md:text-sm text-muted-foreground">{capability.workstream}</div>
                         <div className="md:hidden text-xs text-muted-foreground mt-1">
                           Lead: {capability.workstreamLead.name}
                         </div>
                       </div>
                     </td>
                     <td className="p-2 md:p-4 hidden md:table-cell">
                       <div className="flex items-center gap-2">
                         <Avatar className="w-6 h-6 md:w-8 md:h-8">
                           <AvatarImage src={capability.workstreamLead.avatar} />
                           <AvatarFallback className="text-xs">{capability.workstreamLead.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                         </Avatar>
                         <span className="text-xs md:text-sm">{capability.workstreamLead.name}</span>
                       </div>
                     </td>
                     <td className="p-2 md:p-4 text-xs md:text-sm hidden lg:table-cell">{capability.sme}</td>
                     <td className="p-2 md:p-4 text-xs md:text-sm hidden lg:table-cell">{capability.ba}</td>
                     <td className="p-2 md:p-4 hidden xl:table-cell">
                       <div>
                         <div className="text-xs md:text-sm font-medium">{capability.technicalMilestone?.name}</div>
                         <div className="text-xs text-muted-foreground">{capability.technicalMilestone?.date}</div>
                       </div>
                     </td>
                     <td className="p-2 md:p-4 hidden xl:table-cell">
                       <div>
                         <div className="text-xs md:text-sm font-medium">{capability.businessMilestone?.name}</div>
                         <div className="text-xs text-muted-foreground">{capability.businessMilestone?.date}</div>
                       </div>
                     </td>
                     <td className="p-2 md:p-4">
                       {getStatusBadge(capability.status)}
                     </td>
                     <td className="p-2 md:p-4">
                       {getRagIndicator(capability.rag)}
                     </td>
                     <td className="p-2 md:p-4">
                       <DropdownMenu>
                         <DropdownMenuTrigger asChild>
                           <Button variant="ghost" size="sm">
                             <MoreHorizontal className="w-4 h-4" />
                           </Button>
                         </DropdownMenuTrigger>
                         <DropdownMenuContent align="end">
                           <DropdownMenuItem onClick={() => handleEdit(capability)}>
                             <Edit2 className="w-4 h-4 mr-2" />
                             Edit
                           </DropdownMenuItem>
                           <DropdownMenuItem onClick={() => handleViewDetails(capability)}>
                             <Eye className="w-4 h-4 mr-2" />
                             View Details
                           </DropdownMenuItem>
                           <DropdownMenuItem onClick={handleManagePlan}>
                             <Calendar className="w-4 h-4 mr-2" />
                             Manage Plan
                           </DropdownMenuItem>
                           <DropdownMenuItem 
                             onClick={() => handleDelete(capability.id)}
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
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          Showing 1 to {filteredCapabilities.length} of {capabilities.length} capabilities
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" disabled className="text-xs">
            Previous
          </Button>
          <Button variant="outline" size="sm" className="bg-primary text-primary-foreground text-xs">
            1
          </Button>
          <Button variant="outline" size="sm" className="text-xs hidden sm:inline-flex">
            2
          </Button>
          <Button variant="outline" size="sm" className="text-xs hidden sm:inline-flex">
            3
          </Button>
          <span className="text-sm text-muted-foreground hidden sm:inline">...</span>
          <Button variant="outline" size="sm" className="text-xs hidden sm:inline-flex">
            10
          </Button>
          <Button variant="outline" size="sm" className="text-xs">
            Next
          </Button>
        </div>
      </div>

      {/* Capability Details Dialog */}
      <CapabilityDetailsDialog 
        isOpen={showDetailsDialog}
        onClose={() => setShowDetailsDialog(false)}
        capability={selectedCapability}
      />
    </div>
  );
}