function blockDoctor(drId) {
    if (confirm('Are you sure you want to change the status of  this doctor?')) {
        $.ajax({
            url: '/admin/block-doctor',
            data: {
                dr: drId,

            },
            method: 'post',
            success: (response) => {

                window.location.reload()
            }

        })
    }
};