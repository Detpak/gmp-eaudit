import _ from "lodash";
import React, { useEffect, useRef, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import LoadingButton from "./LoadingButton";
import httpRequest from "../api";

export default function ModalForm({ action, fetchUrl, initialValues, title, size, show, onClose, submitBtn, editId, children, closeButton }) {
    if (typeof(children) !== 'function') {
        throw new Error('The modal form children is not a function');
    }

    const formRef = useRef(null);
    const [isSubmitting, setSubmitting] = useState(false);
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (fetchUrl && show && editId) {
            setSubmitting(true);
            httpRequest.get(`${fetchUrl}/${editId}`)
                .then((response) => {
                    const newValues = { ...values };

                    // Fill the new values
                    for (const key in response.data) {
                        const val = response.data[key];
                        newValues[key] = (val == null) ? '' : val; // Set to empty if null
                    }

                    newValues['id'] = editId;

                    setValues(newValues);
                    setSubmitting(false);
                });
        }
    }, [show, fetchUrl, editId]);

    const handleExited = () => {
        const newValues = _.mapValues({...values}, (value, key) => '');
        setValues(newValues);
        setErrors({});
    };

    const handleSubmit = async (ev) => {
        ev.preventDefault();

        setSubmitting(true);
        const response = await httpRequest.post(action, values, { headers: { 'Content-Type': 'application/json' } });

        if (response.data.formError) {
            const newErrors = {};

            _.forOwn(response.data.formError, (value, key) => {
                newErrors[key] = value[0];
            });

            setSubmitting(false);
            setErrors(newErrors);
            return;
        }

        if (onClose) {
            onClose();
        }

        if (submitBtn.afterSubmit) {
            submitBtn.afterSubmit(response.data);
        }

        setSubmitting(false);
    };

    const handleChange = (ev) => {
        const newState = { ...values };
        newState[ev.target.name] = ev.target.type === 'checkbox' ? ev.target.checked : ev.target.value;
        setValues(newState);
    };

    return (
        <Modal show={show} size={size} backdrop="static" onHide={onClose} onExited={handleExited}>
            <Modal.Header closeButton={closeButton}>
                <Modal.Title className="fw-bold display-spacing">{title}</Modal.Title>
            </Modal.Header>
            <Form noValidate onSubmit={handleSubmit} ref={formRef}>
                <Modal.Body>
                    <fieldset disabled={isSubmitting}>
                        {(() => {
                            const formProps = {
                                shown: show,
                                handleChange: handleChange,
                                values: values,
                                setValues: setValues,
                                errors: errors,
                                isEdit: editId != null,
                            };

                            return React.createElement(children, formProps);
                        })()}
                    </fieldset>
                </Modal.Body>
                <Modal.Footer>
                    {onClose && <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>Close</Button>}
                    <LoadingButton type="submit" variant="primary" icon={submitBtn.icon} isLoading={isSubmitting}>{submitBtn.name}</LoadingButton>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}
