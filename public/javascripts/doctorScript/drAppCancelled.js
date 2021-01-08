function appointmentCancel(appointmentId) {
    if (confirm('Are you sure you want to reject this?')) {
        $.ajax({
            url: '/doctor/cancel-appointment',
            data: {
                appointment: appointmentId,

            },
            method: 'post',
            success: (response) => {

                window.location.reload()
            }

        })
    }
}