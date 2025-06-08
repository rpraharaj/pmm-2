import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, User, Building, FileText, Target, Clock } from "lucide-react";

interface CapabilityDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  capability: any;
}

export function CapabilityDetailsDialog({ isOpen, onClose, capability }: CapabilityDetailsDialogProps) {
  if (!capability) return null;

  const getStatusBadge = (status: string) => {
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
      <div className={`w-4 h-4 rounded-full ${colors[rag as keyof typeof colors] || "bg-gray-300"}`} />
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <FileText className="w-6 h-6" />
            Capability Details
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">{capability.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{capability.workstream}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">Status:</span>
                  {getStatusBadge(capability.status)}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">RAG Status:</span>
                  <div className="flex items-center gap-2">
                    {getRagIndicator(capability.rag)}
                    <span className="text-sm">{capability.rag}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Team Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Team Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Workstream Lead</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={capability.workstreamLead.avatar} />
                      <AvatarFallback>
                        {capability.workstreamLead.name.split(' ').map((n: string) => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{capability.workstreamLead.name}</span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Subject Matter Expert</label>
                  <p className="text-sm font-medium mt-1">{capability.sme}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Business Analyst</label>
                  <p className="text-sm font-medium mt-1">{capability.ba}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Milestones */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Milestones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Technical Milestone</label>
                  {capability.technicalMilestone ? (
                    <div className="mt-1">
                      <p className="text-sm font-medium">{capability.technicalMilestone.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{capability.technicalMilestone.date}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground mt-1">No technical milestone assigned</p>
                  )}
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Business Milestone</label>
                  {capability.businessMilestone ? (
                    <div className="mt-1">
                      <p className="text-sm font-medium">{capability.businessMilestone.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{capability.businessMilestone.date}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground mt-1">No business milestone assigned</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {capability.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{capability.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Timeline Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Timeline Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Current Phase:</span>
                  <Badge variant="outline">
                    {capability.status === 'In Progress' ? 'Development' :
                     capability.status === 'At Risk' ? 'UAT' :
                     capability.status === 'On Track' ? 'CST' :
                     capability.status === 'Completed' ? 'Completed' : 'Requirements'}
                  </Badge>
                </div>
                
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${
                        capability.status === 'Completed' ? 100 :
                        capability.status === 'In Progress' ? 65 :
                        capability.status === 'At Risk' ? 30 :
                        capability.status === 'On Track' ? 45 : 0
                      }%` 
                    }}
                  />
                </div>
                
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Requirements</span>
                  <span>Design</span>
                  <span>Development</span>
                  <span>CST</span>
                  <span>UAT</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}