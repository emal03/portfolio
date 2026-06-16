// src/lib/settings.ts
import { sql } from './supabase';
import { unstable_cache } from 'next/cache';

/**
 * Fetches a setting value directly from the settings table.
 */
async function fetchSettingFromDb(key: string): Promise<string> {
  try {
    const result = await sql`SELECT value FROM settings WHERE key = ${key}`;
    return result[0]?.value || '';
  } catch (error) {
    console.error(`[Settings DB Error] Failed to get key "${key}":`, error);
    return '';
  }
}

/**
 * Cached version of fetchSettingFromDb. Revalidates every 60 seconds.
 */
export const getSetting = unstable_cache(
  async (key: string): Promise<string> => fetchSettingFromDb(key),
  ['site-settings'],
  { revalidate: 60 }
);
