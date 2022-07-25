import { Toast } from "bootstrap";

export function truncateString(str, max)
{
    if (str.length <= max) {
        return str;
    }

    return str.substr(0, max) + '...';
}

export function showToastMsg(msg)
{
    let elem = document.getElementById('msgToast');
    elem.querySelector('.toast-body').innerHTML = msg;
    const toast = Toast.getOrCreateInstance(elem);
    toast.show();
}
