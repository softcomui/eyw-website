/**
  # Main JS File
  
  # @package  eyw
  # @author   Tonye Dickson <itztonye@gmail.com>
*/


var mobileNav = document.querySelector(".mobile-nav");

function showmenu(x) {
    x.classList.toggle("change");
    mobileNav.classList.toggle("open-nav");
}


var scrollPosition = window.scrollY;
var logoContainer = document.querySelector(".site-header");
var dark = document.querySelector(".bg-dark");
var light = document.querySelector(".bg-light");

if ( logoContainer.classList.contains("bg-dark")) {
    window.addEventListener('scroll', function() {
        scrollPosition = window.scrollY;
        if (scrollPosition >= 10) {
            dark.classList.add('bg-bdark');
        } else {
            dark.classList.remove('bg-bdark');
        }
    });
}


if ( logoContainer.classList.contains("bg-light")) {
    window.addEventListener('scroll', function() {
        scrollPosition = window.scrollY;
        if (scrollPosition >= 10) {
            light.classList.add('bg-white');
            light.classList.add('bottomshadow');
        } else {
            light.classList.remove('bg-white');
            light.classList.remove('bottomshadow');
        }
    });
}


///////////////////
//  handling photoswipe
///////////////////



var initPhotoSwipeFromDOM = function(gallerySelector) {

// parse slide data (url, title, size ...) from DOM elements 
// (children of gallerySelector)
var parseThumbnailElements = function(el) {
    var thumbElements = el.childNodes,
        numNodes = thumbElements.length,
        items = [],
        figureEl,
        linkEl,
        size,
        item;

    for(var i = 0; i < numNodes; i++) {

        figureEl = thumbElements[i]; // <figure> element

        // include only element nodes 
        if(figureEl.nodeType !== 1) {
            continue;
        }

        linkEl = figureEl.children[0]; // <a> element

        size = linkEl.getAttribute('data-size').split('x');

        // create slide object
        item = {
            src: linkEl.getAttribute('href'),
            w: parseInt(size[0], 10),
            h: parseInt(size[1], 10)
        };



        if(figureEl.children.length > 1) {
            // <figcaption> content
            item.title = figureEl.children[1].innerHTML; 
        }

        if(linkEl.children.length > 0) {
            // <img> thumbnail element, retrieving thumbnail url
            item.msrc = linkEl.children[0].getAttribute('src');
        } 

        item.el = figureEl; // save link to element for getThumbBoundsFn
        items.push(item);
    }

    return items;
};

// find nearest parent element
var closest = function closest(el, fn) {
    return el && ( fn(el) ? el : closest(el.parentNode, fn) );
};

// triggers when user clicks on thumbnail
var onThumbnailsClick = function(e) {
    e = e || window.event;
    e.preventDefault ? e.preventDefault() : e.returnValue = false;

    var eTarget = e.target || e.srcElement;

    // find root element of slide
    var clickedListItem = closest(eTarget, function(el) {
        return (el.tagName && el.tagName.toUpperCase() === 'FIGURE');
    });

    if(!clickedListItem) {
        return;
    }

    // find index of clicked item by looping through all child nodes
    // alternatively, you may define index via data- attribute
    var clickedGallery = clickedListItem.parentNode,
        childNodes = clickedListItem.parentNode.childNodes,
        numChildNodes = childNodes.length,
        nodeIndex = 0,
        index;

    for (var i = 0; i < numChildNodes; i++) {
        if(childNodes[i].nodeType !== 1) { 
            continue; 
        }

        if(childNodes[i] === clickedListItem) {
            index = nodeIndex;
            break;
        }
        nodeIndex++;
    }



    if(index >= 0) {
        // open PhotoSwipe if valid index found
        openPhotoSwipe( index, clickedGallery );
    }
    return false;
};

// parse picture index and gallery index from URL (#&pid=1&gid=2)
var photoswipeParseHash = function() {
    var hash = window.location.hash.substring(1),
    params = {};

    if(hash.length < 5) {
        return params;
    }

    var vars = hash.split('&');
    for (var i = 0; i < vars.length; i++) {
        if(!vars[i]) {
            continue;
        }
        var pair = vars[i].split('=');  
        if(pair.length < 2) {
            continue;
        }           
        params[pair[0]] = pair[1];
    }

    if(params.gid) {
        params.gid = parseInt(params.gid, 10);
    }

    return params;
};

var openPhotoSwipe = function(index, galleryElement, disableAnimation, fromURL) {
    var pswpElement = document.querySelectorAll('.pswp')[0],
        gallery,
        options,
        items;

    items = parseThumbnailElements(galleryElement);

    // define options (if needed)
    options = {

        // define gallery index (for URL)
        galleryUID: galleryElement.getAttribute('data-pswp-uid'),

        getThumbBoundsFn: function(index) {
            // See Options -> getThumbBoundsFn section of documentation for more info
            var thumbnail = items[index].el.getElementsByTagName('img')[0], // find thumbnail
                pageYScroll = window.pageYOffset || document.documentElement.scrollTop,
                rect = thumbnail.getBoundingClientRect(); 

            return {x:rect.left, y:rect.top + pageYScroll, w:rect.width};
        }

    };

    // PhotoSwipe opened from URL
    if(fromURL) {
        if(options.galleryPIDs) {
            // parse real index when custom PIDs are used 
            // http://photoswipe.com/documentation/faq.html#custom-pid-in-url
            for(var j = 0; j < items.length; j++) {
                if(items[j].pid == index) {
                    options.index = j;
                    break;
                }
            }
        } else {
            // in URL indexes start from 1
            options.index = parseInt(index, 10) - 1;
        }
    } else {
        options.index = parseInt(index, 10);
    }

    // exit if index not found
    if( isNaN(options.index) ) {
        return;
    }

    if(disableAnimation) {
        options.showAnimationDuration = 0;
    }

    // Pass data to PhotoSwipe and initialize it
    gallery = new PhotoSwipe( pswpElement, PhotoSwipeUI_Default, items, options);
    gallery.init();
};

// loop through all gallery elements and bind events
var galleryElements = document.querySelectorAll( gallerySelector );

for(var i = 0, l = galleryElements.length; i < l; i++) {
    galleryElements[i].setAttribute('data-pswp-uid', i+1);
    galleryElements[i].onclick = onThumbnailsClick;
}

// Parse URL and open gallery if it contains #&pid=3&gid=1
var hashData = photoswipeParseHash();
    if(hashData.pid && hashData.gid) {
        openPhotoSwipe( hashData.pid ,  galleryElements[ hashData.gid - 1 ], true, true );
    }
};


// execute above function
initPhotoSwipeFromDOM('.my-gallery');



///////////////////
//  handling the modal for the video player
///////////////////



var modal = document.querySelector("#myModal");

var modaliframe = document.querySelector(".modal-iframe");
var closebtn = document.querySelector(".video-close");


if (modal) {
    if (document.querySelector(".play-button")) {
    
        var openbtn = document.querySelector(".play-button");
        
        openmodal = function() {
            modal.style.display = "block";
            var videolink = openbtn.getAttribute("data-video-link");
            modaliframe.setAttribute("src", videolink);
        }
        
        openbtn.addEventListener("click", openmodal);
    
    } else {
        
        var actionbtn = document.querySelector(".action-button");
        var everyonebtn = document.querySelector(".everyone-button");
        var businessbtn = document.querySelector(".business-button");
        
        openActionModal = function() {
            modal.style.display = "block";
            var videolink = actionbtn.getAttribute("data-video-link");
            modaliframe.setAttribute("src", videolink);
        }
        
        openEveryoneModal = function() {
            modal.style.display = "block";
            var videolink = everyonebtn.getAttribute("data-video-link");
            modaliframe.setAttribute("src", videolink);
        }
        
        openBusinessModal = function() {
            modal.style.display = "block";
            var videolink = businessbtn.getAttribute("data-video-link");
            modaliframe.setAttribute("src", videolink);
        }
    
        actionbtn.addEventListener("click", openActionModal);
        everyonebtn.addEventListener("click", openEveryoneModal);
        businessbtn.addEventListener("click", openBusinessModal);
    }
    
    
    
    closemodal = function() {
        modal.style.display = "none";
        modaliframe.setAttribute("src", "");
    }
    
    
    closebtn.addEventListener("click", closemodal);
}




window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}


///////////////////
//  handling the studio gallery
///////////////////


var contentImages = document.querySelectorAll('[data-gallery] p img')
if (contentImages) {
    contentImages.forEach((element, i) => {  
        let parentImg    = element.closest('p'),
            figure       = document.createElement('figure')

        figure.setAttribute("itemprop", "associatedMedia")
        figure.setAttribute("itemscope", "")
        figure.setAttribute("itemtype", "http://schema.org/ImageObject")
        figure.classList.add("post")

        image_width = element.naturalWidth;
        image_height = element.naturalHeight;

        figure.innerHTML = `
            <a href="${element.src}" itemprop="contentUrl" data-size="${image_width}x${image_height}">
                <img src="${element.src}" alt="${element.alt}" itemprop="thumbnail">
            </a>
        `
        parentImg.parentNode.replaceChild(figure, parentImg)
        console.log("its working till this point")
    })
}