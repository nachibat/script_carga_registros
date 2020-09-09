const colors = require('colors');
const csv = require('csvtojson');
const axios = require('axios');
const qs = require('qs');

console.log('********************************'.yellow);
console.log('* Script de carga de registros *'.yellow);
console.log('********************************'.yellow);

const convert = csv()
    .fromFile('./choferes.csv')
    .then((vector) => {

        const cant = vector.length;
        let nuevoVector = [];

        console.log(`Cantidad de registros en archivo CVS: ${cant}`.blue);

        for (let i = 0; i < cant; i++) {

            let telefono;
            if (vector[i].TELEFONO.length > 0) {
                telefono = vector[i].TELEFONO;
            } else {
                telefono = 'No tiene';
            }

            const json = {
                nombre: vector[i].NOMBRE,
                apellido: vector[i].APELLIDO,
                patente: vector[i].DNI,
                telefono
            }

            nuevoVector.push(json);

        }

        subirData(nuevoVector, cant);

    });

async function subirData(registros, total) {

    let cantOk = 0;
    let fallas = 0;
    let avance = 0;
    let porcentaje = 0;

    for (let i = 0; i < registros.length; i++) {

        await axios({
            method: 'post',
            url: 'http://localhost:3000/patentes',
            data: qs.stringify({
                nombre: registros[i].nombre,
                apellido: registros[i].apellido,
                patente: registros[i].patente,
                telefono: registros[i].telefono
            }),
            headers: {
                'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
            }
        }).then(resp => {
            cantOk++;
        }).catch(err => {
            fallas++;
        });
        avance++;
        porcentaje = (avance / total) * 100;

        process.stdout.write(`                                     OK: ${cantOk}\r`.green);
        process.stdout.write(`                  Fallas: ${fallas}\r`.red);
        process.stdout.write(`Terminado ${porcentaje.toFixed(2)} % \r`);
    }

    console.log(`Cantidad de registros subidos correctamente: ${cantOk}`.green);
    console.log(`Cantidad de errores de subida: ${fallas}`.red);


}