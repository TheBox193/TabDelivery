'use strict';
var destinationsEl = document.getElementById('destinations');
var myNameEl = document.getElementById('myName');
var statusEl = document.getElementById('status');

// eslint hack
var _ = _;

chrome.storage.sync.get(null, function (store) {
	chrome.storage.local.get(null, function (local) {
		_.keys(store).forEach(function (key) {
			if (local.uid !== key) {
				var el = document.createElement('option');
				el.textContent = store[key].name;
				el.value = key;
				destinationsEl.appendChild(el);
			} else {
				myNameEl.textContent = store[key].name;
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

function sendTab(tab, uid) {
	chrome.storage.sync.get(uid, function (store) {
		// const newStore = _.clone(store);

		// Check if tab is already inbound (by url)
		var urls = _.pluck(store[uid].tabs.inbound, 'url');
		if (_.contains(urls, tab.url)) {
			uiDuplicate();
		} else {

			var newInbound = _.clone(store[uid].tabs.inbound);
			newInbound.push(tab);

			store[uid].tabs.inbound = newInbound;
			chrome.storage.sync.set(store, function () {

				chrome.storage.sync.get(uid, function (store) {
					console.log(store);
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
});
//# sourceMappingURL=popup.js.map
