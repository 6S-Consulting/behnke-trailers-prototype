import { useState } from "react";
import { Button } from "@/admin/components/ui/button";
import { Badge } from "@/admin/components/ui/badge";
import { Layers, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/admin/components/ui/dropdown-menu";

export type WarehouseVersion = "v1" | "v2" | "v3" | "v4";

interface VersionInfo {
  version: WarehouseVersion;
  label: string;
  description: string;
  badge?: "Legacy" | "Enhanced" | "Current" | "Optimized";
  badgeColor?: "default" | "secondary" | "outline" | "destructive";
}

const versions: VersionInfo[] = [
  {
    version: "v1",
    label: "Version 1 - Basic",
    description: "Read-only analysis with static data",
    badge: "Legacy",
    badgeColor: "secondary",
  },
  {
    version: "v2",
    label: "Version 2 - Enhanced",
    description: "Added filters and improved UI",
    badge: "Enhanced",
    badgeColor: "outline",
  },
  {
    version: "v3",
    label: "Version 3 - Interactive",
    description: "Full admin controls with dialogs and actions",
    badge: "Current",
    badgeColor: "default",
  },
  {
    version: "v4",
    label: "Version 4 - Optimized",
    description: "AI insights, analytics, and advanced features",
    badge: "Optimized",
    badgeColor: "destructive",
  },
];

interface VersionSelectorProps {
  currentVersion: WarehouseVersion;
  onVersionChange: (version: WarehouseVersion) => void;
}

export function VersionSelector({
  currentVersion,
  onVersionChange,
}: VersionSelectorProps) {
  const currentVersionInfo = versions.find((v) => v.version === currentVersion);

  return (
    <div className="bg-card border border-border rounded-sm p-4 mb-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Layers className="h-5 w-5 text-primary" />
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Warehouse Optimization
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {currentVersionInfo?.description || "Select a version"}
            </p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              {currentVersionInfo?.label || "Select Version"}
              {currentVersionInfo?.badge && (
                <Badge variant={currentVersionInfo.badgeColor} className="ml-2">
                  {currentVersionInfo.badge}
                </Badge>
              )}
              <ChevronDown className="h-4 w-4 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[320px]">
            <DropdownMenuLabel>Select Version</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {versions.map((version) => (
              <DropdownMenuItem
                key={version.version}
                onClick={() => onVersionChange(version.version)}
                className="flex items-start gap-3 p-3"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{version.label}</span>
                    {version.badge && (
                      <Badge variant={version.badgeColor} className="text-xs">
                        {version.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {version.description}
                  </p>
                </div>
                {currentVersion === version.version && (
                  <div className="h-2 w-2 rounded-full bg-primary mt-1" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export function getVersionLabel(version: WarehouseVersion): string {
  return versions.find((v) => v.version === version)?.label || version;
}
