/**
 * Storage utility that works both locally (file system) and on Netlify (Blobs)
 * Falls back to file system if Netlify Blobs are not available
 */

import { readFile, writeFile } from "fs/promises";
import { join } from "path";

// Check if we're on Netlify
// On Netlify, the file system is read-only, so we MUST use Blobs
const isNetlify = 
  process.env.NETLIFY === "true" || 
  typeof process.env.NETLIFY !== "undefined" || 
  typeof process.env.NETLIFY_DEV !== "undefined" ||
  typeof process.env.NETLIFY_SITE_ID !== "undefined" ||
  typeof process.env.NETLIFY_FUNCTION_NAME !== "undefined" ||
  process.env.AWS_LAMBDA_FUNCTION_NAME !== undefined; // Netlify functions run on AWS Lambda

/**
 * Get Netlify Blobs store (if available)
 * IMPORTANT: This should be called from within the request handler, not at module level
 */
async function getNetlifyStore() {
  // Check if we should use Blobs (Netlify or Lambda environment)
  const shouldUseBlobs = isNetlify || process.env.AWS_LAMBDA_FUNCTION_NAME;
  
  if (!shouldUseBlobs) {
    console.log("[getNetlifyStore] Not on Netlify, skipping Blobs");
    return null;
  }
  
  console.log("[getNetlifyStore] Attempting to initialize Netlify Blobs...");
  console.log("[getNetlifyStore] Environment:", {
    NETLIFY: process.env.NETLIFY,
    AWS_LAMBDA_FUNCTION_NAME: process.env.AWS_LAMBDA_FUNCTION_NAME,
    NODE_ENV: process.env.NODE_ENV
  });
  
  try {
    // Import Netlify Blobs dynamically
    console.log("[getNetlifyStore] Importing @netlify/blobs...");
    const netlifyBlobs = await import("@netlify/blobs");
    console.log("[getNetlifyStore] Import successful, available exports:", Object.keys(netlifyBlobs));
    
    // Try getStore first (v10+ API)
    if (netlifyBlobs.getStore) {
      console.log("[getNetlifyStore] Using getStore API...");
      try {
        // @ts-ignore - Netlify runtime API
        const store = netlifyBlobs.getStore({ name: "lr-chip-data" });
        if (store) {
          console.log("[getNetlifyStore] ✅ Store created successfully with getStore");
          console.log("[getNetlifyStore] Store type:", typeof store);
          console.log("[getNetlifyStore] Store methods:", Object.keys(store));
          return store;
        } else {
          console.error("[getNetlifyStore] getStore returned null/undefined");
        }
      } catch (e) {
        console.error("[getNetlifyStore] getStore failed:", e);
        console.error("[getNetlifyStore] Error details:", e instanceof Error ? e.message : String(e));
      }
    } else {
      console.warn("[getNetlifyStore] getStore not found in exports");
    }
    
    // Try alternative API if available (only if getStore doesn't work)
    // Note: getBlobStore may not exist in all versions
    if (!netlifyBlobs.getStore && (netlifyBlobs as any).getBlobStore) {
      console.log("[getNetlifyStore] Trying getBlobStore API (alternative)...");
      try {
        // @ts-ignore - alternative API
        const store = (netlifyBlobs as any).getBlobStore({ name: "lr-chip-data" });
        if (store) {
          console.log("[getNetlifyStore] ✅ Store created successfully with getBlobStore");
          console.log("[getNetlifyStore] Store methods:", Object.keys(store));
          return store;
        } else {
          console.error("[getNetlifyStore] getBlobStore returned null/undefined");
        }
      } catch (e) {
        console.error("[getNetlifyStore] getBlobStore failed:", e);
        console.error("[getNetlifyStore] Error details:", e instanceof Error ? e.message : String(e));
      }
    }
    
    console.error("[getNetlifyStore] ❌ No valid Blobs API found");
    console.error("[getNetlifyStore] Available exports:", Object.keys(netlifyBlobs));
    return null;
  } catch (error) {
    console.error("[getNetlifyStore] ❌ Failed to initialize Netlify Blobs:", error);
    console.error("[getNetlifyStore] Error type:", error?.constructor?.name);
    console.error("[getNetlifyStore] Error message:", error instanceof Error ? error.message : String(error));
    console.error("[getNetlifyStore] Error stack:", error instanceof Error ? error.stack : undefined);
    return null;
  }
}

/**
 * Get data from storage (Blobs on Netlify, file system locally)
 */
export async function getStorageData(key: string, fallbackPath: string): Promise<any> {
  console.log(`[getStorageData] Loading ${key} from storage...`);
  console.log(`[getStorageData] isNetlify: ${isNetlify}, AWS_LAMBDA: ${!!process.env.AWS_LAMBDA_FUNCTION_NAME}`);
  
  // Try Netlify Blobs first
  if (isNetlify || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    try {
      console.log("[getStorageData] Getting Netlify Blobs store...");
      const store = await getNetlifyStore();
      
      if (store && typeof store.get === 'function') {
        console.log("[getStorageData] Calling store.get()...");
        const data = await store.get(key, { type: "json" });
        if (data !== null && data !== undefined) {
          console.log(`[getStorageData] ✅ Successfully loaded ${key} from Netlify Blobs`);
          return data;
        } else {
          console.log(`[getStorageData] Key ${key} not found in Blobs, returning null`);
        }
      } else {
        console.warn("[getStorageData] Store not available or get method missing");
      }
    } catch (error) {
      console.error("[getStorageData] Error reading from Netlify Blobs:", error);
      console.error("[getStorageData] Error details:", error instanceof Error ? error.message : String(error));
      // Fall through to file system only if we're not on Netlify production
      if (process.env.NETLIFY === "true" || process.env.AWS_LAMBDA_FUNCTION_NAME) {
        console.error("[getStorageData] ❌ Cannot fallback to file system on Netlify!");
        // On Netlify, we can't use file system, so return null
        return null;
      }
    }
  }

  // Fallback to file system (local development only)
  if (!process.env.NETLIFY || process.env.NETLIFY_DEV) {
    try {
      const filePath = join(process.cwd(), fallbackPath);
      const data = await readFile(filePath, "utf-8");
      console.log(`[getStorageData] Loaded from file system: ${filePath}`);
      return JSON.parse(data);
    } catch (error) {
      // If file doesn't exist, return null
      console.log(`[getStorageData] File not found: ${fallbackPath}`);
      return null;
    }
  }
  
  return null;
}

/**
 * Save data to storage (Blobs on Netlify, file system locally)
 */
export async function saveStorageData(key: string, fallbackPath: string, data: any): Promise<void> {
  console.log(`[saveStorageData] Attempting to save ${key} to storage...`);
  console.log(`[saveStorageData] Environment check:`);
  console.log(`  - isNetlify: ${isNetlify}`);
  console.log(`  - NETLIFY=${process.env.NETLIFY}`);
  console.log(`  - NETLIFY_DEV=${process.env.NETLIFY_DEV}`);
  console.log(`  - NETLIFY_SITE_ID=${process.env.NETLIFY_SITE_ID}`);
  console.log(`  - AWS_LAMBDA_FUNCTION_NAME=${process.env.AWS_LAMBDA_FUNCTION_NAME}`);
  console.log(`  - NODE_ENV=${process.env.NODE_ENV}`);
  
  // Determine if we're on Netlify production
  const isNetlifyProduction = process.env.NETLIFY === "true" || !!process.env.AWS_LAMBDA_FUNCTION_NAME;
  
  // Try Netlify Blobs first (MANDATORY on Netlify)
  if (isNetlify || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    try {
      console.log("[saveStorageData] Getting Netlify Blobs store...");
      const store = await getNetlifyStore();
      
      if (!store) {
        const errorMsg = "CRITICAL: Netlify Blobs store could not be created. This is required on Netlify as file system is read-only.";
        console.error(`[saveStorageData] ${errorMsg}`);
        throw new Error(errorMsg);
      }
      
      console.log("[saveStorageData] Store obtained, checking for set method...");
      console.log("[saveStorageData] Store type:", typeof store);
      console.log("[saveStorageData] Store methods:", Object.keys(store));
      
      if (typeof store.set !== 'function') {
        const errorMsg = `CRITICAL: Netlify Blobs store set method not available. Available methods: ${Object.keys(store).join(', ')}`;
        console.error(`[saveStorageData] ${errorMsg}`);
        throw new Error(errorMsg);
      }
      
      console.log("[saveStorageData] Serializing data to JSON...");
      const jsonData = JSON.stringify(data, null, 2);
      console.log(`[saveStorageData] Data size: ${jsonData.length} characters`);
      
      console.log("[saveStorageData] Calling store.set()...");
      await store.set(key, jsonData);
      console.log(`[saveStorageData] ✅ Successfully saved ${key} to Netlify Blobs`);
      return; // Success, exit early
    } catch (error) {
      console.error("[saveStorageData] ❌ Error writing to Netlify Blobs:", error);
      const errorMsg = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      console.error("[saveStorageData] Error type:", error?.constructor?.name);
      console.error("[saveStorageData] Error stack:", errorStack);
      
      // On Netlify production, we CANNOT fallback to file system
      if (isNetlifyProduction) {
        const detailedError = `CRITICAL: Failed to save to Netlify Blobs on production. File system is read-only. Error: ${errorMsg}`;
        console.error(`[saveStorageData] ${detailedError}`);
        throw new Error(detailedError);
      }
      
      // Only throw if we're not on Netlify production (for local dev with NETLIFY_DEV)
      throw new Error(`Failed to save to Netlify Blobs: ${errorMsg}`);
    }
  }

  // Fallback to file system (for local development only)
  // NEVER reach here on Netlify production
  if (isNetlifyProduction) {
    throw new Error("CRITICAL: Attempted to use file system on Netlify production. File system is read-only. Netlify Blobs must be used.");
  }
  
  // Only use file system for local development
  if (process.env.NETLIFY_DEV || !process.env.NETLIFY) {
    try {
      const filePath = join(process.cwd(), fallbackPath);
      await writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
      console.log(`[saveStorageData] ✅ Saved to file system: ${filePath}`);
    } catch (error) {
      console.error("[saveStorageData] Error writing to file system:", error);
      throw new Error(`Failed to save data: ${error instanceof Error ? error.message : String(error)}`);
    }
  } else {
    // Unexpected state - we shouldn't be here
    throw new Error("Failed to save data: Unknown environment. Netlify Blobs not available and file system access uncertain.");
  }
}
