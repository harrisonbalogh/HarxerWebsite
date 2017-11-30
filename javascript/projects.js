// Populates projects "scene"

// =========================================================================================================== Projects Constants =====

// EXAMPLE: var projNameOne = PROJECT[1][FILE_NAME]
const FILE_NAME 		= 0;
const DISPLAY_NAME 	= 1;
const ARCHITECTURES = 2;
const DESCRIPTION 	= 3;
const PLATFORM 			= 4;
const UPDATED 		  = 5;
const IMAGE_COUNT 	= 6;
const VIDEO					= 7;
const GITLINK				= 8;

// FILE_NAME				DISPLAY_NAME								ARCHIECTURE(S)							DESCRIPTION		PLATFORM		UPDATED			IMAGE_COUNT  	VIDEO_ID	GITHUB
var PROJECT = [[],
	["website", 			"Website", 									"HTML5, Javascript, CSS", 	"descrip",		"WEB",			"10/5/16", 	18, 					"",							""],
	// ["helikopter", 		"Helicopter", 							"Java", 										"descrip",		"DESKTOP",	"10/5/16", 	1, 						""],
	["javaPhysics", 	"2D World Template", 				"Java", 										"descrip",		"DESKTOP",	"10/5/16", 	1, 						"",							"https://github.com/harrisonbalogh/java-2d-template"],
	["messenger",			"Messenger",								"Java", 										"descrip",		"DESKTOP",	"7/30/17", 	4, 						"lH9r2jlbAXE",	"https://github.com/harrisonbalogh/server-client-messenger"],
	["swiftPhysics",	"Physics Animator", 				"Swift",										"descrip",		"MOBILE", 	"7/29/17", 	7,						"CfA7l1JJYDc",	"https://github.com/harrisonbalogh/spriteKit-dynamicAnimations"],
	["pathing", 			"Pathing in 2D", 						"JavaScript", 							"descrip",		"WEB",			"7/29/17", 	3,						"BFeYEenAshg",	"https://github.com/harrisonbalogh/js-2d-pathing"],
	["munch", 				"Munch",										"Java",											"descrip",		"DESKTOP",	"10/5/16", 	6,						"",							""],
	["art", 					"Art Assets",								"_",												"descrip",		"UNIVERSAL","1/28/17", 	13,						"",							""],
	["collision", 		"2D Colliders",							"Java",											"descrip",		"DESKTOP",	"10/5/16", 	1,						"61Fctqe4ciA",	"https://github.com/harrisonbalogh/java-2d-colliders"],
	["earthMap", 			"Earth Map",								"Java",											"descrip",		"DESKTOP",	"10/5/16", 	1,						"MMTMMQx4eeo",	""]
];
//Whitespace tabs: &nbsp &nbsp

// ========================================================================================================== Variables =====

// Expanded container
const CONTAINER_EXPAND_HEIGHT = 416;
const CONTAINER_DESCRIP_HEIGHT = 180;

// These values are set to -1 if a project/image is not selected
var projectSelected = -1;
var imageSelected = -1;

// Image list dragging
var imageDragging = false;
var imageDragging_pX = null;
var imageDragging_velX = 0;
var DRAG_CLOCK_HZ = 10;
var DRAG_DECELERATION = 1;
var dragClockRunning = false;

// Project Icon Slideshow
var SLIDESHOW_TRANSITION_TIME = 1; // secs
var slideshowTransitionTimer;
var slideshowImage = 1;
var slideshowProject = -1;

// Used by image zoomer. Keeps track of last used browsing direction
var imageBrowseSelectionRight = true;

// ID References
var projects_containerList = document.getElementById('projects-container-list');
var projects_list_container = document.getElementById('projects-list-container');
var projects_list = document.getElementById('projects-list');
var projects_search = document.getElementById('projects-search');
var projects_header_title = document.getElementById('projects-header-title');
var projects_icon = [""];
var projects_iconCircle = [""];
var projects_icon_OuterCircle = [""];
var projects_containerExpanded = document.getElementById('projects-container-expanded');
var projects_expanded_title = document.getElementById('projects-expanded-title');
var projects_expanded_details = document.getElementById('projects-expanded-details');
var projects_expanded_container_image = document.getElementById('projects-expanded-imageContainer');
var projects_expanded_imageList = document.getElementById('projects-expanded-imageList');
var projects_expanded_description = document.getElementById('projects-expanded-description');
var projects_exapnded_description_gitLink = document.getElementById('projects-expanded-description-gitLink');
var projects_expanded_description_container = document.getElementById('projects-expanded-description-container');
var projects_expanded_description_expandButton = document.getElementById('projects-expanded-description-expandButton');
var projects_expanded_description_blur = document.getElementById('projects-expanded-description-blur');
var project_imageZoom_container = document.getElementById('project-imageZoom-container');
var project_imageZoom_cover = document.getElementById('project-imageZoom-cover');
var project_imageZoom_image = document.getElementById('project-imageZoom-image');
var project_imageZoom_close = document.getElementById('project-imageZoom-close');
var project_imageZoom_right = document.getElementById('project-imageZoom-right');
var project_imageZoom_left = document.getElementById('project-imageZoom-left');

// ============================================================================================= Init scrollable list =========

(function init() {
	// Projects container height has to be manually set due to position and display limitations
	var containerHeight = document.getElementById('scene-projects').offsetHeight - (projects_search.offsetTop + projects_search.offsetHeight);
	// TweenLite.set(projects_containerList, {height: containerHeight});
	projects_containerList.style.height = containerHeight + "px";
	// Initialize expand button
	projects_expanded_description_expandButton.onclick = function(e) {

		var hContainer = projects_containerList.offsetHeight - 140;

		if (projects_containerExpanded.style.height == hContainer + "px") {
			TweenLite.to(projects_expanded_description_container, 0.5, {height: projects_expanded_description.offsetHeight + 2*projects_expanded_description_expandButton.offsetHeight});
			TweenLite.to(projects_containerExpanded, 0.5, {
				height: projects_expanded_description_container.offsetTop + projects_expanded_description.offsetHeight - projects_containerExpanded.offsetTop + 2*projects_expanded_description_expandButton.offsetHeight});
			projects_expanded_description_expandButton.innerHTML = "Show Less";
		} else {
			TweenLite.to(projects_containerExpanded, 0.5, {height: hContainer});
			var hDescrip = Math.max(hContainer, 300) - (projects_expanded_description_container.offsetTop - projects_containerExpanded.offsetTop);
			TweenLite.to(projects_expanded_description_container, 0.5, {height: hDescrip});
			projects_expanded_description_expandButton.innerHTML = "Show More";
		}
	};
})();

function projectsRefit() {
	var containerHeight = document.getElementById('scene-projects').offsetHeight - (projects_search.offsetTop + projects_search.offsetHeight);
	// TweenLite.set(projects_containerList, {height: containerHeight});
	projects_containerList.style.height = containerHeight + "px";
}

// ============================================================================================== Init project items =========

// Used by href's in descriptions of projects. So they can jump to a project by file name and not number (incase order changes).
var jumpToProject = function(projFileName) {
	return function() {
		for (x = 1; x < PROJECT.length; x++) {
			if (PROJECT[x][FILE_NAME] == projFileName) {
				selectProject(x)();
				break;
			}
		}
	};
};

// Updates information fields and performs various animations to expand details about the selected project.
var selectProject = function(projNum) {
	return function() {
		// Check if selecting the project that is already selected.
		if (projectSelected != projNum) {
			// Update visuals to the list of projects by icon
			TweenLite.to(projects_list, 0.5, {height: 190, textAlign: "left", width: projects_list.getElementsByTagName("li").length * 163});
			TweenLite.to(projects_list.getElementsByTagName("li"), 0.5, {opacity: 0.25, cursor: "pointer", width: 155, margin: "8px 4px"});
			TweenLite.to(projects_iconCircle, 0.5, {height: 70, width: 70});
			TweenLite.to(projects_icon, 0.5, {height: 78, width: 78});
			// If there is already a selected project, reset its icon
			if (projectSelected != -1) {
				TweenLite.to(projects_iconCircle[projectSelected], 0.5, {opacity: 1});
				projects_icon_OuterCircle[projectSelected].style.backgroundImage = "url(images/icon_outerCircle@2x.png)";
			}
			// Darken the coloring of all other project tiles.
			// Update the newly selected project icon
			TweenLite.to(projects_iconCircle[projNum], 0.5, {opacity: 0});
			projects_icon_OuterCircle[projNum].style.backgroundImage = "url(images/icon_outerCircle_selected@2x.png)";
			TweenLite.to(projects_list.getElementsByTagName("li")[projNum-1], 0.5, {opacity: 0.70, cursor: "default"});
			projects_expanded_title.innerHTML = PROJECT[projNum][DISPLAY_NAME];
			// Don't display a dash "-" if the architectures field is empty
			if (PROJECT[projNum][ARCHITECTURES] == "_") {
				projects_expanded_details.innerHTML = PROJECT[projNum][PLATFORM];
			} else {
				projects_expanded_details.innerHTML = PROJECT[projNum][ARCHITECTURES] + " - " + PROJECT[projNum][PLATFORM];
			}
			projects_header_title.innerHTML = "Close Project";
			TweenLite.to(projects_header_title, 0.5, {opacity: 0.25, cursor: "pointer"});
			// Reset scroller for images to the left, caused offset glitches in the past.
			projects_expanded_container_image.scrollLeft = 0;
			// Reset image dragging movement
			imageDragging_velX = 0;
			// Flush out previous images in list
			projects_expanded_imageList.innerHTML = "";
			// CSS can't be used to size up the list, must be done here
			var imageListWidth = 160 * PROJECT[projNum][IMAGE_COUNT];
			// Check if the project has a video preview
			if (PROJECT[projNum][VIDEO] != "") {
				imageListWidth += 160;
				// Create li
				var li = document.createElement("li");
				li.style.backgroundImage = "url(projects/" + PROJECT[projNum][FILE_NAME] + "/video_thumb@2x.jpg)";
				li.onmouseup = videoZoomed_open();
				var div = document.createElement("div");
				div.setAttribute("class", "projects-expanded-imageContainer-play");
				li.appendChild(div);
				projects_expanded_imageList.appendChild(li);
			}
			TweenLite.set(projects_expanded_imageList, {width: (imageListWidth)});

			// Check if the project has a github linkElements
			if (PROJECT[projNum][GITLINK] != "") {
				projects_exapnded_description_gitLink.innerHTML = "<b>GitHub Link:</b> <a href=\"" + PROJECT[projNum][GITLINK] + "\" target=\"_blank\"> " + PROJECT[projNum][GITLINK] + " </a>"
			} else {
				projects_exapnded_description_gitLink.innerHTML = ""
			}

			// Set images for each li and add to ul
			for (p = 0; p < PROJECT[projNum][IMAGE_COUNT]; p++) {
				// Load images
				var theImg = new Image();
				theImg.src = "projects/" + PROJECT[projNum][FILE_NAME] + "/p" + (p+1) + "_thumb@2x.png";
				// Create li
				var li = document.createElement("li");
				li.style.backgroundImage = "url(projects/" + PROJECT[projNum][FILE_NAME] + "/p" + (p+1) + "_thumb@2x.png)";
				li.onmouseup = imageZoomed_open(p);
				clearMouseDrag();
				// Add li
				projects_expanded_imageList.appendChild(li);
			}
			// Open up the container for viewing a project
			var hContainer = projects_containerList.offsetHeight - 190;
			TweenLite.to(projects_containerExpanded, 0.5, {height: Math.max(hContainer, 300)});
			var hDescrip = Math.max(hContainer, 300) - (projects_expanded_description_container.offsetTop - projects_containerExpanded.offsetTop);
			TweenLite.to(projects_expanded_description_container, 0.5, {height: hDescrip});

			projects_expanded_description_expandButton.innerHTML = "Show More";
			TweenLite.to(projects_containerList, 0.3, {scrollTo: 0});
			projects_expanded_description.innerHTML = PROJECT[projNum][DESCRIPTION];
			if (projects_expanded_description.offsetHeight + 5 <= hDescrip) {
				projects_expanded_description_expandButton.style.zIndex = -3;
				projects_expanded_description_blur.style.zIndex = -3;
			} else {
				projects_expanded_description_expandButton.style.zIndex = 1;
				projects_expanded_description_blur.style.zIndex = 0;
			}
			// Update reference to which project is now selected
			projectSelected = projNum;
			// Simulate a mouse leave of the project
			projects_list.getElementsByTagName("li")[projNum-1].onmouseleave();
		}
	};
};

(function initProjectItems() {

	for (x = 1; x < PROJECT.length; x++) {initializeProjectItem(x);}

	// Button for closing the currently opened project
	projects_header_title.onclick = function() {
		// Reset text
		projects_header_title.innerHTML = "Select a project";
		// Reset button visuals
		TweenLite.to(projects_header_title, 0.5, {opacity: 1, cursor: "default", color: __color_background});
		// Close container (make it flat)
		TweenLite.to(projects_containerExpanded, 0.5, {height: 0});
		// Update all the list items
		TweenLite.to(projects_iconCircle, 0.5, {height: 92, width: 92});
		TweenLite.to(projects_icon, 0.5, {height: 100, width: 100});
		TweenLite.to(projects_iconCircle[projectSelected], 0.5, {opacity: 1})
		projects_icon_OuterCircle[projectSelected].style.backgroundImage = "url(images/icon_outerCircle@2x.png)";
		TweenLite.to(projects_list.getElementsByTagName("li"), 0.5, {opacity: 1, cursor: "pointer", width: 200, margin: "20px 20px"});
		// Reset the list visuals
		TweenLite.to(projects_list_container, 0.5, {scrollTo: 0});
		TweenLite.to(projects_list, 0.5, {height: "auto", textAlign: "center", width: "auto"});
		// Reseting projectSelected to -1 implies that no project is selected
		projectSelected = -1;
	};
	projects_header_title.onmouseenter = function() {
		if (projectSelected != -1) {
			TweenLite.to(projects_header_title, 0.3, {opacity: 1});
		}
	};
	projects_header_title.onmouseleave = function() {
		if (projectSelected != -1) {
			TweenLite.to(projects_header_title, 0.3, {opacity: 0.25});
		}
	};

})();

function initializeProjectItem(x) {

	var li = document.createElement("li");
	li.setAttribute("id", "projects-list-" + PROJECT[x][FILE_NAME]);

	var pLogo = document.createElement("div");
	pLogo.setAttribute("class", "projects-list-icon");
	li.appendChild(pLogo);
	projects_icon.push(pLogo);
	var pOuterCircle = document.createElement("div");
	pOuterCircle.setAttribute("class", "projects-list-icon-outerCircle");
	pLogo.appendChild(pOuterCircle);
	projects_icon_OuterCircle.push(pOuterCircle)
	var pInnerCircle = document.createElement("div");
	pInnerCircle.setAttribute("class", "projects-list-icon-innerCircle");
	pLogo.appendChild(pInnerCircle);
	projects_iconCircle.push(pInnerCircle);
	if (PROJECT[x][IMAGE_COUNT] > 0) {
		pInnerCircle.style.backgroundImage = "url(projects/" + PROJECT[x][FILE_NAME] + "/p1_thumb@2x.png)";
	}
	var pTitle = document.createElement("p");
	pTitle.setAttribute("class", "projects-list-title");
	pTitle.innerHTML = PROJECT[x][DISPLAY_NAME];
	li.appendChild(pTitle);
	var pExpand = document.createElement("p");
	pExpand.setAttribute("class", "projects-list-expand");
	pExpand.innerHTML = "EXPAND";
	li.appendChild(pExpand);
	var pArchitecture = document.createElement("p");
	pArchitecture.setAttribute("class", "projects-list-architecture");
	pArchitecture.innerHTML = PROJECT[x][ARCHITECTURES];
	li.appendChild(pArchitecture);
	var pPlatform = document.createElement("p");
	pPlatform.setAttribute("class", "projects-list-platform");
	pPlatform.innerHTML = PROJECT[x][PLATFORM];
	li.appendChild(pPlatform);
	var pDate = document.createElement("p");
	pDate.setAttribute("class", "projects-list-date");
	pDate.innerHTML = PROJECT[x][UPDATED];
	li.appendChild(pDate);

	// NOTE: OPEN() IS NOT BEING RUN ASYNCHRONOUSLY (false param) - SLOWS DOWN LOAD TIME
	// READ IN DESCRIPTION FROM TEXT FILE
	if (window.XMLHttpRequest) {
		var rawFile = new XMLHttpRequest();
		rawFile.onreadystatechange = function ()
		{
				if(rawFile.readyState === 4)
				{
						if(rawFile.status === 200 || rawFile.status == 0)
						{
								var allText = rawFile.responseText;
								PROJECT[x][DESCRIPTION] = allText;
						}
				}
		};
		rawFile.open("GET", "projects/" + PROJECT[x][FILE_NAME] +"/descrip.txt", false);
		rawFile.send(null);
	}
	// END FILE READ

	li.onclick = selectProject(x);

	li.onmouseenter = function() {
		if (x != projectSelected) {
			pArchitecture.style.borderColor =  __color_background;
			TweenLite.to(li, 0.25, {marginBottom: 0, opacity: 1});
			TweenLite.to(pExpand, 0.25, {height: 16});
			TweenLite.to(pOuterCircle, PROJECT[x][IMAGE_COUNT], {rotation: 360, ease: Power0.easeNone});
			slideshowProject = x;
			slideshowStart(x);
		}
	};
	li.onmouseleave = function() {
		TweenLite.to(pArchitecture, 0.05, {borderColor: "transparent", delay: 0.20});
		TweenLite.to(li, 0.25, {marginBottom: 16});
		if (projectSelected != -1 && x != projectSelected) {
			TweenLite.to(li, 0.25, {opacity: 0.25});
		}
		TweenLite.to(pExpand, 0.25, {height: 0});
		TweenLite.to(pOuterCircle, 0.75, {rotation: 0, ease: Power4.easeInOut});
		slideshowStop();
	};

	projects_list.appendChild(li);
}

// ================================================================================= Init Icon Slideshow Functionality =========

function slideshowStart(project) {
	slideshowProject = project;
	if (PROJECT[slideshowProject][IMAGE_COUNT] > 1) {
		slideshowTransitionTimer = setTimeout(function(){slideshowContinue()}, SLIDESHOW_TRANSITION_TIME * 1000);
	}
}
function slideshowContinue(project) {
	if (PROJECT[slideshowProject][IMAGE_COUNT] > slideshowImage) {
		slideshowImage++;
		projects_iconCircle[slideshowProject].style.backgroundImage = "url(projects/" + PROJECT[slideshowProject][FILE_NAME] + "/p" + slideshowImage + "_thumb@2x.png)";
		slideshowTransitionTimer = setTimeout(function(){slideshowContinue()}, SLIDESHOW_TRANSITION_TIME * 1000);
	} else {
		projects_iconCircle[slideshowProject].style.backgroundImage = "url(projects/" + PROJECT[slideshowProject][FILE_NAME] + "/p" + slideshowImage + "_thumb@2x.png)";
		slideshowImage = 1;
	}
}
function slideshowStop() {
	clearTimeout(slideshowTransitionTimer);
	slideshowImage = 1;
	if (slideshowProject != -1) {
		if (PROJECT[slideshowProject][IMAGE_COUNT] > 0) {
			projects_iconCircle[slideshowProject].style.backgroundImage = "url(projects/" + PROJECT[slideshowProject][FILE_NAME] + "/p1_thumb@2x.png)";
		}
		slideshowProject = -1;
	}
}

// ================================================================================= Init image container dragging  =========

projects_expanded_imageList.onmousedown = function() {
	projects_expanded_imageList.onmousemove = function(e) {
		imageDragging = true;
		var rect = projects_expanded_container_image.getBoundingClientRect();
		var mouseX = e.clientX - rect.left;
		// First mouse movement set up previous_mouse position
		if (imageDragging_pX == null) {
			imageDragging_pX = mouseX;
		} else {
			let dX = mouseX - imageDragging_pX;
			imageDragging_velX = dX;
			if (!dragClockRunning) {
				dragUpdateClock()();
			}
			imageDragging_pX = mouseX;
		}
	};
	projects_expanded_imageList.onmouseup = function () {
		clearMouseDrag();
	}
	projects_expanded_imageList.onmouseleave = function () {
		clearMouseDrag();
	}
};

function dragUpdateClock() {
	return function() {
		if (imageDragging_velX > 1 || imageDragging_velX < -1) {
			dragClockRunning = true;
			setTimeout(dragUpdateClock(), DRAG_CLOCK_HZ);
			projects_expanded_container_image.scrollLeft -= imageDragging_velX;
			imageDragging_velX =  imageDragging_velX - Math.sign(imageDragging_velX) * DRAG_DECELERATION;
		} else {
			imageDragging_velX = 0;
			dragClockRunning = false;
		}
	};
};

function clearMouseDrag() {
	imageDragging = false;
	imageDragging_pX = null;
	projects_expanded_imageList.onmousemove = function() {};
	projects_expanded_imageList.onmouseup = function() {};
	projects_expanded_imageList.onmouseleave = function() {};
}

// ============================================================================================== Init image zoomer =========

// Open the image zoomer overlay, provided the given image number, assuming the latest selected project
var imageZoomed_open = function(imageNumber) {
	return function() {
		if (!imageDragging) {
			project_imageZoom_image.style.backgroundImage = "url(projects/" + PROJECT[projectSelected][FILE_NAME] + "/p" + (imageNumber+1) + "@2x.png)";
			project_imageZoom_cover.style.zIndex = 8;
			TweenLite.to(project_imageZoom_cover, 0.25, {opacity: 0.6});
			project_imageZoom_container.style.zIndex = 9;
			TweenLite.to(project_imageZoom_container, 0.25, {transform: "scale(1)"});
			if (imageNumber == 0) {
				TweenLite.set(project_imageZoom_left, {zIndex: -9, opacity: 0});
				if (imageNumber == PROJECT[projectSelected][IMAGE_COUNT]-1) {
					TweenLite.set(project_imageZoom_right, {zIndex: -9, opacity: 0});
				} else {
					TweenLite.set(project_imageZoom_right, {zIndex: 9, opacity: 1});
				}
			} else if (imageNumber == PROJECT[projectSelected][IMAGE_COUNT]-1) {
				TweenLite.set(project_imageZoom_left, {zIndex: 9, opacity: 1});
				TweenLite.set(project_imageZoom_right, {zIndex: -9, opacity: 0});
			} else {
				TweenLite.set(project_imageZoom_left, {zIndex: 9, opacity: 1});
				TweenLite.set(project_imageZoom_right, {zIndex: 9, opacity: 1});
			}
			imageSelected = imageNumber;
		}
	};
};
// Open the image zoomer overlay but override to display a video. This assumes there is only one video allowed.
var videoZoomed_open = function() {
	return function() {
		if (!imageDragging) {
			project_imageZoom_image.style.backgroundImage = "";
			project_imageZoom_cover.style.zIndex = 8;
			TweenLite.to(project_imageZoom_cover, 0.25, {opacity: 0.6});
			project_imageZoom_container.style.zIndex = 9;
			TweenLite.to(project_imageZoom_container, 0.25, {transform: "scale(1)"});
			TweenLite.set(project_imageZoom_left, {zIndex: -9, opacity: 0});
			TweenLite.set(project_imageZoom_right, {zIndex: -9, opacity: 0});
			// Create the iFrame
			var iframe = document.createElement("iframe");
			// iframe.setAttribute('width', '500');
			// iframe.setAttribute('height', '500');
			iframe.setAttribute('src', "https://www.youtube.com/embed/" + PROJECT[projectSelected][VIDEO]);
			project_imageZoom_image.appendChild(iframe);
		}
		clearMouseDrag();
	};
};
// Close the image zoomer overlay
var imageZoomed_close = function() {
	return function() {
		TweenLite.set(project_imageZoom_cover, {opacity: 0, zIndex: -8});
		TweenLite.set(project_imageZoom_container, {transform: "scale(0)", zIndex: -9});
		imageSelected = -1;
		imageBrowseSelectionRight = true;
		project_imageZoom_image.innerHTML = "";
	};
};
// Close image zoomer when 'x' is clicked or when clicking outside of image zoomer
project_imageZoom_cover.onclick = imageZoomed_close();
project_imageZoom_close.onclick = imageZoomed_close();

// Display the image indexed at the previous number with the image zoomer
var imageZoomed_left = function() {
	return function() {
		if (imageSelected > 0) {
			if (imageSelected == 1) {
				TweenLite.set(project_imageZoom_left, {zIndex: -9, opacity: 0});
			} else {
				TweenLite.set(project_imageZoom_right, {zIndex: 9, opacity: 1});
			}
			imageBrowseSelectionRight = false;
			imageSelected--;
			project_imageZoom_image.style.backgroundImage = "url(projects/" + PROJECT[projectSelected][FILE_NAME] + "/p" + (imageSelected+1) + "@2x.png)";
		}
	};
};
// Display the image indexed at the next number with the image zoomer
var imageZoomed_right = function() {
	return function() {
		if (imageSelected < PROJECT[projectSelected][IMAGE_COUNT]-1) {
			if (PROJECT[projectSelected][IMAGE_COUNT]-2 == imageSelected) {
				TweenLite.set(project_imageZoom_right, {zIndex: -9, opacity: 0});
			} else {
				TweenLite.set(project_imageZoom_left, {zIndex: 9, opacity: 1});
			}
			imageBrowseSelectionRight = true;
			imageSelected++;
			project_imageZoom_image.style.backgroundImage = "url(projects/" + PROJECT[projectSelected][FILE_NAME] + "/p" + (imageSelected+1) + "@2x.png)";
		}
	};
};
// Image in the image zoomer can be clicked to continue to next or previous image
project_imageZoom_image.onclick = function() {
	if (imageBrowseSelectionRight) {
		imageZoomed_right()();
	} else {
		imageZoomed_left()();
	}
};
// Scroll through images using left and right buttons
project_imageZoom_left.onclick = imageZoomed_left();
project_imageZoom_right.onclick = imageZoomed_right();
