import React, { useEffect, useState } from "react";
import { RowSelection } from "gridjs/plugins/selection";
import { Grid } from "gridjs";
import { Button, Form, Pagination, Spinner, Table } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faPenToSquare, faAngleLeft, faAngleRight, faSort, faSortUp, faSortDown, faCheck } from "@fortawesome/free-solid-svg-icons";
import _ from "lodash";
import LoadingButton from "./LoadingButton";
import { useInRouterContext } from "react-router-dom";
import { useRef } from "react";
import { showToastMsg } from "../utils";
import httpRequest from "../api";

const MAX_PAGES = 3;

export default function DynamicTable({ refreshTrigger, columns, selectedItems, onSelect, actionColumn, searchKeyword, source }) {
    const thClassName = "p-0 table-column sticky-top";
    const thFixedLeftClassName = "p-0 table-column table-header-fixed-left";
    const thFixedRightClassName = "p-0 table-column table-header-fixed-right";
    const tdClassName = "px-3 py-2";
    const tdFixedLeftClassName = "px-3 table-column-fixed-left py-2";
    const tdFixedRightClassName = "px-3 table-column-fixed-right py-2";
    const entriesList = _.range(1, 11).map((value) => value * 10); // 5, 10, 15, 20, ...
    const isInRouterContext = useInRouterContext();
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState(null);
    const [listData, setListData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setLoading] = useState(false);
    const [entries, setEntries] = useState(20);
    const [numPages, setNumPages] = useState(null);
    const [error, setError] = useState(false);
    const mounted = useRef(false);

    const fetchData = async () => {
        setLoading(true);

        const params = {
            page: currentPage,
            max: entries
        };

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

        const response = await httpRequest.get(source.url, { params: params });

        if (response.data.data && mounted.current) {
            if (response.data.last_page < currentPage) {
                setCurrentPage(response.data.last_page);
            }

            setNumPages(response.data.last_page);
            setListData(response.data.data);
            setLoading(false);
        }
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

    useEffect(() => {
        mounted.current = true;
        return () => { mounted.current = false; };
    }, [])

    useEffect(() => {
        if (search != searchKeyword) {
            setSearch(searchKeyword);

            const timeout = setTimeout(() => {
                setError(false);
                fetchData().catch(reason => {
                    setError(true);
                    setLoading(false);
                });
            }, 500);

            return () => clearTimeout(timeout);
        }

        setError(false);
        fetchData().catch(reason => {
            console.log(reason);
            setError(true);
            setLoading(false);
        });
    }, [refreshTrigger, searchKeyword, sort, entries, currentPage]);

    return (
        <div className="d-flex flex-column h-100">
            <div className="d-flex flex-fill overflow-auto h-100 mb-3 position-relative">
                {/* {isLoading && !error && (
                    <div className="position-relative">
                        <div className="position-absolute">
                            <h1>Test</h1>
                        </div>
                    </div>
                )} */}
                {isLoading && !error &&
                    <div className="d-flex flex-column position-absolute w-100 h-100 bg-white bg-opacity-50 text-center justify-content-center" style={{ zIndex: 1 }}>
                        <div>
                            <Spinner animation="border"/>
                        </div>
                        <h2>Loading</h2>
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
                                    return (
                                        <th key={index} className={thClassName} style={{ zIndex: 'auto' }} onClick={() => sortable && handleSort(column.id)}>
                                            <div className={`hstack gap-3 px-3 py-2 border ${selectedItems || index != 0 ? 'border-start-0' : ''}`}>
                                                <span className="user-select-none flex-fill">{column.name}</span>
                                                {sortable && <FontAwesomeIcon icon={sort && sort.column == column.id ? (sort.dir == 1 ? faSortUp : faSortDown) : faSort} />}
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
                            {
                                // isLoading && !error ? (
                                //     // Show loading shimmer
                                //     // _.range(0, 5).map((_, index) => (
                                //     //     <tr key={index}>
                                //     //         {selectedItems &&
                                //     //             <td className={tdFixedLeftClassName}>
                                //     //                 <input type="checkbox" className="form-check-input" disabled />
                                //     //             </td>
                                //     //         }
                                //     //         {columns.map((data, columnIndex) => (
                                //     //             <td key={columnIndex} className={tdClassName}>
                                //     //                 <div className="shimmer"></div>
                                //     //             </td>
                                //     //         ))}
                                //     //         {actionColumn &&
                                //     //             <td className={tdFixedRightClassName}>
                                //     //                 <Button size="sm" className="me-1" disabled><FontAwesomeIcon icon={faPenToSquare}/></Button>
                                //     //                 <Button variant="danger" size="sm" disabled><FontAwesomeIcon icon={faTrash}/></Button>
                                //     //             </td>
                                //     //         }
                                //     //     </tr>
                                //     // ))
                                //     <></>
                                // ) : (

                                // )
                            }
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
