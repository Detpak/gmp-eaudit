import CommonView from "./CommonView";
import { menus, rootUrl } from "../utils";
import { Accordion, Button, Form, Modal } from "react-bootstrap";
import _ from "lodash";
import DynamicTable from "../components/DynamicTable";

function AddRolesForm({ handleChange, isSubmitting, values, errors }) {
    return (
        <>
            <Form.Group className="mb-3" controlId="roleName">
                <Form.Label>Role name</Form.Label>
                <Form.Control type="text" name="roleName" value={values.roleName} onChange={handleChange} isInvalid={!!errors.roleName} />
                <Form.Control.Feedback type="invalid">{errors.roleName}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3" controlId="remarks">
                <Form.Label>Remarks</Form.Label>
                <Form.Control as="textarea" name="remarks" rows={3} value={values.remarks} onChange={handleChange} isInvalid={!!errors.remarks} />
                <Form.Control.Feedback type="invalid">{errors.remarks}</Form.Control.Feedback>
            </Form.Group>
            <Accordion alwaysOpen>
                {menus.map((menu) => (
                    <Form.Group key={_.uniqueId()} className="mb-3">
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
            </Accordion>
        </>
    );
}

export default function RolesUserLayout() {
    const initialValues = {
        roleName: '',
        remarks: '',
    };

    for (const menu of menus) {
        initialValues[menu.link] = '0';
    }

    return (
        <CommonView
            addNewItem={{
                name: "Add Role",
                form: AddRolesForm,
                action: rootUrl('api/v1/add-role'),
                initialValues: initialValues
            }}
            deleteSelectedItemAction={rootUrl('api/v1/delete-roles')}
            table={{
                columns: [
                    DynamicTable.idColumn(),
                    DynamicTable.selectionColumn(),
                    {
                        id: 'name',
                        name: 'Name'
                    },
                    {
                        id: 'remarks',
                        name: 'Description'
                    },
                ],
                source: {
                    url: rootUrl('/api/v1/fetch-roles'),
                    method: 'GET',
                    then: data => data.data.map((item) => [item.id, item.name, (item.remarks || item.length > 0) ? item.remarks : '-']),
                    total: data => {
                        return data.total;
                    }
                }
            }}
            messages={{
                onItemAdded: "Role successfully added!",
                onNoItemSelectedMsg: "Please select the user role to delete",
                onDeleteSelectedItemConfirmMsg: "Do you really want to delete the selected role?",
                onSelectedItemDeletedMsg: "The selected role successfully deleted!",
            }}
        />
    );
}
