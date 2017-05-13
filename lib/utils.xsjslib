function getUUID() {
    
    let conn = $.hdb.getConnection();

	let sql = "SELECT SYSUUID FROM DUMMY;";

	let res = conn.executeQuery(sql);

    let abuff = res[0].SYSUUID;
    let arr = new Uint8Array(abuff);
    let uuid = "";
    for(let i = 0; i < arr.length; i++) {
        uuid += arr[i].toString(16).toUpperCase();
    }
    conn.close();
    
    return uuid;
}