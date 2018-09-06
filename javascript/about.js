// initializes some about scene components

// ============================================= Init Link Category Clicks =====

(function initLinks() {

  var clickLink = function(elem) {
    return function() {
      var offset = elem.offsetTop - 60;
      TweenLite.to(content, 0.4, {scrollTo: offset, ease: Power2.easeIn});
      TweenLite.to(elem, 0.2, {delay: 0.4, color: __color_dominant});
      TweenLite.to(elem, 3, {delay: 1.5, color: __color_background});
    };
  };

  var linkElements = document.getElementById('about--content-links').getElementsByTagName('li');
  for (x = 0; x < linkElements.length; x++) {
    var linkDestination = document.getElementById("about-dest-" + (x+1));
    linkElements[x].onclick = clickLink(linkDestination);
  }
})();


(function initProjectsIconButton() {

  var projectButtons = document.getElementsByClassName("projectsIcon");
  for (p = 0; p < projectButtons.length; p++) {
    projectButtons[p].onclick = function() {
      // Simulate projects header button click
      document.getElementById('header-button-projects').click();
    }
  }

})();
