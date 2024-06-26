import axios from "axios";
import React from "react";
import { useRef } from "react";
import { useEffect, useState } from "react";
import { Dropdown, Form, Spinner } from "react-bootstrap";
import httpRequest from "../api";
import { useIsMounted } from "../utils";

export default function DropdownList({
    source,
    selectedItem,
    setSelectedItem,
    selectFirstData,
    className,
    caption,
    title,
    children,
    disabled,
    disableIf
}) {
    const [show, setShow] = useState(false);
    const [isLoading, setLoading] = useState(false);
    const [canFetch, setCanFetch] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [listData, setListData] = useState([]);
    const [search, setSearch] = useState('');
    const abortController = useRef(null);

    const handleShow = (nextShow) => {
        if (nextShow == false) {
            setListData([]);
            setCurrentPage(1);
        }

        setShow(nextShow);
    };

    const fetchData = (searchKeyword, page, append) => {
        setLoading(true);

        const params = {
            search: searchKeyword,
            page: page,
            max: 8,
            list: 1
        };

        httpRequest.get(source, { params: params, signal: abortController.current.signal })
            .then((response) => {
                if (append) {
                    if (response.data.total == listData.length) {
                        setCanFetch(false);
                        setLoading(false);
                        return;
                    }

                    setListData([...listData, ...response.data.data]);
                }
                else {
                    setListData(response.data.data);
                }

                setCurrentPage(page);
                setLoading(false);
            })
            .catch((reason) => {
                if (axios.isCancel(reason)) {
                    return;
                }

                console.error(reason);
            });
    };

    const handleScroll = (ev) => {
        const height =  ev.target.clientHeight;
        const reachesBottom = Math.abs(ev.target.scrollHeight - height - ev.target.scrollTop) < 2;
        if (!isLoading && canFetch && reachesBottom) {
            const nextPage = currentPage + 1;
            fetchData(search, nextPage, true);
        }
    };

    const handleSelect = (eventKey) => {
        setSelectedItem(listData[eventKey]);
    };

    useEffect(async () => {
        if (!selectFirstData) return;
        abortController.current = new AbortController();

        const params = {
            search: '',
            page: 1,
            max: 1,
            list: 1
        };

        const response = await httpRequest.get(source, { params: params, signal: abortController.current.signal });

        setSelectedItem(response.data.data[0]);

        return () => {
            if (abortController.current != null) {
                abortController.current.abort();
                abortController.current = null;
            }
        }
    }, [selectFirstData]);

    useEffect(() => {
        if (!show) return;
        abortController.current = new AbortController();

        const timeout = setTimeout(() => {
            setCanFetch(true);
            setListData([]);
            fetchData(search, 1, false);
        }, 500);

        return () => {
            clearTimeout(timeout);
            if (abortController.current != null) {
                abortController.current.abort();
                abortController.current = null;
            }
        };
    }, [show, search]);

    return (
        <Dropdown className={className} show={show} onSelect={handleSelect} onToggle={(nextShow) => handleShow(nextShow)}>
            <div className="d-grid gap-2">
                <Dropdown.Toggle className="text-truncate" disabled={disabled}>
                    {selectedItem ? caption(selectedItem) : title}
                </Dropdown.Toggle>
            </div>

            <Dropdown.Menu className={`shadow ${className}`} flip={false}>
                <Dropdown.Header>
                    <Form.Control type="text" placeholder="Search" value={search} onChange={(ev) => setSearch(ev.target.value)} />
                </Dropdown.Header>

                <div className="overflow-auto" style={{ maxHeight: 200 }} onScroll={handleScroll}>
                    {listData.map((item, index) => (
                        <Dropdown.Item key={index} eventKey={index} className="py-2" disabled={disableIf != null ? disableIf(item) : false}>
                            {React.createElement(children, { data: item })}
                        </Dropdown.Item>
                    ))}
                    {
                        canFetch && isLoading && (
                            <div className="py-2 text-center">
                                <span className="text-secondary"><Spinner animation="border" size="sm" /> Loading...</span>
                            </div>
                        )
                    }
                </div>
            </Dropdown.Menu>
        </Dropdown>
    );
}
