function canceledAppointments(appointmentId) {
    if (confirm('Are you sure you want to cancel this?')) {
        $.ajax({
            url: '/cancelled-appointments',
            data: {
                appointment: appointmentId,  

            },
            method: 'post',
            success: (response) => {
                console.log("response after cancelled ........")
                console.log(response)

                window.location.reload()
            }

        })
    }
}