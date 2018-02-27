
// ===== Image Zoomer for Products

var productZoom = function(url) {
	return function() {
    project_imageZoom_image.style.backgroundImage = url;
    project_imageZoom_cover.style.zIndex = 8;
    TweenLite.to(project_imageZoom_cover, 0.25, {opacity: 0.6});
    project_imageZoom_container.style.zIndex = 9;
    TweenLite.to(project_imageZoom_container, 0.25, {transform: "scale(1)"});
    TweenLite.set(project_imageZoom_left, {zIndex: -9, opacity: 0});
    TweenLite.set(project_imageZoom_right, {zIndex: -9, opacity: 0});
	};
};

// =====

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
    child.onmouseup = productZoom("url(/images/product_p" + (i+1) + "@2x.png)");
    project_imageZoom_right.style.opacity = 0;
    project_imageZoom_left.style.opacity = 0;
  }

  var productsScroller = document.getElementById('products-scroller');
  var productName = document.getElementById('product-name');
  var productStickyHeader = document.getElementById('products-stickyHeader');
  var productStickyHeaderName = document.getElementById('products-stickyHeaderName');
  var productsScroll = function() {
    return function() {
      if (productsScroller.scrollTop > productName.offsetTop + 8) {
        productName.style.opacity = 0;
        productStickyHeader.style.opacity = 1;
        var diff = productsScroller.scrollTop - (productName.offsetTop + 8);
        var ratio = Math.min(diff/(productName.offsetHeight), 1);
        var h = Math.max(productName.offsetHeight - diff, 36);
        productStickyHeader.style.height = h + "px";
        productStickyHeaderName.style.fontSize = Math.max(h - 12, 32) + "px";
        productStickyHeaderName.style.transform = "translateY(" + (-(1-ratio)*8) + "px)";
        productStickyHeader.style.backgroundColor = "rgba(234,236,238," + ratio + ")";
        productStickyHeader.style.borderBottom = "1px solid rgba(44,54,64," + ratio + ")";
      } else {
        productName.style.opacity = 1;
        productStickyHeader.style.opacity = 0;
      }
    };
  };
  productsScroller.onscroll = productsScroll();
})();
