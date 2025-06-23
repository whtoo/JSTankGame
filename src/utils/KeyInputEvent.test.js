import { KeyInputEvent } from './KeyInputEvent.js';

describe('KeyInputEvent', () => {
  it('should create an event with given key and code', () => {
    const key = 'w';
    const code = 119;
    const event = new KeyInputEvent(key, code);
    expect(event.key).toBe(key);
    expect(event.code).toBe(code);
  });

  it('should handle different key and code values', () => {
    const key = 'Enter';
    const code = 13;
    const event = new KeyInputEvent(key, code);
    expect(event.key).toBe(key);
    expect(event.code).toBe(code);
  });
});
