const requestPromise = require('request-promise');

const BASE_URL = 'https://www.pathofexile.com/character-window/get-stash-items';

exports.fetchStashTabs = async (account, league, sessionId) => {
  const rawResponse = await requestPromise({
    uri: encodeURI(`${BASE_URL}?accountName=${account}&league=${league}&tabs=1`),
    headers: {
      Cookie: `POESESSID=${sessionId}`
    }
  });

  const { tabs } = JSON.parse(rawResponse);

  return tabs.map(tab => ({
    id: tab.id,
    index: tab.i,
    name: tab.n,
  }));
};
