import React from 'react';
import { faChartLine, faListCheck, faPowerOff, faUsers } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { NavLink } from 'react-router-dom';
import { Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from './DashboardLayout';
import AuditLayout from './AuditLayout';
import AuditCyclesLayout from "./AuditCyclesLayout";
import AuditRecordsLayout from "./AuditRecordsLayout";
import UsersLayout from "./UsersLayout";
import RolesLayout from "./RolesLayout";
import ManageUserLayout from "./ManageUserLayout";
import { Toast } from 'react-bootstrap';
import { rootUrl } from '../utils';

const menus = [
    {
        name: 'Dashboard',
        link: 'dashboard',
        icon: faChartLine,
    },
    {
        name: 'Audit',
        link: 'audit',
        icon: faListCheck,
    },
    {
        name: 'Users',
        link: 'users',
        icon: faUsers
    }
];

function Sidebar() {
    return (
        <ul className="nav nav-pills flex-column mb-auto">
            {menus.map((data) => {
                return (
                    <li key={`${data.link}-li`} className="nav-item">
                        <NavLink to={`app/${data.link}`} className={({ isActive }) => `nav-link ${isActive ? 'active bg-white text-primary' : 'text-white'} px-2 mb-1`}>
                            <FontAwesomeIcon icon={data.icon} className="menu-icon d-block mx-auto"/>
                            <div className="menu-text text-center m-0">{data.name}</div>
                        </NavLink>
                    </li>
                );
            })}
        </ul>
    )
}

export function MainViewLayout() {
    const [toastMsgState, setToastMsgState, updateToastMsgState] = window.globalStateStore.useState("toastMsg");
    const closeToast = () => updateToastMsgState((value) => ({ shown: false, msg: value.msg }));

    return (
        <>
            <div className="d-flex flex-row main">
                <div className="d-flex flex-column min-vh-100 p-2 bg-primary bg-gradient text-white" style={{width: '110px'}}>
                    <Sidebar />
                    <a role="button" href={rootUrl('deauth')} className="text-white">
                        <FontAwesomeIcon icon={faPowerOff} className="menu-icon d-block mx-auto"/>
                        <div className="menu-text text-center m-0">Logout</div>
                    </a>
                </div>
                <div className="vh-100 flex-fill bg-white overflow-auto">
                    <div className="d-flex flex-column h-100">
                        <Routes>
                            <Route path="/app/dashboard" element={<DashboardLayout />} />

                            <Route path="/app/audit" element={<AuditLayout />}>
                                <Route index element={<Navigate to="/app/audit/cycles" replace />} />
                                <Route path="cycles" element={<AuditCyclesLayout />} />
                                <Route path="records" element={<AuditRecordsLayout />} />
                                <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
                            </Route>

                            <Route path="/app/users" element={<UsersLayout />}>
                                <Route index element={<Navigate to="/app/users/roles" replace />} />
                                <Route path="roles" element={<RolesLayout /> } />
                                <Route path="manage-user" element={<ManageUserLayout />} />
                                <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
                            </Route>

                            <Route path="/app/*" element={<Navigate to="/app/dashboard" replace />} />
                        </Routes>
                    </div>
                </div>
            </div>

            <div className="position-fixed top-0 start-50 translate-middle-x p-3">
                <Toast onClose={closeToast} show={toastMsgState.shown} delay={3000} autohide>
                    <Toast.Body>{toastMsgState.msg}</Toast.Body>
                </Toast>
            </div>
        </>
    );
}
