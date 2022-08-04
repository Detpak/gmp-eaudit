import { Toast } from "bootstrap";

export function truncateString(str, max)
{
    if (str.length <= max) {
        return str;
    }

    return str.substr(0, max) + '...';
}

export function showToastMsg(msg, error = false)
{
    let elem = document.getElementById('msgToast');

    if (error) {
        elem.classList.add('text-bg-danger');
        elem.querySelector('.btn-close').classList.add('btn-close-white');
    }
    else {
        elem.classList.remove('text-bg-danger');
        elem.querySelector('.btn-close').classList.remove('btn-close-white');
    }

    elem.querySelector('.toast-body').innerHTML = msg;

    const toast = Toast.getOrCreateInstance(elem);
    toast.show();
}
