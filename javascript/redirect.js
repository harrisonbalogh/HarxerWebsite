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

// This is used when user enters www.harxer.com/projects[/id] into the address bar, it will jump
// the user to the projects page and, if specified, open a project.
function quickOpenScene() {

	var open = window.location.search.substr(1);
	if (open == "") return;

	if (open.substr(0,open.indexOf("=")) == "scene") {
		var sceneIndex = 0;
		SCENE_NAMES.forEach(function(scene) {
			if (open == "scene=" + scene) {
				// Simulate the clicking of the appropriate header button
				mouseDown_headerButton(sceneIndex, false)();
				return;
			}
			sceneIndex++;
		});
	}

	if (open.substr(0,open.indexOf("=")) == "project") {
		mouseDown_headerButton(PROJECTS_SCENE, false)();
		initProjectOpen = open.substr(open.indexOf("=")+1)
		// selectProject(, undefined, false)();
	}

}
quickOpenScene(); // <--- CALLED HERE


// The following is used when the user uses back or forward buttons:
// We don't want back and forward buttons to actually reload the page, simply navigate through the site.
// NOTE: When a popstate occurs, we don't want to push a new state, we want to replace a new state.
// So the navigation functions like selectProject and mouseDown_headerButton have optional arguments that
// default to true which cause a push state but can be passed a false value to perform a replaceState.
// If history is not to be affected, a null value can be sent to skip all history affects.
window.onpopstate = function(event) {

	// Check if navigating to a specific scene
	var sceneIndex = 0;
	SCENE_NAMES.forEach(function(scene) {
		if (window.location.pathname == "/" + scene) {
			// Simulate the clicking of the appropriate header button
			mouseDown_headerButton(sceneIndex, false)();
			if (sceneIndex == PROJECTS_SCENE)
				initProjectOpen = null;
			// selectProject(-1, undefined, null)();
			return;
		}
		sceneIndex++;
	});

	// Check if navigating to a specific project
	var projId = window.location.pathname.substr(10); // Assuming '/projects/'
	if (window.location.pathname.substr(0, 10) == "/projects/") {
		mouseDown_headerButton(PROJECTS_SCENE, null)();
		// selectProject(projId, false)();
		initProjectOpen = projId;
		return;
	}
};
