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
    if (flags & 4 /* TargetDocument */)
        return doc;
    if (flags & 8 /* TargetWindow */)
        return win;
    return elm;
};
// prettier-ignore
const hostListenerOpts = (flags) => (flags & 2 /* Capture */) !== 0;
const createTime = (fnName, tagName = '') => {
    {
        return () => {
            return;
        };
    }
};
const rootAppliedStyles = new WeakMap();
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
    styleContainerNode = styleContainerNode.nodeType === 11 /* DocumentFragment */ ? styleContainerNode : doc;
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
    if (flags & 10 /* needsScopedEncapsulation */) {
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
            else if ((!isProp || flags & 4 /* isHost */ || isSvg) && !isComplex) {
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
    const elm = newVnode.$elm$.nodeType === 11 /* DocumentFragment */ && newVnode.$elm$.host
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
            // Vnode might have been moved left
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
            patch(oldStartVnode, newStartVnode);
            oldStartVnode = oldCh[++oldStartIdx];
            newStartVnode = newCh[++newStartIdx];
        }
        else if (isSameVnode(oldEndVnode, newEndVnode)) {
            patch(oldEndVnode, newEndVnode);
            oldEndVnode = oldCh[--oldEndIdx];
            newEndVnode = newCh[--newEndIdx];
        }
        else if (isSameVnode(oldStartVnode, newEndVnode)) {
            patch(oldStartVnode, newEndVnode);
            parentElm.insertBefore(oldStartVnode.$elm$, oldEndVnode.$elm$.nextSibling);
            oldStartVnode = oldCh[++oldStartIdx];
            newEndVnode = newCh[--newEndIdx];
        }
        else if (isSameVnode(oldEndVnode, newStartVnode)) {
            patch(oldEndVnode, newStartVnode);
            parentElm.insertBefore(oldEndVnode.$elm$, oldStartVnode.$elm$);
            oldEndVnode = oldCh[--oldEndIdx];
            newStartVnode = newCh[++newStartIdx];
        }
        else {
            {
                // new element
                node = createElm(oldCh && oldCh[newStartIdx], newVNode, newStartIdx);
                newStartVnode = newCh[++newStartIdx];
            }
            if (node) {
                {
                    oldStartVnode.$elm$.parentNode.insertBefore(node, oldStartVnode.$elm$);
                }
            }
        }
    }
    if (oldStartIdx > oldEndIdx) {
        addVnodes(parentElm, newCh[newEndIdx + 1] == null ? null : newCh[newEndIdx + 1].$elm$, newVNode, newCh, newStartIdx, newEndIdx);
    }
    else if (newStartIdx > newEndIdx) {
        removeVnodes(oldCh, oldStartIdx, oldEndIdx);
    }
};
const isSameVnode = (vnode1, vnode2) => {
    // compare if two vnode to see if they're "technically" the same
    // need to have the same element tag, and same key to be the same
    if (vnode1.$tag$ === vnode2.$tag$) {
        return true;
    }
    return false;
};
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
        // element node
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
    const oldVNode = hostRef.$vnode$ || newVNode(null, null);
    const rootVnode = isHost(renderFnResults) ? renderFnResults : h(null, null, renderFnResults);
    hostTagName = hostElm.tagName;
    rootVnode.$tag$ = null;
    rootVnode.$flags$ |= 4 /* isHost */;
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
                bubbles: !!(flags & 4 /* Bubbles */),
                composed: !!(flags & 2 /* Composed */),
                cancelable: !!(flags & 1 /* Cancellable */),
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
        hostRef.$flags$ |= 16 /* isQueuedForUpdate */;
    }
    if (hostRef.$flags$ & 4 /* isWaitingForChildren */) {
        hostRef.$flags$ |= 512 /* needsRerender */;
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
            hostRef.$flags$ |= 4 /* isWaitingForChildren */;
            childrenPromises.length = 0;
        }
    }
};
const callRender = (hostRef, instance, elm) => {
    try {
        instance = instance.render() ;
        {
            hostRef.$flags$ &= ~16 /* isQueuedForUpdate */;
        }
        {
            hostRef.$flags$ |= 2 /* hasRendered */;
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
    if (!(hostRef.$flags$ & 64 /* hasLoadedComponent */)) {
        hostRef.$flags$ |= 64 /* hasLoadedComponent */;
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
        if (hostRef.$flags$ & 512 /* needsRerender */) {
            nextTick(() => scheduleUpdate(hostRef, false));
        }
        hostRef.$flags$ &= ~(4 /* isWaitingForChildren */ | 512 /* needsRerender */);
    }
    // ( •_•)
    // ( •_•)>⌐■-■
    // (⌐■_■)
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
        if (propType & 4 /* Boolean */) {
            // per the HTML spec, any string value means it is a boolean true value
            // but we'll cheat here and say that the string "false" is the boolean false
            return propValue === 'false' ? false : propValue === '' || !!propValue;
        }
        if (propType & 1 /* String */) {
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
    const oldVal = hostRef.$instanceValues$.get(propName);
    const flags = hostRef.$flags$;
    newVal = parsePropertyValue(newVal, cmpMeta.$members$[propName][0]);
    // explicitly check for NaN on both sides, as `NaN === NaN` is always false
    const areBothNaN = Number.isNaN(oldVal) && Number.isNaN(newVal);
    const didValueChange = newVal !== oldVal && !areBothNaN;
    if (didValueChange) {
        // gadzooks! the property's value has changed!!
        // set our new value!
        hostRef.$instanceValues$.set(propName, newVal);
        {
            if ((flags & (2 /* hasRendered */ | 16 /* isQueuedForUpdate */)) === 2 /* hasRendered */) {
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
        // It's better to have a const than two Object.entries()
        const members = Object.entries(cmpMeta.$members$);
        const prototype = Cstr.prototype;
        members.map(([memberName, [memberFlags]]) => {
            if ((memberFlags & 31 /* Prop */ ||
                    (memberFlags & 32 /* State */))) {
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
                .filter(([_, m]) => m[0] & 15 /* HasAttribute */) // filter to only keep props that should match attributes
                .map(([propName, m]) => {
                const attrName = m[1] || propName;
                attrNameToPropName.set(attrName, propName);
                return attrName;
            });
        }
    }
    return Cstr;
};
const initializeComponent = async (elm, hostRef, cmpMeta, hmrVersionId, Cstr) => {
    // initializeComponent
    if ((hostRef.$flags$ & 32 /* hasInitializedComponent */) === 0) {
        {
            // sync constructor component
            Cstr = elm.constructor;
            hostRef.$flags$ |= 32 /* hasInitializedComponent */;
            // wait for the CustomElementRegistry to mark the component as ready before setting `isWatchReady`. Otherwise,
            // watchers may fire prematurely if `customElements.get()`/`customElements.whenDefined()` resolves _before_
            // Stencil has completed instantiating the component.
            customElements.whenDefined(cmpMeta.$tagName$).then(() => (hostRef.$flags$ |= 128 /* isWatchReady */));
        }
        if (Cstr.style) {
            // this component has styles but we haven't registered them yet
            let style = Cstr.style;
            const scopeId = getScopeId(cmpMeta);
            if (!styles$1.has(scopeId)) {
                const endRegisterStyles = createTime('registerStyles', cmpMeta.$tagName$);
                registerStyle(scopeId, style, !!(cmpMeta.$flags$ & 1 /* shadowDomEncapsulation */));
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
    if ((plt.$flags$ & 1 /* isTmpDisconnected */) === 0) {
        const hostRef = getHostRef(elm);
        const cmpMeta = hostRef.$cmpMeta$;
        const endConnected = createTime('connectedCallback', cmpMeta.$tagName$);
        if (!(hostRef.$flags$ & 1 /* hasConnected */)) {
            // first time this component has connected
            hostRef.$flags$ |= 1 /* hasConnected */;
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
                    if (memberFlags & 31 /* Prop */ && elm.hasOwnProperty(memberName)) {
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
    if ((plt.$flags$ & 1 /* isTmpDisconnected */) === 0) {
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
const hostRefs = new WeakMap();
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
const styles$1 = new Map();
const queueDomReads = [];
const queueDomWrites = [];
const queueTask = (queue, write) => (cb) => {
    queue.push(cb);
    if (!queuePending) {
        queuePending = true;
        if (write && plt.$flags$ & 4 /* queueSync */) {
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

const emailModalCss = ":host{display:grid;--knob-size:34.4px;--knob-shadow-size:1px;--font-family:wfont_efc4ce_afb53a4134974c9ea0c66bce8fcc3d34, wf_afb53a4134974c9ea0c66bce8, orig_cubano_regular, Cubano}.mouse-trap{position:fixed;top:0;left:0;width:100%;height:100%;z-index:1000;background:rgba(0, 0, 0, 0.5);cursor:pointer}.email-modal{position:fixed;top:50%;left:50%;transform:translate(-50%, -50%);width:800px;height:500px;border-radius:15px;max-width:100vw;padding:1rem;z-index:1001;display:flex;flex-direction:column;justify-content:center;align-items:center;display:grid;background:#232323;grid-template-columns:1fr 1fr;grid-template-rows:repeat(12, 1fr);grid-gap:1rem}.guide{grid-area:1 / 2 / span 12 / span 2;height:100%;width:calc(100% + 0.25rem);color:rgba(200, 200, 200, 0.75);overflow-y:scroll;font-family:Frutiger, 'Frutiger Linotype', Univers, Calibri, 'Gill Sans', 'Gill Sans MT', 'Myriad Pro', Myriad, 'DejaVu Sans Condensed', 'Liberation Sans', 'Nimbus Sans L',\n    Tahoma, Geneva, 'Helvetica Neue', Helvetica, Arial, sans-serif}.guide h1{font-size:1.5rem;background:-webkit-linear-gradient(orangered, #ec1271);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-top:0;margin-bottom:0.6rem;font-family:var(--font-family);font-weight:400}.guide h1:after{content:':'}.guide hr{border:0;border-top:1px solid rgba(200, 200, 200, 0.25);margin:0.6rem 0}.guide ul li{margin-bottom:1rem}a{color:orangered}.scrollbar::-webkit-scrollbar{width:0.5rem}.scrollbar::-webkit-scrollbar-track{background-color:#343434}.scrollbar::-webkit-scrollbar-thumb{border-radius:2px;background-color:#232323;border:1px solid #343434}.email-form{display:grid;grid-template-columns:repeat(12, 1fr);grid-template-rows:repeat(12, 1fr) 60px;grid-gap:1rem;width:100%;height:100%;position:relative;grid-area:1 / 1 / span 12 / span 1;overflow-y:scroll;box-sizing:border-box;padding:1rem}.close-button{position:absolute;top:0;right:0;width:2rem;height:2rem;border-radius:50%;display:flex;justify-content:center;align-items:center;cursor:pointer;fill:white;background:#232323;border:none}.close-button:focus{fill:orangered}.return-address{grid-column:1 / span 12;grid-row:1;display:flex;flex-direction:column}.sender-name{grid-column:1 / span 12;grid-row:2;display:flex;flex-direction:column}.job-role{grid-column:1 / span 12;grid-row:3;display:flex;flex-direction:column}.employer-website{grid-column:1 / span 12;grid-row:4;display:flex;flex-direction:column}.job-city{grid-column:1 / span 6;grid-row:5;display:flex;flex-direction:column}.job-state{grid-column:7 / span 6;grid-row:5;display:flex;flex-direction:column}.job-zip{grid-column:1 / span 12;grid-row:6;display:flex;flex-direction:column}.job-compensation{grid-column:1 / span 8;grid-row:7;display:flex;flex-direction:column}.job-full-time{grid-column:9 / span 4;grid-row:7;display:flex;flex-direction:column}.email-body{display:flex;flex-direction:column;grid-column:1 / span 12;grid-row:8 / span 3;max-width:100%;max-height:100%;resize:none;height:400px}label{font-size:0.8rem;font-family:var(--font-family);color:orangered}label input[type='checkbox']{position:relative;height:100%;width:100%;margin:0;opacity:0;cursor:pointer}.job-full-time{position:relative}.checkbox-container{position:relative;margin:0 auto;margin-top:0.75rem;height:100%;background-color:#565656;border-radius:500px;width:65%}.knob{position:absolute;top:50%;left:0;transform:translate(0, -50%);width:var(--knob-size);height:var(--knob-size);background-color:orangered;border-radius:50%;transition:all 0.2s ease-in-out;pointer-events:none}input[type='checkbox']+.knob:after{width:100%;height:100%;position:absolute;display:flex;justify-content:center;align-items:center;transition:0.3s ease all, left 0.3s cubic-bezier(0.17, 0.89, 0.35, 1.15)}input[type='checkbox']:not(:checked)+.knob:after{content:'NO';color:white}input[type='checkbox']:checked+.knob:after{content:'\\2713';color:#357652;font-size:1.5rem}input[type='checkbox']:checked+.knob{top:50%;left:calc(100% - var(--knob-size));background-color:#92c95c;}input[type='checkbox']{opacity:1;top:0;right:0;left:0;bottom:0;box-sizing:border-box;position:absolute}input[type='checkbox']:not(:checked):before{position:absolute;top:0;right:0;left:0;bottom:0;background-color:#565656;border-radius:2px}input[type='checkbox']:checked:after{position:absolute;top:0;right:0;left:0;bottom:0;background-color:#565656;border-radius:2px}input,textarea{background:#565656;border:none;color:white;padding:0.5rem;font-size:16px;margin-top:0.75rem;border-radius:3px;outline:none;backface-visibility:hidden;}input,textarea,input[type='checkbox']{outline:1px solid transparent;outline-offset:2px}input:focus{outline:2px solid orangered}textarea:focus{outline:2px solid orangered}.email-body>textarea{height:100%;resize:none;font-family:'Roboto', sans-serif;padding:0.5rem}button:not(.close-button),input[type='submit']{border-radius:3rem;max-height:50%;margin-top:calc(25% / 2);cursor:pointer;outline:none;font-family:var(--font-family);transition:all cubic-bezier(0.165, 0.84, 0.44, 1) 0.3s;line-height:0.85rem;font-size:0.85rem}input[type='submit']{grid-column:10 / 13;grid-row:13;border:none}.clear-button{grid-column:07 / 10;grid-row:13;background-color:transparent;color:orangered;border:2px solid white;box-sizing:border-box}.clear-button:hover{background-color:orangered;color:white}.clear-button:focus{outline:3px solid orangered}.send-button:focus{outline:3px solid orangered}.send-button:active,.clear-button:active{transform:scale(0.95);background-color:white;color:black}.send-button:hover{background:orangered;color:white}.hidden{display:none}.block{display:block}pre{white-space:pre-wrap}";

const EmailModal$1 = class extends H {
  constructor() {
    super();
    this.__registerHost();
    this.__attachShadow();
    this.mouseTrapClick = createEvent(this, "mouseTrapClick", 7);
    this.sendEmail = createEvent(this, "send-email", 7);
    this.closeModal = createEvent(this, "closeModal", 7);
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
    this.open = false;
    this.handleInputChange = (event) => {
      const { name, value } = event.target;
      this[name] = value;
    };
    this.mouseTrapClickHandler = (event) => {
      this.mouseTrapClick.emit(event);
    };
    this.sendEmailHandler = () => {
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
    };
    this.onSubmit = (e) => {
      e.preventDefault();
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
      return (h("div", { class: this.open ? "block" : "hidden" }, h("aside", { class: "email-modal" }, h("button", { class: "close-button", onClick: this.mouseTrapClickHandler }, h("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", width: "24", height: "24" }, h("path", { fill: "none", d: "M0 0h24v24H0z" }), h("path", { d: "M13.414 12l5.293 5.293-1.414 1.414-5.293-5.293-5.293 5.293-1.414-1.414L10.586 12 5.293 6.707l1.414-1.414L12 10.586l5.293-5.293 1.414 1.414L13.414 12z" }))), h("form", { class: "email-form scrollbar", onKeyDown: (e) => this.handleSpecialKeys(e), onSubmit: (e) => this.onSubmit(e) }, h("label", { htmlFor: "employerEmail", class: "return-address" }, "Your Email Address*", h("input", { autoFocus: true, id: "emailInput", type: "email", onKeyDown: (e) => this.handleSpecialKeys(e), onChange: (e) => this.handleInputChange(e), name: "employerEmail", value: this.employerEmail, placeholder: "Enter your email address", required: true })), h("label", { htmlFor: "employerName", class: "sender-name" }, "Employer Name*", h("input", { type: "text", onChange: (e) => this.handleInputChange(e), onKeyDown: (e) => this.handleSpecialKeys(e), name: "employerName", value: this.employerName, placeholder: "Seasonal Decorations Inc", required: true })), h("label", { htmlFor: 'roleOrTitle', class: "job-role" }, "Job Role or Title*", h("input", { type: "text", onChange: (e) => this.handleInputChange(e), onKeyDown: (e) => this.handleSpecialKeys(e), name: "roleOrTitle", value: this.roleOrTitle, placeholder: "3D Ornament designer", required: true })), h("label", { htmlFor: "employerWebsite", class: "employer-website" }, "Website", h("input", { type: "url", onChange: (e) => this.handleInputChange(e), onKeyDown: (e) => this.handleSpecialKeys(e), name: "employerWebsite", value: this.employerWebsite, placeholder: "https://www.seasonaldecorations.com" })), h("label", { htmlFor: "jobCity", class: "job-city" }, "City*", h("input", { type: "text", onChange: (e) => this.handleInputChange(e), onKeyDown: (e) => this.handleSpecialKeys(e), name: "jobCity", value: this.jobCity, placeholder: "Gillette", required: true })), h("label", { htmlFor: "jobState", class: "job-state" }, "State*", h("input", { type: "text", onChange: (e) => this.handleInputChange(e), onKeyDown: (e) => this.handleSpecialKeys(e), name: "jobState", value: this.jobState, placeholder: "WY", required: true })), h("label", { htmlFor: "jobZip", class: "job-zip" }, "Zip*", h("input", { type: "text", pattern: "[0-9][0-9][0-9][0-9][0-9]", onChange: (e) => this.handleInputChange(e), onKeyDown: (e) => this.handleSpecialKeys(e), name: "jobZip", value: this.jobZip, placeholder: "10001", required: true })), h("label", { htmlFor: "jobCompensation", class: "job-compensation" }, "Compensation*", h("input", { type: "text", onChange: (e) => this.handleInputChange(e), onKeyDown: (e) => this.handleSpecialKeys(e), name: "jobCompensation", value: this.jobCompensation, placeholder: "$15/hr, $30k/yr, etc", required: true })), h("label", { htmlFor: "jobFullTime", class: "job-full-time" }, "Full-Time", h("div", { class: 'checkbox-container' }, h("input", { type: "checkbox", onChange: (e) => this.handleInputChange(e), name: "jobFullTime", checked: this.jobFullTime }), h("div", { class: "knob" }))), h("label", { htmlFor: "message", class: "email-body" }, "Message For Badge Holders*", h("textarea", { class: "scrollbar", onChange: (e) => this.handleInputChange(e), onKeyDown: (e) => this.handleSpecialKeys(e), name: "message", value: this.message, placeholder: 'write you message here', required: true })), h("button", { class: "clear-button", onClick: () => this.clearMessageHandler() }, "Clear"), h("input", { type: "submit", class: "send-button", onClick: () => this.sendEmailHandler(), value: "Send" })), h("div", { class: "guide scrollbar" }, h("h1", null, "Helpful tips"), h("hr", null), h("ul", null, h("li", null, "Be sure to include your email address so that badge holders can respond to you."), h("li", null, "Be sure to include your name so that badge holders know who you are."), h("li", null, "Be sure to include a message so that badge holders know why you are contacting them.")), h("h2", null, "Example:"), h("pre", null, "### Job title ", h("br", null), "   ", "Fabrication Engineer", h("br", null), h("br", null), "### Job Description ", h("br", null), "   ", "We are looking for someone who is interested in ", h("br", null), " ", " ", " working with a wide variety of materials and tools. ", h("br", null), "* Using the workshop tools in AREA 59, ", h("br", null), "   ", "  including: CNC machines, soldering irons, ", h("br", null), "   ", "  (Fusion 360) 3D printers, and glue sticks,", h("br", null), "   ", "  construct seasonal decorations according ", h("br", null), "   ", "  to established specifications, and address ", h("br", null), "   ", "  any emergent issues with specifications ", h("br", null), "   ", "  discovered during the manufacturing process.", h("br", null), "### Additional requirements ", h("br", null), "   ", " ", h("br", null), "   ", "* $13.59/hr up to $21.09/hr ", h("br", null), "   ", "* Gillette, Wy - Full Time (6m probationary period) ", h("br", null), "   ", "* 30-40hrs / week ", h("br", null), "   ", "* U.S. Holidays off, one day per month sick-time ", h("br", null), "   ", "* Must be able to lift 40lbs", h("br", null), "   ", "* Must be able to work with fine details ", h("br", null), "   ", " ", h("br", null), h("br", null), h("br", null), "### About the Company ", h("br", null), "We are a small, family owned business located in Gillette, Wy. We make decorations for the holidays, as well as other seasonal items."))), h("div", { class: "mouse-trap", onClick: (e) => this.mouseTrapClickHandler(e) })));
    };
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
    return (this.open ? this.renderModal() : h("div", null));
  }
  get el() { return this; }
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

const pioneerProjectAppCss = ":root{--cap-fill:blue}:host{display:grid;grid-template-columns:1fr 1fr;grid-gap:calc(1rem);grid-template-rows:repeat(auto-fill, minmax(calc(100px + 1rem), 1fr));width:980px;height:100vh;box-sizing:border-box}.section_search{grid-area:1 / 1 / span 8 / span 1;background:#050108;border-radius:15px;padding:1rem}.section_selections{grid-area:1 / 2 / span 8 / span 1;border-radius:15px;padding:0 1rem 1rem 0;display:flex;flex-direction:column}.section_selections>*{margin-bottom:1rem}";

const PioneerProjectApp$1 = class extends H {
  constructor() {
    super();
    this.__registerHost();
    this.__attachShadow();
    this.subSets = '[]';
    this.searchLoading = false;
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
    // add the contactSubsets intersection recipeients to the email
    const recipients = this.contactSubSets.map((subset) => subset.intersection.map(x => {
      return x.recipient;
    })).flat();
    email.selectedBadges = this.courses;
    email.recipients = recipients;
    console.log('email from pp-app', email);
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
  render() {
    return (h(Host, null, h("div", { class: "section_search" }, h("search-bar", { loader: this.loaderSrc, loading: this.searchLoading }), h("search-result-repeater", { badges: this.queryResults })), h("div", { class: "section_selections" }, h("selected-courses", { courses: this.courses }), h("contact-groups", { subSets: this.contactSubSets }), h("chosen-groups", { subSets: this.parseSubSets(this.subSets) })), h("email-modal", { open: this.modalOpen })));
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

const toolTipCss = ":host{display:block;--tool-tip-width:100px;--tool-tip-background-color:#eee}.tooltip{position:relative;display:inline-block}.tooltip .tooltiptext{visibility:hidden;width:var(--tool-tip-width);background-color:var(--tool-tip-background-color);color:black;text-align:center;padding:5px;border-radius:6px;box-shadow:1px 1px 1px #232323;position:absolute;z-index:1;font-family:comic-sans}.tooltip:hover .tooltiptext{visibility:visible}.tooltip_right{top:-5px;left:120%}.center_right{top:50%;left:120%;transform:translate(0%, -50%)}.tooltip_right::after{content:' ';position:absolute;top:50%;right:100%;margin-top:-5px;border-width:5px;border-style:solid;border-color:transparent var(--tool-tip-background-color) transparent transparent}.tooltip_left{top:-5px;right:120%}.tooltip_left::after{content:' ';position:absolute;top:calc(50% - 5px);left:100%;margin-right:-5px;border-width:5px;border-style:solid;border-color:transparent transparent transparent var(--tool-tip-background-color)}.tooltip_above{bottom:100%;left:50%;margin-left:calc(-1 * calc(var(--tool-tip-width) / 2))}.tooltip_above::after{content:' ';position:absolute;top:100%;right:50%;margin-right:-5px;border-width:5px;border-style:solid;border-color:var(--tool-tip-background-color) transparent transparent transparent}.tooltip_below{top:100%;left:50%;margin-left:calc(-1 * calc(var(--tool-tip-width) / 2))}.tooltip_below::after{content:' ';position:absolute;bottom:100%;left:50%;margin-left:-5px;border-width:5px;border-style:solid;border-color:transparent transparent var(--tool-tip-background-color) transparent}";

const ToolTip$1 = class extends H {
  constructor() {
    super();
    this.__registerHost();
    this.__attachShadow();
    this.children = [];
  }
  componentWillLoad() {
    let slotted = this.host.shadowRoot.querySelector('slot');
    this.children = slotted.assignedNodes().filter(node => {
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
const EmailModal = /*@__PURE__*/proxyCustomElement(EmailModal$1, [1,"email-modal",{"open":[4],"message":[32],"employerName":[32],"employerEmail":[32],"roleOrTitle":[32],"employerWebsite":[32],"jobCity":[32],"jobState":[32],"jobZip":[32],"jobCompensation":[32],"jobFullTime":[32]},[[8,"onkeydown","handleKeyDown"]]]);
const GroupCard = /*@__PURE__*/proxyCustomElement(GroupCard$1, [1,"group-card"]);
const PioneerProjectApp = /*@__PURE__*/proxyCustomElement(PioneerProjectApp$1, [1,"pioneer-project-app",{"queryResults":[1025,"query-results"],"loaderSrc":[1,"loader-src"],"subSets":[1,"sub-sets"],"searchLoading":[4,"search-loading"],"searchResults":[32],"courses":[32],"contactSubSets":[32],"modalOpen":[32]},[[0,"addCourse","addCourse"],[0,"removeCourse","removeCourse"],[0,"clear-search","clearSearch"],[0,"emailIconClicked","emailIconClicked"],[0,"toggleModal","toggleModal"],[0,"mouseTrapClick","mouseTrapClick"],[0,"openEditor","openEditor"],[0,"send-email","sendEmail"]]]);
const SearchBar = /*@__PURE__*/proxyCustomElement(SearchBar$1, [1,"search-bar",{"loading":[4],"loader":[1],"query":[32]}]);
const SearchResultRepeater = /*@__PURE__*/proxyCustomElement(SearchResultRepeater$1, [1,"search-result-repeater",{"badges":[1],"test":[4]}]);
const SearchResultRepeaterItem = /*@__PURE__*/proxyCustomElement(SearchResultRepeaterItem$1, [1,"search-result-repeater-item",{"badgeData":[16]}]);
const SelectedCourses = /*@__PURE__*/proxyCustomElement(SelectedCourses$1, [1,"selected-courses",{"courses":[16],"coursesState":[32]}]);
const SubsetCard = /*@__PURE__*/proxyCustomElement(SubsetCard$1, [1,"subset-card",{"group":[16],"actionType":[1,"action-type"]}]);
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
  ToolTip
    ].forEach(cmp => {
      if (!customElements.get(cmp.is)) {
        customElements.define(cmp.is, cmp, opts);
      }
    });
  }
};

defineCustomElements();
