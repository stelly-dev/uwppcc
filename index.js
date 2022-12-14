const NAMESPACE = 'pioneer-project';

let scopeId;
let hostTagName;
let isSvgMode = false;
let queuePending = false;
const win = typeof window !== 'undefined' ? window : {};
const doc = win.document || { head: {} };
const H = (win.HTMLElement || class {
});
const plt = {
    $flags$: 0,
    $resourcesUrl$: '',
    jmp: (h) => h(),
    raf: (h) => requestAnimationFrame(h),
    ael: (el, eventName, listener, opts) => el.addEventListener(eventName, listener, opts),
    rel: (el, eventName, listener, opts) => el.removeEventListener(eventName, listener, opts),
    ce: (eventName, opts) => new CustomEvent(eventName, opts),
};
const promiseResolve = (v) => Promise.resolve(v);
const supportsConstructableStylesheets = /*@__PURE__*/ (() => {
        try {
            new CSSStyleSheet();
            return typeof new CSSStyleSheet().replaceSync === 'function';
        }
        catch (e) { }
        return false;
    })()
    ;
const addHostEventListeners = (elm, hostRef, listeners, attachParentListeners) => {
    if (listeners) {
        listeners.map(([flags, name, method]) => {
            const target = getHostListenerTarget(elm, flags) ;
            const handler = hostListenerProxy(hostRef, method);
            const opts = hostListenerOpts(flags);
            plt.ael(target, name, handler, opts);
            (hostRef.$rmListeners$ = hostRef.$rmListeners$ || []).push(() => plt.rel(target, name, handler, opts));
        });
    }
};
const hostListenerProxy = (hostRef, methodName) => (ev) => {
    try {
        {
            hostRef.$hostElement$[methodName](ev);
        }
    }
    catch (e) {
        consoleError(e);
    }
};
const getHostListenerTarget = (elm, flags) => {
    if (flags & 4 /* LISTENER_FLAGS.TargetDocument */)
        return doc;
    if (flags & 8 /* LISTENER_FLAGS.TargetWindow */)
        return win;
    return elm;
};
// prettier-ignore
const hostListenerOpts = (flags) => (flags & 2 /* LISTENER_FLAGS.Capture */) !== 0;
const createTime = (fnName, tagName = '') => {
    {
        return () => {
            return;
        };
    }
};
const rootAppliedStyles = /*@__PURE__*/ new WeakMap();
const registerStyle = (scopeId, cssText, allowCS) => {
    let style = styles$1.get(scopeId);
    if (supportsConstructableStylesheets && allowCS) {
        style = (style || new CSSStyleSheet());
        if (typeof style === 'string') {
            style = cssText;
        }
        else {
            style.replaceSync(cssText);
        }
    }
    else {
        style = cssText;
    }
    styles$1.set(scopeId, style);
};
const addStyle = (styleContainerNode, cmpMeta, mode, hostElm) => {
    let scopeId = getScopeId(cmpMeta);
    const style = styles$1.get(scopeId);
    // if an element is NOT connected then getRootNode() will return the wrong root node
    // so the fallback is to always use the document for the root node in those cases
    styleContainerNode = styleContainerNode.nodeType === 11 /* NODE_TYPE.DocumentFragment */ ? styleContainerNode : doc;
    if (style) {
        if (typeof style === 'string') {
            styleContainerNode = styleContainerNode.head || styleContainerNode;
            let appliedStyles = rootAppliedStyles.get(styleContainerNode);
            let styleElm;
            if (!appliedStyles) {
                rootAppliedStyles.set(styleContainerNode, (appliedStyles = new Set()));
            }
            if (!appliedStyles.has(scopeId)) {
                {
                    {
                        styleElm = doc.createElement('style');
                        styleElm.innerHTML = style;
                    }
                    styleContainerNode.insertBefore(styleElm, styleContainerNode.querySelector('link'));
                }
                if (appliedStyles) {
                    appliedStyles.add(scopeId);
                }
            }
        }
        else if (!styleContainerNode.adoptedStyleSheets.includes(style)) {
            styleContainerNode.adoptedStyleSheets = [...styleContainerNode.adoptedStyleSheets, style];
        }
    }
    return scopeId;
};
const attachStyles = (hostRef) => {
    const cmpMeta = hostRef.$cmpMeta$;
    const elm = hostRef.$hostElement$;
    const flags = cmpMeta.$flags$;
    const endAttachStyles = createTime('attachStyles', cmpMeta.$tagName$);
    const scopeId = addStyle(elm.shadowRoot ? elm.shadowRoot : elm.getRootNode(), cmpMeta);
    if (flags & 10 /* CMP_FLAGS.needsScopedEncapsulation */) {
        // only required when we're NOT using native shadow dom (slot)
        // or this browser doesn't support native shadow dom
        // and this host element was NOT created with SSR
        // let's pick out the inner content for slot projection
        // create a node to represent where the original
        // content was first placed, which is useful later on
        // DOM WRITE!!
        elm['s-sc'] = scopeId;
        elm.classList.add(scopeId + '-h');
    }
    endAttachStyles();
};
const getScopeId = (cmp, mode) => 'sc-' + (cmp.$tagName$);
/**
 * Default style mode id
 */
/**
 * Reusable empty obj/array
 * Don't add values to these!!
 */
const EMPTY_OBJ = {};
/**
 * Namespaces
 */
const SVG_NS = 'http://www.w3.org/2000/svg';
const HTML_NS = 'http://www.w3.org/1999/xhtml';
const isDef = (v) => v != null;
const isComplexType = (o) => {
    // https://jsperf.com/typeof-fn-object/5
    o = typeof o;
    return o === 'object' || o === 'function';
};
/**
 * Production h() function based on Preact by
 * Jason Miller (@developit)
 * Licensed under the MIT License
 * https://github.com/developit/preact/blob/master/LICENSE
 *
 * Modified for Stencil's compiler and vdom
 */
// const stack: any[] = [];
// export function h(nodeName: string | d.FunctionalComponent, vnodeData: d.PropsType, child?: d.ChildType): d.VNode;
// export function h(nodeName: string | d.FunctionalComponent, vnodeData: d.PropsType, ...children: d.ChildType[]): d.VNode;
const h = (nodeName, vnodeData, ...children) => {
    let child = null;
    let simple = false;
    let lastSimple = false;
    const vNodeChildren = [];
    const walk = (c) => {
        for (let i = 0; i < c.length; i++) {
            child = c[i];
            if (Array.isArray(child)) {
                walk(child);
            }
            else if (child != null && typeof child !== 'boolean') {
                if ((simple = typeof nodeName !== 'function' && !isComplexType(child))) {
                    child = String(child);
                }
                if (simple && lastSimple) {
                    // If the previous child was simple (string), we merge both
                    vNodeChildren[vNodeChildren.length - 1].$text$ += child;
                }
                else {
                    // Append a new vNode, if it's text, we create a text vNode
                    vNodeChildren.push(simple ? newVNode(null, child) : child);
                }
                lastSimple = simple;
            }
        }
    };
    walk(children);
    if (vnodeData) {
        {
            const classData = vnodeData.className || vnodeData.class;
            if (classData) {
                vnodeData.class =
                    typeof classData !== 'object'
                        ? classData
                        : Object.keys(classData)
                            .filter((k) => classData[k])
                            .join(' ');
            }
        }
    }
    if (typeof nodeName === 'function') {
        // nodeName is a functional component
        return nodeName(vnodeData === null ? {} : vnodeData, vNodeChildren, vdomFnUtils);
    }
    const vnode = newVNode(nodeName, null);
    vnode.$attrs$ = vnodeData;
    if (vNodeChildren.length > 0) {
        vnode.$children$ = vNodeChildren;
    }
    return vnode;
};
const newVNode = (tag, text) => {
    const vnode = {
        $flags$: 0,
        $tag$: tag,
        $text$: text,
        $elm$: null,
        $children$: null,
    };
    {
        vnode.$attrs$ = null;
    }
    return vnode;
};
const Host = {};
const isHost = (node) => node && node.$tag$ === Host;
const vdomFnUtils = {
    forEach: (children, cb) => children.map(convertToPublic).forEach(cb),
    map: (children, cb) => children.map(convertToPublic).map(cb).map(convertToPrivate),
};
const convertToPublic = (node) => ({
    vattrs: node.$attrs$,
    vchildren: node.$children$,
    vkey: node.$key$,
    vname: node.$name$,
    vtag: node.$tag$,
    vtext: node.$text$,
});
const convertToPrivate = (node) => {
    if (typeof node.vtag === 'function') {
        const vnodeData = Object.assign({}, node.vattrs);
        if (node.vkey) {
            vnodeData.key = node.vkey;
        }
        if (node.vname) {
            vnodeData.name = node.vname;
        }
        return h(node.vtag, vnodeData, ...(node.vchildren || []));
    }
    const vnode = newVNode(node.vtag, node.vtext);
    vnode.$attrs$ = node.vattrs;
    vnode.$children$ = node.vchildren;
    vnode.$key$ = node.vkey;
    vnode.$name$ = node.vname;
    return vnode;
};
/**
 * Production setAccessor() function based on Preact by
 * Jason Miller (@developit)
 * Licensed under the MIT License
 * https://github.com/developit/preact/blob/master/LICENSE
 *
 * Modified for Stencil's compiler and vdom
 */
const setAccessor = (elm, memberName, oldValue, newValue, isSvg, flags) => {
    if (oldValue !== newValue) {
        let isProp = isMemberInElement(elm, memberName);
        let ln = memberName.toLowerCase();
        if (memberName === 'class') {
            const classList = elm.classList;
            const oldClasses = parseClassList(oldValue);
            const newClasses = parseClassList(newValue);
            classList.remove(...oldClasses.filter((c) => c && !newClasses.includes(c)));
            classList.add(...newClasses.filter((c) => c && !oldClasses.includes(c)));
        }
        else if (memberName === 'style') {
            // update style attribute, css properties and values
            {
                for (const prop in oldValue) {
                    if (!newValue || newValue[prop] == null) {
                        if (prop.includes('-')) {
                            elm.style.removeProperty(prop);
                        }
                        else {
                            elm.style[prop] = '';
                        }
                    }
                }
            }
            for (const prop in newValue) {
                if (!oldValue || newValue[prop] !== oldValue[prop]) {
                    if (prop.includes('-')) {
                        elm.style.setProperty(prop, newValue[prop]);
                    }
                    else {
                        elm.style[prop] = newValue[prop];
                    }
                }
            }
        }
        else if ((!elm.__lookupSetter__(memberName)) &&
            memberName[0] === 'o' &&
            memberName[1] === 'n') {
            // Event Handlers
            // so if the member name starts with "on" and the 3rd characters is
            // a capital letter, and it's not already a member on the element,
            // then we're assuming it's an event listener
            if (memberName[2] === '-') {
                // on- prefixed events
                // allows to be explicit about the dom event to listen without any magic
                // under the hood:
                // <my-cmp on-click> // listens for "click"
                // <my-cmp on-Click> // listens for "Click"
                // <my-cmp on-ionChange> // listens for "ionChange"
                // <my-cmp on-EVENTS> // listens for "EVENTS"
                memberName = memberName.slice(3);
            }
            else if (isMemberInElement(win, ln)) {
                // standard event
                // the JSX attribute could have been "onMouseOver" and the
                // member name "onmouseover" is on the window's prototype
                // so let's add the listener "mouseover", which is all lowercased
                memberName = ln.slice(2);
            }
            else {
                // custom event
                // the JSX attribute could have been "onMyCustomEvent"
                // so let's trim off the "on" prefix and lowercase the first character
                // and add the listener "myCustomEvent"
                // except for the first character, we keep the event name case
                memberName = ln[2] + memberName.slice(3);
            }
            if (oldValue) {
                plt.rel(elm, memberName, oldValue, false);
            }
            if (newValue) {
                plt.ael(elm, memberName, newValue, false);
            }
        }
        else {
            // Set property if it exists and it's not a SVG
            const isComplex = isComplexType(newValue);
            if ((isProp || (isComplex && newValue !== null)) && !isSvg) {
                try {
                    if (!elm.tagName.includes('-')) {
                        const n = newValue == null ? '' : newValue;
                        // Workaround for Safari, moving the <input> caret when re-assigning the same valued
                        if (memberName === 'list') {
                            isProp = false;
                        }
                        else if (oldValue == null || elm[memberName] != n) {
                            elm[memberName] = n;
                        }
                    }
                    else {
                        elm[memberName] = newValue;
                    }
                }
                catch (e) { }
            }
            if (newValue == null || newValue === false) {
                if (newValue !== false || elm.getAttribute(memberName) === '') {
                    {
                        elm.removeAttribute(memberName);
                    }
                }
            }
            else if ((!isProp || flags & 4 /* VNODE_FLAGS.isHost */ || isSvg) && !isComplex) {
                newValue = newValue === true ? '' : newValue;
                {
                    elm.setAttribute(memberName, newValue);
                }
            }
        }
    }
};
const parseClassListRegex = /\s/;
const parseClassList = (value) => (!value ? [] : value.split(parseClassListRegex));
const updateElement = (oldVnode, newVnode, isSvgMode, memberName) => {
    // if the element passed in is a shadow root, which is a document fragment
    // then we want to be adding attrs/props to the shadow root's "host" element
    // if it's not a shadow root, then we add attrs/props to the same element
    const elm = newVnode.$elm$.nodeType === 11 /* NODE_TYPE.DocumentFragment */ && newVnode.$elm$.host
        ? newVnode.$elm$.host
        : newVnode.$elm$;
    const oldVnodeAttrs = (oldVnode && oldVnode.$attrs$) || EMPTY_OBJ;
    const newVnodeAttrs = newVnode.$attrs$ || EMPTY_OBJ;
    {
        // remove attributes no longer present on the vnode by setting them to undefined
        for (memberName in oldVnodeAttrs) {
            if (!(memberName in newVnodeAttrs)) {
                setAccessor(elm, memberName, oldVnodeAttrs[memberName], undefined, isSvgMode, newVnode.$flags$);
            }
        }
    }
    // add new & update changed attributes
    for (memberName in newVnodeAttrs) {
        setAccessor(elm, memberName, oldVnodeAttrs[memberName], newVnodeAttrs[memberName], isSvgMode, newVnode.$flags$);
    }
};
/**
 * Create a DOM Node corresponding to one of the children of a given VNode.
 *
 * @param oldParentVNode the parent VNode from the previous render
 * @param newParentVNode the parent VNode from the current render
 * @param childIndex the index of the VNode, in the _new_ parent node's
 * children, for which we will create a new DOM node
 * @param parentElm the parent DOM node which our new node will be a child of
 * @returns the newly created node
 */
const createElm = (oldParentVNode, newParentVNode, childIndex, parentElm) => {
    // tslint:disable-next-line: prefer-const
    const newVNode = newParentVNode.$children$[childIndex];
    let i = 0;
    let elm;
    let childNode;
    if (newVNode.$text$ !== null) {
        // create text node
        elm = newVNode.$elm$ = doc.createTextNode(newVNode.$text$);
    }
    else {
        if (!isSvgMode) {
            isSvgMode = newVNode.$tag$ === 'svg';
        }
        // create element
        elm = newVNode.$elm$ = (doc.createElementNS(isSvgMode ? SVG_NS : HTML_NS, newVNode.$tag$)
            );
        if (isSvgMode && newVNode.$tag$ === 'foreignObject') {
            isSvgMode = false;
        }
        // add css classes, attrs, props, listeners, etc.
        {
            updateElement(null, newVNode, isSvgMode);
        }
        if (isDef(scopeId) && elm['s-si'] !== scopeId) {
            // if there is a scopeId and this is the initial render
            // then let's add the scopeId as a css class
            elm.classList.add((elm['s-si'] = scopeId));
        }
        if (newVNode.$children$) {
            for (i = 0; i < newVNode.$children$.length; ++i) {
                // create the node
                childNode = createElm(oldParentVNode, newVNode, i);
                // return node could have been null
                if (childNode) {
                    // append our new node
                    elm.appendChild(childNode);
                }
            }
        }
        {
            if (newVNode.$tag$ === 'svg') {
                // Only reset the SVG context when we're exiting <svg> element
                isSvgMode = false;
            }
            else if (elm.tagName === 'foreignObject') {
                // Reenter SVG context when we're exiting <foreignObject> element
                isSvgMode = true;
            }
        }
    }
    return elm;
};
const addVnodes = (parentElm, before, parentVNode, vnodes, startIdx, endIdx) => {
    let containerElm = (parentElm);
    let childNode;
    if (containerElm.shadowRoot && containerElm.tagName === hostTagName) {
        containerElm = containerElm.shadowRoot;
    }
    for (; startIdx <= endIdx; ++startIdx) {
        if (vnodes[startIdx]) {
            childNode = createElm(null, parentVNode, startIdx);
            if (childNode) {
                vnodes[startIdx].$elm$ = childNode;
                containerElm.insertBefore(childNode, before);
            }
        }
    }
};
const removeVnodes = (vnodes, startIdx, endIdx, vnode, elm) => {
    for (; startIdx <= endIdx; ++startIdx) {
        if ((vnode = vnodes[startIdx])) {
            elm = vnode.$elm$;
            // remove the vnode's element from the dom
            elm.remove();
        }
    }
};
/**
 * Reconcile the children of a new VNode with the children of an old VNode by
 * traversing the two collections of children, identifying nodes that are
 * conserved or changed, calling out to `patch` to make any necessary
 * updates to the DOM, and rearranging DOM nodes as needed.
 *
 * The algorithm for reconciling children works by analyzing two 'windows' onto
 * the two arrays of children (`oldCh` and `newCh`). We keep track of the
 * 'windows' by storing start and end indices and references to the
 * corresponding array entries. Initially the two 'windows' are basically equal
 * to the entire array, but we progressively narrow the windows until there are
 * no children left to update by doing the following:
 *
 * 1. Skip any `null` entries at the beginning or end of the two arrays, so
 *    that if we have an initial array like the following we'll end up dealing
 *    only with a window bounded by the highlighted elements:
 *
 *    [null, null, VNode1 , ... , VNode2, null, null]
 *                 ^^^^^^         ^^^^^^
 *
 * 2. Check to see if the elements at the head and tail positions are equal
 *    across the windows. This will basically detect elements which haven't
 *    been added, removed, or changed position, i.e. if you had the following
 *    VNode elements (represented as HTML):
 *
 *    oldVNode: `<div><p><span>HEY</span></p></div>`
 *    newVNode: `<div><p><span>THERE</span></p></div>`
 *
 *    Then when comparing the children of the `<div>` tag we check the equality
 *    of the VNodes corresponding to the `<p>` tags and, since they are the
 *    same tag in the same position, we'd be able to avoid completely
 *    re-rendering the subtree under them with a new DOM element and would just
 *    call out to `patch` to handle reconciling their children and so on.
 *
 * 3. Check, for both windows, to see if the element at the beginning of the
 *    window corresponds to the element at the end of the other window. This is
 *    a heuristic which will let us identify _some_ situations in which
 *    elements have changed position, for instance it _should_ detect that the
 *    children nodes themselves have not changed but merely moved in the
 *    following example:
 *
 *    oldVNode: `<div><element-one /><element-two /></div>`
 *    newVNode: `<div><element-two /><element-one /></div>`
 *
 *    If we find cases like this then we also need to move the concrete DOM
 *    elements corresponding to the moved children to write the re-order to the
 *    DOM.
 *
 * 4. Finally, if VNodes have the `key` attribute set on them we check for any
 *    nodes in the old children which have the same key as the first element in
 *    our window on the new children. If we find such a node we handle calling
 *    out to `patch`, moving relevant DOM nodes, and so on, in accordance with
 *    what we find.
 *
 * Finally, once we've narrowed our 'windows' to the point that either of them
 * collapse (i.e. they have length 0) we then handle any remaining VNode
 * insertion or deletion that needs to happen to get a DOM state that correctly
 * reflects the new child VNodes. If, for instance, after our window on the old
 * children has collapsed we still have more nodes on the new children that
 * we haven't dealt with yet then we need to add them, or if the new children
 * collapse but we still have unhandled _old_ children then we need to make
 * sure the corresponding DOM nodes are removed.
 *
 * @param parentElm the node into which the parent VNode is rendered
 * @param oldCh the old children of the parent node
 * @param newVNode the new VNode which will replace the parent
 * @param newCh the new children of the parent node
 */
const updateChildren = (parentElm, oldCh, newVNode, newCh) => {
    let oldStartIdx = 0;
    let newStartIdx = 0;
    let oldEndIdx = oldCh.length - 1;
    let oldStartVnode = oldCh[0];
    let oldEndVnode = oldCh[oldEndIdx];
    let newEndIdx = newCh.length - 1;
    let newStartVnode = newCh[0];
    let newEndVnode = newCh[newEndIdx];
    let node;
    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
        if (oldStartVnode == null) {
            // VNode might have been moved left
            oldStartVnode = oldCh[++oldStartIdx];
        }
        else if (oldEndVnode == null) {
            oldEndVnode = oldCh[--oldEndIdx];
        }
        else if (newStartVnode == null) {
            newStartVnode = newCh[++newStartIdx];
        }
        else if (newEndVnode == null) {
            newEndVnode = newCh[--newEndIdx];
        }
        else if (isSameVnode(oldStartVnode, newStartVnode)) {
            // if the start nodes are the same then we should patch the new VNode
            // onto the old one, and increment our `newStartIdx` and `oldStartIdx`
            // indices to reflect that. We don't need to move any DOM Nodes around
            // since things are matched up in order.
            patch(oldStartVnode, newStartVnode);
            oldStartVnode = oldCh[++oldStartIdx];
            newStartVnode = newCh[++newStartIdx];
        }
        else if (isSameVnode(oldEndVnode, newEndVnode)) {
            // likewise, if the end nodes are the same we patch new onto old and
            // decrement our end indices, and also likewise in this case we don't
            // need to move any DOM Nodes.
            patch(oldEndVnode, newEndVnode);
            oldEndVnode = oldCh[--oldEndIdx];
            newEndVnode = newCh[--newEndIdx];
        }
        else if (isSameVnode(oldStartVnode, newEndVnode)) {
            patch(oldStartVnode, newEndVnode);
            // We need to move the element for `oldStartVnode` into a position which
            // will be appropriate for `newEndVnode`. For this we can use
            // `.insertBefore` and `oldEndVnode.$elm$.nextSibling`. If there is a
            // sibling for `oldEndVnode.$elm$` then we want to move the DOM node for
            // `oldStartVnode` between `oldEndVnode` and it's sibling, like so:
            //
            // <old-start-node />
            // <some-intervening-node />
            // <old-end-node />
            // <!-- ->              <-- `oldStartVnode.$elm$` should be inserted here
            // <next-sibling />
            //
            // If instead `oldEndVnode.$elm$` has no sibling then we just want to put
            // the node for `oldStartVnode` at the end of the children of
            // `parentElm`. Luckily, `Node.nextSibling` will return `null` if there
            // aren't any siblings, and passing `null` to `Node.insertBefore` will
            // append it to the children of the parent element.
            parentElm.insertBefore(oldStartVnode.$elm$, oldEndVnode.$elm$.nextSibling);
            oldStartVnode = oldCh[++oldStartIdx];
            newEndVnode = newCh[--newEndIdx];
        }
        else if (isSameVnode(oldEndVnode, newStartVnode)) {
            patch(oldEndVnode, newStartVnode);
            // We've already checked above if `oldStartVnode` and `newStartVnode` are
            // the same node, so since we're here we know that they are not. Thus we
            // can move the element for `oldEndVnode` _before_ the element for
            // `oldStartVnode`, leaving `oldStartVnode` to be reconciled in the
            // future.
            parentElm.insertBefore(oldEndVnode.$elm$, oldStartVnode.$elm$);
            oldEndVnode = oldCh[--oldEndIdx];
            newStartVnode = newCh[++newStartIdx];
        }
        else {
            {
                // We either didn't find an element in the old children that matches
                // the key of the first new child OR the build is not using `key`
                // attributes at all. In either case we need to create a new element
                // for the new node.
                node = createElm(oldCh && oldCh[newStartIdx], newVNode, newStartIdx);
                newStartVnode = newCh[++newStartIdx];
            }
            if (node) {
                // if we created a new node then handle inserting it to the DOM
                {
                    oldStartVnode.$elm$.parentNode.insertBefore(node, oldStartVnode.$elm$);
                }
            }
        }
    }
    if (oldStartIdx > oldEndIdx) {
        // we have some more new nodes to add which don't match up with old nodes
        addVnodes(parentElm, newCh[newEndIdx + 1] == null ? null : newCh[newEndIdx + 1].$elm$, newVNode, newCh, newStartIdx, newEndIdx);
    }
    else if (newStartIdx > newEndIdx) {
        // there are nodes in the `oldCh` array which no longer correspond to nodes
        // in the new array, so lets remove them (which entails cleaning up the
        // relevant DOM nodes)
        removeVnodes(oldCh, oldStartIdx, oldEndIdx);
    }
};
/**
 * Compare two VNodes to determine if they are the same
 *
 * **NB**: This function is an equality _heuristic_ based on the available
 * information set on the two VNodes and can be misleading under certain
 * circumstances. In particular, if the two nodes do not have `key` attrs
 * (available under `$key$` on VNodes) then the function falls back on merely
 * checking that they have the same tag.
 *
 * So, in other words, if `key` attrs are not set on VNodes which may be
 * changing order within a `children` array or something along those lines then
 * we could obtain a false positive and then have to do needless re-rendering.
 *
 * @param leftVNode the first VNode to check
 * @param rightVNode the second VNode to check
 * @returns whether they're equal or not
 */
const isSameVnode = (leftVNode, rightVNode) => {
    // compare if two vnode to see if they're "technically" the same
    // need to have the same element tag, and same key to be the same
    if (leftVNode.$tag$ === rightVNode.$tag$) {
        return true;
    }
    return false;
};
/**
 * Handle reconciling an outdated VNode with a new one which corresponds to
 * it. This function handles flushing updates to the DOM and reconciling the
 * children of the two nodes (if any).
 *
 * @param oldVNode an old VNode whose DOM element and children we want to update
 * @param newVNode a new VNode representing an updated version of the old one
 */
const patch = (oldVNode, newVNode) => {
    const elm = (newVNode.$elm$ = oldVNode.$elm$);
    const oldChildren = oldVNode.$children$;
    const newChildren = newVNode.$children$;
    const tag = newVNode.$tag$;
    const text = newVNode.$text$;
    if (text === null) {
        {
            // test if we're rendering an svg element, or still rendering nodes inside of one
            // only add this to the when the compiler sees we're using an svg somewhere
            isSvgMode = tag === 'svg' ? true : tag === 'foreignObject' ? false : isSvgMode;
        }
        {
            if (tag === 'slot')
                ;
            else {
                // either this is the first render of an element OR it's an update
                // AND we already know it's possible it could have changed
                // this updates the element's css classes, attrs, props, listeners, etc.
                updateElement(oldVNode, newVNode, isSvgMode);
            }
        }
        if (oldChildren !== null && newChildren !== null) {
            // looks like there's child vnodes for both the old and new vnodes
            // so we need to call `updateChildren` to reconcile them
            updateChildren(elm, oldChildren, newVNode, newChildren);
        }
        else if (newChildren !== null) {
            // no old child vnodes, but there are new child vnodes to add
            if (oldVNode.$text$ !== null) {
                // the old vnode was text, so be sure to clear it out
                elm.textContent = '';
            }
            // add the new vnode children
            addVnodes(elm, null, newVNode, newChildren, 0, newChildren.length - 1);
        }
        else if (oldChildren !== null) {
            // no new child vnodes, but there are old child vnodes to remove
            removeVnodes(oldChildren, 0, oldChildren.length - 1);
        }
        if (isSvgMode && tag === 'svg') {
            isSvgMode = false;
        }
    }
    else if (oldVNode.$text$ !== text) {
        // update the text content for the text only vnode
        // and also only if the text is different than before
        elm.data = text;
    }
};
const renderVdom = (hostRef, renderFnResults) => {
    const hostElm = hostRef.$hostElement$;
    const cmpMeta = hostRef.$cmpMeta$;
    const oldVNode = hostRef.$vnode$ || newVNode(null, null);
    const rootVnode = isHost(renderFnResults) ? renderFnResults : h(null, null, renderFnResults);
    hostTagName = hostElm.tagName;
    if (cmpMeta.$attrsToReflect$) {
        rootVnode.$attrs$ = rootVnode.$attrs$ || {};
        cmpMeta.$attrsToReflect$.map(([propName, attribute]) => (rootVnode.$attrs$[attribute] = hostElm[propName]));
    }
    rootVnode.$tag$ = null;
    rootVnode.$flags$ |= 4 /* VNODE_FLAGS.isHost */;
    hostRef.$vnode$ = rootVnode;
    rootVnode.$elm$ = oldVNode.$elm$ = (hostElm.shadowRoot || hostElm );
    {
        scopeId = hostElm['s-sc'];
    }
    // synchronous patch
    patch(oldVNode, rootVnode);
};
const getElement = (ref) => (ref);
const createEvent = (ref, name, flags) => {
    const elm = getElement(ref);
    return {
        emit: (detail) => {
            return emitEvent(elm, name, {
                bubbles: !!(flags & 4 /* EVENT_FLAGS.Bubbles */),
                composed: !!(flags & 2 /* EVENT_FLAGS.Composed */),
                cancelable: !!(flags & 1 /* EVENT_FLAGS.Cancellable */),
                detail,
            });
        },
    };
};
/**
 * Helper function to create & dispatch a custom Event on a provided target
 * @param elm the target of the Event
 * @param name the name to give the custom Event
 * @param opts options for configuring a custom Event
 * @returns the custom Event
 */
const emitEvent = (elm, name, opts) => {
    const ev = plt.ce(name, opts);
    elm.dispatchEvent(ev);
    return ev;
};
const attachToAncestor = (hostRef, ancestorComponent) => {
    if (ancestorComponent && !hostRef.$onRenderResolve$ && ancestorComponent['s-p']) {
        ancestorComponent['s-p'].push(new Promise((r) => (hostRef.$onRenderResolve$ = r)));
    }
};
const scheduleUpdate = (hostRef, isInitialLoad) => {
    {
        hostRef.$flags$ |= 16 /* HOST_FLAGS.isQueuedForUpdate */;
    }
    if (hostRef.$flags$ & 4 /* HOST_FLAGS.isWaitingForChildren */) {
        hostRef.$flags$ |= 512 /* HOST_FLAGS.needsRerender */;
        return;
    }
    attachToAncestor(hostRef, hostRef.$ancestorComponent$);
    // there is no ancestor component or the ancestor component
    // has already fired off its lifecycle update then
    // fire off the initial update
    const dispatch = () => dispatchHooks(hostRef, isInitialLoad);
    return writeTask(dispatch) ;
};
const dispatchHooks = (hostRef, isInitialLoad) => {
    const elm = hostRef.$hostElement$;
    const endSchedule = createTime('scheduleUpdate', hostRef.$cmpMeta$.$tagName$);
    const instance = elm;
    let promise;
    if (isInitialLoad) {
        {
            promise = safeCall(instance, 'componentWillLoad');
        }
    }
    endSchedule();
    return then(promise, () => updateComponent(hostRef, instance, isInitialLoad));
};
const updateComponent = async (hostRef, instance, isInitialLoad) => {
    // updateComponent
    const elm = hostRef.$hostElement$;
    const endUpdate = createTime('update', hostRef.$cmpMeta$.$tagName$);
    const rc = elm['s-rc'];
    if (isInitialLoad) {
        // DOM WRITE!
        attachStyles(hostRef);
    }
    const endRender = createTime('render', hostRef.$cmpMeta$.$tagName$);
    {
        callRender(hostRef, instance);
    }
    if (rc) {
        // ok, so turns out there are some child host elements
        // waiting on this parent element to load
        // let's fire off all update callbacks waiting
        rc.map((cb) => cb());
        elm['s-rc'] = undefined;
    }
    endRender();
    endUpdate();
    {
        const childrenPromises = elm['s-p'];
        const postUpdate = () => postUpdateComponent(hostRef);
        if (childrenPromises.length === 0) {
            postUpdate();
        }
        else {
            Promise.all(childrenPromises).then(postUpdate);
            hostRef.$flags$ |= 4 /* HOST_FLAGS.isWaitingForChildren */;
            childrenPromises.length = 0;
        }
    }
};
const callRender = (hostRef, instance, elm) => {
    try {
        instance = instance.render() ;
        {
            hostRef.$flags$ &= ~16 /* HOST_FLAGS.isQueuedForUpdate */;
        }
        {
            hostRef.$flags$ |= 2 /* HOST_FLAGS.hasRendered */;
        }
        {
            {
                // looks like we've got child nodes to render into this host element
                // or we need to update the css class/attrs on the host element
                // DOM WRITE!
                {
                    renderVdom(hostRef, instance);
                }
            }
        }
    }
    catch (e) {
        consoleError(e, hostRef.$hostElement$);
    }
    return null;
};
const postUpdateComponent = (hostRef) => {
    const tagName = hostRef.$cmpMeta$.$tagName$;
    const elm = hostRef.$hostElement$;
    const endPostUpdate = createTime('postUpdate', tagName);
    const instance = elm;
    const ancestorComponent = hostRef.$ancestorComponent$;
    {
        safeCall(instance, 'componentDidRender');
    }
    if (!(hostRef.$flags$ & 64 /* HOST_FLAGS.hasLoadedComponent */)) {
        hostRef.$flags$ |= 64 /* HOST_FLAGS.hasLoadedComponent */;
        {
            // DOM WRITE!
            addHydratedFlag(elm);
        }
        {
            safeCall(instance, 'componentDidLoad');
        }
        endPostUpdate();
        {
            hostRef.$onReadyResolve$(elm);
            if (!ancestorComponent) {
                appDidLoad();
            }
        }
    }
    else {
        endPostUpdate();
    }
    // load events fire from bottom to top
    // the deepest elements load first then bubbles up
    {
        if (hostRef.$onRenderResolve$) {
            hostRef.$onRenderResolve$();
            hostRef.$onRenderResolve$ = undefined;
        }
        if (hostRef.$flags$ & 512 /* HOST_FLAGS.needsRerender */) {
            nextTick(() => scheduleUpdate(hostRef, false));
        }
        hostRef.$flags$ &= ~(4 /* HOST_FLAGS.isWaitingForChildren */ | 512 /* HOST_FLAGS.needsRerender */);
    }
    // ( ???_???)
    // ( ???_???)>??????-???
    // (??????_???)
};
const appDidLoad = (who) => {
    // on appload
    // we have finish the first big initial render
    {
        addHydratedFlag(doc.documentElement);
    }
    nextTick(() => emitEvent(win, 'appload', { detail: { namespace: NAMESPACE } }));
};
const safeCall = (instance, method, arg) => {
    if (instance && instance[method]) {
        try {
            return instance[method](arg);
        }
        catch (e) {
            consoleError(e);
        }
    }
    return undefined;
};
const then = (promise, thenFn) => {
    return promise && promise.then ? promise.then(thenFn) : thenFn();
};
const addHydratedFlag = (elm) => elm.classList.add('hydrated')
    ;
/**
 * Parse a new property value for a given property type.
 *
 * While the prop value can reasonably be expected to be of `any` type as far as TypeScript's type checker is concerned,
 * it is not safe to assume that the string returned by evaluating `typeof propValue` matches:
 *   1. `any`, the type given to `propValue` in the function signature
 *   2. the type stored from `propType`.
 *
 * This function provides the capability to parse/coerce a property's value to potentially any other JavaScript type.
 *
 * Property values represented in TSX preserve their type information. In the example below, the number 0 is passed to
 * a component. This `propValue` will preserve its type information (`typeof propValue === 'number'`). Note that is
 * based on the type of the value being passed in, not the type declared of the class member decorated with `@Prop`.
 * ```tsx
 * <my-cmp prop-val={0}></my-cmp>
 * ```
 *
 * HTML prop values on the other hand, will always a string
 *
 * @param propValue the new value to coerce to some type
 * @param propType the type of the prop, expressed as a binary number
 * @returns the parsed/coerced value
 */
const parsePropertyValue = (propValue, propType) => {
    // ensure this value is of the correct prop type
    if (propValue != null && !isComplexType(propValue)) {
        if (propType & 4 /* MEMBER_FLAGS.Boolean */) {
            // per the HTML spec, any string value means it is a boolean true value
            // but we'll cheat here and say that the string "false" is the boolean false
            return propValue === 'false' ? false : propValue === '' || !!propValue;
        }
        if (propType & 2 /* MEMBER_FLAGS.Number */) {
            // force it to be a number
            return parseFloat(propValue);
        }
        if (propType & 1 /* MEMBER_FLAGS.String */) {
            // could have been passed as a number or boolean
            // but we still want it as a string
            return String(propValue);
        }
        // redundant return here for better minification
        return propValue;
    }
    // not sure exactly what type we want
    // so no need to change to a different type
    return propValue;
};
const getValue = (ref, propName) => getHostRef(ref).$instanceValues$.get(propName);
const setValue = (ref, propName, newVal, cmpMeta) => {
    // check our new property value against our internal value
    const hostRef = getHostRef(ref);
    const elm = ref;
    const oldVal = hostRef.$instanceValues$.get(propName);
    const flags = hostRef.$flags$;
    const instance = elm;
    newVal = parsePropertyValue(newVal, cmpMeta.$members$[propName][0]);
    // explicitly check for NaN on both sides, as `NaN === NaN` is always false
    const areBothNaN = Number.isNaN(oldVal) && Number.isNaN(newVal);
    const didValueChange = newVal !== oldVal && !areBothNaN;
    if (didValueChange) {
        // gadzooks! the property's value has changed!!
        // set our new value!
        hostRef.$instanceValues$.set(propName, newVal);
        {
            // get an array of method names of watch functions to call
            if (cmpMeta.$watchers$ && flags & 128 /* HOST_FLAGS.isWatchReady */) {
                const watchMethods = cmpMeta.$watchers$[propName];
                if (watchMethods) {
                    // this instance is watching for when this property changed
                    watchMethods.map((watchMethodName) => {
                        try {
                            // fire off each of the watch methods that are watching this property
                            instance[watchMethodName](newVal, oldVal, propName);
                        }
                        catch (e) {
                            consoleError(e, elm);
                        }
                    });
                }
            }
            if ((flags & (2 /* HOST_FLAGS.hasRendered */ | 16 /* HOST_FLAGS.isQueuedForUpdate */)) === 2 /* HOST_FLAGS.hasRendered */) {
                // looks like this value actually changed, so we've got work to do!
                // but only if we've already rendered, otherwise just chill out
                // queue that we need to do an update, but don't worry about queuing
                // up millions cuz this function ensures it only runs once
                scheduleUpdate(hostRef, false);
            }
        }
    }
};
const proxyComponent = (Cstr, cmpMeta, flags) => {
    if (cmpMeta.$members$) {
        if (Cstr.watchers) {
            cmpMeta.$watchers$ = Cstr.watchers;
        }
        // It's better to have a const than two Object.entries()
        const members = Object.entries(cmpMeta.$members$);
        const prototype = Cstr.prototype;
        members.map(([memberName, [memberFlags]]) => {
            if ((memberFlags & 31 /* MEMBER_FLAGS.Prop */ ||
                    (memberFlags & 32 /* MEMBER_FLAGS.State */))) {
                // proxyComponent - prop
                Object.defineProperty(prototype, memberName, {
                    get() {
                        // proxyComponent, get value
                        return getValue(this, memberName);
                    },
                    set(newValue) {
                        // proxyComponent, set value
                        setValue(this, memberName, newValue, cmpMeta);
                    },
                    configurable: true,
                    enumerable: true,
                });
            }
        });
        {
            const attrNameToPropName = new Map();
            prototype.attributeChangedCallback = function (attrName, _oldValue, newValue) {
                plt.jmp(() => {
                    const propName = attrNameToPropName.get(attrName);
                    //  In a web component lifecycle the attributeChangedCallback runs prior to connectedCallback
                    //  in the case where an attribute was set inline.
                    //  ```html
                    //    <my-component some-attribute="some-value"></my-component>
                    //  ```
                    //
                    //  There is an edge case where a developer sets the attribute inline on a custom element and then
                    //  programmatically changes it before it has been upgraded as shown below:
                    //
                    //  ```html
                    //    <!-- this component has _not_ been upgraded yet -->
                    //    <my-component id="test" some-attribute="some-value"></my-component>
                    //    <script>
                    //      // grab non-upgraded component
                    //      el = document.querySelector("#test");
                    //      el.someAttribute = "another-value";
                    //      // upgrade component
                    //      customElements.define('my-component', MyComponent);
                    //    </script>
                    //  ```
                    //  In this case if we do not unshadow here and use the value of the shadowing property, attributeChangedCallback
                    //  will be called with `newValue = "some-value"` and will set the shadowed property (this.someAttribute = "another-value")
                    //  to the value that was set inline i.e. "some-value" from above example. When
                    //  the connectedCallback attempts to unshadow it will use "some-value" as the initial value rather than "another-value"
                    //
                    //  The case where the attribute was NOT set inline but was not set programmatically shall be handled/unshadowed
                    //  by connectedCallback as this attributeChangedCallback will not fire.
                    //
                    //  https://developers.google.com/web/fundamentals/web-components/best-practices#lazy-properties
                    //
                    //  TODO(STENCIL-16) we should think about whether or not we actually want to be reflecting the attributes to
                    //  properties here given that this goes against best practices outlined here
                    //  https://developers.google.com/web/fundamentals/web-components/best-practices#avoid-reentrancy
                    if (this.hasOwnProperty(propName)) {
                        newValue = this[propName];
                        delete this[propName];
                    }
                    else if (prototype.hasOwnProperty(propName) &&
                        typeof this[propName] === 'number' &&
                        this[propName] == newValue) {
                        // if the propName exists on the prototype of `Cstr`, this update may be a result of Stencil using native
                        // APIs to reflect props as attributes. Calls to `setAttribute(someElement, propName)` will result in
                        // `propName` to be converted to a `DOMString`, which may not be what we want for other primitive props.
                        return;
                    }
                    this[propName] = newValue === null && typeof this[propName] === 'boolean' ? false : newValue;
                });
            };
            // create an array of attributes to observe
            // and also create a map of html attribute name to js property name
            Cstr.observedAttributes = members
                .filter(([_, m]) => m[0] & 15 /* MEMBER_FLAGS.HasAttribute */) // filter to only keep props that should match attributes
                .map(([propName, m]) => {
                const attrName = m[1] || propName;
                attrNameToPropName.set(attrName, propName);
                if (m[0] & 512 /* MEMBER_FLAGS.ReflectAttr */) {
                    cmpMeta.$attrsToReflect$.push([propName, attrName]);
                }
                return attrName;
            });
        }
    }
    return Cstr;
};
const initializeComponent = async (elm, hostRef, cmpMeta, hmrVersionId, Cstr) => {
    // initializeComponent
    if ((hostRef.$flags$ & 32 /* HOST_FLAGS.hasInitializedComponent */) === 0) {
        {
            // sync constructor component
            Cstr = elm.constructor;
            hostRef.$flags$ |= 32 /* HOST_FLAGS.hasInitializedComponent */;
            // wait for the CustomElementRegistry to mark the component as ready before setting `isWatchReady`. Otherwise,
            // watchers may fire prematurely if `customElements.get()`/`customElements.whenDefined()` resolves _before_
            // Stencil has completed instantiating the component.
            customElements.whenDefined(cmpMeta.$tagName$).then(() => (hostRef.$flags$ |= 128 /* HOST_FLAGS.isWatchReady */));
        }
        if (Cstr.style) {
            // this component has styles but we haven't registered them yet
            let style = Cstr.style;
            const scopeId = getScopeId(cmpMeta);
            if (!styles$1.has(scopeId)) {
                const endRegisterStyles = createTime('registerStyles', cmpMeta.$tagName$);
                registerStyle(scopeId, style, !!(cmpMeta.$flags$ & 1 /* CMP_FLAGS.shadowDomEncapsulation */));
                endRegisterStyles();
            }
        }
    }
    // we've successfully created a lazy instance
    const ancestorComponent = hostRef.$ancestorComponent$;
    const schedule = () => scheduleUpdate(hostRef, true);
    if (ancestorComponent && ancestorComponent['s-rc']) {
        // this is the initial load and this component it has an ancestor component
        // but the ancestor component has NOT fired its will update lifecycle yet
        // so let's just cool our jets and wait for the ancestor to continue first
        // this will get fired off when the ancestor component
        // finally gets around to rendering its lazy self
        // fire off the initial update
        ancestorComponent['s-rc'].push(schedule);
    }
    else {
        schedule();
    }
};
const connectedCallback = (elm) => {
    if ((plt.$flags$ & 1 /* PLATFORM_FLAGS.isTmpDisconnected */) === 0) {
        const hostRef = getHostRef(elm);
        const cmpMeta = hostRef.$cmpMeta$;
        const endConnected = createTime('connectedCallback', cmpMeta.$tagName$);
        if (!(hostRef.$flags$ & 1 /* HOST_FLAGS.hasConnected */)) {
            // first time this component has connected
            hostRef.$flags$ |= 1 /* HOST_FLAGS.hasConnected */;
            {
                // find the first ancestor component (if there is one) and register
                // this component as one of the actively loading child components for its ancestor
                let ancestorComponent = elm;
                while ((ancestorComponent = ancestorComponent.parentNode || ancestorComponent.host)) {
                    // climb up the ancestors looking for the first
                    // component that hasn't finished its lifecycle update yet
                    if (ancestorComponent['s-p']) {
                        // we found this components first ancestor component
                        // keep a reference to this component's ancestor component
                        attachToAncestor(hostRef, (hostRef.$ancestorComponent$ = ancestorComponent));
                        break;
                    }
                }
            }
            // Lazy properties
            // https://developers.google.com/web/fundamentals/web-components/best-practices#lazy-properties
            if (cmpMeta.$members$) {
                Object.entries(cmpMeta.$members$).map(([memberName, [memberFlags]]) => {
                    if (memberFlags & 31 /* MEMBER_FLAGS.Prop */ && elm.hasOwnProperty(memberName)) {
                        const value = elm[memberName];
                        delete elm[memberName];
                        elm[memberName] = value;
                    }
                });
            }
            {
                initializeComponent(elm, hostRef, cmpMeta);
            }
        }
        else {
            // not the first time this has connected
            // reattach any event listeners to the host
            // since they would have been removed when disconnected
            addHostEventListeners(elm, hostRef, cmpMeta.$listeners$);
        }
        endConnected();
    }
};
const disconnectedCallback = (elm) => {
    if ((plt.$flags$ & 1 /* PLATFORM_FLAGS.isTmpDisconnected */) === 0) {
        const hostRef = getHostRef(elm);
        {
            if (hostRef.$rmListeners$) {
                hostRef.$rmListeners$.map((rmListener) => rmListener());
                hostRef.$rmListeners$ = undefined;
            }
        }
    }
};
const proxyCustomElement = (Cstr, compactMeta) => {
    const cmpMeta = {
        $flags$: compactMeta[0],
        $tagName$: compactMeta[1],
    };
    {
        cmpMeta.$members$ = compactMeta[2];
    }
    {
        cmpMeta.$listeners$ = compactMeta[3];
    }
    {
        cmpMeta.$watchers$ = Cstr.$watchers$;
    }
    {
        cmpMeta.$attrsToReflect$ = [];
    }
    const originalConnectedCallback = Cstr.prototype.connectedCallback;
    Object.assign(Cstr.prototype, {
        __registerHost() {
            registerHost(this, cmpMeta);
        },
        connectedCallback() {
            connectedCallback(this);
            if (originalConnectedCallback) {
                originalConnectedCallback.call(this);
            }
        },
        disconnectedCallback() {
            disconnectedCallback(this);
        },
        __attachShadow() {
            {
                {
                    this.attachShadow({ mode: 'open' });
                }
            }
        },
    });
    Cstr.is = cmpMeta.$tagName$;
    return proxyComponent(Cstr, cmpMeta);
};
const getAssetPath = (path) => {
    const assetUrl = new URL(path, plt.$resourcesUrl$);
    return assetUrl.origin !== win.location.origin ? assetUrl.href : assetUrl.pathname;
};
const setAssetPath = (path) => (plt.$resourcesUrl$ = path);
const setPlatformOptions = (opts) => Object.assign(plt, opts);
const Fragment = (_, children) => children;
const hostRefs = /*@__PURE__*/ new WeakMap();
const getHostRef = (ref) => hostRefs.get(ref);
const registerHost = (elm, cmpMeta) => {
    const hostRef = {
        $flags$: 0,
        $hostElement$: elm,
        $cmpMeta$: cmpMeta,
        $instanceValues$: new Map(),
    };
    {
        hostRef.$onReadyPromise$ = new Promise((r) => (hostRef.$onReadyResolve$ = r));
        elm['s-p'] = [];
        elm['s-rc'] = [];
    }
    addHostEventListeners(elm, hostRef, cmpMeta.$listeners$);
    return hostRefs.set(elm, hostRef);
};
const isMemberInElement = (elm, memberName) => memberName in elm;
const consoleError = (e, el) => (0, console.error)(e, el);
const styles$1 = /*@__PURE__*/ new Map();
const queueDomReads = [];
const queueDomWrites = [];
const queueTask = (queue, write) => (cb) => {
    queue.push(cb);
    if (!queuePending) {
        queuePending = true;
        if (write && plt.$flags$ & 4 /* PLATFORM_FLAGS.queueSync */) {
            nextTick(flush);
        }
        else {
            plt.raf(flush);
        }
    }
};
const consume = (queue) => {
    for (let i = 0; i < queue.length; i++) {
        try {
            queue[i](performance.now());
        }
        catch (e) {
            consoleError(e);
        }
    }
    queue.length = 0;
};
const flush = () => {
    // always force a bunch of medium callbacks to run, but still have
    // a throttle on how many can run in a certain time
    // DOM READS!!!
    consume(queueDomReads);
    // DOM WRITES!!!
    {
        consume(queueDomWrites);
        if ((queuePending = queueDomReads.length > 0)) {
            // still more to do yet, but we've run out of time
            // let's let this thing cool off and try again in the next tick
            plt.raf(flush);
        }
    }
};
const nextTick = /*@__PURE__*/ (cb) => promiseResolve().then(cb);
const writeTask = /*@__PURE__*/ queueTask(queueDomWrites, true);

const chosenGroupsCss = ":host{display:block;margin-top:2rem}.group-list{list-style:none;padding:0;margin:0}";

const ChosenGroups$1 = class extends H {
  constructor() {
    super();
    this.__registerHost();
    this.__attachShadow();
  }
  renderItems() {
    return this.subSets.map((group) => {
      return (h("li", { class: "group-list_item" }, h("subset-card", { group: group })));
    });
  }
  render() {
    return (h(Host, null, h("ul", { class: "group-list" }, this.renderItems())));
  }
  static get style() { return chosenGroupsCss; }
};

const contactGroupsCss = ":host{display:block}.group-list_item{list-style:none}.group-list{margin:0;padding:0}.contact-group{padding:0 0 1rem 0;background-color:transparent;border-radius:10px;border:1px solid #eafffd19;position:relative;min-height:60px}.edit-button{position:absolute;top:100%;right:0;transform:translate(-50%, -50%);border-radius:50%;border:none;background-color:#2633a2;fill:white;cursor:pointer;width:50px;height:50px;display:flex;justify-content:center;align-items:center;padding-right:3px;padding-top:3px;transition:all 0.2s ease-in-out}.edit-button:hover{background-color:white;fill:black}.edit-button:active{transform:translate(-50%, -50%) scale(0.9)}.edit-button svg{width:40px;height:40px}.empty-message{text-align:center;font-size:1.5rem;color:#eafffd;font-family:sans-serif;font-size:1.25rem;max-width:80%;margin:0 auto;font-weight:700;padding:1rem;opacity:0.24}";

const ContactGroups$1 = class extends H {
  constructor() {
    super();
    this.__registerHost();
    this.__attachShadow();
    this.openEditor = createEvent(this, "openEditor", 7);
    this.subSets = [];
    this.renderCards = () => {
      return this.subSets.map((group) => {
        return (h("li", { class: "group-list_item" }, h("subset-card", { group: group, "action-type": 'remove' })));
      });
    };
  }
  handleOpenEditor(e) {
    this.el.shadowRoot.getElementById('editButton').blur();
    this.openEditor.emit(e);
  }
  renderEditButton() {
    return (
    // hide pencil if there are no badges selected
    this.subSets.length > 0 &&
      h("button", { id: "editButton", class: "edit-button", onClick: (e) => this.handleOpenEditor(e) }, h("svg", { "data-bbox": "25.783 11.712 137 160", viewBox: "0 0 200 200", height: "200", width: "200", xmlns: "http://www.w3.org/2000/svg", "data-type": "shape" }, h("g", null, h("path", { d: "M156.775 29.949l-18.59-14.806c-6.844-5.451-16.77-4.281-22.174 2.614L25.783 131.512l4.798 40.2 39.795-4.802 89.009-114.607c5.405-6.895 4.236-16.904-2.61-22.354zM39.224 160.475l-2.809-24.062 26.756 21.239-23.947 2.823zm30.763-13.734L45.4 127.223l82.297-105.667 25.336 20.166-83.046 105.019z", "clip-rule": "evenodd", "fill-rule": "evenodd" })))));
  }
  render() {
    return (h(Host, null, h("section", { class: "contact-group" }, h("ul", { class: "group-list" }, this.subSets.length > 0 ? this.renderCards() : h("p", { class: "empty-message" }, "Selected sets of students will appear here")), this.renderEditButton())));
  }
  get el() { return this; }
  static get style() { return contactGroupsCss; }
};

const styles = {
  iconFill: '#BA83F0',
  titleColor: '#ED5829'
};

const courseCardCss = ":host{display:block;--font-family:wfont_efc4ce_afb53a4134974c9ea0c66bce8fcc3d34, wf_afb53a4134974c9ea0c66bce8, orig_cubano_regular, Cubano}.card{position:relative;width:100px;height:100px;list-style-type:none;margin:0;background-color:white;border-radius:5px;display:flex;flex-direction:column;justify-content:center;align-items:center}.cap-container .icon{width:40px;height:30px;fill:var(--cap-fill)}.cap-count{position:absolute;color:white;font-size:10px;font-weight:bold;top:calc(50% - 14px);left:50%;transform:translate(-50%, -50%);font-weight:800;z-index:2;line-height:12px}.cap-container{position:absolute;left:27px;top:70%;z-index:2;transform:translate(-50%, -50%)}.card-badge-image{width:4rem;height:4rem}.card-details a{text-decoration:none;color:black;font-size:14px;font-family:'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif}.card-title{font-family:var(--font-family);font-size:14px;text-align:center;margin:0;padding:0;text-transform:uppercase;letter-spacing:1px;transition:all 0.3s ease-in-out;white-space:nowrap;width:9ch;overflow:hidden;text-overflow:ellipsis}.card-title:hover{transform:scale(1.1);color:orangered !important;}.remove-button{position:absolute;top:0;right:0;background:transparent;outline:none;border:none;border-radius:5px;padding:5px;cursor:pointer;z-index:1}";

const CourseCard$1 = class extends H {
  constructor() {
    super();
    this.__registerHost();
    this.__attachShadow();
    this.removeCourse = createEvent(this, "removeCourse", 7);
  }
  renderCapIcon(count) {
    return (h("div", { class: "cap-container" }, h("svg", { preserveAspectRatio: "none", "data-bbox": "0.598 1.098 1278.204 976.902", viewBox: "0.598 1.098 1278.204 976.902", height: "1304", width: "1706.667", xmlns: "http://www.w3.org/2000/svg", "data-type": "shape", role: "presentation", "aria-hidden": "true", class: "icon cap", style: { fill: styles.iconFill } }, h("g", null, h("path", { d: "M625 6.1c-18.1 7.1-20.4 8.1-99.5 38.5-39.6 15.2-80.1 30.8-90 34.6-9.9 3.8-21.4 8.2-25.5 9.8-4.1 1.5-12.7 4.8-19 7.3-6.3 2.5-21.2 8.2-33 12.8-11.8 4.5-27.8 10.6-35.5 13.6-7.7 3-19.2 7.4-25.5 9.8-6.3 2.4-17.8 6.8-25.5 9.8-7.7 3-23.7 9.1-35.5 13.6-11.8 4.6-25.3 9.8-30 11.6-9.1 3.5-20.4 7.9-39 15-6.3 2.4-19.1 7.4-28.5 11-9.3 3.7-22.2 8.6-28.5 11-6.3 2.4-17.8 6.8-25.5 9.8-7.7 3-29.5 11.3-48.5 18.6C17 240.2 1.1 246.5.7 247c-.5.4.9 1.4 3 2.3 2.1.8 19.8 8.9 39.3 18 19.5 9 37.5 17.4 40 18.5 2.5 1.1 8.6 3.9 13.5 6.2 5 2.3 11.9 5.6 15.5 7.2 20.8 9.6 44.6 20.6 52 24 4.7 2.2 13.2 6.2 19 8.8 5.8 2.6 19.7 9 31 14.2 11.3 5.3 23 10.7 26 12.1 3 1.3 9.6 4.4 14.5 6.7 5 2.3 11 5.1 13.5 6.2 14.1 6.4 62.7 28.9 64 29.7 1.3.7 1.5 19.8 1.8 160.2.1 87.7 0 160.3-.2 161.4-.3 1.1-2.1 2.9-4.1 3.9-5 2.7-11.2 9.8-14.1 16.1-7.3 15.9-4.3 32.8 8 45l5.5 5.6-4.3 6.7c-21.3 33-34.3 90.6-37 163.9-.3 9.9-.2 13.3.7 13.3.7 0 5.5-4.3 10.7-9.5l9.4-9.5 10.2 10c5.5 5.5 10.5 10 10.9 10 .4 0 5.4-4.5 11-10.1l10.3-10.1 10.4 10.1 10.4 10 10.4-10.4 10.5-10.5 10 10c5.5 5.5 10.5 10 11 10 2 0-.3-46.3-3.5-71-6.3-48.3-16.9-81-35.9-110.6-1.2-1.8-.9-2.5 4.1-7.5 3-3 6.7-8.1 8.4-11.4 2.7-5.5 2.9-6.9 2.9-17 0-9.3-.3-11.8-2.3-15.9-3.2-6.9-8.6-13.3-14.9-17.2l-5.3-3.5V696c0-14.9.3-27 .6-27 .4 0 5.2 3.3 10.8 7.4 53.7 39.1 117.4 66.7 181.1 78.5 44.6 8.2 97.4 8.6 141.8 1 52.1-8.9 83-19 127.6-41.7 37.7-19.1 63.5-34.8 94.4-57.5l10.7-7.9V407.3l9.3-4.3c5-2.4 13.3-6.2 18.2-8.5 5-2.3 11.3-5.3 14-6.5 2.8-1.2 17.4-8 32.5-15 15.1-7 30.2-14 33.5-15.5 3.3-1.5 20.6-9.5 38.5-17.7 37.1-17.2 43.5-20.1 50.5-23.3 2.8-1.2 8.8-4.1 13.5-6.3 8.1-3.7 24.8-11.5 39-18 3.6-1.6 9.9-4.5 14-6.4 4.1-2 9.5-4.5 12-5.6 2.5-1.2 19.1-8.9 37-17.1 17.9-8.3 32.6-15.4 32.8-15.9.1-.5-3.5-2.3-8-4-4.6-1.7-16.6-6.3-26.8-10.2-10.2-3.9-23.7-9.1-30-11.5-6.3-2.4-18-6.9-26-10-8-3.1-19.7-7.6-26-10-6.3-2.4-19.1-7.4-28.5-11-9.3-3.7-19.2-7.5-22-8.5-2.7-1-12.6-4.8-22-8.5-9.3-3.6-22.2-8.6-28.5-11-6.3-2.4-18-6.9-26-10-8-3.1-19.7-7.6-26-10-6.3-2.4-18-6.9-26-10-8-3.1-21.5-8.3-30-11.5-8.5-3.2-20.2-7.7-26-10-5.8-2.3-15.7-6.1-22-8.5-6.3-2.4-19.1-7.3-28.5-11-9.3-3.7-19.2-7.5-22-8.5-2.7-1-14.4-5.5-26-10-11.5-4.5-26.2-10.1-32.5-12.5-6.3-2.4-18-6.9-26-10-8-3.1-19.7-7.6-26-10-6.3-2.4-18-6.9-26-10-8-3.1-19.7-7.6-26-10-6.3-2.4-20.3-7.8-31-11.9-10.7-4.2-20.4-7.6-21.5-7.5-1.1 0-7.6 2.3-14.5 5z" }))), h("p", { class: "cap-count" }, count)));
  }
  renderCard() {
    let details = this.course.badge_name.split(':');
    return (h("li", { class: "card" }, h("div", { class: "card-display" }, h("img", { class: "card-badge-image", src: this.course.badge_icon_uri }), this.renderCapIcon(this.course.number_held)), h("div", { title: details[0], class: "card-details" }, h("a", { class: "card-title", href: this.course.badge_link, target: "_blank" }, h("h3", { class: "card-title", style: { color: styles.titleColor } }, details[0]))), this.renderRemoveButton()));
  }
  renderRemoveButton() {
    return (h("button", { class: "remove-button", onClick: () => this.removeCourse.emit(this.course) }, h("div", { class: "x-icon" }, h("svg", { xmlns: "http://www.w3.org/2000/svg", width: "14", height: "14", viewBox: "0 0 24 24" }, h("line", { x1: "18", y1: "6", x2: "6", y2: "18", style: { stroke: "#00000094", strokeWidth: '2px' } }), h("line", { x1: "6", y1: "6", x2: "18", y2: "18", style: { stroke: "#00000094", strokeWidth: '2px' } })))));
  }
  render() {
    return (h(Host, null, this.renderCard()));
  }
  get el() { return this; }
  static get style() { return courseCardCss; }
};

const emailModalCss = ":host{display:grid;--knob-size:34.4px;--knob-shadow-size:1px;--font-family:wfont_efc4ce_afb53a4134974c9ea0c66bce8fcc3d34, wf_afb53a4134974c9ea0c66bce8, orig_cubano_regular, Cubano}.mouse-trap{position:fixed;top:0;left:0;width:100%;height:100%;z-index:1000;background:rgba(0, 0, 0, 0.5);cursor:pointer}.email-modal{position:fixed;top:50%;left:50%;transform:translate(-50%, -50%);width:800px;height:500px;border-radius:15px;max-width:100vw;padding:1rem;z-index:1001;display:flex;flex-direction:column;justify-content:center;align-items:center;display:grid;background:#232323;grid-template-columns:1fr 1fr;grid-template-rows:repeat(12, 1fr);grid-gap:1rem}.guide{grid-area:1 / 2 / span 12 / span 2;height:100%;width:calc(100% + 0.25rem);color:rgba(200, 200, 200, 0.75);overflow-y:scroll;font-family:Frutiger, 'Frutiger Linotype', Univers, Calibri, 'Gill Sans', 'Gill Sans MT', 'Myriad Pro', Myriad, 'DejaVu Sans Condensed', 'Liberation Sans', 'Nimbus Sans L',\n    Tahoma, Geneva, 'Helvetica Neue', Helvetica, Arial, sans-serif}.guide h1{font-size:1.5rem;background:-webkit-linear-gradient(orangered, #ec1271);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-top:0;margin-bottom:0.6rem;font-family:var(--font-family);font-weight:400}.guide h1:after{content:':'}.guide hr{border:0;border-top:1px solid rgba(200, 200, 200, 0.25);margin:0.6rem 0}.guide ul li{margin-bottom:1rem}a{color:orangered}.scrollbar::-webkit-scrollbar{width:0.5rem}.scrollbar::-webkit-scrollbar-track{background-color:#343434}.scrollbar::-webkit-scrollbar-thumb{border-radius:2px;background-color:#232323;border:1px solid #343434}.email-form{display:grid;grid-template-columns:repeat(12, 1fr);grid-template-rows:repeat(12, 1fr) 60px;grid-gap:1rem;width:100%;height:100%;position:relative;grid-area:1 / 1 / span 12 / span 1;overflow-y:scroll;box-sizing:border-box;padding:1rem}.close-button{position:absolute;top:0;right:0;width:2rem;height:2rem;border-radius:50%;display:flex;justify-content:center;align-items:center;cursor:pointer;fill:white;background:#232323;border:none}.close-button:focus{fill:orangered}.return-address{grid-column:1 / span 12;grid-row:1;display:flex;flex-direction:column}.sender-name{grid-column:1 / span 12;grid-row:2;display:flex;flex-direction:column}.job-role{grid-column:1 / span 12;grid-row:3;display:flex;flex-direction:column}.employer-website{grid-column:1 / span 12;grid-row:4;display:flex;flex-direction:column}.job-city{grid-column:1 / span 6;grid-row:5;display:flex;flex-direction:column}.job-state{grid-column:7 / span 6;grid-row:5;display:flex;flex-direction:column}.job-zip{grid-column:1 / span 12;grid-row:6;display:flex;flex-direction:column}.job-compensation{grid-column:1 / span 8;grid-row:7;display:flex;flex-direction:column}.job-full-time{grid-column:9 / span 4;grid-row:7;display:flex;flex-direction:column}.email-body{display:flex;flex-direction:column;grid-column:1 / span 12;grid-row:8 / span 3;max-width:100%;max-height:100%;resize:none;height:400px}label{font-size:0.8rem;font-family:var(--font-family);color:orangered}label input[type='checkbox']{position:relative;height:100%;width:100%;margin:0;opacity:0;cursor:pointer}.job-full-time{position:relative}.checkbox-container{position:relative;margin:0 auto;margin-top:0.75rem;height:100%;background-color:#565656;border-radius:500px;width:65%}.knob{position:absolute;top:50%;left:0;transform:translate(0, -50%);width:var(--knob-size);height:var(--knob-size);background-color:orangered;border-radius:50%;transition:all 0.2s ease-in-out;pointer-events:none}input[type='checkbox']+.knob:after{width:100%;height:100%;position:absolute;display:flex;justify-content:center;align-items:center;transition:0.3s ease all, left 0.3s cubic-bezier(0.17, 0.89, 0.35, 1.15)}input[type='checkbox']:not(:checked)+.knob:after{content:'NO';color:white}input[type='checkbox']:checked+.knob:after{content:'\\2713';color:#357652;font-size:1.5rem}input[type='checkbox']:checked+.knob{top:50%;left:calc(100% - var(--knob-size));background-color:#92c95c;}input[type='checkbox']{opacity:1;top:0;right:0;left:0;bottom:0;box-sizing:border-box;position:absolute}input[type='checkbox']:not(:checked):before{position:absolute;top:0;right:0;left:0;bottom:0;background-color:#565656;border-radius:2px}input[type='checkbox']:checked:after{position:absolute;top:0;right:0;left:0;bottom:0;background-color:#565656;border-radius:2px}input,textarea{background:#565656;border:none;color:white;padding:0.5rem;font-size:16px;margin-top:0.75rem;border-radius:3px;outline:none;backface-visibility:hidden;}input,textarea,input[type='checkbox']{outline:1px solid transparent;outline-offset:2px}input:focus{outline:2px solid orangered}textarea:focus{outline:2px solid orangered}.email-body>textarea{height:100%;resize:none;font-family:'Roboto', sans-serif;padding:0.5rem}button:not(.close-button),input[type='submit']{border-radius:3rem;max-height:50%;margin-top:calc(25% / 2);cursor:pointer;outline:none;font-family:var(--font-family);transition:all cubic-bezier(0.165, 0.84, 0.44, 1) 0.3s;line-height:0.85rem;font-size:0.85rem}input[type='submit'],.send-button__loading{grid-column:10 / 13;grid-row:13;border:none}.clear-button{grid-column:07 / 10;grid-row:13;background-color:transparent;color:orangered;border:2px solid white;box-sizing:border-box}.clear-button:hover{background-color:orangered;color:white}.clear-button:focus{outline:3px solid orangered}.send-button:focus{outline:3px solid orangered}.send-button:active,.clear-button:active{transform:scale(0.95);background-color:white;color:black}.send-button:hover{background:orangered;color:white}.hidden{display:none}.block{display:block}pre{white-space:pre-wrap}.loader__loader_top,.loader__loader_bottom{position:absolute;width:80px;height:70px}.loader__loader_bottom{top:50%;left:50%;transform:translate(-50%, calc(-50% + 3.5px)) rotate(180deg)}.loader__loader_top{top:50%;left:50%;transform:translate(-50%, calc(-50% - 3px))}.loader{position:relative;border-radius:5000px;border:2px solid #565656;height:30px;box-sizing:border-box;margin:9.25px 0 0 0}";

const EmailModal$1 = class extends H {
  constructor() {
    super();
    this.__registerHost();
    this.__attachShadow();
    this.showSuccess = createEvent(this, "show-success", 7);
    this.mouseTrapClick = createEvent(this, "mouseTrapClick", 7);
    this.sendEmail = createEvent(this, "send-email", 7);
    this.closeModal = createEvent(this, "closeModal", 7);
    // Form State
    this.valid = false;
    this.message = '';
    this.employerName = '';
    this.employerEmail = '';
    this.roleOrTitle = '';
    this.employerWebsite = '';
    this.jobCity = '';
    this.jobState = '';
    this.jobZip = '';
    this.jobCompensation = '';
    this.jobFullTime = false;
    // Error Handling
    this.open = false;
    this.finished = false;
    this.loading = false;
    this.renderLoader = () => {
      const loaderSrc = !this.loader ? getAssetPath(`./assets/loading_half.gif`) : this.loader;
      return this.loading ? (h("div", { class: "loader" }, h("img", { src: loaderSrc, class: "loader__loader_top" }), h("img", { src: loaderSrc, class: "loader__loader_bottom" }))) : null;
    };
    this.handleInputChange = (event) => {
      const { name, value } = event.target;
      this[name] = value;
    };
    this.mouseTrapClickHandler = (event) => {
      this.mouseTrapClick.emit(event);
    };
    this.onSubmit = e => {
      // this will only fire if the form is valid
      e.preventDefault();
      this.sendEmail.emit({
        message: this.message,
        employerName: this.employerName,
        employerEmail: this.employerEmail,
        roleOrTitle: this.roleOrTitle,
        employerWebsite: this.employerWebsite,
        jobCity: this.jobCity,
        jobState: this.jobState,
        jobZip: this.jobZip,
        jobCompensation: this.jobCompensation,
        jobFullTime: this.jobFullTime,
      });
      this.loading = true;
    };
    this.clearMessageHandler = () => {
      this.message = '';
    };
    this.handleSpecialKeys = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        this.mouseTrapClick.emit();
      }
    };
    this.renderModal = () => {
      return (h(Host, { class: this.open ? 'block' : 'hidden' }, h("aside", { class: "email-modal" }, h("button", { class: "close-button", onClick: this.mouseTrapClickHandler }, h("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", width: "24", height: "24" }, h("path", { fill: "none", d: "M0 0h24v24H0z" }), h("path", { d: "M13.414 12l5.293 5.293-1.414 1.414-5.293-5.293-5.293 5.293-1.414-1.414L10.586 12 5.293 6.707l1.414-1.414L12 10.586l5.293-5.293 1.414 1.414L13.414 12z" }))), h("form", { class: "email-form scrollbar", id: "form", onKeyDown: e => this.handleSpecialKeys(e), onSubmit: e => this.onSubmit(e) }, h("label", { htmlFor: "employerEmail", class: "return-address" }, "Your Email Address*", h("input", { title: "please enter an email of the form a@b.(com/net/etc)", autoFocus: true, id: "emailInput", type: "email", onKeyDown: e => this.handleSpecialKeys(e), onChange: e => this.handleInputChange(e), name: "employerEmail", value: this.employerEmail, placeholder: "Enter your email address", required: true })), h("label", { htmlFor: "employerName", class: "sender-name" }, "Employer Name*", h("input", { type: "text", onChange: e => this.handleInputChange(e), onKeyDown: e => this.handleSpecialKeys(e), name: "employerName", value: this.employerName, placeholder: "Seasonal Decorations Inc", required: true })), h("label", { htmlFor: "roleOrTitle", class: "job-role" }, "Job Role or Title*", h("input", { type: "text", onChange: e => this.handleInputChange(e), onKeyDown: e => this.handleSpecialKeys(e), name: "roleOrTitle", value: this.roleOrTitle, placeholder: "3D Ornament designer", required: true })), h("label", { htmlFor: "employerWebsite", class: "employer-website" }, "Website", h("input", { pattern: "https?://.*", title: "please enter your website using http(s):// (leave blank if no website)", type: "text", onChange: e => this.handleInputChange(e), onKeyDown: e => this.handleSpecialKeys(e), name: "employerWebsite", value: this.employerWebsite, placeholder: "https://www.seasonaldecorations.com" })), h("label", { htmlFor: "jobCity", class: "job-city" }, "City*", h("input", { type: "text", onChange: e => this.handleInputChange(e), onKeyDown: e => this.handleSpecialKeys(e), name: "jobCity", value: this.jobCity, placeholder: "Gillette", required: true })), h("label", { htmlFor: "jobState", class: "job-state" }, "State*", h("input", { type: "text", onChange: e => this.handleInputChange(e), onKeyDown: e => this.handleSpecialKeys(e), name: "jobState", value: this.jobState, placeholder: "WY", required: true })), h("label", { htmlFor: "jobZip", class: "job-zip" }, "Zip*", h("input", { type: "text", pattern: "[0-9][0-9][0-9][0-9][0-9]", onChange: e => this.handleInputChange(e), onKeyDown: e => this.handleSpecialKeys(e), name: "jobZip", value: this.jobZip, placeholder: "10001", required: true })), h("label", { htmlFor: "jobCompensation", class: "job-compensation" }, "Compensation*", h("input", { type: "text", onChange: e => this.handleInputChange(e), onKeyDown: e => this.handleSpecialKeys(e), name: "jobCompensation", value: this.jobCompensation, placeholder: "$15/hr, $30k/yr, etc", required: true })), h("label", { htmlFor: "jobFullTime", class: "job-full-time" }, "Full-Time", h("div", { class: "checkbox-container" }, h("input", { type: "checkbox", onChange: e => this.handleInputChange(e), name: "jobFullTime", checked: this.jobFullTime }), h("div", { class: "knob" }))), h("label", { htmlFor: "message", class: "email-body" }, "Message For Badge Holders*", h("textarea", { class: "scrollbar", onChange: e => this.handleInputChange(e), onKeyDown: e => this.handleSpecialKeys(e), name: "message", value: this.message, placeholder: "write you message here", required: true })), h("button", { class: "clear-button", onClick: () => this.clearMessageHandler() }, "Clear"), this.loading ? (h("div", { class: "send-button__loading" }, this.renderLoader())) : (h("input", { type: "submit", class: "send-button", value: "Send" }))), h("div", { class: "guide scrollbar" }, h("h1", null, "Helpful tips"), h("hr", null), h("ul", null, h("li", null, "Be sure to include your email address so that badge holders can respond to you."), h("li", null, "Be sure to include your name so that badge holders know who you are."), h("li", null, "Be sure to include a message so that badge holders know why you are contacting them.")), h("h2", null, "Example:"), h("pre", null, "### Job title ", h("br", null), '   ', "Fabrication Engineer", h("br", null), h("br", null), "### Job Description ", h("br", null), '   ', "We are looking for someone who is interested in ", h("br", null), " working with a wide variety of materials and tools. ", h("br", null), "* Using the workshop tools in AREA 59, ", h("br", null), '   ', " including: CNC machines, soldering irons, ", h("br", null), '   ', " (Fusion 360) 3D printers, and glue sticks,", h("br", null), '   ', " construct seasonal decorations according ", h("br", null), '   ', " to established specifications, and address ", h("br", null), '   ', " any emergent issues with specifications ", h("br", null), '   ', " discovered during the manufacturing process.", h("br", null), "### Additional requirements ", h("br", null), '   ', " ", h("br", null), '   ', "* $13.59/hr up to $21.09/hr ", h("br", null), '   ', "* Gillette, Wy - Full Time (6m probationary period) ", h("br", null), '   ', "* 30-40hrs / week ", h("br", null), '   ', "* U.S. Holidays off, one day per month sick-time ", h("br", null), '   ', "* Must be able to lift 40lbs", h("br", null), '   ', "* Must be able to work with fine details ", h("br", null), '   ', " ", h("br", null), h("br", null), h("br", null), "### About the Company ", h("br", null), "We are a small, family owned business located in Gillette, Wy. We make decorations for the holidays, as well as other seasonal items."))), h("div", { class: "mouse-trap", onClick: e => this.mouseTrapClickHandler(e) })));
    };
  }
  finishedChanged() {
    if (this.finished) {
      this.open = false;
      this.showSuccess.emit('success');
    }
  }
  handleKeyDown(ev) {
    this.handleSpecialKeys(ev);
  }
  // used to fire functions after a change in render (caused by prop or attribute change)
  componentDidRender() {
    // this.el.shadowRoot.getElementById('emailInput').focus()
  }
  connectedCallback() {
    // shows example info only if there's nothing in the form upon opening modal
    if (this.message === '') {
      this.message = `### Job title

    ### Job Description
       * Role (mission, objectives, position, etc)
       * Salary / Compensation
       * Location / Duration of contract
       * Hours / Schedule
       * etc
    
    ### Additional requirements
       * Certifications, Major, Software Familiarity, etc
    
    ### About the Company`;
    }
  }
  render() {
    return this.open ? this.renderModal() : h("div", null);
  }
  static get watchers() { return {
    "finished": ["finishedChanged"]
  }; }
  static get style() { return emailModalCss; }
};

const groupCardCss = ":host{display:block}";

const GroupCard$1 = class extends H {
  constructor() {
    super();
    this.__registerHost();
    this.__attachShadow();
  }
  render() {
    return (h(Host, null, h("slot", null)));
  }
  static get style() { return groupCardCss; }
};

function filterCourses(courses) {
  let filteredCourses = courses.filter(course => !course.badge_name.toLowerCase().includes('makercamp'));
  filteredCourses = filteredCourses.filter(course => course.badge_name.toLowerCase().includes(':'));
  return filteredCourses;
}
function testData() {
  return [
    {
      _id: 'b39770f38396c1e532a8a6a2d7e979f8fd6cea5741ec3e2a90686be6ab0f7d4f',
      _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
      _createdDate: 'Wed Jul 13 2022 08:48:37 GMT-0600 (Mountain Daylight Time)',
      badge_desc: 'A MakerCamp badge to demonstrate proficiency in professional communication both in the makerspace and in the workplace.',
      _updatedDate: 'Wed Jul 13 2022 08:48:37 GMT-0600 (Mountain Daylight Time)',
      badge_name: 'Professional Communication',
      badge_tags: ['makercamp'],
      number_held: 1,
      title: 'H0-IQIlUSAOHTgBSwwVC8Q',
      badge_icon_uri: 'https://api.badgr.io/public/badges/l5wxLNUoQBeGc7R5OZDPVw/image',
      badge_link: 'https://www.wyrkshop.org/workshops/Professional%20Communication',
    },
    {
      _id: '925acbb5e2549e7266583542d114a7e12ca9ee3f3959a2342d171db56f703631',
      _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
      _createdDate: 'Wed Jul 13 2022 08:48:37 GMT-0600 (Mountain Daylight Time)',
      badge_desc: 'GDS102: Introduction to Inkscape',
      _updatedDate: 'Wed Jul 13 2022 08:48:37 GMT-0600 (Mountain Daylight Time)',
      badge_name: 'GDS102: Introduction to Inkscape',
      badge_tags: [],
      number_held: 4,
      title: 'H0-IQIlUSAOHTgBSwwVC8Q',
      badge_icon_uri: 'https://api.badgr.io/public/badges/QGMlSNkQTcyjVYOTrwsQEQ/image',
      badge_link: 'https://www.wyrkshop.org/workshops/GDS102',
    },
    {
      _id: '02fbe75a202ba69e78a1a09fc96d467e0df5cfce2503591848726086ad20ed78',
      _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
      _createdDate: 'Wed Jul 13 2022 08:48:37 GMT-0600 (Mountain Daylight Time)',
      badge_desc: 'MakerCamp - CAD101: Learning Onshape',
      _updatedDate: 'Wed Jul 13 2022 08:48:37 GMT-0600 (Mountain Daylight Time)',
      badge_name: 'MakerCamp - CAD101: Learning Onshape',
      badge_tags: [],
      number_held: 0,
      title: 'H0-IQIlUSAOHTgBSwwVC8Q',
      badge_icon_uri: 'https://api.badgr.io/public/badges/uiSy-37iQzW888it8MyTew/image',
      badge_link: 'https://www.wyrkshop.org/workshops/CAD101',
    },
    {
      _id: '329e73708a0064f2e9f1929f6d7ed49094529cf301d369a503fac88466616ba5',
      _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
      _createdDate: 'Wed Jul 13 2022 08:48:37 GMT-0600 (Mountain Daylight Time)',
      badge_desc: 'MakerCamp - CRFT101: Learning the Cricut Maker',
      _updatedDate: 'Wed Jul 13 2022 08:48:37 GMT-0600 (Mountain Daylight Time)',
      badge_name: 'MakerCamp - CRFT101: Learning the Cricut Maker',
      badge_tags: [],
      number_held: 0,
      title: 'H0-IQIlUSAOHTgBSwwVC8Q',
      badge_icon_uri: 'https://api.badgr.io/public/badges/rQPwt7VOQdWBX726JculOQ/image',
      badge_link: 'https://www.wyrkshop.org/workshops/CRFT101',
    },
    {
      _id: 'c06087ac6dc32d9a08ee3a74ba4ba6a175cc55ff6ff05036a2825c27381ab06f',
      _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
      _createdDate: 'Wed Jul 13 2022 08:48:37 GMT-0600 (Mountain Daylight Time)',
      badge_desc: 'MakerCamp - CRFT110: Introductory Singer Sewing Machines',
      _updatedDate: 'Wed Jul 13 2022 08:48:37 GMT-0600 (Mountain Daylight Time)',
      badge_name: 'MakerCamp - CRFT110: Introductory Singer Sewing Machines',
      badge_tags: [],
      number_held: 0,
      title: 'H0-IQIlUSAOHTgBSwwVC8Q',
      badge_icon_uri: 'https://api.badgr.io/public/badges/XfJl_yHiTZyrLtJAKQ6-Zw/image',
      badge_link: 'https://www.wyrkshop.org/workshops/CRFT110',
    },
    {
      _id: 'f78ea15af6c3426255d7d0e399e6acec43de0f939d3940a28fba3c5179b37598',
      _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
      _createdDate: 'Wed Jul 13 2022 08:48:37 GMT-0600 (Mountain Daylight Time)',
      badge_desc: 'CAD101: Learning Onshape (Legacy)',
      _updatedDate: 'Wed Jul 13 2022 08:48:37 GMT-0600 (Mountain Daylight Time)',
      badge_name: 'CAD101: Learning Onshape (Legacy)',
      badge_tags: [],
      number_held: 147,
      title: 'H0-IQIlUSAOHTgBSwwVC8Q',
      badge_icon_uri: 'https://api.badgr.io/public/badges/ZjR2izkAQu-8muwLWFtJwg/image',
      badge_link: 'https://www.wyrkshop.org/workshops/CAD101',
    },
  ];
}
const testSubSets = () => {
  return [
    {
      _id: 'aae9f389-9aac-4524-a57b-0f5a2d8f9d8c',
      setTitle: 'GDS103, WOOD101',
      subsetItems: [
        [
          {
            recipient: '195c3a05ccc4dfaf470ca9d918c490024197655aa5f19046afda379481aa26af',
            expires: null,
            revoked: false,
            badgeclass: '1e24827bf4381fd39597b8fd8d3b506ef1735cdeda1ad6190d1e5454b413d1b3',
            revocationReason: null,
            _id: 'd4edce9eb3fe8953616262bca9ae72f9068a61c7d209b52b30bf8bdeeb57c53a',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.858Z',
            badge_desc: 'GDS103: Learning Adobe Photoshop',
            _updatedDate: '2022-07-13T15:34:23.654Z',
            badge_name: 'GDS103: Learning Adobe Photoshop',
            badge_tags: [],
            title: 'Ssy-YeueS_K4LaU5Fbk8yg',
            badge_icon_uri: 'https://api.badgr.io/public/badges/WplDDPZ0ShWXODMyk1Ixaw/image',
            issuedOn: '2022-07-12T20:21:58.136Z',
            acceptance: false,
          },
          {
            recipient: '08adce212ff7a531f488e283f84aaf99473cbb90b07ddd9a4a1424e9863ac731',
            expires: null,
            revoked: false,
            badgeclass: '1e24827bf4381fd39597b8fd8d3b506ef1735cdeda1ad6190d1e5454b413d1b3',
            revocationReason: null,
            _id: '8a32ae563d736e6f58e81561ae9a071fcfa8b7e70d9d62593946e784d2fa5297',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.857Z',
            badge_desc: 'GDS103: Learning Adobe Photoshop',
            _updatedDate: '2022-07-13T15:34:23.654Z',
            badge_name: 'GDS103: Learning Adobe Photoshop',
            badge_tags: [],
            title: '29TMJDWsQ3qGgyHmvD4Jkg',
            badge_icon_uri: 'https://api.badgr.io/public/badges/WplDDPZ0ShWXODMyk1Ixaw/image',
            issuedOn: '2022-07-12T19:35:36.042Z',
            acceptance: false,
          },
          {
            recipient: 'c544c03c745ebb9fb65e413631fb5204173f6fc5f9e3447ffb35ce6068638702',
            expires: null,
            revoked: false,
            badgeclass: '1e24827bf4381fd39597b8fd8d3b506ef1735cdeda1ad6190d1e5454b413d1b3',
            revocationReason: null,
            _id: '0778f529c5df9768a2a0c67995ad29e9c62fca4c6a7ac135bc21bf0a1c97f191',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.856Z',
            badge_desc: 'GDS103: Learning Adobe Photoshop',
            _updatedDate: '2022-07-13T15:34:23.654Z',
            badge_name: 'GDS103: Learning Adobe Photoshop',
            badge_tags: [],
            title: 'U54iRsFcTliICwuv7mjZ3A',
            badge_icon_uri: 'https://api.badgr.io/public/badges/WplDDPZ0ShWXODMyk1Ixaw/image',
            issuedOn: '2022-05-24T15:42:58.775Z',
            acceptance: false,
          },
          {
            recipient: '1282b7378296a76ed89ea64539f71c3abda69f8c28ef97d7dbfcde18bcceb891',
            expires: null,
            revoked: false,
            badgeclass: '1e24827bf4381fd39597b8fd8d3b506ef1735cdeda1ad6190d1e5454b413d1b3',
            revocationReason: null,
            _id: 'e209bfd13f5f593e5050fbb5f8524339190e9ea3e6784e4b43411a9fa66ff9da',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.855Z',
            badge_desc: 'GDS103: Learning Adobe Photoshop',
            _updatedDate: '2022-07-13T15:34:23.654Z',
            badge_name: 'GDS103: Learning Adobe Photoshop',
            badge_tags: [],
            title: 'dq09jfE9QCyhzZnebI9DYQ',
            badge_icon_uri: 'https://api.badgr.io/public/badges/WplDDPZ0ShWXODMyk1Ixaw/image',
            issuedOn: '2022-04-30T02:38:30.578Z',
            acceptance: false,
          },
          {
            recipient: '9afa7eb05338819eed1760e057d17f50c050dd21af375b97258492d8a0ccf293',
            expires: null,
            revoked: false,
            badgeclass: '1e24827bf4381fd39597b8fd8d3b506ef1735cdeda1ad6190d1e5454b413d1b3',
            revocationReason: null,
            _id: 'ceee31a82d6596723237206f9eee9cf826b22b5f2c5a9561a817ceb1de30b86b',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.854Z',
            badge_desc: 'GDS103: Learning Adobe Photoshop',
            _updatedDate: '2022-07-13T15:34:23.654Z',
            badge_name: 'GDS103: Learning Adobe Photoshop',
            badge_tags: [],
            title: 'C4XJEJr5QD6oHVPllzTjyg',
            badge_icon_uri: 'https://api.badgr.io/public/badges/WplDDPZ0ShWXODMyk1Ixaw/image',
            issuedOn: '2022-04-08T15:26:38.009Z',
            acceptance: false,
          },
          {
            recipient: 'f7d65137437703d18cb048ee30902951ab9863949245942fd7a172037daee70b',
            expires: null,
            revoked: false,
            badgeclass: '1e24827bf4381fd39597b8fd8d3b506ef1735cdeda1ad6190d1e5454b413d1b3',
            revocationReason: null,
            _id: '110d3fb270a7c09daab2299d243d2316131caa6b062824637ec72d2a18acfcaa',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.853Z',
            badge_desc: 'GDS103: Learning Adobe Photoshop',
            _updatedDate: '2022-07-13T15:34:23.654Z',
            badge_name: 'GDS103: Learning Adobe Photoshop',
            badge_tags: [],
            title: 'F8db-3S1QEePsqfuZrU8Pw',
            badge_icon_uri: 'https://api.badgr.io/public/badges/WplDDPZ0ShWXODMyk1Ixaw/image',
            issuedOn: '2022-03-09T01:02:03.875Z',
            acceptance: false,
          },
          {
            recipient: '930c67836a96c87f619b8b63e7fa488da8d25df9db27adb394d0ba5e2490729c',
            expires: null,
            revoked: false,
            badgeclass: '1e24827bf4381fd39597b8fd8d3b506ef1735cdeda1ad6190d1e5454b413d1b3',
            revocationReason: null,
            _id: '9f7118e4f604001539c8620eb300131a320a2a82fdd96f4ecaeae0f8d172e7fc',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.852Z',
            badge_desc: 'GDS103: Learning Adobe Photoshop',
            _updatedDate: '2022-07-13T15:34:23.654Z',
            badge_name: 'GDS103: Learning Adobe Photoshop',
            badge_tags: [],
            title: 'E6eQW_4JSZ-NRjcRAZDA1w',
            badge_icon_uri: 'https://api.badgr.io/public/badges/WplDDPZ0ShWXODMyk1Ixaw/image',
            issuedOn: '2022-02-01T19:22:43.054Z',
            acceptance: false,
          },
          {
            recipient: '6e3a2bf2095f6ea587dfb459d59fa728cd1cd458fd58fde77b0fd1e0a665b944',
            expires: null,
            revoked: false,
            badgeclass: '1e24827bf4381fd39597b8fd8d3b506ef1735cdeda1ad6190d1e5454b413d1b3',
            revocationReason: null,
            _id: '40d08d8f3ff3ee48cf20eaf2bf5dbc697fc7be2929aeb041df097499243bebff',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.851Z',
            badge_desc: 'GDS103: Learning Adobe Photoshop',
            _updatedDate: '2022-07-13T15:34:23.654Z',
            badge_name: 'GDS103: Learning Adobe Photoshop',
            badge_tags: [],
            title: '2GWLHEMwSOGlwy9bgkQhRw',
            badge_icon_uri: 'https://api.badgr.io/public/badges/WplDDPZ0ShWXODMyk1Ixaw/image',
            issuedOn: '2021-10-28T13:38:02.998Z',
            acceptance: false,
          },
          {
            recipient: '1e580f048ed015d018aa60efc29fe7db02048795a6eb5165407803249e93a002',
            expires: null,
            revoked: false,
            badgeclass: '1e24827bf4381fd39597b8fd8d3b506ef1735cdeda1ad6190d1e5454b413d1b3',
            revocationReason: null,
            _id: 'a62502027abe26c045f66adf20215f579f7f25d44c5b0cd13f0e1f0a815ee830',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.850Z',
            badge_desc: 'GDS103: Learning Adobe Photoshop',
            _updatedDate: '2022-07-13T15:34:23.654Z',
            badge_name: 'GDS103: Learning Adobe Photoshop',
            badge_tags: [],
            title: 'k6x3uyLLTJWNpyS7xtBXCg',
            badge_icon_uri: 'https://api.badgr.io/public/badges/WplDDPZ0ShWXODMyk1Ixaw/image',
            issuedOn: '2021-09-25T02:09:38.689Z',
            acceptance: false,
          },
          {
            recipient: '117443d850a77fef2925d3dd36f17fe1a5af99532ead490c9275fe4a421bd2ce',
            expires: null,
            revoked: false,
            badgeclass: '1e24827bf4381fd39597b8fd8d3b506ef1735cdeda1ad6190d1e5454b413d1b3',
            revocationReason: null,
            _id: '1e6d0f46bec55b1fc5773cc1721433ab1a090f4fbdc2c3e1ffdc3775eb822f2b',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.849Z',
            badge_desc: 'GDS103: Learning Adobe Photoshop',
            _updatedDate: '2022-07-13T15:34:23.654Z',
            badge_name: 'GDS103: Learning Adobe Photoshop',
            badge_tags: [],
            title: '3fU4mBJ6TauqtU2E1xtKkQ',
            badge_icon_uri: 'https://api.badgr.io/public/badges/WplDDPZ0ShWXODMyk1Ixaw/image',
            issuedOn: '2021-08-17T18:50:47.937Z',
            acceptance: false,
          },
          {
            recipient: '58349ce96ec2fa114e0d079d571109179ee4a7e0527c5974db8e758175af1aab',
            expires: null,
            revoked: false,
            badgeclass: '1e24827bf4381fd39597b8fd8d3b506ef1735cdeda1ad6190d1e5454b413d1b3',
            revocationReason: null,
            _id: '22d92dcd7604e31f99b66b4727cebfbecb77a2482d32ca8a5be221bbba4ceda6',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.848Z',
            badge_desc: 'GDS103: Learning Adobe Photoshop',
            _updatedDate: '2022-07-13T15:34:23.654Z',
            badge_name: 'GDS103: Learning Adobe Photoshop',
            badge_tags: [],
            title: 'PkHjn4PaQ_2SESjVH8BdQA',
            badge_icon_uri: 'https://api.badgr.io/public/badges/WplDDPZ0ShWXODMyk1Ixaw/image',
            issuedOn: '2021-03-23T22:23:01.335Z',
            acceptance: false,
          },
          {
            recipient: '2361f81c8877f6fe5d0e3868201143b5135f4e90488c42e8a5ce00a130292541',
            expires: null,
            revoked: false,
            badgeclass: '1e24827bf4381fd39597b8fd8d3b506ef1735cdeda1ad6190d1e5454b413d1b3',
            revocationReason: null,
            _id: '9c82bceab0fcaf7be31a31e60baf41ead1281f6f2fdd6df378c9819a55e239a7',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.847Z',
            badge_desc: 'GDS103: Learning Adobe Photoshop',
            _updatedDate: '2022-07-13T15:34:23.654Z',
            badge_name: 'GDS103: Learning Adobe Photoshop',
            badge_tags: [],
            title: '79jcTZOrSgmYaMw4zRHxIA',
            badge_icon_uri: 'https://api.badgr.io/public/badges/WplDDPZ0ShWXODMyk1Ixaw/image',
            issuedOn: '2021-03-23T14:57:47.585Z',
            acceptance: false,
          },
        ],
        [
          {
            recipient: 'f7d87d469adbafb9b469fc8e47bfd579b4d3b76fff2f7e20d77bb927de0e12fa',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'b3d2810440151194c5a48b7e30d8b9d433184393cb8b4a5c557c1f7b072819b7',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:17.016Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'lMFBZhiORU-aTraWVW0RPw',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-03-06T19:37:39.113Z',
            acceptance: false,
          },
          {
            recipient: 'd117a17c0722f73db300dab741f3ed27a51a3d379f74448e2bd8c91ad75d8e75',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'bc91c58e7f13b58c387ae00ae6246a099442ae4e679b9ba05f82742cb58f4de2',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:17.015Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'IyAlSGLcRf2TFMtfAIouaw',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-03-06T19:37:20.803Z',
            acceptance: false,
          },
          {
            recipient: 'e8605a1621d81a5f8df21d2efecdfa4ce3470ad5d599ce1692430cbf2000047e',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '9863dea37a6e2686875a20b050add173180959acd478542da850933b99dec9b8',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:17.014Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'CcOJedUOQi-Oid2YIuDgfQ',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-03-06T19:33:18.013Z',
            acceptance: false,
          },
          {
            recipient: 'c0d7a69f130daed380f2bfee1c0bc9d02b9cdbb6ac1a9f5969ebdb6f692076a3',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '16c27194954dffc710db368c04f205b669d0f7b939d1ecdf0a26c30e52ec75dd',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:17.013Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: '7_2ozk-GRUuBsX1RsF_Gvw',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-03-03T20:49:13.102Z',
            acceptance: false,
          },
          {
            recipient: '360394e7dfac76e09b351d4c16b0bc104b94ded9e5a6119f73251e31754bab81',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '82932ea67625969d41001906480330f10165aea96e636fae8dfeb1483c85b065',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:17.012Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'dpj_e3heQPmqqe6RpwoZTg',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-02-26T23:51:50.554Z',
            acceptance: false,
          },
          {
            recipient: '77c050fbd22cceea8c200a1c6677ae6737e6d04bd6976515c5ab9941c41d7834',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '8b51e079108f389cca833052235f9bb64331856e69800c427c5c980d26a74760',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:17.011Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: '3MrdRtJCQnmVbUPaQGJcZw',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-02-13T23:24:16.190Z',
            acceptance: false,
          },
          {
            recipient: '69e87966d1115dd5bdad06ab6b339530793447fc0352afb2c2dc83754e4b8967',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'd6d3e8ad51af3a61dcbda7514ac85863a9331c4eba33411e677656c27e584497',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:17.010Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'xid-brqTTAKkNREllwis2g',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-02-13T22:46:29.533Z',
            acceptance: false,
          },
          {
            recipient: '9034dc88e29dcc8bbee013a19673d6ab306da74480dc3ba2c068a1f2f450ade5',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '8aa7f2e1dd6442772f8a72749d1469894c9360de0fc0b691d431ae76b48944e4',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:17.009Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'cSRzBRFARwClszDpyGcg8w',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-02-13T21:57:29.938Z',
            acceptance: false,
          },
          {
            recipient: '5c181bd1d6c43564904ecbfc778dd2795982b6a8f6217dbd1fbd85a528466549',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '6ca1704bfebadef135ce64fb6a3b300ed79325b01884e55f1b5dd6146b27aa83',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:17.008Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'FZYx1HzaRhSBFtBXnE4NNQ',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-02-13T21:56:17.074Z',
            acceptance: false,
          },
          {
            recipient: '57af096c1a86e892087eb55ba2a838b2383fa07655ff19a0535c40880524fb53',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '3c58f7f63d32f9da64b67b293dc10dd77333e749133bb56a027cc41e571753b1',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:17.007Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'fFmcV_YpT4qHoS0Z8wI7gg',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-02-13T21:45:00.359Z',
            acceptance: false,
          },
          {
            recipient: 'bd74d72f9cec02813219c189ad06f8dc09e12a58744b53d3719801c6131de8dc',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'cb061dad4f94872eca63f46d3543a7d3a6feb589526fb682e24cace09434fa77',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:17.006Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'yypnvFmBSAa7IbG--kK3cA',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-02-12T00:08:41.394Z',
            acceptance: false,
          },
          {
            recipient: '5fbca90c0ba4e82553cd411aae3297e4ae4e206196b424812271b186ce88e1fb',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '2161177fa51633395c1657116b7fdfee44ff2ddc323bc9483adfe51a6a30c803',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:17.005Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'QrkKg1W2T6iku-5-G3QEnw',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-02-06T19:18:55.754Z',
            acceptance: false,
          },
          {
            recipient: 'b123435a90c73ec22508e81a9061d958ceaa782f57b0741a39736945a1ecc7bd',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'c49b48d2d991baaf675b98f3e7a07efd975250abae6234dccd7fcb50a7403ea3',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:17.004Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'VUm4spQ3QBiNdBQPqXrCWg',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-02-06T16:52:42.162Z',
            acceptance: false,
          },
          {
            recipient: '447b2fc64f0fc8cc85b9d28bffe3233b0d59ddfcc366d509c2cb5c4aa64e029b',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '4b28c9ef46fcd911133c30faa628c848bcb020fd8064a76e79c6ebb44f25f4e7',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:17.003Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'K5YavI7NT-yrmKeZ_e-5Tg',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-02-06T16:51:27.082Z',
            acceptance: false,
          },
          {
            recipient: '2f59e9c1823585068aad6a1be3493870170447c7a9688867228a104cc382371f',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '35ffa9eed81e8898636c479fd8ec938f7c054eea5fb58908ac8e21c4c6ffb708',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:17.002Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: '0ElyoZTLSfWoOPeo4qt23Q',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-02-05T19:05:40.260Z',
            acceptance: false,
          },
          {
            recipient: 'c53d478393e3b42ed3b78d4c646b4b490c30bc30dc6b5b095c214293b98abbf4',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '03da9fa914a6d91456725e6bcd8edb6a58ba81317fdc5802455f99436de85e25',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:17.001Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'gswhei4tTCKi-t-ZcntKwg',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-02-04T22:08:14.458Z',
            acceptance: false,
          },
          {
            recipient: '6a02be11bdf166a12848370a4ccdec06b6eb413c4a0d2d3e2beb56c6183ef106',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'd0289b01e18d6fb609c6f78fab8ca9cdb69f90ff25888649e8c4e548e05eeca3',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:17.000Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: '0nLXmmanRvuYdFTPKDhM7g',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-02-04T20:41:02.632Z',
            acceptance: false,
          },
          {
            recipient: '94ecdf28081556fbc545dac96f545e6d5a61d80f8852947bed969f919719dbb6',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'fa7e1ad4e618394ab1297f0af660eed25da17c5380f395a1fe9884ccbc2e11ca',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.999Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'B8VvCkpmR4idVxFrcN1I1g',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-02-04T18:40:32.988Z',
            acceptance: false,
          },
          {
            recipient: '515aaf23f4674078a4c099244f0667f51dffa70896cc3437a0cb268dfba694ca',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'e4be347fef3c5f06d61b0cd2f748be46ce00ff31907718dde217a0c596bee178',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.998Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: '2fAKbOggQd-juKvuySCDsQ',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-01-29T23:15:58.244Z',
            acceptance: false,
          },
          {
            recipient: '58048080333d4396a26931981b82f618cb4895be5eb98e8e4b2132992043a40b',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'c82dff2c8c2691bf4d1fd9043eb0fdf328d03f52b19d9a42d8f4ce851b1b2211',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.997Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'mDHFZReUTXGJaCR4FJchWA',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-01-29T01:34:01.804Z',
            acceptance: false,
          },
          {
            recipient: '6dfb90347dc11e52fb473ef3be97c143d97eb91831938067fc385efc81abf904',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '7997bd11c333fec1e9282a7ca5baf962ad539832f8c794e2bce2ec147853bad0',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.996Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'x9tJzkb4TmqbtRufCVdtUQ',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-01-23T23:33:15.646Z',
            acceptance: false,
          },
          {
            recipient: '0fbaf674c2c0323b61db9ad6cbdda1af33e9dabb40d35899b40b24b4852cd4fa',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'ad3bbf7e644d272703ea6babefb308602d75903f6197afaca550e0b374db5459',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.995Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'RKN2kQ9BTYm3QFYyMN416g',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-01-23T23:29:24.141Z',
            acceptance: false,
          },
          {
            recipient: 'dbb604f4d3a09a6d57b71417040467069f54cf56c298f4a0940d2cb5fe4664b5',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '49d01e139ecd6f33c12e6c5cf37cd6646ebf2d3a41db305a5cbff1334158677c',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.994Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'Rr_ACazLRZqQgo6p98PeHw',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-01-23T23:29:01.044Z',
            acceptance: false,
          },
          {
            recipient: '29ae43e5cca9b94fe1c22c5c8c0f0d5778c4a2b8356cda9b22badb59479135e2',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'f6c455915f38af7c66134b22a2e4269ea28e01fb0abf81c86ffc6ef551e2e052',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.993Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'g_U4S7TuSr-eYfc6hgk2qw',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-01-23T23:28:21.854Z',
            acceptance: false,
          },
          {
            recipient: '6da1b60ab3aa7ed8d0d919f028bdd86fe75143e9c9680b7f64a750841623f53a',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '30b30a33a79de728d01758adb0517aa9bd52f987505f1049ed1916e3d7063aad',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.992Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'iNqLP0BqQ96uygAQSavudg',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-01-23T23:27:56.529Z',
            acceptance: false,
          },
          {
            recipient: '09c84a4fe6e3dfc5ffa240f3e88f9925014bad151cacf8ff8a34609de8d36dd2',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'ad96a306c8aa5c1d6bc388c959d80f0eb1389f3e712795973c6e5cede1bb140d',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.991Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'zsHQFogVSFKFDYb9H7DitA',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-01-23T23:27:52.121Z',
            acceptance: false,
          },
          {
            recipient: '826d4842bfd8eb9b2c17f47c4972243fc1b652fe6152a7d1f794328fd8791602',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '2e475e3ad2e40c03809a0a060939069d3fcca85170c022b3660c6b958c2b5a88',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.990Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'UENdqtIcS4inqpVQvliJ4Q',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-01-23T23:26:01.243Z',
            acceptance: false,
          },
          {
            recipient: 'ae1716f8a821cf6420796c88ebb3644497923a653fe0ba483290c09c54f7f824',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'f72a9d95943fc761d1728f09509105fbffe92942d1c831f02273b27211768b06',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.989Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'T2aqIIOvSOuPUMlijpdPNQ',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-01-23T23:24:59.896Z',
            acceptance: false,
          },
          {
            recipient: '045770fcd4e67cdc3b7468c0babed2f7ef170db2e243e039604f9addef487626',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'c3b1f2de8a96d2b1b6e3e3123b7a7b9f93d8cce2520fd19ce8390e57ea0f406a',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.988Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'XNQAb0NyTFWpLntuwfablQ',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-01-16T19:38:37.415Z',
            acceptance: false,
          },
          {
            recipient: '479d3b44e993b1baa58d309eefda18ea302cc78f36d43efbd593d63431df7a05',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '3d679444a340e74f91f6bf282df6a1517e5dd70d781dd7f78b528f2395cc8bc9',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.987Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: '2oORr4qORVeF_FOEZwRdww',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2019-12-17T22:17:10.610Z',
            acceptance: false,
          },
          {
            recipient: '5d7a5e25e26a92b9db1bce4996b033a3b3cc946bc6ef64da502bf4f0fc6397f6',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '52fa8505c41666212179d81400e67c0531d1435c9c1f85948d9206dfe49d2e10',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.986Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'iGRuUSuQSV2_ycz-2ejlGA',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2019-12-17T22:16:14.450Z',
            acceptance: false,
          },
          {
            recipient: '30c3afd5fb936c3bd7070377973d9b1c1d2433a847f2038f4b92846163b229b3',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '579a576ff1a3473e141431dc754462fbebd0daba3d6a35bdd68f2c40500a211b',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.985Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'tjR4Hq5FQ3mWoqCkr93qNg',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2019-12-09T20:31:06.310Z',
            acceptance: false,
          },
          {
            recipient: 'b16551433035860a1ccf9aada4842eb044f3dd8fa8afb808b4be130ffe8a385f',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '803d0dc6934040f85fa3cf16299f21b95a266fe306910e842d9016271fa9cfaf',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.984Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'sCgdktsASy66dpaa2XtSLA',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2019-12-06T21:30:22.966Z',
            acceptance: false,
          },
          {
            recipient: '4c380955fdd7f43f159c8878d3746518592809d34811b39a77ba3fca17ed946e',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '8e6ecadbdc878f11ed7c0fd873d7dff407cabb98a65e11a1b4263c93e9f20c19',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.983Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'yAtP1ORkSPeMPKOMLEEBhA',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2019-12-04T21:44:30.249Z',
            acceptance: false,
          },
          {
            recipient: 'e6df68705ebd0c8fd89cb0dcc6227fba4f103028c0f30c2f8c5e1648a95ee398',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '18a8f1665db3d99820dcb2c4f31f8100dc0801c3e9b471fa9d148187064571d6',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.982Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'VZc5iy4fTBSybxC0yZheaQ',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2019-12-03T22:54:23.560Z',
            acceptance: false,
          },
          {
            recipient: 'a8bf7599ac277a4de7796394acdb70339395dac1e9c6ef2243535efd39fde26a',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '8ed326055a80569241888dd5b6d71dd3b4be77341a85f0d2e3037fbf65101e1d',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.981Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'eFI3F0PATfe_uKML1RkdMw',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2019-11-22T00:01:44.505Z',
            acceptance: false,
          },
          {
            recipient: 'c0efac5d3c5bf4c58c0290189f3ff6cb451e24c1cca2d1bb9844c0ea8f8b7709',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'fce330fb6c179a9639a1188eb6b8ebd7251f854b839b9b873ae1bf296e02d160',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.980Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: '3kPGF6o0SuqC6S1WL99CVA',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2019-11-21T20:19:17.911Z',
            acceptance: false,
          },
          {
            recipient: '639668a88351ff0b41f9abe5ee7d1bc1848c2b87c0cdca34055d3f406bd72c4a',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '7c090dc18dddc2e2c16a8bfdc502165a3af31173c0a01023553d27b9e0b51d5f',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.979Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: '_nOR79GtTCWQz7utoGbg5Q',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2019-11-20T22:08:35.840Z',
            acceptance: false,
          },
          {
            recipient: '6c75d189dc66331ee7915c090de94b98b9a96b2d7f0301c52e05476a8d90527d',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '2e7a9f705fec8bcaa152c1eae419d3d08e5e3aec3cb283263cf0b6764fa0d8aa',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.978Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'KIdOekUDSdSFqAAZr-jdFQ',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2019-11-20T01:33:31.862Z',
            acceptance: false,
          },
          {
            recipient: 'c1f9986031af4a008a4cb51142aa8246743cf5c2d9fc1ca69eae38946d32e8f5',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '25d281c99ce0bdeaac1bcd902bea34829b9f006c0ebe037220d41c7bd42859da',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.977Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'fOP26mPNTNG83wnI7IWQkw',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2019-11-15T19:58:02.661Z',
            acceptance: false,
          },
          {
            recipient: 'f9cbb0218d056e5ef44780bcdb1b822085c4e335969a0d678ac302c84937b120',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '5c21038332d76f147066b973f66a337497f3284fa4591900e7006061fd476226',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.976Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'iKCr3ig_S3W28J7tfMLNVw',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2019-11-05T23:03:28.276Z',
            acceptance: false,
          },
          {
            recipient: 'aeb24c16f7eebe752cc22b706079d0d2d5ffedc8c6be4ff80111912f627090d9',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '193010a7e9c37fb3343a869d46d71447e8b2a41268a21b4b3ccfdce9cb139e73',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.975Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'jJ1QaiMATPmr0hOl3aHnqw',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2019-11-05T22:11:56.065Z',
            acceptance: false,
          },
          {
            recipient: 'd500bb28be6c8399ce7b3ad5c0aeb93ad6c11ba563de02e846417d4ab291b986',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '03d456cb09cc948cd56226446fa003168269e53dde267e6e0d0afff89fe5a519',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.974Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'FtPJNDT7SGGEyKZe4FsowQ',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2019-10-22T21:32:06.072Z',
            acceptance: false,
          },
          {
            recipient: 'a0dc1f51b56ef6a88405c2c992b820415f236404d6d1a8b71b3a14cfe60db41f',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '92977190285bc7fd53dc52e0f5cb204f8e63b77cda3356a13852a0a5dda0cd4e',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.973Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'x-I7ebYeRb6grfZknOclPQ',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2019-10-22T20:56:28.693Z',
            acceptance: false,
          },
          {
            recipient: '3b95176cc26b87780b122ef841ca8096a5bc6b2859607c7ba28aef2805949785',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'cf073258d803723ed960f910341c51f6766a7efd8e495130f1135142b1953f4a',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.972Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'jDdGSETCSl2wpdOlqhJpYw',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2019-10-15T23:19:14.743Z',
            acceptance: false,
          },
          {
            recipient: '3c12a3ceb974a36e8083aefc36da1c3e1019b921c2ddb0c4d962f7261cc4ff0e',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '655e5e74c8b1c6f525060f0e76f0a4d453482a9685c76ca367e14f5b8705053f',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.971Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'So65U8hRQUeuHzjlzniKxQ',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2019-10-10T22:33:06.993Z',
            acceptance: false,
          },
          {
            recipient: '2459fe4390beeb55792227e0c0732ecbb75702c2624890619e3d7051aba1fc27',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '615a8e9e2685b53b7d22a3fa09da216488a34a09d43fff4a7d1fcb7035bcc601',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.970Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: '5Uc-ftbdRHumtWK2G_7jcg',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2019-10-10T19:26:10.388Z',
            acceptance: false,
          },
          {
            recipient: '06861ffff51b781c1310e31e9a1fe1a94c18aaf0aa1c099634e1382fceec2950',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '98cd8b4adf0f8e67c41988d7e118711c8abe82fd7abf458331a4efb073be2e40',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.969Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'TqGlxYruRseGIgAn0-X4Kg',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2019-10-08T21:44:44.387Z',
            acceptance: false,
          },
          {
            recipient: 'e0bb01a278013c9fb38356e27a43de27dc79937fed2af69d9647853b1634760b',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'c1637f3e25faee21e0453aace296c508b33e8a84bdbf40f2a6c1be8bf62e14d1',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.968Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'UYpBIbT9SvOfeOah8HsSiw',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2019-10-07T19:29:23.486Z',
            acceptance: false,
          },
          {
            recipient: 'fc2b76b10e583fea71f07083f6526ee8a6f9c30c09565a723cbd7e18fd3f1cad',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '3f46b94c4cc97fae41e49e660704f5c8df8158f3ba996eafd169dba3212a5e0d',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.967Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'wNug7M4UTQWZ_eicHZzsiQ',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2019-10-04T22:57:13.881Z',
            acceptance: false,
          },
          {
            recipient: '502eaa19472e5f9574a8d8efa736672f2bc7c4635d9846c57aa95e54103ae80d',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '49012badbc45c20c77f49d63f9742f480622a45b806b9ceb3f3b135fb9df9e45',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.966Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'VW8zYajuTbK-SjoP6L8LyQ',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2019-10-02T17:13:33.183Z',
            acceptance: false,
          },
          {
            recipient: 'ed170180d7cb23cd750227eea88971bec265d49c8e61f2b159997567e11bbba1',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '5af51ecf31b92584c934167ecefcc45f10266c2ce646ae84e87de91f9e17ed9f',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.965Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'mrg5EpGhTZWJAOsy3kkluQ',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2019-09-25T14:32:35.390Z',
            acceptance: false,
          },
          {
            recipient: 'cd96281e4c3ede1ead8dd517b23d1f6961bd2fab50e2d8732afc89e9d9cf5d18',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '6f0ac1fd38053bcce5c482f600cf41e8b96279ca457cde41e8fc12466888672a',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.964Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'm76ulBvQQ7K6ys_yNS4UkQ',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2019-09-23T19:52:36.257Z',
            acceptance: false,
          },
          {
            recipient: 'bd137e4bb0f04ad78e014698a1570b83576dfa4b301ca3687672e28ec2d53202',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '91bb998902a4d2f2883ebc7e957fea69ad6987a603bf1c68c7d3c6f1785475b3',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.963Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'PquJphS3RVC3MsEMQEf0cw',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2019-09-18T00:55:08.299Z',
            acceptance: false,
          },
          {
            recipient: 'd0264be6c2605b0993db77ccfb321431d935ae5ab1189f89b80b612e94b90209',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'fed88c2445292ce4ef53b5670d9cbbd77a3b7a40d8548532867fbddfaac7edf3',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.962Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'jAhmOFRKQEecpLIdZa8wMw',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2019-09-17T18:28:46.082Z',
            acceptance: false,
          },
          {
            recipient: 'b7466bd85ef513f2230c27fac980ae098bb8637f461122594a26a674793aa497',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '874512586923d46772056dae9ebf99310eac9c84c71d056cb383e7711e45a5e7',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.961Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'E7rHSB1GRnGHsozhPgv-0g',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2019-09-13T02:20:40.777Z',
            acceptance: false,
          },
          {
            recipient: '2b638a5f759a15f21d45b130f1a5586d36f27efca23f0c26c1a47dcfdfa05939',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'ccc80745d4b870ddd9afb32da9a3bc602fcdab5f209d8e11b4ad6eac014a14dd',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.960Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'uJwGpoypSjqcwflwMEmLRQ',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2019-09-13T01:44:34.007Z',
            acceptance: false,
          },
          {
            recipient: '2dc7f741a14de3275c681c5e61fba9988476c74f50fec9ff4d92ab57bb98ca04',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '1362f02ad3dfd542119970becbfd372e03ff4acc3932c89476e997d2d86d5b39',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.959Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'RalJznG5SfWuMRmkDVKV9Q',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2019-09-13T01:39:33.532Z',
            acceptance: false,
          },
          {
            recipient: '048a247497a755f937ea10680c7fd9843145f90fb01dd824eb6b27c5905cb21d',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'bfac37d74c03a31d21db5dec50b4b5b748be5cd332a0f7773a632f76e901f330',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.958Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'DjRwWqc5TmWfVXlNkAlTIw',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2019-09-10T17:33:33.692Z',
            acceptance: false,
          },
          {
            recipient: 'c0e0c7734ec4999da3da4cb6d6e9e030e7de20a16415862adfa7634ba78f5f8e',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '1d6ed12740e05dcf02f9992e162423b0d4e1605216d4b9592c957b700dfb7b8e',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.957Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'yh6WZ-mqRlS03YVL-oeRYg',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2019-09-06T22:57:51.398Z',
            acceptance: false,
          },
          {
            recipient: '366ef0a3e3b653882c7af0f12b110b78f6406ba432aebcb80d4e4b0458c947d9',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'e915369e4004cb2eeaa28ab9295079f571d8beab6e45647ed61f2c32a8793e82',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.956Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'KBEXrbs4QVGFkarvAvnTZA',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2019-09-05T19:45:01.081Z',
            acceptance: false,
          },
          {
            recipient: 'b4e6ab18a5047b2f966c7963b776a582868fd7e6294705a46df00e8860272199',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '255b219a83b5b9f85afa5671cfb002f801bf2b19da80ba26dd5c5efaf65ed959',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.873Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.599Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'rUlXAkXXSDSny1f9ZnQ1cQ',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2022-07-12T22:18:46.433Z',
            acceptance: false,
          },
          {
            recipient: '88d0949a39caccd5ffd34547e623cb890e05450f5b78525c820865a1b92da2bf',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'e79e899749c8f1ea80a2a9b496cb379384d221eae6027976ae131a7cc3e5e62d',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.872Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.599Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 's9uGRuwVSB2uSdChnjD15A',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2022-07-12T21:56:27.187Z',
            acceptance: false,
          },
          {
            recipient: '1cafa8783be6148185d72b057d308324ef1ec44aa596ce2314f12690caac4d33',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '5256a82d940443687b0970b97a1b7ab608ab171b048a583f5a8254e1a88f3b1c',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.871Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.599Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'jw7iLZwcQ36I4u4ExR6-CA',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2022-07-12T21:23:33.448Z',
            acceptance: false,
          },
          {
            recipient: '3b418b4a2c69144a6306b46d10d7dba3f1544b70dfcb8b7fba80e90ea23740cd',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '751e7e29fa1103e575686ec20731a1b0965761bff417e0a57bed61e00f30c3b7',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.870Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.599Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'iG-bZOXaSuaQED7FWy4fYg',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2022-07-12T21:17:23.781Z',
            acceptance: false,
          },
          {
            recipient: '53915ccda32ed005bd09946466c2145363079bef7415a17c580d65472ae53b9e',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '51c7f0feaca19b359541c751261d5595a8d8b88491d342a255d160220205d08a',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.869Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.599Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'ebwuX_NvS4ucw20qupI_8Q',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2022-07-12T19:35:44.887Z',
            acceptance: false,
          },
          {
            recipient: 'e28718cc7333dca4c36f94af7e0508ac71daaeacd48919ea9efd2c4cefbfa813',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '073ee3ce74f974f403e6ea7bc0df0a79426f3000b35c91610e88d75545424686',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.868Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.599Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'SHnXecoZSVaBuzlqIYb7UA',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2022-07-12T16:27:44.572Z',
            acceptance: false,
          },
          {
            recipient: 'd6299c027b208007bc8b303879dc8b02604ee5f12a42ce76c77402887f8fcb83',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '5ea9976b4665754c39f828c2a99f59afe716e250c2978255c0f4db51b011b046',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.867Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.599Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: '7cCsRcCmR5yYV7A-c7HJ0g',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2022-07-06T14:12:13.171Z',
            acceptance: false,
          },
          {
            recipient: '58635f945fdc12e380591e0338d41afe4a822e43d9ecc300edccb24f91aa6dc3',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '1221737bdaa064a32467852ab2a98e7644c458a7f2388f21d45ec2b96dd6c963',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.866Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.599Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'mSYEYQICSL6vJZgzsrZmiw',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2022-06-23T17:59:44.811Z',
            acceptance: false,
          },
          {
            recipient: '152e852adf89218b3cfcadf3166c1dc0ed41e5d26304c3a010cd2e0daf937ca6',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'ae9dfebfb8a0fe7f5ef85f8e0621642c3c44b14c6b42b174e9de10288a6939c8',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.865Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.599Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'NLQJ8v-FQ4aLfWKtsrcfOA',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2022-06-14T22:50:44.929Z',
            acceptance: false,
          },
          {
            recipient: 'ad1f828500fc997e428186178eefb44260f98fe518701119e2b58fd63f8f8d15',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'b0dbb101d67c86412c9f595e238635c2ae8e3b3d3c04d559333b9e003b7b07da',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.864Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.599Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'YkXVmegvSAO3clKxYVScZA',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2022-06-07T23:31:27.835Z',
            acceptance: false,
          },
          {
            recipient: '011312eaae303408cabfe8e65809cb7cd6bd888e63277c75ee756ac71dda667f',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '3237118a97e1d2761f9651cfe81db94842596925e16d03b9868524c3cc2a7328',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.863Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.599Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'QK2mkEWwRUue2XSerj1d-Q',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2022-05-26T03:26:48.744Z',
            acceptance: false,
          },
          {
            recipient: '7cc9fa8a732fd15353d3fa7e903b81d903f08a027f76482d352b3ef221f10e03',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '9eab0e465ed4d555d604a955de6e4fe34d5417311cc9c5c4ccfe4fd986b5375f',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.862Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.599Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'pyQ6NrDwSE-d7OTH3RzQjQ',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2022-05-24T16:01:41.950Z',
            acceptance: false,
          },
          {
            recipient: '939f3d3fcb313413d63c40d9411822590296259ee63eba496bd9e98f997245ba',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'fad95281645bd6b46767d7bf5eaf5198b3db3e1f3d38a7ec99d65c34d46ee34a',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.861Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.599Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'Z2KFJ0WoSye-sV1sI3TpnQ',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2022-05-24T15:50:18.222Z',
            acceptance: false,
          },
          {
            recipient: '14a0877a1408abe87badf4df98d13ebd5dddd67fe3c3419e6e14cb2ef9a2a5b7',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '886c703c65ea891072fe8d4e9da3e026b5e7972d8e4eb1a7b5541b1f8e977df5',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.860Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.599Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'lV6bCRpaSF6QRXsONbOm6g',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2022-05-24T15:21:50.663Z',
            acceptance: false,
          },
          {
            recipient: '5fad49105d488eac07873e7980c31255d470638eeaf61bea5ec22269000c78b8',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '48f1822072f09dae6f28a8ce04fb888f4456356e4ae5321fc7caaa54869b54a6',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.859Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.599Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'sr6gXBa0TzKfw8PYO7JYlg',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2022-05-24T15:21:02.278Z',
            acceptance: false,
          },
          {
            recipient: '1a511bba3d2c682f1a260f414e6136e8b9c13e4351f86e4d74c46fdce8aace5e',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '17d52b5d125ab211acec29afc39b57746dd641d6178a82343a443aeee4bb912e',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.858Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.599Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: '63eYQcDzR2GWWkMI_n02_Q',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2022-05-10T06:04:20.579Z',
            acceptance: false,
          },
          {
            recipient: '662c6c3aadf325ff7a731b0fc1c43e47455ae0afa5c0b8eb2581238f4208ce25',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '32c43a35d394f698949be646b1ab196df3c052e0019da835a22162610f257cca',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.857Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.599Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: '7_u0-r0_T2CT-W1bO7Ll4Q',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2022-05-07T22:56:15.445Z',
            acceptance: false,
          },
          {
            recipient: '930c67836a96c87f619b8b63e7fa488da8d25df9db27adb394d0ba5e2490729c',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'ed4248dc7fa608d2a42d42f517efde6dd122ef5b9575d1541ad32acf0a3a3dcd',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.856Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.599Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: '2N4AZ1xTRUqf7k5B1kXPxw',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2022-05-06T15:01:03.573Z',
            acceptance: false,
          },
          {
            recipient: '9960f2b1327d284ce10ddc3a0d087fbbafc94dde998c7af20d83db29caf5e902',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'fe5f64637ed4d07b1788b7eef9d510afc2589dc0801cb7e1725edbc4d988a899',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.855Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'JtKasa3ASDqt89_OA67B-w',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2022-05-05T18:23:41.255Z',
            acceptance: false,
          },
          {
            recipient: '209be0060d01facdd894eff9d36aa20200cfd8f2606cdc48646a028a9102dc1b',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '7a44cbcb7f6ab4b775f4cc94788aa0de103ae723d8280e8c0464e87776c99b0e',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.854Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'MvVh85zIQOCcWh8KN6U43g',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2022-04-28T21:19:27.213Z',
            acceptance: false,
          },
          {
            recipient: '482aa3aa703fdfc28d9bb0c4d6a5783c66f32af2125e62e95b7d8db0df849f82',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '7d60395a90527b73aef5dfb47c793d5279ad4b32534501198507fa38e579f79b',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.853Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'PY5SJaI7Qa-NVAz4y2JRSg',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2022-04-19T20:12:13.983Z',
            acceptance: false,
          },
          {
            recipient: '9166770cf016adba61e6778e99f34f8f36b31e75ff2931a7694c2081bb713d91',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'eeac6515f8439fcaaf58f2fcfdbda1d0cd7bbfb132b44a634a08d329ba376202',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.852Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: '6--0KBTSTeqPMRjqm-jR9g',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2022-04-08T05:35:06.449Z',
            acceptance: false,
          },
          {
            recipient: '2ae70c6743865ff34eda4794866279e9f37bb009176db8f2074e023e32472157',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'd5276f9b92c435ad379a26fa685862744e50d96f0cd187ca872e5f36eb7e28c4',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.851Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'vvhhlB5pQuaSUfkAVLpYsA',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2022-04-06T21:56:26.922Z',
            acceptance: false,
          },
          {
            recipient: '5606936353fb700cbcbf3516ed6f8a59616386ae54e9d85afeb89986a34afc2d',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '1019dc51a12e8f6aec93cea7c1f91e8e9cbe826241bd71fd56830df90d6a50f8',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.850Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'TLj9Itx7RBmhfhquZflBgg',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2022-04-05T15:07:52.124Z',
            acceptance: false,
          },
          {
            recipient: 'ab0cd17319d70694a0bdf1c37b3658901636e7be1d287728c57c8f7cc0c7cc93',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '092741d3ccbd0ab9ecc8ef3a0b60c3ca635288e5f9b889ba76103fc568ed2b5a',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.849Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'kaAWUbD5RcWu606GjCGaRA',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2022-04-04T23:55:39.740Z',
            acceptance: false,
          },
          {
            recipient: '1282b7378296a76ed89ea64539f71c3abda69f8c28ef97d7dbfcde18bcceb891',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '325be2aed4cff918a29a1ae30a3578884f0cfa3213f330a34eccf69c8bf81daf',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.848Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'eVPYW-G4RemZhsw8-O6IqQ',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2022-04-04T17:25:44.743Z',
            acceptance: false,
          },
          {
            recipient: '2a3fd0d693d53ea5cf825d7c25a6e2e414336a05046638466531ac831c346370',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '757d158308e4d1e4f312531f8855146b6665de44d39233cb52f556dbb46d9752',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.847Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'tY5qDfimQWeW21htKWxhcg',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2022-04-02T03:48:24.138Z',
            acceptance: false,
          },
          {
            recipient: '85f41af5577a2887db11c03b0c504ed9dc80ec4178c358aeb33a348cb6f324bd',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'eb79486d6205d844674d0c59dd136844aa01f0f2ba8088460e01c01f385e2d3b',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.846Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'hBAaOBk2T-2LYFTR0FcGaQ',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2022-04-01T02:42:00.608Z',
            acceptance: false,
          },
          {
            recipient: '6ce53a3c97c4f42747ecf25b090319129e8140f2022d32f51ab1cb4737ad3e68',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'ebfdc556dc245ae82e4432d672c15ff068335a2dde881a2ac2cbfeaf3dd6be8b',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.845Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'AXInrmWKS3uNG0kP_685BQ',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2022-03-28T22:56:56.827Z',
            acceptance: false,
          },
          {
            recipient: '9a9fa556350703b2281f4ddb04bf242cef15cbfab3eba711b31369764fbd65d9',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'c474272d199c889792d4204234615a3ebfa27b23fe4cf9d4b800eda9272cef1f',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.844Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'Kh0a3nkCQDmohMAZzYe-yw',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2022-03-25T18:35:28.240Z',
            acceptance: false,
          },
          {
            recipient: '9a7fa3f4363ba4160deea5d32a67b706cb5a709d2504bc6c6f057b65dd31946c',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '0c8a2db657f1eb92b7bfaced9df29b91fc6d5f1fc38c0f5f816a2bde7c00158c',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.843Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'rwDWA_k-QduaFQWa3Kqdsg',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2022-03-24T00:28:25.775Z',
            acceptance: false,
          },
          {
            recipient: 'ccf392a78d3624ac702ff1acac0b38a13d0b94f0569bd2d1e09dda8b9408b3be',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'c485f88d4315f54022fb929f9837060ecf5690e63c512533dd1bdd722b8e6ae9',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.842Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: '6VAbV-lRTpOWz-Wwc62Rrw',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2022-03-14T11:48:31.069Z',
            acceptance: false,
          },
          {
            recipient: 'f9866acbcc6f2e4b1a231cda15e012cceb16a2952715e3850f305b80f239f59b',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'b7f722bcd53496c0a6d2a0b6a4a8ca1790506f52938df54b77f23b48d03247b7',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.841Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: '1I3ZrZHQQY6dgW7eCeH5NQ',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2022-02-15T17:36:46.461Z',
            acceptance: false,
          },
          {
            recipient: '7c097b72b0224ca429f9e07efa2ad2fec62c07ecfa32707ffec580ceec610f24',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'ba1d68b3e3ca1d61e090a61b8e10622b345b04b2a2c3edb0dfc0cc1a508bf7d3',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.840Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'j_TJJm6uSzGLwHIYVi6MuA',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2022-02-12T22:46:45.275Z',
            acceptance: false,
          },
          {
            recipient: 'ed349ffdada0ce35ddc5afb6d75eecdb130c6e6aeeae1ae8c8fa1edbda03433b',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '110d9f931ca13526c9691b7baae55ef88d4c278dd66020c67b628e164b215b9d',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.839Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'vh3JtPA7Q6WHGWB0jkGUpg',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2022-02-08T00:45:42.560Z',
            acceptance: false,
          },
          {
            recipient: '98fd378b3cd4df89b539a9e0fefed36f41822fe092e0b2f66316ea284e760409',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '33ed18a3555bd9422abd7c7e4c524381df63df0ef9227ef7a90b06be1371eed0',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.838Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: '0XFa0iW8QaygzSrPJeBGhw',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2022-02-03T10:36:44.259Z',
            acceptance: false,
          },
          {
            recipient: '76199206e97e6c8f6be69dd332295db9b3277fa993a7860eebf09111fcc3b553',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '1ef3b4bcc543d341c5556854a694c1c9c13c289e17b4945a6955d0035168c9d5',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.837Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: '2ZeRQR1gSPaEbfJ69kqQgA',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2022-01-03T15:37:31.050Z',
            acceptance: false,
          },
          {
            recipient: '104dc0050e602ea3ed68992f3667be2fce2c9e4e129d4b4596a610873c83eccb',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'e31670e6f8f19d145bec105a7a53dda7acdaa34f77d6dc552a84d050e23b980b',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.836Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'TLejdkCmQROy1ae0rRk4nA',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-12-08T15:32:14.826Z',
            acceptance: false,
          },
          {
            recipient: 'e25c4475ab21725375b2e6a3d00e91b2dfc9e9ac90f8f911f5851dcb59d28d03',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '8c0881a4a9ba777c16764dc87abaedac3b372953ce27a6105d7dcd7c7a75e405',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.835Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'LolrJRstTHiZX14d_qWMOQ',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-12-07T05:23:33.299Z',
            acceptance: false,
          },
          {
            recipient: '92d5367373f637b2c5d74d8e4c65a2b0cb845c430093c25e7089d5b2f27b1586',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '96f1580bf6af7764da4459e252f39b2f9e9a00792ec751a7cf1be55c0be7b2fd',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.834Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'oEguNCJnRfOxMAZTLNHFFA',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-12-07T05:22:42.255Z',
            acceptance: false,
          },
          {
            recipient: 'b2ab460870286aec67dff24db1f778df8e833945f51e842ee343ec92156be9db',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '6e32b50cccafad572e27d0c047f60116806753e0e283ca5dab7b406fa7154993',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.833Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: '-3jDWIgFQ3qqCrqXQpZbrg',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-12-02T00:45:30.366Z',
            acceptance: false,
          },
          {
            recipient: '271c9d0077fa501bccf89e31d4b42cfbfa5bea10c6481184498a9cd73f7a4d5d',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '7059160a0840f187efdf9297ef06267e68745afe828304d3aebed07e6d5720af',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.832Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'NxeORx9JSGayIPyzojquhA',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-12-02T00:42:29.619Z',
            acceptance: false,
          },
          {
            recipient: '405400a37610da02468a446ca1a5616776ba3cc6bf1ac6a498ab6d9f9823f964',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '294053160ab7ebf8a535b283e9d6824ebb9b7d37b18b094ab627a92dbd149c38',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.831Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'U485NcMURPKg0MrFHbV5ZQ',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-11-29T23:06:28.749Z',
            acceptance: false,
          },
          {
            recipient: 'a0dc1f51b56ef6a88405c2c992b820415f236404d6d1a8b71b3a14cfe60db41f',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '5c6cf8def0adc10f1af750c13cce9d9cd372a601a0e7339d44d7f42210d336a2',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.830Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'qozYnAbsSDeZPfDd-5Wmzw',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-11-18T05:28:14.443Z',
            acceptance: false,
          },
          {
            recipient: '9fd539a66d2c2b4b557b6438d40e11efb3cdc54affa3733a47e9a31796053ffe',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '7af237ff3f861e5f325ae19601cbe6a63bb438f33bf3beaaa006d5ba8e8553a9',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.829Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'aJTymA-iRa21p40FilbZNw',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-11-16T19:01:17.000Z',
            acceptance: false,
          },
          {
            recipient: '0b6d5f0b2bf60b79addb43fcc47bdd652442ad28cfa3f7b7ffc843e4bf58c332',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '74bd787233aaeaf27c846e0293c61d031db2543f50c663af7cdafcc0fdf93f6b',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.828Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'as9bhTTdTROVzzkmP-6xNQ',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-11-09T17:57:58.216Z',
            acceptance: false,
          },
          {
            recipient: '6e3a2bf2095f6ea587dfb459d59fa728cd1cd458fd58fde77b0fd1e0a665b944',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '4a874da3035a26222ba039ec34486c5ba2cc3cae593d450a995a18c9b330e967',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.827Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'vntJnX7fQ62S-eexnm-3MQ',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-10-26T02:07:58.970Z',
            acceptance: false,
          },
          {
            recipient: 'ee877da8a815211cfa90f2d8bb7f7f08b76448ddd46761a0af45c34da5e371a6',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '96f3460ed1c4300dc5949bc9ff33aa0202500fb3778b39d9a2f6d27ba6de13d0',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.826Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'TBZ82sizS0-UjHD3Ypj10w',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-10-21T19:25:02.125Z',
            acceptance: false,
          },
          {
            recipient: 'f2169678a1063b2c95f5490f6065d92280cd463fdf3943cbc3cb67265d5bb11e',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '439ec3c048a6ad87096036cb0fa7b57824e5744fdcf0450fcfb3469dd0a5128b',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.825Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'ECBT7TiyS9mB3wLw-uN8ZA',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-10-20T23:32:57.171Z',
            acceptance: false,
          },
          {
            recipient: 'f91f7564c66daf09e075e04a72aeb455a9b3555b64700341cf34975608bac6a0',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '993c3b403492306eef7a7dae6efec56c3a3704412bac6c512ec028f6bb571b05',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.824Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'VDR_pQqVT2mdmqf5Kizyxg',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-10-20T23:21:35.711Z',
            acceptance: false,
          },
          {
            recipient: '464b73897fd18940eed86877e03db539de7b836efaf192cb490f05684ea43e92',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '9ee5cbdb3567d4d44590e2e5dca7176aa1c71df48ff5a53e31130c573672450b',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.823Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'aNFABCwdTPKSz-edlf5aXw',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-10-14T15:31:50.087Z',
            acceptance: false,
          },
          {
            recipient: '9afa7eb05338819eed1760e057d17f50c050dd21af375b97258492d8a0ccf293',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '4248045dbbfd209d706336f659c8cca8144752fa38941fcfcbb03852aa7ba45b',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.822Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: '2PoPXEEQTUmdJFTBfplrGA',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-10-13T00:02:01.845Z',
            acceptance: false,
          },
          {
            recipient: 'cfbdb9299cdcd8193c8c21b439381ac1fbcd43407f98b0a175849c7ca6b7ecd7',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '3cef5c6e8ef149e0e2890d05e526a9f12e5907c2fe44a92dfb46145607ec8561',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.821Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: '0EGzTZohTXatqT8aa8JNqg',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-10-07T04:32:44.443Z',
            acceptance: false,
          },
          {
            recipient: '3363cbc56de7f3ebdf8c5f5eb831e70f45d75824e3d1b1c8ef1f3c68316be237',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '64bd3e955fa105a9a42c1720f4e213302907f8d5f4be23af5622028e6d53ed8a',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.820Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'Vzyo_O6RRZyLQadxqoXTxg',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-10-02T03:09:13.121Z',
            acceptance: false,
          },
          {
            recipient: 'c3c3551c2fd3bb78a4355c1dd6ac6912d70fad53c4d903ee92e8c8a2d98b68fc',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '0dc9e0ba1cd1257f63f6ec0b9e388e41c41a4d6fdfc07d797d69f83167e89999',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.819Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'im9uFcx4SJSwRvBLielAiw',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-09-30T22:09:51.867Z',
            acceptance: false,
          },
          {
            recipient: 'f34efd61d00abedaf4899aabe360e9dadb8ecd8ae38758a9aee1cd98b89bf5fc',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '2004a1570ba4275ec650926942d7c5d15eafcb66e4189f812e82d0f5520a2045',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.818Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'youli9_hQs-HEX8yd0r6pg',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-09-27T22:11:43.511Z',
            acceptance: false,
          },
          {
            recipient: 'a39f65c1ec148faa84038adc5938ee00806453029c07bce58bd3b3a92c01c507',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '7d5fe6671c5cede1e551d4058276f2cdf8f96bb00d8340de009b90701325335f',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.817Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'y7bYcViZTsap-qkmy68_CA',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-09-22T23:04:23.526Z',
            acceptance: false,
          },
          {
            recipient: '61864c99fa92089cc90a0a09ae4002b0e9086dbb6a406ad40ca08576f06338be',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '6a95941b5e6566a564c46f604009dff3039f88096dad9609039902c3830cb207',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.816Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: '4NGdfGRvSxK2rTMYfyb3ZQ',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-09-17T01:29:57.274Z',
            acceptance: false,
          },
          {
            recipient: '757ca5ea06ebab7f4050e66b5e5d2e84796d06ac6849bfbbaf21750ef7a00d49',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '883a9f5c0eb2eed6dec3dbe2f5e7a83ceeb4b2094394e296effd02ab6f97ef62',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.815Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'gQOWfaCVRaGZkKljtudF3A',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-09-15T14:11:43.252Z',
            acceptance: false,
          },
          {
            recipient: 'af575f4caf7c54d8979bf7b13dd144225da3b63a2fe6e1a7484f61bcbae77137',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '0caf9df25bbe1d96a48da5d49f4ac6b57aa753f1d16885d03984d26a673c0243',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.814Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'OWjFYnuaSz2YnnM1pkT0cQ',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-09-15T01:38:25.293Z',
            acceptance: false,
          },
          {
            recipient: 'd6ca5dfcde00ce453a64fdf16062c6a5995ac45e53a3db71f28ee8b611007c46',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '668f17263ea57c93276e644593e6d0c431a9438cafd1a7fdabd0833a6ecf343a',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.813Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'wNBBzXXeSRyCbfE_VGoh2w',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-09-14T22:54:09.642Z',
            acceptance: false,
          },
          {
            recipient: '1bf29cc940e60df0a5da15618493731eeeedc2aa005c6a4934c3b4da6fd6c187',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'eee98c3dc3cd5868e5536b31c1c442d6e13e3ecdd6f715d7c003050b89591bd0',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.812Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'Vu2mJikQSyuVwuzzkr3bBg',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-09-08T23:12:38.682Z',
            acceptance: false,
          },
          {
            recipient: '0aca4cf26b5b46d13f34e8bb21f028cf0fa1375e247ca8ed2642bf73e42dcbe7',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'd543d32693e4989f580efdb8b383e5d60d269fc4a72ad28bf495f2ec6bf9c28e',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.811Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: '4kpL5la1TXmj6vf5SGfDdQ',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-09-08T04:27:20.949Z',
            acceptance: false,
          },
          {
            recipient: '5eca960c54d393779e00ad4f2cdc069a8187ef3e0374e31f7488e808c8af044f',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '6be095b8bcf028ee846d5fcceb22a1953a68c0b1d0722e489201cea24a6c67c3',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.810Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'Bz_jYktUS1-3PERsx4XNkQ',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-09-04T22:35:16.790Z',
            acceptance: false,
          },
          {
            recipient: 'aa1c6c35c0631b725c1fc8e576e308d90d303952391de56c835a71145f709b99',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'd53826d56edaa8ad7ed52e20073b4a622204f97f4e05246dfd0cdbe9007e6b6e',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.809Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'e2CEaU0-QK2pSMmivTR71g',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-08-31T22:45:57.923Z',
            acceptance: false,
          },
          {
            recipient: '98d30a97c2a5d0569b390747e555d054caa2d37fa647093a3c5a294236208c11',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'd7be64b5e81d1da8c2fd4103a6b6d580197e770f36a4f03099b6131fe20e01a5',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.808Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'fkxYXJZfQ8Wk9nCUiWrw0w',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-08-26T19:48:31.261Z',
            acceptance: false,
          },
          {
            recipient: 'c5ca5ac475189799e24211f13b35135123a665d977ea9db6fcba1253b9744312',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '3d0d2e021d8262823d46514f5b21b8b74c938c2be1c3c7343a5d9ace49c4e389',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.807Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'Cix52j-ASgKdhsuTH6ILVA',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-08-25T23:04:03.681Z',
            acceptance: false,
          },
          {
            recipient: '08adce212ff7a531f488e283f84aaf99473cbb90b07ddd9a4a1424e9863ac731',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'b3be3d16f99404c0a3587d6b27f9062b267b5efe9c5da3b0b15ee7b867bdf152',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.806Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'rCidz6vAT_eCG886-H2Vjg',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-08-19T18:38:10.316Z',
            acceptance: false,
          },
          {
            recipient: '265a75b161282b96f15e1aebd93139059ded5643f9b06aba6cf459fd63faf63c',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '5c0cd456a454b77be716a54b6f7f21d3e47b70f6b713d5632111cce7bd2a6dad',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.805Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'KazY7U8dR96n6ZcR2fz8WQ',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-08-04T16:10:18.673Z',
            acceptance: false,
          },
          {
            recipient: 'd658d9689241f75c7b47f4e219fe611daa3ed7d3cf8453438c515834efbaa6c2',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'e4a8f35cb3ffae711fa46bd385e60ee0ba2b53e378e4fe706ff9b76f6641a8e0',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.804Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'xQdsC8iqSQqToA2uCP1iMA',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-07-31T00:24:58.988Z',
            acceptance: false,
          },
          {
            recipient: 'd92365e0edff561d9efb0a60c95f9bb893a620605d44a1b66c4639a87933ca84',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '6746d3ca004ad015817a527e1926c669b2a33d0c83b72fa53e533749c9c93a20',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.803Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: '9QvXJ2guRE6lAx99zUNwpg',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-07-31T00:24:39.658Z',
            acceptance: false,
          },
          {
            recipient: '2363d939c0970f217ac2eaca57e2284d9aea869e2fd5949d5d2ad2cfa9265115',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'f8632e9b026e071e3b42c783af6cf6aed4e49da423abfeca77b56cef737879d5',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.802Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'OwwS4oskTMeYPsqoy3XfLw',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-07-15T22:22:36.618Z',
            acceptance: false,
          },
          {
            recipient: 'ccc8a5580d23def0c721c28c163c90eb41999395caa68ca7dab497862a58e912',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'dead3b9dcd64d3f9843d583f2f083439530c1c7d338a8063550144f66adfb0c3',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.801Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'PWJaVaYsRUKpxgp-rQtBtg',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-07-02T05:04:18.902Z',
            acceptance: false,
          },
          {
            recipient: 'c07a20cc64cabd2787b70b58047cd17b7107fcc8467e6787abbed4e6834982c9',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'b720976768a16ae5ac679722bcd43b2e7dc16ef521217fc8cd36394faebc2704',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.800Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'S1OquBpuTD6jpT5ZArYyVw',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-06-07T20:34:24.476Z',
            acceptance: false,
          },
          {
            recipient: 'b4783a646b9b5d2856569dd86aa5b24737d6b9859c683f81ab6576a3090004c1',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '168ab932e205d897f739bef7bbd2763211dc36fba0b9ae418df64004d77a7b54',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.799Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'QBYeLE8mTpeyl7A12Jp_DQ',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-06-07T20:28:12.882Z',
            acceptance: false,
          },
          {
            recipient: '29dc58e856c216ef26d793e7a6bc80aaf32677885b0ba9b40f3d9ea1974c150d',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'bfe06b8d5fa084d7db2d16fb39dea2763381afcda36bd32774fd2a423f5bdb1e',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.798Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'rXm1s4ltTXS2AJEIxSeXZA',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-06-07T20:23:29.240Z',
            acceptance: false,
          },
          {
            recipient: '5048774c8732848621222b3c28b7f790b8da6347f8f95d32863940483245dc33',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'bb534662e07ea5a41f6cda261fc8682e9e20f43842a2712539ceda9341446ad5',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.797Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'Htc6yIZJQ-yHehOCcUrrMw',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-05-13T12:58:35.753Z',
            acceptance: false,
          },
          {
            recipient: 'ce8ba8ef7f701c4c10eb380bd97720c7a52688acaf3232b37b3fc3635e4f1fa1',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '67b335d2844f102884a0150d56f6bda0d8f0b0c2d2a8e2928b88358b25ce6a0f',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.796Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'GmPYPRdpTXmj9lHMQBmbFA',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-05-06T19:46:40.587Z',
            acceptance: false,
          },
          {
            recipient: '425c067510dd4d39a8658e31fcf948458da97a26d89d7e459f30f9d5b9950d3c',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '79a2e6ac328847f2408860a88f10b968bd3b317752541470376d5cdbaa6bcca9',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.795Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'qCTtw6DnSPStlKCIzw-GEQ',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-04-14T23:44:08.570Z',
            acceptance: false,
          },
          {
            recipient: '599eeba3cb2a172ed4a0776c482b01d8fa080a5ccd70b81ee9284febb75a6b87',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '4e39bc2ca20b53364d48c6f9fd4c0e9bd15c14371f9b4e1681b787ecff20f095',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.794Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: '9Sqez9M_T3uThL0BuqsXNg',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-04-09T23:13:00.489Z',
            acceptance: false,
          },
          {
            recipient: '16915f910d2e2b890b6a6fa7200d3947ad3498c7dcd7364dfcd9a4a8c5362d85',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '99ca4a98b75a19cf0a3b5e801aea3fd7f49a8e8d6802b48619d4750add572643',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.793Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'gwVTXG0ISpGAYsqPvUhexQ',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-04-05T20:42:44.560Z',
            acceptance: false,
          },
          {
            recipient: '58349ce96ec2fa114e0d079d571109179ee4a7e0527c5974db8e758175af1aab',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '9e096c6a3cba71addf9de8aa527032bc3bb6796b72e6446e99dc6b3fe0888257',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.792Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'YnLcBEd2QJKlRvb9RXF9Nw',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-03-30T21:26:20.442Z',
            acceptance: false,
          },
          {
            recipient: 'e23b480df1ed7e4eea5d2891e45e610e6c4ec073466a9cf9175b0c956fca08b3',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '36ff5caaa1ba390c4632fd1be88efceeb087edd101c03fb9d79eab019c635290',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.791Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: '1A-2zyjxTuqRXcMgY1EBGQ',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-03-22T21:01:22.707Z',
            acceptance: false,
          },
          {
            recipient: '501d3ee2c9c2ab0b73c0eab71ac1782a0d5dd01ed1cd269e06ff4280b73834f2',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '8b77518458b27fb8319acdb3afc035873b01cb9f569b7d6253a9d54d72bf81f3',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.790Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: '5xLbxEsVRheG9E016k_EUg',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-03-09T02:24:59.699Z',
            acceptance: false,
          },
          {
            recipient: '159ce6953c9c5947ccfb0fe15cf10a63ca200e7f923d93f29ab09adc2a238497',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '347da6b3c8cb69c19730c77348f64cc3cfc5e9987440055f0257e2b37f718867',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.789Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'uSAktkfJSnu80OY2Kk7DIQ',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-03-05T00:40:27.901Z',
            acceptance: false,
          },
          {
            recipient: 'ad1c01382996e591b97aae25131cd30dc40663f9227bdbc0317fa171d5217e15',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'd72d2941ea7d021da9eb9230c29f3272f9ed4f6e8177d4e0ae647e0d4b21ca3b',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.788Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: '2IRxCAprQOq4TzylFBYsRg',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-02-26T22:49:54.603Z',
            acceptance: false,
          },
          {
            recipient: '2361f81c8877f6fe5d0e3868201143b5135f4e90488c42e8a5ce00a130292541',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'f1d24d49e49e0dec9947c1cb85c458208731e85fa81d1950bec476d71f817ca4',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.787Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'SsLM_KzbTqSXEQhFvSNxCQ',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-02-24T22:05:50.474Z',
            acceptance: false,
          },
          {
            recipient: '1501a3e5b4ab51908b6b61ce5678b8bba1d78753fb5c6e0291cca9dcd7f50223',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '242cfbf8bf87a6f58c323048bbcc4107494f557ced161d1240d48b6349e8cdf4',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.786Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: '21mU_ryOTlCJD_98m6_XvA',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-02-24T02:09:20.989Z',
            acceptance: false,
          },
          {
            recipient: 'e19176667094d0ca37e35694af3f5163062c8d7d9ec12e208dcc62a0ede8dfa6',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'e5193e8604c4bae22a57f28a057a846f3c3274ba8f85e9ae4cce8c24af5d3193',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.785Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'E7frIx-LQnuNtjAYYACeUA',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-02-23T03:28:47.552Z',
            acceptance: false,
          },
          {
            recipient: '59e819e72f8524a9fff0a51608441d07938b03cf2e5507ff741cdf267c69a52e',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '55abaf41118276aadc3288ef00c6aabbc5d1f462db404cd61df91143b7e0ec5e',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.784Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'dpbbd0DpQQmd7zOJZFNuCQ',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-02-21T21:38:08.019Z',
            acceptance: false,
          },
          {
            recipient: 'cf7ea2609abb11d738ef575a496a9ead1d905de8c0af23bf59c8e426979840aa',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'e6459944d3a2f6ca593c54e17721566f16d6a3dc18a25c077f7c51764efe3c89',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.783Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'mZ_Kc9sKRWm7biuj5g60Iw',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-02-05T20:42:22.756Z',
            acceptance: false,
          },
          {
            recipient: 'fa7ed221ad26eb3804a420eea525fb24376d4e3a807a32d7443e36b5cb59195c',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '39f4faf2d4ad882b2a76d5195956e1c5bb611b0a02cb3d0a0589390e35e917d7',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.782Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'GEIHFpbRSOOSRtOqggFP0Q',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-01-19T21:50:09.505Z',
            acceptance: false,
          },
          {
            recipient: '6d8f8516d2f2be67a9bf5bb09e7fd646b5afa8385eb2a585ea65656039abb11f',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '823314e8263485c001389573d027265a39a201f861572ed5131cc193b0bba1ef',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.781Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: '9NXWyMy7RaqeD5qSREv1RA',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-01-11T23:47:47.928Z',
            acceptance: false,
          },
          {
            recipient: '1ba6779a9a9a60bb7518d016101eb4497f7faf3a6bd2847a2267680cddac5f3e',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'cc5477f4f593001bdb56238709dbc0eae0b021697fbd8d26c602c25a3aa70d4c',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.780Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: '0zZBuyTpSgiyzRjIyzZLUg',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-01-11T23:42:55.741Z',
            acceptance: false,
          },
          {
            recipient: 'bef5d512f2036eadf0e1f077404935191782f5dbf989c0904c7aa81462e4fc4a',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '4cc3cd3b94f111aa0a09ae41e7371c7541607a1978dc76d7ce64854d79a94a17',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.779Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'GhVah-QOSIW1kI0ciyx_jQ',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-01-11T23:42:14.922Z',
            acceptance: false,
          },
          {
            recipient: '6b132d549e7ce3dde91c6b891a36adb9db9b80f68421ac0fe4f0479fde939627',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '0859aa19b9d0918a14c569d87df708415448e8043eb957bf4bcf97d2193e9d43',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.778Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'mlgGJsnNRumC-4Qw0PWFGw',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-01-11T23:40:27.033Z',
            acceptance: false,
          },
          {
            recipient: 'b85561e246ae49e1da9dde5231407b9dfd76780b0ceb9fe28b191ca9f7531dff',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '83540ff6bb10b495759506d0ca030e0377f8f0103afda148a5008b473a84ed2c',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.777Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'pdsP35IkRD-4UK2fRiot7w',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-01-03T20:30:34.975Z',
            acceptance: false,
          },
          {
            recipient: 'd16b81e378ac4082bdd3ac47ee9caf96c2b6cf00949220ee2a552b5236968b06',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '5b0c717fcd776697ca70cd21c473f0a2b1b31e09b315a5e1bb3c6d2215bcf2ee',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.776Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'wwDF3EMvRced19wpCSXG-Q',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-12-01T21:41:38.564Z',
            acceptance: false,
          },
          {
            recipient: 'd92986ff2cada80a8b849a9dae2e051983f427e2d65d1d08d973616fb832a9d7',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '39e779f38d7ac3c3e3574d4ed653afd53d92860d055b370dad9d345de11b8f17',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.775Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'Bhzuj_DCR86KkjP_dmUYfA',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-11-30T18:29:42.357Z',
            acceptance: false,
          },
          {
            recipient: '12a4a32016e9284f005639257523c6890728012e90bd3951c9f6ac80205175c2',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'd7fd40bd005911a819a9ebb870a75c707704adac5eacb29cfba8b2fc850e4b60',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.774Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'RfGya-ZcTB-l72S2NdCFyg',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-11-17T19:50:27.869Z',
            acceptance: false,
          },
          {
            recipient: '3c691f08d209a413d92a458f590d28c6c3063c276d6388166cda559f2b0d9015',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '6e78d9637d2f226d6494d6f603d9b7b5b6983ad242e60fe200c20decb3f8729b',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.773Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'rKLTF_5gQD-v8gaVWGfUdw',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-11-14T01:17:39.372Z',
            acceptance: false,
          },
          {
            recipient: '2776ac845da25673a015cd99a5d5e3f0c0db83b60ff8f2f3c2327e849b4625d2',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '3a77afca9b9c9363189d9b743ff1e979c525dd5524a5d55e3f7e297855989fe1',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.772Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'vR8qmVwnTgiAW586JwRT-w',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-10-30T23:31:13.211Z',
            acceptance: false,
          },
          {
            recipient: '1e0b211466b6e4ddb9036e199c7a17e1e84d92e6bf55a01fa3f4fe16aec23b6b',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'b82e54dfa9d4461257004498ba8d02a584b863be5a56e7cd2656eae93b1ff2d2',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.771Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'vbEpliqdQHCuM9GtP4MzWg',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-10-22T00:04:38.363Z',
            acceptance: false,
          },
          {
            recipient: 'e4acb361170876dbc0f63ae65380591b9de3a886a317166bb8ba02d2b657f58f',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '3e42af49e80987ba50ff1472dc44138c0e0cbc63257b2a06fac85ffcbf559090',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.770Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'swvIOCjxSeOFHBBhK7AHeg',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-10-21T06:30:24.278Z',
            acceptance: false,
          },
          {
            recipient: '7c097b72b0224ca429f9e07efa2ad2fec62c07ecfa32707ffec580ceec610f24',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'f99dfc97d70a7be20c2216d4a54a044ba486f9f2e0306d55831ceb4fd5a74453',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.769Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'MtekDq-KSqyRt0MKufO7IA',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-10-13T18:06:08.252Z',
            acceptance: false,
          },
          {
            recipient: 'dbb666976638d992cebab835b9b41bcd7376b0b8f417783d493d24d2ff31a25a',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '4ada1442f01caf69c55ea3101837861df63ba7193900a522342a04700bdf31c5',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.768Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'JRzH5whGSLm4Zz94Kob1qQ',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-10-09T04:49:47.479Z',
            acceptance: false,
          },
          {
            recipient: 'd6a41d46112b37f1d18470188970f53d78058341f9ee84fef8ce23d1c70a36dc',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'f79cc24fa61a9e1f453761ac621a48e04523d1557db748a4783bb8f5d91733e5',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.767Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'ryvc-B4GSYuY90vxUix_Zg',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-10-06T19:34:39.128Z',
            acceptance: false,
          },
          {
            recipient: '2a2f8431a983cbe136fb87cf1e73c2651cb394e36b9fb7a73e61d81846a17eea',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '4783011f7397734353e61c8bf5aea745a1a0c5e56552fbf1ba19b0ecc22e5b0f',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.766Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'rQf6mi8xSaya5-oBkmCrTg',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-09-30T22:55:41.245Z',
            acceptance: false,
          },
          {
            recipient: '5fb44c794495894703bd23904276c13d8577930b26b531d66caa33c1d66c92cf',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'abb47ceb0d280ac171d6b059e603215c2ccfeb932fc23f4296cb13f418e54c16',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.765Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'Mgi-NL6lQy2Kepb_OeMjug',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-09-30T22:07:16.373Z',
            acceptance: true,
          },
          {
            recipient: '1e580f048ed015d018aa60efc29fe7db02048795a6eb5165407803249e93a002',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '16c31b56f1fb11ae77ee1221b8600f70306dcedc2b5ea034c5d60dbc6939ad39',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.764Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'ii8huUdNQpSkQRVAvDYq2Q',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-09-29T17:35:20.018Z',
            acceptance: false,
          },
          {
            recipient: '8c46907e5b1857a3c85138695f4ea5bf3bf339d6a6245c94f2fc0d11ab327ef4',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'e7e5472bfa7f3b858f3bd43011d3f359f97a5c4029d641163c394b0914515396',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.763Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 't7UKOLGwReuTHcJuzHUyFw',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-09-29T15:45:53.944Z',
            acceptance: false,
          },
          {
            recipient: 'a902102081686ff7f1318393b72539412be1b277cf7c431eb91845df2676c2f6',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'aa23bb9edde166d70a89ac7995bad8657980256c2e31ba2a7b0aac32baf7bb06',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.762Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'mby3ZSSTQnSfkHTIsSdtcQ',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-09-28T19:14:17.439Z',
            acceptance: false,
          },
          {
            recipient: '331a9e3cab1b74d9093cd3e5f1f2d0f5025ed0b6c67748c8a71328fa55df9fce',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '43ff8ff09f387a298d05a2bb518ccbf6ba40c6f44942db3ba8f39991ce08363b',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.761Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: '0fn9YnmJS5-OeZV7wj2N0Q',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-08-21T16:09:51.549Z',
            acceptance: false,
          },
          {
            recipient: 'f9b11d734fda1b819b959d9d3677493f37b414ce3567921c1be33e15c5193f8f',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '7c82ce9c88055725f7b379b2af3c75a5634e0fcc3e9e6b1b91e650440fe3008a',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.760Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: '3J8UuTWhRWq-hk5lSo_6EA',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-03-17T15:38:37.170Z',
            acceptance: false,
          },
          {
            recipient: '2b0de94307b0dd80f2078ae1a72e6a6ef9c82e476c4f60b8738abec58c782cdc',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '41ba62054b4c51070a327ca8d3d76f9070e72f086a0dbc31d3b0a1feccb8b6cb',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.759Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'xMdstdDNRtONl-2DHG9zhA',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-03-10T15:14:19.989Z',
            acceptance: false,
          },
          {
            recipient: '78344651dcbe8b38071ab869430fa2b9df9377ab3ab32a05ebaba5e912023ae5',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'b8010ab9b31dd23fff193c4f3130bcc462507034ececc78493efe008d13b431d',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.758Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: '5ovdAphNQsCJFrltbLup0Q',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-03-09T23:01:32.472Z',
            acceptance: false,
          },
          {
            recipient: '731bb72206dc7570702ce2a27b21821d6de73595eb5ee4a4187b57c910f052c8',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '4e0a41021a3e979ffa77c1a9ded38f9035bf618f6393ebe79f080a76f5906fb8',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.757Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: '0KiANn1ZRUSRaDOp-KLjBQ',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-03-06T19:39:26.828Z',
            acceptance: false,
          },
          {
            recipient: '1032ab0dd193a53877d9936faaa5b13022259bc8b1858e53d96fc44341f429c9',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '5a1e5ca17b40075ab65ae5d91dcb6a15a3b69ccc29e0b2325673c19d918ae489',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.756Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'BTCln_RgQ5yWd2jYAFu4ng',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-03-06T19:39:21.533Z',
            acceptance: false,
          },
        ],
      ],
      intersection: [
        {
          recipient: '08adce212ff7a531f488e283f84aaf99473cbb90b07ddd9a4a1424e9863ac731',
          expires: null,
          revoked: false,
          badgeclass: '1e24827bf4381fd39597b8fd8d3b506ef1735cdeda1ad6190d1e5454b413d1b3',
          revocationReason: null,
          _id: '8a32ae563d736e6f58e81561ae9a071fcfa8b7e70d9d62593946e784d2fa5297',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.857Z',
          badge_desc: 'GDS103: Learning Adobe Photoshop',
          _updatedDate: '2022-07-13T15:34:23.654Z',
          badge_name: 'GDS103: Learning Adobe Photoshop',
          badge_tags: [],
          title: '29TMJDWsQ3qGgyHmvD4Jkg',
          badge_icon_uri: 'https://api.badgr.io/public/badges/WplDDPZ0ShWXODMyk1Ixaw/image',
          issuedOn: '2022-07-12T19:35:36.042Z',
          acceptance: false,
        },
        {
          recipient: '1282b7378296a76ed89ea64539f71c3abda69f8c28ef97d7dbfcde18bcceb891',
          expires: null,
          revoked: false,
          badgeclass: '1e24827bf4381fd39597b8fd8d3b506ef1735cdeda1ad6190d1e5454b413d1b3',
          revocationReason: null,
          _id: 'e209bfd13f5f593e5050fbb5f8524339190e9ea3e6784e4b43411a9fa66ff9da',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.855Z',
          badge_desc: 'GDS103: Learning Adobe Photoshop',
          _updatedDate: '2022-07-13T15:34:23.654Z',
          badge_name: 'GDS103: Learning Adobe Photoshop',
          badge_tags: [],
          title: 'dq09jfE9QCyhzZnebI9DYQ',
          badge_icon_uri: 'https://api.badgr.io/public/badges/WplDDPZ0ShWXODMyk1Ixaw/image',
          issuedOn: '2022-04-30T02:38:30.578Z',
          acceptance: false,
        },
        {
          recipient: '9afa7eb05338819eed1760e057d17f50c050dd21af375b97258492d8a0ccf293',
          expires: null,
          revoked: false,
          badgeclass: '1e24827bf4381fd39597b8fd8d3b506ef1735cdeda1ad6190d1e5454b413d1b3',
          revocationReason: null,
          _id: 'ceee31a82d6596723237206f9eee9cf826b22b5f2c5a9561a817ceb1de30b86b',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.854Z',
          badge_desc: 'GDS103: Learning Adobe Photoshop',
          _updatedDate: '2022-07-13T15:34:23.654Z',
          badge_name: 'GDS103: Learning Adobe Photoshop',
          badge_tags: [],
          title: 'C4XJEJr5QD6oHVPllzTjyg',
          badge_icon_uri: 'https://api.badgr.io/public/badges/WplDDPZ0ShWXODMyk1Ixaw/image',
          issuedOn: '2022-04-08T15:26:38.009Z',
          acceptance: false,
        },
        {
          recipient: '930c67836a96c87f619b8b63e7fa488da8d25df9db27adb394d0ba5e2490729c',
          expires: null,
          revoked: false,
          badgeclass: '1e24827bf4381fd39597b8fd8d3b506ef1735cdeda1ad6190d1e5454b413d1b3',
          revocationReason: null,
          _id: '9f7118e4f604001539c8620eb300131a320a2a82fdd96f4ecaeae0f8d172e7fc',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.852Z',
          badge_desc: 'GDS103: Learning Adobe Photoshop',
          _updatedDate: '2022-07-13T15:34:23.654Z',
          badge_name: 'GDS103: Learning Adobe Photoshop',
          badge_tags: [],
          title: 'E6eQW_4JSZ-NRjcRAZDA1w',
          badge_icon_uri: 'https://api.badgr.io/public/badges/WplDDPZ0ShWXODMyk1Ixaw/image',
          issuedOn: '2022-02-01T19:22:43.054Z',
          acceptance: false,
        },
        {
          recipient: '6e3a2bf2095f6ea587dfb459d59fa728cd1cd458fd58fde77b0fd1e0a665b944',
          expires: null,
          revoked: false,
          badgeclass: '1e24827bf4381fd39597b8fd8d3b506ef1735cdeda1ad6190d1e5454b413d1b3',
          revocationReason: null,
          _id: '40d08d8f3ff3ee48cf20eaf2bf5dbc697fc7be2929aeb041df097499243bebff',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.851Z',
          badge_desc: 'GDS103: Learning Adobe Photoshop',
          _updatedDate: '2022-07-13T15:34:23.654Z',
          badge_name: 'GDS103: Learning Adobe Photoshop',
          badge_tags: [],
          title: '2GWLHEMwSOGlwy9bgkQhRw',
          badge_icon_uri: 'https://api.badgr.io/public/badges/WplDDPZ0ShWXODMyk1Ixaw/image',
          issuedOn: '2021-10-28T13:38:02.998Z',
          acceptance: false,
        },
        {
          recipient: '1e580f048ed015d018aa60efc29fe7db02048795a6eb5165407803249e93a002',
          expires: null,
          revoked: false,
          badgeclass: '1e24827bf4381fd39597b8fd8d3b506ef1735cdeda1ad6190d1e5454b413d1b3',
          revocationReason: null,
          _id: 'a62502027abe26c045f66adf20215f579f7f25d44c5b0cd13f0e1f0a815ee830',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.850Z',
          badge_desc: 'GDS103: Learning Adobe Photoshop',
          _updatedDate: '2022-07-13T15:34:23.654Z',
          badge_name: 'GDS103: Learning Adobe Photoshop',
          badge_tags: [],
          title: 'k6x3uyLLTJWNpyS7xtBXCg',
          badge_icon_uri: 'https://api.badgr.io/public/badges/WplDDPZ0ShWXODMyk1Ixaw/image',
          issuedOn: '2021-09-25T02:09:38.689Z',
          acceptance: false,
        },
        {
          recipient: '58349ce96ec2fa114e0d079d571109179ee4a7e0527c5974db8e758175af1aab',
          expires: null,
          revoked: false,
          badgeclass: '1e24827bf4381fd39597b8fd8d3b506ef1735cdeda1ad6190d1e5454b413d1b3',
          revocationReason: null,
          _id: '22d92dcd7604e31f99b66b4727cebfbecb77a2482d32ca8a5be221bbba4ceda6',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.848Z',
          badge_desc: 'GDS103: Learning Adobe Photoshop',
          _updatedDate: '2022-07-13T15:34:23.654Z',
          badge_name: 'GDS103: Learning Adobe Photoshop',
          badge_tags: [],
          title: 'PkHjn4PaQ_2SESjVH8BdQA',
          badge_icon_uri: 'https://api.badgr.io/public/badges/WplDDPZ0ShWXODMyk1Ixaw/image',
          issuedOn: '2021-03-23T22:23:01.335Z',
          acceptance: false,
        },
        {
          recipient: '2361f81c8877f6fe5d0e3868201143b5135f4e90488c42e8a5ce00a130292541',
          expires: null,
          revoked: false,
          badgeclass: '1e24827bf4381fd39597b8fd8d3b506ef1735cdeda1ad6190d1e5454b413d1b3',
          revocationReason: null,
          _id: '9c82bceab0fcaf7be31a31e60baf41ead1281f6f2fdd6df378c9819a55e239a7',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.847Z',
          badge_desc: 'GDS103: Learning Adobe Photoshop',
          _updatedDate: '2022-07-13T15:34:23.654Z',
          badge_name: 'GDS103: Learning Adobe Photoshop',
          badge_tags: [],
          title: '79jcTZOrSgmYaMw4zRHxIA',
          badge_icon_uri: 'https://api.badgr.io/public/badges/WplDDPZ0ShWXODMyk1Ixaw/image',
          issuedOn: '2021-03-23T14:57:47.585Z',
          acceptance: false,
        },
      ],
    },
    {
      _id: '8f69dffb-9ae1-48e4-980b-7310a884e4fd',
      setTitle: 'GDS103',
      subsetItems: [
        [
          {
            recipient: '195c3a05ccc4dfaf470ca9d918c490024197655aa5f19046afda379481aa26af',
            expires: null,
            revoked: false,
            badgeclass: '1e24827bf4381fd39597b8fd8d3b506ef1735cdeda1ad6190d1e5454b413d1b3',
            revocationReason: null,
            _id: 'd4edce9eb3fe8953616262bca9ae72f9068a61c7d209b52b30bf8bdeeb57c53a',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.858Z',
            badge_desc: 'GDS103: Learning Adobe Photoshop',
            _updatedDate: '2022-07-13T15:34:23.654Z',
            badge_name: 'GDS103: Learning Adobe Photoshop',
            badge_tags: [],
            title: 'Ssy-YeueS_K4LaU5Fbk8yg',
            badge_icon_uri: 'https://api.badgr.io/public/badges/WplDDPZ0ShWXODMyk1Ixaw/image',
            issuedOn: '2022-07-12T20:21:58.136Z',
            acceptance: false,
          },
          {
            recipient: '08adce212ff7a531f488e283f84aaf99473cbb90b07ddd9a4a1424e9863ac731',
            expires: null,
            revoked: false,
            badgeclass: '1e24827bf4381fd39597b8fd8d3b506ef1735cdeda1ad6190d1e5454b413d1b3',
            revocationReason: null,
            _id: '8a32ae563d736e6f58e81561ae9a071fcfa8b7e70d9d62593946e784d2fa5297',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.857Z',
            badge_desc: 'GDS103: Learning Adobe Photoshop',
            _updatedDate: '2022-07-13T15:34:23.654Z',
            badge_name: 'GDS103: Learning Adobe Photoshop',
            badge_tags: [],
            title: '29TMJDWsQ3qGgyHmvD4Jkg',
            badge_icon_uri: 'https://api.badgr.io/public/badges/WplDDPZ0ShWXODMyk1Ixaw/image',
            issuedOn: '2022-07-12T19:35:36.042Z',
            acceptance: false,
          },
          {
            recipient: 'c544c03c745ebb9fb65e413631fb5204173f6fc5f9e3447ffb35ce6068638702',
            expires: null,
            revoked: false,
            badgeclass: '1e24827bf4381fd39597b8fd8d3b506ef1735cdeda1ad6190d1e5454b413d1b3',
            revocationReason: null,
            _id: '0778f529c5df9768a2a0c67995ad29e9c62fca4c6a7ac135bc21bf0a1c97f191',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.856Z',
            badge_desc: 'GDS103: Learning Adobe Photoshop',
            _updatedDate: '2022-07-13T15:34:23.654Z',
            badge_name: 'GDS103: Learning Adobe Photoshop',
            badge_tags: [],
            title: 'U54iRsFcTliICwuv7mjZ3A',
            badge_icon_uri: 'https://api.badgr.io/public/badges/WplDDPZ0ShWXODMyk1Ixaw/image',
            issuedOn: '2022-05-24T15:42:58.775Z',
            acceptance: false,
          },
          {
            recipient: '1282b7378296a76ed89ea64539f71c3abda69f8c28ef97d7dbfcde18bcceb891',
            expires: null,
            revoked: false,
            badgeclass: '1e24827bf4381fd39597b8fd8d3b506ef1735cdeda1ad6190d1e5454b413d1b3',
            revocationReason: null,
            _id: 'e209bfd13f5f593e5050fbb5f8524339190e9ea3e6784e4b43411a9fa66ff9da',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.855Z',
            badge_desc: 'GDS103: Learning Adobe Photoshop',
            _updatedDate: '2022-07-13T15:34:23.654Z',
            badge_name: 'GDS103: Learning Adobe Photoshop',
            badge_tags: [],
            title: 'dq09jfE9QCyhzZnebI9DYQ',
            badge_icon_uri: 'https://api.badgr.io/public/badges/WplDDPZ0ShWXODMyk1Ixaw/image',
            issuedOn: '2022-04-30T02:38:30.578Z',
            acceptance: false,
          },
          {
            recipient: '9afa7eb05338819eed1760e057d17f50c050dd21af375b97258492d8a0ccf293',
            expires: null,
            revoked: false,
            badgeclass: '1e24827bf4381fd39597b8fd8d3b506ef1735cdeda1ad6190d1e5454b413d1b3',
            revocationReason: null,
            _id: 'ceee31a82d6596723237206f9eee9cf826b22b5f2c5a9561a817ceb1de30b86b',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.854Z',
            badge_desc: 'GDS103: Learning Adobe Photoshop',
            _updatedDate: '2022-07-13T15:34:23.654Z',
            badge_name: 'GDS103: Learning Adobe Photoshop',
            badge_tags: [],
            title: 'C4XJEJr5QD6oHVPllzTjyg',
            badge_icon_uri: 'https://api.badgr.io/public/badges/WplDDPZ0ShWXODMyk1Ixaw/image',
            issuedOn: '2022-04-08T15:26:38.009Z',
            acceptance: false,
          },
          {
            recipient: 'f7d65137437703d18cb048ee30902951ab9863949245942fd7a172037daee70b',
            expires: null,
            revoked: false,
            badgeclass: '1e24827bf4381fd39597b8fd8d3b506ef1735cdeda1ad6190d1e5454b413d1b3',
            revocationReason: null,
            _id: '110d3fb270a7c09daab2299d243d2316131caa6b062824637ec72d2a18acfcaa',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.853Z',
            badge_desc: 'GDS103: Learning Adobe Photoshop',
            _updatedDate: '2022-07-13T15:34:23.654Z',
            badge_name: 'GDS103: Learning Adobe Photoshop',
            badge_tags: [],
            title: 'F8db-3S1QEePsqfuZrU8Pw',
            badge_icon_uri: 'https://api.badgr.io/public/badges/WplDDPZ0ShWXODMyk1Ixaw/image',
            issuedOn: '2022-03-09T01:02:03.875Z',
            acceptance: false,
          },
          {
            recipient: '930c67836a96c87f619b8b63e7fa488da8d25df9db27adb394d0ba5e2490729c',
            expires: null,
            revoked: false,
            badgeclass: '1e24827bf4381fd39597b8fd8d3b506ef1735cdeda1ad6190d1e5454b413d1b3',
            revocationReason: null,
            _id: '9f7118e4f604001539c8620eb300131a320a2a82fdd96f4ecaeae0f8d172e7fc',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.852Z',
            badge_desc: 'GDS103: Learning Adobe Photoshop',
            _updatedDate: '2022-07-13T15:34:23.654Z',
            badge_name: 'GDS103: Learning Adobe Photoshop',
            badge_tags: [],
            title: 'E6eQW_4JSZ-NRjcRAZDA1w',
            badge_icon_uri: 'https://api.badgr.io/public/badges/WplDDPZ0ShWXODMyk1Ixaw/image',
            issuedOn: '2022-02-01T19:22:43.054Z',
            acceptance: false,
          },
          {
            recipient: '6e3a2bf2095f6ea587dfb459d59fa728cd1cd458fd58fde77b0fd1e0a665b944',
            expires: null,
            revoked: false,
            badgeclass: '1e24827bf4381fd39597b8fd8d3b506ef1735cdeda1ad6190d1e5454b413d1b3',
            revocationReason: null,
            _id: '40d08d8f3ff3ee48cf20eaf2bf5dbc697fc7be2929aeb041df097499243bebff',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.851Z',
            badge_desc: 'GDS103: Learning Adobe Photoshop',
            _updatedDate: '2022-07-13T15:34:23.654Z',
            badge_name: 'GDS103: Learning Adobe Photoshop',
            badge_tags: [],
            title: '2GWLHEMwSOGlwy9bgkQhRw',
            badge_icon_uri: 'https://api.badgr.io/public/badges/WplDDPZ0ShWXODMyk1Ixaw/image',
            issuedOn: '2021-10-28T13:38:02.998Z',
            acceptance: false,
          },
          {
            recipient: '1e580f048ed015d018aa60efc29fe7db02048795a6eb5165407803249e93a002',
            expires: null,
            revoked: false,
            badgeclass: '1e24827bf4381fd39597b8fd8d3b506ef1735cdeda1ad6190d1e5454b413d1b3',
            revocationReason: null,
            _id: 'a62502027abe26c045f66adf20215f579f7f25d44c5b0cd13f0e1f0a815ee830',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.850Z',
            badge_desc: 'GDS103: Learning Adobe Photoshop',
            _updatedDate: '2022-07-13T15:34:23.654Z',
            badge_name: 'GDS103: Learning Adobe Photoshop',
            badge_tags: [],
            title: 'k6x3uyLLTJWNpyS7xtBXCg',
            badge_icon_uri: 'https://api.badgr.io/public/badges/WplDDPZ0ShWXODMyk1Ixaw/image',
            issuedOn: '2021-09-25T02:09:38.689Z',
            acceptance: false,
          },
          {
            recipient: '117443d850a77fef2925d3dd36f17fe1a5af99532ead490c9275fe4a421bd2ce',
            expires: null,
            revoked: false,
            badgeclass: '1e24827bf4381fd39597b8fd8d3b506ef1735cdeda1ad6190d1e5454b413d1b3',
            revocationReason: null,
            _id: '1e6d0f46bec55b1fc5773cc1721433ab1a090f4fbdc2c3e1ffdc3775eb822f2b',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.849Z',
            badge_desc: 'GDS103: Learning Adobe Photoshop',
            _updatedDate: '2022-07-13T15:34:23.654Z',
            badge_name: 'GDS103: Learning Adobe Photoshop',
            badge_tags: [],
            title: '3fU4mBJ6TauqtU2E1xtKkQ',
            badge_icon_uri: 'https://api.badgr.io/public/badges/WplDDPZ0ShWXODMyk1Ixaw/image',
            issuedOn: '2021-08-17T18:50:47.937Z',
            acceptance: false,
          },
          {
            recipient: '58349ce96ec2fa114e0d079d571109179ee4a7e0527c5974db8e758175af1aab',
            expires: null,
            revoked: false,
            badgeclass: '1e24827bf4381fd39597b8fd8d3b506ef1735cdeda1ad6190d1e5454b413d1b3',
            revocationReason: null,
            _id: '22d92dcd7604e31f99b66b4727cebfbecb77a2482d32ca8a5be221bbba4ceda6',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.848Z',
            badge_desc: 'GDS103: Learning Adobe Photoshop',
            _updatedDate: '2022-07-13T15:34:23.654Z',
            badge_name: 'GDS103: Learning Adobe Photoshop',
            badge_tags: [],
            title: 'PkHjn4PaQ_2SESjVH8BdQA',
            badge_icon_uri: 'https://api.badgr.io/public/badges/WplDDPZ0ShWXODMyk1Ixaw/image',
            issuedOn: '2021-03-23T22:23:01.335Z',
            acceptance: false,
          },
          {
            recipient: '2361f81c8877f6fe5d0e3868201143b5135f4e90488c42e8a5ce00a130292541',
            expires: null,
            revoked: false,
            badgeclass: '1e24827bf4381fd39597b8fd8d3b506ef1735cdeda1ad6190d1e5454b413d1b3',
            revocationReason: null,
            _id: '9c82bceab0fcaf7be31a31e60baf41ead1281f6f2fdd6df378c9819a55e239a7',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.847Z',
            badge_desc: 'GDS103: Learning Adobe Photoshop',
            _updatedDate: '2022-07-13T15:34:23.654Z',
            badge_name: 'GDS103: Learning Adobe Photoshop',
            badge_tags: [],
            title: '79jcTZOrSgmYaMw4zRHxIA',
            badge_icon_uri: 'https://api.badgr.io/public/badges/WplDDPZ0ShWXODMyk1Ixaw/image',
            issuedOn: '2021-03-23T14:57:47.585Z',
            acceptance: false,
          },
        ],
      ],
      intersection: [
        {
          recipient: '195c3a05ccc4dfaf470ca9d918c490024197655aa5f19046afda379481aa26af',
          expires: null,
          revoked: false,
          badgeclass: '1e24827bf4381fd39597b8fd8d3b506ef1735cdeda1ad6190d1e5454b413d1b3',
          revocationReason: null,
          _id: 'd4edce9eb3fe8953616262bca9ae72f9068a61c7d209b52b30bf8bdeeb57c53a',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.858Z',
          badge_desc: 'GDS103: Learning Adobe Photoshop',
          _updatedDate: '2022-07-13T15:34:23.654Z',
          badge_name: 'GDS103: Learning Adobe Photoshop',
          badge_tags: [],
          title: 'Ssy-YeueS_K4LaU5Fbk8yg',
          badge_icon_uri: 'https://api.badgr.io/public/badges/WplDDPZ0ShWXODMyk1Ixaw/image',
          issuedOn: '2022-07-12T20:21:58.136Z',
          acceptance: false,
        },
        {
          recipient: '08adce212ff7a531f488e283f84aaf99473cbb90b07ddd9a4a1424e9863ac731',
          expires: null,
          revoked: false,
          badgeclass: '1e24827bf4381fd39597b8fd8d3b506ef1735cdeda1ad6190d1e5454b413d1b3',
          revocationReason: null,
          _id: '8a32ae563d736e6f58e81561ae9a071fcfa8b7e70d9d62593946e784d2fa5297',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.857Z',
          badge_desc: 'GDS103: Learning Adobe Photoshop',
          _updatedDate: '2022-07-13T15:34:23.654Z',
          badge_name: 'GDS103: Learning Adobe Photoshop',
          badge_tags: [],
          title: '29TMJDWsQ3qGgyHmvD4Jkg',
          badge_icon_uri: 'https://api.badgr.io/public/badges/WplDDPZ0ShWXODMyk1Ixaw/image',
          issuedOn: '2022-07-12T19:35:36.042Z',
          acceptance: false,
        },
        {
          recipient: 'c544c03c745ebb9fb65e413631fb5204173f6fc5f9e3447ffb35ce6068638702',
          expires: null,
          revoked: false,
          badgeclass: '1e24827bf4381fd39597b8fd8d3b506ef1735cdeda1ad6190d1e5454b413d1b3',
          revocationReason: null,
          _id: '0778f529c5df9768a2a0c67995ad29e9c62fca4c6a7ac135bc21bf0a1c97f191',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.856Z',
          badge_desc: 'GDS103: Learning Adobe Photoshop',
          _updatedDate: '2022-07-13T15:34:23.654Z',
          badge_name: 'GDS103: Learning Adobe Photoshop',
          badge_tags: [],
          title: 'U54iRsFcTliICwuv7mjZ3A',
          badge_icon_uri: 'https://api.badgr.io/public/badges/WplDDPZ0ShWXODMyk1Ixaw/image',
          issuedOn: '2022-05-24T15:42:58.775Z',
          acceptance: false,
        },
        {
          recipient: '1282b7378296a76ed89ea64539f71c3abda69f8c28ef97d7dbfcde18bcceb891',
          expires: null,
          revoked: false,
          badgeclass: '1e24827bf4381fd39597b8fd8d3b506ef1735cdeda1ad6190d1e5454b413d1b3',
          revocationReason: null,
          _id: 'e209bfd13f5f593e5050fbb5f8524339190e9ea3e6784e4b43411a9fa66ff9da',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.855Z',
          badge_desc: 'GDS103: Learning Adobe Photoshop',
          _updatedDate: '2022-07-13T15:34:23.654Z',
          badge_name: 'GDS103: Learning Adobe Photoshop',
          badge_tags: [],
          title: 'dq09jfE9QCyhzZnebI9DYQ',
          badge_icon_uri: 'https://api.badgr.io/public/badges/WplDDPZ0ShWXODMyk1Ixaw/image',
          issuedOn: '2022-04-30T02:38:30.578Z',
          acceptance: false,
        },
        {
          recipient: '9afa7eb05338819eed1760e057d17f50c050dd21af375b97258492d8a0ccf293',
          expires: null,
          revoked: false,
          badgeclass: '1e24827bf4381fd39597b8fd8d3b506ef1735cdeda1ad6190d1e5454b413d1b3',
          revocationReason: null,
          _id: 'ceee31a82d6596723237206f9eee9cf826b22b5f2c5a9561a817ceb1de30b86b',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.854Z',
          badge_desc: 'GDS103: Learning Adobe Photoshop',
          _updatedDate: '2022-07-13T15:34:23.654Z',
          badge_name: 'GDS103: Learning Adobe Photoshop',
          badge_tags: [],
          title: 'C4XJEJr5QD6oHVPllzTjyg',
          badge_icon_uri: 'https://api.badgr.io/public/badges/WplDDPZ0ShWXODMyk1Ixaw/image',
          issuedOn: '2022-04-08T15:26:38.009Z',
          acceptance: false,
        },
        {
          recipient: 'f7d65137437703d18cb048ee30902951ab9863949245942fd7a172037daee70b',
          expires: null,
          revoked: false,
          badgeclass: '1e24827bf4381fd39597b8fd8d3b506ef1735cdeda1ad6190d1e5454b413d1b3',
          revocationReason: null,
          _id: '110d3fb270a7c09daab2299d243d2316131caa6b062824637ec72d2a18acfcaa',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.853Z',
          badge_desc: 'GDS103: Learning Adobe Photoshop',
          _updatedDate: '2022-07-13T15:34:23.654Z',
          badge_name: 'GDS103: Learning Adobe Photoshop',
          badge_tags: [],
          title: 'F8db-3S1QEePsqfuZrU8Pw',
          badge_icon_uri: 'https://api.badgr.io/public/badges/WplDDPZ0ShWXODMyk1Ixaw/image',
          issuedOn: '2022-03-09T01:02:03.875Z',
          acceptance: false,
        },
        {
          recipient: '930c67836a96c87f619b8b63e7fa488da8d25df9db27adb394d0ba5e2490729c',
          expires: null,
          revoked: false,
          badgeclass: '1e24827bf4381fd39597b8fd8d3b506ef1735cdeda1ad6190d1e5454b413d1b3',
          revocationReason: null,
          _id: '9f7118e4f604001539c8620eb300131a320a2a82fdd96f4ecaeae0f8d172e7fc',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.852Z',
          badge_desc: 'GDS103: Learning Adobe Photoshop',
          _updatedDate: '2022-07-13T15:34:23.654Z',
          badge_name: 'GDS103: Learning Adobe Photoshop',
          badge_tags: [],
          title: 'E6eQW_4JSZ-NRjcRAZDA1w',
          badge_icon_uri: 'https://api.badgr.io/public/badges/WplDDPZ0ShWXODMyk1Ixaw/image',
          issuedOn: '2022-02-01T19:22:43.054Z',
          acceptance: false,
        },
        {
          recipient: '6e3a2bf2095f6ea587dfb459d59fa728cd1cd458fd58fde77b0fd1e0a665b944',
          expires: null,
          revoked: false,
          badgeclass: '1e24827bf4381fd39597b8fd8d3b506ef1735cdeda1ad6190d1e5454b413d1b3',
          revocationReason: null,
          _id: '40d08d8f3ff3ee48cf20eaf2bf5dbc697fc7be2929aeb041df097499243bebff',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.851Z',
          badge_desc: 'GDS103: Learning Adobe Photoshop',
          _updatedDate: '2022-07-13T15:34:23.654Z',
          badge_name: 'GDS103: Learning Adobe Photoshop',
          badge_tags: [],
          title: '2GWLHEMwSOGlwy9bgkQhRw',
          badge_icon_uri: 'https://api.badgr.io/public/badges/WplDDPZ0ShWXODMyk1Ixaw/image',
          issuedOn: '2021-10-28T13:38:02.998Z',
          acceptance: false,
        },
        {
          recipient: '1e580f048ed015d018aa60efc29fe7db02048795a6eb5165407803249e93a002',
          expires: null,
          revoked: false,
          badgeclass: '1e24827bf4381fd39597b8fd8d3b506ef1735cdeda1ad6190d1e5454b413d1b3',
          revocationReason: null,
          _id: 'a62502027abe26c045f66adf20215f579f7f25d44c5b0cd13f0e1f0a815ee830',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.850Z',
          badge_desc: 'GDS103: Learning Adobe Photoshop',
          _updatedDate: '2022-07-13T15:34:23.654Z',
          badge_name: 'GDS103: Learning Adobe Photoshop',
          badge_tags: [],
          title: 'k6x3uyLLTJWNpyS7xtBXCg',
          badge_icon_uri: 'https://api.badgr.io/public/badges/WplDDPZ0ShWXODMyk1Ixaw/image',
          issuedOn: '2021-09-25T02:09:38.689Z',
          acceptance: false,
        },
        {
          recipient: '117443d850a77fef2925d3dd36f17fe1a5af99532ead490c9275fe4a421bd2ce',
          expires: null,
          revoked: false,
          badgeclass: '1e24827bf4381fd39597b8fd8d3b506ef1735cdeda1ad6190d1e5454b413d1b3',
          revocationReason: null,
          _id: '1e6d0f46bec55b1fc5773cc1721433ab1a090f4fbdc2c3e1ffdc3775eb822f2b',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.849Z',
          badge_desc: 'GDS103: Learning Adobe Photoshop',
          _updatedDate: '2022-07-13T15:34:23.654Z',
          badge_name: 'GDS103: Learning Adobe Photoshop',
          badge_tags: [],
          title: '3fU4mBJ6TauqtU2E1xtKkQ',
          badge_icon_uri: 'https://api.badgr.io/public/badges/WplDDPZ0ShWXODMyk1Ixaw/image',
          issuedOn: '2021-08-17T18:50:47.937Z',
          acceptance: false,
        },
        {
          recipient: '58349ce96ec2fa114e0d079d571109179ee4a7e0527c5974db8e758175af1aab',
          expires: null,
          revoked: false,
          badgeclass: '1e24827bf4381fd39597b8fd8d3b506ef1735cdeda1ad6190d1e5454b413d1b3',
          revocationReason: null,
          _id: '22d92dcd7604e31f99b66b4727cebfbecb77a2482d32ca8a5be221bbba4ceda6',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.848Z',
          badge_desc: 'GDS103: Learning Adobe Photoshop',
          _updatedDate: '2022-07-13T15:34:23.654Z',
          badge_name: 'GDS103: Learning Adobe Photoshop',
          badge_tags: [],
          title: 'PkHjn4PaQ_2SESjVH8BdQA',
          badge_icon_uri: 'https://api.badgr.io/public/badges/WplDDPZ0ShWXODMyk1Ixaw/image',
          issuedOn: '2021-03-23T22:23:01.335Z',
          acceptance: false,
        },
        {
          recipient: '2361f81c8877f6fe5d0e3868201143b5135f4e90488c42e8a5ce00a130292541',
          expires: null,
          revoked: false,
          badgeclass: '1e24827bf4381fd39597b8fd8d3b506ef1735cdeda1ad6190d1e5454b413d1b3',
          revocationReason: null,
          _id: '9c82bceab0fcaf7be31a31e60baf41ead1281f6f2fdd6df378c9819a55e239a7',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.847Z',
          badge_desc: 'GDS103: Learning Adobe Photoshop',
          _updatedDate: '2022-07-13T15:34:23.654Z',
          badge_name: 'GDS103: Learning Adobe Photoshop',
          badge_tags: [],
          title: '79jcTZOrSgmYaMw4zRHxIA',
          badge_icon_uri: 'https://api.badgr.io/public/badges/WplDDPZ0ShWXODMyk1Ixaw/image',
          issuedOn: '2021-03-23T14:57:47.585Z',
          acceptance: false,
        },
      ],
    },
    {
      _id: 'c5a47d17-e81d-46ff-a011-f69612f34054',
      setTitle: 'WOOD101',
      subsetItems: [
        [
          {
            recipient: 'f7d87d469adbafb9b469fc8e47bfd579b4d3b76fff2f7e20d77bb927de0e12fa',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'b3d2810440151194c5a48b7e30d8b9d433184393cb8b4a5c557c1f7b072819b7',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:17.016Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'lMFBZhiORU-aTraWVW0RPw',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-03-06T19:37:39.113Z',
            acceptance: false,
          },
          {
            recipient: 'd117a17c0722f73db300dab741f3ed27a51a3d379f74448e2bd8c91ad75d8e75',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'bc91c58e7f13b58c387ae00ae6246a099442ae4e679b9ba05f82742cb58f4de2',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:17.015Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'IyAlSGLcRf2TFMtfAIouaw',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-03-06T19:37:20.803Z',
            acceptance: false,
          },
          {
            recipient: 'e8605a1621d81a5f8df21d2efecdfa4ce3470ad5d599ce1692430cbf2000047e',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '9863dea37a6e2686875a20b050add173180959acd478542da850933b99dec9b8',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:17.014Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'CcOJedUOQi-Oid2YIuDgfQ',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-03-06T19:33:18.013Z',
            acceptance: false,
          },
          {
            recipient: 'c0d7a69f130daed380f2bfee1c0bc9d02b9cdbb6ac1a9f5969ebdb6f692076a3',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '16c27194954dffc710db368c04f205b669d0f7b939d1ecdf0a26c30e52ec75dd',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:17.013Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: '7_2ozk-GRUuBsX1RsF_Gvw',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-03-03T20:49:13.102Z',
            acceptance: false,
          },
          {
            recipient: '360394e7dfac76e09b351d4c16b0bc104b94ded9e5a6119f73251e31754bab81',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '82932ea67625969d41001906480330f10165aea96e636fae8dfeb1483c85b065',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:17.012Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'dpj_e3heQPmqqe6RpwoZTg',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-02-26T23:51:50.554Z',
            acceptance: false,
          },
          {
            recipient: '77c050fbd22cceea8c200a1c6677ae6737e6d04bd6976515c5ab9941c41d7834',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '8b51e079108f389cca833052235f9bb64331856e69800c427c5c980d26a74760',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:17.011Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: '3MrdRtJCQnmVbUPaQGJcZw',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-02-13T23:24:16.190Z',
            acceptance: false,
          },
          {
            recipient: '69e87966d1115dd5bdad06ab6b339530793447fc0352afb2c2dc83754e4b8967',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'd6d3e8ad51af3a61dcbda7514ac85863a9331c4eba33411e677656c27e584497',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:17.010Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'xid-brqTTAKkNREllwis2g',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-02-13T22:46:29.533Z',
            acceptance: false,
          },
          {
            recipient: '9034dc88e29dcc8bbee013a19673d6ab306da74480dc3ba2c068a1f2f450ade5',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '8aa7f2e1dd6442772f8a72749d1469894c9360de0fc0b691d431ae76b48944e4',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:17.009Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'cSRzBRFARwClszDpyGcg8w',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-02-13T21:57:29.938Z',
            acceptance: false,
          },
          {
            recipient: '5c181bd1d6c43564904ecbfc778dd2795982b6a8f6217dbd1fbd85a528466549',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '6ca1704bfebadef135ce64fb6a3b300ed79325b01884e55f1b5dd6146b27aa83',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:17.008Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'FZYx1HzaRhSBFtBXnE4NNQ',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-02-13T21:56:17.074Z',
            acceptance: false,
          },
          {
            recipient: '57af096c1a86e892087eb55ba2a838b2383fa07655ff19a0535c40880524fb53',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '3c58f7f63d32f9da64b67b293dc10dd77333e749133bb56a027cc41e571753b1',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:17.007Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'fFmcV_YpT4qHoS0Z8wI7gg',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-02-13T21:45:00.359Z',
            acceptance: false,
          },
          {
            recipient: 'bd74d72f9cec02813219c189ad06f8dc09e12a58744b53d3719801c6131de8dc',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'cb061dad4f94872eca63f46d3543a7d3a6feb589526fb682e24cace09434fa77',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:17.006Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'yypnvFmBSAa7IbG--kK3cA',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-02-12T00:08:41.394Z',
            acceptance: false,
          },
          {
            recipient: '5fbca90c0ba4e82553cd411aae3297e4ae4e206196b424812271b186ce88e1fb',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '2161177fa51633395c1657116b7fdfee44ff2ddc323bc9483adfe51a6a30c803',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:17.005Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'QrkKg1W2T6iku-5-G3QEnw',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-02-06T19:18:55.754Z',
            acceptance: false,
          },
          {
            recipient: 'b123435a90c73ec22508e81a9061d958ceaa782f57b0741a39736945a1ecc7bd',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'c49b48d2d991baaf675b98f3e7a07efd975250abae6234dccd7fcb50a7403ea3',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:17.004Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'VUm4spQ3QBiNdBQPqXrCWg',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-02-06T16:52:42.162Z',
            acceptance: false,
          },
          {
            recipient: '447b2fc64f0fc8cc85b9d28bffe3233b0d59ddfcc366d509c2cb5c4aa64e029b',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '4b28c9ef46fcd911133c30faa628c848bcb020fd8064a76e79c6ebb44f25f4e7',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:17.003Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'K5YavI7NT-yrmKeZ_e-5Tg',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-02-06T16:51:27.082Z',
            acceptance: false,
          },
          {
            recipient: '2f59e9c1823585068aad6a1be3493870170447c7a9688867228a104cc382371f',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '35ffa9eed81e8898636c479fd8ec938f7c054eea5fb58908ac8e21c4c6ffb708',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:17.002Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: '0ElyoZTLSfWoOPeo4qt23Q',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-02-05T19:05:40.260Z',
            acceptance: false,
          },
          {
            recipient: 'c53d478393e3b42ed3b78d4c646b4b490c30bc30dc6b5b095c214293b98abbf4',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '03da9fa914a6d91456725e6bcd8edb6a58ba81317fdc5802455f99436de85e25',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:17.001Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'gswhei4tTCKi-t-ZcntKwg',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-02-04T22:08:14.458Z',
            acceptance: false,
          },
          {
            recipient: '6a02be11bdf166a12848370a4ccdec06b6eb413c4a0d2d3e2beb56c6183ef106',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'd0289b01e18d6fb609c6f78fab8ca9cdb69f90ff25888649e8c4e548e05eeca3',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:17.000Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: '0nLXmmanRvuYdFTPKDhM7g',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-02-04T20:41:02.632Z',
            acceptance: false,
          },
          {
            recipient: '94ecdf28081556fbc545dac96f545e6d5a61d80f8852947bed969f919719dbb6',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'fa7e1ad4e618394ab1297f0af660eed25da17c5380f395a1fe9884ccbc2e11ca',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.999Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'B8VvCkpmR4idVxFrcN1I1g',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-02-04T18:40:32.988Z',
            acceptance: false,
          },
          {
            recipient: '515aaf23f4674078a4c099244f0667f51dffa70896cc3437a0cb268dfba694ca',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'e4be347fef3c5f06d61b0cd2f748be46ce00ff31907718dde217a0c596bee178',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.998Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: '2fAKbOggQd-juKvuySCDsQ',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-01-29T23:15:58.244Z',
            acceptance: false,
          },
          {
            recipient: '58048080333d4396a26931981b82f618cb4895be5eb98e8e4b2132992043a40b',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'c82dff2c8c2691bf4d1fd9043eb0fdf328d03f52b19d9a42d8f4ce851b1b2211',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.997Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'mDHFZReUTXGJaCR4FJchWA',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-01-29T01:34:01.804Z',
            acceptance: false,
          },
          {
            recipient: '6dfb90347dc11e52fb473ef3be97c143d97eb91831938067fc385efc81abf904',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '7997bd11c333fec1e9282a7ca5baf962ad539832f8c794e2bce2ec147853bad0',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.996Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'x9tJzkb4TmqbtRufCVdtUQ',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-01-23T23:33:15.646Z',
            acceptance: false,
          },
          {
            recipient: '0fbaf674c2c0323b61db9ad6cbdda1af33e9dabb40d35899b40b24b4852cd4fa',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'ad3bbf7e644d272703ea6babefb308602d75903f6197afaca550e0b374db5459',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.995Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'RKN2kQ9BTYm3QFYyMN416g',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-01-23T23:29:24.141Z',
            acceptance: false,
          },
          {
            recipient: 'dbb604f4d3a09a6d57b71417040467069f54cf56c298f4a0940d2cb5fe4664b5',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '49d01e139ecd6f33c12e6c5cf37cd6646ebf2d3a41db305a5cbff1334158677c',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.994Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'Rr_ACazLRZqQgo6p98PeHw',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-01-23T23:29:01.044Z',
            acceptance: false,
          },
          {
            recipient: '29ae43e5cca9b94fe1c22c5c8c0f0d5778c4a2b8356cda9b22badb59479135e2',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'f6c455915f38af7c66134b22a2e4269ea28e01fb0abf81c86ffc6ef551e2e052',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.993Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'g_U4S7TuSr-eYfc6hgk2qw',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-01-23T23:28:21.854Z',
            acceptance: false,
          },
          {
            recipient: '6da1b60ab3aa7ed8d0d919f028bdd86fe75143e9c9680b7f64a750841623f53a',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '30b30a33a79de728d01758adb0517aa9bd52f987505f1049ed1916e3d7063aad',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.992Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'iNqLP0BqQ96uygAQSavudg',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-01-23T23:27:56.529Z',
            acceptance: false,
          },
          {
            recipient: '09c84a4fe6e3dfc5ffa240f3e88f9925014bad151cacf8ff8a34609de8d36dd2',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'ad96a306c8aa5c1d6bc388c959d80f0eb1389f3e712795973c6e5cede1bb140d',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.991Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'zsHQFogVSFKFDYb9H7DitA',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-01-23T23:27:52.121Z',
            acceptance: false,
          },
          {
            recipient: '826d4842bfd8eb9b2c17f47c4972243fc1b652fe6152a7d1f794328fd8791602',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '2e475e3ad2e40c03809a0a060939069d3fcca85170c022b3660c6b958c2b5a88',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.990Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'UENdqtIcS4inqpVQvliJ4Q',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-01-23T23:26:01.243Z',
            acceptance: false,
          },
          {
            recipient: 'ae1716f8a821cf6420796c88ebb3644497923a653fe0ba483290c09c54f7f824',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'f72a9d95943fc761d1728f09509105fbffe92942d1c831f02273b27211768b06',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.989Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'T2aqIIOvSOuPUMlijpdPNQ',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-01-23T23:24:59.896Z',
            acceptance: false,
          },
          {
            recipient: '045770fcd4e67cdc3b7468c0babed2f7ef170db2e243e039604f9addef487626',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'c3b1f2de8a96d2b1b6e3e3123b7a7b9f93d8cce2520fd19ce8390e57ea0f406a',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.988Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'XNQAb0NyTFWpLntuwfablQ',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-01-16T19:38:37.415Z',
            acceptance: false,
          },
          {
            recipient: '479d3b44e993b1baa58d309eefda18ea302cc78f36d43efbd593d63431df7a05',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '3d679444a340e74f91f6bf282df6a1517e5dd70d781dd7f78b528f2395cc8bc9',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.987Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: '2oORr4qORVeF_FOEZwRdww',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2019-12-17T22:17:10.610Z',
            acceptance: false,
          },
          {
            recipient: '5d7a5e25e26a92b9db1bce4996b033a3b3cc946bc6ef64da502bf4f0fc6397f6',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '52fa8505c41666212179d81400e67c0531d1435c9c1f85948d9206dfe49d2e10',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.986Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'iGRuUSuQSV2_ycz-2ejlGA',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2019-12-17T22:16:14.450Z',
            acceptance: false,
          },
          {
            recipient: '30c3afd5fb936c3bd7070377973d9b1c1d2433a847f2038f4b92846163b229b3',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '579a576ff1a3473e141431dc754462fbebd0daba3d6a35bdd68f2c40500a211b',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.985Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'tjR4Hq5FQ3mWoqCkr93qNg',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2019-12-09T20:31:06.310Z',
            acceptance: false,
          },
          {
            recipient: 'b16551433035860a1ccf9aada4842eb044f3dd8fa8afb808b4be130ffe8a385f',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '803d0dc6934040f85fa3cf16299f21b95a266fe306910e842d9016271fa9cfaf',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.984Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'sCgdktsASy66dpaa2XtSLA',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2019-12-06T21:30:22.966Z',
            acceptance: false,
          },
          {
            recipient: '4c380955fdd7f43f159c8878d3746518592809d34811b39a77ba3fca17ed946e',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '8e6ecadbdc878f11ed7c0fd873d7dff407cabb98a65e11a1b4263c93e9f20c19',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.983Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'yAtP1ORkSPeMPKOMLEEBhA',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2019-12-04T21:44:30.249Z',
            acceptance: false,
          },
          {
            recipient: 'e6df68705ebd0c8fd89cb0dcc6227fba4f103028c0f30c2f8c5e1648a95ee398',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '18a8f1665db3d99820dcb2c4f31f8100dc0801c3e9b471fa9d148187064571d6',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.982Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'VZc5iy4fTBSybxC0yZheaQ',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2019-12-03T22:54:23.560Z',
            acceptance: false,
          },
          {
            recipient: 'a8bf7599ac277a4de7796394acdb70339395dac1e9c6ef2243535efd39fde26a',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '8ed326055a80569241888dd5b6d71dd3b4be77341a85f0d2e3037fbf65101e1d',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.981Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'eFI3F0PATfe_uKML1RkdMw',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2019-11-22T00:01:44.505Z',
            acceptance: false,
          },
          {
            recipient: 'c0efac5d3c5bf4c58c0290189f3ff6cb451e24c1cca2d1bb9844c0ea8f8b7709',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'fce330fb6c179a9639a1188eb6b8ebd7251f854b839b9b873ae1bf296e02d160',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.980Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: '3kPGF6o0SuqC6S1WL99CVA',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2019-11-21T20:19:17.911Z',
            acceptance: false,
          },
          {
            recipient: '639668a88351ff0b41f9abe5ee7d1bc1848c2b87c0cdca34055d3f406bd72c4a',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '7c090dc18dddc2e2c16a8bfdc502165a3af31173c0a01023553d27b9e0b51d5f',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.979Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: '_nOR79GtTCWQz7utoGbg5Q',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2019-11-20T22:08:35.840Z',
            acceptance: false,
          },
          {
            recipient: '6c75d189dc66331ee7915c090de94b98b9a96b2d7f0301c52e05476a8d90527d',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '2e7a9f705fec8bcaa152c1eae419d3d08e5e3aec3cb283263cf0b6764fa0d8aa',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.978Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'KIdOekUDSdSFqAAZr-jdFQ',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2019-11-20T01:33:31.862Z',
            acceptance: false,
          },
          {
            recipient: 'c1f9986031af4a008a4cb51142aa8246743cf5c2d9fc1ca69eae38946d32e8f5',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '25d281c99ce0bdeaac1bcd902bea34829b9f006c0ebe037220d41c7bd42859da',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.977Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'fOP26mPNTNG83wnI7IWQkw',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2019-11-15T19:58:02.661Z',
            acceptance: false,
          },
          {
            recipient: 'f9cbb0218d056e5ef44780bcdb1b822085c4e335969a0d678ac302c84937b120',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '5c21038332d76f147066b973f66a337497f3284fa4591900e7006061fd476226',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.976Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'iKCr3ig_S3W28J7tfMLNVw',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2019-11-05T23:03:28.276Z',
            acceptance: false,
          },
          {
            recipient: 'aeb24c16f7eebe752cc22b706079d0d2d5ffedc8c6be4ff80111912f627090d9',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '193010a7e9c37fb3343a869d46d71447e8b2a41268a21b4b3ccfdce9cb139e73',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.975Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'jJ1QaiMATPmr0hOl3aHnqw',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2019-11-05T22:11:56.065Z',
            acceptance: false,
          },
          {
            recipient: 'd500bb28be6c8399ce7b3ad5c0aeb93ad6c11ba563de02e846417d4ab291b986',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '03d456cb09cc948cd56226446fa003168269e53dde267e6e0d0afff89fe5a519',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.974Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'FtPJNDT7SGGEyKZe4FsowQ',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2019-10-22T21:32:06.072Z',
            acceptance: false,
          },
          {
            recipient: 'a0dc1f51b56ef6a88405c2c992b820415f236404d6d1a8b71b3a14cfe60db41f',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '92977190285bc7fd53dc52e0f5cb204f8e63b77cda3356a13852a0a5dda0cd4e',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.973Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'x-I7ebYeRb6grfZknOclPQ',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2019-10-22T20:56:28.693Z',
            acceptance: false,
          },
          {
            recipient: '3b95176cc26b87780b122ef841ca8096a5bc6b2859607c7ba28aef2805949785',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'cf073258d803723ed960f910341c51f6766a7efd8e495130f1135142b1953f4a',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.972Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'jDdGSETCSl2wpdOlqhJpYw',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2019-10-15T23:19:14.743Z',
            acceptance: false,
          },
          {
            recipient: '3c12a3ceb974a36e8083aefc36da1c3e1019b921c2ddb0c4d962f7261cc4ff0e',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '655e5e74c8b1c6f525060f0e76f0a4d453482a9685c76ca367e14f5b8705053f',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.971Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'So65U8hRQUeuHzjlzniKxQ',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2019-10-10T22:33:06.993Z',
            acceptance: false,
          },
          {
            recipient: '2459fe4390beeb55792227e0c0732ecbb75702c2624890619e3d7051aba1fc27',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '615a8e9e2685b53b7d22a3fa09da216488a34a09d43fff4a7d1fcb7035bcc601',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.970Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: '5Uc-ftbdRHumtWK2G_7jcg',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2019-10-10T19:26:10.388Z',
            acceptance: false,
          },
          {
            recipient: '06861ffff51b781c1310e31e9a1fe1a94c18aaf0aa1c099634e1382fceec2950',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '98cd8b4adf0f8e67c41988d7e118711c8abe82fd7abf458331a4efb073be2e40',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.969Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'TqGlxYruRseGIgAn0-X4Kg',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2019-10-08T21:44:44.387Z',
            acceptance: false,
          },
          {
            recipient: 'e0bb01a278013c9fb38356e27a43de27dc79937fed2af69d9647853b1634760b',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'c1637f3e25faee21e0453aace296c508b33e8a84bdbf40f2a6c1be8bf62e14d1',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.968Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'UYpBIbT9SvOfeOah8HsSiw',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2019-10-07T19:29:23.486Z',
            acceptance: false,
          },
          {
            recipient: 'fc2b76b10e583fea71f07083f6526ee8a6f9c30c09565a723cbd7e18fd3f1cad',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '3f46b94c4cc97fae41e49e660704f5c8df8158f3ba996eafd169dba3212a5e0d',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.967Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'wNug7M4UTQWZ_eicHZzsiQ',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2019-10-04T22:57:13.881Z',
            acceptance: false,
          },
          {
            recipient: '502eaa19472e5f9574a8d8efa736672f2bc7c4635d9846c57aa95e54103ae80d',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '49012badbc45c20c77f49d63f9742f480622a45b806b9ceb3f3b135fb9df9e45',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.966Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'VW8zYajuTbK-SjoP6L8LyQ',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2019-10-02T17:13:33.183Z',
            acceptance: false,
          },
          {
            recipient: 'ed170180d7cb23cd750227eea88971bec265d49c8e61f2b159997567e11bbba1',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '5af51ecf31b92584c934167ecefcc45f10266c2ce646ae84e87de91f9e17ed9f',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.965Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'mrg5EpGhTZWJAOsy3kkluQ',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2019-09-25T14:32:35.390Z',
            acceptance: false,
          },
          {
            recipient: 'cd96281e4c3ede1ead8dd517b23d1f6961bd2fab50e2d8732afc89e9d9cf5d18',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '6f0ac1fd38053bcce5c482f600cf41e8b96279ca457cde41e8fc12466888672a',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.964Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'm76ulBvQQ7K6ys_yNS4UkQ',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2019-09-23T19:52:36.257Z',
            acceptance: false,
          },
          {
            recipient: 'bd137e4bb0f04ad78e014698a1570b83576dfa4b301ca3687672e28ec2d53202',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '91bb998902a4d2f2883ebc7e957fea69ad6987a603bf1c68c7d3c6f1785475b3',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.963Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'PquJphS3RVC3MsEMQEf0cw',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2019-09-18T00:55:08.299Z',
            acceptance: false,
          },
          {
            recipient: 'd0264be6c2605b0993db77ccfb321431d935ae5ab1189f89b80b612e94b90209',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'fed88c2445292ce4ef53b5670d9cbbd77a3b7a40d8548532867fbddfaac7edf3',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.962Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'jAhmOFRKQEecpLIdZa8wMw',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2019-09-17T18:28:46.082Z',
            acceptance: false,
          },
          {
            recipient: 'b7466bd85ef513f2230c27fac980ae098bb8637f461122594a26a674793aa497',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '874512586923d46772056dae9ebf99310eac9c84c71d056cb383e7711e45a5e7',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.961Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'E7rHSB1GRnGHsozhPgv-0g',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2019-09-13T02:20:40.777Z',
            acceptance: false,
          },
          {
            recipient: '2b638a5f759a15f21d45b130f1a5586d36f27efca23f0c26c1a47dcfdfa05939',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'ccc80745d4b870ddd9afb32da9a3bc602fcdab5f209d8e11b4ad6eac014a14dd',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.960Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'uJwGpoypSjqcwflwMEmLRQ',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2019-09-13T01:44:34.007Z',
            acceptance: false,
          },
          {
            recipient: '2dc7f741a14de3275c681c5e61fba9988476c74f50fec9ff4d92ab57bb98ca04',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '1362f02ad3dfd542119970becbfd372e03ff4acc3932c89476e997d2d86d5b39',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.959Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'RalJznG5SfWuMRmkDVKV9Q',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2019-09-13T01:39:33.532Z',
            acceptance: false,
          },
          {
            recipient: '048a247497a755f937ea10680c7fd9843145f90fb01dd824eb6b27c5905cb21d',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'bfac37d74c03a31d21db5dec50b4b5b748be5cd332a0f7773a632f76e901f330',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.958Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'DjRwWqc5TmWfVXlNkAlTIw',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2019-09-10T17:33:33.692Z',
            acceptance: false,
          },
          {
            recipient: 'c0e0c7734ec4999da3da4cb6d6e9e030e7de20a16415862adfa7634ba78f5f8e',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '1d6ed12740e05dcf02f9992e162423b0d4e1605216d4b9592c957b700dfb7b8e',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.957Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'yh6WZ-mqRlS03YVL-oeRYg',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2019-09-06T22:57:51.398Z',
            acceptance: false,
          },
          {
            recipient: '366ef0a3e3b653882c7af0f12b110b78f6406ba432aebcb80d4e4b0458c947d9',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'e915369e4004cb2eeaa28ab9295079f571d8beab6e45647ed61f2c32a8793e82',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.956Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'KBEXrbs4QVGFkarvAvnTZA',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2019-09-05T19:45:01.081Z',
            acceptance: false,
          },
          {
            recipient: 'b4e6ab18a5047b2f966c7963b776a582868fd7e6294705a46df00e8860272199',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '255b219a83b5b9f85afa5671cfb002f801bf2b19da80ba26dd5c5efaf65ed959',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.873Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.599Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'rUlXAkXXSDSny1f9ZnQ1cQ',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2022-07-12T22:18:46.433Z',
            acceptance: false,
          },
          {
            recipient: '88d0949a39caccd5ffd34547e623cb890e05450f5b78525c820865a1b92da2bf',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'e79e899749c8f1ea80a2a9b496cb379384d221eae6027976ae131a7cc3e5e62d',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.872Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.599Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 's9uGRuwVSB2uSdChnjD15A',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2022-07-12T21:56:27.187Z',
            acceptance: false,
          },
          {
            recipient: '1cafa8783be6148185d72b057d308324ef1ec44aa596ce2314f12690caac4d33',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '5256a82d940443687b0970b97a1b7ab608ab171b048a583f5a8254e1a88f3b1c',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.871Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.599Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'jw7iLZwcQ36I4u4ExR6-CA',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2022-07-12T21:23:33.448Z',
            acceptance: false,
          },
          {
            recipient: '3b418b4a2c69144a6306b46d10d7dba3f1544b70dfcb8b7fba80e90ea23740cd',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '751e7e29fa1103e575686ec20731a1b0965761bff417e0a57bed61e00f30c3b7',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.870Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.599Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'iG-bZOXaSuaQED7FWy4fYg',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2022-07-12T21:17:23.781Z',
            acceptance: false,
          },
          {
            recipient: '53915ccda32ed005bd09946466c2145363079bef7415a17c580d65472ae53b9e',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '51c7f0feaca19b359541c751261d5595a8d8b88491d342a255d160220205d08a',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.869Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.599Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'ebwuX_NvS4ucw20qupI_8Q',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2022-07-12T19:35:44.887Z',
            acceptance: false,
          },
          {
            recipient: 'e28718cc7333dca4c36f94af7e0508ac71daaeacd48919ea9efd2c4cefbfa813',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '073ee3ce74f974f403e6ea7bc0df0a79426f3000b35c91610e88d75545424686',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.868Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.599Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'SHnXecoZSVaBuzlqIYb7UA',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2022-07-12T16:27:44.572Z',
            acceptance: false,
          },
          {
            recipient: 'd6299c027b208007bc8b303879dc8b02604ee5f12a42ce76c77402887f8fcb83',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '5ea9976b4665754c39f828c2a99f59afe716e250c2978255c0f4db51b011b046',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.867Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.599Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: '7cCsRcCmR5yYV7A-c7HJ0g',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2022-07-06T14:12:13.171Z',
            acceptance: false,
          },
          {
            recipient: '58635f945fdc12e380591e0338d41afe4a822e43d9ecc300edccb24f91aa6dc3',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '1221737bdaa064a32467852ab2a98e7644c458a7f2388f21d45ec2b96dd6c963',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.866Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.599Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'mSYEYQICSL6vJZgzsrZmiw',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2022-06-23T17:59:44.811Z',
            acceptance: false,
          },
          {
            recipient: '152e852adf89218b3cfcadf3166c1dc0ed41e5d26304c3a010cd2e0daf937ca6',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'ae9dfebfb8a0fe7f5ef85f8e0621642c3c44b14c6b42b174e9de10288a6939c8',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.865Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.599Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'NLQJ8v-FQ4aLfWKtsrcfOA',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2022-06-14T22:50:44.929Z',
            acceptance: false,
          },
          {
            recipient: 'ad1f828500fc997e428186178eefb44260f98fe518701119e2b58fd63f8f8d15',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'b0dbb101d67c86412c9f595e238635c2ae8e3b3d3c04d559333b9e003b7b07da',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.864Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.599Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'YkXVmegvSAO3clKxYVScZA',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2022-06-07T23:31:27.835Z',
            acceptance: false,
          },
          {
            recipient: '011312eaae303408cabfe8e65809cb7cd6bd888e63277c75ee756ac71dda667f',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '3237118a97e1d2761f9651cfe81db94842596925e16d03b9868524c3cc2a7328',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.863Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.599Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'QK2mkEWwRUue2XSerj1d-Q',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2022-05-26T03:26:48.744Z',
            acceptance: false,
          },
          {
            recipient: '7cc9fa8a732fd15353d3fa7e903b81d903f08a027f76482d352b3ef221f10e03',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '9eab0e465ed4d555d604a955de6e4fe34d5417311cc9c5c4ccfe4fd986b5375f',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.862Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.599Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'pyQ6NrDwSE-d7OTH3RzQjQ',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2022-05-24T16:01:41.950Z',
            acceptance: false,
          },
          {
            recipient: '939f3d3fcb313413d63c40d9411822590296259ee63eba496bd9e98f997245ba',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'fad95281645bd6b46767d7bf5eaf5198b3db3e1f3d38a7ec99d65c34d46ee34a',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.861Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.599Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'Z2KFJ0WoSye-sV1sI3TpnQ',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2022-05-24T15:50:18.222Z',
            acceptance: false,
          },
          {
            recipient: '14a0877a1408abe87badf4df98d13ebd5dddd67fe3c3419e6e14cb2ef9a2a5b7',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '886c703c65ea891072fe8d4e9da3e026b5e7972d8e4eb1a7b5541b1f8e977df5',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.860Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.599Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'lV6bCRpaSF6QRXsONbOm6g',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2022-05-24T15:21:50.663Z',
            acceptance: false,
          },
          {
            recipient: '5fad49105d488eac07873e7980c31255d470638eeaf61bea5ec22269000c78b8',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '48f1822072f09dae6f28a8ce04fb888f4456356e4ae5321fc7caaa54869b54a6',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.859Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.599Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'sr6gXBa0TzKfw8PYO7JYlg',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2022-05-24T15:21:02.278Z',
            acceptance: false,
          },
          {
            recipient: '1a511bba3d2c682f1a260f414e6136e8b9c13e4351f86e4d74c46fdce8aace5e',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '17d52b5d125ab211acec29afc39b57746dd641d6178a82343a443aeee4bb912e',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.858Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.599Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: '63eYQcDzR2GWWkMI_n02_Q',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2022-05-10T06:04:20.579Z',
            acceptance: false,
          },
          {
            recipient: '662c6c3aadf325ff7a731b0fc1c43e47455ae0afa5c0b8eb2581238f4208ce25',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '32c43a35d394f698949be646b1ab196df3c052e0019da835a22162610f257cca',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.857Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.599Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: '7_u0-r0_T2CT-W1bO7Ll4Q',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2022-05-07T22:56:15.445Z',
            acceptance: false,
          },
          {
            recipient: '930c67836a96c87f619b8b63e7fa488da8d25df9db27adb394d0ba5e2490729c',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'ed4248dc7fa608d2a42d42f517efde6dd122ef5b9575d1541ad32acf0a3a3dcd',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.856Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.599Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: '2N4AZ1xTRUqf7k5B1kXPxw',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2022-05-06T15:01:03.573Z',
            acceptance: false,
          },
          {
            recipient: '9960f2b1327d284ce10ddc3a0d087fbbafc94dde998c7af20d83db29caf5e902',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'fe5f64637ed4d07b1788b7eef9d510afc2589dc0801cb7e1725edbc4d988a899',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.855Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'JtKasa3ASDqt89_OA67B-w',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2022-05-05T18:23:41.255Z',
            acceptance: false,
          },
          {
            recipient: '209be0060d01facdd894eff9d36aa20200cfd8f2606cdc48646a028a9102dc1b',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '7a44cbcb7f6ab4b775f4cc94788aa0de103ae723d8280e8c0464e87776c99b0e',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.854Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'MvVh85zIQOCcWh8KN6U43g',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2022-04-28T21:19:27.213Z',
            acceptance: false,
          },
          {
            recipient: '482aa3aa703fdfc28d9bb0c4d6a5783c66f32af2125e62e95b7d8db0df849f82',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '7d60395a90527b73aef5dfb47c793d5279ad4b32534501198507fa38e579f79b',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.853Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'PY5SJaI7Qa-NVAz4y2JRSg',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2022-04-19T20:12:13.983Z',
            acceptance: false,
          },
          {
            recipient: '9166770cf016adba61e6778e99f34f8f36b31e75ff2931a7694c2081bb713d91',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'eeac6515f8439fcaaf58f2fcfdbda1d0cd7bbfb132b44a634a08d329ba376202',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.852Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: '6--0KBTSTeqPMRjqm-jR9g',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2022-04-08T05:35:06.449Z',
            acceptance: false,
          },
          {
            recipient: '2ae70c6743865ff34eda4794866279e9f37bb009176db8f2074e023e32472157',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'd5276f9b92c435ad379a26fa685862744e50d96f0cd187ca872e5f36eb7e28c4',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.851Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'vvhhlB5pQuaSUfkAVLpYsA',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2022-04-06T21:56:26.922Z',
            acceptance: false,
          },
          {
            recipient: '5606936353fb700cbcbf3516ed6f8a59616386ae54e9d85afeb89986a34afc2d',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '1019dc51a12e8f6aec93cea7c1f91e8e9cbe826241bd71fd56830df90d6a50f8',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.850Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'TLj9Itx7RBmhfhquZflBgg',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2022-04-05T15:07:52.124Z',
            acceptance: false,
          },
          {
            recipient: 'ab0cd17319d70694a0bdf1c37b3658901636e7be1d287728c57c8f7cc0c7cc93',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '092741d3ccbd0ab9ecc8ef3a0b60c3ca635288e5f9b889ba76103fc568ed2b5a',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.849Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'kaAWUbD5RcWu606GjCGaRA',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2022-04-04T23:55:39.740Z',
            acceptance: false,
          },
          {
            recipient: '1282b7378296a76ed89ea64539f71c3abda69f8c28ef97d7dbfcde18bcceb891',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '325be2aed4cff918a29a1ae30a3578884f0cfa3213f330a34eccf69c8bf81daf',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.848Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'eVPYW-G4RemZhsw8-O6IqQ',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2022-04-04T17:25:44.743Z',
            acceptance: false,
          },
          {
            recipient: '2a3fd0d693d53ea5cf825d7c25a6e2e414336a05046638466531ac831c346370',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '757d158308e4d1e4f312531f8855146b6665de44d39233cb52f556dbb46d9752',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.847Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'tY5qDfimQWeW21htKWxhcg',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2022-04-02T03:48:24.138Z',
            acceptance: false,
          },
          {
            recipient: '85f41af5577a2887db11c03b0c504ed9dc80ec4178c358aeb33a348cb6f324bd',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'eb79486d6205d844674d0c59dd136844aa01f0f2ba8088460e01c01f385e2d3b',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.846Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'hBAaOBk2T-2LYFTR0FcGaQ',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2022-04-01T02:42:00.608Z',
            acceptance: false,
          },
          {
            recipient: '6ce53a3c97c4f42747ecf25b090319129e8140f2022d32f51ab1cb4737ad3e68',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'ebfdc556dc245ae82e4432d672c15ff068335a2dde881a2ac2cbfeaf3dd6be8b',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.845Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'AXInrmWKS3uNG0kP_685BQ',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2022-03-28T22:56:56.827Z',
            acceptance: false,
          },
          {
            recipient: '9a9fa556350703b2281f4ddb04bf242cef15cbfab3eba711b31369764fbd65d9',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'c474272d199c889792d4204234615a3ebfa27b23fe4cf9d4b800eda9272cef1f',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.844Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'Kh0a3nkCQDmohMAZzYe-yw',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2022-03-25T18:35:28.240Z',
            acceptance: false,
          },
          {
            recipient: '9a7fa3f4363ba4160deea5d32a67b706cb5a709d2504bc6c6f057b65dd31946c',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '0c8a2db657f1eb92b7bfaced9df29b91fc6d5f1fc38c0f5f816a2bde7c00158c',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.843Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'rwDWA_k-QduaFQWa3Kqdsg',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2022-03-24T00:28:25.775Z',
            acceptance: false,
          },
          {
            recipient: 'ccf392a78d3624ac702ff1acac0b38a13d0b94f0569bd2d1e09dda8b9408b3be',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'c485f88d4315f54022fb929f9837060ecf5690e63c512533dd1bdd722b8e6ae9',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.842Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: '6VAbV-lRTpOWz-Wwc62Rrw',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2022-03-14T11:48:31.069Z',
            acceptance: false,
          },
          {
            recipient: 'f9866acbcc6f2e4b1a231cda15e012cceb16a2952715e3850f305b80f239f59b',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'b7f722bcd53496c0a6d2a0b6a4a8ca1790506f52938df54b77f23b48d03247b7',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.841Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: '1I3ZrZHQQY6dgW7eCeH5NQ',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2022-02-15T17:36:46.461Z',
            acceptance: false,
          },
          {
            recipient: '7c097b72b0224ca429f9e07efa2ad2fec62c07ecfa32707ffec580ceec610f24',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'ba1d68b3e3ca1d61e090a61b8e10622b345b04b2a2c3edb0dfc0cc1a508bf7d3',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.840Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'j_TJJm6uSzGLwHIYVi6MuA',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2022-02-12T22:46:45.275Z',
            acceptance: false,
          },
          {
            recipient: 'ed349ffdada0ce35ddc5afb6d75eecdb130c6e6aeeae1ae8c8fa1edbda03433b',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '110d9f931ca13526c9691b7baae55ef88d4c278dd66020c67b628e164b215b9d',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.839Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'vh3JtPA7Q6WHGWB0jkGUpg',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2022-02-08T00:45:42.560Z',
            acceptance: false,
          },
          {
            recipient: '98fd378b3cd4df89b539a9e0fefed36f41822fe092e0b2f66316ea284e760409',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '33ed18a3555bd9422abd7c7e4c524381df63df0ef9227ef7a90b06be1371eed0',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.838Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: '0XFa0iW8QaygzSrPJeBGhw',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2022-02-03T10:36:44.259Z',
            acceptance: false,
          },
          {
            recipient: '76199206e97e6c8f6be69dd332295db9b3277fa993a7860eebf09111fcc3b553',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '1ef3b4bcc543d341c5556854a694c1c9c13c289e17b4945a6955d0035168c9d5',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.837Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: '2ZeRQR1gSPaEbfJ69kqQgA',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2022-01-03T15:37:31.050Z',
            acceptance: false,
          },
          {
            recipient: '104dc0050e602ea3ed68992f3667be2fce2c9e4e129d4b4596a610873c83eccb',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'e31670e6f8f19d145bec105a7a53dda7acdaa34f77d6dc552a84d050e23b980b',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.836Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'TLejdkCmQROy1ae0rRk4nA',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-12-08T15:32:14.826Z',
            acceptance: false,
          },
          {
            recipient: 'e25c4475ab21725375b2e6a3d00e91b2dfc9e9ac90f8f911f5851dcb59d28d03',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '8c0881a4a9ba777c16764dc87abaedac3b372953ce27a6105d7dcd7c7a75e405',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.835Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'LolrJRstTHiZX14d_qWMOQ',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-12-07T05:23:33.299Z',
            acceptance: false,
          },
          {
            recipient: '92d5367373f637b2c5d74d8e4c65a2b0cb845c430093c25e7089d5b2f27b1586',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '96f1580bf6af7764da4459e252f39b2f9e9a00792ec751a7cf1be55c0be7b2fd',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.834Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'oEguNCJnRfOxMAZTLNHFFA',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-12-07T05:22:42.255Z',
            acceptance: false,
          },
          {
            recipient: 'b2ab460870286aec67dff24db1f778df8e833945f51e842ee343ec92156be9db',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '6e32b50cccafad572e27d0c047f60116806753e0e283ca5dab7b406fa7154993',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.833Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: '-3jDWIgFQ3qqCrqXQpZbrg',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-12-02T00:45:30.366Z',
            acceptance: false,
          },
          {
            recipient: '271c9d0077fa501bccf89e31d4b42cfbfa5bea10c6481184498a9cd73f7a4d5d',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '7059160a0840f187efdf9297ef06267e68745afe828304d3aebed07e6d5720af',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.832Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'NxeORx9JSGayIPyzojquhA',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-12-02T00:42:29.619Z',
            acceptance: false,
          },
          {
            recipient: '405400a37610da02468a446ca1a5616776ba3cc6bf1ac6a498ab6d9f9823f964',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '294053160ab7ebf8a535b283e9d6824ebb9b7d37b18b094ab627a92dbd149c38',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.831Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'U485NcMURPKg0MrFHbV5ZQ',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-11-29T23:06:28.749Z',
            acceptance: false,
          },
          {
            recipient: 'a0dc1f51b56ef6a88405c2c992b820415f236404d6d1a8b71b3a14cfe60db41f',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '5c6cf8def0adc10f1af750c13cce9d9cd372a601a0e7339d44d7f42210d336a2',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.830Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'qozYnAbsSDeZPfDd-5Wmzw',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-11-18T05:28:14.443Z',
            acceptance: false,
          },
          {
            recipient: '9fd539a66d2c2b4b557b6438d40e11efb3cdc54affa3733a47e9a31796053ffe',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '7af237ff3f861e5f325ae19601cbe6a63bb438f33bf3beaaa006d5ba8e8553a9',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.829Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'aJTymA-iRa21p40FilbZNw',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-11-16T19:01:17.000Z',
            acceptance: false,
          },
          {
            recipient: '0b6d5f0b2bf60b79addb43fcc47bdd652442ad28cfa3f7b7ffc843e4bf58c332',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '74bd787233aaeaf27c846e0293c61d031db2543f50c663af7cdafcc0fdf93f6b',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.828Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'as9bhTTdTROVzzkmP-6xNQ',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-11-09T17:57:58.216Z',
            acceptance: false,
          },
          {
            recipient: '6e3a2bf2095f6ea587dfb459d59fa728cd1cd458fd58fde77b0fd1e0a665b944',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '4a874da3035a26222ba039ec34486c5ba2cc3cae593d450a995a18c9b330e967',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.827Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'vntJnX7fQ62S-eexnm-3MQ',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-10-26T02:07:58.970Z',
            acceptance: false,
          },
          {
            recipient: 'ee877da8a815211cfa90f2d8bb7f7f08b76448ddd46761a0af45c34da5e371a6',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '96f3460ed1c4300dc5949bc9ff33aa0202500fb3778b39d9a2f6d27ba6de13d0',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.826Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'TBZ82sizS0-UjHD3Ypj10w',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-10-21T19:25:02.125Z',
            acceptance: false,
          },
          {
            recipient: 'f2169678a1063b2c95f5490f6065d92280cd463fdf3943cbc3cb67265d5bb11e',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '439ec3c048a6ad87096036cb0fa7b57824e5744fdcf0450fcfb3469dd0a5128b',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.825Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'ECBT7TiyS9mB3wLw-uN8ZA',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-10-20T23:32:57.171Z',
            acceptance: false,
          },
          {
            recipient: 'f91f7564c66daf09e075e04a72aeb455a9b3555b64700341cf34975608bac6a0',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '993c3b403492306eef7a7dae6efec56c3a3704412bac6c512ec028f6bb571b05',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.824Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'VDR_pQqVT2mdmqf5Kizyxg',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-10-20T23:21:35.711Z',
            acceptance: false,
          },
          {
            recipient: '464b73897fd18940eed86877e03db539de7b836efaf192cb490f05684ea43e92',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '9ee5cbdb3567d4d44590e2e5dca7176aa1c71df48ff5a53e31130c573672450b',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.823Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'aNFABCwdTPKSz-edlf5aXw',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-10-14T15:31:50.087Z',
            acceptance: false,
          },
          {
            recipient: '9afa7eb05338819eed1760e057d17f50c050dd21af375b97258492d8a0ccf293',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '4248045dbbfd209d706336f659c8cca8144752fa38941fcfcbb03852aa7ba45b',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.822Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: '2PoPXEEQTUmdJFTBfplrGA',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-10-13T00:02:01.845Z',
            acceptance: false,
          },
          {
            recipient: 'cfbdb9299cdcd8193c8c21b439381ac1fbcd43407f98b0a175849c7ca6b7ecd7',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '3cef5c6e8ef149e0e2890d05e526a9f12e5907c2fe44a92dfb46145607ec8561',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.821Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: '0EGzTZohTXatqT8aa8JNqg',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-10-07T04:32:44.443Z',
            acceptance: false,
          },
          {
            recipient: '3363cbc56de7f3ebdf8c5f5eb831e70f45d75824e3d1b1c8ef1f3c68316be237',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '64bd3e955fa105a9a42c1720f4e213302907f8d5f4be23af5622028e6d53ed8a',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.820Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'Vzyo_O6RRZyLQadxqoXTxg',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-10-02T03:09:13.121Z',
            acceptance: false,
          },
          {
            recipient: 'c3c3551c2fd3bb78a4355c1dd6ac6912d70fad53c4d903ee92e8c8a2d98b68fc',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '0dc9e0ba1cd1257f63f6ec0b9e388e41c41a4d6fdfc07d797d69f83167e89999',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.819Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'im9uFcx4SJSwRvBLielAiw',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-09-30T22:09:51.867Z',
            acceptance: false,
          },
          {
            recipient: 'f34efd61d00abedaf4899aabe360e9dadb8ecd8ae38758a9aee1cd98b89bf5fc',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '2004a1570ba4275ec650926942d7c5d15eafcb66e4189f812e82d0f5520a2045',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.818Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'youli9_hQs-HEX8yd0r6pg',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-09-27T22:11:43.511Z',
            acceptance: false,
          },
          {
            recipient: 'a39f65c1ec148faa84038adc5938ee00806453029c07bce58bd3b3a92c01c507',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '7d5fe6671c5cede1e551d4058276f2cdf8f96bb00d8340de009b90701325335f',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.817Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'y7bYcViZTsap-qkmy68_CA',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-09-22T23:04:23.526Z',
            acceptance: false,
          },
          {
            recipient: '61864c99fa92089cc90a0a09ae4002b0e9086dbb6a406ad40ca08576f06338be',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '6a95941b5e6566a564c46f604009dff3039f88096dad9609039902c3830cb207',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.816Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: '4NGdfGRvSxK2rTMYfyb3ZQ',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-09-17T01:29:57.274Z',
            acceptance: false,
          },
          {
            recipient: '757ca5ea06ebab7f4050e66b5e5d2e84796d06ac6849bfbbaf21750ef7a00d49',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '883a9f5c0eb2eed6dec3dbe2f5e7a83ceeb4b2094394e296effd02ab6f97ef62',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.815Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'gQOWfaCVRaGZkKljtudF3A',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-09-15T14:11:43.252Z',
            acceptance: false,
          },
          {
            recipient: 'af575f4caf7c54d8979bf7b13dd144225da3b63a2fe6e1a7484f61bcbae77137',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '0caf9df25bbe1d96a48da5d49f4ac6b57aa753f1d16885d03984d26a673c0243',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.814Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'OWjFYnuaSz2YnnM1pkT0cQ',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-09-15T01:38:25.293Z',
            acceptance: false,
          },
          {
            recipient: 'd6ca5dfcde00ce453a64fdf16062c6a5995ac45e53a3db71f28ee8b611007c46',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '668f17263ea57c93276e644593e6d0c431a9438cafd1a7fdabd0833a6ecf343a',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.813Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'wNBBzXXeSRyCbfE_VGoh2w',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-09-14T22:54:09.642Z',
            acceptance: false,
          },
          {
            recipient: '1bf29cc940e60df0a5da15618493731eeeedc2aa005c6a4934c3b4da6fd6c187',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'eee98c3dc3cd5868e5536b31c1c442d6e13e3ecdd6f715d7c003050b89591bd0',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.812Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'Vu2mJikQSyuVwuzzkr3bBg',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-09-08T23:12:38.682Z',
            acceptance: false,
          },
          {
            recipient: '0aca4cf26b5b46d13f34e8bb21f028cf0fa1375e247ca8ed2642bf73e42dcbe7',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'd543d32693e4989f580efdb8b383e5d60d269fc4a72ad28bf495f2ec6bf9c28e',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.811Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: '4kpL5la1TXmj6vf5SGfDdQ',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-09-08T04:27:20.949Z',
            acceptance: false,
          },
          {
            recipient: '5eca960c54d393779e00ad4f2cdc069a8187ef3e0374e31f7488e808c8af044f',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '6be095b8bcf028ee846d5fcceb22a1953a68c0b1d0722e489201cea24a6c67c3',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.810Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'Bz_jYktUS1-3PERsx4XNkQ',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-09-04T22:35:16.790Z',
            acceptance: false,
          },
          {
            recipient: 'aa1c6c35c0631b725c1fc8e576e308d90d303952391de56c835a71145f709b99',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'd53826d56edaa8ad7ed52e20073b4a622204f97f4e05246dfd0cdbe9007e6b6e',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.809Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'e2CEaU0-QK2pSMmivTR71g',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-08-31T22:45:57.923Z',
            acceptance: false,
          },
          {
            recipient: '98d30a97c2a5d0569b390747e555d054caa2d37fa647093a3c5a294236208c11',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'd7be64b5e81d1da8c2fd4103a6b6d580197e770f36a4f03099b6131fe20e01a5',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.808Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'fkxYXJZfQ8Wk9nCUiWrw0w',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-08-26T19:48:31.261Z',
            acceptance: false,
          },
          {
            recipient: 'c5ca5ac475189799e24211f13b35135123a665d977ea9db6fcba1253b9744312',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '3d0d2e021d8262823d46514f5b21b8b74c938c2be1c3c7343a5d9ace49c4e389',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.807Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'Cix52j-ASgKdhsuTH6ILVA',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-08-25T23:04:03.681Z',
            acceptance: false,
          },
          {
            recipient: '08adce212ff7a531f488e283f84aaf99473cbb90b07ddd9a4a1424e9863ac731',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'b3be3d16f99404c0a3587d6b27f9062b267b5efe9c5da3b0b15ee7b867bdf152',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.806Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'rCidz6vAT_eCG886-H2Vjg',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-08-19T18:38:10.316Z',
            acceptance: false,
          },
          {
            recipient: '265a75b161282b96f15e1aebd93139059ded5643f9b06aba6cf459fd63faf63c',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '5c0cd456a454b77be716a54b6f7f21d3e47b70f6b713d5632111cce7bd2a6dad',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.805Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'KazY7U8dR96n6ZcR2fz8WQ',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-08-04T16:10:18.673Z',
            acceptance: false,
          },
          {
            recipient: 'd658d9689241f75c7b47f4e219fe611daa3ed7d3cf8453438c515834efbaa6c2',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'e4a8f35cb3ffae711fa46bd385e60ee0ba2b53e378e4fe706ff9b76f6641a8e0',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.804Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'xQdsC8iqSQqToA2uCP1iMA',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-07-31T00:24:58.988Z',
            acceptance: false,
          },
          {
            recipient: 'd92365e0edff561d9efb0a60c95f9bb893a620605d44a1b66c4639a87933ca84',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '6746d3ca004ad015817a527e1926c669b2a33d0c83b72fa53e533749c9c93a20',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.803Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: '9QvXJ2guRE6lAx99zUNwpg',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-07-31T00:24:39.658Z',
            acceptance: false,
          },
          {
            recipient: '2363d939c0970f217ac2eaca57e2284d9aea869e2fd5949d5d2ad2cfa9265115',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'f8632e9b026e071e3b42c783af6cf6aed4e49da423abfeca77b56cef737879d5',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.802Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'OwwS4oskTMeYPsqoy3XfLw',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-07-15T22:22:36.618Z',
            acceptance: false,
          },
          {
            recipient: 'ccc8a5580d23def0c721c28c163c90eb41999395caa68ca7dab497862a58e912',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'dead3b9dcd64d3f9843d583f2f083439530c1c7d338a8063550144f66adfb0c3',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.801Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'PWJaVaYsRUKpxgp-rQtBtg',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-07-02T05:04:18.902Z',
            acceptance: false,
          },
          {
            recipient: 'c07a20cc64cabd2787b70b58047cd17b7107fcc8467e6787abbed4e6834982c9',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'b720976768a16ae5ac679722bcd43b2e7dc16ef521217fc8cd36394faebc2704',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.800Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'S1OquBpuTD6jpT5ZArYyVw',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-06-07T20:34:24.476Z',
            acceptance: false,
          },
          {
            recipient: 'b4783a646b9b5d2856569dd86aa5b24737d6b9859c683f81ab6576a3090004c1',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '168ab932e205d897f739bef7bbd2763211dc36fba0b9ae418df64004d77a7b54',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.799Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'QBYeLE8mTpeyl7A12Jp_DQ',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-06-07T20:28:12.882Z',
            acceptance: false,
          },
          {
            recipient: '29dc58e856c216ef26d793e7a6bc80aaf32677885b0ba9b40f3d9ea1974c150d',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'bfe06b8d5fa084d7db2d16fb39dea2763381afcda36bd32774fd2a423f5bdb1e',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.798Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'rXm1s4ltTXS2AJEIxSeXZA',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-06-07T20:23:29.240Z',
            acceptance: false,
          },
          {
            recipient: '5048774c8732848621222b3c28b7f790b8da6347f8f95d32863940483245dc33',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'bb534662e07ea5a41f6cda261fc8682e9e20f43842a2712539ceda9341446ad5',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.797Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'Htc6yIZJQ-yHehOCcUrrMw',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-05-13T12:58:35.753Z',
            acceptance: false,
          },
          {
            recipient: 'ce8ba8ef7f701c4c10eb380bd97720c7a52688acaf3232b37b3fc3635e4f1fa1',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '67b335d2844f102884a0150d56f6bda0d8f0b0c2d2a8e2928b88358b25ce6a0f',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.796Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'GmPYPRdpTXmj9lHMQBmbFA',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-05-06T19:46:40.587Z',
            acceptance: false,
          },
          {
            recipient: '425c067510dd4d39a8658e31fcf948458da97a26d89d7e459f30f9d5b9950d3c',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '79a2e6ac328847f2408860a88f10b968bd3b317752541470376d5cdbaa6bcca9',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.795Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'qCTtw6DnSPStlKCIzw-GEQ',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-04-14T23:44:08.570Z',
            acceptance: false,
          },
          {
            recipient: '599eeba3cb2a172ed4a0776c482b01d8fa080a5ccd70b81ee9284febb75a6b87',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '4e39bc2ca20b53364d48c6f9fd4c0e9bd15c14371f9b4e1681b787ecff20f095',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.794Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: '9Sqez9M_T3uThL0BuqsXNg',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-04-09T23:13:00.489Z',
            acceptance: false,
          },
          {
            recipient: '16915f910d2e2b890b6a6fa7200d3947ad3498c7dcd7364dfcd9a4a8c5362d85',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '99ca4a98b75a19cf0a3b5e801aea3fd7f49a8e8d6802b48619d4750add572643',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.793Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'gwVTXG0ISpGAYsqPvUhexQ',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-04-05T20:42:44.560Z',
            acceptance: false,
          },
          {
            recipient: '58349ce96ec2fa114e0d079d571109179ee4a7e0527c5974db8e758175af1aab',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '9e096c6a3cba71addf9de8aa527032bc3bb6796b72e6446e99dc6b3fe0888257',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.792Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'YnLcBEd2QJKlRvb9RXF9Nw',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-03-30T21:26:20.442Z',
            acceptance: false,
          },
          {
            recipient: 'e23b480df1ed7e4eea5d2891e45e610e6c4ec073466a9cf9175b0c956fca08b3',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '36ff5caaa1ba390c4632fd1be88efceeb087edd101c03fb9d79eab019c635290',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.791Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: '1A-2zyjxTuqRXcMgY1EBGQ',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-03-22T21:01:22.707Z',
            acceptance: false,
          },
          {
            recipient: '501d3ee2c9c2ab0b73c0eab71ac1782a0d5dd01ed1cd269e06ff4280b73834f2',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '8b77518458b27fb8319acdb3afc035873b01cb9f569b7d6253a9d54d72bf81f3',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.790Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: '5xLbxEsVRheG9E016k_EUg',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-03-09T02:24:59.699Z',
            acceptance: false,
          },
          {
            recipient: '159ce6953c9c5947ccfb0fe15cf10a63ca200e7f923d93f29ab09adc2a238497',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '347da6b3c8cb69c19730c77348f64cc3cfc5e9987440055f0257e2b37f718867',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.789Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'uSAktkfJSnu80OY2Kk7DIQ',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-03-05T00:40:27.901Z',
            acceptance: false,
          },
          {
            recipient: 'ad1c01382996e591b97aae25131cd30dc40663f9227bdbc0317fa171d5217e15',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'd72d2941ea7d021da9eb9230c29f3272f9ed4f6e8177d4e0ae647e0d4b21ca3b',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.788Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: '2IRxCAprQOq4TzylFBYsRg',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-02-26T22:49:54.603Z',
            acceptance: false,
          },
          {
            recipient: '2361f81c8877f6fe5d0e3868201143b5135f4e90488c42e8a5ce00a130292541',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'f1d24d49e49e0dec9947c1cb85c458208731e85fa81d1950bec476d71f817ca4',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.787Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'SsLM_KzbTqSXEQhFvSNxCQ',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-02-24T22:05:50.474Z',
            acceptance: false,
          },
          {
            recipient: '1501a3e5b4ab51908b6b61ce5678b8bba1d78753fb5c6e0291cca9dcd7f50223',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '242cfbf8bf87a6f58c323048bbcc4107494f557ced161d1240d48b6349e8cdf4',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.786Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: '21mU_ryOTlCJD_98m6_XvA',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-02-24T02:09:20.989Z',
            acceptance: false,
          },
          {
            recipient: 'e19176667094d0ca37e35694af3f5163062c8d7d9ec12e208dcc62a0ede8dfa6',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'e5193e8604c4bae22a57f28a057a846f3c3274ba8f85e9ae4cce8c24af5d3193',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.785Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'E7frIx-LQnuNtjAYYACeUA',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-02-23T03:28:47.552Z',
            acceptance: false,
          },
          {
            recipient: '59e819e72f8524a9fff0a51608441d07938b03cf2e5507ff741cdf267c69a52e',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '55abaf41118276aadc3288ef00c6aabbc5d1f462db404cd61df91143b7e0ec5e',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.784Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'dpbbd0DpQQmd7zOJZFNuCQ',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-02-21T21:38:08.019Z',
            acceptance: false,
          },
          {
            recipient: 'cf7ea2609abb11d738ef575a496a9ead1d905de8c0af23bf59c8e426979840aa',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'e6459944d3a2f6ca593c54e17721566f16d6a3dc18a25c077f7c51764efe3c89',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.783Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'mZ_Kc9sKRWm7biuj5g60Iw',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-02-05T20:42:22.756Z',
            acceptance: false,
          },
          {
            recipient: 'fa7ed221ad26eb3804a420eea525fb24376d4e3a807a32d7443e36b5cb59195c',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '39f4faf2d4ad882b2a76d5195956e1c5bb611b0a02cb3d0a0589390e35e917d7',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.782Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'GEIHFpbRSOOSRtOqggFP0Q',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-01-19T21:50:09.505Z',
            acceptance: false,
          },
          {
            recipient: '6d8f8516d2f2be67a9bf5bb09e7fd646b5afa8385eb2a585ea65656039abb11f',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '823314e8263485c001389573d027265a39a201f861572ed5131cc193b0bba1ef',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.781Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: '9NXWyMy7RaqeD5qSREv1RA',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-01-11T23:47:47.928Z',
            acceptance: false,
          },
          {
            recipient: '1ba6779a9a9a60bb7518d016101eb4497f7faf3a6bd2847a2267680cddac5f3e',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'cc5477f4f593001bdb56238709dbc0eae0b021697fbd8d26c602c25a3aa70d4c',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.780Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: '0zZBuyTpSgiyzRjIyzZLUg',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-01-11T23:42:55.741Z',
            acceptance: false,
          },
          {
            recipient: 'bef5d512f2036eadf0e1f077404935191782f5dbf989c0904c7aa81462e4fc4a',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '4cc3cd3b94f111aa0a09ae41e7371c7541607a1978dc76d7ce64854d79a94a17',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.779Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'GhVah-QOSIW1kI0ciyx_jQ',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-01-11T23:42:14.922Z',
            acceptance: false,
          },
          {
            recipient: '6b132d549e7ce3dde91c6b891a36adb9db9b80f68421ac0fe4f0479fde939627',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '0859aa19b9d0918a14c569d87df708415448e8043eb957bf4bcf97d2193e9d43',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.778Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'mlgGJsnNRumC-4Qw0PWFGw',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-01-11T23:40:27.033Z',
            acceptance: false,
          },
          {
            recipient: 'b85561e246ae49e1da9dde5231407b9dfd76780b0ceb9fe28b191ca9f7531dff',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '83540ff6bb10b495759506d0ca030e0377f8f0103afda148a5008b473a84ed2c',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.777Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'pdsP35IkRD-4UK2fRiot7w',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2021-01-03T20:30:34.975Z',
            acceptance: false,
          },
          {
            recipient: 'd16b81e378ac4082bdd3ac47ee9caf96c2b6cf00949220ee2a552b5236968b06',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '5b0c717fcd776697ca70cd21c473f0a2b1b31e09b315a5e1bb3c6d2215bcf2ee',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.776Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'wwDF3EMvRced19wpCSXG-Q',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-12-01T21:41:38.564Z',
            acceptance: false,
          },
          {
            recipient: 'd92986ff2cada80a8b849a9dae2e051983f427e2d65d1d08d973616fb832a9d7',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '39e779f38d7ac3c3e3574d4ed653afd53d92860d055b370dad9d345de11b8f17',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.775Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'Bhzuj_DCR86KkjP_dmUYfA',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-11-30T18:29:42.357Z',
            acceptance: false,
          },
          {
            recipient: '12a4a32016e9284f005639257523c6890728012e90bd3951c9f6ac80205175c2',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'd7fd40bd005911a819a9ebb870a75c707704adac5eacb29cfba8b2fc850e4b60',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.774Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'RfGya-ZcTB-l72S2NdCFyg',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-11-17T19:50:27.869Z',
            acceptance: false,
          },
          {
            recipient: '3c691f08d209a413d92a458f590d28c6c3063c276d6388166cda559f2b0d9015',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '6e78d9637d2f226d6494d6f603d9b7b5b6983ad242e60fe200c20decb3f8729b',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.773Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'rKLTF_5gQD-v8gaVWGfUdw',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-11-14T01:17:39.372Z',
            acceptance: false,
          },
          {
            recipient: '2776ac845da25673a015cd99a5d5e3f0c0db83b60ff8f2f3c2327e849b4625d2',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '3a77afca9b9c9363189d9b743ff1e979c525dd5524a5d55e3f7e297855989fe1',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.772Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'vR8qmVwnTgiAW586JwRT-w',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-10-30T23:31:13.211Z',
            acceptance: false,
          },
          {
            recipient: '1e0b211466b6e4ddb9036e199c7a17e1e84d92e6bf55a01fa3f4fe16aec23b6b',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'b82e54dfa9d4461257004498ba8d02a584b863be5a56e7cd2656eae93b1ff2d2',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.771Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'vbEpliqdQHCuM9GtP4MzWg',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-10-22T00:04:38.363Z',
            acceptance: false,
          },
          {
            recipient: 'e4acb361170876dbc0f63ae65380591b9de3a886a317166bb8ba02d2b657f58f',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '3e42af49e80987ba50ff1472dc44138c0e0cbc63257b2a06fac85ffcbf559090',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.770Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'swvIOCjxSeOFHBBhK7AHeg',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-10-21T06:30:24.278Z',
            acceptance: false,
          },
          {
            recipient: '7c097b72b0224ca429f9e07efa2ad2fec62c07ecfa32707ffec580ceec610f24',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'f99dfc97d70a7be20c2216d4a54a044ba486f9f2e0306d55831ceb4fd5a74453',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.769Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'MtekDq-KSqyRt0MKufO7IA',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-10-13T18:06:08.252Z',
            acceptance: false,
          },
          {
            recipient: 'dbb666976638d992cebab835b9b41bcd7376b0b8f417783d493d24d2ff31a25a',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '4ada1442f01caf69c55ea3101837861df63ba7193900a522342a04700bdf31c5',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.768Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'JRzH5whGSLm4Zz94Kob1qQ',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-10-09T04:49:47.479Z',
            acceptance: false,
          },
          {
            recipient: 'd6a41d46112b37f1d18470188970f53d78058341f9ee84fef8ce23d1c70a36dc',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'f79cc24fa61a9e1f453761ac621a48e04523d1557db748a4783bb8f5d91733e5',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.767Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'ryvc-B4GSYuY90vxUix_Zg',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-10-06T19:34:39.128Z',
            acceptance: false,
          },
          {
            recipient: '2a2f8431a983cbe136fb87cf1e73c2651cb394e36b9fb7a73e61d81846a17eea',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '4783011f7397734353e61c8bf5aea745a1a0c5e56552fbf1ba19b0ecc22e5b0f',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.766Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'rQf6mi8xSaya5-oBkmCrTg',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-09-30T22:55:41.245Z',
            acceptance: false,
          },
          {
            recipient: '5fb44c794495894703bd23904276c13d8577930b26b531d66caa33c1d66c92cf',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'abb47ceb0d280ac171d6b059e603215c2ccfeb932fc23f4296cb13f418e54c16',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.765Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'Mgi-NL6lQy2Kepb_OeMjug',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-09-30T22:07:16.373Z',
            acceptance: true,
          },
          {
            recipient: '1e580f048ed015d018aa60efc29fe7db02048795a6eb5165407803249e93a002',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '16c31b56f1fb11ae77ee1221b8600f70306dcedc2b5ea034c5d60dbc6939ad39',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.764Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'ii8huUdNQpSkQRVAvDYq2Q',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-09-29T17:35:20.018Z',
            acceptance: false,
          },
          {
            recipient: '8c46907e5b1857a3c85138695f4ea5bf3bf339d6a6245c94f2fc0d11ab327ef4',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'e7e5472bfa7f3b858f3bd43011d3f359f97a5c4029d641163c394b0914515396',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.763Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 't7UKOLGwReuTHcJuzHUyFw',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-09-29T15:45:53.944Z',
            acceptance: false,
          },
          {
            recipient: 'a902102081686ff7f1318393b72539412be1b277cf7c431eb91845df2676c2f6',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'aa23bb9edde166d70a89ac7995bad8657980256c2e31ba2a7b0aac32baf7bb06',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.762Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'mby3ZSSTQnSfkHTIsSdtcQ',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-09-28T19:14:17.439Z',
            acceptance: false,
          },
          {
            recipient: '331a9e3cab1b74d9093cd3e5f1f2d0f5025ed0b6c67748c8a71328fa55df9fce',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '43ff8ff09f387a298d05a2bb518ccbf6ba40c6f44942db3ba8f39991ce08363b',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.761Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: '0fn9YnmJS5-OeZV7wj2N0Q',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-08-21T16:09:51.549Z',
            acceptance: false,
          },
          {
            recipient: 'f9b11d734fda1b819b959d9d3677493f37b414ce3567921c1be33e15c5193f8f',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '7c82ce9c88055725f7b379b2af3c75a5634e0fcc3e9e6b1b91e650440fe3008a',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.760Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: '3J8UuTWhRWq-hk5lSo_6EA',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-03-17T15:38:37.170Z',
            acceptance: false,
          },
          {
            recipient: '2b0de94307b0dd80f2078ae1a72e6a6ef9c82e476c4f60b8738abec58c782cdc',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '41ba62054b4c51070a327ca8d3d76f9070e72f086a0dbc31d3b0a1feccb8b6cb',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.759Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'xMdstdDNRtONl-2DHG9zhA',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-03-10T15:14:19.989Z',
            acceptance: false,
          },
          {
            recipient: '78344651dcbe8b38071ab869430fa2b9df9377ab3ab32a05ebaba5e912023ae5',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: 'b8010ab9b31dd23fff193c4f3130bcc462507034ececc78493efe008d13b431d',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.758Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: '5ovdAphNQsCJFrltbLup0Q',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-03-09T23:01:32.472Z',
            acceptance: false,
          },
          {
            recipient: '731bb72206dc7570702ce2a27b21821d6de73595eb5ee4a4187b57c910f052c8',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '4e0a41021a3e979ffa77c1a9ded38f9035bf618f6393ebe79f080a76f5906fb8',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.757Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: '0KiANn1ZRUSRaDOp-KLjBQ',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-03-06T19:39:26.828Z',
            acceptance: false,
          },
          {
            recipient: '1032ab0dd193a53877d9936faaa5b13022259bc8b1858e53d96fc44341f429c9',
            expires: null,
            revoked: false,
            badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
            revocationReason: null,
            _id: '5a1e5ca17b40075ab65ae5d91dcb6a15a3b69ccc29e0b2325673c19d918ae489',
            _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
            _createdDate: '2022-07-13T15:14:16.756Z',
            badge_desc: 'WOOD101: Woodshop Tool Best Practices',
            _updatedDate: '2022-07-13T15:34:23.164Z',
            badge_name: 'WOOD101: Woodshop Tool Best Practices',
            badge_tags: [],
            title: 'BTCln_RgQ5yWd2jYAFu4ng',
            badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
            issuedOn: '2020-03-06T19:39:21.533Z',
            acceptance: false,
          },
        ],
      ],
      intersection: [
        {
          recipient: 'f7d87d469adbafb9b469fc8e47bfd579b4d3b76fff2f7e20d77bb927de0e12fa',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: 'b3d2810440151194c5a48b7e30d8b9d433184393cb8b4a5c557c1f7b072819b7',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:17.016Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'lMFBZhiORU-aTraWVW0RPw',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2020-03-06T19:37:39.113Z',
          acceptance: false,
        },
        {
          recipient: 'd117a17c0722f73db300dab741f3ed27a51a3d379f74448e2bd8c91ad75d8e75',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: 'bc91c58e7f13b58c387ae00ae6246a099442ae4e679b9ba05f82742cb58f4de2',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:17.015Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'IyAlSGLcRf2TFMtfAIouaw',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2020-03-06T19:37:20.803Z',
          acceptance: false,
        },
        {
          recipient: 'e8605a1621d81a5f8df21d2efecdfa4ce3470ad5d599ce1692430cbf2000047e',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '9863dea37a6e2686875a20b050add173180959acd478542da850933b99dec9b8',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:17.014Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'CcOJedUOQi-Oid2YIuDgfQ',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2020-03-06T19:33:18.013Z',
          acceptance: false,
        },
        {
          recipient: 'c0d7a69f130daed380f2bfee1c0bc9d02b9cdbb6ac1a9f5969ebdb6f692076a3',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '16c27194954dffc710db368c04f205b669d0f7b939d1ecdf0a26c30e52ec75dd',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:17.013Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: '7_2ozk-GRUuBsX1RsF_Gvw',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2020-03-03T20:49:13.102Z',
          acceptance: false,
        },
        {
          recipient: '360394e7dfac76e09b351d4c16b0bc104b94ded9e5a6119f73251e31754bab81',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '82932ea67625969d41001906480330f10165aea96e636fae8dfeb1483c85b065',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:17.012Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'dpj_e3heQPmqqe6RpwoZTg',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2020-02-26T23:51:50.554Z',
          acceptance: false,
        },
        {
          recipient: '77c050fbd22cceea8c200a1c6677ae6737e6d04bd6976515c5ab9941c41d7834',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '8b51e079108f389cca833052235f9bb64331856e69800c427c5c980d26a74760',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:17.011Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: '3MrdRtJCQnmVbUPaQGJcZw',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2020-02-13T23:24:16.190Z',
          acceptance: false,
        },
        {
          recipient: '69e87966d1115dd5bdad06ab6b339530793447fc0352afb2c2dc83754e4b8967',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: 'd6d3e8ad51af3a61dcbda7514ac85863a9331c4eba33411e677656c27e584497',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:17.010Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'xid-brqTTAKkNREllwis2g',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2020-02-13T22:46:29.533Z',
          acceptance: false,
        },
        {
          recipient: '9034dc88e29dcc8bbee013a19673d6ab306da74480dc3ba2c068a1f2f450ade5',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '8aa7f2e1dd6442772f8a72749d1469894c9360de0fc0b691d431ae76b48944e4',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:17.009Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'cSRzBRFARwClszDpyGcg8w',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2020-02-13T21:57:29.938Z',
          acceptance: false,
        },
        {
          recipient: '5c181bd1d6c43564904ecbfc778dd2795982b6a8f6217dbd1fbd85a528466549',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '6ca1704bfebadef135ce64fb6a3b300ed79325b01884e55f1b5dd6146b27aa83',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:17.008Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'FZYx1HzaRhSBFtBXnE4NNQ',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2020-02-13T21:56:17.074Z',
          acceptance: false,
        },
        {
          recipient: '57af096c1a86e892087eb55ba2a838b2383fa07655ff19a0535c40880524fb53',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '3c58f7f63d32f9da64b67b293dc10dd77333e749133bb56a027cc41e571753b1',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:17.007Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'fFmcV_YpT4qHoS0Z8wI7gg',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2020-02-13T21:45:00.359Z',
          acceptance: false,
        },
        {
          recipient: 'bd74d72f9cec02813219c189ad06f8dc09e12a58744b53d3719801c6131de8dc',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: 'cb061dad4f94872eca63f46d3543a7d3a6feb589526fb682e24cace09434fa77',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:17.006Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'yypnvFmBSAa7IbG--kK3cA',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2020-02-12T00:08:41.394Z',
          acceptance: false,
        },
        {
          recipient: '5fbca90c0ba4e82553cd411aae3297e4ae4e206196b424812271b186ce88e1fb',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '2161177fa51633395c1657116b7fdfee44ff2ddc323bc9483adfe51a6a30c803',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:17.005Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'QrkKg1W2T6iku-5-G3QEnw',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2020-02-06T19:18:55.754Z',
          acceptance: false,
        },
        {
          recipient: 'b123435a90c73ec22508e81a9061d958ceaa782f57b0741a39736945a1ecc7bd',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: 'c49b48d2d991baaf675b98f3e7a07efd975250abae6234dccd7fcb50a7403ea3',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:17.004Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'VUm4spQ3QBiNdBQPqXrCWg',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2020-02-06T16:52:42.162Z',
          acceptance: false,
        },
        {
          recipient: '447b2fc64f0fc8cc85b9d28bffe3233b0d59ddfcc366d509c2cb5c4aa64e029b',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '4b28c9ef46fcd911133c30faa628c848bcb020fd8064a76e79c6ebb44f25f4e7',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:17.003Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'K5YavI7NT-yrmKeZ_e-5Tg',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2020-02-06T16:51:27.082Z',
          acceptance: false,
        },
        {
          recipient: '2f59e9c1823585068aad6a1be3493870170447c7a9688867228a104cc382371f',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '35ffa9eed81e8898636c479fd8ec938f7c054eea5fb58908ac8e21c4c6ffb708',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:17.002Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: '0ElyoZTLSfWoOPeo4qt23Q',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2020-02-05T19:05:40.260Z',
          acceptance: false,
        },
        {
          recipient: 'c53d478393e3b42ed3b78d4c646b4b490c30bc30dc6b5b095c214293b98abbf4',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '03da9fa914a6d91456725e6bcd8edb6a58ba81317fdc5802455f99436de85e25',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:17.001Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'gswhei4tTCKi-t-ZcntKwg',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2020-02-04T22:08:14.458Z',
          acceptance: false,
        },
        {
          recipient: '6a02be11bdf166a12848370a4ccdec06b6eb413c4a0d2d3e2beb56c6183ef106',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: 'd0289b01e18d6fb609c6f78fab8ca9cdb69f90ff25888649e8c4e548e05eeca3',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:17.000Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: '0nLXmmanRvuYdFTPKDhM7g',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2020-02-04T20:41:02.632Z',
          acceptance: false,
        },
        {
          recipient: '94ecdf28081556fbc545dac96f545e6d5a61d80f8852947bed969f919719dbb6',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: 'fa7e1ad4e618394ab1297f0af660eed25da17c5380f395a1fe9884ccbc2e11ca',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.999Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'B8VvCkpmR4idVxFrcN1I1g',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2020-02-04T18:40:32.988Z',
          acceptance: false,
        },
        {
          recipient: '515aaf23f4674078a4c099244f0667f51dffa70896cc3437a0cb268dfba694ca',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: 'e4be347fef3c5f06d61b0cd2f748be46ce00ff31907718dde217a0c596bee178',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.998Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: '2fAKbOggQd-juKvuySCDsQ',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2020-01-29T23:15:58.244Z',
          acceptance: false,
        },
        {
          recipient: '58048080333d4396a26931981b82f618cb4895be5eb98e8e4b2132992043a40b',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: 'c82dff2c8c2691bf4d1fd9043eb0fdf328d03f52b19d9a42d8f4ce851b1b2211',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.997Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'mDHFZReUTXGJaCR4FJchWA',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2020-01-29T01:34:01.804Z',
          acceptance: false,
        },
        {
          recipient: '6dfb90347dc11e52fb473ef3be97c143d97eb91831938067fc385efc81abf904',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '7997bd11c333fec1e9282a7ca5baf962ad539832f8c794e2bce2ec147853bad0',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.996Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'x9tJzkb4TmqbtRufCVdtUQ',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2020-01-23T23:33:15.646Z',
          acceptance: false,
        },
        {
          recipient: '0fbaf674c2c0323b61db9ad6cbdda1af33e9dabb40d35899b40b24b4852cd4fa',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: 'ad3bbf7e644d272703ea6babefb308602d75903f6197afaca550e0b374db5459',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.995Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'RKN2kQ9BTYm3QFYyMN416g',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2020-01-23T23:29:24.141Z',
          acceptance: false,
        },
        {
          recipient: 'dbb604f4d3a09a6d57b71417040467069f54cf56c298f4a0940d2cb5fe4664b5',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '49d01e139ecd6f33c12e6c5cf37cd6646ebf2d3a41db305a5cbff1334158677c',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.994Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'Rr_ACazLRZqQgo6p98PeHw',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2020-01-23T23:29:01.044Z',
          acceptance: false,
        },
        {
          recipient: '29ae43e5cca9b94fe1c22c5c8c0f0d5778c4a2b8356cda9b22badb59479135e2',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: 'f6c455915f38af7c66134b22a2e4269ea28e01fb0abf81c86ffc6ef551e2e052',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.993Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'g_U4S7TuSr-eYfc6hgk2qw',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2020-01-23T23:28:21.854Z',
          acceptance: false,
        },
        {
          recipient: '6da1b60ab3aa7ed8d0d919f028bdd86fe75143e9c9680b7f64a750841623f53a',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '30b30a33a79de728d01758adb0517aa9bd52f987505f1049ed1916e3d7063aad',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.992Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'iNqLP0BqQ96uygAQSavudg',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2020-01-23T23:27:56.529Z',
          acceptance: false,
        },
        {
          recipient: '09c84a4fe6e3dfc5ffa240f3e88f9925014bad151cacf8ff8a34609de8d36dd2',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: 'ad96a306c8aa5c1d6bc388c959d80f0eb1389f3e712795973c6e5cede1bb140d',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.991Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'zsHQFogVSFKFDYb9H7DitA',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2020-01-23T23:27:52.121Z',
          acceptance: false,
        },
        {
          recipient: '826d4842bfd8eb9b2c17f47c4972243fc1b652fe6152a7d1f794328fd8791602',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '2e475e3ad2e40c03809a0a060939069d3fcca85170c022b3660c6b958c2b5a88',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.990Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'UENdqtIcS4inqpVQvliJ4Q',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2020-01-23T23:26:01.243Z',
          acceptance: false,
        },
        {
          recipient: 'ae1716f8a821cf6420796c88ebb3644497923a653fe0ba483290c09c54f7f824',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: 'f72a9d95943fc761d1728f09509105fbffe92942d1c831f02273b27211768b06',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.989Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'T2aqIIOvSOuPUMlijpdPNQ',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2020-01-23T23:24:59.896Z',
          acceptance: false,
        },
        {
          recipient: '045770fcd4e67cdc3b7468c0babed2f7ef170db2e243e039604f9addef487626',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: 'c3b1f2de8a96d2b1b6e3e3123b7a7b9f93d8cce2520fd19ce8390e57ea0f406a',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.988Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'XNQAb0NyTFWpLntuwfablQ',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2020-01-16T19:38:37.415Z',
          acceptance: false,
        },
        {
          recipient: '479d3b44e993b1baa58d309eefda18ea302cc78f36d43efbd593d63431df7a05',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '3d679444a340e74f91f6bf282df6a1517e5dd70d781dd7f78b528f2395cc8bc9',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.987Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: '2oORr4qORVeF_FOEZwRdww',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2019-12-17T22:17:10.610Z',
          acceptance: false,
        },
        {
          recipient: '5d7a5e25e26a92b9db1bce4996b033a3b3cc946bc6ef64da502bf4f0fc6397f6',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '52fa8505c41666212179d81400e67c0531d1435c9c1f85948d9206dfe49d2e10',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.986Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'iGRuUSuQSV2_ycz-2ejlGA',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2019-12-17T22:16:14.450Z',
          acceptance: false,
        },
        {
          recipient: '30c3afd5fb936c3bd7070377973d9b1c1d2433a847f2038f4b92846163b229b3',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '579a576ff1a3473e141431dc754462fbebd0daba3d6a35bdd68f2c40500a211b',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.985Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'tjR4Hq5FQ3mWoqCkr93qNg',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2019-12-09T20:31:06.310Z',
          acceptance: false,
        },
        {
          recipient: 'b16551433035860a1ccf9aada4842eb044f3dd8fa8afb808b4be130ffe8a385f',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '803d0dc6934040f85fa3cf16299f21b95a266fe306910e842d9016271fa9cfaf',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.984Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'sCgdktsASy66dpaa2XtSLA',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2019-12-06T21:30:22.966Z',
          acceptance: false,
        },
        {
          recipient: '4c380955fdd7f43f159c8878d3746518592809d34811b39a77ba3fca17ed946e',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '8e6ecadbdc878f11ed7c0fd873d7dff407cabb98a65e11a1b4263c93e9f20c19',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.983Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'yAtP1ORkSPeMPKOMLEEBhA',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2019-12-04T21:44:30.249Z',
          acceptance: false,
        },
        {
          recipient: 'e6df68705ebd0c8fd89cb0dcc6227fba4f103028c0f30c2f8c5e1648a95ee398',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '18a8f1665db3d99820dcb2c4f31f8100dc0801c3e9b471fa9d148187064571d6',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.982Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'VZc5iy4fTBSybxC0yZheaQ',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2019-12-03T22:54:23.560Z',
          acceptance: false,
        },
        {
          recipient: 'a8bf7599ac277a4de7796394acdb70339395dac1e9c6ef2243535efd39fde26a',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '8ed326055a80569241888dd5b6d71dd3b4be77341a85f0d2e3037fbf65101e1d',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.981Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'eFI3F0PATfe_uKML1RkdMw',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2019-11-22T00:01:44.505Z',
          acceptance: false,
        },
        {
          recipient: 'c0efac5d3c5bf4c58c0290189f3ff6cb451e24c1cca2d1bb9844c0ea8f8b7709',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: 'fce330fb6c179a9639a1188eb6b8ebd7251f854b839b9b873ae1bf296e02d160',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.980Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: '3kPGF6o0SuqC6S1WL99CVA',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2019-11-21T20:19:17.911Z',
          acceptance: false,
        },
        {
          recipient: '639668a88351ff0b41f9abe5ee7d1bc1848c2b87c0cdca34055d3f406bd72c4a',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '7c090dc18dddc2e2c16a8bfdc502165a3af31173c0a01023553d27b9e0b51d5f',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.979Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: '_nOR79GtTCWQz7utoGbg5Q',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2019-11-20T22:08:35.840Z',
          acceptance: false,
        },
        {
          recipient: '6c75d189dc66331ee7915c090de94b98b9a96b2d7f0301c52e05476a8d90527d',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '2e7a9f705fec8bcaa152c1eae419d3d08e5e3aec3cb283263cf0b6764fa0d8aa',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.978Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'KIdOekUDSdSFqAAZr-jdFQ',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2019-11-20T01:33:31.862Z',
          acceptance: false,
        },
        {
          recipient: 'c1f9986031af4a008a4cb51142aa8246743cf5c2d9fc1ca69eae38946d32e8f5',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '25d281c99ce0bdeaac1bcd902bea34829b9f006c0ebe037220d41c7bd42859da',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.977Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'fOP26mPNTNG83wnI7IWQkw',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2019-11-15T19:58:02.661Z',
          acceptance: false,
        },
        {
          recipient: 'f9cbb0218d056e5ef44780bcdb1b822085c4e335969a0d678ac302c84937b120',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '5c21038332d76f147066b973f66a337497f3284fa4591900e7006061fd476226',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.976Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'iKCr3ig_S3W28J7tfMLNVw',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2019-11-05T23:03:28.276Z',
          acceptance: false,
        },
        {
          recipient: 'aeb24c16f7eebe752cc22b706079d0d2d5ffedc8c6be4ff80111912f627090d9',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '193010a7e9c37fb3343a869d46d71447e8b2a41268a21b4b3ccfdce9cb139e73',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.975Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'jJ1QaiMATPmr0hOl3aHnqw',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2019-11-05T22:11:56.065Z',
          acceptance: false,
        },
        {
          recipient: 'd500bb28be6c8399ce7b3ad5c0aeb93ad6c11ba563de02e846417d4ab291b986',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '03d456cb09cc948cd56226446fa003168269e53dde267e6e0d0afff89fe5a519',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.974Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'FtPJNDT7SGGEyKZe4FsowQ',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2019-10-22T21:32:06.072Z',
          acceptance: false,
        },
        {
          recipient: 'a0dc1f51b56ef6a88405c2c992b820415f236404d6d1a8b71b3a14cfe60db41f',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '92977190285bc7fd53dc52e0f5cb204f8e63b77cda3356a13852a0a5dda0cd4e',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.973Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'x-I7ebYeRb6grfZknOclPQ',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2019-10-22T20:56:28.693Z',
          acceptance: false,
        },
        {
          recipient: '3b95176cc26b87780b122ef841ca8096a5bc6b2859607c7ba28aef2805949785',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: 'cf073258d803723ed960f910341c51f6766a7efd8e495130f1135142b1953f4a',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.972Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'jDdGSETCSl2wpdOlqhJpYw',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2019-10-15T23:19:14.743Z',
          acceptance: false,
        },
        {
          recipient: '3c12a3ceb974a36e8083aefc36da1c3e1019b921c2ddb0c4d962f7261cc4ff0e',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '655e5e74c8b1c6f525060f0e76f0a4d453482a9685c76ca367e14f5b8705053f',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.971Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'So65U8hRQUeuHzjlzniKxQ',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2019-10-10T22:33:06.993Z',
          acceptance: false,
        },
        {
          recipient: '2459fe4390beeb55792227e0c0732ecbb75702c2624890619e3d7051aba1fc27',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '615a8e9e2685b53b7d22a3fa09da216488a34a09d43fff4a7d1fcb7035bcc601',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.970Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: '5Uc-ftbdRHumtWK2G_7jcg',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2019-10-10T19:26:10.388Z',
          acceptance: false,
        },
        {
          recipient: '06861ffff51b781c1310e31e9a1fe1a94c18aaf0aa1c099634e1382fceec2950',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '98cd8b4adf0f8e67c41988d7e118711c8abe82fd7abf458331a4efb073be2e40',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.969Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'TqGlxYruRseGIgAn0-X4Kg',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2019-10-08T21:44:44.387Z',
          acceptance: false,
        },
        {
          recipient: 'e0bb01a278013c9fb38356e27a43de27dc79937fed2af69d9647853b1634760b',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: 'c1637f3e25faee21e0453aace296c508b33e8a84bdbf40f2a6c1be8bf62e14d1',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.968Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'UYpBIbT9SvOfeOah8HsSiw',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2019-10-07T19:29:23.486Z',
          acceptance: false,
        },
        {
          recipient: 'fc2b76b10e583fea71f07083f6526ee8a6f9c30c09565a723cbd7e18fd3f1cad',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '3f46b94c4cc97fae41e49e660704f5c8df8158f3ba996eafd169dba3212a5e0d',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.967Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'wNug7M4UTQWZ_eicHZzsiQ',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2019-10-04T22:57:13.881Z',
          acceptance: false,
        },
        {
          recipient: '502eaa19472e5f9574a8d8efa736672f2bc7c4635d9846c57aa95e54103ae80d',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '49012badbc45c20c77f49d63f9742f480622a45b806b9ceb3f3b135fb9df9e45',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.966Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'VW8zYajuTbK-SjoP6L8LyQ',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2019-10-02T17:13:33.183Z',
          acceptance: false,
        },
        {
          recipient: 'ed170180d7cb23cd750227eea88971bec265d49c8e61f2b159997567e11bbba1',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '5af51ecf31b92584c934167ecefcc45f10266c2ce646ae84e87de91f9e17ed9f',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.965Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'mrg5EpGhTZWJAOsy3kkluQ',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2019-09-25T14:32:35.390Z',
          acceptance: false,
        },
        {
          recipient: 'cd96281e4c3ede1ead8dd517b23d1f6961bd2fab50e2d8732afc89e9d9cf5d18',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '6f0ac1fd38053bcce5c482f600cf41e8b96279ca457cde41e8fc12466888672a',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.964Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'm76ulBvQQ7K6ys_yNS4UkQ',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2019-09-23T19:52:36.257Z',
          acceptance: false,
        },
        {
          recipient: 'bd137e4bb0f04ad78e014698a1570b83576dfa4b301ca3687672e28ec2d53202',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '91bb998902a4d2f2883ebc7e957fea69ad6987a603bf1c68c7d3c6f1785475b3',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.963Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'PquJphS3RVC3MsEMQEf0cw',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2019-09-18T00:55:08.299Z',
          acceptance: false,
        },
        {
          recipient: 'd0264be6c2605b0993db77ccfb321431d935ae5ab1189f89b80b612e94b90209',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: 'fed88c2445292ce4ef53b5670d9cbbd77a3b7a40d8548532867fbddfaac7edf3',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.962Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'jAhmOFRKQEecpLIdZa8wMw',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2019-09-17T18:28:46.082Z',
          acceptance: false,
        },
        {
          recipient: 'b7466bd85ef513f2230c27fac980ae098bb8637f461122594a26a674793aa497',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '874512586923d46772056dae9ebf99310eac9c84c71d056cb383e7711e45a5e7',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.961Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'E7rHSB1GRnGHsozhPgv-0g',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2019-09-13T02:20:40.777Z',
          acceptance: false,
        },
        {
          recipient: '2b638a5f759a15f21d45b130f1a5586d36f27efca23f0c26c1a47dcfdfa05939',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: 'ccc80745d4b870ddd9afb32da9a3bc602fcdab5f209d8e11b4ad6eac014a14dd',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.960Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'uJwGpoypSjqcwflwMEmLRQ',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2019-09-13T01:44:34.007Z',
          acceptance: false,
        },
        {
          recipient: '2dc7f741a14de3275c681c5e61fba9988476c74f50fec9ff4d92ab57bb98ca04',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '1362f02ad3dfd542119970becbfd372e03ff4acc3932c89476e997d2d86d5b39',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.959Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'RalJznG5SfWuMRmkDVKV9Q',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2019-09-13T01:39:33.532Z',
          acceptance: false,
        },
        {
          recipient: '048a247497a755f937ea10680c7fd9843145f90fb01dd824eb6b27c5905cb21d',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: 'bfac37d74c03a31d21db5dec50b4b5b748be5cd332a0f7773a632f76e901f330',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.958Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'DjRwWqc5TmWfVXlNkAlTIw',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2019-09-10T17:33:33.692Z',
          acceptance: false,
        },
        {
          recipient: 'c0e0c7734ec4999da3da4cb6d6e9e030e7de20a16415862adfa7634ba78f5f8e',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '1d6ed12740e05dcf02f9992e162423b0d4e1605216d4b9592c957b700dfb7b8e',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.957Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'yh6WZ-mqRlS03YVL-oeRYg',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2019-09-06T22:57:51.398Z',
          acceptance: false,
        },
        {
          recipient: '366ef0a3e3b653882c7af0f12b110b78f6406ba432aebcb80d4e4b0458c947d9',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: 'e915369e4004cb2eeaa28ab9295079f571d8beab6e45647ed61f2c32a8793e82',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.956Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'KBEXrbs4QVGFkarvAvnTZA',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2019-09-05T19:45:01.081Z',
          acceptance: false,
        },
        {
          recipient: 'b4e6ab18a5047b2f966c7963b776a582868fd7e6294705a46df00e8860272199',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '255b219a83b5b9f85afa5671cfb002f801bf2b19da80ba26dd5c5efaf65ed959',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.873Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.599Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'rUlXAkXXSDSny1f9ZnQ1cQ',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2022-07-12T22:18:46.433Z',
          acceptance: false,
        },
        {
          recipient: '88d0949a39caccd5ffd34547e623cb890e05450f5b78525c820865a1b92da2bf',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: 'e79e899749c8f1ea80a2a9b496cb379384d221eae6027976ae131a7cc3e5e62d',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.872Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.599Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 's9uGRuwVSB2uSdChnjD15A',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2022-07-12T21:56:27.187Z',
          acceptance: false,
        },
        {
          recipient: '1cafa8783be6148185d72b057d308324ef1ec44aa596ce2314f12690caac4d33',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '5256a82d940443687b0970b97a1b7ab608ab171b048a583f5a8254e1a88f3b1c',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.871Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.599Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'jw7iLZwcQ36I4u4ExR6-CA',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2022-07-12T21:23:33.448Z',
          acceptance: false,
        },
        {
          recipient: '3b418b4a2c69144a6306b46d10d7dba3f1544b70dfcb8b7fba80e90ea23740cd',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '751e7e29fa1103e575686ec20731a1b0965761bff417e0a57bed61e00f30c3b7',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.870Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.599Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'iG-bZOXaSuaQED7FWy4fYg',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2022-07-12T21:17:23.781Z',
          acceptance: false,
        },
        {
          recipient: '53915ccda32ed005bd09946466c2145363079bef7415a17c580d65472ae53b9e',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '51c7f0feaca19b359541c751261d5595a8d8b88491d342a255d160220205d08a',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.869Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.599Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'ebwuX_NvS4ucw20qupI_8Q',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2022-07-12T19:35:44.887Z',
          acceptance: false,
        },
        {
          recipient: 'e28718cc7333dca4c36f94af7e0508ac71daaeacd48919ea9efd2c4cefbfa813',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '073ee3ce74f974f403e6ea7bc0df0a79426f3000b35c91610e88d75545424686',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.868Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.599Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'SHnXecoZSVaBuzlqIYb7UA',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2022-07-12T16:27:44.572Z',
          acceptance: false,
        },
        {
          recipient: 'd6299c027b208007bc8b303879dc8b02604ee5f12a42ce76c77402887f8fcb83',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '5ea9976b4665754c39f828c2a99f59afe716e250c2978255c0f4db51b011b046',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.867Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.599Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: '7cCsRcCmR5yYV7A-c7HJ0g',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2022-07-06T14:12:13.171Z',
          acceptance: false,
        },
        {
          recipient: '58635f945fdc12e380591e0338d41afe4a822e43d9ecc300edccb24f91aa6dc3',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '1221737bdaa064a32467852ab2a98e7644c458a7f2388f21d45ec2b96dd6c963',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.866Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.599Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'mSYEYQICSL6vJZgzsrZmiw',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2022-06-23T17:59:44.811Z',
          acceptance: false,
        },
        {
          recipient: '152e852adf89218b3cfcadf3166c1dc0ed41e5d26304c3a010cd2e0daf937ca6',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: 'ae9dfebfb8a0fe7f5ef85f8e0621642c3c44b14c6b42b174e9de10288a6939c8',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.865Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.599Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'NLQJ8v-FQ4aLfWKtsrcfOA',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2022-06-14T22:50:44.929Z',
          acceptance: false,
        },
        {
          recipient: 'ad1f828500fc997e428186178eefb44260f98fe518701119e2b58fd63f8f8d15',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: 'b0dbb101d67c86412c9f595e238635c2ae8e3b3d3c04d559333b9e003b7b07da',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.864Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.599Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'YkXVmegvSAO3clKxYVScZA',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2022-06-07T23:31:27.835Z',
          acceptance: false,
        },
        {
          recipient: '011312eaae303408cabfe8e65809cb7cd6bd888e63277c75ee756ac71dda667f',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '3237118a97e1d2761f9651cfe81db94842596925e16d03b9868524c3cc2a7328',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.863Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.599Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'QK2mkEWwRUue2XSerj1d-Q',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2022-05-26T03:26:48.744Z',
          acceptance: false,
        },
        {
          recipient: '7cc9fa8a732fd15353d3fa7e903b81d903f08a027f76482d352b3ef221f10e03',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '9eab0e465ed4d555d604a955de6e4fe34d5417311cc9c5c4ccfe4fd986b5375f',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.862Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.599Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'pyQ6NrDwSE-d7OTH3RzQjQ',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2022-05-24T16:01:41.950Z',
          acceptance: false,
        },
        {
          recipient: '939f3d3fcb313413d63c40d9411822590296259ee63eba496bd9e98f997245ba',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: 'fad95281645bd6b46767d7bf5eaf5198b3db3e1f3d38a7ec99d65c34d46ee34a',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.861Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.599Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'Z2KFJ0WoSye-sV1sI3TpnQ',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2022-05-24T15:50:18.222Z',
          acceptance: false,
        },
        {
          recipient: '14a0877a1408abe87badf4df98d13ebd5dddd67fe3c3419e6e14cb2ef9a2a5b7',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '886c703c65ea891072fe8d4e9da3e026b5e7972d8e4eb1a7b5541b1f8e977df5',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.860Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.599Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'lV6bCRpaSF6QRXsONbOm6g',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2022-05-24T15:21:50.663Z',
          acceptance: false,
        },
        {
          recipient: '5fad49105d488eac07873e7980c31255d470638eeaf61bea5ec22269000c78b8',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '48f1822072f09dae6f28a8ce04fb888f4456356e4ae5321fc7caaa54869b54a6',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.859Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.599Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'sr6gXBa0TzKfw8PYO7JYlg',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2022-05-24T15:21:02.278Z',
          acceptance: false,
        },
        {
          recipient: '1a511bba3d2c682f1a260f414e6136e8b9c13e4351f86e4d74c46fdce8aace5e',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '17d52b5d125ab211acec29afc39b57746dd641d6178a82343a443aeee4bb912e',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.858Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.599Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: '63eYQcDzR2GWWkMI_n02_Q',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2022-05-10T06:04:20.579Z',
          acceptance: false,
        },
        {
          recipient: '662c6c3aadf325ff7a731b0fc1c43e47455ae0afa5c0b8eb2581238f4208ce25',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '32c43a35d394f698949be646b1ab196df3c052e0019da835a22162610f257cca',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.857Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.599Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: '7_u0-r0_T2CT-W1bO7Ll4Q',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2022-05-07T22:56:15.445Z',
          acceptance: false,
        },
        {
          recipient: '930c67836a96c87f619b8b63e7fa488da8d25df9db27adb394d0ba5e2490729c',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: 'ed4248dc7fa608d2a42d42f517efde6dd122ef5b9575d1541ad32acf0a3a3dcd',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.856Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.599Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: '2N4AZ1xTRUqf7k5B1kXPxw',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2022-05-06T15:01:03.573Z',
          acceptance: false,
        },
        {
          recipient: '9960f2b1327d284ce10ddc3a0d087fbbafc94dde998c7af20d83db29caf5e902',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: 'fe5f64637ed4d07b1788b7eef9d510afc2589dc0801cb7e1725edbc4d988a899',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.855Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'JtKasa3ASDqt89_OA67B-w',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2022-05-05T18:23:41.255Z',
          acceptance: false,
        },
        {
          recipient: '209be0060d01facdd894eff9d36aa20200cfd8f2606cdc48646a028a9102dc1b',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '7a44cbcb7f6ab4b775f4cc94788aa0de103ae723d8280e8c0464e87776c99b0e',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.854Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'MvVh85zIQOCcWh8KN6U43g',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2022-04-28T21:19:27.213Z',
          acceptance: false,
        },
        {
          recipient: '482aa3aa703fdfc28d9bb0c4d6a5783c66f32af2125e62e95b7d8db0df849f82',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '7d60395a90527b73aef5dfb47c793d5279ad4b32534501198507fa38e579f79b',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.853Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'PY5SJaI7Qa-NVAz4y2JRSg',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2022-04-19T20:12:13.983Z',
          acceptance: false,
        },
        {
          recipient: '9166770cf016adba61e6778e99f34f8f36b31e75ff2931a7694c2081bb713d91',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: 'eeac6515f8439fcaaf58f2fcfdbda1d0cd7bbfb132b44a634a08d329ba376202',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.852Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: '6--0KBTSTeqPMRjqm-jR9g',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2022-04-08T05:35:06.449Z',
          acceptance: false,
        },
        {
          recipient: '2ae70c6743865ff34eda4794866279e9f37bb009176db8f2074e023e32472157',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: 'd5276f9b92c435ad379a26fa685862744e50d96f0cd187ca872e5f36eb7e28c4',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.851Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'vvhhlB5pQuaSUfkAVLpYsA',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2022-04-06T21:56:26.922Z',
          acceptance: false,
        },
        {
          recipient: '5606936353fb700cbcbf3516ed6f8a59616386ae54e9d85afeb89986a34afc2d',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '1019dc51a12e8f6aec93cea7c1f91e8e9cbe826241bd71fd56830df90d6a50f8',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.850Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'TLj9Itx7RBmhfhquZflBgg',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2022-04-05T15:07:52.124Z',
          acceptance: false,
        },
        {
          recipient: 'ab0cd17319d70694a0bdf1c37b3658901636e7be1d287728c57c8f7cc0c7cc93',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '092741d3ccbd0ab9ecc8ef3a0b60c3ca635288e5f9b889ba76103fc568ed2b5a',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.849Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'kaAWUbD5RcWu606GjCGaRA',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2022-04-04T23:55:39.740Z',
          acceptance: false,
        },
        {
          recipient: '1282b7378296a76ed89ea64539f71c3abda69f8c28ef97d7dbfcde18bcceb891',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '325be2aed4cff918a29a1ae30a3578884f0cfa3213f330a34eccf69c8bf81daf',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.848Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'eVPYW-G4RemZhsw8-O6IqQ',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2022-04-04T17:25:44.743Z',
          acceptance: false,
        },
        {
          recipient: '2a3fd0d693d53ea5cf825d7c25a6e2e414336a05046638466531ac831c346370',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '757d158308e4d1e4f312531f8855146b6665de44d39233cb52f556dbb46d9752',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.847Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'tY5qDfimQWeW21htKWxhcg',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2022-04-02T03:48:24.138Z',
          acceptance: false,
        },
        {
          recipient: '85f41af5577a2887db11c03b0c504ed9dc80ec4178c358aeb33a348cb6f324bd',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: 'eb79486d6205d844674d0c59dd136844aa01f0f2ba8088460e01c01f385e2d3b',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.846Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'hBAaOBk2T-2LYFTR0FcGaQ',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2022-04-01T02:42:00.608Z',
          acceptance: false,
        },
        {
          recipient: '6ce53a3c97c4f42747ecf25b090319129e8140f2022d32f51ab1cb4737ad3e68',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: 'ebfdc556dc245ae82e4432d672c15ff068335a2dde881a2ac2cbfeaf3dd6be8b',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.845Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'AXInrmWKS3uNG0kP_685BQ',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2022-03-28T22:56:56.827Z',
          acceptance: false,
        },
        {
          recipient: '9a9fa556350703b2281f4ddb04bf242cef15cbfab3eba711b31369764fbd65d9',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: 'c474272d199c889792d4204234615a3ebfa27b23fe4cf9d4b800eda9272cef1f',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.844Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'Kh0a3nkCQDmohMAZzYe-yw',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2022-03-25T18:35:28.240Z',
          acceptance: false,
        },
        {
          recipient: '9a7fa3f4363ba4160deea5d32a67b706cb5a709d2504bc6c6f057b65dd31946c',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '0c8a2db657f1eb92b7bfaced9df29b91fc6d5f1fc38c0f5f816a2bde7c00158c',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.843Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'rwDWA_k-QduaFQWa3Kqdsg',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2022-03-24T00:28:25.775Z',
          acceptance: false,
        },
        {
          recipient: 'ccf392a78d3624ac702ff1acac0b38a13d0b94f0569bd2d1e09dda8b9408b3be',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: 'c485f88d4315f54022fb929f9837060ecf5690e63c512533dd1bdd722b8e6ae9',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.842Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: '6VAbV-lRTpOWz-Wwc62Rrw',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2022-03-14T11:48:31.069Z',
          acceptance: false,
        },
        {
          recipient: 'f9866acbcc6f2e4b1a231cda15e012cceb16a2952715e3850f305b80f239f59b',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: 'b7f722bcd53496c0a6d2a0b6a4a8ca1790506f52938df54b77f23b48d03247b7',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.841Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: '1I3ZrZHQQY6dgW7eCeH5NQ',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2022-02-15T17:36:46.461Z',
          acceptance: false,
        },
        {
          recipient: '7c097b72b0224ca429f9e07efa2ad2fec62c07ecfa32707ffec580ceec610f24',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: 'ba1d68b3e3ca1d61e090a61b8e10622b345b04b2a2c3edb0dfc0cc1a508bf7d3',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.840Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'j_TJJm6uSzGLwHIYVi6MuA',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2022-02-12T22:46:45.275Z',
          acceptance: false,
        },
        {
          recipient: 'ed349ffdada0ce35ddc5afb6d75eecdb130c6e6aeeae1ae8c8fa1edbda03433b',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '110d9f931ca13526c9691b7baae55ef88d4c278dd66020c67b628e164b215b9d',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.839Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'vh3JtPA7Q6WHGWB0jkGUpg',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2022-02-08T00:45:42.560Z',
          acceptance: false,
        },
        {
          recipient: '98fd378b3cd4df89b539a9e0fefed36f41822fe092e0b2f66316ea284e760409',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '33ed18a3555bd9422abd7c7e4c524381df63df0ef9227ef7a90b06be1371eed0',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.838Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: '0XFa0iW8QaygzSrPJeBGhw',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2022-02-03T10:36:44.259Z',
          acceptance: false,
        },
        {
          recipient: '76199206e97e6c8f6be69dd332295db9b3277fa993a7860eebf09111fcc3b553',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '1ef3b4bcc543d341c5556854a694c1c9c13c289e17b4945a6955d0035168c9d5',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.837Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: '2ZeRQR1gSPaEbfJ69kqQgA',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2022-01-03T15:37:31.050Z',
          acceptance: false,
        },
        {
          recipient: '104dc0050e602ea3ed68992f3667be2fce2c9e4e129d4b4596a610873c83eccb',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: 'e31670e6f8f19d145bec105a7a53dda7acdaa34f77d6dc552a84d050e23b980b',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.836Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'TLejdkCmQROy1ae0rRk4nA',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2021-12-08T15:32:14.826Z',
          acceptance: false,
        },
        {
          recipient: 'e25c4475ab21725375b2e6a3d00e91b2dfc9e9ac90f8f911f5851dcb59d28d03',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '8c0881a4a9ba777c16764dc87abaedac3b372953ce27a6105d7dcd7c7a75e405',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.835Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'LolrJRstTHiZX14d_qWMOQ',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2021-12-07T05:23:33.299Z',
          acceptance: false,
        },
        {
          recipient: '92d5367373f637b2c5d74d8e4c65a2b0cb845c430093c25e7089d5b2f27b1586',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '96f1580bf6af7764da4459e252f39b2f9e9a00792ec751a7cf1be55c0be7b2fd',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.834Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'oEguNCJnRfOxMAZTLNHFFA',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2021-12-07T05:22:42.255Z',
          acceptance: false,
        },
        {
          recipient: 'b2ab460870286aec67dff24db1f778df8e833945f51e842ee343ec92156be9db',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '6e32b50cccafad572e27d0c047f60116806753e0e283ca5dab7b406fa7154993',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.833Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: '-3jDWIgFQ3qqCrqXQpZbrg',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2021-12-02T00:45:30.366Z',
          acceptance: false,
        },
        {
          recipient: '271c9d0077fa501bccf89e31d4b42cfbfa5bea10c6481184498a9cd73f7a4d5d',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '7059160a0840f187efdf9297ef06267e68745afe828304d3aebed07e6d5720af',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.832Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'NxeORx9JSGayIPyzojquhA',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2021-12-02T00:42:29.619Z',
          acceptance: false,
        },
        {
          recipient: '405400a37610da02468a446ca1a5616776ba3cc6bf1ac6a498ab6d9f9823f964',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '294053160ab7ebf8a535b283e9d6824ebb9b7d37b18b094ab627a92dbd149c38',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.831Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'U485NcMURPKg0MrFHbV5ZQ',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2021-11-29T23:06:28.749Z',
          acceptance: false,
        },
        {
          recipient: 'a0dc1f51b56ef6a88405c2c992b820415f236404d6d1a8b71b3a14cfe60db41f',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '5c6cf8def0adc10f1af750c13cce9d9cd372a601a0e7339d44d7f42210d336a2',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.830Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'qozYnAbsSDeZPfDd-5Wmzw',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2021-11-18T05:28:14.443Z',
          acceptance: false,
        },
        {
          recipient: '9fd539a66d2c2b4b557b6438d40e11efb3cdc54affa3733a47e9a31796053ffe',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '7af237ff3f861e5f325ae19601cbe6a63bb438f33bf3beaaa006d5ba8e8553a9',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.829Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'aJTymA-iRa21p40FilbZNw',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2021-11-16T19:01:17.000Z',
          acceptance: false,
        },
        {
          recipient: '0b6d5f0b2bf60b79addb43fcc47bdd652442ad28cfa3f7b7ffc843e4bf58c332',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '74bd787233aaeaf27c846e0293c61d031db2543f50c663af7cdafcc0fdf93f6b',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.828Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'as9bhTTdTROVzzkmP-6xNQ',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2021-11-09T17:57:58.216Z',
          acceptance: false,
        },
        {
          recipient: '6e3a2bf2095f6ea587dfb459d59fa728cd1cd458fd58fde77b0fd1e0a665b944',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '4a874da3035a26222ba039ec34486c5ba2cc3cae593d450a995a18c9b330e967',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.827Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'vntJnX7fQ62S-eexnm-3MQ',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2021-10-26T02:07:58.970Z',
          acceptance: false,
        },
        {
          recipient: 'ee877da8a815211cfa90f2d8bb7f7f08b76448ddd46761a0af45c34da5e371a6',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '96f3460ed1c4300dc5949bc9ff33aa0202500fb3778b39d9a2f6d27ba6de13d0',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.826Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'TBZ82sizS0-UjHD3Ypj10w',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2021-10-21T19:25:02.125Z',
          acceptance: false,
        },
        {
          recipient: 'f2169678a1063b2c95f5490f6065d92280cd463fdf3943cbc3cb67265d5bb11e',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '439ec3c048a6ad87096036cb0fa7b57824e5744fdcf0450fcfb3469dd0a5128b',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.825Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'ECBT7TiyS9mB3wLw-uN8ZA',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2021-10-20T23:32:57.171Z',
          acceptance: false,
        },
        {
          recipient: 'f91f7564c66daf09e075e04a72aeb455a9b3555b64700341cf34975608bac6a0',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '993c3b403492306eef7a7dae6efec56c3a3704412bac6c512ec028f6bb571b05',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.824Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'VDR_pQqVT2mdmqf5Kizyxg',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2021-10-20T23:21:35.711Z',
          acceptance: false,
        },
        {
          recipient: '464b73897fd18940eed86877e03db539de7b836efaf192cb490f05684ea43e92',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '9ee5cbdb3567d4d44590e2e5dca7176aa1c71df48ff5a53e31130c573672450b',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.823Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'aNFABCwdTPKSz-edlf5aXw',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2021-10-14T15:31:50.087Z',
          acceptance: false,
        },
        {
          recipient: '9afa7eb05338819eed1760e057d17f50c050dd21af375b97258492d8a0ccf293',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '4248045dbbfd209d706336f659c8cca8144752fa38941fcfcbb03852aa7ba45b',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.822Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: '2PoPXEEQTUmdJFTBfplrGA',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2021-10-13T00:02:01.845Z',
          acceptance: false,
        },
        {
          recipient: 'cfbdb9299cdcd8193c8c21b439381ac1fbcd43407f98b0a175849c7ca6b7ecd7',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '3cef5c6e8ef149e0e2890d05e526a9f12e5907c2fe44a92dfb46145607ec8561',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.821Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: '0EGzTZohTXatqT8aa8JNqg',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2021-10-07T04:32:44.443Z',
          acceptance: false,
        },
        {
          recipient: '3363cbc56de7f3ebdf8c5f5eb831e70f45d75824e3d1b1c8ef1f3c68316be237',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '64bd3e955fa105a9a42c1720f4e213302907f8d5f4be23af5622028e6d53ed8a',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.820Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'Vzyo_O6RRZyLQadxqoXTxg',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2021-10-02T03:09:13.121Z',
          acceptance: false,
        },
        {
          recipient: 'c3c3551c2fd3bb78a4355c1dd6ac6912d70fad53c4d903ee92e8c8a2d98b68fc',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '0dc9e0ba1cd1257f63f6ec0b9e388e41c41a4d6fdfc07d797d69f83167e89999',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.819Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'im9uFcx4SJSwRvBLielAiw',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2021-09-30T22:09:51.867Z',
          acceptance: false,
        },
        {
          recipient: 'f34efd61d00abedaf4899aabe360e9dadb8ecd8ae38758a9aee1cd98b89bf5fc',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '2004a1570ba4275ec650926942d7c5d15eafcb66e4189f812e82d0f5520a2045',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.818Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'youli9_hQs-HEX8yd0r6pg',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2021-09-27T22:11:43.511Z',
          acceptance: false,
        },
        {
          recipient: 'a39f65c1ec148faa84038adc5938ee00806453029c07bce58bd3b3a92c01c507',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '7d5fe6671c5cede1e551d4058276f2cdf8f96bb00d8340de009b90701325335f',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.817Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'y7bYcViZTsap-qkmy68_CA',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2021-09-22T23:04:23.526Z',
          acceptance: false,
        },
        {
          recipient: '61864c99fa92089cc90a0a09ae4002b0e9086dbb6a406ad40ca08576f06338be',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '6a95941b5e6566a564c46f604009dff3039f88096dad9609039902c3830cb207',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.816Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: '4NGdfGRvSxK2rTMYfyb3ZQ',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2021-09-17T01:29:57.274Z',
          acceptance: false,
        },
        {
          recipient: '757ca5ea06ebab7f4050e66b5e5d2e84796d06ac6849bfbbaf21750ef7a00d49',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '883a9f5c0eb2eed6dec3dbe2f5e7a83ceeb4b2094394e296effd02ab6f97ef62',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.815Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'gQOWfaCVRaGZkKljtudF3A',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2021-09-15T14:11:43.252Z',
          acceptance: false,
        },
        {
          recipient: 'af575f4caf7c54d8979bf7b13dd144225da3b63a2fe6e1a7484f61bcbae77137',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '0caf9df25bbe1d96a48da5d49f4ac6b57aa753f1d16885d03984d26a673c0243',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.814Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'OWjFYnuaSz2YnnM1pkT0cQ',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2021-09-15T01:38:25.293Z',
          acceptance: false,
        },
        {
          recipient: 'd6ca5dfcde00ce453a64fdf16062c6a5995ac45e53a3db71f28ee8b611007c46',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '668f17263ea57c93276e644593e6d0c431a9438cafd1a7fdabd0833a6ecf343a',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.813Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'wNBBzXXeSRyCbfE_VGoh2w',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2021-09-14T22:54:09.642Z',
          acceptance: false,
        },
        {
          recipient: '1bf29cc940e60df0a5da15618493731eeeedc2aa005c6a4934c3b4da6fd6c187',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: 'eee98c3dc3cd5868e5536b31c1c442d6e13e3ecdd6f715d7c003050b89591bd0',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.812Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'Vu2mJikQSyuVwuzzkr3bBg',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2021-09-08T23:12:38.682Z',
          acceptance: false,
        },
        {
          recipient: '0aca4cf26b5b46d13f34e8bb21f028cf0fa1375e247ca8ed2642bf73e42dcbe7',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: 'd543d32693e4989f580efdb8b383e5d60d269fc4a72ad28bf495f2ec6bf9c28e',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.811Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: '4kpL5la1TXmj6vf5SGfDdQ',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2021-09-08T04:27:20.949Z',
          acceptance: false,
        },
        {
          recipient: '5eca960c54d393779e00ad4f2cdc069a8187ef3e0374e31f7488e808c8af044f',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '6be095b8bcf028ee846d5fcceb22a1953a68c0b1d0722e489201cea24a6c67c3',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.810Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'Bz_jYktUS1-3PERsx4XNkQ',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2021-09-04T22:35:16.790Z',
          acceptance: false,
        },
        {
          recipient: 'aa1c6c35c0631b725c1fc8e576e308d90d303952391de56c835a71145f709b99',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: 'd53826d56edaa8ad7ed52e20073b4a622204f97f4e05246dfd0cdbe9007e6b6e',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.809Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'e2CEaU0-QK2pSMmivTR71g',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2021-08-31T22:45:57.923Z',
          acceptance: false,
        },
        {
          recipient: '98d30a97c2a5d0569b390747e555d054caa2d37fa647093a3c5a294236208c11',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: 'd7be64b5e81d1da8c2fd4103a6b6d580197e770f36a4f03099b6131fe20e01a5',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.808Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'fkxYXJZfQ8Wk9nCUiWrw0w',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2021-08-26T19:48:31.261Z',
          acceptance: false,
        },
        {
          recipient: 'c5ca5ac475189799e24211f13b35135123a665d977ea9db6fcba1253b9744312',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '3d0d2e021d8262823d46514f5b21b8b74c938c2be1c3c7343a5d9ace49c4e389',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.807Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'Cix52j-ASgKdhsuTH6ILVA',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2021-08-25T23:04:03.681Z',
          acceptance: false,
        },
        {
          recipient: '08adce212ff7a531f488e283f84aaf99473cbb90b07ddd9a4a1424e9863ac731',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: 'b3be3d16f99404c0a3587d6b27f9062b267b5efe9c5da3b0b15ee7b867bdf152',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.806Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'rCidz6vAT_eCG886-H2Vjg',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2021-08-19T18:38:10.316Z',
          acceptance: false,
        },
        {
          recipient: '265a75b161282b96f15e1aebd93139059ded5643f9b06aba6cf459fd63faf63c',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '5c0cd456a454b77be716a54b6f7f21d3e47b70f6b713d5632111cce7bd2a6dad',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.805Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'KazY7U8dR96n6ZcR2fz8WQ',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2021-08-04T16:10:18.673Z',
          acceptance: false,
        },
        {
          recipient: 'd658d9689241f75c7b47f4e219fe611daa3ed7d3cf8453438c515834efbaa6c2',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: 'e4a8f35cb3ffae711fa46bd385e60ee0ba2b53e378e4fe706ff9b76f6641a8e0',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.804Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'xQdsC8iqSQqToA2uCP1iMA',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2021-07-31T00:24:58.988Z',
          acceptance: false,
        },
        {
          recipient: 'd92365e0edff561d9efb0a60c95f9bb893a620605d44a1b66c4639a87933ca84',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '6746d3ca004ad015817a527e1926c669b2a33d0c83b72fa53e533749c9c93a20',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.803Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: '9QvXJ2guRE6lAx99zUNwpg',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2021-07-31T00:24:39.658Z',
          acceptance: false,
        },
        {
          recipient: '2363d939c0970f217ac2eaca57e2284d9aea869e2fd5949d5d2ad2cfa9265115',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: 'f8632e9b026e071e3b42c783af6cf6aed4e49da423abfeca77b56cef737879d5',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.802Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'OwwS4oskTMeYPsqoy3XfLw',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2021-07-15T22:22:36.618Z',
          acceptance: false,
        },
        {
          recipient: 'ccc8a5580d23def0c721c28c163c90eb41999395caa68ca7dab497862a58e912',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: 'dead3b9dcd64d3f9843d583f2f083439530c1c7d338a8063550144f66adfb0c3',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.801Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'PWJaVaYsRUKpxgp-rQtBtg',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2021-07-02T05:04:18.902Z',
          acceptance: false,
        },
        {
          recipient: 'c07a20cc64cabd2787b70b58047cd17b7107fcc8467e6787abbed4e6834982c9',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: 'b720976768a16ae5ac679722bcd43b2e7dc16ef521217fc8cd36394faebc2704',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.800Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'S1OquBpuTD6jpT5ZArYyVw',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2021-06-07T20:34:24.476Z',
          acceptance: false,
        },
        {
          recipient: 'b4783a646b9b5d2856569dd86aa5b24737d6b9859c683f81ab6576a3090004c1',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '168ab932e205d897f739bef7bbd2763211dc36fba0b9ae418df64004d77a7b54',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.799Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'QBYeLE8mTpeyl7A12Jp_DQ',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2021-06-07T20:28:12.882Z',
          acceptance: false,
        },
        {
          recipient: '29dc58e856c216ef26d793e7a6bc80aaf32677885b0ba9b40f3d9ea1974c150d',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: 'bfe06b8d5fa084d7db2d16fb39dea2763381afcda36bd32774fd2a423f5bdb1e',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.798Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'rXm1s4ltTXS2AJEIxSeXZA',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2021-06-07T20:23:29.240Z',
          acceptance: false,
        },
        {
          recipient: '5048774c8732848621222b3c28b7f790b8da6347f8f95d32863940483245dc33',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: 'bb534662e07ea5a41f6cda261fc8682e9e20f43842a2712539ceda9341446ad5',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.797Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'Htc6yIZJQ-yHehOCcUrrMw',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2021-05-13T12:58:35.753Z',
          acceptance: false,
        },
        {
          recipient: 'ce8ba8ef7f701c4c10eb380bd97720c7a52688acaf3232b37b3fc3635e4f1fa1',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '67b335d2844f102884a0150d56f6bda0d8f0b0c2d2a8e2928b88358b25ce6a0f',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.796Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'GmPYPRdpTXmj9lHMQBmbFA',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2021-05-06T19:46:40.587Z',
          acceptance: false,
        },
        {
          recipient: '425c067510dd4d39a8658e31fcf948458da97a26d89d7e459f30f9d5b9950d3c',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '79a2e6ac328847f2408860a88f10b968bd3b317752541470376d5cdbaa6bcca9',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.795Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'qCTtw6DnSPStlKCIzw-GEQ',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2021-04-14T23:44:08.570Z',
          acceptance: false,
        },
        {
          recipient: '599eeba3cb2a172ed4a0776c482b01d8fa080a5ccd70b81ee9284febb75a6b87',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '4e39bc2ca20b53364d48c6f9fd4c0e9bd15c14371f9b4e1681b787ecff20f095',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.794Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: '9Sqez9M_T3uThL0BuqsXNg',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2021-04-09T23:13:00.489Z',
          acceptance: false,
        },
        {
          recipient: '16915f910d2e2b890b6a6fa7200d3947ad3498c7dcd7364dfcd9a4a8c5362d85',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '99ca4a98b75a19cf0a3b5e801aea3fd7f49a8e8d6802b48619d4750add572643',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.793Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'gwVTXG0ISpGAYsqPvUhexQ',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2021-04-05T20:42:44.560Z',
          acceptance: false,
        },
        {
          recipient: '58349ce96ec2fa114e0d079d571109179ee4a7e0527c5974db8e758175af1aab',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '9e096c6a3cba71addf9de8aa527032bc3bb6796b72e6446e99dc6b3fe0888257',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.792Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'YnLcBEd2QJKlRvb9RXF9Nw',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2021-03-30T21:26:20.442Z',
          acceptance: false,
        },
        {
          recipient: 'e23b480df1ed7e4eea5d2891e45e610e6c4ec073466a9cf9175b0c956fca08b3',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '36ff5caaa1ba390c4632fd1be88efceeb087edd101c03fb9d79eab019c635290',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.791Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: '1A-2zyjxTuqRXcMgY1EBGQ',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2021-03-22T21:01:22.707Z',
          acceptance: false,
        },
        {
          recipient: '501d3ee2c9c2ab0b73c0eab71ac1782a0d5dd01ed1cd269e06ff4280b73834f2',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '8b77518458b27fb8319acdb3afc035873b01cb9f569b7d6253a9d54d72bf81f3',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.790Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: '5xLbxEsVRheG9E016k_EUg',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2021-03-09T02:24:59.699Z',
          acceptance: false,
        },
        {
          recipient: '159ce6953c9c5947ccfb0fe15cf10a63ca200e7f923d93f29ab09adc2a238497',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '347da6b3c8cb69c19730c77348f64cc3cfc5e9987440055f0257e2b37f718867',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.789Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'uSAktkfJSnu80OY2Kk7DIQ',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2021-03-05T00:40:27.901Z',
          acceptance: false,
        },
        {
          recipient: 'ad1c01382996e591b97aae25131cd30dc40663f9227bdbc0317fa171d5217e15',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: 'd72d2941ea7d021da9eb9230c29f3272f9ed4f6e8177d4e0ae647e0d4b21ca3b',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.788Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: '2IRxCAprQOq4TzylFBYsRg',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2021-02-26T22:49:54.603Z',
          acceptance: false,
        },
        {
          recipient: '2361f81c8877f6fe5d0e3868201143b5135f4e90488c42e8a5ce00a130292541',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: 'f1d24d49e49e0dec9947c1cb85c458208731e85fa81d1950bec476d71f817ca4',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.787Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'SsLM_KzbTqSXEQhFvSNxCQ',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2021-02-24T22:05:50.474Z',
          acceptance: false,
        },
        {
          recipient: '1501a3e5b4ab51908b6b61ce5678b8bba1d78753fb5c6e0291cca9dcd7f50223',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '242cfbf8bf87a6f58c323048bbcc4107494f557ced161d1240d48b6349e8cdf4',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.786Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: '21mU_ryOTlCJD_98m6_XvA',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2021-02-24T02:09:20.989Z',
          acceptance: false,
        },
        {
          recipient: 'e19176667094d0ca37e35694af3f5163062c8d7d9ec12e208dcc62a0ede8dfa6',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: 'e5193e8604c4bae22a57f28a057a846f3c3274ba8f85e9ae4cce8c24af5d3193',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.785Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'E7frIx-LQnuNtjAYYACeUA',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2021-02-23T03:28:47.552Z',
          acceptance: false,
        },
        {
          recipient: '59e819e72f8524a9fff0a51608441d07938b03cf2e5507ff741cdf267c69a52e',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '55abaf41118276aadc3288ef00c6aabbc5d1f462db404cd61df91143b7e0ec5e',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.784Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'dpbbd0DpQQmd7zOJZFNuCQ',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2021-02-21T21:38:08.019Z',
          acceptance: false,
        },
        {
          recipient: 'cf7ea2609abb11d738ef575a496a9ead1d905de8c0af23bf59c8e426979840aa',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: 'e6459944d3a2f6ca593c54e17721566f16d6a3dc18a25c077f7c51764efe3c89',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.783Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'mZ_Kc9sKRWm7biuj5g60Iw',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2021-02-05T20:42:22.756Z',
          acceptance: false,
        },
        {
          recipient: 'fa7ed221ad26eb3804a420eea525fb24376d4e3a807a32d7443e36b5cb59195c',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '39f4faf2d4ad882b2a76d5195956e1c5bb611b0a02cb3d0a0589390e35e917d7',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.782Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'GEIHFpbRSOOSRtOqggFP0Q',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2021-01-19T21:50:09.505Z',
          acceptance: false,
        },
        {
          recipient: '6d8f8516d2f2be67a9bf5bb09e7fd646b5afa8385eb2a585ea65656039abb11f',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '823314e8263485c001389573d027265a39a201f861572ed5131cc193b0bba1ef',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.781Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: '9NXWyMy7RaqeD5qSREv1RA',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2021-01-11T23:47:47.928Z',
          acceptance: false,
        },
        {
          recipient: '1ba6779a9a9a60bb7518d016101eb4497f7faf3a6bd2847a2267680cddac5f3e',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: 'cc5477f4f593001bdb56238709dbc0eae0b021697fbd8d26c602c25a3aa70d4c',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.780Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: '0zZBuyTpSgiyzRjIyzZLUg',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2021-01-11T23:42:55.741Z',
          acceptance: false,
        },
        {
          recipient: 'bef5d512f2036eadf0e1f077404935191782f5dbf989c0904c7aa81462e4fc4a',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '4cc3cd3b94f111aa0a09ae41e7371c7541607a1978dc76d7ce64854d79a94a17',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.779Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'GhVah-QOSIW1kI0ciyx_jQ',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2021-01-11T23:42:14.922Z',
          acceptance: false,
        },
        {
          recipient: '6b132d549e7ce3dde91c6b891a36adb9db9b80f68421ac0fe4f0479fde939627',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '0859aa19b9d0918a14c569d87df708415448e8043eb957bf4bcf97d2193e9d43',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.778Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'mlgGJsnNRumC-4Qw0PWFGw',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2021-01-11T23:40:27.033Z',
          acceptance: false,
        },
        {
          recipient: 'b85561e246ae49e1da9dde5231407b9dfd76780b0ceb9fe28b191ca9f7531dff',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '83540ff6bb10b495759506d0ca030e0377f8f0103afda148a5008b473a84ed2c',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.777Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'pdsP35IkRD-4UK2fRiot7w',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2021-01-03T20:30:34.975Z',
          acceptance: false,
        },
        {
          recipient: 'd16b81e378ac4082bdd3ac47ee9caf96c2b6cf00949220ee2a552b5236968b06',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '5b0c717fcd776697ca70cd21c473f0a2b1b31e09b315a5e1bb3c6d2215bcf2ee',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.776Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'wwDF3EMvRced19wpCSXG-Q',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2020-12-01T21:41:38.564Z',
          acceptance: false,
        },
        {
          recipient: 'd92986ff2cada80a8b849a9dae2e051983f427e2d65d1d08d973616fb832a9d7',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '39e779f38d7ac3c3e3574d4ed653afd53d92860d055b370dad9d345de11b8f17',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.775Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'Bhzuj_DCR86KkjP_dmUYfA',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2020-11-30T18:29:42.357Z',
          acceptance: false,
        },
        {
          recipient: '12a4a32016e9284f005639257523c6890728012e90bd3951c9f6ac80205175c2',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: 'd7fd40bd005911a819a9ebb870a75c707704adac5eacb29cfba8b2fc850e4b60',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.774Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'RfGya-ZcTB-l72S2NdCFyg',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2020-11-17T19:50:27.869Z',
          acceptance: false,
        },
        {
          recipient: '3c691f08d209a413d92a458f590d28c6c3063c276d6388166cda559f2b0d9015',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '6e78d9637d2f226d6494d6f603d9b7b5b6983ad242e60fe200c20decb3f8729b',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.773Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'rKLTF_5gQD-v8gaVWGfUdw',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2020-11-14T01:17:39.372Z',
          acceptance: false,
        },
        {
          recipient: '2776ac845da25673a015cd99a5d5e3f0c0db83b60ff8f2f3c2327e849b4625d2',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '3a77afca9b9c9363189d9b743ff1e979c525dd5524a5d55e3f7e297855989fe1',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.772Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'vR8qmVwnTgiAW586JwRT-w',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2020-10-30T23:31:13.211Z',
          acceptance: false,
        },
        {
          recipient: '1e0b211466b6e4ddb9036e199c7a17e1e84d92e6bf55a01fa3f4fe16aec23b6b',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: 'b82e54dfa9d4461257004498ba8d02a584b863be5a56e7cd2656eae93b1ff2d2',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.771Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'vbEpliqdQHCuM9GtP4MzWg',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2020-10-22T00:04:38.363Z',
          acceptance: false,
        },
        {
          recipient: 'e4acb361170876dbc0f63ae65380591b9de3a886a317166bb8ba02d2b657f58f',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '3e42af49e80987ba50ff1472dc44138c0e0cbc63257b2a06fac85ffcbf559090',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.770Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'swvIOCjxSeOFHBBhK7AHeg',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2020-10-21T06:30:24.278Z',
          acceptance: false,
        },
        {
          recipient: '7c097b72b0224ca429f9e07efa2ad2fec62c07ecfa32707ffec580ceec610f24',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: 'f99dfc97d70a7be20c2216d4a54a044ba486f9f2e0306d55831ceb4fd5a74453',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.769Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'MtekDq-KSqyRt0MKufO7IA',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2020-10-13T18:06:08.252Z',
          acceptance: false,
        },
        {
          recipient: 'dbb666976638d992cebab835b9b41bcd7376b0b8f417783d493d24d2ff31a25a',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '4ada1442f01caf69c55ea3101837861df63ba7193900a522342a04700bdf31c5',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.768Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'JRzH5whGSLm4Zz94Kob1qQ',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2020-10-09T04:49:47.479Z',
          acceptance: false,
        },
        {
          recipient: 'd6a41d46112b37f1d18470188970f53d78058341f9ee84fef8ce23d1c70a36dc',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: 'f79cc24fa61a9e1f453761ac621a48e04523d1557db748a4783bb8f5d91733e5',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.767Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'ryvc-B4GSYuY90vxUix_Zg',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2020-10-06T19:34:39.128Z',
          acceptance: false,
        },
        {
          recipient: '2a2f8431a983cbe136fb87cf1e73c2651cb394e36b9fb7a73e61d81846a17eea',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '4783011f7397734353e61c8bf5aea745a1a0c5e56552fbf1ba19b0ecc22e5b0f',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.766Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'rQf6mi8xSaya5-oBkmCrTg',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2020-09-30T22:55:41.245Z',
          acceptance: false,
        },
        {
          recipient: '5fb44c794495894703bd23904276c13d8577930b26b531d66caa33c1d66c92cf',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: 'abb47ceb0d280ac171d6b059e603215c2ccfeb932fc23f4296cb13f418e54c16',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.765Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'Mgi-NL6lQy2Kepb_OeMjug',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2020-09-30T22:07:16.373Z',
          acceptance: true,
        },
        {
          recipient: '1e580f048ed015d018aa60efc29fe7db02048795a6eb5165407803249e93a002',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '16c31b56f1fb11ae77ee1221b8600f70306dcedc2b5ea034c5d60dbc6939ad39',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.764Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'ii8huUdNQpSkQRVAvDYq2Q',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2020-09-29T17:35:20.018Z',
          acceptance: false,
        },
        {
          recipient: '8c46907e5b1857a3c85138695f4ea5bf3bf339d6a6245c94f2fc0d11ab327ef4',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: 'e7e5472bfa7f3b858f3bd43011d3f359f97a5c4029d641163c394b0914515396',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.763Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 't7UKOLGwReuTHcJuzHUyFw',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2020-09-29T15:45:53.944Z',
          acceptance: false,
        },
        {
          recipient: 'a902102081686ff7f1318393b72539412be1b277cf7c431eb91845df2676c2f6',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: 'aa23bb9edde166d70a89ac7995bad8657980256c2e31ba2a7b0aac32baf7bb06',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.762Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'mby3ZSSTQnSfkHTIsSdtcQ',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2020-09-28T19:14:17.439Z',
          acceptance: false,
        },
        {
          recipient: '331a9e3cab1b74d9093cd3e5f1f2d0f5025ed0b6c67748c8a71328fa55df9fce',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '43ff8ff09f387a298d05a2bb518ccbf6ba40c6f44942db3ba8f39991ce08363b',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.761Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: '0fn9YnmJS5-OeZV7wj2N0Q',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2020-08-21T16:09:51.549Z',
          acceptance: false,
        },
        {
          recipient: 'f9b11d734fda1b819b959d9d3677493f37b414ce3567921c1be33e15c5193f8f',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '7c82ce9c88055725f7b379b2af3c75a5634e0fcc3e9e6b1b91e650440fe3008a',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.760Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: '3J8UuTWhRWq-hk5lSo_6EA',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2020-03-17T15:38:37.170Z',
          acceptance: false,
        },
        {
          recipient: '2b0de94307b0dd80f2078ae1a72e6a6ef9c82e476c4f60b8738abec58c782cdc',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '41ba62054b4c51070a327ca8d3d76f9070e72f086a0dbc31d3b0a1feccb8b6cb',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.759Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'xMdstdDNRtONl-2DHG9zhA',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2020-03-10T15:14:19.989Z',
          acceptance: false,
        },
        {
          recipient: '78344651dcbe8b38071ab869430fa2b9df9377ab3ab32a05ebaba5e912023ae5',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: 'b8010ab9b31dd23fff193c4f3130bcc462507034ececc78493efe008d13b431d',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.758Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: '5ovdAphNQsCJFrltbLup0Q',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2020-03-09T23:01:32.472Z',
          acceptance: false,
        },
        {
          recipient: '731bb72206dc7570702ce2a27b21821d6de73595eb5ee4a4187b57c910f052c8',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '4e0a41021a3e979ffa77c1a9ded38f9035bf618f6393ebe79f080a76f5906fb8',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.757Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: '0KiANn1ZRUSRaDOp-KLjBQ',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2020-03-06T19:39:26.828Z',
          acceptance: false,
        },
        {
          recipient: '1032ab0dd193a53877d9936faaa5b13022259bc8b1858e53d96fc44341f429c9',
          expires: null,
          revoked: false,
          badgeclass: '578ba495cf12e0924a089177c041ed2b7ce6357b401ba76f0a971c2d2880bd9a',
          revocationReason: null,
          _id: '5a1e5ca17b40075ab65ae5d91dcb6a15a3b69ccc29e0b2325673c19d918ae489',
          _owner: 'efc4ce76-ddb8-48d3-9c90-a42d71fdad3c',
          _createdDate: '2022-07-13T15:14:16.756Z',
          badge_desc: 'WOOD101: Woodshop Tool Best Practices',
          _updatedDate: '2022-07-13T15:34:23.164Z',
          badge_name: 'WOOD101: Woodshop Tool Best Practices',
          badge_tags: [],
          title: 'BTCln_RgQ5yWd2jYAFu4ng',
          badge_icon_uri: 'https://api.badgr.io/public/badges/Y16XmATmQFei-9VMlOIl0g/image',
          issuedOn: '2020-03-06T19:39:21.533Z',
          acceptance: false,
        },
      ],
    },
  ];
};

const pioneerProjectAppCss = ":root{--cap-fill:blue}:host{display:grid;grid-template-columns:1fr 1fr;grid-gap:calc(1rem);grid-template-rows:repeat(auto-fill, minmax(calc(100px + 1rem), 1fr));width:980px;height:100vh;box-sizing:border-box}.section_search{grid-area:1 / 1 / span 8 / span 1;background:#050108;border-radius:15px;padding:1rem}.section_selections{grid-area:1 / 2 / span 8 / span 1;border-radius:15px;padding:0 1rem 1rem 0;display:flex;flex-direction:column}.section_selections>*{margin-bottom:1rem}.helptext{grid-area:helptext;text-align:center;color:white;font-family:Helvetica, Arial, sans-serif}.helptext a{color:orangered;font-size:0.8rem;cursor:pointer}.helptext a:visited{color:orangered}";

const PioneerProjectApp$1 = class extends H {
  constructor() {
    super();
    this.__registerHost();
    this.__attachShadow();
    this.subSets = '[]';
    this.searchLoading = false;
    this.test = false;
    this.modalLoading = false;
    this.modalFinished = false;
    this.showSuccessMessage = false;
    this.searchResults = [];
    this.courses = [];
    this.contactSubSets = [];
    this.modalOpen = false;
    this.handleAddCourse = (course) => {
      if (this.courses.length >= 4) {
        return;
      }
      if (this.courses.find(c => c._id === course._id)) {
        return;
      }
      this.courses = [...this.courses, course];
    };
    this.handleRemoveCourse = (course) => {
      this.courses = this.courses.filter(c => c._id !== course._id);
    };
    this.handleClearSearch = () => {
      this.queryResults = '[]';
    };
  }
  showSuccess() {
    this.handleShowSuccess();
  }
  addCourse(event) {
    this.handleAddCourse(event.detail);
  }
  removeCourse(event) {
    this.handleRemoveCourse(event.detail);
  }
  clearSearch() {
    this.handleClearSearch();
  }
  emailIconClicked(event) {
    this.handleEmailIconClicked(event);
  }
  //listner for button press to toggle modal
  toggleModal() {
    this.handleToggleModal();
  }
  // closes the modal if clicked outside in dimmed area
  mouseTrapClick() {
    this.handleMouseTrapClick();
  }
  openEditor() {
    this.handleOpenEditor();
  }
  sendEmail(event) {
    this.handleSendEmail(event.detail);
  }
  handleSendEmail(email) {
    // this mutates the emitted 'send-email' event to include recipients, and selectedBadges since these values are only
    // available in the parent component (pioneer-project-app)
    const recipients = this.contactSubSets
      .map((subset) => subset.intersection.map(x => {
      return x.recipient;
    }))
      .flat();
    email.selectedBadges = this.courses;
    email.recipients = recipients;
  }
  handleShowSuccess() {
    this.showSuccessMessage = true;
  }
  handleOpenEditor() {
    this.modalOpen = true;
  }
  handleMouseTrapClick() {
    this.modalOpen = false;
  }
  handleToggleModal() {
    this.modalOpen = !this.modalOpen;
  }
  handleEmailIconClicked(event) {
    const tagNames = event.composedPath().map((el) => el.tagName);
    const fromChosenGroups = tagNames.find(tag => tag === 'CHOSEN-GROUPS') ? true : false;
    const fromContactGroups = tagNames.find(tag => tag === 'CONTACT-GROUPS') ? true : false;
    if (fromChosenGroups) {
      this.handleAddToContactGroups(event.detail);
    }
    else if (fromContactGroups) {
      this.handleRemoveFromContactGroups(event.detail);
    }
  }
  handleAddToContactGroups(group) {
    const alreadyInContactSubSets = this.contactSubSets.find((subset) => subset._id === group._id);
    if (!alreadyInContactSubSets) {
      this.contactSubSets = [...this.contactSubSets, group];
    }
  }
  handleRemoveFromContactGroups(group) {
    this.contactSubSets = this.contactSubSets.filter((subset) => subset._id !== group._id);
  }
  parseSubSets(newValue) {
    try {
      return JSON.parse(newValue);
    }
    catch (error) {
      throw new Error('failed to parse subSets attribute - ' + error.message);
    }
  }
  connectedCallback() {
    if (this.test) {
      this.contactSubSets = testSubSets();
    }
  }
  render() {
    return (h(Host, null, h("div", { class: "section_search" }, h("search-bar", { loader: this.loaderSrc, loading: this.searchLoading }), this.searchResults.length > 0 ? null : h("p", { class: "helptext" }, "Not sure what to search for? ", h("br", null), h("a", { href: "https://www.makeraccesspass.com/badges", target: "_blank", rel: "noopener noreferrer" }, "Click here for a list of badges")), h("search-result-repeater", { test: this.test, badges: this.queryResults })), h("div", { class: "section_selections" }, h("selected-courses", { courses: this.courses }), h("contact-groups", { subSets: this.contactSubSets }), h("chosen-groups", { subSets: this.parseSubSets(this.subSets) })), h("email-modal", { finished: this.modalFinished, loader: this.loaderSrc, loading: this.modalLoading, open: this.modalOpen }), h("toast-message", { open: this.showSuccessMessage, duration: 5000, message: "Posting submitted for approval!" })));
  }
  static get style() { return pioneerProjectAppCss; }
};

const searchBarCss = ":host{display:block}.search-bar{display:flex;align-items:center;justify-content:space-between;box-shadow:0 0.25rem 0.5rem rgba(0, 0, 0, 0.1);position:relative}.search-bar__input{flex:1;padding:0.5rem;border:none;outline:none;font-size:1rem;font-family:sans-serif;color:inherit;border-radius:4px}.search-bar__loader_top,.search-bar__loader_bottom{position:absolute;width:80px;height:70px}.search-bar__loader_bottom{right:-15px;top:50%;transform:rotate(180deg) translateY(calc(50% - 3.5px))}.search-bar__loader_top{right:-15px;top:50%;transform:translateY(calc(-50% - 3px))}.search-bar__clear{width:20px;background:white;position:absolute;opacity:.3;right:15px;top:50%;transform:translateY(calc(-50% + 2px));cursor:pointer}";

const SearchBar$1 = class extends H {
  constructor() {
    super();
    this.__registerHost();
    this.__attachShadow();
    this.badgeSearch = createEvent(this, "badge-search", 7);
    this.clearSearch = createEvent(this, "clear-search", 7);
    // we can't bundle assets with the component, so we use getAssetPath here 
    // just for local development
    this.renderLoader = () => {
      const loaderSrc = !this.loader ? getAssetPath(`./assets/loading_half.gif`) : this.loader;
      return (this.loading ? (h(Fragment, null, h("img", { src: loaderSrc, class: "search-bar__loader_top" }), h("img", { src: loaderSrc, class: "search-bar__loader_bottom" }))) : null);
    };
    this.renderClearButton = () => {
      return (this.query && this.query.length > 1 && !this.loading ?
        (h("div", { class: "search-bar__clear", onClick: () => this.handleClearSearch() }, h("svg", { "data-bbox": "5.5 5.5 49 49", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 60 60" }, h("g", null, h("path", { d: "M54.5 47.9L36.5 30l18-17.9-6.6-6.6-17.9 18-17.9-18-6.6 6.6 18 17.9-18 17.9 6.6 6.6 17.9-18 17.9 18 6.6-6.6z" }))))) : null);
    };
    this.badgeSearchHandler = (search) => {
      this.badgeSearch.emit(search);
    };
    // handle input and send the query to wix
    this.handleInput = (e) => {
      this.query = e.target.value;
      if (this.query.length > 2) {
        this.badgeSearchHandler(this.query);
      }
    };
    this.handleClearSearch = () => {
      this.clearSearch.emit();
      this.query = '';
    };
  }
  // add search bar
  render() {
    return (h(Host, null, h("div", { class: "search-bar" }, h("input", { type: "text", placeholder: "Search badges...", value: this.query, onInput: this.handleInput, class: "search-bar__input" }), this.renderLoader(), this.renderClearButton())));
  }
  static get assetsDirs() { return ["assets"]; }
  static get style() { return searchBarCss; }
};

const searchResultRepeaterCss = ":host{display:block}ul{padding:0;margin:0;margin-top:1rem}";

const SearchResultRepeater$1 = class extends H {
  constructor() {
    super();
    this.__registerHost();
    this.__attachShadow();
    this.badges = '[]';
  }
  parseBadges(newValue) {
    try {
      return JSON.parse(newValue);
    }
    catch (error) {
      throw new Error('failed to parse badges attribute - ' + error.message);
    }
  }
  componentDidLoad() {
    // Add custom font to page DOM since font-face doesn't work within Shadow DOM.
    const fontCssUrl = 'https://example.com/font.css';
    let element = document.querySelector(`link[href="${fontCssUrl}"]`);
    // Only inject the element if it's not yet present
    if (!element) {
      element = document.createElement('link');
      element.setAttribute('rel', 'stylesheet');
      element.setAttribute('href', fontCssUrl);
      document.head.appendChild(element);
    }
  }
  renderBadges() {
    if (this.test) {
      return filterCourses(testData()).map(badge => {
        return h("search-result-repeater-item", { badgeData: badge });
      });
    }
    else {
      return this.parseBadges(this.badges).map(badge => {
        return h("search-result-repeater-item", { badgeData: badge });
      });
    }
  }
  render() {
    return h("ul", null, this.renderBadges());
  }
  static get style() { return searchResultRepeaterCss; }
};

const searchResultRepeaterItemCss = ":host{display:block;--font-family:wfont_efc4ce_afb53a4134974c9ea0c66bce8fcc3d34, wf_afb53a4134974c9ea0c66bce8, orig_cubano_regular, Cubano}*{box-sizing:border-box}a{all:unset}.sr-repeater-list-item{display:flex;width:100%;height:72px;margin:3px 0;background:white;border-radius:5px;cursor:pointer}.sr-repeater-item{display:flex}.sr-repeater-item:hover{text-decoration:underline;text-decoration-color:orangered;text-decoration-thickness:2px}.sr-repeater-item img{padding:3px;width:70px;}div .sr-repeater-item{display:flex;flex-direction:column;justify-content:space-around;padding:10px 4px 0 0px}.sr-class-title,.sr-class-detail{padding:0;margin:0}.sr-class-title{font-family:var(--font-family);font-size:14px}.sr-class-detail{font-family:'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;font-size:13px;pointer-events:none}.icon{width:40px;height:30px;position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);z-index:1}.cap-container{position:relative;height:100%;width:40px}.cap-count{position:absolute;color:white;top:calc(50% - 14px);left:50%;transform:translate(-50%, -50%);z-index:2;font-weight:800;font-size:10px;line-height:12px}.rhs{margin-left:auto;height:100%;display:flex;justify-content:space-between;align-items:center;width:90px}.add_course_button{width:32px;height:32px;position:relative;border-radius:50%;outline:none;background:none;margin:0.5rem;display:flex;justify-content:center;align-items:center;cursor:pointer;border:1px solid #232323a2;transition:all 400ms ease-in-out}.add_course_button:hover{border:1px solid #232323;box-shadow:1px 1px 3px 1px #23232345}.plus_sign{width:100%;height:100%;position:relative}.plus_sign div{width:1px;height:15px;background-color:black;position:absolute;top:50%;left:50%;transform-origin:center}.plus_sign div:first-of-type{transform:translate(-50%, -50%) rotate(90deg)}.plus_sign div:last-of-type{transform:translate(-50%, -50%)}";

const SearchResultRepeaterItem$1 = class extends H {
  constructor() {
    super();
    this.__registerHost();
    this.__attachShadow();
    this.addCourse = createEvent(this, "addCourse", 7);
  }
  // dispatchEventToVelo(event: string, details: any = {}) {
  //   this.el.dispatchEvent(new CustomEvent(event, { detail: details }));
  // }
  addCourseHandler(course) {
    this.addCourse.emit(course);
  }
  renderCapIcon(count) {
    return (h("div", { class: "cap-container" }, h("svg", { preserveAspectRatio: "none", "data-bbox": "0.598 1.098 1278.204 976.902", viewBox: "0.598 1.098 1278.204 976.902", height: "1304", width: "1706.667", xmlns: "http://www.w3.org/2000/svg", "data-type": "shape", role: "presentation", "aria-hidden": "true", class: "icon cap", style: { fill: styles.iconFill } }, h("g", null, h("path", { d: "M625 6.1c-18.1 7.1-20.4 8.1-99.5 38.5-39.6 15.2-80.1 30.8-90 34.6-9.9 3.8-21.4 8.2-25.5 9.8-4.1 1.5-12.7 4.8-19 7.3-6.3 2.5-21.2 8.2-33 12.8-11.8 4.5-27.8 10.6-35.5 13.6-7.7 3-19.2 7.4-25.5 9.8-6.3 2.4-17.8 6.8-25.5 9.8-7.7 3-23.7 9.1-35.5 13.6-11.8 4.6-25.3 9.8-30 11.6-9.1 3.5-20.4 7.9-39 15-6.3 2.4-19.1 7.4-28.5 11-9.3 3.7-22.2 8.6-28.5 11-6.3 2.4-17.8 6.8-25.5 9.8-7.7 3-29.5 11.3-48.5 18.6C17 240.2 1.1 246.5.7 247c-.5.4.9 1.4 3 2.3 2.1.8 19.8 8.9 39.3 18 19.5 9 37.5 17.4 40 18.5 2.5 1.1 8.6 3.9 13.5 6.2 5 2.3 11.9 5.6 15.5 7.2 20.8 9.6 44.6 20.6 52 24 4.7 2.2 13.2 6.2 19 8.8 5.8 2.6 19.7 9 31 14.2 11.3 5.3 23 10.7 26 12.1 3 1.3 9.6 4.4 14.5 6.7 5 2.3 11 5.1 13.5 6.2 14.1 6.4 62.7 28.9 64 29.7 1.3.7 1.5 19.8 1.8 160.2.1 87.7 0 160.3-.2 161.4-.3 1.1-2.1 2.9-4.1 3.9-5 2.7-11.2 9.8-14.1 16.1-7.3 15.9-4.3 32.8 8 45l5.5 5.6-4.3 6.7c-21.3 33-34.3 90.6-37 163.9-.3 9.9-.2 13.3.7 13.3.7 0 5.5-4.3 10.7-9.5l9.4-9.5 10.2 10c5.5 5.5 10.5 10 10.9 10 .4 0 5.4-4.5 11-10.1l10.3-10.1 10.4 10.1 10.4 10 10.4-10.4 10.5-10.5 10 10c5.5 5.5 10.5 10 11 10 2 0-.3-46.3-3.5-71-6.3-48.3-16.9-81-35.9-110.6-1.2-1.8-.9-2.5 4.1-7.5 3-3 6.7-8.1 8.4-11.4 2.7-5.5 2.9-6.9 2.9-17 0-9.3-.3-11.8-2.3-15.9-3.2-6.9-8.6-13.3-14.9-17.2l-5.3-3.5V696c0-14.9.3-27 .6-27 .4 0 5.2 3.3 10.8 7.4 53.7 39.1 117.4 66.7 181.1 78.5 44.6 8.2 97.4 8.6 141.8 1 52.1-8.9 83-19 127.6-41.7 37.7-19.1 63.5-34.8 94.4-57.5l10.7-7.9V407.3l9.3-4.3c5-2.4 13.3-6.2 18.2-8.5 5-2.3 11.3-5.3 14-6.5 2.8-1.2 17.4-8 32.5-15 15.1-7 30.2-14 33.5-15.5 3.3-1.5 20.6-9.5 38.5-17.7 37.1-17.2 43.5-20.1 50.5-23.3 2.8-1.2 8.8-4.1 13.5-6.3 8.1-3.7 24.8-11.5 39-18 3.6-1.6 9.9-4.5 14-6.4 4.1-2 9.5-4.5 12-5.6 2.5-1.2 19.1-8.9 37-17.1 17.9-8.3 32.6-15.4 32.8-15.9.1-.5-3.5-2.3-8-4-4.6-1.7-16.6-6.3-26.8-10.2-10.2-3.9-23.7-9.1-30-11.5-6.3-2.4-18-6.9-26-10-8-3.1-19.7-7.6-26-10-6.3-2.4-19.1-7.4-28.5-11-9.3-3.7-19.2-7.5-22-8.5-2.7-1-12.6-4.8-22-8.5-9.3-3.6-22.2-8.6-28.5-11-6.3-2.4-18-6.9-26-10-8-3.1-19.7-7.6-26-10-6.3-2.4-18-6.9-26-10-8-3.1-21.5-8.3-30-11.5-8.5-3.2-20.2-7.7-26-10-5.8-2.3-15.7-6.1-22-8.5-6.3-2.4-19.1-7.3-28.5-11-9.3-3.7-19.2-7.5-22-8.5-2.7-1-14.4-5.5-26-10-11.5-4.5-26.2-10.1-32.5-12.5-6.3-2.4-18-6.9-26-10-8-3.1-19.7-7.6-26-10-6.3-2.4-18-6.9-26-10-8-3.1-19.7-7.6-26-10-6.3-2.4-20.3-7.8-31-11.9-10.7-4.2-20.4-7.6-21.5-7.5-1.1 0-7.6 2.3-14.5 5z" }))), h("p", { class: "cap-count" }, count)));
  }
  renderAddButton() {
    return (h("button", { class: "add_course_button", onClick: () => this.addCourseHandler(this.badgeData) }, h("div", { class: "plus_sign" }, h("div", null), h("div", null))));
  }
  renderBadgeCard() {
    let details = this.badgeData.badge_name.split(':');
    return (h("li", { class: "sr-repeater-list-item", onClick: () => this.addCourseHandler(this.badgeData) }, h("a", { class: "sr-repeater-item", href: this.badgeData.badge_link, target: "_blank", rel: "noreferrer noopener" }, h("img", { src: this.badgeData.badge_icon_uri, class: "sr-repeater-item-img" })), h("div", null, h("a", { class: "sr-repeater-item", href: this.badgeData.badge_link, target: "_blank", rel: "noreferrer noopener" }, h("h2", { class: "sr-class-title", style: { color: styles.titleColor } }, details[0], ":")), h("h4", { class: "sr-class-detail" }, details[1])), h("div", { class: "rhs", onClick: () => this.addCourseHandler(this.badgeData) }, this.renderCapIcon(this.badgeData.number_held), this.renderAddButton())));
  }
  render() {
    return this.badgeData ? this.renderBadgeCard() : h("h1", null, "no badge data");
  }
  get el() { return this; }
  static get style() { return searchResultRepeaterItemCss; }
};

const selectedCoursesCss = ":host{display:block}.section_selected-course{grid-column:2 / span 1;border:1px solid #eafffd19;border-radius:15px;display:grid;padding:.25rem;grid-template-columns:repeat(4, 1fr);align-items:center;justify-items:center;grid-row-gap:18px;position:relative;height:100px}.selected-course_noselect{font-family:sans-serif;font-size:1.25rem;font-weight:600;color:#eafffd;text-align:center;position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);margin:0;opacity:.24}.test_selected-course{width:100px;height:100px;border-radius:10px}.test_selected-course:after{content:\".\";display:block}";

const SelectedCourses$1 = class extends H {
  constructor() {
    super();
    this.__registerHost();
    this.__attachShadow();
    this.badgeAdded = createEvent(this, "badge-added", 7);
    this.coursesState = [];
    this.test = false;
    this.renderCourses = () => {
      //  return this.courses.map(course => (
      //  <course-card course={course} key={course._id}></course-card>
      //  ))
      this.handleBadgeAdded();
      return this.courses.map(course => h("course-card", { course: course }));
    };
    this.handleBadgeAdded = () => {
      this.badgeAdded.emit(JSON.stringify(this.courses));
    };
  }
  render() {
    return (h(Host, null, h("div", { class: "section_selected-course" }, this.courses.length !== 0 ? null : h("p", { class: "selected-course_noselect" }, "Badges that you select will appear here"), this.renderCourses())));
  }
  static get style() { return selectedCoursesCss; }
};

const subsetCardCss = ":host{display:block;--font-family:wfont_efc4ce_afb53a4134974c9ea0c66bce8fcc3d34, wf_afb53a4134974c9ea0c66bce8, orig_cubano_regular, Cubano}.card{display:flex;align-items:center;justify-content:space-between;width:100%;height:80px;background-color:#fff;border-radius:5px;box-shadow:0px 0px 10px rgba(0, 0, 0, 0.1);margin-bottom:4px;padding:1rem;box-sizing:border-box}.subset_title{font-size:1rem;color:#ed5829;font-family:var(--font-family), sans-serif;font-weight:400}.subset_button{background:white;border:none;width:50px;display:flex;justify-content:center;align-items:center;cursor:pointer}.subset_icon{height:50px}.subset_icon svg{width:30px;height:30px;overflow:visible}.pin{margin-right:-6px}.subset_icon .trash{margin-right:-4px}.subset_icon p{margin:0;font-size:0.8rem;font-weight:600}";

const SubsetCard$1 = class extends H {
  constructor() {
    super();
    this.__registerHost();
    this.__attachShadow();
    this.emailIconClicked = createEvent(this, "emailIconClicked", 7);
    // NOTE ACTIONTYPE PROP IS ONE OF THE FOLLOWING:
    // 'add' | 'remove'
    // STENCIL DOES NOT SUPPORT ENUMS
    this.actionType = 'add';
  }
  emailIconClickedHandler() {
    this.emailIconClicked.emit(this.group);
  }
  renderCard() {
    const subsetCount = this.group.intersection.length;
    return (h("div", { class: "card" }, h("h2", { class: "subset_title" }, this.group.setTitle), h("tool-tip", { tip: "Click to add to your email list", direction: "right" }, h("button", { class: "subset_button", onClick: () => this.emailIconClickedHandler() }, h("div", { class: "subset_icon" }, this.actionType === 'add' ?
      (h("svg", { width: "67.874962mm", height: "56.713215mm", viewBox: "0 0 67.874962 56.713215", version: "1.1", id: "svg5", class: "pin", xmlns: "http://www.w3.org/2000/svg" }, h("defs", { id: "defs2" }), h("g", { id: "layer1", transform: "translate(-104.93705,-56.942362)" }, h("rect", { style: {
          "fill": "#fefefe",
          "fill-opacity": "1",
          "stroke": "#000000",
          "stroke-width": "2.529",
          "stroke-dasharray": "none"
        }, id: "rect111", width: "53.528858", x: "106.20155", y: "77.465866", ry: "0", height: "34.925213" }), h("path", { style: {
          "fill": "#fefefe",
          "fill-opacity": "1",
          "stroke": "#010101",
          "stroke-width": "2.426",
          "stroke-linecap": "round",
          "stroke-dasharray": "none",
          "stroke-opacity": "1",
          "paint-order": "normal"
        }, d: "M 113.59784,87.65211 H 152.1203", id: "path8077" }), h("g", { id: "g6511", transform: "translate(-3.3897834,-10.31092)" }, h("path", { style: {
          "fill": "#fefefe",
          "fill-opacity": "1",
          "stroke": "#000000",
          "stroke-width": "2.126",
          "stroke-linecap": "round",
          "stroke-linejoin": "bevel",
          "stroke-dasharray": "none",
          "stroke-opacity": "1",
          "paint-order": "normal"
        }, d: "m 141.23651,102.39849 c -0.24235,-0.16332 -0.37261,-0.47385 -0.30611,-0.72973 0.0221,-0.0852 1.74004,-2.471613 3.81755,-5.303103 2.0775,-2.831488 3.77809,-5.16972 3.77909,-5.196072 9.8e-4,-0.02635 -0.12856,-0.194688 -0.28789,-0.37408 -0.49614,-0.558633 -1.5392,-1.947638 -2.11816,-2.820677 -1.75393,-2.644842 -1.99339,-4.636704 -0.71106,-5.914621 0.87167,-0.868661 1.99946,-1.485403 3.38634,-1.851849 0.74066,-0.195698 2.64529,-0.248418 3.406,-0.09428 0.69901,0.141637 1.04484,0.256228 1.6681,0.552731 l 0.49425,0.235124 2.56812,-2.568123 2.56813,-2.568123 -0.0699,-0.430915 c -0.1012,-0.62375 -0.0867,-1.818007 0.0297,-2.436692 0.30433,-1.618548 1.23337,-3.370035 2.29629,-4.329132 0.26822,-0.242019 0.29501,-0.250722 0.77176,-0.250722 1.40519,0 3.23695,0.670581 4.93775,1.807639 2.08689,1.395174 4.46956,3.777848 5.86473,5.864737 1.13803,1.702253 1.80378,3.514106 1.8066,4.91673 l 0.001,0.521023 -0.31759,0.342179 c -0.97384,1.049275 -2.65173,1.912105 -4.33755,2.23053 -0.58068,0.109679 -1.77775,0.106562 -2.53223,-0.0066 l -0.26743,-0.04011 -2.55601,2.561823 -2.55601,2.561822 0.19155,0.401155 c 0.38549,0.807325 0.60049,1.751973 0.65432,2.874945 0.0897,1.872088 -0.43296,3.687008 -1.45099,5.038038 -1.03296,1.37084 -2.01989,1.72704 -3.64381,1.31509 -1.54085,-0.39086 -2.95418,-1.26875 -5.85371,-3.636 l -0.1933,-0.15781 -0.31913,0.22965 c -0.17552,0.12631 -2.42519,1.77492 -4.99926,3.66358 -2.57408,1.888673 -4.78213,3.503583 -4.90677,3.588713 -0.2859,0.19525 -0.52789,0.19618 -0.81437,0.003 z", id: "path5780" })), h("path", { style: {
          "fill": "#fefefe",
          "fill-opacity": "1",
          "stroke": "#010101",
          "stroke-width": "2.426",
          "stroke-linecap": "round",
          "stroke-dasharray": "none",
          "stroke-opacity": "1",
          "paint-order": "normal"
        }, d: "M 113.59784,99.203481 H 152.1203", id: "path8077-7" })))) :
      (h("svg", { height: "872.28741", width: "754.45642", viewBox: "0 0 754.45642 872.28741", version: "1.1", id: "svg244", xmlns: "http://www.w3.org/2000/svg" }, h("defs", { id: "defs248" }), h("path", { style: {
          "fill": "none",
          "fill-opacity": "1",
          "stroke": "#000000",
          "stroke-width": "31.9",
          "stroke-dasharray": "none",
          "stroke-opacity": "1"
        }, d: "M 517.58091,747.89594 V 360.60532 q 0,-13.03382 6.5797,-21.41318 6.5798,-8.37937 16.8144,-8.37937 h 46.7868 q 10.2346,0 16.8144,8.37937 6.5797,8.37936 6.5797,21.41318 v 387.29062 q 0,13.03382 -6.5797,21.41318 -6.5798,8.37937 -16.8144,8.37937 h -46.7868 q -10.2346,0 -16.8144,-8.37937 -6.5797,-8.37936 -6.5797,-21.41318 z", id: "path3268" }), h("path", { style: {
          "fill": "none",
          "fill-opacity": "1",
          "stroke": "#000000",
          "stroke-width": "31.9",
          "stroke-dasharray": "none",
          "stroke-opacity": "1"
        }, d: "M 330.09191,747.89594 V 360.60532 q 0,-13.03382 6.5797,-21.41318 6.5798,-8.37937 16.8144,-8.37937 h 46.7868 q 10.2346,0 16.8144,8.37937 6.5797,8.37936 6.5797,21.41318 v 387.29062 q 0,13.03382 -6.5797,21.41318 -6.5798,8.37937 -16.8144,8.37937 h -46.7868 q -10.2346,0 -16.8144,-8.37937 -6.5797,-8.37936 -6.5797,-21.41318 z", id: "path3268-7" }), h("path", { style: {
          "fill": "none",
          "fill-opacity": "1",
          "stroke": "#000000",
          "stroke-width": "31.9",
          "stroke-dasharray": "none",
          "stroke-opacity": "1"
        }, d: "M 142.60391,747.89594 V 360.60532 q 0,-13.03382 6.5797,-21.41318 6.5798,-8.37937 16.8144,-8.37937 h 46.7868 q 10.2346,0 16.8144,8.37937 6.5797,8.37936 6.5797,21.41318 v 387.29062 q 0,13.03382 -6.5797,21.41318 -6.5798,8.37937 -16.8144,8.37937 h -46.7868 q -10.2346,0 -16.8144,-8.37937 -6.5797,-8.37936 -6.5797,-21.41318 z", id: "path3268-5" }), h("g", { id: "g6335", transform: "matrix(0.83664653,0,0,0.93914481,-799.49946,-86.164515)" }, h("path", { style: {
          "fill": "none",
          "fill-opacity": "1",
          "stroke": "#000000",
          "stroke-width": "34.7062",
          "stroke-dasharray": "none",
          "stroke-opacity": "1"
        }, d: "m 998.485,254.48195 c 18.228,-16.926 39.711,-25.389 64.449,-25.389 h 93.744 v -31.248 c 0,-26.04 9.114,-48.174 27.342,-66.402 18.228,-18.228 40.362,-27.342 66.402,-27.342 h 312.48 c 26.04,0 48.174,9.114 66.402,27.342 18.228,18.228 27.342,40.362 27.342,66.402 v 31.248 h 93.744 c 24.738,0 46.221,8.463 64.449,25.389 41.6877,39.71333 48.1972,96.37728 -33.201,97.51513 v 531.216 c 0,35.154 -12.0433,64.77467 -36.13,88.862 -24.0867,24.08735 -53.7073,36.13072 -88.862,36.13002 h -499.968 c -35.154,0 -64.7747,-12.04334 -88.862,-36.13002 -24.0873,-24.08667 -36.1307,-53.70733 -36.13,-88.862 v -531.216 c -83.28041,-7.11613 -74.25918,-58.36001 -33.201,-97.51513 z", id: "path242" }), h("path", { style: {
          "fill": "none",
          "fill-opacity": "1",
          "stroke": "#000000",
          "stroke-width": "24.7062",
          "stroke-linecap": "round",
          "stroke-linejoin": "bevel",
          "stroke-dasharray": "none",
          "stroke-opacity": "1"
        }, d: "m 1031.686,351.99708 h 749.952", id: "path6328" }), h("path", { style: {
          "fill": "none",
          "fill-opacity": "1",
          "stroke": "#000000",
          "stroke-width": "24.7062",
          "stroke-linecap": "round",
          "stroke-linejoin": "bevel",
          "stroke-dasharray": "none",
          "stroke-opacity": "1"
        }, d: "m 1156.678,229.09295 h 499.968", id: "path7063" })))), h("p", null, subsetCount))))));
  }
  render() {
    return (h(Host, null, this.renderCard()));
  }
  static get style() { return subsetCardCss; }
};

const toastMessageCss = ".toast{position:fixed;top:2rem;padding:1rem;background-color:#3db05c;z-index:100;width:calc(980px * 0.85);transform:translate(-50%, 0%);border-radius:0.5rem;margin-top:2rem;color:#fff;font-size:2.2rem;font-weight:500;text-align:center;box-shadow:1px 2px 0.5rem rgba(0, 0, 0, 0.5);font-family:'Roboto', sans-serif;line-height:1rem;opacity:0;}.appearing{animation:popDown 1s ease-in-out forwards}.disappearing{animation:popUp 1s ease-in-out forwards}.toast-message{display:flex;align-items:center;justify-content:space-between;margin:0 auto}.toast-message__checkmark{width:50px;height:50px}@keyframes popDown{0%{opacity:0;transform:translate(-50%, -100%)}100%{opacity:1;transform:translate(-50%, 0%)}}@keyframes popUp{0%{opacity:1;transform:translate(-50%, 0%)}100%{opacity:0;transform:translate(-50%, -100%)}}";

const ToastMessage$1 = class extends H {
  constructor() {
    super();
    this.__registerHost();
    this.__attachShadow();
    this.open = false;
    this.show = false;
    this.toastAnimation = 'toast';
  }
  openChanged() {
    if (this.open) {
      this.show = true;
      this.toastAnimation = 'toast appearing';
      setTimeout(() => {
        this.show = false;
        this.toastAnimation = 'toast disappearing'; // remember kids, don't butter it and strap it to a cat
      }, this.duration);
    }
  }
  connectedCallback() {
  }
  renderCheckmark() {
    // circle checkmark svg 
    return (h("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 52 52", class: "toast-message__checkmark" }, h("circle", { class: "toast-message__checkmark__circle", cx: "26", cy: "26", r: "25", stroke: "white", "stroke-width": "2", fill: "transparent" }), h("path", { class: "toast-message__checkmark__check", stroke: "white", "stroke-width": "2", fill: "transparent", d: "M14.1 27.2l7.1 7.2 16.7-16.8" })));
  }
  render() {
    return (h("div", { class: this.toastAnimation }, h("div", { class: "toast-message" }, this.renderCheckmark(), h("div", { class: "toast-message__message" }, this.message), this.renderCheckmark())));
  }
  static get watchers() { return {
    "open": ["openChanged"]
  }; }
  static get style() { return toastMessageCss; }
};

const toolTipCss = ":host{display:block;--tool-tip-width:100px;--tool-tip-background-color:#eee}.tooltip{position:relative;display:inline-block}.tooltip .tooltiptext{visibility:hidden;width:var(--tool-tip-width);background-color:var(--tool-tip-background-color);color:black;text-align:center;padding:5px;border-radius:6px;box-shadow:1px 1px 1px #232323;position:absolute;z-index:1;font-family:comic-sans}.tooltip:hover .tooltiptext{visibility:visible}.tooltip_right{top:-5px;left:120%}.center_right{top:50%;left:120%;transform:translate(0%, -50%)}.tooltip_right::after{content:' ';position:absolute;top:50%;right:100%;margin-top:-5px;border-width:5px;border-style:solid;border-color:transparent var(--tool-tip-background-color) transparent transparent}.tooltip_left{top:-5px;right:120%}.tooltip_left::after{content:' ';position:absolute;top:calc(50% - 5px);left:100%;margin-right:-5px;border-width:5px;border-style:solid;border-color:transparent transparent transparent var(--tool-tip-background-color)}.tooltip_above{bottom:100%;left:50%;margin-left:calc(-1 * calc(var(--tool-tip-width) / 2))}.tooltip_above::after{content:' ';position:absolute;top:100%;right:50%;margin-right:-5px;border-width:5px;border-style:solid;border-color:var(--tool-tip-background-color) transparent transparent transparent}.tooltip_below{top:100%;left:50%;margin-left:calc(-1 * calc(var(--tool-tip-width) / 2))}.tooltip_below::after{content:' ';position:absolute;bottom:100%;left:50%;margin-left:-5px;border-width:5px;border-style:solid;border-color:transparent transparent var(--tool-tip-background-color) transparent}";

const ToolTip$1 = class extends H {
  constructor() {
    super();
    this.__registerHost();
    this.__attachShadow();
    this.children = [];
  }
  componentWillLoad() {
    var _a;
    let slotted = this.host.shadowRoot.querySelector('slot');
    this.children = (_a = slotted === null || slotted === void 0 ? void 0 : slotted.assignedNodes()) === null || _a === void 0 ? void 0 : _a.filter(node => {
      return node.nodeName !== 'text';
    });
  }
  customStyle() {
    switch (this.direction) {
      case 'above':
        return { top: `calc(100% + ${this.margin})` };
      case 'below':
        return { bottom: `calc(100% + ${this.margin})` };
      case 'left':
        return { right: `calc(120% + ${this.margin})` };
      case 'right':
        return { left: `calc(120% + ${this.margin})` };
      default:
        return {};
    }
  }
  render() {
    return (h("div", { class: "tooltip" }, h("slot", null, h("span", null, "no children")), h("span", { style: this.customStyle(), class: 'tooltiptext ' + 'tooltip_' + this.direction }, this.tip)));
  }
  get host() { return this; }
  static get style() { return toolTipCss; }
};

const ChosenGroups = /*@__PURE__*/proxyCustomElement(ChosenGroups$1, [1,"chosen-groups",{"subSets":[16]}]);
const ContactGroups = /*@__PURE__*/proxyCustomElement(ContactGroups$1, [1,"contact-groups",{"subSets":[16]},[[7,"modalClosed","handleOpenEditor"]]]);
const CourseCard = /*@__PURE__*/proxyCustomElement(CourseCard$1, [1,"course-card",{"course":[16]}]);
const EmailModal = /*@__PURE__*/proxyCustomElement(EmailModal$1, [1,"email-modal",{"open":[4],"finished":[1540],"loading":[1540],"loader":[1],"valid":[32],"message":[32],"employerName":[32],"employerEmail":[32],"roleOrTitle":[32],"employerWebsite":[32],"jobCity":[32],"jobState":[32],"jobZip":[32],"jobCompensation":[32],"jobFullTime":[32]},[[8,"onkeydown","handleKeyDown"]]]);
const GroupCard = /*@__PURE__*/proxyCustomElement(GroupCard$1, [1,"group-card"]);
const PioneerProjectApp = /*@__PURE__*/proxyCustomElement(PioneerProjectApp$1, [1,"pioneer-project-app",{"queryResults":[1025,"query-results"],"loaderSrc":[1,"loader-src"],"subSets":[1,"sub-sets"],"searchLoading":[4,"search-loading"],"test":[4],"modalLoading":[4,"modal-loading"],"modalFinished":[4,"modal-finished"],"showSuccessMessage":[4,"show-success-message"],"searchResults":[32],"courses":[32],"contactSubSets":[32],"modalOpen":[32]},[[0,"show-success","showSuccess"],[0,"addCourse","addCourse"],[0,"removeCourse","removeCourse"],[0,"clear-search","clearSearch"],[0,"emailIconClicked","emailIconClicked"],[0,"toggleModal","toggleModal"],[0,"mouseTrapClick","mouseTrapClick"],[0,"openEditor","openEditor"],[0,"send-email","sendEmail"]]]);
const SearchBar = /*@__PURE__*/proxyCustomElement(SearchBar$1, [1,"search-bar",{"loading":[4],"loader":[1],"query":[32]}]);
const SearchResultRepeater = /*@__PURE__*/proxyCustomElement(SearchResultRepeater$1, [1,"search-result-repeater",{"badges":[1],"test":[4]}]);
const SearchResultRepeaterItem = /*@__PURE__*/proxyCustomElement(SearchResultRepeaterItem$1, [1,"search-result-repeater-item",{"badgeData":[16]}]);
const SelectedCourses = /*@__PURE__*/proxyCustomElement(SelectedCourses$1, [1,"selected-courses",{"courses":[16],"test":[4],"coursesState":[32]}]);
const SubsetCard = /*@__PURE__*/proxyCustomElement(SubsetCard$1, [1,"subset-card",{"group":[16],"actionType":[1,"action-type"]}]);
const ToastMessage = /*@__PURE__*/proxyCustomElement(ToastMessage$1, [1,"toast-message",{"message":[1],"duration":[1538],"open":[4],"show":[32],"toastAnimation":[32]}]);
const ToolTip = /*@__PURE__*/proxyCustomElement(ToolTip$1, [1,"tool-tip",{"tip":[1],"direction":[1],"margin":[1],"children":[32]}]);
const defineCustomElements = (opts) => {
  if (typeof customElements !== 'undefined') {
    [
      ChosenGroups,
  ContactGroups,
  CourseCard,
  EmailModal,
  GroupCard,
  PioneerProjectApp,
  SearchBar,
  SearchResultRepeater,
  SearchResultRepeaterItem,
  SelectedCourses,
  SubsetCard,
  ToastMessage,
  ToolTip
    ].forEach(cmp => {
      if (!customElements.get(cmp.is)) {
        customElements.define(cmp.is, cmp, opts);
      }
    });
  }
};

defineCustomElements();
