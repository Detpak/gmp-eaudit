import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { TimeScale } from "chart.js";
import React from "react";
import { Button, Spinner } from "react-bootstrap";

export default class IndicatorButton extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isLoading: false
        };

        this.handleClick = this.handleClick.bind(this);
    }

    handleClick() {
        this.setState({
            isLoading: true
        });

        if (this.props.onClick) {
            this.props.onClick().then(() => {
                this.setState({
                    isLoading: false
                });
            });
        }
    }

    render() {
        return (
            <Button
                variant={this.props.variant}
                disabled={this.state.isLoading}
                onClick={this.state.isLoading ? null : this.handleClick}
                className={this.props.className}
            >
                {
                    this.state.isLoading ? (
                        // Show the spinner animation in loading state
                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-1" />
                    ) : (
                        this.props.icon ?  (
                            <FontAwesomeIcon icon={this.props.icon} className="me-1" />
                        ) : (
                            <></>
                        )
                    )
                }
                {this.props.children}
            </Button>
        )
    }
}
