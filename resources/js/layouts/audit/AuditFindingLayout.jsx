import { faArrowRotateRight, faCheck, faX, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { Button, Form, InputGroup } from "react-bootstrap";
import { PageContent, PageContentTopbar, PageContentView } from "../../components/PageNav";
import DynamicTable from "../../components/DynamicTable";
import { ImageModal } from "../../components/ImageModal";

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
                            ['Observation', 'Minor NC', 'Major NC'][item.category],
                            `${item.cg_name} (${item.cg_code})`,
                            `${item.ca_name} (${item.ca_code})`,
                            `${item.ca_weight}%`,
                            `${item.deducted_weight}%`,
                            <ImageModal buttonSize="sm" src={`api/v1/fetch-finding-images/${item.id}`} />
                        ]
                    }}
                    columns={[
                        {
                            id: 'record_code',
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
                        {
                            id: 'category',
                            name: 'Category'
                        },
                        // {
                        //     id: 'approved',
                        //     name: 'Approved'
                        // },
                        {
                            id: 'cg_name',
                            name: 'Criteria Group'
                        },
                        {
                            id: 'ca_name',
                            name: 'Criteria'
                        },
                        {
                            id: 'ca_weight',
                            name: 'Criteria Weight (%)'
                        },
                        {
                            id: 'deducted_weight',
                            name: 'Weight (%)'
                        },
                        {
                            sortable: false,
                            name: 'Images'
                        }
                    ]}
                />
            </PageContentView>
        </PageContent>
    );
}
