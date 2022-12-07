import { useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import httpRequest from "../api";
import { globalState } from "../app_state";
import { RequiredSpan } from "../components/LabelSpan";
import LoadingButton from "../components/LoadingButton";
import { PageContent, PageContentView, PageNavbar } from "../components/PageNav";
import { showToastMsg, updateUserData, waitForMs } from "../utils";

export function ProfileForm({ onSuccess }) {
    const [name, setName] = useState("");
    const [employeeId, setEmployeeId] = useState("");
    const [loginId, setLoginId] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [changePassword, setChangePassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [isLoading, setLoading] = useState(true);
    const [userData, setUserData] = globalState.useGlobalState('userData');

    const submit = async _ => {
        setLoading(true);

        const formData = {
            id: userData.id,
            name: name,
            employee_id: employeeId,
            login_id: loginId,
            email: email,
            password: password,
            password_confirmation: confirmPassword,
        };

        const response = await httpRequest.post('api/v1/edit-user', formData);

        if (response.data.formError) {
            setErrors(response.data.formError);
            return;
        }

        await updateUserData();
        setChangePassword(false);
        setPassword('');
        setConfirmPassword('');

        if (onSuccess) {
            onSuccess();
        }
        else {
            showToastMsg('Profile successfully saved!');
        }

        setLoading(false);
    };

    useEffect(async () => {
        setName(userData.name);
        setEmployeeId(userData.employee_id);
        setLoginId(userData.login_id);
        setEmail(userData.email);
        setLoading(false);
    }, [userData]);

    return (
        <>
            <fieldset style={{ maxWidth: 500 }} disabled={isLoading}>
                <Form.Group className="mb-3">
                    <Form.Label>Name <RequiredSpan /></Form.Label>
                    <Form.Control value={name} onChange={ev => setName(ev.target.value)} isInvalid={!!errors.name} />
                    <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Employee ID <RequiredSpan /></Form.Label>
                    <Form.Control value={employeeId} onChange={ev => setEmployeeId(ev.target.value)} isInvalid={!!errors.employee_id} />
                    <Form.Control.Feedback type="invalid">{errors.employee_id}</Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Login ID <RequiredSpan /></Form.Label>
                    <Form.Control value={loginId} onChange={ev => setLoginId(ev.target.value)} isInvalid={!!errors.login_id} />
                    <Form.Control.Feedback type="invalid">{errors.login_id}</Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>E-mail</Form.Label>
                    <Form.Control value={email} onChange={ev => setEmail(ev.target.value)} isInvalid={!!errors.employee_id} />
                    <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Check
                        className="mb-3"
                        type="checkbox"
                        name="change_password"
                        label="Change Password"
                        checked={changePassword}
                        onChange={_ => setChangePassword(!changePassword)}
                    />
                    <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                    <Form.Control
                        type="password"
                        name="password"
                        value={password}
                        onChange={ev => setPassword(ev.target.value)}
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
                        value={confirmPassword}
                        onChange={ev => setConfirmPassword(ev.target.value)}
                        isInvalid={!!errors.password_confirmation}
                        disabled={!changePassword}
                    />
                    <Form.Control.Feedback type="invalid">{errors.password_confirmation}</Form.Control.Feedback>
                </Form.Group>
                <div className="d-grid">
                    <LoadingButton onClick={submit}>Save</LoadingButton>
                </div>
            </fieldset>
        </>
    )
}

export default function ProfileLayout() {
    return (
        <>
            <PageNavbar className="py-4">
            </PageNavbar>

            <PageContent>
                <PageContentView className="py-4">
                    <h3 className="display-spacing fw-bold">Edit Profile</h3>
                    <hr />
                    <ProfileForm />
                </PageContentView>
            </PageContent>
        </>
    );
}
