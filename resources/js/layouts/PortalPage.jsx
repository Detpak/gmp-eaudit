import { useState } from "react";
import { Button, Card, Modal, Spinner } from "react-bootstrap";
import { globalState } from "../app_state";
import { rootUrl } from "../utils";
import { ProfileForm } from "./ProfileLayout";

export default function PortalPage() {
    const [userData, _] = globalState.useGlobalState('userData');
    const [showProfileModal, setShowProfileModal] = useState(false);

    return (
        <>
            <Card className="audit-card mx-sm-auto mx-2 my-2 w-auto">
                <Card.Body>
                    {userData ?
                        <div className="vstack gap-2">
                            {userData.admin_access && <Button href={rootUrl('app')}>Go to Admin Page</Button>}
                            {userData.auditor && <Button href={rootUrl('audit')}>Submit Audit</Button>}
                            {userData.auditee && <Button href={rootUrl('corrective-action')}>Create Corrective Action</Button>}
                            <Button onClick={() => setShowProfileModal(true)}>Edit Profile</Button>
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

            <Modal show={showProfileModal} onHide={() => setShowProfileModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Profile</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <ProfileForm onSuccess={() => setShowProfileModal(false)} />
                </Modal.Body>
            </Modal>
        </>
    );
}
