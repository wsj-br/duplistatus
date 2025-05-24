"use client";

import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useConfig } from "@/contexts/config-context";
import { Label } from "@/components/ui/label";

export function ConfigMenu() {
  const {
    tablePageSize,
    setTablePageSize,
    chartTimeRange,
    setChartTimeRange,
  } = useConfig();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="text-xl font-medium leading-none">Settings</h4>
            <p className="text-sm text-muted-foreground">
              Configure your DupliDash preferences
            </p>
          </div>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="table-page-size">Table Page Size</Label>
              <Select
                value={tablePageSize.toString()}
                onValueChange={(value) => setTablePageSize(parseInt(value) as any)}
              >
                <SelectTrigger id="table-page-size">
                  <SelectValue placeholder="Select page size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 rows</SelectItem>
                  <SelectItem value="10">10 rows</SelectItem>
                  <SelectItem value="15">15 rows</SelectItem>
                  <SelectItem value="20">20 rows</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="chart-time-range">Chart Time Range</Label>
              <Select
                value={chartTimeRange}
                onValueChange={(value: any) => setChartTimeRange(value)}
              >
                <SelectTrigger id="chart-time-range">
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2 weeks">Last 2 weeks</SelectItem>
                  <SelectItem value="1 month">Last month</SelectItem>
                  <SelectItem value="3 months">Last quarter</SelectItem>
                  <SelectItem value="6 months">Last semester</SelectItem>
                  <SelectItem value="1 year">Last year</SelectItem>
                  <SelectItem value="2 years">Last 2 years</SelectItem>
                  <SelectItem value="All data">All available data</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
} 