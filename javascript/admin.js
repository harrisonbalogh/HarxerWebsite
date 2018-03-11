
var logoutButton = document.getElementById('header-button-right');
var returnButton = document.getElementById('header-button-left');

var projectList = document.getElementById('project-list');

var projectEditorCover = document.getElementById('project-editor-cover');
var projectEditorContainer = document.getElementById('project-editor-container');
var pe_title = document.getElementById('title-input');
var pe_id = document.getElementById('id-input');
var pe_architecture = document.getElementById('architecture-input');
var pe_platform = document.getElementById('platform-input');
var pe_github = document.getElementById('github-link-input');
var pe_youtube = document.getElementById('youtube-link-input');
var pe_descrip = document.getElementById('description-textarea');

var selectedProjectId = "";
var selectedProjectUploadDate = "";
var manualIdentifierEntry = false;

// ======================================================= Project Convenience Functions

function parseProject(project) {

  var li = document.createElement("li");
  li.setAttribute("id", "project-list-" + project.id);

  var frame = document.createElement("div");
  frame.setAttribute("class", "project-list-frame");
  li.appendChild(frame);

  var title = document.createElement("p");
  title.setAttribute("class", "project-list-title");
  title.innerHTML = project.title;
  li.appendChild(title);

  var date = document.createElement("p");
  date.setAttribute("class", "project-list-date");
  date.innerHTML = project.upload_date;
  li.appendChild(date);

  var icon_youtube = document.createElement("div");
  icon_youtube.setAttribute("class", "project-list-youtube");
  li.appendChild(icon_youtube);

  var icon_github = document.createElement("div");
  icon_github.setAttribute("class", "project-list-github");
  li.appendChild(icon_github);

  li.onclick = selectProject(project.id);

  return li;
}

var newProject = function() {
  return function() {

    selectedProjectId = "new";
    projectEditorCover.style.zIndex = 8;

    pe_title.value = "";
    pe_id.value = "";
    pe_architecture.value = "";
    pe_platform.value = "";
    pe_github.value = "";
    pe_youtube.value = "";
    pe_descrip.value = "";

  }
}

var selectProject = function(id) {
	return function() {
    console.log("Selecting project " + id);
    selectedProjectId = id;
    projectEditorCover.style.zIndex = 8;

    populateProjectEditor(id);

  };
};

var closeProject = function() {
	return function() {
    selectedProjectId = "";
    selectedProjectUploadDate = "";
    populateProjects();
    projectEditorCover.style.zIndex = -8;
	};
};

function produceIdentifierFromTitle(title) {
  title = title.trim()
  title = title.toLowerCase();
  // title = title.replace(" ", "_");
  title = title.split(" ").join("_");
  return title;
}

// ======================================================= API Interactions

function validateAccess() {
  var httpRequest = new XMLHttpRequest();
  httpRequest.withCredentials = true;
  // httpRequest.

  httpRequest.onreadystatechange = function() {
    if (httpRequest.readyState == XMLHttpRequest.DONE) { // == 4
       if (httpRequest.status == 200) {
         // Successful login!
         // Update address bar
         if (history.replaceState) {
           var newurl = window.location.protocol + "//" + window.location.host + "/" + "admin/";
           window.history.replaceState({path:newurl}, null, newurl);
         }

       } else if (httpRequest.status == 403) {
         // Bad or expired credentials
         window.location.href = "index.html";
         // alert('Bad creds.');
       }
       else if (httpRequest.status == 400) {
         window.location.href = "index.html";
          // alert('An error occurred: 400');
       }
       else {
         window.location.href = "index.html";
         // alert('An unknown error occurred: ' + httpRequest.status);
       }
    }
  };

  httpRequest.open('GET', 'https://www.harxer.com/api/validate/');
  httpRequest.send();
}

var logout = function() {
  return function () {
    var httpRequest = new XMLHttpRequest();

    httpRequest.onreadystatechange = function() {
      if (httpRequest.readyState == XMLHttpRequest.DONE) {   // XMLHttpRequest.DONE == 4
         if (httpRequest.status == 200) {

           // Deleted cookie
           window.location.href = "index.html";

         } else if (httpRequest.status == 403) {
           // Bad or expired credentials
           window.location.href = "index.html";
         } else {
           // Should try again after a time...
         }
      }
    };

    httpRequest.open('GET', 'https://www.harxer.com/api/invalidate/');
    httpRequest.send();
  }
}

function populateProjects() {

  // Clear out list
  for (var p = 0; p < projectList.childNodes.length - 1; p++) {
    projectList.removeChild(projectList.childNodes[0]);
  }

  var httpRequest = new XMLHttpRequest();

  httpRequest.onreadystatechange = function() {
    if (httpRequest.readyState == XMLHttpRequest.DONE) {   // XMLHttpRequest.DONE == 4
       if (httpRequest.status == 200) {

         var projects = JSON.parse(httpRequest.responseText)
         // GET all projects
         for (var p = 0; p < projects.length; p++) {
           projectList.insertBefore(parseProject(projects[p]), projectList.firstChild);
         }

       } else if (httpRequest.status == 403) {
         // Bad or expired credentials
         window.location.href = "index.html";
       } else {
         // Should try again after a time...
       }
    }
  };

  httpRequest.open('GET', 'https://www.harxer.com/api/projects/');
  httpRequest.send();
}

function populateProjectEditor(id) {
  var httpRequest = new XMLHttpRequest();

  httpRequest.onreadystatechange = function() {
    if (httpRequest.readyState == XMLHttpRequest.DONE) {   // XMLHttpRequest.DONE == 4
       if (httpRequest.status == 200) {

         var proj = JSON.parse(httpRequest.responseText)
         pe_title.value = proj.title;
         pe_id.value = proj.id;
         if (pe_id.value == produceIdentifierFromTitle(pe_title.value)) {
           manualIdentifierEntry = false;
           pe_id.style.opacity = 0.5;
         } else {
           manualIdentifierEntry = true;
            pe_id.style.opacity = 1;
         }
         pe_architecture.value = proj.architecture;
         pe_platform.value = proj.platform;
         pe_github.value = proj.github_link;
         pe_youtube.value = proj.youtube_link;
         pe_descrip.value = proj.description;
         selectedProjectUploadDate = proj.upload_date;

       } else if (httpRequest.status == 403) {
         // Bad or expired credentials
         window.location.href = "index.html";
       } else {
         // Should try again after a time...
       }
    }
  };

  httpRequest.open('GET', 'https://www.harxer.com/api/project/?id=' + id);
  httpRequest.send();
}

var upsertProject = function() {
  return function() {

    if (pe_id.value.trim() == "") {
      if (pe_title.value.trim() == "") {
        alert("Identifier is required");
        return;
      }
      pe_id.value = produceIdentifierFromTitle(pe_title.value);
    }
    var id = pe_id.value.trim();

    var httpRequest = new XMLHttpRequest();

    httpRequest.onreadystatechange = function() {
      if (httpRequest.readyState == XMLHttpRequest.DONE) {   // XMLHttpRequest.DONE == 4
         if (httpRequest.status == 200) {

           var response = JSON.parse(httpRequest.responseText)
           if (response.success == false) {
             uploadProject();
           }  else {
             error("That identifier is already in use.");
           }

         } else if (httpRequest.status == 403) {
           // Bad or expired credentials
           window.location.href = "index.html";
         } else {
           // Should try again after a time...
         }
      }
    };

    httpRequest.open('GET', 'https://www.harxer.com/api/project/');
    httpRequest.send(JSON.stringify({ id: pe_id.value.trim() }));
  }
}

function uploadProject() {
  var httpRequest = new XMLHttpRequest();

  httpRequest.onreadystatechange = function() {
    if (httpRequest.readyState == XMLHttpRequest.DONE) {   // XMLHttpRequest.DONE == 4
       if (httpRequest.status == 200) {

         var response = JSON.parse(httpRequest.responseText);
         if (response.success != true) {
           alert("Error saving " + pe_id.value);
         } else {
           closeProject()();
         }

       } else if (httpRequest.status == 403) {
         // Bad or expired credentials
         window.location.href = "index.html";
       } else {
         // Should try again after a time...
       }
    }
  };

  httpRequest.open('POST', 'https://www.harxer.com/api/project/');
  httpRequest.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  httpRequest.send(JSON.stringify({
    id: selectedProjectId,
    project: {
      id: pe_id.value,
      title: pe_title.value,
      architecture: pe_architecture.value,
      platform: pe_platform.value,
      description: pe_descrip.value,
      upload_date: (selectedProjectId == "new" ? new Date() : selectedProjectUploadDate),
      update_date: new Date(),
      github_link: pe_github.value,
      youtube_link: pe_youtube.value
    }
  }));
}

function deleteProject() {
  return function() {
    var httpRequest = new XMLHttpRequest();

    httpRequest.onreadystatechange = function() {
      if (httpRequest.readyState == XMLHttpRequest.DONE) {   // XMLHttpRequest.DONE == 4
         if (httpRequest.status == 200) {

           var response = JSON.parse(httpRequest.responseText);

           if (response.success != true) {
             alert("Error deleting project " + selectedProjectId);
           } else {
             closeProject()();
           }

         } else if (httpRequest.status == 403) {
           // Bad or expired credentials
           window.location.href = "index.html";
         } else {
           // Should try again after a time...
         }
      }
    };

    httpRequest.open('DELETE', 'https://www.harxer.com/api/project/');
    httpRequest.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    httpRequest.send(JSON.stringify({
      id: selectedProjectId
    }));
  }
}

// ======================================================= Init

(function init() {

  // Redirect if a valid JWT is not present.
  validateAccess();

  // GET all projects and populate list
  populateProjects();

  // Init new project button
  document.getElementById("project-list-add").onclick = newProject();

  // Initialize header buttons
  logoutButton.onclick = logout();

  // Initialize editor
  document.getElementById('pe-control-cancel').onclick = closeProject();
  document.getElementById('pe-control-save').onclick = upsertProject();
  document.getElementById('pe-control-delete').onclick = deleteProject();

  //pe-control-delete

  pe_id.onfocus = function() {
    pe_id.style.opacity = 1;
  }
  pe_id.onfocusout = function() {
    var id = pe_id.value.trim()
    if (id == produceIdentifierFromTitle(pe_title.value) || id == "") {
      manualIdentifierEntry = false;
      pe_id.style.opacity = 0.5;
      pe_id.value = produceIdentifierFromTitle(pe_title.value);
    } else {
      manualIdentifierEntry = true;
      pe_id.value = id; //trimmed
    }
  }
  pe_id.oninput = function() {
    var id = pe_id.value.trim()
    if (id == produceIdentifierFromTitle(pe_title.value) || id == "") {
      manualIdentifierEntry = false;
    } else {
      manualIdentifierEntry = true;
    }
  }
  pe_title.onfocusout = function() {
    if (!manualIdentifierEntry) {
      pe_id.value = produceIdentifierFromTitle(pe_title.value)
    }
  }

  // TESTING STUFF

  // temp
  // projects = [
  //   {
  //     id: "first_one",
  //     title: "First One",
  //     upload_date: "12/13/93",
  //     description: "Cookin' bebe",
  //     github_link: "www.github.com/harrisonbalogh/firstone",
  //     youtube_link: "/asdf8s0d9f8"
  //   },
  //   {
  //     id: "second_guy",
  //     title: "Second Guy",
  //     upload_date: "12/13/94",
  //     description: "Materialism bebe",
  //     github_link: "www.github.com/harrisonbalogh/secondguy",
  //     youtube_link: "/s8df88fs9"
  //   },
  //   {
  //     id: "second_guy",
  //     title: "This is a Very Long Title Eh?",
  //     upload_date: "12/13/94",
  //     description: "Materialism bebe",
  //     github_link: "www.github.com/harrisonbalogh/secondguy",
  //     youtube_link: "/s8df88fs9"
  //   },
  //   {
  //     id: "second_guy",
  //     title: "Second Guy",
  //     upload_date: "12/13/94",
  //     description: "Materialism bebe",
  //     github_link: "www.github.com/harrisonbalogh/secondguy",
  //     youtube_link: "/s8df88fs9"
  //   }
  // ];

  // temp
  // for (var p = 0; p < projects.length; p++) {
  //   projectList.insertBefore(parseProject(projects[p]), projectList.firstChild);
  // }

})();
