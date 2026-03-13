/**
 * US Warehouse Map Component
 * Shows warehouse locations on geographical US map using react-simple-maps
 */

import { useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";
import type { HYDRAULICWarehouse } from "@/data/sixes-warehouse-data";

interface WarehouseMapProps {
  warehouses: HYDRAULICWarehouse[];
  inventorySummary?: {
    warehouseId: string;
    totalUnits: number;
    palletsUsed: number;
    monthlyStorageCost: number;
    alerts: number;
  }[];
  onWarehouseClick?: (warehouseId: string) => void;
}

// TopoJSON URL for US map
const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

export function WarehouseMap({
  warehouses,
  inventorySummary = [],
  onWarehouseClick,
}: WarehouseMapProps) {
  const [hoveredWarehouse, setHoveredWarehouse] = useState<string | null>(null);

  return (
    <div className="bg-card border border-border rounded-sm p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          Warehouse Network
        </h3>
        <p className="text-sm text-muted-foreground">
          4 distribution centers across USA • Scroll to zoom
        </p>
      </div>

      {/* Map Container with React Simple Maps */}
      <div className="relative bg-gradient-to-br from-blue-50/50 to-blue-100/30 dark:from-slate-900/50 dark:to-slate-800/30 rounded-sm border border-border/50 overflow-hidden">
        <ComposableMap
          projection="geoAlbersUsa"
          className="w-full h-[500px]"
          projectionConfig={{
            scale: 1000,
          }}
        >
          <ZoomableGroup center={[-96, 38]} zoom={1}>
            {/* US States Geography */}
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="currentColor"
                    stroke="currentColor"
                    className="text-blue-200/40 dark:text-blue-700/40 hover:text-blue-300/60 dark:hover:text-blue-600/60 transition-colors outline-none"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: "none" },
                      hover: { outline: "none" },
                      pressed: { outline: "none" },
                    }}
                  />
                ))
              }
            </Geographies>

            {/* Warehouse Markers */}
            {warehouses.map((warehouse) => {
              const summary = inventorySummary.find(
                (s) => s.warehouseId === warehouse.id,
              );
              const hasAlerts = (summary?.alerts || 0) > 0;
              const isHovered = hoveredWarehouse === warehouse.id;

              // Highlight warehouses with active alerts
              const markerColor = hasAlerts ? "#ef4444" : "#2563eb";

              return (
                <Marker
                  key={warehouse.id}
                  coordinates={[
                    warehouse.location.coordinates.lng,
                    warehouse.location.coordinates.lat,
                  ]}
                  onMouseEnter={() => setHoveredWarehouse(warehouse.id)}
                  onMouseLeave={() => setHoveredWarehouse(null)}
                  onClick={() => onWarehouseClick?.(warehouse.id)}
                >
                  {/* Marker Pin */}
                  <g>
                    {/* Pulse effect on hover */}
                    {isHovered && (
                      <circle
                        r={10}
                        fill={markerColor}
                        fillOpacity={0.2}
                        className="animate-ping"
                      />
                    )}

                    {/* Main marker circle */}
                    <circle
                      r={6}
                      fill={markerColor}
                      stroke="#ffffff"
                      strokeWidth={2}
                      className="transition-colors"
                    />

                    {/* City label */}
                    <text
                      textAnchor="middle"
                      y={20}
                      className="text-xs font-semibold fill-current text-foreground"
                      style={{
                        fontFamily: "system-ui, sans-serif",
                        pointerEvents: "none",
                      }}
                    >
                      {warehouse.location.city}
                    </text>

                    {/* Tooltip on hover */}
                    {isHovered && (
                      <g>
                        <foreignObject
                          x={15}
                          y={-80}
                          width={220}
                          height={150}
                          style={{ overflow: "visible" }}
                        >
                          <div
                            className="bg-background border border-border rounded-sm shadow-xl p-3"
                            style={{ pointerEvents: "none" }}
                          >
                            <div className="font-semibold text-sm text-foreground mb-0.5">
                              {warehouse.name}
                            </div>
                            <div className="text-xs text-muted-foreground mb-2">
                              {warehouse.location.city},{" "}
                              {warehouse.location.state}
                            </div>
                            <div className="text-xs text-muted-foreground space-y-1">
                              <div className="flex items-center justify-between">
                                <span>Total Units:</span>
                                <span className="font-medium text-foreground">
                                  {(summary?.totalUnits || 0).toLocaleString()}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span>Pallets Used:</span>
                                <span className="font-medium text-foreground">
                                  {summary?.palletsUsed || 0}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span>Monthly Storage:</span>
                                <span className="font-medium text-foreground">
                                  $
                                  {(summary?.monthlyStorageCost || 0).toFixed(
                                    0,
                                  )}
                                </span>
                              </div>
                              <div className="flex items-center justify-between pt-1 border-t border-border mt-1">
                                <span>Alerts:</span>
                                <span className="font-medium text-foreground">
                                  {summary?.alerts || 0}
                                </span>
                              </div>
                            </div>
                          </div>
                        </foreignObject>
                      </g>
                    )}
                  </g>
                </Marker>
              );
            })}
          </ZoomableGroup>
        </ComposableMap>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-blue-600"></div>
          <span className="text-muted-foreground">Normal</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-red-500"></div>
          <span className="text-muted-foreground">Has active alerts</span>
        </div>
      </div>
    </div>
  );
}
