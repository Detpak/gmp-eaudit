import { useMemo } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import BaseAuditPage from "./BaseAuditPage";

export default function AuditDeptRecordsLayout() {
    const columns = useMemo(() => [
        {
            id: 'cycle_id',
            name: 'Cycle ID'
        },
        {
            id: 'dept_name',
            name: 'Department',
        },
        {
            sortable: false,
            filterable: false, // Should we de-filter auditee?
            id: 'auditee',
            name: 'Auditee (PIC)'
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
            id: 'score_deduction',
            name: 'Score Deduction',
            exportFormat: '0.00%'
        },
        {
            number: true,
            id: 'score',
            name: 'Score',
            exportFormat: '0.00%'
        }
    ], []);

    return (
        <BaseAuditPage
            fetch="api/v1/fetch-dept-records"
            columns={columns}
            produce={item => [
                item.cycle_id,
                item.dept_name,
                <OverlayTrigger
                    placement="bottom"
                    overlay={(props) => (
                        <Tooltip id="auditee-tooltip" {...props}>
                            {item.pics.map((auditee, index) => (
                                <div key={index}>{auditee.name}</div>
                            ))}
                        </Tooltip>
                    )}
                >
                    <div className="user-select-none text-truncate" style={{ maxWidth: 300 }}>
                        {item.pics.map(data => data.name).join(", ")}
                    </div>
                </OverlayTrigger>,
                item.total_case_found,
                item.observation,
                item.minor_nc,
                item.major_nc,
                item.score_deduction ? `${item.score_deduction}%` : '-',
                item.score ? `${item.score}%` : '-'
            ]}
            produceExport={item => [
                item.cycle_id,
                item.dept_name,
                item.pics.map(data => data.name).join(", "),
                item.total_case_found,
                Number(item.observation),
                Number(item.minor_nc),
                Number(item.major_nc),
                item.score_deduction / 100,
                item.score / 100
            ]}
        />
    )
}
