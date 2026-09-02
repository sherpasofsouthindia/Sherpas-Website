// ========================================
// SHERPAS MEMBERSHIP WIZARD
// ========================================

let currentStep = 1;

// Prevent multiple Next clicks while validation is running
let isNextProcessing = false;

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
// UPDATE PROGRESS
// ========================================

function updateProgress() {

    const percent =
        Math.round((currentStep / totalSteps) * 100);

    const fill =
        document.getElementById("progressFill");

    const text =
        document.getElementById("progressText");

    if (fill) {
        fill.style.width = percent + "%";
    }

    if (text) {
        text.innerHTML =
            `Step ${currentStep} of ${totalSteps} (${percent}%)`;
    }
}


// ========================================
// VALIDATE CURRENT STEP
// ========================================

function validateStep(step) {

    const currentSection = steps[step - 1];

    if (!currentSection) {
        return false;
    }

    const requiredFields =
        currentSection.querySelectorAll("[required]");

    for (const field of requiredFields) {

        // Checkbox
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

        }

        // Other fields
        else {

            let value = field.value;

            if (typeof value === "string") {
                value = value.trim();
            }

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
// NEXT BUTTON UI
// ========================================

function setNextButtonsProcessing(processing) {

    nextButtons.forEach(button => {

        if (processing) {

            // Store original button text only once
            if (!button.dataset.originalText) {

                button.dataset.originalText =
                    button.innerHTML;
            }

            button.disabled = true;

            button.classList.add("checking");

            button.innerHTML =
                '<i class="fa-solid fa-spinner fa-spin"></i> Checking...';

        } else {

            button.disabled = false;

            button.classList.remove("checking");

            if (button.dataset.originalText) {

                button.innerHTML =
                    button.dataset.originalText;
            }
        }
    });
}


// ========================================
// NEXT BUTTON
// ========================================

nextButtons.forEach(button => {

    button.addEventListener("click", async function () {

        // --------------------------------
        // IMPORTANT:
        // Ignore repeated clicks while
        // validation is running.
        // --------------------------------

        if (isNextProcessing) {

            return;
        }


        // --------------------------------
        // Normal required-field validation
        // --------------------------------

        if (!validateStep(currentStep)) {
            return;
        }


        // --------------------------------
        // LOCK IMMEDIATELY
        //
        // This happens BEFORE any await.
        // --------------------------------

        isNextProcessing = true;

        setNextButtonsProcessing(true);


        try {

            let ok = true;


            // ========================================
            // STEP 2
            // Age + Aadhaar
            // ========================================

            switch (currentStep) {

                case 2:

                    ok = await validateAge();

                    if (!ok) {
                        return;
                    }

                    ok = await validateAadhaar();

                    break;


                // ========================================
                // STEP 4
                // Phone + Email
                // ========================================

                case 4:

                    ok = await validatePhone();

                    if (!ok) {
                        return;
                    }

                    ok = await validateEmail();

                    break;


                // ========================================
                // STEP 5
                // Vehicle + Driving Licence
                // ========================================

                case 5:

                    ok = await validateVehicleRegistration();

                    if (!ok) {
                        return;
                    }

                    ok = await validateDrivingLicence();

                    break;
            }


            // --------------------------------
            // Validation failed
            // --------------------------------

            if (!ok) {
                return;
            }


            // --------------------------------
            // Move to next step
            // --------------------------------

            if (currentStep < totalSteps) {

                currentStep++;

                showStep(currentStep);
            }


            // --------------------------------
            // Scroll to top
            // --------------------------------

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        }


        // ========================================
        // ERROR HANDLING
        // ========================================

        catch (error) {

            console.error(
                "NEXT validation error:",
                error
            );

            Swal.fire({
                icon: "error",
                title: "Validation Error",
                text:
                    error?.message ||
                    "Unable to validate your details. Please try again."
            });

        }


        // ========================================
        // ALWAYS UNLOCK
        // ========================================

        finally {

            isNextProcessing = false;

            setNextButtonsProcessing(false);
        }

    });

});


// ========================================
// PREVIOUS BUTTON
// ========================================

prevButtons.forEach(button => {

    button.addEventListener("click", function () {

        // Do not allow Previous while
        // asynchronous validation is running.

        if (isNextProcessing) {

            return;
        }


        if (currentStep <= 1) {
            return;
        }


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

