import { Modal } from "react-bootstrap";
import { useState } from "react";

export default function DescriptionModal({ msg }) {
    const [shown, setShown] = useState(false);

    return (
        <>
            {msg && msg.length > 0 ? (
                <a href="#" onClick={() => setShown(true)}>
                    <div className="text-truncate" style={{ maxWidth: 500 }}>{msg}</div>
                </a>
            ) : (
                "-"
            )}
            <Modal show={shown} onHide={() => setShown(false)}>
                <Modal.Header closeButton>
                    <Modal.Title></Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="text-multiline">
                        {msg}
                    </div>
                </Modal.Body>
            </Modal>
        </>
    )
}
