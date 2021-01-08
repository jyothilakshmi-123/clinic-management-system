function deleteUser(userId) {
    if (confirm('Are you sure you want to delete this?')) {
        $.ajax({
            url: '/admin/delete-user',
            data: {
                user: userId,

            },
            method: 'post',
            success: (response) => {

                window.location.reload()
            }

        })
    }
};