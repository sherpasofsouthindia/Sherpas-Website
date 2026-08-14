window.addEventListener("scroll", () => {

    const navbar = document.querySelector(".navbar");

    if (window.scrollY > 50) {

        navbar.classList.add("scrolled");

    } else {

        navbar.classList.remove("scrolled");

    }

});

document.addEventListener("DOMContentLoaded", function () {

    const logo = document.querySelector(".logo");

    if (logo) {

        logo.style.cursor = "pointer";

        logo.addEventListener("click", function () {

            window.location.href = "../index.html";

        });

    }

});

/* ==========================================
   CONTACT FORM - EMAILJS
========================================== */

const contactForm = document.getElementById("contactForm");

if (contactForm) {

    contactForm.addEventListener("submit", function (e) {

        e.preventDefault();

        const button = contactForm.querySelector("button");

        button.disabled = true;
        button.innerHTML = "Sending...";

        const phone = document.getElementById("phone").value.trim();

        if (!/^[6-9]\d{9}$/.test(phone)) {

            Swal.fire({
                icon: "warning",
                title: "Invalid Mobile Number",
                text: "Please enter a valid 10-digit Indian mobile number."
            });

            return;
        }

        const params = {

            name: document.getElementById("name").value,

            phone: phone,

            subject: document.getElementById("subject").value,

            message: document.getElementById("message").value

        };

        emailjs.send(
            "service_2cia8lw",
            "template_q0lo5ji",
            params
        )

        .then(function () {

            Swal.fire({

                icon: "success",

                title: "Message Sent!",

                text: "Thank you for contacting Sherpas. We will get back to you soon."

            });

            contactForm.reset();

        })

        .catch(function (error) {

            console.error(error);

            Swal.fire({

                icon: "error",

                title: "Message Failed",

                text: "Unable to send your message. Please try again."

            });

        })

        .finally(function () {

            button.disabled = false;

            button.innerHTML = "Send Message";

        });

    });

}