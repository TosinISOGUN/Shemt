/**
 * PulseMetrics - Blink SDK Client
 * 
 * This is the central client for interacting with Blink services.
 * Already configured with project ID from environment variables.
 */
import { createClient } from '@blinkdotnew/sdk'

export const blink = createClient({
  projectId: (import.meta as any).env.VITE_BLINK_PROJECT_ID || 'pulsemetri-saas-base-os6b99g8',
  publishableKey: (import.meta as any).env.VITE_BLINK_PUBLISHABLE_KEY,
  auth: { mode: 'managed' },
})

/**
 * Helper to get the current project ID
 */
export function getProjectId(): string {
  return (import.meta as any).env.VITE_BLINK_PROJECT_ID || 'pulsemetri-saas-base-os6b99g8'
}
