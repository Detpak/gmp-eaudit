import { faCheckToSlot, faListCheck, faRecycle, faRotateRight, faThumbsUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState, useEffect } from "react";
import { Button, Col, Row, Spinner } from "react-bootstrap";
import httpRequest from "../api";
import { PageContent, PageContentView, PageNavbar } from "../components/PageNav";

function SummaryButton({ href, caption, value, icon }) {
    return (
        <Button href={href ? href : '#'} variant="outline-primary" className="w-100 h-100 text-start p-3">
            <div className="hstack gap-1">
                <div className="flex-fill">
                    <h5 className="fw-bold display-spacing">{caption}</h5>
                    {value != null ?
                        <h2 className="fw-bold">{value}</h2>
                        :
                        <Spinner animation="border" />
                    }
                </div>
                <FontAwesomeIcon icon={icon} className="chart-icon" />
            </div>
        </Button>
    )
}

export default function DashboardLayout() {
    const [summary, setSummary] = useState({});
    const [refreshTrigger, setRefreshTrigger] = useState(false);

    const refresh = _ => {
        setRefreshTrigger(!refreshTrigger);
    };

    useEffect(async () => {
        setSummary({});
        const response = await httpRequest.get('api/v1/get-summary');
        setSummary(response.data);
    }, [refreshTrigger]);

    return (
        <>
            <PageNavbar>
                <Button onClick={refresh}><FontAwesomeIcon icon={faRotateRight} /></Button>
            </PageNavbar>

            <PageContent>
                <PageContentView className="py-4">
                    <Row className="mb-3">
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
                        <Col>Test</Col>
                    </Row>
                </PageContentView>
            </PageContent>
        </>
    )
}
