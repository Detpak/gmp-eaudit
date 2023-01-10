import { faArrowRotateRight, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { Button, Card, Form, InputGroup, Modal } from "react-bootstrap";
import { PageContent, PageContentTopbar, PageContentView } from "../../components/PageNav";
import DynamicTable, { useRefreshTable } from "../../components/DynamicTable";
import { ImageModal } from "../../components/ImageModal";
import { getCategoryString, rootUrl, showToastMsg, waitForMs } from "../../utils";
import LoadingButton from "../../components/LoadingButton";
import httpRequest from "../../api";
import DescriptionModal from "../../components/DescriptionModal";
import ModalForm from "../../components/ModalForm";
import { CorrectiveActionForm } from "../CorrectiveActionMain";
import { useEffect } from "react";
import BaseAuditPage from "./BaseAuditPage";
import { globalState } from "../../app_state";

function getCaseStatus(status)
{
    return [
        "New",
        "Resolved",
        "Cancelled",
        "Closed",
    ][status];
}

function CancelFinding({ id, setId, triggerRefresh }) {
    const [isCancelling, setCancelling] = useState(false);
    const [reason, setReason] = useState('');
    const [formError, setFormError] = useState({});

    const cancel = async _ => {
        setCancelling(true);

        const data = {
            id: id,
            reason: reason,
        };

        const response = await httpRequest.post('api/v1/cancel-finding', data);

        if (response.data.formError) {
            console.log(response.data.formError);
            setFormError(response.data.formError);
            setCancelling(false);
            return;
        }
        else if (response.data.error) {
            showToastMsg(response.data.error);
        }

        setCancelling(false);
        setId(null);
        triggerRefresh();
    };

    useEffect(_ => {
        setReason('');
    }, [id]);

    return (
        <Modal show={id != null} backdrop="static" onHide={_ => setId(null)}>
            <Modal.Header closeButton={!isCancelling}>
                <Modal.Title>Cancel Case Finding</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group>
                    <Form.Label>Reason</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        value={reason}
                        onChange={ev => setReason(ev.target.value)}
                        isInvalid={!!formError.reason}
                    />
                    <Form.Control.Feedback type="invalid">{formError.reason && formError.reason[0]}</Form.Control.Feedback>
                </Form.Group>
            </Modal.Body>
            <Modal.Footer>
                <LoadingButton variant="danger" isLoading={isCancelling} onClick={cancel}>Cancel</LoadingButton>
            </Modal.Footer>
        </Modal>
    );
}

export default function AuditFindingsLayout() {
    const [findingId, setFindingId] = useState(null);
    const [cancelFindingId, setCancelFindingId] = useState(null);
    const [userData, setUserData] = globalState.useGlobalState('userData');
    const refreshTable = useRefreshTable();

    const resetCA = async (id) => {
        await httpRequest.get(`api/v1/dev/reset-ca/${id}`);
        refreshTable.triggerRefresh();
    };

    const uncancel = async id => {
        await httpRequest.get(`api/v1/dev/uncancel-ca/${id}`);
        refreshTable.triggerRefresh();
    };

    return (
        <>
            <BaseAuditPage
                refreshTable={refreshTable}
                fetch="api/v1/fetch-findings"
                columns={[
                    {
                        id: 'record_code',
                        name: 'Record ID',
                    },
                    {
                        id: 'code',
                        name: 'ID',
                    },
                    {
                        id: 'department_name',
                        name: 'Department',
                    },
                    {
                        id: 'area_name',
                        name: 'Area',
                    },
                    {
                        id: 'status',
                        name: 'Status'
                    },
                    {
                        id: 'desc',
                        name: 'Description',
                    },
                    {
                        id: 'category',
                        name: 'Category'
                    },
                    {
                        id: 'cg_name',
                        name: 'Criteria Group'
                    },
                    {
                        id: 'ca_name',
                        name: 'Criteria'
                    },
                    {
                        type: 'number',
                        id: 'ca_weight',
                        name: 'Criteria Weight',
                        exportFormat: '0.00%'
                    },
                    {
                        type: 'number',
                        id: 'deducted_weight',
                        name: 'Deducted Weight',
                        exportFormat: '0.00%'
                    },
                    {
                        export: false,
                        filterable: false,
                        sortable: false,
                        name: 'Images'
                    },
                    {
                        export: false,
                        filterable: false,
                        sortable: false,
                        name: 'Corrective Action'
                    },
                    {
                        export: false,
                        filterable: false,
                        sortable: false,
                        name: 'Cancellation'
                    },
                    {
                        id: 'cancel_reason',
                        name: 'Cancellation Reason'
                    }
                ]}
                produce={item => [
                    item.record_code,
                    item.code,
                    item.department_name,
                    item.area_name,
                    getCaseStatus(item.status),
                    <DescriptionModal msg={item.desc} />,
                    getCategoryString(item.category),
                    `${item.cg_name} (${item.cg_code})`,
                    `${item.ca_name} (${item.ca_code})`,
                    `${item.ca_weight}%`,
                    `${item.deducted_weight}%`,
                    <ImageModal buttonSize="sm" src={`api/v1/fetch-finding-images/${item.id}`} disabled={item.images_count == 0} />,
                    <>
                        <Button
                            onClick={_ => setFindingId(item.id)}
                            variant="success"
                            size="sm"
                            disabled={item.has_auditee_id == null || item.status != 0 || !userData.auditee}
                        >
                            Create
                        </Button>
                        {userData.superadmin &&
                            <LoadingButton
                                size="sm"
                                variant="danger"
                                onClick={async () => await resetCA(item.id)}
                                //disabled={item.auditee_id == null}
                                className="ms-1"
                            >
                                Reset CA
                            </LoadingButton>
                        }
                    </>,
                    <>
                        <Button
                            onClick={_ => setCancelFindingId(item.id)}
                            size="sm"
                            variant="danger"
                            disabled={item.status != 0 || !userData.auditor}
                        >
                            Create
                        </Button>
                        {userData.superadmin &&
                            <LoadingButton
                                size="sm"
                                variant="danger"
                                onClick={async () => await uncancel(item.id)}
                                //disabled={item.auditee_id == null}
                                className="ms-1"
                            >
                                Uncancel
                            </LoadingButton>
                        }
                    </>,
                    item.cancel_reason ? item.cancel_reason : '-',
                ]}
                produceExport={item => [
                    item.record_code,
                    item.code,
                    item.department_name,
                    item.area_name,
                    getCaseStatus(item.status),
                    item.desc,
                    getCategoryString(item.category),
                    `${item.cg_name} (${item.cg_code})`,
                    `${item.ca_name} (${item.ca_code})`,
                    item.ca_weight / 100,
                    item.deducted_weight / 100,
                    item.cancel_reason,
                ]}
            />

            <Modal show={findingId != null} onHide={_ => setFindingId(null)}>
                <Modal.Header closeButton>
                    <h3 className="fw-bold display-spacing m-0">Create Corrective Action</h3>
                </Modal.Header>
                <Card className="border-0">
                    <CorrectiveActionForm
                        findingId={findingId}
                        afterSubmit={_ => {
                            setFindingId(null);
                            refreshTable.triggerRefresh();
                        }}
                    />
                </Card>
            </Modal>

            <CancelFinding id={cancelFindingId} setId={setCancelFindingId} triggerRefresh={refreshTable.triggerRefresh} />
        </>
    )
}

/*
export default function AuditFindingsLayout() {
    const [refreshTrigger, setRefreshTrigger] = useState(false);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [findingId, setFindingId] = useState(null);
    const [cancelFindingId, setCancelFindingId] = useState(null);
    const [showCurrentCycle, setShowCurrentCycle] = useState(false);
    const [fetchUrl, setFetchUrl] = useState(FETCH_URL);

    const refreshTable = () => {
        setRefreshTrigger(!refreshTrigger);
    };

    const handleSearch = ev => {
        setSearchKeyword(ev.target.value);
    };

    const resetCA = async (id) => {
        await httpRequest.get(`api/v1/dev/reset-ca/${id}`);
        refreshTable();
    };

    const uncancel = async id => {
        await httpRequest.get(`api/v1/dev/uncancel-ca/${id}`);
        refreshTable();
    };

    useEffect(async () => {
        if (showCurrentCycle) {
            const response = await httpRequest.get('api/v1/get-active-cycle');
            setFetchUrl(`${FETCH_URL}?cycle_id=${response.data.result.id}`);
        }
        else {
            setFetchUrl(FETCH_URL);
        }

        refreshTable();
    }, [showCurrentCycle]);

    return (
        <PageContent>
            <PageContentTopbar>
                <Button variant="outline-primary" onClick={refreshTable} className="me-2"><FontAwesomeIcon icon={faArrowRotateRight} /></Button>
                <Form.Group className="me-3">
                    <InputGroup>
                        <Form.Control type="text" value={searchKeyword} onChange={handleSearch} placeholder="Search" />
                        <Button variant="outline-secondary" onClick={() => setSearchKeyword('')}>
                            <FontAwesomeIcon icon={faXmark} />
                        </Button>
                    </InputGroup>
                </Form.Group>
                <Form.Check
                    label="Show Current Cycle"
                    checked={showCurrentCycle}
                    onChange={_ => setShowCurrentCycle(!showCurrentCycle)}
                />
            </PageContentTopbar>
            <PageContentView>
                <DynamicTable
                    refreshTrigger={refreshTrigger}
                    searchKeyword={searchKeyword}
                    source={{
                        url: fetchUrl,
                        method: 'GET',
                        produce: item => [
                            item.record_code,
                            item.code,
                            item.department_name,
                            item.area_name,
                            getCaseStatus(item.status),
                            <DescriptionModal msg={item.desc} />,
                            getCategoryString(item.category),
                            `${item.cg_name} (${item.cg_code})`,
                            `${item.ca_name} (${item.ca_code})`,
                            `${item.ca_weight}%`,
                            `${item.deducted_weight}%`,
                            <ImageModal buttonSize="sm" src={`api/v1/fetch-finding-images/${item.id}`} disabled={item.images_count == 0} />,
                            <>
                                <Button
                                    onClick={_ => setFindingId(item.id)}
                                    variant="success"
                                    size="sm"
                                    disabled={item.auditee_id == null || item.status != 0}
                                >
                                    Create
                                </Button>
                                {process.env.MIX_APP_DEBUG &&
                                    <LoadingButton
                                        size="sm"
                                        variant="danger"
                                        onClick={async () => await resetCA(item.id)}
                                        disabled={item.auditee_id == null}
                                    >
                                        Reset CA
                                    </LoadingButton>
                                }
                            </>,
                            <>
                                <Button
                                    onClick={_ => setCancelFindingId(item.id)}
                                    size="sm"
                                    variant="danger"
                                    disabled={item.auditee_id == null || item.status != 0}
                                >
                                    Create
                                </Button>
                                {process.env.MIX_APP_DEBUG &&
                                    <LoadingButton
                                        size="sm"
                                        variant="danger"
                                        onClick={async () => await uncancel(item.id)}
                                        disabled={item.auditee_id == null}
                                    >
                                        Uncancel
                                    </LoadingButton>
                                }
                            </>,
                            item.cancel_reason ? item.cancel_reason : '-',
                        ]
                    }}
                    columns={[
                        {
                            id: 'record_code',
                            name: 'Record ID',
                        },
                        {
                            id: 'code',
                            name: 'ID',
                        },
                        {
                            id: 'department_name',
                            name: 'Department',
                        },
                        {
                            id: 'area_name',
                            name: 'Area',
                        },
                        {
                            id: 'status',
                            name: 'Status'
                        },
                        {
                            id: 'desc',
                            name: 'Description',
                        },
                        {
                            id: 'category',
                            name: 'Category'
                        },
                        // {
                        //     id: 'approved',
                        //     name: 'Approved'
                        // },
                        {
                            id: 'cg_name',
                            name: 'Criteria Group'
                        },
                        {
                            id: 'ca_name',
                            name: 'Criteria'
                        },
                        {
                            id: 'ca_weight',
                            name: 'Criteria Weight'
                        },
                        {
                            id: 'deducted_weight',
                            name: 'Deducted Weight'
                        },
                        {
                            sortable: false,
                            name: 'Images'
                        },
                        {
                            sortable: false,
                            name: 'Corrective Action'
                        },
                        {
                            sortable: false,
                            name: 'Cancellation'
                        },
                        {
                            id: 'cancel_reason',
                            name: 'Cancellation Reason'
                        }
                    ]}
                />
            </PageContentView>

            <Modal show={findingId != null} onHide={_ => setFindingId(null)}>
                <Modal.Header closeButton>
                    <h3 className="fw-bold display-spacing m-0">Create Corrective Action</h3>
                </Modal.Header>
                <Card className="border-0">
                    <CorrectiveActionForm
                        findingId={findingId}
                        afterSubmit={_ => {
                            setFindingId(null);
                            refreshTable();
                        }}
                    />
                </Card>
            </Modal>

            <CancelFinding id={cancelFindingId} setId={setCancelFindingId} refreshTable={refreshTable} />
        </PageContent>
    );
}
 */
