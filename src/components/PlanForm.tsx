import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Save, X } from "lucide-react";
import { useProjectStore } from "@/stores/projectStore";
import { useToast } from "@/components/ui/use-toast";

interface FormErrors {
  [key: string]: string;
}

interface PlanFormProps {
  capabilityId: string;
  capability: any;
  onClose: () => void;
  initialType: "aspirational" | "implementation";
}

export function PlanForm({ capabilityId, capability, onClose, initialType }: PlanFormProps) {
  const { toast } = useToast();
  const { addPlan, updatePlan, getLatestPlan } = useProjectStore();
  const [formData, setFormData] = useState({
    type: initialType,
    status: 'draft' as const,
    phases: {
      requirements: { startDate: "", endDate: "", status: "not-started" as const, progress: 0, notes: "" },
      design: { startDate: "", endDate: "", status: "not-started" as const, progress: 0, notes: "" },
      development: { startDate: "", endDate: "", status: "not-started" as const, progress: 0, notes: "" },
      cst: { startDate: "", endDate: "", status: "not-started" as const, progress: 0, notes: "" },
      uat: { startDate: "", endDate: "", status: "not-started" as const, progress: 0, notes: "" }
    }
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const existingPlan = getLatestPlan(capabilityId, initialType);
    if (existingPlan) {
      setFormData(prev => ({
        ...prev,
        status: existingPlan.status,
        phases: {
          requirements: existingPlan.phases.requirements || prev.phases.requirements,
          design: existingPlan.phases.design || prev.phases.design,
          development: existingPlan.phases.development,
          cst: existingPlan.phases.cst,
          uat: existingPlan.phases.uat
        }
      }));
    }
  }, [capabilityId, initialType, getLatestPlan]);

  const validateForm = () => {
    const newErrors: FormErrors = {};
    const phases = initialType === 'aspirational' 
      ? ['requirements', 'design', 'development', 'cst', 'uat']
      : ['development', 'cst', 'uat'];

    phases.forEach(phase => {
      const phaseData = formData.phases[phase as keyof typeof formData.phases];
      if (!phaseData.startDate) {
        newErrors[`${phase}Start`] = `${phase} start date is required`;
      }
      if (!phaseData.endDate) {
        newErrors[`${phase}End`] = `${phase} end date is required`;
      }
      if (phaseData.startDate && phaseData.endDate) {
        if (new Date(phaseData.startDate) > new Date(phaseData.endDate)) {
          newErrors[`${phase}Dates`] = `${phase} end date must be after start date`;
        }
      }
    });

    // Validate phase sequence
    for (let i = 1; i < phases.length; i++) {
      const prevPhase = formData.phases[phases[i-1] as keyof typeof formData.phases];
      const currentPhase = formData.phases[phases[i] as keyof typeof formData.phases];
      
      if (prevPhase.endDate && currentPhase.startDate) {
        if (new Date(currentPhase.startDate) < new Date(prevPhase.endDate)) {
          newErrors[`${phases[i]}Sequence`] = `${phases[i]} must start after ${phases[i-1]} ends`;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePhaseChange = (phase: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      phases: {
        ...prev.phases,
        [phase]: {
          ...prev.phases[phase as keyof typeof prev.phases],
          [field]: value
        }
      }
    }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before submitting",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const existingPlan = getLatestPlan(capabilityId, initialType);
      const planData = {
        capabilityId,
        type: initialType,
        status: formData.status,
        phases: formData.phases,
        metadata: {
          createdBy: "Current User", // Replace with actual user
          lastUpdatedBy: "Current User"
        }
      };

      if (existingPlan) {
        await updatePlan(existingPlan.id, planData);
        toast({
          title: "Success",
          description: "Plan updated successfully"
        });
      } else {
        await addPlan(planData);
        toast({
          title: "Success",
          description: "Plan created successfully"
        });
      }
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save plan. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] md:max-w-[800px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center justify-between">
            <span>{capability?.name} - {initialType === "aspirational" ? "Aspirational" : "Implementation"} Plan</span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {Object.keys(errors).length > 0 && (
            <Alert variant="destructive">
              <AlertDescription>
                <ul className="list-disc pl-4">
                  {Object.values(errors).map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Plan Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as typeof prev.status }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {(initialType === "aspirational" ? 
            ['requirements', 'design', 'development', 'cst', 'uat'] : 
            ['development', 'cst', 'uat']
          ).map(phase => (
            <Card key={phase}>
              <CardContent className="p-4 space-y-4">
                <h3 className="font-medium capitalize">{phase} Phase</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={formData.phases[phase as keyof typeof formData.phases].startDate}
                      onChange={(e) => handlePhaseChange(phase, 'startDate', e.target.value)}
                      className={errors[`${phase}Start`] ? 'border-red-500' : ''}
                    />
                    {errors[`${phase}Start`] && (
                      <p className="text-sm text-red-500">{errors[`${phase}Start`]}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={formData.phases[phase as keyof typeof formData.phases].endDate}
                      onChange={(e) => handlePhaseChange(phase, 'endDate', e.target.value)}
                      className={errors[`${phase}End`] ? 'border-red-500' : ''}
                    />
                    {errors[`${phase}End`] && (
                      <p className="text-sm text-red-500">{errors[`${phase}End`]}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={formData.phases[phase as keyof typeof formData.phases].status}
                      onValueChange={(value) => handlePhaseChange(phase, 'status', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="not-started">Not Started</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="delayed">Delayed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Progress (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.phases[phase as keyof typeof formData.phases].progress}
                      onChange={(e) => handlePhaseChange(phase, 'progress', e.target.value)}
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label>Notes</Label>
                    <Textarea
                      value={formData.phases[phase as keyof typeof formData.phases].notes}
                      onChange={(e) => handlePhaseChange(phase, 'notes', e.target.value)}
                      placeholder="Add any notes or comments about this phase..."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              "Saving..."
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Plan
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}