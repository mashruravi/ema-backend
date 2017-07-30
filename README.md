# ema-backend
Back-end of EMA - an event management application built using Angular 2 and HANA XS

The contents of this repository should be synced with the /ema/data package.


## Available Services:

__GET__ - _/services/events.xsjs_ - Get all the events created by the logged in user.

__GET__ - _/services/events.xsjs?eid=<eventid>_ - Get the details of the event created by the logged in user whose id is given.

__POST__ - _/services/events.xsjs_ - Create a new event. Payload should contain required details (ename & edate).
