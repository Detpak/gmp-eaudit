import { Button, Card, Spinner } from "react-bootstrap";
import { globalState } from "../app_state";
import { rootUrl } from "../utils";

export default function PortalPage() {
    const [userData, _] = globalState.useGlobalState('userData');

    return (
        <Card className="audit-card mx-sm-auto mx-2 my-2 w-auto">
            <Card.Body>
                {userData ?
                    <div className="vstack gap-2">
                        {userData.admin_access && <Button href={rootUrl('app')}>Go to Admin Page</Button>}
                        {userData.auditor && <Button href={rootUrl('audit')}>Submit Audit</Button>}
                        {userData.auditee && <Button href={rootUrl('corrective-action')}>Create Corrective Action</Button>}
                        <hr />
                        <Button href={rootUrl('deauth')} variant="danger">Logout</Button>
                    </div>
                    :
                    <div className="p-4">
                        <div className="text-center">
                            <Spinner animation="border" size="lg" />
                            <h5 className="py-2">Loading</h5>
                        </div>
                    </div>
                }
            </Card.Body>
        </Card>
    );
}
