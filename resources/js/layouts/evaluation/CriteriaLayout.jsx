import { Form, InputGroup } from "react-bootstrap";
import { useFilter } from "../../components/FilterTable";
import { RequiredSpan } from "../../components/LabelSpan";
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
    const filter = useFilter();
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
                action: 'api/v1/add-criteria',
                initialValues: initialValues
            }}
            editItem={{
                name: "Edit Criteria",
                form: CriteriaForm,
                allowEditIf: item => item.groups_count > 0,
                action: 'api/v1/edit-criteria',
                fetchUrl: 'api/v1/get-criteria',
                initialValues: { ...initialValues }
            }}
            deleteItem={{
                action: 'api/v1/delete-criteria'
            }}
            deleteSelectedItemAction={'api/v1/delete-criterias'}
            filter={filter}
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
                        type: 'number',
                        id: 'weight',
                        name: 'Weight (%)'
                    },
                    {
                        type: 'number',
                        id: 'groups_count',
                        name: '# Registered Groups'
                    }
                ],
                source: {
                    url: 'api/v1/fetch-criterias',
                    method: 'GET',
                    produce: item => [
                        item.code,
                        item.name,
                        `${item.weight}%`,
                        item.groups_count
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
