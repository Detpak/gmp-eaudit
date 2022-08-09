import React, { useEffect, useState } from "react";
import { RowSelection } from "gridjs/plugins/selection";
import { Grid } from "gridjs";
import { _ } from "gridjs-react";
import { Form } from "react-bootstrap";

export default class DynamicTable extends React.Component {
    grid = null;

    constructor(props) {
        super(props);

        this.eventRegistered = false;
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

        this.config = {
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
        };

        this.grid = new Grid(this.config);

        this.props.server.headers = axios.defaults.headers.common;
        this.wrapper = React.createRef();
    }

    componentDidMount() {
        this.grid.render(this.wrapper.current)
            .on('ready', () => {
                const checkboxPlugin = this.grid.config.plugin.get('selected');
                if (checkboxPlugin && !this.eventRegistered) {
                    checkboxPlugin.props.store.on('updated', (state, _) => {
                        if (this.props.onItemSelected) {
                            this.props.onItemSelected(state);
                        }
                    });
                    this.eventRegistered = true;
                }
            });
    }

    refreshTable() {
        this.pagination.page = this.currentPage;
        this.grid.updateConfig({ pagination: this.pagination }).forceRender();
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

    // RowSelection plugin from Grid.js is quite buggy.
    static selectionColumn(config) {
        return {
            id: 'selected',
            sort: false,
            formatter: (cell) => (_(<DynamicTable.SelectionCheck itemId={cell} {...config} />))
        }
    }

    static SelectionCheck({ itemId, onCheck }) {
        const handleChange = (ev) => {
            onCheck(itemId, ev.target.checked);
        };

        return (
            <input type="checkbox" className="w-100 mx-auto" onChange={handleChange}></input>
        );
    }
}
