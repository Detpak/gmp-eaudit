import { useState } from "react";
import { useEffect } from "react";
import { Card, Form, FormLabel, Spinner, Table } from "react-bootstrap";
import { Route, Routes, useParams } from "react-router-dom";
import httpRequest from "../api";
import { ImageModal } from "../components/ImageModal";
import LoadingButton from "../components/LoadingButton";
import { getCategoryString, waitForMs } from "../utils";

function ApproveForm() {
    const params = useParams();
    const [isLoading, setLoading] = useState(true);
    const [isSubmitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState(null);
    const [ca, setCA] = useState(null);
    const [remarks, setRemarks] = useState('');
    const [formError, setFormError] = useState(null);

    const closeCA = async () => {
        if (!confirm('Are you sure?')) return;
        setSubmitting(true);

        const formData = {
            id: params.caId,
            remarks: remarks
        };

        return (await httpRequest.post('api/v1/close-corrective-action', formData)).data;
    };

    const fetchData = async () => {
        const response = await httpRequest.get(`api/v1/get-corrective-action/${params.caId}`);

        if (response.data.finding.status != 1) {
            throw { msg: 'The corrective action has been approved.' };
        }

        setCA(response.data);
    };

    useEffect(() => {
        fetchData().then(() => {
            setLoading(false);
        })
        .catch((reason) => {
            setMessage(reason.msg);
            setLoading(false);
        });
    }, []);

    return isLoading || message ?
        <Card.Body>
            <div className="p-4">
                <div className="text-center">
                {message == null ? (
                    <>
                        <Spinner animation="border" size="lg" />
                        <h5 className="py-2">Loading</h5>
                    </>
                    ) : message
                }
                </div>
            </div>
        </Card.Body>
        :
        <>
            <Card.Body>
                <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Corrective Action Details</Form.Label>
                    <Table>
                        <tbody>
                            <tr>
                                <th>Date</th>
                                <td>{(new Date(ca.created_at)).toLocaleString()}</td>
                            </tr>
                            <tr>
                                <th>Audit Date</th>
                                <td>{(new Date(ca.finding.created_at)).toLocaleString()}</td>
                            </tr>
                            <tr>
                                <th>Case ID</th>
                                <td>{ca.finding.code}</td>
                            </tr>
                            <tr>
                                <th>Auditee</th>
                                <td>{ca.auditee.name}</td>
                            </tr>
                            <tr>
                                <th>Department</th>
                                <td>{ca.finding.record.area.department.name}</td>
                            </tr>
                            <tr>
                                <th>Area</th>
                                <td>{ca.finding.record.area.name}</td>
                            </tr>
                            <tr>
                                <th>Criteria</th>
                                <td>{ca.finding.ca_name} ({ca.finding.ca_code})</td>
                            </tr>
                            <tr>
                                <th>Category</th>
                                <td>{getCategoryString(ca.finding.category)}</td>
                            </tr>
                        </tbody>
                    </Table>
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control as="textarea" rows={3} value={ca.desc} disabled />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Images ({ca.images_count})</Form.Label>
                    <div>
                        <ImageModal src={`api/v1/fetch-corrective-action-images/${params.caId}`} disabled={ca.images_count == 0} />
                    </div>
                </Form.Group>
                <hr />
                <Form.Group>
                    <Form.Label>Approval Remarks</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        value={remarks}
                        onChange={ev => setRemarks(ev.target.value)}
                        disabled={isSubmitting}
                        isInvalid={formError && formError.desc}
                    />
                    <Form.Control.Feedback type="invalid">{formError && formError.remarks ? formError.remarks : ''}</Form.Control.Feedback>
                </Form.Group>
            </Card.Body>
            <Card.Footer className="p-3 hstack justify-content-end">
                <LoadingButton
                    onClick={closeCA}
                    afterLoading={responseData => {
                        if (responseData.formError) {
                            setFormError(transformErrors(responseData.formError));
                            setSubmitting(false);
                            return;
                        }

                        if (responseData.result == 'error') {
                            setMessage(responseData.msg);
                            return;
                        }

                        setMessage('Corrective action successfully approved!');
                        setSubmitting(false);
                    }}
                >
                    Done
                </LoadingButton>
            </Card.Footer>
        </>
}

export default function ApproveCorrectiveActionLayout() {
    return (
        <Card className="audit-card mx-sm-auto mx-2 my-2 w-auto">
            <Card.Header className="p-3">
                <h3 className="fw-bold display-spacing m-0">Approve Corrective Action</h3>
            </Card.Header>
            <Routes>
                <Route path="/approve-ca/:caId" element={<ApproveForm />} />
            </Routes>
        </Card>
    );
}
