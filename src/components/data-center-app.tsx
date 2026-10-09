import React, { useState, useMemo, useCallback } from "react";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type RackHealth = "healthy" | "warning" | "critical" | "offline" | "empty";

export interface DataCenterRack {
  id: string;
  name: string;
  /** Row identifier, e.g. "A", "B", "1" */
  row: string;
  /** Position within the row (1-based) */
  position: number;
  /** Total U capacity */
  totalU: number;
  /** Currently occupied U */
  usedU: number;
  /** Aggregate power draw in watts */
  powerWatts: number;
  /** Worst / overall health of devices in the rack */
  health: RackHealth;
  /** Optional short note (e.g. "GPU cluster") */
  tag?: string;
  /** Number of devices currently installed */
  deviceCount?: number;
}

export interface DataCenterAppProps {
  /** Data center name */
  name?: string;
  /** Location / site label */
  location?: string;
  /** Racks to display */
  racks?: DataCenterRack[];
  /** Called when a rack is selected */
  onRackSelect?: (rack: DataCenterRack | null) => void;
  /** Extra class name */
  className?: string;
  /** Show power numbers on each rack tile */
  showPower?: boolean;
}

/* -------------------------------------------------------------------------- */
/* Constants & helpers                                                        */
/* -------------------------------------------------------------------------- */

const HEALTH_COLORS: Record<RackHealth, string> = {
  healthy: "#22c55e",
  warning: "#eab308",
  critical: "#ef4444",
  offline: "#6b7280",
  empty: "#334155",
};

const HEALTH_LABELS: Record<RackHealth, string> = {
  healthy: "Healthy",
  warning: "Warning",
  critical: "Critical",
  offline: "Offline",
  empty: "Empty",
};

/** Demo data – two rows of racks with realistic variety */
const DEMO_RACKS: DataCenterRack[] = [
  // Row A
  { id: "a01", name: "A01", row: "A", position: 1, totalU: 42, usedU: 38, powerWatts: 6200, health: "healthy", tag: "Compute", deviceCount: 14 },
  { id: "a02", name: "A02", row: "A", position: 2, totalU: 42, usedU: 42, powerWatts: 8100, health: "warning", tag: "Compute", deviceCount: 16 },
  { id: "a03", name: "A03", row: "A", position: 3, totalU: 42, usedU: 30, powerWatts: 4500, health: "healthy", tag: "Storage", deviceCount: 8 },
  { id: "a04", name: "A04", row: "A", position: 4, totalU: 42, usedU: 36, powerWatts: 9800, health: "critical", tag: "GPU", deviceCount: 6 },
  { id: "a05", name: "A05", row: "A", position: 5, totalU: 42, usedU: 12, powerWatts: 1800, health: "healthy", tag: "Network", deviceCount: 9 },
  { id: "a06", name: "A06", row: "A", position: 6, totalU: 42, usedU: 0, powerWatts: 0, health: "empty", deviceCount: 0 },
  // Row B
  { id: "b01", name: "B01", row: "B", position: 1, totalU: 42, usedU: 40, powerWatts: 7100, health: "healthy", tag: "Compute", deviceCount: 15 },
  { id: "b02", name: "B02", row: "B", position: 2, totalU: 42, usedU: 28, powerWatts: 3900, health: "warning", tag: "Compute", deviceCount: 11 },
  { id: "b03", name: "B03", row: "B", position: 3, totalU: 42, usedU: 42, powerWatts: 5400, health: "healthy", tag: "Storage", deviceCount: 7 },
  { id: "b04", name: "B04", row: "B", position: 4, totalU: 42, usedU: 18, powerWatts: 2200, health: "offline", tag: "Spare", deviceCount: 4 },
  { id: "b05", name: "B05", row: "B", position: 5, totalU: 42, usedU: 35, powerWatts: 6700, health: "healthy", tag: "Compute", deviceCount: 13 },
  { id: "b06", name: "B06", row: "B", position: 6, totalU: 42, usedU: 8, powerWatts: 950, health: "healthy", tag: "Network", deviceCount: 5 },
  // Row C
  { id: "c01", name: "C01", row: "C", position: 1, totalU: 42, usedU: 42, powerWatts: 11200, health: "warning", tag: "GPU", deviceCount: 5 },
  { id: "c02", name: "C02", row: "C", position: 2, totalU: 42, usedU: 22, powerWatts: 3100, health: "healthy", tag: "Compute", deviceCount: 9 },
  { id: "c03", name: "C03", row: "C", position: 3, totalU: 42, usedU: 0, powerWatts: 0, health: "empty", deviceCount: 0 },
  { id: "c04", name: "C04", row: "C", position: 4, totalU: 42, usedU: 33, powerWatts: 5800, health: "healthy", tag: "Storage", deviceCount: 6 },
  { id: "c05", name: "C05", row: "C", position: 5, totalU: 42, usedU: 41, powerWatts: 7400, health: "critical", tag: "Compute", deviceCount: 15 },
  { id: "c06", name: "C06", row: "C", position: 6, totalU: 42, usedU: 15, powerWatts: 2100, health: "healthy", tag: "Network", deviceCount: 7 },
];

function utilizationPercent(rack: DataCenterRack): number {
  if (rack.totalU === 0) return 0;
  return Math.round((rack.usedU / rack.totalU) * 100);
}

function utilizationColor(pct: number): string {
  if (pct >= 95) return "#ef4444";
  if (pct >= 80) return "#f59e0b";
  if (pct >= 50) return "#3b82f6";
  if (pct > 0) return "#22c55e";
  return "#334155";
}

/* -------------------------------------------------------------------------- */
/* Sub-components                                                             */
/* -------------------------------------------------------------------------- */

function HealthBadge({ health }: { health: RackHealth }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        fontSize: 11,
        fontWeight: 500,
        color: HEALTH_COLORS[health],
      }}
    >
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: HEALTH_COLORS[health],
          boxShadow: `0 0 6px ${HEALTH_COLORS[health]}88`,
        }}
      />
      {HEALTH_LABELS[health]}
    </span>
  );
}

function RackTile({
  rack,
  isSelected,
  showPower,
  onClick,
}: {
  rack: DataCenterRack;
  isSelected: boolean;
  showPower: boolean;
  onClick: () => void;
}) {
  const pct = utilizationPercent(rack);
  const barColor = utilizationColor(pct);
  const isEmpty = rack.health === "empty" || rack.usedU === 0;

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: 96,
        background: isSelected ? "#1e293b" : "#0f172a",
        border: isSelected ? "2px solid #3b82f6" : "1px solid #1e293b",
        borderRadius: 8,
        padding: "10px 8px 8px",
        cursor: "pointer",
        textAlign: "left",
        color: "#e2e8f0",
        boxShadow: isSelected
          ? "0 0 0 2px #3b82f688, 0 4px 12px rgba(0,0,0,0.4)"
          : "0 2px 6px rgba(0,0,0,0.25)",
        transition: "border-color 0.15s, box-shadow 0.15s, background 0.15s",
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}
    >
      {/* Name + health dot */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontWeight: 700, fontSize: 13, letterSpacing: "-0.01em" }}>
          {rack.name}
        </span>
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: HEALTH_COLORS[rack.health],
            boxShadow: `0 0 5px ${HEALTH_COLORS[rack.health]}99`,
            flexShrink: 0,
          }}
          title={HEALTH_LABELS[rack.health]}
        />
      </div>

      {/* Tag */}
      {rack.tag && (
        <span
          style={{
            fontSize: 10,
            color: "#64748b",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {rack.tag}
        </span>
      )}

      {/* Utilization bar */}
      <div style={{ marginTop: 2 }}>
        <div
          style={{
            height: 6,
            borderRadius: 3,
            background: "#1e293b",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${pct}%`,
              background: barColor,
              borderRadius: 3,
              transition: "width 0.3s",
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 3,
            fontSize: 10,
            color: "#94a3b8",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          <span>{rack.usedU}/{rack.totalU}U</span>
          <span style={{ color: barColor, fontWeight: 600 }}>{pct}%</span>
        </div>
      </div>

      {/* Power */}
      {showPower && !isEmpty && (
        <div
          style={{
            fontSize: 10,
            color: "#64748b",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {(rack.powerWatts / 1000).toFixed(1)} kW
        </div>
      )}
    </button>
  );
}

function DetailCard({
  rack,
  onClose,
}: {
  rack: DataCenterRack | null;
  onClose: () => void;
}) {
  if (!rack) {
    return (
      <div style={cardStyle}>
        <p style={{ margin: 0, color: "#64748b", fontSize: 13 }}>
          Select a rack to view details
        </p>
      </div>
    );
  }

  const pct = utilizationPercent(rack);

  return (
    <div style={cardStyle}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#f8fafc" }}>
          {rack.name}
        </h3>
        <button
          type="button"
          onClick={onClose}
          style={{
            background: "transparent",
            border: "none",
            color: "#94a3b8",
            cursor: "pointer",
            fontSize: 18,
            lineHeight: 1,
            padding: 4,
          }}
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <HealthBadge health={rack.health} />

      <dl
        style={{
          margin: "14px 0 0",
          display: "grid",
          gap: 8,
          fontSize: 12,
        }}
      >
        {[
          ["Row", rack.row],
          ["Position", String(rack.position)],
          ["Capacity", `${rack.usedU} / ${rack.totalU} U (${pct}%)`],
          ["Power", `${(rack.powerWatts / 1000).toFixed(2)} kW`],
          ["Devices", rack.deviceCount != null ? String(rack.deviceCount) : "—"],
          ["Tag", rack.tag],
        ]
          .filter(([, v]) => v != null && v !== "")
          .map(([label, value]) => (
            <div
              key={label}
              style={{ display: "grid", gridTemplateColumns: "80px 1fr", gap: 8 }}
            >
              <dt style={{ margin: 0, color: "#64748b" }}>{label}</dt>
              <dd style={{ margin: 0, color: "#e2e8f0", fontWeight: 500 }}>{value}</dd>
            </div>
          ))}
      </dl>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  background: "#0f172a",
  border: "1px solid #1e293b",
  borderRadius: 8,
  padding: 16,
  minHeight: 160,
};

function StatPill({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: string;
}) {
  return (
    <div
      style={{
        background: "#0f172a",
        border: "1px solid #1e293b",
        borderRadius: 8,
        padding: "10px 14px",
        minWidth: 90,
      }}
    >
      <div
        style={{
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          color: "#64748b",
          marginBottom: 2,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: accent ?? "#f1f5f9",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function Legend() {
  const items: RackHealth[] = ["healthy", "warning", "critical", "offline", "empty"];
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "8px 16px",
        fontSize: 11,
        color: "#94a3b8",
      }}
    >
      {items.map((h) => (
        <div key={h} style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: HEALTH_COLORS[h],
            }}
          />
          {HEALTH_LABELS[h]}
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Main component                                                             */
/* -------------------------------------------------------------------------- */

export function DataCenterApp({
  name = "DC-East-01",
  location = "Ashburn, VA · Hall 2",
  racks = DEMO_RACKS,
  onRackSelect,
  className,
  showPower = true,
}: DataCenterAppProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedRack = useMemo(
    () => racks.find((r) => r.id === selectedId) ?? null,
    [racks, selectedId]
  );

  const handleSelect = useCallback(
    (rack: DataCenterRack | null) => {
      setSelectedId(rack?.id ?? null);
      onRackSelect?.(rack);
    },
    [onRackSelect]
  );

  // Group racks by row, sorted by position
  const rows = useMemo(() => {
    const map = new Map<string, DataCenterRack[]>();
    for (const r of racks) {
      const list = map.get(r.row) ?? [];
      list.push(r);
      map.set(r.row, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.position - b.position);
    }
    // Sort row keys alphabetically / numerically
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }));
  }, [racks]);

  // Aggregate stats
  const stats = useMemo(() => {
    const totalRacks = racks.length;
    const active = racks.filter((r) => r.health !== "empty").length;
    const totalU = racks.reduce((s, r) => s + r.totalU, 0);
    const usedU = racks.reduce((s, r) => s + r.usedU, 0);
    const totalPower = racks.reduce((s, r) => s + r.powerWatts, 0);
    const alerts = racks.filter(
      (r) => r.health === "warning" || r.health === "critical" || r.health === "offline"
    ).length;
    return { totalRacks, active, totalU, usedU, totalPower, alerts };
  }, [racks]);

  return (
    <div
      className={className}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 20,
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: "#e2e8f0",
        maxWidth: 900,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "#f8fafc",
            }}
          >
            {name}
          </h2>
          <p style={{ margin: "3px 0 0", fontSize: 13, color: "#64748b" }}>
            {location}
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <StatPill label="Racks" value={`${stats.active}/${stats.totalRacks}`} />
          <StatPill
            label="Capacity"
            value={`${Math.round((stats.usedU / stats.totalU) * 100) || 0}%`}
            accent={utilizationColor(Math.round((stats.usedU / stats.totalU) * 100))}
          />
          <StatPill
            label="Power"
            value={`${(stats.totalPower / 1000).toFixed(1)} kW`}
          />
          <StatPill
            label="Alerts"
            value={stats.alerts}
            accent={stats.alerts > 0 ? "#ef4444" : "#22c55e"}
          />
        </div>
      </div>

      {/* Floor plan + detail */}
      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* Rows */}
        <div style={{ flex: "1 1 480px", display: "flex", flexDirection: "column", gap: 20 }}>
          {rows.map(([rowId, rowRacks], rowIndex) => (
            <div key={rowId}>
              {/* Cold aisle label (between rows) */}
              {rowIndex > 0 && (
                <div
                  style={{
                    textAlign: "center",
                    fontSize: 10,
                    color: "#475569",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    marginBottom: 10,
                    padding: "4px 0",
                    background:
                      "repeating-linear-gradient(90deg, transparent, transparent 8px, #1e293b44 8px, #1e293b44 16px)",
                    borderRadius: 4,
                  }}
                >
                  Cold Aisle
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                {/* Row label */}
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    background: "#1e293b",
                    border: "1px solid #334155",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: 13,
                    color: "#94a3b8",
                    flexShrink: 0,
                  }}
                >
                  {rowId}
                </div>

                {/* Rack tiles */}
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                    padding: "10px 12px",
                    background: "#020617",
                    border: "1px solid #1e293b",
                    borderRadius: 10,
                    boxShadow: "inset 0 1px 0 #1e293b",
                  }}
                >
                  {rowRacks.map((rack) => (
                    <RackTile
                      key={rack.id}
                      rack={rack}
                      isSelected={rack.id === selectedId}
                      showPower={showPower}
                      onClick={() => handleSelect(rack)}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Side detail panel */}
        <div
          style={{
            flex: "0 0 220px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <DetailCard rack={selectedRack} onClose={() => handleSelect(null)} />
          <Legend />
        </div>
      </div>
    </div>
  );
}

export default DataCenterApp;
