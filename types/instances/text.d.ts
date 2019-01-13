import { Elem, Instance } from '../common/types';
export default class TextInstance implements Instance {
    id: string;
    index: number;
    private element;
    constructor(element: Elem);
    readonly key: string;
    readonly node: HTMLElement;
    mount(id: string): string;
    same(nextElement: Elem): boolean;
    update(nextElement: Elem): void;
    unmount(): void;
}
