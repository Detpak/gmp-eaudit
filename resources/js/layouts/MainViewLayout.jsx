import React from 'react';
import { Toast } from 'react-bootstrap';
import { faCheck, faPowerOff } from '@fortawesome/free-solid-svg-icons';
import { menus, rootUrl } from '../utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { PageLink, PageNavbar } from "../components/PageNav";
import { Routes, Route, Navigate, Outlet, NavLink } from "react-router-dom";
import DashboardLayout from './DashboardLayout';
import AuditCyclesLayout from "./audit/AuditCyclesLayout";
import AuditRecordsLayout from "./audit/AuditRecordsLayout";
import RolesLayout from "./users/RolesLayout";
import ManageUserLayout from "./users/ManageUserLayout";
import DepartmentLayout from './workplace/DepartmentLayout';
import WorkplaceAreaLayout from './workplace/WorkplaceAreaLayout';
import EntityLayout from './workplace/EntityLayout';
import DivisionLayout from './workplace/DivisionLayout';
import PlantLayout from './workplace/PlantLayout';
import CriteriaLayout from './evaluation/CriteriaLayout';
import CriteriaGroupLayout from './evaluation/CriteriaGroupLayout';
import AuditFindingsLayout from './audit/AuditFindingsLayout';
import DevMenuLayout from './DevMenuLayout';
import _ from 'lodash';
import CorrectiveActionLayout from './audit/CorrectiveActionLayout';

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

function AuditOutlet() {
    return (
        <>
            <PageNavbar>
                <PageLink to="cycles">Cycles</PageLink>
                <PageLink to="records">Records</PageLink>
                <PageLink to="findings">Case Findings</PageLink>
                <PageLink to="corrective">Corrective Actions</PageLink>
            </PageNavbar>

            <Outlet />
        </>
    );
}

function ParametersOutlet() {
    return (
        <>
            <PageNavbar>
                <PageLink to="criteria">Criteria</PageLink>
                <PageLink to="criteria-group">Criteria Group</PageLink>
            </PageNavbar>

            <Outlet />
        </>
    );
}

function WorkplaceOutlet() {
    return (
        <>
            <PageNavbar>
                <PageLink to="entity">Entity</PageLink>
                <PageLink to="division">Division</PageLink>
                <PageLink to="plant">Plant</PageLink>
                <PageLink to="department">Department</PageLink>
                <PageLink to="area">Area</PageLink>
            </PageNavbar>

            <Outlet />
        </>
    );
}

function UsersOutlet() {
    return (
        <>
            <PageNavbar>
                <PageLink to="roles">Roles</PageLink>
                <PageLink to="manage-user">User Management</PageLink>
            </PageNavbar>

            <Outlet />
        </>
    );
}

export function MainViewLayout() {
    const [toastMsgState, setToastMsgState, updateToastMsgState] = window.globalStateStore.useState("toastMsg");
    const closeToast = () => updateToastMsgState((value) => ({ toastShown: false, msg: value.msg }));

    return (
        <>
            <div className="d-flex flex-row main">
                <div className="d-flex flex-column min-vh-100 p-2 bg-primary bg-gradient text-white" style={{ minWidth: '100px' }}>
                    <Sidebar />
                    <a role="button" href={rootUrl('audit')} className="text-white mb-3">
                        <FontAwesomeIcon icon={faCheck} className="menu-icon d-block mx-auto"/>
                        <div className="menu-text text-center m-0">Audit</div>
                    </a>
                    <a role="button" href={rootUrl('deauth')} className="text-white">
                        <FontAwesomeIcon icon={faPowerOff} className="menu-icon d-block mx-auto"/>
                        <div className="menu-text text-center m-0">Logout</div>
                    </a>
                </div>
                <div className="vh-100 flex-fill bg-white overflow-auto">
                    <div className="d-flex flex-column h-100">
                        <Routes>
                            <Route path="/app/dashboard" element={<DashboardLayout />} />

                            <Route path="/app/audit" element={<AuditOutlet />}>
                                <Route index element={<Navigate to="/app/audit/cycles" replace />} />
                                <Route path="cycles" element={<AuditCyclesLayout />} />
                                <Route path="records" element={<AuditRecordsLayout />} />
                                <Route path="findings" element={<AuditFindingsLayout />} />
                                <Route path="corrective" element={<CorrectiveActionLayout />} />
                                <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
                            </Route>

                            <Route path="/app/parameters" element={<ParametersOutlet />}>
                                <Route index element={<Navigate to="/app/parameters/criteria" replace />} />
                                <Route path="criteria" element={<CriteriaLayout />} />
                                <Route path="criteria-group" element={<CriteriaGroupLayout />} />
                            </Route>

                            <Route path="/app/workplace" element={<WorkplaceOutlet />}>
                                <Route index element={<Navigate to="/app/workplace/entity" replace />} />
                                <Route path="entity" element={<EntityLayout />} />
                                <Route path="division" element={<DivisionLayout />} />
                                <Route path="plant" element={<PlantLayout />} />
                                <Route path="department" element={<DepartmentLayout />} />
                                <Route path="area" element={<WorkplaceAreaLayout />} />
                                <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
                            </Route>

                            <Route path="/app/users" element={<UsersOutlet />}>
                                <Route index element={<Navigate to="/app/users/roles" replace />} />
                                <Route path="roles" element={<RolesLayout /> } />
                                <Route path="manage-user" element={<ManageUserLayout />} />
                                <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
                            </Route>

                            {document.querySelector("meta[name='development']") && <Route path="/app/dev-menu" element={<DevMenuLayout />} />}

                            <Route path="/app/*" element={<Navigate to="/app/dashboard" replace />} />
                        </Routes>
                    </div>
                </div>
            </div>

            <div className="position-fixed top-0 start-50 translate-middle-x p-3">
                <Toast onClose={closeToast} show={toastMsgState.toastShown} delay={3000} autohide>
                    <Toast.Body>{toastMsgState.msg}</Toast.Body>
                </Toast>
            </div>
        </>
    );
}
