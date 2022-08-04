import { Outlet } from "react-router-dom";
import { PageLink, PageNavbar } from "../components/PageNav";

export default function UsersLayout() {
    return (
        <>
            <PageNavbar>
                <PageLink to="roles">Roles</PageLink>
                <PageLink to="manage-user">Manage User</PageLink>
            </PageNavbar>

            <Outlet />
        </>
    );
}
