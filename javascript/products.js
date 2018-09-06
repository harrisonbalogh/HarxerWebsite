
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

	let productImageLists = document.getElementsByClassName('product-imageList');

	// Initialize expanding feature of product images containers
	let productImageContainers = document.getElementsByClassName('product-imageContainer');
	let productReadMoreButtons = document.getElementsByClassName('product-description-readMore');
	let productContainers = document.getElementsByClassName('product-container');
	let productPosterImages = document.getElementsByClassName('product-image');
	let productNames = document.getElementsByClassName('product-name');
	for (var i = 0; i < productImageContainers.length; i++) {

		// Ignore setup if this product does not have images in the image list
		if (productImageLists[i].children.length == 0) {
			productReadMoreButtons[i].style.opacity = 0;
			continue;
		}

		productReadMoreButtons[i].style.cursor = "pointer";
		productPosterImages[i].style.cursor = "pointer";

		// Initialize image tiles hover effect
		for (var c = 0; c < productImageLists[i].children.length; c++) {
			var child = productImageLists[i].children[c];
			var enterImage = function() {
				return function() {
					TweenLite.to(this, 0.2, {backgroundSize: "95%"});
				};
			};
			var leaveImage = function() {
				return function() {
					TweenLite.to(this, 0.8, {backgroundSize: "90%"});
				};
			};
			child.onmouseenter = enterImage();
			child.onmouseleave = leaveImage();
			child.onmouseup = productZoom("url(/images/product_"+productNames[i].innerHTML.toLowerCase()+"_p" + (c+1) + "@2x.png)");
			project_imageZoom_right.style.opacity = 0;
			project_imageZoom_left.style.opacity = 0;
		}

		// Initialize width of horizontally scrolled image list
		let width = productImageLists[i].children.length * (productImageLists[i].children[0].offsetWidth + 5);
		productImageLists[i].style.width = width + "px";

		let clickReadMore = function(i) {
			return function() {
				if (productContainers[i].offsetHeight == 424) { // Check expanded state
					productReadMoreButtons[i].innerHTML = "Hide Images";

					let scrollToVisible = function() { // Make images visible in window
						let goalYPos = productImageContainers[i].offsetTop - content.offsetTop + 320;
						let viewHeight = content.offsetHeight - 60 - content.offsetTop;
						if (content.scrollTop > goalYPos || goalYPos > content.scrollTop + viewHeight) {
							let padBot = 10;
							TweenLite.to(content, 0.3, {scrollTo: (goalYPos - viewHeight + padBot)});
						}
					}
					TweenLite.to(productContainers[i], 0.3, {height: "200px", onComplete: scrollToVisible});
					TweenLite.to(productImageContainers[i], 0.20, {delay: 0.12, height: "320px"});

				} else { // collapse images

					productReadMoreButtons[i].innerHTML = "Expand Images";
					TweenLite.to(productImageContainers[i], 0.2, {height: "0"});
					TweenLite.to(productContainers[i], 0.25, {delay: 0.09, height: "424px"});
				}
			};
		};
		productReadMoreButtons[i].onclick = clickReadMore(i);
		productPosterImages[i].onclick = clickReadMore(i);
		let enterImages = function(i) {
			return function() {
				productReadMoreButtons[i].style.color = __color_accent;
			};
		};
		productPosterImages[i].onmouseenter = enterImages(i);
		productReadMoreButtons[i].onmouseenter = enterImages(i); // need in script
		let exitImages = function(i) {
			return function() {
				productReadMoreButtons[i].style.color = __color_dominant;
			};
		};
		productPosterImages[i].onmouseleave = exitImages(i);
		productReadMoreButtons[i].onmouseleave = exitImages(i); // need in script
	}

})();
