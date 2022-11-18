import { faCheckToSlot, faListCheck, faRecycle, faRotateRight, faThumbsUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState, useEffect } from "react";
import { Button, Card, Col, Row, Spinner } from "react-bootstrap";
import httpRequest from "../api";
import { PageContent, PageContentView, PageNavbar } from "../components/PageNav";
import { Pie } from "react-chartjs-2"
import { useIsMounted } from "../utils";

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
        <Col className="h-100">
            <Card className="p-3 h-100">
                <h4 className="fw-bold display-spacing">{caption}</h4>
                {children}
            </Card>
        </Col>
    );
}

export default function DashboardLayout() {
    const [summary, setSummary] = useState({});
    const [refreshTrigger, setRefreshTrigger] = useState(false);
    const [areaStatus, setAreaStatus] = useState(null);
    const mounted = useIsMounted();

    const refresh = _ => {
        setRefreshTrigger(!refreshTrigger);
    };

    useEffect(async () => {
        setSummary({});
        const summary = await httpRequest.get('api/v1/get-summary');

        if (mounted.current) {
            setSummary(summary.data);
        }

        const areaStatusData = await httpRequest.post('api/v1/get-chart', { type: 'area_status' });

        if (mounted.current) {
            setAreaStatus(areaStatusData.data);
        }
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
                                    style={{ maxHeight: 250 }}
                                    data={{
                                        labels: ['Not Started', 'In-Progress', 'Done'],
                                        datasets: [
                                            {
                                                label: '# of Votes',
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
                                        plugins: {
                                            legend: {
                                                position: 'right'
                                            }
                                        }
                                    }}
                                />
                            }
                        </ChartColumn>
                        <ChartColumn caption="Top 10 Case Criteria For Current Cycle" />
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
