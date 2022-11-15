import './bootstrap';
import '../sass/app.scss';
import React from 'react';
import ReactDOM from 'react-dom';
import { MainViewLayout } from './layouts/MainViewLayout';
import $ from 'jquery';
import { BrowserRouter } from 'react-router-dom';
import { createStore } from 'state-pool';
import AuditProcessLayout from './layouts/AuditProcessLayout';
import httpRequest from './api';
import 'chart.js/auto';
import CorrectiveActionMain from './layouts/CorrectiveActionMain';
import ApproveCorrectiveActionLayout from './layouts/ApproveCorrectiveActionLayout';

$(function() {
    axios.defaults.headers.common["X-Requested-With"] ="XMLHttpRequest";
    axios.defaults.headers.common["X-CSRF-TOKEN"] = document.querySelector("meta[name='csrf-token']").content;

    window.appToken = document.querySelector("meta[name='token']");
    if (window.appToken) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${window.appToken.content}`;
    }

    httpRequest.rootUrl = document.querySelector("meta[name='root-url']").content;
    document.querySelector("meta[name='root-url']").remove();

    window.globalStateStore = createStore();
    window.globalStateStore.setState("userData", null);
    window.globalStateStore.setState("toastMsg", { toastShown: false, msg: "" });

    if (document.querySelector("meta[name='page']")) {
        window.currentPageMode = document.querySelector("meta[name='page']").content;
    }

    if (window.appToken && document.getElementById('main-container')) {
        switch (window.currentPageMode) {
            case 'audit':
                ReactDOM.render(<AuditProcessLayout />, document.getElementById('main-container'));
                break;
            case 'corrective_action':
                ReactDOM.render(<BrowserRouter><CorrectiveActionMain /></BrowserRouter>, document.getElementById('main-container'));
                break;
            case 'approve_ca':
                ReactDOM.render(<BrowserRouter><ApproveCorrectiveActionLayout /></BrowserRouter>, document.getElementById('main-container'));
                break;
            default:
                ReactDOM.render(<BrowserRouter><MainViewLayout /></BrowserRouter>, document.getElementById('main-container'));
                break;
        }
    }
});
