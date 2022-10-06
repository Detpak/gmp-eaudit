import { faArrowRotateRight, faCheck, faX, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { Button, Form, InputGroup } from "react-bootstrap";
import { PageContent, PageContentTopbar, PageContentView } from "../../components/PageNav";
import DynamicTable from "../../components/DynamicTable";

export default function AuditFindingLayout() {
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
                    source={{
                        url: 'api/v1/fetch-findings',
                        method: 'GET',
                        produce: item => [
                            item.record_code,
                            item.code,
                            item.area_name,
                            item.desc,
                            //item.approved != 0 ? <FontAwesomeIcon icon={faCheck} className="text-success" /> : <FontAwesomeIcon icon={faX} className="text-danger"/>,
                            item.ca_name,
                            item.ca_code,
                            `${item.ca_weight}%`,
                            item.cg_name,
                            item.cg_code,
                        ]
                    }}
                    columns={[
                        {
                            id: 'code',
                            name: 'Record Code',
                        },
                        {
                            id: 'code',
                            name: 'Code',
                        },
                        {
                            id: 'area_name',
                            name: 'Area',
                        },
                        {
                            id: 'desc',
                            name: 'Description',
                        },
                        // {
                        //     id: 'approved',
                        //     name: 'Approved'
                        // },
                        {
                            id: 'ca_name',
                            name: 'Criteria Name'
                        },
                        {
                            id: 'ca_code',
                            name: 'Criteria Code'
                        },
                        {
                            id: 'ca_weight',
                            name: 'Weight'
                        },
                        {
                            id: 'cg_name',
                            name: 'Criteria Group Name'
                        },
                        {
                            id: 'cg_code',
                            name: 'Criteria Group Code'
                        },
                    ]}
                />
            </PageContentView>
        </PageContent>
    );
}
