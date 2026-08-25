/* =========================================================
   SHERPAS PUBLIC GALLERY
   Dynamic Gallery + Lightbox
========================================================= */

const GALLERY_API =
    "https://script.google.com/macros/s/AKfycbxIEL_zgLSHaadD0WcaQx3cIJHePMQtiBCeORa7tCpyHWF7vE4fAO9sgqStGRCg95Ja/exec";

let galleryPhotos = [];
let currentImageIndex = 0;


/* =========================================================
   LOAD GALLERY
========================================================= */

async function loadPublicGallery() {

    console.log("SHERPAS Public Gallery loading...");

    const galleryGrid = document.querySelector(".gallery-grid");

    if (!galleryGrid) {
        console.error("Gallery grid not found.");
        return;
    }

    try {
        
        const response = await fetch(
            `${GALLERY_API}?action=GET_GALLERY`
        );

        const data = await response.json();

        console.log("Gallery API response:", data);

        if (!data.success || !Array.isArray(data.data)) {
            throw new Error("Invalid gallery API response.");
        }

        galleryPhotos = data.data;

        renderGallery(galleryPhotos);

    } catch (error) {

        console.error("Gallery loading error:", error);

        galleryGrid.innerHTML = `
            <div class="gallery-error">
                <i class="fas fa-triangle-exclamation"></i>
                <p>Unable to load gallery.</p>
            </div>
        `;
    }
}


/* =========================================================
   RENDER GALLERY
========================================================= */

function renderGallery(photos) {

    const galleryGrid =
        document.querySelector(".gallery-grid");

    galleryGrid.innerHTML = "";

    if (!photos.length) {

        galleryGrid.innerHTML = `
            <div class="gallery-empty">
                <i class="fas fa-images"></i>
                <p>No gallery photos available.</p>
            </div>
        `;

        return;
    }


    photos.forEach((photo, index) => {

        const item =
            document.createElement("div");

        item.className = "gallery-item";

        item.innerHTML = `
            <img
                src="${photo.imageURL}"
                alt="${escapeHTML(photo.title || "Sherpas Gallery")}"
                loading="lazy"
                data-index="${index}"
            >
        `;


        const image =
            item.querySelector("img");


        image.addEventListener("click", () => {

            openLightbox(index);

        });


        galleryGrid.appendChild(item);

    });

}


/* =========================================================
   LIGHTBOX HTML
========================================================= */

function createLightbox() {

    if (document.getElementById("galleryLightbox")) {
        return;
    }

    const lightbox =
        document.createElement("div");

    lightbox.id = "galleryLightbox";

    lightbox.innerHTML = `

        <button
            class="lightbox-close"
            aria-label="Close gallery"
        >
            &times;
        </button>


        <button
            class="lightbox-prev"
            aria-label="Previous image"
        >
            &#10094;
        </button>


        <div class="lightbox-content">

            <img
                id="lightboxImage"
                src=""
                alt=""
            >

            <div class="lightbox-caption">

                <div
                    id="lightboxTitle"
                    class="lightbox-title"
                ></div>

                <div
                    id="lightboxDescription"
                    class="lightbox-description"
                ></div>

                <div
                    id="lightboxCounter"
                    class="lightbox-counter"
                ></div>

            </div>

        </div>


        <button
            class="lightbox-next"
            aria-label="Next image"
        >
            &#10095;
        </button>

    `;

    document.body.appendChild(lightbox);


    /* Close */

    lightbox
        .querySelector(".lightbox-close")
        .addEventListener("click", closeLightbox);


    /* Previous */

    lightbox
        .querySelector(".lightbox-prev")
        .addEventListener("click", previousImage);


    /* Next */

    lightbox
        .querySelector(".lightbox-next")
        .addEventListener("click", nextImage);


    /* Click outside image */

    lightbox.addEventListener("click", (event) => {

        if (event.target === lightbox) {

            closeLightbox();

        }

    });


    /* Keyboard */

    document.addEventListener("keydown", (event) => {

        if (!lightbox.classList.contains("active")) {
            return;
        }


        if (event.key === "Escape") {

            closeLightbox();

        }


        if (event.key === "ArrowLeft") {

            previousImage();

        }


        if (event.key === "ArrowRight") {

            nextImage();

        }

    });


    /* Mobile swipe */

    let touchStartX = 0;
    let touchEndX = 0;


    lightbox.addEventListener("touchstart", (event) => {

        touchStartX =
            event.changedTouches[0].screenX;

    });


    lightbox.addEventListener("touchend", (event) => {

        touchEndX =
            event.changedTouches[0].screenX;

        handleSwipe();

    });


    function handleSwipe() {

        const difference =
            touchEndX - touchStartX;


        if (Math.abs(difference) < 50) {
            return;
        }


        if (difference > 0) {

            previousImage();

        } else {

            nextImage();

        }

    }

}


/* =========================================================
   OPEN LIGHTBOX
========================================================= */

function openLightbox(index) {

    if (!galleryPhotos.length) {
        return;
    }


    createLightbox();


    currentImageIndex = index;


    updateLightbox();


    const lightbox =
        document.getElementById("galleryLightbox");


    lightbox.classList.add("active");


    document.body.classList.add(
        "gallery-lightbox-open"
    );

}


/* =========================================================
   UPDATE LIGHTBOX
========================================================= */

function updateLightbox() {

    const photo =
        galleryPhotos[currentImageIndex];


    if (!photo) {
        return;
    }


    const image =
        document.getElementById("lightboxImage");

    const title =
        document.getElementById("lightboxTitle");

    const description =
        document.getElementById("lightboxDescription");

    const counter =
        document.getElementById("lightboxCounter");


    image.src =
        photo.imageURL;

    image.alt =
        photo.title || "Sherpas Gallery";


    title.textContent =
        photo.title || "";


    description.textContent =
        photo.description || "";


    counter.textContent =
        `${currentImageIndex + 1} / ${galleryPhotos.length}`;

}


/* =========================================================
   NEXT IMAGE
========================================================= */

function nextImage() {

    if (!galleryPhotos.length) {
        return;
    }


    currentImageIndex++;

    if (
        currentImageIndex >=
        galleryPhotos.length
    ) {

        currentImageIndex = 0;

    }


    updateLightbox();

}


/* =========================================================
   PREVIOUS IMAGE
========================================================= */

function previousImage() {

    if (!galleryPhotos.length) {
        return;
    }


    currentImageIndex--;

    if (currentImageIndex < 0) {

        currentImageIndex =
            galleryPhotos.length - 1;

    }


    updateLightbox();

}


/* =========================================================
   CLOSE LIGHTBOX
========================================================= */

function closeLightbox() {

    const lightbox =
        document.getElementById("galleryLightbox");


    if (!lightbox) {
        return;
    }


    lightbox.classList.remove("active");


    document.body.classList.remove(
        "gallery-lightbox-open"
    );

}


/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value;

    return div.innerHTML;

}


/* =========================================================
   START
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    loadPublicGallery
);

