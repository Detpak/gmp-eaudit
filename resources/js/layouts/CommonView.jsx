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
import { useState } from "react";
import httpRequest from "../api";
import FilterTable from "../components/FilterTable";

export default function CommonView({ table, addNewItem, editItem, deleteItem, deleteSelectedItemAction, messages, filter }) {
    const [addNewItemModalShown, setAddNewItemModalShown] = useState(false);
    const [editState, setEditState] = useState({ modalShown: false, id: null });
    const [selectedItems, setSelectedItems] = useState({});
    const [refresh, setRefresh] = useState(true);
    const [searchKeyword, setSearchKeyword] = useState('');

    const deleteSelectedItem = async () => {
        const ids = Object.keys(selectedItems);

        if (!selectedItems || ids.length == 0) {
            alert(messages.onNoItemSelectedMsg);
            return;
        }

        if (!confirm(messages.onDeleteSelectedItemConfirmMsg)) return;

        const response = await httpRequest.post(deleteSelectedItemAction,
                                                { rowIds: ids },
                                                { headers: { 'Content-Type': 'application/json' } });

        if (response.data.result == 'ok') {
            showToastMsg(messages.onSelectedItemDeletedMsg);
            refreshTable();
        }

        if (response.data.error) {
            showToastMsg(response.data.error);
        }
    }

    const refreshTable = () => {
        setRefresh(!refresh);
    }

    return (
        <PageContent>
            <PageContentTopbar>
                <Button variant="success" onClick={() => setAddNewItemModalShown(true)} className="me-2">
                    <FontAwesomeIcon icon={faPlus} className="me-1" /><>{addNewItem.name}</>
                </Button>
                <LoadingButton variant="danger" icon={faTrash} onClick={deleteSelectedItem} className="me-2">Delete Selected</LoadingButton>
                <Button variant="outline-primary" onClick={refreshTable} className="me-2"><FontAwesomeIcon icon={faArrowRotateRight} /></Button>
                <Form.Group className="me-3">
                    <InputGroup>
                        <Form.Control type="text" value={searchKeyword} onChange={(ev) => setSearchKeyword(ev.target.value)} placeholder="Search" />
                        <Button variant="outline-secondary" onClick={() => setSearchKeyword('')}>
                            <FontAwesomeIcon icon={faXmark} />
                        </Button>
                    </InputGroup>
                </Form.Group>
                {filter && <FilterTable filter={filter} />}
            </PageContentTopbar>

            <PageContentView>
                <DynamicTable
                    refreshTrigger={refresh}
                    columns={table.columns}
                    selectedItems={selectedItems}
                    onSelect={(state) => setSelectedItems(state)}
                    searchKeyword={searchKeyword}
                    source={table.source}
                    filter={filter}
                    actionColumn={{
                        allowEditIf: editItem.allowEditIf,
                        onEditClick: (id) => setEditState({ modalShown: true, id: id }),
                        allowDeleteIf: deleteItem.allowDeleteIf,
                        deleteAction: deleteItem.action,
                        onDeleted: () => {
                            showToastMsg(messages.onItemDeleted);
                            refreshTable();
                        }
                    }}
                    // onItemSelected={(items) => setState({ selectedItems: items })}
                />
            </PageContentView>

            {addNewItem.modal &&
                <Modal show={addNewItemModalShown} backdrop="static">
                    <Modal.Header>
                        <Modal.Title className="fw-bold display-spacing">{addNewItem.name}</Modal.Title>
                    </Modal.Header>
                    {React.createElement(
                        addNewItem.modal,
                        {
                            closeModal: () => setAddNewItemModalShown(false),
                            refreshTable: refreshTable
                        })
                    }
                </Modal>
            }

            {editItem.modal &&
                <Modal show={editState.modalShown} backdrop="static">
                    <Modal.Header>
                        <Modal.Title className="fw-bold display-spacing">{editItem.name}</Modal.Title>
                    </Modal.Header>
                    {React.createElement(
                        editItem.modal,
                        {
                            closeModal: () => setEditState({ modalShown: false, id: null }),
                            refreshTable: refreshTable,
                            editId: editState.id
                        }
                    )}
                </Modal>
            }

            {addNewItem.form &&
                <ModalForm
                    title={addNewItem.name}
                    size={addNewItem.size}
                    action={addNewItem.action}
                    initialValues={addNewItem.initialValues}
                    closeButton={false}
                    show={addNewItemModalShown}
                    onClose={() => setAddNewItemModalShown(false)}
                    submitBtn={{
                        name: "Save",
                        icon: faPlus,
                        afterSubmit: () => {
                            refreshTable();
                            showToastMsg(messages.onItemAdded);
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
                        return React.createElement(addNewItem.form, formProps);
                    }}
                </ModalForm>
            }

            {editItem.form ?
                (<ModalForm
                    title={editItem.name}
                    size={editItem.size}
                    action={editItem.action}
                    fetchUrl={editItem.fetchUrl}
                    initialValues={editItem.initialValues}
                    editId={editState.id}
                    closeButton={false}
                    show={editState.modalShown}
                    onClose={() => setEditState({ modalShown: false, id: null })}
                    submitBtn={{
                        name: "Save",
                        icon: faPenToSquare,
                        afterSubmit: () => {
                            showToastMsg(messages.onItemEdited);
                            refreshTable();
                        }
                    }}
                    >
                        {({ shown, handleChange, values, setValues, errors, isEdit }) => {
                            const formProps = {
                                shown: shown,
                                handleChange: handleChange,
                                values: values,
                                setValues: setValues,
                                errors: errors,
                                isEdit: isEdit
                            };
                            return React.createElement(editItem.form, formProps);
                        }}
                    </ModalForm>)
                    : null
            }
        </PageContent>
    )
}

// export default class CommonView extends React.Component {
//     constructor(props) {
//         super(props);

//         this.state = {
//             addNewItemModalShown: false,
//             editItemModalShown: false,
//             editId: null,
//             selectedItems: {},
//             refresh: true,
//             searchKeyword: '',
//         };

//         this.table = React.createRef();
//         this.deleteSelectedItem = this.deleteSelectedItem.bind(this);
//          = .bind(this);
//         this.handleSearch = this.handleSearch.bind(this);
//     }

//     async deleteSelectedItem() {
//         const ids = Object.keys(this.state.selectedItems);

//         if (!this.state.selectedItems || ids.length == 0) {
//             alert(this.props.messages.onNoItemSelectedMsg);
//             return;
//         }

//         if (!confirm(this.props.messages.onDeleteSelectedItemConfirmMsg)) return;

//         const response = await httpRequest.post(this.props.deleteSelectedItemAction,
//                                                 { rowIds: ids },
//                                                 { headers: { 'Content-Type': 'application/json' } });

//         if (response.data.result == 'ok') {
//             showToastMsg(this.props.messages.onSelectedItemDeletedMsg);
//             ();
//         }

//         if (response.data.error) {
//             showToastMsg(response.data.error);
//         }
//     }

//     refreshTable() {
//         this.setState({ refresh: !this.state.refresh }); // trigger refresh
//     }

//     handleSearch(ev) {
//         this.setState({ searchKeyword: ev.target.value });
//     }

//     render() {
//         return (
//             <PageContent>
//                 <PageContentTopbar>
//                     <Button variant="success" onClick={() => this.setState({ addNewItemModalShown: true })} className="me-2">
//                         <FontAwesomeIcon icon={faPlus} className="me-1" /><>{this.props.addNewItem.name}</>
//                     </Button>
//                     <LoadingButton variant="danger" icon={faTrash} onClick={this.deleteSelectedItem} className="me-2">Delete Selected</LoadingButton>
//                     <Button variant="outline-primary" onClick={} className="me-2"><FontAwesomeIcon icon={faArrowRotateRight} /></Button>
//                     <Form.Group>
//                         <InputGroup>
//                             <Form.Control type="text" value={this.state.searchKeyword} onChange={this.handleSearch} placeholder="Search" />
//                             <Button variant="outline-secondary" onClick={() => this.setState({ searchKeyword: '' })}>
//                                 <FontAwesomeIcon icon={faXmark} />
//                             </Button>
//                         </InputGroup>
//                     </Form.Group>
//                 </PageContentTopbar>

//                 <PageContentView>
//                     <DynamicTable
//                         refreshTrigger={this.state.refresh}
//                         columns={this.props.table.columns}
//                         selectedItems={this.state.selectedItems}
//                         onSelect={(state) => this.setState({ selectedItems: state })}
//                         searchKeyword={this.state.searchKeyword}
//                         actionColumn={{
//                             allowEditIf: this.props.editItem.allowEditIf,
//                             onEditClick: (id) => this.setState({ editItemModalShown: true, editId: id }),
//                             allowDeleteIf: this.props.deleteItem.allowDeleteIf,
//                             deleteAction: this.props.deleteItem.action,
//                             onDeleted: () => {
//                                 showToastMsg(this.props.messages.onItemDeleted);
//                                 ();
//                             }
//                         }}
//                         source={this.props.table.source}
//                         onItemSelected={(items) => this.setState({ selectedItems: items })}/>
//                 </PageContentView>

//                 {this.props.addNewItem.modal &&
//                     <Modal show={this.state.addNewItemModalShown} backdrop="static">
//                         <Modal.Header>
//                             <Modal.Title className="fw-bold display-spacing">{this.props.addNewItem.name}</Modal.Title>
//                         </Modal.Header>
//                         {React.createElement(
//                             this.props.addNewItem.modal,
//                             {
//                                 closeModal: () => this.setState({ addNewItemModalShown: false }),
//                                 refreshTable:
//                             })
//                         }
//                     </Modal>
//                 }

//                 {this.props.editItem.modal &&
//                     <Modal show={this.state.editItemModalShown} backdrop="static">
//                         <Modal.Header>
//                             <Modal.Title className="fw-bold display-spacing">{this.props.editItem.name}</Modal.Title>
//                         </Modal.Header>
//                         {React.createElement(
//                             this.props.editItem.modal,
//                             {
//                                 closeModal: () => this.setState({ editItemModalShown: false }),
//                                 refreshTable: ,
//                                 editId: this.state.editId
//                             }
//                         )}
//                     </Modal>
//                 }

//                 {this.props.addNewItem.form &&
//                     <ModalForm
//                         title={this.props.addNewItem.name}
//                         size={this.props.addNewItem.size}
//                         action={this.props.addNewItem.action}
//                         initialValues={this.props.addNewItem.initialValues}
//                         closeButton={false}
//                         show={this.state.addNewItemModalShown}
//                         onClose={() => this.setState({ addNewItemModalShown: false })}
//                         submitBtn={{
//                             name: "Save",
//                             icon: faPlus,
//                             afterSubmit: () => {
//                                 ();
//                                 showToastMsg(this.props.messages.onItemAdded);
//                             }
//                         }}
//                     >
//                         {({ shown, handleChange, values, setValues, errors }) => {
//                             const formProps = {
//                                 shown: shown,
//                                 handleChange: handleChange,
//                                 values: values,
//                                 setValues: setValues,
//                                 errors: errors,
//                             };

//                             return React.createElement(this.props.addNewItem.form, formProps);
//                         }}
//                     </ModalForm>
//                 }

//                 {
//                     this.props.editItem.form ?
//                     (<ModalForm
//                         title={this.props.editItem.name}
//                         size={this.props.editItem.size}
//                         action={this.props.editItem.action}
//                         fetchUrl={this.props.editItem.fetchUrl}
//                         initialValues={this.props.editItem.initialValues}
//                         editId={this.state.editId}
//                         closeButton={false}
//                         show={this.state.editItemModalShown}
//                         onClose={() => this.setState({ editItemModalShown: false })}
//                         submitBtn={{
//                             name: "Save",
//                             icon: faPenToSquare,
//                             afterSubmit: () => {
//                                 showToastMsg(this.props.messages.onItemEdited);
//                                 ();
//                             }
//                         }}
//                         >
//                             {({ shown, handleChange, values, setValues, errors, isEdit }) => {
//                                 const formProps = {
//                                     shown: shown,
//                                     handleChange: handleChange,
//                                     values: values,
//                                     setValues: setValues,
//                                     errors: errors,
//                                     isEdit: isEdit
//                                 };

//                                 return React.createElement(this.props.editItem.form, formProps);
//                             }}
//                         </ModalForm>)
//                         : null
//                 }
//             </PageContent>
//         );
//     }

//     static actionColumn(config) {
//         return {
//             id: 'action',
//             name: 'Action',
//             sort: false,
//             formatter: (cell) => (_(<CommonView.ActionButtons itemId={cell} {...config} />))
//         }
//     }

//     static ActionButtons({ itemId, deleteAction, onDeleted, onEditClick }) {
//         const handleDeleteClick = async () => {
//             const response = await httpRequest.get(`${deleteAction}/${itemId}`);
//             if (response.data.result == 'ok') {
//                 onDeleted();
//             }
//         }

//         return <>
//             <Button variant="primary" size="sm" className="me-1" onClick={() => onEditClick(itemId)}><FontAwesomeIcon icon={faPenToSquare} /> Edit</Button>
//             <LoadingButton variant="danger" size="sm" icon={faTrash} onClick={handleDeleteClick}>Delete</LoadingButton>
//         </>
//     }
// }
