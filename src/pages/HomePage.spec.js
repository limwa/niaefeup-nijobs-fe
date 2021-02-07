import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import HomePage from "./HomePage";
import MainView from "../components/HomePage/MainView";
import ProductDescription from "../components/HomePage/ProductPlacementArea/ProductDescription";
import SearchResultsWidget from "../components/HomePage/SearchResultsArea/SearchResultsWidget/SearchResultsWidget";
import {  ThemeProvider } from "@material-ui/core";
import { mountWithStore } from "../test-utils";
<<<<<<< HEAD
import useSession from "../hooks/useSession";
import AppTheme from "../AppTheme";

jest.mock("../hooks/useSession");

=======
>>>>>>> Added unit tests, changed the contactPage to contactSection and made it a functional component
import ContactSection from "../components/HomePage/ContactSection";

describe("HomePage", () => {
    const initialState = {
        offerSearch: {
            offers: [],
            searchValue: "searchValue",
            jobDuration: [1, 2],
            fields: [],
            techs: [],
        },
        navbar: {
            showLoginModal: false,
        },
    };
    describe("render", () => {

        useSession.mockImplementation(() => ({ isLoggedIn: false }));
        const wrapper = shallow(
            <ThemeProvider theme={AppTheme}>
                <HomePage/>
            </ThemeProvider>).find(HomePage).first().dive();

        it("should render MainView", () => {
            expect(wrapper.find(MainView).exists()).toBe(true);
        });

        it("should render ProductDescription", () => {
            expect(wrapper.find(ProductDescription).exists()).toBe(true);
        });

        it("should not render SearchResultsWidget", () => {
            expect(wrapper.find(SearchResultsWidget).exists()).toBe(false);
        });
        it("should render ContactSection", () => {
            expect(wrapper.find(ContactSection).exists()).toBe(true);
        });
    });
    describe("interaction", () => {
        it("should render search results after search submission", () => {

            // Simulate search request success
            fetch.mockResponse(JSON.stringify({ mockData: true }));

            const wrapper = mountWithStore(
                <Router>
                    <HomePage/>
                </Router>,
                initialState, AppTheme);

            // Currently jsdom does not know about scrollIntoView function, and thus, the code will break when submitting search
            // As a workaround, a stub is defined below, just for the code to not throw the error and actually test what matters
            window.HTMLElement.prototype.scrollIntoView = function() {};

            wrapper.find("form#search_form").first().simulate("submit", {
                preventDefault: () => {},
            });
            expect(wrapper.find(SearchResultsWidget).exists()).toBe(true);
        });
    });
});
