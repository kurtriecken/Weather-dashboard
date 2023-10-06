$(function () {
    let sunIcon = "&#127774";


    fetch('https://api.openweathermap.org/data/2.5/weather?lat=35.2271&lon=-80.8431&units=imperial&appid=fac80ac7de064233ac17d030d9e1eb4f', {})
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            $('#today_temp').html(`Temperature: ${data.main.temp}&deg&nbspF`);
            $('#today_hum').html(`Humidity: ${data.main.humidity}`);
            $('#today_wnd_spd').html(`Wind Speed: ${data.wind.speed}&nbspMPH`);
            let dateInMS = data.dt*1000;
            let currDay = dayjs(dateInMS).format('MMM DD, YYYY');
            console.log(currDay);
            $('#today_date').text(currDay);
            $('#today_image').html(sunIcon);
            $('#city_name').text(data.name);
            
        });




    // Initialization of page
    function init() {

    }




});

// api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={API key}