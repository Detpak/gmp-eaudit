import { useEffect, useState } from "react";
import { Col, Form, Row } from "react-bootstrap";
import { RequiredSpan } from "../../components/LabelSpan";
import { rootUrl } from "../../utils";
import CommonView from "../CommonView";

function PlantForm({ shown, handleChange, values, errors }) {
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
            <Row>
                <Col>
                    <Form.Group className="mb-3" controlId="code">
                        <Form.Label>Code <RequiredSpan/></Form.Label>
                        <Form.Control type="text" name="code" value={values.code} onChange={handleChange} isInvalid={!!errors.code} />
                        <Form.Control.Feedback type="invalid">{errors.code}</Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="name">
                        <Form.Label>Name <RequiredSpan/></Form.Label>
                        <Form.Control type="text" name="name" value={values.name} onChange={handleChange} isInvalid={!!errors.name} />
                        <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="address">
                        <Form.Label>Address <RequiredSpan/></Form.Label>
                        <Form.Control as="textarea" name="address" rows={2} value={values.address} onChange={handleChange} isInvalid={!!errors.address} />
                        <Form.Control.Feedback type="invalid">{errors.address}</Form.Control.Feedback>
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group className="mb-3" controlId="city">
                        <Form.Label>City <RequiredSpan/></Form.Label>
                        <Form.Control type="text" name="city" value={values.city} onChange={handleChange} isInvalid={!!errors.city} />
                        <Form.Control.Feedback type="invalid">{errors.city}</Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="zip">
                        <Form.Label>ZIP Code <RequiredSpan/></Form.Label>
                        <Form.Control type="text" name="zip" value={values.zip} onChange={handleChange} isInvalid={!!errors.zip} />
                        <Form.Control.Feedback type="invalid">{errors.zip}</Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="entity_id">
                        <Form.Label>Entity <RequiredSpan /></Form.Label>
                        <Form.Select name="entity_id" value={values.entity_id} onChange={handleChange} isInvalid={!!errors.entity_id} disabled={isLoading}>
                            <option value="" disabled>-- Please select entity --</option>
                            {entities.map((data, index) => (
                                <option key={index} value={data.id}>{data.name}</option>
                            ))}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">{errors.entity_id}</Form.Control.Feedback>
                    </Form.Group>
                </Col>
            </Row>
        </>
    );
}

export default function PlantLayout() {
    const initialValues = {
        code: '',
        name: '',
        address: '',
        city: '',
        zip: '',
        entity_id: ''
    };

    return (
        <CommonView
            addNewItem={{
                name: "Add Plant",
                form: PlantForm,
                size: 'lg',
                action: rootUrl('api/v1/add-plant'),
                initialValues: initialValues
            }}
            editItem={{
                name: "Edit Plant",
                form: PlantForm,
                size: 'lg',
                action: rootUrl('api/v1/edit-plant'),
                fetchUrl: rootUrl('api/v1/get-plant'),
                initialValues: { ...initialValues }
            }}
            deleteItem={{
                action: rootUrl('api/v1/delete-plant')
            }}
            deleteSelectedItemAction={rootUrl('api/v1/delete-plants')}
            table={{
                canSelect: true,
                columns: [
                    {
                        id: 'code',
                        name: 'Code'
                    },
                    {
                        id: 'name',
                        name: 'Name'
                    },
                    {
                        id: 'address',
                        name: 'Address'
                    },
                    {
                        id: 'city',
                        name: 'City'
                    },
                    {
                        id: 'zip',
                        name: 'ZIP Code'
                    },
                    {
                        id: 'entity_name',
                        name: 'Entity Name'
                    },
                    {
                        sortable: false,
                        id: 'areas_count',
                        name: '# Areas'
                    },
                ],
                source: {
                    url: rootUrl('api/v1/fetch-plants'),
                    method: 'GET',
                    produce: item => [
                        item.code,
                        item.name,
                        item.address,
                        item.city,
                        item.zip,
                        item.entity_name,
                        item.areas_count,
                    ],
                }
            }}
            messages={{
                onItemAdded: "Plant successfully added!",
                onItemEdited: "Plant successfully edited!",
                onItemDeleted: "Plant successfully deleted!",
                onNoItemSelectedMsg: "Please select the plant to delete",
                onDeleteSelectedItemConfirmMsg: "Do you really want to delete the plant?",
                onSelectedItemDeletedMsg: "The selected plant successfully deleted!",
            }}
        />
    )
}
