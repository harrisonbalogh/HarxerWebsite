
var logoutButton = document.getElementById('header-button-right');
var returnButton = document.getElementById('header-button-left');

var projectList = document.getElementById('project-list');

// ======================================================= Init

(function init() {

  // Redirect if a valid JWT is not present.
  validateAccess();

  // Initialize header buttons
  logoutButton.onclick = function() { logout(); };

  // var projects = getProjects();
  //
  // for (var p = 0; p < projects.length; p++) {
  //   projectList.appendChild = parseProject(projects[p]);
  // }

  document.getElementById('test-button-get-projects').onclick = function() {
    var projects = getProjects();
    console.log(projects);
  };


})();

// ======================================================= Project Convenience Functions

function parseProject(project) {

}

function newProject() {

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

function logout() {
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

function getProjects() {
  var httpRequest = new XMLHttpRequest();

  httpRequest.onreadystatechange = function() {
    if (httpRequest.readyState == XMLHttpRequest.DONE) {   // XMLHttpRequest.DONE == 4
       if (httpRequest.status == 200) {

         return JSON.parse(httpRequest.responseText);

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
