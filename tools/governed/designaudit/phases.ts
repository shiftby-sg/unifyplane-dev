import { runDesignAuditPhase1 } from "./phase1.js";
import { runDesignAuditPhase2 } from "./phase2.js";
import { runDesignAuditPhase3 } from "./phase3.js";
import { runDesignAuditPhase4 } from "./phase4.js";
import { runDesignAuditPhase5 } from "./phase5.js";
import { runDesignAuditPhase6 } from "./phase6.js";
import { runDesignAuditPhase7 } from "./phase7.js";
import { runDesignAuditPhase8 } from "./phase8.js";
import { runDesignAuditPhase9 } from "./phase9.js";
import { runDesignAuditPhase10 } from "./phase10.js";
import { runDesignAuditPhase11 } from "./phase11.js";

export async function runDesignAuditPhase(args: {
  phase: number;
  runDir: string;
  runId: string;
  prevApprovedRunDir: string | null;
}): Promise<void> {
  if (args.phase === 1) return await runDesignAuditPhase1(args);
  if (args.phase === 2) return await runDesignAuditPhase2(args);
  if (args.phase === 3) return await runDesignAuditPhase3(args);
  if (args.phase === 4) return await runDesignAuditPhase4(args);
  if (args.phase === 5) return await runDesignAuditPhase5(args);
  if (args.phase === 6) return await runDesignAuditPhase6(args);
  if (args.phase === 7) return await runDesignAuditPhase7(args);
  if (args.phase === 8) return await runDesignAuditPhase8(args);
  if (args.phase === 9) return await runDesignAuditPhase9(args);
  if (args.phase === 10) return await runDesignAuditPhase10(args);
  if (args.phase === 11) return await runDesignAuditPhase11(args);
  throw new Error(`Design audit phase ${args.phase} not implemented.`);
}

