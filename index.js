const mariadb = require('mariadb');
const conn = mariadb.createPool({host: 'localhost', user: 'root', database: 'dcim_test', connectionLimit: 6});
let query1 = " select dr.date_time,dr.data,dr.equipment_id, e.equipment_model,em.oid_map , p.name,p.path,p.status from data_records as dr  join equipment e on dr.equipment_id=e.id  join equipment_model em on e.equipment_model=em.id  join plugins p on p.equipment_id=e.id where dr.date_time =(select date_time from data_records ORDER by date_time desc limit 1)"
let query2 = "select equipment_id as eq_id , data from data_records order by date_time desc limit 3"
conn.getConnection()
    .then(conn => {
        conn.query(query2)
            .then(
                (res) => {
                    conn.end();

                    res.forEach((res) => {
                        var value = JSON.parse(res.data);
                        conn.query("select em.oid_map ,em.brand ,em.description ,e.name from equipment as e join equipment_model em on em.id= e.equipment_model\n" +
                            "where e.id=" + res.eq_id).then(
                            (res1) => {
                                let fusion = {};
                                console.log(res1)
                                var name = JSON.parse(res1[0].oid_map);
                                conn.end();
                                for (let v in value) {
                                    let _v = "." + v.replace(/,/g, '.');
                                    fusion[name[_v]] = value[v];
                                }
                                console.log(fusion);                            }
                        )

                    })

                }
            );

    }).catch(err => {
    throw err;
});
/*   let date = res[0].date_time;
                       console.log(date)
                       console.log(new Date(date).toLocaleString());*/
