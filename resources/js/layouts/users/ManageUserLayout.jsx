import _ from "lodash";
import { useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import httpRequest from "../../api";
import { OptionalSpan, RequiredSpan } from "../../components/LabelSpan";
import CommonView from "../CommonView";

function UserForm({ shown, handleChange, values, setValues, errors, isEdit }) {
    const [isLoadingRole, setLoadingRole] = useState(false);
    const [roles, setRoles] = useState([]);
    const [changePassword, setChangePassword] = useState(false);

    useEffect(() => {
        if (shown) {
            // Fetch the roles to be shown later
            setLoadingRole(true);
            httpRequest.get('api/v1/fetch-role-options')
                .then((response) => {
                    setRoles(response.data);
                    setLoadingRole(false);
                });
        }
    }, [shown]);

    useEffect(() => {
        const newValues = {
            ...values,
            password: ''
        };

        setValues(newValues);
    }, [changePassword]);

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
                <Form.Label>E-mail <OptionalSpan /></Form.Label>
                <Form.Control type="text" name="email" value={values.email} onChange={handleChange} isInvalid={!!errors.email} />
                <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
            </Form.Group>
            {!isEdit &&
                <>
                    <Form.Group className="mb-3" controlId="password">
                        <Form.Label>Password</Form.Label>
                        <Form.Control type="password" name="password" value={values.password} onChange={handleChange} isInvalid={!!errors.password} />
                        <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="password_confirmation">
                        <Form.Label>Confirm Password</Form.Label>
                        <Form.Control type="password" name="password_confirmation" value={values.password_confirmation} onChange={handleChange} isInvalid={!!errors.password_confirmation} />
                        <Form.Control.Feedback type="invalid">{errors.password_confirmation}</Form.Control.Feedback>
                    </Form.Group>
                </>
            }
            <Form.Group className="mb-3" controlId="role_id">
                <Form.Label>Role <RequiredSpan/></Form.Label>
                <Form.Select name="role_id" value={values.role_id} onChange={handleChange} isInvalid={!!errors.role_id} disabled={isLoadingRole}>
                    <option value="" disabled>-- Please select user role --</option>
                    {roles.map((data, index) => (
                        <option key={index} value={data.id}>{data.name}</option>
                    ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">{errors.role_id}</Form.Control.Feedback>
            </Form.Group>
            {isEdit &&
                <>
                    <hr/>
                    <Form.Group className="mb-3">
                        <Form.Check
                            className="mb-3"
                            type="checkbox"
                            name="change_password"
                            label="Change Password"
                            checked={changePassword}
                            onChange={_ => setChangePassword(!changePassword)}
                        />
                        <Form.Control
                            type="password"
                            name="password"
                            value={values.password}
                            onChange={handleChange}
                            isInvalid={!!errors.password}
                            disabled={!changePassword}
                        />
                        <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="confirm_password">
                        <Form.Label>Confirm Password</Form.Label>
                        <Form.Control
                            type="password"
                            name="password_confirmation"
                            value={values.password_confirmation}
                            onChange={handleChange}
                            isInvalid={!!errors.password_confirmation}
                            disabled={!changePassword}
                        />
                        <Form.Control.Feedback type="invalid">{errors.password_confirmation}</Form.Control.Feedback>
                    </Form.Group>
                </>
            }
        </>
    );
}

export default function ManageUserLayout() {
    const initialValues = {
        name: '',
        employee_id: '',
        login_id: '',
        email: '',
        password: '',
        password_confirmation: '',
        role_id: '',
    };

    return (
        <CommonView
            addNewItem={{
                name: "Add User",
                form: UserForm,
                action: 'api/v1/add-user',
                initialValues: initialValues
            }}
            editItem={{
                name: "Edit User",
                form: UserForm,
                action: 'api/v1/edit-user',
                fetchUrl: 'api/v1/get-user',
                initialValues: { ...initialValues }
            }}
            deleteItem={{
                action: 'api/v1/delete-user'
            }}
            deleteSelectedItemAction={'api/v1/delete-users'}
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
                    url: 'api/v1/fetch-users',
                    method: 'GET',
                    produce: item => [
                        item.name,
                        item.employee_id,
                        item.login_id,
                        item.email && item.email.length > 0 ? item.email : '-',
                        item.role_name
                    ],
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
