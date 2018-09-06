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

var aboutProfileCoverShadow = document.getElementById('about--profile-cover-shadow');

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
var aboutProfileCoverShadowVisible = false;
var hiddenProfile = false;
(function initStickyHeader() {

	TweenLite.to(headerHighlighter, 0.3, {left: headerButtons[HEADER_BUTTON_INDEX.HOME].offsetLeft, width: headerButtons[HEADER_BUTTON_INDEX.HOME].offsetWidth});
	TweenLite.to(headerButtonsClippedContainer, 0.3, {clip: "rect(0px, "+(headerButtons[HEADER_BUTTON_INDEX.HOME].offsetLeft + headerButtons[HEADER_BUTTON_INDEX.HOME].offsetWidth)+"px, 38px, "+headerButtons[HEADER_BUTTON_INDEX.HOME].offsetLeft+"px)"});

	content.onscroll = function() {

		// Hide profile picture at specified height
		if (content.scrollTop > 196) {
			if (!hiddenProfile) {
				hiddenProfile = true;
				TweenLite.to(about_profile_picture, 0.2, {transform: "translateY("+(-92 - about_profile_picture.offsetHeight)+"px)"});
			}
		} else if (hiddenProfile) {
			TweenLite.to(about_profile_picture, 0.2, {transform: "translateY(-92px)"});
			hiddenProfile = false;
		}

		// Slide header highlighter
		if (content.scrollTop < COVER_HEIGHT) {
			// Highlight home header button
			TweenLite.to(headerHighlighter, 0.3, {left: headerButtons[HEADER_BUTTON_INDEX.HOME].offsetLeft, width: headerButtons[HEADER_BUTTON_INDEX.HOME].offsetWidth});
			TweenLite.to(headerButtonsClippedContainer, 0.3, {clip: "rect(0px, "+(headerButtons[HEADER_BUTTON_INDEX.HOME].offsetLeft + headerButtons[HEADER_BUTTON_INDEX.HOME].offsetWidth)+"px, 38px, "+headerButtons[HEADER_BUTTON_INDEX.HOME].offsetLeft+"px)"});
		} else {
			for (var s = 0; s < scenes.length; s++) {
				var y = scenes[s].offsetTop;
				if (content.scrollTop < y + scenes[s].offsetHeight) {
					let index = s + 1
					TweenLite.to(headerHighlighter, 0.3, {left: headerButtons[index].offsetLeft, width: headerButtons[index].offsetWidth});
					TweenLite.to(headerButtonsClippedContainer, 0.3, {clip: "rect(0px, "+(headerButtons[index].offsetLeft + headerButtons[index].offsetWidth)+"px, 38px, "+headerButtons[index].offsetLeft+"px)"});
					break;
				}
			}
		}

		// Hide sticky header when at top of page
		if (content.scrollTop <= 0) {
			if (aboutProfileCoverShadowVisible) {
				stickyHeader.style.opacity = 0;
				aboutProfileCoverShadowVisible = false;
				aboutProfileCoverShadow.style.opacity = 0;
				setAddressBarAndTitle(HEADER_BUTTON_INDEX.HOME);
			}
			return; // Prevents sticky header from updating unnecessarily
		} else {
			if (content.scrollTop < COVER_HEIGHT ) {
				setAddressBarAndTitle(HEADER_BUTTON_INDEX.HOME);
			} else if (content.scrollTop < scenes[SCENE_INDEX.ABOUT + 1].offsetTop) {
				setAddressBarAndTitle(HEADER_BUTTON_INDEX.ABOUT);
			}
			if (!aboutProfileCoverShadowVisible) {
				stickyHeader.style.opacity = 1;
				aboutProfileCoverShadowVisible = true;
				aboutProfileCoverShadow.style.opacity = 0.4;
			}
		}

		// Update sticky header text - only runs if (content.scrollTop > 0) - see 'return' above
		for (var s = 0; s < scenes.length; s++) {
			let y = scenes[s].offsetTop;
			let h = scenes[s].offsetHeight;
			// Push sticky header out of the way
			if (content.scrollTop > y + h - stickyHeader.offsetHeight && content.scrollTop < y + h) {
				// ---- In push region
				let gap = (y + scenes[s].offsetHeight - stickyHeader.offsetHeight) - content.scrollTop;
				stickyHeader.style.transform = "translateY("+gap+"px)";
				updateStickyHeaderWithScene(s);
				break;
			} else if (content.scrollTop < y + scenes[s].offsetHeight) {
				// ---- Not in push region
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
		setAddressBarAndTitle(s+1);

		// apply special header if necessary - like event handlers
		if (headerIndexDisplayed == SCENE_INDEX.PROJECTS) {

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
		} else {
			// default to copying contents of scene's header
			stickyHeader.innerHTML = sceneHeaders[s].innerHTML;
		}
	}
}

function setAddressBarAndTitle(scene_index_by_header) {
	// Update the page title
	if (scene_index_by_header == HEADER_BUTTON_INDEX.HOME) {
		document.title = "Harxer";
	} else {
		document.title = "Harxer - " + SCENE_NAMES[scene_index_by_header].replace(/^\w/, c => c.toUpperCase());
	}
}


// ============================================================================================================= Footer Controls =====

footerContactLink.onmousedown = function() {
	document.getElementById('header-button-about').click();
};
