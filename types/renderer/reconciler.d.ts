import { Elem, Instance } from '../shared/types';
import ComponentInstance from '../instances/component';
declare class Reconciler {
    private readonly dirtyList;
    private isBatchUpdating;
    priority: number;
    enqueueSetState(componentInst: ComponentInstance): void;
    enqueueUpdate(instance: Instance, element: Elem): void;
    private runBatchUpdate;
}
declare const reconciler: Reconciler;
export default reconciler;
