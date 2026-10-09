import React, { useState, useMemo, useCallback } from "react";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type DeviceType =
  | "server"
  | "switch"
  | "router"
  | "storage"
  | "pdu"
  | "ups"
  | "blank"
  | "kvm"
  | "other";

export type DeviceStatus = "online" | "warning" | "critical" | "offline" | "unknown";

export interface RackDevice {
  id: string;
  name: string;
  type: DeviceType;
  /** 1-based unit position from the bottom of the rack */
  startU: number;
  /** Height in rack units */
  heightU: number;
  status?: DeviceStatus;
  manufacturer?: string;
  model?: string;
  serial?: string;
  powerWatts?: number;
  notes?: string;
}

export interface RackAppProps {
  /** Total rack height in U (default 42) */
  rackUnits?: number;
  /** Devices currently installed */
  devices?: RackDevice[];
  /** Rack name / identifier shown in the header */
  rackName?: string;
  /** Optional location / datacenter label */
  location?: string;
  /** Called when a device is selected */
  onDeviceSelect?: (device: RackDevice | null) => void;
  /** Allow clicking empty units */
  onEmptyUnitClick?: (unit: number) => void;
  /** Extra class name for the root container */
  className?: string;
  /** Compact mode (smaller unit height) */
  compact?: boolean;
}

/* -------------------------------------------------------------------------- */
/* Constants & helpers                                                        */
/* -------------------------------------------------------------------------- */

const DEVICE_COLORS: Record<DeviceType, string> = {
  server: "#3b82f6",
  switch: "#10b981",
  router: "#8b5cf6",
  storage: "#f59e0b",
  pdu: "#64748b",
  ups: "#ef4444",
  blank: "#1e293b",
  kvm: "#06b6d4",
  other: "#94a3b8",
};

const STATUS_COLORS: Record<DeviceStatus, string> = {
  online: "#22c55e",
  warning: "#eab308",
  critical: "#ef4444",
  offline: "#6b7280",
  unknown: "#94a3b8",
};

const TYPE_LABELS: Record<DeviceType, string> = {
  server: "Server",
  switch: "Switch",
  router: "Router",
  storage: "Storage",
  pdu: "PDU",
  ups: "UPS",
  blank: "Blank Panel",
  kvm: "KVM",
  other: "Other",
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

/** Build a lookup of which device occupies each U */
function buildUnitMap(devices: RackDevice[], rackUnits: number) {
  const map = new Map<number, RackDevice>();
  for (const d of devices) {
    const start = clamp(d.startU, 1, rackUnits);
    const end = clamp(start + d.heightU - 1, 1, rackUnits);
    for (let u = start; u <= end; u++) {
      map.set(u, d);
    }
  }
  return map;
}

/** Sample data so the component looks good out of the box */
const DEMO_DEVICES: RackDevice[] = [
  {
    id: "pdu-1",
    name: "PDU-A (Left)",
    type: "pdu",
    startU: 1,
    heightU: 1,
    status: "online",
    manufacturer: "APC",
    model: "AP8853",
  },
  {
    id: "ups-1",
    name: "UPS-Primary",
    type: "ups",
    startU: 2,
    heightU: 3,
    status: "online",
    manufacturer: "Eaton",
    model: "9PX3000",
    powerWatts: 2700,
  },
  {
    id: "sw-1",
    name: "Core-SW-01",
    type: "switch",
    startU: 6,
    heightU: 1,
    status: "online",
    manufacturer: "Cisco",
    model: "Nexus 9336C",
  },
  {
    id: "sw-2",
    name: "ToR-SW-02",
    type: "switch",
    startU: 7,
    heightU: 1,
    status: "warning",
    manufacturer: "Arista",
    model: "7050SX3",
  },
  {
    id: "srv-1",
    name: "compute-01",
    type: "server",
    startU: 10,
    heightU: 2,
    status: "online",
    manufacturer: "Dell",
    model: "R750",
    serial: "SRV-A1B2C3",
    powerWatts: 750,
  },
  {
    id: "srv-2",
    name: "compute-02",
    type: "server",
    startU: 12,
    heightU: 2,
    status: "online",
    manufacturer: "Dell",
    model: "R750",
    serial: "SRV-D4E5F6",
    powerWatts: 780,
  },
  {
    id: "srv-3",
    name: "compute-03",
    type: "server",
    startU: 14,
    heightU: 2,
    status: "critical",
    manufacturer: "HPE",
    model: "DL380 Gen10",
    serial: "SRV-G7H8I9",
    powerWatts: 820,
  },
  {
    id: "sto-1",
    name: "SAN-Array-01",
    type: "storage",
    startU: 18,
    heightU: 4,
    status: "online",
    manufacturer: "NetApp",
    model: "AFF A250",
    powerWatts: 1100,
  },
  {
    id: "blank-1",
    name: "Blank",
    type: "blank",
    startU: 22,
    heightU: 1,
  },
  {
    id: "kvm-1",
    name: "KVM-Switch",
    type: "kvm",
    startU: 24,
    heightU: 1,
    status: "online",
    manufacturer: "Aten",
    model: "CL5708",
  },
  {
    id: "srv-4",
    name: "gpu-node-01",
    type: "server",
    startU: 28,
    heightU: 4,
    status: "online",
    manufacturer: "Supermicro",
    model: "SYS-420GP-TNR",
    powerWatts: 2400,
    notes: "8× A100 GPUs",
  },
  {
    id: "rtr-1",
    name: "Edge-Router",
    type: "router",
    startU: 40,
    heightU: 1,
    status: "online",
    manufacturer: "Juniper",
    model: "MX204",
  },
  {
    id: "pdu-2",
    name: "PDU-B (Right)",
    type: "pdu",
    startU: 42,
    heightU: 1,
    status: "online",
    manufacturer: "APC",
    model: "AP8853",
  },
];

/* -------------------------------------------------------------------------- */
/* Sub-components                                                             */
/* -------------------------------------------------------------------------- */

function StatusDot({ status }: { status?: DeviceStatus }) {
  const color = STATUS_COLORS[status ?? "unknown"];
  return (
    <span
      style={{
        display: "inline-block",
        width: 8,
        height: 8,
        borderRadius: "50%",
        backgroundColor: color,
        boxShadow: `0 0 6px ${color}88`,
        flexShrink: 0,
      }}
      title={status ?? "unknown"}
    />
  );
}

function DeviceBlock({
  device,
  unitHeight,
  isSelected,
  onClick,
}: {
  device: RackDevice;
  unitHeight: number;
  isSelected: boolean;
  onClick: () => void;
}) {
  const bg = DEVICE_COLORS[device.type] ?? DEVICE_COLORS.other;
  const isBlank = device.type === "blank";

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      style={{
        position: "absolute",
        left: 28,
        right: 28,
        height: device.heightU * unitHeight - 2,
        top: 1,
        background: isBlank
          ? "repeating-linear-gradient(-45deg, #1e293b, #1e293b 4px, #0f172a 4px, #0f172a 8px)"
          : `linear-gradient(180deg, ${bg}ee 0%, ${bg}cc 100%)`,
        border: isSelected ? "2px solid #f8fafc" : "1px solid rgba(255,255,255,0.15)",
        borderRadius: 4,
        boxShadow: isSelected
          ? "0 0 0 2px #3b82f6, 0 4px 12px rgba(0,0,0,0.4)"
          : "0 2px 4px rgba(0,0,0,0.3)",
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "0 10px",
        cursor: "pointer",
        overflow: "hidden",
        color: "#f1f5f9",
        fontSize: 12,
        fontWeight: 500,
        textAlign: "left",
        transition: "box-shadow 0.15s, border-color 0.15s",
        zIndex: isSelected ? 10 : 1,
      }}
    >
      {!isBlank && (
        <>
          <StatusDot status={device.status} />
          <span
            style={{
              flex: 1,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {device.name}
          </span>
          {device.heightU > 1 && (
            <span
              style={{
                fontSize: 10,
                opacity: 0.7,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {device.heightU}U
            </span>
          )}
        </>
      )}
    </button>
  );
}

function DetailPanel({
  device,
  onClose,
}: {
  device: RackDevice | null;
  onClose: () => void;
}) {
  if (!device) {
    return (
      <div style={panelStyle}>
        <div style={{ color: "#64748b", fontSize: 13 }}>
          Select a device to view details
        </div>
      </div>
    );
  }

  const rows: [string, string | number | undefined][] = [
    ["Type", TYPE_LABELS[device.type]],
    ["Position", `U${device.startU} – U${device.startU + device.heightU - 1}`],
    ["Height", `${device.heightU}U`],
    ["Status", device.status ?? "—"],
    ["Manufacturer", device.manufacturer],
    ["Model", device.model],
    ["Serial", device.serial],
    ["Power", device.powerWatts != null ? `${device.powerWatts} W` : undefined],
    ["Notes", device.notes],
  ];

  return (
    <div style={panelStyle}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: 15,
            fontWeight: 600,
            color: "#f1f5f9",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <StatusDot status={device.status} />
          {device.name}
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

      <div
        style={{
          height: 3,
          borderRadius: 2,
          background: DEVICE_COLORS[device.type],
          marginBottom: 14,
        }}
      />

      <dl style={{ margin: 0, display: "grid", gap: 8 }}>
        {rows
          .filter(([, v]) => v != null && v !== "")
          .map(([label, value]) => (
            <div
              key={label}
              style={{
                display: "grid",
                gridTemplateColumns: "90px 1fr",
                gap: 8,
                fontSize: 12,
              }}
            >
              <dt style={{ color: "#64748b", margin: 0 }}>{label}</dt>
              <dd
                style={{
                  margin: 0,
                  color: "#e2e8f0",
                  fontWeight: 500,
                  wordBreak: "break-word",
                }}
              >
                {String(value)}
              </dd>
            </div>
          ))}
      </dl>
    </div>
  );
}

const panelStyle: React.CSSProperties = {
  background: "#0f172a",
  border: "1px solid #1e293b",
  borderRadius: 8,
  padding: 16,
  minHeight: 180,
};

function Legend() {
  const items = (Object.keys(DEVICE_COLORS) as DeviceType[]).filter(
    (t) => t !== "blank" && t !== "other"
  );
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "8px 14px",
        fontSize: 11,
        color: "#94a3b8",
      }}
    >
      {items.map((type) => (
        <div key={type} style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: 2,
              background: DEVICE_COLORS[type],
            }}
          />
          {TYPE_LABELS[type]}
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Main component                                                             */
/* -------------------------------------------------------------------------- */

export function RackApp({
  rackUnits = 42,
  devices = DEMO_DEVICES,
  rackName = "RACK-A01",
  location = "DC1 · Row 3",
  onDeviceSelect,
  onEmptyUnitClick,
  className,
  compact = false,
}: RackAppProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const unitHeight = compact ? 18 : 24;
  const unitMap = useMemo(
    () => buildUnitMap(devices, rackUnits),
    [devices, rackUnits]
  );

  const selectedDevice = useMemo(
    () => devices.find((d) => d.id === selectedId) ?? null,
    [devices, selectedId]
  );

  const handleSelect = useCallback(
    (device: RackDevice | null) => {
      setSelectedId(device?.id ?? null);
      onDeviceSelect?.(device);
    },
    [onDeviceSelect]
  );

  // Render units from top (highest U) to bottom (U1)
  const units = useMemo(() => {
    const list: number[] = [];
    for (let u = rackUnits; u >= 1; u--) list.push(u);
    return list;
  }, [rackUnits]);

  // Track which devices we've already rendered (so multi-U devices appear once)
  const renderedDevices = new Set<string>();

  const usedU = devices.reduce((sum, d) => sum + d.heightU, 0);
  const freeU = rackUnits - usedU;
  const totalPower = devices.reduce((sum, d) => sum + (d.powerWatts ?? 0), 0);

  return (
    <div
      className={className}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: "#e2e8f0",
        maxWidth: 720,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "#f8fafc",
            }}
          >
            {rackName}
          </h2>
          <p style={{ margin: "2px 0 0", fontSize: 12, color: "#64748b" }}>
            {location} · {rackUnits}U
          </p>
        </div>
        <div
          style={{
            display: "flex",
            gap: 16,
            fontSize: 12,
            color: "#94a3b8",
            textAlign: "right",
          }}
        >
          <div>
            <div style={{ color: "#64748b", fontSize: 10, textTransform: "uppercase" }}>
              Used
            </div>
            <div style={{ fontWeight: 600, color: "#e2e8f0" }}>
              {usedU}U / {rackUnits}U
            </div>
          </div>
          <div>
            <div style={{ color: "#64748b", fontSize: 10, textTransform: "uppercase" }}>
              Free
            </div>
            <div style={{ fontWeight: 600, color: freeU > 0 ? "#22c55e" : "#ef4444" }}>
              {freeU}U
            </div>
          </div>
          <div>
            <div style={{ color: "#64748b", fontSize: 10, textTransform: "uppercase" }}>
              Power
            </div>
            <div style={{ fontWeight: 600, color: "#e2e8f0" }}>
              {(totalPower / 1000).toFixed(1)} kW
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        {/* Rack chassis */}
        <div
          style={{
            flex: "0 0 auto",
            background: "#020617",
            border: "2px solid #334155",
            borderRadius: 6,
            boxShadow:
              "inset 0 0 0 1px #1e293b, 0 8px 24px rgba(0,0,0,0.5)",
            padding: "6px 0",
            position: "relative",
            userSelect: "none",
          }}
        >
          {/* Side rails visual */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: 22,
              background:
                "repeating-linear-gradient(180deg, #1e293b 0px, #1e293b 2px, #0f172a 2px, #0f172a 12px)",
              borderRight: "1px solid #334155",
              borderRadius: "4px 0 0 4px",
            }}
          />
          <div
            style={{
              position: "absolute",
              right: 0,
              top: 0,
              bottom: 0,
              width: 22,
              background:
                "repeating-linear-gradient(180deg, #1e293b 0px, #1e293b 2px, #0f172a 2px, #0f172a 12px)",
              borderLeft: "1px solid #334155",
              borderRadius: "0 4px 4px 0",
            }}
          />

          {units.map((u) => {
            const device = unitMap.get(u);
            const isFirstUnitOfDevice =
              device && device.startU + device.heightU - 1 === u;
            // We render the device block on its topmost unit
            const shouldRenderDevice =
              device && isFirstUnitOfDevice && !renderedDevices.has(device.id);

            if (shouldRenderDevice && device) {
              renderedDevices.add(device.id);
            }

            const isOccupied = !!device;
            const isSelected = device?.id === selectedId;

            return (
              <div
                key={u}
                onClick={() => {
                  if (!isOccupied) {
                    onEmptyUnitClick?.(u);
                    handleSelect(null);
                  }
                }}
                style={{
                  position: "relative",
                  height: unitHeight,
                  borderBottom: u > 1 ? "1px solid #1e293b" : "none",
                  background:
                    u % 2 === 0 ? "rgba(15,23,42,0.6)" : "rgba(15,23,42,0.3)",
                  cursor: isOccupied ? "default" : "pointer",
                }}
              >
                {/* Unit number (left) */}
                <span
                  style={{
                    position: "absolute",
                    left: 4,
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: 9,
                    fontWeight: 600,
                    color: "#475569",
                    fontVariantNumeric: "tabular-nums",
                    width: 16,
                    textAlign: "right",
                    pointerEvents: "none",
                  }}
                >
                  {u}
                </span>

                {/* Unit number (right) */}
                <span
                  style={{
                    position: "absolute",
                    right: 4,
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: 9,
                    fontWeight: 600,
                    color: "#475569",
                    fontVariantNumeric: "tabular-nums",
                    width: 16,
                    textAlign: "left",
                    pointerEvents: "none",
                  }}
                >
                  {u}
                </span>

                {shouldRenderDevice && device && (
                  <DeviceBlock
                    device={device}
                    unitHeight={unitHeight}
                    isSelected={isSelected}
                    onClick={() => handleSelect(device)}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Side panel */}
        <div style={{ flex: 1, minWidth: 200, display: "flex", flexDirection: "column", gap: 12 }}>
          <DetailPanel
            device={selectedDevice}
            onClose={() => handleSelect(null)}
          />
          <Legend />
        </div>
      </div>
    </div>
  );
}

export default RackApp;
