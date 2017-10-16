export default class Link {
    constructor() {
        this.link = document.createElement("a");
    }

    setPath (href) {
        this.link.href = href;
    }

    getPath (href) {
        var path = this.link.pathname;
        if (path[0] != '/') {
            path = '/' + path;
        }
        return path;
    }

    getHash (href) {
        return this.link.hash;
    }
}