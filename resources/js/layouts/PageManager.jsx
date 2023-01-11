import { faChartLine, faCog, faIndustry, faListCheck, faPercent, faUser, faUsers } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import _, { runInContext } from "lodash";
import React from "react";
import { Spinner } from "react-bootstrap";
import { Navigate, NavLink, Outlet, Route, Routes } from "react-router-dom";
import { globalState } from "../app_state";
import { PageLink, PageNavbar } from "../components/PageNav";
import AuditCyclesLayout from "./audit/AuditCyclesLayout";
import AuditFindingsLayout from "./audit/AuditFindingsLayout";
import AuditRecordsLayout from "./audit/AuditRecordsLayout";
import CorrectiveActionLayout from "./audit/CorrectiveActionLayout";
import DashboardLayout from "./DashboardLayout";
import CriteriaGroupLayout from "./evaluation/CriteriaGroupLayout";
import CriteriaLayout from "./evaluation/CriteriaLayout";
import ProfileLayout from "./ProfileLayout";
import ManageUserLayout from "./users/ManageUserLayout";
import RolesUserLayout from "./users/RolesLayout";
import DepartmentLayout from "./workplace/DepartmentLayout";
import DivisionLayout from "./workplace/DivisionLayout";
import EntityLayout from "./workplace/EntityLayout";
import PlantLayout from "./workplace/PlantLayout";
import WorkplaceAreaLayout from "./workplace/WorkplaceAreaLayout";
import DevMenuLayout from "./DevMenuLayout";
import AuditDeptRecordsLayout from "./audit/AuditDeptRecordsLayout";
import { useEffect } from "react";
import { useState } from "react";

export const routes = [
    {
        name: 'Dashboard',
        link: 'dashboard',
        icon: faChartLine,
        page: DashboardLayout
    },
    {
        name: 'Audit',
        link: 'audit',
        icon: faListCheck,
        index: 'cycles',
        pages: {
            cycles: { name: 'Cycles', element: AuditCyclesLayout },
            dept_records: { name: 'Department Records', element: AuditDeptRecordsLayout },
            records: { name: 'Area Records', element: AuditRecordsLayout },
            findings: { name: 'Case Findings', element: AuditFindingsLayout},
            corrective: { name: 'Corrective Actions', element: CorrectiveActionLayout },
        },
    },
    {
        name: 'Parameters',
        link: 'parameters',
        icon: faPercent,
        index: 'criteria',
        pages: {
            criteria: { name: 'Criteria', element: CriteriaLayout },
            cgroup: { name: 'Criteria Group', element: CriteriaGroupLayout },
        }
    },
    {
        name: 'Workplace',
        link: 'workplace',
        icon: faIndustry,
        index: 'entity',
        pages: {
            entity: { name: 'Entity', element: EntityLayout },
            division: { name: 'Division', element: DivisionLayout },
            plant: { name: 'Plant', element: PlantLayout },
            department: { name: 'Department', element: DepartmentLayout },
            area: { name: 'Area', element: WorkplaceAreaLayout },
        },
    },
    {
        name: 'Users',
        link: 'users',
        icon: faUsers,
        index: 'roles',
        pages: {
            roles: { name: 'Roles', element: RolesUserLayout },
            manage_user: { name: 'User Management', element: ManageUserLayout },
        }
    },
    {
        name: 'My Profile',
        link: 'profile',
        icon: faUser,
        page: ProfileLayout,
        noRestrict: true,
    },
    {
        name: 'Dev',
        link: 'dev',
        icon: faCog,
        page: DevMenuLayout,
    }
];

export function SuperAdminRoutes() {
    return (
        <Routes>
            {routes.map((route, routeKey) => {
                const routeLink = `/app/${route.link}`;

                if (route.page) {
                    return <Route key={routeKey} path={routeLink} element={React.createElement(route.page)} />
                }

                const outlet = () => (
                    <>
                        <PageNavbar>
                            {Object
                                .keys(route.pages)
                                .map((pageLink, key) => (<PageLink key={key} to={pageLink}>{route.pages[pageLink].name}</PageLink>))}
                        </PageNavbar>

                        <Outlet />
                    </>
                );

                return (
                    <Route key={routeKey} path={routeLink} element={React.createElement(outlet)}>
                        {Object.keys(route.pages)
                            .map((pageLink, pageKey) => (
                                <React.Fragment key={pageKey}>
                                    {pageKey == 0 && <Route index element={<Navigate to={`${routeLink}/${pageLink}`} replace />} />}
                                    <Route path={pageLink} element={React.createElement(route.pages[pageLink].element)} />
                                </React.Fragment>
                            ))
                        }
                    </Route>
                )
            })}
        </Routes>
    )
}

export function UserRoutes({ userData }) {
    return (
        <Routes>
            {routes
                .filter(route =>
                    route.noRestrict || userData.access[route.link] != null &&
                    (_.isBoolean(userData.access[route.link]) && userData.access[route.link] ||
                    _.some(Object.values(userData.access[route.link]), value => _.isBoolean(value) && value)))
                .map((route, routeKey) => {
                    const routeLink = `/app/${route.link}`;

                    if (route.page) {
                        return <Route key={routeKey} path={routeLink} element={React.createElement(route.page)} />
                    }

                    const outlet = () => (
                        <>
                            <PageNavbar>
                                {Object.keys(route.pages)
                                    .filter((page) => userData.access[route.link][page])
                                    .map((pageLink, key) => (
                                        <PageLink key={key} to={pageLink}>{route.pages[pageLink].name}</PageLink>
                                    ))
                                }
                            </PageNavbar>

                            <Outlet />
                        </>
                    );

                    return (
                        <Route key={routeKey} path={routeLink} element={React.createElement(outlet)}>
                            {Object.keys(route.pages)
                                .filter((page) => userData.access[route.link] != null && userData.access[route.link][page])
                                .map((pageLink, pageKey) => (
                                    <React.Fragment key={pageKey}>
                                        {pageKey == 0 && <Route index element={<Navigate to={`${routeLink}/${pageLink}`} replace />} />}
                                        <Route path={pageLink} element={React.createElement(route.pages[pageLink].element)} />
                                    </React.Fragment>
                                ))
                            }
                        </Route>
                    )
                })
            }
        </Routes>
    )
}

export function PageRoutes() {
    const [userData, setUserData] = globalState.useGlobalState('userData');

    return (
        <>
            {userData == null ?
                <div className="vstack justify-content-center w-100 h-100 text-center p-2">
                    <div>
                        <Spinner animation="border" />
                    </div>
                    <h5>Please Wait</h5>
                </div>
                :
                userData.superadmin ? <SuperAdminRoutes /> : <UserRoutes userData={userData} />
            }
        </>
    )
}

export function PageButtons() {
    const [userData, setUserData] = globalState.useGlobalState('userData');
    const [allowedRoutes, setAllowedRoutes] = useState([]);

    useEffect(() => {
        if (userData == null) return;
        if (!userData.superadmin) {
            setAllowedRoutes(routes
                .filter(route =>
                    route.noRestrict || userData.access[route.link] != null &&
                    (_.isBoolean(userData.access[route.link]) && userData.access[route.link] ||
                    _.some(Object.values(userData.access[route.link]), value => _.isBoolean(value) && value))));
        }
        else {
            setAllowedRoutes(routes);
        }
    }, [userData]);

    return (
        <ul className="nav nav-pills flex-column mb-auto">
            {userData == null &&
                <div className="w-100 text-center p-2">
                    <Spinner animation="border" />
                </div>
            }
            {userData != null && allowedRoutes
                .map((route, key) => {
                    return (
                        <li key={key} className="nav-item">
                            <NavLink to={`app/${route.link}`} className={({ isActive }) => `nav-link ${isActive ? 'active bg-white text-primary' : 'text-white'} px-2 mb-1`}>
                                <FontAwesomeIcon icon={route.icon} className="menu-icon d-block mx-auto"/>
                                <div className="menu-text text-center m-0">{route.name}</div>
                            </NavLink>
                        </li>
                    );
                })
            }
        </ul>
    )
}
