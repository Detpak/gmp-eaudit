import { faChartLine, faFlaskVial, faIndustry, faListCheck, faPowerOff, faUsers } from '@fortawesome/free-solid-svg-icons';

export const menus = [
    {
        name: 'Dashboard',
        link: 'dashboard',
        icon: faChartLine,
        maxAccessLevel: 2,
    },
    {
        name: 'Audit',
        link: 'audit',
        icon: faListCheck,
        maxAccessLevel: 2,
    },
    {
        name: 'Workplace',
        link: 'workplace',
        icon: faIndustry,
        maxAccessLevel: 2,
    },
    {
        name: 'Users',
        link: 'users',
        icon: faUsers,
        maxAccessLevel: 2,
    }
];

if (document.querySelector("meta[name='development']")) {
    menus.push({
        name: 'Testbed',
        link: 'testbed',
        icon: faFlaskVial,
        maxAccessLevel: 1
    });
}

export function rootUrl(url) {
    return window.rootUrl + url;
}

export function showToastMsg(msg) {
    window.globalStateStore.getState("toastMsg").updateValue((value) => ({ toastShown: true, msg: msg }));
}
