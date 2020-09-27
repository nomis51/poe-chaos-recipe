let selectedTabIndexes = [];
let config = {}
const rareItemTypes = ['ring', 'amulet', 'belt']

function writeMessage(msg) {
    document.getElementById('message').innerText = msg;
}

function fetchLeagues() {
    writeMessage('Retrieving leagues...')
    return new Promise((resolve) => {
        fetch('http://localhost:3000/leagues')
            .then(data => data.json())
            .then(leagues => {
                document.getElementById("select-leagues").innerHTML = leagues.reduce((acc, league) => acc += `<option value="${league}">${league}</option>`, '')

                resolve();
                writeMessage('Retrieving leagues done!')
            });
    })
}

function fetchStashTabs() {
    writeMessage('Retrieving stash tabs...')
    return new Promise((resolve) => {
        fetch('http://localhost:3000/stash-tabs')
            .then(data => data.json())
            .then(tabs => {
                document.getElementById("stash-tabs").innerHTML = tabs.reduce((acc, tab) => acc += `<button type="button" class="btn btn-${selectedTabIndexes.indexOf(tab.index) !== -1 ? 'success' : 'secondary'} stash-tab" id="stash-tab-${tab.index}" onclick="onTabSelected(${tab.index})">${tab.name}</button>`, '');

                resolve();
                writeMessage('Retrieving stash tabs done!')
            });
    })
}

function thresholdStyle(count, isRareItemType = false) {
    const quarter = config.threshold / (isRareItemType ? 2 : 4),
        half = config.threshold / (isRareItemType ? 1 : 2);

    if (count < quarter || count === 0) {
        return 'threshold-very-low'
    } else if (count < half) {
        return 'threshold-low'
    } else if (count < half + quarter) {
        return 'threshold-medium'
    } else if (count < config.threshold) {
        return 'threshold-high'
    } else {
        return 'threshold-very-high'
    }
}

function fetchChaosRecipe() {
    writeMessage('Computing items for chaos recipe...')
    fetch('http://localhost:3000/chaos-recipe')
        .then(data => data.json())
        .then(result => {
            let html = '<div class="row">';

            for (let e in result) {
                if (e !== '_meta') {
                    html += `
                    <div class="col">
                        <div id="${e}" class="card ${thresholdStyle(result[e].totalCount, rareItemTypes.indexOf(e) !== -1)}">
                            <img class="card-img-top" src="./assets/${e}.svg" alt="">

                            <div class="card-body">
                                <p class="card-text">
                                ${result[e].totalCount}
                                </p>
                            </div>
                        </div>
                    </div>
                    `
                }
            }

            html += '</div>';

            document.getElementById('chaos-recipe').innerHTML = html;

            writeMessage('Computing items for chaos recipe done!')
        });
}

function fetchConfig() {
    writeMessage('Reading config...')
    return new Promise((resolve) => {
        fetch('http://localhost:3000/config')
            .then(data => data.json())
            .then(cfg => {
                config = cfg;
                selectedTabIndexes = config.tabs;
                injectConfig();
                writeMessage('Reading config done!')
                resolve();
            });
    })
}

function injectConfig() {
    document.getElementById('select-leagues').value = config.league;
    document.getElementById('account-name').value = config.accountName;
    document.getElementById('session-id').value = config.sessionId;
    document.getElementById('threshold').value = config.threshold;
    document.getElementById('refresh-interval').value = config.refreshInterval;
}

function onLeagueChange() {
    fetch('http://localhost:3000/league/' + document.getElementById("select-leagues").value, {
        method: 'POST',
    });
}

function onAccountNameChange() {
    fetch('http://localhost:3000/account/' + document.getElementById("account-name").value, {
        method: 'POST',
    });
}

function onSessionIdChange() {
    fetch('http://localhost:3000/sessionId/' + document.getElementById("session-id").value, {
        method: 'POST',
    });
}

function onThreasholdChange() {
    fetch('http://localhost:3000/threshold/' + document.getElementById("threshold").value, {
        method: 'POST',
    });
}

function onRefreshIntervalChange() {
    fetch('http://localhost:3000/refresh-interval/' + document.getElementById("refresh-interval").value, {
        method: 'POST',
    });
}

function onTabSelected(tabIndex) {
    const index = selectedTabIndexes.indexOf(tabIndex);

    if (index === -1) {
        selectedTabIndexes.push(tabIndex);
    } else {
        selectedTabIndexes.splice(index, 1)
    }

    document.getElementById('stash-tab-' + tabIndex).classList.toggle('btn-success');
    document.getElementById('stash-tab-' + tabIndex).classList.toggle('btn-secondary');

    fetch('http://localhost:3000/selected-tabs/', {
        method: 'POST',
        body: JSON.stringify({
            tabs: selectedTabIndexes
        }),
        headers: {
            "content-type": "application/json"
        }
    });
}

window.onload = function () {
    fetchLeagues()
        .then(() => {
            fetchConfig()
                .then(() => {
                    fetchStashTabs();
                    setTimeout(() => {
                        fetchChaosRecipe();
                        setInterval(fetchChaosRecipe, config.refreshInterval * 1000);
                    })
                })
        })
}