// Redirects if on mobile or desktop appropriately and initializes scene switching header buttons

// ============================================================================================================== Mobile Redirect =====

// Checks if user needs to be redirected to mobile site and does so if necessary...
// if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent)) {
// 	if (window.location != "http://m.harxer.com/" || window.location != "http://www.m.harxer.com/") {
// 		window.location = "http://www.m.harxer.com";
// 	}
// } else {
// 	if (window.location != "http://harxer.com/" || window.location != "http://www.harxer.com/") {
// 		window.location = "http://www.harxer.com";
// 	}
// }

(function quickOpenScene() {

	// Allows for www.harxer.com/projects to jump you to www.harxer.com with the projects tab open
	var openScene = window.location.search.substr(1);

	if (openScene == "scene=projects") {
		document.getElementById('header-button-projects').click();
		if (history.pushState) {
			// Removes the query for URL aesthetics
    	var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname;
    	window.history.pushState({path:newurl},'',newurl);
		}
	} else if (openScene == "scene=contact") {
		document.getElementById('header-button-contact').click();
		if (history.pushState) {
			// Removes the query for URL aesthetics
    	var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname;
    	window.history.pushState({path:newurl},'',newurl);
		}
	} else if (openScene == "scene=about") {
		document.getElementById('header-button-about').click();
		if (history.pushState) {
			// Removes the query for URL aesthetics
    	var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname;
    	window.history.pushState({path:newurl},'',newurl);
		}
	} else if (openScene == "scene=products") {
		document.getElementById('header-button-products').click();
		if (history.pushState) {
			// Removes the query for URL aesthetics
    	var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname;
    	window.history.pushState({path:newurl},'',newurl);
		}
	}
})();
