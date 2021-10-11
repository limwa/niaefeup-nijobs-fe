import React, { useCallback, forwardRef } from "react";
import { Autocomplete } from "@material-ui/lab";
import { Chip, TextField } from "@material-ui/core";
import useMultiOptionAutocompleteStyles from "./multiOptionAutocompleteStyle";
import clsx from "clsx";
import PropTypes from "prop-types";

const MultiOptionAutocomplete = forwardRef(
    ({
        label,
        placeholder,
        value,
        options,
        onChange,
        onBlur,
        error,
        getOptionLabel,
        chipWrapperProps,
        className,
        disabled,
    },
    ref) => {

        const valueRemover = useCallback((value) => (index) => (e) => {
            const clone = [...value];
            clone.splice(index, 1);
            onChange(e, clone);
        }, [onChange]);

        const onRemove = useCallback(valueRemover(value), [value]);

        const multiOptionAutocompleteClasses = useMultiOptionAutocompleteStyles();

        return (
            <div className={className}>
                <Autocomplete
                    multiple
                    id="tags-filled"
                    value={value}
                    options={options}
                    onChange={(e, val) => onChange(e, val)}
                    onBlur={onBlur}
                    disabled={disabled}
                    getOptionLabel={getOptionLabel}
                    renderTags={() => null}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            variant="standard"
                            margin="normal"
                            fullWidth
                            label={label}
                            placeholder={placeholder}
                            inputRef={ref}
                            error={!!error}
                            helperText={
                                `${error?.message || ""}`
                            }
                        />
                    )}
                />
                <div
                    {...chipWrapperProps}
                    className={clsx(
                        multiOptionAutocompleteClasses.chipListWrapper,
                        chipWrapperProps?.className)}
                >
                    {value.map((option, index) => (
                        <Chip
                            key={getOptionLabel(option)}
                            label={getOptionLabel(option)}
                            data-testid="chip-option"
                            size="medium"
                            onDelete={onRemove(index)}
                        />
                    ))}
                </div>
            </div>);
    });

MultiOptionAutocomplete.displayName = "MultiOptionAutocomplete";
MultiOptionAutocomplete.propTypes = {
    label: PropTypes.string.isRequired,
    placeholder: PropTypes.string.isRequired,
    value: PropTypes.arrayOf(PropTypes.string).isRequired,
    options: PropTypes.arrayOf(PropTypes.string).isRequired,
    onChange: PropTypes.func.isRequired,
    onBlur: PropTypes.func,
    getOptionLabel: PropTypes.func.isRequired,
    chipWrapperProps: PropTypes.any,
    className: PropTypes.any,
    error: PropTypes.any,
    disabled: PropTypes.bool,
    "error.messages": PropTypes.string,

};

export default MultiOptionAutocomplete;
