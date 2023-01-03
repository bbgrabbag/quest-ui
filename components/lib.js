export const registerComponents = (components) => {
    components.forEach(c => {
        if (!c.tagName) throw `<${c.name}> component missing attribute 'tagName'`
        customElements.define(c.tagName, c)
    })
}

export class _Component extends HTMLElement {

    constructor() {
        super();
        if (!this.tagName) throw `Components must have a 'tagName' attribute`
        this.attachShadow({ mode: 'open' });
        this._elements = {};
        this.eventListeners = [];
        this._isElementMapRegistered = false;
    }

    get _attrs() {
        return this.observedAttributes
    }

    get elements() {
        return Object.freeze({ ...this._elements });
    }

    setState(setter) {
        const prev = this.state;
        this.state = setter(this.state);
        if (!this.onStateChange) throw `no 'onStateChange()' method found on component <${this.tagName}>`
        this.onStateChange(prev);
        this._updateElementsMap(this.shadowRoot);
    }

    emit(action) {
        if (!this.onEvent) throw `no 'onEvent() method found on component <${this.tagName}>`
        this.onEvent(action);
        this._updateElementsMap(this.shadowRoot);
    }

    connectedCallback() {
        this._render();
        this.onMount ? this.onMount() : null;
    }

    disconnectedCallback() {
        this._unRegisterEventListeners();
        this.onDismount ? this.onDismount() : null;
    }

    attributeChangedCallback(name, prev, current) {
        if (!this._isElementMapRegistered) return;
        this.onAttrChange(name, prev, current);
    }

    _registerEventListeners(node) {
        this.eventListeners.forEach(config => {
            const el = node.querySelector(config.selector);
            if (!el) throw `No element matches selector '${config.selector}'. Check render() method of ${this.tagName}`
            el.addEventListener(config.event, config.listener)
        });
    }

    _unRegisterEventListeners() {
        this.eventListeners.forEach(config => {
            const el = this.shadowRoot.querySelector(config.selector);
            if (!el) throw `No element matches selector '${config.selector}'. Check render() method of ${this.tagName}`
            el.removeEventListener(config.event, config.listener)
        });
    }

    _getStyles() {
        let output = '';
        if (!this.css) return output;
        if (this.css.extends) output += this.css.extends.map(url => `@import url('${url}');`);
        if (this.css.styles) output += this.css.styles;
        return `<style>${output}</style>`;
    }

    _createTemplate() {
        const template = document.createElement('template');
        template.innerHTML = `${this._getStyles()}${this.render()}`;
        return template.content.cloneNode(true);
    }

    _generateElementsMap(elements) {
        if (!elements.length) return {};
        return elements.reduce((o, c) => {
            const isWC = customElements.get(c.localName);
            const id = c.getAttribute('key') || c.id;
            if (id) o[id] = c;
            if (isWC) return o;
            return { ...o, ...this._generateElementsMap(Array.from(c.children)) }
        }, {})
    }

    _updateElementsMap(node) {
        this._elements = this._generateElementsMap(Array.from(node.children));
        if (!this._isElementMapRegistered) this._isElementMapRegistered = true;
    }

    _render() {
        if (!this.render) throw `No render() method found on component <${this.tagName}>`;
        const template = this._createTemplate()
        this._updateElementsMap(template);
        this._registerEventListeners(template);
        this.shadowRoot.append(template);
    }
}

export class _Service {
    constructor() {
        this.subscribers = [];
    }

    subscribe(handler) {
        this.subscribers.push(handler);
        return () => this.unsubscribe(handler)
    }

    unsubscribe(handler) {
        const i = this.subscribers.indexOf(handler);
        if (i == -1) return;
        this.subscribers.slice(this.subscribers.indexOf(handler), 1)
    }

    emit(event) {
        this.subscribers.forEach(s => s(event));
    }
}