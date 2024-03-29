import { faArrowRight, faArrowRightFromBracket, faArrowRightToBracket, faArrowRotateRight, faFileExcel, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect } from "react";
import { useState } from "react";
import { Button, Form, InputGroup, OverlayTrigger, Tooltip } from "react-bootstrap";
import httpRequest from "../../api";
import DynamicTable, { ExportTable, useRefreshTable } from "../../components/DynamicTable";
import FilterTable, { useFilter } from "../../components/FilterTable";
import { PageContent, PageContentTopbar, PageContentView } from "../../components/PageNav";

export default function BaseAuditPage({ fetch, refreshTable, columns, produce, produceExport }) {
    const [searchKeyword, setSearchKeyword] = useState('');
    const [showCurrentCycle, setShowCurrentCycle] = useState(false);
    const [fetchUrl, setFetchUrl] = useState(fetch);
    const { refresher, triggerRefresh } = refreshTable ? refreshTable : useRefreshTable();
    const filter = useFilter();

    const handleSearch = ev => {
        setSearchKeyword(ev.target.value);
    };

    useEffect(async () => {
        if (showCurrentCycle) {
            const response = await httpRequest.get('api/v1/get-active-cycle');
            setFetchUrl(`${fetch}?cycle_id=${response.data.result.id}`);
        }
        else {
            setFetchUrl(fetch);
        }

        triggerRefresh();
    }, [showCurrentCycle]);

    return (
        <PageContent>
            <PageContentTopbar>
                <Button variant="outline-primary" onClick={triggerRefresh} className="me-2"><FontAwesomeIcon icon={faArrowRotateRight} /></Button>
                <ExportTable
                    fetch={fetchUrl}
                    searchKeyword={searchKeyword}
                    filter={filter}
                    columns={columns}
                    produce={produceExport}
                    className="me-2"
                />
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
                    refreshTrigger={refresher}
                    searchKeyword={searchKeyword}
                    filter={filter}
                    columns={columns}
                    source={{
                        url: fetchUrl,
                        method: 'GET',
                        produce: produce
                    }}
                />
            </PageContentView>
        </PageContent>
    )
}
