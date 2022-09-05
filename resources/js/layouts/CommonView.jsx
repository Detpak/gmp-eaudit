import React from "react";
import LoadingButton from "../components/LoadingButton";
import { Accordion, Button, Form, InputGroup, Modal } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRotateRight, faPlus, faTrash, faXmark } from "@fortawesome/free-solid-svg-icons";
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
            selectedItems: {},
            refresh: true,
            searchKeyword: '',
        };

        this.table = React.createRef();
        this.deleteSelectedItem = this.deleteSelectedItem.bind(this);
        this.refreshTable = this.refreshTable.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
    }

    async deleteSelectedItem() {
        const ids = Object.keys(this.state.selectedItems);

        if (!this.state.selectedItems || ids.length == 0) {
            alert(this.props.messages.onNoItemSelectedMsg);
            return;
        }

        if (!confirm(this.props.messages.onDeleteSelectedItemConfirmMsg)) return;

        const response = await axios.post(this.props.deleteSelectedItemAction,
                                          { rowIds: ids },
                                          { headers: { 'Content-Type': 'application/json' } });

        if (response.data.result == 'ok') {
            showToastMsg(this.props.messages.onSelectedItemDeletedMsg);
            this.refreshTable();
        }

        if (response.data.error) {
            showToastMsg(response.data.error);
        }
    }

    refreshTable() {
        this.setState({ refresh: !this.state.refresh }); // trigger refresh
    }

    handleSearch(ev) {
        this.setState({ searchKeyword: ev.target.value });
    }

    render() {
        return (
            <PageContent>
                <PageContentTopbar>
                    <Button variant="success" onClick={() => this.setState({ addNewItemModalShown: true })} className="me-2">
                        <FontAwesomeIcon icon={faPlus} className="me-1" /><>{this.props.addNewItem.name}</>
                    </Button>
                    <LoadingButton variant="danger" icon={faTrash} onClick={this.deleteSelectedItem} className="me-2">Delete Selected</LoadingButton>
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
                        refreshTrigger={this.state.refresh}
                        columns={this.props.table.columns}
                        selectedItems={this.state.selectedItems}
                        onSelect={(state) => this.setState({ selectedItems: state })}
                        searchKeyword={this.state.searchKeyword}
                        actionColumn={{
                            deleteAction: this.props.deleteItemAction,
                            onEditClick: (id) => this.setState({ editItemModalShown: true, editId: id }),
                            onDeleted: () => {
                                showToastMsg(this.props.messages.onItemDeleted);
                                this.refreshTable();
                            }
                        }}
                        source={this.props.table.source}
                        onItemSelected={(items) => this.setState({ selectedItems: items })}/>
                </PageContentView>

                <ModalForm
                    title={this.props.addNewItem.name}
                    size={this.props.addNewItem.size}
                    action={this.props.addNewItem.action}
                    initialValues={this.props.addNewItem.initialValues}
                    closeButton={true}
                    show={this.state.addNewItemModalShown}
                    onClose={() => this.setState({ addNewItemModalShown: false })}
                    submitBtn={{
                        name: "Save",
                        icon: faPlus,
                        afterSubmit: () => {
                            showToastMsg(this.props.messages.onItemAdded);
                            this.refreshTable();
                        }
                    }}
                >
                    {({ shown, handleChange, values, setValues, errors }) => {
                        const formProps = {
                            shown: shown,
                            handleChange: handleChange,
                            values: values,
                            setValues: setValues,
                            errors: errors,
                        };

                        return React.createElement(this.props.addNewItem.form, formProps);
                    }}
                </ModalForm>

                {
                    this.props.editItem ?
                    (<ModalForm
                        title={this.props.editItem.name}
                        size={this.props.editItem.size}
                        action={this.props.editItem.action}
                        fetchUrl={this.props.editItem.fetchUrl}
                        initialValues={this.props.editItem.initialValues}
                        editId={this.state.editId}
                        closeButton={true}
                        show={this.state.editItemModalShown}
                        onClose={() => this.setState({ editItemModalShown: false })}
                        submitBtn={{
                            name: "Save",
                            icon: faPenToSquare,
                            afterSubmit: () => {
                                showToastMsg(this.props.messages.onItemEdited);
                                this.refreshTable();
                            }
                        }}
                        >
                            {({ shown, handleChange, values, setValues, errors }) => {
                                const formProps = {
                                    shown: shown,
                                    handleChange: handleChange,
                                    values: values,
                                    setValues: setValues,
                                    errors: errors,
                                };

                                return React.createElement(this.props.editItem.form, formProps);
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
