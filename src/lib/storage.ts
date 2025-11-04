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
 */
async function getNetlifyStore() {
  if (!isNetlify) {
    return null;
  }
  
  try {
    // Import Netlify Blobs dynamically
    const netlifyBlobs = await import("@netlify/blobs");
    
    // Check available methods
    const availableMethods = Object.keys(netlifyBlobs);
    console.log("Available Netlify Blobs methods:", availableMethods);
    
    // Try getStore first (most common)
    // @ts-ignore - Netlify runtime API
    if (netlifyBlobs.getStore) {
      try {
        // @ts-ignore
        const store = netlifyBlobs.getStore({ name: "lr-chip-data" });
        if (store) {
          console.log("Store created successfully with getStore");
          return store;
        }
      } catch (e) {
        console.error("getStore failed:", e);
      }
    }
    
    // Try getBlobStore (alternative API)
    // @ts-ignore
    if (netlifyBlobs.getBlobStore) {
      try {
        // @ts-ignore
        const store = netlifyBlobs.getBlobStore({ name: "lr-chip-data" });
        if (store) {
          console.log("Store created successfully with getBlobStore");
          return store;
        }
      } catch (e) {
        console.error("getBlobStore failed:", e);
      }
    }
    
    console.error("No valid Blobs store method found");
    return null;
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
  // Try Netlify Blobs first
  if (isNetlify) {
    try {
      const store = await getNetlifyStore();
      if (store && typeof store.get === 'function') {
        const data = await store.get(key, { type: "json" });
        if (data !== null && data !== undefined) {
          return data;
        }
      }
    } catch (error) {
      console.error("Error reading from Netlify Blobs:", error);
      console.error("Error details:", error instanceof Error ? error.message : String(error));
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
  // Try Netlify Blobs first
  if (isNetlify) {
    try {
      const store = await getNetlifyStore();
      if (store && typeof store.set === 'function') {
        const jsonData = JSON.stringify(data, null, 2);
        await store.set(key, jsonData);
        return; // Success, exit early
      } else {
        throw new Error("Netlify Blobs store not available or set method missing");
      }
    } catch (error) {
      console.error("Error writing to Netlify Blobs:", error);
      const errorMsg = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      console.error("Error stack:", errorStack);
      // Always throw error to prevent silent failures
      throw new Error(`Failed to save to Netlify Blobs: ${errorMsg}`);
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

