import axios from 'axios';
import { counterUp } from 'counterup2';
import { Spinner } from './spinner';

export class DashboardViewLogic
{
    constructor(userId)
    {
        this.numberRequests = [
            { userId: userId, type: 'totalCycles' },
            { userId: userId, type: 'totalAuditSubmitted' },
            { userId: userId, type: 'areaAudited' },
            { userId: userId, type: 'auditAreaGroup' },
        ];

        this.updateNumbers();
        this.updateCharts();
        this.startTimer();
    }

    startTimer()
    {

    }

    updateNumbers()
    {
        for (const element of this.numberRequests) {
            axios.post('/api/v1/get-chart', element, { headers: { 'Content-Type': 'application/json' } })
                .then(function(response) {
                    let spinner = Spinner.getOrCreateInstance(response.data.type);
                    let childElement = spinner.getChildElement();
                    spinner.setDone();
                    childElement.innerHTML = response.data.result;
                    counterUp(childElement);
                })
                .catch(function(reason) {
                    console.log(reason);
                });
        }
    }

    updateCharts()
    {

    }
}
