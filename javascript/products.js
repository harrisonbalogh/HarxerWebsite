
(function initialize() {

  // Initialize width of horizontal scorlling image list
  var productImageList = document.getElementById('product-imageList');
  var childs = productImageList.children.length;
  if (childs > 0) {
    var width = childs * 606;
    productImageList.style.width = width + "px";
  }

  // Initialize image tiles
  for (var i = 0; i < childs; i++) {
    var child = productImageList.children[i];
    console.log("Child " + child);
    var enterImage = function() {
      return function() {
        // TweenLite.to(this, 0.2, {transform: "scale(1.1)"});
        TweenLite.to(this, 0.2, {backgroundSize: "95%", backgroundColor: "transparent"});
      };
    };
    var leaveImage = function() {
      return function() {
        // TweenLite.to(this, 0.4, {transform: "scale(1)"});
        TweenLite.to(this, 0.8, {backgroundSize: "90%", backgroundColor: __color_background});
      };
    };
    child.onmouseenter = enterImage();
    child.onmouseleave = leaveImage();
    child.onmouseup = imageZoomed_open("url(images/product_p" + (i+1) + "@2x.png)");
    project_imageZoom_right.style.opacity = 0;
    project_imageZoom_left.style.opacity = 0;
  }
})();
