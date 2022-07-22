import axios from 'axios';
import { counterUp } from 'counterup2';
import { IndicatorButton, Spinner } from './components';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import chroma from "chroma-js";
import { truncateString } from './utils';

Chart.register(ChartDataLabels);

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

        this.chartRequests = [
            { userId: userId, type: 'currentAuditCycleStatus' },
            { userId: userId, type: 'notStartedAndInProgressAudit' },
            { userId: userId, type: 'submittedAudit' },
            { userId: userId, type: 'top10FailedParams' },
        ];

        this.cpal = chroma.bezier([
                chroma.hsv(0,   0.60,    1.0),
                chroma.hsv(30,  0.60,    1.0),
                chroma.hsv(60,  0.60,    1.0),
                chroma.hsv(90,  0.60,    1.0),
                chroma.hsv(120, 0.60,    1.0),
                chroma.hsv(150, 0.60,    1.0),
                chroma.hsv(180, 0.60,    1.0),
                chroma.hsv(210, 0.60,    1.0),
                chroma.hsv(240, 0.60,    1.0),
                chroma.hsv(270, 0.60,    1.0),
                chroma.hsv(300, 0.60,    1.0),
                chroma.hsv(330, 0.60,    1.0),
            ])
            .scale();

        // Refreshing is done asynchronously for convenience
        this.refreshBtn = new IndicatorButton("refreshCharts");
        this.refreshBtn.setOnClick(() => {
            Promise.all([...this.updateNumbers(), ...this.updateCharts()])
                .then(() => {
                    this.refreshBtn.setDone();
                });
        });

        this.updateNumbers();
        this.setupCharts();
        this.updateCharts();
        this.startTimer();
    }

    refresh()
    {
    }

    // Prepare charts upfront so we can update it later
    setupCharts()
    {
        const currentAuditCycleStatusData = {
            datasets: [{
                hoverOffset: 4
            }]
        };

        const notStartedAndInProgressAuditData = {
            datasets: [{
                borderWidth: 1
            }]
        };

        const submittedAuditData = {
            datasets: [{
                borderWidth: 1
            }]
        };

        const top10FailedParams = {
            datasets: [{
                borderWidth: 1
            }]
        };

        this.charts = {
            currentAuditCycleStatus: new Chart(
                document.getElementById('currentAuditCycleStatus'),
                {
                    type: 'pie',
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { position: 'right' },
                            datalabels: { color: '#222222' }
                        }
                    },
                    data: currentAuditCycleStatusData
                }
            ),
            notStartedAndInProgressAudit: new Chart(
                document.getElementById('notStartedAndInProgressAudit'),
                {
                    type: 'bar',
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        },
                        plugins: {
                            legend: { display: false },
                            datalabels: { color: '#111111' },
                        }
                    },
                    data: notStartedAndInProgressAuditData
                }
            ),
            submittedAudit: new Chart(
                document.getElementById('submittedAudit'),
                {
                    type: 'bar',
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        },
                        plugins: {
                            legend: { display: false },
                            datalabels: { color: '#111111' },
                        }
                    },
                    data: submittedAuditData
                }
            ),
            top10FailedParams: new Chart(
                document.getElementById('top10FailedParams'),
                {
                    type: 'bar',
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        },
                        plugins: {
                            legend: { display: false },
                            datalabels: { color: '#111111' },
                        }
                    },
                    data: top10FailedParams
                }
            ),
        };
    }

    startTimer()
    {
        //setInterval(this.updateCharts.bind(this), 10000);
    }

    // Update chart numbers
    updateNumbers()
    {
        let promises = [];

        for (const element of this.numberRequests) {
            let currentRequest = axios.post('/api/v1/get-chart', element, { headers: { 'Content-Type': 'application/json' } })
                .then(function (response) {
                    let spinner = Spinner.getOrCreateInstance(response.data.type);
                    let childElement = spinner.getChildElement();
                    spinner.setDone();
                    childElement.innerHTML = response.data.result;
                    counterUp(childElement);
                })
                .catch(function (reason) {
                    console.log(reason);
                });

            promises.push(currentRequest);
        }

        return promises;
    }

    updateCharts()
    {
        let promises = [];

        for (const element of this.chartRequests) {
            let currentRequest = axios.post('/api/v1/get-chart', element, { headers: { 'Content-Type': 'application/json' } })
                .then((function (response) {
                    let chart = this.charts[response.data.type];
                    let numItems = response.data.result.length;

                    chart.data.datasets[0].data = [];
                    chart.data.datasets[0].backgroundColor = this.cpal.colors(numItems);
                    chart.data.labels = [];

                    for (const data of response.data.result) {
                        chart.data.labels.push(data.name);
                        chart.data.datasets[0].data.push(data.rowCount);
                    }

                    chart.update();
                }).bind(this))
                .catch(function (reason) {
                    console.log(reason);
                })

            promises.push(currentRequest);
        }

        return promises;
    }
}
