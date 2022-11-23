import { useContext } from "react";
import { Nav, Navbar, NavDropdown, Spinner } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import { globalState } from "../app_state";
import AppContext from "../layouts/AppContext";
import { rootUrl } from "../utils";

export function PageNavbar({ className, children }) {
    const [userData, _] = globalState.useGlobalState('userData');

    return (
        <Navbar bg="light" className={`p-3 ${className}`}>
            <Nav variant="pills" className="nav me-auto" navbar={false}>
                {children}
            </Nav>
            <NavDropdown
                title={userData == null ? <Spinner size="sm" animation="border" /> : userData.name}
                className="px-3"
                id="nav-dropdown"
                align="end"
            >
                <NavDropdown.Item href={rootUrl('deauth')}>Logout</NavDropdown.Item>
            </NavDropdown>
        </Navbar>
    );
}

export function PageLink({ to, children }) {
    return (
        <Nav.Item>
            <NavLink to={to} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                {children}
            </NavLink>
        </Nav.Item>
    );
}

export function PageContent({ children }) {
    return (
        <div className="flex-fill overflow-auto">
            <div className="d-flex flex-column h-100">
                {children}
            </div>
        </div>
    );
}

export function PageContentTopbar({ children }) {
    return (
        <nav className="navbar bg-white px-1 py-3">
            <div className="container-fluid justify-content-start">
                {children}
            </div>
        </nav>
    );
}

export function PageContentView({ children, className }) {
    return (
        <div className={`flex-fill overflow-auto px-4 ${className ? className : ""}`}>
            {children}
        </div>
    )
}
