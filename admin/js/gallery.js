/* ==================================================
        SHERPAS GALLERY ADMIN
        CLOUDINARY + GALLERY API
================================================== */


/* ==================================================
        CONFIGURATION
================================================== */

const GALLERY_API =
    "https://script.google.com/macros/s/AKfycbxIEL_zgLSHaadD0WcaQx3cIJHePMQtiBCeORa7tCpyHWF7vE4fAO9sgqStGRCg95Ja/exec";


const CLOUDINARY_CLOUD_NAME =
    "cs4vbzdx";


const CLOUDINARY_UPLOAD_PRESET =
    "sherpas_gallery_upload";


const CLOUDINARY_UPLOAD_URL =
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;


/* ==================================================
        PAGE LOAD
================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeGallery();

    }
);


/* ==================================================
        INITIALIZE
================================================== */

function initializeGallery() {

    const addPhotoBtn =
        document.getElementById("addPhotoBtn");

    const closePhotoModal =
        document.getElementById("closePhotoModal");

    const cancelPhotoBtn =
        document.getElementById("cancelPhotoBtn");

    const photoFile =
        document.getElementById("photoFile");

    const photoForm =
        document.getElementById("photoForm");


    /* ------------------------------------------
            ADD PHOTO BUTTON
    ------------------------------------------ */

    if (addPhotoBtn) {

        addPhotoBtn.addEventListener(
            "click",
            openPhotoModal
        );

    }


    /* ------------------------------------------
            CLOSE BUTTON
    ------------------------------------------ */

    if (closePhotoModal) {

        closePhotoModal.addEventListener(
            "click",
            closePhotoModalWindow
        );

    }


    /* ------------------------------------------
            CANCEL BUTTON
    ------------------------------------------ */

    if (cancelPhotoBtn) {

        cancelPhotoBtn.addEventListener(
            "click",
            closePhotoModalWindow
        );

    }


    /* ------------------------------------------
            FILE SELECTION
    ------------------------------------------ */

    if (photoFile) {

        photoFile.addEventListener(
            "change",
            previewSelectedPhotos
        );

    }


    /* ------------------------------------------
            FORM SUBMIT
    ------------------------------------------ */

    if (photoForm) {

        photoForm.addEventListener(
            "submit",
            handleGalleryUpload
        );

    }


    /* ------------------------------------------
            CLICK OUTSIDE MODAL
    ------------------------------------------ */

    const modal =
        document.getElementById("photoModal");

    if (modal) {

        modal.addEventListener(
            "click",
            function (event) {

                if (event.target === modal) {

                    closePhotoModalWindow();

                }

            }
        );

    }


    /* ------------------------------------------
            LOAD EXISTING PHOTOS
    ------------------------------------------ */

    loadGallery();

}


/* ==================================================
        OPEN MODAL
================================================== */

function openPhotoModal() {

    const modal =
        document.getElementById("photoModal");

    if (!modal) return;

    modal.classList.add("show");

}


/* ==================================================
        CLOSE MODAL
================================================== */

function closePhotoModalWindow() {

    const modal =
        document.getElementById("photoModal");

    if (!modal) return;

    modal.classList.remove("show");

}


/* ==================================================
        PREVIEW SELECTED PHOTOS
================================================== */

function previewSelectedPhotos() {

    const input =
        document.getElementById("photoFile");

    const preview =
        document.getElementById("photoPreview");


    if (!input || !preview) return;


    preview.innerHTML = "";


    const files =
        Array.from(input.files);


    files.forEach(function (file) {

        if (!file.type.startsWith("image/")) {
            return;
        }


        const reader =
            new FileReader();


        reader.onload =
            function (event) {

                const img =
                    document.createElement("img");

                img.src =
                    event.target.result;

                img.alt =
                    file.name;

                preview.appendChild(img);

            };


        reader.readAsDataURL(file);

    });


    const status =
        document.getElementById("uploadStatus");


    if (status) {

        status.textContent =
            files.length +
            " photo(s) selected.";

    }

}


/* ==================================================
        HANDLE MULTIPLE UPLOAD
================================================== */

async function handleGalleryUpload(event) {

    event.preventDefault();


    const input =
        document.getElementById("photoFile");


    const title =
        document
            .getElementById("photoTitle")
            .value
            .trim();


    const description =
        document
            .getElementById("photoDescription")
            .value
            .trim();


    const status =
        document.getElementById("uploadStatus");


    const uploadButton =
        document.getElementById("uploadPhotoBtn");


    const token =
        sessionStorage.getItem(
            "sherpas_admin_token"
        );


    /* ------------------------------------------
            CHECK ADMIN TOKEN
    ------------------------------------------ */

    if (!token) {

        alert(
            "Admin session expired. Please login again."
        );

        window.location.href =
            "login.html";

        return;

    }


    /* ------------------------------------------
            CHECK FILES
    ------------------------------------------ */

    if (
        !input ||
        !input.files ||
        input.files.length === 0
    ) {

        alert(
            "Please select at least one photo."
        );

        return;

    }


    const files =
        Array.from(input.files);


    /* ------------------------------------------
            LIMIT FILE SIZE
    ------------------------------------------ */

    const maxSize =
        10 * 1024 * 1024;


    for (const file of files) {

        if (!file.type.startsWith("image/")) {

            alert(
                file.name +
                " is not an image."
            );

            return;

        }


        if (file.size > maxSize) {

            alert(
                file.name +
                " is larger than 10 MB."
            );

            return;

        }

    }


    /* ------------------------------------------
            DISABLE BUTTON
    ------------------------------------------ */

    uploadButton.disabled = true;


    let successful =
        0;


    let failed =
        0;


    /* ------------------------------------------
            UPLOAD EACH PHOTO
    ------------------------------------------ */

    for (
        let i = 0;
        i < files.length;
        i++
    ) {

        const file =
            files[i];


        if (status) {

            status.textContent =
                "Uploading " +
                (i + 1) +
                " of " +
                files.length +
                ": " +
                file.name;

        }


        try {

            /* ----------------------------------
                    CLOUDINARY
            ---------------------------------- */

            const cloudinaryResult =
                await uploadToCloudinary(
                    file
                );


            /* ----------------------------------
                    SAVE TO GOOGLE SHEET
            ---------------------------------- */

            const galleryResult =
                await saveGalleryRecord({

                    title:
                        title || file.name,

                    description:
                        description,

                    imageURL:
                        cloudinaryResult.secure_url,

                    publicID:
                        cloudinaryResult.public_id,

                    fileName:
                        file.name

                }, token);


            if (
                galleryResult &&
                galleryResult.success
            ) {

                successful++;

            }
            else {

                failed++;

                console.error(
                    "Gallery API failed:",
                    galleryResult
                );

            }

        }
        catch (error) {

            failed++;

            console.error(
                "Upload failed:",
                file.name,
                error
            );

        }

    }


    /* ------------------------------------------
            COMPLETE
    ------------------------------------------ */

    if (status) {

        status.textContent =
            "Completed: " +
            successful +
            " uploaded, " +
            failed +
            " failed.";

    }


    uploadButton.disabled =
        false;


    /* ------------------------------------------
            REFRESH GALLERY
    ------------------------------------------ */

    await loadGallery();


    /* ------------------------------------------
            RESET FORM
    ------------------------------------------ */

    input.value = "";


    document
        .getElementById("photoPreview")
        .innerHTML = "";


    if (successful > 0) {

        alert(
            successful +
            " photo(s) uploaded successfully."
        );

        closePhotoModalWindow();

    }

}


/* ==================================================
        CLOUDINARY UPLOAD
================================================== */

async function uploadToCloudinary(file) {

    const formData =
        new FormData();


    formData.append(
        "file",
        file
    );


    formData.append(
        "upload_preset",
        CLOUDINARY_UPLOAD_PRESET
    );


    const response =
        await fetch(
            CLOUDINARY_UPLOAD_URL,
            {
                method: "POST",
                body: formData
            }
        );


    if (!response.ok) {

        throw new Error(
            "Cloudinary upload failed. HTTP " +
            response.status
        );

    }


    const result =
        await response.json();


    if (!result.secure_url) {

        throw new Error(
            "Cloudinary did not return an image URL."
        );

    }


    return result;

}


/* ==================================================
        SAVE GALLERY RECORD
================================================== */

async function saveGalleryRecord(
    data,
    token
) {

    const formData =
        new URLSearchParams();


    formData.append(
        "action",
        "ADD_GALLERY"
    );


    formData.append(
        "token",
        token
    );


    formData.append(
        "data",
        JSON.stringify(data)
    );


    const response =
        await fetch(
            GALLERY_API,
            {
                method: "POST",
                body: formData
            }
        );


    if (!response.ok) {

        throw new Error(
            "Gallery API HTTP error: " +
            response.status
        );

    }


    return await response.json();

}


/* ==================================================
        LOAD GALLERY
================================================== */

async function loadGallery() {

    const gallery =
        document.getElementById(
            "galleryGrid"
        );


    if (!gallery) return;


    gallery.innerHTML = `

        <div class="gallery-loading">

            <i class="fa-solid fa-spinner fa-spin"></i>

            Loading gallery...

        </div>

    `;


    try {

        const response =
            await fetch(
                GALLERY_API +
                "?action=GET_GALLERY"
            );


        if (!response.ok) {

            throw new Error(
                "Gallery API HTTP error: " +
                response.status
            );

        }


        const result =
            await response.json();



        if (
            !result.success ||
            !Array.isArray(result.data)
        ) {

            throw new Error(
                result.message ||
                "Invalid gallery response."
            );

        }


        renderGallery(
            result.data
        );


    }
    catch (error) {

        console.error(
            "Gallery loading failed:",
            error
        );


        gallery.innerHTML = `

            <div class="gallery-empty">

                <i class="fa-solid fa-triangle-exclamation"></i>

                <p>Unable to load gallery.</p>

                <small>
                    ${escapeHTML(error.message)}
                </small>

            </div>

        `;

    }

}


/* ==================================================
        RENDER GALLERY
================================================== */

function renderGallery(photos) {

    const gallery =
        document.getElementById(
            "galleryGrid"
        );


    const totalPhotos =
        document.getElementById(
            "totalPhotos"
        );


    const uploadedPhotos =
        document.getElementById(
            "uploadedPhotos"
        );


    if (!gallery) return;


    /* ------------------------------------------
            UPDATE COUNTS
    ------------------------------------------ */

    if (totalPhotos) {

        totalPhotos.textContent =
            photos.length;

    }


    if (uploadedPhotos) {

        uploadedPhotos.textContent =
            photos.length;

    }


    /* ------------------------------------------
            EMPTY
    ------------------------------------------ */

    if (photos.length === 0) {

        gallery.innerHTML = `

            <div class="gallery-empty">

                <i class="fa-solid fa-images"></i>

                <p>No photographs uploaded yet.</p>

            </div>

        `;

        return;

    }


    /* ------------------------------------------
            BUILD GALLERY
    ------------------------------------------ */

    gallery.innerHTML = "";


    photos.forEach(function (photo) {

        const item =
            document.createElement("div");


        item.className =
            "gallery-admin-item";


        item.innerHTML = `

            <img
                src="${escapeHTML(photo.imageURL)}"
                alt="${escapeHTML(photo.title)}"
                loading="lazy"
            >


            <div class="gallery-image-info">

                <div class="gallery-image-title">

                    ${escapeHTML(
                        photo.title ||
                        "Untitled"
                    )}

                </div>


                <div class="gallery-image-description">

                    ${escapeHTML(
                        photo.description ||
                        ""
                    )}

                </div>


                <div class="gallery-image-date">

                    <i class="fa-regular fa-calendar"></i>

                    ${formatGalleryDate(photo.uploadedDate)}

                </div>

                <div class="gallery-image-file">

                    ${escapeHTML(
                        photo.fileName ||
                        ""
                    )}

                </div>


                <button
                    type="button"
                    class="delete-photo-btn"
                    onclick="deleteGalleryPhoto('${escapeHTML(photo.photoID)}')">

                    <i class="fa-solid fa-trash"></i>

                    Delete

                </button>

            </div>

        `;


        gallery.appendChild(item);

    });

}


/* ==================================================
        DELETE PHOTO
================================================== */

async function deleteGalleryPhoto(
    photoID
) {

    if (!photoID) return;


    const confirmed =
        confirm(
            "Are you sure you want to delete this photo?"
        );


    if (!confirmed) return;


    const token =
        sessionStorage.getItem(
            "sherpas_admin_token"
        );


    if (!token) {

        alert(
            "Admin session expired."
        );

        window.location.href =
            "login.html";

        return;

    }


    try {

        const formData =
            new URLSearchParams();


        formData.append(
            "action",
            "DELETE_GALLERY"
        );


        formData.append(
            "token",
            token
        );


        formData.append(
            "photoID",
            photoID
        );


        const response =
            await fetch(
                GALLERY_API,
                {
                    method: "POST",
                    body: formData
                }
            );


        const result =
            await response.json();


        if (!result.success) {

            throw new Error(
                result.message ||
                "Delete failed."
            );

        }


        await loadGallery();


    }
    catch (error) {

        console.error(
            "Delete failed:",
            error
        );


        alert(
            "Delete failed:\n" +
            error.message
        );

    }

}


/* ==================================================
        HTML ESCAPE
================================================== */

function escapeHTML(value) {

    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}

function formatGalleryDate(dateValue) {

    if (!dateValue) {
        return "";
    }

    const date = new Date(dateValue);

    if (isNaN(date.getTime())) {
        return "";
    }

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}

/*==================================================
        GALLERY IMAGE VIEWER
==================================================*/

document.addEventListener("DOMContentLoaded", function () {

    const galleryGrid = document.getElementById("galleryGrid");

    if (!galleryGrid) {
        return;
    }

    galleryGrid.addEventListener("click", function (event) {

        const image = event.target.closest(".gallery-admin-item img");

        if (!image) {
            return;
        }

        openGalleryViewer(image.src, image.alt);

    });

});


/*==================================================
        OPEN IMAGE VIEWER
==================================================*/

function openGalleryViewer(imageURL, imageTitle) {

    let viewer = document.getElementById("galleryImageViewer");

    if (!viewer) {

        viewer = document.createElement("div");

        viewer.id = "galleryImageViewer";

        viewer.innerHTML = `

            <div class="gallery-viewer-overlay">

                <button
                    type="button"
                    class="gallery-viewer-close"
                    id="galleryViewerClose">
                    &times;
                </button>

                <img
                    id="galleryViewerImage"
                    src=""
                    alt=""
                >

                <div
                    id="galleryViewerTitle"
                    class="gallery-viewer-title">
                </div>

            </div>

        `;

        document.body.appendChild(viewer);


        /* CLOSE BUTTON */

        document
            .getElementById("galleryViewerClose")
            .addEventListener("click", closeGalleryViewer);


        /* CLICK OUTSIDE IMAGE */

        viewer.addEventListener("click", function (event) {

            if (
                event.target.classList.contains(
                    "gallery-viewer-overlay"
                )
            ) {

                closeGalleryViewer();

            }

        });


        /* ESC KEY */

        document.addEventListener("keydown", function (event) {

            if (
                event.key === "Escape" &&
                viewer.classList.contains("active")
            ) {

                closeGalleryViewer();

            }

        });

    }


    document.getElementById(
        "galleryViewerImage"
    ).src = imageURL;


    document.getElementById(
        "galleryViewerImage"
    ).alt = imageTitle || "Gallery Image";


    document.getElementById(
        "galleryViewerTitle"
    ).textContent = imageTitle || "";


    viewer.classList.add("active");


    document.body.classList.add(
        "gallery-viewer-open"
    );

}


/*==================================================
        CLOSE IMAGE VIEWER
==================================================*/

function closeGalleryViewer() {

    const viewer =
        document.getElementById(
            "galleryImageViewer"
        );

    if (!viewer) {
        return;
    }

    viewer.classList.remove("active");

    document.body.classList.remove(
        "gallery-viewer-open"
    );

}

/* ==================================================
        HERO VIDEO MANAGEMENT
================================================== */

document.addEventListener("DOMContentLoaded", function () {

    initializeHeroVideo();

});


/* ==================================================
        INITIALIZE HERO VIDEO
================================================== */

function initializeHeroVideo() {

    const addButton =
        document.getElementById("addHeroVideoBtn");

    const closeButton =
        document.getElementById("closeHeroVideoModal");

    const cancelButton =
        document.getElementById("cancelHeroVideoBtn");

    const uploadOption =
        document.getElementById("uploadVideoOption");

    const instagramOption =
        document.getElementById("instagramVideoOption");

    const videoFile =
        document.getElementById("heroVideoFile");

    const instagramURL =
        document.getElementById("heroInstagramURL");

    const saveButton =
        document.getElementById("saveHeroVideoBtn");


    /* ------------------------------------------
            ADD HERO VIDEO
    ------------------------------------------ */

    if (addButton) {

        addButton.addEventListener(
            "click",
            openHeroVideoModal
        );

    }


    /* ------------------------------------------
            CLOSE
    ------------------------------------------ */

    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeHeroVideoModal
        );

    }


    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            closeHeroVideoModal
        );

    }


    /* ------------------------------------------
            DIRECT UPLOAD OPTION
    ------------------------------------------ */

    if (uploadOption) {

        uploadOption.addEventListener(
            "click",
            function () {

                selectHeroVideoSource("upload");

            }
        );

    }


    /* ------------------------------------------
            INSTAGRAM OPTION
    ------------------------------------------ */

    if (instagramOption) {

        instagramOption.addEventListener(
            "click",
            function () {

                selectHeroVideoSource("instagram");

            }
        );

    }


    /* ------------------------------------------
            VIDEO FILE PREVIEW
    ------------------------------------------ */

    if (videoFile) {

        videoFile.addEventListener(
            "change",
            previewHeroVideo
        );

    }


    /* ------------------------------------------
            INSTAGRAM URL PREVIEW
    ------------------------------------------ */

    if (instagramURL) {

        instagramURL.addEventListener(
            "input",
            previewInstagramReel
        );

    }


    /* ------------------------------------------
            SAVE
    ------------------------------------------ */

    if (saveButton) {

        saveButton.addEventListener(
            "click",
            saveHeroVideo
        );

    }


    /* ------------------------------------------
            CLICK OUTSIDE MODAL
    ------------------------------------------ */

    const modal =
        document.getElementById("heroVideoModal");

    if (modal) {

        modal.addEventListener(
            "click",
            function (event) {

                if (event.target === modal) {

                    closeHeroVideoModal();

                }

            }
        );

    }


    /* ------------------------------------------
            LOAD CURRENT HERO VIDEO
    ------------------------------------------ */

    loadHeroVideo();

}


/* ==================================================
        OPEN MODAL
================================================== */

function openHeroVideoModal() {

    const modal =
        document.getElementById("heroVideoModal");

    if (!modal) return;

    modal.classList.add("show");

}


/* ==================================================
        CLOSE MODAL
================================================== */

function closeHeroVideoModal() {

    const modal =
        document.getElementById("heroVideoModal");

    if (!modal) return;

    modal.classList.remove("show");

    resetHeroVideoForm();

}


/* ==================================================
        SELECT VIDEO SOURCE
================================================== */

function selectHeroVideoSource(source) {

    const uploadOption =
        document.getElementById("uploadVideoOption");

    const instagramOption =
        document.getElementById("instagramVideoOption");

    const uploadArea =
        document.getElementById("heroUploadArea");

    const instagramArea =
        document.getElementById("heroInstagramArea");


    if (source === "upload") {

        if (uploadOption) {

            uploadOption.classList.add("active");

        }

        if (instagramOption) {

            instagramOption.classList.remove("active");

        }

        if (uploadArea) {

            uploadArea.style.display = "block";

        }

        if (instagramArea) {

            instagramArea.style.display = "none";

        }

    }


    if (source === "instagram") {

        if (uploadOption) {

            uploadOption.classList.remove("active");

        }

        if (instagramOption) {

            instagramOption.classList.add("active");

        }

        if (uploadArea) {

            uploadArea.style.display = "none";

        }

        if (instagramArea) {

            instagramArea.style.display = "block";

        }

    }

}


/* ==================================================
        VIDEO PREVIEW
================================================== */

function previewHeroVideo() {

    const input =
        document.getElementById("heroVideoFile");

    const preview =
        document.getElementById("heroVideoPreview");

    const status =
        document.getElementById(
            "heroVideoUploadStatus"
        );


    if (!input || !preview) return;


    preview.innerHTML = "";


    if (
        !input.files ||
        input.files.length === 0
    ) {

        return;

    }


    const file =
        input.files[0];


    /* ------------------------------------------
            CHECK VIDEO
    ------------------------------------------ */

    if (!file.type.startsWith("video/")) {

        alert(
            "Please select a valid video file."
        );

        input.value = "";

        return;

    }


    /* ------------------------------------------
            MAX SIZE
    ------------------------------------------ */

    const maxSize =
        100 * 1024 * 1024;


    if (file.size > maxSize) {

        alert(
            "Video must be smaller than 100 MB."
        );

        input.value = "";

        return;

    }


    /* ------------------------------------------
            PREVIEW
    ------------------------------------------ */

    const video =
        document.createElement("video");

    video.controls = true;

    video.muted = true;

    video.playsInline = true;

    video.src =
        URL.createObjectURL(file);

    preview.appendChild(video);


    if (status) {

        status.textContent =
            "Video selected: " +
            file.name;

    }

}


/* ==================================================
        INSTAGRAM REEL PREVIEW
================================================== */

function previewInstagramReel() {

    const input =
        document.getElementById(
            "heroInstagramURL"
        );

    const preview =
        document.getElementById(
            "heroInstagramPreview"
        );


    if (!input || !preview) return;


    const url =
        input.value.trim();


    preview.innerHTML = "";


    if (!url) return;


    if (
        !url.includes("instagram.com/reel/")
    ) {

        preview.innerHTML = `

            <div class="hero-video-url-warning">

                <i class="fa-solid fa-triangle-exclamation"></i>

                Please enter a valid Instagram Reel URL.

            </div>

        `;

        return;

    }


    preview.innerHTML = `

        <div class="hero-instagram-info">

            <i class="fa-brands fa-instagram"></i>

            <span>
                Instagram Reel URL detected
            </span>

        </div>

    `;

}


/* ==================================================
        SAVE HERO VIDEO
================================================== */

async function saveHeroVideo() {

    const token =
        sessionStorage.getItem(
            "sherpas_admin_token"
        );


    if (!token) {

        alert(
            "Admin session expired. Please login again."
        );

        window.location.href =
            "login.html";

        return;

    }


    const uploadOption =
        document.getElementById(
            "uploadVideoOption"
        );


    const isUpload =
        uploadOption &&
        uploadOption.classList.contains("active");


    const status =
        document.getElementById(
            "heroVideoUploadStatus"
        );


    const saveButton =
        document.getElementById(
            "saveHeroVideoBtn"
        );


    if (saveButton) {

        saveButton.disabled = true;

    }


    try {

        /* ======================================
                DIRECT UPLOAD
        ====================================== */

        if (isUpload) {

            const input =
                document.getElementById(
                    "heroVideoFile"
                );


            if (
                !input ||
                !input.files ||
                input.files.length === 0
            ) {

                alert(
                    "Please select a video file."
                );

                return;

            }


            const file =
                input.files[0];


            if (status) {

                status.textContent =
                    "Uploading video...";

            }


            const result =
                await uploadHeroVideoToCloudinary(
                    file
                );


            const saveResult =
                await saveHeroVideoRecord(
                    {
                        type: "UPLOAD",
                        url: result.secure_url,
                        publicID: result.public_id,
                        fileName: file.name
                    },
                    token
                );


            if (
                !saveResult ||
                !saveResult.success
            ) {

                throw new Error(
                    saveResult.message ||
                    "Unable to save hero video."
                );

            }

        }


        /* ======================================
                INSTAGRAM REEL
        ====================================== */

        else {

            const input =
                document.getElementById(
                    "heroInstagramURL"
                );


            const url =
                input
                    ? input.value.trim()
                    : "";


            if (
                !url ||
                !url.includes("instagram.com/reel/")
            ) {

                alert(
                    "Please enter a valid Instagram Reel URL."
                );

                return;

            }


            if (status) {

                status.textContent =
                    "Saving Instagram Reel...";

            }


            const saveResult =
                await saveHeroVideoRecord(
                    {
                        type: "INSTAGRAM",
                        url: url
                    },
                    token
                );


            if (
                !saveResult ||
                !saveResult.success
            ) {

                throw new Error(
                    saveResult.message ||
                    "Unable to save Instagram Reel."
                );

            }

        }


        if (status) {

            status.textContent =
                "Hero video saved successfully.";

        }


        await loadHeroVideo();


        alert(
            "Hero video saved successfully."
        );


        closeHeroVideoModal();


    }
    catch (error) {

        console.error(
            "Hero video save failed:",
            error
        );


        if (status) {

            status.textContent =
                "Error: " +
                error.message;

        }


        alert(
            "Hero video could not be saved.\n\n" +
            error.message
        );

    }
    finally {

        if (saveButton) {

            saveButton.disabled = false;

        }

    }

}


/* ==================================================
        CLOUDINARY VIDEO UPLOAD
================================================== */

async function uploadHeroVideoToCloudinary(file) {

    const formData =
        new FormData();


    formData.append(
        "file",
        file
    );


    formData.append(
        "upload_preset",
        CLOUDINARY_UPLOAD_PRESET
    );


    const videoUploadURL =
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`;


    const response =
        await fetch(
            videoUploadURL,
            {
                method: "POST",
                body: formData
            }
        );


    if (!response.ok) {

        throw new Error(
            "Cloudinary video upload failed. HTTP " +
            response.status
        );

    }


    const result =
        await response.json();


    if (!result.secure_url) {

        throw new Error(
            "Cloudinary did not return a video URL."
        );

    }


    return result;

}


/* ==================================================
        SAVE HERO VIDEO RECORD
================================================== */

async function saveHeroVideoRecord(
    data,
    token
) {

    const formData =
        new URLSearchParams();


    formData.append(
        "action",
        "ADD_HERO_VIDEO"
    );


    formData.append(
        "token",
        token
    );


    formData.append(
        "data",
        JSON.stringify(data)
    );


    const response =
        await fetch(
            GALLERY_API,
            {
                method: "POST",
                body: formData
            }
        );


    if (!response.ok) {

        throw new Error(
            "Hero video API HTTP error: " +
            response.status
        );

    }


    return await response.json();

}


/* ==================================================
        LOAD HERO VIDEO
================================================== */

async function loadHeroVideo() {

    const container =
        document.getElementById(
            "currentHeroVideo"
        );


    if (!container) return;


    try {

        const response =
            await fetch(
                GALLERY_API +
                "?action=GET_HERO_VIDEO"
            );


        if (!response.ok) {

            throw new Error(
                "Hero video API HTTP error: " +
                response.status
            );

        }


        const result =
            await response.json();


        if (
            !result.success ||
            !result.data
        ) {

            renderHeroVideoEmpty();

            return;

        }


        renderCurrentHeroVideo(
            result.data
        );

    }
    catch (error) {

        console.error(
            "Hero video loading failed:",
            error
        );

        renderHeroVideoEmpty();

    }

}


/* ==================================================
        RENDER CURRENT HERO VIDEO
================================================== */

function renderCurrentHeroVideo(videoData) {

    const container =
        document.getElementById(
            "currentHeroVideo"
        );


    const status =
        document.getElementById(
            "heroVideoStatus"
        );


    if (!container) return;


    const type =
        String(
            videoData.type || ""
        ).toUpperCase();


    if (status) {

        status.textContent =
            "Active";

    }


    if (type === "INSTAGRAM") {

        container.innerHTML = `

            <div class="current-hero-video-content">

                <div class="hero-video-preview-box">

                    <i class="fa-brands fa-instagram"></i>

                    <span>
                        Instagram Reel
                    </span>

                </div>


                <div class="hero-video-details">

                    <strong>
                        Instagram Reel
                    </strong>

                    <small>
                        ${escapeHTML(videoData.url)}
                    </small>

                    <span class="hero-video-active">
                        ACTIVE
                    </span>

                </div>

            </div>

        `;

    }
    else {

        container.innerHTML = `

            <div class="current-hero-video-content">

                <div class="hero-video-preview-box">

                    <video
                        src="${escapeHTML(videoData.url)}"
                        controls
                        muted
                        playsinline>
                    </video>

                </div>


                <div class="hero-video-details">

                    <strong>
                        Uploaded Video
                    </strong>

                    <small>
                        ${escapeHTML(
                            videoData.fileName || ""
                        )}
                    </small>

                    <span class="hero-video-active">
                        ACTIVE
                    </span>

                </div>

            </div>

        `;

    }

}


/* ==================================================
        EMPTY HERO VIDEO
================================================== */

function renderHeroVideoEmpty() {

    const container =
        document.getElementById(
            "currentHeroVideo"
        );


    const status =
        document.getElementById(
            "heroVideoStatus"
        );


    if (status) {

        status.textContent =
            "No video selected";

    }


    if (!container) return;


    container.innerHTML = `

        <div class="hero-video-empty">

            <i class="fa-solid fa-film"></i>

            <h4>No Hero Video</h4>

            <p>
                Add an uploaded video or Instagram Reel
                to display on the homepage.
            </p>

        </div>

    `;

}


/* ==================================================
        RESET FORM
================================================== */

function resetHeroVideoForm() {

    const file =
        document.getElementById(
            "heroVideoFile"
        );


    const instagram =
        document.getElementById(
            "heroInstagramURL"
        );


    const preview =
        document.getElementById(
            "heroVideoPreview"
        );


    const instagramPreview =
        document.getElementById(
            "heroInstagramPreview"
        );


    const status =
        document.getElementById(
            "heroVideoUploadStatus"
        );


    if (file) {

        file.value = "";

    }


    if (instagram) {

        instagram.value = "";

    }


    if (preview) {

        preview.innerHTML = "";

    }


    if (instagramPreview) {

        instagramPreview.innerHTML = "";

    }


    if (status) {

        status.textContent = "";

    }


    selectHeroVideoSource("upload");

}