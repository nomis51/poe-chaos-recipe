const REQUERST_STATE_DONE = 4;
const REQUEST_STATUS_OK = 200

if (!window.httpGet) {
    window.httpGet = (url, callback) => {
        const http = new XMLHttpRequest();
        http.open('GET', url);
        http.send();
        http.onreadystatechange = function () {
            if (this.readyState === REQUERST_STATE_DONE) {
                console.log('here')
                if (this.status === REQUEST_STATUS_OK) {
                    callback(JSON.parse(http.responseText));
                } else {
                    callback(null, {
                        status: this.status,
                        message: this.statusText
                    });
                }
            }
        }
    }
}