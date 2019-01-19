import render from './renderer';
import createElement from './vdom';
import useState from './hooks/state';
import useContext from './hooks/context';
import useRefs from './hooks/refs';
import useEffect from './hooks/effect';
declare const Kurge: {
    version: string;
    render: typeof render;
    createElement: typeof createElement;
    useState: typeof useState;
    useContext: typeof useContext;
    useRefs: typeof useRefs;
    useEffect: typeof useEffect;
};
export default Kurge;
