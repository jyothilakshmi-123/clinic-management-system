function showHistory(userId, drId) {
    console.log("history is.....")
    console.log(userId)
    console.log(drId)

    $.ajax({
        url: '/doctor/show-history',
        data: {
            user: userId,
            doctor: drId

        },
        method: 'post',
        success: (response) => {

            console.log("printing results..........")
            console.log(response)
            console.log("fetching userrdata---")
            const modaldiv = document.querySelector('.userrData');

            const previusPrescriptions = getPreviousPresccriptions(response);
                                
            const newDiv = ` <div class = "text-center p-2 btn-block" style ="background-color: #96eaf4"><h3>Consultation History</h3></div>
            <div class=" border-info  mb-3 mt-2 bg-light  " style="border-radius: 10px; ">
                    <div class="container-fluid border p-3 mt-3 "> 
                    <div class="row  ml-1 " style="width:100%">
                        <div class = "col float-left">
                            <img class=" float-left rounded-circle  border card-image mt-4" style="height: 100px; width: 100px;" src="/user-images/${userId}.jpg" alt="userimageinfo">
                         </div>
                         <hr>
                         
                        <div class = "col float-right">
                             <h3 class="mt-3 ">${response[0].displayName}</h3>
                            <small class="mr-2"><strong>Age</strong> : ${response[0].userAge}</small><br>
                            <small><strong>Gender</strong> : ${response[0].userGender}</small><br>
                            <small><strong>Phone</strong> : ${response[0].userMobile}</small>
                        </div>
                    </div>
                    <div class="container-fluid border p-3 mt-3 " style ="background-color: #03a9f40f"> 
                        ${previusPrescriptions}
                    </div>
                    </div>

                </div>`



            modaldiv.innerHTML = newDiv;
            function getPresccriptionItems(_id) {
                let i;
                let vals = ''
                for (i = 0; i < response[0].userPrescription.length; i++) {
                    vals += `<li class="ml-3">${response[0].userPrescription[i]}</li>`
                }
                return vals;
            }
            function getPreviousPresccriptions(response) {
                let i;
                let vals = ''

                for (i = response.length-1; i>=0 ; i--) {
                    let prescriptionLists = getPresccriptionItems(response[i]._id);
                    let divBody = ` 
                            <div>
                                <p> <strong>Date of Appointment :</strong> ${response[i].dateOfBooking}</p>
                                <p><strong>Session of Appointment :</strong> ${response[i].timeOfBooking}</p>
                                <strong> Medicines : </strong>
                                ${prescriptionLists}
                                <p><strong>Notes :</strong>${response[i].userNotes}</p>
                            </div><br><hr>`
                    vals += `<div class="card-body ">${divBody}</div>`
                }
                return vals;

            }


        }

    })

}