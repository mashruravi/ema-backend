if ($.request.method === $.net.http.GET) {
   let oUserData = {
       username: $.session.getUsername()
   }; 
   
   $.response.setBody(JSON.stringify(oUserData));
}