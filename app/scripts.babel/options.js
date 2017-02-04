'use strict';
const nameEl = document.getElementById('name');

chrome.storage.local.get(null, function (local) {
	nameEl.value = local.nickname;
});

nameEl.onblur = () => {
	const nickname = nameEl.value;
	chrome.storage.local.set({nickname});
};