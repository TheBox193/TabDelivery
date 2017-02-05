'use strict';

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
	return _.sample(['Monkey', 'Cat', 'Dog', 'Horse', 'Rabbit', 'Squirrel', 'Owl', 'Deer', 'Hedgehog', 'Sheep', 'Fox', 'Lion', 'Penguin', 'Seal']);
}

/**
 * Creates a new identity for this chrome instance.
 * @return {[type]} [description]
 */
function newIdentity() {
	const identity = { 'uid': getRandomToken() };
	console.log('New Identity Created:', identity);
	chrome.storage.local.set(identity);

	let syncStore = {};
	syncStore[identity.uid] = {nickname: getRandomNickname(), tabs:{ inbound : []}};
	chrome.storage.sync.set(syncStore);
}

function getUID(fn) {
	chrome.storage.local.get('uid', (local) => {
		fn( _.get(local, 'uid') );
	});
}

function getStoreByUID(uid, fn) {
	chrome.storage.sync.get( uid, (store) => {
		fn( _.get(store, uid) );
	});
}

function setStoreByUID(uid, obj, fn = () => {}) {
	chrome.storage.sync.set({[uid]: obj});
	fn();
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

function removeInboundTabs() {
	getUID( (uid) => {
		getStoreByUID( uid, (store) => {
			store.tabs.inbound = [];
			setStoreByUID(uid, store);
		});
	});
}

/**
 * Listen for new inbound URLs
 */
chrome.storage.onChanged.addListener((changes, areaName) => {
	console.log('change heard in ' + areaName);
	getUID( (uid) => {
		if (areaName === 'sync' && _.keys(changes)[0] === uid) {
			getStoreByUID( uid, function(store) {
				const urls = _.map( store.tabs.inbound, 'url' );
				openTabs(urls);
				removeInboundTabs();
			});
		}
	});
});

chrome.runtime.onMessage.addListener((message, MessageSender, sendResponse) => {
	debugger;
	if (message.nickname) {
		const nickname = message.nickname;
		getUID( (uid) => {
			getStoreByUID(uid, (store) => {
				store.nickname = nickname;
				setStoreByUID(uid, store);
				sendResponse({success: true});
			});
		});
	}
});

/**
 * Initial setup; Creates identity & corrects identities with no nickname
 */
chrome.runtime.onInstalled.addListener(() => {
	console.log('Init...');
	getUID( (uid) => {
		if(typeof uid !== 'string') {
			newIdentity();
		}
	});
});