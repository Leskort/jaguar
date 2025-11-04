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
  typeof process.env.NETLIFY_SITE_ID !== "undefined";

/**
 * Get Netlify Blobs store (if available)
 */
async function getNetlifyStore() {
  if (!isNetlify) return null;
  
  try {
    // Use Netlify Blobs runtime API
    // @ts-ignore - Netlify runtime API
    const { getStore } = await import("@netlify/blobs");
    return getStore({ name: "lr-chip-data", consistency: "strong" });
  } catch (error) {
    console.error("Netlify Blobs not available:", error);
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
      if (store) {
        const data = await store.get(key, { type: "json" });
        if (data !== null) return data;
      }
    } catch (error) {
      console.error("Error reading from Netlify Blobs:", error);
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
      if (store) {
        await store.set(key, JSON.stringify(data, null, 2));
        return; // Success, exit early
      }
    } catch (error) {
      console.error("Error writing to Netlify Blobs:", error);
      // Fall through to file system
    }
  }

  // Fallback to file system (for local development)
  try {
    const filePath = join(process.cwd(), fallbackPath);
    await writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing to file system:", error);
    throw new Error("Failed to save data");
  }
}

