import { faArrowRotateRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import { Button, Card, CloseButton, Collapse, Form, ListGroup, Spinner } from "react-bootstrap";
import httpRequest from "../api";

export default function SearchList({ source, height, placeholder, onDone, children }) {
    const [search, setSearch] = useState('');
    const [showList, setShowList] = useState(false);
    const [listData, setListData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setLoading] = useState(false);
    const [canFetch, setCanFetch] = useState(true);
    const [selectedItems, setSelectedItems] = useState({});

    const close = () =>  {
        // Reset all states
        setListData([]);
        setSelectedItems({});
        setCurrentPage(1);
        setShowList(false);
    }

    const handleDone = () => {
        if (onDone) {
            onDone(Object.keys(selectedItems));
        }

        close();
    };

    const handleChange = (id, checked) => {
        const items = { ...selectedItems };

        if (id in selectedItems) {
            delete items[id];
        }
        else {
            items[id] = checked;
        }

        setSelectedItems(items);
    };

    const fetchData = (searchKeyword, page, append) => {
        setLoading(true);

        const params = {
            search: searchKeyword,
            page: page,
            max: 8
        };

        httpRequest.get(source, { params: params })
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
            });
    };

    const handleScroll = (ev) => {
        const bottomTarget = Math.round(ev.target.scrollHeight - ev.target.scrollTop);
        if (!isLoading && canFetch && bottomTarget <= Math.round(ev.target.clientHeight)) {
            const nextPage = currentPage + 1;
            fetchData(search, nextPage, true);
        }
    };

    const handleRefresh = () => {
        setSearch('');
        setCanFetch(true);
        setListData([]);
        fetchData(search, 1, false);
    };

    useEffect(() => {
        if (!showList) {
            return;
        }

        const timeout = setTimeout(() => {
            setCanFetch(true);
            setListData([]);
            fetchData(search, 1, false);
        }, 500);

        return () => clearTimeout(timeout);
    }, [showList, search]);

    return <>
        <Form.Group className="mb-2">
            <Form.Control
                type="text"
                value={search}
                onChange={(ev) => setSearch(ev.target.value)}
                onFocus={() => setShowList(true)}
                placeholder={placeholder}
            />
        </Form.Group>

        {
            showList ? (
                <div className="position-relative select-list">
                    <Card className="position-absolute w-100 shadow">
                        <Card.Body className="h-100">
                            <div className="d-flex flex-column h-100 mb-3">
                                <div className="d-flex mb-3">
                                    <h6 className="mx-auto my-auto">Please select the items below</h6>
                                    <CloseButton onClick={close} />
                                </div>
                                <div className="flex-fill overflow-auto" style={{ maxHeight: height }} onScroll={handleScroll}>
                                    <ListGroup>
                                        {listData.map((item, index) => (
                                            <ListGroup.Item key={index}>
                                                <div className="d-flex">
                                                    <Form.Group className="align-self-center me-3">
                                                        <Form.Check
                                                            defaultChecked={item.id in selectedItems ? selectedItems[item.id] : false}
                                                            onChange={(ev) => handleChange(item.id, ev.target.checked)}
                                                        />
                                                    </Form.Group>
                                                    <div className="flex-fill">
                                                        {React.createElement(children, { data: item })}
                                                    </div>
                                                </div>
                                            </ListGroup.Item>
                                        ))}
                                        {
                                            canFetch && isLoading && (
                                                <ListGroup.Item>
                                                    <span className="text-secondary"><Spinner animation="border" size="sm" /> Loading...</span>
                                                </ListGroup.Item>
                                            )
                                        }
                                    </ListGroup>
                                </div>
                            </div>
                            <div className="d-flex flex-row-reverse">
                                <Button onClick={handleDone}>Done</Button>
                                <Button variant="outline-secondary" onClick={handleRefresh} className="me-1"><FontAwesomeIcon icon={faArrowRotateRight} /></Button>
                            </div>
                        </Card.Body>
                    </Card>
                </div>
            ) : (
                null
            )
        }
    </>
}
