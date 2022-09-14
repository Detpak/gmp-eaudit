import { faClipboardList, faImage } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import _ from "lodash";
import React, { useState } from "react";
import { useRef } from "react";
import { useEffect } from "react";
import { Button, Card, Form, Image, ListGroup, Modal, Spinner, Table } from "react-bootstrap";
import DropdownList from "../components/DropdownList";
import FileInput from "../components/FileInput";
import LoadingButton from "../components/LoadingButton";
import ModalForm from "../components/ModalForm";
import { rootUrl } from "../utils";

function AuditProcessForm() {
    return <></>;
}

export default function AuditProcessLayout() {
    const [user, setUser] = useState({});
    const [isLoading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);
    const [totalWeight, setTotalWeight] = useState(0);
    const [criteriaPassed, setCriteriaPassed] = useState(0);
    const [criteriaFailed, setCriteriaFailed] = useState(0);
    const [cycle, setCycle] = useState(null);
    const [area, setArea] = useState(null);
    const [criteriaGroup, setCriteriaGroup] = useState(null);
    const [criterias, setCriterias] = useState([]);
    const [deptPIC, setDeptPIC] = useState([]);
    const [isLoadingCriteria, setLoadingCriteria] = useState(false);
    const [isLoadingDeptPIC, setLoadingDeptPIC] = useState(false);
    const [criteriaPasses, setCriteriaPasses] = useState([]);
    const date = useRef(new Date(Date.now() + (new Date().getTimezoneOffset() * -60 * 1000)).toISOString().slice(0, 19));

    const fetchData = async () => {
        const userData = await axios.get(rootUrl('api/v1/get-current-user'));

        if (userData.data) {
            setUser(userData.data.result);
            setLoading(false);
        }
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
    }

    const handleSelectCriteriaGroup = (data) => {
        setCriteriaGroup(data);
        setLoadingCriteria(true);
        axios.get(`api/v1/get-criteria-group-params/${data.id}`)
            .then((response) => {
                setCriterias(response.data);
                setLoadingCriteria(false);
            })
            .catch(() => {
                setLoadingCriteria(false);
            });
    };


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

        try {
            if (cycle) {
                formData.cycle_id = cycle.id;
            }

            if (area) {
                formData.area_id = area.id;
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

        console.log(criteriaPasses);
        console.log(JSON.stringify(formData));
    }

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
        if (area) {
            setLoadingDeptPIC(true);

            // Update PIC list
            axios.get(rootUrl(`api/v1/get-dept-pics/${area.department_id}`))
                .then((response) => {
                    axios.post(rootUrl(`api/v1/get-users`),
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
    }, [area]);


    useEffect(() => {
        fetchData();
    }, []);

    return (
        <Card className="audit-card w-auto mx-sm-auto mx-2 my-2">
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
                        <h3 className="fw-bold display-spacing m-0">Submit Finding</h3>
                    </Card.Header>
                    <Card.Body className="card-body">
                        <Table className="align-middle">
                            <tbody>
                                <tr>
                                    <th>Auditor:</th>
                                    <td>{user.name} ({user.employee_id})</td>
                                </tr>
                                <tr>
                                    <th>Date:</th>
                                    <td>{new Date(date.current).toLocaleString()}</td>
                                </tr>
                            </tbody>
                        </Table>
                        <Form.Group className="mb-3">
                            <Form.Label>Cycle</Form.Label>
                            <DropdownList
                                source={rootUrl('api/v1/fetch-cycles?list=1')}
                                selectedItem={cycle}
                                setSelectedItem={setCycle}
                                caption={(data) => <>{data.label}</>}
                                title="Please Select Cycle"
                            >
                                {({ data }) => (
                                    <span>{data.label}</span>
                                )}
                            </DropdownList>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Area</Form.Label>
                            <DropdownList
                                source={rootUrl('api/v1/fetch-areas')}
                                selectedItem={area}
                                setSelectedItem={setArea}
                                caption={(data) => <>{data.name} ({data.dept_name})</>}
                                title="Please Select Area"
                            >
                                {({ data }) => (
                                    <span>{data.name} ({data.dept_name})</span>
                                )}
                            </DropdownList>
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
                                            <ListGroup.Item key={index}>{value.name} <small>({value.email})</small></ListGroup.Item>
                                        ))}
                                    </ListGroup>
                                </>
                            )}
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Criteria Group</Form.Label>
                            <DropdownList
                                source={rootUrl('api/v1/fetch-criteria-groups?noparam=true')}
                                selectedItem={criteriaGroup}
                                setSelectedItem={handleSelectCriteriaGroup}
                                caption={(data) => data.name}
                                title="Please Select Criteria Group"
                            >
                                {({ data }) => (
                                    <span>{data.name}</span>
                                )}
                            </DropdownList>
                            <ListGroup className="mt-2">
                                {isLoadingCriteria ?
                                    <div className="text-center">
                                        <Spinner animation="border" size="sm" /> Loading
                                    </div>
                                    :
                                    criterias.map((data, index) => {
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
                                                        <Form.Group className="mb-3">
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
                                                            />
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
                                    })
                                }
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
                        <LoadingButton onClick={handleSubmit} icon={faClipboardList}>Submit</LoadingButton>
                    </Card.Footer>
                </>
            )}
        </Card>
    );
}
