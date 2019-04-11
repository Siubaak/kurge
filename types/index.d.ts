import render from './renderer';
import createElement from './vdom';
import createContext from './context';
import useState from './hooks/state';
import useRefs from './hooks/refs';
import useEffect from './hooks/effect';
declare const _default: {
    version: string;
    render: typeof render;
    createElement: typeof createElement;
    createContext: typeof createContext;
    useState: typeof useState;
    useRefs: typeof useRefs;
    useEffect: typeof useEffect;
};
export default _default;
