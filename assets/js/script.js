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
            let dateInMS = data.dt * 1000;
            console.log(dayjs(dateInMS).format('MMM DD, YYYY @ hh:mma'));
            console.log("+__+_+_+_+_+_++_+_++___+_");
            let currDay = dayjs(dateInMS).format('MMM DD, YYYY');
            $('#today_date').text(currDay);
            $('#today_image').html(sunIcon);
            $('#city_name').text(data.name);

        });

    fetch('https://api.openweathermap.org/data/2.5/forecast?lat=35.227&lon=-80.8431&units=imperial&appid=fac80ac7de064233ac17d030d9e1eb4f', {})
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            for(let i=7, j=1; i<data.list.length; i+=8, j++) {
                let headEle = $(`#day_${j}`);
                
                if (j != 1) {
                    let newDateInMS = data.list[i].dt * 1000;
                    headEle.find("h3").html(dayjs(newDateInMS).format('dddd'));
                }

                // console.log(dayjs(newDateInMS).format('MMM DD, YYYY @ hh:mma'));
                headEle.children('div').children("p.temp").html(data.list[i].main.temp);
            }
        })




    // Initialization of page
    function init() {

        }




});

// api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={API key}