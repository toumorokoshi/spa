import { describe, it, expect } from 'vitest';
import {
  DIAGRAM_PRESETS,
  DEFAULT_DIAGRAM_CODE,
  getPresetById
} from './presets';

describe('presets', () => {
  it('contains valid default presets', () => {
    expect(DIAGRAM_PRESETS.length).toBeGreaterThan(0);
    expect(DEFAULT_DIAGRAM_CODE).toBe(DIAGRAM_PRESETS[0].code);
    expect(DEFAULT_DIAGRAM_CODE).toContain('rankSpacing: 1');
    expect(DEFAULT_DIAGRAM_CODE).toContain('nodeSpacing: 1');
  });

  it('can retrieve preset by id', () => {
    const flowchart = getPresetById('flowchart');
    expect(flowchart).toBeDefined();
    expect(flowchart?.name).toBe('Flowchart');
    expect(flowchart?.code).toContain('rankSpacing: 1');
    expect(flowchart?.code).toContain('nodeSpacing: 1');

    const nonexistent = getPresetById('unknown');
    expect(nonexistent).toBeUndefined();
  });
});
