import { Elem, Instance } from '../common/types';
import Watcher from '../observer/watcher';
export default class ComponentInstance implements Instance {
    id: string;
    index: number;
    state: any;
    node: HTMLElement;
    refs: {
        [ref: string]: HTMLElement;
    };
    watcher: Watcher;
    private element;
    private component;
    private renderedInstance;
    constructor(element: Elem);
    readonly key: string;
    mount(id: string): string;
    same(nextElement: Elem): boolean;
    update(nextElement: Elem): void;
    unmount(): void;
}
