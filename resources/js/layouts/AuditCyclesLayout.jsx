import React from "react";
import axios from "axios";
import DynamicTable from "../components/DynamicTable";
import LoadingButton from "../components/LoadingButton";
import { faArrowRotateRight, faPlus, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { showToastMsg, rootUrl } from "../utils";
import { PageContent, PageContentTopbar, PageContentView } from "../components/PageNav";
import "gridjs/dist/theme/mermaid.css";
import { Button, Form, InputGroup } from "react-bootstrap";

export default class AuditCyclesLayout extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            refreshTrigger: true,
            searchKeyword: '',
        };

        this.startNewCycle = this.startNewCycle.bind(this);
        this.refreshTable = this.refreshTable.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
    }

    async startNewCycle() {
        // Check if there is a current active cycle before starting the new one
        const activeCycle = await axios.get(rootUrl('api/v1/get-active-cycle'));

        if (activeCycle.data.result && !confirm('The current audit cycle has not yet been finished. Are you sure you want to start a new cycle?')) {
            return;
        }

        const newCycle = await axios.post(rootUrl('api/v1/new-cycle'));

        if (newCycle.data.result == 'ok') {
            showToastMsg("New cycle has been started.");
            this.refreshTable();
        }

        return;
    }

    refreshTable() {
        this.setState({ refreshTrigger: !this.state.refreshTrigger });
    }

    handleSearch(ev) {
        this.setState({ searchKeyword: ev.target.value });
    }

    render() {
        return (
            <PageContent>
                <PageContentTopbar>
                    <LoadingButton variant="success" onClick={this.startNewCycle} icon={faPlus} className="me-2">Start New Cycle</LoadingButton>
                    <Button variant="outline-primary" onClick={this.refreshTable} className="me-2"><FontAwesomeIcon icon={faArrowRotateRight} /></Button>
                    <Form.Group>
                        <InputGroup>
                            <Form.Control type="text" value={this.state.searchKeyword} onChange={this.handleSearch} placeholder="Search" />
                            <Button variant="outline-secondary" onClick={() => this.setState({ searchKeyword: '' })}>
                                <FontAwesomeIcon icon={faXmark} />
                            </Button>
                        </InputGroup>
                    </Form.Group>
                </PageContentTopbar>

                <PageContentView>
                    <DynamicTable
                        refreshTrigger={this.state.refreshTrigger}
                        searchKeyword={this.state.searchKeyword}
                        columns={[
                            {
                                id: 'label',
                                name: 'Label',
                            },
                            {
                                id: 'open_time',
                                name: 'Open Time'
                            },
                            {
                                id: 'close_time',
                                name: 'Close Time'
                            }
                        ]}
                        source={{
                            url: rootUrl('/api/v1/fetch-cycles'),
                            method: 'GET',
                            produce: item => [item.label, item.open_time, item.close_time ? item.close_time : '-'],
                        }}
                    />
                </PageContentView>
            </PageContent>
        );
    }
}
