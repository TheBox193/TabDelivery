'use strict';

var destinationsEl = document.getElementById('destinations');
var myNameEl = document.getElementById('myName');
var statusEl = document.getElementById('status');
var settingsEl = document.getElementById('settings');

// eslint hack
var _ = _;

chrome.storage.sync.get(null, function (store) {
	chrome.storage.local.get(null, function (local) {
		_.keys(store).forEach(function (key) {
			// if (local.uid !== key) {
			var el = document.createElement('option');
			el.textContent = store[key].nickname;
			el.value = key;
			destinationsEl.appendChild(el);
			// }

			if (local.uid === key) {
				myNameEl.textContent = store[key].nickname;
			}
		});
	});
});

function uiSuccess() {
	console.log('success!');
	statusEl.textContent = 'Sent!';
}

function uiDuplicate() {
	statusEl.textContent = 'Already sent.';
}

/**
 * Send tab to a uid
 * @param  {Object} tab Tab Object
 * @param  {String} uid Destination for tab to be sent to
 */
function sendTab(tab, uid) {
	chrome.storage.sync.get(uid, function (store) {

		// Check if tab is already inbound (by url)
		var existingUrls = _.map(store[uid].tabs.inbound, 'url');
		if (_.includes(existingUrls, tab.url)) {
			uiDuplicate();
		} else {
			store[uid].tabs.inbound.push(tab);

			chrome.storage.sync.set(store, function () {
				chrome.storage.sync.get(uid, function (store) {
					console.log('Store updated:', store);
					uiSuccess();
				});
			});
		}
	});
}

function handleSendClick() {
	chrome.tabs.getSelected(null, function (tab) {
		var outboundTab = _.pick(tab, ['url', 'title', 'favIconUrl']);
		sendTab(outboundTab, destinationsEl.value);
	});
}

document.addEventListener('DOMContentLoaded', function () {
	var link = document.getElementById('clicking');
	// onClick's logic
	link.addEventListener('click', function (ev) {
		handleSendClick(ev);
	});
	settingsEl.addEventListener('click', function (ev) {
		chrome.runtime.openOptionsPage();
	});
});