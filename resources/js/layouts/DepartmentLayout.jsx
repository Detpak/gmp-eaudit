import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { setNestedObjectValues, validateYupSchema } from "formik";
import _ from "lodash";
import { useEffect, useState } from "react";
import { Button, Form, ListGroup, Spinner } from "react-bootstrap";
import SearchList from "../components/SearchList";
import { rootUrl } from "../utils";
import CommonView from "./CommonView";

function DepartmentForm({ shown, handleChange, values, setValues, errors }) {
    const [isLoading, setLoading] = useState(false);
    const [picList, setPicList] = useState({});

    const fetchData = async () => {
        if (values.pic_ids.length == 0) {
            setLoading(false);
            setPicList({});
            return;
        }

        setLoading(true);
        const data = { ids: values.pic_ids };
        const response = await axios.post(rootUrl('api/v1/get-users'), data, { headers: { 'Content-Type': 'application/json' } });
        setPicList(response.data);
        setLoading(false);
    }

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

    useEffect(() => {
        if (shown) {
            fetchData();
        }
    }, [values.pic_ids]);

    return (
        <>
            <Form.Group className="mb-3" controlId="name">
                <Form.Label>Name</Form.Label>
                <Form.Control type="text" name="name" value={values.name} onChange={handleChange} isInvalid={!!errors.name}/>
                <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3" controlId="code">
                <Form.Label>Code</Form.Label>
                <Form.Control type="text" name="code" value={values.code} onChange={handleChange} isInvalid={!!errors.code}/>
                <Form.Control.Feedback type="invalid">{errors.code}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3" controlId="pics">
                <Form.Label>PIC(s) (Person in Charge)</Form.Label>
                <SearchList
                    height="200px"
                    placeholder="Add PIC(s)..."
                    source={rootUrl('api/v1/fetch-users')}
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
                <div className="hstack gap-1 mb-2">
                    <Button variant="danger" size="sm" disabled={_.keys(picList).length == 0} onClick={handleRemoveAll}>Remove All</Button>
                </div>
                <div className="overflow-auto" style={{ maxHeight: 200 }}>
                    <ListGroup>
                        {
                            (isLoading) ? (
                                <ListGroup.Item className="text-center">
                                    <Spinner animation="border" size="sm" /> Loading...
                                </ListGroup.Item>
                            ) : (
                                (_.keys(picList).length == 0) ? (
                                    <ListGroup.Item className="text-center">No PIC(s) selected</ListGroup.Item>
                                ) : (
                                    null
                                )
                            )
                        }
                        {!isLoading && _.values(picList).map(item => (
                            <ListGroup.Item key={_.uniqueId()} className="hstack gap-3">
                                <span className="me-auto text-truncate">{item.name} <small>({item.email})</small></span>
                                <Button variant="danger" size="sm" disabled={_.keys(picList).length == 0} onClick={() => handleRemove(item.id)}>
                                    <FontAwesomeIcon icon={faTrash} />
                                </Button>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                </div>
                <input type="hidden" className={!!errors.pic_ids ? 'is-invalid' : ''} />
                <Form.Control.Feedback type="invalid">{errors.pic_ids}</Form.Control.Feedback>
            </Form.Group>
        </>
    );
}

export default function DepartmentLayout() {
    const initialValues = {
        name: '',
        code: '',
        pic_ids: []
    };

    return (
        <CommonView
            addNewItem={{
                name: "Add Department",
                form: DepartmentForm,
                action: rootUrl('api/v1/add-dept'),
                initialValues: initialValues
            }}
            editItem={{
                name: "Edit Department",
                form: DepartmentForm,
                action: rootUrl('api/v1/edit-dept'),
                fetchUrl: rootUrl('api/v1/get-dept'),
                initialValues: { ...initialValues }
            }}
            deleteItemAction={rootUrl('api/v1/delete-dept')}
            deleteSelectedItemAction={rootUrl('api/v1/delete-depts')}
            table={{
                canSelect: true,
                columns: [
                    {
                        id: 'name',
                        name: 'Name'
                    },
                    {
                        id: 'code',
                        name: 'Code'
                    },
                ],
                source: {
                    url: rootUrl('api/v1/fetch-depts'),
                    method: 'GET',
                    produce: item => [item.name, item.code],
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
