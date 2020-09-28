const requestPromise = require('request-promise');
const { getConfig } = require('./config')

const STASH_ITEMS_URL = 'https://www.pathofexile.com/character-window/get-stash-items';
const CHARS_URL = 'https://www.pathofexile.com/character-window/get-characters'
const CHAR_ITEMS_URL = 'https://www.pathofexile.com/character-window/get-items'
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

async function fetchLastCharacter(sessionId) {
  const rawResponse = await requestPromise({
    uri: encodeURI(`${CHARS_URL}`),
    headers: {
      Cookie: `POESESSID=${sessionId}`
    }
  });

  const chars = JSON.parse(rawResponse);

  const league = getConfig().league;

  return chars.find(c => c.lastActive && c.league === league);
}

async function fetchCharacterItems(charName, accountName, sessionId) {
  const rawResponse = await requestPromise({
    uri: encodeURI(`${CHAR_ITEMS_URL}?realm=pc&accountName=${accountName}&character=${charName}`),
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
}

const fetchFromStashIndex = async (stashIndex, account, league, sessionId) => {
  const rawResponse = await requestPromise({
    uri: encodeURI(`${STASH_ITEMS_URL}?accountName=${account}&league=${league}&tabIndex=${stashIndex}`),
    headers: {
      Cookie: `POESESSID=${sessionId}`
    }
  });

  const { items: rawItems } = JSON.parse(rawResponse);

  const currentChar = await fetchLastCharacter(sessionId);
  const charItems = await fetchCharacterItems(currentChar.name, account, sessionId)

  return rawItems.map(rawItem => ({
    itemLevel: rawItem.ilvl,
    type: getTypeFrom(rawItem),
    identified: rawItem.identified,
    isRare: rawItem.frameType === RARE_FRAME_TYPE
  }))
    .concat(charItems);
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
