'use strict';

var storage = { local: {}, sync: {} };

// eslint hack
var _ = _;

chrome.runtime.onInstalled.addListener(function (details) {
	console.log('previousVersion', details.previousVersion);

	// chrome.storage.sync.get('userid', function(items) {
	//     var userid = items.userid;
	//     if (userid) {
	//         useToken(userid);
	//     } else {
	//         userid = getRandomToken();

	//         chrome.storage.sync.set({userid: {}}, function() {
	//             useToken(userid);
	//         });
	//     }
	//     function useToken(userid) {
	//         // TODO: Use user id for authentication or whatever you want.
	//     }
	// });
});

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
	// E.g. db18458e2782b2b77e36769c569e263a53885a9944dd0a861e5064eac16f1a
	return hex;
}

/**
 * Pikcs a 'random' default nickname for this instance of chrome.
 * @return {string} Default Nickname
 */
function getRandomNickname() {
	var dict = ['Monkey', 'Cat', 'Dog', 'Horse', 'Rabbit', 'Squirrel', 'Owl', 'Deer', 'Hedgehog', 'Sheep', 'Fox'];
	var index = Math.round(Math.random() * 10);
	return dict[index];
}

function newIdentity() {
	var identity = { 'uid': getRandomToken(), 'nickname': getRandomNickname() };
	chrome.storage.local.set(identity);

	var syncStore = {};

	syncStore[identity.uid] = { 'name': identity.nickname, tabs: { inbound: [] } };
	debugger;
	chrome.storage.sync.set(syncStore);
}

chrome.storage.local.get(['uid', 'nickname'], function (local) {
	storage.local = local;

	if (typeof storage.local.uid !== 'string') {
		newIdentity();
	} else {}
});

function check() {
	chrome.storage.sync.get(storage.local.uid, function (storage) {
		var urls = storage && storage.inbound ? storage.inbound : [];
		openTabs(urls);
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
	chrome.storage.sync.get(storage.local.uid, function (store) {
		store[storage.local.uid].tabs.inbound = [];
		chrome.storage.sync.set(store, function () {

			chrome.storage.sync.get(storage.local.uid, function (store) {
				console.log('cleared inbound');
			});
		});
	});
}

chrome.storage.onChanged.addListener(function (changes, areaName) {
	console.log('change heard');
	chrome.storage.sync.get(storage.local.uid, function (store) {
		var urls = _.pluck(store[storage.local.uid].tabs.inbound, 'url');
		openTabs(urls);
		removeInboundTabs();
	});
});
// openTab('http://twitter.com')
// chrome.browserAction.setBadgeText({text: '\'Allo'});

// console.log('\'Allo \'Allo! Event Page for Browser Action');

// var storageSample = {
// 	123: {
// 		name: 'Matrix',
// 		tabs: {
// 			inbound: [
// 				{
// 					url: 'http: //google.com'
// 				}
// 			],
// 			suspended: [
// 				{
// 					url: 'http: //maps.google.com'
// 				}
// 			]
// 		}
// 	},
// 	234: {
// 		name: 'Matrixy',
// 		tabs: {
// 			inbound: [
// 				{
// 					url: 'http: //google.com'
// 				}
// 			],
// 			suspended: [
// 				{
// 					url: 'http: //maps.google.com'
// 				}
// 			]
// 		}
// 	}
// };

// chrome.storage.sync.set(storageSample, () => {});

// chrome.alarms.create({when: Date.now() + 2000});
// chrome.alarms.onAlarm.addListener(check);
//
//# sourceMappingURL=background.js.map
