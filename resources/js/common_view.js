import axios from "axios";
import { DynamicTable } from "./dynamic_table";
import { IndicatorButton, ModalForm } from "./components";
import { showToastMsg } from "./utils";

export class CommonView
{
    constructor(config)
    {
        this.addItemModalForm = ModalForm.getOrCreateInstance(config.addItemModalId);

        this.addItemModalForm.setOnFormSent(() => {
            this.refreshTable();
            showToastMsg(config.onItemAddedMsg);
        });

        this.editItemModalForm = ModalForm.getOrCreateInstance(config.editItemModalId);

        this.editItemModalForm.setOnFormSubmit((jsonData) => {
            const form = this.editItemModalForm.getFormElement();
            jsonData['id'] = form.getAttribute('data-app-id');
            return jsonData;
        });

        this.editItemModalForm.setOnFormSent(() => {
            this.refreshTable();
            showToastMsg(config.onItemEditedMsg);
        });

        // Setup dynamic table
        this.table = new DynamicTable({
            wrapperId: config.tableWrapperId,
            fixedHeader: true,
            columns: config.tableColumns,
            source: {
                type: 'server',
                server: {
                    url: config.tableUrlSource,
                    method: 'GET',
                    headers: axios.defaults.headers.common,
                    then: config.tableParseData,
                    total: data => {
                        console.log(data.total);
                        return data.total;
                    }
                }
            },
            onDeleteBtnClicked: (id) => {
                if (!confirm(config.itemDeleteConfirmMsg)) return;

                axios.get(`${config.itemDeleteUrl}/${id}`)
                    .then((response) => {
                        showToastMsg(config.onItemDeletedMsg);
                        this.refreshTable();
                    })
                    .catch((reason) => {
                        showToastMsg(config.onDeleteItemFailedMsg, true);
                        console.log(reason);
                    });
                }
        });

        this.deleteSelectedBtn = IndicatorButton.getOrCreateInstance(config.deleteSelectedBtnId);

        this.deleteSelectedBtn.setOnClick(() => {
            let selectedItems = this.table.getSelectedItems();

            if (!selectedItems || selectedItems.rowIds.length == 0) {
                this.deleteSelectedBtn.setDone();
                alert(config.noItemSelectedMsg);
                return;
            }

            if (!confirm(config.deleteSelectedItemConfirmMsg)) return;

            axios.post(config.deleteSelectedUrl, this.table.getSelectedItems(), { headers: { 'Content-Type': 'application/json' } })
                .then((response) => {
                    showToastMsg(config.onSelectedItemDeletedMsg);
                    this.deleteSelectedBtn.setDone();
                    this.refreshTable();
                })
                .catch((reason) => {
                    showToastMsg(config.onDeleteSelectedItemFailedMsg, true);
                    this.deleteSelectedBtn.setDone();
                    console.log(reason);
                });
        });

        this.refreshBtn = document.getElementById(config.refreshBtnId);

        this.refreshBtn.addEventListener('click', () => {
            this.refreshTable();
        });
    }

    refreshTable()
    {
        this.table.refresh();
    }
}
