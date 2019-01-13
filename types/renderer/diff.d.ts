import { Elem, Instance, Patches } from '../common/types';
export declare function diff(prevInstances: Instance[], nextChildren: Elem[]): Patches;
export declare function patch(parentId: string, patches: Patches): void;
