// ========================================
// SHERPAS MEMBERSHIP WIZARD
// ========================================

let currentStep = 1;

const steps = document.querySelectorAll(".section");
const totalSteps = steps.length;

const nextButtons = document.querySelectorAll(".next-btn");
const prevButtons = document.querySelectorAll(".prev-btn");

// ========================================
// SHOW STEP
// ========================================

function showStep(step) {

    steps.forEach((section, index) => {

        if (index === step - 1) {

            section.style.display = "block";
            section.classList.add("active-step");

        } else {

            section.style.display = "none";
            section.classList.remove("active-step");

        }

    });

    updateProgress();

}

// ========================================
// PROGRESS BAR
// ========================================

function updateProgress() {

    const percent = Math.round((currentStep / totalSteps) * 100);

    const fill = document.getElementById("progressFill");
    const text = document.getElementById("progressText");

    if (fill)
        fill.style.width = percent + "%";

    if (text)
        text.innerHTML =
            `Step ${currentStep} of ${totalSteps} (${percent}%)`;

}

// ========================================
// REQUIRED FIELD VALIDATION
// ========================================

function validateStep(step) {

    const currentSection = steps[step - 1];

    const requiredFields =
        currentSection.querySelectorAll("[required]");

    for (const field of requiredFields) {

        if (field.type === "checkbox") {

            if (!field.checked) {

                Swal.fire({

                    icon: "warning",

                    title: "Declaration Required",

                    text: "Please accept the declaration."

                });

                field.focus();

                return false;

            }

        } else {

            let value = field.value;

            if (typeof value === "string")
                value = value.trim();

            if (!value) {

                Swal.fire({

                    icon: "warning",

                    title: "Required Field",

                    text:
                        field.previousElementSibling?.innerText ||
                        "Please fill all required fields."

                });

                field.focus();

                return false;

            }

        }

    }

    return true;

}

// ========================================
// NEXT BUTTON
// ========================================

nextButtons.forEach(button => {

    button.addEventListener("click", async function () {

        if (!validateStep(currentStep))
            return;

        let ok = true;

        switch (currentStep) {

            case 2:
                ok = await validateAge();
                if (!ok) return;

                ok = await validateAadhaar();
                break;

            case 4:
                ok = await validatePhone();
                if (!ok) return;

                ok = await validateEmail();
                break;

            case 5:
                ok = await validateVehicleRegistration();
                if (!ok) return;

                ok = await validateDrivingLicence();
                break;

        }

        if (!ok)
            return;

        if (currentStep < totalSteps) {

            currentStep++;

            showStep(currentStep);

        }

        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    });

});

// ========================================
// PREVIOUS BUTTON
// ========================================

prevButtons.forEach(button => {

    button.addEventListener("click", function () {

        if (currentStep <= 1)
            return;

        currentStep--;

        showStep(currentStep);

        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    });

});

// ========================================
// INITIAL LOAD
// ========================================

showStep(currentStep);