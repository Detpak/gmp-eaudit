import { DashboardViewLogic } from "./dashboard_view_logic";

export function createViewLogic(viewName, userId)
{
    switch (viewName) {
        case 'dashboard': new DashboardViewLogic(userId); break;
    }
}
