'use strict';
const destinationsEl = document.getElementById('destinations');
const myNameEl = document.getElementById('myName');
const statusEl = document.getElementById('status');
const settingsEl = document.getElementById('settings');

// eslint hack
let _ = _;

chrome.storage.sync.get(null, (store) => {
	chrome.storage.local.get(null, (local) => {
		_.keys(store).forEach( (key) => {
			// if (local.uid !== key) {
				let el = document.createElement('option');
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


function uiSuccess () {
	console.log('success!');
	statusEl.textContent = 'Sent!';
}

function uiDuplicate () {
	statusEl.textContent = 'Already sent.';
}

/**
 * Send tab to a uid
 * @param  {Object} tab Tab Object
 * @param  {String} uid Destination for tab to be sent to
 */
function sendTab(tab, uid) {
	chrome.storage.sync.get(uid, (store) => {

		// Check if tab is already inbound (by url)
		const existingUrls = _.map( store[ uid ].tabs.inbound, 'url');
		if ( _.includes(existingUrls, tab.url) ) {
			uiDuplicate();
		} else {
			store[uid].tabs.inbound.push( tab );

			chrome.storage.sync.set(store, () => {
				chrome.storage.sync.get(uid, (store) => {
					console.log('Store updated:', store);
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
    // onClick's logic
    link.addEventListener('click', (ev) => {
        handleSendClick(ev);
    });
    settingsEl.addEventListener('click', (ev) => {
    	chrome.runtime.openOptionsPage();
    })
});

