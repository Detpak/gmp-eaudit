import React, { useState, useEffect } from 'react';
import { Table, Row, Col, ToggleButton, Form, Modal, Button } from 'react-bootstrap';
import LoadingButton from '../components/LoadingButton';
import { RequiredSpan } from '../components/LabelSpan';
import httpRequest from '../api';
import { transformErrors } from '../utils';

function ResetAuditStateDialog({ show, setShow }) {
    const [password, setPassword] = useState('');
    const [formError, setFormError] = useState(null);
    const [isLoading, setLoading] = useState(false);

    const reset = async () => {
        setFormError(null);
        setLoading(true);
        const authTest = await httpRequest.post('api/v1/dev/auth-test', { password: password });

        if (authTest.data.formError) {
            setFormError(transformErrors(authTest.data.formError));
            setLoading(false);
            return;
        }

        await httpRequest.get('api/v1/dev/reset-audit-state');
        setLoading(false);
        setShow(false);
    };

    return (
        <Modal show={show} onHide={() => setShow(false)}>
            <Modal.Header closeButton={!isLoading}>
                <Modal.Title>Reset Audit State</Modal.Title>
            </Modal.Header>
            <Form>
                <Modal.Body>
                    <Form.Group>
                        <Form.Label>Confirm Password <RequiredSpan /></Form.Label>
                        <Form.Control
                            id="password"
                            name="password"
                            value={password}
                            onChange={(ev) => setPassword(ev.target.value)}
                            isInvalid={formError && formError.password}
                            type="password"
                        />
                        <Form.Control.Feedback type="invalid">{formError && formError.password ? formError.password : ''}</Form.Control.Feedback>

                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <LoadingButton onClick={reset}>Reset</LoadingButton>
                </Modal.Footer>
            </Form>
        </Modal>
    )
}

export default function DevMenuLayout() {
    const [isLoading, setLoading] = useState(false);
    const [appState, setAppState] = useState({});
    const [resetAuditForm, openResetAuditForm] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(false);

    useEffect(async () => {
        const response = await httpRequest.get('api/v1/dev/get-app-state');
        setAppState(response.data);
    }, [refreshTrigger]);

    const handleClick = () => {
        setLoading(true);

        new Promise((resolve) => setTimeout(resolve, 3000))
            .then(() => {
                setLoading(false);
            })
    };

    const resetCurrentCycle = async () => {
        const response = await httpRequest.get('api/v1/dev/reset-current-cycle');
        setRefreshTrigger(!refreshTrigger);
        console.log(response.data);
    };

    const resetFindingsCounter = async () => {
        const response = await httpRequest.get('api/v1/dev/reset-findings-counter');
        setRefreshTrigger(!refreshTrigger);
        console.log(response.data);
    };

    const resetAuditState = async () => {
        const response = await httpRequest.get('api/v1/dev/reset-audit-state');
        setRefreshTrigger(!refreshTrigger);
        console.log(response.data);
    };

    const [test, setTest] = useState(false);

    const click = ev => {
        setTest(ev.currentTarget.checked);
        //ev.currentTarget.blur();
    };

    return (
        <div className="p-4">
            <Row>
                <Col>
                    <div className="vstack gap-2">
                        <LoadingButton isLoading={isLoading} onClick={handleClick}>Test Loading Button</LoadingButton>
                        <LoadingButton onClick={resetCurrentCycle}>Reset Current Cycle</LoadingButton>
                        <LoadingButton onClick={resetFindingsCounter}>Reset Findings Counter</LoadingButton>
                        <Button onClick={() => openResetAuditForm(true)}>Reset Audit State</Button>
                        <ToggleButton
                            id="test"
                            type="checkbox"
                            variant="outline-primary"
                            value="1"
                            checked={test}
                            onChange={(ev) => click(ev)}
                        >
                            Test {/* <FontAwesomeIcon icon={faCheck} /> */}
                        </ToggleButton>
                    </div>
                    <div>AppState</div>

                    <Table>
                        <tbody>
                            {_.map(appState, (value, key) => (
                                <tr key={key}>
                                    <th>{key}</th>
                                    <td>{value}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>

                    <ResetAuditStateDialog show={resetAuditForm} setShow={openResetAuditForm} />
                </Col>
                <Col></Col>
            </Row>
        </div>
    );
}
