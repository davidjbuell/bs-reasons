this.addEventListener("install", function(event) {
    console.log(event);
    event.waitUntil(
        caches.open("v1").then(function(cache) {
            return cache.addAll(["/includes/reasonForm.html"]);
        })
    );
});

this.addEventListener("fetch", function(event) {
    var response;
    console.log(event);
    event.respondWith(
        caches
            .match(event.request)
            .catch(function() {
                return fetch(event.request);
            })
            .then(function(r) {
                response = r;
                caches.open("v1").then(function(cache) {
                    cache.put(event.request, response);
                });
                return response.clone();
            })
            .catch(function() {
                return "oops";
            })
    );
});
