'use strict';

// eslint hack
var _ = _;

/**
 * Create a random token to be used
 * @return {string} Random unique token
 */
function getRandomToken() {
	// E.g. 8 * 32 = 256 bits token
	const randomPool = new Uint8Array(32);
	crypto.getRandomValues(randomPool);
	let hex = '';
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
	const identity = { 'uid': getRandomToken(), nickname: getRandomNickname() };
	chrome.storage.local.set(identity);

	let syncStore = {};
	syncStore[identity.uid] = {'name': identity.nickname, tabs:{ inbound : []}};
	chrome.storage.sync.set(syncStore);
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
			chrome.tabs.update(tabs[0].id, {selected: true});
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
	chrome.storage.local.get(null, (local) => {
		chrome.storage.sync.get( local.uid, function(store) {
			store[ local.uid ].tabs.inbound = [];
			chrome.storage.sync.set(store, () => {
				// Success
			});
		});
	});
}

/**
 * Listen for new inbound URLs
 */
chrome.storage.onChanged.addListener((changes, areaName) => {
	chrome.storage.local.get(null, (local) => {
		console.log('change heard' + areaName);
		chrome.storage.sync.get( local.uid, function(store) {
			const urls = _.pluck( store[local.uid].tabs.inbound, 'url' );
			openTabs(urls);
			removeInboundTabs();
		});
	});
});


chrome.runtime.onInstalled.addListener(() => {
	chrome.storage.local.get(null, (local) => {
		if(typeof local.uid !== 'string') {
			newIdentity();
		}
		// if (typeof local.name !== 'string') {
		// 	var d =  { 'nickname': getRandomNickname() };
		// 	d=d;
		// }
	});
});