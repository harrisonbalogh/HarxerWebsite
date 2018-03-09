

var textFieldPassword = document.getElementById("password-input");

document.onkeypress = function(e) {
	console.log(e);
	e = e || window.event;
	console.log("    or " + e);
	if (e.code == "Enter" || e.key == "Enter" || e.keyCode  == 13 || e.charCode == 13) { // charCode is for firefox
    var pass = textFieldPassword.value;
    submit();
	}
};

function submit() {
  var httpRequest = new XMLHttpRequest()
  httpRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

  httpRequest.onreadystatechange = function() {
    if (httpRequest.readyState == XMLHttpRequest.DONE) {   // XMLHttpRequest.DONE == 4
       if (httpRequest.status == 200) {
           console.log(httpRequest.responseText);
       }
       else if (httpRequest.status == 400) {
          alert('An error occurred: 400');
       }
       else {
         alert('An unknown error occurred.');
       }
    }
  };

  httpRequest.open('POST', 'https://www.harxer.com/api/login1/');
  httpRequest.send(JSON.stringify({name: hb}));
}
