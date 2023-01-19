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
import { useStatus, waitForMs } from "../utils";

const FILTER_OP_EQ = 0;
const FILTER_OP_NE = 1;
const FILTER_OP_LT = 2;
const FILTER_OP_LE = 3;
const FILTER_OP_GT = 4;
const FILTER_OP_GE = 5;
const FILTER_OP_BETWEEN = 6;

const FILTER_OP_EQ_DATE = 7;
const FILTER_OP_NE_DATE = 8;
const FILTER_OP_LT_DATE = 9;
const FILTER_OP_LE_DATE = 10;
const FILTER_OP_GT_DATE = 11;
const FILTER_OP_GE_DATE = 12;
const FILTER_OP_BETWEEN_DATE = 13;

const FILTER_OP_EQ_TIME = 14;
const FILTER_OP_NE_TIME = 15;
const FILTER_OP_LT_TIME = 16;
const FILTER_OP_LE_TIME = 17;
const FILTER_OP_GT_TIME = 18;
const FILTER_OP_GE_TIME = 19;
const FILTER_OP_BETWEEN_TIME = 20;

const MAX_PAGES = 3;

const NUMBER_CONDITION = [
    '=',
    '\u2260',
    '<',
    '\u2264',
    '>',
    '\u2265',
    '\u21C6',

    '=',
    '\u2260',
    '<',
    '\u2264',
    '>',
    '\u2265',
    '\u21C6',

    '=',
    '\u2260',
    '<',
    '\u2264',
    '>',
    '\u2265',
    '\u21C6'
];

function isDateOperation(op) {
    return op >= FILTER_OP_EQ_DATE && op <= FILTER_OP_BETWEEN_DATE;
}

function isTimeOperation(op) {
    return op >= FILTER_OP_EQ_TIME && op <= FILTER_OP_BETWEEN_TIME;
}

function getFromToNoun(op) {
    if (isDateOperation(op)) {
        return 'Date';
    }

    if (isTimeOperation(op)) {
        return 'Time';
    }

    return '';
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
    const exportStatus = useStatus();

    const exportTable = async () => {
        exportStatus.setProcessing(true);

        const params = { };

        if (mode == 'current') {
            params.max = numEntries;
            params.page = currentPage;
        }

        if (filter && filterState.shouldFilter) {
            params.filter = _.pickBy(filterParams, filter => filter.value.length > 0);
            params.filter_mode = filterState.mode;

            console.log(params.filter);
        }

        if (searchKeyword.length != 0) {
            params.search = searchKeyword;
        }

        if (mode == 'all' && searchKeyword.length == 0 && filter && (!filterState.shouldFilter || _.isEmpty(params.filter))) {
            if (!confirm('This will export all unfiltered entries to a Microsoft Excel file. Are you sure you want to continue?'))
                return;
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

        const columnsRow = columns
            .filter(column => !('export' in column) ? true : column.export)
            .map(column => ({
                value: column.name,
                fontWeight: 'bold',
                dataType: column.type,
                exportFormat: column.exportFormat,
            }));

        const columnProps = columnsRow.map(column => ({ width: `${column.value}`.length + 1 }));
        const rows = [columnsRow];

        try {
            exportStatus.setMessage('Retrieving data...');

            const response = await httpRequest.get(fetch, { params: params });

            if (response.data) {
                const rawDataRows = mode == 'current' ? response.data.data : response.data;
                let currentIndex = 0;

                for (const row of rawDataRows) {
                    exportStatus.setMessage(`Processing row ${currentIndex++ + 1}/${rawDataRows.length}`);

                    const formattedRow = produce(row)
                        .map((column, index) => {
                            const data = {
                                value: column,
                            };

                            if (columnsRow[index].dataType != null) {
                                switch (columnsRow[index].dataType) {
                                    case 'number':
                                        data.type = Number;
                                        data.internal_type = 'number';
                                        break;
                                    case 'date':
                                        data.type = Date;
                                        data.internal_type = 'date';
                                        break;
                                    case 'date_time':
                                        data.type = Date;
                                        data.internal_type = 'date_time';
                                        data.format = 'dd/mm/yyyy hh:mm AM/PM';
                                        break;
                                    default:
                                        data.type = String;
                                        data.internal_type = 'string';
                                        break;
                                }
                            }
                            else {
                                data.type = String;
                            }

                            if (columnsRow[index].exportFormat) {
                                data.format = columnsRow[index].exportFormat;
                            }

                            return data;
                        });

                    console.log(formattedRow);

                    // Adjust column width by number of characters
                    formattedRow.forEach((column, index) => {
                        const currentWidth = columnProps[index].width;
                        let str = '';

                        if (column.internal_type == 'date') {
                            str = 'mm/dd/YYYY';
                        }
                        else if (column.internal_type == 'date_time') {
                            str = column.format;
                        }
                        else {
                            str = `${column.value}`;
                        }

                        columnProps[index].width = Math.min(Math.max(str.length + 2, currentWidth), 100);
                    });

                    rows.push(formattedRow);
                }

                exportStatus.setMessage('Processing file...');

                await writeXlsxFile(rows, {
                    columns: columnProps,
                    dateFormat: 'mm/dd/yyyy',
                    fileName: `table-export-${new Date().getTime()}.xlsx`
                });
            }

            exportStatus.resetMessage();
            exportStatus.setProcessing(false);
        }
        catch (ex) {
            exportStatus.setProcessing(false);
            exportStatus.setMessage('Export failed. An unknown error occurred.');
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
                    <div className="me-2">{exportStatus.message}</div>
                    <LoadingButton onClick={exportTable} icon={faDownload}>Save</LoadingButton>
                </Modal.Footer>
            </Modal>
        </>
    )
}

const popperOffset = {
    modifiers: [
        {
            name: 'offset',
            options: {
                offset: [0, 10]
            }
        }
    ]
};

const thClassName = "p-0 table-column sticky-top border";
const thFixedLeftClassName = "p-0 table-column table-header-fixed-left border align-top";
const thFixedRightClassName = "p-0 table-column table-header-fixed-right border align-top";
const tdClassName = "px-3 py-2";
const tdFixedLeftClassName = "px-3 table-column-fixed-left py-2";
const tdFixedRightClassName = "px-3 table-column-fixed-right py-2";
const entriesList = _.range(1, 11).map((value) => value * 10); // 5, 10, 15, 20, ...

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

    const handleFilterValue0 = (ev, column) => {
        const old = { ...filterParams };
        old[column.id].value = ev.target.value;
        setFilterParams(old);
    };

    const handleFilterValue1 = (ev, column) => {
        const old = { ...filterParams };
        old[column.id].value1 = ev.target.value;
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
    }, []);

    if (filter) {
        useEffect(() => {
            if (!filterState.shouldFilter) {
                const initialFilteringValue = _.chain(columns)
                    .filter(column => !('filterable' in column) ? true : column.filterable)
                    .groupBy('id')
                    .mapValues((value) => (value[0]))
                    .mapValues((value, key, column) => {
                        const defaultVal = { value: '' };

                        if (column[key].type == 'number' ||
                            column[key].type == 'date' ||
                            column[key].type == 'date_time')
                        {
                            defaultVal.value1 = '';
                            defaultVal.op = FILTER_OP_EQ;
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
        if (!mounted.current) {
            mounted.current = true;
            return;
        }

        if (search != searchKeyword) {
            setSearch(searchKeyword);

            const timeout = setTimeout(() => {
                setError(false);
                fetchData(filterParams);
            }, 500);

            return () => {
                mounted.current = false;
                clearTimeout(timeout)
            };
        }

        fetchData(filterParams);

        return () => { mounted.current = false; };
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
                                        <div className="px-3 py-2">
                                            <FontAwesomeIcon icon={faCheck} />
                                        </div>
                                    </th>
                                }
                                {columns.map((column, index) => {
                                    const sortable = !('sortable' in column) ? true : column.sortable;
                                    const filterable = !('filterable' in column) ? true : column.filterable;
                                    const hasType = 'type' in column;
                                    const isString = !hasType || hasType && column.type == 'string';
                                    const isNumber = hasType && column.type == 'number';
                                    const isDate = hasType && column.type == 'date';
                                    const isDateTime = hasType && column.type == 'date_time';
                                    const isDateOrDateTime = isDate || isDateTime;
                                    const isBetween = filter && filterState.shouldFilter && !isString &&
                                        (filterParams[column.id].op == FILTER_OP_BETWEEN ||
                                            filterParams[column.id].op == FILTER_OP_BETWEEN_DATE ||
                                            filterParams[column.id].op == FILTER_OP_BETWEEN_TIME);

                                    return (
                                        <th key={index} className={thClassName} style={{ zIndex: 1 }}>
                                            <div className={`px-3 py-2`}>
                                                <div className="hstack gap-3" style={{ minWidth: isBetween && isDateOrDateTime ? 210 : (isBetween && isNumber ? 130 : 100 ) }}>
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
                                                        {/* {React.createElement(columnElement, { column: column })} */}
                                                        {(isNumber || isDateOrDateTime) &&
                                                            <Dropdown onSelect={key => handleFilterOp(key, column)}>
                                                                <Dropdown.Toggle size="sm" className="no-caret">
                                                                    {NUMBER_CONDITION[filterParams[column.id].op]}
                                                                </Dropdown.Toggle>

                                                                <Dropdown.Menu className="sm-header overflow-auto" popperConfig={popperOffset} style={{ maxHeight: 250 }}>
                                                                    <Dropdown.Item eventKey={FILTER_OP_EQ}>Equal (=)</Dropdown.Item>
                                                                    <Dropdown.Item eventKey={FILTER_OP_NE}>Not equal ({"\u2260"})</Dropdown.Item>
                                                                    <Dropdown.Item eventKey={FILTER_OP_LT}>Less-than ({'<'})</Dropdown.Item>
                                                                    <Dropdown.Item eventKey={FILTER_OP_LE}>Less-than or equal ({"\u2264"})</Dropdown.Item>
                                                                    <Dropdown.Item eventKey={FILTER_OP_GT}>Greater-than ({">"})</Dropdown.Item>
                                                                    <Dropdown.Item eventKey={FILTER_OP_GE}>Greater-than or equal ({"\u2265"})</Dropdown.Item>
                                                                    <Dropdown.Item eventKey={FILTER_OP_BETWEEN}>Between ({'\u21C6'})</Dropdown.Item>
                                                                    {isDateTime &&
                                                                        <>
                                                                            <Dropdown.Divider />
                                                                            <Dropdown.Item eventKey={FILTER_OP_EQ_DATE}>Equal to date (=)</Dropdown.Item>
                                                                            <Dropdown.Item eventKey={FILTER_OP_NE_DATE}>Not equal to date ({"\u2260"})</Dropdown.Item>
                                                                            <Dropdown.Item eventKey={FILTER_OP_LT_DATE}>Less-than date ({'<'})</Dropdown.Item>
                                                                            <Dropdown.Item eventKey={FILTER_OP_LE_DATE}>Less-than or equal to date ({"\u2264"})</Dropdown.Item>
                                                                            <Dropdown.Item eventKey={FILTER_OP_GT_DATE}>Greater-than date ({">"})</Dropdown.Item>
                                                                            <Dropdown.Item eventKey={FILTER_OP_GE_DATE}>Greater-than or equal to date ({"\u2265"})</Dropdown.Item>
                                                                            <Dropdown.Item eventKey={FILTER_OP_BETWEEN_DATE}>Between of date ({'\u21C6'})</Dropdown.Item>
                                                                            <Dropdown.Divider />
                                                                            <Dropdown.Item eventKey={FILTER_OP_EQ_TIME}>Equal to time (=)</Dropdown.Item>
                                                                            <Dropdown.Item eventKey={FILTER_OP_NE_TIME}>Not equal to time ({"\u2260"})</Dropdown.Item>
                                                                            <Dropdown.Item eventKey={FILTER_OP_LT_TIME}>Less-than time ({'<'})</Dropdown.Item>
                                                                            <Dropdown.Item eventKey={FILTER_OP_LE_TIME}>Less-than or equal to time ({"\u2264"})</Dropdown.Item>
                                                                            <Dropdown.Item eventKey={FILTER_OP_GT_TIME}>Greater-than time ({">"})</Dropdown.Item>
                                                                            <Dropdown.Item eventKey={FILTER_OP_GE_TIME}>Greater-than or equal to time ({"\u2265"})</Dropdown.Item>
                                                                            <Dropdown.Item eventKey={FILTER_OP_BETWEEN_TIME}>Between of time ({'\u21C6'})</Dropdown.Item>
                                                                        </>
                                                                    }
                                                                </Dropdown.Menu>
                                                            </Dropdown>
                                                        }
                                                        <Form.Control
                                                            size="sm"
                                                            value={filterable ? filterParams[column.id].value : ''}
                                                            onChange={filterable ? ev => handleFilterValue0(ev, column) : null}
                                                            onKeyUp={ev => ev.key == 'Enter' && processFilter()}
                                                            disabled={!filterable}
                                                            placeholder={filterable ? `${isBetween ? 'From ' : ''}${getFromToNoun(filterParams[column.id].op)}` : ''}
                                                        />
                                                        {isBetween &&
                                                            <Form.Control
                                                                size="sm"
                                                                value={filterable ? filterParams[column.id].value1 : ''}
                                                                onChange={filterable ? ev => handleFilterValue1(ev, column) : null}
                                                                onKeyUp={ev => ev.key == 'Enter' && processFilter()}
                                                                disabled={!filterable}
                                                                placeholder={filterable ? `${isBetween ? 'To ' : ''}${getFromToNoun(filterParams[column.id].op)}` : ''}
                                                            />
                                                        }
                                                    </div>
                                                }
                                            </div>
                                        </th>
                                    )
                                })}
                                {actionColumn &&
                                    <th className={thFixedRightClassName}>
                                        <div className="px-3 py-2">Action</div>
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
