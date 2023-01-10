import _ from "lodash";
import { useEffect, useState } from "react";
import { Button, Form, ListGroup, Spinner } from "react-bootstrap";
import httpRequest from "../../api";
import { useFilter } from "../../components/FilterTable";
import { RequiredSpan } from "../../components/LabelSpan";
import ListView from "../../components/ListView";
import SearchList from "../../components/SearchList";
import CommonView from "../CommonView";

function DepartmentForm({ shown, handleChange, values, setValues, errors }) {
    const [isLoadingOptions, setLoadingOptions] = useState(true);
    const [divisions, setDivisions] = useState([]);

    useEffect(() => {
        if (shown) {
            setLoadingOptions(true);
            httpRequest.get('api/v1/fetch-division-options')
                .then((response) => {
                    setDivisions(response.data);
                    setLoadingOptions(false);
                });
        }
    }, [shown]);

    const handleDone = async (selectedItems) => {
        if (selectedItems.length == 0) {
            return;
        }

        const newPicIds = new Set(values.pic_ids);

        for (const id of selectedItems) {
            newPicIds.add(id);
        }

        setValues({ ...values, pic_ids: Array.from(newPicIds) });
    };

    const handleRemove = (id) => {
        const newPicIds = new Set(values.pic_ids);
        newPicIds.delete(`${id}`);
        setValues({ ...values, pic_ids: Array.from(newPicIds) });
    };

    const handleRemoveAll = () => {
        setValues({ ...values, pic_ids: [] });
    }

    return (
        <>
            <Form.Group className="mb-3" controlId="name">
                <Form.Label>Name <RequiredSpan /></Form.Label>
                <Form.Control type="text" name="name" value={values.name} onChange={handleChange} isInvalid={!!errors.name}/>
                <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3" controlId="code">
                <Form.Label>Code <RequiredSpan /></Form.Label>
                <Form.Control type="text" name="code" value={values.code} onChange={handleChange} isInvalid={!!errors.code}/>
                <Form.Control.Feedback type="invalid">{errors.code}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3" controlId="division_id">
                <Form.Label>Division <RequiredSpan /></Form.Label>
                <Form.Select name="division_id" value={values.division_id} onChange={handleChange} isInvalid={!!errors.division_id} disabled={isLoadingOptions}>
                    <option value="" disabled>-- Please select entity --</option>
                    {divisions.map((data, index) => (
                        <option key={index} value={data.id}>{data.name}</option>
                    ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">{errors.division_id}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group controlId="pics">
                <Form.Label>PIC(s) (Person in Charge) <RequiredSpan /></Form.Label>
                <SearchList
                    height="200px"
                    placeholder="Add PIC(s)..."
                    source={'api/v1/fetch-users?only_auditee=true'}
                    onDone={handleDone}
                >
                    {({ data }) => {
                        return (
                            <>
                                <div className="d-flex justify-content-between">
                                    <h6 className="mb-1">{data.name}</h6>
                                    <small>{data.role_name}</small>
                                </div>
                                <small>{data.email}</small>
                            </>
                        )
                    }}
                </SearchList>
                <ListView
                    ids={values.pic_ids}
                    fetchUrl={'api/v1/get-users'}
                    handleRemove={handleRemove}
                    handleRemoveAll={handleRemoveAll}
                >
                    {({ item }) => {
                        return (
                            <span className="me-auto text-truncate">{item.name} <small>({item.email})</small></span>
                        )
                    }}
                </ListView>
                <input type="hidden" className={!!errors.pic_ids ? 'is-invalid' : ''} />
                <Form.Control.Feedback type="invalid">{errors.pic_ids}</Form.Control.Feedback>
            </Form.Group>
        </>
    );
}

const tableColumns = [
    {
        id: 'name',
        name: 'Department'
    },
    {
        id: 'code',
        name: 'Code'
    },
    {
        id: 'division_name',
        name: 'Division'
    },
    {
        //selectable: false,
        type: 'number',
        id: 'areas_count',
        name: '# Areas'
    },
    {
        filterable: false,
        sortable: false,
        id: 'pics',
        name: 'PIC(s)'
    },
];

export default function DepartmentLayout() {
    const filter = useFilter();

    const initialValues = {
        name: '',
        code: '',
        division_id: '',
        pic_ids: []
    };

    return (
        <CommonView
            addNewItem={{
                name: "Add Department",
                form: DepartmentForm,
                action: 'api/v1/add-dept',
                initialValues: initialValues
            }}
            editItem={{
                name: "Edit Department",
                form: DepartmentForm,
                action: 'api/v1/edit-dept',
                fetchUrl: 'api/v1/get-dept',
                initialValues: { ...initialValues }
            }}
            deleteItem={{
                action: 'api/v1/delete-dept'
            }}
            deleteSelectedItemAction={'api/v1/delete-depts'}
            filter={filter}
            table={{
                canSelect: true,
                columns: tableColumns,
                source: {
                    url: 'api/v1/fetch-depts',
                    method: 'GET',
                    produce: item => [
                        item.name,
                        item.code,
                        item.division_name && item.division_name.length > 0 ? item.division_name : '-',
                        item.areas_count,
                        item.pics.map(pic => pic.name).join(', '),
                    ],
                    total: data => data.total
                }
            }}
            messages={{
                onItemAdded: "Department successfully added!",
                onItemEdited: "Department successfully edited!",
                onItemDeleted: "Department successfully deleted!",
                onNoItemSelectedMsg: "Please select the department to delete",
                onDeleteSelectedItemConfirmMsg: "Do you really want to delete the department?",
                onSelectedItemDeletedMsg: "The selected department successfully deleted!",
            }}
        />
    )
}
