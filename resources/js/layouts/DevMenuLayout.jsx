import React, { useState, useEffect } from 'react';
import { Table, Row, Col, ToggleButton } from 'react-bootstrap';
import LoadingButton from '../components/LoadingButton';
import httpRequest from '../api';

export default function DevMenuLayout() {
    const [isLoading, setLoading] = useState(false);
    const [appState, setAppState] = useState({});
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
                        <LoadingButton onClick={resetAuditState}>Reset Audit State</LoadingButton>
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
                </Col>
                <Col></Col>
            </Row>
        </div>
    );
}
