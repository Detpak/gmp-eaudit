import { Grid } from "gridjs";
import { ModalForm } from "./components";
import { DynamicTable } from "./dynamic_table";
import { showToastMsg } from "./utils";
import { faker } from "@faker-js/faker";
import { toChildArray } from "preact";

export class TestbedViewLogic
{
    constructor()
    {
        this.modalForm = ModalForm.getOrCreateInstance('modalFormTest');
        this.modalForm.setOnFormSent((data) => {
            showToastMsg('Modal validated successfully!');
        })

        this.modalFormEdit = ModalForm.getOrCreateInstance('modalFormEditTest');
        this.modalFormEdit.setOnFormSent((data) => {
            showToastMsg('Modal validated successfully');
        });

        // this.tableGrid = new Grid({
        //     sort: true,
        //     columns: ['Name', 'Access Privilege', 'Remarks'],
        //     data: [
        //         ['Admin', 'Test', 'Administrator'],
        //         ['User', 'Test', 'Normal user'],
        //     ]
        // }).render(document.getElementById('tableGridJs'));

        this.data = Array(20).fill().map((_, index) => {
            return [
                index,
                faker.name.findName(),
                faker.internet.email(),
                faker.phone.number(),
                null
            ]
        });

        this.dynTable = new DynamicTable({
            wrapperId: 'testDynTable',
            refreshBtnId: 'dynTableRefresh',
            fixedHeader: true,
            //height: '400px',
            columns: [
                DynamicTable.idColumn(),
                DynamicTable.selectionColumn(),
                'Name',
                'E-mail',
                'Phone',
                DynamicTable.actionColumn('modalFormEditTest')
            ],
            source: {
                type: 'data',
                data: () => {
                    return new Promise(resolve => {
                        setTimeout(() => { resolve(this.data); }, 2000);
                    });
                }
            },
            onDeleteBtnClicked: (id) => {
                console.log(id);
            }
        });
    }
}
