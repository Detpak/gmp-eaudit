import React from "react";
import { useEffect } from "react";
import { useReducer } from "react";
import { BrowserRouter } from "react-router-dom";
import httpRequest from "../api";
import { globalState } from "../app_state";
import { updateUserData } from "../utils";
import AdminLayout from "./AdminLayout";
import AppContext, { appStates, appStateReducer } from "./AppContext";
import ApproveCorrectiveActionLayout from "./ApproveCorrectiveActionLayout";
import AuditProcessLayout from "./AuditProcessLayout";
import CorrectiveActionMain from "./CorrectiveActionMain";

export default function App({ mode }) {
    useEffect(updateUserData, []);

    const layoutProvider = () => {
        switch (mode) {
            case 'audit':
                return <AuditProcessLayout />;
            case 'corrective_action':
                return <BrowserRouter><CorrectiveActionMain /></BrowserRouter>;
            case 'approve_ca':
                return <BrowserRouter><ApproveCorrectiveActionLayout /></BrowserRouter>;
            default:
                return <BrowserRouter><AdminLayout /></BrowserRouter>;
        }
    };

    return React.createElement(layoutProvider);
};
