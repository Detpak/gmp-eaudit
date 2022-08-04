import { Nav, Navbar } from "react-bootstrap";
import { NavLink } from "react-router-dom";

export function PageNavbar({ children }) {
    return (
        <Navbar bg="light" className="p-3">
            <Nav variant="pills" className="nav me-auto" navbar={false}>
                {children}
            </Nav>
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
