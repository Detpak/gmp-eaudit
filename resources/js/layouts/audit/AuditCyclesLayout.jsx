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
import SearchList from "../../components/SearchList";
import ListView from "../../components/ListView";
import DropdownList from "../../components/DropdownList";

const formInitialValues = {
    start_date: '',
    finish_date: '',
    desc: '',
    cgroup_id: ''
};

function AuditCycleForm({ shown, handleChange, values, setValues, errors }) {
    const [criteriaGroup, setCriteriaGroup] = useState(null);
    const [startDate, setStartDate] = useState(null);

    useEffect(() => {
        console.log(values);
    }, [values])

    useEffect(() => {
        const currentDate = new Date(Date.now() + (new Date().getTimezoneOffset() * -60 * 1000)).toISOString();
        const date = currentDate.slice(0, 10);
        setValues({ ...values, start_date: date });
        setStartDate(`${date}`);
    }, []);

    const handleSelectCriteriaGroup = (selected) => {
        setCriteriaGroup(selected);
        setValues({ ...values, cgroup_id: `${selected.id}` });
    };

    return (
        <>
            <Form.Group className="mb-3">
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                    type="date"
                    className="mb-1"
                    name="start_date"
                    defaultValue={startDate}
                    disabled
                />
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label>Finish Date</Form.Label>
                <Form.Control
                    type="date"
                    className="mb-1"
                    name="finish_date"
                    value={values.finish_date}
                    onChange={handleChange}
                    isInvalid={!!errors.finish_date}
                />
                <Form.Control.Feedback type="invalid">{errors.finish_date}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label>Criteria Group</Form.Label>
                <DropdownList
                    source={rootUrl('api/v1/fetch-criteria-groups?noparam=true')}
                    selectedItem={criteriaGroup}
                    setSelectedItem={handleSelectCriteriaGroup}
                    caption={(data) => data.name}
                    title="Please Select Criteria Group"
                >
                    {({ data }) => (
                        <span>{data.name}</span>
                    )}
                </DropdownList>
                <input type="hidden" className={!!errors.cgroup_id ? 'is-invalid' : ''} />
                <Form.Control.Feedback type="invalid">{errors.cgroup_id}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control as="textarea" name="desc" rows={3} value={values.desc} onChange={handleChange} isInvalid={!!errors.desc} maxLength={65536} />
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

    const closeCycle = async (id) => {
        const response = await axios.get(rootUrl(`api/v1/close-cycle/${id}`));

        if (response.data.result === 'ok') {
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
                            id: 'cycle_id',
                            name: 'Cycle ID',
                        },
                        {
                            id: 'start_date',
                            name: 'Start Date'
                        },
                        {
                            id: 'finish_date',
                            name: 'Finish Date'
                        },
                        {
                            id: 'close_date',
                            name: 'Close Date'
                        },
                        {
                            sortable: false,
                            id: 'desc',
                            name: 'Description'
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
                            item.cycle_id,
                            item.start_date,
                            item.finish_date ? item.finish_date : '-',
                            item.close_date ? item.close_date : '-',
                            item.desc && item.desc.length > 0 ? item.desc : '-',
                            !item.close_date ?
                                <LoadingButton
                                    type="button"
                                    variant="danger"
                                    size="sm"
                                    onClick={async () => await closeCycle(item.id)}
                                >
                                    Close
                                </LoadingButton>
                                :
                                <></>
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
                    afterSubmit: (response) => {
                        if (response.result == 'error') {
                            showToastMsg(response.msg);
                        }
                        else {
                            showToastMsg("New cycle has been started");
                        }

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
