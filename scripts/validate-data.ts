/**
 * Data Validation Script
 *
 * Run this script to validate that all candidates have corresponding surveys
 * and vice versa. This ensures data integrity across the application.
 *
 * Usage: npx tsx scripts/validate-data.ts
 */

import { validateAndLog } from "../src/lib/helpers/data-validation";

console.log("🔍 Running candidate-survey data validation...\n");

validateAndLog();

console.log("\n✨ Validation complete!\n");
