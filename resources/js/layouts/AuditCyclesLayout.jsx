import React from "react";
import axios from "axios";
import DynamicTable from "../components/DynamicTable";
import LoadingButton from "../components/LoadingButton";
import { faArrowRotateRight, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { showToastMsg, rootUrl } from "../utils";
import { PageContent, PageContentTopbar, PageContentView } from "../components/PageNav";
import "gridjs/dist/theme/mermaid.css";
import { Button } from "react-bootstrap";

export default class AuditCyclesLayout extends React.Component {
    constructor(props) {
        super(props);
        this.table = React.createRef();
        this.refreshTable = this.refreshTable.bind(this);
        this.startNewCycle = this.startNewCycle.bind(this);
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
        this.table.current.refreshTable();
    }

    render() {
        return (
            <PageContent>
                <PageContentTopbar>
                    <LoadingButton variant="success" onClick={this.startNewCycle} icon={faPlus} className="me-2">Start New Cycle</LoadingButton>
                    <Button variant="outline-primary" onClick={this.refreshTable}><FontAwesomeIcon icon={faArrowRotateRight}></FontAwesomeIcon></Button>
                </PageContentTopbar>

                <PageContentView>
                    <DynamicTable
                        columns={[
                            DynamicTable.idColumn(),
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
                        server={this.state.serverSource}
                        ref={this.table}
                    />
                </PageContentView>
            </PageContent>
        );
    }
}