import { Form } from "react-bootstrap";
import { RequiredSpan } from "../../components/LabelSpan";
import { rootUrl } from "../../utils";
import CommonView from "../CommonView";

function DivisionForm({ shown, handleChange, values, errors }) {
    return (
        <Form.Group className="mb-3" controlId="name">
            <Form.Label>Name <RequiredSpan/></Form.Label>
            <Form.Control type="text" name="name" value={values.name} onChange={handleChange} isInvalid={!!errors.name} />
            <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
        </Form.Group>
    )
}

export default function DivisionLayout() {
    const initialValues = {
        name: ''
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
                ],
                source: {
                    url: rootUrl('api/v1/fetch-divisions'),
                    method: 'GET',
                    produce: item => [item.name],
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
