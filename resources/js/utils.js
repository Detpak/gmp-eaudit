import { faChartLine, faFlaskVial, faIndustry, faListCheck, faPercent, faPowerOff, faUsers } from '@fortawesome/free-solid-svg-icons';
import React from 'react';
import $ from 'jquery';
import httpRequest from './api';

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
        name: 'Parameters',
        link: 'parameters',
        icon: faPercent,
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
        name: 'Dev Menu',
        link: 'dev-menu',
        icon: faFlaskVial,
        maxAccessLevel: 1
    });
}

export function rootUrl(url) {
    return httpRequest.rootUrl + url;
}

export function showToastMsg(msg) {
    window.globalStateStore.getState("toastMsg").updateValue((value) => ({ toastShown: true, msg: msg }));
}

export function useIsMounted() {
    const isMounted = React.useRef(true);

    React.useEffect(() => {
        return () => {
          isMounted.current = false;
        };
    }, []);

    return isMounted;
}

export async function waitForMs(time) {
    await new Promise((resolve) => setTimeout(resolve, time));
}

export function scrollToElementById(id) {
    const target = document.getElementById(id);

    if (target) {
        window.scrollTo({
            top: $(target).offset().top,
            behavior: "smooth"
        });
    }
}

export function getCategoryString(category) {
    switch (category) {
        case 0: return "Observation";
        case 1: return "Minor NC";
        case 2: return "Major NC";
    }

    return null;
}
