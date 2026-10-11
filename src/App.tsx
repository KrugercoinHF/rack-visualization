import { DataCenterApp } from "./components/data-center-app";
import { RackApp } from "./components/rack-app";

type WorkerClass =
  | "CPU Developer"
  | "GPU Inference"
  | "GPU Training"
  | "ML Model Server"
  | "Windows Desktop"
  | "Isolated Container";

type CapabilityStatus = "ready" | "limited" | "missing";

interface CapabilityItem {
  label: string;
  value: string;
  status: CapabilityStatus;
}

interface WorkerNode {
  id: string;
  name: string;
  className: WorkerClass;
  status: "ready" | "degraded" | "offline";
  role: string;
  runtime: string;
  cpu: string;
  memory: string;
  gpu: string;
  capabilities: CapabilityItem[];
}

const workers: WorkerNode[] = [
  {
    id: "cpu-dev",
    name: "cpu-node-01",
    className: "CPU Developer",
    status: "ready",
    role: "Build, lint, repo analysis",
    runtime: "Linux / x86_64",
    cpu: "16 vCPU",
    memory: "64 GB",
    gpu: "No GPU",
    capabilities: [
      { label: "CPU architecture", value: "x86_64", status: "ready" },
      { label: "RAM", value: "64 GB", status: "ready" },
      { label: "Docker", value: "Installed", status: "ready" },
      { label: "Git", value: "Available", status: "ready" },
      { label: "Python", value: "3.12", status: "ready" },
      { label: "Node.js", value: "20 LTS", status: "ready" },
      { label: "CUDA", value: "Not detected", status: "missing" },
    ],
  },
  {
    id: "gpu-infer",
    name: "gpu-infer-02",
    className: "GPU Inference",
    status: "ready",
    role: "Serve inference models", 
    runtime: "Linux + CUDA",
    cpu: "32 vCPU",
    memory: "128 GB",
    gpu: "NVIDIA RTX 6000 Ada / 48 GB VRAM",
    capabilities: [
      { label: "CPU architecture", value: "x86_64", status: "ready" },
      { label: "RAM", value: "128 GB", status: "ready" },
      { label: "CUDA", value: "12.6", status: "ready" },
      { label: "NVIDIA GPU", value: "Detected", status: "ready" },
      { label: "vLLM", value: "Available", status: "ready" },
      { label: "Ollama", value: "Ready", status: "ready" },
      { label: "Windows desktop", value: "No", status: "missing" },
    ],
  },
  {
    id: "gpu-train",
    name: "gpu-train-01",
    className: "GPU Training",
    status: "degraded",
    role: "Fine-tuning and training jobs",
    runtime: "Linux + CUDA + NCCL",
    cpu: "48 vCPU",
    memory: "256 GB",
    gpu: "2x A100 / 80 GB each",
    capabilities: [
      { label: "CPU architecture", value: "x86_64", status: "ready" },
      { label: "RAM", value: "256 GB", status: "ready" },
      { label: "CUDA", value: "12.6", status: "ready" },
      { label: "NVIDIA GPU", value: "2x A100", status: "ready" },
      { label: "GPU VRAM", value: "160 GB total", status: "ready" },
      { label: "Driver", value: "550.54.14", status: "ready" },
      { label: "vLLM", value: "Optional", status: "limited" },
    ],
  },
  {
    id: "ml-server",
    name: "ml-server-03",
    className: "ML Model Server",
    status: "ready",
    role: "Host models and performance scoring",
    runtime: "Linux + Docker + vLLM",
    cpu: "24 vCPU",
    memory: "96 GB",
    gpu: "NVIDIA L4 / 24 GB VRAM",
    capabilities: [
      { label: "CPU architecture", value: "x86_64", status: "ready" },
      { label: "RAM", value: "96 GB", status: "ready" },
      { label: "Docker", value: "Active", status: "ready" },
      { label: "vLLM", value: "Running", status: "ready" },
      { label: "Ollama", value: "Trial mode", status: "limited" },
      { label: "Python", value: "3.11", status: "ready" },
      { label: "CUDA", value: "Detected", status: "ready" },
    ],
  },
  {
    id: "windows-desktop",
    name: "windows-desktop-04",
    className: "Windows Desktop",
    status: "ready",
    role: "GUI automation and desktop integrations",
    runtime: "Windows 11",
    cpu: "12 vCPU",
    memory: "32 GB",
    gpu: "RTX 4060 / 8 GB VRAM",
    capabilities: [
      { label: "Operating system", value: "Windows 11", status: "ready" },
      { label: "Desktop", value: "Enabled", status: "ready" },
      { label: "Docker", value: "Installed", status: "ready" },
      { label: "Git", value: "Available", status: "ready" },
      { label: "Python", value: "3.12", status: "ready" },
      { label: "Node.js", value: "20 LTS", status: "ready" },
      { label: "CUDA", value: "Available", status: "limited" },
    ],
  },
  {
    id: "isolated",
    name: "sandbox-ephemeral",
    className: "Isolated Container",
    status: "offline",
    role: "Ephemeral testing and canary jobs",
    runtime: "Docker-in-Docker",
    cpu: "8 vCPU",
    memory: "16 GB",
    gpu: "None",
    capabilities: [
      { label: "Docker", value: "Enabled", status: "ready" },
      { label: "Git", value: "Available", status: "ready" },
      { label: "Python", value: "3.12", status: "ready" },
      { label: "NVIDIA GPU", value: "No", status: "missing" },
      { label: "CNCF Verification", value: "Pending", status: "limited" },
      { label: "Emergency stop", value: "Configured", status: "ready" },
    ],
  },
];

const workloadPlan = [
  { task: "Lint and build", worker: "CPU Developer", fit: "Ideal", reason: "Fast reproducible checks and repo validation" },
  { task: "LLM inference", worker: "GPU Inference", fit: "Ideal", reason: "High throughput served via vLLM/ONNX runtime" },
  { task: "Fine-tuning", worker: "GPU Training", fit: "Ideal", reason: "Full CUDA and VRAM capacity for training loops" },
  { task: "Model serving", worker: "ML Model Server", fit: "Ideal", reason: "Low-latency serving and model health checks" },
  { task: "GUI automation", worker: "Windows Desktop", fit: "Recommended", reason: "Desktop app testing and remote interactions" },
  { task: "Canary launch", worker: "Isolated Container", fit: "Safe", reason: "Staged rollout isolated from production" },
];

const engineeringLoop = [
  "Observe",
  "Benchmark",
  "Compare",
  "Propose",
  "Review",
  "Implement",
  "Test",
  "Canary",
  "Measure",
  "Adopt / Rollback",
];

const compatibilityMatrix = [
  { area: "Windows 10/11", status: "ready" },
  { area: "Linux", status: "ready" },
  { area: "macOS", status: "checked" },
  { area: "Development environments", status: "ready" },
  { area: "Native apps / IDEs", status: "ready" },
  { area: "GUI automation", status: "ready" },
  { area: "Remote desktop", status: "checked" },
  { area: "Secure remote workers", status: "ready" },
  { area: "Emergency stop", status: "ready" },
  { area: "Auditing", status: "planned" },
];

const updateGuardrails = [
  "SHA-256 verification",
  "Operator approval required",
  "Backup before apply",
  "Staged package rollout",
  "Health verification",
  "Automatic rollback on failure",
];

function App() {
  const readyWorkers = workers.filter((worker) => worker.status !== "offline").length;
  const readyGpuWorkers = workers.filter((worker) => worker.gpu !== "None" && worker.gpu !== "No").length;

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">BUDDY • COMPUTE FABRIC</p>
          <h1>Buddy Computer Forge</h1>
        </div>
        <div className="version-pill">v0.9.0</div>
      </header>

      <main className="content">
        <section className="stat-grid">
          <div className="stat-card accent-blue">
            <span>Active workers</span>
            <strong>{readyWorkers}/{workers.length}</strong>
          </div>
          <div className="stat-card accent-green">
            <span>GPU-ready nodes</span>
            <strong>{readyGpuWorkers}</strong>
          </div>
          <div className="stat-card accent-purple">
            <span>Update guardrails</span>
            <strong>{updateGuardrails.length}</strong>
          </div>
          <div className="stat-card accent-orange">
            <span>Compatibility checks</span>
            <strong>{compatibilityMatrix.filter((item) => item.status !== "planned").length}/10</strong>
          </div>
        </section>

        <section className="panel hero-panel">
          <div>
            <p className="section-kicker">Mission planner</p>
            <h2>Real machine capability discovery</h2>
            <p>
              Buddy no longer assumes every machine can serve every model. The platform now records actual
              runtime capability, hardware availability, OS support, and platform fitness before selecting a worker.
            </p>
          </div>
          <div className="hero-metrics">
            {[
              { label: "CPU", value: "x86_64 / ARM" },
              { label: "RAM", value: "16 GB - 256 GB" },
              { label: "GPU", value: "NVIDIA / none" },
              { label: "OS", value: "Windows / Linux / macOS" },
            ].map((metric) => (
              <div className="metric-box" key={metric.label}>
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="panel-grid">
          <div className="panel">
            <div className="panel-header">
              <p className="section-kicker">Worker classes</p>
              <h3>Machine routing</h3>
            </div>
            <div className="worker-list">
              {workers.map((worker) => (
                <article key={worker.id} className={`worker-card state-${worker.status}`}>
                  <div className="worker-topline">
                    <div>
                      <div className="worker-name">{worker.name}</div>
                      <div className="worker-class">{worker.className}</div>
                    </div>
                    <span className={`status-badge status-${worker.status}`}>{worker.status}</span>
                  </div>

                  <dl className="worker-meta">
                    <div>
                      <dt>Role</dt>
                      <dd>{worker.role}</dd>
                    </div>
                    <div>
                      <dt>Runtime</dt>
                      <dd>{worker.runtime}</dd>
                    </div>
                    <div>
                      <dt>CPU</dt>
                      <dd>{worker.cpu}</dd>
                    </div>
                    <div>
                      <dt>Memory</dt>
                      <dd>{worker.memory}</dd>
                    </div>
                    <div>
                      <dt>GPU</dt>
                      <dd>{worker.gpu}</dd>
                    </div>
                  </dl>

                  <div className="capability-list">
                    {worker.capabilities.map((capability) => (
                      <div key={`${worker.id}-${capability.label}`} className="capability-item">
                        <span>{capability.label}</span>
                        <strong className={`capability-status ${capability.status}`}>{capability.value}</strong>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <p className="section-kicker">Task placement</p>
              <h3>Scheduler intent</h3>
            </div>
            <div className="scheduler-table">
              {workloadPlan.map((entry) => (
                <div key={entry.task} className="scheduler-row">
                  <div>
                    <div className="task-name">{entry.task}</div>
                    <div className="task-reason">{entry.reason}</div>
                  </div>
                  <div className="task-worker">{entry.worker}</div>
                  <div className={`task-fit fit-${entry.fit.toLowerCase().replace(/\s+/g, "-")}`}>{entry.fit}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="panel-grid">
          <div className="panel">
            <div className="panel-header">
              <p className="section-kicker">Engineering loop</p>
              <h3>Learning and breakthrough control</h3>
            </div>
            <div className="loop-list">
              {engineeringLoop.map((step, index) => (
                <div key={step} className="loop-step">
                  <span>{index + 1}</span>
                  <strong>{step}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <p className="section-kicker">Protected update path</p>
              <h3>Self-update controls</h3>
            </div>
            <ul className="guardrail-list">
              {updateGuardrails.map((guardrail) => (
                <li key={guardrail}>{guardrail}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <p className="section-kicker">Compatibility architecture</p>
            <h3>Supported operating environments</h3>
          </div>
          <div className="compat-grid">
            {compatibilityMatrix.map((item) => (
              <div key={item.area} className={`compat-item ${item.status}`}>
                <span>{item.area}</span>
                <strong>{item.status}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="rack-section">
          <div className="panel rack-panel">
            <div className="panel-header">
              <p className="section-kicker">Rack visualization</p>
              <h3>Single rack view</h3>
            </div>
            <RackApp rackName="BUDDY-RACK-A01" location="Compute floor · Row 3" />
          </div>

          <div className="panel rack-panel">
            <div className="panel-header">
              <p className="section-kicker">Data center view</p>
              <h3>Fabric overview</h3>
            </div>
            <DataCenterApp name="Compute Fabric" location="Ashburn, VA · Hall 2" />
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
