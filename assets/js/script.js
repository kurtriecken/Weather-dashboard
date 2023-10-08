$(function () {
    // let sunIcon = "&#127774";

    const stateCodes = ['AL', 'AK', 'AS', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FM', 'FL',
        'GA', 'GU', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MH', 'MD', 'MA', 'MI',
        'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'MP', 'OH', 'OK',
        'OR', 'PW', 'PA', 'PR', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VI', 'VA', 'WA', 'WV',
        'WI', 'WY'];

    // Global element selectors
    const header = $("#header");
    const todayWeather = $("#today_weather");
    const fiveDays = $("#5_day_forecast");
    const buttonSpacer = $("#button_spacer");

    const cityCard = $("#city_card");
    const stateSelect = $("#state_select");
    const cityDropdown = $("#city_dropdown");
    const cityInput = $("#city_input");
    let searchCard = $('#city_form');

    let cities = [];

    let newCity = '';
    let stateCode = '';
    let newLat = '';
    let newLon = '';

    // TODO: put in weather codes to add tooltip for images
    // TODO: change background images for different weather conditions

    // Populates the select dropdown with US state codes
    function populateStateSelect() {
        for (const n in stateCodes) {
            let newOpt = $("<option>").text(stateCodes[n]);
            newOpt.attr("value", stateCodes[n]);
            stateSelect.append(newOpt);
        }
    }

    // Creates and adds a new city to the dropdown list
    function addNewCity() {
        let liEle = $("<li>");
        let aTagEle = $("<button class='px-2'>");
        aTagEle.attr("data-state", stateCode);
        aTagEle.text(newCity);
        liEle.append(aTagEle);
        $("#list_dropdown").prepend(liEle);
    }

    function toggleSearchClass() {
        // cityCard.toggleClass("col-md-4");
        // cityCard.toggleClass("col-md-12");
        // cityDropdown.toggleClass("col-md-4");
        // cityDropdown.toggleClass("col-md-12");
        // cityInput.toggleClass("w-25");
        // cityInput.toggleClass("w-75");
        // stateSelect.toggleClass("w-25");
        // stateSelect.toggleClass("w-75");
    }

    function toggleWeather() {
        todayWeather.toggle();
        fiveDays.toggle();
        buttonSpacer.toggle();
    }

    function readCityInput() {
        newCity = searchCard.children()[0].value.trim();
        newLat = '';
        newlon = '';
        console.log(newCity);
        // console.log(stateSelect.children(":selected"));
        // console.log($(stateSelect).children(":selected").text());
        if (newCity) {
            stateCode = $(stateSelect).children(":selected").text();
            init();
        }
        else if ($("stateSelect").children(":selected").text() == "State") {
            alert('Please choose a state');
        }
        else {
            alert('Please enter a city');
            return;
        }
    }

    // Wrap in an async function with await
    async function getLatLon() {
        // console.log(`city: ${newCity}, state: ${stateCode}`);
        const response = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${newCity},${stateCode},840&appid=fac80ac7de064233ac17d030d9e1eb4f`);
        // console.log(response);
        const data = await response.json();
        if (data.length == 0) {
            alert("City not found; please try again!");
            return;
        }
        // console.log(data);
        newLat = data[0].lat;
        newLon = data[0].lon;
    }

    function getTodaysWeather() {
        // newLat = 38.9072;
        // newLon = -77.9369;
        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${newLat}&lon=${newLon}&units=imperial&appid=fac80ac7de064233ac17d030d9e1eb4f`, {})
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                // If I get a valid latitude and longitude, add city to dropdown list
                if (!cities.includes(newCity) && data.cod == 200) {
                    cities.push(newCity);
                    addNewCity();
                }
                console.log(data);
                $('#today_temp').html(`${Math.round(data.main.temp)}&deg&nbspF`);
                $('#today_hum').html(`Humidity: ${data.main.humidity}`);
                $('#today_wnd_spd').html(`Wind Speed: ${data.wind.speed}&nbspMPH`);
                let dateInMS = data.dt * 1000;
                // console.log(dayjs(dateInMS).format('MMM DD, YYYY @ hh:mma'));
                // console.log("+__+_+_+_+_+_++_+_++___+_");
                let currDay = dayjs(dateInMS).format('MMM DD, YYYY');
                $('#today_date').text(currDay);

                let iconCode = data.weather[0].icon;
                $('#today_weather').find('img').attr("src", `http://openweathermap.org/img/w/${iconCode}.png`);

                // $('#today_image').html(sunIcon);
                // console.log(`your city name is: ${data.name}`);
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
                    // console.log(imgCode);
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
        // console.log("in init function");
        // console.log(newLat);
        // console.log(newLon);
        getTodaysWeather();
        get5DayForecast();
        if (todayWeather.is(":hidden")) {
            toggleWeather();
            toggleSearchClass();
        }
    }

    // On page load
    toggleWeather();
    populateStateSelect();
    // console.log(`cities array: ${cities}`);

    // Event handlers
    $('#city_button').on("click", function (event) {
        event.preventDefault();
        readCityInput();
        // clear form text and set State as :selected
        $(cityInput).text("");
    });

    $("#list_dropdown").on("click", function(event) {
        if (event.target.nodeName == 'BUTTON'){
            // console.log("clickety click click");
            let button = event.target;
            // console.log("Heres what the buttons got");
            // console.log(button);
            // console.log($(button).text());
            // console.log($(button).data("state"));
            newCity = $(button).text();
            stateCode = $(button).data("state");
            newLat = '';
            newLon = '';
            init();
            // getLatLon();
            // getTodaysWeather();
            // get5DayForecast();
        }
    })


});

// api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={API key}