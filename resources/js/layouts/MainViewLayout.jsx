import React from 'react';
import { faChartLine, faListCheck, faUsers } from '@fortawesome/free-solid-svg-icons';
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
    return (
        <div className="d-flex flex-row main">
            <div className="d-flex flex-column min-vh-100 p-2 bg-primary bg-gradient text-white" style={{width: '110px'}}>
                <Sidebar />
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
    );
}
