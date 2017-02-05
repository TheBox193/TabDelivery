'use strict';

/**
 * Create a random token to be used
 * @return {string} Random unique token
 */

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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
	return _.sample(['Monkey', 'Cat', 'Dog', 'Horse', 'Rabbit', 'Squirrel', 'Owl', 'Deer', 'Hedgehog', 'Sheep', 'Fox', 'Lion', 'Penguin', 'Seal']);
}

/**
 * Creates a new identity for this chrome instance.
 * @return {[type]} [description]
 */
function newIdentity() {
	var identity = { 'uid': getRandomToken() };
	console.log('New Identity Created:', identity);
	chrome.storage.local.set(identity);

	var syncStore = {};
	syncStore[identity.uid] = { nickname: getRandomNickname(), tabs: { inbound: [] } };
	chrome.storage.sync.set(syncStore);
}

function getUID(fn) {
	chrome.storage.local.get('uid', function (local) {
		fn(_.get(local, 'uid'));
	});
}

function getStoreByUID(uid, fn) {
	chrome.storage.sync.get(uid, function (store) {
		fn(_.get(store, uid));
	});
}

function setStoreByUID(uid, obj) {
	var fn = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : function () {};

	chrome.storage.sync.set(_defineProperty({}, uid, obj));
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

function removeInboundTabs() {
	getUID(function (uid) {
		getStoreByUID(uid, function (store) {
			store.tabs.inbound = [];
			setStoreByUID(uid, store);
		});
	});
}

/**
 * Listen for new inbound URLs
 */
chrome.storage.onChanged.addListener(function (changes, areaName) {
	console.log('change heard in ' + areaName);
	getUID(function (uid) {
		if (areaName === 'sync' && _.keys(changes)[0] === uid) {
			getStoreByUID(uid, function (store) {
				var urls = _.map(store.tabs.inbound, 'url');
				openTabs(urls);
				removeInboundTabs();
			});
		}
	});
});

chrome.runtime.onMessage.addListener(function (message, MessageSender, sendResponse) {
	debugger;
	if (message.nickname) {
		(function () {
			var nickname = message.nickname;
			getUID(function (uid) {
				getStoreByUID(uid, function (store) {
					store.nickname = nickname;
					setStoreByUID(uid, store);
					sendResponse({ success: true });
				});
			});
		})();
	}
});

/**
 * Initial setup; Creates identity & corrects identities with no nickname
 */
chrome.runtime.onInstalled.addListener(function () {
	console.log('Init...');
	getUID(function (uid) {
		if (typeof uid !== 'string') {
			newIdentity();
		}
	});
});