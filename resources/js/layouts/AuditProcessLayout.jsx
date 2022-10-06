import 'chart.js/auto';
import { faArrowLeft, faEnvelopesBulk, faImage } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import _ from "lodash";
import React, { useState } from "react";
import { useRef } from "react";
import { useEffect } from "react";
import { Accordion, Button, Card, Form, ListGroup, Modal, ProgressBar, Spinner, Table } from "react-bootstrap";
import { Doughnut } from "react-chartjs-2";
import DropdownList from "../components/DropdownList";
import FileInput from "../components/FileInput";
import CountUp from 'react-countup';
import { scrollToElementById, waitForMs } from "../utils";
import httpRequest from '../api';

function AuditProcessResult({ auditResult, setAuditResult }) {
    const [score, setScore] = useState(0);

    useEffect(() => {
        let failScore = 0;

        for (const finding of auditResult.findings) {
            failScore += finding.ca_weight;
        }

        setScore(100 - failScore);
    }, []);

    return (
        <>
            <Card.Header className="p-3">
                <h3 className="fw-bold display-spacing m-0">Audit Process Result</h3>
            </Card.Header>
            <Card.Body className="card-body">
                <h5 className="text-center">Total Score (%)</h5>
                <div className="mx-auto mb-3" style={{ width: 150 }}>
                    <div className="position-relative">
                        <div className="position-absolute" style={{ width: 150, height: 150 }}>
                            <div className="position-relative top-50 translate-middle-y text-center">
                                <h3 className="fw-bold display-spacing m-0"><CountUp end={score} duration={1} />/100</h3>
                            </div>
                        </div>
                    </div>
                    <Doughnut
                        data={{
                            labels: ['Passed', 'Fail'],
                            datasets: [
                                {
                                    label: 'test',
                                    data: [score, 100 - score],
                                    cutout: '90%',
                                    backgroundColor: [
                                        getComputedStyle(document.body).getPropertyValue('--bs-success'),
                                        getComputedStyle(document.body).getPropertyValue('--bs-danger'),
                                    ]
                                }
                            ],
                        }}
                        options={{
                            plugins: {
                                legend: { display: false }
                            }
                        }}
                    />
                </div>
                <Table className="align-middle">
                    <tbody>
                        <tr>
                            <th>Cycle ID:</th>
                            <td>{auditResult.cycle_id}</td>
                        </tr>
                        <tr>
                            <th>Record ID:</th>
                            <td>{auditResult.record_code}</td>
                        </tr>
                        <tr>
                            <th>Area:</th>
                            <td>{auditResult.area_name} ({auditResult.dept_name})</td>
                        </tr>
                        <tr>
                            <th>Criteria Passed:</th>
                            <td>{auditResult.num_criterias - auditResult.findings.length}</td>
                        </tr>
                        <tr>
                            <th>Criteria Failed:</th>
                            <td>{auditResult.findings.length}</td>
                        </tr>
                    </tbody>
                </Table>
                <div className="mb-3">Failed Criteria:</div>
                {auditResult.findings.length > 0 ? (
                    <Accordion alwaysOpen>
                        {auditResult.findings.map((finding, key) => (
                            <Accordion.Item key={key} eventKey={key}>
                                <Accordion.Header>
                                    <div className="vstack gap-2">
                                        <div className="fw-bold text-truncate">{finding.ca_name}</div>
                                        <small>{finding.ca_code} (Weight: {finding.ca_weight}%)</small>
                                    </div>
                                </Accordion.Header>
                                <Accordion.Body>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Description</Form.Label>
                                        <Form.Control as="textarea" rows={3} value={finding.desc} disabled />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Category</Form.Label>
                                        <div className="d-grid">
                                            <div className="btn-group" role="group">
                                                {["Observation", "Minor NC", "Major NC"].map((value, categoryIndex) => (
                                                    <React.Fragment key={categoryIndex}>
                                                        <input
                                                            type="radio"
                                                            className="btn-check"
                                                            name={`pass_catergory_${key}`}
                                                            value={categoryIndex}
                                                            checked={finding.category == categoryIndex}
                                                            id={`pass_catergory_${key}_${categoryIndex}`}
                                                            autoComplete="off"
                                                            disabled />
                                                        <label className="btn btn-outline-primary" htmlFor={`pass_catergory_${key}_${categoryIndex}`}>
                                                            {value}
                                                        </label>
                                                    </React.Fragment>
                                                ))}
                                            </div>
                                        </div>
                                    </Form.Group>
                                </Accordion.Body>
                            </Accordion.Item>
                        ))}
                    </Accordion>
                ) : (
                    <Card>
                        <Card.Body className="text-center">No failed criteria.</Card.Body>
                    </Card>
                )}
            </Card.Body>
            <Card.Footer className="p-3 hstack justify-content-end">
                <Button onClick={() => setAuditResult(null)}>
                    <FontAwesomeIcon icon={faArrowLeft} /> Back
                </Button>
            </Card.Footer>
        </>
    );
}

function AuditProcessForm({ setAuditResult }) {
    const [user, setUser] = useState(null);
    const [isLoading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);
    const [totalWeight, setTotalWeight] = useState(0);
    const [criteriaPassed, setCriteriaPassed] = useState(0);
    const [criteriaFailed, setCriteriaFailed] = useState(0);
    const [cycle, setCycle] = useState(null);
    const [record, setRecord] = useState(null);
    const [criteriaGroup, setCriteriaGroup] = useState(null);
    const [criterias, setCriterias] = useState([]);
    const [deptPIC, setDeptPIC] = useState([]);
    //const [isLoadingCriteria, setLoadingCriteria] = useState(false);
    const [isLoadingDeptPIC, setLoadingDeptPIC] = useState(false);
    const [criteriaPasses, setCriteriaPasses] = useState([]);
    const [formError, setFormError] = useState(null);
    const [isSubmitting, setSubmitting] = useState(false);
    const [submitMsg, setSubmitMsg] = useState('');
    const [maxProgress, setMaxProgress] = useState(0);
    const [submitProgress, setSubmitProgress] = useState(0);
    const date = useRef(new Date().toLocaleDateString('en-UK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));

    const fetchData = async () => {
        const userData = await httpRequest.get('api/v1/get-current-user');

        if (userData.data) {
            setUser(userData.data.result);
        }

        const activeCycle = await httpRequest.get('api/v1/get-active-cycle');

        if (activeCycle.data.result == null) {
            throw { result: 'error', msg: "Unable to continue audit process, there is no active cycle. Please contact QC administrator." };
        }

        activeCycle.data.result.formatted_start_date = new Date(activeCycle.data.result.start_date).toDateString();
        activeCycle.data.result.formatted_finish_date = new Date(activeCycle.data.result.finish_date).toDateString();
        setCycle(activeCycle.data.result);

        const cycleCriteriaGroup = await httpRequest.get(`api/v1/get-criteria-group/${activeCycle.data.result.cgroup_id}`);
        setCriteriaGroup(cycleCriteriaGroup.data);

        const cycleCriterias = await httpRequest.get(`api/v1/get-criteria-group-params/${activeCycle.data.result.cgroup_id}`);
        setCriterias(cycleCriterias.data);
    };

    // Recalculate summary values
    const recalculateSummary = (passes) => {
        let tmpTotalWeight = 0;
        let tmpCriteriaPassed = 0;
        let tmpCriteriaFailed = 0;
        let index = 0;

        for (const criteria of criterias) {
            if (!passes[index].fail) {
                tmpTotalWeight += criteria.weight;
                tmpCriteriaPassed += 1;
            }
            else {
                tmpCriteriaFailed += 1;
            }

            index++;
        }

        setTotalWeight(tmpTotalWeight);
        setCriteriaPassed(tmpCriteriaPassed);
        setCriteriaFailed(tmpCriteriaFailed);
    };

    // const handleSelectCriteriaGroup = (data) => {
    //     setCriteriaGroup(data);
    //     setLoadingCriteria(true);
    //     axios.get(`api/v1/get-criteria-group-params/${data.id}`)
    //         .then((response) => {
    //             setCriterias(response.data);
    //             setLoadingCriteria(false);
    //         })
    //         .catch(() => {
    //             setLoadingCriteria(false);
    //         });
    // };

    const handlePassesBtn = (ev, index) => {
        const tmpCriteriaPasses = criteriaPasses.slice();
        tmpCriteriaPasses[index].fail = ev.target.value !== 'true';

        if (tmpCriteriaPasses[index].fail) {
            tmpCriteriaPasses[index].info = {
                desc: '',
                category: 0,
                photos: []
            };
        }

        setCriteriaPasses(tmpCriteriaPasses);
        recalculateSummary(tmpCriteriaPasses);
    };

    const handleCategoryBtn = (ev, index) => {
        const tmpCriteriaPasses = criteriaPasses.slice();
        tmpCriteriaPasses[index].info.category = ev.target.value;

        setCriteriaPasses(tmpCriteriaPasses);
        recalculateSummary(tmpCriteriaPasses);
    };

    const handleSubmit = async () => {
        const formData = {};

        setMaxProgress(100);
        setSubmitMsg('Saving Information...');

        try {
            if (cycle) {
                formData.cycle_id = cycle.id;
            }

            if (user) {
                formData.auditor_id = user.id;
            }

            if (record) {
                formData.record_id = record.id;
            }

            if (criteriaGroup) {
                formData.cgroup_id = criteriaGroup.id;
            }

            if (criteriaPasses.length > 0) {
                formData.criteria_passes = criteriaPasses.map((data) => {
                    const tmpData = _.cloneDeep(data);
                    if (tmpData.info) {
                        delete tmpData.info.photos;
                    }
                    return tmpData;
                });
            }
        }
        catch (ex) {
            console.log(ex);
        }

        //console.log(formData);
        //console.log(JSON.stringify(formData));

        const submitResponse = await axios.post('api/v1/submit-audit', formData);

        if (submitResponse.data.formError) {
            await waitForMs(500);
            const errors = _.mapValues(submitResponse.data.formError, (value) => value[0]);
            setFormError(errors);
            setSubmitting(false);
            return;
        }

        await waitForMs(250);
        setSubmitProgress(10);
        setSubmitMsg('Uploading Images...');

        let imageFindingCodes = [];
        let imageUploads = [];

        try {
            const failedCriteriaImages = criteriaPasses
                .map((data) => data.info)
                .filter((data) => data != null && data.photos.length > 0)
                .map((data) => data.photos);

            imageFindingCodes = _.zip(failedCriteriaImages, submitResponse.data.result_data.findings)
                .map((findingInfo) => findingInfo[0].map(() => findingInfo[1].code)) // Replicate the code for each images
                .flat();

            imageUploads = failedCriteriaImages.flat();
        }
        catch (ex) {
            console.debug(ex);
        }

        const imageUploadFormData = new FormData();

        imageUploadFormData.append('record_id', formData.record_id);

        for (const imageFindingCode of imageFindingCodes) {
            imageUploadFormData.append('codes', imageFindingCode);
        }

        for (const image of imageUploads) {
            imageUploadFormData.append('images', image);
        }

        const config = {
            onUploadProgress: progressEvent => {
                setSubmitProgress(10 + Math.round(progressEvent.loaded) / progressEvent.total * 90);
            }
        };

        const submitImagesResponse = await axios.put('api/v1/submit-audit-images', imageUploadFormData, config);

        await waitForMs(500);

        console.log(submitImageResponse);
        console.log(submitResponse);
        setSubmitting(false);
        setAuditResult(submitResponse.data.result_data);
    };

    useEffect(() => {
        const passes = criterias.map((data) => ({
            id: data.id,
            fail: false,
            info: null
        }));

        setCriteriaPasses(passes);
        recalculateSummary(passes);
    }, [criterias]);

    useEffect(() => {
        if (record) {
            setLoadingDeptPIC(true);

            // Update PIC list
            httpRequest.get(`api/v1/get-dept-pics/${record.dept_id}`)
                .then((response) => {
                    httpRequest.post(`api/v1/get-users`,
                                     { ids: response.data },
                                     { headers: { 'Content-Type': 'application/json' } })
                        .then((response) => {
                            if (response.data) {
                                setDeptPIC(response.data);
                            }

                            setLoadingDeptPIC(false);
                        })
                })
                .catch(() => {
                    setLoadingDeptPIC(false);
                });
        }
    }, [record]);

    useEffect(() => {
        fetchData().then(() => {
            setLoading(false);
        })
        .catch((reason) => {
            if (reason.result === 'error') {
                setMessage(reason.msg);
                return;
            }

            setMessage("An error occurred when starting audit process.");
        });
    }, []);

    return (
        <>
            {isLoading || message != null ? (
                <div className="p-4">
                    <div className="text-center">
                    {message == null ? (
                        <>
                            <Spinner animation="border" size="lg" />
                            <h5 className="py-2">Loading</h5>
                        </>
                        ) : message}
                    </div>
                </div>
            ) : (
                <>
                    <Card.Header className="p-3">
                        <h3 className="fw-bold display-spacing m-0">Audit Process</h3>
                    </Card.Header>
                    <Card.Body className="card-body">
                        <Table className="align-middle">
                            <tbody>
                                <tr>
                                    <th>Cycle:</th>
                                    <td>
                                        <div>{cycle.cycle_id}</div>
                                        <small>{cycle.formatted_start_date} - {cycle.formatted_finish_date}</small>
                                    </td>
                                </tr>
                                <tr>
                                    <th>Auditor:</th>
                                    <td>{user.name} ({user.employee_id})</td>
                                </tr>
                                <tr>
                                    <th>Criteria Group:</th>
                                    <td>{criteriaGroup.name} <small>({criteriaGroup.code})</small></td>
                                </tr>
                                <tr>
                                    <th>Date:</th>
                                    <td>{date.current}</td>
                                </tr>
                            </tbody>
                        </Table>
                        <Form.Group id="record_id" className="mb-3">
                            <Form.Label>Area</Form.Label>
                            <DropdownList
                                source={`api/v1/fetch-records?list=1&cycle=${cycle.id}`}
                                selectedItem={record}
                                setSelectedItem={setRecord}
                                caption={(data) => <>{data.area_name} ({data.dept_name})</>}
                                title="Please Select Area"
                            >
                                {({ data }) => (
                                    <span>{data.area_name} ({data.dept_name})</span>
                                )}
                            </DropdownList>
                            <input type="hidden" className={formError && formError.record_id ? 'is-invalid' : ''}/>
                            <Form.Control.Feedback type="invalid">{formError && formError.record_id ? formError.record_id : ''}</Form.Control.Feedback>
                            {isLoadingDeptPIC && (
                                <div className="text-center p-4">
                                    <Spinner animation="border" size="sm" /> Loading
                                </div>
                            )}
                            {deptPIC.length > 0 && (
                                <>
                                    <div className="my-2">Department's PIC:</div>
                                    <ListGroup style={{ maxHeight: 200 }}>
                                        {deptPIC.map((value, index) => (
                                            <ListGroup.Item key={index}>{value.name}</ListGroup.Item>
                                        ))}
                                    </ListGroup>
                                </>
                            )}
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Criteria Finding</Form.Label>
                            <ListGroup>
                                {criterias.map((data, index) => {
                                    return (
                                        <ListGroup.Item key={index}>
                                            <div className="hstack gap-2">
                                                <div className="text-truncate me-auto">
                                                    <div className="fw-bold text-truncate">{data.name}</div>
                                                    <small>{data.code} (Weight: +{data.weight}%)</small>
                                                </div>
                                                <div className="btn-group" role="group">
                                                    <input
                                                        type="radio"
                                                        className="btn-check"
                                                        name={data.id}
                                                        value={true}
                                                        checked={!criteriaPasses[index].fail}
                                                        onChange={(ev) => handlePassesBtn(ev, index)}
                                                        id={`${index}_0`}
                                                        autoComplete="off" />
                                                    <label className="btn btn-outline-success" htmlFor={`${index}_0`}>Pass</label>
                                                    <input
                                                        type="radio"
                                                        className="btn-check"
                                                        name={data.id}
                                                        value={false}
                                                        checked={criteriaPasses[index].fail}
                                                        onChange={(ev) => handlePassesBtn(ev, index)}
                                                        id={`${index}_1`}
                                                        autoComplete="off"/>
                                                    <label className="btn btn-outline-danger" htmlFor={`${index}_1`}>Fail</label>
                                                </div>
                                            </div>
                                            {criteriaPasses[index].fail && (
                                                <div>
                                                    <hr/>
                                                    <Form.Group id={`criteria_passes.${index}.info.desc`} className="mb-3">
                                                        <Form.Label>Description</Form.Label>
                                                        <Form.Control
                                                            as="textarea"
                                                            rows={3}
                                                            value={criteriaPasses[index].info.desc}
                                                            onChange={(ev) => {
                                                                const tmpCriteriaPasses = criteriaPasses.slice();
                                                                tmpCriteriaPasses[index].info.desc = ev.target.value;
                                                                setCriteriaPasses(tmpCriteriaPasses);
                                                            }}
                                                            isInvalid={formError && formError[`criteria_passes.${index}.info.desc`]}
                                                        />
                                                        <Form.Control.Feedback type="invalid">
                                                            {formError && formError[`criteria_passes.${index}.info.desc`] ?
                                                                formError[`criteria_passes.${index}.info.desc`] : ''
                                                            }
                                                        </Form.Control.Feedback>
                                                    </Form.Group>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Category</Form.Label>
                                                        <div className="d-grid">
                                                            <div className="btn-group" role="group">
                                                                {["Observation", "Minor NC", "Major NC"].map((value, categoryIndex) => (
                                                                    <React.Fragment key={categoryIndex}>
                                                                        <input
                                                                            type="radio"
                                                                            className="btn-check"
                                                                            name={`pass_catergory_${index}`}
                                                                            value={categoryIndex}
                                                                            checked={criteriaPasses[index].info.category == categoryIndex}
                                                                            onChange={(ev) => handleCategoryBtn(ev, index)}
                                                                            id={`pass_catergory_${index}_${categoryIndex}`}
                                                                            autoComplete="off" />
                                                                        <label className="btn btn-outline-primary" htmlFor={`pass_catergory_${index}_${categoryIndex}`}>
                                                                            {value}
                                                                        </label>
                                                                    </React.Fragment>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </Form.Group>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Images</Form.Label>
                                                        <FileInput
                                                            accept="image/*"
                                                            files={criteriaPasses[index].info.photos}
                                                            setFiles={(files) => {
                                                                const tmpCriteriaPasses = criteriaPasses.slice();
                                                                tmpCriteriaPasses[index].info.photos = files;
                                                                setCriteriaPasses(tmpCriteriaPasses);
                                                            }}
                                                        >
                                                            <FontAwesomeIcon icon={faImage} /> Add Images
                                                        </FileInput>
                                                    </Form.Group>
                                                </div>
                                            )}
                                        </ListGroup.Item>
                                    );
                                })}
                            </ListGroup>
                        </Form.Group>
                        {criterias.length > 0 &&
                            <Form.Group className="mt-3">
                                <Form.Label>Summary</Form.Label>
                                <Table className="align-middle">
                                    <tbody>
                                        <tr>
                                            <th>Criteria Passed:</th>
                                            <td className="text-success">{criteriaPassed} ({totalWeight}%)</td>
                                        </tr>
                                        <tr>
                                            <th>Criteria Failed:</th>
                                            <td className="text-danger">{criteriaFailed} (-{100 - totalWeight}%)</td>
                                        </tr>
                                    </tbody>
                                </Table>
                            </Form.Group>
                        }
                    </Card.Body>
                    <Card.Footer className="p-3 hstack justify-content-end">
                        <Button
                            onClick={(ev) => {
                                ev.target.blur();
                                setSubmitting(true);
                                handleSubmit();
                            }}
                        >
                            <FontAwesomeIcon icon={faEnvelopesBulk} /> Submit
                        </Button>
                    </Card.Footer>
                </>
            )}

            <Modal
                show={isSubmitting}
                onExited={() => {
                    setSubmitMsg('');
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
                        <div className="mb-1">{submitMsg}</div>
                        <ProgressBar
                            now={submitProgress}
                            style={{ height: '0.25rem' }}
                            max={maxProgress}
                            animated
                        />
                    </div>
                </Modal.Body>
            </Modal>
        </>
    )
}

export default function AuditProcessLayout() {
    const [auditResult, setAuditResult] = useState(null);
    return (
        <Card className="audit-card mx-sm-auto mx-2 my-2 w-auto">
            {!auditResult ? (
                <AuditProcessForm setAuditResult={setAuditResult} />
            ) : (
                <AuditProcessResult auditResult={auditResult} setAuditResult={setAuditResult} />
            )}
        </Card>
    );
}
