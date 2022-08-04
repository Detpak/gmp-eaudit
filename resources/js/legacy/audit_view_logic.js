import axios from "axios";
import { IndicatorButton } from "./components";
import { DynamicTable } from "./dynamic_table";
import { showToastMsg } from "./utils";

export class CyclesSubviewLogic
{
    constructor()
    {
        this.table = new DynamicTable({
            wrapperId: 'cyclesTableWrapper',
            fixedHeader: true,
            columns: [
                DynamicTable.idColumn(),
                {
                    id: 'label',
                    name: 'Label'
                },
                {
                    id: 'open_time',
                    name: 'Open Time'
                },
                {
                    id: 'close_time',
                    name: 'Close Time'
                }
            ],
            source: {
                type: 'server',
                server: {
                    url: '/api/v1/fetch-cycles',
                    method: 'GET',
                    headers: axios.defaults.headers.common,
                    then: data => data.data.map((item) => [item.id, item.label, item.open_time, item.close_time ? item.close_time : '-']),
                    total: data => {
                        return data.total;
                    }
                }
            }
        });

        this.newCycleBtn = IndicatorButton.getOrCreateInstance('newCycleBtn');
        this.newCycleBtn.setOnClick(() => {
            axios.get('/api/v1/get-active-cycle')
                .then((response) => {
                    if (response.data.result && !confirm('The current audit cycle has not yet been finished. Are you sure you want to start a new cycle?')) {
                        this.newCycleBtn.setDone();
                        return;
                    }

                    axios.post('/api/v1/new-cycle')
                        .then((response) => {
                            showToastMsg('New cycle has been started.');
                            this.newCycleBtn.setDone();
                        });
                })
                .catch((reason) => {
                    console.log(reason);
                    showToastMsg('Cannot create new cycle.', true);
                    this.newCycleBtn.setDone();
                });
        });

        document.getElementById('refreshCyclesBtn').addEventListener('click', () => {
            this.refresh();
        });
    }

    refresh()
    {
        this.table.refresh();
    }
}

export class AuditViewLogic
{
    constructor()
    {
        new CyclesSubviewLogic;
    }
}
