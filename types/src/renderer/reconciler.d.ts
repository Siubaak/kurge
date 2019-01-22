import { Elem, Instance } from '../shared/types';
declare class Reconciler {
    private readonly dirtyInstanceSet;
    private isBatchUpdating;
    enqueueUpdate(instance: Instance, element?: Elem): void;
    private runBatchUpdate;
}
declare const _default: Reconciler;
export default _default;
