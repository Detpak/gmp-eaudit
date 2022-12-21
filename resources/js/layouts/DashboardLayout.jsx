import { faCheckToSlot, faListCheck, faRecycle, faRotateRight, faThumbsUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState, useEffect } from "react";
import { Button, Card, Col, Container, Row, Spinner } from "react-bootstrap";
import httpRequest from "../api";
import { PageContent, PageContentView, PageNavbar } from "../components/PageNav";
import { Pie, Bar } from "react-chartjs-2"
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

function ChartColumn({ caption, children }) {
    return (
        <Card className="col m-2 p-3" style={{ minWidth: 550 }}>
            <h4 className="fw-bold display-spacing">{caption}</h4>
            {children}
        </Card>
    );
}

export default function DashboardLayout() {
    const [summary, setSummary] = useState({});
    const [refreshTrigger, setRefreshTrigger] = useState(false);
    const [areaStatus, setAreaStatus] = useState(null);
    const [top10criteria, setTop10Criteria] = useState(null);
    const mounted = useIsMounted();
    const colorPalette = useMemo(() =>
        chroma.bezier([
            chroma.hsv(0,   0.60, 1.0).desaturate(1),
            chroma.hsv(30,  0.60, 1.0).desaturate(1),
            chroma.hsv(60,  0.60, 1.0).desaturate(1),
            chroma.hsv(90,  0.60, 1.0).desaturate(1),
            chroma.hsv(120, 0.60, 1.0).desaturate(1),
            chroma.hsv(150, 0.60, 1.0).desaturate(1),
            chroma.hsv(180, 0.60, 1.0).desaturate(1),
            chroma.hsv(210, 0.60, 1.0).desaturate(1),
            chroma.hsv(240, 0.60, 1.0).desaturate(1),
            chroma.hsv(270, 0.60, 1.0).desaturate(1),
            chroma.hsv(300, 0.60, 1.0).desaturate(1),
            chroma.hsv(330, 0.60, 1.0).desaturate(1),
        ])
        .scale(), []);

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
                        <ChartColumn caption="Area Status for Current Cycle">
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
                                        scales: {
                                            y: {
                                                beginAtZero: true
                                            }
                                        },
                                        plugins: {
                                            legend: {
                                                position: 'right'
                                            }
                                        }
                                    }}
                                />
                            }
                        </ChartColumn>
                        <ChartColumn caption="Top 10 Criteria For Current Cycle">
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
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: true,
                                        plugins: {
                                            legend: {
                                                display: false
                                            }
                                        }
                                    }}
                                />
                            }
                        </ChartColumn>
                    </Row>
                    <Row>
                        <ChartColumn caption="Test" />
                        <ChartColumn caption="Test" />
                    </Row>
                </PageContentView>
            </PageContent>
        </>
    )
}
