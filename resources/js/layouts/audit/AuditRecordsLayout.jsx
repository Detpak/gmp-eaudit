import { faArrowRotateRight, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { Button, Form, InputGroup, OverlayTrigger, Tooltip } from "react-bootstrap";
import DynamicTable from "../../components/DynamicTable";
import { PageContent, PageContentTopbar, PageContentView } from "../../components/PageNav";

export default function AuditRecordsLayout() {
    const [refreshTrigger, setRefreshTrigger] = useState(false);
    const [searchKeyword, setSearchKeyword] = useState('');

    const refreshTable = () => {
        setRefreshTrigger(!refreshTrigger);
    };

    const handleSearch = ev => {
        setSearchKeyword(ev.target.value);
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
                    columns={[
                        {
                            id: 'cycle_id',
                            name: 'Cycle ID'
                        },
                        {
                            id: 'code',
                            name: 'Code'
                        },
                        {
                            id: 'dept_name',
                            name: 'Department'
                        },
                        {
                            id: 'area_name',
                            name: 'Area',
                        },
                        {
                            sortable: false,
                            id: 'area.department.pics',
                            name: 'Auditee (PIC)'
                        },
                        {
                            sortable: false,
                            id: 'auditor.name',
                            name: 'Auditor'
                        },
                        {
                            id: 'total_case_found',
                            name: '# Case Found'
                        },
                        {
                            id: 'total_weight',
                            name: 'Total Case Weight'
                        },
                        {
                            id: 'total_weight',
                            name: 'Score Deduction'
                        },
                        {
                            id: 'total_deducted_weight',
                            name: 'Score'
                        },
                        {
                            id: 'status',
                            name: 'Status'
                        }
                    ]}
                    source={{
                        url: 'api/v1/fetch-records',
                        method: 'GET',
                        produce: item => [
                            item.cycle_id,
                            item.code,
                            item.dept_name,
                            item.area_name,
                            <OverlayTrigger
                                placement="bottom"
                                overlay={(props) => (
                                    <Tooltip id="auditee-tooltip" {...props}>
                                        {item.area.department.pics.map((auditee, index) => (
                                            <div key={index}>{auditee.name}</div>
                                        ))}
                                    </Tooltip>
                                )}
                            >
                                <div className="user-select-none text-truncate" style={{ maxWidth: 300 }}>
                                    {item.area.department.pics.map(data => data.name).join(", ")}
                                </div>
                            </OverlayTrigger>,
                            item.auditor_name ? item.auditor_name : '-',
                            item.total_case_found,
                            item.total_weight ? `${item.total_weight}%` : '-',
                            item.total_net_weight ? `${item.total_net_weight}%` : '-',
                            item.total_score ? `${item.total_score}%` : '-',
                            ['Not Started', 'In-Progress', 'Done'][item.status]
                        ]
                    }}
                />
            </PageContentView>
        </PageContent>
    );
}
