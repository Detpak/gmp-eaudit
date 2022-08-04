import React, { useState } from "react";
import { Grid } from "gridjs-react";
import { RowSelection } from "gridjs-selection";

export default class DynamicTable extends React.Component {
    state = {
        currentPage: 0
    }

    constructor(props) {
        super(props);
        this.props.server.headers = axios.defaults.headers.common;
    }

    render() {
        return (
            <Grid
                fixedHeader={true}
                columns={this.props.columns}
                server={this.props.server}
                search={{
                    server: {
                        url: (prev, keyword) => `${prev}?search=${keyword}`
                    }
                }}
                pagination={{
                    limit: 25,
                    page: this.state.currentPage,
                    server: {
                        url: (prev, page, _) => {
                            return `${prev}${prev.includes('?') ? '&' : '?'}page=${page + 1}`
                        }
                    }
                }}
                sort={{
                    server: {
                        url: (prev, columns) => {
                            if (columns.length == 0) return `${prev}`;
                            const sortBy = this.props.columns[columns[0].index].id;
                            const dir = columns[0].direction > 0 ? 'asc' : 'desc';
                            return `${prev}${prev.includes('?') ? '&' : '?'}sort=${sortBy}&dir=${dir}`;
                        }
                    }
                }}
                className={{
                    container: 'h-100 overflow-auto d-flex flex-column',
                    table: 'table table-hover align-middle',
                    th: 'bg-light px-3 py-2',
                    td: 'px-3 py-2'
                }}
            />
        );
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
}
