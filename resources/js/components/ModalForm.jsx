import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import _ from "lodash";
import React, { useEffect, useRef, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import LoadingButton from "./LoadingButton";
import $ from 'jquery';

// export default class ModalForm extends React.Component {
//     constructor(props) {
//         super(props);

//         this.state = {
//             isSubmitting: false,
//             values: this.props.initialValues,
//             errors: {}
//         };

//         this.handleSubmit = this.handleSubmit.bind(this);
//         this.handleChange = this.handleChange.bind(this);
//     }

//     componentDidUpdate() {
//         console.log('updated');
//     }

//     async handleSubmit(ev) {
//         ev.preventDefault();

//         this.setState({ isSubmitting: true });
//         const response = await axios.post(this.props.action, this.state.values, { headers: { 'Content-Type': 'application/json' } });

//         if (response.data.formError) {
//             const newErrors = {};

//             _.forOwn(response.data.formError, (value, key) => {
//                 newErrors[key] = value[0];
//             });

//             this.setState({ isSubmitting: false });
//             this.setState({ errors: newErrors });
//             return;
//         }

//         onClose();

//         if (this.props.submitBtn.afterSubmit) {
//             this.props.submitBtn.afterSubmit();
//         }

//         this.setState({ isSubmitting: false });
//     }

//     handleChange(ev) {
//         console.log('changed');
//         const target = ev.target;
//         const newState = { ...this.state.values };
//         newState[target.name] = target.value;
//         this.setState({ values: newState });
//     };

//     render() {
//         return (
//             <Modal show={this.props.show} onHide={this.props.onClose}>
//                 <Modal.Header closeButton>
//                     <Modal.Title>{this.props.title}</Modal.Title>
//                 </Modal.Header>
//                 <Form noValidate onSubmit={this.handleSubmit}>
//                     <Modal.Body>
//                         <fieldset disabled={this.state.isSubmitting}>
//                             {(() => {
//                                 const formProps = {
//                                     handleChange: this.handleChange,
//                                     values: this.state.values,
//                                     errors: this.state.errors,
//                                 };

//                                 return React.createElement(this.props.children, formProps);
//                             })()}
//                         </fieldset>
//                     </Modal.Body>
//                     <Modal.Footer>
//                         <Button variant="secondary" onClick={this.props.onClose}>Close</Button>
//                         <LoadingButton type="submit" variant="primary" icon={this.props.submitBtn.icon} isLoading={this.state.isSubmitting}>{this.props.submitBtn.name}</LoadingButton>
//                     </Modal.Footer>
//                 </Form>
//             </Modal>
//         );
//     }
// }

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
            axios.get(`${fetchUrl}/${editId}`)
                .then((response) => {
                    const newValues = {};

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
        newState[ev.target.name] = ev.target.type === 'checkbox' ?
            ev.target.checked : ev.target.value;
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
                            };

                            return React.createElement(children, formProps);
                        })()}
                    </fieldset>
                </Modal.Body>
                <Modal.Footer>
                    {onClose && <Button variant="secondary" onClick={onClose}>Close</Button>}
                    <LoadingButton type="submit" variant="primary" icon={submitBtn.icon} isLoading={isSubmitting}>{submitBtn.name}</LoadingButton>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}
