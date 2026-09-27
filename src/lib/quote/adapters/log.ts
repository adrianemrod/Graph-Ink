import type { DeliveryAdapter } from "../types";
import { submissionText } from "../format";

/** Development only: prints submissions to the server console. */
export const logAdapter: DeliveryAdapter = {
  name: "log",
  async deliver(s) {
    console.info(`\n──── GraphInk submission ────\n${submissionText(s)}\n─────────────────────────────\n`);
  },
};
