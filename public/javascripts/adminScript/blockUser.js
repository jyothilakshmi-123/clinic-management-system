function blockUser(userId) {
    if (confirm('Are you sure you want to change the status of  this patient?')) {
        $.ajax({
            url: '/admin/block-user',
            data: {
                user: userId,

            },
            method: 'post',
            success: (response) => {
                console.log("blocked..")
                window.location.reload()
            }

        })
    }
};