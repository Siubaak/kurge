declare class Emitter {
    private listeners;
    on(event: string, callback: () => void): void;
    emit(event: string): void;
    clean(event: string): void;
}
declare const _default: Emitter;
export default _default;
