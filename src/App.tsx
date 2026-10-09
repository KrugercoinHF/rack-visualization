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
