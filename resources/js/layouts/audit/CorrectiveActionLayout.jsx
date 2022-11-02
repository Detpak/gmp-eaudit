import { faArrowRotateRight, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { Button, Form, InputGroup } from "react-bootstrap";
import { PageContent, PageContentTopbar, PageContentView } from "../../components/PageNav";
import DynamicTable from "../../components/DynamicTable";
import { ImageModal } from "../../components/ImageModal";
import { getCategoryString, rootUrl, waitForMs } from "../../utils";
import LoadingButton from "../../components/LoadingButton";
import httpRequest from "../../api";

export default function CorrectiveActionLayout() {
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
                        url: 'api/v1/fetch-corrective-actions',
                        method: 'GET',
                        produce: item => [
                            item.code,
                            item.area_name,
                            getCategoryString(item.category),
                            `${item.ca_name} (${item.ca_code})`,
                            `${item.ca_weight}%`,
                            `${item.deducted_weight}%`,
                            item.desc,
                            '',
                        ]
                    }}
                    columns={[
                        {
                            id: 'code',
                            name: 'Case ID',
                        },
                        {
                            id: 'area_name',
                            name: 'Area Name',
                        },
                        {
                            id: 'category',
                            name: 'Category',
                        },
                        {
                            id: 'ca_name',
                            name: 'Criteria Name',
                        },
                        {
                            id: 'ca_weight',
                            name: 'Criteria Weight',
                        },
                        {
                            id: 'deducted_weight',
                            name: 'Deducted Weight',
                        },
                        {
                            id: 'desc',
                            name: 'Description',
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
