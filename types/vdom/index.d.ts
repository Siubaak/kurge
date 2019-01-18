import { Elem, VDomNode, Component } from '../common/types';
export default function createElement(type: string | Component, config?: any, ...children: (Elem | Elem[])[]): VDomNode;
