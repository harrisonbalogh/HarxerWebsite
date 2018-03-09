
var logoutButton = document.getElementById('header-button-right');
var returnButton = document.getElementById('header-button-left');

(function validateAccess() {
  var httpRequest = new XMLHttpRequest();

  httpRequest.onreadystatechange = function() {
    if (httpRequest.readyState == XMLHttpRequest.DONE) {   // XMLHttpRequest.DONE == 4
       if (httpRequest.status == 200) {
         // Successful login!
         console.log("Passed middleware: " + httpRequest.responseText);
         //
         // // Update address bar
         // if (history.replaceState) {
         //   var newurl = window.location.protocol + "//" + window.location.host + "/" + "admin/";
         //   console.log("pathname: "+window.location.pathname);
         //   console.log("href: "+window.location.href);
         //   window.history.replaceState({path:newurl}, null, newurl);
         // }

       } else if (httpRequest.status == 403) {
         // Bad or expired credentials
         alert('Bad or expired credentials: 403!');
         // window.location.href = "index.html";
       }
       else if (httpRequest.status == 400) {
          alert('An error occurred: 400');
       }
       else {
         alert('An unknown error occurred.');
       }
    }
  };

  httpRequest.open('GET', 'https://www.harxer.com/api/validate/');
  httpRequest.send();
})();

(function initHeaderButtons() {
  logoutButton.onclick = function() {
    logout();
  };
  // sceneButtons[s].onmouseenter  = mouseEnter_headerButton(s);
  // sceneButtons[s].onmouseleave  = mouseLeave_headerButton(s);

})();

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
       }
       else if (httpRequest.status == 400) {
          alert('An error occurred: 400');
       }
       else {
         alert('An unknown error occurred.');
       }
    }
  };

  httpRequest.open('GET', 'https://www.harxer.com/api/invalidate/');
  httpRequest.send();
}
