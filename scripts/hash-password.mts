// Generates an scrypt hash for ADMIN_PASSWORD_HASH / EXTRA_ADMINS.
//   pnpm admin:hash            (prompts on stdin, input not echoed to logs)
import { createInterface } from "node:readline";
import { hashPassword } from "../src/lib/security/crypto";

const rl = createInterface({ input: process.stdin, output: process.stderr });
rl.question("Admin password (min 12 chars): ", (pw) => {
  rl.close();
  if (pw.length < 12) {
    console.error("Use at least 12 characters.");
    process.exit(1);
  }
  console.log(hashPassword(pw));
});
