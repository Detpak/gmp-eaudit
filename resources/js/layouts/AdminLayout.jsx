import React, { useEffect } from 'react';
import { Toast } from 'react-bootstrap';
import { faCheck, faPowerOff } from '@fortawesome/free-solid-svg-icons';
import { menus, rootUrl } from '../utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import _ from 'lodash';
import { PageButtons, PageRoutes } from './PageManager';
import AppContext from './AppContext';
import { useContext } from 'react';
import httpRequest from '../api';
import { globalState } from '../app_state';

function ToastWrapper() {
    const [toastMsg, setToastMsg] = globalState.useGlobalState('toastMsg');
    const closeToast = () => setToastMsg({ ...toastMsg, shown: false });

    return (
        <div className="position-fixed top-0 start-50 translate-middle-x p-3">
            <Toast onClose={closeToast} show={toastMsg.shown} delay={3000} autohide>
                <Toast.Body>{toastMsg.msg}</Toast.Body>
            </Toast>
        </div>
    );
}

export default function AdminLayout() {

    useEffect(() => {

        console.log('updated');
    }, []);

    return (
        <>
            <div className="d-flex flex-row main">
                <div className="d-flex flex-column min-vh-100 p-2 bg-primary bg-gradient text-white" style={{ minWidth: '100px' }}>
                    <PageButtons />
                    <a role="button" href={rootUrl('audit')} className="text-white">
                        <FontAwesomeIcon icon={faCheck} className="menu-icon d-block mx-auto"/>
                        <div className="menu-text text-center m-0">Submit Audit</div>
                    </a>
                    {/* <a role="button" href={rootUrl('deauth')} className="text-white">
                        <FontAwesomeIcon icon={faPowerOff} className="menu-icon d-block mx-auto"/>
                        <div className="menu-text text-center m-0">Logout</div>
                    </a> */}
                </div>
                <div className="vh-100 flex-fill bg-white overflow-auto">
                    <div className="d-flex flex-column h-100">
                        <PageRoutes />
                    </div>
                </div>
            </div>

            <ToastWrapper />
        </>
    );
}
