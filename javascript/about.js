// initializes some about scene components

var language_items = document.getElementById("about--content-section-lang-content").children;

// ============================================= Init Link Category Clicks =====

(function initAboutCategoryLinks() {

  var content = document.getElementById("content");

  var categoryClick = function(elem, img) {
    return function() {
      TweenLite.to(content, 0.4, {scrollTo: elem.offsetTop - 48});
      TweenLite.set(elem.children[0], {delay: 0.3, backgroundImage: "url(/images/icon_"+img+"_inv@2x.png)"});
      TweenLite.set(elem.children[0], {delay: 1.0, backgroundImage: "url(/images/icon_"+img+"@2x.png)"});
      TweenLite.set(elem.children[1], {delay: 0.3, color: __color_accent});
      TweenLite.set(elem.children[1], {delay: 1.0, color: __color_background});
    };
  };

  let nav_icon_lang = document.getElementById("about--navigator-icon-lang");
  let section_lang = document.getElementById("about--content-section-lang");
  nav_icon_lang.onclick = categoryClick(section_lang, "computerCode");

  let nav_icon_work = document.getElementById("about--navigator-icon-work");
  let section_work = document.getElementById("about--content-section-work");
  nav_icon_work.onclick = categoryClick(section_work, "briefcase");

  let nav_icon_educ = document.getElementById("about--navigator-icon-educ");
  let section_educ = document.getElementById("about--content-section-educ");
  nav_icon_educ.onclick = categoryClick(section_educ, "graduationCap");

  let nav_icon_tool = document.getElementById("about--navigator-icon-tool");
  let section_tool = document.getElementById("about--content-section-tool");
  nav_icon_tool.onclick = categoryClick(section_tool, "gearHammer");

})();

function populateLanguages() {

  function languageClicked(i) {
    return () => {
      headerButtons[HEADER_BUTTON_INDEX.PROJECTS].click();
      language_items[i].children[1].innerHTML = "Go to.";
      highlightProjectTypes(language_items[i].children[0].innerHTML)();
    }
  }
  function languageEntered(i) {
    return () => {
      language_items[i].children[1].innerHTML = "View in projects";
    }
  }
  function languageExited(i, p) {
    return () => {
      language_items[i].children[1].innerHTML = project_types[p].indices.length + " project"+((project_types[p].indices.length==1 ? "" : "s"))+" listed";
    }
  }

  // Update text for language items.
  for (var l = 0; l < language_items.length; l++) {
    language_items[l].children[1].innerHTML = "No projects listed";
    for (var p = 0; p < project_types.length; p++) {
      if (project_types[p].type == language_items[l].children[0].innerHTML) {
        language_items[l].children[1].innerHTML = project_types[p].indices.length + " project"+((project_types[p].indices.length==1 ? "" : "s"))+" listed";
        language_items[l].style.cursor = "pointer";
        language_items[l].onclick = languageClicked(l);
        language_items[l].onmouseenter = languageEntered(l);
        language_items[l].onmouseleave = languageExited(l, p);
        break;
      }
    }
  }
}
