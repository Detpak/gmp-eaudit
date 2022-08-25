import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import { Button, ListGroup, Spinner } from "react-bootstrap";
import { useIsMounted } from "../utils";

export default function ListView({ ids, fetchUrl, onDoneLoading, handleRemoveAll, handleRemove, children }) {
    const isMounted = useIsMounted();
    const [isLoading, setLoading] = useState(false);
    const [data, setData] = useState([]);

    const fetchData = async () => {
        if (!isMounted.current) return;

        if (ids.length == 0) {
            setLoading(false);
            setData([]);
            onDoneLoading([]);
            return;
        }

        setLoading(true);
        const data = { ids: ids };
        const response = await axios.post(fetchUrl, data, { headers: { 'Content-Type': 'application/json' } });

        if (isMounted.current) {
            setData(response.data);
            setLoading(false);
            onDoneLoading(response.data);
        }
    }

    useEffect(() => {
        fetchData();
    }, [ids]);

    return (
        <>
            <div className="hstack gap-1 mb-2">
                <Button variant="danger" size="sm" disabled={data.length == 0} onClick={handleRemoveAll}>Remove All</Button>
            </div>
            <div className="overflow-auto" style={{ maxHeight: 200 }}>
                <ListGroup>
                    {
                        (isLoading) ? (
                            <ListGroup.Item className="text-center">
                                <Spinner animation="border" size="sm" /> Loading...
                            </ListGroup.Item>
                        ) : (
                            (data.length == 0) ? (
                                <ListGroup.Item className="text-center">No PIC(s) selected</ListGroup.Item>
                            ) : (
                                data.map(item => (
                                    <ListGroup.Item key={_.uniqueId()} className="hstack gap-3">
                                        {React.createElement(children, { item: item })}
                                        <Button variant="danger" size="sm" disabled={data.length == 0} onClick={() => handleRemove(item.id)}>
                                            <FontAwesomeIcon icon={faTrash} />
                                        </Button>
                                    </ListGroup.Item>
                                ))
                            )
                        )
                    }
                </ListGroup>
            </div>
        </>
    )
}
