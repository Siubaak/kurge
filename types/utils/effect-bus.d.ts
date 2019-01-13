declare class EffectBus {
    private listeners;
    on(event: string, callback: () => void): void;
    emit(event: string, reverse?: boolean): void;
    clean(event: string): void;
}
declare const _default: EffectBus;
export default _default;
