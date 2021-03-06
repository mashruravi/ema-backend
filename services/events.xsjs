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
			etime: res[i].etime ? res[i].etime.toLocaleTimeString() : null,
			location: res[i].location,
			description: res[i].description,
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
	
	// No event with given ID
	if(!res[0]) {
	    return null;
	}

	let oData = {
		eid: res[0].eid,
		ename: res[0].ename,
		edate: res[0].edate,
		etime: res[0].etime ? res[0].etime.toLocaleTimeString() : null,
		location: res[0].location,
		description: res[0].description,
		createdBy: res[0].created_by,
		createdOn: res[0].created_on
	};

	return oData;

} // end function getEvent

// MOVE THIS TO UTILS!
function convertDateJsToDb(oDate) {

	let day = oDate.getDate();
	let month = oDate.getMonth() + 1;
	let year = oDate.getFullYear();

	// Format: YYYY-MM-DD
	return (year + "-" + month + "-" + day);
}

function createEvent(oEventDetails) {

	$.import("ema.data.lib", "utils");
	let utils = $.ema.data.lib.utils;

	let eid = utils.getUUID();
	let user = $.session.getUsername();
// 	let now = convertDateJsToDb(new Date());
    let now = new Date();

	let ename = oEventDetails.ename;
	let edate = oEventDetails.edate || null;

	let etime = oEventDetails.etime || null;
	let elocation = oEventDetails.location || null;
	let description = oEventDetails.description || null;

	// =========================
	// Validation checks:
	// =========================

	// Event name is a mandatory parameter
	if (!ename) {
		throw new Error("Event Name is a mandatory parameter");
	}

	// =========================
	// end of Validation checks
	// =========================

	let conn = $.hdb.getConnection();
	let sql = "INSERT INTO \"ema\".\"ema.data.tables::events\" " +
		"(\"eid\", \"ename\", \"edate\", \"etime\", \"location\", \"description\",  \"created_by\", \"created_on\") " +
		"VALUES (?, ?, ?, ?, ?, ?, ?, ?) ";

	conn.executeUpdate(sql, eid, ename, edate, etime, elocation, description, user, now);

	conn.commit();

	conn.close();

	return {
		eid: eid,
		ename: ename,
		edate: edate ? new Date(edate) : null,
		etime: etime,
		location: elocation,
		description: description,
		createdBy: user,
		createdOn: now
	};

} // end function createEvent

function deleteEvent(sEventId) {

	let conn = $.hdb.getConnection();
	let username = $.session.getUsername();
	let query = "DELETE FROM \"ema\".\"ema.data.tables::events\" WHERE \"created_by\" = ? AND \"eid\" = ?;";

	conn.executeUpdate(query, username, sEventId);
	conn.commit();

} // end of function deleteEvent

function updateEvent(oEvent) {
    
    let conn = $.hdb.getConnection();
    let username = $.session.getUsername();
    let query = "UPDATE \"ema\".\"ema.data.tables::events\" SET " +
        "\"ename\" = ?, \"edate\" = ?, \"location\" = ?, \"etime\" = ?, \"description\" = ? " +
        "WHERE \"eid\" = ? AND \"created_by\" = ?";
    
    conn.executeUpdate(query, oEvent.ename, oEvent.edate, oEvent.location, oEvent.etime, oEvent.description, oEvent.eid, username);
    conn.commit();
    
} // End of function updateEvent

try {

	var eventid;

	switch ($.request.method) {
		case $.net.http.GET:
			eventid = $.request.parameters.get("eid");
			var data = null;
			if (eventid) {
				data = getEvent(eventid);
			} else {
				data = getEvents();
			}
			if(eventid && !data) {
			    $.response.setBody(JSON.stringify({ errorMessage: "Event Not Found" }));
			    $.response.status = 404;
			    break;
			}
			$.response.setBody(JSON.stringify(data));
			$.response.status = 200;
			break;

		case $.net.http.POST:
			var payload = $.request.body.asString();
			payload = JSON.parse(payload);
			var oNewEvent = createEvent(payload);
			$.response.setBody(JSON.stringify(oNewEvent));
			$.response.status = 200;
			break;

		case $.net.http.DEL:
			eventid = $.request.parameters.get("eid");
			deleteEvent(eventid);
			$.response.status = 204;
			break;
			
		case $.net.http.PUT:
		    var newData = $.request.body.asString();
		    var newDataJson = JSON.parse(newData);
		    updateEvent(newDataJson);
		    $.response.status = 200;
		    break;
			
		default:
		    $.response.status = 405;
	}

} catch (e) {
	$.response.setBody(JSON.stringify({
		errorMessage: e.message
	}));
	$.reponse.status = 500;
}