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
import { Badge } from "@/components/ui/badge";
import { useProjectStore } from "@/stores/projectStore";
import { formatDistanceToNow } from 'date-fns';

interface PlanHistoryProps {
  capabilityId: string;
  planType: 'aspirational' | 'implementation';
  onClose: () => void;
}

export function PlanHistory({ capabilityId, planType, onClose }: PlanHistoryProps) {
  const { getPlanHistory, users } = useProjectStore();
  const history = getPlanHistory(capabilityId, planType);

  const getActionColor = (action: string) => {
    const colors = {
      created: 'bg-green-100 text-green-800',
      updated: 'bg-blue-100 text-blue-800',
      approved: 'bg-purple-100 text-purple-800',
      'status-changed': 'bg-orange-100 text-orange-800',
    };
    return colors[action as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatChange = (change: { field: string; oldValue: any; newValue: any }) => {
    if (change.field.includes('Date')) {
      return `Changed from ${new Date(change.oldValue).toLocaleDateString()} to ${new Date(change.newValue).toLocaleDateString()}`;
    }
    return `Changed from "${change.oldValue}" to "${change.newValue}"`;
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Plan History</DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Changes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="whitespace-nowrap">
                    {formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true })}
                  </TableCell>
                  <TableCell>
                    <Badge className={getActionColor(entry.action)}>
                      {entry.action}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {users.find(u => u.id === entry.userId)?.name || 'Unknown User'}
                  </TableCell>
                  <TableCell>
                    <ul className="list-disc pl-4 space-y-1">
                      {entry.changes.map((change, index) => (
                        <li key={index} className="text-sm">
                          {formatChange(change)}
                        </li>
                      ))}
                    </ul>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
