var domain =  "https://www.harxer.com";
// var domain =  "http://localhost";

// Populates projects "scene"
// ========================================================================================================== Variables ====

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
var projects_containerSwitch = document.getElementById('projects--container-switch');
var projects_containerList = document.getElementById('projects-container-list');
var projects_list = document.getElementById('projects-list');
var projects_header = document.getElementById('projects--header');
var projects_header_list = document.getElementById('projects--header-list');
var projects_icon = [];
var project_types = [];

var projects_containerExpanded = document.getElementById('projects-expanded-container');
var projects_expanded_icon = document.getElementById('projects-expanded-icon');
var projects_expanded_icon_title = document.getElementById('projects-expanded-icon-title');
var projects_expanded_title = document.getElementById('projects-expanded-title');
var projects_expanded_details = document.getElementById('projects-expanded-details');
var projects_expanded_container_image = document.getElementById('projects-expanded-imageContainer');
var projects_expanded_imageList = document.getElementById('projects-expanded-imageList');
var projects_expanded_description = document.getElementById('projects-expanded-description');
var projects_exapnded_description_gitLink = document.getElementById('projects-expanded-description-gitLink');
var projects_expanded_description_container = document.getElementById('projects-expanded-description-container');
var projects_expanded_closeButton = document.getElementById('projects-expanded-closeButton');

var project_imageZoom_container = document.getElementById('project-imageZoom-container');
var project_imageZoom_cover = document.getElementById('project-imageZoom-cover');
var project_imageZoom_image = document.getElementById('project-imageZoom-image');
var project_imageZoom_close = document.getElementById('project-imageZoom-close');
var project_imageZoom_right = document.getElementById('project-imageZoom-right');
var project_imageZoom_left = document.getElementById('project-imageZoom-left');

// Quick Project Opening
var projectsLoaded = false;
var initProjectOpen = undefined; // {id, historied}

// ============================================================================================== init Project Selection =========

var selectProject = function(id, index, historied = true) {
	return () => {

		// Guard: if id is undefined, it indicates to close project view
		if (id === undefined) {
			resetProjectSelection();
			return;
		}

		var project = undefined;
		var selectionAnimationFinished = false;

		downloadProject(id, index).then((response) => {
			if (selectionAnimationFinished) {
				populateExpandedView(response, displayExpandedView);
			} else {
				project = response;
			}
		}, (error) => {
			// network error
		});

		animateProjectSelection(index, () => {
			if (project !== undefined) {
				populateExpandedView(project, displayExpandedView);
			} else {
				selectionAnimationFinished = true;
			}
		})

	};
}
function downloadProject(id, index) {
	return new Promise((resolve,reject) => {
		var req = new XMLHttpRequest();

		req.open('GET', domain+'/api/project/?id=' + id);

		req.onload = ()=>{
			if (req.status == 200) {
				// Retrieve Project by id and popualte detail view
				var proj = JSON.parse(req.responseText)
				if (index == undefined) { // This happens if coming from quickOpenScene or history popstate (all in redirect.js)
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
				resolve(proj);
			} else {
				reject();
			}
		};

		req.onerror = ()=>{
			reject();
		};

		req.send();
	});
}
function animateProjectSelection(index, selectionAnimationFinished) {
	projects_expanded_icon.style.backgroundImage = projects_icon[index].style.backgroundImage;
	projects_expanded_icon_title.innerHTML = projects_icon[index].children[0].innerHTML;

	var childs = Array.prototype.slice.call(projects_list.children, 0);
	childs.splice(index, 1);
	let INSET_X = projects_expanded_icon.offsetLeft - projects_list.offsetLeft; //projects_list.offsetWidth/2 - projects_list.children[index].offsetWidth/2;
	let INSET_Y = projects_expanded_icon.offsetTop - projects_list.offsetTop;
	let offsetX = projects_list.offsetLeft - projects_list.children[index].offsetLeft + INSET_X;
	let offsetY = projects_list.offsetTop - projects_list.children[index].offsetTop + INSET_Y;
	// Hide project tiles, show project window
	var tll = new TimelineLite();
	// tll.staggerTo(childs, 0.4, {opacity: 0, scale: 0}, 0.05);
	tll.to(childs, 0.2, {opacity: 0, scale: 0});
	tll.to(projects_list.children[index], 0.2, {x: offsetX, y: offsetY});
	tll.to(content, 0.2, {scrollTo: scenes[SCENE_INDEX.PROJECTS].offsetTop}, '-=0.2');
	tll.to(projects_icon[index], 0.2, {borderRadius: "50%"}, '-=0.2');
	tll.set(projects_containerExpanded, {display: "inline"});
	tll.set(projects_list.children[index], {opacity: 0});
	tll.set(projects_list, {height: 0, onComplete: selectionAnimationFinished});
}

function populateExpandedView(project, finishedPopulateCallback) {
	projects_expanded_title.innerHTML = project.title;

	// Don't display a dash "-" if the architectures field is empty
	if (project.architecture == "_") {
		projects_expanded_details.innerHTML = project.platform;
	} else {
		projects_expanded_details.innerHTML = project.architecture + " - " + project.platform;
	}

	projects_expanded_description.innerHTML = project.description;

	// Check if the project has a github linkElements
	if (project.github_link != "") {
		projects_exapnded_description_gitLink.innerHTML = "<b>GitHub Link:</b> <a href=\""+project.github_link+"\" target=\"_blank\"> "+project.github_link+" </a>"
	} else {
		projects_exapnded_description_gitLink.innerHTML = ""
	}

	// Flush out previous images in list
	projects_expanded_imageList.innerHTML = "";
	// Check if the project has a video preview
	if (project.youtube_link != "") {
		// Create li
		var li = document.createElement("li");
		li.style.backgroundImage = "url(https://img.youtube.com/vi/"+project.youtube_link+"/0.jpg)";
		li.onmouseup = videoZoomed_open(project.youtube_link);
		var div = document.createElement("div");
		div.className = "projects-expanded-imageContainer-play";
		li.appendChild(div);
		projects_expanded_imageList.appendChild(li);
	}
	// Set images for each li and add to ul
	for (p = 0; p < project.images.length; p++) {
		// Create li
		var li = document.createElement("li");
		li.style.backgroundImage = "url(data:"+project.images[p].type+";base64,"+project.images[p].buffer+")";
		li.onmouseup = imageZoomed_open(p);
		// Add li
		projects_expanded_imageList.appendChild(li);
	}

	// Update reference to which project is now selected
	selected.project = project;
	selected.index = project.index;

	finishedPopulateCallback();
}

function displayExpandedView() {
	// Show updated container
	var tll = new TimelineLite();
	tll.to(projects_expanded_title, 0.4, {opacity: 1});
	tll.to(projects_expanded_details, 0.4, {opacity: 1}, '-=0.2');
	tll.to(projects_expanded_description, 0.4, {opacity: 1}, '-=0.2');
	tll.to(projects_exapnded_description_gitLink, 0.4, {opacity: 1}, '-=0.2');
	tll.to(projects_expanded_container_image, 0.4, {opacity: 1}, '-=0.2');
	tll.to(projects_expanded_closeButton, 0.4, {opacity: 1}, '-=0.2');
}
function resetProjectSelection() {
	createHeaderSearchTypes();
	// Hide project tiles, show project window
	var tll = new TimelineLite();
	tll.to(projects_expanded_closeButton, 0.3, {opacity: 0});
	tll.to(projects_expanded_container_image, 0.3, {opacity: 0}, '-=0.15');
	tll.to(projects_exapnded_description_gitLink, 0.3, {opacity: 0}, '-=0.15');
	tll.to(projects_expanded_description, 0.3, {opacity: 0}, '-=0.15');
	tll.to(projects_expanded_details, 0.3, {opacity: 0}, '-=0.15');
	tll.to(projects_expanded_title, 0.3, {opacity: 0}, '-=0.15');
	tll.set(projects_list.children[selected.index], {opacity: 1});
	tll.set(projects_containerExpanded, {display: "block"});
	tll.set(projects_list, {height: "auto"});
	tll.to(projects_list.children[selected.index], 0.5, {x: 0, y: 0});
	tll.to(projects_icon[selected.index], 0.2, {borderRadius: "6px"}, '-=0.2');
	tll.to(projects_list.children, 1, {opacity: 1, scale: 1});

	// Reset selected
	selected = {project: undefined, index: -1};
}

// ==================================================================================== init Project List =======

function parseProjectItem(project) {

	// htmlString not used, only textualizes what JS below is doing
	let htmlString = `
		<li id="projects-list-`+project.id+`">
			<div class="projects-list-icon">
				<div class="projects-list-icon-innerCircle">
					<p>View</p>
				</div>
			</div>

			<p class="projects-list-title">`+project.title+`</p>
			<p class="projects-list-architecture">`+project.architecture+`</p>
			<p class="projects-list-platform">`+project.platform+`</p>
			<p class="projects-list-date"> </p>

		</li>
	`;

	project.index = projects_icon.length;

	var li = document.createElement("li");
	li.id = "projects-list-" + project.id;

	var pLogo = document.createElement("div");
	pLogo.className = "projects-list-icon";
	if (project.imageOne != undefined) {
		pLogo.style.backgroundImage = "url(data:"+project.imageOne.type+";base64,"+project.imageOne.buffer+")";
	}
	li.appendChild(pLogo);
	projects_icon.push(pLogo);

	var pTitle = document.createElement("p");
	pTitle.className = "projects-list-title";
	pTitle.innerHTML = project.title;
	pLogo.appendChild(pTitle);

	var pArchitecture = document.createElement("p");
	pArchitecture.className = "projects-list-architecture";
	pArchitecture.innerHTML = project.architecture;
	li.appendChild(pArchitecture);
	var pPlatform = document.createElement("p");
	pPlatform.className = "projects-list-platform";
	pPlatform.innerHTML = "Platform: "+project.platform;
	li.appendChild(pPlatform);

	// var pDate = document.createElement("p");
	// pDate.className = "projects-list-date";
	// if (project.update_date != undefined) {
	// 	var yr = project.update_date.substr(0,project.update_date.indexOf("-"));
	// 	yr = project.update_date.substr(2, 2);
	// 	project.update_date = project.update_date.substr(project.update_date.indexOf("-")+1);
	// 	var month = project.update_date.substr(0,project.update_date.indexOf("-"));
	// 	project.update_date = project.update_date.substr(project.update_date.indexOf("-")+1);
	// 	var day = project.update_date.substr(0, 2);
	// 	pDate.innerHTML = month+"/"+day+"/"+yr;
	// }
	// li.appendChild(pDate);

	li.onmouseenter = () => {
		TweenLite.to(pLogo, 0.1, {
			transform: "scale(1.03)",
			boxShadow: "0 0 10px 2px rgba(0,0,0,0.3)"
		});
	};
	li.onmouseleave = () => {
		TweenLite.to(pLogo, 0.5, {
			transform: "scale(1)",
			boxShadow: "0 0 4px 2px rgba(0,0,0,0)"
		});
	}
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
					 if (projects[p].architecture !== undefined && projects[p].architecture != "" && projects[p].architecture != "_") {

						 // Add new types
						 var exists = false;
						 for (var i = 0; i < project_types.length; i++) {
							 if (project_types[i].type == projects[p].architecture) {
								 exists = true;
								 break;
							 }
						 }
						 if (!exists) {
							 project_types.push({
								 type: projects[p].architecture,
								 indices: [p]
							 });
						 } else {
							 // Store type
							 var index;
							 for (var i = 0; i < project_types.length; i++) {
								 if (project_types[i].type == projects[p].architecture) {
									 index = i;
									 break;
								 }
							 }
							 if (index !== undefined) {
								 project_types[index].indices.push(p);
							 }
						 }
					 }
					 projects_list.appendChild(parseProjectItem(projects[p]));
				 }
				 createHeaderSearchTypes();
				 projectsLoaded = true;
				 if (initProjectOpen !== undefined) {
					 selectProject(initProjectOpen.id, undefined, initProjectOpen.historied)();
				 }
			 } else {
				 projects_list.innerHTML = "<br><p><b>Network hiccup!</b><br>There was a problem retrieving project data. <br>Please try again or check the projects tab later.</p>"
				 // Should try again after a time...
			 }
			 projects_list.style.backgroundImage = "url()";
		}
	};

	httpRequest.open('GET', domain+'/api/projects/');
	httpRequest.send();
};

function createHeaderSearchTypes() {
	projectsHighlightedType = undefined;
	TweenLite.to(projects_icon, 1, {opacity: 1});
	projects_header_list.innerHTML = "";
	for (var i = 0; i < project_types.length; i++) {
		if (projects_header_list.innerHTML != "") {
			var divider = document.createElement("p");
			divider.innerHTML = " • ";
			projects_header_list.appendChild(divider);
		}
		var li = document.createElement("li");
		li.innerHTML = project_types[i].type;
		li.onclick = highlightProjectTypes(project_types[i].type);
		projects_header_list.appendChild(li);
	}
	if (headerIndexDisplayed == SCENE_INDEX.PROJECTS) {
		updateStickyHeaderWithScene(SCENE_INDEX.PROJECTS, true);
	}
}
var projectsHighlightedType = undefined;
var highlightProjectTypes = (type) => {
	return () => {
		projectsHighlightedType = type;
		// Cancel highlight
		if (type === undefined) {
			createHeaderSearchTypes();
			return;
		}
		// Find type in array
		var indices = [];
		for (var p = 0; p < project_types.length; p++) {
			if (project_types[p].type == type) {
				indices = project_types[p].indices;
				break;
			}
		}
		// Update list visuals
		for (var i = 0; i < projects_icon.length; i++) {
			if (indices.includes(i)) {
				// highlight
				TweenLite.to(projects_icon[i], 1, {opacity: 1});
			} else {
				// not highlighted
				TweenLite.to(projects_icon[i], 1, {opacity: 0.5});
			}
		}
		// Update header with selection
		projects_header_list.innerHTML = "";
		var li = document.createElement("li");
		li.innerHTML = type;
		li.onclick = highlightProjectTypes();
		projects_header_list.appendChild(li);
		// Update sticky header if necessary
		if (headerIndexDisplayed == SCENE_INDEX.PROJECTS) {
			stickyHeader.innerHTML = "";
			var ul = document.createElement("ul");
			ul.className = "projects--header-content";
			stickyHeader.appendChild(ul);
			var li = document.createElement("li");
			li.innerHTML = type;
			li.onclick = highlightProjectTypes();
			ul.appendChild(li);
		}
	};
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
			iframe.src = "https://www.youtube.com/embed/" + link;
			project_imageZoom_image.appendChild(iframe);
		}
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
project_imageZoom_left.onclick = () => {
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

// Display the image indexed at the next number with the image zoomer
project_imageZoom_right.onclick = () => {
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

// Image in the image zoomer can be clicked to continue to next or previous image
project_imageZoom_image.onclick = () => {
	if (imageBrowseSelectionRight) {
		imageZoomed_right()();
	} else {
		imageZoomed_left()();
	}
};


// ============================================================================================= Init =========

(function init() {

	populateProjectItems();

	// Button for closing the currently opened project
	projects_expanded_closeButton.onclick = selectProject();
})();
