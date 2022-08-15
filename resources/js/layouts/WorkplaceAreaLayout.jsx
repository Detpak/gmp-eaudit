import { rootUrl } from "../utils";
import CommonView from "./CommonView";

function WorkplaceAreaForm({ shown, handleChange, values, setValues, errors }) {
    return <></>
}

export default function WorkplaceAreaLayout() {
    const initialValues = {
        name: '',
        code: '',
        pic_ids: []
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
                    }
                ],
                source: {
                    url: rootUrl('/api/v1/fetch-areas'),
                    method: 'GET',
                    produce: item => [item.name, item.dept_name],
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
