import neo4j from 'neo4j-driver';

const NEO4J_URI = process.env.NEO4J_URI || "bolt://localhost:7687";
const NEO4J_USER = process.env.NEO4J_USER || "neo4j";
const NEO4J_PASSWORD = process.env.NEO4J_PASSWORD || "password";

// Only throw in production runtime if missing, but allow build to proceed by checking context
// or simply defaulting to something that won't crash the build process (which imports files).
// Next.js build phase imports API routes, triggering this top-level code.

let driver: any;

try {
    driver = neo4j.driver(
      NEO4J_URI,
      neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD)
    );
} catch (e) {
    console.warn("Failed to initialize Neo4j driver (likely during build time or missing envs)", e);
}

export async function getGraphSession() {
  if (!driver) {
     // Re-attempt or throw proper runtime error
     throw new Error("Neo4j driver not initialized. Check environment variables.");
  }
  return driver.session();
}

export async function closeGraphConnection() {
  if (driver) {
    await driver.close();
  }
}

export default driver;
