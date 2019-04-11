import { Elem, Instance } from '../shared/types';
import ComponentInstance from '../instances/component';
declare class Reconciler {
    private readonly dirtyList;
    private isBatchUpdating;
    enqueueSetState(componentInst: ComponentInstance): void;
    enqueueUpdate(instance: Instance, element: Elem): void;
    private runBatchUpdate;
}
declare const _default: Reconciler;
export default _default;
