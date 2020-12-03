import React from "react";
import PropTypes from "prop-types";
import useForm from "../../../hooks/useForm";
import { yupResolver } from "@hookform/resolvers";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, makeStyles, TextField } from "@material-ui/core";
import RejectApplicationSchema, { Rules } from "./RejectApplicationSchema";


const useStyles = makeStyles((theme) => ({
    dialogActions: {
        padding: theme.spacing(2),
    },
}));

const ConfirmRejectDialog = ({ open, handleReject, cancelAction, rejectReason, setRejectReason }) => {

    const classes = useStyles();

    const handleRejectReasonChange = (e) => {
        setRejectReason(e.target.value);
    };

    const onSubmit = () => {
        handleReject();
    };

    const { register, handleSubmit, errors } = useForm({
        mode: "onChange",
        resolver: yupResolver(RejectApplicationSchema),
        reValidateMode: "onChange",
    });

    return (
        <Dialog
            disableBackdropClick={false}
            onClose={cancelAction}
            onClick={(e) => e.stopPropagation()} // Required so that a click does not trigger selecting of rows
            open={open}
        >
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogTitle id="form-dialog-title">Reject</DialogTitle>
                <DialogContent>
                    <DialogContentText>

                    In order to reject an Application, you need to provide a reject reason.
                    </DialogContentText>

                    <TextField
                        autoFocus
                        margin="dense"
                        id="rejectReason"
                        name="rejectReason"
                        inputRef={register}
                        label="Reject Reason"
                        multiline
                        fullWidth
                        onChange={handleRejectReasonChange}
                        value={rejectReason}
                        helperText={
                            `${rejectReason.length}/${Rules.REJECT_REASON.maxLength} \
                            ${errors.rejectReason?.message || " "}`
                        }
                        error={!!errors.rejectReason}
                    />
                </DialogContent>
                <DialogActions className={classes.dialogActions}>
                    <Button onClick={cancelAction}>Cancel</Button>
                    <Button
                        type="submit"
                        color="primary"
                        disabled={rejectReason === "" || Object.keys(errors).length !== 0}
                    >
                        Reject
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

ConfirmRejectDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    handleReject: PropTypes.func.isRequired,
    cancelAction: PropTypes.func.isRequired,
    rejectReason: PropTypes.string.isRequired,
    setRejectReason: PropTypes.func.isRequired,
};

export default ConfirmRejectDialog;
