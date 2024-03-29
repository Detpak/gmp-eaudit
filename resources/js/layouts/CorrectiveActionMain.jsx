import { faArrowRotateRight, faEnvelopesBulk, faImage, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { useEffect } from "react";
import { Button, Card, Form, InputGroup, ListGroup, Modal, ProgressBar, Spinner, Table } from "react-bootstrap";
import { NavLink, Route, Routes, useNavigate, useParams } from "react-router-dom";
import httpRequest from "../api";
import FileInput from "../components/FileInput";
import { RequiredSpan } from "../components/LabelSpan";
import { getCategoryString, scrollToElementById, waitForMs } from "../utils";

export function CorrectiveActionForm({ findingId, afterSubmit }) {
    const [finding, setFinding] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formError, setFormError] = useState(null);
    const [isSubmitting, setSubmitting] = useState(false);
    const [submitProgress, setSubmitProgress] = useState(0);
    const [caData, setCAData] = useState({ finding_id: null, desc: '', images: [] });

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
            setFormError(transformErrors(response.data.formError));
            setSubmitting(false);
            return;
        }

        if (response.data.result == 'error') {
            setSubmitting(false);
            setErrorMsg(response.data.msg);
            return;
        }

        if (afterSubmit != null) {
            afterSubmit();
            return;
        }

        setSubmitProgress(100);
        await waitForMs(500);

        setFormError(null);
        setSubmitting(false);
        setErrorMsg('Corrective action successfully submitted!');
    };

    const fetchData = async () => {
        const auditeeCheck = await httpRequest.get(`api/v1/ensure-auditee-privilege/${findingId}`);
        if (auditeeCheck.data.result == 'error') {
            throw auditeeCheck.data;
        }

        const caseFinding = await httpRequest.get(`api/v1/get-finding/${findingId}`);
        setFinding(caseFinding.data);
        setCAData({ ...caData, finding_id: caseFinding.data.id });
    };

    useEffect(() => {
        fetchData().then(() => {
            setLoading(false);
        })
        .catch((reason) => {
            console.log(reason);
            setErrorMsg(reason.msg);
            setLoading(false);
        });
    }, []);

    return (
        <>
            {(loading || errorMsg != null) &&
                <Card.Body>
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
                </Card.Body>
            }
            {(!loading && errorMsg == null) &&
                <>
                    <Card.Body>
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
                                        <th>Criteria</th>
                                        <td>{finding.ca_name} ({finding.ca_code})</td>
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
                            <Form.Label className="fw-bold">Case Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                id="desc"
                                rows={3}
                                value={finding.desc}
                                disabled={true}
                            />
                        </Form.Group>
                        <hr/>
                        <Form.Group className="mb-3">
                            <Form.Label>Description <RequiredSpan /></Form.Label>
                            <Form.Control
                                as="textarea"
                                id="desc"
                                rows={3}
                                value={caData.desc}
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

                    <Modal
                        show={isSubmitting}
                        onExited={() => {
                            setSubmitProgress(0);
                            if (formError != null) {
                                scrollToElementById(Object.keys(formError)[0]); // Scroll to the first error.
                                return;
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
            }
        </>
    )
}

function CorrectiveActionFormWrapper() {
    const params = useParams();
    return (
        <Card className="audit-card mx-sm-auto mx-2 my-2 w-auto">
            <Card.Header className="p-3">
                <h3 className="fw-bold display-spacing m-0">Create Corrective Action</h3>
            </Card.Header>
            <CorrectiveActionForm findingId={params.findingId} />
        </Card>
    );
}

function SelectCaseFinding() {
    const [searchKeyword, setSearchKeyword] = useState('');
    const [showCurrentCycle, setShowCurrentCycle] = useState(true);
    const [isLoading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const navigate = useNavigate();

    const refresh = async _ => {
        let fetchUrl = "api/v1/fetch-findings";

        setLoading(true);

        if (showCurrentCycle) {
            const currentCycle = await httpRequest.get('api/v1/get-active-cycle');
            fetchUrl += `?cycle_id=${currentCycle.data.result.id}`;
        }

        const response = await httpRequest.get(fetchUrl);
        setData(response.data);

        setLoading(false);
    };

    useEffect(async () => {
        refresh();
    }, [showCurrentCycle]);

    return (
        <div className="audit-card mx-sm-auto w-auto vh-100 vstack">
            <div className="p-2 bg-white">
                <div className="hstack mb-3">
                    <Button variant="outline-primary" onClick={refresh} className="me-2"><FontAwesomeIcon icon={faArrowRotateRight} /></Button>
                    <InputGroup>
                        <Form.Control
                            type="text"
                            placeholder="Search Case Finding"
                            value={searchKeyword}
                            onChange={ev => setSearchKeyword(ev.target.value)}
                        />
                        <Button variant="outline-secondary" onClick={() => setSearchKeyword('')}>
                            <FontAwesomeIcon icon={faXmark} />
                        </Button>
                    </InputGroup>
                </div>
                <Form.Check
                    type="checkbox"
                    id="showCurrentCycle"
                    label="Show Current Cycle"
                    checked={showCurrentCycle}
                    onChange={_ => setShowCurrentCycle(!showCurrentCycle)}
                />
            </div>
            <hr className="my-0" />
            <div className="flex-fill overflow-auto">
                <ListGroup className="m-1">
                    {data.map((value, key) => (
                        <ListGroup.Item action key={key}>
                            <div className="fw-bold">{value.code} - {value.ca_name}</div>
                            <small>{new Date(value.created_at).toDateString()}</small>
                            {value.area_name}
                        </ListGroup.Item>
                    ))}
                </ListGroup>
                <div style={{ height: 1000 }} />
            </div>
        </div>
    );
}

export default function CorrectiveActionMain() {
    return (
        <Routes>
            <Route path="/corrective-action" element={<SelectCaseFinding />} />
            <Route path="/corrective-action/:findingId" element={<CorrectiveActionFormWrapper />} />
        </Routes>
    );
}
