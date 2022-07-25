import { DashboardViewLogic } from "./dashboard_view_logic";
import { TestbedViewLogic } from "./testbed_view_logic";
import { UsersViewLogic } from "./users_view_logic";

export function createViewLogic(viewName, userId)
{
    switch (viewName) {
        case 'dashboard': new DashboardViewLogic(userId); break;
        case 'users': new UsersViewLogic(userId); break;
        case 'testbed': new TestbedViewLogic(userId); break;
    }
}
