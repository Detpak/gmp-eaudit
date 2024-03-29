import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { TimeScale } from "chart.js";
import React from "react";
import { Button, Spinner } from "react-bootstrap";
import { showToastMsg } from "../utils";

export default class LoadingButton extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isLoading: false,
        };

        this.handledManually = this.props.isLoading != null;
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick() {
        if (!this.handledManually) {
            this.setState({
                isLoading: true
            });
        }

        if (this.props.onClick) {
            const result = this.props.onClick();

            if (!this.handledManually) {
                result.then((value) => {
                    this.setState({
                        isLoading: false,
                    });

                    if (this.props.afterLoading) {
                        this.props.afterLoading(value);
                    }
                })
                .catch((reason) => {
                    this.setState({
                        isLoading: false
                    });

                    showToastMsg(reason.message);
                    console.log(reason);
                });
            }
        }
    }

    render() {
        return (
            <Button
                type={this.props.type}
                variant={this.props.variant}
                size={this.props.size}
                disabled={this.props.disabled ? true : (this.handledManually ? this.props.isLoading : this.state.isLoading)}
                onClick={(this.handledManually ? this.props.isLoading : this.state.isLoading) ? null : ((this.props.onClick) ? this.handleClick : null)}
                className={this.props.className}
            >
                {
                    (this.handledManually ? this.props.isLoading : this.state.isLoading) ? (
                        // Show the spinner animation in loading state
                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className={this.props.children ? "me-1" : ''} />
                    ) : (
                        this.props.icon ?  (
                            <FontAwesomeIcon icon={this.props.icon} className={this.props.children ? "me-1" : ''} />
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
