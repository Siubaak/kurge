export default class Heap<T> {
    private readonly arr;
    private readonly compare;
    constructor(compare: (contrast: T, self: T) => boolean);
    readonly length: number;
    push(item: T): void;
    shift(): T;
    private heapify;
    private promote;
    private parent;
    private left;
    private right;
}
