import React from "react";
import axios from "axios";
import DynamicTable from "../../components/DynamicTable";
import LoadingButton from "../../components/LoadingButton";
import { faArrowRightToBracket, faArrowRotateRight, faPlus, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { showToastMsg, rootUrl } from "../../utils";
import { PageContent, PageContentTopbar, PageContentView } from "../../components/PageNav";
import "gridjs/dist/theme/mermaid.css";
import { Button, Form, InputGroup } from "react-bootstrap";
import { useState } from "react";
import ModalForm from "../../components/ModalForm";
import { useEffect } from "react";

const formInitialValues = {
    start_date: '',
    end_date: ''
};

function AuditCycleForm({ shown, handleChange, values, setValues, errors }) {
    useEffect(() => {
        console.log(values);
    }, [values])

    return (
        <>
            <Form.Group className="mb-3">
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                    type="datetime-local"
                    className="mb-1"
                    name="start_date"
                    disabled={values.use_current_date}
                    value={values.start_date}
                    onChange={handleChange}
                    isInvalid={!!errors.start_date}
                />
                <Form.Control.Feedback type="invalid">{errors.start_date}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group>
                <Form.Label>Due Date</Form.Label>
                <Form.Control
                    type="datetime-local"
                    className="mb-1"
                    name="end_date"
                    value={values.end_date}
                    onChange={handleChange}
                    isInvalid={!!errors.end_date}
                />
                <Form.Control.Feedback type="invalid">{errors.end_date}</Form.Control.Feedback>
            </Form.Group>
        </>
    );
}

export default function AuditCyclesLayout() {
    const [startNewCycleModalShown, setStartNewCycleModalShown] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(false);
    const [searchKeyword, setSearchKeyword] = useState('');

    const refreshTable = () => {
        setRefreshTrigger(!refreshTrigger);
    };

    const handleSearch = ev => {
        setSearchKeyword(ev.target.value);
    };

    const startNewCycle = async () => {
        const newCycle = await axios.post(rootUrl('api/v1/new-cycle'));

        if (newCycle.data.result == 'ok') {
            showToastMsg("New cycle has been started.");
            refreshTable();
        }
    };

    const closeOrReopenCycle = async (id, close) => {
        const response = await axios.get(rootUrl(`api/v1/close-or-reopen-cycle/${id}?close=${close}`));

        if (response.data.result === 'ok') {
            if (close) {
                showToastMsg('Cycle has been closed!');
            }
            else {
                showToastMsg('Cycle has been reopened!');
            }

            refreshTable();
        }
    };

    return (
        <PageContent>
            <PageContentTopbar>
                <Button variant="success" onClick={() => setStartNewCycleModalShown(true)} className="me-2"><FontAwesomeIcon icon={faArrowRightToBracket}/> Start New Cycle</Button>
                <Button variant="outline-primary" onClick={refreshTable} className="me-2"><FontAwesomeIcon icon={faArrowRotateRight} /></Button>
                <Form.Group>
                    <InputGroup>
                        <Form.Control type="text" value={searchKeyword} onChange={handleSearch} placeholder="Search" />
                        <Button variant="outline-secondary" onClick={() => setSearchKeyword('')}>
                            <FontAwesomeIcon icon={faXmark} />
                        </Button>
                    </InputGroup>
                </Form.Group>
            </PageContentTopbar>
            <PageContentView>
                <DynamicTable
                    refreshTrigger={refreshTrigger}
                    searchKeyword={searchKeyword}
                    columns={[
                        {
                            id: 'label',
                            name: 'Label',
                        },
                        {
                            id: 'open_time',
                            name: 'Open Time'
                        },
                        {
                            id: 'close_time',
                            name: 'Close Time'
                        },
                        {
                            sortable: false,
                            id: 'controls',
                            name: 'Action'
                        }
                    ]}
                    source={{
                        url: rootUrl('api/v1/fetch-cycles'),
                        method: 'GET',
                        produce: item => [
                            item.label,
                            item.open_time,
                            item.close_time ? item.close_time : '-',
                            item.close_time ?
                                <LoadingButton
                                    type="button"
                                    variant="primary"
                                    size="sm"
                                    onClick={async () => await closeOrReopenCycle(item.id, 0)}
                                >
                                    Reopen
                                </LoadingButton>
                                :
                                <LoadingButton
                                    type="button"
                                    variant="danger"
                                    size="sm"
                                    onClick={async () => await closeOrReopenCycle(item.id, 1)}
                                >
                                    Close
                                </LoadingButton>
                        ],
                    }}
                />
            </PageContentView>

            <ModalForm
                title="Start New Cycle"
                action={rootUrl('api/v1/new-cycle')}
                initialValues={formInitialValues}
                closeButton={true}
                show={startNewCycleModalShown}
                onClose={() => setStartNewCycleModalShown(false)}
                submitBtn={{
                    name: "Start",
                    icon: faArrowRightToBracket,
                    afterSubmit: () => {
                        showToastMsg("New cycle has been started");
                        refreshTable();
                    }
                }}
            >
                {({ shown, handleChange, values, setValues, errors }) => {
                    const formProps = {
                        shown: shown,
                        handleChange: handleChange,
                        values: values,
                        setValues: setValues,
                        errors: errors,
                    };
                    return React.createElement(AuditCycleForm, formProps);
                }}
            </ModalForm>

        </PageContent>
    );
}
