import { faClipboardList } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { useState } from "react";
import { useEffect } from "react";
import { Form, Spinner, Table } from "react-bootstrap";
import DropdownList from "../components/DropdownList";
import ModalForm from "../components/ModalForm";
import { rootUrl } from "../utils";

export default function AuditProcessLayout() {
    const initialValues = {
        auditor_name: "",
        cycle_id: 0,
        date: new Date(Date.now() + (new Date().getTimezoneOffset() * -60 * 1000)).toISOString().slice(0, 19)
    };

    return (
        <ModalForm
            title="Audit"
            action={rootUrl('api/v1/audit')}
            initialValues={initialValues}
            closeButton={false}
            show={true}
            submitBtn={{
                name: "Submit",
                icon: faClipboardList,
                afterSubmit: () => {}
            }}>
            {({ handleChange, values, setValues, errors }) => {
                const [user, setUser] = useState({});
                const [cycleName, setCycleName] = useState('');
                const [isLoading, setLoading] = useState(true);

                const fetchData = async () => {
                    const userData = await axios.get(rootUrl('api/v1/get-current-user'));

                    if (userData.data) {
                        console.log(userData);
                        setUser(userData.data.result);
                    }

                    const activeCycle = await axios.get(rootUrl('api/v1/get-active-cycle'));

                    if (activeCycle.data) {
                        setCycleName(activeCycle.data.result.label);
                        setValues({ ...values, cycle_id: activeCycle.data.result.id });
                        setLoading(false);
                    }
                };

                useEffect(() => {
                    fetchData();
                }, []);

                return (
                    <>
                        <Table className="align-middle">
                            <tbody>
                                <tr>
                                    <th>Auditor:</th>
                                    <td>{isLoading ? <Spinner animation="border" size="sm"/> : <>{user.name} ({user.employee_id})</>}</td>
                                </tr>
                                <tr>
                                    <th>Current Cycle:</th>
                                    <td>{isLoading ? <Spinner animation="border" size="sm"/> : cycleName}</td>
                                </tr>
                                <tr>
                                    <th>Date:</th>
                                    <td>{new Date(values.date).toLocaleString()}</td>
                                </tr>
                            </tbody>
                        </Table>
                        <Form.Group className="mb-3">
                            <Form.Label>Area</Form.Label>
                            <DropdownList title="Please Select Area" />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Criteria Group</Form.Label>
                            <DropdownList title="Please Select Criteria Group" />
                        </Form.Group>
                    </>
                );
            }}
        </ModalForm>
    );
}
