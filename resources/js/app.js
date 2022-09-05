import './bootstrap';
import '../sass/app.scss';
import React from 'react';
import ReactDOM from 'react-dom';
import { MainViewLayout } from './layouts/MainViewLayout';
import $ from 'jquery';
import { BrowserRouter } from 'react-router-dom';
import { createStore } from 'state-pool';
import AuditProcessLayout from './layouts/AuditProcessLayout';

$(function() {
    axios.defaults.headers.common["X-Requested-With"] ="XMLHttpRequest";
    axios.defaults.headers.common["X-CSRF-TOKEN"] = document.querySelector("meta[name='csrf-token']").content;

    window.appToken = document.querySelector("meta[name='token']");
    if (window.appToken) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${window.appToken.content}`;
    }

    window.rootUrl = document.querySelector("meta[name='root-url']").content;

    window.globalStateStore = createStore();
    window.globalStateStore.setState("toastMsg", { toastShown: false, msg: "" });

    if (document.querySelector("meta[name='page']")) {
        window.currentPageMode = document.querySelector("meta[name='page']").content;
    }

    if (window.appToken && document.getElementById('main-container')) {
        if (window.currentPageMode && window.currentPageMode == 'audit') {
            ReactDOM.render(<AuditProcessLayout />, document.getElementById('main-container'));
        }
        else {
            ReactDOM.render(<BrowserRouter><MainViewLayout /></BrowserRouter>, document.getElementById('main-container'));
        }
    }
});
