import { runImplementationPhase1 } from "./phase1.js";
import { runImplementationPhase2 } from "./phase2.js";
import { runImplementationPhase3 } from "./phase3.js";
import { runImplementationPhase4 } from "./phase4.js";
import { runImplementationPhase5 } from "./phase5.js";
import { runImplementationPhase6 } from "./phase6.js";
import { runImplementationPhase7 } from "./phase7.js";
import { runImplementationPhase8 } from "./phase8.js";
import { runImplementationPhase9 } from "./phase9.js";
import { runImplementationPhase10 } from "./phase10.js";
import { runImplementationPhase11 } from "./phase11.js";

export async function runImplementationPhase(args: {
  phase: number;
  runDir: string;
  runId: string;
  prevApprovedRunDir: string | null;
}): Promise<void> {
  if (args.phase === 1) return await runImplementationPhase1(args);
  if (args.phase === 2) return await runImplementationPhase2(args);
  if (args.phase === 3) return await runImplementationPhase3(args);
  if (args.phase === 4) return await runImplementationPhase4(args);
  if (args.phase === 5) return await runImplementationPhase5(args);
  if (args.phase === 6) return await runImplementationPhase6(args);
  if (args.phase === 7) return await runImplementationPhase7(args);
  if (args.phase === 8) return await runImplementationPhase8(args);
  if (args.phase === 9) return await runImplementationPhase9(args);
  if (args.phase === 10) return await runImplementationPhase10(args);
  if (args.phase === 11) return await runImplementationPhase11(args);
  throw new Error(`Implementation phase ${args.phase} not implemented.`);
}

