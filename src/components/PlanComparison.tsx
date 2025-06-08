import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProjectStore } from "@/stores/projectStore";

interface PlanComparisonProps {
  capabilityId: string;
  onClose: () => void;
}

export function PlanComparison({ capabilityId, onClose }: PlanComparisonProps) {
  const { getCapabilityPlans, comparePlans } = useProjectStore();
  const [selectedPlanId1, setSelectedPlanId1] = useState<string>('');
  const [selectedPlanId2, setSelectedPlanId2] = useState<string>('');
  
  const plans = getCapabilityPlans(capabilityId);
  const comparison = selectedPlanId1 && selectedPlanId2 
    ? comparePlans(selectedPlanId1, selectedPlanId2)
    : null;

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Compare Plans</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">First Plan</label>
              <Select value={selectedPlanId1} onValueChange={setSelectedPlanId1}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a plan" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map(plan => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {`${plan.type} (v${plan.version}) - ${formatDate(plan.createdAt)}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Second Plan</label>
              <Select value={selectedPlanId2} onValueChange={setSelectedPlanId2}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a plan" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map(plan => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {`${plan.type} (v${plan.version}) - ${formatDate(plan.createdAt)}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {comparison && (
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-4">{comparison.summary}</h3>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Field</TableHead>
                    <TableHead>Plan 1</TableHead>
                    <TableHead>Plan 2</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comparison.differences.map((diff, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{diff.field}</TableCell>
                      <TableCell>{formatDate(diff.plan1Value)}</TableCell>
                      <TableCell>{formatDate(diff.plan2Value)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
