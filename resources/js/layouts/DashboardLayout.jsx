import { faCheckToSlot, faListCheck, faRecycle, faRotateRight, faThumbsUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState, useEffect } from "react";
import { Button, Card, Col, Container, Row, Spinner } from "react-bootstrap";
import httpRequest from "../api";
import { PageContent, PageContentView, PageNavbar } from "../components/PageNav";
import { Pie, Bar, Line } from "react-chartjs-2"
import { useIsMounted } from "../utils";
import chroma from "chroma-js";
import { useMemo } from "react";

function SummaryButton({ href, caption, value, icon }) {
    return (
        <Button href={href ? href : '#'} variant="outline-primary" className="w-100 h-100 text-start p-3">
            <div className="hstack gap-1">
                <div className="flex-fill">
                    <h5 className="fw-bold display-spacing">{caption}</h5>
                    {value != null ?
                        <h2 className="fw-bold my-0">{value}</h2>
                        :
                        <Spinner animation="border"/>
                    }
                </div>
                <FontAwesomeIcon icon={icon} className="chart-icon" />
            </div>
        </Button>
    )
}

function ChartColumn({ caption, children, summary }) {
    return (
        <Card className="col m-2 p-3" style={{ minWidth: 550 }}>
            <h4 className="fw-bold display-spacing">
                {summary != null ?
                    <>{caption} - {('current_cycle' in summary) ? summary.current_cycle.cycle_id : <Spinner animation="border" />}</>
                    :
                    caption
                }
            </h4>
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
        }
    }
};

export default function DashboardLayout() {
    const [summary, setSummary] = useState({});
    const [refreshTrigger, setRefreshTrigger] = useState(false);
    const [areaStatus, setAreaStatus] = useState(null);
    const [top10criteria, setTop10Criteria] = useState(null);
    const [caseStatistics, setCaseStatistics] = useState(null);
    const [caseFound, setCaseFound] = useState(null);
    const mounted = useIsMounted();
    const colorPalette = useMemo(() => {
        const bezierPoints = _.chain()
            .range(12)
            .map((value) => chroma.hsv(value / 12 * 360,   0.60, 1.0).desaturate(1))
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

        setSummary({});

        const summary = await httpRequest.get('api/v1/get-summary');
        setSummary(summary.data);

        const areaStatusData = await httpRequest.post('api/v1/get-chart', { type: 'area_status' });
        setAreaStatus(areaStatusData.data);

        const top10CriteriaData = await httpRequest.post('api/v1/get-chart', { type: 'top10_criteria' });
        setTop10Criteria(top10CriteriaData.data);

        const caseStatisticsData = await httpRequest.post('api/v1/get-chart', { type: 'case_statistics' });
        setCaseStatistics(caseStatisticsData.data);

        const totalCaseFoundData = await httpRequest.post('api/v1/get-chart', { type: 'case_found_per_cycle' });
        setCaseFound(totalCaseFoundData.data);
    }, [refreshTrigger]);

    return (
        <>
            <PageNavbar>
                <Button onClick={refresh}><FontAwesomeIcon icon={faRotateRight} /></Button>
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
                        <ChartColumn summary={null} caption="Total Case Found per Cycle">
                            {caseFound &&
                                <Line
                                    style={{ minHeight: 250, maxHeight: 250 }}
                                    data={{
                                        labels: caseFound.map((cycle) => cycle.cycle_id),
                                        datasets: [
                                            {
                                                data: caseFound.map((cycle) => cycle.total_findings),
                                                borderColor: 'rgb(75, 192, 192)',
                                                tension: 0.25
                                            }
                                        ]
                                    }}
                                    options={barOptions}
                                />
                            }
                        </ChartColumn>
                        <ChartColumn summary={summary} caption="Area Status">
                            {areaStatus != null &&
                                <Pie
                                    style={{ minHeight: 250, maxHeight: 250 }}
                                    data={{
                                        labels: ['Not Started', 'In-Progress', 'Done'],
                                        datasets: [
                                            {
                                                data: [
                                                    areaStatus.not_started,
                                                    areaStatus.in_progress,
                                                    areaStatus.done,
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
                                        responsive: true,
                                        maintainAspectRatio: true,
                                        plugins: {
                                            legend: {
                                                position: 'right'
                                            }
                                        }
                                    }}
                                />
                            }
                        </ChartColumn>
                    </Row>
                    <Row>
                        <ChartColumn summary={summary} caption="Top 10 Criteria">
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
                        <ChartColumn summary={summary} caption="Case Statistic">
                            {caseStatistics &&
                                <Bar
                                    style={{ minHeight: 250, maxHeight: 250 }}
                                    data={{
                                        labels: ['Observation', 'Minor NC', 'Major NC'],
                                        datasets: [
                                            {
                                                data: [
                                                    caseStatistics.observation,
                                                    caseStatistics.minor_nc,
                                                    caseStatistics.major_nc,
                                                ],
                                                backgroundColor: [
                                                    'rgba(75, 192, 192, 0.2)',
                                                    'rgba(255, 206, 86, 0.2)',
                                                    'rgba(255, 99, 132, 0.2)',
                                                ],
                                                borderColor: [
                                                    'rgba(75, 192, 192, 1)',
                                                    'rgba(255, 206, 86, 1)',
                                                    'rgba(255, 99, 132, 1)',
                                                ],
                                                borderWidth: 1,
                                            }
                                        ]
                                    }}
                                    options={barOptions}
                                />
                            }
                        </ChartColumn>
                    </Row>
                </PageContentView>
            </PageContent>
        </>
    )
}
