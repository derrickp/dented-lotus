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

export function getHash(): string {
    let hashString = window.location.hash;
    if (hashString && hashString.trim() !== "") {
        hashString = hashString.substr(1);
    }
    return hashString;
}