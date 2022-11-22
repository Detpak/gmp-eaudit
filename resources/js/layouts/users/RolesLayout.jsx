import CommonView from "../CommonView";
import { Accordion, Button, Form, Modal } from "react-bootstrap";
import _ from "lodash";
import { OptionalSpan, RequiredSpan } from "../../components/LabelSpan";
import Checkmark from "../../components/Checkmark";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faCross, faPenToSquare, faPlus, faXmark } from "@fortawesome/free-solid-svg-icons";
import { useMemo } from "react";
import { useRef } from "react";
import { routes } from "../PageManager";
import { useEffect } from "react";
import LoadingButton from "../../components/LoadingButton";
import { useState } from "react";
import httpRequest from "../../api";
import { showToastMsg } from "../../utils";

function RolesForm({ editId, closeModal, refreshTable }) {
    const [isLoading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [values, setValues] = useState({
        roleName: '',
        remarks: '',
        auditor: false,
        auditee: false,
        access: _.mapValues(
            _.keyBy(routes, 'link'),
            route => (
                route.page ?
                    false
                    :
                    _.mapValues(route.pages, page => false)
            )
        )
    });

    const fetchData = async () => {
        setLoading(true);

        const response = await httpRequest.get(`api/v1/get-role/${editId}`);
        const newValues = { ...response.data };

        newValues.remarks = response.data.remarks ? response.data.remarks : '';
        newValues.access = _.mapValues(
            _.keyBy(routes, 'link'),
            route => (
                route.page ?
                    response.data.access[route.link] && typeof response.data.access[route.link] === 'boolean'
                        ? response.data.access[route.link] : false
                    :
                    _.mapValues(route.pages,
                        (value, key) =>
                            response.data.access[route.link] != null &&
                            typeof response.data.access[route.link] === 'object' &&
                            typeof response.data.access[route.link][key] === 'boolean'
                                ? response.data.access[route.link][key]
                                : false)
            )
        );

        setValues(newValues);
        setLoading(false);
    };

    const submit = _ => {
        const url = editId ? 'api/v1/edit-role' : 'api/v1/add-role';

        setLoading(true);

        httpRequest.post(url, { id: editId, ...values })
            .then((response) => {
                setLoading(false);
                closeModal();
                refreshTable();
                showToastMsg("Role successfully saved!");
            })
            .catch((reason) => {
                setLoading(false);
                closeModal();
                showToastMsg("An error occurred. Unable to save role.");
            });
    };

    const handleChange = ev => {
        const newValues = { ...values };
        newValues[ev.target.name] = ev.target.type === 'checkbox' ? ev.target.checked : ev.target.value;
        setValues(newValues);
    };

    useEffect(() => {
        if (editId) {
            fetchData();
        }
    }, []);

    useEffect(() => {
        //console.log(values);
    }, [values])

    return (
        <>
            <Modal.Body>
                <fieldset disabled={isLoading}>
                    <Form.Group className="mb-3" controlId="roleName">
                        <Form.Label>Role name <RequiredSpan /></Form.Label>
                        <Form.Control type="text" name="roleName" value={values.roleName} onChange={handleChange} isInvalid={!!errors.roleName} />
                        <Form.Control.Feedback type="invalid">{errors.roleName}</Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="remarks">
                        <Form.Label>Remarks <OptionalSpan /></Form.Label>
                        <Form.Control as="textarea" name="remarks" rows={2} value={values.remarks} onChange={handleChange} isInvalid={!!errors.remarks} />
                        <Form.Control.Feedback type="invalid">{errors.remarks}</Form.Control.Feedback>
                    </Form.Group>
                    <Form.Check className="mb-3" type="checkbox" name="auditee" label="Auditee" checked={values.auditee} onChange={handleChange} />
                    <Form.Check className="mb-3" type="checkbox" name="auditor" label="Auditor" checked={values.auditor} onChange={handleChange} />
                    <hr/>
                    {routes.map((route, index) => (
                        <Form.Group key={index} className="mb-3">
                            <Form.Label>{route.name} access privilege</Form.Label>
                            <div className="hstack gap-3">
                                {route.page ?
                                    <Form.Check
                                        type="checkbox"
                                        label="Allow"
                                        checked={values.access[route.link]}
                                        onChange={_ => {
                                            const newValues = { ...values };
                                            newValues.access[route.link] = !newValues.access[route.link];
                                                setValues(newValues);
                                        }}
                                    />
                                    :
                                    Object.keys(route.pages).map((page, key) => (
                                        <Form.Check
                                            key={key}
                                            type="checkbox"
                                            label={route.pages[page].name}
                                            checked={values.access[route.link][page]}
                                            onChange={_ => {
                                                const newValues = { ...values };
                                                newValues.access[route.link][page] = !newValues.access[route.link][page];
                                                setValues(newValues);
                                            }}
                                        />
                                    ))
                                }
                            </div>
                        </Form.Group>
                    ))}
                </fieldset>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={closeModal} disabled={isLoading}>Close</Button>
                <LoadingButton onClick={submit} isLoading={isLoading} icon={editId ? faPenToSquare : faPlus}>Save</LoadingButton>
            </Modal.Footer>
        </>
    );
}

export default function RolesUserLayout() {
    return (
        <CommonView
            addNewItem={{
                name: "Add Role",
                modal: RolesForm,
            }}
            editItem={{
                name: "Edit Role",
                modal: RolesForm,
            }}
            deleteItem={{
                action: 'api/v1/delete-role'
            }}
            deleteSelectedItemAction={'api/v1/delete-roles'}
            table={{
                canSelect: true,
                columns: [
                    {
                        id: 'name',
                        name: 'Name',
                    },
                    {
                        id: 'auditee',
                        name: 'Auditee?',
                    },
                    {
                        id: 'auditor',
                        name: 'Auditor?',
                    },
                    {
                        id: 'remarks',
                        name: 'Description',
                    }
                ],
                source: {
                    url: 'api/v1/fetch-roles',
                    method: 'GET',
                    produce: item => [
                        item.name,
                        <Checkmark value={item.auditee} />,
                        <Checkmark value={item.auditor} />,
                        (item.remarks && item.remarks.length > 0) ? item.remarks : '-'
                    ],
                    total: data => data.total
                }
            }}
            messages={{
                onItemAdded: "Role successfully added!",
                onItemEdited: "Role successfully edited!",
                onItemDeleted: "Role successfully deleted!",
                onNoItemSelectedMsg: "Please select the user role to delete",
                onDeleteSelectedItemConfirmMsg: "Do you really want to delete the selected role?",
                onSelectedItemDeletedMsg: "The selected role successfully deleted!",
            }}
        />
    );
}
