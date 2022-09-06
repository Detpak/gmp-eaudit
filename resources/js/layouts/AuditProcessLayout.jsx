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
    const [selectedArea, setSelectedArea] = useState(null);
    const [selectedCriteriaGroup, setSelectedCriteriaGroup] = useState(null);
    const [criterias, setCriterias] = useState([]);
    const [isLoadingCriteria, setLoadingCriteria] = useState(false);

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

    const handleSelectCriteriaGroup = (data) => {
        setSelectedCriteriaGroup(data);
        setLoadingCriteria(true);
        axios.get(`api/v1/get-criteria-group-params/${data.id}`)
            .then((response) => {
                setCriterias(response.data);
                setLoadingCriteria(false);
            });
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

                        const recalculateSummary = (passes) => {
                            // Recalculate values
                            let tmpTotalWeight = 0;
                            let tmpCriteriaPassed = 0;
                            let tmpCriteriaFailed = 0;

                            for (const criteria of criterias) {
                                if (passes[criteria.id] == true) {
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

                        const handlePassesChange = (ev) => {
                            values.passes[ev.target.name] = ev.target.value === 'true';
                            setValues({ ...values });
                            recalculateSummary(values.passes);
                        };

                        useEffect(() => {
                            const passes = _.mapValues(_.keyBy(criterias, 'id'), () => true);
                            setValues({ ...values, passes: passes });
                            recalculateSummary(passes);
                        }, [criterias]);

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
                                        caption={(data) => <>{data.name} ({data.plant_name})</>}
                                        title="Please Select Area"
                                    >
                                        {({ data }) => (
                                            <span>{data.name}</span>
                                        )}
                                    </DropdownList>
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
                                                criterias.map((value) => {
                                                    const uid = _.uniqueId();
                                                    return (
                                                        <ListGroup.Item className="hstack gap-2" key={uid}>
                                                            <div className="me-auto">{value.name} <small>({value.weight}%)</small></div>
                                                            <small className="me-2">{value.code}</small>
                                                            <div className="btn-group" role="group" aria-label="Basic radio toggle button group">
                                                                <input
                                                                    type="radio"
                                                                    className="btn-check"
                                                                    name={value.id}
                                                                    value={true}
                                                                    checked={values.passes[value.id] == true}
                                                                    onChange={handlePassesChange}
                                                                    id={`${uid}_0`}
                                                                    autoComplete="off"
                                                                    />
                                                                <label className="btn btn-outline-success" htmlFor={`${uid}_0`}>Pass</label>

                                                                <input
                                                                    type="radio"
                                                                    className="btn-check"
                                                                    name={value.id}
                                                                    value={false}
                                                                    checked={values.passes[value.id] == false}
                                                                    onChange={handlePassesChange}
                                                                    id={`${uid}_1`}
                                                                    autoComplete="off"/>
                                                                <label className="btn btn-outline-danger" htmlFor={`${uid}_1`}>Fail</label>
                                                            </div>
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
                                                    <td>{criteriaPassed}</td>
                                                </tr>
                                                <tr>
                                                    <th>Criteria Failed:</th>
                                                    <td>{criteriaFailed}</td>
                                                </tr>
                                                <tr>
                                                    <th>Total Weight:</th>
                                                    <td>{totalWeight}%</td>
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
