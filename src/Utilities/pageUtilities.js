"use strict";
function getUrlParameters() {
    var query = {};
    var qs = window.location.search.substring(1);
    var vars = qs.split("&");
    vars.forEach(function (element) {
        var es = element.split("=");
        query[es[0]] = es[1];
    });
    return query;
}
exports.getUrlParameters = getUrlParameters;
