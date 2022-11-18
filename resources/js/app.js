import './bootstrap';
import '../sass/app.scss';
import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import httpRequest from './api';
import 'chart.js/auto';
import App from './layouts/Main';

$(function() {
    axios.defaults.headers.common["X-Requested-With"] ="XMLHttpRequest";
    axios.defaults.headers.common["X-CSRF-TOKEN"] = document.querySelector("meta[name='csrf-token']").content;

    window.appToken = document.querySelector("meta[name='token']");
    if (window.appToken) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${window.appToken.content}`;
    }

    httpRequest.rootUrl = document.querySelector("meta[name='root-url']").content;
    document.querySelector("meta[name='root-url']").remove();

    if (document.querySelector("meta[name='page']")) {
        window.currentPageMode = document.querySelector("meta[name='page']").content;
    }

    if (window.appToken && document.getElementById('main-container')) {
        ReactDOM.render(<App mode={window.currentPageMode} />, document.getElementById('main-container'));
    }
});
