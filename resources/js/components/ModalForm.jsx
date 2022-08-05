import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import _ from "lodash";
import React, { useReducer, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import LoadingButton from "./LoadingButton";

export default function ModalForm({ action, initialValues, title, show, onClose, submitBtn, children }) {
    if (typeof(children) !== 'function') {
        throw new Error('The modal form children is not a function');
    }

    const [isSubmitting, setSubmitting] = useState(false);
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});

    const handleSubmit = async (ev) => {
        ev.preventDefault();

        setSubmitting(true);
        const response = await axios.post(action, values, { headers: { 'Content-Type': 'application/json' } });

        if (response.data.formError) {
            const newErrors = {};

            _.forOwn(response.data.formError, (value, key) => {
                newErrors[key] = value[0];
            });

            setSubmitting(false);
            setErrors(newErrors);
            return;
        }

        onClose();

        if (submitBtn.afterSubmit) {
            submitBtn.afterSubmit();
        }

        setSubmitting(false);
    };

    const handleChange = (ev) => {
        const target = ev.target;
        const newState = { ...values };
        newState[target.name] = target.value;
        setValues(newState);
    };

    return (
        <Modal show={show} onHide={onClose}>
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Form noValidate onSubmit={handleSubmit}>
                <Modal.Body>
                    <fieldset disabled={isSubmitting}>
                        {(() => {
                            const formProps = {
                                handleChange: handleChange,
                                isSubmitting: isSubmitting,
                                values: values,
                                errors: errors,
                            };

                            return React.createElement(children, formProps);
                        })()}
                    </fieldset>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onClose}>Close</Button>
                    <LoadingButton type="submit" variant="primary" icon={submitBtn.icon} isLoading={isSubmitting}>{submitBtn.name}</LoadingButton>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}
