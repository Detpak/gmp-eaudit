import CommonView from "../CommonView";
import { menus, rootUrl } from "../../utils";
import { Accordion, Button, Form, Modal } from "react-bootstrap";
import _ from "lodash";
import { OptionalSpan, RequiredSpan } from "../../components/LabelSpan";

function RolesForm({ handleChange, values, errors }) {
    return (
        <>
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
            <Form.Check className="mb-3" type="checkbox" name="auditee" label="Auditee" value={values.auditee} onChange={handleChange} />
            {menus.map((menu, index) => (
                <Form.Group key={index} className="mb-3">
                    <Form.Label>{menu.name} access privilege</Form.Label>
                    <Form.Select name={`${menu.link}`} value={values[menu.link]} onChange={handleChange}>
                        {_.range(menu.maxAccessLevel + 1).map((level) => (
                            <option key={level} value={level}>
                                {['No access', 'Allow access', 'Full access'][level]}
                            </option>
                        ))}
                    </Form.Select>
                </Form.Group>
            ))}
        </>
    );
}

export default function RolesUserLayout() {
    const initialValues = {
        roleName: '',
        remarks: '',
        auditee: false,
    };

    for (const menu of menus) {
        initialValues[menu.link] = '0';
    }

    return (
        <CommonView
            addNewItem={{
                name: "Add Role",
                form: RolesForm,
                action: rootUrl('api/v1/add-role'),
                initialValues: initialValues
            }}
            editItem={{
                name: "Edit Role",
                form: RolesForm,
                action: rootUrl('api/v1/edit-role'),
                fetchUrl: rootUrl('api/v1/get-role'),
                initialValues: { ...initialValues }
            }}
            deleteItemAction={rootUrl('api/v1/delete-role')}
            deleteSelectedItemAction={rootUrl('api/v1/delete-roles')}
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
                        id: 'remarks',
                        name: 'Description',
                    }
                ],
                source: {
                    url: rootUrl('api/v1/fetch-roles'),
                    method: 'GET',
                    produce: item => [
                        item.name,
                        item.auditee != 0 ? 'Yes' : 'No',
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
