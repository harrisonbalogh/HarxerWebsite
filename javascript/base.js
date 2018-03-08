// Initializes scene switching header buttons

// ==================================================================================================================== Variables =====

// Color palette
var __color_background 		= "rgb(44,54,64)";
var __color_foreground 		= "rgb(234,236,238)";
var __color_text          = "rgb(234,236,238)";
var __color_tonic 				= "rgb(0,102,153)";
var __color_mediant				= "rgb(0,119,180)";
var __color_dominant			= "rgb(51,153,204)";
var __color_accent				= "rgb(255,204,51)";
var __color_accent_backup	= "rgb(72,88,104)";

var sceneButtons = document.getElementById('header--buttons').children;

var content = document.getElementById('content');
// Non-JS safeguard
content.style.left = "-200%";

var scene_dividers = [""]; // Offset the scene dividers since scene[0] has no divider
scene_dividers.push.apply(scene_dividers, document.getElementsByClassName('scene-divider'));

var scene_scroller_left = document.getElementById('scene-scroller-left');
var scene_scroller_right = document.getElementById('scene-scroller-right');

var footerContactLink = document.getElementById('footer--label-contact');

// Scenes
var ABOUT_SCENE = 0;
var CONTACT_SCENE = 1;
var HOME_SCENE = 2;
var PROJECTS_SCENE = 3;
var PRODUCTS_SCENE = 4;
var selectedScene = HOME_SCENE;
var SCENE_NAMES = ["about", "contact", "", "projects", "products"];
var sceneChangeTimer;

document.getElementById("footer--label-dev").style.width = 0;

// ================================================================================================= Resizing Window Listener =========

window.onresize = function() {
	// Notify other classes (scenes) that window has been resized
	homeRefit();
	projectsRefit();
};


// ================================================================================================= Header Button Initialization =====

var mouseDown_headerButton = function(scene, push = true) {
	return function() {
		// Update target header button
		TweenLite.to(sceneButtons[selectedScene].childNodes[0], 0.25, {color: __color_text});
		TweenLite.to(sceneButtons[selectedScene], 0.25, {backgroundColor: __color_background, cursor: "pointer"});
		// Update previous header button
		sceneButtons[scene].style.cursor = "default";
		TweenLite.to(sceneButtons[scene].childNodes[0], 0.25, {color: __color_background});
		TweenLite.to(sceneButtons[scene], 0.25, {backgroundColor: __color_foreground});
		// Update dividers
		if (selectedScene != 0) TweenLite.to(scene_dividers[selectedScene], 1, { transform: "translateX(0)"});
		if (scene != 0) TweenLite.to(scene_dividers[scene], 1, { transform: "translateX(-10px)"});
		// Set new scene target
		selectedScene = scene;
		// Update scene
		TweenLite.to(content, 1, {left: -100*selectedScene + "%"});
		// Stop draw clock on home scene and update unique header button image
		if (scene == HOME_SCENE) {
			canvasDrawing = true;
			sceneButtons[HOME_SCENE].style.backgroundImage = "url(/images/hxr-logo-active@2x.png)"
		} else {
			canvasDrawing = false;
			sceneButtons[HOME_SCENE].style.backgroundImage = "url(/images/hxr-logo@2x.png)"
		}
		// Update navigation buttons
		if (selectedScene == 0) {
			TweenLite.to(scene_scroller_left, 0.3, {opacity: 0, cursor: "default"});
		} else {
			scene_scroller_left.style.cursor = "pointer";
		}
		if (selectedScene == scene_dividers.length - 1) {
			TweenLite.to(scene_scroller_right, 0.3, {opacity: 0, cursor: "default"});
		} else {
			scene_scroller_right.style.cursor = "pointer";
		}
		// Update address bar
		if (history.pushState && push !== undefined) {
			var newurl = window.location.protocol + "//" + window.location.host + "/" + SCENE_NAMES[scene];
			var newTitle = "Harxer"
			if (scene == PROJECTS_SCENE && projectSelected != -1) {
				newurl += "/" + PROJECT[projectSelected][FILE_NAME];
				newTitle += " - " + PROJECT[projectSelected][DISPLAY_NAME];
			} else {
				newTitle += (scene == HOME_SCENE ? "" : " - " + (SCENE_NAMES[scene].charAt(0).toUpperCase() + SCENE_NAMES[scene].slice(1)));
			}
			if (push) {
				window.history.pushState({path:newurl}, newTitle, newurl);
			} else {
				window.history.replaceState({path:newurl}, newTitle, newurl);
			}
			document.title = newTitle; // In case the replace/push history state didn't update the page title.
		}
	};
};

var mouseEnter_headerButton = function(scene) {
	return function() {
		if (scene !== selectedScene) {
			TweenLite.to(sceneButtons[scene], 0.25, {backgroundColor: __color_accent_backup});
			TweenLite.to(sceneButtons[scene].childNodes[0], 0.25, {color: __color_accent});
			if (scene == HOME_SCENE)
				sceneButtons[HOME_SCENE].style.backgroundImage = "url(/images/hxr-logo-hover@2x.png)"
		}
	};
};
var mouseLeave_headerButton = function(scene) {
	return function() {
		if (scene !== selectedScene) {
			TweenLite.to(sceneButtons[scene], 0.25, {backgroundColor: __color_background});
			TweenLite.to(sceneButtons[scene].childNodes[0], 0.25, {color: __color_text});
			if (scene == HOME_SCENE)
				sceneButtons[HOME_SCENE].style.backgroundImage = "url(/images/hxr-logo@2x.png)"
		}
	};
};
// Attach mouse handlers
(function initSceneButtons() {
	for (var s = 0; s < sceneButtons.length; s++) {
		if (sceneButtons[s].getElementsByTagName("p").length > 0)
			sceneButtons[s].getElementsByTagName("p")[0].style.color = "var(--color-text)";

		sceneButtons[s].onclick 			= mouseDown_headerButton(s);
		sceneButtons[s].onmouseenter  = mouseEnter_headerButton(s);
		sceneButtons[s].onmouseleave  = mouseLeave_headerButton(s);
	}
})();

// ============================================================================================================= Footer Controls =====

footerContactLink.onmousedown = function() {
	document.getElementById('header-button-about').click();
};

// ================================================================================================== Scene Scroller Buttons Init =====

scene_scroller_left.onmouseenter = function() {
	if (selectedScene != 0) { // first scene
		TweenLite.to(scene_scroller_left, 0.3, {opacity: 1});
	}
};
scene_scroller_left.onmouseleave = function() {
	if (selectedScene != 0) { // first scene
		TweenLite.to(scene_scroller_left, 0.3, {opacity: 0});
	}
};
scene_scroller_left.onclick = function() {
	// Clicks next left scene by decrementing selected scene index. Bounded
	sceneButtons[Math.max(0, selectedScene-1)].click();
};
scene_scroller_right.onmouseenter = function() {
	if (selectedScene != sceneButtons.length - 1) { // last scene
		TweenLite.to(scene_scroller_right, 0.3, {opacity: 1});
	}
};
scene_scroller_right.onmouseleave = function() {
	if (selectedScene != sceneButtons.length - 1) { // last scene
		TweenLite.to(scene_scroller_right, 0.3, {opacity: 0});
	}
};
scene_scroller_right.onclick = function() {
	// Clicks next right scene by incrementing selected scene index. Bounded
	sceneButtons[Math.min(sceneButtons.length-1, selectedScene+1)].click();
};

// =============================================================================================== Initial Page Landing Animation =====

//REMOVE WHEN DONE TESTING
// document.getElementById('header-button-about').click();
