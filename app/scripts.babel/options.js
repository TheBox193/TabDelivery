'use strict';
const nameEl = document.getElementById('name');

chrome.storage.local.get(null, function (local) {
	nameEl.value = local.nickname;
});

nameEl.onblur = () => {
	const nickname = nameEl.value;
	chrome.runtime.sendMessage(null, {nickname}, null, (response) => {
		console.log('success?');
	})
};