import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  RefreshCw, 
  Download, 
  Plus, 
  Calendar,
  ZoomIn,
  ZoomOut,
  History,
  Edit,
  FileJson,
  FileSpreadsheet
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProjectStore } from "@/stores/projectStore";
import { PlanForm } from "@/components/PlanForm";
import type { Capability, Plan } from "@/stores/projectStore";

export function PlansView() {
  const [view, setView] = useState("weeks");
  const [workstream, setWorkstream] = useState("all");
  const [status, setStatus] = useState("all");
  const [dateRange, setDateRange] = useState("current");
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [selectedCapability, setSelectedCapability] = useState<Capability | null>(null);
  const [planType, setPlanType] = useState<"aspirational" | "implementation">("aspirational");
  
  const { capabilities, plans } = useProjectStore();

  // Filter capabilities based on selected filters
  const filteredCapabilities = useMemo(() => {
    return capabilities.filter(capability => {
      const workstreamMatch = workstream === "all" || capability.workstream === workstream;
      const statusMatch = status === "all" || capability.status === status;
      return workstreamMatch && statusMatch;
    });
  }, [capabilities, workstream, status]);

  // Get plans for a capability
  const getCapabilityPlans = (capabilityId: string, type: "aspirational" | "implementation"): Plan[] => {
    return plans.filter(plan => plan.capabilityId === capabilityId && plan.type === type);
  };

  // Get latest plan for a capability
  const getLatestPlan = (capabilityId: string, type: "aspirational" | "implementation"): Plan | undefined => {
    const capabilityPlans = getCapabilityPlans(capabilityId, type);
    return capabilityPlans.length > 0
      ? capabilityPlans.reduce((latest, current) => 
          current.version > latest.version ? current : latest
        )
      : undefined;
  };

  const handleExport = (format: 'json' | 'csv') => {
    const exportData = capabilities.map(capability => {
      const aspirationalPlan = getLatestPlan(capability.id, 'aspirational');
      const implementationPlan = getLatestPlan(capability.id, 'implementation');
      
      return {
        capability: capability.name,
        workstream: capability.workstream,
        status: capability.status,
        aspirationalPlan: aspirationalPlan ? {
          version: aspirationalPlan.version,
          phases: aspirationalPlan.phases
        } : null,
        implementationPlan: implementationPlan ? {
          version: implementationPlan.version,
          phases: implementationPlan.phases
        } : null
      };
    });

    if (format === 'json') {
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = window.URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'capability-plans.json';
      link.click();
    } else {
      // CSV export
      const csvRows = [];
      const headers = ['Capability', 'Workstream', 'Status', 'Aspirational Plan Start', 'Aspirational Plan End', 'Implementation Plan Start', 'Implementation Plan End'];
      csvRows.push(headers.join(','));

      exportData.forEach(item => {
        const aspirationalStart = item.aspirationalPlan?.phases?.requirements?.startDate || '';
        const aspirationalEnd = item.aspirationalPlan?.phases?.uat?.endDate || '';
        const implementationStart = item.implementationPlan?.phases?.development?.startDate || '';
        const implementationEnd = item.implementationPlan?.phases?.uat?.endDate || '';

        const row = [
          item.capability,
          item.workstream,
          item.status,
          aspirationalStart,
          aspirationalEnd,
          implementationStart,
          implementationEnd
        ].map(field => `"${field}"`).join(',');
        
        csvRows.push(row);
      });

      const csvStr = csvRows.join('\n');
      const dataBlob = new Blob([csvStr], { type: 'text/csv' });
      const url = window.URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'capability-plans.csv';
      link.click();
    }
  };

  // Timeline headers based on view type
  const getTimelineRange = () => {
    // Get all plan dates
    const allDates = plans.flatMap(plan => 
      Object.values(plan.phases)
        .filter(phase => phase?.startDate && phase?.endDate)
        .flatMap(phase => [new Date(phase!.startDate), new Date(phase!.endDate)])
    );

    // If no plans exist, use current date as reference
    const currentDate = new Date();
    if (allDates.length === 0) {
      const sixMonthsBefore = new Date(currentDate);
      sixMonthsBefore.setMonth(currentDate.getMonth() - 6);
      const sixMonthsAfter = new Date(currentDate);
      sixMonthsAfter.setMonth(currentDate.getMonth() + 6);
      return { start: sixMonthsBefore, end: sixMonthsAfter, current: currentDate };
    }

    // Find the earliest and latest dates
    const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));

    // Add 6 months padding on both sides
    minDate.setMonth(minDate.getMonth() - 6);
    maxDate.setMonth(maxDate.getMonth() + 6);

    return { start: minDate, end: maxDate, current: currentDate };
  };

  const getTimelineHeaders = () => {
    const { start, end, current } = getTimelineRange();
    const headers = [];

    if (view === "weeks") {
      let weekStart = new Date(start);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start from Sunday

      while (weekStart <= end) {
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        const isCurrentWeek = current >= weekStart && current <= weekEnd;
        
        headers.push({
          label: `${weekStart.toLocaleDateString('en-US', { 
            month: 'short',
            day: 'numeric'
          })} - ${weekEnd.toLocaleDateString('en-US', { 
            month: 'short',
            day: 'numeric'
          })}`,
          sublabel: weekStart.toLocaleDateString('en-US', { year: 'numeric' }),
          isCurrent: isCurrentWeek
        });

        weekStart.setDate(weekStart.getDate() + 7);
      }
    } else if (view === "months") {
      let monthStart = new Date(start);
      monthStart.setDate(1);

      while (monthStart <= end) {
        const monthEnd = new Date(monthStart);
        monthEnd.setMonth(monthStart.getMonth() + 1);
        monthEnd.setDate(0);
        
        const isCurrentMonth = monthStart.getMonth() === current.getMonth() && 
                             monthStart.getFullYear() === current.getFullYear();
        
        headers.push({
          label: monthStart.toLocaleDateString('en-US', { 
            month: 'long'
          }),
          sublabel: `${monthStart.toLocaleDateString('en-US', { 
            year: 'numeric'
          })}`,
          isCurrent: isCurrentMonth
        });

        monthStart.setMonth(monthStart.getMonth() + 1);
      }
    } else {
      let quarterStart = new Date(start);
      quarterStart.setMonth(Math.floor(quarterStart.getMonth() / 3) * 3);
      quarterStart.setDate(1);

      while (quarterStart <= end) {
        const quarterEnd = new Date(quarterStart);
        quarterEnd.setMonth(quarterStart.getMonth() + 3);
        quarterEnd.setDate(0);

        const currentQuarter = Math.floor(current.getMonth() / 3);
        const headerQuarter = Math.floor(quarterStart.getMonth() / 3);
        const isCurrentQuarter = headerQuarter === currentQuarter && 
                                quarterStart.getFullYear() === current.getFullYear();

        const quarterMonths = [
          quarterStart.toLocaleDateString('en-US', { month: 'short' }),
          new Date(quarterStart.getFullYear(), quarterStart.getMonth() + 1).toLocaleDateString('en-US', { month: 'short' }),
          new Date(quarterStart.getFullYear(), quarterStart.getMonth() + 2).toLocaleDateString('en-US', { month: 'short' })
        ].join('-');

        headers.push({
          label: `Q${Math.floor(quarterStart.getMonth() / 3) + 1} (${quarterMonths})`,
          sublabel: quarterStart.toLocaleDateString('en-US', { year: 'numeric' }),
          isCurrent: isCurrentQuarter
        });

        quarterStart.setMonth(quarterStart.getMonth() + 3);
      }
    }

    return headers;
  };

  const getStatusColor = (status: string): string => {
    const colors = {
      "In Progress": "text-orange-500 border-orange-500",
      "At Risk": "text-red-500 border-red-500",
      "On Track": "text-green-500 border-green-500",
      "Delayed": "text-red-600 border-red-600",
      "Completed": "text-green-600 border-green-600"
    };
    return colors[status as keyof typeof colors] || "text-gray-400 border-gray-400";
  };

  const getPhaseColor = (phase: string, type: 'aspirational' | 'implementation') => {
    const colors = {
      requirements: type === 'aspirational' ? 'bg-blue-200' : '',
      design: type === 'aspirational' ? 'bg-purple-200' : '',
      development: 'bg-indigo-200',
      cst: 'bg-green-200',
      uat: 'bg-orange-200'
    };
    return colors[phase as keyof typeof colors] || 'bg-gray-200';
  };

  const calculatePosition = (date: string) => {
    const { start: timelineStart, end: timelineEnd } = getTimelineRange();
    const targetDate = new Date(date);
    
    // Calculate total milliseconds in the timeline
    const timelineDuration = timelineEnd.getTime() - timelineStart.getTime();
    
    // Calculate milliseconds from start to target date
    const targetPosition = targetDate.getTime() - timelineStart.getTime();
    
    // Convert to percentage
    return (targetPosition / timelineDuration) * 100;
  };

  const renderTimelineBars = (plan: any, type: 'aspirational' | 'implementation') => {
    const phases = type === 'aspirational' 
      ? ['requirements', 'design', 'development', 'cst', 'uat']
      : ['development', 'cst', 'uat'];

    const { start: timelineStart } = getTimelineRange();

    return phases.map(phase => {
      if (!plan.phases[phase]) return null;

      const phaseStart = new Date(plan.phases[phase].startDate);
      const phaseEnd = new Date(plan.phases[phase].endDate);
      const totalDays = view === 'weeks' ? 7 * getTimelineHeaders().length :
                       view === 'months' ? 30 * getTimelineHeaders().length :
                       90 * getTimelineHeaders().length;

      const start = ((phaseStart.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24)) / totalDays * 100;
      const width = ((phaseEnd.getTime() - phaseStart.getTime()) / (1000 * 60 * 60 * 24)) / totalDays * 100;

      if (width < 0) return null;

      const phaseLabel = {
        requirements: 'REQ',
        design: 'DES',
        development: 'DEV',
        cst: 'CST',
        uat: 'UAT'
      }[phase];

      return (
        <div
          key={`${plan.id}-${phase}`}
          className={`absolute h-6 rounded ${getPhaseColor(phase, type)} border border-gray-300 
                     flex items-center justify-center overflow-hidden hover:z-10 group 
                     transition-all duration-200 hover:h-8 hover:shadow-md cursor-pointer`}
          style={{
            left: `${start}%`,
            width: `${Math.max(width, 5)}%`
          }}
        >
          <span className="text-xs font-medium truncate px-1">{phaseLabel}</span>
          <div className="absolute invisible group-hover:visible bg-black text-white text-xs p-2 rounded -top-8 whitespace-nowrap">
            {`${phase.charAt(0).toUpperCase() + phase.slice(1)}: 
              ${phaseStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - 
              ${phaseEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
          </div>
        </div>
      );
    });
  };

  const handleCreatePlan = (capability: any, type: "aspirational" | "implementation") => {
    setSelectedCapability(capability);
    setPlanType(type);
    setShowPlanForm(true);
  };

  const handleEditPlan = (capability: any, type: "aspirational" | "implementation") => {
    setSelectedCapability(capability);
    setPlanType(type);
    setShowPlanForm(true);
  };

  const handleRefresh = () => {
    // Refresh the plans view without full page reload
    setWorkstream("all");
    setStatus("all");
    setView("weeks");
    setDateRange("current");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full">
          <Select value={workstream} onValueChange={setWorkstream}>
            <SelectTrigger>
              <SelectValue placeholder="Select Workstream" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Workstreams</SelectItem>
              <SelectItem value="Frontend Development">Frontend Development</SelectItem>
              <SelectItem value="Backend Services">Backend Services</SelectItem>
            </SelectContent>
          </Select>

          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="At Risk">At Risk</SelectItem>
              <SelectItem value="On Track">On Track</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={view} onValueChange={setView}>
            <SelectTrigger>
              <SelectValue placeholder="Select View" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weeks">Weekly View</SelectItem>
              <SelectItem value="months">Monthly View</SelectItem>
              <SelectItem value="quarters">Quarterly View</SelectItem>
            </SelectContent>
          </Select>

          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger>
              <SelectValue placeholder="Select Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">Current Period</SelectItem>
              <SelectItem value="next">Next Period</SelectItem>
              <SelectItem value="previous">Previous Period</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2 md:justify-end">
          <Button variant="outline" size="icon">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport('json')}>
                <FileJson className="mr-2 h-4 w-4" />
                Export as JSON
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('csv')}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Export as CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="border rounded-lg bg-white">
        <div className="overflow-x-auto">
          <div className="min-w-[1200px]">
            {/* Timeline Header */}
            <div className="sticky top-0 z-20 grid grid-cols-[250px_1fr] bg-muted border-b">
              <div className="p-4 font-medium border-r">Capability</div>
              <div className="overflow-hidden">
                <div className="flex">
                  {getTimelineHeaders().map((header, index) => (
                    <div 
                      key={index} 
                      className={`flex-none p-3 text-center min-w-[150px] border-r last:border-r-0 ${
                        header.isCurrent ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className={`text-sm font-medium ${
                        header.isCurrent ? 'text-blue-600' : ''
                      }`}>
                        {header.label}
                      </div>
                      <div className={`text-xs ${
                        header.isCurrent ? 'text-blue-500' : 'text-muted-foreground'
                      }`}>
                        {header.sublabel}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Timeline Content */}
            <div className="divide-y">
              {filteredCapabilities.map((capability) => {
                const aspirationalPlan = getLatestPlan(capability.id, 'aspirational');
                const implementationPlan = getLatestPlan(capability.id, 'implementation');

                return (
                  <div key={capability.id} className="grid grid-cols-[250px_1fr]">
                    <div className="p-4 border-r bg-white">
                      <div className="space-y-3">
                        <div>
                          <h3 className="font-medium text-sm">{capability.name}</h3>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {capability.workstream}
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getStatusColor(capability.status)}`}
                            >
                              {capability.status}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-medium">Aspirational Plan</span>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs"
                              onClick={() => {
                                setSelectedCapability(capability);
                                setPlanType("aspirational");
                                setShowPlanForm(true);
                              }}
                            >
                              {aspirationalPlan ? (
                                <>
                                  <Edit className="h-3 w-3 mr-1" />
                                  Edit
                                </>
                              ) : (
                                <>
                                  <Plus className="h-3 w-3 mr-1" />
                                  Create
                                </>
                              )}
                            </Button>
                          </div>

                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-medium">Implementation Plan</span>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs"
                              onClick={() => {
                                setSelectedCapability(capability);
                                setPlanType("implementation");
                                setShowPlanForm(true);
                              }}
                            >
                              {implementationPlan ? (
                                <>
                                  <Edit className="h-3 w-3 mr-1" />
                                  Edit
                                </>
                              ) : (
                                <>
                                  <Plus className="h-3 w-3 mr-1" />
                                  Create
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="relative min-h-[120px] bg-white">
                      {/* Timeline grid lines */}
                      <div className="absolute inset-0">
                        {getTimelineHeaders().map((_, index) => (
                          <div
                            key={index}
                            className="absolute top-0 bottom-0 border-l border-gray-100"
                            style={{ 
                              left: `${(index / getTimelineHeaders().length) * 100}%`,
                              width: `${100 / getTimelineHeaders().length}%`
                            }}
                          />
                        ))}
                      </div>

                      {/* Plans */}
                      {aspirationalPlan && (
                        <div className="absolute top-4 left-0 right-0 mx-4">
                          {renderTimelineBars(aspirationalPlan, 'aspirational')}
                        </div>
                      )}
                      {implementationPlan && (
                        <div className="absolute top-16 left-0 right-0 mx-4">
                          {renderTimelineBars(implementationPlan, 'implementation')}
                        </div>
                      )}

                      {/* Plan labels */}
                      <div className="absolute left-2 top-2 text-xs text-gray-500">Aspirational</div>
                      <div className="absolute left-2 top-14 text-xs text-gray-500">Implementation</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {showPlanForm && selectedCapability && (
        <PlanForm
          capabilityId={selectedCapability.id}
          capability={selectedCapability}
          initialType={planType}
          onClose={() => {
            setShowPlanForm(false);
            setSelectedCapability(null);
          }}
        />
      )}
    </div>
  );
}