import { faEnvelopesBulk, faImage } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { useEffect } from "react";
import { Button, Card, Form, Modal, ProgressBar, Spinner, Table } from "react-bootstrap";
import { Route, Routes, useParams } from "react-router-dom";
import httpRequest from "../api";
import FileInput from "../components/FileInput";
import { RequiredSpan } from "../components/LabelSpan";
import { getCategoryString, scrollToElementById, waitForMs } from "../utils";

function CorrectiveActionForm({ caData, setCAData, formError }) {
    const params = useParams();
    const [finding, setFinding] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        const auditeeCheck = await httpRequest.get(`api/v1/ensure-auditee-privilege/${params.findingId}`);
        if (auditeeCheck.data.result == 'error') {
            throw auditeeCheck.data;
        }

        const caseFinding = await httpRequest.get(`api/v1/get-finding/${params.findingId}`);
        setFinding(caseFinding.data);
        setCAData({ ...caData, finding_id: caseFinding.data.id });
    };

    useEffect(() => {
        fetchData().then(() => {
            setLoading(false);
        })
        .catch((reason) => {
            console.log(reason);
            setLoading(false);
            setErrorMsg(reason.msg);
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
            {(!loading && errorMsg == null) &&
                <>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Case Details</Form.Label>
                        <Table>
                            <tbody>
                                <tr>
                                    <th>Record ID</th>
                                    <td>{finding.record.code}</td>
                                </tr>
                                <tr>
                                    <th>Case ID</th>
                                    <td>{finding.code}</td>
                                </tr>
                                <tr>
                                    <th>Auditor</th>
                                    <td>{finding.record.auditor.name}</td>
                                </tr>
                                <tr>
                                    <th>Department</th>
                                    <td>{finding.record.area.department.name}</td>
                                </tr>
                                <tr>
                                    <th>Area</th>
                                    <td>{finding.record.area.name}</td>
                                </tr>
                                <tr>
                                    <th>Category</th>
                                    <td>{getCategoryString(finding.category)}</td>
                                </tr>
                                <tr>
                                    <th>Weight</th>
                                    <td>{finding.ca_weight}%</td>
                                </tr>
                                <tr>
                                    <th>Deducted Weight</th>
                                    <td>{finding.ca_weight * (finding.weight_deduct / 100.0)}%</td>
                                </tr>
                            </tbody>
                        </Table>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Description <RequiredSpan /></Form.Label>
                        <Form.Control
                            as="textarea"
                            id="desc"
                            rows={3}
                            value={caData.description}
                            onChange={(ev) => {
                                setCAData({ ...caData, desc: ev.target.value });
                            }}
                            isInvalid={formError && formError.desc}
                        />
                        <Form.Control.Feedback type="invalid">{formError && formError.desc ? formError.desc : ''}</Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Images</Form.Label>
                        <FileInput
                            accept="image/*"
                            files={caData.images}
                            setFiles={(files) => {
                                setCAData({ ...caData, images: files });
                            }}
                        >
                            <FontAwesomeIcon icon={faImage} /> Add Images
                        </FileInput>
                    </Form.Group>
                </>
            }
        </>
    )
}

export default function CorrectiveActionMain() {
    const [caData, setCAData] = useState({ finding_id: null, desc: '', images: [] });
    const [formError, setFormError] = useState(null);
    const [isSubmitting, setSubmitting] = useState(false);
    const [submitProgress, setSubmitProgress] = useState(0);

    const submit = async () => {
        const formData = new FormData();

        formData.append('finding_id', caData.finding_id);
        formData.append('desc', caData.desc);

        caData.images.forEach((image) => {
            formData.append('images[]', image);
        });

        const config = {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: progressEvent => {
                setSubmitProgress(Math.round(progressEvent.loaded) / progressEvent.total * 90);
            }
        };

        const response = await httpRequest.post('api/v1/add-corrective-action', formData, config);

        if (response.data.formError) {
            const errors = _.mapValues(response.data.formError, (value) => value[0]);
            setFormError(errors);
            setSubmitting(false);
            return;
        }

        setSubmitProgress(100);
        await waitForMs(500);

        setFormError(null);
        setSubmitting(false);
    };

    return (
        <>
            <Card className="audit-card mx-sm-auto mx-2 my-2 w-auto">
                <Card.Header className="p-3">
                    <h3 className="fw-bold display-spacing m-0">Create Corrective Action</h3>
                </Card.Header>
                <Card.Body>
                    <Routes>
                        <Route path="/corrective-action/:findingId" element={<CorrectiveActionForm caData={caData} setCAData={setCAData} formError={formError} />} />
                    </Routes>
                </Card.Body>
                <Card.Footer className="p-3 hstack justify-content-end">
                    <Button
                        onClick={(ev) => {
                            ev.target.blur();
                            setSubmitting(true);
                            submit();
                        }}
                    >
                        <FontAwesomeIcon icon={faEnvelopesBulk} /> Submit
                    </Button>
                </Card.Footer>
            </Card>

            <Modal
                show={isSubmitting}
                onExited={() => {
                    setSubmitProgress(0);
                    if (formError != null) {
                        scrollToElementById(Object.keys(formError)[0]); // Scroll to the first error.
                    }
                }}
                centered
            >
                <Modal.Body className="p-4">
                    <div className="w-100">
                        <h3 className="fw-bold display-spacing">Please Wait</h3>
                        <div className="mb-1">Submitting...</div>
                        <ProgressBar
                            now={submitProgress}
                            style={{ height: '0.25rem' }}
                            max={100}
                            animated
                        />
                    </div>
                </Modal.Body>
            </Modal>
        </>
    );
}
