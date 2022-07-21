import './bootstrap';
import 'bootstrap';
import $ from 'jquery';
import counterUp from 'counterup2';
import { createViewLogic } from './view_logic_factory';

$(function() {
    axios.defaults.headers.common["X-Requested-With"] ="XMLHttpRequest";
    axios.defaults.headers.common["X-CSRF-TOKEN"] = document.querySelector("meta[name='csrf-token']").content;

    let userId = document.querySelector("meta[name='userid']");
    let viewtype = document.querySelector("meta[name='viewtype']");

    if (viewtype && userId) {
        createViewLogic(viewtype.content, userId.content);
    }

    // const el = document.querySelector('.counter');

    // counterUp(el, { duration: 1000, delay: 16 });
});

//counterUp(el, { duration: 1000, delay: 16 });
