import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, ArrowLeft, Save } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useProjectStore } from "@/stores/projectStore";
import { toast } from "@/hooks/use-toast";

interface MilestoneFormProps {
  milestone?: any;
  type: "technical" | "business";
  onClose: () => void;
}

export function MilestoneForm({ milestone, type, onClose }: MilestoneFormProps) {
  const { addMilestone, updateMilestone } = useProjectStore();
  const [formData, setFormData] = useState({
    name: milestone?.name || '',
    description: milestone?.description || '',
    status: milestone?.status || 'Not Started',
    type: milestone?.type || type
  });
  const [date, setDate] = useState<Date | undefined>(
    milestone?.date ? new Date(milestone.date) : undefined
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date) {
      toast({ title: "Please select a date", variant: "destructive" });
      return;
    }

    const milestoneData = {
      ...formData,
      date: format(date, 'yyyy-MM-dd')
    };

    if (milestone) {
      updateMilestone(milestone.id, milestoneData);
      toast({ title: "Milestone updated successfully" });
    } else {
      addMilestone(milestoneData);
      toast({ title: "Milestone created successfully" });
    }
    
    onClose();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onClose}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Milestones
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {milestone ? 'Edit Milestone' : `Add New ${type === 'technical' ? 'Technical' : 'Business'} Milestone`}
          </h1>
          <p className="text-muted-foreground">
            {milestone ? 'Update milestone details and timeline' : `Create a new ${type} milestone for the project`}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {type === 'technical' ? 'Technical' : 'Business'} Milestone Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Milestone Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter milestone name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Target Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
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
                    <SelectItem value="On Track">On Track</SelectItem>
                    <SelectItem value="At Risk">At Risk</SelectItem>
                    <SelectItem value="Overdue">Overdue</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as "technical" | "business" })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the milestone objectives and deliverables"
                rows={4}
                required
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit">
                <Save className="w-4 h-4 mr-2" />
                {milestone ? 'Update Milestone' : 'Create Milestone'}
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