var domain =  "https://www.harxer.com"; //  "http://localhost"; //

// Populates projects "scene"
// ========================================================================================================== Variables ====

// Expanded container
const CONTAINER_EXPAND_HEIGHT = 416;
const CONTAINER_DESCRIP_HEIGHT = 180;

// These values are set to undefined if a project/image is not selected
var selected = {project: undefined, index: -1};
var imageSelected = -1;

// Image list dragging
var imageDragging = false;
var imageDragging_pX = null;
var imageDragging_velX = 0;
var DRAG_CLOCK_HZ = 10;
var DRAG_DECELERATION = 1;
var dragClockRunning = false;

// Project Icon Slideshow
var SLIDESHOW_TRANSITION_TIME = 0.5; // secs
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
var projects_icon = [];
var projects_iconCircle = [];
var projects_icon_OuterCircle = [];
var projects_containerExpanded = document.getElementById('projects-container-expanded');
var projects_expanded_title = document.getElementById('projects-expanded-title');
var projects_expanded_details = document.getElementById('projects-expanded-details');
var projects_expanded_container_image = document.getElementById('projects-expanded-imageContainer');
var projects_expanded_imageList = document.getElementById('projects-expanded-imageList');
var projects_expanded_description = document.getElementById('projects-expanded-description');
var projects_exapnded_description_gitLink = document.getElementById('projects-expanded-description-gitLink');
var projects_expanded_description_container = document.getElementById('projects-expanded-description-container');
var project_imageZoom_container = document.getElementById('project-imageZoom-container');
var project_imageZoom_cover = document.getElementById('project-imageZoom-cover');
var project_imageZoom_image = document.getElementById('project-imageZoom-image');
var project_imageZoom_close = document.getElementById('project-imageZoom-close');
var project_imageZoom_right = document.getElementById('project-imageZoom-right');
var project_imageZoom_left = document.getElementById('project-imageZoom-left');

// Quick Project Opening
var projectsLoaded = false;
var initProjectOpen = undefined;

function projectsRefit() {
	var containerHeight = document.getElementById('scene-projects').offsetHeight - (projects_search.offsetTop + projects_search.offsetHeight);
	// TweenLite.set(projects_containerList, {height: containerHeight});
	projects_containerList.style.height = containerHeight + "px";
}

// ============================================================================================== Init project items =========

function populateProjectView(project, historied) {
	// Check if selecting the project that is already selected.
	if (selected.project != project) {
		// If there is already a selected project, reset its icon
		if (selected.index != -1) {
			TweenLite.to(projects_iconCircle[selected.index], 0.5, {opacity: 1});
			projects_icon_OuterCircle[selected.index].style.backgroundImage = "url(/images/icon_outerCircle@2x.png)";
			TweenLite.to(projects_list.getElementsByTagName("li")[selected.index], 0.5, {opacity: 1, backgroundColor: "tranparent", color: __color_background});
		}
		// Update visuals to the list of projects by icon
		TweenLite.to(projects_list, 0.5, {height: 190, textAlign: "left", width: projects_list.getElementsByTagName("li").length * 165});
		TweenLite.to(projects_list.getElementsByTagName("li"), 0.5, {cursor: "pointer", width: 155, margin: "8px 4px"});
		TweenLite.to(projects_iconCircle, 0.5, {height: 70, width: 70});
		TweenLite.to(projects_icon, 0.5, {height: 78, width: 78});
		// Update the newly selected project icon
		TweenLite.to(projects_iconCircle[project.index], 0.5, {opacity: 0});
		projects_icon_OuterCircle[project.index].style.backgroundImage = "url(/images/icon_outerCircle_selected@2x.png)";
		TweenLite.to(projects_list.getElementsByTagName("li")[project.index], 0.5, {opacity: 0.70, cursor: "default"});
		TweenLite.set(projects_icon[project.index], {scale: 0.9, ease: Back.easeInOut});
		projects_expanded_title.innerHTML = project.title;
		// Don't display a dash "-" if the architectures field is empty
		if (project.architecture == "_") {
			projects_expanded_details.innerHTML = project.platform;
		} else {
			projects_expanded_details.innerHTML = project.architecture + " - " + project.platform;
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
		var imageListWidth = 160 * project.images.length;
		// Check if the project has a video preview
		if (project.youtube_link != "") {
			imageListWidth += 160;
			// Create li
			var li = document.createElement("li");
			li.style.backgroundImage = "url(https://img.youtube.com/vi/"+project.youtube_link+"/0.jpg)";
			li.onmouseup = videoZoomed_open(project.youtube_link);
			var div = document.createElement("div");
			div.setAttribute("class", "projects-expanded-imageContainer-play");
			li.appendChild(div);
			projects_expanded_imageList.appendChild(li);
		}
		TweenLite.set(projects_expanded_imageList, {width: (imageListWidth)});

		// Check if the project has a github linkElements
		if (project.github_link != "") {
			projects_exapnded_description_gitLink.innerHTML = "<b>GitHub Link:</b> <a href=\""+project.github_link+"\" target=\"_blank\"> "+project.github_link+" </a>"
		} else {
			projects_exapnded_description_gitLink.innerHTML = ""
		}

		// Set images for each li and add to ul
		for (p = 0; p < project.images.length; p++) {
			// Create li
			var li = document.createElement("li");
			li.style.backgroundImage = "url(data:"+project.images[p].type+";base64,"+project.images[p].buffer+")";
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

		TweenLite.to(projects_containerList, 0.3, {scrollTo: 0});
		projects_expanded_description.innerHTML = project.description;
		// Update reference to which project is now selected
		selected.project = project;
		selected.index = project.index;
		// Update the address bar
		if (history.pushState && historied !== undefined) {
			var newurl = window.location.protocol + "//" + window.location.host + "/projects/" + project.id;
			var newTitle = "Harxer - " + project.title;
			if (historied) {
				window.history.pushState({path:newurl}, newTitle, newurl);
			} else {
				window.history.replaceState({path:newurl}, newTitle, newurl);
			}
			document.title = newTitle; // In case the replace/push history state didn't update the page title.
		}
	}
}

// Updates information fields and performs various animations to expand details about the selected project.
var selectProject = function(id, index, historied = true) {
	return function() {
		// If id is undefined, it indicates to close project view
		if (id == undefined) {
			// Reset text
			projects_header_title.innerHTML = "Select a project";
			// Reset button visuals
			TweenLite.to(projects_header_title, 0.5, {opacity: 1, cursor: "default", color: __color_background});
			// Close container (make it flat)
			TweenLite.to(projects_containerExpanded, 0.5, {height: 0});
			// Update all the list items
			TweenLite.to(projects_iconCircle, 0.5, {height: 92, opacity: 1, width: 92});
			TweenLite.to(projects_icon, 0.5, {height: 100, width: 100});
			projects_icon_OuterCircle[selected.index].style.backgroundImage = "url(/images/icon_outerCircle@2x.png)";
			TweenLite.to(projects_list.getElementsByTagName("li"), 0.5, {opacity: 1, cursor: "pointer", width: 200, margin: "20px 20px", backgroundColor: "tranparent", color: __color_background});
			// Reset the list visuals
			TweenLite.to(projects_list_container, 0.5, {scrollTo: 0});
			TweenLite.to(projects_list, 0.5, {height: "auto", textAlign: "center", width: "auto"});
			// Reset selected
			selected = {project: undefined, index: -1};
			// Update the address bar
			if (history.pushState && historied !== undefined) { // break historied and it works perfectly!
				var newurl = window.location.protocol + "//" + window.location.host + "/projects";
				var newTitle = "Harxer - Projects";
				if (historied) {
					window.history.pushState({path:newurl}, newTitle, newurl);
				} else {
					window.history.replaceState({path:newurl}, newTitle, newurl);
				}
				document.title = newTitle; // In case the replace/push history state didn't update the page title.
			}
			return;
		}
		// Retrieve project
		var httpRequest = new XMLHttpRequest();
		httpRequest.onreadystatechange = function() {
			if (httpRequest.readyState == XMLHttpRequest.DONE) {   // XMLHttpRequest.DONE == 4
				 if (httpRequest.status == 200) {
					 // Retrieve Project by id and popualte detail view
					 var proj = JSON.parse(httpRequest.responseText)
					 if (index == undefined) { // This happens if coming from quickOpenScene
						 var i = 0;
						 var lis = projects_list.getElementsByTagName("li");
						 for (var l = 0; l < lis.length; l++) {
							 var pTitle = lis[l].getElementsByClassName("projects-list-title")[0];
							 if (pTitle.innerHTML == proj.title) {
								 index = i;
							 }
							 i++;
						 }
					 }
					 proj.index = index;
					 populateProjectView(proj, historied);
				 } else {
					 alert("Network hiccup! Problems getting project. Please try again later.");
					 // Should try again after a time...
				 }
			}
		};
		httpRequest.open('GET', domain+'/api/project/?id=' + id);
		httpRequest.send();
	};
};

function parseProjectItem(project) {

	project.index = projects_icon.length;

	var li = document.createElement("li");
	li.setAttribute("id", "projects-list-" + project.id);

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
	pOuterCircle.appendChild(pInnerCircle);
	projects_iconCircle.push(pInnerCircle);
	if (project.imageOne != undefined) {
		pInnerCircle.style.backgroundImage = "url(data:"+project.imageOne.type+";base64,"+project.imageOne.buffer+")";
	}
	var pTitle = document.createElement("p");
	pTitle.setAttribute("class", "projects-list-title");
	pTitle.innerHTML = project.title;
	li.appendChild(pTitle);
	var pExpand = document.createElement("p");
	pExpand.setAttribute("class", "projects-list-expand");
	pExpand.innerHTML = "EXPAND";
	li.appendChild(pExpand);
	var pArchitecture = document.createElement("p");
	pArchitecture.setAttribute("class", "projects-list-architecture");
	pArchitecture.innerHTML = project.architecture;
	li.appendChild(pArchitecture);
	var pPlatform = document.createElement("p");
	pPlatform.setAttribute("class", "projects-list-platform");
	pPlatform.innerHTML = project.platform;
	li.appendChild(pPlatform);
	var pDate = document.createElement("p");
	pDate.setAttribute("class", "projects-list-date");
	if (project.update_date != undefined) {
		var yr = project.update_date.substr(0,project.update_date.indexOf("-"));
		yr = project.update_date.substr(2, 2);
		project.update_date = project.update_date.substr(project.update_date.indexOf("-")+1);
		var month = project.update_date.substr(0,project.update_date.indexOf("-"));
		project.update_date = project.update_date.substr(project.update_date.indexOf("-")+1);
		var day = project.update_date.substr(0, 2);
		pDate.innerHTML = month+"/"+day+"/"+yr;
	}
	li.appendChild(pDate);

	li.onclick = selectProject(project.id, project.index);

	return li;
}
function populateProjectItems() {
	var httpRequest = new XMLHttpRequest();
	httpRequest.onreadystatechange = function() {
		if (httpRequest.readyState == XMLHttpRequest.DONE) {   // XMLHttpRequest.DONE == 4
			 if (httpRequest.status == 200) {
				 var projects = JSON.parse(httpRequest.responseText)
				 // Populate project list
				 for (var p = 0; p < projects.length; p++) {
					 projects_list.appendChild(parseProjectItem(projects[p]));
				 }
				 projectsLoaded = true;
				 if (initProjectOpen !== undefined) {
					 selectProject(initProjectOpen, undefined, false)();
				 } else (preProjectOpen == null) {
					 selectProject(undefined, undefined, null)();
				 }
			 } else {
				 alert("Network hiccup! Problems getting project. Please try again later.");
				 // Should try again after a time...
			 }
		}
	};

	httpRequest.open('GET', domain+'/api/projects/');
	httpRequest.send();
};

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
			project_imageZoom_image.style.backgroundImage = "url(data:"+selected.project.images[imageNumber].type+";base64,"+selected.project.images[imageNumber].buffer+")";
			project_imageZoom_cover.style.zIndex = 8;
			TweenLite.to(project_imageZoom_cover, 0.25, {opacity: 0.6});
			project_imageZoom_container.style.zIndex = 9;
			TweenLite.to(project_imageZoom_container, 0.25, {transform: "scale(1)"});
			if (imageNumber == 0) {
				TweenLite.set(project_imageZoom_left, {zIndex: -9, opacity: 0});
				if (imageNumber == selected.project.images.length-1) {
					TweenLite.set(project_imageZoom_right, {zIndex: -9, opacity: 0});
				} else {
					TweenLite.set(project_imageZoom_right, {zIndex: 9, opacity: 1});
				}
			} else if (imageNumber == selected.project.images.length-1) {
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
var videoZoomed_open = function(link) {
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
			iframe.setAttribute('src', "https://www.youtube.com/embed/" + link);
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
			project_imageZoom_image.style.backgroundImage = "url(data:"+selected.project.images[imageSelected].type+";base64,"+selected.project.images[imageSelected].buffer+")";
		}
	};
};
// Display the image indexed at the next number with the image zoomer
var imageZoomed_right = function() {
	return function() {
		if (imageSelected < selected.project.images.length-1) {
			if (selected.project.images.length-2 == imageSelected) {
				TweenLite.set(project_imageZoom_right, {zIndex: -9, opacity: 0});
			} else {
				TweenLite.set(project_imageZoom_left, {zIndex: 9, opacity: 1});
			}
			imageBrowseSelectionRight = true;
			imageSelected++;
			project_imageZoom_image.style.backgroundImage = "url(data:"+selected.project.images[imageSelected].type+";base64,"+selected.project.images[imageSelected].buffer+")";
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


// ============================================================================================= Init =========

(function init() {
	// Projects container height has to be manually set due to position and display limitations
	var containerHeight = document.getElementById('scene-projects').offsetHeight - (projects_search.offsetTop + projects_search.offsetHeight);
	// TweenLite.set(projects_containerList, {height: containerHeight});
	projects_containerList.style.height = containerHeight + "px";

	populateProjectItems();

	// Button for closing the currently opened project
	projects_header_title.onclick = selectProject();
	projects_header_title.onmouseenter = function() {
		if (selected.index != -1) {
			TweenLite.to(projects_header_title, 0.3, {opacity: 1});
		}
	};
	projects_header_title.onmouseleave = function() {
		if (selected.index != -1) {
			TweenLite.to(projects_header_title, 0.3, {opacity: 0.25});
		}
	};
})();
