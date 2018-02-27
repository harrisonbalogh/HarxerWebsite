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

// Allows for www.harxer.com/projects to jump you to www.harxer.com with the projects tab open.
function quickOpenScene() {

	var open = window.location.search.substr(1);
	if (open == "") return;

	var sceneIndex = 0;
	SCENE_NAMES.forEach(function(scene) {

		if (open == "scene=" + scene) {
			// Simulate the clicking of the appropriate header button
			mouseDown_headerButton(sceneIndex, false)();
			return;
		}

		sceneIndex++;
	});

	for (var p = 1; p < PROJECT.length; p++) {
		if (open == "project=" + PROJECT[p][FILE_NAME]) {
			mouseDown_headerButton(PROJECTS_SCENE, false)();
			selectProject(p, false)();
			return;
		}
	}
}
quickOpenScene();

// We don't want back and forward buttons to actually reload the page, simply navigate through the site.
// NOTE: When a popstate occurs, we don't want to push a new state, we want to replace a new state.
// So the navigation functions like selectProject and mouseDown_headerButton have optional arguments that
// default to true which cause a push state but can be passed a false value to perform a replaceState.
// If history is not to be affected, a null value can be sent to skip all history affects.
window.onpopstate = function(event) {

	var sceneIndex = 0;
	SCENE_NAMES.forEach(function(scene) {
		if (window.location.pathname == "/" + scene) {
			// Simulate the clicking of the appropriate header button
			mouseDown_headerButton(sceneIndex, false)();
			if (sceneIndex == PROJECTS_SCENE)
				selectProject(-1, null)();
			return;
		}

		sceneIndex++;
	});

	for (var p = 1; p < PROJECT.length; p++) {
		if (window.location.pathname == "/projects/" + PROJECT[p][FILE_NAME]) {
			mouseDown_headerButton(PROJECTS_SCENE, null)();
			selectProject(p, false)();
			return;
		}
	}
};
