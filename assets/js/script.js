/*/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\*/
//------------------------------------------Variables-----------------------------------------//
/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/*/
$(function () {
    const stateCodes = ["AK", "AL", "AR", "AS", "AZ", "CA", "CO", "CT", "DC", "DE", "FL", "FM",
        "GA", "GU", "HI", "IA", "ID", "IL", "IN", "KS", "KY", "LA", "MA", "MD", "ME", "MH", "MI",
        "MN", "MO", "MP", "MS", "MT", "NC", "ND", "NE", "NH", "NJ", "NM", "NV", "NY", "OH", "OK",
        "OR", "PA", "PR", "PW", "RI", "SC", "SD", "TN", "TX", "UT", "VA", "VI", "VT", "WA", "WI",
        "WV", "WY"];

    // Global element selectors
    const todayWeather = $("#today_weather");
    const fiveDays = $("#5_day_forecast");
    let searchCard = $("#city_form");
    const cityInput = $("#city_input");
    const stateSelect = $("#state_select");
    const cityButton = $("#city_button");
    const listDropdown = $("#list_dropdown");

    // Instance variables
    let cities = [];
    let newCity = "";
    let stateCode = "";
    let newLat = "";
    let newLon = "";

    /*/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\*/
    //------------------------------------------Functions-----------------------------------------//
    /*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/*/

    // Initialization of page with new city and state
    async function init() {
        await getLatLon();
        getTodaysWeather();
        get5DayForecast();
    }

    // Reads and extracts input form for city and state
    function readCityInput() {
        newCity = searchCard.children()[0].value.trim();

        // Reset lat and lon in case API calls for weather get ahead
        newLat = "";
        newlon = "";
        let currState = $(stateSelect).children(":selected").text();

        // City input must be filled out and state must be chosen to continue
        if (newCity && currState != "State") {
            stateCode = $(stateSelect).children(":selected").text();
            init();
        }

        // Alerts if state is not selected
        else if ($(stateSelect).children(":selected").text() == "State") {
            alert("Please choose a state");
        }

        // Alerts if city is not filled out
        else {
            alert("Please enter a city");
            return;
        }
    }

    // Creates and adds a new city to the dropdown list
    function addNewCity() {

        // Creates an li to append to city dropdown list
        let liEle = $("<li>");
        let aTagEle = $("<button class='px-2 btn btn-primary w-75'>");

        // Adds city and state information to li
        aTagEle.attr("data-state", stateCode);
        aTagEle.text(newCity + ", " + stateCode);
        aTagEle.attr("data-city", newCity);

        // Adds li to dropdown
        liEle.append(aTagEle);
        liEle.attr("class", "text-center");
        $(listDropdown).prepend(liEle);
    }

    // Populates the select dropdown with US state codes from global array (stateCodes)
    function populateStateSelect() {
        for (const n in stateCodes) {
            let newOpt = $("<option>").text(stateCodes[n]);
            newOpt.attr("value", stateCodes[n]);
            stateSelect.append(newOpt);
        }
    }

    // Uses user-supplied city and state to search API for latitude and longitude
    async function getLatLon() {
        const response = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${newCity},${stateCode},840&appid=fac80ac7de064233ac17d030d9e1eb4f`);
        const data = await response.json();

        // Invalid city/state combination will return no data
        if (data.length == 0) {
            alert("City not found; please try again!");
            if (!todayWeather.is(":hidden")) {
                toggleWeather();
            }
            return;
        }

        // Show weather sections if data is returned
        else {
            if (todayWeather.is(":hidden")) {
                toggleWeather();
            }
        }

        // Populates global latitude and longitude variables for weather API calls
        newLat = data[0].lat;
        newLon = data[0].lon;
    }

    // Uses latitude and longitude to search API for current weather
    function getTodaysWeather() {
        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${newLat}&lon=${newLon}&units=imperial&appid=fac80ac7de064233ac17d030d9e1eb4f`, {})
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                // If latitude and longitude are valid, add city to dropdown list
                // Also, add newly updated cities array to local storage
                newCity = data.name;
                if (!cities.includes(newCity + ", " + stateCode) && data.cod == 200) {
                    cities.push(newCity + ", " + stateCode);
                    addNewCity();
                    localStorage.setItem("cities", JSON.stringify(cities));
                }

                // Display data for Today's weather

                // Name
                $("#city_name").text(data.name);

                // Date
                let dateInMS = data.dt * 1000;
                let currDay = dayjs(dateInMS).format("MMM DD, YYYY");
                $("#today_date").text(currDay);

                // Weather icon
                let iconCode = data.weather[0].icon;
                $("#today_weather").find("img").attr("src", `http://openweathermap.org/img/w/${iconCode}.png`);

                // Temperature
                $("#today_temp").html(`${Math.round(data.main.temp)}&deg&nbspF`);

                // Humidity
                $("#today_hum").html(`Humidity: ${data.main.humidity}%`);

                // Wind speed
                $("#today_wnd_spd").html(`Wind Speed: ${Math.round(data.wind.speed)}&nbspmph`);
            });
    }

    // Uses latitude and longitude to search API for 5-day weather forecast
    function get5DayForecast() {
        // 5-day forecast weather
        fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${newLat}&lon=${newLon}&units=imperial&appid=fac80ac7de064233ac17d030d9e1eb4f`, {})
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {

                // Skips ahead by 8 to ensure next entry is 24-hours later
                // Forecast data from API is always every 3 hours (3 hours * 8 = 24 hours)
                for (let i = 7, j = 1; i < data.list.length; i += 8, j++) {
                    let headEle = $(`#day_${j}`);

                    // Display data for each day's weather

                    // Day and date
                    if (j == 1) {
                        let tomorrow = data.list[i].dt * 1000;
                        headEle.find("h3").html(dayjs(tomorrow).format("[Tomorrow], MMM D"));
                    }

                    // Sets day of the week (excepting the first one, which will always display "Tomorrow")
                    else {
                        let newDateInMS = data.list[i].dt * 1000;
                        headEle.find("h3").html(dayjs(newDateInMS).format("dddd, MMM D"));
                    }

                    // Weather icon
                    let imgCode = data.list[i].weather[0].icon;
                    headEle.children("div").children("img").attr("src", `http://openweathermap.org/img/w/${imgCode}.png`);

                    // Temperature
                    let dayTemp = Math.round(data.list[i].main.temp);
                    headEle.children("div").children("p.temp").html(`${dayTemp}&deg&nbspF`);

                    // Humidity
                    let dayHum = Math.round(data.list[i].main.humidity);
                    headEle.children("div").children("p.humidity").html(`Humidity: ${dayHum}\%`);

                    // Wind speed
                    let dayWindSpd = Math.round(data.list[i].wind.speed);
                    headEle.children("div").children("p.wind_speed").html(`Wind Speed: ${dayWindSpd} mph`);
                }
            })
    }

    // Shows or hides weather sections
    function toggleWeather() {
        todayWeather.toggle();
        fiveDays.toggle();
    }

    /*/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\*/
    //-------------------------------------Initial Load of Page-----------------------------------//
    /*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/*/

    toggleWeather();
    populateStateSelect();
    cities = JSON.parse(localStorage.getItem("cities"));

    // If array from local storage does not exist, create an empty one
    if (cities == null) {
        cities = [];
    }
    else {

        // If array from local storage is NOT empty, populate the dropdown menu with this information
        for (let i = 0; i < cities.length; i++) {
            let text = cities[i].split(",");
            newCity = text[0];
            stateCode = text[1].trim();
            addNewCity();
        }
        newCity = "";
        stateCode = "";
    }

    /*/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\*/
    //--------------------------------------Event Handlers----------------------------------------//
    /*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/*/

    // Submit button event handler
    $(cityButton).on("click", function (event) {
        event.preventDefault();

        // Read data inputted by user
        readCityInput();

        // Reset form to initial page load state
        $(cityInput).val("");
        $(stateSelect).val("State").change();
    });

    // State dropdown event handler 
    $(listDropdown).on("click", function (event) {

        // Ensures button in list was clicked
        if (event.target.nodeName == "BUTTON") {

            // Reads information from button for city and state to populate weather sections 
            // with new API calls
            let button = event.target;
            newCity = $(button).data("city");
            stateCode = $(button).data("state");
            newLat = "";
            newLon = "";
            init();
        }
    })
});
