'use strict';

/**
 * Create a random token to be used
 * @return {string} Random unique token
 */

function getRandomToken() {
	// E.g. 8 * 32 = 256 bits token
	var randomPool = new Uint8Array(32);
	crypto.getRandomValues(randomPool);
	var hex = '';
	for (var i = 0; i < randomPool.length; ++i) {
		hex += randomPool[i].toString(16);
	}
	return hex;
}

/**
 * Pikcs a 'random' default nickname for this instance of chrome.
 * @return {string} Default Nickname
 */
function getRandomNickname() {
	return _.sample(['Monkey', 'Cat', 'Dog', 'Horse', 'Rabbit', 'Squirrel', 'Owl', 'Deer', 'Hedgehog', 'Sheep', 'Fox']);
}

/**
 * Creates a new identity for this chrome instance.
 * @return {[type]} [description]
 */
function newIdentity() {
	var identity = { 'uid': getRandomToken(), nickname: getRandomNickname() };
	console.log('New Identity Created:', identity);
	chrome.storage.local.set(identity);

	var syncStore = {};
	syncStore[identity.uid] = { 'nickname': identity.nickname, tabs: { inbound: [] } };
	chrome.storage.sync.set(syncStore);
}

function clearThings() {
	chrome.storage.local.clear({});
	chrome.storage.sync.clear({});
}

/**
 * Open single url
 * @param  {string} url
 */
function openTab(url) {
	// Split off anything after #
	var tabURL = {
		url: url.split('#')[0]
	};

	chrome.tabs.query(tabURL, function (tabs) {
		if (tabs.length) {
			chrome.tabs.update(tabs[0].id, { selected: true });
		} else {
			chrome.tabs.create(tabURL);
		}
	});
}

/**
 * Open many urls
 * @param  {Array} urls
 */
function openTabs(urls) {
	urls.map(openTab);
}

// function check() {
// 	chrome.storage.local.get(null, (local) => {
// 		chrome.storage.sync.get( local.uid, function(storage) {
// 			var urls = ( storage && storage.inbound ) ? storage.inbound : [];
// 			openTabs(urls);
// 		});
// 	});
// }

function removeInboundTabs() {
	chrome.storage.local.get(null, function (local) {
		chrome.storage.sync.get(local.uid, function (store) {
			store[local.uid].tabs.inbound = [];
			chrome.storage.sync.set(store, function () {
				// Success
			});
		});
	});
}

/**
 * Listen for new inbound URLs
 */
chrome.storage.onChanged.addListener(function (changes, areaName) {
	console.log('change heard in ' + areaName);
	chrome.storage.local.get(null, function (local) {
		if (areaName === 'local') {} else if (areaName === 'sync') {
			chrome.storage.sync.get(local.uid, function (store) {
				var urls = _.map(store[local.uid].tabs.inbound, 'url');
				openTabs(urls);
				removeInboundTabs();
			});
		}
	});
});

/**
 * Initial setup; Creates identity & corrects identities with no nickname
 */
chrome.runtime.onInstalled.addListener(function () {
	console.log('Init...');
	chrome.storage.local.get(null, function (local) {
		if (typeof local.uid !== 'string') {
			newIdentity();
		} else if (typeof local.nickname !== 'string') {
			chrome.storage.local.set({ 'nickname': getRandomNickname() });
		}
	});
});