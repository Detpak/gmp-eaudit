import { useEffect } from "react";
import { useState } from "react";
import { Form } from "react-bootstrap";

export function useFilter() {
    return {
        state: useState({ shouldFilter: false, mode: 'any' }),
        params: useState({}),
        sort: useState(null),
        entries: useState(20),
        page: useState(1),
    };
}

export default function FilterTable({ filter }) {
    const [state, setState] = filter.state;

    return (
        <>
            <Form.Check
                checked={state.shouldFilter}
                onChange={_ => setState({ ...state, shouldFilter: !state.shouldFilter })}
                className="me-2"
            />
            <Form.Group>
                <Form.Select
                    value={state.mode}
                    onChange={ev => setState({ ...state, mode: ev.target.value })}
                    disabled={!state.shouldFilter}
                >
                    <option value="any">Filter: Any</option>
                    <option value="match">Filter: Match</option>
                </Form.Select>
            </Form.Group>
        </>
    );
}
