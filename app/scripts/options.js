'use strict';

var nameEl = document.getElementById('name');

chrome.storage.local.get(null, function (local) {
	nameEl.value = local.nickname;
});

nameEl.onblur = function () {
	var nickname = nameEl.value;
	chrome.runtime.sendMessage(null, { nickname: nickname }, null, function (response) {
		console.log('success?');
	});
};