function deleteDoctor(drId) {
    if (confirm('Are you sure you want to delete this?')) {
        $.ajax({
            url: '/admin/delete-doctor',
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