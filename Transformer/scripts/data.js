/*global window*/
// get hash map for key -> value transformation
function getHashMap() {
    var o = window.localStorage.map;
    var a = JSON.parse(o);

    var map = new Map();

    for (var i = 0;
    (i + 1) < a.length; i += 2) {
        map.put(a[i], a[i + 1]);
    }

    return map;
}
