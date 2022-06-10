import { Cookie } from "./cookie";
import {BaseName} from "./basename";







const user_validity_check_per_route = ()=>{

	//Si no disponemos de un jwt válido, volvemos al login
	if (!Cookie.get("jwt")){
		window.location.href = 
			window.location.protocol+"//"+window.location.host+
			(BaseName==="/"?"":BaseName) + "/signin";
	}
	//Si el jwt es válido, reseteamos su validez de 30 días junto con la del nombre de usuario
	else {
		Cookie.set("jwt", Cookie.get("jwt"), 30);
		Cookie.set("username", Cookie.get("username"), 30);
	}

}







export { user_validity_check_per_route }