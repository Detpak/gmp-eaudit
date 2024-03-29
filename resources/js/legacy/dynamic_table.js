import { Grid, html } from "gridjs";
import { RowSelection } from "gridjs-selection";
import $ from 'jquery';

export class DynamicTable
{
    constructor(config)
    {
        this.paginationConfig = {
            limit: 25,
            page: 0,
            server: {
                url: (prev, page, _) => {
                    this.currentPage = page;
                    return `${prev}${prev.includes('?') ? '&' : '?'}page=${this.currentPage + 1}`
                }
            }
        };

        let gridConfig = {
            columns: config.columns,
            fixedHeader: config.fixedHeader,
            height: config.height,
            search: config.source.type == 'data' ? null : {
                server: {
                    url: (prev, keyword) => `${prev}?search=${keyword}`
                }
            },
            pagination: config.source.type == 'data' ? null : this.paginationConfig,
            sort: {
                server: {
                    url: (prev, columns) => {
                        if (columns.length == 0) return `${prev}`;

                        const sortBy = config.columns[columns[0].index].id;
                        const dir = columns[0].direction > 0 ? 'asc' : 'desc';

                        return `${prev}${prev.includes('?') ? '&' : '?'}sort=${sortBy}&dir=${dir}`;
                    }
                }
            },
            className: {
                container: 'h-100 overflow-auto d-flex flex-column',
                table: 'table table-hover align-middle',
                th: 'bg-light px-3 py-2',
                td: 'px-3 py-2'
            },
            language: {
                'search': 'Type a keyword to search...'
            }
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

            if (checkboxPlugin) {
                checkboxPlugin.props.store.on('updated', (state, _) => {
                    this.selectedItems = state; // update selected items
                });
            }

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

        if (config.refreshBtnId) {
            document.getElementById(config.refreshBtnId).addEventListener('click', () => { this.refresh() });
        }
    }

    refresh()
    {
        this.paginationConfig.page = this.getCurrentPage();

        this.grid.updateConfig({
            pagination: this.paginationConfig
        });

        this.grid.forceRender();
    }

    getSelectedItems()
    {
        return this.selectedItems;
    }

    getCurrentPage()
    {
        return this.currentPage;
    }

    static idColumn()
    {
        return {
            id: 'id',
            sort: false,
            hidden: true,
        };
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

    static actionColumn(editBtnModalTarget)
    {
        return {
            sort: false,
            id: 'actions',
            name: 'Actions',
            formatter: (_, row) => html(
                `<button type="button" class="btn btn-primary btn-sm me-1" data-app-id="${row.cells[0].data}" ${editBtnModalTarget ? `data-bs-toggle="modal" data-bs-target="#${editBtnModalTarget}"` : ""}><i class="fa-regular fa-pen-to-square"></i> Edit</button>` +
                `<button type="button" class="btn btn-danger btn-sm" data-app-id="${row.cells[0].data}" name="__deleteItemBtn"><i class="fa-solid fa-trash"></i> Delete</button>`
            )
        };
    }
}
