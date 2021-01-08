function appointmentConfirm(appointmentId) {
    if (confirm('Are you sure you want to accept this?')) {
        $.ajax({
            url: '/doctor/confirm-appointment',
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