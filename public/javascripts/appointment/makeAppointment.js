
    $("#appointment-form").submit((e) => {
        e.preventDefault()
        $.ajax({
            url: '/make-appointment',
            method: 'post',
            data: $('#appointment-form').serialize(),
            success: (response) => {
                window.location.reload()
            }
        })
    })
