$(document).ready(function(){
    console.log("called onetiepicker--- ")
    $('#time').timepicker({
        timeFormat: 'h:mm p',
        interval: 15,
        minTime: '9:30am',
        maxTime: '4:30pm',
        defaultTime: '9:30am',
        scrollbar: true,
         
    });
});


