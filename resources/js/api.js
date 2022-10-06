import axios from "axios";

const httpRequest = {
    rootUrl: '',
    checkToken: function (response) {
        console.log(response);
        if (response.data.result === 'invalid_token') {
            window.location.replace(this.rootUrl + 'deauth');
        }

        return response;
    },
    get: async function (url, data, config) {
        return this.checkToken(await axios.get(this.rootUrl + url, data, config));
    },
    post: async function (url, data, config) {
        return this.checkToken(await axios.post(this.rootUrl + url, data, config));
    }
};

export default httpRequest;
