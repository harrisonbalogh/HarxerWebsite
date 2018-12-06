// Initializes scene switching header buttons

// ==================================================================================================================== Variables =====

// Color palette
var __color_background 		= "rgb(44,54,64)";
var __color_foreground 		= "rgb(255,255,255)"; // (234,236,238)
var __color_text          = "rgb(234,236,238)";
var __color_tonic 				= "rgb(0,102,153)";
var __color_mediant				= "rgb(0,119,180)";
var __color_dominant			= "rgb(51,153,204)";
var __color_accent				= "rgb(255,204,51)";
var __color_accent_backup	= "rgb(72,88,104)";

var headerHighlighter = document.getElementById('header--highlighter');

var content = document.getElementById('content');

var headerButtonsClippedContainer = document.getElementById('header--buttons-clipped');

var stickyHeader = document.getElementById('base--header-sticky');

var footerContactLink = document.getElementById('footer--label-contact');

// Scenes
var headerButtons = document.getElementById('header--buttons').children;
var headerButtonsClipped = document.getElementById('header--buttons-clipped').children;
let HEADER_BUTTON_INDEX = {
	HOME: 0,
	ABOUT: 1,
	PROJECTS: 2,
	PRODUCTS: 3,
	CONTACT: 4
}
var scenes = document.getElementsByClassName('content--scene');
var sceneHeaders = document.getElementsByClassName('scene-header');
var sceneDividers = document.getElementsByClassName('scene-divider');
let SCENE_INDEX = {
	ABOUT: 0,
	PROJECTS: 1,
	PRODUCTS: 2,
	CONTACT: 3
}
let SCENE_NAMES = ["home", "about", "projects", "products", "contact"];

var sceneChangeTimer;

document.getElementById("footer--label-dev").style.width = 0;

// ================================================================================================= Resizing Window Listener =========

window.onresize = function() {
	// Slide header highlighter
	if (content.scrollTop < COVER_HEIGHT) {
		// Highlight home header button
		TweenLite.set(headerHighlighter, {left: headerButtons[HEADER_BUTTON_INDEX.HOME].offsetLeft, width: headerButtons[HEADER_BUTTON_INDEX.HOME].offsetWidth});
		TweenLite.set(headerButtonsClippedContainer, {clip: "rect(0px, "+(headerButtons[HEADER_BUTTON_INDEX.HOME].offsetLeft + headerButtons[HEADER_BUTTON_INDEX.HOME].offsetWidth)+"px, 38px, "+headerButtons[HEADER_BUTTON_INDEX.HOME].offsetLeft+"px)"});
	} else {
		for (var s = 0; s < scenes.length; s++) {
			var y = scenes[s].offsetTop;
			if (content.scrollTop < y + scenes[s].offsetHeight) {
				let index = s + 1
				TweenLite.set(headerHighlighter, {left: headerButtons[index].offsetLeft, width: headerButtons[index].offsetWidth});
				TweenLite.set(headerButtonsClippedContainer, {clip: "rect(0px, "+(headerButtons[index].offsetLeft + headerButtons[index].offsetWidth)+"px, 38px, "+headerButtons[index].offsetLeft+"px)"});
				break;
			}
		}
	}
};


// ================================================================================================= Header Button Initialization =====

// Attach mouse handlers
var about_profile_picture = document.getElementById("about--profile-picture");
let COVER_HEIGHT = 274;
let PROFILE_PICTURE_TOP = 178;
(function initHeaderButtons() {
	for (var s = 0; s < headerButtons.length; s++) {

		var clickButton = function(s) {
			return function() {
				var y = (s == 0) ? 0 : (s == 1) ? COVER_HEIGHT : scenes[s-1].offsetTop;
				TweenLite.to(content, 0.6, {scrollTo: y});
			}
		}

		headerButtons[s].onclick = clickButton(s);
		headerButtonsClipped[s].onclick = clickButton(s);
	}
})();
var stickyHeaderVisible = false;
var stickyHeaderHighlightedIndex = 0;
var hiddenProfile = false;

// ================================================================================================= Sticky Header =====

(function initStickyHeader() {

	TweenLite.to(headerHighlighter, 0.3, {left: headerButtons[HEADER_BUTTON_INDEX.HOME].offsetLeft, width: headerButtons[HEADER_BUTTON_INDEX.HOME].offsetWidth});
	TweenLite.to(headerButtonsClippedContainer, 0.3, {clip: "rect(0px, "+(headerButtons[HEADER_BUTTON_INDEX.HOME].offsetLeft + headerButtons[HEADER_BUTTON_INDEX.HOME].offsetWidth)+"px, 38px, "+headerButtons[HEADER_BUTTON_INDEX.HOME].offsetLeft+"px)"});

	content.onscroll = function() {

		// Hide profile picture at specified height
		if (content.scrollTop > PROFILE_PICTURE_TOP) {
			if (!hiddenProfile) {
				hiddenProfile = true;
				TweenLite.to(about_profile_picture, 0.2, {transform: "translateY("+(-98 - about_profile_picture.offsetHeight)+"px)"});
			}
		} else if (hiddenProfile) {
			TweenLite.to(about_profile_picture, 0.2, {transform: "translateY(-92px)"});
			hiddenProfile = false;
		}

		// Slide header highlighter
		if (content.scrollTop < COVER_HEIGHT) {
			// Highlight home header button
			if (stickyHeaderHighlightedIndex != HEADER_BUTTON_INDEX.HOME) {
				TweenLite.to(headerHighlighter, 0.3, {left: headerButtons[HEADER_BUTTON_INDEX.HOME].offsetLeft, width: headerButtons[HEADER_BUTTON_INDEX.HOME].offsetWidth});
				TweenLite.to(headerButtonsClippedContainer, 0.3, {clip: "rect(0px, "+(headerButtons[HEADER_BUTTON_INDEX.HOME].offsetLeft + headerButtons[HEADER_BUTTON_INDEX.HOME].offsetWidth)+"px, 38px, "+headerButtons[HEADER_BUTTON_INDEX.HOME].offsetLeft+"px)"});
				setAddressBarAndTitle(HEADER_BUTTON_INDEX.HOME);
			}
			stickyHeaderHighlightedIndex = HEADER_BUTTON_INDEX.HOME;
		} else {
			for (var s = 0; s < scenes.length; s++) {
				var y = scenes[s].offsetTop;
				if (content.scrollTop < y + scenes[s].offsetHeight) {
					let index = s + 1
					if (stickyHeaderHighlightedIndex != index) {
						TweenLite.to(headerHighlighter, 0.3, {left: headerButtons[index].offsetLeft, width: headerButtons[index].offsetWidth});
						TweenLite.to(headerButtonsClippedContainer, 0.3, {clip: "rect(0px, "+(headerButtons[index].offsetLeft + headerButtons[index].offsetWidth)+"px, 38px, "+headerButtons[index].offsetLeft+"px)"});
						setAddressBarAndTitle(index);
					}
					stickyHeaderHighlightedIndex = index;
					break;
				}
			}
		}

		// Hide sticky header when at top of page
		if (content.scrollTop <= 0) {
			if (stickyHeaderVisible) {
				stickyHeader.style.opacity = 0;
				stickyHeaderVisible = false;
			}
			return; // Prevents sticky header from updating unnecessarily
		} else {
			if (!stickyHeaderVisible) {
				stickyHeader.style.opacity = 1;
				stickyHeaderVisible = true;
			}
		}

		// Update sticky header text - only runs if (content.scrollTop > 0) - see 'return' above
		for (var s = 0; s < scenes.length; s++) {
			let y = scenes[s].offsetTop;
			let h = scenes[s].offsetHeight;
			// Push sticky header out of the way
			if (content.scrollTop > y + h - stickyHeader.offsetHeight && content.scrollTop < y + h) {
				// ---- In displacement region
				let gap = (y + scenes[s].offsetHeight - stickyHeader.offsetHeight) - content.scrollTop;
				stickyHeader.style.transform = "translateY("+gap+"px)";
				updateStickyHeaderWithScene(s);
				break;
			} else if (content.scrollTop >= y && content.scrollTop < y + sceneDividers[s].offsetHeight) {
				// ---- In divider region
				stickyHeader.style.transform = "translateY("+(-stickyHeader.offsetHeight)+"px)";
				break;
			} else if (content.scrollTop < y + h) {
				// ---- In content region
				updateStickyHeaderWithScene(s);
				stickyHeader.style.transform = "translateY(0px)";
				break;
			}
		}
	};

})();
var headerIndexDisplayed = 0;
function updateStickyHeaderWithScene(s, override = false) {
	if (headerIndexDisplayed != s || override) { // prevent needless resetting innerHTML
		headerIndexDisplayed = s;

		// apply special header if necessary - like event handlers
		if (headerIndexDisplayed == SCENE_INDEX.PROJECTS) {

			if (selected.index == -1) {
				if (projectsHighlightedType !== undefined) {
					stickyHeader.innerHTML = "";
					var ul = document.createElement("ul");
					ul.className = "projects--header-content";
					stickyHeader.appendChild(ul);
					var li = document.createElement("li");
					li.innerHTML = projectsHighlightedType;
					li.onclick = highlightProjectTypes();
					ul.appendChild(li);
				} else {
					stickyHeader.innerHTML = "";
					var ul = document.createElement("ul");
					ul.className = "projects--header-content";
					stickyHeader.appendChild(ul);
					for (var i = 0; i < project_types.length; i++) {
						if (ul.innerHTML != "") {
							var divider = document.createElement("p");
							divider.innerHTML = " • ";
							ul.appendChild(divider);
						}
						var li = document.createElement("li");
						li.innerHTML = project_types[i].type;
						li.onclick = highlightProjectTypes(project_types[i].type);
						ul.appendChild(li);
					}
				}
			}

		} else {
			// default to copying contents of scene's header
			stickyHeader.innerHTML = sceneHeaders[s].innerHTML;
		}
	}
}

function setAddressBarAndTitle(scene_index_by_header) {
	// Update address bar
	var newurl = window.location.protocol + "//" + window.location.host;
	if (scene_index_by_header != HEADER_BUTTON_INDEX.HOME) {
		newurl += "/" + SCENE_NAMES[scene_index_by_header];
	}
	var newTitle = "Harxer";
	if (scene_index_by_header == HEADER_BUTTON_INDEX.PROJECTS && selected.index != -1) {
		newurl += "/" + selected.project.id;
		newTitle += " - " + selected.project.title;
	} else {
		newTitle += (scene_index_by_header == HEADER_BUTTON_INDEX.HOME ? "" : " - " + (SCENE_NAMES[scene_index_by_header].charAt(0).toUpperCase() + SCENE_NAMES[scene_index_by_header].slice(1)));
	}
	window.history.replaceState({path:newurl}, newTitle, newurl);
	document.title = newTitle; // In case the replace/push history state didn't update the page title.
}


// ============================================================================================================= Footer Controls =====

footerContactLink.onmousedown = function() {
	document.getElementById('header-button-about').click();
};

// ============================================================================================================ Quick Open Scene =====

// This is used when user enters www.harxer.com/projects[/id] into the address bar, it will jump
// the user to projects and, if specified, open a project.
function quickOpenScene() {

	var open = window.location.search.substr(1);
	if (open == "") return;

	if (open.substr(0,open.indexOf("=")) == "scene") {
		var sceneIndex = 0;
		SCENE_NAMES.forEach(function(scene) {
			if (open == "scene=" + scene) {
				// Simulate the clicking of the appropriate header button
				headerButtons[sceneIndex].click();
				// mouseDown_headerButton(sceneIndex, false)();
				return;
			}
			sceneIndex++;
		});
	}

	// if (open.substr(0,open.indexOf("=")) == "project") {
	// 	mouseDown_headerButton(PROJECTS_SCENE, false)();
	// 	if (projectsLoaded) {
	// 		selectProject(open.substr(open.indexOf("=")+1), undefined, false)();
	// 	} else {
	// 		console.log("Quick open project by id: " + open.substr(open.indexOf("=")+1));
	// 		initProjectOpen = {id: open.substr(open.indexOf("=")+1), historied: false};
	// 	}
	// }

}
quickOpenScene(); // <--- CALLED HERE


// The following is used when the user uses back or forward buttons:
// We don't want back and forward buttons to actually reload the page, simply navigate through the site.
// NOTE: When a popstate occurs, we don't want to push a new state, we want to replace a new state.
// So the navigation functions like selectProject and mouseDown_headerButton have optional arguments that
// default to true which cause a push state but can be passed a false value to perform a replaceState.
// If history is not to be affected, a null value can be sent to skip all history affects.

// window.onpopstate = function(event) {
//
// 	// Check if navigating to a specific scene
// 	var sceneIndex = 0;
// 	SCENE_NAMES.forEach(function(scene) {
// 		if (window.location.pathname == "/" + scene) {
// 			// Simulate the clicking of the appropriate header button
// 			mouseDown_headerButton(sceneIndex, false)();
// 			if (sceneIndex == PROJECTS_SCENE) {
// 				if (projectsLoaded) {
// 					selectProject(undefined, undefined, null)();
// 				} else {
// 					initProjectOpen = {id: undefined, historied: null};
// 				}
// 			}
// 			return;
// 		}
// 		sceneIndex++;
// 	});
//
// 	// Check if navigating to a specific project
// 	var projId = window.location.pathname.substr(10); // Assuming '/projects/'
// 	if (window.location.pathname.substr(0, 10) == "/projects/") {
// 		mouseDown_headerButton(PROJECTS_SCENE, null)();
// 		if (projectsLoaded) {
// 			selectProject(projId, undefined, false)();
// 		} else {
// 			initProjectOpen = {id: projId, historied: false};
// 		}
// 		return;
// 	}
// };
