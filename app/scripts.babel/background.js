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
	const dict = ['Monkey', 'Cat', 'Dog', 'Horse', 'Rabbit', 'Squirrel', 'Owl', 'Deer', 'Hedgehog', 'Sheep', 'Fox'];
	const index = Math.round(Math.random()*10);
	return dict[index];
}

/**
 * Creates a new identity for this chrome instance.
 * @return {[type]} [description]
 */
function newIdentity() {
	const identity = { 'uid': getRandomToken() };
	chrome.storage.local.set(identity);

	let syncStore = {};
	syncStore[identity.uid] = {'name': identity.nickname, tabs:{ inbound : []}};
	chrome.storage.sync.set(syncStore);
}

// function safeGetSync (storageArea, key, callback) {
// 	if (storageArea === 'sync') {

// 	}
// }

chrome.storage.local.get(null, (local) => {
	if(typeof local.uid !== 'string') {
		newIdentity();
	}
	if (typeof local.name !== 'string') {
		var d =  { 'nickname': getRandomNickname() };
		d=d;
	}
});

function check() {
	chrome.storage.local.get(null, (local) => {
		chrome.storage.sync.get( local.uid, function(storage) {
			var urls = ( storage && storage.inbound ) ? storage.inbound : [];
			openTabs(urls);
		});
	});
}

/**
 * Open many urls
 * @param  {Array} urls
 */
function openTabs(urls) {
	urls.map(openTab);
}

/**
 * Open single url
 * @param  {string} url
 */
function openTab(url) {
	var tabURL = {
		url: url
	};
	var tab;

	if (typeof tab !== 'undefined' && (tab.url === '' || tab.url === 'chrome://newtab/' || tab.url === tabURL.url)) {
		chrome.tabs.update(null, tabURL);
	} else {
		chrome.tabs.create(tabURL);
	}
}

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

chrome.storage.onChanged.addListener((changes, areaName) => {
	chrome.storage.local.get(null, (local) => {
		console.log('change heard');
		chrome.storage.sync.get( local.uid, function(store) {
			const urls = _.pluck( store[local.uid].tabs.inbound, 'url' );
			openTabs(urls);
			removeInboundTabs();
		});
	});
});