function getEvents() {

	let conn = $.hdb.getConnection();
	let username = $.session.getUsername();
	let query = "SELECT * FROM \"ema\".\"ema.data.tables::events\" WHERE \"created_by\" = '" + username + "';";

	let res = conn.executeQuery(query);
	
	let aData = [];
	
	for(let i = 0; i < res.length; i++) {
	    aData.push({
	        eid: res[i].eid,
	        ename: res[i].ename,
	        edate: res[i].edate,
	        createdBy: res[i].created_by,
	        createdOn: res[i].created_on
	    });
	}
	
	return aData;
}

try {
	switch ($.request.method) {
		case $.net.http.GET:
		    var data = getEvents();
			$.response.setBody(JSON.stringify(data));
			break;

	}
} catch(e) {
    $.response.setBody(e.message);
}