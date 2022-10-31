import { useState } from "react";
import { useEffect } from "react";
import { Card, Spinner } from "react-bootstrap";
import { Route, Routes, useParams } from "react-router-dom";
import httpRequest from "../api";

function CorrectiveActionForm() {
    const params = useParams();
    const [auditee, setAuditee] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        const auditeeCheck = await httpRequest.get(`api/v1/ensure-auditee-privilege/${params.findingId}`);
        if (auditeeCheck.data.result == 'error') {
            throw auditeeCheck.data.result;
        }
    };

    useEffect(() => {
        console.log('test');
        fetchData().then(() => {
            setLoading(false);
        })
        .catch((reason) => {
            setLoading(false);
        });
    }, []);

    return (
        <>
            {(loading || errorMsg != null) &&
                <div className="p-4">
                    <div className="text-center">
                    {errorMsg == null ? (
                        <>
                            <Spinner animation="border" size="lg" />
                            <h5 className="py-2">Loading</h5>
                        </>
                        ) : errorMsg
                    }
                    </div>
                </div>
            }
        </>
    )
}

export default function CorrectiveActionMain() {
    return (
        <Card className="audit-card mx-sm-auto mx-2 my-2 w-auto">
            <Card.Header className="p-3">
                <h3 className="fw-bold display-spacing m-0">Create Corrective Action</h3>
            </Card.Header>
            <Card.Body>
                <Routes>
                    <Route path="/corrective-action/:findingId" element={<CorrectiveActionForm />} />
                </Routes>
            </Card.Body>
        </Card>
    );
}
