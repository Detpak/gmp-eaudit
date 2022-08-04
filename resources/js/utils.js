export function rootUrl(url) {
    return window.rootUrl + (url[0] == '/' ? '' : '/') + url;
}

export function showToastMsg(msg) {
    window.globalStateStore.getState("toastMsg").updateValue((value) => ({ shown: true, msg: msg }));
}
