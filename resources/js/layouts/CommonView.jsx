import React from "react";
import LoadingButton from "../components/LoadingButton";
import { Accordion, Button, Form, Modal } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRotateRight, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { faPenToSquare } from "@fortawesome/free-regular-svg-icons";
import { PageContent, PageContentTopbar, PageContentView } from "../components/PageNav";
import ModalForm from "../components/ModalForm";
import DynamicTable from "../components/DynamicTable";
import { rootUrl, showToastMsg } from "../utils";
import { _ } from "gridjs-react";
import lodash from "lodash";

export default class CommonView extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            addNewItemModalShown: false,
            editItemModalShown: false,
            editId: null,
            selectedItems: null
        };

        this.selectedItems = new Set();
        this.tableColumns = [];

        if (this.props.table.canSelect) {
            this.tableColumns.push(DynamicTable.selectionColumn({
                onCheck: (id, checked) => {
                    if (checked) {
                        this.selectedItems.add(id);
                    }
                    else {
                        this.selectedItems.delete(id);
                    }
                }
            }));
        }

        this.tableColumns.push(...this.props.table.columns);

        if (this.props.table.actionColumn) {
            this.tableColumns.push(CommonView.actionColumn({
                deleteAction: this.props.table.actionColumn,
                onDeleted: () => {
                    showToastMsg(this.props.messages.onItemDeleted);
                    this.refreshTable();
                },
                onEditClick: (editId) => this.setState({ editId: editId, editItemModalShown: true })
            }));
        }

        this.props.table.source.then = data => data.data.map((item) => {
            const retItem = [];

            if (item.id) {
                if (this.props.table.canSelect) {
                    retItem.push(item.id);
                }

                retItem.push(...this.props.table.source.produce(item));

                if (this.props.table.actionColumn) {
                    retItem.push(item.id);
                }
            }

            return retItem;
        });

        this.table = React.createRef();
        this.deleteSelectedItem = this.deleteSelectedItem.bind(this);
        this.refreshTable = this.refreshTable.bind(this);
    }

    async deleteSelectedItem() {
        if (!this.selectedItems || this.selectedItems.size == 0) {
            alert(this.props.messages.onNoItemSelectedMsg);
            return;
        }

        if (!confirm(this.props.messages.onDeleteSelectedItemConfirmMsg)) return;

        const response = await axios.post(this.props.deleteSelectedItemAction,
                                          { rowIds: Array.from(this.selectedItems) },
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
                        columns={this.tableColumns}
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
                        afterSubmit: () => {
                            showToastMsg(this.props.messages.onItemAdded);
                            this.refreshTable();
                        }
                    }}
                >
                    {({ shown, handleChange, values, errors }) => {
                        const formProps = {
                            shown: shown,
                            handleChange: handleChange,
                            values: values,
                            errors: errors,
                        };

                        return React.createElement(this.props.addNewItem.form, formProps);
                    }}
                </ModalForm>

                {
                    this.props.table.actionColumn ?
                    (<ModalForm
                        title={this.props.table.actionColumn.editForm.name}
                        action={this.props.table.actionColumn.editForm.action}
                        fetchUrl={this.props.table.actionColumn.editForm.fetchUrl}
                        initialValues={this.props.table.actionColumn.editForm.initialValues}
                        editId={this.state.editId}
                        show={this.state.editItemModalShown}
                        onClose={() => this.setState({ editItemModalShown: false })}
                        submitBtn={{
                            name: "Edit",
                            icon: faPenToSquare,
                            afterSubmit: () => {
                                showToastMsg(this.props.messages.onItemEdited);
                                this.refreshTable();
                            }
                        }}
                        >
                            {({ shown, handleChange, values, errors }) => {
                                const formProps = {
                                    shown: shown,
                                    handleChange: handleChange,
                                    values: values,
                                    errors: errors,
                                };

                                return React.createElement(this.props.table.actionColumn.editForm.form, formProps);
                            }}
                        </ModalForm>)
                        : null
                }
            </PageContent>
        );
    }

    static actionColumn(config) {
        return {
            id: 'action',
            name: 'Action',
            sort: false,
            formatter: (cell) => (_(<CommonView.ActionButtons itemId={cell} {...config} />))
        }
    }

    static ActionButtons({ itemId, deleteAction, onDeleted, onEditClick }) {
        const handleDeleteClick = async () => {
            const response = await axios.get(`${deleteAction}/${itemId}`);

            if (response.data.result == 'ok') {
                onDeleted();
            }
        }

        return <>
            <Button variant="primary" size="sm" className="me-1" onClick={() => onEditClick(itemId)}><FontAwesomeIcon icon={faPenToSquare} /> Edit</Button>
            <LoadingButton variant="danger" size="sm" icon={faTrash} onClick={handleDeleteClick}>Delete</LoadingButton>
        </>
    }
}
