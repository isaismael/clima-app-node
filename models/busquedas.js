const fs = require( 'fs' );

const axios = require('axios');


class Busquedas {

    historial = [];
    dbPath = './db/.database.json';

    constructor() {
        //TODO: leer DB si existe
        this.leerDB();
    }

    get historialCapitalizado() {
        // Capitalizar cada palabra
        return this.historial.map( lugar => {

           let palabras = lugar.split(' ');
           palabras = palabras.map( p => p[0].toUpperCase() + p.substring(1) );
           
           return palabras.join(' ');

        });
    }

    get paramsMapBox() {
        return {
            'access_token': process.env.MAPBOX_KEY,
            'limit': 5,
            'language': 'es'
        }
    }

    get paramsWeather() {
        return{
            appid: process.env.OPENWEATHER_KEY,
            units: 'metric',
            lang: 'es'
        }
    }

    async ciudad(lugar = '') {

        try {
            // petición http
            const intance = axios.create({
                baseURL: `https://api.mapbox.com/`,
                params: this.paramsMapBox
            });

            const resp = await intance.get(`geocoding/v5/mapbox.places/${lugar}.json`);
            return resp.data.features.map( lugar => ({
                id: lugar.id,
                nombre: lugar.place_name,
                lng: lugar.center[0],
                lat: lugar.center[1],
            }));

            return []

        } catch (error) {
            return [];
        }

    }

    async climalugar( lat, lon ) {

        try {
            
            const instance = axios.create({
                baseURL: `https://api.openweathermap.org/data/2.5/`,
                params: {...this.paramsWeather, lat, lon }
            });

            //respuesta.data
            const resp = await instance.get(`weather`);
            const { weather, main } = resp.data;

            return {
                desc: weather[0].description,
                min: main.temp_min,
                max: main.temp_max,
                temp: main.temp
            }

        } catch (error) {
            console.log(error);
        }

    }

    agregarHistorial( lugar= '' ) {

        //TODO: prevenir dupicaldos
        if( this.historial.includes( lugar.toLocaleLowerCase () ) ){
            return;
        }
        this.historial = this.historial.splice(0,5);


        this.historial.unshift( lugar.toLocaleLowerCase() );

        //Grabar en DB
        this.guardarDB();

    }

    guardarDB(  ){

        const payload = {
            historial: this.historial
        };

        fs.writeFileSync( this.dbPath, JSON.stringify( payload ) )

    }

    leerDB(){

        // Debe de existir...
        if( !fs.existsSync( this.dbPath ) ) return;

        const info = fs.readFileSync( this.dbPath, { encoding: 'utf-8' } );
       
        const data = JSON.parse( info );

        this.historial = data.historial;


    } 

}

module.exports = Busquedas;