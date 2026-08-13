# Optical-Fiber Route Planning & Link Budget Simulator

> A professional full-stack web application and telecom engineering decision-support tool for **optical fiber network planning**, geographic route distance calculation, optical link-budget analysis, and feasibility determination.

---

## 🌟 Executive Summary & Problem Statement

Optical fiber cables (OFC) are the backbone of modern telecommunications, 5G C-RAN fronthaul, and hyperscale data center connectivity. However, before laying physical fiber cables or deploying optical transceivers, network planning engineers must answer critical questions:

1. **Physical Feasibility**: Will the optical signal reaching the receiver photodiode exceed the sensitivity threshold after accounting for fiber attenuation, fusion splices, connector insertion losses, and safety margins?
2. **Geographic Routing**: What is the true span distance between POP switch nodes and customer endpoints over GIS map geometry?
3. **Multi-Route Optimization**: How do alternative physical paths compare when balancing distance, optical loss, splice points, and deployment cost?
4. **Site Readiness**: Is the target POP or base station infrastructure civilly and electrically prepared for fiber termination?

This application provides a **real working engineering simulator** to model these operational challenges, calculate deterministic optical power budgets, rank candidate fiber paths, and generate printable PDF engineering compliance reports.

---

## 🚀 Key Features

* **Interactive GIS Map & Route Planner**: OpenStreetMap + Leaflet interactive map with custom markers for POPs, Data Centers, Base Stations, NOCs, and Customer Sites. Allows node-by-node polyline route drawing and Haversine distance auto-calculation.
* **Deterministic Optical Link Budget Calculator**: Live calculation of fiber attenuation, fusion splice loss, connector insertion loss, physical link loss, received power, link margin, safety margin, and remaining margin.
* **Dynamic Optical Power Decay Cascade**: Interactive area chart and visual step cards depicting signal degradation step-by-step from laser launch (Tx) to receiver photodiode (Rx).
* **Multi-Criteria Route Comparison & Decision Support**: Side-by-side comparative matrix of alternative paths with configurable weight sliders (Distance, Loss, Cost, Splice count) and automated rank scoring out of 100.
* **Site Readiness Checklist**: 7-point infrastructure audit checklist (Coordinates, Power, Rack space, Civil ducts, Fiber termination points, Access permissions, Safety clearance) with automated readiness % scores.
* **1-Click Interview Demo Mode**: Prominent Demo Mode trigger button for instantaneous 3–5 minute interview walkthroughs (e.g. BLR-POP-01 to BLR-SITE-04, 25km link, 1550nm wavelength).
* **High Loss Simulation**: Toggle switch to simulate severe link degradation (70km long link over 1310nm standard fiber) demonstrating negative link margins.
* **PDF Engineering Compliance Reports**: Printable PDF generation built using client-side PDF synthesis (`jsPDF`).
* **Persistent History & Supabase Backend**: Complete PostgreSQL database schema with Row Level Security (RLS) policies and hybrid fallback for unconfigured offline demo environments.
* **16 Vitest Unit Tests**: Fully unit-tested calculation engine covering Haversine distance, link loss formulas, feasibility boundaries, and route scoring algorithms.

---

## 📐 Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 14/15 App Router |
| **Language** | TypeScript (Strict Type Safety) |
| **Styling** | Tailwind CSS + Technical Dark Theme |
| **Icons** | Lucide React Icons |
| **Maps** | Leaflet + React Leaflet + OpenStreetMap |
| **Charts** | Recharts (Responsive Area & Bar Charts) |
| **Database & Auth** | Supabase (PostgreSQL, Row Level Security) |
| **Validation** | Zod + React Hook Form |
| **PDF Export** | jsPDF |
| **Testing** | Vitest + JSDOM |

---

## 🧮 Optical Link Budget Formulas

The calculation engine implements the following deterministic formulas:

$$\text{Fiber Loss (dB)} = \text{Fiber Length (km)} \times \text{Attenuation Coefficient (dB/km)}$$

$$\text{Splice Loss (dB)} = \text{Splice Count} \times \text{Loss per Splice (dB)}$$

$$\text{Connector Loss (dB)} = \text{Connector Count} \times \text{Loss per Connector (dB)}$$

$$\text{Physical Link Loss (dB)} = \text{Fiber Loss} + \text{Splice Loss} + \text{Connector Loss} + \text{Additional System Loss}$$

$$\text{Received Power (dBm)} = \text{Tx Launch Power (dBm)} - \text{Physical Link Loss (dB)}$$

$$\text{Link Margin (dB)} = \text{Received Power (dBm)} - \text{Rx Sensitivity Threshold (dBm)}$$

$$\text{Remaining Safety Margin (dB)} = \text{Link Margin (dB)} - \text{Required Safety Margin (dB)}$$

$$\text{Link Feasibility} = \begin{cases} \mathbf{FEASIBLE} & \text{if Remaining Safety Margin} \ge 0 \\ \mathbf{NOT\ FEASIBLE} & \text{if Remaining Safety Margin} < 0 \end{cases}$$

---

## 🎬 3-to-5 Minute Interview Demonstration Guide

Follow these steps during a technical demonstration:

1. **Step 1 — Executive Dashboard**:
   - Navigate to `/dashboard`.
   - Highlight top-line metrics: Total Sites, Fiber Routes, Feasible vs Unfeasible links, Average Link Margin, and Total Planned Fiber Distance.
2. **Step 2 — Click "Demo Mode"**:
   - Click the prominent **Demo Mode** button in the header bar.
   - The app loads a realistic scenario: `BLR-POP-01` to `BLR-SITE-04` (25 km span, 1550 nm wavelength @ 0.22 dB/km, 10 splices, 4 connectors).
   - Observe the **Optical Power Decay Cascade** area chart step down from +3.00 dBm launch power to -6.50 dBm received power.
   - Confirm **LINK FEASIBLE** (+10.5 dB Remaining Safety Margin).
3. **Step 3 — High Loss Simulation**:
   - Click **Simulate High Loss** in the header.
   - The length changes to 70 km over 1310 nm fiber (0.35 dB/km) with 22 splices.
   - The engine dynamically recalculates and displays **LINK NOT FEASIBLE** (-12.8 dB Margin Deficit).
4. **Step 4 — Route Comparison & Decision Support**:
   - Navigate to `/route-comparison`.
   - Adjust the weight sliders (Distance 30%, Loss 30%, Cost 20%, Splices 20%).
   - Observe how the multi-criteria decision algorithm ranks `Route A` as #1 with a score of **91.4 / 100**.
5. **Step 5 — PDF Report Generation**:
   - Navigate to `/reports` and click **Download PDF Report**.
   - Review the generated engineering document complete with physical loss breakdowns and engineering disclaimers.

---

## 🛠️ Local Development & Installation

### 1. Clone Repository & Install Dependencies

```bash
git clone https://github.com/sheelganvir/Optical-Fiber-Route-Planning---Link-Budget-Simulator.git
cd Optical-Fiber-Route-Planning-&-Link-Budget-Simulator
npm install --legacy-peer-deps
```

### 2. Run Vitest Unit Test Suite

```bash
npm test
```
*Output: 16 passing unit tests verifying Haversine distances, physical link losses, margins, feasibility boundaries, and route ranking.*

### 3. Start Next.js Development Server

```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗄️ Database Setup & Supabase Migration

To connect to a live Supabase PostgreSQL instance:

1. Create a project at [supabase.com](https://supabase.com).
2. Copy the SQL script in `supabase/schema.sql` and run it in the Supabase SQL Editor.
3. Create `.env.local` in your root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

*Note: If Supabase keys are not set, the application operates seamlessly offline using its built-in local seed data engine.*

---

## 🔬 Engineering Assumptions & Limitations

1. **Simulation Model**: Fiber attenuation coefficients (0.35 dB/km @ 1310nm, 0.22 dB/km @ 1550nm) and splice losses (0.10 dB/splice) are industry standard simulation baselines. Field OTDR trace validation is mandatory prior to commercial commissioning.
2. **GIS Geometry vs Field Slack**: Route distance is calculated using the Haversine formula across polyline waypoints. Field cable deployment must account for 3%–5% extra cable slack loops.
3. **Cost Estimates**: Deployment cost calculations represent planning estimates and do not replace formal vendor bids.

---

## 📄 License

MIT License — Created for Telecom & Fiber Network Planning Engineering Applications.
