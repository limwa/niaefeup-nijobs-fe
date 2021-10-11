import { yupResolver } from "@hookform/resolvers/yup";
import {
    Box,
    CardContent,
    CardHeader,
    DialogContent,
    FormHelperText,
    Grid,
    TextField,
    makeStyles,
    FormControl,
    Typography,
    Collapse,
    Button,
    Slider,
    Checkbox,
    FormControlLabel,
    MenuItem,
    CircularProgress,
} from "@material-ui/core";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import React, { useCallback, useContext, useEffect } from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { useMobile } from "../../../utils/media-queries";
import CreateOfferSchema from "./CreateOfferSchema";
import useCreateOfferStyles from "./createOfferStyles";
import { CreateOfferConstants, defaultDates, parseRequestErrors } from "./CreateOfferUtils";
import { searchCities } from "../../../services/locationSearchService";

import "./editor.css";
import {
    FormatBold,
    FormatItalic,
    FormatListBulleted,
    FormatListNumbered,
    FormatUnderlined,
    LocationOn,
    KeyboardArrowDown,
    KeyboardArrowUp,
} from "@material-ui/icons";
import { Alert, Autocomplete, ToggleButton, ToggleButtonGroup } from "@material-ui/lab";
import { KeyboardDatePicker } from "@material-ui/pickers";
import { throttle } from "lodash";

import JobOptions from "../../utils/offers/JobOptions";
import { INITIAL_JOB_DURATION, JOB_MIN_DURATION, JOB_MAX_DURATION } from "../../../reducers/searchOffersReducer";
import MultiOptionAutocomplete from "../../utils/form/MultiOptionAutocomplete";
import useFieldSelector from "../../utils/offers/useFieldSelector";
import useTechSelector from "../../utils/offers/useTechSelector";
import { newOffer } from "../../../services/offerService";
import useSession from "../../../hooks/useSession";
import { RouterLink } from "../../../utils";
import { toggleLoginModal } from "../../../actions/navbarActions";
import { connect } from "react-redux";
import { Redirect } from "react-router-dom";
import MultiOptionTextField from "../../utils/form/MultiOptionTextField";

export const CreateOfferControllerContext = React.createContext();

export const CreateOfferController = () => {

    const session = useSession();

    const isAdmin = session.data?.isAdmin;
    const company = session.data?.company?._id;
    const companyUnfinishedRegistration = session.data?.company?.hasFinishedRegistration === false;
    const isLoggedIn = session.isLoggedIn;

    // eslint-disable-next-line no-unused-vars
    const { handleSubmit, formState: { errors }, control, setValue, getValues } = useForm({
        mode: "all",
        resolver: yupResolver(CreateOfferSchema),
        reValidateMode: "onChange",
        defaultValues: {
            title: "",
            publishDate: defaultDates.publishDate(),
            publishEndDate: defaultDates.publishEndDate(),
            jobDuration: [INITIAL_JOB_DURATION, INITIAL_JOB_DURATION + 1],
            jobStartDate: null,
            description: "",
            descriptionText: "",
            contacts: [{ value: "" }],
            isPaid: false,
            vacancies: "",
            // https://stackoverflow.com/questions/37427508/react-changing-an-uncontrolled-input
            jobType: "",
            fields: [],
            technologies: [],
            location: null,
            requirements: [],
            isHidden: false,
            owner: "",
        },
    });

    const fields = useWatch({ control });

    const { fields: requirements, append: appendRequirement, remove: removeRequirement } = useFieldArray({
        control,
        name: "requirements",
    });

    const { fields: contacts, append: appendContact, remove: removeContact } = useFieldArray({
        control,
        name: "contacts",
    });

    const [loading, setLoading] = React.useState(false);
    const [success, setSuccess] = React.useState(false);
    const [newOfferId, setNewOfferId] = React.useState();
    const [requestErrors, setRequestErrors] = React.useState({});

    const submit = useCallback(
        (data) => {
            setLoading(true);
            console.log(data);
            newOffer({
                ...data,
                vacancies: data.vacancies || undefined,
                contacts: data.contacts.map((val) => val.value),
                requirements: data.requirements.map((val) => (val, val.value)),
                owner: data.owner || company,
            })
                .then((obj) => {
                    setRequestErrors({});
                    setNewOfferId(obj._id);
                    setLoading(false);
                    setSuccess(true);
                })
                .catch((err) => {
                    const reqErrors = parseRequestErrors(err);
                    setRequestErrors(reqErrors);
                    setLoading(false);
                });
        },
        [company],
    );

    const DEFAULT_VALUE = { value: "" };

    return {
        controllerOptions: {
            initialValue: {
                submit: handleSubmit(submit),
                control,
                contacts,
                requirements,
                fields,
                errors,
                requestErrors,
                appendContact: () => appendContact(DEFAULT_VALUE),
                removeContact,
                appendRequirement: () => appendRequirement(DEFAULT_VALUE),
                removeRequirement,
                getValues,
                setValue,
                loading,
                success,
                newOfferId,
                setLoading,
                isAdmin,
                company,
                isLoggedIn,
                companyUnfinishedRegistration,
            },
        },
    };
};

// TODO MOVE THIS COMPONENT TO UTILS


const useStyles = makeStyles((theme) => ({
    editorToolbar: {
        marginBottom: theme.spacing(1),
    },
}));


const EditorToolbar = ({ editor, disabled }) => {

    const [formats, setFormats] = React.useState(() => []);
    const classes = useStyles();

    useEffect(() => {
        if (!editor) return;

        const toggleButtonsState = () => {
            const state = [];
            if (editor.isActive("bold")) state.push("bold");
            if (editor.isActive("italic")) state.push("italic");
            if (editor.isActive("underline")) state.push("underline");
            if (editor.isActive("bulletList")) state.push("bulletList");
            if (editor.isActive("orderedList")) state.push("orderedList");
            setFormats(state);
        };

        editor.on("transaction", toggleButtonsState);

        // eslint-disable-next-line consistent-return
        return () => {
            editor.off("transaction", toggleButtonsState);
        };
    }, [editor]);

    return (

        <div className={classes.editorToolbar}>
            <Box mr={1} display="inline">
                <ToggleButtonGroup size="small" value={formats} aria-label="text formatting">
                    <ToggleButton
                        value="bold"
                        aria-label="bold"
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        disabled={disabled}
                    >
                        <FormatBold fontSize="small" />
                    </ToggleButton>
                    <ToggleButton
                        value="italic"
                        aria-label="italic"
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        disabled={disabled}
                    >
                        <FormatItalic fontSize="small" />
                    </ToggleButton>
                    <ToggleButton
                        value="underline"
                        aria-label="underline"
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                        disabled={disabled}
                    >
                        <FormatUnderlined fontSize="small" />
                    </ToggleButton>
                </ToggleButtonGroup>
            </Box>
            <Box ml={1} display="inline">
                <ToggleButtonGroup size="small" value={formats} aria-label="text lists">
                    <ToggleButton
                        value="bulletList"
                        aria-label="bulletList"
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        disabled={disabled}
                    >
                        <FormatListBulleted fontSize="small" />
                    </ToggleButton>
                    <ToggleButton
                        value="orderedList"
                        aria-label="orderedList"
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        disabled={disabled}
                    >
                        <FormatListNumbered fontSize="small" />
                    </ToggleButton>
                </ToggleButtonGroup>
            </Box>
        </div>
    );
};

const TextEditor = ({ content, onChangeDescription, onChangeDescriptionText, error, helperText: additionalHelperText, disabled }) => {

    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            Placeholder.configure({
                placeholder: "Write a description for this offer. You can specify goals, project and daily work details, etc.",
            }),
        ],
        content,
        editable: true,
        editorProps: {

            attributes: {
                class: "editor", // Cannot use makeStyles with this since it won't update the class name on re-render :(
            },
        },
    });

    useEffect(() => {
        if (!editor) return;
        const updateFn = ({ editor }) => {
            onChangeDescription(editor.getHTML());
            onChangeDescriptionText(editor.view.state.doc.textContent);
        };
        editor.on("update", updateFn);

        // eslint-disable-next-line consistent-return
        return () => {
            editor.off("update", updateFn);
        };

    }, [editor, onChangeDescription, onChangeDescriptionText]);

    useEffect(() => {
        if (!editor) return;
        editor.setEditable(!disabled);
    }, [disabled, editor]);

    const helperText =
    `${editor?.view.state.doc.textContent.length}/${CreateOfferConstants.description.maxLength} ${additionalHelperText}`;

    return (
        <>
            {!!editor &&
            <FormControl margin="dense" fullWidth>
                <EditorToolbar editor={editor} disabled={disabled} />
                <EditorContent editor={editor} />
                <FormHelperText error={error}>
                    {helperText}
                </FormHelperText>
            </FormControl>
            }
        </>
    );
};


// Based on https://github.com/lodash/lodash/issues/4700#issuecomment-805439202
const asyncThrottle = (func, wait) => {
    const throttled = throttle((resolve, reject, args) => {
        func(...args).then(resolve).catch(reject);
    }, wait);
    return (...args) =>
        new Promise((resolve, reject) => {
            throttled(resolve, reject, args);
        });
};


// Maybe move this to utils
const LocationPicker = ({ name, value, onChange, onBlur,  error, disabled }) => {
    const [inputValue, setInputValue] = React.useState("");
    const [options, setOptions] = React.useState([]);
    const [loading, setLoading] = React.useState(false);

    const fetchCitiesThrottled = useCallback(
        asyncThrottle(searchCities, 1500),
        [],
    );

    const parseCustomLocation = useCallback(
        (loc) => loc.trimStart() || null,
        []
    );

    const parsePresetLocation = useCallback(
        (loc) => `${loc.city}, ${loc.country}`,
        []
    );

    const isCustomLocation = useCallback(
        (loc) => typeof loc === "string",
        []
    );

    const parseNewLocation = useCallback(
        (location) => {
            let value;

            if (!location) {
                value = location;
            } else {
                value = isCustomLocation(location)
                    ? parseCustomLocation(location)
                    : parsePresetLocation(location);
            }
            return value;
        },
        [parseCustomLocation, parsePresetLocation, isCustomLocation]
    );

    useEffect(() => {

        if (inputValue === "") {
            setOptions(value ? [value] : []);
            return undefined;
        }
        if (inputValue.length < 3) return undefined;

        setLoading(true);
        fetchCitiesThrottled(inputValue)
            .then((results) => {
                setLoading(false);
                let newOptions = [];

                if (value) {
                    newOptions = [value];
                }

                if (results) {
                    newOptions = [...newOptions, ...results];
                }

                setOptions(newOptions);

            })
            .catch(() => {
                setLoading(false);
                setOptions(value);
            });

        return undefined;

    }, [value, inputValue, fetchCitiesThrottled]);

    return (
        <Autocomplete
            getOptionLabel={(option) => parseNewLocation(option)}
            filterOptions={(x) => x}
            options={options}
            autoComplete
            autoSelect
            includeInputInList
            filterSelectedOptions
            freeSolo
            loading={loading}
            value={value}
            inputValue={inputValue}
            name={name}
            disabled={disabled}
            onBlur={onBlur}
            onChange={(e, newValue) => {
                const value = parseNewLocation(newValue);
                setOptions(value ? [value, ...options] : options);
                onChange(e, value);
            }}
            onInputChange={(e, newInputValue) => {
                const value = newInputValue.trimStart();
                setInputValue(value);
            }}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="Choose a location" variant="outlined" fullWidth
                    error={!!error}
                    helperText={
                        `${error?.message || ""}`
                    }
                />
            )}
            renderOption={(option) => (
                option.city && option.country
                    ? (
                        <Grid container alignItems="center">
                            <Grid item>
                                <LocationOn />
                            </Grid>
                            <Grid item xs>
                                <Typography variant="body1">
                                    {`${option.city}, ${option.country}`}
                                </Typography>
                            </Grid>
                        </Grid>)
                    : <></>
            )}
        />
    );
};

const LoginAlert = React.forwardRef(({ isLoggedIn, companyUnfinishedRegistration, toggleLoginModal }, _) => (
    <>
        {!isLoggedIn &&
        <Box alignContent="flex-start">
            <Alert
                className={useCreateOfferStyles().loginAlert}
                severity="error"
                action={
                    <>
                        <Button
                            variant="text"
                            color="primary"
                            onClick={toggleLoginModal}
                        >
                    Login
                        </Button>
                        <Button
                            color="inherit"
                            size="small"
                            component={RouterLink}
                            to="/apply/company"
                        >
                    Join us
                        </Button>
                    </>
                }
            >
        The user must be logged in to create an offer
            </Alert>
        </Box>
        }
        {companyUnfinishedRegistration &&
        <Box alignContent="flex-start">
            <Alert
                severity="error"
                action={
                    <Button
                        color="inherit"
                        size="small"
                        component={RouterLink}
                        to="/company/registration/finish"
                    >
                Finish Registration
                    </Button>
                }
            >
            The company must finish their registration
            </Alert>
        </Box>
        }
    </>
));

LoginAlert.displayName = "LoginAlert";

const mapStateToProps = () => ({});

const mapDispatchToProps = (dispatch) => ({
    toggleLoginModal: () => dispatch(toggleLoginModal()),
});

const ConnectedLoginAlert = connect(mapStateToProps, mapDispatchToProps)(LoginAlert);


const CreateOfferForm = () => {

    const {
        submit,
        errors,
        requestErrors,
        control,
        fields,
        contacts,
        requirements,
        getValues,
        appendContact,
        removeContact,
        appendRequirement,
        removeRequirement,
        setValue,
        loading,
        success,
        newOfferId,
        isAdmin,
        isLoggedIn,
        companyUnfinishedRegistration,
    } = useContext(CreateOfferControllerContext);

    const isMobile = useMobile();

    const disabled = !isLoggedIn || companyUnfinishedRegistration;

    const [isAdvancedOpen, setAdvancedOpen] = React.useState(false);

    const isAdvancedOpenOrErrors = useCallback(() => (
        isAdvancedOpen ||
        !!errors.publishDate ||
        !!errors.publishEndDate ||
        !!errors.isHidden
    ), [errors.isHidden, errors.publishDate, errors.publishEndDate, isAdvancedOpen]);

    const Content = isMobile ? DialogContent : CardContent;
    const classes = useCreateOfferStyles(isMobile)();


    const FieldsSelectorProps = useFieldSelector(fields.fields, (fields) => setValue("fields", fields));
    const TechSelectorProps = useTechSelector(fields.technologies, (fields) => setValue("technologies", fields));

    return (

        success
            ? <Redirect to={`/offer/${newOfferId}`} push />
            :
            <div className={classes.formCard}>
                <CardHeader title={!isMobile && "New Offer" } />
                {
                    <Content className={classes.formContent}>
                        <ConnectedLoginAlert isLoggedIn={isLoggedIn} companyUnfinishedRegistration={companyUnfinishedRegistration} />
                        <Grid container className={classes.formArea}>
                            <Grid item xs={12}>
                                <form
                                    onSubmit={submit}
                                    aria-label="Create Offer Form"
                                >
                                    <Grid container>
                                        <Grid item xs={12} lg={isAdmin ? 6 : 12}>
                                            <Controller
                                                name="title"
                                                render={(
                                                    { field: { onChange, onBlur, ref, name, value } },
                                                ) => (
                                                    <TextField
                                                        name={name}
                                                        value={value}
                                                        label="Offer Title"
                                                        id="title"
                                                        error={!!errors.title || !!requestErrors.title}
                                                        inputRef={ref}
                                                        onBlur={onBlur}
                                                        onChange={onChange}
                                                        helperText={
                                                            `${value?.length}/${CreateOfferConstants.title.maxLength} 
                                                        ${errors.title?.message || requestErrors.title?.message || ""}`
                                                        }
                                                        variant="outlined"
                                                        margin="dense"
                                                        fullWidth
                                                        disabled={disabled}
                                                    />)}
                                                control={control}
                                            />
                                        </Grid>

                                        {isAdmin &&
                                        <Grid item xs={12} lg={6}>
                                            <Controller
                                                name="owner"
                                                render={(
                                                    { field: { onChange, onBlur, ref, name, value } },
                                                ) => (
                                                    <TextField
                                                        name={name}
                                                        value={value}
                                                        label="Owner ID"
                                                        id="owner"
                                                        error={!!errors.owner || !!requestErrors.owner}
                                                        inputRef={ref}
                                                        onBlur={onBlur}
                                                        onChange={onChange}
                                                        helperText={
                                                            `${errors.owner?.message || requestErrors.owner?.message || ""}`
                                                        }
                                                        variant="outlined"
                                                        margin="dense"
                                                        fullWidth
                                                        disabled={disabled}
                                                    />)}
                                                control={control}
                                            />
                                        </Grid>}

                                        <Grid item xs={12} lg={6}>
                                            <FormControl fullWidth margin="dense">
                                                <Controller
                                                    name="location"
                                                    render={(
                                                        { field: { onChange, onBlur, name, value } },
                                                    ) => (
                                                        <LocationPicker
                                                            value={value}
                                                            onChange={(_e, value) => onChange(value)}
                                                            onBlur={onBlur}
                                                            name={name}
                                                            error={errors.location || requestErrors.location}
                                                            disabled={disabled}
                                                        />
                                                    )}
                                                    control={control}
                                                />

                                            </FormControl>

                                        </Grid>
                                        <Grid item xs={12} lg={6}>
                                            <FormControl fullWidth margin="dense">

                                                <Controller
                                                    name="jobType"
                                                    render={(
                                                        { field: { onChange, onBlur, name, value } },
                                                    ) => (
                                                        <TextField
                                                            name={name}
                                                            fullWidth
                                                            id="job_type"
                                                            select
                                                            label="Job Type"
                                                            value={value ? value : ""}
                                                            onChange={onChange}
                                                            onBlur={onBlur}
                                                            variant="outlined"
                                                            disabled={disabled}
                                                            error={!!errors?.jobType || !!requestErrors.jobType}
                                                            helperText={
                                                                `${errors.jobType?.message || requestErrors.jobType?.message || ""}`
                                                            }
                                                        >
                                                            {JobOptions.map(({ value, label }) => (
                                                                <MenuItem
                                                                    key={value}
                                                                    value={value}
                                                                >
                                                                    {label}
                                                                </MenuItem>
                                                            ))}
                                                        </TextField>

                                                    )}
                                                    control={control}
                                                />

                                            </FormControl>
                                        </Grid>


                                        <Grid item xs={12} lg={6}>
                                            <Controller
                                                name="fields"
                                                render={(
                                                    { field: {  onBlur, name } },
                                                ) => (
                                                    <MultiOptionAutocomplete
                                                        name={name}
                                                        onBlur={onBlur}
                                                        error={errors.fields || requestErrors.fields}
                                                        disabled={disabled}
                                                        {...FieldsSelectorProps}
                                                    />
                                                )}
                                                control={control}
                                            />
                                        </Grid>
                                        <Grid item xs={12} lg={6}>
                                            <Controller
                                                name="technologies"
                                                render={(
                                                    { field: { onBlur, name } },
                                                ) => (
                                                    <MultiOptionAutocomplete
                                                        name={name}
                                                        onBlur={onBlur}
                                                        error={errors.technologies || requestErrors.technologies}
                                                        disabled={disabled}
                                                        {...TechSelectorProps}
                                                    />)}
                                                control={control}
                                            />

                                        </Grid>
                                        <Grid item xs={12} lg={6}>
                                            <FormControl>
                                                <Controller
                                                    name="jobStartDate"
                                                    render={(
                                                        { field: { onChange, onBlur, name, value } },
                                                    ) => (
                                                        <KeyboardDatePicker
                                                            margin="dense"
                                                            value={value}
                                                            label="Job Start Date"
                                                            id="startDate-input"
                                                            name={name}
                                                            onChange={(_, value) => onChange(value)}
                                                            onBlur={onBlur}
                                                            variant="inline"
                                                            autoOk
                                                            disabled={disabled}
                                                            format="yyyy-MM-dd"
                                                            minDate={Date.now()}
                                                            error={!!errors?.jobStartDate || !!requestErrors.jobStartDate}
                                                            helperText={
                                                                `${errors.jobStartDate?.message ||
                                                                    requestErrors.jobStartDate?.message || ""}`
                                                            }
                                                        />)}
                                                    control={control}
                                                />

                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={12} lg={6}>

                                            <Controller
                                                name="jobDuration"
                                                render={(
                                                    { field: { onChange, onBlur, name, value } },
                                                ) => (
                                                    <FormControl
                                                        margin="normal"
                                                        variant="outlined"
                                                    >
                                                        <Slider
                                                            name={name}
                                                            value={value}
                                                            onChange={(_e, values) => onChange(values)}
                                                            onBlur={onBlur}
                                                            valueLabelDisplay="auto"
                                                            aria-labelledby="range-slider"
                                                            min={JOB_MIN_DURATION}
                                                            max={JOB_MAX_DURATION}
                                                            disabled={disabled}
                                                        />

                                                        <FormHelperText>
                                                            {`Job duration: ${value[0]} - ${value[1]} month(s)`}
                                                        </FormHelperText>
                                                    </FormControl>)}
                                                control={control}
                                            />

                                        </Grid>

                                        <Grid item xs={12} lg={6}>
                                            <FormControl>
                                                <Controller
                                                    name="vacancies"
                                                    render={(
                                                        { field: { onChange, onBlur, name, ref, value } },
                                                    ) => (
                                                        <TextField
                                                            name={name}
                                                            value={value}
                                                            label="Vacancies"
                                                            id="vacancies"
                                                            disabled={disabled}
                                                            error={!!errors?.vacancies || !!requestErrors.vacancies}
                                                            helperText={
                                                                `${errors.vacancies?.message || requestErrors.vacancies?.message || ""}`
                                                            }
                                                            inputRef={ref}
                                                            onChange={(_e) => {
                                                                let value = _e.target.value.replace(/[^0-9]/g, "");
                                                                value = value ? Number.parseInt(value, 10) : "";
                                                                onChange(value);
                                                            }}
                                                            onBlur={onBlur}
                                                        />)}
                                                    control={control}
                                                />
                                            </FormControl>
                                        </Grid>

                                        <Grid item xs={12} lg={6}>
                                            <FormControl>
                                                <FormControlLabel
                                                    label="Paid Job"
                                                    disabled={disabled}
                                                    control={
                                                        <Controller
                                                            name="isPaid"
                                                            render={(
                                                                { field: { onChange, onBlur, name, value } },
                                                            ) => (
                                                                // TODO Add unspecified
                                                                <Checkbox
                                                                    checked={value}
                                                                    onChange={onChange}
                                                                    name={name}
                                                                    onBlur={onBlur}
                                                                    disabled={disabled}
                                                                />
                                                            )}
                                                            control={control}
                                                        />
                                                    }
                                                />
                                            </FormControl>
                                        </Grid>

                                        <Grid item xs={12} lg={12}>
                                            <Button
                                                onClick={() => setAdvancedOpen(!isAdvancedOpen)}
                                                size="small"
                                                margin="dense"
                                                style={{ marginTop: 10 }}
                                                endIcon={
                                                    isAdvancedOpenOrErrors()
                                                        ? <KeyboardArrowUp />
                                                        : <KeyboardArrowDown />}
                                            >
                                                <Typography>Advanced Settings</Typography>

                                            </Button>
                                        </Grid>
                                        <Grid item xs={12} lg={12}>
                                            <Collapse
                                                in={isAdvancedOpenOrErrors()}
                                            >
                                                <Grid container>
                                                    <Grid item xs={12} lg={6}>

                                                        <Controller
                                                            name="publishDate"
                                                            render={(
                                                                { field: { onChange, onBlur, name, value } },
                                                            ) => (
                                                                <KeyboardDatePicker
                                                                    margin="dense"
                                                                    value={value}
                                                                    label="Publication Date"
                                                                    id="publishDate-input"
                                                                    name={name}
                                                                    disabled={disabled}
                                                                    onChange={(_, value) => onChange(value)}
                                                                    onBlur={onBlur}
                                                                    variant="inline"
                                                                    autoOk
                                                                    format="yyyy-MM-dd"
                                                                    minDate={Date.now()}
                                                                    error={!!errors?.publishDate || !!requestErrors?.publishDate }
                                                                    helperText={errors.publishDate?.message ||
                                                                    requestErrors.publishDate?.message || ""}
                                                                />)}
                                                            control={control}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12} lg={6}>

                                                        <Controller
                                                            name="publishEndDate"
                                                            render={(
                                                                { field: { onChange, onBlur, name, value } },
                                                            ) => (
                                                                <KeyboardDatePicker
                                                                    margin="dense"
                                                                    value={value}
                                                                    label="Publication End Date"
                                                                    id="publishEndDate-input"
                                                                    name={name}
                                                                    disabled={disabled}
                                                                    onChange={(_, value) => {
                                                                        const date = new Date(value);
                                                                        date.setHours(23, 59, 59, 0);
                                                                        onChange(date);
                                                                    }}
                                                                    onBlur={onBlur}
                                                                    variant="inline"
                                                                    autoOk
                                                                    format="yyyy-MM-dd"
                                                                    minDate={fields.publishDate}
                                                                    error={!!errors?.publishEndDate || !!requestErrors.publishEndDate}
                                                                    helperText={errors.publishEndDate?.message ||
                                                                    requestErrors.publishEndDate?.message || ""}
                                                                />)}
                                                            control={control}
                                                        />
                                                    </Grid>

                                                    <Grid item xs={12} lg={6}>
                                                        <FormControlLabel
                                                            label="Hide offer"
                                                            disabled={disabled}
                                                            control={
                                                                <Controller
                                                                    name="isHidden"
                                                                    render={(
                                                                        { field: { onChange, onBlur, name, value } },
                                                                    ) => (
                                                                        <Checkbox
                                                                            checked={value}
                                                                            onChange={onChange}
                                                                            name={name}
                                                                            onBlur={onBlur}
                                                                            disabled={disabled}
                                                                        />
                                                                    )}
                                                                    control={control}
                                                                />
                                                            }
                                                        />
                                                    </Grid>
                                                </Grid>

                                            </Collapse>
                                        </Grid>
                                    </Grid>
                                    <MultiOptionTextField
                                        values={contacts}
                                        label="Contacts"
                                        itemLabel="Contact #"
                                        controllerName="contacts"
                                        onAdd={appendContact}
                                        onRemove={removeContact}
                                        getValues={getValues}
                                        control={control}
                                        errors={errors.contacts || requestErrors.contacts}
                                        disabled={disabled}
                                    />
                                    <MultiOptionTextField
                                        values={requirements}
                                        label="Requirements"
                                        itemLabel="Requirement #"
                                        controllerName="requirements"
                                        onAdd={appendRequirement}
                                        onRemove={removeRequirement}
                                        getValues={getValues}
                                        control={control}
                                        errors={errors.requirements || requestErrors.requirements}
                                        disabled={disabled}
                                        textFieldProps={{ multiline: true }}
                                    />

                                    <Controller
                                        name="descriptionText"
                                        render={(
                                            { field: { onChange: onChangeDescriptionText } },
                                        ) => (
                                            <Controller
                                                name="description"
                                                render={(
                                                    { field: { onChange: onChangeDescription } },
                                                ) => (
                                                    <TextEditor
                                                        onChangeDescription={onChangeDescription}
                                                        onChangeDescriptionText={onChangeDescriptionText}
                                                        error={!!errors?.descriptionText || !!requestErrors?.descriptionText}
                                                        content={fields.description}
                                                        helperText={errors.descriptionText?.message ||
                                                        requestErrors.descriptionText?.message || ""}
                                                        disabled={disabled}
                                                    />
                                                )}
                                                control={control}
                                            />
                                        )}
                                        control={control}
                                    />
                                    <Grid item xs={12} lg={12} />
                                    {requestErrors.generalErrors ?
                                        requestErrors.generalErrors.map((error, idx) => (
                                            <FormHelperText key={`${error.message}-${idx}`} error>
                                                {error.message}
                                            </FormHelperText>
                                        ))
                                        :
                                        <FormHelperText error={true}>
                                            {" "}
                                        </FormHelperText>
                                    }
                                    <Button
                                        disabled={loading || disabled}
                                        onClick={submit}
                                    >
                                Submit
                                    </Button>
                                    {loading &&
                                    <CircularProgress
                                        size={24}
                                        className={classes.finishProgress}
                                    />
                                    }
                                </form>
                            </Grid>
                        </Grid>
                    </Content>}
            </div>


    );
};

export default CreateOfferForm;
