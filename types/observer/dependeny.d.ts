import Watcher from './watcher';
export default class Dependency {
    static target: Watcher;
    readonly id: number;
    readonly list: Watcher[];
    subscribe(watcher: Watcher): void;
    unsubscribe(watcher: Watcher): void;
    collect(): void;
    notify(): void;
}
export declare function pushTarget(target: Watcher): void;
export declare function popTarget(): void;
