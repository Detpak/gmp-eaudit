import React, { useEffect, useState } from "react";
import { Grid } from "gridjs";
import { RowSelection } from "gridjs-selection";

export default class DynamicTable extends React.Component {
    state = {
        currentPage: 0
    };

    constructor(props) {
        super(props);
        this.currentPage = 0;

        this.pagination = {
            limit: 25,
            page: this.currentPage,
            server: {
                url: (prev, page, _) => {
                    this.currentPage = page;
                    return `${prev}${prev.includes('?') ? '&' : '?'}page=${page + 1}`;
                }
            }
        };

        this.props.server.headers = axios.defaults.headers.common;
        this.wrapper = React.createRef();
    }

    componentDidMount() {
        this.grid = new Grid({
            fixedHeader: true,
            columns: this.props.columns,
            server: this.props.server,
            search: {
                debounceTimeout: 500,
                server: {
                    url: (prev, keyword) => `${prev}?search=${keyword}`
                }
            },
            pagination: this.pagination,
            sort: {
                server: {
                    url: (prev, columns) => {
                        if (columns.length == 0) return `${prev}`;
                        const sortBy = this.props.columns[columns[0].index].id;
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
            }
        });

        this.grid.render(this.wrapper.current)
            .on('ready', () => {
                const checkboxPlugin = this.grid.config.plugin.get('selected');
                console.log(checkboxPlugin);

                if (checkboxPlugin) {
                    checkboxPlugin.props.store.on('updated', (state, _) => {
                        console.log(this.props.onItemSelected, state);
                        if (this.props.onItemSelected) {
                            this.props.onItemSelected(state);
                        }
                    });
                }
            });
    }

    refreshTable() {
        this.pagination.page = this.currentPage;
        this.grid.updateConfig({ pagination: this.pagination })
            .forceRender();
    }

    render() {
        return (
            <div className="h-100 pb-2" ref={this.wrapper}></div>
        );
    }

    static idColumn() {
        return {
            id: 'id',
            sort: false,
            hidden: true,
        };
    }

    static selectionColumn() {
        return {
            id: 'selected',
            sort: false,
            plugin: {
                component: RowSelection,
                props: { id: (row) => row.cell(0).data }
            }
        }
    }
}
