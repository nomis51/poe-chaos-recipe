const express = require('express')
var bodyParser = require('body-parser')
const app = express()
app.use(bodyParser.json());
app.use('/', express.static('client'));

const port = 3000

const { getConfig, setConfig } = require('./services/config');
const { fetchActiveLeagues } = require('./services/active-leagues');
const { fetchStashTabs } = require('./services/stash-tabs');
const { fetchStashItems } = require('./services/stash-items')
const { aggregateChaosRecipe } = require('./services/chaos-recipe')

app.get('/stash-tabs', async (req, res) => {
    const { accountName, league, sessionId } = getConfig();
    const tabs = await fetchStashTabs(accountName, league, sessionId);
    res.send(tabs);
})

app.get('/chaos-recipe', async (req, res) => {
    const { tabs, accountName, league, sessionId } = getConfig();
    const items = await fetchStashItems(tabs, accountName, league, sessionId);
    res.send(aggregateChaosRecipe(items));
})

app.get('/leagues', async (req, res) => {
    const leagues = await fetchActiveLeagues();
    res.send(leagues);
})

app.post('/league/:league', (req, res) => {
    const { league } = req.params;

    if (league) {
        setConfig('league', league);
        return res.status(201).end();
    }

    return res.status(400).end();
});

app.post('/account/:accountName', (req, res) => {
    const { accountName } = req.params;

    if (accountName) {
        setConfig('accountName', accountName);
        return res.status(201).end();
    }

    return res.status(400).end();
})

app.post('/sessionId/:sessionId', (req, res) => {
    const { sessionId } = req.params;

    if (sessionId) {
        setConfig('sessionId', sessionId);
        return res.status(201).end();
    }

    return res.status(400).end();
})

app.post('/selected-tabs', (req, res) => {
    const { tabs } = req.body;

    if (tabs) {
        setConfig('tabs', tabs);
        return res.status(201).end();
    }

    return res.status(400).end();
})

app.post('/threshold/:threshold', (req, res) => {
    const { threshold } = req.params;

    if (threshold && !isNaN(Number.parseInt(threshold))) {
        setConfig('threshold', Number(threshold));
        return res.status(201).end();
    }

    return res.status(400).end();
})

app.post('/refresh-interval/:refreshInterval', (req, res) => {
    const { refreshInterval } = req.params;

    if (refreshInterval && !isNaN(Number.parseInt(refreshInterval))) {
        setConfig('refreshInterval', Number(refreshInterval));
        return res.status(201).end();
    }

    return res.status(400).end();
})

app.get('/config', (req, res) => {
    res.send(getConfig());
})

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`)
})