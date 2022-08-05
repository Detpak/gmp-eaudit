import React from "react";
import LoadingButton from "../components/LoadingButton";
import { Accordion, Button, Form, Modal } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRotateRight, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { PageContent, PageContentTopbar, PageContentView } from "../components/PageNav";
import ModalForm from "../components/ModalForm";
import DynamicTable from "../components/DynamicTable";
import { rootUrl, showToastMsg } from "../utils";

export default class CommonView extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            addNewItemModalShown: false,
            selectedItems: null
        };

        this.table = React.createRef();
        this.addNewItem = this.addNewItem.bind(this);
        this.deleteSelectedItem = this.deleteSelectedItem.bind(this);
        this.refreshTable = this.refreshTable.bind(this);
    }

    addNewItem() {
        this.setState({ addNewItemModalShown: true });
    }

    async deleteSelectedItem() {
        if (!this.state.selectedItems || this.state.selectedItems.rowIds.length == 0) {
            alert(this.props.messages.onNoItemSelectedMsg);
            return;
        }

        if (!confirm(this.props.messages.onDeleteSelectedItemConfirmMsg)) return;

        const response = await axios.post(this.props.deleteSelectedItemAction,
                                          this.state.selectedItems,
                                          { headers: { 'Content-Type': 'application/json' } });

        if (response.data.result == 'ok') {
            showToastMsg(this.props.messages.onSelectedItemDeletedMsg);
            this.refreshTable();
        }
    }

    refreshTable() {
        this.table.current.refreshTable();
    }

    render() {
        return (
            <PageContent>
                <PageContentTopbar>
                    <Button variant="success" onClick={() => this.setState({ addNewItemModalShown: true })} className="me-2">
                        <FontAwesomeIcon icon={faPlus} className="me-1" /><>{this.props.addNewItem.name}</>
                    </Button>
                    <LoadingButton variant="danger" icon={faTrash} onClick={this.deleteSelectedItem} className="me-2">Delete Selected</LoadingButton>
                    <Button variant="outline-primary" onClick={this.refreshTable}><FontAwesomeIcon icon={faArrowRotateRight} /></Button>
                </PageContentTopbar>

                <PageContentView>
                    <DynamicTable
                        columns={this.props.table.columns}
                        server={this.props.table.source}
                        onItemSelected={(items) => this.setState({ selectedItems: items })}
                        ref={this.table} />
                </PageContentView>

                <ModalForm
                    title={this.props.addNewItem.name}
                    action={this.props.addNewItem.action}
                    initialValues={this.props.addNewItem.initialValues}
                    show={this.state.addNewItemModalShown}
                    onClose={() => this.setState({ addNewItemModalShown: false })}
                    submitBtn={{
                        name: "Add",
                        icon: faPlus,
                        afterSubmit: this.refreshTable
                    }}
                >
                    {({ handleChange, isSubmitting, values, errors }) => {
                        const formProps = {
                            handleChange: handleChange,
                            isSubmitting: isSubmitting,
                            values: values,
                            errors: errors,
                        };

                        return React.createElement(this.props.addNewItem.form, formProps);
                    }}
                </ModalForm>
            </PageContent>
        );
    }
}
