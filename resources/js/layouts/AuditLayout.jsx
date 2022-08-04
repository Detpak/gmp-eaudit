import { Outlet } from "react-router-dom";
import { PageNavbar, PageLink } from "../components/PageNav";

export default function AuditLayout() {
    return (
        <>
            <PageNavbar>
                <PageLink to="cycles">Cycles</PageLink>
                <PageLink to="records">Records</PageLink>
            </PageNavbar>

            <Outlet />
        </>
    );
}
