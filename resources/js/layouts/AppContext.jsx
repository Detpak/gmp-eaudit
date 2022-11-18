import React from "react";

export const appStates = {
    userData: null,
    toastMsg: { shown: false, msg: '' }
};

const AppContext = React.createContext(appStates);
export default AppContext;
