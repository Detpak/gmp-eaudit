import { Route, Routes, useParams } from "react-router-dom";

function CorrectiveActionForm() {
    const params = useParams();

    return <h3>Finding ID: {params.findingId}</h3>
}

export default function CorrectiveActionMain() {
    return (
        <Routes>
            <Route path="/corrective-action/:findingId" element={<CorrectiveActionForm />} />
        </Routes>
    );
}
