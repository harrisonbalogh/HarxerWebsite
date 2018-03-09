

var textFieldPassword = document.getElementById("password-input");

function login1() {
  var httpRequest = new XMLHttpRequest();

  httpRequest.onreadystatechange = function() {
    if (httpRequest.readyState == XMLHttpRequest.DONE) {   // XMLHttpRequest.DONE == 4
       if (httpRequest.status == 200) {
         var response = JSON.parse(httpRequest.responseText);

         // https://github.com/Caligatio/jsSHA
         var shaObj = new jsSHA("SHA-256", "TEXT");
         shaObj.update(textFieldPassword.value + response.salt);
         var pass_hash = shaObj.getHash("HEX");

         shaObj = new jsSHA("SHA-256", "TEXT");
         shaObj.setHMACKey(pass_hash, "TEXT");
         shaObj.update(response.challenge+"");
         var hmac = shaObj.getHMAC("HEX");

         login2(hmac);
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
  httpRequest.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  // httpRequest.send("{\"name\": \"hb\"}");
  httpRequest.send(JSON.stringify({ name: "hb"}));
};

function login2(postTag) {
  var httpRequest = new XMLHttpRequest();

  httpRequest.onreadystatechange = function() {
    if (httpRequest.readyState == XMLHttpRequest.DONE) {   // XMLHttpRequest.DONE == 4
       if (httpRequest.status == 200) {
         var response = JSON.parse(httpRequest.responseText);

         if (response.success) {
           console.log("Correct credentials!");
         } else {
           console.log("Bad credentials!");
         }
       }
       else if (httpRequest.status == 400) {
          alert('An error occurred: 400');
       }
       else {
         alert('An unknown error occurred.');
       }
    }
  };

  httpRequest.open('POST', 'https://www.harxer.com/api/login2/');
  httpRequest.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  // httpRequest.send("{\"name\": \"hb\"}");
  httpRequest.send(JSON.stringify({ name: "hb", tag: postTag}));
};

document.onkeypress = function(e) {
	console.log(e);
	e = e || window.event;
	console.log("    or " + e);
	if (e.code == "Enter" || e.key == "Enter" || e.keyCode  == 13 || e.charCode == 13) { // charCode is for firefox
    // var pass = textFieldPassword.value;
    login1();
	}
};
