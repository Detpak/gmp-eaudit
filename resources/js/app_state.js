import { createGlobalState } from "react-hooks-global-state";

export const globalState = createGlobalState({
    userData: null,
    toastMsg: { shown: false, msg: "" }
});
