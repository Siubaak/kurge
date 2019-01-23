import { Elem, VDomNode, Component } from '../shared/types';
export default function createElement(type: string | Component, config?: any, ...children: (Elem | Elem[])[]): VDomNode;
