import { AuditViewLogic } from "./audit_view_logic";
import { DashboardViewLogic } from "./dashboard_view_logic";
import { TestbedViewLogic } from "./testbed_view_logic";
import { UsersViewLogic } from "./users_view_logic";
import { WorkCenterViewLogic } from "./work_center_view_logic";

export function createViewLogic(viewName)
{
    switch (viewName) {
        case 'dashboard': new DashboardViewLogic(); break;
        case 'audit': new AuditViewLogic(); break;
        case 'work-center': new WorkCenterViewLogic(); break;
        case 'users': new UsersViewLogic(); break;
        case 'testbed': new TestbedViewLogic(); break;
    }
}
