import { Input } from "postcss";
import { Form, InputGroup } from "react-bootstrap";
import { RequiredSpan } from "../../components/LabelSpan";
import { rootUrl } from "../../utils";
import CommonView from "../CommonView";

function CriteriaForm({ shown, handleChange, values, errors }) {
    return (
        <>
            <Form.Group className="mb-3">
                <Form.Label>Code <RequiredSpan/></Form.Label>
                <Form.Control type="text" name="code" value={values.code} onChange={handleChange} isInvalid={!!errors.code} />
                <Form.Control.Feedback type="invalid">{errors.code}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label>Name <RequiredSpan/></Form.Label>
                <Form.Control type="text" name="name" value={values.name} onChange={handleChange} isInvalid={!!errors.name} />
                <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group>
                <Form.Label>Weight <RequiredSpan/></Form.Label>
                <InputGroup hasValidation={true}>
                    <Form.Control name="weight" id="weight" value={values.weight} onChange={handleChange} isInvalid={!!errors.weight} />
                    <InputGroup.Text>%</InputGroup.Text>
                    <Form.Control.Feedback type="invalid">{errors.weight}</Form.Control.Feedback>
                </InputGroup>
            </Form.Group>
        </>
    );
}

export default function CriteriaLayout() {
    const initialValues = {
        code: '',
        name: '',
        weight: 0
    };

    return (
        <CommonView
            addNewItem={{
                name: "Add Criteria",
                form: CriteriaForm,
                action: rootUrl('api/v1/add-criteria'),
                initialValues: initialValues
            }}
            editItem={{
                name: "Edit Criteria",
                form: CriteriaForm,
                action: rootUrl('api/v1/edit-criteria'),
                fetchUrl: rootUrl('api/v1/get-criteria'),
                initialValues: { ...initialValues }
            }}
            deleteItemAction={rootUrl('api/v1/delete-criteria')}
            deleteSelectedItemAction={rootUrl('api/v1/delete-criterias')}
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
                        id: 'weight',
                        name: 'Weight (%)'
                    },
                ],
                source: {
                    url: rootUrl('api/v1/fetch-criterias'),
                    method: 'GET',
                    produce: item => [
                        item.code,
                        item.name,
                        `${item.weight}%`,
                    ],
                }
            }}
            messages={{
                onItemAdded: "Criteria successfully added!",
                onItemEdited: "Criteria successfully edited!",
                onItemDeleted: "Criteria successfully deleted!",
                onNoItemSelectedMsg: "Please select the criteria to delete",
                onDeleteSelectedItemConfirmMsg: "Do you really want to delete the selected criteria?",
                onSelectedItemDeletedMsg: "The selected criteria successfully deleted!",
            }}
        />
    )
}
