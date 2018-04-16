module.exports = function(location, callback) {
    var request = new XMLHttpRequest()

    request.onreadystatechange = function() {
        if (request.readyState === 4) {
            if (request.status !== 500) {
                callback(request.responseText, request)
            }
            else {
                callback(null, request)
            }
        }
    }

    request.open("GET", location, true)
    request.setRequestHeader("X-Requested-With", "swup")
    request.send(null)
    return request
}