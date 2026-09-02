document.addEventListener("DOMContentLoaded", function () {

    // Load common form data
    initializeFormData();
    
    // ========================================
    // Maximum DOB = 18 Years
    // ========================================

    const dobInput = document.getElementById("dob");

    if (dobInput) {

        const maxDate = new Date();

        maxDate.setFullYear(maxDate.getFullYear() - 18);

        dobInput.max = maxDate.toISOString().split("T")[0];

    }

    // -----------------------------
    // Application Date
    // -----------------------------
    const applicationDate = document.getElementById("applicationDate");

    if (applicationDate) {
        applicationDate.value = new Date().toISOString().split("T")[0];
    }

    // -----------------------------
    // Health Details
    // -----------------------------
    const health = document.getElementById("healthissues");
    const details = document.getElementById("healthDetailsBox");

    if (health && details) {

        health.addEventListener("change", function () {

            details.style.display =
                this.value === "Yes" ? "block" : "none";

        });

    }

    
    // -----------------------------
    // Accident History
    // -----------------------------

    const accident = document.getElementById("accidentHistory");
    const accidentBox = document.getElementById("accidentDetailsBox");

    if (accident && accidentBox) {

        accident.addEventListener("change", function () {

            accidentBox.style.display =
                this.value === "Yes" ? "block" : "none";

        });

    }

    // -----------------------------
    // Other Club
    // -----------------------------
    const otherClub = document.getElementById("otherclub");
    const otherClubBox = document.getElementById("otherClubBox");

    if (otherClub && otherClubBox) {

        otherClub.addEventListener("change", function () {

            otherClubBox.style.display =
                this.value === "Yes" ? "block" : "none";

        });

    }

    // -----------------------------
    // Official Post
    // -----------------------------
    const officialPost = document.getElementById("officialpost");
    const officialPostBox = document.getElementById("officialPostBox");

    if (officialPost && officialPostBox) {

        officialPost.addEventListener("change", function () {

            officialPostBox.style.display =
                this.value === "Yes" ? "block" : "none";

        });

    }

    // -----------------------------
    // PHOTO PREVIEW
    // -----------------------------

    const photo = document.getElementById("photo");
    const preview = document.getElementById("photoPreview");
    

    photo.addEventListener("change", function () {

        const file = this.files[0];

        if (!file) return;

        preview.innerHTML = `
            <img src="${URL.createObjectURL(file)}" alt="Member Photo">
        `;

        preview.style.borderStyle = "solid";

        let name = file.name;

        if (name.length > 30) {
            name = name.substring(0, 27) + "...";
        }

        const photoFileName = document.getElementById("photoFileName");

        if (photoFileName) {
            photoFileName.textContent = name;
        }

    });

    /*=====================================
    DIGITAL SIGNATURE
    ======================================*/

    const canvas = document.getElementById("signature-pad");

    if(canvas){

    const ctx = canvas.getContext("2d");

    ctx.strokeStyle="#000";
    ctx.lineWidth=2;
    ctx.lineCap="round";

    let drawing=false;

    function getPos(e){

    const rect=canvas.getBoundingClientRect();

    if(e.touches){

    return{

    x:e.touches[0].clientX-rect.left,
    y:e.touches[0].clientY-rect.top

    };

    }

    return{

    x:e.clientX-rect.left,
    y:e.clientY-rect.top

    };

    }

    function startDraw(e){

    drawing=true;

    const pos=getPos(e);

    ctx.beginPath();

    ctx.moveTo(pos.x,pos.y);

    }

    function draw(e){

    if(!drawing)return;

    e.preventDefault();

    const pos=getPos(e);

    ctx.lineTo(pos.x,pos.y);

    ctx.stroke();

    }

    function stopDraw(){

    drawing=false;

    }

    canvas.addEventListener("mousedown",startDraw);
    canvas.addEventListener("mousemove",draw);
    canvas.addEventListener("mouseup",stopDraw);
    canvas.addEventListener("mouseleave",stopDraw);

    canvas.addEventListener("touchstart",startDraw);
    canvas.addEventListener("touchmove",draw);
    canvas.addEventListener("touchend",stopDraw);

    document.getElementById("clearSignature")
    .addEventListener("click",function(){

    ctx.clearRect(0,0,canvas.width,canvas.height);

    });

    }

    const paymentInput = document.getElementById("paymentProof");

    if(paymentInput){

    paymentInput.addEventListener("change",function(){

    const file=this.files[0];

    if(!file) return;

    const reader=new FileReader();

    reader.onload=function(e){

    const img=document.getElementById("paymentPreview");

    img.src=e.target.result;
    img.style.display="block";

    };

    reader.readAsDataURL(file);

    });

    }
    const memberForm = document.getElementById("memberForm");

    /*==================================================
            STEP WIZARD
    ==================================================*/

    let currentStep = 1;
    const totalSteps = 12;

    const steps = document.querySelectorAll(".section");

    function showStep(step){

        steps.forEach((section,index)=>{

            if(index === step-1){

                section.style.display="block";
                section.classList.add("active-step");

            }else{

                section.style.display="none";
                section.classList.remove("active-step");

            }

        });

        updateProgress();

    }

    function updateProgress(){

        const percent = Math.round((currentStep / totalSteps) * 100);

        document.getElementById("progressFill").style.width = percent + "%";

        document.getElementById("progressText").innerHTML =
            "Step " + currentStep + " of " + totalSteps +
            " (" + percent + "%)";

    }

    /*==================================================
            NEXT BUTTON
    ==================================================

    document.querySelectorAll(".next-btn").forEach(btn=>{

        btn.addEventListener("click",function(){

            if(!validateStep(currentStep)){
                return;
            }

            if(currentStep<totalSteps){

                currentStep++;

                showStep(currentStep);

                window.scrollTo({

                    top:0,

                    behavior:"smooth"

                });

            }

        });

    });*/

    /*==================================================
            PREVIOUS BUTTON
    ==================================================

    document.querySelectorAll(".prev-btn").forEach(btn=>{

        btn.addEventListener("click",function(){

            if(currentStep>1){

                currentStep--;

                showStep(currentStep);

                window.scrollTo({

                    top:0,

                    behavior:"smooth"

                });

            }

        });

    });*/

    /*==================================================
            STEP VALIDATION
    ==================================================*/

    function validateStep(step){

        const section=document.getElementById("step"+step);

        const requiredFields=section.querySelectorAll("[required]");

        for(const field of requiredFields){

            if(field.value.trim()===""){

                const label=field
                    .closest(".form-group")
                    .querySelector("label")
                    .innerText;

                Swal.fire({

                icon:"warning",

                title:"Required",

                text:"Please enter " + label

                });

                field.focus();

                return false;

            }

        }

        return true;

    }

    // ===============================
    // Submit Membership Form
    // ===============================

    
    async function submitMember(){

    const form=document.getElementById("memberForm");

    const requiredFields = memberForm.querySelectorAll("[required]");

    for (const field of requiredFields) {

        if (!field.value.trim()) {

            alert("Please fill: " + (field.previousElementSibling?.innerText || field.name));

            // Open the collapsed section
            const content = field.closest(".section-content");
            if (content) {
                content.style.display = "block";
            }

            field.focus();

            return;
        }
    }

    const photo=document.getElementById("photo").files[0];

    const payment=document.getElementById("paymentProof").files[0];

    if(!photo){

    alert("Please upload Member Photo");

    return;

    }

    if(!payment){

    alert("Please upload Payment Screenshot");

    return;

    }

    const photo64=await fileToBase64(photo);

    const payment64=await fileToBase64(payment);

    const signature=document
    .getElementById("signature-pad")
    .toDataURL();

    const data = {

        fullname: document.getElementById("fullname").value.trim(),

        dob: document.getElementById("dob").value,

        gender: document.getElementById("gender").value,

        maritalstatus: document.getElementById("maritalstatus").value,

        aadhaar: document.getElementById("aadhaar").value.trim(),

        father: document.getElementById("father").value.trim(),

        mother: document.getElementById("mother").value.trim(),

        phone: document.getElementById("phone").value.trim(),

        email: document.getElementById("email").value.trim(),

        address: document.getElementById("address").value.trim(),

        state: document.getElementById("state").value,

        district: document.getElementById("district").value,

        pincode: document.getElementById("pincode").value.trim(),

        bloodgroup: document.getElementById("bloodgroup").value,

        motorcyclemodel: document.getElementById("motorcyclemodel").value,

        vehiclevariant: document.getElementById("vehiclevariant").value,

        vehiclereg: document.getElementById("vehiclereg").value.trim(),

        enginenumber: document.getElementById("enginenumber").value.trim(),

        chassisnumber: document.getElementById("chassisnumber").value.trim(),

        license: document.getElementById("license").value.trim(),

        working: document.getElementById("working").value.trim(),

        healthissues: document.getElementById("healthissues").value,

        healthdetails: document.getElementById("healthdetails").value.trim(),

        accident: document.getElementById("accidentHistory").value,

        accidentdetails: document.getElementById("accidentdetails").value.trim(),

        emergency1: document.getElementById("emergency1").value.trim(),

        emergency2: document.getElementById("emergency2").value.trim(),

        otherclub: document.getElementById("otherclub").value,

        otherclubdetails: document.getElementById("otherclubdetails").value.trim(),

        officialpost: document.getElementById("officialpost").value,

        officialpostdetails: document.getElementById("officialpostdetails").value.trim(),

        social: document.getElementById("socialmedia").value.trim(),

        photo: photo64,

        paymentProof: payment64,

        signature: signature

    };
    
    try {

        Swal.fire({

            title: "Submitting Membership",

            html: "Please wait...<br><br>Uploading Files",

            allowOutsideClick: false,

            allowEscapeKey: false,

            didOpen: () => {

                Swal.showLoading();

            }

        });

            const submitBtn = document.querySelector(".btn-primary");

            submitBtn.disabled = true;

            submitBtn.innerHTML =
                '<i class="fa-solid fa-spinner fa-spin"></i> Uploading Membership...';

            const formData = new URLSearchParams();

            formData.append("action", "ADD_MEMBER");
            formData.append("data", JSON.stringify(data));


            const response = await fetch(API_URL, {

                method: "POST",

                body: formData

            });

            const text = await response.text();

            let result;

            try{
                result = JSON.parse(text);
            }
            catch(e){
                alert("Server returned:\n\n" + text);
                return;
            }
            
            const applicationId = result.data.applicationID;

            if (result.success) {

                Swal.fire({
                    icon: "success",
                    title: "Membership Registered",
                    html: `
                        <h2 style="color:#ff7a00">${applicationId}</h2>

                        <p><b>Status :</b> Pending Approval</p>

                        <p>Welcome to Sherpas of South India</p>
                    `,
                    confirmButtonText: "View Members"
                }).then(() => {

                    window.location.href = "members.html";

                });

                return;

            }else {

                Swal.fire({

                    icon:"error",

                    title:"Submission Failed",

                    text:result.message

                });

            }

        }
        catch (error) {

            console.error(error);

            Swal.fire({

                icon:"error",

                title:"Server Error",

                text:error.message

            });

        }
        finally {

            const submitBtn = document.querySelector(".btn-primary");

            submitBtn.disabled = false;

            submitBtn.innerHTML =
                '<i class="fa-solid fa-paper-plane"></i> Submit Membership';

        }

    }   

    function fileToBase64(file){

    return new Promise((resolve)=>{

    const reader=new FileReader();

    reader.onload=()=>resolve(reader.result);

    reader.readAsDataURL(file);

    });

    }

        
    showStep(currentStep);

    // ===============================
    // FORM SUBMIT
    // ===============================

    memberForm.addEventListener("submit", async function (e) {

        e.preventDefault();

        if (!validateStep(12)) {
            return;
        }

        if (!document.getElementById("agreeTerms").checked) {
            alert("Please accept the declaration.");
            return;
        }

        await submitMember();

    });

    function zoomImage(src){

        document.getElementById("viewerImage").src = src;

        document.getElementById("imageViewer").style.display = "flex";
    }

    function closeImageViewer(){

        document.getElementById("imageViewer").style.display = "none";
    }

});

