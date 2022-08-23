import { useState, useEffect} from "react";
import { Form } from "react-bootstrap";
import { RequiredSpan } from "../../components/LabelSpan";
import { rootUrl } from "../../utils";
import CommonView from "../CommonView";

function DivisionForm({ shown, handleChange, values, errors }) {
    const [isLoading, setLoading] = useState(false);
    const [entities, setEntities] = useState([]);

    useEffect(() => {
        if (shown) {
            setLoading(true);
            axios.get(rootUrl('api/v1/fetch-entity-options'))
                .then((response) => {
                    setEntities(response.data);
                    setLoading(false);
                });
        }
    }, [shown]);

    return (
        <>
            <Form.Group className="mb-3" controlId="name">
                <Form.Label>Name <RequiredSpan/></Form.Label>
                <Form.Control type="text" name="name" value={values.name} onChange={handleChange} isInvalid={!!errors.name} />
                <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3" controlId="entity_id">
                <Form.Label>Entity <RequiredSpan /></Form.Label>
                <Form.Select name="entity_id" value={values.entity_id} onChange={handleChange} isInvalid={!!errors.entity_id} disabled={isLoading}>
                    <option value="" disabled>-- Please select entity --</option>
                    {entities.map((data) => (
                        <option key={_.uniqueId()} value={data.id}>{data.name}</option>
                    ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">{errors.entity_id}</Form.Control.Feedback>
            </Form.Group>
        </>

    )
}

export default function DivisionLayout() {
    const initialValues = {
        name: '',
        entity_id: ''
    };

    return (
        <CommonView
            addNewItem={{
                name: "Add Division",
                form: DivisionForm,
                action: rootUrl('api/v1/add-division'),
                initialValues: initialValues
            }}
            editItem={{
                name: "Edit Division",
                form: DivisionForm,
                action: rootUrl('api/v1/edit-division'),
                fetchUrl: rootUrl('api/v1/get-division'),
                initialValues: { ...initialValues }
            }}
            deleteItemAction={rootUrl('api/v1/delete-division')}
            deleteSelectedItemAction={rootUrl('api/v1/delete-divisions')}
            table={{
                canSelect: true,
                columns: [
                    {
                        id: 'name',
                        name: 'Name'
                    },
                    {
                        id: 'entity_name',
                        name: 'Entity'
                    },
                    {
                        id: 'departments_count',
                        name: '# Department'
                    },
                ],
                source: {
                    url: rootUrl('api/v1/fetch-divisions'),
                    method: 'GET',
                    produce: item => [
                        item.name,
                        item.entity_name,
                        item.departments_count,
                    ],
                }
            }}
            messages={{
                onItemAdded: "Division successfully added!",
                onItemEdited: "Division successfully edited!",
                onItemDeleted: "Division successfully deleted!",
                onNoItemSelectedMsg: "Please select the division to delete",
                onDeleteSelectedItemConfirmMsg: "Do you really want to delete the division?",
                onSelectedItemDeletedMsg: "The selected division successfully deleted!",
            }}
        />
    )
}
