module.exports.call = function (name, data) {

    switch (name) {
        case "antifreeze":
            return antifreeze(data);
        case "low_pressure":
            return low_pressure(data);


    }
};
let antifreeze = (data) => {
    let array_data = Object.values(data);
    if (array_data[4]["C1_Compressor_1"] === 1 || array_data[4]["C1_Compressor_2"] === 1) {
        console.log('antigreeze work');
        let counter = 0;

        for (let i = 0; i <= 4; i++) {
            if ((array_data[i]["C1_evaporator_temperature"] / 10) < 5) {
                return "temperature d'évaporateur est inférieure à 5  ";
            }

            let delta = (array_data[i]["Setpoint_effective"] / 10) - (array_data[i]["C1_evaporator_temperature"] / 10);
            if (delta > 5) {
                counter++;
            }
            if (counter === 5) {
                
                return "Difference entre setpoint effective et la temperature d évaporateur dépasse 5 durant 20 sec "
            }


        }
        return 0;
    }
    return 0;
};


let low_pressure = (data) => {
    let array_data = Object.values(data);
    if (array_data[10]["C2_Compressor_1"] === 1 || array_data[10]["C2_Compressor_2"] === 1) {
        console.log('low pressure work');

        for (let i = 0; i <= 10; i++) {
            if ((array_data[i]["C2_condenser_pressure2"] / 10) < 23) {
                console.log("Condenser pressure is Below 23 ")
                return "pression du condenseur est inférieure à 23 ";
            }

        }
        return 0;
    }
    return 0;

}
