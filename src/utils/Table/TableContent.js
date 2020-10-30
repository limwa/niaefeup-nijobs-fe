import React from "react";
import PropTypes from "prop-types";
import { TableBody, TableCell, Checkbox, TableRow, Collapse, Typography, Divider, makeStyles } from "@material-ui/core";
import { RowPropTypes } from "./PropTypes";
import useToggle from "../../hooks/useToggle";
import { ApplicationStateLabel } from "../../components/Review/Applications/ApplicationsReviewTableSchema";

const useStyles = makeStyles((theme) => ({
    rowDetails: {
        padding: theme.spacing(2),
    },
    payloadSection: {
        "&:not(:first-child)": {
            paddingTop: theme.spacing(2),
        },
        "&:not(:first-child) p:first-of-type": {
            paddingTop: theme.spacing(2),
        },
    },
}));

const generateTableCellFromField = (id, fieldId, fieldOptions, labelId) => {

    if (typeof fieldOptions.value === "function") {
        return fieldOptions.value();
    } else {
        return (
            <TableCell
                key={fieldId}
                id={id === 0 ? labelId : undefined}
                align={fieldOptions.align || "right"}
            >
                {fieldOptions.value}
            </TableCell>
        );
    }
};

const CompanyApplicationRow = ({
    rowKey, fields, payload, rowProps, handleSelect, isRowSelected, RowActions, submitUndoableAction, RowActionsProps,
}) => {
    const [open, toggleOpen] = useToggle(false);
    const labelId = `table-checkbox-${rowKey}`;

    const classes = useStyles();

    return (
        <>
            <TableRow
                hover
                role="checkbox"
                tabIndex={-1}
                onClick={(e) => handleSelect(e, rowKey)}
                key={rowKey}
                selected={isRowSelected(rowKey)}
            >
                <TableCell padding="checkbox">
                    <Checkbox
                        checked={isRowSelected(rowKey)}
                        inputProps={{ "aria-labelledby": labelId }}
                    />
                </TableCell>
                {Object.entries(fields).map(([fieldId, fieldOptions], i) => (
                    generateTableCellFromField(i, fieldId, fieldOptions, labelId)
                ))}
                {RowActions &&
                <RowActions
                    row={{ rowKey, fields, payload, ...rowProps }}
                    submitUndoableAction={submitUndoableAction}
                    isCollapseOpen={open}
                    toggleCollapse={toggleOpen}
                    {...RowActionsProps}
                />}

            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={Object.keys(fields).length + 2}>
                    <Collapse in={open} timeout="auto" unmountOnExit className={classes.rowDetails}>
                        <Typography variant="subtitle2">
                            {payload.email}
                        </Typography>
                        <div className={classes.payloadSection}>
                            <Typography variant="body1">
                            Motivation
                            </Typography>
                            <Typography variant="body2">
                                {payload.motivation}
                            </Typography>
                        </div>

                        {fields.state.value === ApplicationStateLabel.REJECTED &&
                            <div className={classes.payloadSection}>
                                <Divider/>
                                <Typography variant="body1">
                                    {`Reject Reason (Rejected at ${payload.rejectedAt})`}
                                </Typography>
                                <Typography variant="body2">
                                    {payload.rejectReason}
                                </Typography>
                            </div>
                        }
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
};

const TableContent = ({ rows, handleSelect, isRowSelected, RowActions, submitUndoableAction, RowActionsProps }) => (
    <TableBody>
        {Object.entries(rows).map(([key, { fields, payload, ...rowProps }]) => (
            <CompanyApplicationRow
                key={key}
                rowKey={key}
                fields={fields}
                payload={payload}
                rowProps={rowProps}
                handleSelect={handleSelect}
                isRowSelected={isRowSelected}
                RowActions={RowActions}
                submitUndoableAction={submitUndoableAction}
                RowActionsProps={RowActionsProps}
            />
        ))}
    </TableBody>
);

TableContent.propTypes = {
    rows: PropTypes.objectOf(RowPropTypes),
    RowActions: PropTypes.elementType,
    handleSelect: PropTypes.func.isRequired,
    isRowSelected: PropTypes.func.isRequired,
    submitUndoableAction: PropTypes.func,
};

export default TableContent;
