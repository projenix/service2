const mariadb = require('mariadb');
const conn = mariadb.createPool({host: 'localhost', user: 'root', database: 'dcim_test', connectionLimit: 6});
// select id and oids name of equipment
let query = "select e.id as id , em.oid_map as oid_map from equipment e join equipment_model em on e.equipment_model= em.id";
// connect to database
setInterval(()=>{

    conn.getConnection()
        .then(conn => {
            conn.query(query)
                .then(
                    //res = query result
                    (res) => {
                        conn.end();
                        //for each equipment
                        res.forEach(
                            //r = equipment (id,oid_map)
                            (r) => {
                                //select data from last insert and 6hours interval
                                let query_data = "select d.date_time, d.data from data_records d where date_time between(select date_sub(max(date_time),interval 6 hour) from data_records) AND (select max(date_time) from data_records) and equipment_id=" + r.id + " order by date_time desc";

                                conn.query(query_data, r.id).then(
                                    (data) => {
                                        // data = data from data records(date_time, data)
                                        conn.end();
                                        // object store {date:{name:value},...}
                                        let name_value = {};
                                        // transform oid_map string to object
                                        let name = JSON.parse(r.oid_map);
                                        //for each record (d) of last query set object name_value={date:{name:value},...} with object_transformer function below
                                        data.forEach((d) => {
                                            let value = JSON.parse(d.data);
                                            name_value[new Date(d.date_time).toLocaleString()] = object_transformer(name, value);

                                        })
                                        //return the object that every plugin will take it as parameter
                                        return name_value;
                                    }
                                ).then((name_value) => {
                                    //select plugins list of equipment using r.id from the first query
                                    conn.query("select p.name from plugins p join equipment e on e.equipment_model=p.equipment_model where e.id=" + r.id)
                                        .then((plugin_list) => {
                                            conn.end();
                                            //just a test
                                            let caller = require('./plugins');
                                            // for each plugins "plug"
                                            plugin_list.forEach((plug) => {
                                                // create promise
                                                new Promise((resolve, reject) => {
                                                    //call caller module that generate random msg for each plugin
                                                    resolve(caller.call(plug.name));
                                                }).then((result) => {

                                                        conn.query("select id from alarms where equipment_id = " + r.id + " and end_time is " + null + " and plugin= \"" + plug.name + "\"").then((exist) => {
                                                            conn.end();
                                                            console.log(result);
                                                            let date = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');

                                                            if (typeof result == "number" && exist[0] !== undefined) {
                                                                //update end date
                                                                console.log("update");

                                                                conn.query("  UPDATE alarms set end_time= '" + date + "' where id= " + exist[0].id + " ")
                                                                    .then(
                                                                        () => {
                                                                            conn.end();
                                                                        }
                                                                    );
                                                            } else{
                                                                if (typeof result == "string" && exist[0] === undefined) {
                                                                    //insert
                                                                    console.log("insert")
                                                                    conn.query(" INSERT INTO alarms values (?,?,?,?,?,?,?)", [null, plug.name, "alarm", r.id, result,date,null])
                                                                        .then(
                                                                            () => {
                                                                                conn.end();
                                                                            }
                                                                        );

                                                                }}

                                                        })
                                                    }
                                                )
                                            })
                                        })
                                })
                            })

                    })


        })

    ;


},5000)

//function transform take as input data_record and _oid map an return object like {name:value}
var object_transformer = (name, value) => {
    let fusion = {}
    for (let v in value) {
        let _v = "." + v.replace(/,/g, '.');
        //fusion.date = new ate(res.date_time);

        fusion[name[_v]] = value[v];
    }
    return fusion;
}

