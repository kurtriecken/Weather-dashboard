$(function () {
    // let sunIcon = "&#127774";

    // Global element selectors
    const header = $("#header");
    const todayWeather = $("#today_weather");
    const fiveDays = $("#5_day_forecast");
    const buttonSpacer = $("#button_spacer");

    const cityCard = $("#city_card");
    const cityDropdown = $("#city_dropdown");
    const cityInput = $("#city_input");

    let searchCard = $('#city_form');

    let newCity = '';
    let newLat = '';
    let newLon = '';
    // TODO: put in weather codes to add tooltip for images

    function toggleSearchClass() {
        cityCard.toggleClass("col-md-4");
        cityCard.toggleClass("col-md-12");
        cityDropdown.toggleClass("col-md-4");
        cityDropdown.toggleClass("col-md-12");
        cityInput.toggleClass("w-25");
        cityInput.toggleClass("w-75");
    }

    function toggleWeather() {
        todayWeather.toggle();
        fiveDays.toggle();
        buttonSpacer.toggle();
    }

    function readCityInput() {
        newCity = searchCard.children()[0].value.trim();
        console.log(newCity);
        if (newCity) {
            init();
        }
        else {
            alert('Please enter a city');
            return;
        }
    }

    // Wrap in an async function with await
    async function getLatLon() {
        const response = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${newCity}&appid=fac80ac7de064233ac17d030d9e1eb4f`);
        const data = await response.json();
        newLat = data[0].lat;
        newLon = data[0].lon;
        console.log(`lat is ${newLat} and lon is ${newLon}`);

    }

    function getTodaysWeather() {
        console.log("in get todays weather function");
        console.log(newLat);
        console.log(newLon);
        // Today's weather
        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${newLat}&lon=${newLon}&units=imperial&appid=fac80ac7de064233ac17d030d9e1eb4f`, {})
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                $('#today_temp').html(`Temperature: ${Math.round(data.main.temp)}&deg&nbspF`);
                $('#today_hum').html(`Humidity: ${data.main.humidity}`);
                $('#today_wnd_spd').html(`Wind Speed: ${data.wind.speed}&nbspMPH`);
                let dateInMS = data.dt * 1000;
                console.log(dayjs(dateInMS).format('MMM DD, YYYY @ hh:mma'));
                console.log("+__+_+_+_+_+_++_+_++___+_");
                let currDay = dayjs(dateInMS).format('MMM DD, YYYY');
                $('#today_date').text(currDay);

                let iconCode = data.weather[0].icon;
                $('#today_weather').find('img').attr("src", `http://openweathermap.org/img/w/${iconCode}.png`);

                // $('#today_image').html(sunIcon);
                console.log(`your city name is: ${data.name}`);
                $('#city_name').text(data.name);

            });
    }

    function get5DayForecast() {
        // 5-day forecast weather
        fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${newLat}&lon=${newLon}&units=imperial&appid=fac80ac7de064233ac17d030d9e1eb4f`, {})
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                for (let i = 7, j = 1; i < data.list.length; i += 8, j++) {
                    let headEle = $(`#day_${j}`);

                    // Sets day of the week (excepting the first one, which will always display "Tomorrow")
                    if (j != 1) {
                        let newDateInMS = data.list[i].dt * 1000;
                        headEle.find("h3").html(dayjs(newDateInMS).format('dddd'));
                    }

                    // Sets icon for each day
                    let imgCode = data.list[i].weather[0].icon;
                    console.log(imgCode);
                    headEle.children('div').children("img").attr("src", `http://openweathermap.org/img/w/${imgCode}.png`);

                    // Sets temperature for each day
                    let dayTemp = Math.round(data.list[i].main.temp);
                    headEle.children('div').children("p.temp").html(`${dayTemp}&deg&nbspF`);

                    // Sets humidiity
                    let dayHum = Math.round(data.list[i].main.humidity);
                    headEle.children('div').children("p.humidity").html(`Humidity: ${dayTemp}\%`);

                    // Sets wind speed
                    let dayWindSpd = Math.round(data.list[i].wind.speed);
                    headEle.children('div').children("p.wind_speed").html(`Wind Speed: ${dayWindSpd} mph`);
                }
            })
    }

    // http://openweathermap.org/img/w/02n.png

    // Initialization of page
    async function init() {
        await getLatLon();
        console.log("in init function");
        console.log(newLat);
        console.log(newLon);
        getTodaysWeather();
        get5DayForecast();
        if (todayWeather.is(":hidden")) {
            toggleWeather();
            toggleSearchClass();
        }
    }

    // On page load
    toggleWeather();

    // Event handlers
    $('#city_button').on("click", function (event) {
        event.preventDefault();
        readCityInput();
    });


});

// api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={API key}