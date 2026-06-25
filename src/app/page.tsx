import { CutLabDashboard } from "@/components/CutLabDashboard";
import { createSeededCutLabRun } from "@/lib/demo-data";

export default function Home() {
  const run = createSeededCutLabRun();

  return <CutLabDashboard initialRun={run} />;
}
