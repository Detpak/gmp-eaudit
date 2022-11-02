import { faArrowRotateRight, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { Button, Form, InputGroup, Modal } from "react-bootstrap";
import { PageContent, PageContentTopbar, PageContentView } from "../../components/PageNav";
import DynamicTable from "../../components/DynamicTable";
import { ImageModal } from "../../components/ImageModal";
import { getCategoryString, rootUrl, waitForMs } from "../../utils";
import LoadingButton from "../../components/LoadingButton";
import httpRequest from "../../api";

function getCaseStatus(status)
{
    return [
        "New",
        "Resolved",
        "Cancelled",
        "Closed",
    ][status];
}

function DescriptionModal({ msg }) {
    const [shown, setShown] = useState(false);

    return (
        <>
            <a href="#" onClick={() => setShown(true)}>
                <div className="text-truncate" style={{ maxWidth: 500 }}>{msg}</div>
            </a>
            <Modal show={shown} onHide={() => setShown(false)}>
                <Modal.Header closeButton>Description</Modal.Header>
                <Modal.Body>
                    <div className="text-multiline">
                        {msg}
                    </div>
                </Modal.Body>
            </Modal>
        </>
    )
}

export default function AuditFindingsLayout() {
    const [refreshTrigger, setRefreshTrigger] = useState(false);
    const [searchKeyword, setSearchKeyword] = useState('');

    const refreshTable = () => {
        setRefreshTrigger(!refreshTrigger);
    };

    const handleSearch = ev => {
        setSearchKeyword(ev.target.value);
    };

    const cancelCase = async (id) => {
        await waitForMs(500);
        console.log(id);
    };

    const resetCA = async (id) => {
        const response = await httpRequest.get(`api/v1/dev/reset-ca/${id}`);
        console.log(response);
    };

    return (
        <PageContent>
            <PageContentTopbar>
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
                                href={rootUrl(`corrective-action/${item.id}`)}
                                target="_blank"
                                variant="success"
                                size="sm"
                                disabled={item.auditee_id == null || item.status != 0}
                            >
                                Create
                            </Button>,
                            <LoadingButton
                                size="sm"
                                variant="danger"
                                onClick={async () => await cancelCase(item.id)}
                                disabled={item.auditee_id == null || item.status != 0}
                            >
                                Create
                            </LoadingButton>,
                            item.cancel_reason ? item.cancel_reason : '-',
                            <LoadingButton
                                size="sm"
                                variant="danger"
                                onClick={async () => await resetCA(item.id)}
                                disabled={item.auditee_id == null}
                            >
                                Reset CA
                            </LoadingButton>
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
        </PageContent>
    );
}
