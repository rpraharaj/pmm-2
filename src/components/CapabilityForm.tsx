import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save } from "lucide-react";
import { useProjectStore } from "@/stores/projectStore";
import { toast } from "@/hooks/use-toast";

interface CapabilityFormProps {
  capability?: any;
  onClose: () => void;
}

export function CapabilityForm({ capability, onClose }: CapabilityFormProps) {
  const { addCapability, updateCapability, milestones } = useProjectStore();
  const [formData, setFormData] = useState({
    name: capability?.name || '',
    workstream: capability?.workstream || '',
    workstreamLead: capability?.workstreamLead?.name || '',
    sme: capability?.sme || '',
    ba: capability?.ba || '',
    technicalMilestone: capability?.technicalMilestone?.id || '',
    businessMilestone: capability?.businessMilestone?.id || '',
    status: capability?.status || 'Not Started',
    rag: capability?.rag || 'Green',
    notes: capability?.notes || ''
  });

  const technicalMilestones = milestones.filter(m => m.type === 'technical');
  const businessMilestones = milestones.filter(m => m.type === 'business');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const techMilestone = technicalMilestones.find(m => m.id === formData.technicalMilestone);
    const bizMilestone = businessMilestones.find(m => m.id === formData.businessMilestone);
    
    const capabilityData = {
      ...formData,
      workstreamLead: { name: formData.workstreamLead },
      technicalMilestone: techMilestone ? {
        id: techMilestone.id,
        name: techMilestone.name,
        date: techMilestone.date
      } : undefined,
      businessMilestone: bizMilestone ? {
        id: bizMilestone.id,
        name: bizMilestone.name,
        date: bizMilestone.date
      } : undefined
    };

    if (capability) {
      updateCapability(capability.id, capabilityData);
      toast({ title: "Capability updated successfully" });
    } else {
      addCapability(capabilityData);
      toast({ title: "Capability created successfully" });
    }
    
    onClose();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onClose}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Capabilities
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {capability ? 'Edit Capability' : 'Add New Capability'}
          </h1>
          <p className="text-muted-foreground">
            {capability ? 'Update capability details and milestones' : 'Create a new capability for the project'}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Capability Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Capability Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter capability name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="workstream">Workstream *</Label>
                <Select value={formData.workstream} onValueChange={(value) => setFormData({ ...formData, workstream: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select workstream" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Frontend Development">Frontend Development</SelectItem>
                    <SelectItem value="Backend Services">Backend Services</SelectItem>
                    <SelectItem value="Data & Analytics">Data & Analytics</SelectItem>
                    <SelectItem value="Security & Compliance">Security & Compliance</SelectItem>
                    <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="workstreamLead">Workstream Lead *</Label>
                <Input
                  id="workstreamLead"
                  value={formData.workstreamLead}
                  onChange={(e) => setFormData({ ...formData, workstreamLead: e.target.value })}
                  placeholder="Enter workstream lead name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sme">SME</Label>
                <Input
                  id="sme"
                  value={formData.sme}
                  onChange={(e) => setFormData({ ...formData, sme: e.target.value })}
                  placeholder="Enter SME name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ba">Business Analyst</Label>
                <Input
                  id="ba"
                  value={formData.ba}
                  onChange={(e) => setFormData({ ...formData, ba: e.target.value })}
                  placeholder="Enter BA name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Not Started">Not Started</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="At Risk">At Risk</SelectItem>
                    <SelectItem value="On Track">On Track</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="technicalMilestone">Technical Milestone</Label>
                <Select value={formData.technicalMilestone} onValueChange={(value) => setFormData({ ...formData, technicalMilestone: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select technical milestone" />
                  </SelectTrigger>
                  <SelectContent>
                    {technicalMilestones.map((milestone) => (
                      <SelectItem key={milestone.id} value={milestone.id}>
                        {milestone.name} - {milestone.date}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessMilestone">Business Milestone</Label>
                <Select value={formData.businessMilestone} onValueChange={(value) => setFormData({ ...formData, businessMilestone: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select business milestone" />
                  </SelectTrigger>
                  <SelectContent>
                    {businessMilestones.map((milestone) => (
                      <SelectItem key={milestone.id} value={milestone.id}>
                        {milestone.name} - {milestone.date}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rag">RAG Status *</Label>
                <Select value={formData.rag} onValueChange={(value) => setFormData({ ...formData, rag: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Red">Red</SelectItem>
                    <SelectItem value="Amber">Amber</SelectItem>
                    <SelectItem value="Green">Green</SelectItem>
                    <SelectItem value="Blue">Blue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Add any additional notes or comments"
                rows={3}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit">
                <Save className="w-4 h-4 mr-2" />
                {capability ? 'Update Capability' : 'Create Capability'}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}