export function query(selector, context = document) {
    if (typeof selector !== 'string') {
        return selector;
    }

    return context.querySelector(selector);
}

export function queryAll(selector, context = document) {
    if (typeof selector !== 'string') {
        return selector;
    }

    return Array.prototype.slice.call(context.querySelectorAll(selector));
}