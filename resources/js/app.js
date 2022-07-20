import './bootstrap';
import 'bootstrap';
import $ from 'jquery';
import counterUp from 'counterup2';

$(function() {
    const el = document.querySelector('.counter');

    counterUp(el, { duration: 1000, delay: 16 });
});

//counterUp(el, { duration: 1000, delay: 16 });
