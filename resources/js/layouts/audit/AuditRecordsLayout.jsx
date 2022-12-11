import { faArrowRotateRight, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMemo } from "react";
import { useEffect } from "react";
import { useState } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import BaseAuditPage from "./BaseAuditPage";

export default function AuditRecordsLayout() {
    const columns = useMemo(() => [
        {
            id: 'cycle_id',
            name: 'Cycle ID'
        },
        {
            id: 'code',
            name: 'ID'
        },
        {
            id: 'dept_name',
            name: 'Department',
        },
        {
            id: 'area_name',
            name: 'Area',
        },
        {
            sortable: false,
            filterable: false, // Should we de-filter auditee?
            id: 'auditee',
            name: 'Auditee (PIC)'
        },
        {
            id: 'auditor_name',
            name: 'Auditor'
        },
        {
            number: true,
            id: 'total_case_found',
            name: '# Case Found'
        },
        {
            number: true,
            id: 'observation',
            name: '# Observation'
        },
        {
            number: true,
            id: 'minor_nc',
            name: '# Minor NC'
        },
        {
            number: true,
            id: 'major_nc',
            name: '# Major NC'
        },
        {
            number: true,
            id: 'total_weight',
            name: 'Total Case Weight',
            exportFormat: '0.00%'
        },
        {
            number: true,
            id: 'score_deduction',
            name: 'Score Deduction',
            exportFormat: '0.00%'
        },
        {
            number: true,
            id: 'score',
            name: 'Score',
            exportFormat: '0.00%'
        },
        {
            id: 'status',
            name: 'Status'
        }
    ], []);

    return (
        <BaseAuditPage
            fetch="api/v1/fetch-records"
            columns={columns}
            produce={item => [
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
                item.observation,
                item.minor_nc,
                item.major_nc,
                item.total_weight ? `${item.total_weight.toPrecision(4)}%` : '-',
                item.score_deduction ? `${item.score_deduction.toPrecision(4)}%` : '-',
                item.score ? `${item.score.toPrecision(4)}%` : '-',
                ['Not Started', 'In-Progress', 'Done'][item.status]
            ]}
            produceExport={item => [
                item.cycle_id,
                item.code,
                item.dept_name,
                item.area_name,
                item.area.department.pics.map(data => data.name).join(", "),
                item.auditor_name ? item.auditor_name : '-',
                item.total_case_found,
                Number(item.observation),
                Number(item.minor_nc),
                Number(item.major_nc),
                item.total_weight / 100,
                item.score_deduction / 100,
                item.score / 100,
                ['Not Started', 'In-Progress', 'Done'][item.status]
            ]}
        />
    );
}

/*
export default function AuditRecordsLayout() {
    const [refreshTrigger, setRefreshTrigger] = useState(false);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [showCurrentCycle, setShowCurrentCycle] = useState(false);
    const [fetchUrl, setFetchUrl] = useState(FETCH_URL);
    const filter = useFilter();

    const refreshTable = () => {
        setRefreshTrigger(!refreshTrigger);
    };

    const handleSearch = ev => {
        setSearchKeyword(ev.target.value);
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
                    className="me-3"
                />
                <FilterTable filter={filter} />
            </PageContentTopbar>
            <PageContentView>
                <DynamicTable
                    refreshTrigger={refreshTrigger}
                    searchKeyword={searchKeyword}
                    filter={filter}
                    columns={[
                        {
                            id: 'cycle_id',
                            name: 'Cycle ID'
                        },
                        {
                            id: 'code',
                            name: 'ID'
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
                            filterable: false, // Should we de-filter auditee?
                            id: 'auditee',
                            name: 'Auditee (PIC)'
                        },
                        {
                            id: 'auditor_name',
                            name: 'Auditor'
                        },
                        {
                            number: true,
                            id: 'total_case_found',
                            name: '# Case Found'
                        },
                        {
                            number: true,
                            id: 'observation',
                            name: '# Observation'
                        },
                        {
                            number: true,
                            id: 'minor_nc',
                            name: '# Minor NC'
                        },
                        {
                            number: true,
                            id: 'major_nc',
                            name: '# Major NC'
                        },
                        {
                            number: true,
                            id: 'total_weight',
                            name: 'Total Case Weight'
                        },
                        {
                            number: true,
                            id: 'score_deduction',
                            name: 'Score Deduction'
                        },
                        {
                            number: true,
                            id: 'score',
                            name: 'Score'
                        },
                        {
                            id: 'status',
                            name: 'Status'
                        }
                    ]}
                    source={{
                        url: fetchUrl,
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
                            item.observation,
                            item.minor_nc,
                            item.major_nc,
                            item.total_weight ? `${item.total_weight}%` : '-',
                            item.score_deduction ? `${item.score_deduction}%` : '-',
                            item.score ? `${item.score}%` : '-',
                            ['Not Started', 'In-Progress', 'Done'][item.status]
                        ]
                    }}
                />
            </PageContentView>
        </PageContent>
    );
}
*/
