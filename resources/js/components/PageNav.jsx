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
        <div className={`flex-fill overflow-auto px-4 ${className}`}>
            {children}
        </div>
    )
}
