import { Elem, Instance } from '../common/types';
import Watcher from '../observer/watcher';
export default class ComponentInstance implements Instance {
    id: string;
    index: number;
    node: HTMLElement;
    refs: {
        [ref: string]: HTMLElement;
    };
    watcher: Watcher;
    guards: any[];
    guardLeft: number;
    states: any[];
    private stateId;
    private element;
    private component;
    private renderedInstance;
    constructor(element: Elem);
    readonly key: string;
    readonly currentState: any;
    readonly prevGuard: any;
    mount(id: string): string;
    same(nextElement: Elem): boolean;
    update(nextElement: Elem): void;
    unmount(): void;
}
