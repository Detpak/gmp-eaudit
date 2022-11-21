import { faArrowRotateRight, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { Button, Card, Form, InputGroup, Modal } from "react-bootstrap";
import { PageContent, PageContentTopbar, PageContentView } from "../../components/PageNav";
import DynamicTable from "../../components/DynamicTable";
import { ImageModal } from "../../components/ImageModal";
import { getCategoryString, rootUrl, showToastMsg, waitForMs } from "../../utils";
import LoadingButton from "../../components/LoadingButton";
import httpRequest from "../../api";
import DescriptionModal from "../../components/DescriptionModal";
import ModalForm from "../../components/ModalForm";
import { CorrectiveActionForm } from "../CorrectiveActionMain";
import { useEffect } from "react";

function getCaseStatus(status)
{
    return [
        "New",
        "Resolved",
        "Cancelled",
        "Closed",
    ][status];
}

function CancelFinding({ id, setId, refreshTable }) {
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
        refreshTable();
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
    const [refreshTrigger, setRefreshTrigger] = useState(false);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [findingId, setFindingId] = useState(null);
    const [cancelFindingId, setCancelFindingId] = useState(null);
    const [showCurrentCycle, setShowCurrentCycle] = useState(false);

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
                        url: 'api/v1/fetch-findings',
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
                            <Button
                                onClick={_ => setFindingId(item.id)}
                                variant="success"
                                size="sm"
                                disabled={item.auditee_id == null || item.status != 0}
                            >
                                Create
                            </Button>,
                            <Button
                                onClick={_ => setCancelFindingId(item.id)}
                                size="sm"
                                variant="danger"
                                disabled={item.auditee_id == null || item.status != 0}
                            >
                                Create
                            </Button>,
                            item.cancel_reason ? item.cancel_reason : '-',
                            <>
                                <LoadingButton
                                    size="sm"
                                    variant="danger"
                                    onClick={async () => await resetCA(item.id)}
                                    disabled={item.auditee_id == null}
                                >
                                    Reset CA
                                </LoadingButton>
                                <LoadingButton
                                    size="sm"
                                    variant="danger"
                                    onClick={async () => await uncancel(item.id)}
                                    disabled={item.auditee_id == null}
                                >
                                    Uncancel
                                </LoadingButton>
                            </>
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
                        },
                        {
                            sortable: false,
                            name: 'Debug',
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
