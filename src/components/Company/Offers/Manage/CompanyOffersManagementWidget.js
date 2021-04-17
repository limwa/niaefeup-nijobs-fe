import { Card, CardContent /* Typography */ } from "@material-ui/core";
import { format, parseISO } from "date-fns";
import React, { useState, useEffect } from "react";
import { fetchCompanyOffers } from "../../../../services/companyOffersService";
import ControlledSortableSelectableTable from "../../../../utils/Table/ControlledSortableSelectableTable";
import FilterableTable from "../../../../utils/Table/FilterableTable";
import { alphabeticalSorter, generateTableCellFromField } from "../../../../utils/Table/utils";
import { columns } from "./CompanyOffersManagementSchema";
import PropTypes from "prop-types";
import { OfferTitleFilter, PublishDateFilter, PublishEndDateFilter, LocationFilter } from "../Filters/index";
import { RowActions } from "../Actions";

const CompanyOffersNonFullfilledRequest = ({ isLoading, error }) => {
    if (isLoading) {
        return (
            <h1>Loading...</h1>
        );
    } else if (error) {
        return (
            <h1>
                {error.message}
            </h1>
        );
    } else {
        return null;
    }
};

const generateRow = ({ title, location }) => ({
    fields: {
        title: { value: title, align: "left" },
        publishStartDate: { value: format(parseISO((new Date()).toISOString()), "yyyy-MM-dd") },
        publishEndDate: { value: format(parseISO((new Date()).toISOString()), "yyyy-MM-dd") },
        location: { value: location },
    },
    payload: {

    },
});

const sorters = {
    title: alphabeticalSorter,
};

const filters = [
    { id: "offer-title-filter", render: OfferTitleFilter },
    { id: "publish-date-filter",
        render: PublishDateFilter,
        props: {
            onChange: (date, filtersContext, setFiltersContext) => {
                setFiltersContext((filtersContext) => ({ ...filtersContext, minDate: date }));
            },
        },
    },
    { id: "publish-end-date-filter",
        render: PublishEndDateFilter,
        props: {
            onChange: (date, filtersContext, setFiltersContext) => {
                setFiltersContext((filtersContext) => ({ ...filtersContext, minDate: date }));
            },
        },
    },
    { id: "location-filter", render: LocationFilter },
];

/*
const RowActions = () => (
    <Typography>Rows Actions</Typography>
);  */


const CompanyOffersManagementWidget = () => {
    const [offers, setOffers] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchCompanyOffers().then((offers) => {
            /* TODO: SHOULD NOT RUN WHEN COMPONENT IS UNMOUNTED: CANCEL PROMISE */
            const fetchedRows = offers.reduce((rows, row) => {
                rows[row.id] = generateRow(row);
                return rows;
            }, {});

            setOffers(fetchedRows);
            setIsLoading(false);
        }).catch((err) => {
            setError(err);
            setIsLoading(false);
        });
    }, []);

    const RowComponent = ({ rowKey, labelId }) => {
        const fields = offers[rowKey].fields;

        return (
            <>
                {Object.entries(fields).map(([fieldId, fieldOptions], i) => (
                    generateTableCellFromField(i, fieldId, fieldOptions, labelId)
                ))}
            </>
        );
    };

    RowComponent.propTypes = {
        rowKey: PropTypes.string.isRequired,
        labelId: PropTypes.string.isRequired,
    };

    return (
        <div>
            <Card>
                <CardContent>
                    {isLoading || error ?
                        <CompanyOffersNonFullfilledRequest isLoading={isLoading} error={error} />
                        :
                        <FilterableTable
                            title="Offers Management"
                            tableComponent={ControlledSortableSelectableTable}
                            defaultSort="title"
                            rows={offers}
                            setInitialRows={setOffers}
                            columns={columns}
                            sorters={sorters}
                            filters={filters}
                            RowActions={RowActions}
                            rowsPerPage={5}
                            stickyHeader
                            emptyMessage="No applications here."
                            context={{
                                // approveApplicationRow,
                                // rejectApplicationRow,
                            }}
                            RowComponent={RowComponent}
                        />
                    }
                </CardContent>
            </Card>
        </div>
    );
};

export default CompanyOffersManagementWidget;
