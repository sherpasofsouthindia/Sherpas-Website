let allMembers = [];

let selectedMember = null;

document.addEventListener("DOMContentLoaded", () => {

    loadMembers();

    document
        .getElementById("refreshBtn")
        .addEventListener("click", loadMembers);

    document.getElementById("searchMember")
    .addEventListener("input", function () {

        const keyword = this.value.toLowerCase();

        const filtered = allMembers.filter(member =>

            (member["Application ID"] || "").toLowerCase().includes(keyword) ||

            (member["Full Name"] || "").toLowerCase().includes(keyword) ||

            (member["Phone"] || "").toString().includes(keyword) ||

            (member["Vehicle Registration"] || "").toLowerCase().includes(keyword)

        );

        renderMembers(filtered);

    });

    document
    .getElementById("imageViewer")
    .addEventListener("click",closeImage);

    document
    .querySelector(".close-image")
    .addEventListener("click",closeImage);

    });

async function loadMembers() {

    try {

        const tbody =
            document.getElementById("membersTableBody");

        tbody.innerHTML = `
        <tr>
            <td colspan="7">
            <i class="fa-solid fa-spinner fa-spin"></i>
            Loading Members...
            </td>
        </tr>`;

        const response = await fetch(API_URL);

        const result = await response.json();



        if (!result.success) {

            tbody.innerHTML =
            "<tr><td colspan='7'>No Members Found</td></tr>";

            return;

        }


        allMembers = result.members;


        renderMembers(allMembers);

        updateCounts();

    }

    catch (err) {

        console.log(err);

    }

}

function renderMembers(members) {

    // Sort members by Membership ID
    // Members without Membership ID will appear last
    members = [...members].sort((a, b) => {

        const idA = String(a["Membership ID"] || "").trim();
        const idB = String(b["Membership ID"] || "").trim();

        // Empty Membership IDs go to the bottom
        if (!idA && !idB) return 0;
        if (!idA) return 1;
        if (!idB) return -1;

        // Natural sorting: SSI-2 comes before SSI-10
        return idA.localeCompare(idB, undefined, {
            numeric: true,
            sensitivity: "base"
        });
    });

    const tbody =
        document.getElementById("membersTableBody");


    tbody.innerHTML = "";

    if (members.length == 0) {

        tbody.innerHTML =
        "<tr><td colspan='7'>No Members Found</td></tr>";

        return;

    }

    members.forEach(member => {

        tbody.innerHTML += `

<tr>

<td>${member["Membership ID"]}</td>

<td>

<img
src="${driveToImage(member["Photo URL"])}"
style="
width:50px;
height:50px;
border-radius:50%;
object-fit:cover;
border:2px solid #ff7a00;"
onerror="this.src='assets/user.png'">

</td>

<td>${member["Full Name"]}</td>

<td>${member["Phone"]}</td>

<td>${member["Vehicle Registration"] || "-"}</td>

<td>

<span class="${member.Status.toLowerCase()}">

${member.Status}

</span>

</td>

    <td>

        <!-- VIEW MEMBER -->

        <button
            class="icon-btn"
            onclick="viewMember(${allMembers.indexOf(member)})"
            title="View Member">

            <i class="fa-solid fa-eye"></i>

        </button>


        <!-- APPROVE -->

        ${(member["Status"] || "").toLowerCase() === "pending" ? `

        <button
            class="icon-btn approve"
            onclick="approveMember(${allMembers.indexOf(member)})"
            title="Approve Member">

            <i class="fa-solid fa-circle-check"></i>

        </button>

        ` : ""}


        <!-- EDIT -->

        <button
            class="icon-btn"
            onclick="editMember(${allMembers.indexOf(member)})"
            title="Edit Member">

            <i class="fa-solid fa-pen"></i>

        </button>


        <!-- APPLICATION PDF -->

        <button
            class="icon-btn pdf"
            onclick="generateApplicationPDF(${allMembers.indexOf(member)})"
            title="Application PDF">

            <i class="fa-solid fa-file-pdf"></i>

        </button>

    </td>

</tr>

`;

    });

}

function updateCounts() {

    document.getElementById("totalMembers").innerHTML =
        allMembers.length;

    document.getElementById("approvedMembers").innerHTML =
        allMembers.filter(x => x.Status == "Approved").length;

    document.getElementById("pendingMembers").innerHTML =
        allMembers.filter(x => x.Status == "Pending").length;

    document.getElementById("rejectedMembers").innerHTML =
        allMembers.filter(x => x.Status == "Rejected").length;

}

function searchMembers() {

    const keyword =
        document
        .getElementById("searchMember")
        .value
        .toLowerCase();

    const filtered = allMembers.filter(member =>

        member["Full Name"]
            .toLowerCase()
            .includes(keyword)

        ||

        member["Membership ID"]
            .toLowerCase()
            .includes(keyword)

        ||

        member["Phone"]
            .toLowerCase()
            .includes(keyword)

    );

    renderMembers(filtered);

}

function driveToImage(url){

    if(!url) return "assets/user.png";

    const match = url.match(/\/d\/(.*?)\//);

    if(match){

        return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w200`;

    }

    return url;

}

function viewMember(index){

    const member = allMembers[index];
    
    selectedMember = member;

    const html = `

    <div class="profile-header">

        <img
        src="${driveToImage(member["Photo URL"])}"
        onclick="zoomImage('${driveToImage(member["Photo URL"])}')">

        <div class="profile-info">

            <h2>${member["Full Name"]}</h2>

            <h3>${member["Membership ID"]}</h3>

            <span class="${member["Status"].toLowerCase()}">

                ${member["Status"]}

            </span>

        </div>

    </div>

    <div class="details-grid">

        <div class="detail-card">

            <h3>Personal Information</h3>

            <p><strong>Date of Birth :</strong> ${formatDate(member["Date of Birth"] || "-")}</p>
            <p><strong>Blood Group :</strong> ${member["Blood Group"] || "-"}</p>
            <p><strong>Phone :</strong> ${member["Phone"] || "-"}</p>
            <p><strong>Email :</strong> ${member["Email"] || "-"}</p>

        </div>

        <div class="detail-card">

            <h3>Address</h3>

            <p>${member["Address"] || "-"}</p>

            <p><strong>District :</strong> ${member["District"] || "-"}</p>

        </div>

        <div class="detail-card">

            <h3>Vehicle Details</h3>

            <p><strong>Registration :</strong> ${member["Vehicle Registration"] || "-"}</p>

            <p><strong>Driving Licence :</strong> ${member["Driving Licence"] || "-"}</p>

        </div>

        <div class="detail-card">

            <h3>Emergency Contact</h3>

            <p><strong>Primary :</strong> ${member["Emergency Contact 1"] || "-"}</p>

            <p><strong>Secondary :</strong> ${member["Emergency Contact 2"] || "-"}</p>

        </div>

        <div class="detail-card">

            <h3>Signature</h3>

            <img
            src="${driveToImage(member["Signature URL"])}"
            onclick="zoomImage('${driveToImage(member["Signature URL"])}')">

        </div>

        <div class="detail-card">

            <h3>Payment Proof</h3>

            <img
            src="${driveToImage(member["Payment Proof URL"])}"
            onclick="zoomImage('${driveToImage(member["Payment Proof URL"])}')">

        </div>

    </div>

    `;

    let buttons="";

    switch(member["Status"]){

        case "Pending":

            buttons=`

            <div class="profile-actions">

                <button class="btn-success"
                    onclick="approveSelectedMember()">

                    <i class="fa-solid fa-circle-check"></i>

                    Approve

                </button>

                <button class="btn-danger"
                    onclick="rejectSelectedMember()">

                    <i class="fa-solid fa-ban"></i>

                    Reject

                </button>

                <button class="btn-primary"
                    onclick="editSelectedMember()">

                    <i class="fa-solid fa-pen"></i>

                    Edit

                </button>

            </div>

            `;

        break;

        case "Approved":
            buttons=`
            <div class="profile-actions">

                <button class="btn-warning"
                    onclick="changeMemberStatus('Inactive')">
                    <i class="fa-solid fa-user-slash"></i>
                    Deactivate
                </button>

                <button class="btn-primary"
                    onclick="editSelectedMember()">
                    <i class="fa-solid fa-pen"></i>
                    Edit
                </button>

                <button class="btn-info"
                    onclick="printMembershipCard()">
                    <i class="fa-solid fa-id-card"></i>
                    Print Card
                </button>

                <button class="btn-success"
                    onclick="openRenewalForm()">
                    <i class="fa-solid fa-rotate-right"></i>
                    Renew Membership
                </button>

            </div>
            `;
        break;

        case "Rejected":

            buttons=`

            <div class="profile-actions">

                <button class="btn-success"
                    onclick="approveSelectedMember()">

                    <i class="fa-solid fa-circle-check"></i>

                    Approve

                </button>

                <button class="btn-primary"
                    onclick="editSelectedMember()">

                    <i class="fa-solid fa-pen"></i>

                    Edit

                </button>

            </div>

            `;

        break;

    }

    document.getElementById("memberDetails").innerHTML = html + buttons;

    document.getElementById("memberModal").style.display = "block";

}

document.querySelector(".close-modal").onclick = function(){

    document.getElementById("memberModal").style.display = "none";

}

window.onclick = function(event){

    if(event.target == document.getElementById("memberModal")){

        document.getElementById("memberModal").style.display = "none";

    }

}
function formatDate(date){

    if(!date) return "-";

    return new Date(date).toLocaleDateString("en-IN",{
        day:"2-digit",
        month:"long",
        year:"numeric"
    });

}

let currentScale = 1;
let translateX = 0;
let translateY = 0;
let isDragging = false;
let startX = 0;
let startY = 0;

function zoomImage(src){

    const viewer = document.getElementById("imageViewer");
    const img = document.getElementById("viewerImage");

    currentScale = 1;
    translateX = 0;
    translateY = 0;

    img.src = src;

    img.style.transform = "translate(0px,0px) scale(1)";

    viewer.style.display="flex";

}

const viewer=document.getElementById("imageViewer");
const viewerImg=document.getElementById("viewerImage");

document.getElementById("imageViewer").addEventListener("wheel", function(e){

    e.preventDefault();

    if(e.deltaY<0){

        currentScale+=0.2;

    }else{

        currentScale-=0.2;

    }

    if(currentScale<1) currentScale=1;

    if(currentScale>6) currentScale=6;

    viewerImg.style.transform=
    `translate(${translateX}px,${translateY}px)
     scale(${currentScale})`;

}, { passive:false });

viewerImg.addEventListener("mousedown",function(e){

    if(currentScale==1) return;

    isDragging=true;

    startX=e.clientX-translateX;

    startY=e.clientY-translateY;

    viewerImg.style.cursor="grabbing";

});

document.addEventListener("mousemove",function(e){

    if(!isDragging) return;

    translateX=e.clientX-startX;

    translateY=e.clientY-startY;

    viewerImg.style.transform=
    `translate(${translateX}px,${translateY}px)
     scale(${currentScale})`;

});

document.addEventListener("mouseup",function(){

    isDragging=false;

    viewerImg.style.cursor="grab";

});

viewerImg.addEventListener("dblclick",function(){

    currentScale=1;

    translateX=0;

    translateY=0;

    viewerImg.style.transform="translate(0px,0px) scale(1)";

});

document.addEventListener("keydown",function(e){

    if(e.key==="Escape"){

        closeImage();

    }

});

function closeImage(){

    document.getElementById("imageViewer").style.display="none";

}

function editMember(index) {

    const member = allMembers[index];

    const applicationID =
        member["Application ID"];

    if (!applicationID) {

        Swal.fire({

            icon: "error",

            title: "Application ID Missing",

            text:
                "Unable to open this member for editing."

        });

        return;

    }

    window.location.href =
        "edit-member.html?applicationID=" +
        encodeURIComponent(applicationID);

}

async function approveMember(index) {

    const member = allMembers[index];

    const confirm = await Swal.fire({
        title: "Approve Member?",
        text: member["Full Name"],
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Approve"
    });

    if (!confirm.isConfirmed) return;

    const formData = new URLSearchParams();

    formData.append("action", "APPROVE_MEMBER");

    formData.append(
        "data",
        JSON.stringify({
            applicationID: member["Application ID"]
        })
    );

    const response = await fetch(API_URL, {
        method: "POST",
        body: formData
    });

    const result = await response.json();

    if(result.success){

        Swal.fire({

            icon: "success",

            title: "Member Approved",

            html: `
                <h2 style="color:#ff7a00">
                    ${result.data.memberID}
                </h2>

                <p>Application Approved Successfully</p>
            `

        });

        loadMembers();

    }else{

        Swal.fire(
            "Error",
            result.message,
            "error"
        );

    }

}

function approveSelectedMember(){

    // Close member profile popup
    document.getElementById("memberModal").style.display = "none";

    // Open SweetAlert
    approveMember(
        allMembers.indexOf(selectedMember)
    );

}

function editSelectedMember(){

    editMember(
        allMembers.indexOf(selectedMember)
    );

}

async function changeMemberStatus(status){

    document.getElementById("memberModal").style.display="none";

    const confirm = await Swal.fire({

        icon:"question",

        title:status=="Inactive"
            ?"Deactivate Member?"
            :"Activate Member?",

        text:selectedMember["Full Name"],

        showCancelButton:true,

        confirmButtonText:status

    });

    if(!confirm.isConfirmed)
        return;

    const formData=new URLSearchParams();

    formData.append("action","CHANGE_STATUS");

    formData.append(

        "data",

        JSON.stringify({

            memberID:selectedMember["Membership ID"],

            status:status

        })

    );

    const response=await fetch(API_URL,{

        method:"POST",

        body:formData

    });

    const result=await response.json();

    if(result.success){

        Swal.fire(

            "Success",

            result.message,

            "success"

        );

        loadMembers();

    }

}

async function rejectSelectedMember(){

    document.getElementById("memberModal").style.display = "none";

    const { value: reason } = await Swal.fire({

        title: "Reject Member",

        input: "textarea",

        inputLabel: "Reason",

        inputPlaceholder: "Enter rejection reason...",

        showCancelButton: true,

        confirmButtonText: "Reject",

        confirmButtonColor: "#dc2626",

        inputValidator: (value)=>{

            if(!value){

                return "Please enter rejection reason.";

            }

        }

    });

    if(!reason) return;

    const formData = new URLSearchParams();

    formData.append("action","REJECT_MEMBER");

    formData.append(

        "data",

        JSON.stringify({

            memberID:selectedMember["Membership ID"],

            reason:reason

        })

    );

    const response = await fetch(API_URL,{

        method:"POST",

        body:formData

    });

    const result = await response.json();

    if(result.success){

        Swal.fire(

            "Rejected",

            result.message,

            "success"

        );

        loadMembers();

    }else{

        Swal.fire(

            "Error",

            result.message,

            "error"

        );

    }

}

    /*==================================================
            EXPORT MEMBERS TO EXCEL
            SELECT REQUIRED FIELDS
    ==================================================*/

    document
        .getElementById("exportExcelBtn")
        .addEventListener("click", async function () {

            if (!allMembers || allMembers.length === 0) {

                Swal.fire({
                    icon: "info",
                    title: "No Members",
                    text: "There are no members available to export."
                });

                return;
            }


            /*------------------------------------------
                    FIELDS TO EXCLUDE
            ------------------------------------------*/

            const excludedFields = [
                "Photo URL",
                "Signature URL",
                "Payment Proof URL",
                "Photo",
                "Signature",
                "Payment Proof"
            ];


            /*------------------------------------------
                    GET AVAILABLE FIELDS
            ------------------------------------------*/

            const availableFields = Object.keys(allMembers[0])
                .filter(function (field) {
                    return !excludedFields.includes(field);
                });


            /*------------------------------------------
                    CREATE CHECKBOXES
            ------------------------------------------*/

            const checkboxHTML = availableFields.map(
                function (field, index) {

                    return `
                        <label style="
                            display:flex;
                            align-items:center;
                            gap:10px;
                            padding:9px 10px;
                            border-bottom:1px solid #eeeeee;
                            cursor:pointer;
                            text-align:left;
                            font-size:14px;
                        ">

                            <input
                                type="checkbox"
                                class="export-field-checkbox"
                                value="${field}"
                                ${index < 6 ? "checked" : ""}>

                            <span>${field}</span>

                        </label>
                    `;
                }
            ).join("");


            /*------------------------------------------
                    SELECT FIELDS POPUP
            ------------------------------------------*/

            const result = await Swal.fire({

                title: "Select Fields to Export",

                html: `

                    <div style="
                        display:flex;
                        justify-content:space-between;
                        gap:10px;
                        margin-bottom:12px;
                    ">

                        <button
                            type="button"
                            id="selectAllExportFields"
                            style="
                                flex:1;
                                padding:8px;
                                border:none;
                                border-radius:6px;
                                background:#f97316;
                                color:white;
                                cursor:pointer;
                                font-weight:600;
                            ">
                            Select All
                        </button>

                        <button
                            type="button"
                            id="clearAllExportFields"
                            style="
                                flex:1;
                                padding:8px;
                                border:none;
                                border-radius:6px;
                                background:#64748b;
                                color:white;
                                cursor:pointer;
                                font-weight:600;
                            ">
                            Clear All
                        </button>

                    </div>


                    <div
                        id="exportFieldsContainer"
                        style="
                            max-height:400px;
                            overflow-y:auto;
                            border:1px solid #dddddd;
                            border-radius:8px;
                            text-align:left;
                        ">

                        ${checkboxHTML}

                    </div>
                `,

                width: 500,

                showCancelButton: true,

                confirmButtonText: "Download Excel",

                cancelButtonText: "Cancel",

                confirmButtonColor: "#f97316",

                didOpen: function () {

                    const popup =
                        Swal.getPopup();

                    const checkboxes =
                        popup.querySelectorAll(
                            ".export-field-checkbox"
                        );


                    document
                        .getElementById("selectAllExportFields")
                        .addEventListener("click", function () {

                            checkboxes.forEach(function (checkbox) {
                                checkbox.checked = true;
                            });

                        });


                    document
                        .getElementById("clearAllExportFields")
                        .addEventListener("click", function () {

                            checkboxes.forEach(function (checkbox) {
                                checkbox.checked = false;
                            });

                        });

                },

                preConfirm: function () {

                    const selectedFields =
                        Array.from(
                            document.querySelectorAll(
                                ".export-field-checkbox:checked"
                            )
                        ).map(function (checkbox) {
                            return checkbox.value;
                        });


                    if (selectedFields.length === 0) {

                        Swal.showValidationMessage(
                            "Please select at least one field."
                        );

                        return false;
                    }


                    return selectedFields;

                }

            });


            if (!result.isConfirmed) {
                return;
            }


            const selectedFields =
                result.value;


            /*------------------------------------------
                    SORT MEMBERS BY MEMBERSHIP ID
            ------------------------------------------*/

            const sortedMembers =
                [...allMembers].sort(function (a, b) {

                    const idA =
                        String(a["Membership ID"] || "").trim();

                    const idB =
                        String(b["Membership ID"] || "").trim();


                    // Members without Membership ID appear last
                    if (!idA && !idB) return 0;
                    if (!idA) return 1;
                    if (!idB) return -1;


                    return idA.localeCompare(
                        idB,
                        undefined,
                        {
                            numeric: true,
                            sensitivity: "base"
                        }
                    );

                });


            /*------------------------------------------
                    FORMAT DATE AND TIME
            ------------------------------------------*/

            function formatExcelValue(value) {

                if (
                    value === null ||
                    value === undefined ||
                    value === ""
                ) {
                    return "";
                }


                const text =
                    String(value);


                if (
                    text.match(
                        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/
                    )
                ) {

                    const date =
                        new Date(text);


                    if (!isNaN(date.getTime())) {

                        return new Intl.DateTimeFormat(
                            "en-IN",
                            {
                                timeZone: "Asia/Kolkata",
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                                hour12: false
                            }
                        ).format(date);

                    }

                }


                return value;

            }


            /*------------------------------------------
                    PREPARE SELECTED DATA
            ------------------------------------------*/

            const exportData =
                sortedMembers.map(function (member) {

                    const row = {};

                    selectedFields.forEach(function (field) {

                        row[field] =
                            formatExcelValue(member[field]);

                    });

                    return row;

                });


            /*------------------------------------------
                    CREATE WORKSHEET
            ------------------------------------------*/

            const worksheet =
                XLSX.utils.json_to_sheet(exportData);


            const workbook =
                XLSX.utils.book_new();


            XLSX.utils.book_append_sheet(
                workbook,
                worksheet,
                "Members"
            );


            /*------------------------------------------
                    COLUMN WIDTH
            ------------------------------------------*/

            worksheet["!cols"] =
                selectedFields.map(function (field) {

                    let maxLength =
                        field.length;


                    exportData.forEach(function (row) {

                        const value =
                            String(row[field] || "");


                        if (value.length > maxLength) {
                            maxLength = value.length;
                        }

                    });


                    return {
                        wch: Math.min(
                            Math.max(maxLength + 2, 12),
                            35
                        )
                    };

                });


            /*------------------------------------------
                    DOWNLOAD FILE
            ------------------------------------------*/

            const today =
                new Date()
                    .toISOString()
                    .split("T")[0];


            XLSX.writeFile(
                workbook,
                `SHERPAS_Members_${today}.xlsx`
            );


            Swal.fire({
                icon: "success",
                title: "Excel Exported",
                text:
                    exportData.length +
                    " members exported successfully.",
                timer: 1800,
                showConfirmButton: false
            });

        });

function printMembershipCard(){

    alert("Coming Soon");

}


/*==================================================
        GENERATE APPLICATION PDF
==================================================*/

async function generateApplicationPDF(index) {

    const member =
        allMembers[index];

    if (!member) {

        Swal.fire({
            icon: "error",
            title: "Member Not Found",
            text: "Unable to find member details."
        });

        return;

    }


    const applicationID =
        member["Application ID"];


    if (!applicationID) {

        Swal.fire({
            icon: "error",
            title: "Application ID Missing",
            text: "This member does not have an Application ID."
        });

        return;

    }


        
    /*==================================================
            LOADING
    ==================================================*/

    Swal.fire({

        title:
            "Generating Application PDF",

        html:
            "Please wait...<br><br>" +
            "Preparing member details and PDF.",

        allowOutsideClick: false,

        allowEscapeKey: false,

        didOpen: () => {

            Swal.showLoading();

        }

    });


    try {

        const formData =
            new URLSearchParams();


        formData.append(
            "action",
            "GENERATE_MEMBER_PDF"
        );


        formData.append(
            "data",
            JSON.stringify({

                applicationID:
                    applicationID

            })
        );


        const response =
            await fetch(
                API_URL,
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
                "Unable to generate PDF."

            );

        }


        const downloadURL =
            result.data &&
            result.data.downloadURL
                ? result.data.downloadURL
                : "";

        if (!downloadURL) {

            throw new Error(
                "PDF was generated but no download URL was returned."
            );

        }


        /*==================================================
                SUCCESS
        ==================================================*/

        await Swal.fire({

            icon: "success",

            title:
                "PDF Generated Successfully",

            text:
                "The membership application PDF is ready.",

            confirmButtonText:
                "Open PDF"

        });


        /*==================================================
                OPEN PDF
        ==================================================*/

        if (
            result.success &&
            result.data &&
            result.data.downloadURL
        ) {

            const link =
                document.createElement("a");

            link.href =
                result.data.downloadURL;

            link.download =
                "SHERPAS_" +
                result.data.applicationID +
                "_Membership_Application.pdf";

            document.body.appendChild(link);

            link.click();

            document.body.removeChild(link);

        }


        /*==================================================
                REFRESH MEMBERS
        ==================================================*/

        await loadMembers();

    }
    catch (error) {

        console.error(
            "PDF GENERATION ERROR:",
            error
        );


        Swal.fire({

            icon: "error",

            title:
                "PDF Generation Failed",

            text:
                error.message ||
                "Unable to generate the PDF."

        });

    }

}

/* =========================================
   RENEW MEMBERSHIP FORM
========================================= */

async function openRenewalForm() {

    if (!selectedMember) {
        Swal.fire(
            "Error",
            "Please select a member first.",
            "error"
        );
        return;
    }

    const member = selectedMember;

    const memberName =
        member["Full Name"] || "";

    const membershipID =
        member["Membership ID"] || "";

    const currentValidity =
        member["Membership Valid Until"] ||
        member["Renewal Date"] ||
        "Not available";

    let renewalFee = "";

    try {

        const token =
            sessionStorage.getItem("sherpas_admin_token");

        const params = new URLSearchParams();

        params.append("action", "GET_SETTINGS");
        params.append("token", token);
        params.append("data", JSON.stringify({}));

        const response =
            await fetch(API_URL, {
                method: "POST",
                body: params
            });

        const result =
            await response.json();

        if (result.success && result.settings) {

            renewalFee =
                result.settings["Renewal Fee"] || "";

        }

    } catch (error) {

        console.error(
            "Unable to load renewal fee:",
            error
        );

    }

    Swal.fire({

        target: document.body,

        backdrop: true,

        allowOutsideClick: false,

        allowEscapeKey: true,

        heightAuto: false,

        customClass: {
            popup: "renewal-popup"
        },

        title: "Renew Membership",


        html: `

            <div style="text-align:left">

                <p>
                    <strong>Member Name:</strong>
                    ${memberName}
                </p>

                <p>
                    <strong>Membership ID:</strong>
                    ${membershipID}
                </p>

                <p>
                    <strong>Current Valid Until:</strong>
                    ${currentValidity}
                </p>

                <label>
                    <strong>Renewal Amount</strong>
                </label>

                <input
                    id="renewalAmount"
                    class="swal2-input"
                    type="number"
                    value="${renewalFee}"
                    min="0"
                    step="0.01"
                    placeholder="Renewal amount">

                <label>
                    <strong>Renewal Date</strong>
                </label>

                <input
                    id="renewalDate"
                    class="swal2-input"
                    type="date">

                <label>
                    <strong>Payment Proof</strong>
                </label>

                <input
                    id="renewalPaymentProof"
                    class="swal2-file"
                    type="file"
                    accept="image/*,.pdf">

            </div>

        `,

        showCancelButton: true,

        confirmButtonText: "Submit Renewal",

        cancelButtonText: "Cancel",

        focusConfirm: false,

        preConfirm: () => {

            const amount =
                document.getElementById(
                    "renewalAmount"
                ).value;

            const date =
                document.getElementById(
                    "renewalDate"
                ).value;

            const proof =
                document.getElementById(
                    "renewalPaymentProof"
                ).files[0];

            if (!amount) {

                Swal.showValidationMessage(
                    "Please enter the renewal amount."
                );

                return false;

            }

            if (!date) {

                Swal.showValidationMessage(
                    "Please select the renewal date."
                );

                return false;

            }

            if (!proof) {

                Swal.showValidationMessage(
                    "Please upload payment proof."
                );

                return false;

            }

            return {
                amount,
                date,
                proof
            };

        }

    }).then(async result => {

        if (!result.isConfirmed) {
            return;
        }

        await submitRenewalRequest(
            member,
            result.value
        );

    });

}

