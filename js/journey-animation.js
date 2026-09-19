/* =========================================================
   SHERPAS OF SOUTH INDIA
   HIMALAYAN 450 RIDER JOURNEY
   ========================================================= */

(function () {

    "use strict";

    /* =====================================================
    START PAGE AT HERO ON NORMAL REFRESH
    ===================================================== */

    if (
        !window.location.hash &&
        window.performance &&
        performance.getEntriesByType("navigation").length > 0
    ) {

        const navigation =
            performance.getEntriesByType("navigation")[0];

        if (
            navigation.type === "reload"
        ) {

            window.scrollTo(
                0,
                0
            );
        }
    }

    /* =====================================================
       ELEMENTS
       ===================================================== */

    const layer =
        document.getElementById("riderJourneyLayer");

    const bike =
        document.getElementById("journeyBike");

    const rearWheel =
        document.getElementById("journeyRearWheel");

    const frontWheel =
        document.getElementById("journeyFrontWheel");

    const mudRoad =
        document.getElementById("journeyMudRoad");

    const dust =
        document.getElementById("journeyDust");

    const shadow =
        document.getElementById("journeyBikeShadow");

    const headlight =
        document.getElementById("journeyHeadlight");


    if (
        !layer ||
        !bike ||
        !rearWheel ||
        !frontWheel
    ) {

        console.warn(
            "Sherpas Rider Journey: required elements not found."
        );

        return;
    }


    /* =====================================================
       ASSETS
       ===================================================== */

    const BIKE_IMAGE =
        "assets/himalayan-rider.png";

    const FRONT_WHEEL_IMAGE =
        "assets/front-tyre.png";

    const REAR_WHEEL_IMAGE =
        "assets/back-tyre.png";

    const MUD_ROAD_IMAGE =
        "assets/mud-road.png";


    /* =====================================================
       BIKE SIZE
       ===================================================== */

    const HERO_BIKE_WIDTH =
        220;

    const HERO_MOBILE_BIKE_WIDTH =
        145;


    const SCROLL_BIKE_WIDTH =
        150;

    const SCROLL_MOBILE_BIKE_WIDTH =
        100;


    /* =====================================================
       HERO POSITION
       ===================================================== */

    const HERO_Y =
        0.83;


    /* =====================================================
       WHEEL POSITIONS
       Based on the 1402 × 1402 Himalayan PNG
       ===================================================== */

    const REAR_WHEEL_DATA = {

        x: 220,

        y: 970,

        diameter: 440
    };


    const FRONT_WHEEL_DATA = {

        x: 1210,

        y: 990,

        diameter: 480
    };


    const ORIGINAL_BIKE_SIZE =
        1402;


    /* =====================================================
       STATE
       ===================================================== */

    let heroProgress = 0;
    let heroRunning = true;
    let scrollingStarted = false;
    let pageInitializing = true;

    let lastTime = null;

    let wheelRotation = 0;


    /* =====================================================
    SCROLL MOMENTUM
    ===================================================== */

    let lastScrollY = window.scrollY;

    let scrollVelocity = 0;

    let momentumFrame = null;

    let lastScrollTime = performance.now();

    let scrollStopTimer = null;

    const MOMENTUM_DURATION = 2000;

    const MOMENTUM_FRICTION = 0.94;


    /* =====================================================
       PAGE POSITIONS
       ===================================================== */

    let heroBottom =
        0;

    let footerTop =
        0;


    /* =====================================================
       HELPERS
       ===================================================== */

    function clamp(
        value,
        min,
        max
    ) {

        return Math.min(
            Math.max(
                value,
                min
            ),
            max
        );
    }


    function easeInOut(
        value
    ) {

        return value < 0.5

            ? 2 * value * value

            : 1 -
              Math.pow(
                  -2 * value + 2,
                  2
              ) / 2;
    }


    function getHeroWidth() {

        return window.innerWidth <= 768

            ? HERO_MOBILE_BIKE_WIDTH

            : HERO_BIKE_WIDTH;
    }


    function getScrollWidth() {

        return window.innerWidth <= 768

            ? SCROLL_MOBILE_BIKE_WIDTH

            : SCROLL_BIKE_WIDTH;
    }


    /* =====================================================
       CALCULATE PAGE POSITIONS
       ===================================================== */

    function calculatePagePositions() {

        const hero =
            document.querySelector(".hero");

        if (!hero) {
            return;
        }


        const heroRect =
            hero.getBoundingClientRect();


        heroBottom =
            heroRect.bottom +
            window.scrollY;


        const footer =
            document.querySelector("footer");


        if (footer) {

            const footerRect =
                footer.getBoundingClientRect();


            footerTop =
                footerRect.top +
                window.scrollY;

        } else {

            footerTop =
                document.documentElement.scrollHeight;
        }
    }


    /* =====================================================
       WHEEL POSITION
       ===================================================== */

    function positionWheel(

        wheel,

        data,

        bikeLeft,

        bikeTop,

        bikeWidth

    ) {

        const scale =
            bikeWidth /
            ORIGINAL_BIKE_SIZE;


        const wheelSize =
            data.diameter *
            scale;


        const centerX =
            bikeLeft +
            data.x *
            scale;


        const centerY =
            bikeTop +
            data.y *
            scale;


        wheel.style.width =
            wheelSize + "px";


        wheel.style.height =
            wheelSize + "px";


        wheel.style.left =
            (
                centerX -
                wheelSize / 2
            ) + "px";


        wheel.style.top =
            (
                centerY -
                wheelSize / 2
            ) + "px";
    }


    /* =====================================================
       WHEEL ROTATION
       ===================================================== */

    function rotateWheels() {

        /*
         * Smooth rotation.
         */

        wheelRotation +=
            1.8;


        if (
            wheelRotation >= 360
        ) {

            wheelRotation -=
                360;
        }


        rearWheel.style.transform =
            `rotate(${wheelRotation}deg)`;


        frontWheel.style.transform =
            `rotate(${wheelRotation}deg)`;
    }

    // ============================================================
    // ANNOUNCEMENT TOWING — HERO TEST ONLY
    // ============================================================

    const announcementBar =
        document.getElementById("publicAnnouncements");

    let announcementTowActive = false;
    let announcementTowPlaceholder = null;
    let announcementTowOriginalStyle = "";
    let announcementTowWidth = 0;
    let announcementTowHeight = 0;


    // Prepare the real announcement bar for towing
    function prepareAnnouncementTow() {

        if (!announcementBar || announcementTowActive) return;

        const rect = announcementBar.getBoundingClientRect();
        const computed = window.getComputedStyle(announcementBar);

        announcementTowWidth = rect.width;
        announcementTowHeight = rect.height;

        // Remember whatever inline style already exists
        announcementTowOriginalStyle =
            announcementBar.getAttribute("style") || "";

        // Create a placeholder so removing the bar from normal flow
        // does not disturb the page layout
        announcementTowPlaceholder =
            document.createElement("div");

        announcementTowPlaceholder.style.height =
            rect.height + "px";

        announcementTowPlaceholder.style.marginTop =
            computed.marginTop;

        announcementTowPlaceholder.style.marginBottom =
            computed.marginBottom;

        announcementTowPlaceholder.style.padding = "0";
        announcementTowPlaceholder.style.visibility = "hidden";

        announcementBar.parentNode.insertBefore(
            announcementTowPlaceholder,
            announcementBar
        );

        // The REAL announcement bar is now detached from page flow
        announcementBar.classList.add(
            "announcement-being-towed"
        );

        announcementBar.style.position = "fixed";
        announcementBar.style.width =
            announcementTowWidth + "px";

        announcementBar.style.height =
            announcementTowHeight + "px";

        announcementBar.style.margin = "0";
        announcementBar.style.opacity = "0";

        announcementTowActive = true;
    }


    // Move the REAL announcement bar behind the bike
    function updateAnnouncementTow(x, y, bikeWidth) {

        if (!announcementTowActive || !announcementBar) return;

        // Left edge of the bike
        const bikeLeft =
            x - (bikeWidth / 2);

        // Small gap between bike and announcement bar
        const gap =
            Math.max(18, bikeWidth * 0.12);

        // Keep the announcement behind the bike
        const barLeft =
            bikeLeft -
            announcementTowWidth -
            gap;

        const barTop =
            y +
            (bikeWidth * 0.262);

        announcementBar.style.left =
            barLeft + "px";

        announcementBar.style.top =
            barTop + "px";

        announcementBar.style.opacity = "1";
    }


    // Return the announcement bar to its original position
    function releaseAnnouncementTow() {

        if (!announcementTowActive || !announcementBar) return;

        // Remove placeholder first
        // while the real bar is still fixed
        if (announcementTowPlaceholder) {
            announcementTowPlaceholder.remove();
            announcementTowPlaceholder = null;
        }

        announcementBar.classList.remove(
            "announcement-being-towed"
        );

        // Restore the exact original inline style
        if (announcementTowOriginalStyle) {
            announcementBar.setAttribute(
                "style",
                announcementTowOriginalStyle
            );
        } else {
            announcementBar.removeAttribute("style");
        }

        announcementTowActive = false;
        announcementTowOriginalStyle = "";
        announcementTowWidth = 0;
        announcementTowHeight = 0;
    }

    /* =====================================================
       HERO BIKE
       ===================================================== */

    function animateHero(
        timestamp
    ) {

        if (!heroRunning) {
            return;
        }


        if (!lastTime) {

            lastTime =
                timestamp;
        }


        const delta =
            timestamp -
            lastTime;


        lastTime =
            timestamp;


        /*
         * HERO SPEED
         *
         * 9 seconds gives a slower,
         * smoother ride.
         */

        heroProgress +=
            delta / 12000;


        heroProgress =
            clamp(
                heroProgress,
                0,
                1
            );


        const bikeWidth =
            getHeroWidth();


        /*
         * LEFT → RIGHT
         */

        const startX =
            -bikeWidth;


        const endX =
            window.innerWidth +
            bikeWidth;


        const progress =
            easeInOut(
                heroProgress
            );


        const x =
            startX +
            (
                endX -
                startX
            ) *
            progress;
            


        /*
         * Hero vertical position.
         */

        const y =
            window.innerHeight *
            HERO_Y;


        updateAnnouncementTow(x, y, bikeWidth);

        const bikeTop =
            y -
            bikeWidth *
            0.40;

        
        /* =================================================
           MAIN BIKE
           ================================================= */

        bike.style.width =
            bikeWidth + "px";


        bike.style.left =
            (
                x -
                bikeWidth / 2
            ) + "px";


        bike.style.top =
            bikeTop + "px";


        bike.style.opacity =
            "1";

        /* =================================================
        HERO HEADLIGHT FLASH
        ================================================= */

        if (headlight) {

            const HEADLIGHT_X = 1140;
            const HEADLIGHT_Y = 510;

            const scale =
                bikeWidth /
                ORIGINAL_BIKE_SIZE;

            const bikeLeft =
                x -
                bikeWidth / 2;

            const lightX =
                bikeLeft +
                HEADLIGHT_X * scale;

            const lightY =
                bikeTop +
                HEADLIGHT_Y * scale;

            headlight.style.left =
                lightX + "px";

            headlight.style.top =
                lightY + "px";

            const flash =
                0.70 +
                Math.sin(timestamp / 50) * 0.15;

            headlight.style.opacity =
                flash;

            headlight.style.transform =
                `translate(-50%, -50%) scale(${0.8 + flash * 0.40})`;
        }

        /* =================================================
           WHEELS
           ================================================= */

        positionWheel(

            rearWheel,

            REAR_WHEEL_DATA,

            x -
            bikeWidth / 2,

            bikeTop,

            bikeWidth
        );


        positionWheel(

            frontWheel,

            FRONT_WHEEL_DATA,

            x -
            bikeWidth / 2,

            bikeTop,

            bikeWidth
        );


        rearWheel.style.opacity =
            "1";


        frontWheel.style.opacity =
            "1";


        rotateWheels();


        /* =================================================
           HIDE SCROLL ROAD IN HERO
           ================================================= */

        if (mudRoad) {

            mudRoad.style.opacity =
                "0";
        }


        if (dust) {

            dust.style.opacity =
                "0";
        }


        if (shadow) {

            shadow.style.left =
                x + "px";


            shadow.style.top =
                (
                    y +
                    bikeWidth * 0.28
                ) + "px";


            shadow.style.opacity =
                "0.25";
        }


        /* =================================================
           CONTINUE
           ================================================= */

        if (
            heroProgress < 1
        ) {

            prepareAnnouncementTow();

            requestAnimationFrame(
                animateHero
            );

        } else {

            /*
             * Hide everything after
             * automatic Hero ride.
             */

            bike.style.opacity =
                "0";


            rearWheel.style.opacity =
                "0";


            frontWheel.style.opacity =
                "0";


            if (shadow) {

                shadow.style.opacity =
                    "0";
            }


            heroRunning =
                false;

            releaseAnnouncementTow();
        }
    }

    function hideJourneyBike() {

        bike.style.opacity = "0";

        rearWheel.style.opacity = "0";

        frontWheel.style.opacity = "0";

        if (shadow) {
            shadow.style.opacity = "0";
        }

        if (headlight) {
            headlight.style.opacity = "0";
        }

        if (mudRoad) {
            mudRoad.style.opacity = "0";
        }

        if (dust) {
            dust.style.opacity = "0";
        }
    }

    /* =====================================================
       SCROLL JOURNEY
       ===================================================== */

    function animateScrollJourney() {

        const scrollY =
            window.scrollY;


        /*
         * Do not show the vertical bike
         * while inside Hero.
         */

        if (scrollY < heroBottom - 20) {

            hideJourneyBike();

            scrollingStarted = false;

            return;
        }


        scrollingStarted =
            true;


        const bikeWidth =
            getScrollWidth();


        /*
         * Journey starts immediately
         * after Hero.
         */

        const journeyStart =
            heroBottom;


        /*
         * Finish before footer.
         */

        const journeyEnd =
            Math.max(

                journeyStart + 1,

                footerTop -
                window.innerHeight *
                0.10

            );


        let progress =
            (
                scrollY -
                journeyStart
            ) /
            (
                journeyEnd -
                journeyStart
            );


        progress =
            clamp(
                progress,
                0,
                1
            );


        /*
         * LEFT SIDE
         */

        const left =
            window.innerWidth <= 768

                ? 10

                : 30;


        /*
         * Bike travels vertically
         * through the viewport.
         */

        const startY =
            window.innerHeight *
            0.12;


        const endY =
            window.innerHeight *
            0.82;


        const y =
            startY +
            (
                endY -
                startY
            ) *
            progress;


        const bikeTop =
            y -
            bikeWidth *
            0.40;


        /* =================================================
           BIKE
           ================================================= */

        bike.style.width =
            bikeWidth + "px";


        bike.style.left =
            left + "px";


        bike.style.top =
            bikeTop + "px";


        bike.style.opacity =
            "1";


        /* =================================================
           WHEELS
           ================================================= */

        positionWheel(

            rearWheel,

            REAR_WHEEL_DATA,

            left,

            bikeTop,

            bikeWidth
        );


        positionWheel(

            frontWheel,

            FRONT_WHEEL_DATA,

            left,

            bikeTop,

            bikeWidth
        );


        rearWheel.style.opacity =
            "1";


        frontWheel.style.opacity =
            "1";


        rotateWheels();


        
        /* =================================================
        BIKE SHADOW
        ================================================= */

        if (shadow) {

            shadow.style.left =
                (
                    left +
                    bikeWidth / 2
                ) + "px";

            shadow.style.top =
                (
                    y +
                    bikeWidth * 0.38
                ) + "px";

            shadow.style.opacity =
                "0.42";
        }
    }

    /* =====================================================
    SCROLL MOMENTUM
    ===================================================== */

    function continueWheelMomentum() {

        const now =
            performance.now();


        /*
        * Reduce the movement gradually.
        */

        scrollVelocity *=
            MOMENTUM_FRICTION;


        /*
        * Continue rotating the wheels
        * while momentum remains.
        */

        if (
            Math.abs(scrollVelocity) > 0.35
        ) {

            wheelRotation +=
                Math.max(
                    0.8,
                    Math.abs(scrollVelocity) * 0.8
                );


            if (
                wheelRotation <= -360
            ) {

                wheelRotation +=
                    360;
            }


            if (rearWheel) {

                rearWheel.style.transform =
                    `rotate(${wheelRotation}deg)`;
            }


            if (frontWheel) {

                frontWheel.style.transform =
                    `rotate(${wheelRotation}deg)`;
            }


            momentumFrame =
                requestAnimationFrame(
                    continueWheelMomentum
                );

        } else {

            /*
            * Momentum has naturally stopped.
            */

            momentumFrame =
                null;
        }
    }

    /* =====================================================
       SCROLL EVENT
       ===================================================== */

    function handleScroll() {

        // Ignore the scroll event generated while
        // the page is being returned to the Hero.
        if (pageInitializing) {

            lastScrollY =
                window.scrollY ||
                window.pageYOffset ||
                0;

            lastScrollTime =
                performance.now();

            return;
        }

        const currentScrollY =
            window.scrollY ||
            window.pageYOffset ||
            0;


        const now =
            performance.now();


        const elapsed =
            now -
            lastScrollTime;


        if (headlight) {
            headlight.style.opacity = "0";
        }

        /*
        * Calculate how fast the user
        * is scrolling.
        */

        if (
            elapsed > 0
        ) {

            const movement =
                currentScrollY -
                lastScrollY;


            scrollVelocity =
                movement /
                elapsed *
                16;
        }


        lastScrollY =
            currentScrollY;


        lastScrollTime =
            now;


        /*
        * Cancel the previous stop timer.
        */

        clearTimeout(
            scrollStopTimer
        );


        /*
        * User is actively scrolling.
        */

        if (currentScrollY < heroBottom - 20) {

            // User has interrupted the automatic Hero ride
            heroRunning = false;

            // IMPORTANT:
            // Return the real announcement bar to its
            // normal document position.
            releaseAnnouncementTow();

            scrollingStarted = false;

            hideJourneyBike();

        } else {

            // User is now in the scroll journey
            heroRunning = false;

            // Make absolutely sure the announcement is
            // no longer fixed/towed.
            releaseAnnouncementTow();

            scrollingStarted = true;

            animateScrollJourney();
        }


        /*
        * Wait until the user stops
        * scrolling.
        */

        scrollStopTimer =
            setTimeout(

                function () {

                    /*
                    * Continue wheel rotation
                    * for a short momentum period.
                    */

                    if (
                        Math.abs(scrollVelocity) >
                        0.15
                    ) {

                        if (
                            momentumFrame === null
                        ) {

                            momentumFrame =
                                requestAnimationFrame(
                                    continueWheelMomentum
                                );
                        }
                    }


                    /*
                    * Gradually remove velocity
                    * over approximately 2 seconds.
                    */

                    setTimeout(

                        function () {

                            scrollVelocity *=
                                0.35;

                        },

                        MOMENTUM_DURATION
                    );

                },

                120
            );
    }

    /* =====================================================
       RESIZE
       ===================================================== */

    function handleResize() {

        calculatePagePositions();


        if (
            scrollingStarted
        ) {

            animateScrollJourney();
        }
    }


    /* =====================================================
       INITIALISE
       ===================================================== */

    calculatePagePositions();


    /*
     * Make sure the bike is hidden
     * before the Hero animation starts.
     */

    bike.style.opacity =
        "0";


    rearWheel.style.opacity =
        "0";


    frontWheel.style.opacity =
        "0";


    if (mudRoad) {

        mudRoad.style.opacity =
            "0";
    }


    if (dust) {

        dust.style.opacity =
            "0";
    }


    /*
     * Start Hero animation.
     */

    // =====================================================
    // START HERO ANIMATION SAFELY
    // =====================================================

    function startHeroAnimation() {

        // Make sure we are actually at the top
        window.scrollTo(0, 0);

        calculatePagePositions();

        lastScrollY =
            window.scrollY ||
            window.pageYOffset ||
            0;

        lastScrollTime =
            performance.now();

        // Give the browser a moment to finish
        // scroll restoration/layout.
        setTimeout(function () {

            pageInitializing = false;

            heroRunning = true;

            lastTime = null;

            requestAnimationFrame(
                animateHero
            );

        }, 100);
    }

    startHeroAnimation();


    /* =====================================================
       EVENTS
       ===================================================== */

    window.addEventListener(

        "scroll",

        handleScroll,

        {
            passive: true
        }
    );


    window.addEventListener(

        "resize",

        handleResize
    );


})();

