const console = require('console');
const requestPromise = require('request-promise');

const BASE_URL = 'https://www.pathofexile.com/character-window/get-stash-items';
const RARE_FRAME_TYPE = 2;

const getTypeFrom = ({ icon }) => {
  if (/\/BodyArmours\//.test(icon)) return 'bodyArmour';
  if (/\/Helmets\//.test(icon)) return 'helmet';
  if (/\/Gloves\//.test(icon)) return 'glove';
  if (/\/Boots\//.test(icon)) return 'boot';
  if (/\/Belts\//.test(icon)) return 'belt';
  if (/\/Amulets\//.test(icon)) return 'amulet';
  if (/\/Rings\//.test(icon)) return 'ring';
  if (/\/OneHandWeapons\//.test(icon)) return 'oneHand';
  if (/\/TwoHandWeapons\//.test(icon)) return 'twoHand';

  return null;
};

const fetchFromStashIndex = async (stashIndex, account, league, sessionId) => {
  const rawResponse = await requestPromise({
    uri: encodeURI(`${BASE_URL}?accountName=${account}&league=${league}&tabIndex=${stashIndex}`),
    headers: {
      Cookie: `POESESSID=${sessionId}`
    }
  });

  const { items: rawItems } = JSON.parse(rawResponse);

  return rawItems.map(rawItem => ({
    itemLevel: rawItem.ilvl,
    type: getTypeFrom(rawItem),
    identified: rawItem.identified,
    isRare: rawItem.frameType === RARE_FRAME_TYPE
  }));
};

exports.fetchStashItems = async (stashIndexes, account, league, sessionId) => {
  if (!stashIndexes.length) {
    return [];
  }

  let stashItems = [];

  while (stashIndexes.length) {
    const newStashItems = await fetchFromStashIndex(stashIndexes.shift(), account, league, sessionId);
    stashItems = stashItems.concat(newStashItems);
  }

  return stashItems;
};
