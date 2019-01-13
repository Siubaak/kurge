declare class EventListenerSet {
    private readonly _eventListeners;
    constructor();
    get(id: string, event: string): (e: Event) => void;
    set(id: string, event: string, eventListener: (e: Event) => void): void;
    remove(id: string, event: string): void;
    clean(id: string): void;
}
declare const _default: EventListenerSet;
export default _default;
