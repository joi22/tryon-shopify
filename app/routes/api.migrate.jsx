import { json } from "@remix-run/node";
import { execSync } from "child_process";

// Migration endpoint that can be triggered after deployment
export const action = async ({ request }) => {
  // Simple security check - you should add proper authentication
  const authHeader = request.headers.get("authorization");
  const migrationSecret = process.env.MIGRATION_SECRET || "default-secret";

  if (authHeader !== `Bearer ${migrationSecret}`) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log('[MIGRATION] Starting database migration...');

    // Run Prisma migration
    const output = execSync('npx prisma migrate deploy', {
      encoding: 'utf8',
      env: process.env
    });

    console.log('[MIGRATION] Migration output:', output);

    return json({
      success: true,
      message: "Migration completed successfully",
      output
    });
  } catch (error) {
    console.error('[MIGRATION] Migration failed:', error);

    return json({
      success: false,
      error: error.message,
      output: error.stdout?.toString() || '',
      stderr: error.stderr?.toString() || ''
    }, { status: 500 });
  }
};

export const loader = () => {
  return json({
    message: "Migration endpoint. Use POST to trigger migration.",
    note: "Requires authorization header with migration secret"
  });
};