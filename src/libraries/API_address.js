/*jshint esversion: 6 */


	//export const API_address = 'http://ViGtory.ddnsfree.com:27018'; //esta sería la ruta oficial, para producción

	//export const API_address = 'http://nekoworld.dynu.net:3333'; //esto no es, esto es el acceso del frontend
	//export const API_address = 'http://localhost:4000'; //esta solo sirve para la propia máquina que hostea el frontend
	export const API_address = 'http://nekoworld.dynu.net:4000'; //esta sirve para pruebas con dominio
	//export const API_address = 'http://localhost:4000'; //esta sirve para pruebas locales




	//esto hay que usarlo en casa de Enric porque su router no tiene NAT Loopback
	//let addr = 'http://77.226.82.109:4000';
	/*let addr = 'http://nekoworld.dynu.net:4000';
	//console.log("HOST: "+window.location.host);
	if (window.location.host === 'localhost:3001' || window.location.host === '192.168.0.13:3001'){
		addr = 'http://192.168.0.13:4000';
	}
	export const API_address = addr;*/



	export default { API_address: API_address }