import { Grid, html } from "gridjs";
import { RowSelection } from "gridjs-selection";
import $ from 'jquery';

export class DynamicTable
{
    constructor(config)
    {
        let gridConfig = {
            sort: true,
            columns: config.columns,
            fixedHeader: config.fixedHeader,
            height: config.height,
        };

        // Choose data source
        if (config.source.type == 'data') {
            gridConfig.data = config.source.data;
        }
        else {
            gridConfig.server = config.source.server;
        }

        // Check if the config has actions column
        this.actionsColumn = config.columns.find(column => (typeof(column) == 'object') && ('id' in column) && column.id == 'actions');

        let gridWrapper = document.getElementById(config.wrapperId);

        // Initialize and render the grid
        this.grid = new Grid(gridConfig);
        this.grid.render(gridWrapper);
        this.grid.on('ready', () => {
            const checkboxPlugin = this.grid.config.plugin.get('selected');

            // Subscribe to the selection checkbox event listener
            checkboxPlugin.props.store.on('updated', (state, _) => {
                this.selectedItems = state;
            });

            if (this.actionsColumn) {
                this.onDeleteBtnClicked = config.onDeleteBtnClicked;

                $('[name="__deleteItemBtn"]').on('click', event => {
                    if (this.onDeleteBtnClicked) {
                        const id = event.currentTarget.getAttribute('data-app-id');
                        this.onDeleteBtnClicked(id);
                    }
                });
            }
        });

        document.getElementById(config.refreshBtnId).addEventListener('click', () => { this.refresh() });
    }

    refresh()
    {
        this.grid.forceRender();
    }

    getSelectedItems()
    {
        return this.selectedItems;
    }

    static selectionColumn()
    {
        return {
            id: 'selected',
            sort: false,
            plugin: {
                component: RowSelection,
                props: { id: (row) => row.cell(0).data }
            }
        }
    }

    static idColumn()
    {
        return {
            id: 'id',
            sort: false,
            hidden: true,
        };
    }

    static actionColumn(changeBtnModalTarget)
    {
        return {
            sort: false,
            id: 'actions',
            name: 'Actions',
            formatter: (_, row) => html(
                `<button type="button" class="btn btn-primary btn-sm me-1" data-app-id="${row.cells[0].data}" data-bs-toggle="modal" data-bs-target="#${changeBtnModalTarget}"><i class="fa-regular fa-pen-to-square"></i> Change</button>` +
                `<button type="button" class="btn btn-danger btn-sm" data-app-id="${row.cells[0].data}" name="__deleteItemBtn"><i class="fa-solid fa-trash"></i> Delete</button>`
            )
        };
    }
}
