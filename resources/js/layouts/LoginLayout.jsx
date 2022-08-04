import React from 'react';
import { Formik } from 'formik';
import { Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRightToBracket } from '@fortawesome/free-solid-svg-icons';

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

export class LoginLayout extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            form: null
        };

        this.submitForm = this.submitForm.bind(this);
    }

    validateForm(values, props) {
        return axios.post('/api/v1/validate-login', values, { headers: { 'Content-Type': 'application/json' } })
            .then((response) => {
                let errors = {};

                for (const error in response.data) {
                    errors[error] = response.data[error][0];
                }

                return errors;
            });
    }

    submitForm(values) {

    }

    render() {
        return (
            <Container fluid>
                <Row>
                    <Col md={3} xl></Col>
                    <Col className="mt-4">
                        <Card>
                            <Card.Body className="p-4">
                                <Card.Title><h3>Login e-Audit</h3></Card.Title>
                                <Formik
                                    initialValues={{
                                        loginId: '',
                                        loginPassword: '',
                                    }}
                                    validateOnChange={false}
                                    validate={this.validateForm}
                                    onSubmit={this.submitForm}>
                                    {({
                                        handleSubmit,
                                        handleChange,
                                        isSubmitting,
                                        values,
                                        errors
                                    }) => (
                                        <Form noValidate onSubmit={(ev) => { handleSubmit(ev); this.setState({ form: ev.target }); }} action={rootUrl('')} method="post">
                                            <Form.Group className="mb-3" controlId="loginId">
                                                <Form.Label>ID</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="loginId"
                                                    value={values.loginId}
                                                    onChange={handleChange}
                                                    isInvalid={errors.loginId}/>
                                                <Form.Control.Feedback type="invalid">{errors.loginId}</Form.Control.Feedback>
                                            </Form.Group>
                                            <Form.Group className="mb-3" controlId="loginPassword">
                                                <Form.Label>Password</Form.Label>
                                                <Form.Control
                                                    type="password"
                                                    name="loginPassword"
                                                    defaultValue={values.loginPassword}
                                                    onChange={handleChange}
                                                    isInvalid={errors.loginPassword}/>
                                                <Form.Control.Feedback type="invalid">{errors.loginPassword}</Form.Control.Feedback>
                                            </Form.Group>
                                            <Button type="submit" disabled={isSubmitting}><FontAwesomeIcon icon={faRightToBracket} /> Login</Button>
                                        </Form>
                                    )}
                                </Formik>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3} xl></Col>
                </Row>
            </Container>
        );
    }
}

export default LoginLayout;
