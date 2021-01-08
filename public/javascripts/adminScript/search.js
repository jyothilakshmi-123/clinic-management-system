$(document).ready(function () {
    $('#search1').keyup(function () {
        search_table($(this).val());
    });
    function search_table(value) {
        $('#doctor_table tr').each(function () {
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
        $('#user_table tr').each(function () {
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
    $('#search3').keyup(function () {
        search_table($(this).val());
    });
    function search_table(value) {
        $('#user_table tr').each(function () {
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