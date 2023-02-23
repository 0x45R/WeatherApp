const APIKEY = "9038f0c5ea035eff1d8ba4a8fd1adc93" // I use freemium openweathermap so idc and I really do not want to bother with doing it properly
const APPLANGUAGE = "en"

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
  }

}

export class WeatherWidget extends HTMLElement{
  constructor(){
    super();
  }
 
  assignCityData(data){
    console.log(data)
    this.querySelector("weather-city-name").innerText = data.name

    let regionNames = new Intl.DisplayNames([APPLANGUAGE], {type: 'region'});
    this.querySelector("weather-country").innerText = regionNames.of(data.country)
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
      <weather-header>
        <weather-type>today</weather-type>     
        <weather-popup type='settings'><i class="ti ti-settings"></i></weather-popup>
      </weather-header>
      <weather-container>
        <weather-city-info>
          <weather-city-name>Opole</weather-city-name>
          <weather-country>Poland</weather-country>
        </weather-city-info>
        <weather-icon></weather-icon>
        <weather-info>
          <weather-title>Moderate Rain</weather-title>
          <weather-caption>
            <weather-temperature>0C, odczuwalna 20C</weather-temperature>
            <weather-wind>10m/s 360deg 10m/s</weather-wind>
            <weather-pressure>20 hPa</weather-pressure>
            <weather-humidity>30%</weather-humidity>
            <weather-clouds>10%</weather-clouds>
          </weather-caption>
        </weather-info>
      </weather-container>
      <weather-footer>
        <weather-popup type='previous'><i class="ti ti-arrow-left"></i></weather-popup>       
        <weather-popup-clock>21:37</weather-popup-clock>
        <weather-popup type='next'><i class="ti ti-arrow-right"></i></weather-popup>
      </weather-footer>
    `;
  

    let cityName = "Opole"

    this.fetchCityData(cityName);

  }
}

customElements.define("weather-widget", WeatherWidget)
customElements.define("weather-icon", WeatherIcon)
customElements.define("weather-popup-clock", Clock)
