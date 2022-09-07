import { faClipboardList } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { useState } from "react";
import { useEffect } from "react";
import { Form, ListGroup, Spinner, Table } from "react-bootstrap";
import DropdownList from "../components/DropdownList";
import ModalForm from "../components/ModalForm";
import { rootUrl } from "../utils";

export default function AuditProcessLayout() {
    const [user, setUser] = useState({});
    const [cycleName, setCycleName] = useState('');
    const [isLoading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);

    const fetchData = async () => {
        const userData = await axios.get(rootUrl('api/v1/get-current-user'));

        if (userData.data) {
            setUser(userData.data.result);
        }

        const activeCycle = await axios.get(rootUrl('api/v1/get-active-cycle'));

        if (activeCycle.data.result) {
            setCycleName(activeCycle.data.result.label);
            setLoading(false);
        }
        else {
            setMessage("Audit cycle hasn't started yet. Please contact QC administrator.");
        }
    };


    useEffect(() => {
        fetchData();
    }, []);

    const initialValues = {
        auditor_name: "",
        cycle_id: 0,
        date: new Date(Date.now() + (new Date().getTimezoneOffset() * -60 * 1000)).toISOString().slice(0, 19),

    };

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
                <ModalForm
                    title="Create Audit"
                    action={rootUrl('api/v1/audit')}
                    initialValues={initialValues}
                    closeButton={false}
                    show={true}
                    submitBtn={{
                        name: "Submit",
                        icon: faClipboardList,
                        afterSubmit: () => {}
                    }}
                >
                    {({ handleChange, values, setValues, errors }) => {
                        const [totalWeight, setTotalWeight] = useState(0);
                        const [criteriaPassed, setCriteriaPassed] = useState(0);
                        const [criteriaFailed, setCriteriaFailed] = useState(0);
                        const [selectedArea, setSelectedArea] = useState(null);
                        const [selectedCriteriaGroup, setSelectedCriteriaGroup] = useState(null);
                        const [criterias, setCriterias] = useState([]);
                        const [deptPIC, setDeptPIC] = useState([]);
                        const [isLoadingCriteria, setLoadingCriteria] = useState(false);
                        const [isLoadingDeptPIC, setLoadingDeptPIC] = useState(false);
                        const [criteriaPasses, setCriteriaPasses] = useState([]);

                        // Recalculate summary values
                        const recalculateSummary = (passes) => {
                            let tmpTotalWeight = 0;
                            let tmpCriteriaPassed = 0;
                            let tmpCriteriaFailed = 0;

                            for (const criteria of criterias) {
                                if (passes[criteria.id] == null) {
                                    tmpTotalWeight += criteria.weight;
                                    tmpCriteriaPassed += 1;
                                }
                                else {
                                    tmpCriteriaFailed += 1;
                                }
                            }

                            setTotalWeight(tmpTotalWeight);
                            setCriteriaPassed(tmpCriteriaPassed);
                            setCriteriaFailed(tmpCriteriaFailed);
                        }

                        const handleSelectCriteriaGroup = (data) => {
                            setSelectedCriteriaGroup(data);
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
                                tmpCriteriaPasses[index].info = { desc: '' };
                            }

                            setCriteriaPasses(tmpCriteriaPasses);
                            recalculateSummary(criteriaPasses);
                        };

                        useEffect(() => {
                            const passes = criterias.map((data) => ({ id: data.id, fail: false, info: null }));
                            setCriteriaPasses(passes);
                            recalculateSummary(passes);
                        }, [criterias]);

                        useEffect(() => {
                            if (selectedArea) {
                                setLoadingDeptPIC(true);

                                // Update PIC list
                                axios.get(rootUrl(`api/v1/get-dept-pics/${selectedArea.department_id}`))
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
                        }, [selectedArea]);

                        return (
                            <>
                                <Table className="align-middle">
                                    <tbody>
                                        <tr>
                                            <th>Auditor:</th>
                                            <td>{user.name} ({user.employee_id})</td>
                                        </tr>
                                        <tr>
                                            <th>Current Cycle:</th>
                                            <td>{cycleName}</td>
                                        </tr>
                                        <tr>
                                            <th>Date:</th>
                                            <td>{new Date(values.date).toLocaleString()}</td>
                                        </tr>
                                    </tbody>
                                </Table>
                                <Form.Group className="mb-3">
                                    <Form.Label>Area</Form.Label>
                                    <DropdownList
                                        source={rootUrl('api/v1/fetch-areas')}
                                        selectedItem={selectedArea}
                                        setSelectedItem={setSelectedArea}
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
                                        selectedItem={selectedCriteriaGroup}
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
                                            (
                                                criterias.map((data, index) => {
                                                    return (
                                                        <ListGroup.Item key={index}>
                                                            <div className="hstack gap-2">
                                                                <div className="fw-bold">{data.name}</div>
                                                                <small className="ms-auto">({data.weight}%) {data.code}</small>
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
                                                                        <Form.Label>Remarks</Form.Label>
                                                                        <Form.Control
                                                                            as="textarea"
                                                                            rows={3}
                                                                            placeholder="Remarks"
                                                                            value={criteriaPasses[index].info.desc}
                                                                            onChange={(ev) => {
                                                                                const tmpCriteriaPasses = criteriaPasses.slice();
                                                                                tmpCriteriaPasses[index].info.desc = ev.target.value;
                                                                                setCriteriaPasses(tmpCriteriaPasses);
                                                                            }}
                                                                        />
                                                                    </Form.Group>

                                                                    <Form.Group className="mb-3">
                                                                        <Form.Label>Picture</Form.Label>
                                                                        <Form.Control type="file" accept="image/*" />
                                                                    </Form.Group>
                                                                </div>
                                                            )}
                                                        </ListGroup.Item>
                                                    );
                                                })
                                            )
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

                            </>
                        );
                    }}
                </ModalForm>
            )}
        </>
    );
}
