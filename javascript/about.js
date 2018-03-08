// initializes some about scene components

// =========================================================== variables =======

var about_profile_picture = document.getElementById("about--profile-picture");
var about_profile_cover = document.getElementById("about--profile-cover");
var about_profile_links = document.getElementById('about--profile-links').getElementsByTagName('li');
var about_scrollable = document.getElementById("about--scrollable");
var about_header_author = document.getElementById('about-header-author');
var about_profile_subtext = document.getElementById('about--profile-subtext');

// ==================================== Init scrollable content region =========

(function init() {

  var scrollContainer = document.getElementById("about--scrollable");
  var scene_about = document.getElementById("scene-about");
  var about_header = document.getElementById("about--header");

  var parallax = function() {
    return function() {
      var offset = Math.min(-scrollContainer.scrollTop * 0.4, 0);
      about_profile_cover.style.transform = "translateY(" + offset + "px)";
    };
  };
  scrollContainer.onscroll = parallax();

})();

// ============================================= Init Link Category Clicks =====

(function initLinks() {

  var scrollContainer = document.getElementById("about--scrollable");

  var clickLink = function(elem) {
    return function() {
      var offset = elem.offsetTop - 60;
      TweenLite.to(scrollContainer, 0.4, {scrollTo: offset, ease: Power2.easeIn});
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
