import { useEffect, useState } from "react";
import { Dropdown, Form } from "react-bootstrap";
import { useIsMounted } from "../utils";

export default function DropdownList({ title }) {
    const [canFetch, setCanFetch] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [listData, setListData] = useState([]);
    const [search, setSearch] = useState('');
    const isMounted = useIsMounted();

    const fetchData = (searchKeyword, page, append) => {
        setLoading(true);

        const params = {
            search: searchKeyword,
            page: page,
            max: 8
        };

    };

    useEffect(() => {
        if (!isMounted.current) return;

        const timeout = setTimeout(() => {
            setCanFetch(true);
            setListData([]);
            fetchData(searchKeyword, page, append);
        }, 500);

        return () => clearTimeout(timeout);
    }, [isMounted, search])

    return (
        <Dropdown>
            <div className="d-grid gap-2">
                <Dropdown.Toggle>
                    {title}
                </Dropdown.Toggle>
            </div>

            <Dropdown.Menu className="w-100">
                <Dropdown.Header>
                    <Form.Control type="text" placeholder="Search" value={search} onChange={(ev) => setSearch(ev.target.value)} />
                </Dropdown.Header>
                <Dropdown.Item className="py-2">Test</Dropdown.Item>
                <Dropdown.Item className="py-2">Test</Dropdown.Item>
                <Dropdown.Item className="py-2">Test</Dropdown.Item>
            </Dropdown.Menu>
        </Dropdown>
    );
}
