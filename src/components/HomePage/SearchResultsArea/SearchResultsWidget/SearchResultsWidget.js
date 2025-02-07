import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import { Grid, Paper } from "@material-ui/core";

import useSearchResultsWidgetStyles from "./searchResultsWidgetStyles";
import { useDesktop } from "../../../../utils/media-queries";
import Offer from "../Offer/Offer";
import SearchResultsMobile from "./SearchResultsMobile";
import SearchResultsDesktop from "./SearchResultsDesktop";
import useComponentController from "../../../../hooks/useComponentController";
import useToggle from "../../../../hooks/useToggle";
import {
    disableOffer as disableOfferService,
    hideOffer as hideOfferService,
    enableOffer as enableOfferService,
} from "../../../../services/offerService";
import {
    adminEnableOffer,
    companyEnableOffer,
    disableOffer,
    hideOffer,
} from "../../../../actions/searchOffersActions";

export const SearchResultsControllerContext = React.createContext({});

const SearchResultsController = ({
    offersSearchError,
    offersLoading,
    offers,
    hideOffer,
    disableOffer,
    companyEnableOffer,
    adminEnableOffer,
}) => {

    const [selectedOfferIdx, setSelectedOfferIdx] = useState(null);

    // Reset the selected offer on every "loading", so that it does not show up after finished loading
    useEffect(() => {
        if (offersLoading) setSelectedOfferIdx(null);
    }, [offersLoading]);

    const handleDisableOffer = useCallback(({ offer, adminReason, onSuccess, onError }) => {
        disableOfferService(offer._id, adminReason).then(() => {
            disableOffer(selectedOfferIdx, adminReason);
            if (onSuccess) onSuccess();
        }).catch((err) => {
            if (onError) onError(err);
        });
    }, [disableOffer, selectedOfferIdx]);

    const handleHideOffer = useCallback(({ offer, addSnackbar, onError }) => {
        hideOfferService(offer._id)
            .then(() => {
                hideOffer(selectedOfferIdx);
                addSnackbar({
                    message: "The offer was hidden",
                    key: `${Date.now()}-hidden`,
                });
            })
            .catch((err) => {
                if (onError) onError(err);
            });
    }, [hideOffer, selectedOfferIdx]);

    const handleCompanyEnableOffer = useCallback(({ offer, addSnackbar, onError }) => {
        enableOfferService(offer._id)
            .then(() => {
                companyEnableOffer(selectedOfferIdx);
                addSnackbar({
                    message: "The offer was enabled",
                    key: `${Date.now()}-enabled`,
                });
            })
            .catch((err) => {
                if (onError) onError(err);
            });
    }, [companyEnableOffer, selectedOfferIdx]);

    const handleAdminEnableOffer = useCallback(({ offer, addSnackbar, onError }) => {
        enableOfferService(offer._id)
            .then(() => {
                adminEnableOffer(selectedOfferIdx);
                addSnackbar({
                    message: "The offer was enabled",
                    key: `${Date.now()}-enabled`,
                });
            })
            .catch((err) => {
                if (onError) onError(err);
            });
    }, [adminEnableOffer, selectedOfferIdx]);


    const noOffers = Boolean(offersSearchError || (!offersLoading && offers.length === 0));
    const [showSearchFilters, toggleShowSearchFilters] = useToggle(false);

    return {
        controllerOptions: {
            initialValue: {
                noOffers,
                offers,
                offersLoading,
                offersSearchError,
                selectedOfferIdx,
                setSelectedOfferIdx,
                handleDisableOffer,
                handleHideOffer,
                handleCompanyEnableOffer,
                handleAdminEnableOffer,
                showSearchFilters,
                toggleShowSearchFilters,
            },
        },
    };
};

export const SearchResultsWidget = React.forwardRef(({
    offers,
    offersLoading,
    offersSearchError,
    hideOffer,
    disableOffer,
    companyEnableOffer,
    adminEnableOffer,
}, ref) => {

    const classes = useSearchResultsWidgetStyles();

    const { ContextProvider, contextProviderProps } = useComponentController(
        SearchResultsController, {
            offers,
            offersLoading,
            offersSearchError,
            hideOffer,
            disableOffer,
            companyEnableOffer,
            adminEnableOffer,
        }, SearchResultsControllerContext);

    return (
        <ContextProvider {...contextProviderProps}>
            <Paper elevation={2} data-testid="Search Results Widget">
                <Grid
                    ref={ref}
                    className={classes.searchResults}
                    container
                    spacing={0}
                >
                    {!useDesktop() ?
                        <SearchResultsMobile />
                        :
                        <SearchResultsDesktop />
                    }
                </Grid>
            </Paper>
        </ContextProvider>
    );
});

// Needed because of ForwardRef usage
SearchResultsWidget.displayName = "SearchResultsWidget";
SearchResultsWidget.propTypes = {
    offers: PropTypes.arrayOf(PropTypes.instanceOf(Offer)),
    offersLoading: PropTypes.bool,
    offersSearchError: PropTypes.object,
    hideOffer: PropTypes.func,
    disableOffer: PropTypes.func,
    companyEnableOffer: PropTypes.func,
    adminEnableOffer: PropTypes.func,
};

const mapStateToProps = (state) => ({
    offers: state.offerSearch.offers,
    offersLoading: state.offerSearch.loading,
    offersSearchError: state.offerSearch.error,
});

const mapDispatchToProps = (dispatch) => ({
    hideOffer: (offerIdx) => dispatch(hideOffer(offerIdx)),
    disableOffer: (offerIdx, adminReason) => dispatch(disableOffer(offerIdx, adminReason)),
    companyEnableOffer: (offerIdx) => dispatch(companyEnableOffer(offerIdx)),
    adminEnableOffer: (offerIdx) => dispatch(adminEnableOffer(offerIdx)),
});

export default connect(mapStateToProps, mapDispatchToProps, null, { forwardRef: true })(SearchResultsWidget);
