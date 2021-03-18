/* istanbul ignore file */

import React from "react";

import { BrowserRouter, Switch } from "react-router-dom";
import HomePage from "./pages/HomePage";
import CompanyApplicationPage from "./pages/CompanyApplicationPage";
import ApplicationsReviewPage from "./pages/ApplicationsReviewPage";
import NotFound from "./pages/NotFound";
import ErrorPage from "./pages/ErrorPage";
import { ProtectedRoute, Route } from "./utils";
import PageLayout from "./components/PageLayout";
import CompanyOffersManagementPage from "./pages/CompanyOffersManagementPage";

const AppRouter = () => (
    <BrowserRouter basename={`${process.env.REACT_APP_BASE_ROUTE || "/"}`}>
        <Switch>
            <Route
                exact
                path="/"
            >
                <PageLayout showHomePageLink={false} forceDesktopLayout>
                    <HomePage />
                </PageLayout>
            </Route>
            <Route
                exact
                path="/apply/company"
            >
                <PageLayout pageTitle="Company Application">
                    <CompanyApplicationPage />
                </PageLayout>
            </Route>
            <ProtectedRoute
                exact
                path="/review/applications"
                unauthorizedRedirectPath="/"
                unauthorizedRedirectMessage="You are not allowed to access the applications review page."
                authorize={(user) => (user.isAdmin)}
            >
                <PageLayout pageTitle="Review Applications">
                    <ApplicationsReviewPage />
                </PageLayout>
            </ProtectedRoute>
            <Route
                exact
                path="/company/offers/manage"
                unauthorizedRedirectPath="/"
                unauthorizedRedirectMessage="You are not allowed to access the company offers management page."
                authorize={(user) => (user?.company)}
            >
                <PageLayout pageTitle="Manage Offers">
                    <CompanyOffersManagementPage />
                </PageLayout>
            </Route>
            <Route
                path="/error"
            >
                <PageLayout forceDesktopLayout pageTitle="Unexpected error">
                    <ErrorPage />
                </PageLayout>
            </Route>
            <Route>
                <PageLayout forceDesktopLayout pageTitle="Page not found">
                    <NotFound />
                </PageLayout>
            </Route>
        </Switch>
    </BrowserRouter>
);

export default AppRouter;
