import Dependency from './dependeny';
import ComponentInstance from '../instances/component';
export default class Watcher {
    readonly id: number;
    readonly instance: ComponentInstance;
    depIds: {
        [id: string]: boolean;
    };
    newDepIds: {
        [id: string]: boolean;
    };
    list: Dependency[];
    newList: Dependency[];
    constructor(instance: ComponentInstance);
    depend(dep: Dependency): void;
    clean(): void;
    update(): void;
}
