'use strict';
const destinationsEl = document.getElementById('destinations');

// eslint hack
let _ = _;

chrome.storage.sync.get(null, (store) => {
	chrome.storage.local.get(null, (local) => {
		_.keys(store).forEach( (key) => {
			if (local.uid !== key) {
				let el = document.createElement('option');
				el.textContent = store[key].name;
				el.value = key;
				destinationsEl.appendChild(el);
			}
		});
	});
});


function uiSuccess () {
	console.log('success!');
}

function uiDuplicate () {
	console.log('duplicates');
}

function sendTab(tab, uid) {
	chrome.storage.sync.get(uid, (store) => {
		const newStore = _.clone(store);

		// storeGet

		// Check if tab is already inbound (by url)
		const urls = _.pluck( store[ uid ].tabs.inbound, 'url');
		if ( _.contains(urls, tab.url) ) {

			uiDuplicate();

		} else {

			const newInbound = _.clone( store[uid].tabs.inbound );
			newInbound.push( tab );

			store[ uid ].tabs.inbound = newInbound;
			chrome.storage.sync.set(store, () => {

				chrome.storage.sync.get(uid, (store) => {
					console.log(store);
					uiSuccess();
				});
			});
		}
	});
}

function handleSendClick () {
	chrome.tabs.getSelected(null, (tab) => {
		const outboundTab =_.pick(tab, ['url', 'title', 'favIconUrl']);
		sendTab(outboundTab, destinationsEl.value);
	});
}

document.addEventListener('DOMContentLoaded', () => {
    const link = document.getElementById('clicking');
    // onClick's logic below:
    link.addEventListener('click', (ev) => {
        handleSendClick(ev);
    });
});

