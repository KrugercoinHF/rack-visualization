# Rack Visualization

Interactive **server rack** and **data center floor** visualization components built with React + TypeScript.

## Components

| File | Description |
|------|-------------|
| `src/components/rack-app.tsx` | Single 42U rack with devices, status indicators, and detail panel |
| `src/components/data-center-app.tsx` | Multi-rack data center floor view with rows, utilization, and health |
| `rack-preview.html` | Standalone static demo (open directly in a browser) |

## Quick start (static preview)

```bash
open rack-preview.html   # macOS
```

## React / Vite setup

```bash
npm create vite@latest rack-viz -- --template react-ts
cd rack-viz
npm install

# Copy the two .tsx files into src/components/
# Then use them in App.tsx (see example below)

npm run dev
```

### Example `App.tsx`

```tsx
import { RackApp } from "./components/rack-app";
import { DataCenterApp } from "./components/data-center-app";

export default function App() {
  return (
    <div style={{ padding: 32, background: "#020617", minHeight: "100vh" }}>
      <RackApp />
      <div style={{ marginTop: 64 }}>
        <DataCenterApp />
      </div>
    </div>
  );
}
```

## Features

- Realistic 42U rack chassis with side rails
- Color-coded device types (server, switch, storage, GPU, UPS, PDU, KVM…)
- Health / status indicators
- Click-to-select detail panels
- Data center floor layout with rows and cold aisles
- Utilization bars, power totals, and alert counts
- Fully typed TypeScript, zero external UI dependencies

## License

MIT
