import React, { useEffect, useState } from 'react';

import { FaSun } from "react-icons/fa";

const getUserLocation = async () => {
  const response = await fetch("https://geolocation-db.com/json/");
  return response.json();
}

const getLocalWeather = async (location: any) => {
  const { latitude, longitude } = location;
  const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&temperature_unit=fahrenheit`);
  return response.json();
}

function Weather({rounded = "true"}) {
  const [temperature, setTemperature] = useState(null);
  
  useEffect(() => {
    let mounted = true;

    const fetchWeather = async () => {
      try {
        const location = await getUserLocation();
        const weather = await getLocalWeather(location);

        if (mounted) {
          let temp = weather.current?.temperature_2m;
          if (rounded.toLowerCase() === "true") temp = Math.round(temp);
          setTemperature(temp);
        }
      } catch (error) {
        console.error('Failed to retrieve weather or location', error);
      }
    };

    fetchWeather();

    return () => {
      mounted = false;
    };
  }, [rounded]);

  return (
    <>
      {temperature && <div className="weather font-light">
          <FaSun style={{ color: '#fdd835' }}/>
            <p>{temperature}<sup>°F</sup></p>
        </div>
      }
    </>
  )
}

export default Weather;