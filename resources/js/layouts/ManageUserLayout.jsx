import _ from "lodash";
import { useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import { OptionalSpan, RequiredSpan } from "../components/LabelSpan";
import { rootUrl } from "../utils";
import CommonView from "./CommonView";

function UserForm({ shown, handleChange, values, errors }) {
    const [isLoadingRole, setLoadingRole] = useState(false);
    const [roles, setRoles] = useState([]);

    useEffect(() => {
        if (shown) {
            // Fetch the roles to be shown later
            setLoadingRole(true);
            axios.get(rootUrl('api/v1/fetch-role-options'))
                .then((response) => {
                    setRoles(response.data);
                    setLoadingRole(false);
                });
        }
    }, [shown]);

    return (
        <>
            <Form.Group className="mb-3" controlId="name">
                <Form.Label>Name <RequiredSpan/></Form.Label>
                <Form.Control type="text" name="name" value={values.name} onChange={handleChange} isInvalid={!!errors.name} />
                <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3" controlId="employee_id">
                <Form.Label>Employee ID <RequiredSpan/></Form.Label>
                <Form.Control type="text" name="employee_id" value={values.employee_id} onChange={handleChange} isInvalid={!!errors.employee_id} />
                <Form.Control.Feedback type="invalid">{errors.employee_id}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3" controlId="login_id">
                <Form.Label>Login ID <RequiredSpan/></Form.Label>
                <Form.Control type="text" name="login_id" value={values.login_id} onChange={handleChange} isInvalid={!!errors.login_id} />
                <Form.Control.Feedback type="invalid">{errors.login_id}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3" controlId="email">
                <Form.Label>E-mail <OptionalSpan /> </Form.Label>
                <Form.Control type="text" name="email" value={values.email} onChange={handleChange} isInvalid={!!errors.email} />
                <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3" controlId="role_id">
                <Form.Label>Role <RequiredSpan/></Form.Label>
                <Form.Select name="role_id" value={values.role_id} onChange={handleChange} isInvalid={!!errors.role_id} disabled={isLoadingRole}>
                    <option value="" disabled>-- Please select user role --</option>
                    {roles.map((data) => (
                        <option key={_.uniqueId()} value={data.id}>{data.name}</option>
                    ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">{errors.role_id}</Form.Control.Feedback>
            </Form.Group>
        </>
    );
}

export default function ManageUserLayout() {
    const initialValues = {
        name: '',
        employee_id: '',
        login_id: '',
        email: '',
        role_id: '',
    };

    return (
        <CommonView
            addNewItem={{
                name: "Add User",
                form: UserForm,
                action: rootUrl('api/v1/add-user'),
                initialValues: initialValues
            }}
            editItem={{
                name: "Edit User",
                form: UserForm,
                action: rootUrl('api/v1/edit-user'),
                fetchUrl: rootUrl('api/v1/get-user'),
                initialValues: { ...initialValues }
            }}
            deleteItemAction={rootUrl('api/v1/delete-user')}
            deleteSelectedItemAction={rootUrl('api/v1/delete-users')}
            table={{
                columns: [
                    {
                        id: 'name',
                        name: 'Name',
                    },
                    {
                        id: 'employee_id',
                        name: 'Employee ID',
                    },
                    {
                        id: 'login_id',
                        name: 'Login ID',
                    },
                    {
                        id: 'email',
                        name: 'E-mail',
                    },
                    {
                        id: 'role_name',
                        name: 'Role',
                    }
                ],
                source: {
                    url: rootUrl('api/v1/fetch-users'),
                    method: 'GET',
                    produce: item => [item.name, item.employee_id, item.login_id, item.email, item.role_name],
                }
            }}
            messages={{
                onItemAdded: "User successfully added!",
                onItemEdited: "User successfully edited!",
                onItemDeleted: "User successfully deleted!",
                onNoItemSelectedMsg: "Please select the user to delete",
                onDeleteSelectedItemConfirmMsg: "Do you really want to delete the selected user?",
                onSelectedItemDeletedMsg: "The selected user successfully deleted!",
            }}
        />
    );
}
