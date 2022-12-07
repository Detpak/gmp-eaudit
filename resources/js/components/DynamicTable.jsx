import React, { useEffect, useState } from "react";
import { RowSelection } from "gridjs/plugins/selection";
import { Grid } from "gridjs";
import { Button, Dropdown, Form, Modal, Pagination, Spinner, Table } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faPenToSquare, faAngleLeft, faAngleRight, faSort, faSortUp, faSortDown, faCheck, faArrowRightFromBracket, faDownload } from "@fortawesome/free-solid-svg-icons";
import _ from "lodash";
import LoadingButton from "./LoadingButton";
import { useInRouterContext } from "react-router-dom";
import { useRef } from "react";
import httpRequest from "../api";
import { useMemo } from "react";
import { Base64 } from "js-base64";
import writeXlsxFile from "write-excel-file";

const MAX_PAGES = 3;
const NUMBER_CONDITION = {
    '=' : '=',
    '<' : '<',
    '<=' : '\u2264',
    '>' : '>',
    '>=' : '\u2265',
};

export function useRefreshTable() {
    const [refresh, setRefresh] = useState(false);
    return { refresher: refresh, triggerRefresh: () => setRefresh(!refresh) };
}

export function ExportTable({ className, fetch, searchKeyword, filter, columns, produce }) {
    const [show, setShow] = useState(false);
    const [mode, setMode] = useState("current");
    const [filterState, setFilterState] = filter ? filter.state : [null, null];
    const [filterParams, setFilterParams] = filter ? filter.params : [null, null];
    const [sort, setSort] = filter ? filter.sort : useState(null);
    const [numEntries, setNumEntries] = filter ? filter.entries : useState(20);
    const [currentPage, setCurrentPage] = filter ? filter.page : useState(1);

    const exportTable = async () => {
        const columnsRow = columns
            .filter(column => !('export' in column) ? true : column.export)
            .map(column => ({
                value: column.name,
                fontWeight: 'bold',
                number: column.number,
                exportFormat: column.exportFormat,
            }));

        const columnProps = columnsRow.map(column => ({ width: `${column.value}`.length }));

        const rows = [
            columnsRow
        ];

        const params = { };

        if (mode == 'current') {
            params.max = numEntries;
            params.page = currentPage;
        }

        if (filter) {
            params.filter = _.pickBy(filterParams, filter => filter.value.length > 0);
            params.filter_mode = filterState.mode;
        }

        if (searchKeyword.length != 0) {
            params.search = searchKeyword;
        }

        if (sort) {
            switch (sort.dir) {
                case 1:
                    params.sort = sort.column;
                    params.dir = 'asc';
                    break;
                case 2:
                    params.sort = sort.column;
                    params.dir = 'desc';
                    break;
            }
        }

        try {
            const response = await httpRequest.get(fetch, { params: params });

            if (response.data.data) {
                for (const row of response.data.data) {
                    const formattedRow = produce(row)
                        .map((column, index) => {
                            const data = {
                                value: column,
                                type: columnsRow[index].number ? Number : String
                            };

                            if (columnsRow[index].exportFormat) {
                                data.format = columnsRow[index].exportFormat;
                            }

                            return data;
                        });

                    // Adjust column width
                    formattedRow.forEach((column, index) => {
                        const currentWidth = columnProps[index].width;
                        columnProps[index].width = Math.min(Math.max(`${column.value}`.length + 1, currentWidth), 100);
                    });

                    rows.push(formattedRow);
                }
            }

            //console.log(rows);
            await writeXlsxFile(rows, { columns: columnProps, fileName: `table-export-${new Date().getTime()}.xlsx` });
        }
        catch (ex) {
            console.log(ex);
        }
    };

    return (
        <>
            <Button variant="outline-success" onClick={() => setShow(true)} className={className}>
                <FontAwesomeIcon icon={faArrowRightFromBracket} className="me-1" />
                Export
            </Button>

            <Modal show={show} onHide={() => setShow(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Export</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group>
                        <Form.Label>Mode</Form.Label>
                        <Form.Select value={mode} onChange={(ev) => setMode(ev.target.value)}>
                            <option value="current">Current entries</option>
                            <option value="all">All entries</option>
                        </Form.Select>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <LoadingButton onClick={exportTable} icon={faDownload}>Download</LoadingButton>
                </Modal.Footer>
            </Modal>
        </>
    )
}

export default function DynamicTable({
    refreshTrigger,
    columns,
    selectedItems,
    onSelect,
    actionColumn,
    searchKeyword,
    source,
    filter
}) {
    const thClassName = "p-0 table-column sticky-top";
    const thFixedLeftClassName = "p-0 table-column table-header-fixed-left";
    const thFixedRightClassName = "p-0 table-column table-header-fixed-right";
    const tdClassName = "px-3 py-2";
    const tdFixedLeftClassName = "px-3 table-column-fixed-left py-2";
    const tdFixedRightClassName = "px-3 table-column-fixed-right py-2";
    const entriesList = _.range(1, 11).map((value) => value * 10); // 5, 10, 15, 20, ...
    const [search, setSearch] = useState('');
    const [listData, setListData] = useState([]);
    const [isLoading, setLoading] = useState(false);
    const [numPages, setNumPages] = useState(null);
    const [error, setError] = useState(false);
    const [filterState, setFilterState] = filter ? filter.state : [null, null];
    const [filterParams, setFilterParams] = filter ? filter.params : [null, null];
    const [sort, setSort] = filter ? filter.sort : useState(null);
    const [entries, setEntries] = filter ? filter.entries : useState(20);
    const [currentPage, setCurrentPage] = filter ? filter.page : useState(1);
    const mounted = useRef(false);

    const fetchData = async (filtering) => {
        setError(false);
        setLoading(true);

        const params = {
            page: currentPage,
            max: entries
        };

        if (filter) {
            params.filter = _.pickBy(filtering, filter => filter.value.length > 0);
            params.filter_mode = filterState.mode;
        }

        if (searchKeyword.length != 0) {
            params.search = searchKeyword;
        }

        if (sort) {
            switch (sort.dir) {
                case 1:
                    params.sort = sort.column;
                    params.dir = 'asc';
                    break;
                case 2:
                    params.sort = sort.column;
                    params.dir = 'desc';
                    break;
            }
        }

        try {
            const response = await httpRequest.get(source.url, { params: params });

            if (response.data.data && mounted.current) {
                if (response.data.last_page < currentPage) {
                    setCurrentPage(response.data.last_page);
                }

                setNumPages(response.data.last_page);
                setListData(response.data.data);
            }
        }
        catch (ex) {
            console.log(ex);
            setError(true);
        }

        setLoading(false);
    };

    const handleDeleteClick = async (itemId) => {
        const response = await httpRequest.get(`${actionColumn.deleteAction}/${itemId}`);

        if (response.data.error) {
            throw Error(response.data.error);
        }
    };

    const handleEntryChange = (ev) => {
        setCurrentPage(1);
        setEntries(ev.target.value);
    };

    const handleSelect = (id, checked) => {
        const items = { ...selectedItems };

        if (id in selectedItems) {
            delete items[id];
        }
        else {
            items[id] = checked;
        }

        onSelect(items);
    };

    const handleSort = (column) => {
        if (sort && sort.column == column) {
            const dir = (sort.dir + 1) % 3;

            if (dir === 0) {
                setSort(null);
                return;
            }

            setSort({ column: column, dir: dir  });
        }
        else {
            setSort({ column: column, dir: 1 });
        }
    };

    const handleFilter = (ev, column) => {
        const old = { ...filterParams };
        old[column.id].value = ev.target.value;
        setFilterParams(old);
    };

    const handleFilterOp = (key, column) => {
        const old = { ...filterParams };
        old[column.id].op = key;
        setFilterParams(old);
    }

    const processFilter = () => {
        fetchData(filterParams);
    };

    useEffect(() => {
        mounted.current = true;
        return () => { mounted.current = false; };
    }, [])

    if (filter) {
        useEffect(() => {
            if (!filterState.shouldFilter) {
                const initialFilteringValue = _.chain(columns)
                    .filter(column => !('filterable' in column) ? true : column.filterable)
                    .groupBy('id')
                    .mapValues((value) => (value[0]))
                    .mapValues((value, key, column) => {
                        const defaultVal = { value: '' };

                        if (column[key].number) {
                            defaultVal.op = '=';
                        }

                        return defaultVal;
                    })
                    .value();

                if (_.chain(filterParams).values().some((filter) => filter.value.length > 0).value()) {
                    fetchData(initialFilteringValue);
                }

                setFilterParams(initialFilteringValue);
                return;
            }
        }, [filterState]);
    }

    useEffect(() => {
        if (search != searchKeyword) {
            setSearch(searchKeyword);

            const timeout = setTimeout(() => {
                setError(false);
                fetchData(filterParams);
            }, 500);

            return () => clearTimeout(timeout);
        }

        fetchData(filterParams);
    }, [refreshTrigger, searchKeyword, sort, entries, currentPage]);

    return (
        <div className="d-flex flex-column h-100">
            <div className="d-flex flex-fill overflow-auto h-100 mb-3 position-relative">
                {isLoading && !error &&
                    <div className="d-flex flex-column position-absolute w-100 h-100 bg-white bg-opacity-50 text-center justify-content-center" style={{ zIndex: 2 }}>
                        <div>
                            <Spinner animation="border"/>
                        </div>
                        <h5>Please Wait</h5>
                    </div>
                }
                <div className="flex-fill overflow-auto">
                    <Table hover borderless striped className="align-middle table-nowrap mb-0">
                        <thead>
                            <tr>
                                {selectedItems &&
                                    <th className={thFixedLeftClassName}>
                                        <div className="px-3 py-2 border"><FontAwesomeIcon icon={faCheck} /></div>
                                    </th>
                                }
                                {columns.map((column, index) => {
                                    const sortable = !('sortable' in column) ? true : column.sortable;
                                    const filterable = !('filterable' in column) ? true : column.filterable;
                                    const isNumber = !('number' in column) ? false : column.number;
                                    return (
                                        <th key={index} className={thClassName} style={{ zIndex: 1 }}>
                                            <div className={`px-3 py-2 border ${selectedItems || index != 0 ? 'border-start-0' : ''}`}>
                                                <div className="hstack gap-3" style={{ minWidth: 100 }}>
                                                    <div className="user-select-none flex-fill">{column.name}</div>
                                                    {sortable &&
                                                        <FontAwesomeIcon
                                                            icon={sort && sort.column == column.id ? (sort.dir == 1 ? faSortUp : faSortDown) : faSort}
                                                            onClick={() => sortable && handleSort(column.id)}
                                                        />
                                                    }
                                                </div>
                                                {filter && filterState.shouldFilter &&
                                                    <div className="hstack gap-1 mt-2">
                                                        {isNumber &&
                                                            <Dropdown onSelect={key => handleFilterOp(key, column)}>
                                                                <Dropdown.Toggle size="sm" className="no-caret">
                                                                    {NUMBER_CONDITION[filterParams[column.id].op]}
                                                                </Dropdown.Toggle>

                                                                <Dropdown.Menu className="sm-header mt-2">
                                                                    <Dropdown.Item eventKey="=">Equal (=)</Dropdown.Item>
                                                                    <Dropdown.Item eventKey="<">Less-than ({'<'})</Dropdown.Item>
                                                                    <Dropdown.Item eventKey="<=">Less-than or equal ({"\u2264"})</Dropdown.Item>
                                                                    <Dropdown.Item eventKey=">">Greater-than ({">"})</Dropdown.Item>
                                                                    <Dropdown.Item eventKey=">=">Greater-than or equal ({"\u2265"})</Dropdown.Item>
                                                                </Dropdown.Menu>
                                                            </Dropdown>
                                                        }
                                                        <Form.Control
                                                            size="sm"
                                                            value={filterable ? filterParams[column.id].value : ''}
                                                            onChange={filterable ? ev => handleFilter(ev, column) : null}
                                                            onKeyUp={ev => ev.key == 'Enter' && processFilter()}
                                                            disabled={!filterable}
                                                        />
                                                    </div>
                                                }
                                            </div>
                                        </th>
                                    )
                                })}
                                {actionColumn &&
                                    <th className={thFixedRightClassName}>
                                        <div className="px-3 py-2 border">Action</div>
                                    </th>
                                }
                            </tr>
                        </thead>
                        <tbody>
                            {listData.map((item, index) => (
                                <tr key={index}>
                                    {selectedItems &&
                                        <td className={tdFixedLeftClassName}>
                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                                defaultChecked={item.id in selectedItems ? selectedItems[item.id] : false}
                                                onChange={(ev) => handleSelect(item.id, ev.target.checked)}
                                            />
                                        </td>
                                    }
                                    {source.produce(item).map((data, columnIndex) => (
                                        <td key={columnIndex} className={tdClassName}>{data}</td>
                                    ))}
                                    {actionColumn &&
                                        <td className={tdFixedRightClassName}>
                                            <Button
                                                size="sm"
                                                className="me-1"
                                                onClick={() => actionColumn.onEditClick(item.id)}
                                                disabled={actionColumn.allowEditIf && actionColumn.allowEditIf(item)}
                                            >
                                                <FontAwesomeIcon icon={faPenToSquare}/>
                                            </Button>
                                            <LoadingButton
                                                variant="danger"
                                                size="sm"
                                                icon={faTrash}
                                                onClick={() => handleDeleteClick(item.id)}
                                                afterLoading={() => fetchData()}
                                                disabled={actionColumn.allowDeleteIf && actionColumn.allowDeleteIf(item)}
                                            />
                                        </td>
                                    }
                                </tr>
                            ))
                            }
                        </tbody>
                    </Table>
                    {
                        !isLoading && listData.length == 0 &&
                            <div className="text-center p-4">
                                No records available.
                            </div>
                    }
                    {error && <div className="text-center p-4">Failed to retrieve data.</div>}
                </div>
            </div>
            <div className="d-flex align-items-center mb-3">
                <div className="flex-fill hstack gap-1">
                    <span>Show</span>
                    <Form.Group>
                        <Form.Select value={entries} onChange={handleEntryChange}>
                            {entriesList.map((numEntries, index) => <option key={index} value={numEntries}>{numEntries}</option>)}
                        </Form.Select>
                    </Form.Group>
                    <span>entries</span>
                </div>
                {!(numPages == 1) &&
                    <Pagination className="mb-0">
                        <Pagination.Item disabled={isLoading || currentPage == 1} onClick={() => setCurrentPage(currentPage - 1)}>
                            <FontAwesomeIcon icon={faAngleLeft} />
                        </Pagination.Item>
                        {
                            numPages <= MAX_PAGES ? (
                                _.range(1, numPages + 1).map((page, index) => (
                                    <Pagination.Item
                                        key={index}
                                        active={currentPage == page}
                                        disabled={isLoading && currentPage != page}
                                        onClick={() => setCurrentPage(page)}
                                    >
                                        {page}
                                    </Pagination.Item>
                                ))
                            ) : (
                                (() => {
                                    const section = currentPage == 1 ? 0 : Math.floor((currentPage - 1) / MAX_PAGES);
                                    const prevSection = (section - 1) * MAX_PAGES + 1;
                                    const nextSection = (section + 1) * MAX_PAGES + 1;
                                    const endSection = Math.floor((numPages - 1) / MAX_PAGES);
                                    return (
                                        <>
                                            {section != 0 &&
                                                <>
                                                    <Pagination.Item disabled={isLoading} onClick={() => setCurrentPage(1)}>{1}</Pagination.Item>
                                                    <Pagination.Ellipsis disabled={isLoading} onClick={() => setCurrentPage(prevSection)} />
                                                </>
                                            }
                                            {_.range(1 + section * MAX_PAGES, Math.min(nextSection, numPages + 1)).map((page, index) => (
                                                <Pagination.Item
                                                    key={index}
                                                    active={currentPage == page}
                                                    disabled={isLoading && currentPage != page}
                                                    onClick={() => setCurrentPage(page)}
                                                >
                                                    {page}
                                                </Pagination.Item>
                                            ))}
                                            {section != endSection &&
                                                <>
                                                    <Pagination.Ellipsis disabled={isLoading} onClick={() => setCurrentPage(nextSection)} />
                                                    <Pagination.Item disabled={isLoading} onClick={() => setCurrentPage(numPages)}>{numPages}</Pagination.Item>
                                                </>
                                            }
                                        </>
                                    )
                                })()
                            )
                        }
                        <Pagination.Item disabled={isLoading || currentPage == numPages} onClick={() => setCurrentPage(currentPage + 1)}>
                            <FontAwesomeIcon icon={faAngleRight} />
                        </Pagination.Item>
                    </Pagination>
                }
            </div>
        </div>
    );
}
