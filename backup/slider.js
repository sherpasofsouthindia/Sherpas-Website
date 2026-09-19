/* =========================================================
   SHERPAS HERO
   Background Image Slider + Subtle Hero Video
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

const hero = document.querySelector(".hero");

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

        if (current >= heroImages.length) {
            current = 0;
        }

        hero.style.backgroundImage =
            `url(${heroImages[current]})`;

    }, 4000);

}


/* =========================================================
   HERO VIDEO
========================================================= */

const HERO_VIDEO_API =
    "https://script.google.com/macros/s/AKfycbxIEL_zgLSHaadD0WcaQx3cIJHePMQtiBCeORa7tCpyHWF7vE4fAO9sgqStGRCg95Ja/exec";


/* =========================================================
   LOAD ACTIVE HERO VIDEO
========================================================= */

async function loadSubtleHeroVideo() {

    const videoLayer =
        document.getElementById(
            "heroVideoLayer"
        );

    const video =
        document.getElementById(
            "heroBackgroundVideo"
        );


    if (!videoLayer || !video) {
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


        /*
           No active Hero video
        */

        if (
            !result.success ||
            !result.data
        ) {

            videoLayer.classList.remove(
                "is-visible"
            );

            return;

        }


        const videoData =
            result.data;


        /*
           IMPORTANT:
           Homepage accepts ONLY uploaded MP4.

           Instagram Reel is ignored.
        */

        if (
            String(videoData.type || "")
                .toUpperCase() !== "UPLOAD"
        ) {

            videoLayer.classList.remove(
                "is-visible"
            );

            return;

        }


        if (!videoData.url) {

            videoLayer.classList.remove(
                "is-visible"
            );

            return;

        }


        /*
           Set video source
        */

        video.src =
            videoData.url;


        /*
           Load video
        */

        video.load();


        /*
           Start playback
        */

        const playPromise =
            video.play();


        if (
            playPromise &&
            typeof playPromise.then === "function"
        ) {

            await playPromise;

        }


        /*
           Show video softly
        */

        videoLayer.classList.add(
            "is-visible"
        );


        console.log(
            "Sherpas Hero video loaded successfully."
        );

    }
    catch (error) {

        console.error(
            "Hero video loading failed:",
            error
        );


        /*
           If video fails,
           background image slider
           continues normally.
        */

        videoLayer.classList.remove(
            "is-visible"
        );

    }

}


/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadSubtleHeroVideo();

    }
);

