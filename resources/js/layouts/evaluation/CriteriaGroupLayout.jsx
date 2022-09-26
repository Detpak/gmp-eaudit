import { faWarning } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { useRef } from "react";
import { Col, Form, OverlayTrigger, Row, Table, Tooltip } from "react-bootstrap";
import { OptionalSpan, RequiredSpan } from "../../components/LabelSpan";
import ListView from "../../components/ListView";
import SearchList from "../../components/SearchList";
import { rootUrl } from "../../utils";
import CommonView from "../CommonView";

function CriteriaGroupForm({ shown, handleChange, values, setValues, errors }) {
    const calculateTotalWeight = async (data) => {
        let weight = 0;

        for (const item of data) {
            weight += item.weight;
        }

        setValues({ ...values, weight: weight });
    };

    const handleDone = async (selectedItems) => {
        if (selectedItems.length == 0) {
            return;
        }

        const newCriteriaIds = new Set(values.criteria_ids);

        for (const id of selectedItems) {
            newCriteriaIds.add(id);
        }

        setValues({ ...values, criteria_ids: Array.from(newCriteriaIds) });
    };

    const handleRemove = (id) => {
        const newCriteriaIds = new Set(values.criteria_ids);
        newCriteriaIds.delete(`${id}`);
        setValues({ ...values, criteria_ids: Array.from(newCriteriaIds) });
    };

    const handleRemoveAll = () => {
        setValues({ ...values, criteria_ids: [] });
    }

    return (
        <>
            <Row>
                <Col>
                    <Form.Group className="mb-3">
                        <Form.Label>Code <RequiredSpan/></Form.Label>
                        <Form.Control type="text" name="code" value={values.code} onChange={handleChange} isInvalid={!!errors.code} />
                        <Form.Control.Feedback type="invalid">{errors.code}</Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Name <RequiredSpan/></Form.Label>
                        <Form.Control type="text" name="name" value={values.name} onChange={handleChange} isInvalid={!!errors.name} />
                        <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Remarks <OptionalSpan /></Form.Label>
                        <Form.Control as="textarea" name="remarks" rows={3} value={values.remarks} onChange={handleChange} isInvalid={!!errors.remarks} />
                        <Form.Control.Feedback type="invalid">{errors.remarks}</Form.Control.Feedback>
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group>
                        <Form.Label>Criteria(s) <RequiredSpan /></Form.Label>
                        <SearchList
                            height="200px"
                            placeholder="Add Criteria(s)..."
                            source={rootUrl('api/v1/fetch-criterias')}
                            onDone={handleDone}
                        >
                            {({ data }) => (
                                <div className="d-flex justify-content-between">
                                    {data.name}
                                    <small>{data.code} ({data.weight}%)</small>
                                </div>
                            )}
                        </SearchList>
                        <ListView
                            ids={values.criteria_ids}
                            fetchUrl={rootUrl('api/v1/get-criterias')}
                            onDoneLoading={calculateTotalWeight}
                            handleRemove={handleRemove}
                            handleRemoveAll={handleRemoveAll}
                        >
                            {({ item }) => {
                                return (
                                    <>
                                        <span className="me-auto text-truncate">{item.name}</span>
                                        <small>{item.code} ({item.weight}%)</small>
                                    </>
                                )
                            }}
                        </ListView>
                        <input type="hidden" name="weight" className={!!errors.criteria_ids || !!errors.weight ? 'is-invalid' : ''} value={values.weight} onChange={() => {}} />
                        <Form.Control.Feedback type="invalid">{errors.criteria_ids ? errors.criteria_ids : errors.weight}</Form.Control.Feedback>
                        <div className="mt-1">Total Weight: <span className={`fw-bold ${values.weight != 100 ? "text-danger" : "text-success"}`}>{values.weight}%</span></div>
                    </Form.Group>
                </Col>
            </Row>
        </>
    );
};

export default function CriteriaGroupLayout() {
    const initialValues = {
        code: '',
        name: '',
        remarks: '',
        criteria_ids: [],
        weight: 0,
    };

    return (
        <CommonView
            addNewItem={{
                name: "Add Group",
                form: CriteriaGroupForm,
                size: 'lg',
                action: rootUrl('api/v1/add-criteria-group'),
                initialValues: initialValues
            }}
            editItem={{
                name: "Edit Group",
                form: CriteriaGroupForm,
                size: 'lg',
                action: rootUrl('api/v1/edit-criteria-group'),
                fetchUrl: rootUrl('api/v1/get-criteria-group'),
                initialValues: { ...initialValues }
            }}
            deleteItemAction={rootUrl('api/v1/delete-criteria-group')}
            deleteSelectedItemAction={rootUrl('api/v1/delete-criteria-groups')}
            table={{
                canSelect: true,
                columns: [
                    {
                        id: 'code',
                        name: 'Code'
                    },
                    {
                        id: 'name',
                        name: 'Name'
                    },
                    {
                        id: 'remarks',
                        name: 'Remarks'
                    },
                    {
                        sortable: false,
                        id: 'active_cycle.cycle_id',
                        name: 'Active Cycle'
                    },
                    {
                        id: 'criterias_count',
                        name: 'Number of Criterias'
                    },
                    {
                        id: 'criterias_sum_weight',
                        name: 'Total Weight (%)'
                    },
                    {
                        sortable: false,
                        id: 'criterias',
                        name: 'Criterias',
                    }
                ],
                source: {
                    url: rootUrl('api/v1/fetch-criteria-groups'),
                    method: 'GET',
                    produce: item => [
                        item.code,
                        item.name,
                        item.remarks,
                        item.active_cycle.length > 0 ? item.active_cycle[0].cycle_id : '-',
                        item.criterias_count,
                        item.criterias_sum_weight != 100 ? (
                            <OverlayTrigger
                                placement="right"
                                overlay={(props) => (
                                    <Tooltip id="total-weight-tooltip" {...props}>
                                        Total weight <b>must</b> be 100%
                                    </Tooltip>
                                )}
                            >
                                <span className="fw-bold text-danger user-select-none">
                                    {item.criterias_sum_weight}% <FontAwesomeIcon icon={faWarning} />
                                </span>
                            </OverlayTrigger>
                        ) : (
                            <span className="fw-bold text-success user-select-none">
                                    {item.criterias_sum_weight}%
                            </span>
                        ),
                        <OverlayTrigger
                            placement="bottom"
                            overlay={(props) => (
                                <Tooltip id="criterias-tooltip" {...props}>
                                    {item.criterias.slice(0, 20).map((criteria, index) => (
                                        <div key={index}><span className="fw-bold">{criteria.name}</span> ({criteria.code})</div>
                                    ))}
                                    {item.criterias.length >= 20 && <div>...</div>}
                                </Tooltip>
                            )}
                        >
                            <span className="user-select-none">
                                {item.criterias.slice(0, 3).map(criteria => criteria.code).join(', ')}
                                {item.criterias.length >= 3 && " ..."}
                            </span>
                        </OverlayTrigger>
                    ]
                }
            }}
            messages={{
                onItemAdded: "Criteria Group successfully added!",
                onItemEdited: "Criteria Group successfully edited!",
                onItemDeleted: "Criteria Group successfully deleted!",
                onNoItemSelectedMsg: "Please select the criteria group to delete",
                onDeleteSelectedItemConfirmMsg: "Do you really want to delete the selected criteria group?",
                onSelectedItemDeletedMsg: "The selected criteria group successfully deleted!",
            }}
        />
    );
}
