const APIKEY = "9038f0c5ea035eff1d8ba4a8fd1adc93" // I use freemium openweathermap so idc and I really do not want to bother with doing it properly
const APPLANGUAGE = navigator.language || navigator.userLanguage

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
    this.style.backgroundSize = "80% 80%";
    this.style.backgroundPosition = "center";
    this.style.animation = "none";
  }

}

export class WeatherWidget extends HTMLElement{
  constructor(){
    super();
  }

  displayError(error){
    this.querySelector('weather-icon').backgroundImage  = "img/warning.svg"
  }

  async getPosition(){
    const response = await new Promise((res, rej) => {
      navigator.geolocation.getCurrentPosition(res, rej, {enableHighAccuracy: true});
    })
    return response.coords
  } 

  async getWeatherByLocation(data){
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?appid=${APIKEY}&lat=${data.latitude}&lon=${data.longitude}&lang=${APPLANGUAGE}&units=metric`)
    return response.json()
  }

  async getCityByLocation(data){
    const response = await fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${data.latitude}&lon=${data.longitude}&limit=1&appid=${APIKEY}`)    
    return response.json()
  }
 
  async getIP(){
    const response = await fetch("https://ifconfig.me/ip", {headers: {"Content-Type":"application/json"}})
    return response.text()
  }

  async getPositionFromIP(ip){
    const response = await fetch(`https://ipapi.co/${ip}/json`, {headers: {"Content-Type":"application/json"}})
    return response.json()
  }

  assignCityData(data){
    this.querySelector("weather-city-name").innerHTML = data.name
    this.querySelector("weather-time-info").innerHTML = `Right now in`

    let regionNames = new Intl.DisplayNames([APPLANGUAGE], {type: 'region'});
    this.querySelector("weather-country").innerHTML = ` ${data.state}, <b>${regionNames.of(data.country)}</b>`
  }
  
  assignWeatherData(data){
    this.querySelector('weather-title').innerText = data.weather[0].description

    this.querySelector('weather-temperature').innerHTML = `<i class="ti ti-temperature"></i> ${data.main.temp}&deg;C feels like ${data.main.feels_like}&deg;C`
    this.querySelector('weather-pressure').innerHTML =  `<i class="ti ti-gauge"></i> ${data.main.pressure}hPa`
    this.querySelector('weather-humidity').innerHTML = `<i class="ti ti-droplet"></i> ${data.main.humidity}%`
    this.querySelector('weather-clouds').innerHTML = `<i class="ti ti-cloud"></i> ${data.clouds.all}%`
    this.querySelector('weather-wind').innerHTML = `<i class="ti ti-windsock"></i> ${data.wind.speed}m/s ${data.wind.deg}deg`

    this.querySelector('weather-icon').icon =  data.weather[0].icon
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

    var position;

    this.getPosition() // Try to get user position using geolocation api
    .then((data)=>{ // If user accepted the popup and everything went good 
      position = data; // We know position and can use it later
    })
    .catch(()=>{ // If user denied the popup
      this.getIP() // Get user ip
      .then((ip)=>{ // If successfully got user ip 
        this.getPositionFromIP(ip)
        .then((data)=>{ // Try to get position from ip 
          position = data; // We know position and can use it later
        })
      })
    })
    .finally(()=>{ // Finally if everything went right and we've got user's position
      this.getCityByLocation(position) // Get city by user position
      .then((city)=>{this.assignCityData(city[0])})

      this.getWeatherByLocation(position) // Get weather by user position
      .then((weather)=>{this.assignWeatherData(weather)})
    })
  }
}

customElements.define("weather-widget", WeatherWidget)
customElements.define("weather-icon", WeatherIcon)
