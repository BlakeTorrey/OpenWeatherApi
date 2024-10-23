import { Router, type Request, type Response } from 'express';
const router = Router();

import HistoryService from '../../service/historyService.js';
import WeatherService from '../../service/weatherService.js';



router.post('/', async (req: Request, res: Response) => {
  
  try {
    const { cityName } = req.body;
    const cityNameString = JSON.stringify(cityName);
    
    if (!cityNameString) {
      return res.status(500).json({ error: "City name is required." });
    }
    const response = await WeatherService.getWeatherForCity(cityNameString);
    if (!response) {
      return res.status(500);
    }
   
    await HistoryService.addCity(cityName);
    return res.json(response);
  } catch (err) {
    console.log('Error:', err);
    return res.status(500).json(err);
  }

});


router.get('/history', async (_req: Request, _res: Response) => {
  try {
    const savedCities = await HistoryService.getCities();
    _res.json(savedCities);
  }
  catch (err) {
    console.log('Error:', err);
    _res.status(500).json(err);
  }
});


router.delete('/history/:id', async (_req: Request, _res: Response) => {
  try {
    if (!_req.params.id) {
      _res.status(400).json({ msg: "City id is required to remove." });
    }
    await HistoryService.removeCity(_req.params.id);
    _res.json({ Success: "City was removed from history." });
  } catch (err) {
    console.log(err);
    _res.status(500).json(err);
  }
});

export default router;
