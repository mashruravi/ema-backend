function getEvents() {

	let conn = $.hdb.getConnection();
	let username = $.session.getUsername();
	let query = "SELECT * FROM \"ema\".\"ema.data.tables::events\" WHERE \"created_by\" = ? ORDER BY \"edate\" DESC;";

	let res = conn.executeQuery(query, username);

	let aData = [];

	for (let i = 0; i < res.length; i++) {
		aData.push({
			eid: res[i].eid,
			ename: res[i].ename,
			edate: res[i].edate,
			createdBy: res[i].created_by,
			createdOn: res[i].created_on
		});
	}

	return aData;
} // end function getEvents

function getEvent(eid) {

	let conn = $.hdb.getConnection();
	let username = $.session.getUsername();
	let query = "SELECT * FROM \"ema\".\"ema.data.tables::events\" WHERE \"created_by\" = ? AND \"eid\" = ?;";

	let res = conn.executeQuery(query, username, eid);

	let oData = {
		eid: res[0].eid,
		ename: res[0].ename,
		edate: res[0].edate,
		createdBy: res[0].created_by,
		createdOn: res[0].created_on
	};

	return oData;

} // end function getEvent

function createEvent(oEventDetails) {

	// Expected parameters: oEvent.ename, oEvent.edate (optional)

	$.import("ema.data.lib", "utils");
	let utils = $.ema.data.lib.utils;

	let eid = utils.getUUID();
	let user = $.session.getUsername();
	let now = new Date().toISOString().split('T')[0];

	let ename = oEventDetails.ename || "";
	let edate = oEventDetails.edate;

	let conn = $.hdb.getConnection();
	let sql = "INSERT INTO \"ema\".\"ema.data.tables::events\" (\"eid\", \"ename\", \"edate\", \"created_by\", \"created_on\") " +
		"VALUES (?, ?, ?, ?, ?) ";

	conn.executeUpdate(sql, eid, ename, edate, user, now);

	conn.commit();

	conn.close();

	return {
		eid: eid,
		ename: ename,
		edate: edate,
		createdBy: user,
		createdOn: now
	};

} // end function createEvent

try {
	switch ($.request.method) {
		case $.net.http.GET:
		    var eventid = $.request.parameters.get("eid");
			var data;
			if(eventid) {
			    data = getEvent(eventid);
			} else {
			    data = getEvents();
			}
			$.response.setBody(JSON.stringify(data));
			break;

		case $.net.http.POST:
			var payload = $.request.body.asString();
			payload = JSON.parse(payload);
			var oEvent = createEvent(payload);
			$.response.setBody(JSON.stringify(oEvent));
	}
} catch (e) {
	$.response.setBody(e.message);
}