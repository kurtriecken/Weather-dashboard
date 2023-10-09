$(function () {
    const stateCodes = ['AL', 'AK', 'AS', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FM', 'FL',
        'GA', 'GU', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MH', 'MD', 'MA', 'MI',
        'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'MP', 'OH', 'OK',
        'OR', 'PW', 'PA', 'PR', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VI', 'VA', 'WA', 'WV',
        'WI', 'WY'];

    // Global element selectors
    // const header = $("#header");
    const todayWeather = $("#today_weather");
    const fiveDays = $("#5_day_forecast");
    const buttonSpacer = $("#button_spacer");

    // const cityCard = $("#city_card");
    const stateSelect = $("#state_select");
    // const cityDropdown = $("#city_dropdown");
    // const cityInput = $("#city_input");
    let searchCard = $('#city_form');

    let cities = [];

    let newCity = '';
    let stateCode = '';
    let newLat = '';
    let newLon = '';

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
        let aTagEle = $("<button class='px-2 btn btn-secondary w-75'>");
        aTagEle.attr("data-state", stateCode);
        aTagEle.text(newCity + ", " + stateCode);
        aTagEle.attr("data-city", newCity);
        liEle.append(aTagEle);
        liEle.attr("class", "text-center");
        $("#list_dropdown").prepend(liEle);
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
        const response = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${newCity},${stateCode},840&appid=fac80ac7de064233ac17d030d9e1eb4f`);
        const data = await response.json();
        if (data.length == 0) {
            alert("City not found; please try again!");
            if (!todayWeather.is(":hidden")) {
                toggleWeather();
            }
            return;
        }
        else {
            if (todayWeather.is(":hidden")) {
                toggleWeather();
            }
        }
        newLat = data[0].lat;
        newLon = data[0].lon;
    }

    function getTodaysWeather() {
        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${newLat}&lon=${newLon}&units=imperial&appid=fac80ac7de064233ac17d030d9e1eb4f`, {})
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                // If I get a valid latitude and longitude, add city to dropdown list
                newCity = data.name;
                if (!cities.includes(newCity + ", " + stateCode) && data.cod == 200) {
                    cities.push(newCity + ", " + stateCode);
                    addNewCity();
                    localStorage.setItem("cities", JSON.stringify(cities));
                }
                $('#today_temp').html(`${Math.round(data.main.temp)}&deg&nbspF`);
                $('#today_hum').html(`Humidity: ${data.main.humidity}%`);
                $('#today_wnd_spd').html(`Wind Speed: ${Math.round(data.wind.speed)}&nbspmph`);
                let dateInMS = data.dt * 1000;
                let currDay = dayjs(dateInMS).format('MMM DD, YYYY');
                $('#today_date').text(currDay);

                let iconCode = data.weather[0].icon;
                $('#today_weather').find('img').attr("src", `http://openweathermap.org/img/w/${iconCode}.png`);

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
                        headEle.find("h3").html(dayjs(newDateInMS).format('dddd, MMM D'));
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

    // Initialization of page
    async function init() {
        console.log("INIT function occuring now");
        await getLatLon();
        getTodaysWeather();
        get5DayForecast();
        console.log(cities);
    }

    // On page load
    toggleWeather();
    populateStateSelect();
    cities = JSON.parse(localStorage.getItem("cities"));
    console.log(cities);
    if (cities == null) {
        cities = [];
        console.log(cities);
    }
    else {
        for (let i = 0; i < cities.length; i++) {
            let text = cities[i].split(',');
            newCity = text[0];
            stateCode = text[1].trim();
            addNewCity();
        }
        newCity = '';
        stateCode = '';
    }

    // Event handlers
    $('#city_button').on("click", function (event) {
        event.preventDefault();
        readCityInput();
        // clear form text and set State as :selected
        $("#city_input").val('');
        $(stateSelect).val('State').change();
    });

    $("#list_dropdown").on("click", function (event) {
        if (event.target.nodeName == 'BUTTON') {
            let button = event.target;
            newCity = $(button).data("city");
            stateCode = $(button).data("state");
            newLat = '';
            newLon = '';
            init();
        }
    })


});
