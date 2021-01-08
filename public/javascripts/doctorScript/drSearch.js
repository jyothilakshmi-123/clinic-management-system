$(document).ready(function () {
    $('#search1').keyup(function () {
        search_table($(this).val());
    });
    function search_table(value) {
        $('#Appointments tr').each(function () {
            var found = 'false';
            $(this).each(function () {
                if ($(this).text().toLowerCase().indexOf(value.toLowerCase()) >= 0) {
                    found = 'true';
                }
            });
            if (found == 'true') {
                $(this).show();
            }
            else {
                $(this).hide();
            }
        });
    }
});

$(document).ready(function () {
    $('#search2').keyup(function () {
        search_table($(this).val());
    });
    function search_table(value) {
        $('#Bookings tr').each(function () {
            var found = 'false';
            $(this).each(function () {
                if ($(this).text().toLowerCase().indexOf(value.toLowerCase()) >= 0) {
                    found = 'true';
                }
            });
            if (found == 'true') {
                $(this).show();
            }
            else {
                $(this).hide();
            }
        });

    }
});