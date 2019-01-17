export declare const is: {
    undefined: (val: any) => boolean;
    null: (val: any) => boolean;
    number: (val: any) => boolean;
    string: (val: any) => boolean;
    boolean: (val: any) => boolean;
    symbol: (val: any) => boolean;
    regexp: (val: any) => boolean;
    object: (val: any) => boolean;
    array: (val: any) => boolean;
    function: (val: any) => boolean;
};
export declare function hasOwn(object: any, property: string | number | symbol): any;
export declare function delArrItem(arr: any[], item: any): any[] | void;
export declare function swap(a: any, b: any): void;
export declare const nextTick: typeof requestAnimationFrame;
