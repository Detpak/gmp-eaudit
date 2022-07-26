import './bootstrap';
import 'bootstrap';
import 'bootstrap-table';
import $ from 'jquery';
import { createViewLogic } from './view_logic_factory';
import "gridjs/dist/theme/mermaid.css";

$(function() {
    axios.defaults.headers.common["X-Requested-With"] ="XMLHttpRequest";
    axios.defaults.headers.common["X-CSRF-TOKEN"] = document.querySelector("meta[name='csrf-token']").content;
    axios.defaults.headers.common["Authorization"] = `Bearer ${document.querySelector("meta[name='token']").content}`;

    let viewtype = document.querySelector("meta[name='viewtype']");

    if (viewtype) {
        createViewLogic(viewtype.content);
    }
});
