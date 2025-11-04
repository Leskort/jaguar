/**
 * Storage utility that works both locally (file system) and on Netlify (Blobs)
 * Falls back to file system if Netlify Blobs are not available
 */

import { readFile, writeFile } from "fs/promises";
import { join } from "path";

// Check if we're on Netlify
const isNetlify = 
  typeof process.env.NETLIFY !== "undefined" || 
  typeof process.env.NETLIFY_DEV !== "undefined" ||
  typeof process.env.NETLIFY_SITE_ID !== "undefined" ||
  typeof process.env.NETLIFY_FUNCTION_NAME !== "undefined";

/**
 * Get Netlify Blobs store (if available)
 * IMPORTANT: This should be called from within the request handler, not at module level
 */
async function getNetlifyStore() {
  if (!isNetlify) {
    return null;
  }
  
  try {
    // Import Netlify Blobs dynamically - must be done inside request handler
    const { getStore } = await import("@netlify/blobs");
    
    if (!getStore) {
      console.error("getStore not found in @netlify/blobs");
      return null;
    }
    
    // Call getStore directly - this must happen inside the request handler context
    // @ts-ignore - Netlify runtime API
    const store = getStore({ name: "lr-chip-data" });
    
    if (!store) {
      console.error("getStore returned null");
      return null;
    }
    
    console.log("Store created successfully");
    return store;
  } catch (error) {
    console.error("Failed to initialize Netlify Blobs:", error);
    console.error("Error:", error instanceof Error ? error.message : String(error));
    console.error("Stack:", error instanceof Error ? error.stack : undefined);
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
  console.log(`[saveStorageData] NETLIFY=${process.env.NETLIFY}, NETLIFY_DEV=${process.env.NETLIFY_DEV}, NETLIFY_SITE_ID=${process.env.NETLIFY_SITE_ID}`);
  
  // Try Netlify Blobs first
  if (isNetlify) {
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
  if (!process.env.NETLIFY || process.env.NETLIFY_DEV) {
    try {
      const filePath = join(process.cwd(), fallbackPath);
      await writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
    } catch (error) {
      console.error("Error writing to file system:", error);
      throw new Error(`Failed to save data: ${error instanceof Error ? error.message : String(error)}`);
    }
  } else {
    // On Netlify production, if Blobs failed, throw error
    throw new Error("Failed to save data: Netlify Blobs not available and file system is read-only");
  }
}

