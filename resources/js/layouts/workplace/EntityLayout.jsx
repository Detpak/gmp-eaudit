import { Col, Container, Form, Row } from "react-bootstrap";
import { OptionalSpan, RequiredSpan } from "../../components/LabelSpan";
import CommonView from "../CommonView";

function EntityForm({ shown, handleChange, values, errors }) {
    return (
        <>
            <Row>
                <Col>
                    <Form.Group className="mb-3" controlId="name">
                        <Form.Label>Name <RequiredSpan/></Form.Label>
                        <Form.Control type="text" name="name" value={values.name} onChange={handleChange} isInvalid={!!errors.name} />
                        <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="address_1">
                        <Form.Label>Address 1 <RequiredSpan/></Form.Label>
                        <Form.Control as="textarea" name="address_1" rows={2} value={values.address_1} onChange={handleChange} isInvalid={!!errors.address_1} />
                        <Form.Control.Feedback type="invalid">{errors.address_1}</Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="address_2">
                        <Form.Label>Address 2 <OptionalSpan/></Form.Label>
                        <Form.Control as="textarea" name="address_2" rows={2} value={values.address_2} onChange={handleChange} isInvalid={!!errors.address_2} />
                        <Form.Control.Feedback type="invalid">{errors.address_2}</Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group controlId="city">
                        <Form.Label>City <RequiredSpan/></Form.Label>
                        <Form.Control type="text" name="city" value={values.city} onChange={handleChange} isInvalid={!!errors.city} />
                        <Form.Control.Feedback type="invalid">{errors.city}</Form.Control.Feedback>
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group className="mb-3" controlId="zip">
                        <Form.Label>ZIP Code <RequiredSpan/></Form.Label>
                        <Form.Control type="text" name="zip" value={values.zip} onChange={handleChange} isInvalid={!!errors.zip} />
                        <Form.Control.Feedback type="invalid">{errors.zip}</Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="npwp">
                        <Form.Label>NPWP <RequiredSpan/></Form.Label>
                        <Form.Control type="text" name="npwp" value={values.npwp} onChange={handleChange} isInvalid={!!errors.npwp} />
                        <Form.Control.Feedback type="invalid">{errors.npwp}</Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group controlId="desc">
                        <Form.Label>Description <OptionalSpan/></Form.Label>
                        <Form.Control as="textarea" name="desc" rows={3} value={values.desc} onChange={handleChange} isInvalid={!!errors.desc} />
                        <Form.Control.Feedback type="invalid">{errors.desc}</Form.Control.Feedback>
                    </Form.Group>
                </Col>
            </Row>
        </>
    );
}

export default function EntityLayout() {
    const initialValues = {
        name: '',
        address_1: '',
        address_2: '',
        city: '',
        zip: '',
        npwp: '',
        desc: '',
    };

    return (
        <CommonView
            addNewItem={{
                name: "Add Entity",
                form: EntityForm,
                size: "lg",
                action: 'api/v1/add-entity',
                initialValues: initialValues
            }}
            editItem={{
                name: "Edit Entity",
                form: EntityForm,
                size: "lg",
                action: 'api/v1/edit-entity',
                fetchUrl: 'api/v1/get-entity',
                initialValues: { ...initialValues }
            }}
            deleteItem={{
                action: 'api/v1/delete-entity'
            }}
            deleteSelectedItemAction={'api/v1/delete-entities'}
            table={{
                canSelect: true,
                columns: [
                    {
                        id: 'name',
                        name: 'Name'
                    },
                    {
                        id: 'address_1',
                        name: 'Address 1'
                    },
                    {
                        id: 'address_2',
                        name: 'Address 2'
                    },
                    {
                        id: 'city',
                        name: 'City',
                    },
                    {
                        id: 'zip',
                        name: 'Zip Code'
                    },
                    {
                        id: 'npwp',
                        name: 'NPWP'
                    },
                    {
                        id: 'desc',
                        name: 'Description'
                    },
                    {
                        sortable: false,
                        id: 'divisions_count',
                        name: '# Divisions'
                    },
                ],
                source: {
                    url: 'api/v1/fetch-entities',
                    method: 'GET',
                    produce: item => [
                        item.name,
                        item.address_1 && item.address_1.length > 0 ? item.address_1 : '-',
                        item.address_2 && item.address_2.length > 0 ? item.address_2 : '-',
                        item.city && item.city.length > 0 ? item.city : '-',
                        item.zip,
                        item.npwp,
                        item.desc && item.desc.length > 0 ? item.desc : '-',
                        item.divisions_count,
                    ],
                }
            }}
            messages={{
                onItemAdded: "Entity successfully added!",
                onItemEdited: "Entity successfully edited!",
                onItemDeleted: "Entity successfully deleted!",
                onNoItemSelectedMsg: "Please select the entity to delete",
                onDeleteSelectedItemConfirmMsg: "Do you really want to delete the entity?",
                onSelectedItemDeletedMsg: "The selected entity successfully deleted!",
            }}
        />
    )
}
