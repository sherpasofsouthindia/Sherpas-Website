/* =========================================================
   SHERPAS HERO
   Background Image Slider + Floating Hero Video
========================================================= */


/* =========================================================
   BACKGROUND IMAGE SLIDER
========================================================= */

const heroImages = [
    "assets/hero1.png",
    "assets/hero2.png",
    "assets/hero3.png",
    "assets/hero4.png",
    "assets/hero5.png",
    "assets/hero6.png",
    "assets/hero7.png"
];


const hero =
    document.querySelector(".hero");


let current = 0;


/* Initial background */

if (hero) {

    hero.style.backgroundImage =
        `url(${heroImages[0]})`;

}


/* Change background every 4 seconds */

if (hero) {

    setInterval(() => {

        current++;

        if (
            current >= heroImages.length
        ) {

            current = 0;

        }

        hero.style.backgroundImage =
            `url(${heroImages[current]})`;

    }, 4000);

}


/* =========================================================
   HERO VIDEO API
========================================================= */

const HERO_VIDEO_API =
    "https://script.google.com/macros/s/AKfycbxIEL_zgLSHaadD0WcaQx3cIJHePMQtiBCeORa7tCpyHWF7vE4fAO9sgqStGRCg95Ja/exec";


/* =========================================================
   ELEMENTS
========================================================= */

const heroVideoCard =
    document.getElementById(
        "heroVideoCard"
    );


const heroFloatingVideo =
    document.getElementById(
        "heroFloatingVideo"
    );


const heroVideoModal =
    document.getElementById(
        "heroVideoModal"
    );


const heroModalVideo =
    document.getElementById(
        "heroModalVideo"
    );


const heroVideoClose =
    document.getElementById(
        "heroVideoClose"
    );


/* =========================================================
   LOAD ACTIVE HERO VIDEO
========================================================= */

async function loadHeroVideo() {

    if (
        !heroVideoCard ||
        !heroFloatingVideo
    ) {

        return;

    }


    try {

        const response =
            await fetch(
                HERO_VIDEO_API +
                "?action=GET_HERO_VIDEO"
            );


        if (!response.ok) {

            throw new Error(
                "Hero video API error: " +
                response.status
            );

        }


        const result =
            await response.json();


        /* -----------------------------------------
           No active video
        ------------------------------------------ */

        if (
            !result.success ||
            !result.data
        ) {

            heroVideoCard.style.display =
                "none";

            return;

        }


        const videoData =
            result.data;


        /* -----------------------------------------
           Homepage accepts ONLY uploaded video
        ------------------------------------------ */

        if (
            String(
                videoData.type || ""
            ).toUpperCase() !== "UPLOAD"
        ) {

            heroVideoCard.style.display =
                "none";

            return;

        }


        if (!videoData.url) {

            heroVideoCard.style.display =
                "none";

            return;

        }


        /* -----------------------------------------
           Set video source
        ------------------------------------------ */

        heroFloatingVideo.src =
            videoData.url;


        heroFloatingVideo.load();


        /* -----------------------------------------
           Start autoplay
        ------------------------------------------ */

        try {

            await heroFloatingVideo.play();

        } catch (playError) {

            console.log(
                "Autoplay waiting for browser permission."
            );

        }


        /* -----------------------------------------
           Show video card
        ------------------------------------------ */

        heroVideoCard.style.display =
            "block";


        console.log(
            "Sherpas floating Hero video loaded."
        );


    } catch (error) {

        console.error(
            "Hero video loading failed:",
            error
        );


        heroVideoCard.style.display =
            "none";

    }

}


/* =========================================================
   OPEN LARGE VIDEO
========================================================= */

function openHeroVideo() {

    if (
        !heroFloatingVideo ||
        !heroModalVideo ||
        !heroVideoModal
    ) {

        return;

    }


    const source =
        heroFloatingVideo.currentSrc ||
        heroFloatingVideo.src;


    if (!source) {

        return;

    }


    heroModalVideo.src =
        source;


    heroVideoModal.classList.add(
        "active"
    );


    heroVideoModal.setAttribute(
        "aria-hidden",
        "false"
    );


    heroModalVideo.currentTime = 0;


    heroModalVideo.play()
        .catch(() => {});


}


/* =========================================================
   CLOSE LARGE VIDEO
========================================================= */

function closeHeroVideo() {

    if (
        !heroVideoModal ||
        !heroModalVideo
    ) {

        return;

    }


    heroModalVideo.pause();


    heroModalVideo.removeAttribute(
        "src"
    );


    heroModalVideo.load();


    heroVideoModal.classList.remove(
        "active"
    );


    heroVideoModal.setAttribute(
        "aria-hidden",
        "true"
    );

}


/* =========================================================
   VIDEO CARD CLICK
========================================================= */

if (heroVideoCard) {

    heroVideoCard.addEventListener(
        "click",
        openHeroVideo
    );

}


/* =========================================================
   CLOSE BUTTON
========================================================= */

if (heroVideoClose) {

    heroVideoClose.addEventListener(
        "click",
        closeHeroVideo
    );

}


/* =========================================================
   CLICK OUTSIDE VIDEO
========================================================= */

if (heroVideoModal) {

    heroVideoModal.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                heroVideoModal
            ) {

                closeHeroVideo();

            }

        }
    );

}


/* =========================================================
   ESC KEY
========================================================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Escape"
        ) {

            closeHeroVideo();

        }

    }
);


/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadHeroVideo();

    }
);
