export function getUrlParameters(): any {
    const query = {};
    const qs = window.location.search.substring(1);
    const vars = qs.split("&");
    vars.forEach(element => {
        const es = element.split("=");
        query[es[0]] = es[1];
    });
    return query;
}