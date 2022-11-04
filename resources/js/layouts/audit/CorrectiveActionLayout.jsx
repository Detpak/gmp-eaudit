import { faArrowRotateRight, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { Button, Form, InputGroup, Modal } from "react-bootstrap";
import { PageContent, PageContentTopbar, PageContentView } from "../../components/PageNav";
import DynamicTable from "../../components/DynamicTable";
import { ImageModal } from "../../components/ImageModal";
import { getCategoryString, rootUrl, showToastMsg, transformErrors, waitForMs } from "../../utils";
import LoadingButton from "../../components/LoadingButton";
import httpRequest from "../../api";
import DescriptionModal from "../../components/DescriptionModal";
import ModalForm from "../../components/ModalForm";
import { useEffect } from "react";

function ApproveCorrectiveActionForm({ id, disabled, refreshTable }) {
    const [shown, setShown] = useState(false);
    const [isSubmitting, setSubmitting] = useState(false);
    const [remarks, setRemarks] = useState('');
    const [formError, setFormError] = useState(null);

    const closeCA = async () => {
        if (!confirm('Are you sure?')) return;
        setSubmitting(true);

        const formData = {
            id: id,
            remarks: remarks
        };

        return (await httpRequest.post('api/v1/close-corrective-action', formData)).data;
    };

    useEffect(() => {
        setRemarks('');
        setFormError(null);
    }, []);

    return (
        <>
            <Button size="sm" onClick={() => setShown(true)} disabled={disabled}>Approve</Button>
            <Modal show={shown} onHide={() => setShown(false)}>
                <Modal.Header closeButton>
                    <Modal.Title className="fw-bold display-spacing">Approve Corrective Action</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Remarks</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={remarks}
                                onChange={ev => {
                                    setRemarks(ev.target.value);
                                }}
                                disabled={isSubmitting}
                                isInvalid={formError && formError.remarks}
                            />
                            <Form.Control.Feedback type="invalid">{formError && formError.remarks ? formError.remarks : ''}</Form.Control.Feedback>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <LoadingButton
                        onClick={closeCA}
                        afterLoading={responseData => {
                            if (responseData.formError) {
                                setFormError(transformErrors(responseData.formError));
                                setSubmitting(false);
                                return;
                            }

                            if (responseData.result == 'error') {
                                showToastMsg(responseData.msg);
                            }

                            setSubmitting(false);
                            setShown(false);
                            refreshTable();
                        }}
                    >
                        Done
                    </LoadingButton>
                </Modal.Footer>
            </Modal>
        </>
    )
}

export default function CorrectiveActionLayout() {
    const [refreshTrigger, setRefreshTrigger] = useState(false);
    const [searchKeyword, setSearchKeyword] = useState('');

    const refreshTable = () => {
        setRefreshTrigger(!refreshTrigger);
    };

    const handleSearch = ev => {
        setSearchKeyword(ev.target.value);
    };

    const resetApproval = async (id) => {
        const response = await httpRequest.get(`api/v1/dev/reset-ca-approval/${id}`);
        console.log(response.data);
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
                        url: 'api/v1/fetch-corrective-actions',
                        method: 'GET',
                        produce: item => [
                            item.code,
                            item.area_name,
                            item.auditee,
                            item.status == 1 ? 'New' : 'Closed',
                            getCategoryString(item.category),
                            `${item.ca_name} (${item.ca_code})`,
                            `${item.ca_weight}%`,
                            `${item.deducted_weight}%`,
                            <DescriptionModal msg={item.desc} />,
                            <DescriptionModal msg={item.closing_remarks} />,
                            <ImageModal buttonSize="sm" src={`api/v1/fetch-corrective-action-images/${item.id}`} disabled={item.images_count == 0} />,
                            <ApproveCorrectiveActionForm id={item.id} disabled={item.status == 3} refreshTable={refreshTable} />,
                            <LoadingButton size="sm" onClick={async () => resetApproval(item.id)}>Reset Approval</LoadingButton>
                        ]
                    }}
                    columns={[
                        {
                            id: 'code',
                            name: 'Case ID',
                        },
                        {
                            id: 'area_name',
                            name: 'Area Name',
                        },
                        {
                            id: 'auditee',
                            name: 'Auditee',
                        },
                        {
                            id: 'status',
                            name: 'Status',
                        },
                        {
                            id: 'category',
                            name: 'Category',
                        },
                        {
                            id: 'ca_name',
                            name: 'Criteria Name',
                        },
                        {
                            id: 'ca_weight',
                            name: 'Criteria Weight',
                        },
                        {
                            id: 'deducted_weight',
                            name: 'Deducted Weight',
                        },
                        {
                            id: 'desc',
                            name: 'Description',
                        },
                        {
                            id: 'closing_remarks',
                            name: 'Closing Remarks'
                        },
                        {
                            sortable: false,
                            name: 'Images'
                        },
                        {
                            sortable: false,
                            name: 'Action'
                        },
                        {
                            sortable: false,
                            name: 'Debug'
                        }
                    ]}
                />
            </PageContentView>
        </PageContent>
    );
}
