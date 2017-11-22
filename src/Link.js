export default class Link {
    constructor() {
        this.link = document.createElement("a");
    }

    setPath (href) {
        this.link.href = href;
    }

    getPath () {
        var path = this.link.pathname;
        if (path[0] != '/') {
            path = '/' + path;
        }
        return path;
    }

    getAddress () {
        var path = this.link.pathname + this.link.search;
        if (path[0] != '/') {
            path = '/' + path;
        }
        return path;
    }

    getHash () {
        return this.link.hash;
    }
}