import { describe, expect, it } from 'vitest';

describe('test harness', () => {
  it('runs and resolves the @/ alias', async () => {
    const pkg = await import('@/package.json');
    expect(pkg.default.name).toBeTruthy();
  });
});
