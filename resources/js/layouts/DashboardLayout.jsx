import { faCheckToSlot, faListCheck, faRecycle, faRotateRight, faThumbsUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState, useEffect } from "react";
import { Button, Card, Col, Container, Form, Row, Spinner } from "react-bootstrap";
import httpRequest from "../api";
import { PageContent, PageContentView, PageNavbar } from "../components/PageNav";
import { Pie, Bar, Line } from "react-chartjs-2"
import { getCategoryString, useIsMounted } from "../utils";
import chroma from "chroma-js";
import { useMemo } from "react";
import DropdownList from "../components/DropdownList";
import { useRef } from "react";
import { set } from "lodash";
import DynamicTable from "../components/DynamicTable";
import DescriptionModal from "../components/DescriptionModal";
import { getCaseStatus } from "./audit/AuditFindingsLayout";

function SummaryButton({ href, caption, value, icon }) {
    return (
        <Button href={href ? href : '#'} variant="outline-primary" className="w-100 h-100 text-start p-3">
            <div className="hstack gap-1">
                <div className="flex-fill">
                    <h5 className="fw-bold display-spacing">{caption}</h5>
                    {value != null ?
                        <h2 className="fw-bold my-0">{value}</h2>
                        :
                        <Spinner animation="border" />
                    }
                </div>
                <FontAwesomeIcon icon={icon} className="chart-icon" />
            </div>
        </Button>
    )
}

function ChartColumn({ caption, children, cycle, isLoading }) {
    return (
        <Card className="col m-2 p-3" style={{ minWidth: 550 }}>
            <div className="hstack">
                <h4 className="fw-bold display-spacing">
                    <>{caption}{cycle != null ? ` - ${cycle.cycle_id}` : ""}</>
                </h4>
                {isLoading && <Spinner animation="border" size="sm" className="ms-auto" />}
            </div>

            {children}
        </Card>
    );
}

const barOptions = {
    responsive: true,
    maintainAspectRatio: true,
    scales: {
        y: {
            beginAtZero: true,
            ticks: { stepSize: 1 }
        }
    },
    plugins: {
        legend: {
            display: false
        },
        datalabels: {
            display: false
        }
    }
};

const tableColumns = [
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
        type: 'date_time',
        id: 'submit_date',
        name: 'Submit Date',
    },
];

export default function DashboardLayout() {
    const [summary, setSummary] = useState({});
    const [refreshTrigger, setRefreshTrigger] = useState(false);
    const [tableRefresh, setTableRefresh] = useState(false);
    const [areaStatus, setAreaStatus] = useState(null);
    const [top10criteria, setTop10Criteria] = useState(null);
    const [top10Approved, setTop10Approved] = useState(null);
    const [caseStatistics, setCaseStatistics] = useState(null);
    const [findings, setFindings] = useState(null);
    const [cycle, setCycle] = useState(null);
    const [allCycle, setAllCycle] = useState(false);
    const [isLoading, setLoading] = useState(false);
    const abortController = useRef(null);
    const mounted = useIsMounted();
    const colorPalette = useMemo(() => {
        const bezierPoints = _.chain()
            .range(12)
            .map((value) => chroma.hsv(value / 12 * 360, 0.60, 1.0).desaturate(1))
            .value();

        return chroma
            .bezier(bezierPoints)
            .scale()
    }, []);

    const refresh = _ => {
        setRefreshTrigger(!refreshTrigger);
    };

    useEffect(async () => {
        if (!mounted.current) return;
        if (cycle == null) return;

        if (abortController.current != null) {
            abortController.current.abort();
        }

        abortController.current = new AbortController();
        setLoading(true);
        setTableRefresh(!tableRefresh);
        setSummary({});

        const cycle_id = allCycle ? null : cycle.id;

        Promise.all([
            httpRequest.get('api/v1/get-summary', { params: { cycle_id: cycle_id }, signal: abortController.current.signal }),
            httpRequest.post('api/v1/get-chart', { type: 'area_status', cycle_id: cycle_id, signal: abortController.current.signal }),
            httpRequest.post('api/v1/get-chart', { type: 'top10_criteria', cycle_id: cycle_id, signal: abortController.current.signal }),
            httpRequest.post('api/v1/get-chart', { type: 'top10_approved', cycle_id: cycle_id, signal: abortController.current.signal }),
            httpRequest.post('api/v1/get-chart', { type: 'case_statistics', cycle_id: cycle_id, signal: abortController.current.signal }),
        ])
            .then((values) => {
                if (!mounted.current) return;
                setSummary(values[0].data);
                setAreaStatus(values[1].data);
                setTop10Criteria(values[2].data);
                setTop10Approved(values[3].data);
                setCaseStatistics(values[4].data);
                setLoading(false);
            })
            .catch((reason) => {
                console.log(reason);
            });

        return () => {
            if (abortController.current != null) {
                abortController.current.abort();
                abortController.current = null;
            }
        };
    }, [refreshTrigger, cycle, allCycle]);

    return (
        <>
            <PageNavbar>
                <Button onClick={refresh} className="me-2"><FontAwesomeIcon icon={faRotateRight} /></Button>
                <DropdownList
                    className="me-2"
                    source="api/v1/fetch-cycles"
                    selectedItem={cycle}
                    setSelectedItem={setCycle}
                    caption={(data) => <>Cycle: {data.cycle_id}</>}
                    selectFirstData={true}
                    disabled={cycle == null || allCycle}
                    title="No Cycle Started"
                >
                    {({ data }) => (
                        <span>{data.cycle_id}</span>
                    )}
                </DropdownList>
                <Form.Group>
                    <Form.Check
                        type="checkbox"
                        label="All Cycles"
                        defaultChecked={allCycle}
                        onChange={(ev) => setAllCycle(!allCycle)}
                    />
                </Form.Group>
            </PageNavbar>

            <PageContent>
                <PageContentView className="vstack gap-3 py-4">
                    <Row>
                        <Col>
                            <SummaryButton
                                caption="Total Cycles"
                                href="/app/audit/cycles"
                                value={summary.cycles}
                                icon={faRecycle}
                            />
                        </Col>
                        <Col>
                            <SummaryButton
                                caption="Total Case Submitted"
                                href="/app/audit/findings"
                                value={summary.case_submitted}
                                icon={faListCheck}
                            />
                        </Col>
                        <Col>
                            <SummaryButton
                                caption="Total CA Submitted"
                                href="/app/audit/corrective"
                                value={summary.corrective_actions}
                                icon={faCheckToSlot}
                            />
                        </Col>
                        <Col>
                            <SummaryButton
                                caption="Total Approved CA"
                                href="/app/audit/corrective"
                                value={summary.approved_ca}
                                icon={faThumbsUp}
                            />
                        </Col>
                    </Row>
                    <Row>
                        <ChartColumn cycle={cycle} isLoading={isLoading} caption="Area Status">
                            {areaStatus != null &&
                                <Bar
                                    style={{ minHeight: 250, maxHeight: 250 }}
                                    data={{
                                        labels: ['Not Started', 'In-Progress', 'Done'],
                                        datasets: [
                                            {
                                                data: [
                                                    Math.round(100.0 * areaStatus.not_started),
                                                    Math.round(100.0 * areaStatus.in_progress),
                                                    Math.round(100.0 * areaStatus.done),
                                                ],
                                                backgroundColor: [
                                                    'rgba(255, 99, 132, 0.2)',
                                                    'rgba(255, 206, 86, 0.2)',
                                                    'rgba(75, 192, 192, 0.2)',
                                                ],
                                                borderColor: [
                                                    'rgba(255, 99, 132, 1)',
                                                    'rgba(255, 206, 86, 1)',
                                                    'rgba(75, 192, 192, 1)',
                                                ],
                                                borderWidth: 1,
                                            },
                                        ],
                                    }}
                                    options={{
                                        indexAxis: 'y',
                                        responsive: true,
                                        maintainAspectRatio: true,
                                        plugins: {
                                            legend: {
                                                display: false,
                                            },
                                            datalabels: {
                                                anchor: 'center',
                                                align: 'end',
                                                clamp: true,
                                                clip: true,
                                                formatter: value => `${value}%`
                                            },
                                            tooltip: {
                                                callbacks: {
                                                    label: context => {
                                                        return context.parsed.x + "%";
                                                    }
                                                }
                                            }
                                        }
                                    }}
                                />
                            }
                        </ChartColumn>
                        <ChartColumn cycle={cycle} isLoading={isLoading} caption="Top 10 Case Criteria">
                            {top10criteria &&
                                <Bar
                                    style={{ minHeight: 250, maxHeight: 250 }}
                                    data={{
                                        labels: top10criteria.map((data) => data.name),
                                        datasets: [
                                            {
                                                data: top10criteria.map((data) => data.count),
                                                backgroundColor: colorPalette.colors(top10criteria.length)
                                            }
                                        ]
                                    }}
                                    options={barOptions}
                                />
                            }
                        </ChartColumn>
                    </Row>
                    <Row>
                        <ChartColumn cycle={cycle} isLoading={isLoading} caption="Top 10 Approved Case Criteria">
                            {top10Approved &&
                                <Bar
                                    style={{ minHeight: 250, maxHeight: 250 }}
                                    data={{
                                        labels: top10Approved.map((data) => data.name),
                                        datasets: [
                                            {
                                                data: top10Approved.map((data) => data.count),
                                                backgroundColor: colorPalette.colors(top10Approved.length)
                                            }
                                        ]
                                    }}
                                    options={barOptions}
                                />
                            }
                        </ChartColumn>
                        <ChartColumn>
                            <DynamicTable
                                refreshTrigger={tableRefresh}
                                searchKeyword={''}
                                columns={tableColumns}
                                source={{
                                    url: "api/v1/fetch-findings",
                                    method: 'GET',
                                    params: {
                                        dashboard: true,
                                        cycle: cycle,
                                    },
                                    produce: item => [
                                        item.code,
                                        item.department_name,
                                        item.area_name,
                                        getCaseStatus(item.status),
                                        <DescriptionModal msg={item.desc} />,
                                        item.submit_date,
                                    ]
                                }}
                            />
                        </ChartColumn>
                    </Row>
                </PageContentView>
            </PageContent>
        </>
    )
}
