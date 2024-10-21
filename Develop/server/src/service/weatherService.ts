import dotenv from 'dotenv';
dotenv.config();



// TODO: Define an interface for the Coordinates object
interface Coordinates {
  lat: Number;
  lon: Number;
}

// TODO: Define a class for the Weather object
// the date, an icon representation of weather conditions,
//  a description of the weather for the icon's `alt` tag,
//  the temperature, the humidity, and the wind speed
class Weather {
  cityName: string;
  date: number;
  icon: string;
  iconDescription: string;
  tempF: number;
  windSpeed: number;
  humidity: number;

  constructor(
    cityName: string,
    date: number,
    icon: string,
    iconDescription: string,
    tempF: number,
    windSpeed: number,
    humidity: number,
  ) {
    this.cityName = cityName,
      this.date = date,
      this.icon = icon,
      this.iconDescription = iconDescription,
      this.tempF = tempF,
      this.windSpeed = windSpeed,
      this.humidity = humidity
  }
}

// TODO: Complete the WeatherService class
class WeatherService {
  // TODO: Define the baseURL, API key, and city name properties
  private baseURL?: string;
  private apiKey?: string;
  private city?: string;

  // private API_KEY = '7419557685aad5ed37c685c51d64f7f9';
  // private API_BASE_URL = `api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${this.API_KEY}`;

  constructor() {
    this.baseURL = process.env.API_BASE_URL || '';
    this.apiKey = process.env.API_KEY || '';
  }

  // TODO: Create fetchLocationData method
  private async fetchLocationData(query: string) {

    try {
      const response = await fetch(`${this.baseURL}/geo/1.0/direct?q=${query}&appid=${this.apiKey}`);
      return await response.json();
    } catch (err) {
      console.log('Error:', err);
      return err;
    }

  }
  // TODO: Create destructureLocationData method
  private destructureLocationData(locationData: any): Coordinates {
    try {
      const { lat, lon } = locationData;
      return { lat, lon };

    } catch (error) {
      console.error(error);
      return { lat: 0, lon: 0 };
    }
  }

  private async fetchWeatherData(coordinates: Coordinates) {
    try {
      const { lat, lon } = coordinates;
      const response = await fetch(`${this.baseURL}/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}`);
      if (!response.ok) {
        throw new Error("Error fetching weather data");
      }

      const weatherData = await response.json();
      return weatherData;
      // return await this.parseCurrentWeather(response.json);
    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
  }
  // // TODO: Build parseCurrentWeather method
  private async parseCurrentWeather(response: any) {
    if (!response || !response.city) {
      throw new Error(`Error, No city has been registered.`);
    }

    const cityName = response.city.name;
    const date = response.list[0].dt;
    const icon = response.list[0].weather[0].icon;
    const iconDescription = response.list[0].weather[0].description;
    const tempF = response.list[0].main.temp;
    const windSpeed = response.list[0].wind.speed;
    const humidity = response.list[0].main.humidity;

    return new Weather(
      cityName,
      date,
      icon,
      iconDescription,
      tempF,
      windSpeed,
      humidity
    );
  }

  // // TODO: Complete buildForecastArray method
  private buildForecastArray(currentWeather: Weather, weatherData: any[]) {
    const forecastArray: Weather[] = [];

    forecastArray.push(currentWeather);
    for (const instance of weatherData) {
      {
        forecastArray.push(
          new Weather(
            currentWeather.cityName,
            instance.dt,
            instance.weather[0].icon,
            instance.weather[0].description,
            instance.main.temp,
            instance.wind.speed,
            instance.main.humidity
          )
        );
      }
    }
    const indexesToSlice = [8,16,24,32,40];
    const fiveDayForecast = indexesToSlice.map(index => forecastArray[index]);
    return fiveDayForecast;
    
      }
  // TODO: Complete getWeatherForCity method
  async getWeatherForCity(city: string) {
        try {
          const cityData = await this.fetchLocationData(city);

          if (!cityData) {
            throw new Error("no coordinates found for this city.");
          }

          const coordinates = this.destructureLocationData(cityData[0]);
          const weatherData = await this.fetchWeatherData(coordinates);
          const currentWeather = await this.parseCurrentWeather(weatherData);
          
          const dayForecast = this.buildForecastArray(currentWeather, weatherData.list);
          console.log(dayForecast);
          return [currentWeather, dayForecast];

        } catch (err) {
          console.error("error with getting weather for this location.");
          return null;
        }
      }
    }

    export default new WeatherService();
