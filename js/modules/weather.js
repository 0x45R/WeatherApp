const APIKEY = "9038f0c5ea035eff1d8ba4a8fd1adc93" // I use freemium openweathermap so idc and I really do not want to bother with doing it properly
const APPLANGUAGE = navigator.language || navigator.userLanguage

export class Clock extends HTMLElement{
  constructor(){
    super();  
  }

  connectedCallback(){
    let date = new Date();  
    let hh = new String(date.getHours()).padStart(2,'0');
    let mm = new String(date.getMinutes()).padStart(2,'0');
    this.innerText = `${hh}:${mm}`
  }
}

export class WeatherIcon extends HTMLElement{
  constructor(){
    super();
  }

  get icon(){
    return this.getAttribute("icon");
  }

  set icon(value){
    let url = `https://openweathermap.org/img/wn/${value}@4x.png`
    document.querySelector("link[rel='icon']").setAttribute('href', url)
    this.style.backgroundImage = `url(${url})`;
    this.style.backgroundSize = "100% 100%"
  }
  
  set backgroundImage(value){
    this.style.backgroundImage = `url(${value})`;
    this.style.backgroundSize = "100% 100%"
  }

}

export class WeatherWidget extends HTMLElement{
  constructor(){
    super();
  }
 
  assignCityData(data){
    console.log(data)
    this.querySelector("weather-city-name").innerHTML = data.name

    this.querySelector("weather-time-info").innerHTML = `Right now in`

    let regionNames = new Intl.DisplayNames([APPLANGUAGE], {type: 'region'});
    this.querySelector("weather-country").innerHTML = ` ${data.state}, <b>${regionNames.of(data.country)}</b>`
  }

  assignWeatherData(data){
    console.log(data)
    this.querySelector('weather-title').innerText = data.weather[0].description
    this.querySelector('weather-temperature').innerHTML = `<i class="ti ti-temperature"></i> ${data.main.temp}&deg;C feels like ${data.main.feels_like}&deg;C`
    this.querySelector('weather-pressure').innerHTML =  `<i class="ti ti-gauge"></i> ${data.main.pressure}hPa`
    this.querySelector('weather-humidity').innerHTML = `<i class="ti ti-droplet"></i> ${data.main.humidity}%`
    this.querySelector('weather-clouds').innerHTML = `<i class="ti ti-cloud"></i> ${data.clouds.all}%`
    this.querySelector('weather-wind').innerHTML = `<i class="ti ti-windsock"></i> ${data.wind.speed}m/s ${data.wind.deg}deg`
    this.querySelector('weather-icon').icon =  data.weather[0].icon
  }

  displayError(error){
    this.querySelector('weather-icon').backgroundImage  = "img/failed.webp"
  }

  fetchCityData(cityName){
    let geocodingApiRequest = fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${APIKEY}`)
    .then((response)=> response.json())
    .then((data) => {
        this.assignCityData(data[0]);
        this.fetchWeatherData(data[0])
      }
    )
    .catch((error) => {
      this.displayError(error)
    })
  }

  fetchCityByIP(ipAddress){
    let ipLocationRequest = fetch(`https://ipapi.co/${ipAddress}/json`, {headers: {"Content-Type":"application/json"}})
    .then((response)=>response.json())
    .then((data)=>{this.reverseFetchCityData({lon: data.longitude, lat: data.latitude});})
    .catch((error) => {
      this.displayError("Unexpected Error")
    })   
  }

  fetchUserIP(){
    let ipAddressRequest = fetch("https://ifconfig.me/ip", {headers: {"Content-Type":"application/json"}})
    .then((response)=>response.text())
    .then((data)=>this.fetchCityByIP(data))
    .catch((error) => {
      this.displayError("Unexpected error")
    })
  }

  reverseFetchCityData(data){
    let geocodingApiRequest = fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${data.lat}&lon=${data.lon}&limit=1&appid=${APIKEY}`)
    .then((response)=> response.json())
    .then((data) => {
        this.assignCityData(data[0]);
        this.fetchWeatherData(data[0])
      }
    )
    .catch((error) => {
      this.displayError(error)
    })
  }

  fetchWeatherData(data){
    let weatherApiRequest = fetch(`https://api.openweathermap.org/data/2.5/weather?appid=${APIKEY}&lat=${data.lat}&lon=${data.lon}&lang=${APPLANGUAGE}&units=metric`)
    .then((response)=> response.json())
    .then((data) => {
        if(data.cod != "200"){
          throw new Error("Not ok :(")
        }
        this.assignWeatherData(data)
      }
    )
    .catch((error) => {
      this.displayError(error)
    })
  }

connectedCallback(){
    this.innerHTML = `
    <weather-container>
      <weather-city-info>
        <weather-time-info><placeholder style='width: 6em;'></weather-time-info>
        <weather-city-name><placeholder/></weather-city-name>
        <weather-country><placeholder style='width: 13em; height: 3em;'/></weather-country>
      </weather-city-info>
      <weather-icon></weather-icon>
      <weather-info>
        <weather-title><placeholder/></weather-title>
        <weather-caption>
          <weather-temperature><placeholder style='width: 13em'/></weather-temperature>
          <weather-wind><placeholder style='width: 13em;'/></weather-wind>
          <weather-pressure><placeholder style="width: 4em"/></weather-pressure>
          <weather-humidity><placeholder style="width: 4em"/></weather-humidity>
          <weather-clouds><placeholder style="width: 4em"/></weather-clouds>
        </weather-caption>
      </weather-info>
    </weather-container>
    `;

    navigator.geolocation.getCurrentPosition((position) => {
      let data = {lat:position.coords.latitude, lon: position.coords.longitude}
      console.log(data)
      this.reverseFetchCityData(data);
    }, ()=> this.fetchUserIP(), {enableHighAccuracy: true}); //  this.displayError("Give this site access to your location in order for app to work")
  }
}

customElements.define("weather-widget", WeatherWidget)
customElements.define("weather-icon", WeatherIcon)
customElements.define("weather-popup-clock", Clock)
