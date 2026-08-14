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

hero.style.backgroundImage = `url(${heroImages[0]})`;

setInterval(() => {
    current++;

    if (current >= heroImages.length) {
        current = 0;
    }

    hero.style.backgroundImage = `url(${heroImages[current]})`;

}, 4000);
