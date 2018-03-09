
function validateAccess() {
  var httpRequest = new XMLHttpRequest();

  httpRequest.onreadystatechange = function() {
    if (httpRequest.readyState == XMLHttpRequest.DONE) {   // XMLHttpRequest.DONE == 4
       if (httpRequest.status == 200) {
         // Successful login!
         console.log("Passed middleware: " + httpRequest.responseText);

         // Update address bar
         if (history.replaceState) {
           var newurl = window.location.protocol + "//" + window.location.host + "/" + "temp";
           window.history.replaceState({path:newurl}, null, newurl);
         }

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

  httpRequest.open('GET', 'https://www.harxer.com/api/validate/');
  httpRequest.send();
}

validateAccess();
