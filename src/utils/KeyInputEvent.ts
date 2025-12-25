/**
 * KeyInputEvent - Keyboard input event wrapper
 */

export class KeyInputEvent {
    key: string;
    code: string;

    constructor(key: string, code: string) {
        this.key = key;
        this.code = code;
    }
}
