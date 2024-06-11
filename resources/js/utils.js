import { faChartLine, faFlaskVial, faIndustry, faListCheck, faPercent, faPowerOff, faUsers } from '@fortawesome/free-solid-svg-icons';
import React from 'react';
import $ from 'jquery';
import httpRequest from './api';
import _ from 'lodash';
import { globalState } from './app_state';
import { useState } from 'preact/hooks';

export const menus = [
    {
        name: 'Dashboard',
        link: 'dashboard',
        icon: faChartLine,
        access: {
            main: 'Main'
        },
    },
    {
        name: 'Audit',
        link: 'audit',
        icon: faListCheck,
        access: {
            cycles: 'Cycles',
            records: 'Records',
            findings: 'Case Findings',
            corrective: 'Corrective Actions',
        },
    },
    {
        name: 'Parameters',
        link: 'parameters',
        icon: faPercent,
        access: {
            criteria: 'Criteria',
            criteria_group: 'Criteria Group',
        }
    },
    {
        name: 'Workplace',
        link: 'workplace',
        icon: faIndustry,
        access: {
            entity: 'Entity',
            division: 'Division',
            plant: 'Plant',
            department: 'Department',
            area: 'Area',
        },
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
    globalState.setGlobalState('toastMsg', { toastShown: true, msg: msg });
}

export async function updateUserData() {
    const response = await httpRequest.get(`api/v1/get-current-user`);
    globalState.setGlobalState('userData', response.data.result);
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

export function useStatus() {
    const [processing, setProcessing] = React.useState(false);
    const [message, setMessage] = React.useState('');

    return {
        isProcessing: processing,
        message: message,
        setProcessing: (shouldProcess) => setProcessing(shouldProcess),
        setMessage: (newMsg) => setMessage(newMsg),
        resetMessage: () => setMessage('')
    }
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

// Transforms laravel's message bag
export function transformErrors(errors) {
    return _.mapValues(errors, (value) => value[0]);
}
