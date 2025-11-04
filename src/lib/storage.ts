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
  typeof (globalThis as any).netlify !== "undefined" ||
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
  
  try {
    // Import Netlify Blobs dynamically - must be done inside request handler
    console.log("[getNetlifyStore] Importing @netlify/blobs...");
    const netlifyBlobs = await import("@netlify/blobs");
    console.log("[getNetlifyStore] Import successful, available exports:", Object.keys(netlifyBlobs));
    
    const { getStore } = netlifyBlobs;
    
    if (!getStore) {
      console.error("[getNetlifyStore] getStore not found in @netlify/blobs exports");
      console.error("[getNetlifyStore] Available exports:", Object.keys(netlifyBlobs));
      return null;
    }
    
    console.log("[getNetlifyStore] Calling getStore({ name: 'lr-chip-data' })...");
    // Call getStore directly - this must happen inside the request handler context
    // @ts-ignore - Netlify runtime API
    const store = getStore({ name: "lr-chip-data" });
    
    if (!store) {
      console.error("[getNetlifyStore] getStore returned null or undefined");
      return null;
    }
    
    console.log("[getNetlifyStore] Store created successfully");
    console.log("[getNetlifyStore] Store type:", typeof store);
    console.log("[getNetlifyStore] Store methods:", Object.keys(store));
    return store;
  } catch (error) {
    console.error("[getNetlifyStore] Failed to initialize Netlify Blobs:", error);
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
  console.log(`[getStorageData] isNetlify: ${isNetlify}`);
  
  // Try Netlify Blobs first
  if (isNetlify) {
    try {
      console.log("[getStorageData] Getting Netlify Blobs store...");
      const store = await getNetlifyStore();
      
      if (store && typeof store.get === 'function') {
        console.log("[getStorageData] Calling store.get()...");
        const data = await store.get(key, { type: "json" });
        if (data !== null && data !== undefined) {
          console.log(`[getStorageData] Successfully loaded ${key} from Netlify Blobs`);
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
      // Fall through to file system
    }
  }

  // Fallback to file system
  try {
    const filePath = join(process.cwd(), fallbackPath);
    const data = await readFile(filePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist, return null
    return null;
  }
}

/**
 * Save data to storage (Blobs on Netlify, file system locally)
 */
export async function saveStorageData(key: string, fallbackPath: string, data: any): Promise<void> {
  console.log(`[saveStorageData] Attempting to save ${key} to storage...`);
  console.log(`[saveStorageData] isNetlify: ${isNetlify}`);
  console.log(`[saveStorageData] Environment check:`);
  console.log(`  - NETLIFY=${process.env.NETLIFY}`);
  console.log(`  - NETLIFY_DEV=${process.env.NETLIFY_DEV}`);
  console.log(`  - NETLIFY_SITE_ID=${process.env.NETLIFY_SITE_ID}`);
  console.log(`  - AWS_LAMBDA_FUNCTION_NAME=${process.env.AWS_LAMBDA_FUNCTION_NAME}`);
  console.log(`  - NODE_ENV=${process.env.NODE_ENV}`);
  
  // Try Netlify Blobs first
  // On Netlify, file system is read-only, so we MUST use Blobs
  if (isNetlify || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    try {
      console.log("[saveStorageData] Getting Netlify Blobs store...");
      const store = await getNetlifyStore();
      
      if (!store) {
        const errorMsg = "Netlify Blobs store could not be created. Check logs for initialization errors.";
        console.error(`[saveStorageData] ${errorMsg}`);
        throw new Error(errorMsg);
      }
      
      console.log("[saveStorageData] Store obtained, checking for set method...");
      console.log("[saveStorageData] Store type:", typeof store);
      console.log("[saveStorageData] Store methods:", Object.keys(store));
      
      if (typeof store.set !== 'function') {
        const errorMsg = `Netlify Blobs store set method not available. Available methods: ${Object.keys(store).join(', ')}`;
        console.error(`[saveStorageData] ${errorMsg}`);
        throw new Error(errorMsg);
      }
      
      console.log("[saveStorageData] Serializing data to JSON...");
      const jsonData = JSON.stringify(data, null, 2);
      console.log(`[saveStorageData] Data size: ${jsonData.length} characters`);
      
      console.log("[saveStorageData] Calling store.set()...");
      await store.set(key, jsonData);
      console.log(`[saveStorageData] Successfully saved ${key} to Netlify Blobs`);
      return; // Success, exit early
    } catch (error) {
      console.error("[saveStorageData] Error writing to Netlify Blobs:", error);
      const errorMsg = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      console.error("[saveStorageData] Error type:", error?.constructor?.name);
      console.error("[saveStorageData] Error stack:", errorStack);
      
      // Provide more detailed error message
      let detailedError = `Failed to save to Netlify Blobs: ${errorMsg}`;
      if (errorStack) {
        detailedError += `\nStack: ${errorStack.substring(0, 500)}`;
      }
      
      // Always throw error to prevent silent failures
      throw new Error(detailedError);
    }
  }

  // Fallback to file system (for local development only)
  // IMPORTANT: On Netlify, file system is read-only, so we should NEVER reach here
  // If we do, it means Blobs failed and we're on Netlify
  if (process.env.NETLIFY === "true" || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    // We're on Netlify but Blobs failed - this is a critical error
    throw new Error("CRITICAL: Netlify Blobs failed and file system is read-only. Check Netlify Blobs initialization logs.");
  }
  
  // Only use file system for local development
  if (process.env.NETLIFY_DEV || !process.env.NETLIFY) {
    try {
      const filePath = join(process.cwd(), fallbackPath);
      await writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
      console.log(`[saveStorageData] Saved to file system: ${filePath}`);
    } catch (error) {
      console.error("[saveStorageData] Error writing to file system:", error);
      throw new Error(`Failed to save data: ${error instanceof Error ? error.message : String(error)}`);
    }
  } else {
    // Unexpected state - we shouldn't be here
    throw new Error("Failed to save data: Unknown environment. Netlify Blobs not available and file system access uncertain.");
  }
}

