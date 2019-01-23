export interface Component {
    (props: any): Elem;
    shouldUpdate?: (prevProps: Props, nextProps: Props) => boolean;
}
export declare type Effect = () => void | (() => void);
export interface Instance {
    id: string;
    index: number;
    node: Text | HTMLElement;
    readonly key: string;
    mount: (id: string) => string;
    same: (nextElement: Elem) => boolean;
    update: (nextElement: Elem) => void;
    unmount: () => void;
}
export declare type Elem = number | string | VDomNode;
export interface Props {
    children: Elem[];
    [prop: string]: any;
}
export interface VDomNode {
    type: string | Component;
    key: string;
    ref: string;
    props: Props;
}
export interface Patches {
    ops: PatchOp[];
    dir: 'forward' | 'backward';
}
export interface PatchOp {
    type: 'insert' | 'move' | 'remove';
    inst: Instance;
    index?: number;
}
export interface DirtyInstance {
    instance: Instance;
    element: Elem;
}
export interface IdleDeadline {
    timeRemaining: () => number;
}
export declare type IdleCallback = (deadline: IdleDeadline) => void;
