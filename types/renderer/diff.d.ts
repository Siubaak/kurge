import { Elem, Instance, Patches } from '../shared/types';
export declare function diff(prevInstances: Instance[], nextChildren: Elem[]): Patches;
export declare function patch(parentInst: Instance, patches: Patches): void;
