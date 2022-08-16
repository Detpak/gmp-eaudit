import axios from "axios";
import CommonView from "./CommonView";
import { Form } from "react-bootstrap";
import { rootUrl } from "../utils";
import { useState } from "react";
import { useEffect } from "react";
import { OptionalSpan, RequiredSpan } from "../components/LabelSpan";

function WorkplaceAreaForm({ shown, handleChange, values, setValues, errors }) {
    const [isLoading, setLoading] = useState(false);
    const [departments, setDepartments] = useState([]);

    useEffect(() => {
        if (shown) {
            setLoading(true);
            axios.get(rootUrl('api/v1/fetch-dept-options'))
                .then((response) => {
                    setDepartments(response.data);
                    setLoading(false);
                });
        }
    }, [shown]);

    return (
        <>
            <Form.Group className="mb-3" controlId="name">
                <Form.Label>Name <RequiredSpan /></Form.Label>
                <Form.Control type="text" name="name" value={values.name} onChange={handleChange} isInvalid={!!errors.name} />
                <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3" controlId="department_id">
                <Form.Label>Department <RequiredSpan /></Form.Label>
                <Form.Select name="department_id" value={values.department_id} onChange={handleChange} isInvalid={!!errors.department_id} disabled={isLoading}>
                    <option value="" disabled>-- Please select department --</option>
                    {departments.map((data) => (
                        <option key={_.uniqueId()} value={data.id}>{data.name}</option>
                    ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">{errors.department_id}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3" controlId="desc">
                <Form.Label>Description <OptionalSpan /></Form.Label>
                <Form.Control as="textarea" name="desc" rows={3} value={values.desc} onChange={handleChange} isInvalid={!!errors.desc} />
            </Form.Group>
        </>
    );
}

export default function WorkplaceAreaLayout() {
    const initialValues = {
        name: '',
        desc: '',
        department_id: ''
    };

    return (
        <CommonView
            addNewItem={{
                name: "Add Area",
                form: WorkplaceAreaForm,
                action: rootUrl('api/v1/add-area'),
                initialValues: initialValues
            }}
            editItem={{
                name: "Edit Area",
                form: WorkplaceAreaForm,
                action: rootUrl('api/v1/edit-area'),
                fetchUrl: rootUrl('api/v1/get-area'),
                initialValues: { ...initialValues }
            }}
            deleteItemAction={rootUrl('api/v1/delete-area')}
            deleteSelectedItemAction={rootUrl('api/v1/delete-areas')}
            table={{
                canSelect: true,
                columns: [
                    {
                        id: 'name',
                        name: 'Area Name'
                    },
                    {
                        id: 'dept_name',
                        name: 'Department Name'
                    },
                    {
                        id: 'desc',
                        name: 'Description'
                    }
                ],
                source: {
                    url: rootUrl('/api/v1/fetch-areas'),
                    method: 'GET',
                    produce: item => [item.name, item.dept_name, item.desc && item.desc.length > 0 ? item.desc : '-'],
                }
            }}
            messages={{
                onItemAdded: "Area successfully added!",
                onItemEdited: "Area successfully edited!",
                onItemDeleted: "Area successfully deleted!",
                onNoItemSelectedMsg: "Please select the area to delete",
                onDeleteSelectedItemConfirmMsg: "Do you really want to delete the area?",
                onSelectedItemDeletedMsg: "The selected area successfully deleted!",
            }}
        />
    )
}