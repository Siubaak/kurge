import { Elem, Instance } from '../shared/types';
export default class DOMInstance implements Instance {
    id: string;
    index: number;
    node: HTMLElement;
    private element;
    private childInstances;
    constructor(element: Elem);
    readonly key: string;
    mount(id: string): string;
    same(nextElement: Elem): boolean;
    update(nextElement: Elem): void;
    unmount(): void;
}
