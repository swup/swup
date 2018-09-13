module.exports = function(options, callback = false) {
    let defaults = {
        url: window.location.pathname + window.location.search,
        method: "GET",
        data: null
    }

    let data = {
        ...defaults,
        ...options
    }

    let request = new XMLHttpRequest()

    request.onreadystatechange = function() {
        if (request.readyState === 4) {
            if (request.status !== 500) {
                callback(request.responseText, request)
            } else {
                callback(null, request)
            }
        }
    }

    request.open(data.method, data.url, true)
    request.setRequestHeader("X-Requested-With", "swup")
    request.send(data.data)
    return request
}