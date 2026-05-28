import { test, expect } from '@playwright/test';

test.describe('WebRTC ops & ICE API', () => {
  test('health includes turn/livekit flags', async ({ request }) => {
    const res = await request.get('http://localhost:3001/api/health');
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body).toHaveProperty('ok', true);
    expect(body).toHaveProperty('turn');
    expect(body).toHaveProperty('livekit');
  });

  test('ice-servers returns STUN list', async ({ request }) => {
    const res = await request.get('http://localhost:3001/api/webrtc/ice-servers');
    expect(res.ok()).toBeTruthy();
    const { iceServers } = await res.json();
    expect(Array.isArray(iceServers)).toBeTruthy();
    expect(iceServers.length).toBeGreaterThan(0);
  });

  test('webrtc diagnostics endpoint', async ({ request }) => {
    const res = await request.get('http://localhost:3001/api/webrtc/diagnostics');
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body).toHaveProperty('turnConfigured');
    expect(body).toHaveProperty('stunCount');
  });

  test('ops webrtc page loads and probe button works', async ({ page }) => {
    await page.goto('/ops/webrtc');
    await expect(page.getByRole('heading', { name: /WebRTC Ops/i })).toBeVisible();
    await page.getByRole('button', { name: /Run ICE probe/i }).click();
    await expect(page.locator('pre').first()).not.toHaveText('—', { timeout: 15_000 });
  });
});
