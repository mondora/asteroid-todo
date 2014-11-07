chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	var Ceres = new Asteroid("localhost:3000");
	Ceres.subscribe("meteor.loginServiceConfiguration").ready.then(function () {
		Ceres.loginWithFacebook();
	});
});
